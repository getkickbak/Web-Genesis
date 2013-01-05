Ext.define('Genesis.controller.RedeemBase',
{
   extend : 'Genesis.controller.ControllerBase',
   inheritableStatics :
   {
   },
   xtype : 'redeemBaseCntlr',
   config :
   {
      models : ['PurchaseReward', 'CustomerReward']
   },
   redeemSuccessfulMsg : 'Transaction Complete',
   redeemFailedMsg : 'Transaction Failed',
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
      console.log("RedeemBase Init");
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
         var panel = activeItem.query('dataview[tag=ptsEarnPanel]')[0];
         if (panel)
         {
            panel.refresh();
         }
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
      console.debug("ReedeemBase: onDeactivate");
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
         if (viewport.getCustomer())
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
               return;
            }
         }
         me.fireEvent('showredeemitem', record);
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);
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
      // Claim Reward Item by showing QRCode to Merchant Device!
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
   onClientRedeemItem : function(btn, venue, view)
   {
      var me = this, identifiers = null;
      var venueId = (venue) ? venue.getId() : 0;
      var item = view.getInnerItems()[0];
      var storeName = me.getRedeemStore();
      var store = Ext.StoreMgr.get(storeName);
      var params =
      {
         venue_id : venueId
      };
      me.redeemItemFn = function(params)
      {
         //
         // Updating Server ...
         //
         console.debug("Updating Server ...");
         if (me.getSRedeemBtn())
         {
            me.getSRedeemBtn()['hide']();
         }
         CustomerReward[me.getRedeemPointsFn()](item.getData().getId());
         store.load(
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            params : params,
            callback : function(records, operation)
            {
               //
               // Stop broadcasting now ...
               //
               if (identifiers)
               {
                  identifiers['cancelFn']();
               }
               Ext.Viewport.setMasked(null);
               Ext.device.Notification.beep();

               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Redemptions',
                     message : me.redeemSuccessfulMsg,
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
               else
               {
                  if (me.getSRedeemBtn())
                  {
                     me.getSRedeemBtn()['show']();
                  }
                  Ext.device.Notification.show(
                  {
                     title : 'Redemptions',
                     message : me.redeemFailedMsg,
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
            }
         });
      };

      if (Genesis.fn.isNative())
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.prepareToSendMerchantDeviceMsg
         });
         me.broadcastLocalID(function(ids)
         {
            identifiers = ids;
            Ext.Viewport.setMasked(null);
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.lookingForMerchantDeviceMsg,
               listeners :
               {
                  tap : function()
                  {
                     Ext.Ajax.abort();
                     if (identifiers)
                     {
                        identifiers['cancelFn']();
                     }
                     Ext.Viewport.setMasked(null);
                     me.onDoneTap();
                  }
               }
            });
            me.redeemItemFn(Ext.apply(params,
            {
               'frequency' : Ext.encode(identifiers['localID'])
            }));
         }, function()
         {
            Ext.Viewport.setMasked(null);
         });
      }
      else
      {
         me.redeemItemFn(params);
      }
   },
   onRedeemItemTap : function(b, e, eOpts, eInfo)
   {
      var me = this, venue = null;
      var view = me.getRedeemMainPage();
      var title = view.query('titlebar')[0].getTitle();
      var btn = b;

      //console.debug("onRedeemItemTap - Mode[" + me.getRedeemMode() + "]");
      switch (me.getRedeemMode())
      {
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            var viewport = me.getViewPortCntlr();
            venue = viewport.getVenue();
            var cvenue = viewport.getCheckinInfo().venue;

            if (!merchantMode)
            {
               if (Genesis.fn.isNative())
               {
                  window.plugins.proximityID.preLoadSend();
               }
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
            else
            {
               me.fireEvent('redeemitem', btn, venue, view);
            }
            break;
         }
      }
   },
   onRedeemItemCreateView : function(activeItem)
   {
      var me = this;
      var view = me.getRedeemMainPage();

      view.redeemItem = me.redeemItem;
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, tbbar = activeItem.query('titlebar')[0];

      me.getSCloseBB().show();
      //me.getSBB().hide();
      tbbar.setTitle(me.getTitle());
      tbbar.removeCls('kbTitle');

      console.log("Base onRedeemItemActivate - Updated RewardItem View!");
   },
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      if (me.getSDoneBtn())
      {
         me.getSDoneBtn()['hide']();
      }
      if (Genesis.fn.isNative())
      {
         window.plugins.proximityID.stop();
      }
      console.log("onRedeemItemDeactivate - Done with RewardItem View!");
   },

   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;
      var view = me.getRedeemMainPage();

      if (Genesis.fn.isNative())
      {
         if (Ext.os.is('iOS'))
         {
         }
         else
         if (Ext.os.is('Android'))
         {
         }
      }
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
      var _qrcode;
      var title = 'Redeem ' + me.getTitle();

      /*
       console.log("\n" + //
       "Encrypted Code :\n" + qrcode + "\n" + //
       "Encrypted Code Length: " + qrcode.length);
       */
      _qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      if (_qrcode[0])
      {
         var dom = Ext.DomQuery.select('div.itemPoints',me.getRedeemItem().element.dom)[0];
         if (me.getSRedeemBtn())
         {
            me.getSRedeemBtn().hide();
         }
         if (me.getSDoneBtn())
         {
            me.getSDoneBtn()['show']();
         }
         me.getSCloseBB().hide();
         if (dom)
         {
            Ext.fly(dom).addCls('x-item-hidden');
         }

         me.fireEvent('refreshQRCode', _qrcode);

         Ext.Viewport.setMasked(null);
         Ext.device.Notification.show(
         {
            title : title,
            message : me.showQrCodeMsg
         });
         Ext.device.Notification.vibrate();
      }
      else
      {
         console.debug("onShowItemQRCode - QR Code encoding Error");
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemBrowsePage : function()
   {
      this.openPage('redeemBrowse');
      if (this.getCloseBtn())
      {
         this.getCloseBtn().show();
         this.getBackBtn().hide();
      }
   },
   redeemBrowseSCPage : function()
   {
      this.openPage('redeemBrowseSC');
      if (this.getCloseBtn())
      {
         this.getCloseBtn().hide();
         this.getBackBtn().show();
      }
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
         case 'authReward' :
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
