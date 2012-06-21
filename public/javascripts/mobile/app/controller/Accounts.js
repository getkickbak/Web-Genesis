Ext.define('Genesis.controller.Accounts',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      accounts_path : '/accounts'
   },
   xtype : 'accountsCntlr',
   config :
   {
      mode : 'profile',
      routes :
      {
         'accounts' : 'mainPage',
         'etransfer' : 'emailTransferPage',
         'transfer' : 'transferPage'
      },
      refs :
      {
         //
         // Account Profiles
         //
         aBB : 'accountsview button[tag=back]',
         accounts :
         {
            selector : 'accountsview',
            autoCreate : true,
            xtype : 'accountsview'
         },
         accountsList : 'accountsview list[tag=accountsList]',
         //
         // Account Transfers
         //
         atrCloseBB : 'clientaccountstransferview button[tag=close]',
         atrCalcCloseBB : 'clientaccountstransferview button[tag=calcClose]',
         atrBB : 'clientaccountstransferview button[tag=back]',
         transferPage :
         {
            selector : 'clientaccountstransferview',
            autoCreate : true,
            xtype : 'clientaccountstransferview'
         },
         points : 'clientaccountstransferview textfield',
         qrcode : 'clientaccountstransferview component[tag=qrcode]',
         title : 'clientaccountstransferview component[tag=title]',
         transferContainer : 'clientaccountstransferview container[tag=accountsTransferMain]'
      },
      control :
      {
         //
         // Account Profiles
         //
         accounts :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         accountsList :
         {
            select : 'onSelect',
            disclose : 'onDisclose'
         },
         'clientaccountstransferview button[tag=transfer]' :
         {
            select : 'onTransferTap'
         },
         //
         // Account Transfers
         //
         transferPage :
         {
            activate : 'onTransferActivate',
            deactivate : 'onTransferDeactivate'
         },
         'clientaccountstransferview container[tag=accountsTransferMain] list' :
         {
            select : 'onTransferSelect'
         },
         'clientaccountstransferview container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'clientaccountstransferview button[tag=showQrCode]' :
         {
            tap : 'onShowQrCodeTap'
         },
         'clientaccountstransferview container button[tag=done]' :
         {
            tap : 'onTransferCompleteTap'
         },
         atrCalcCloseBB :
         {
            tap : 'onTransferCompleteTap'
         }
      },
      listeners :
      {
         'selectMerchant' : 'onDisclose',
         'authCodeRecv' : 'onAuthCodeRecv'
      }
   },
   qrcodeRegExp : /%qrcode_image%/,
   noTransferCodeMsg : 'No Transfer Code was scanned',
   pointsReqMsg : 'Points are required for transfer',
   startTransferMsg : 'Prepare to scan the Sender\'s Transfer Code',
   transferFailedMsg : 'Transfer operation did not complete',
   transferSavedMsg : 'Transfer messasge was saved, but not sent.',
   transferSuccessMsg : function()
   {
      return 'Transfer operation was successfully completed.' + Genesis.constants.addCRLF() + //
      'Your account information won\'t be updated until your next check-in.';
   },
   xferWithinRangeMsg : function(min, max)
   {
      return 'Please enter a value between ' + min + ' and ' + max;
   },
   noPtsXferMsg : function()
   {
      return 'No Points were transferred.' + Genesis.constants.addCRLF() + //
      'Please Try Again.';
   },
   recvTransferMsg : function(points, merchantName)
   {
      return 'We have added ' + points + ' points ' + Genesis.constants.addCRLF() + //
      'towards your account at ' + //
      Genesis.constants.addCRLF() + merchantName + '!';
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Accounts Init");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      var vport = me.getViewport();
      var cstore = Ext.StoreMgr.get('CustomerStore');

      if (qrcode)
      {
         //
         // Send QRCode to server for processing
         //
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.updatingServerMsg
         });
         Customer['setRecvPtsXferUrl']();
         cstore.load(
         {
            addRecords : true, //Append data
            jsonData :
            {
            },
            params :
            {
               'data' : qrcode
            },
            callback : function(records, operation)
            {
               Ext.Viewport.setMasked(false);
               if (operation.wasSuccessful())
               {
                  var metaData = Customer.getProxy().getReader().metaData;
                  /*
                   var customer = cstore.getById(record.getId());
                   if(cutomer)
                   {
                   customer.set('points', record.get('points'));
                   }
                   else
                   {
                   cstore.add(record);
                   }
                   */
                  Ext.device.Notification.show(
                  {
                     title : 'Transfer Received',
                     message : me.recvTransferMsg(metaData['points'], records[0].getMerchant().get('name')),
                     callback : function(btn)
                     {
                        me.silentPopView(1);
                        Ext.defer(function()
                        {
                           me.fireEvent('selectMerchant', cstore, records[0]);
                           //me.pushView(me.getAccounts());
                        }, 1, me);
                     }
                  });
               }
            }
         });
      }
      else
      {
         console.debug(me.noCodeScannedMsg);
         Ext.Viewport.setMasked(false);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.noCodeScannedMsg
         });
      }
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      var merchantId = me.merchantId;
      var rec = me.rec;
      var mId = rec.getMerchant().getId();
      var customerId = rec.getId();
      var merchantName = rec.getMerchant().get('name');

      Venue['setGetClosestVenueURL']();
      Venue.load(merchantId,
      {
         scope : me,
         params :
         {
            'merchant_id' : merchantId,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(record, operation)
         {
            if (operation.wasSuccessful())
            {
               var metaData = Venue.getProxy().getReader().metaData;
               if (metaData)
               {
                  var app = me.getApplication();
                  var controller = app.getController('Checkins');
                  var cstore = Ext.StoreMgr.get('CustomerStore');
                  var viewport = me.getViewPortCntlr();

                  //
                  // Setup minimum customer information require for explore
                  //
                  metaData['venue_id'] = record.getId();
                  viewport.setVenue(record);
                  controller.fireEvent('checkinMerchant', 'explore', metaData, record.getId(), rec, operation, Ext.emptyFn);
               }
               else
               {
                  console.log("No MetaData found on Venue!");
               }
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg
               });
            }
         },
      });
   },
   // --------------------------------------------------------------------------
   // Accounts Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var mode = this.getMode();
      var tbbar = activeItem.query('titlebar')[0];
      switch(mode)
      {
         case 'profile' :
         {
            tbbar.setTitle('Accounts');
            tbbar.removeCls('kbTitle')
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            tbbar.setTitle(' ');
            tbbar.addCls('kbTitle')
            break;
         }
      }
      Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      oldActiveItem.removeAll(true);
   },
   onSelect : function(list, model, eOpts)
   {
      list.deselect([model]);
      this.onDisclose(list, model);
      return false;
   },
   onDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var customerId = record.getId();
      //var merchantName = record.getMerchant().get('name');
      var vport = me.getViewport();

      Genesis.controller.ControllerBase.playSoundFile(me.getViewPortCntlr().sound_files['clickSound']);
      me.merchantId = record.getMerchant().getId();
      me.rec = record;

      switch(me.getMode())
      {
         case 'profile' :
            me.getGeoLocation();
            break;
         case 'emailtransfer' :
         case 'transfer' :
         {
            if (record.get('points') < 1)
            {
               Ext.device.Notification.show(
               {
                  title : 'Points Required',
                  message : me.pointsReqMsg,
               });
               return;
            }

            // Drop the previous page history
            me.silentPopView(2);
            //
            // Select the Amounts of points to Transfer!
            //
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            me.pushView(me.getTransferPage());
            break;
         }
      }
   },
   // --------------------------------------------------------------------------
   // Accounts Transfer Page
   // --------------------------------------------------------------------------
   onTransferActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var screenShow = 0;
      var container = me.getTransferContainer();
      switch(me.getMode())
      {
         case 'profile' :
         {
            me.getAtrCloseBB().hide();
            me.getAtrCalcCloseBB().hide();
            me.getAtrBB().show();
            //container.setActiveItem(0);
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            me.getAtrCloseBB().hide();
            me.getAtrCalcCloseBB().show();
            me.getAtrBB().hide();
            if (oldActiveItem && (oldActiveItem == me.getAccounts() && !me.rec))
            {
               me.setMode('profile');
               //container.setActiveItem(0);
            }
            else
            {
               //me.getPoints().setValue(null);
               //container.setActiveItem(1);
               screenShow = 1;
            }
            break;
         }
      }
      Ext.defer(activeItem.createView, 1, activeItem, [screenShow]);
      //activeItem.createView(screenShow);
   },
   onTransferDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      oldActiveItem.removeAll(true);
   },
   onTransferTap : function(b, e, eOpts)
   {
   },
   onTransferSelect : function(list, model, eOpts)
   {
      var me = this;

      list.deselect([model]);
      delete me.merchantId;
      delete me.rec;

      switch (model.get('tag'))
      {
         //
         // Select the Merchant to generate the QRCode
         //
         case 'sender' :
         {
            me.setMode('transfer');
            me.openMainPage();
            break;
         }
         case 'emailsender' :
         {
            me.setMode('emailtransfer');
            me.openMainPage();
            break;
         }
         //
         // Scan Sender's QRCode
         //
         case 'recipient' :
         {
            me.setMode('profile');
            Ext.device.Notification.show(
            {
               title : 'Start Transfer',
               message : me.startTransferMsg,
               buttons : ['Proceed', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() == 'proceed')
                  {
                     me.scanQRCode();
                  }
               }
            });
            break;
         }
      }
      return false;
   },
   onCalcBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);

      var value = b.getText();
      var pointsField = me.getPoints();
      var points = pointsField.getValue() || "0";
      if (points.length < 8)
      {
         switch (value)
         {
            case 'AC' :
            {
               points = null;
               break;
            }
            default :
               points = (points != "0") ? points.concat(value) : value;
               break;
         }
         pointsField.setValue(points);
      }
   },
   onAuthCodeRecv : function(metaData)
   {
      var me = this;
      switch (me.getMode())
      {
         case 'transfer' :
         {
            var container = me.getTransferContainer();
            var qrcode = Genesis.controller.ControllerBase.genQRCode(metaData['data']);
            var points = metaData['points'] || me.getPoints().getValue();

            console.debug('\n' + //
            'QRCode - ' + qrcode[0] + '\n' + //
            //'Body - ' + emailTpl + '\n' + //
            'Points - ' + points);
            //
            // Query server to get generate qrcode
            //
            if (qrcode[0])
            {
               me.getQrcode().setStyle(
               {
                  'background-image' : 'url(' + qrcode[0] + ')',
                  'background-size' : Genesis.fn.addUnit(qrcode[1]) + ' ' + Genesis.fn.addUnit(qrcode[2])
               });
               me.getTitle().setData(
               {
                  points : points + ' Pts'
               });
               container.setActiveItem(2);
            }
            Ext.Viewport.setMasked(false);
            break;
         }
         case 'emailtransfer' :
         {
            var qrcode = metaData['data']['qrcode'];
            var emailTpl = metaData['data']['body'];
            var subject = metaData['data']['subject'];

            console.debug('\n' + //
            'QRCode - ' + qrcode + '\n' + //
            //'Body - ' + emailTpl + '\n' + //
            'Subject - ' + subject + '\n' //
            );

            //emailTpl = emailTpl.replace(me.qrcodeRegExp, Genesis.controller.ControllerBase.genQRCodeInlineImg(qrcode));
            //console.debug('\n' + //
            //'Encoded Body - ' + emailTpl);
            qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode)[0].replace('data:image/gif;base64,', "");

            window.plugins.emailComposer.showEmailComposerWithCB(function(res)
            {
               // Delay is needed to not block email sending ...
               Ext.defer(function()
               {
                  Ext.Viewport.setMasked(false);
                  switch (res)
                  {
                     case EmailComposer.ComposeResultType.Failed:
                     case EmailComposer.ComposeResultType.NotSent:
                     case EmailComposer.ComposeResultType.Cancelled:
                     {
                        Ext.device.Notification.show(
                        {
                           title : 'Transfer Failed',
                           message : me.transferFailedMsg,
                           callback : function()
                           {
                              //me.onTransferCompleteTap();
                           }
                        });
                        break;
                     }
                     case EmailComposer.ComposeResultType.Saved:
                     {
                        me.onTransferCompleteTap();
                        Ext.device.Notification.show(
                        {
                           title : 'Trasfer Deferred',
                           message : me.transferSavedMsg
                        });
                        break;
                     }
                     case EmailComposer.ComposeResultType.Sent:
                     {
                        me.onTransferCompleteTap();
                        Ext.device.Notification.show(
                        {
                           title : 'Transfer Success!',
                           message : me.transferSuccessMsg()
                        });
                        break;
                     }
                  }
               }, 1, me);
            }, subject, emailTpl, null, null, null, true, [qrcode]);
            break;
         }
      }
   },
   onShowQrCodeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var points = me.getPoints().getValue();
      var type;
      if ((Number(points) > 0) && (Number(points) <= me.rec.get('points') ))
      {
         switch (me.getMode())
         {
            case 'transfer' :
            {
               type = 'direct';
               Ext.Viewport.setMasked(
               {
                  xtype : 'loadmask',
                  message : me.genQRCodeMsg
               });
               break;
            }
            case 'emailtransfer' :
            {
               type = 'email';
               Ext.Viewport.setMasked(
               {
                  xtype : 'loadmask',
                  message : me.retrieveAuthModeMsg
               });
               break;
            }
         }

         // Send QRCode to server for processing
         //
         Customer['setSendPtsXferUrl']();
         cstore.load(
         {
            addRecords : true,
            jsonData :
            {
            },
            params :
            {
               'merchant_id' : me.merchantId,
               'points' : points,
               'type' : type
            },
            callback : function(records, operation)
            {
               var metaData = cstore.getProxy().getReader().metaData;
               if (operation.wasSuccessful() && (!metaData['data']))
               {
                  Ext.Viewport.setMasked(false);
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : me.noPtsXferMsg()
                  });
               }
            }
         });
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.xferWithinRangeMsg(1, me.rec.get('points'))
         });
      }
   },
   onTransferCompleteTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      me.setMode('profile');
      //
      // Go back to Accounts Page
      //
      me.popView();
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function()
   {
      this.openPage('profile');
   },
   emailTransferPage : function()
   {
      this.openPage('emailtransfer');
   },
   transferPage : function()
   {
      this.openPage('transfer');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;

      me.setMode('profile');
      me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
      switch (subFeature)
      {
         case 'profile' :
         {
            page = me.getMainPage();
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            page = me.getTransferPage();
            break;
         }
      }

      me.pushView(page);
   },
   getMainPage : function()
   {
      var page = this.getAccounts();
      return page;
   },
   openMainPage : function()
   {
      this.pushView(this.getMainPage());
      console.log("Accounts Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});
