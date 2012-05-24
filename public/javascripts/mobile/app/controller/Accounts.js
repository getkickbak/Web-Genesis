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
      refs :
      {
         //
         // Account Profiles
         //
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
         transferPage :
         {
            selector : 'accountstransferview',
            autoCreate : true,
            xtype : 'accountstransferview'
         },
         points : 'accountstransferview textfield',
         qrcode : 'accountstransferview component[tag=qrcode]',
         title : 'accountstransferview component[tag=title]',
         transferContainer : 'accountstransferview container[tag=accountsTransferMain]'
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
         'accountstransferview button[tag=transfer]' :
         {
            select : 'onTransferTap'
         },
         //
         // Account Transfers
         //
         transferPage :
         {
            activate : 'onTransferActivate'
         },
         'accountstransferview container[tag=accountsTransferMain] list' :
         {
            select : 'onTransferSelect'
         },
         'accountstransferview container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'accountstransferview button[tag=showQrCode]' :
         {
            tap : 'onShowQrCodeTap'
         },
         'accountstransferview container[tag=done] button' :
         {
            tap : 'onTransferCompleteTap'
         }
      }
   },
   qrcodeRegExp : /%qrcode_image%/,
   noTransferCodeMsg : 'No Transfer Authorization Code was scanned',
   pointsReqMsg : 'Points are required for transfer',
   retrieveAuthModeMsg : 'Retrieving Authorization Code from Server ...',
   startTransferMsg : 'Prepare to scan the Sender\'s Authorization Code',
   transferFailedMsg : 'Transfer operation did not complete',
   transferSavedMsg : 'Transfer messasge was saved.',
   transferSuccessMsg : 'Transfer operation was successfully completed',
   xferWithinRangeMsg : function(min, max)
   {
      return 'Please enter a value between ' + min + ' and ' + max;
   },
   noPtsXferMsg : function()
   {
      return 'No Points were transferred.' + Genesis.constants.addCRLF() + 'Try again.';
   },
   recvTransferMsg : function(points, merchantName)
   {
      return 'You have received ' + points + ' points at ' + Genesis.constants.addCRLF() + merchantName;
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

      if(qrcode)
      {
         //
         // Send QRCode to server for processing
         //
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
            callback : function(record, operation)
            {
               if(operation.wasSuccessful())
               {
                  var metaData = Customer.getProxy().getReader().metaData();
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
                     message : me.recvTransferMsg(metaData['points'], rec.getMerchant().get('name')),
                     callback : function(btn)
                     {
                        vport.silentPop(1);
                        me.pushView(me.getAccounts());
                     }
                  });
               }
               else
               {
                  Ext.Viewport.setMasked(false);
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
            if(operation.wasSuccessful())
            {
               var metaData = Venue.getProxy().getReader().metaData;
               if(metaData)
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
                  app.dispatch(
                  {
                     action : 'onCheckinHandler',
                     args : ['explore', metaData, cstore, null, [rec], operation],
                     controller : controller,
                     scope : controller
                  });
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
      //
      // Scroll to the Top of the Screen
      //
      this.getAccountsList().getScrollable().getScroller().scrollTo(0, 0);
   },
   onDeactivate : function()
   {
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
      var merchantName = record.getMerchant().get('name');
      var vport = me.getViewport();

      if(record.get('points') < 1)
      {
         Ext.device.Notification.show(
         {
            title : 'Points Required',
            message : me.pointsReqMsg,
         });
         return;
      }

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
            // Drop the previous page history
            vport.silentPop(2);
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
      var container = me.getTransferContainer();
      switch(me.getMode())
      {
         case 'profile' :
            container.setActiveItem(0);
            break;
         case 'emailtransfer' :
         case 'transfer' :
         {
            if(oldActiveItem && (oldActiveItem == me.getAccounts() && !me.rec))
            {
               me.setMode('profile');
               container.setActiveItem(0);
            }
            else
            {
               me.getPoints().setValue(null);
               container.setActiveItem(1);
            }
            break;
         }
      }
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
         // Generate QRCode for the recipient to scan
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
                  if(btn.toLowerCase() == 'proceed')
                  {
                     Ext.Viewport.setMasked(
                     {
                        xtype : 'loadmask',
                        message : me.retrieveAuthModeMsg
                     });
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
      if(points.length < 8)
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
            if(qrcode[0])
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

            //emailTpl = emailTpl.replace(me.qrcodeRegExp, '<img src="' + Genesis.controller.ControllerBase.genQRCode(qrcode)[0] +
            // '"/>');
            /*
             console.debug('\n' + //
             'Encoded Body - ' + emailTpl);
             */

            window.plugins.emailComposer.showEmailComposerWithCB(function(res)
            {
               // Delay is needed to not block email sending ...
               Ext.defer(function()
               {
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
                           message : me.transferSuccessMsg
                        });
                        break;
                     }
                  }
               }, 1, me);
            }, subject, emailTpl, null, null, null, true, [Genesis.controller.ControllerBase.genQRCode(qrcode)[0].replace("data:image/png;base64,", "")]);
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
      if((Number(points) > 0) && (Number(points) <= me.rec.get('points') ))
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
               Ext.Viewport.setMasked(false);
               var metaData = cstore.getProxy().getReader().metaData;
               if(operation.wasSuccessful() && (!metaData['data']))
               {
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
      //
      // Go back to Accounts Page
      //
      this.popView();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var page;

      this.setMode('profile');
      switch (subFeature)
      {
         case 'profile' :
            page = this.getMainPage();
            break;
         case 'emailtransfer' :
         case 'transfer' :
            page = this.getTransferPage();
            break;
      }

      this.pushView(page);
   },
   getMainPage : function()
   {
      return this.getAccounts();
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
