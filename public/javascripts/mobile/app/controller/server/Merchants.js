Ext.define('Genesis.controller.server.Merchants',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   inheritableStatics :
   {
      googleMapStaticUrl : 'http://maps.googleapis.com/maps/api/staticmap'
   },
   xtype : 'servermerchantsCntlr',
   config :
   {
      routes :
      {
         'venue/:id/:id' : 'mainPage'
      },
      refs :
      {
         main :
         {
            selector : 'servermerchantaccountview',
            autoCreate : true,
            xtype : 'servermerchantaccountview'
         },
         form : 'servermerchantaccountview formpanel',
         merchantMain : 'servermerchantaccountview container[tag=merchantMain]',
         tbPanel : 'servermerchantaccountview dataview[tag=tbPanel]',
         prizesBtn : 'merchantaccountptsitem component[tag=prizepoints]',
         redeemBtn : 'merchantaccountptsitem component[tag=points]'
      },
      control :
      {
         main :
         {
            showView : 'onMainShowView',
            activate : 'onMainActivate',
            deactivate : 'onMainDeactivate'
         }
      }
   },
   init : function()
   {
      var me = this;
      //
      // Store used for rendering purposes
      //
      Ext.regStore('MerchantRenderStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });

      me.callParent(arguments);

      console.log("Merchants Server Init");

      //
      // Preloading Pages to memory
      //
      me.getMain();

      backBtnCallbackListFn.push(function(activeItem)
      {
         if (activeItem == me.getMain())
         {
            var viewport = me.getViewPortCntlr();
            me.self.playSoundFile(viewport.sound_files['clickSound']);
            me.redirectTo('main');
            return true;
         }
         return false;
      });
   },
   getAccountFields : function(account)
   {
      var me = this, form = me.getForm();

      return (
         {
            'birthday' :
            {
               field : form.query('datepickerfield[name=birthday]')[0],
               fn : function(field)
               {
                  var birthday = new Date.parse(account['birthday']);
                  return (!birthday || !( birthday instanceof Date)) ? ' ' : birthday;
               }
            },
            'phone' :
            {
               field : form.query('textfield[name=phone]')[0],
               fn : function(field)
               {
                  var phone = account['phone'].match(Account.phoneRegex);
                  return (phone[1] + '-' + phone[2] + '-' + phone[3]);
               }
            }
         });
   },
   showAccountInfo : function(account, tagId)
   {
      var i, f, me = this, fields = me.getAccountFields(account), form = me.getForm();

      for (i in fields)
      {
         f = fields[i];
         if (account[i])
         {
            f[i] = f.fn(f.field);
         }
         //
         // Default Value
         //
         else
         {
            f[i] = null;
         }
      }

      form.setValues(
      {
         birthday : fields['birthday'].birthday,
         phone : fields['phone'].phone,
         tagid : tagId,
      });
      form.query('textfield[name=user]')[0].setLabel(account['name'] + '<br/>' + '<label>' + account['email'] + "</label>");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this, venueId = Genesis.fn.getPrivKey('venueId'), viewport = me.getViewPortCntlr();
      nfcResult = nfcResult ||
      {
         id : null,
         result :
         {
            'tagID' : null
         }
      };
      console.log("Retrieving Customer Account for ID[" + nfcResult.id + "] tagID[" + nfcResult.result['tagID'] + '], venueId[' + venueId + ']');

      var params =
      {
         device_pixel_ratio : window.devicePixelRatio,
         data : me.self.encryptFromParams(
         {
            'id' : nfcResult.id,
            'tag_id' : nfcResult.result['tagID'],
         }, 'reward')
      }
      //
      // Retrieve Venue / Customer information for Merchant Account display
      //
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.establishConnectionMsg
      });
      Customer['setGetCustomerUrl']();
      Customer.load(venueId,
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         params : params,
         callback : function(record, operation)
         {
            var metaData = Customer.getProxy().getReader().metaData;
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful() && metaData)
            {
               me.account = metaData['account'];
               me.tagID = nfcResult.result['tagID'];
               //console.log("Customer[" + Ext.encode(record) + "]");
               Ext.StoreMgr.get('CustomerStore').setData(record);
               viewport.setCustomer(record);
               var info = viewport.getCheckinInfo();
               info.customer = viewport.getCustomer();
               me.redirectTo('venue/' + venueId + '/' + info.customer.getId());
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Merchant Account Page
   // --------------------------------------------------------------------------
   checkInAccount : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var venue = viewport.getVenue();

      //
      // Force Page to refresh
      //
      var controller = vport.getEventDispatcher().controller;
      var anim = new Ext.fx.layout.Card(me.self.animationMode['fade']);
      anim.on('animationend', function()
      {
         console.debug("Animation Complete");
         anim.destroy();
      }, me);
      //if (!controller.isPausing)
      {
         console.log("Reloading current Merchant Home Account Page ...");

         var page = me.getMainPage();

         // Delete current page and refresh
         page.removeAll(true);
         vport.animateActiveItem(page, anim);
         anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
         vport.doSetActiveItem(page, null);
      }
   },
   onMainShowView : function(activeItem)
   {
      var me = this;
      if (Ext.os.is('Android'))
      {
         console.debug("Refreshing MerchantRenderStore ...");
         var monitors = this.getEventDispatcher().getPublishers()['elementPaint'].monitors;

         activeItem.query('dataview[tag=tbPanel]')[0].refresh();
         monitors[activeItem.element.getId()].onElementPainted(
         {
            animationName : 'x-paint-monitor-helper'
         });
      }
      me.showAccountInfo(me.account, me.tagID);
   },
   onMainActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      console.debug("Merchant Account Activate");
      var me = this, viewport = me.getViewPortCntlr();
      var vrecord = viewport.getVenue();
      var crecord = viewport.getCustomer();

      viewport.setActiveController(me);
      var rstore = Ext.StoreMgr.get('MerchantRenderStore');
      //if (rstore.getRange()[0] != vrecord)
      {
         rstore.setData(vrecord);
         //
         // Update Customer Statistics
         // in case venue object was never updated ...
         //
         me.onCustomerRecordUpdate(crecord);
      }
      //page.createView();

      var scroll = activeItem.getScrollable();
      scroll.getScroller().scrollTo(0, 0);

      // Update TitleBar
      var bar = activeItem.query('titlebar')[0];
      bar.setTitle(' ');
      Ext.defer(function()
      {
         // Update TitleBar
         bar.setTitle(vrecord.get('name'));
      }, 1, me);

      console.log("TagID[" + me.tagID + "] Account Info [" + Ext.encode(me.account) + "]");
   },
   onMainDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      //
      // Disable NFC Capability
      //
      viewport.setActiveController(null);
      /*
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
      activeItem.getInnerItems()[i].setVisibility(false);
      }
      */
      //
      // Remove Customer information
      //
      viewport.setCustomer(null);
      Ext.StoreMgr.get('CustomerStore').removeAll(true);
   },
   onCustomerRecordUpdate : function(customer)
   {
      var me = this;
      var rstore = Ext.StoreMgr.get('MerchantRenderStore');
      if (rstore && (rstore.getCount() > 0))
      {
         //
         // Udpate MerchantRenderStore when CustomerStore is updated
         //
         if (rstore && rstore.getRange()[0].getMerchant().getId() == customer.getMerchant().getId())
         {
            var prize = me.getPrizesBtn(), redeem = me.getRedeemBtn();
            var dom;
            if (prize)
            {
               dom = Ext.DomQuery.select('span', prize.element.dom)[0];
               Ext.fly(dom)[customer.get('eligible_for_prize') ? 'removeCls' : 'addCls']("x-item-hidden");
            }
            if (redeem)
            {
               dom = Ext.DomQuery.select('span', redeem.element.dom)[0];
               Ext.fly(dom)[customer.get('eligible_for_reward') ? 'removeCls' : 'addCls']("x-item-hidden");
            }
            //rstore.fireEvent('refresh', rstore, rstore.data);
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function(venueId, customerId)
   {
      this.openMainPage();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getMain();
   },
   openMainPage : function()
   {
      var me = this;
      var vport = me.getViewport();

      // Refresh Merchant Panel Info
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      if (me.getMainPage() == vport.getActiveItem())
      {
         me.checkInAccount();
      }
      else
      {
         me.setAnimationMode(me.self.animationMode['pop']);
         me.pushView(me.getMainPage());
      }
      console.log("Merchant Account Opened");
   }
});

