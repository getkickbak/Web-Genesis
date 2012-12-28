Ext.define('Genesis.controller.server.Redemptions',
{
   extend : 'Genesis.controller.RedemptionsBase',
   inheritableStatics :
   {
   },
   xtype : 'serverRedemptionsCntlr',
   controllerType : 'redemption',
   config :
   {
      closeBtn : null,
      redeeemSuccessfulMsg : 'Reward selected has been successfully redeemed!',
      redeemPointsFn : 'setMerchantRedeemPointsURL',
      routes :
      {
      },
      refs :
      {
         backBtn : 'serverredemptionsview button[tag=back]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverredemptionsview',
            autoCreate : true,
            xtype : 'serverredemptionsview'
         },
         redemptionsList : 'serverredemptionsview list[tag=redemptionsList]'
      },
      control :
      {
         verifyBtn :
         {
            tap : 'onVerifyTap'
         }
      },
      listeners :
      {
      }
   },
   onNfc : function(nfcResult)
   {
      var me = this;

      me.redeemItem(
      {
         data : me.self.encryptFromParams(
         {
            'tag_id' : (nfcResult) ? nfcResult['tagID'] : null,
            'expiry_ts' : new Date().addHours(3).getTime()
         }, 'reward')
      });
   },
   onRedeemItem : function(btn, venue, view)
   {
      var me = this, identifiers = null, task = null;
      var viewport = me.getViewPortCntlr();
      var venueId = (venue) ? venue.getId() : 0;
      var item = view.getInnerItems()[0];
      var storeName = me.getRedeemStore();
      var store = Ext.StoreMgr.get(store);
      var params =
      {
         venue_id : venueId
      }

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : (Genesis.fn.isNative()) ? me.lookingForMerchantDeviceMsg : me.retrievingQRCodeMsg,
         listeners :
         {
            tap : function()
            {
               viewport.setActiveController(null);
               if (task)
               {
                  clearInterval(task);
               }
               //
               // Stop receiving ProximityID
               //
               if (Genesis.fn.isNative())
               {
                  window.plugins.proximityID.stop();
               }
               Ext.Viewport.setMasked(null);
               me.onDoneTap();
            }
         }
      });

      me.redeemItem = function(params)
      {
         //
         // Stop receiving data from NFC
         //
         viewport.setActiveController(null);
         if (task)
         {
            clearInterval(task);
         }
         //
         // Stop receiving ProximityID
         //
         if (Genesis.fn.isNative())
         {
            window.plugins.proximityID.stop();
         }

         //
         // Update Server
         //
         btn.hide();
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });

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
               Ext.Viewport.setMasked(null);
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
                  btn.show();
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
         task = me.getLocalID(function(idx)
         {
            identifiers = idx;
            task = null;
            me.redeemItem(
            {
               'frequency' : Ext.encode(identifiers['localID'])
            });
         }, function()
         {
            viewport.setActiveController(null);
            Ext.Viewport.setMasked(null);
            me.onDoneTap();
         });
         viewport.setActiveController(me);
      }
      else
      {
         me.redeemItem(params);
      }
   }
});

//
// Cleanup Redeem Database every 6 hours
//
var _dbCleanup = function()
{
   Ext.defer(function()
   {
      Genesis.db.redeemDBCleanup();
      _dbCleanup();
   }, 1000 * 60 * 60 * 3);
};

_dbCleanup();
