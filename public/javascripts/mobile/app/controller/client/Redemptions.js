Ext.define('Genesis.controller.client.Redemptions',
{
   extend : 'Genesis.controller.RedemptionsBase',
   inheritableStatics :
   {
   },
   xtype : 'clientRedemptionsCntlr',
   controllerType : 'redemption',
   config :
   {
      redeeemSuccessfulMsg : 'Reward selected has been successfully redeemed!',
      redeemPointsFn : 'setRedeemPointsURL',
      refs :
      {
         backBtn : 'clientredemptionsview button[tag=back]',
         closeBtn : 'clientredemptionsview button[tag=close]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'clientredemptionsview',
            autoCreate : true,
            xtype : 'clientredemptionsview'
         },
         redemptionsList : 'clientredemptionsview list[tag=redemptionsList]',
         redemptionsPts : 'clientredemptionsview component[tag=points]',
         redemptionsPtsEarnPanel : 'clientredemptionsview dataview[tag=ptsEarnPanel]'
      },
      listeners :
      {
      }
   },
   onRedeemItem : function(btn, venue, view)
   {
      var me = this, identifiers = null;
      var venueId = (venue) ? venue.getId() : 0;
      var item = view.getInnerItems()[0];
      var store = me.getRedeemStore();
      var params =
      {
         venue_id : venueId
      };
      me.redeemItem = function(params)
      {
         //
         // Updating Server ...
         //
         btn.hide();
         //Ext.Viewport.getMasked().setMessage(me.establishConnectionMsg);

         CustomerReward[me.getRedeemPointsFn()](item.getData().getId());
         Ext.StoreMgr.get(store).load(
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
               window.plugins.proximityID.stop();
               Ext.Viewport.setMasked(null);

               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : me.getTitle(),
                     message : me.redeeemSuccessfulMsg
                  });
                  Ext.device.Notification.beep();
               }
               else
               {
                  btn.show();
               }
            }
         });
      };

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : (Genesis.fn.isNative()) ? me.lookingForMerchantDeviceMsg : me.retrievingQRCodeMsg,
         listeners :
         {
            tap : function()
            {
               if (identifiers)
               {
                  identifiers['cancelFn']();
               }
               window.plugins.proximityID.stop();
               Ext.Viewport.setMasked(null);
            }
         }
      });
      if (Genesis.fn.isNative())
      {
         me.broadcastLocalID(function(ids)
         {
            identifiers = ids;
            me.redeemItem(Ext.apply(params,
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
         me.redeemItem(params);
      }
   }
});
