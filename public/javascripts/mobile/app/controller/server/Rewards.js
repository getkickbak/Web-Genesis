Ext.define('Genesis.controller.server.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   xtype : 'serverRewardsCntlr',
   config :
   {
      mode : 'Manual', // 'POS_Selection', 'POS_Detail', 'Maunal', 'Visit'
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
         refreshBtn : 'serverrewardsview button[tag=refresh]',
         receiptsList : 'serverrewardsview container list',
         tableSelectField : 'serverrewardsview selectfield[tag=tableFilter]',
         backBB : 'serverrewardsview button[tag=back]',
         rptCloseBB : 'serverrewardsview button[tag=rptClose]',
         receiptDetail : 'serverrewardsview dataview[tag=receiptDetail]',
         rewardsContainer : 'serverrewardsview container[tag=rewards]',
         rewardTBar : 'serverrewardsview container[tag=tbBottomSelection]',
         rewardSelection : 'serverrewardsview container[tag=tbBottomSelection] button[tag=rewardsSC]',
         rewardDetail : 'serverrewardsview container[tag=tbBottomDetail] button[tag=rewardsSC]',
         amount : 'serverrewardsview calculator[tag=amount] textfield',
         itemsPurchased : 'serverrewardsview calculator[tag=itemsPurchased] textfield',
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
         'serverrewardsview calculator[tag=itemsPurchased] container[tag=dialpad] button' :
         {
            tap : 'onStampBtnTap'
         },
         'serverrewardsview calculator[tag=itemsPurchased] container[tag=bottomButtons] button[tag=earnPts]' :
         {
            tap : 'onEarnPtsTap'
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
   maxStampValue : 9,
   phoneIdMaxLength : 10,
   rewardSuccessfulMsg : 'Transaction Complete',
   rewardFailedMsg : 'Transaction Failed',
   invalidAmountMsg : 'Please enter a valid amount (eg. 5.00), upto $1000',
   invalidStampMsg : 'Please enter a valid Stamp amount (1-9)',
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
         //clear : 'onReceiptStoreUpdate',
         filter : 'onReceiptStoreUpdate',
         addrecords : 'onReceiptStoreUpdate',
         refresh : 'onReceiptStoreUpdate',
         //removerecords : 'onReceiptStoreUpdate',
         updaterecord : 'onReceiptStoreUpdate',
         scope : me
      });

      backBtnCallbackListFn.push(function(activeItem)
      {
         var viewport = me.getViewPortCntlr(), closeButton = activeItem.query('button[tag=rptClose]')[0];
         if ((activeItem == me.getRewards()) && (closeButton && !closeButton.isHidden()))
         {
            viewport.self.playSoundFile(viewport.sound_files['clickSound']);
            closeButton.fireEvent('tap', closeButton, null);
            return true;
         }
         return false;
      });

      //
      // Post Notification
      //
      window.addEventListener('message', function(e)
      {
         var _data = e.data;

         if (( typeof (_data) == 'object') && (_data['cmd'] == 'notification_ack'))
         {
            var store = Ext.StoreMgr.get('ReceiptStore');
            var record = store.find('id', _data['id']);
            if (record)
            {
               me.receiptSelected = [record];
               me.setMode('POS_Selection');
               me.fireEvent('rewarditem', true);
            }
         }
      }, false);
   },
   getAmountPrecision : function(num)
   {
      var precision = num.split('.');
      return ((precision.length > 1) ? precision[1].length : 0);
   },
   validateAmount : function()
   {
      var me = this, amount, db = Genesis.db.getLocalDB();

      switch (db['rewardModel'])
      {
         case 'items_purchased' :
         {
            amount = me.getItemsPurchased().getValue();
            console.debug("Stamp Ammount = [" + amount + "]");
            if (amount <= 0)
            {
               Ext.device.Notification.show(
               {
                  title : 'Validation Error',
                  message : me.invalidStampMsg,
                  buttons : ['Dismiss']
               });
               amount = -1;
            }
            break;
         }
         case 'amount_spent' :
         {
            amount = me.getAmount().getValue();
            console.debug("Ammount = [" + amount + "]");
            var precision = me.getAmountPrecision(amount);
            if (precision < 2)
            {
               Ext.device.Notification.show(
               {
                  title : 'Validation Error',
                  message : me.invalidAmountMsg,
                  buttons : ['Dismiss']
               });
               amount = -1;
            }
            break;
         }
         case 'visits' :
         default:
            break;
      }

      return amount;
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, container = me.getRewardsContainer(), store = Ext.StoreMgr.get('ReceiptStore'), db = Genesis.db.getLocalDB();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0), posEnabled = pos.isEnabled();

      if (container)
      {
         me.getAmount().reset();
         me.getItemsPurchased().reset();
         me.onReceiptStoreUpdate(store);
         container.setActiveItem((posEnabled) ? 2 : manualMode);
      }
      if (debugMode)
      {
         me.getCalcBtn()[(posEnabled) ? 'show' : 'hide']();
      }
      me.getRefreshBtn()[(posEnabled) ? 'show' : 'hide']();
      //activeItem.createView();
   },
   onCalcBtnOverrideTap : function(b, e)
   {
      var me = this, container = me.getRewardsContainer(), animation = container.getLayout().getAnimation(), db = Genesis.db.getLocalDB();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0);

      if (container)
      {
         me.getAmount().reset();
         me.getItemsPurchased().reset();
         animation.setDirection('down');
         container.setActiveItem(manualMode);
         me.getRptCloseBB()['hide']();
         me.getBackBB()['show']();
         if (debugMode)
         {
            me.getCalcBtn()['hide']();
         }
      }
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;

      window.plugins.proximityID.stop();
      me.getViewPortCntlr().setActiveController(null);
      console.debug("Rewards onDeactivate Called. Reset Amount ...");
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this, container = me.getRewardsContainer(), animation = container.getLayout().getAnimation();

      me.getRefreshBtn()[(value.config.tag == 'posSelect') ? 'show'  : 'hide']();
      switch (value.config.tag)
      {
         case 'posSelect' :
         {
            animation.setDirection('left');
            console.debug("Rewards ContainerActivate Called. Showing POS Receipts ...");
            break;
         }
         case 'posDetail' :
         {
            animation.setDirection('right');
            console.debug("Rewards ContainerActivate Called. Showing POS Receipt Detail ...");
            break;
         }
         case 'amount' :
         {
            me.getAmount().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset Amount ...");
            break;
         }
         case 'itemsPurchased' :
         {
            me.getItemsPurchased().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset ItemsPurchased ...");
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
   rewardItemCb : function(b)
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.popUpInProgress = false;
      me._actions.hide();
      viewport.setActiveController(null);
      clearInterval(me.scanTask);
      me.scanTask = null;
      //
      // Stop receiving ProximityID
      //
      window.plugins.proximityID.stop();

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
   },
   rewardItemFn : function(params, closeDialog)
   {
      var me = this, viewport = me.getViewPortCntlr(), proxy = PurchaseReward.getProxy(), amount = 0, itemsPurchased = 0, visits = 0, db = Genesis.db.getLocalDB();
      var posEnabled = pos.isEnabled();

      switch (me.getMode())
      {
         case 'Manual' :
         {
            amount = me.getAmount().getValue();
            itemsPurchased = me.getItemsPurchased().getValue();
            visits++;
            break;
         }
         case 'POS_Detail' :
         case 'POS_Selection' :
         {
            var receiptSelected;
            for (var i = 0; i < me.receiptSelected.length; i++)
            {
               receiptSelected = me.receiptSelected[i];
               amount += Number(receiptSelected.get('subtotal'));
               itemsPurchased += Number(receiptSelected.get('itemsPurchased'));
               visits++;
            }
            break;
         }
         case 'Visit' :
         {
            visits++;
            break;
         }
         default:
            break;
      }
      console.debug("Amount:$" + amount + ", ItemsPurchased = " + itemsPurchased + ", Visits = " + visits);

      me.dismissDialog = closeDialog;
      me.rewardItemCb();

      params = Ext.merge(params,
      {
         version : Genesis.constants.serverVersion,
         'venue_id' : Genesis.fn.getPrivKey('venueId'),
         data :
         {
            "amount" : amount,
            "items" : Number(itemsPurchased),
            "visits" : Number(visits),
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

      console.debug("Updating Server with Reward information ... dismissDialog(" + me.dismissDialog + ")");
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
               var metaData = proxy.getReader().metaData;
               Ext.device.Notification.show(
               {
                  title : me.earnPtsTitle,
                  message : me.rewardSuccessfulMsg,
                  buttons : ['OK'],
                  callback : function()
                  {
                     me.onDoneTap();
                  }
               });
               //
               // Store to Receipt Database
               //
               if (posEnabled)
               {
                  var x, receipts = [], receipt, rstore = Ext.StoreMgr.get('ReceiptStore'), estore = Ext.StoreMgr.get('EarnedReceiptStore');

                  for (var i = 0; i < me.receiptSelected.length; i++)
                  {
                     if (metaData['txn_id'] && (metaData['txn_id'] > 0))
                     {
                        me.receiptSelected[i].set('txnId', metaData['txn_id']);
                     }
                     receipts.push(me.receiptSelected[i].getData(true));
                     for (var j = 0; j < receipts[i]['items'].length; j++)
                     {
                        delete receipts[i]['items'][j]['id'];
                     }
                  }
                  //
                  // Add to Earned store
                  //
                  estore.add(me.receiptSelected);

                  _application.getController('server' + '.Receipts').fireEvent('insertReceipts', receipts);
                  //
                  // Refresh Store
                  //
                  me.getReceiptsList().deselectAll();
                  rstore.filter();
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
   },
   onRewardItem : function(automatic)
   {
      var me = this, viewport = me.getViewPortCntlr(), proxy = PurchaseReward.getProxy();

      me.dismissDialog = false;
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
            title : me.lookingForMobileDeviceMsg(),
            buttons : [
            {
               margin : '0 0 0.5 0',
               text : me.mobilePhoneInputMsg,
               ui : 'action',
               height : (3 * 1.5) + 'em',
               handler : Ext.bind(me.rewardItemCb, me, ['manual'])
            },
            {
               text : 'Cancel',
               ui : 'cancel',
               height : (3 * 1.5) + 'em',
               handler : Ext.bind(me.rewardItemCb, me, ['cancel'])
            }]
         });
         Ext.Viewport.add(me._actions);
      }
      viewport.popUpInProgress = true;
      me._actions.show();

      me.identifiers = null;
      me.getLocalID(function(ids)
      {
         me.identifiers = ids;
         me.rewardItemFn(
         {
            data :
            {
               'frequency' : me.identifiers['localID']
            }
         }, true);
      }, function()
      {
         me._actions.hide();
         me.onDoneTap();
      }, Ext.bind(me.onRewardItem, me, arguments));
      viewport.setActiveController(me);
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
      if (debugMode)
      {
         me.getCalcBtn()['hide']();
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
   onStampBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var amountField = me.getItemsPurchased();
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

            if ((amount == 0) && (amountFieldLength > 0))
            {
               amount = Number(value);
            }
            else
            {
               amount = (10 * amount) + Number(value);
            }

            // Max value
            if (amount <= me.maxStampValue)
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
         if (debugMode)
         {
            me.getCalcBtn()['show']();
         }
      }
   },
   onReceiptDisclose : function(list, record, target, index, e, eOpts, eInfo)
   {
      var me = this, viewport = me.getViewPortCntlr(), container = me.getRewardsContainer(), animation = container.getLayout().getAnimation();

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
         if (debugMode)
         {
            me.getCalcBtn()['show']();
         }
      }
   },
   onReceiptStoreUpdate : function(store)
   {
      var me = this, db = Genesis.db.getLocalDB(), list = me.getReceiptsList(), visible = (store.getCount() > 0) ? 'show' : 'hide';
      var posEnabled = pos.isEnabled();

      if (list)
      {
         console.debug("Refreshing ReceiptStore ... count[" + store.getCount() + "]");
         //store.setData(store.getData().all);

         if (posEnabled && me.getRewardTBar())
         {
            me.getRewardTBar()[visible]();
            me.getTableSelectField()[visible]();
         }
      }
      else
      {
         //console.debug("onReceiptStoreUpdate - list not avail for update");
      }
   },
   onTableSelectFieldChange : function(field, newValue, oldValue, eOpts)
   {
      var me = this, store = Ext.StoreMgr.get('ReceiptStore');

      store.tableFilterId = (newValue != 'None') ? newValue : null;
      console.debug("Filter by Table[" + store.tableFilterId + "] ...");

      //
      // Wait for animation to complete before we filter
      //
      Ext.defer(function()
      {
         store.filter();
         //me.onReceiptStoreUpdate(store);
      }, 1 * 1000);
   },
   // --------------------------------------------------------------------------
   // Misc Event Funcs
   // --------------------------------------------------------------------------
   onDoneTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRewardsContainer(), db = Genesis.db.getLocalDB(), store = Ext.StoreMgr.get('ReceiptStore');
      var posEnabled = pos.isEnabled();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0);
      delete me._params;
      switch (me.getMode())
      {
         case 'Manual' :
         {
            if (container)
            {
               me.getAmount().reset();
               me.getItemsPurchased().reset();
               container.setActiveItem((posEnabled) ? 2 : manualMode);
            }
            break;
         }
         case 'POS_Detail' :
         {
            if (container)
            {
               container.setActiveItem(3);
            }
            break;
         }
         case 'POS_Selection' :
         {
            if (container)
            {
               container.setActiveItem(2);
            }
            break;
         }
         case 'Visit' :
         {
            me.getViewPortCntlr().setActiveController(me.getApplication().getController('server' + '.MainPage'));
            break;
         }
         default :
            break;
      }
      console.debug("onDoneTap - Mode[" + me.getMode() + "], rewardModel[" + db['rewardModel'] + "]")
      if (me.getCalcBtn())
      {
         me.getCalcBtn()[(posEnabled) ? 'show' : 'hide']();
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
            'phone_id' : (nfcResult) ? nfcResult.result['phoneID'] : null
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
      var me = this, db = Genesis.db.getLocalDB(), posEnabled = pos.isEnabled();

      switch (subFeature)
      {
         case 'rewards':
         {
            switch (db['rewardModel'])
            {
               case 'visits' :
               {
                  if (!posEnabled)
                  {
                     me.setMode('Visit');
                     me.fireEvent('rewarditem', subFeature);
                     break;
                  }
               }
               case 'amount_spent' :
               case 'items_purchased' :
               default:
                  me.redirectTo('earnPts');
                  break;
            }
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

