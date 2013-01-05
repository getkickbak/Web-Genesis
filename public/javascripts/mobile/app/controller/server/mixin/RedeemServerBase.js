Ext.define('Genesis.controller.server.mixin.RedeemServerBase',
{
   extend : 'Ext.mixin.Mixin',
   inheritableStatics :
   {
   },
   controllerType : 'redemption',
   config :
   {
      closeBtn : null,
      sDoneBtn : null,
      sRedeemBtn : null
   },
   tagIdMaxLength : 10,
   redeemPtsConfirmMsg : 'Please confirm to submit',
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Tag Tab
   // --------------------------------------------------------------------------
   onEnterTagIdTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRedeemItemCardContainer();
      container.setActiveItem(1);
   },
   onTagIdBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, value = b.getText();
      var tagIdField = me.getTagId(), tagId = tagIdField.getValue(), tagIdFieldLength = tagId.length;

      if (tagIdFieldLength < me.tagIdMaxLength)
      {
         switch (value)
         {
            case 'AC' :
            {
               tagId = null;
               break;
            }
            default :
               tagId += value;
               break;
         }
         tagIdField.setValue(tagId);
      }
   },
   onTagItTap : function()
   {
      var me = this, viewport = me.getViewPortCntlr(), container = me.getRedeemItemCardContainer();
      var tagIdField = me.getTagId(), tagId = tagIdField.getValue(), tagIdFieldLength = tagId.length;

      if (tagIdFieldLength == me.tagIdMaxLength)
      {
         me.self.playSoundFile(viewport.sound_files['nfcEnd']);
         me.onRedeemItemTap(null);

         Ext.device.Notification.show(
         {
            title : 'TAG ID',
            message : me.redeemPtsConfirmMsg,
            buttons : ['Confirm', 'Cancel'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'confirm')
               {
                  me.onNfc(
                  {
                     'tagID' : tagId
                  });
               }
               else
               {
                  container.setActiveItem(0);
               }
            }
         });
      }
      else
      {
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         Ext.device.Notification.show(
         {
            title : 'TAG ID',
            message : me.invalidTagIdFormatMsg
         });
      }
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.redeemItemFn(
      {
         data : me.self.encryptFromParams(
         {
            'tag_id' : (nfcResult) ? nfcResult['tagID'] : null,
            'expiry_ts' : new Date().addHours(3).getTime()
         }, 'reward')
      });
   },
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemItem();
      var item = view.getInnerItems()[0];

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img',photo.element.dom)[0]);
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.25),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.25)
      });
   },
   onServerRedeemItem : function(btn, venue, view)
   {
      var me = this, identifiers = null, task = null;
      var viewport = me.getViewPortCntlr();
      var venueId = (venue) ? venue.getId() : 0;
      var item = view.getInnerItems()[0];
      var storeName = me.getRedeemStore();
      var store = Ext.StoreMgr.get(storeName);
      var params =
      {
         venue_id : venueId
      }
      var message = (Genesis.fn.isNative()) ? //
      ((!merchantMode) ? me.lookingForMerchantDeviceMsg : me.lookingForMobileDeviceMsg) : me.retrievingQRCodeMsg;

      me.redeemItemFn = function(p)
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
         console.debug("Updating Server ...");
         if (btn)
         {
            btn.hide();
         }
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
            params : Ext.apply(params, p),
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
                  if (btn)
                  {
                     btn.show();
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

      if (btn)
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : message,
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
         if (Genesis.fn.isNative())
         {
            task = me.getLocalID(function(idx)
            {
               identifiers = idx;
               task = null;
               me.redeemItemFn(
               {
                  'frequency' : Ext.encode(identifiers['localID']),
                  data : me.self.encryptFromParams(
                  {
                     'expiry_ts' : new Date().addHours(3).getTime()
                  }, 'reward')
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
            me.redeemItemFn(params);
         }
      }
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, container = me.getRedeemItemCardContainer();
      me.callParent(arguments);
      container.setActiveItem(0);
   },
   onRedeemItemCardContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getRedeemItemCardContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'redeemItemContainer' :
         {
            animation.setReverse(true);
            break;
         }
         case 'tagId' :
         {
            me.getTagId().setValue(null);
            animation.setReverse(true);
            break;
         }
      }
      console.debug("Prizes Redeem ContainerActivate Called.");
   },
   onRedeemItemShowView : function(activeItem)
   {
      var me = this;
      //
      // In Redeem Mode
      //
      me.getRedeemItemButtonsContainer()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      //
      // In Challendge
      //
      me.getRefreshBtn()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.callParent(arguments);

      me.getRefreshBtn()['hide']();

      console.log("RewardItem View - Updated RewardItem View.");
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
