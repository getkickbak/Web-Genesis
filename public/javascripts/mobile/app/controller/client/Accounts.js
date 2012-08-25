Ext.define('Genesis.controller.client.Accounts',
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
         'transfer' : 'transferPage',
         'selectTransfer' : 'selectTransferPage',
         'transferComplete' : 'transferCompletePage',
         //,'redememChooseSC' : 'redeemChooseSCPage'
      },
      refs :
      {
         //
         // Account Profiles
         //
         aBB : 'clientaccountsview button[tag=back]',
         avBB : 'clientaccountsview button[tag=vback]',
         accounts :
         {
            selector : 'clientaccountsview',
            autoCreate : true,
            xtype : 'clientaccountsview'
         },
         accountsList : 'clientaccountsview list[tag=accountsList]',
         venuesList : 'clientaccountsview list[tag=venuesList]',
         transferHdr : 'clientaccountsview toolbar[tag=transferHdr]',
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
         transferContainer : 'clientaccountstransferview'
      },
      control :
      {
         //
         // Account Profiles
         //
         accounts :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate',
            activeitemchange : 'onItemChangeActivate'
         },
         accountsList :
         {
            select : 'onSelect',
            disclose : 'onDisclose'
         },
         venuesList :
         {
            select : 'onVenueSelect',
            disclose : 'onVenueDisclose'
         },
         'clientaccountstransferview button[tag=transfer]' :
         {
            select : 'onTransferTap'
         },
         avBB :
         {
            tap : 'onAvBBTap'
         },
         //
         // Account Transfers
         //
         transferPage :
         {
            activate : 'onTransferActivate',
            deactivate : 'onTransferDeactivate'
         },
         'clientaccountstransferview container[tag=accountsTransferMode] list' :
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
         'selectMerchant' : 'onDisclose'
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
      return 'Your account information won\'t be updated until your next check-in.';
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
   xferCodeRecv : false,
   init : function()
   {
      var me = this;
      this.callParent(arguments);
      console.log("Accounts Init");

      me.callBackStack =
      {
         callbacks : ['onXferCodeRecv'],
         arguments : [],
         startIndex : 0
      };

      me.getAccounts();
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
                  Ext.device.Notification.show(
                  {
                     title : 'Transfer Received',
                     message : me.recvTransferMsg(metaData['points'], records[0].getMerchant().get('name')),
                     callback : function(btn)
                     {
                        me.resetView();
                        me.redirectTo('accounts');
                        //me.fireEvent('selectmerchant', cstore, records[0]);
                     }
                  });
                  me.persistSyncStores('CustomerStore');
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
      var vstore = Ext.StoreMgr.get('VenueStore');
      var proxy = vstore.getProxy();

      //Venue['setGetClosestVenueURL']();
      Venue['setFindNearestURL']();
      vstore.load(
      {
         scope : me,
         params :
         {
            'merchant_id' : merchantId,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(records, operation)
         {
            Ext.Viewport.setMasked(false);
            if (operation.wasSuccessful())
            {
               console.debug('Found ' + records.length + ' venues matching current location ...');
               if (records.length > 1)
               {
                  var view = me.getAccounts();
                  if (!view.isPainted() || view.isHidden())
                  {
                     console.debug('Opening Accounts Page ...');
                     view.on('showView', function()
                     {
                        this.setActiveItem(1);
                     }, view,
                     {
                        single : true
                     });
                     me.redirectTo('accounts');
                  }
                  else
                  {
                     view.setActiveItem(1);
                  }

               }
               else
               {
                  me.getVenueMetaData(records[0]);
               }
            }
            else
            {
               proxy.supressErrorsPopup = true;
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg,
                  callback : function()
                  {
                     proxy.supressErrorsPopup = false;
                  }
               });
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Accounts Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var mode = me.getMode();
      var tbbar = activeItem.query('titlebar')[0];

      activeItem.mode = mode;
      switch(mode)
      {
         case 'profile' :
         {
            tbbar.setTitle('Accounts');
            tbbar.removeCls('kbTitle');
            break;
         }
         case 'redeemRewardsProfile' :
         {
            tbbar.setTitle('Rewards');
            tbbar.removeCls('kbTitle');
            break;
         }
         case 'redeemPrizesProfile' :
         {
            tbbar.setTitle('Prizes');
            tbbar.removeCls('kbTitle');
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            tbbar.setTitle(' ');
            tbbar.addCls('kbTitle');
            var transferHdr = me.getTransferHdr();
            activeItem.showTransferHdr = true;
            if (transferHdr)
            {
               transferHdr.show();
            }
            break;
         }
      }
      if (activeItem.getInnerItems().length > 0)
      {
         activeItem.setActiveItem(0);
         //me.getAccountsList().setVisibility(false);
      }
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      me.getTransferHdr().hide();
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
         case 'redeemRewardsProfile' :
         case 'redeemPrizesProfile' :
         {
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.getMerchantInfoMsg
            });
            me.getGeoLocation();
            break;
         }
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
            me.redirectTo('transferComplete');
            break;
         }
      }
   },
   onAvBBTap : function(b, e, eOpts)
   {
      this.getAccounts().setActiveItem(0);
   },
   onVenueSelect : function(list, model, eOpts)
   {
      list.deselect([model]);
      this.onVenueDisclose(list, model);
      return false;
   },
   getVenueMetaData : function(venue)
   {
      var me = this;
      var venueId = venue.getId();
      var viewport = me.getViewPortCntlr();
      var controller = me.getApplication().getController('client.Checkins');
      var rec = me.rec;
      var rstore, url, rcontroller;

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.getVenueInfoMsg
      });
      switch (me.getMode())
      {
         case 'redeemPrizesProfile' :
         {
            rcontroller = me.getApplication().getController('client.Prizes');
            break;
         }
         case 'redeemRewardsProfile' :
         {
            rcontroller = me.getApplication().getController('client.Redemptions');
            break;
         }
         case 'profile' :
         default :
            viewport.setVenue(venue);
            var controller = me.getApplication().getController('client.Checkins');
            controller.fireEvent('explore');
            return;
            break;
      }
      rstore = Ext.StoreMgr.get(rcontroller.getRedeemStore());
      url = rcontroller.getRedeemUrl();
      path = rcontroller.getRedeemPath();
      CustomerReward[url]();
      rstore.load(
      {
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId
         },
         scope : me,
         callback : function(records, operation)
         {
            if (operation.wasSuccessful())
            {
               var metaData =
               {
                  'venue_id' : venueId
               };

               for (var i = 0; i < records.length; i++)
               {
                  records[i].handleInlineAssociationData(
                  {
                     'merchant' : venue.getMerchant().raw
                  });
                  //records[i].setMerchant(venue.getMerchant());
               }
               viewport.setVenue(venue);
               switch(me.getMode())
               {
                  /*
                   case 'profile' :
                   {
                   controller.fireEvent('checkinMerchant', 'explore', metaData, venueId, rec, operation, Ext.emptyFn);
                   break;
                   }
                   */
                  case 'redeemRewardsProfile' :
                  case 'redeemPrizesProfile' :
                  default:
                     controller.fireEvent('checkinMerchant', 'redemption', metaData, venueId, rec, operation, Ext.emptyFn);
                     me.redirectTo(path);
                     break;
               }
               delete me.rec;
            }
            else
            if (!operation.wasSuccessful() && !metaData)
            {
               Ext.Viewport.setMasked(false);
               console.log(me.metaDataMissingMsg);
            }
         }
      });
   },
   onVenueDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      //
      // Setup minimum customer information require for explore
      //
      me.getVenueMetaData(record);
   },
   onItemChangeActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getAccounts();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'accountsList' :
         {
            animation.setReverse(true);
            me.getABB().show();
            me.getAvBB().hide();
            break;
         }
         case 'venuesList' :
         {
            animation.setReverse(false);
            me.getABB().hide();
            me.getAvBB().show();
            break;
         }
      }
      console.debug("Accounts onItemChangeActivate[" + value.config.tag + "] Called.");
   },
   onXferCodeRecv : function(metaData)
   {
      var me = this;

      me.xferCodeRecv = true;
      switch (me.getMode())
      {
         case 'transfer' :
         {
            var container = me.getTransferContainer();
            var qrcode = Genesis.controller.ControllerBase.genQRCode(metaData['data']);
            var points = metaData['points'] || me.getPoints().getValue();

            console.debug('\n' + //
            //'QRCode - ' + qrcode[0] + '\n' + //
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
                  'background-size' : Genesis.fn.addUnit(qrcode[1] * 1.25) + ' ' + Genesis.fn.addUnit(qrcode[2] * 1.25)
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
            //'QRCode - ' + qrcode + '\n' + //
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

      return false;
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
         case 'redeemRewardsProfile' :
         case 'redeemPrizesProfile' :
         case 'profile' :
         {
            me.getAtrCloseBB().hide();
            me.getAtrCalcCloseBB().hide();
            me.getAtrBB().show();
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
            }
            else
            {
               if (me.getPoints())
               {
                  me.getPoints().setValue(null);
               }
               screenShow = 1;
            }
            break;
         }
      }
      //activeItem.createView(screenShow);
   },
   onTransferDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      var container = me.getTransferContainer();

      if (container)
      {
         container.setActiveItem(0);
      }
   },
   onTransferTap : function(b, e, eOpts)
   {
   },
   onTransferSelect : function(list, model, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      //Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);

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
            me.setMode('transfer')
            me.redirectTo('selectTransfer');
            break;
         }
         case 'emailsender' :
         {
            me.setMode('emailtransfer')
            me.redirectTo('selectTransfer');
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

      //Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);

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
      var _exit = function()
      {
         //
         // Go back to Accounts Page
         //
         me.popView();
      }

      me.setMode('profile');
      if (me.xferCodeRecv)
      {
         Ext.device.Notification.show(
         {
            title : 'Transfer Success!',
            message : me.transferSuccessMsg(),
            callback : _exit
         });
      }
      else
      {
         _exit();
      }
      me.xferCodeRecv = false;
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
   selectTransferPage : function()
   {
      this.openMainPage();
   },
   transferCompletePage : function()
   {
      var me = this;
      var container = me.getTransferContainer();
      //
      // Select the Amounts of points to Transfer!
      //
      container.setActiveItem(1);

      me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
      me.pushView(me.getTransferPage());
   },
   redeemRewardsChooseSCPage : function()
   {
      this.openPage('redeemRewardsProfile');
   },
   redeemPrizesChooseSCPage : function()
   {
      this.openPage('redeemPrizesProfile');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;

      me.setAnimationMode(me.self.superclass.self.animationMode['cover']);
      switch (subFeature)
      {
         case 'emailtransfer' :
         case 'transfer' :
         {
            me.setMode('profile');
            page = me.getTransferPage();
            break;
         }
         case 'redeemPrizesProfile' :
         case 'redeemRewardsProfile' :
         case 'profile' :
         default :
            me.setMode(subFeature);
            page = me.getMainPage();
            break;
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
