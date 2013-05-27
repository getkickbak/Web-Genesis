Ext.define('Genesis.controller.server.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   xtype : 'serverRewardsCntlr',
   config :
   {
      mode : 'Manual', // 'POS_Selection', 'POS_Detail', 'Maunal'
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
         calcBtn : 'serverrewardsview button[tag=calculator]',
         receiptsList : 'serverrewardsview container list',
         tableSelectField : 'serverrewardsview selectfield[tag=tableFilter]',
         backBB : 'serverrewardsview button[tag=back]',
         rptCloseBB : 'serverrewardsview button[tag=rptClose]',
         receiptDetail : 'serverrewardsview dataview[tag=receiptDetail]',
         rewardsContainer : 'serverrewardsview container[tag=rewards]',
         rewardSelection : 'serverrewardsview container[tag=tbBottomSelection] button[tag=rewardsSC]',
         rewardDetail : 'serverrewardsview container[tag=tbBottomDetail] button[tag=rewardsSC]',
         amount : 'serverrewardsview calculator[tag=amount] textfield',
         phoneId : 'serverrewardsview calculator[tag=phoneId] textfield',
         //qrcode : 'serverrewardsview component[tag=qrcode]',
         title : 'serverrewardsview container[tag=qrcodeContainer] component[tag=title]'
      },
      control :
      {
         rptCloseBB :
         {
            tap : 'onRptCloseTap'
         },
         calcBtn :
         {
            tap : 'onCalcBtnOverrideTap'
         },
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         rewardsContainer :
         {
            activeitemchange : 'onContainerActivate'
         },
         receiptsList :
         {
            //select : 'onReceiptSelect',
            disclose : 'onReceiptDisclose'
         },
         tableSelectField :
         {
            change : 'onTableSelectFieldChange'
         },
         'serverrewardsview calculator[tag=amount] container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'serverrewardsview calculator[tag=amount] container[tag=bottomButtons] button[tag=earnPts]' :
         {
            tap : 'onEarnPtsTap'
         },
         'serverrewardsview calculator[tag=phoneId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverrewardsview calculator[tag=phoneId] container[tag=bottomButtons] button[tag=earnTagId]' :
         {
            tap : 'onTagItTap'
         },
         rewardSelection :
         {
            tap : 'onRewardSelectionTap'
         },
         rewardDetail :
         {
            tap : 'onRewardDetailTap'
         }
      },
      listeners :
      {
         'rewarditem' : 'onRewardItem'
      }
   },
   maxValue : 1000.00,
   phoneIdMaxLength : 10,
   rewardSuccessfulMsg : 'Transaction Complete',
   rewardFailedMsg : 'Transaction Failed',
   invalidAmountMsg : 'Please enter a valid amount (eg. 5.00), upto $1000',
   earnPtsConfirmMsg : 'Please confirm to submit',
   earnPtsTitle : 'Earn Reward Points',
   selectRewardMsg : 'Please select your Receipt(s)',
   unRegAccountMsg : function()
   {
      return ('This account is unregistered' + Genesis.constants.addCRLF() + 'Phone Number is required for registration');
   },
   init : function()
   {
      var me = this;
      me.callParent(arguments);
      console.log("Server Rewards Init");
      //
      // Preload Pages
      //
      me.getRewards();

      Ext.StoreMgr.get('ReceiptStore').on(
      {
         addrecords : 'onReceiptStoreRefresh'
      });
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
      var store = Ext.StoreMgr.get('ReceiptStore');

      if (container)
      {
         me.getAmount().reset();
         me.onReceiptStoreRefresh();
         container.setActiveItem((store.getCount() > 0) ? 2 : 0);
      }
      me.getCalcBtn()[(store.getCount() > 0) ? 'show' : 'hide']();
      //activeItem.createView();
   },
   onCalcBtnOverrideTap : function(b, e)
   {
      var me = this;
      var container = me.getRewardsContainer();

      if (container)
      {
         me.getAmount().reset();
         animation.setDirection('down');
         container.setActiveItem(0);
         me.getRptCloseBB()['hide']();
         me.getBackBB()['show']();
         me.getCalcBtn()['hide']();
      }
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
         case 'posSelect' :
         case 'posDetail' :
         {
            console.debug("Rewards ContainerActivate Called. Showing POS Receipts ...");
            animation.setReverse(true);
            break;
         }
         case 'amount' :
         {
            me.getAmount().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset Amount ...");
            break;
         }
         case 'phoneId' :
         {
            me.getPhoneId().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset PhoneID ...");
            break;
         }
         case 'qrcodeContainer' :
         {
            animation.setDirection('down');
            animation.setReverse(false);
            console.debug("Rewards ContainerActivate Called.");
            break;
         }
      }
   },
   onRewardItem : function(automatic)
   {
      var me = this, identifiers = null, viewport = me.getViewPortCntlr(), proxy = PurchaseReward.getProxy();
      var callback = function(b)
      {
         viewport.popUpInProgress = false;
         me._actions.hide();
         viewport.setActiveController(null);
         if (me.scanTask)
         {
            clearInterval(me.scanTask);
            me.scanTask = null;
         }
         //
         // Stop receiving ProximityID
         //
         if (Genesis.fn.isNative())
         {
            window.plugins.proximityID.stop();
         }

         if (b && (b.toLowerCase() == 'manual'))
         {
            Ext.Viewport.setMasked(null);
            me.onEnterPhoneNum();
         }
         else if (!me.dismissDialog)
         {
            Ext.Viewport.setMasked(null);
            me.onDoneTap();
         }
      };

      me.dismissDialog = false;
      me.rewardItemFn = function(params, closeDialog)
      {
         var amount = 0;
         switch (me.getMode())
         {
            case 'Manual' :
            {
               amount = me.getAmount().getValue();
               break;
            }
            case 'POS_Detail' :
            case 'POS_Selection' :
            {
               for (var i = 0; i < me.receiptSelected.length; i++)
               {
                  amount += Number(me.receiptSelected[i].get('subtotal'));
               }
               break;
            }
            default:
               break;
         }
         console.debug("Amount:$" + amount);

         me.dismissDialog = closeDialog;
         callback();

         params = Ext.merge(params,
         {
            version : Genesis.constants.serverVersion,
            'venue_id' : Genesis.fn.getPrivKey('venueId'),
            data :
            {
               "amount" : amount,
               "type" : 'earn_points',
               'expiry_ts' : new Date().addHours(3).getTime()
            }
         });
         me._params = params['data'];
         params['data'] = me.self.encryptFromParams(params['data']);
         //
         // Update Server
         //
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         //Ext.device.Notification.dismiss();

         console.log("Updating Server with Reward information ... dismissDialog(" + me.dismissDialog + ")");
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
                     title : me.earnPtsTitle,
                     message : me.rewardSuccessfulMsg,
                     buttons : ['OK'],
                     callback : function()
                     {
                        switch (me.getMode())
                        {
                           case 'POS_Selected' :
                           case 'POS_Detail' :
                           {
                              for (var i = 0; i < me.receiptSelected.length; i++)
                              {
                                 me.receiptSelected[i].set('earned', true);
                              }
                              break;
                           }
                           case 'Manual' :
                           default :
                              break;
                        }
                        me.onDoneTap();
                     }
                  });
                  //
                  // Store to Receipt Database
                  //
                  if (db['enableReceiptUpload'] && db['isPosEnabled'])
                  {
                     var x, receipt, txid = 0;
                     var insertStatement = "INSERT INTO Receipt (id, receipts) VALUES (?, ?)";
                     var createStatement = "CREATE TABLE IF NOT EXISTS Receipt (id INTEGER PRIMARY KEY, receipts TEXT)";
                     var db = openDatabase('KickBak', 'ReceiptStore', "1.0", 5 * 1024 * 1024);
                     db.transaction(function(tx)
                     {
                        //
                        // Create Table
                        //
                        tx.executeSql(createStatement, [], function()
                        {
                           console.debug("Successfully created/retrieved KickBak-Receipt Table");
                        }, function(tx, error)
                        {
                           console.debug("Failed to create KickBak-Receipt Table : " + error.message);
                        });
                        //
                        // Insert Table
                        //
                        for ( x = 0; x < me.receiptSelected.length; x++)
                        {
                           receipt = me.receiptSelected[x];
                           //console.debug("Inserting Customer(" + item.getId() + ") to Database");
                           tx.executeSql(insertStatement, [txId, Ext.encode(receipt.getData(true))], function()
                           {
                              //console.debug("Inserted Customer(" + item.getId() + ") to Database");
                           }, function(tx, error)
                           {
                              console.debug("Failed to insert Customer(" + receipt.getId() + ") to Database : " + error.message);
                           });
                        }
                        console.debug("Receipt Submission  --- Inserted " + items.length + " records in Receipt Database ...");
                     });
                  }
               }
               else
               {
                  //proxy._errorCallback = Ext.bind(me.onDoneTap, me);
                  proxy.supressErrorsPopup = true;
                  if (proxy.getReader().metaData)
                  {
                     switch(proxy.getReader().metaData['rescode'])
                     {
                        case 'unregistered_account' :
                        {
                           //
                           //
                           //
                           Ext.device.Notification.show(
                           {
                              title : me.earnPtsTitle,
                              message : me.unRegAccountMsg(),
                              buttons : ['Register', 'Cancel'],
                              callback : function(btn)
                              {
                                 proxy.supressErrorsCallbackFn();
                                 if (btn.toLowerCase() == 'register')
                                 {
                                    me.onEnterPhoneNum();
                                 }
                                 else
                                 {
                                    me.onDoneTap();
                                 }
                              }
                           });
                           return;
                           break;
                        }
                        default :
                           break;
                     }
                  }
                  Ext.device.Notification.show(
                  {
                     title : me.earnPtsTitle,
                     message : me.rewardFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsCallbackFn();
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

      if (!me._actions)
      {
         me._actions = Ext.create('Genesis.view.widgets.PopupItemDetail',
         {
            iconType : 'prizewon',
            icon : 'rss',
            //cls : 'viewport',
            title : (Genesis.fn.isNative()) ? me.lookingForMobileDeviceMsg() : me.genQRCodeMsg,
            buttons : [
            {
               margin : '0 0 0.5 0',
               text : me.mobilePhoneInputMsg,
               ui : 'action',
               height : '3em',
               handler : Ext.bind(callback, me, ['manual'])
            },
            {
               margin : '0.5 0 0 0',
               text : 'Cancel',
               ui : 'cancel',
               height : '3em',
               handler : Ext.bind(callback, me, ['cancel'])
            }]
         });
         Ext.Viewport.add(me._actions);
      }
      viewport.popUpInProgress = true;
      me._actions.show();
      /*
       Ext.device.Notification.show(
       {
       title : me.earnPtsTitle,
       message : (Genesis.fn.isNative()) ? me.lookingForMobileDeviceMsg() : me.genQRCodeMsg,
       ignoreOnHide : true,
       buttons : [
       {
       text : me.mobilePhoneInputMsg,
       itemId : 'manual'
       },
       {
       text : 'Cancel',
       itemId : 'cancel'
       }],
       callback : callback
       });
       */
      if (Genesis.fn.isNative())
      {
         me.getLocalID(function(ids)
         {
            identifiers = ids;
            me.rewardItemFn(
            {
               data :
               {
                  'frequency' : identifiers['localID']
               }
            }, true);
         }, function()
         {
            me._actions.hide();
            me.onDoneTap();
         }, Ext.bind(me.onRewardItem, me, arguments));
         viewport.setActiveController(me);
      }
      /*
       else
       {
       me.rewardItemFn(
       {
       }, false);
       }
       */
   },
   // --------------------------------------------------------------------------
   // Amount Tab
   // --------------------------------------------------------------------------
   onEnterPhoneNum : function()
   {
      var me = this, amount = me.validateAmount(), container = me.getRewardsContainer();

      if (amount < 0)
      {
         return;
      }

      me.getCalcBtn()['hide']();
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
      /*
       me.getTitle().setData(
       {
       price : '$' + amount
       });
       container.setActiveItem(2);
       */

      me.setMode('Manual');
      me.fireEvent('rewarditem', b);
   },
   onRewardDetailTap : function(b, e, eOpts, eInfo)
   {
      var me = this;

      me.setMode('POS_Detail');
      me.fireEvent('rewarditem', b);
   },
   onRewardSelectionTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRewardsContainer(), receiptsList = me.getReceiptsList(), selection = receiptsList.getSelection();

      if (selection && (selection.length > 0))
      {
         me.receiptSelected = selection;
         me.setMode('POS_Selection');
         me.fireEvent('rewarditem', b);
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : me.earnPtsTitle,
            message : me.selectRewardMsg,
            buttons : ['Cancel']
         });
      }
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
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      switch (value)
      {
         case 'AC' :
         {
            phoneIdField.reset();
            break;
         }
         default :
            if (phoneIdFieldLength < me.phoneIdMaxLength)
            {
               phoneId += value;
               phoneIdField.setValue(phoneId);
            }
            break;
      }
   },
   onTagItTap : function()
   {
      var me = this, viewport = me.getViewPortCntlr();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      if (phoneIdFieldLength == me.phoneIdMaxLength)
      {
         me.self.playSoundFile(viewport.sound_files['nfcEnd']);
         me.onEarnPtsTap(null);

         me.onNfc(
         {
            id : (me._params) ? me._params['uid'] : null,
            result :
            {
               'tagID' : (me._params) ? me._params['tag_id'] : null,
               'phoneID' : phoneId
            }
         });
         delete me._params;
         /*
          Ext.device.Notification.show(
          {
          title : me.earnPtsTitle,
          message : me.earnPtsConfirmMsg,
          buttons : ['Confirm', 'Cancel'],
          callback : function(btn)
          {
          if (btn.toLowerCase() == 'confirm')
          {
          me.onNfc(
          {
          id : (me._params) ? me._params['uid'] : null,
          result :
          {
          'tagID' : (me._params) ? me._params['tag_id'] : null,
          'phoneID' : phoneId
          }
          });
          delete me._params;
          }
          else
          {
          me.onDoneTap();
          }
          }
          });
          */
      }
      else
      {
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         Ext.device.Notification.show(
         {
            title : me.earnPtsTitle,
            message : me.invalidPhoneIdFormatMsg(me.phoneIdMaxLength),
            buttons : ['Dismiss']
         });
      }
   },
   // --------------------------------------------------------------------------
   // Misc Event Funcs
   // --------------------------------------------------------------------------
   onRptCloseTap : function(b, e)
   {
      var me = this;
      var container = me.getRewardsContainer();
      if (container)
      {
         container.setActiveItem(2);
         me.getRptCloseBB()['hide']();
         me.getBackBB()['show']();
         me.getCalcBtn()['show']();
      }
   },
   onReceiptDisclose : function(list, record, target, index, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var container = me.getRewardsContainer();

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      if (container)
      {
         animation.setDirection('left');
         container.setActiveItem(3);

         var store = me.getReceiptDetail().getStore();
         store.setData(
         {
            receipt : Ext.decode(record.get('receipt'))
         });
         me.receiptSelected = [record];
         me.getRptCloseBB()['show']();
         me.getBackBB()['hide']();
         me.getCalcBtn()['show']();
      }
   },
   onReceiptStoreRefresh : function(store, records, eOpts)
   {
      var me = this;
      var list = me.getReceiptsList();

      if (list)
      {
         var store = list.getStore();
         console.debug("Refreshing ReceiptStore ...");
         store.setData(store.getData().all);
      }
   },
   onTableSelectFieldChange : function(field, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.tableFilterId = (newValue != 'All') ? newValue : null;
      console.debug("Filter by Table[" + viewport.tableFilterId + "] ...");
      me.onReceiptStoreRefresh();
   },
   // --------------------------------------------------------------------------
   // Misc Event Funcs
   // --------------------------------------------------------------------------
   onDoneTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var container = me.getRewardsContainer();
      delete me._params;
      var store = Ext.StoreMgr.get('ReceiptStore');

      if (container)
      {
         switch (me.getMode())
         {
            case 'Manual' :
            {
               me.getAmount().reset();
               container.setActiveItem((store.getCount() > 0) ? 2 : 0);
               break;
            }
            case 'POS_Detail' :
            {
               container.setActiveItem(3);
               break;
            }
            case 'POS_Selection' :
            {
               container.setActiveItem(2);
               break;
            }
            default :
               break;
         }
         me.getCalcBtn()[(store.getCount() > 0) ? 'show' : 'hide']();
      }

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
            'phone_id' : (nfcResult) ? nfcResult.result['phoneID'] : null,
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

