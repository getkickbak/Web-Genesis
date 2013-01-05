Ext.define('Genesis.controller.server.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   xtype : 'serverRewardsCntlr',
   config :
   {
      models : ['PurchaseReward', 'CustomerReward'],
      routes :
      {
         'earnPts' : 'earnPtsPage'
      },
      refs :
      {
         //
         // Rewards
         //
         rewards :
         {
            selector : 'serverrewardsview',
            autoCreate : true,
            xtype : 'serverrewardsview'
         },
         rewardsContainer : 'serverrewardsview container[tag=rewards]',
         amount : 'serverrewardsview calculator[tag=amount] textfield',
         tagId : 'serverrewardsview calculator[tag=tagId] textfield',
         //qrcode : 'serverrewardsview component[tag=qrcode]',
         title : 'serverrewardsview container[tag=qrcodeContainer] component[tag=title]'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         rewardsContainer :
         {
            activeitemchange : 'onContainerActivate'
         },
         'serverrewardsview calculator[tag=amount] container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'serverrewardsview calculator[tag=amount] container[tag=bottomButtons] button[tag=earnPtsTag]' :
         {
            tap : 'onEnterTagIdTap'
         },
         'serverrewardsview calculator[tag=amount] container[tag=bottomButtons] button[tag=earnPts]' :
         {
            tap : 'onEarnPtsTap'
         },
         'serverrewardsview calculator[tag=tagId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverrewardsview calculator[tag=tagId] container[tag=bottomButtons] button[tag=earnTagId]' :
         {
            tap : 'onTagItTap'
         }
      },
      listeners :
      {
         'rewarditem' : 'onRewardItem'
      }
   },
   maxValue : 1000.00,
   tagIdMaxLength : 10,
   rewardSuccessfulMsg : 'Transaction Complete',
   rewardFailedMsg : 'Transaction Failed',
   invalidAmountMsg : 'Please enter a valid amount (eg. 5.00), upto $1000',
   earnPtsConfirmMsg : 'Please confirm to submit',
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Rewards Init");
      //
      // Preload Pages
      //
      this.getRewards();
   },
   getAmountPrecision : function(num)
   {
      var precision = num.split('.');
      return ((precision.length > 1) ? precision[1].length : 0);
   },
   validateAmount : function()
   {
      var me = this, amount = me.getAmount().getValue(), precision = me.getAmountPrecision(amount);

      if (precision < 2)
      {
         Ext.device.Notification.show(
         {
            title : 'Validation Error',
            message : me.invalidAmountMsg
         });
         amount = -1;
      }

      return amount;
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      if (container)
      {
         container.setActiveItem(0);
      }
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      var amountField = me.getAmount();
      if (amountField)
      {
         amountField.setValue(null);
      }
      if (Genesis.fn.isNative())
      {
         window.plugins.proximityID.stop();
      }
      me.getViewPortCntlr().setActiveController(null);
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'amount' :
         {
            //me.getAmount().setValue(null);
            animation.setReverse(true);
            break;
         }
         case 'tagId' :
         {
            me.getTagId().setValue(null);
            animation.setReverse(true);
            break;
         }
         case 'qrcodeContainer' :
         {
            animation.setReverse(false);
            break;
         }
      }
      console.debug("Rewards ContainerActivate Called.");
   },
   onRewardItem : function(automatic)
   {
      var me = this, task = null, identifiers = null, viewport = me.getViewPortCntlr();
      var amount = me.getAmount().getValue();

      me.rewardItemFn = function(params)
      {
         params = Ext.merge(params,
         {
            'venue_id' : Genesis.fn.getPrivKey('venueId'),
            data :
            {
               "amount" : amount,
               "type" : 'earn_points',
               'expiry_ts' : new Date().addHours(3).getTime()
            }
         });
         params['data'] = me.self.encryptFromParams(params['data']);

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
         // Updating Server ...
         //
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         console.log("Updating Server with EarnPoints information ...");
         PurchaseReward['setMerchantEarnPointsURL']();
         PurchaseReward.load(1,
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
                  Ext.device.Notification.show(
                  {
                     title : 'Rewards',
                     message : me.rewardSuccessfulMsg,
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
               else
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Rewards',
                     message : me.rewardFailedMsg,
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
            }
         });
      };

      if (!automatic)
      {
         return;
      }
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : (Genesis.fn.isNative()) ? me.lookingForMobileDeviceMsg : me.genQRCodeMsg,
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
         task = me.getLocalID(function(ids)
         {
            identifiers = ids;
            task = null;
            me.rewardItemFn(
            {
               data :
               {
               },
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
         me.rewardItemFn(
         {
         });
      }
   },
   // --------------------------------------------------------------------------
   // Amount Tab
   // --------------------------------------------------------------------------
   onEnterTagIdTap : function(b, e, eOpts, eInfo)
   {
      var me = this, amount = me.validateAmount(), container = me.getRewardsContainer();

      if (amount < 0)
      {
         return;
      }

      container.setActiveItem(1);
   },
   onEarnPtsTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRewardsContainer(), amount = me.validateAmount();

      if (amount < 0)
      {
         return;
      }

      /*
       Ext.defer(function()
       {
       var qrcodeMetaData = me.self.genQRCodeFromParams(
       {
       "amount" : amount,
       "type" : 'earn_points'
       }, 'reward', false);
       me.getQrcode().setStyle(
       {
       'background-image' : 'url(' + qrcodeMetaData[0] + ')',
       'background-size' : Genesis.fn.addUnit(qrcodeMetaData[1] * 1.25) + ' ' + Genesis.fn.addUnit(qrcodeMetaData[2] * 1.25)
       });
       }, 1, me);
       console.debug("Encrypting QRCode with Price:$" + amount);
       */

      me.getTitle().setData(
      {
         price : '$' + amount
      });
      container.setActiveItem(2);

      me.fireEvent('rewarditem', b);
   },
   onCalcBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var value = b.getText();
      var amountField = me.getAmount();
      var amountFieldLength = amountField.getValue().length;
      var amount = Number(amountField.getValue() || 0);
      switch (value)
      {
         case 'AC' :
         {
            amount = null;
            break;
         }
         default :
            if (amountFieldLength < 2)
            {
               if ((amount == 0) && (amountFieldLength > 0))
               {
                  amount += value;
               }
               else
               {
                  amount = (10 * amount) + Number(value);
               }
            }
            else
            {
               if (amountFieldLength == 2)
               {
                  amount = (amount + value) / 100;
               }
               else
               {
                  amount = (10 * amount) + (Number(value) / 100);
               }
               amount = amount.toFixed(2);
            }
            break;
      }
      // Max value
      if (amount <= me.maxValue)
      {
         amountField.setValue(amount);
      }
   },
   // --------------------------------------------------------------------------
   // TAG ID Tab
   // --------------------------------------------------------------------------
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
      var me = this, viewport = me.getViewPortCntlr();
      var tagIdField = me.getTagId(), tagId = tagIdField.getValue(), tagIdFieldLength = tagId.length;

      if (tagIdFieldLength == me.tagIdMaxLength)
      {
         me.self.playSoundFile(viewport.sound_files['nfcEnd']);
         me.onEarnPtsTap(null);

         Ext.device.Notification.show(
         {
            title : 'TAG ID',
            message : me.earnPtsConfirmMsg,
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
                  me.onDoneTap();
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
   // Misc Event Funcs
   // --------------------------------------------------------------------------
   onDoneTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var container = me.getRewardsContainer();
      container.setActiveItem(0);
   },
   onNfc : function(nfcResult)
   {
      var me = this;
      me.rewardItemFn(
      {
         data :
         {
            'tag_id' : (nfcResult) ? nfcResult['tagID'] : null
         }
      });
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   earnPtsPage : function()
   {
      var me = this;
      var page = me.getRewards();
      me.setAnimationMode(me.self.animationMode['cover']);
      me.pushView(page);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      var page = this.getRewards();
      return page;
   },
   openPage : function(subFeature)
   {
      var me = this;
      switch (subFeature)
      {
         case 'rewards':
         {
            me.redirectTo('earnPts');
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

