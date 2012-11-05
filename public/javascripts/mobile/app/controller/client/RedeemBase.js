Ext.define('Genesis.controller.client.RedeemBase',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
   },
   xtype : 'clientRedemptionsBaseCntlr',
   config :
   {
      models : ['PurchaseReward', 'CustomerReward'],
   },
   needPointsMsg : function(pointsDiff)
   {
      return ('You need ' + pointsDiff + ' more points ' + Genesis.constants.addCRLF() + 'to be eligible for this item.');
   },
   retrievingQRCodeMsg : 'Retrieving QRCode ...',
   showQrCodeMsg : 'Show this Authorization Code to your merchant to redeem!',
   redeemItemConfirmMsg : 'Please confim to redeem this item',
   init : function()
   {
      var me = this;
      Ext.regStore(me.getRenderStore(),
      {
         model : 'Genesis.model.Customer',
         autoLoad : false
      });
      Ext.regStore(me.getRedeemStore(),
      {
         model : 'Genesis.model.CustomerReward',
         autoLoad : false,
         pageSize : 5,
         sorters : [
         {
            property : 'points',
            direction : 'ASC'
         }],
         listeners :
         {
            scope : me,
            'metachange' : function(store, proxy, eOpts)
            {
               //
               // Prevent Incorrect Store from calling MetaData Handler
               //
               if (store.isLoading())
               {
                  me.fireEvent('updatemetadata', proxy.getReader().metaData);
               }
            }
         }
      });

      this.callParent(arguments);
      console.log("Client Redemptions Init");
      //
      // Prelod Page
      //
      //
      // Preloading Pages to memory
      //
      Ext.defer(function()
      {
         me.getRedeemItem();
         me.getRedemptions();
      }, 1, me);
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onCreateView : function(activeItem)
   {
      var me = this;
      activeItem.redeemItem = me.redeemItem;
   },
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         var monitors = this.getEventDispatcher().getPublishers()['elementSize'].monitors;
         var list = activeItem.query('list[tag='+activeItem.getListCls()+']')[0];

         console.debug("Refreshing RenderStore ...");
         activeItem.query('dataview[tag=ptsEarnPanel]')[0].refresh();
         monitors[list.container.getId()].forceRefresh();
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var page = me.getRedemptions();

      var viewport = me.getViewPortCntlr();
      var customer = viewport.getCustomer();
      var rstore = Ext.StoreMgr.get(me.getRenderStore());
      //
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      me.exploreMode = !cvenue || (cvenue && (cvenue.getId() != venue.getId()));

      // Update Customer info
      if (customer != rstore.getRange()[0])
      {
         rstore.setData(customer);
      }
      //activeItem.createView();
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
         //activeItem.getInnerItems()[i].setVisibility(false);
      }
      console.debug("ReedeemBase: onActivate");
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   onItemListSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onItemListDisclose(d, model);
      return false;
   },
   onItemListDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var _showItem = function()
      {
         var totalPts = viewport.getCustomer().get(me.getPtsProperty());
         var points = record.get('points');
         if (points > totalPts)
         {
            Ext.device.Notification.show(
            {
               title : 'Oops!',
               message : me.needPointsMsg(points - totalPts)
            });
         }
         else
         {
            me.fireEvent('showredeemitem', record);
            /*
             Ext.create('Genesis.model.EarnPrize',
             {
             //'id' : 1,
             'expiry_date' : null,
             'reward' : record,
             'merchant' : viewport.getCheckinInfo().venue.getMerchant()
             }));
             */
         }
      }

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      switch (me.getBrowseMode())
      {
         case 'redeemBrowse' :
         {
            if (!me.exploreMode)
            {
               _showItem();
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Warning',
                  message : me.checkinFirstMsg
               });
            }
            break;
         }
         case 'redeemBrowseSC' :
         {
            _showItem();
            break;
         }
      }
      return true;
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this;
      var customer = me.callParent(arguments);

      //
      // Claim Reward Item by showing QRCode to server!
      //
      if (metaData['data'])
      {
         me.fireEvent('showQRCode', 0, metaData['data']);
      }

      return customer;
   },
   // --------------------------------------------------------------------------
   // Handler Functions
   // --------------------------------------------------------------------------
   onRedeemItemTap : function(b, e, eOpts, eInfo)
   {
      var me = this, venue = null;
      var view = me.getRedeemMainPage();
      var title = view.query('titlebar')[0].getTitle();
      var btn = b;

      switch (me.getRedeemMode())
      {
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            var bypass = me.getBrowseMode() == 'redeemBrowseSC';
            var viewport = me.getViewPortCntlr();
            venue = viewport.getVenue();
            var cvenue = viewport.getCheckinInfo().venue;

            if (!bypass && (!cvenue || !venue || (venue.getId() != cvenue.getId())))
            {
               Ext.device.Notification.show(
               {
                  title : title,
                  message : me.checkinFirstMsg
               });
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : title,
                  message : me.redeemItemConfirmMsg,
                  buttons : ['Confirm', 'Cancel'],
                  callback : function(b)
                  {
                     if (b.toLowerCase() == 'confirm')
                     {
                        me.fireEvent('redeemitem', btn, venue, view);
                     }
                  }
               });
            }
            break;
         }
      }
   },
   onRedeemItem : function(btn, venue, view)
   {
      var me = this;
      var venueId = (venue) ? venue.getId() : 0;
      var item = view.getInnerItems()[0];
      var store = me.getRedeemStore();

      CustomerReward[me.getRedeemPointsFn()](item.getData().getId());

      btn.hide();
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.retrievingQRCodeMsg
      });
      Ext.StoreMgr.get(store).load(
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId
         },
         callback : function(records, operation)
         {
            if (!operation.wasSuccessful())
            {
               Ext.Viewport.setMasked(null);
               btn.show();
            }
         }
      });
   },
   onRedeemItemCreateView : function(activeItem)
   {
      var me = this;
      var view = me.getRedeemMainPage();

      view.redeemItem = me.redeemItem;
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      var tbbar = activeItem.query('titlebar')[0];
      var photo = me.redeemItem.get('photo');

      me.getSCloseBB().show();
      //me.getSBB().hide();
      tbbar.setTitle(me.getTitle());
      tbbar.removeCls('kbTitle');
      me.getRefreshBtn()['hide']();
      me.getVerifyBtn()['hide']();
      me.getSRedeemBtn().show();

      console.log("RewardItem View - Updated RewardItem View.");
   },
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      me.getSDoneBtn().hide();
   },
   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;
      var view = me.getRedeemMainPage();

      if (view.isPainted() && !view.isHidden())
      {
         me.popView();
      }
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   onShowItemQRCode : function(timeout, qrcode)
   {
      var me = this;
      var title = 'Redeem ' + me.getTitle();

      console.log("\n" + //
      "Encrypted Code :\n" + qrcode + "\n" + //
      "Encrypted Code Length: " + qrcode.length);

      qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      if (qrcode[0])
      {
         var dom = Ext.DomQuery.select('div.itemPoints',me.getRedeemItem().element.dom)[0];
         me.getSRedeemBtn().hide();
         me.getSDoneBtn().show();
         me.getSCloseBB().hide();
         if (dom)
         {
            Ext.fly(dom).addCls('x-item-hidden');
         }

         me.fireEvent('refreshQRCode', qrcode);

         Ext.Viewport.setMasked(null);
         Ext.device.Notification.show(
         {
            title : title,
            message : me.showQrCodeMsg
         });
         Ext.device.Notification.vibrate();
      }
   },
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemMainPage();
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getInnerItems()[0];

      var info = item.query('component[tag=info]')[0];
      info.hide();

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img', photo.element.dom)[0]);
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.5),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.5)
      });
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemBrowsePage : function()
   {
      this.openPage('redeemBrowse');
      this.getCloseBtn().show();
      this.getBackBtn().hide();
   },
   redeemBrowseSCPage : function()
   {
      this.openPage('redeemBrowseSC');
      this.getCloseBtn().hide();
      this.getBackBtn().show();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getRedeemMainPage : function()
   {
      var me = this;
      var page = null;
      switch (me.getRedeemMode())
      {
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['coverUp']);
            page = me.getRedeemItem();
            break;
         }
      }

      return page;
   },
   getBrowseMainPage : function()
   {
      var me = this;
      var page = null;
      switch (me.getBrowseMode())
      {
         case 'redeemBrowse' :
         {
            me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['cover']);
            page = me.getRedemptions();
            break;
         }
         case 'redeemBrowseSC' :
         {
            me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['coverUp']);
            page = me.getRedemptions();
            break;
         }
      }

      return page;
   },
   openPage : function(subFeature)
   {
      var me = this;

      if (subFeature.match(/Browse/))
      {
         me.setBrowseMode(subFeature);
         me.pushView(me.getBrowseMainPage());
      }
      else
      {
         me.setRedeemMode(subFeature);
         me.pushView(me.getRedeemMainPage());
      }
   },
   isOpenAllowed : function()
   {
      // VenueId can be found after the User checks into a venue
      //return ((this.getViewPortCntlr().getVenue()) ? true : "You need to Explore or Check-in to a Venue first");
      return true;
   }
});
