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
         merchantMain : 'servermerchantaccountview container[tag=merchantMain]',
         tbPanel : 'servermerchantaccountview dataview[tag=tbPanel]'
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
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;
      /*
       var masked = Ext.Viewport.getMasked();
       if (nfcResult)
       {
       if (masked)
       {
       masked.setMessage("Tag NFC TagID[" + nfcResult['tagID'] + "]");
       }
       else
       {
       Ext.Viewport.setMasked(
       {
       xtype : 'loadmask',
       message : "Tag NFC TagID[" + nfcResult['tagID'] + "]",
       listeners :
       {
       tap : function()
       {
       Ext.Viewport.setMasked(null);
       }
       }
       });
       }
       }
       */
      nfcResult = nfcResult ||
      {
         'tagID' : null
      };
      console.log("Retrieving Customer Account for tagID[" + nfcResult['tagID'] + ']');

      var params =
      {
         data : me.self.encryptFromParams(
         {
            'tag_id' : nfcResult['tagID']
         }, 'reward')
      }
      //
      // Retrieve Venue / Customer information for Merchant Account display
      //
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
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful())
            {
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
   },
   onMainActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      console.debug("Merchant Account Activate");
      var me = this;

      me.getViewPortCntlr().setActiveController(me);
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

