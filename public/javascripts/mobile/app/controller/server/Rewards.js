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
         console.debug("Ammount = [" + amount + "]");
         Ext.device.Notification.show(
         {
            title : 'Validation Error',
            message : me.invalidAmountMsg,
            buttons : ['Dismiss']
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
         me.getAmount().reset();
         container.setActiveItem(0);
      }
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;

      if (Genesis.fn.isNative())
      {
         window.plugins.proximityID.stop();
      }
      me.getViewPortCntlr().setActiveController(null);
      console.debug("Rewards onDeactivate Called. Reset Amount ...");
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
            me.getAmount().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset Amount ...");
            break;
         }
         case 'tagId' :
         {
            me.getTagId().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset TagID ...");
            break;
         }
         case 'qrcodeContainer' :
         {
            animation.setReverse(false);
            console.debug("Rewards ContainerActivate Called.");
            break;
         }
      }
   },
   onRewardItem : function(automatic)
   {
      var me = this, task = null, identifiers = null, viewport = me.getViewPortCntlr(), dismissDialog = false;
      var amount = me.getAmount().getValue(), proxy = PurchaseReward.getProxy();

      me.rewardItemFn = function(params, closeDialog)
      {
         dismissDialog = closeDialog;
         Ext.device.Notification.dismiss();
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
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
         // Update Server
         //
         console.log("Updating Server with Reward information ... dismissDialog(" + dismissDialog + ")");
         PurchaseReward['setMerchantEarnPointsURL']();
         PurchaseReward.load(1,
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : params,
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Earn Reward Points',
                     message : me.rewardSuccessfulMsg,
                     buttons : ['OK'],
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
               else
               {
                  proxy._errorCallback = Ext.bind(me.onDoneTap, me);
                  /*
                   proxy.supressErrorsPopup = true;
                   Ext.device.Notification.show(
                   {
                   title : 'Earn Reward Points',
                   message : me.rewardFailedMsg,
                   buttons : ['Dismiss'],
                   callback : function()
                   {
                   proxy.supressErrorsPopup = false;
                   me.onDoneTap();
                   }
                   });
                   */
               }
            }
         });
      };

      if (!automatic)
      {
         return;
      }
      var callback = function(b)
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

         if (b && (b.toLowerCase() == 'enter tag id'))
         {
            Ext.Viewport.setMasked(null);
            me.onEnterTagIdTap();
         }
         else
         if (!dismissDialog)
         {
            Ext.Viewport.setMasked(null);
            me.onDoneTap();
         }
      };

      Ext.device.Notification.show(
      {
         title : 'Earn Reward Points',
         message : (Genesis.fn.isNative()) ? me.lookingForMobileDeviceMsg() : me.genQRCodeMsg,
         ignoreOnHide : true,
         buttons : [
         {
            text : 'Enter TAG ID',
            itemId : 'enter tag id'
         },
         {
            text : 'Cancel',
            itemId : 'cancel'
         }],
         callback : callback
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
            }, true);
         }, function()
         {
            me.onDoneTap();
         }, Ext.bind(me.onRewardItem, me, arguments));
         viewport.setActiveController(me);
      }
      else
      {
         me.rewardItemFn(
         {
         }, false);
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
      var amountField = me.getAmount();
      var value = b.getText();
      switch (value)
      {
         case 'AC' :
         {
            amountField.reset();
            break;
         }
         default :
            var amountFieldLength = amountField.getValue().length, amount = Number(amountField.getValue() || 0);

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

            // Max value
            if (amount <= me.maxValue)
            {
               amountField.setValue(amount);
            }
            break;
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
               tagIdField.reset();
               break;
            }
            default :
               tagId += value;
               tagIdField.setValue(tagId);
               break;
         }
      }
   },
   onTagItTap : function()
   {
      var me = this, viewport = me.getViewPortCntlr();
      var tagIdField = me.getTagId(), tagId = tagIdField.getValue(), tagIdFieldLength = tagId.length;

      //if (tagIdFieldLength <= me.tagIdMaxLength)
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
                     id : null,
                     result :
                     {
                        'tagID' : tagId
                     }
                  });
               }
               else
               {
                  me.onDoneTap();
               }
            }
         });
      }
      /*
       else
       {
       me.self.playSoundFile(viewport.sound_files['nfcError']);
       Ext.device.Notification.show(
       {
       title : 'TAG ID',
       message : me.invalidTagIdFormatMsg(me.tagIdMaxLength),
       buttons : ['Dismiss']
       });
       }
       */
   },
   // --------------------------------------------------------------------------
   // Misc Event Funcs
   // --------------------------------------------------------------------------
   onDoneTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var container = me.getRewardsContainer();
      container.setActiveItem(0);
      console.debug("Rewards onDoneTap Called ...");
   },
   onNfc : function(nfcResult)
   {
      var me = this;
      me.rewardItemFn(
      {
         data :
         {
            'uid' : (nfcResult) ? nfcResult.id : null,
            'tag_id' : (nfcResult) ? nfcResult.result['tagID'] : null,
         }
      }, true);
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

