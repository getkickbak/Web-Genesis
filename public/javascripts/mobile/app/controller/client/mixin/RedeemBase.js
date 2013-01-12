Ext.define('Genesis.controller.client.mixin.RedeemBase',
{
   extend : 'Ext.mixin.Mixin',
   inheritableStatics :
   {
   },
   config :
   {
   },
   needPointsMsg : function(pointsDiff)
   {
      return ('You need ' + pointsDiff + ' more points ' + Genesis.constants.addCRLF() + 'to be eligible for this item.');
   },
   retrievingQRCodeMsg : 'Retrieving QRCode ...',
   showQrCodeMsg : 'Show this Authorization Code to your merchant to redeem!',
   redeemItemConfirmMsg : 'Please confim to redeem this item',
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   updateMetaDataInfo : function(metaData)
   {
      var me = this, customer = me.callParent(arguments);

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
   onRedeemItem : function(btn, venue, view)
   {
      var me = this, identifiers = null, proxy = CustomerReward.getProxy();
      var venueId = (venue) ? venue.getId() : 0, item = view.getInnerItems()[0];
      var storeName = me.getRedeemStore(), store = Ext.StoreMgr.get(storeName);
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
            //timeout : 30*1000,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
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
                     buttons : ['OK'],
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
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : 'Redemptions',
                     message : me.redeemFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsPopup = false;
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
               message : me.lookingForMerchantDeviceMsg
               /*,listeners :
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
                */
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
      var me = this, btn = b, viewport = me.getViewPortCntlr(), venue = viewport.getVenue();
      var view = me.getRedeemMainPage(), title = view.query('titlebar')[0].getTitle();

      //console.debug("onRedeemItemTap - Mode[" + me.getRedeemMode() + "]");
      switch (me.getRedeemMode())
      {
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            var send = function()
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
            };

            if (Genesis.fn.isNative())
            {
               Ext.Viewport.setMasked(
               {
                  xtype : 'loadmask',
                  message : me.prepareToSendMerchantDeviceMsg
               });
               window.plugins.proximityID.preLoadSend(function()
               {
                  Ext.Viewport.setMasked(null);
                  send();
               });
            }
            else
            {
               send();
            }
            break;
         }
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
            message : me.showQrCodeMsg,
            buttons : ['OK']
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
   redeemBrowseSCPage : function()
   {
      this.openPage('redeemBrowseSC');
      if (this.getCloseBtn())
      {
         this.getCloseBtn().hide();
         this.getBackBtn().show();
      }
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
