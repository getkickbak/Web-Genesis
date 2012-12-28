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
      var storeName = me.getRedeemStore();
      var store = Ext.StoreMgr.get(storeName);
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

      if (Genessis.fn.isNative())
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
