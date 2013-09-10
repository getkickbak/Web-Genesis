Ext.define('Genesis.controller.ControllerBase',
{
   extend : 'Ext.app.Controller',
   requires : ['Ext.data.Store', 'Ext.util.Geolocation'],
   config :
   {
      animationMode : null,
      models : ['Customer']
   },
   scanTaskWait : false,
   scanTask : null,
   establishConnectionMsg : 'Connecting to Server ...',
   loginMsg : 'Logging in ...',
   checkinMsg : 'Checking in ...',
   loadingScannerMsg : 'Loading Scanner ...',
   loadingMsg : 'Loading ...',
   genQRCodeMsg : 'Generating QRCode ...',
   missingLicenseKeyMsg : 'License Key for this Device is missing. Press "Procced" to Scan the License Key into the device.',
   retrieveAuthModeMsg : 'Retrieving Authorization Code from Server ...',
   noCodeScannedMsg : 'No Authorization Code was Scanned!',
   lostNetworkConnectionMsg : 'You have lost network connectivity',
   networkErrorMsg : 'Error Connecting to Sever',
   noPeerDiscoveredMsg : 'No Peers were discovered',
   noPeerIdFoundMsg : function(msg)
   {
      return ("No ID Found! ErrorCode(" + msg + ")");
   },
   notAtVenuePremise : 'You must be inside the Merchant\'s premises to continue.',
   errorLoadingAccountProfileMsg : 'Error Loading Account Profile',
   invalidTagIdFormatMsg : function(length)
   {
      return 'Invalid ' + length + '-digit Tag ID format (eg. 12345678)';
   },
   invalidPhoneIdFormatMsg : function(length)
   {
      return 'Invalid ' + length + '-digit Telephone format (eg. 8005551234)';
   },
   transactionCancelledMsg : 'This transaction is cancelled',
   backToMerchantPageMsg : function(venue)
   {
      return ('Would you like to visit our Main Page?');
   },
   geoLocationErrorMsg : function()
   {
      var rc = 'This feature must require your GeoLocation to proceed.';
      if (Ext.os.is('Android'))
      {
         rc += // ((Ext.os.version.isLessThan('4.1')) ? //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> GPS satellites\"';
      }
      else if (Ext.os.is('iOS'))
      {
         rc += ((Ext.os.version.isLessThan('6.0')) ? //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> KICKBAK\"' :
         // //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Privacy >> Location Services >> KICKBAK\"'//
         );
      }
      else if (Ext.os.is('BlackBerry'))
      {
         rc += 'Enable Location Services under Main Screen of your phone: \"Settings App >> Site Permissions\"';
      }
      else
      {
         rc += 'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services\"';
      }

      return rc;
   },
   geoLocationTimeoutErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationPermissionErrorMsg : 'No permission to locate current location. Please enable permission to do so!',
   geoLocationUnavailableMsg : 'To better serve you, please turn on your Location Services',
   geoLocationUseLastPositionMsg : 'We are not able to locate your current location. Using your last known GPS Coordinates ...',
   getMerchantInfoMsg : 'Retrieving Merchant Information ...',
   getVenueInfoMsg : 'Retrieving Venue Information ...',
   prepareToSendMerchantDeviceMsg : 'Confirm before tapping against the KICKBAK Card Reader ...',
   mobilePhoneInputMsg : 'Enter Mobile Number',
   lookingForMerchantDeviceMsg : function()//Send
   {
      return 'Tap your Phone against the ' + Genesis.constants.addCRLF() + 'KICKBAK Card Reader';
   },
   detectMerchantDeviceMsg : function()//Recv
   {
      return 'Tap your Phone against the ' + Genesis.constants.addCRLF() + 'KICKBAK Card Reader';
   },
   // Merchant Device
   prepareToSendMobileDeviceMsg : 'Prepare to send data across to Mobile Device ...',
   lookingForMobileDeviceMsg : function()//Send
   {
      return 'Please Swipe TAG or' + Genesis.constants.addCRLF() + //
      'Tap Mobile Device';
   },
   detectMobileDeviceMsg : function()//Recv
   {
      return 'Please Swipe TAG or' + Genesis.constants.addCRLF() + //
      'Tap Mobile Device';
   },
   //
   //
   //
   missingVenueInfoMsg : function(errors)
   {
      var errorMsg = '';
      if (Ext.isString(errors))
      {
         errorMsg = Genesis.constants.addCRLF() + errors;
      }
      else if (Ext.isObject(errors))
      {
         errorMsg = Genesis.constants.addCRLF() + errors.statusText;
      }
      return ('Error loading Venue information.' + errorMsg);
   },
   showToServerMsg : function()
   {
      return ('Confirm before tapping against the KICKBAK Card Reader');
   },
   showToLoyaltyCardMsg : function()
   {
      return ('Show your KICKBAK Card or use your Mobile Number');
   },
   errProcQRCodeMsg : 'Error Processing Authentication Code',
   cameraAccessMsg : 'Accessing your Camera Phone ...',
   updatingServerMsg : 'Updating Server ...',
   referredByFriendsMsg : function(merchatName)
   {
      return 'Have you been referred ' + Genesis.constants.addCRLF() + //
      'by a friend to visit' + Genesis.constants.addCRLF() + //
      merchatName + '?';
   },
   recvReferralb4VisitMsg : function(name)
   {
      return 'Claim your reward points by becoming a customer at ' + Genesis.constants.addCRLF() + name + '!';
   },
   showScreenTimeoutExpireMsg : function(duration)
   {
      return duration + ' are up! Press OK to confirm.';
   },
   showScreenTimeoutMsg : function(duration)
   {
      return 'You have ' + duration + ' to show this screen to a employee before it disappears!';
   },
   uploadFbMsg : 'Uploading to Facebook ...',
   uploadServerMsg : 'Uploading to server ...',
   inheritableStatics :
   {
      animationMode :
      {
         'cover' :
         {
            type : 'cover',
            direction : 'left',
            duration : 400
         },
         'coverUp' :
         {
            type : 'cover',
            direction : 'up',
            duration : 400
         },
         'slide' :
         {
            type : 'slide',
            direction : 'left',
            duration : 400
         },
         'slideUp' :
         {
            type : 'slide',
            direction : 'up',
            duration : 400
         },
         'pop' :
         {
            type : 'pop',
            duration : 400
         },
         'flip' :
         {
            type : 'flip',
            duration : 400
         },
         'fade' :
         {
            type : 'fade',
            duration : 400

         }
      },
      playSoundFile : function(sound_file, successCallback, failCallback)
      {
         if (Genesis.fn.isNative())
         {
            switch (sound_file['type'])
            {
               case 'FX' :
               case 'Audio' :
                  LowLatencyAudio.play(sound_file['name'], successCallback || Ext.emptyFn, failCallback || Ext.emptyFn);
                  break;
               case 'Media' :
                  sound_file['successCallback'] = successCallback || Ext.emptyFn;
                  sound_file['name'].play();
                  break;
            }
         }
         else
         {
            if (merchantMode)
            {
               sound_file['successCallback'] = successCallback || Ext.emptyFn;
               Ext.get(sound_file['name']).dom.play();
            }
            else if (successCallback)
            {
               successCallback();
            }
         }
      },
      stopSoundFile : function(sound_file)
      {
         if (Genesis.fn.isNative())
         {
            switch (sound_file['type'])
            {
               case 'FX' :
               case 'Audio' :
                  LowLatencyAudio.stop(sound_file['name']);
                  break;
               case 'Media' :
                  sound_file['name'].stop();
                  break;
            }
         }
         else
         {
            /*
             var sound = Ext.get(sound_file['name']).dom;
             sound.pause();
             sound.currentTime = 0;
             */
         }
      },
      encryptFromParams : function(params, mode)
      {
         GibberishAES.size(256);
         var encrypted = null, venueId = Genesis.fn.getPrivKey('venueId'), key = null;
         if ((venueId > 0) || (venueId < 0))
         {
            try
            {
               switch (mode)
               {
                  case 'prize' :
                  {
                     key = Genesis.fn.getPrivKey('p' + venueId);
                  }
                  case 'reward' :
                  {
                     key = Genesis.fn.getPrivKey('r' + venueId);
                     break;
                  }
                  default :
                     key = Genesis.fn.getPrivKey('r' + venueId);
                     break;
               }
               encrypted = (venueId > 0) ? venueId + '$' : '';
               encrypted += GibberishAES.enc(Ext.encode(params), key);
            }
            catch (e)
            {
            }
            /*
             console.debug("Used key[" + key + "]");
             console.debug('\n' + //
             "Encrypted Code Length: " + encrypted.length + '\n' + //
             'Encrypted Code [' + encrypted + ']' + '\n');
             */
         }

         return encrypted;
      },
      genQRCodeFromParams : function(params, mode, encryptOnly)
      {
         var me = this;
         var encrypted;
         //
         // Show QRCode
         //
         // GibberishAES.enc(string, password)
         // Defaults to 256 bit encryption
         GibberishAES.size(256);
         var venueId = Genesis.fn.getPrivKey('venueId');
         var key = "";
         switch (mode)
         {
            case 'prize' :
            {
               key = Genesis.fn.getPrivKey('p' + venueId);
               break;
            }
            case 'reward' :
            {
               key = Genesis.fn.getPrivKey('r' + venueId);
               break;
            }
            default :
               key = Genesis.fn.getPrivKey('r' + venueId);
               break;
         }
         var date;
         if (venueId > 0)
         {
            try
            {
               date = new Date().addHours(3);
               encrypted = GibberishAES.enc(Ext.encode(Ext.applyIf(
               {
                  "expiry_ts" : date.getTime()
               }, params)), key);
               encrypted = venueId + '$' + encrypted;

               console.debug("Used key[" + key + "]");
               console.debug('\n' + //
               "Encrypted Code Length: " + encrypted.length + '\n' + //
               'Encrypted Code [' + encrypted + ']' + '\n' + //
               'Expiry Date: [' + date + ']');
            }
            catch (e)
            {
            }

            return (encryptOnly) ? [encrypted, 0, 0] : me.genQRCode(encrypted);
         }
         Ext.device.Notification.show(
         {
            title : 'Missing License Key!',
            message : me.prototype.missingLicenseKeyMsg,
            buttons : ['Proceed', 'Cancel'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'proceed')
               {
                  _application.getController('Settings').fireEvent('upgradeDevice');
               }
            }
         });

         return (encryptOnly) ? ['', 0, 0] : '';
      },
      genQRCode : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 3;
         QRCodeVersion = QRCodeVersion || 10;

         // size of box drawn on canvas
         var padding = 0;
         // 1-40 see http://www.denso-wave.com/qrcode/qrgene2-e.html

         // QR Code Error Correction Capability
         // Higher levels improves error correction capability while decreasing the amount of data QR Code size.
         // QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
         // eg. L can survive approx 5% damage...etc.
         var qr = QRCode(QRCodeVersion, 'L');
         qr.addData(text);
         qr.make();
         var base64 = qr.createBase64(dotsize, padding);
         console.debug("QR Code Minimum Size = [" + base64[1] + "x" + base64[1] + "]");

         return [base64[0], base64[1], base64[1]];
      },
      genQRCodeInlineImg : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 4;
         QRCodeVersion = QRCodeVersion || 8;
         var padding = 0;
         var qr = QRCode(QRCodeVersion, 'L');

         qr.addData(text);
         qr.make();

         var html = qr.createTableTag(dotsize, padding);

         return html;
      }
   },
   init : function()
   {
      this.callParent(arguments);

      this.on(
      {
         scope : this,
         'scannedqrcode' : this.onScannedQRcode,
         'locationupdate' : this.onLocationUpdate,
         'openpage' : this.onOpenPage,
         'updatemetadata' : this.updateMetaDataInfo,
         'triggerCallbacksChain' : this.triggerCallbacksChain
      });

      /*
      this.callBackStack =
      {
      callbacks : ['signupPromotionHandler', 'earnPtsHandler', 'referralHandler', 'scanAndWinHandler'],
      arguments : [],
      startIndex : 0
      };
      */
      //
      // Forward all locally generated page navigation events to viewport
      //
      //this.setAnimationMode(this.self.animationMode['cover']);

      //
      // Prevent Recursion
      //
      var viewport = this.getViewPortCntlr();
      if (viewport != this)
      {
         viewport.relayEvents(this, ['pushview', 'popview', 'silentpopview', 'resetview']);
         viewport.on('animationCompleted', this.onAnimationCompleted, this);
      }
   },
   getViewPortCntlr : function()
   {
      return this.getApplication().getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
   },
   getViewport : function()
   {
      return this.getViewPortCntlr().getView();
   },
   getMainPage : Ext.emptyFn,
   openMainPage : Ext.emptyFn,
   openPage : Ext.emptyFn,
   goToMain : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      if (viewport.setLoggedIn)
      {
         viewport.setLoggedIn(true);
      }
      me.resetView();
      me.redirectTo('main');
      console.log("LoggedIn, Going to Main Page ...");
   },
   goToMerchantMain : function(noprompt)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var info = viewport.getCheckinInfo();
      var _backToMain = function()
      {
         me.resetView();
         if (info.venue)
         {
            me.redirectTo('venue/' + info.venue.getId() + '/' + info.customer.getId() + '/1');
         }
         else
         {
            me.redirectTo('checkin');
         }
      };
      if (info.venue && !noprompt)
      {
         Ext.device.Notification.show(
         {
            title : info.venue.get('name').trunc(16),
            message : me.backToMerchantPageMsg(info.venue),
            buttons : ['OK', 'Cancel'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'ok')
               {
                  _backToMain();
               }
            }
         });
      }
      else
      {
         _backToMain();
      }
   },
   isOpenAllowed : function()
   {
      return "Cannot Open Folder";
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onBeforeNfc : function(nfcEvent)
   {
      var me = this, result = null, id = null;

      console.log("NDEF Message received");
      try
      {
         var tag = nfcEvent.tag, records = tag.ndefMessage || [], id = nfc.bytesToHexString(tag.id);
         var langCodeLength = records[0].payload[0], text = records[0].payload.slice((1 + langCodeLength), records[0].payload.length);

         console.debug("NFC ndefID[" + id + "] ndefMessage[" + nfc.bytesToString(text) + "]")
         result =
         {
            result : Ext.decode(nfc.bytesToString(text)),
            id : id
         }
         //
         // Decrypt Message
         //
         me.printNfcTag(nfcEvent);
      }
      catch (e)
      {
         console.log("Exception Thrown while processing NFC Tag[" + e + "]");
      }

      return result;
   },
   onNfc : Ext.emptyFn,
   onScannedQRcode : Ext.emptyFn,
   onLocationUpdate : Ext.emptyFn,
   onOpenPage : function(feature, subFeature, cb, eOpts, eInfo)
   {
      if ((appName == 'GetKickBak') && //
      //((Genesis.fn.isNative() && !Ext.device.Connection.isOnline()) || (!navigator.onLine)) && //
      !navigator.onLine && //
      (feature != 'MainPage'))
      {
         var viewport = me.getViewPortCntlr();
         if (!offlineDialogShown)
         {
            Ext.device.Notification.show(
            {
               title : 'Network Error',
               message : me.lostNetworkConnectionMsg,
               buttons : ['Dismiss'],
               callback : function()
               {
                  offlineDialogShown = false;
               }
            });
            offlineDialogShown = true;
         }
         console.debug("Network Error - " + feature + "," + subFeature);
         me.resetView();
         me.redirectTo(viewport.getLoggedIn() ? 'checkin' : 'login');
         return;
      }

      var app = this.getApplication();
      controller = app.getController(feature);
      if (!subFeature)
      {
         controller.openMainPage();
      }
      else
      {
         controller.openPage(subFeature, cb);
      }
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   triggerCallbacksChain : function()
   {
      var me = this;
      var startIndex = me.callBackStack['startIndex'];
      var length = me.callBackStack['callbacks'].length;
      for (var i = startIndex; i < length; i++)
      {
         me.callBackStack['startIndex']++;
         if (me[me.callBackStack['callbacks'][i]].apply(me, me.callBackStack['arguments']))
         {
            //
            // Break the chain and contine Out-of-Scope
            //
            break;
         }
      }
      if (i >= length)
      {
         console.debug("Clear Callback Chain[" + i + "].");
         //
         // End of Callback Chain
         //
         me.callBackStack['startIndex'] = 0;
         me.callBackStack['arguments'] = [];
      }
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this, viewport = me.getViewPortCntlr();
      viewport.updateMetaDataInfo(metaData);
   },
   checkReferralPrompt : function(cbOnSuccess, cbOnFail)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var customer = viewport.getCustomer();
      var merchant = viewport.getVenue().getMerchant();
      var merchantId = merchant.getId();
      var success = cbOnSuccess || Ext.emptyFn;
      var fail = cbOnFail || Ext.emptyFn;

      if (Customer.isValid(customer.getId())// Valid Customer
      && (customer.get('visits') < 2)// Not a frequent visitor yet
      && (!Genesis.db.getReferralDBAttrib("m" + merchantId))// Haven't been referred by a friend yet
      && (_build != 'MobileWebClient'))// Not a MobileWeb App
      {
         console.debug("Customer Visit Count[" + customer.get('visits') + "]")
         Ext.device.Notification.show(
         {
            title : 'Referral Challenge',
            message : me.referredByFriendsMsg(merchant.get('name')),
            buttons : ['Yes', 'No'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'yes')
               {
                  Ext.defer(function()
                  {
                     me.fireEvent('openpage', 'mobileClient.Challenges', 'referrals', success);
                  }, 1, me);
               }
               else
               {
                  fail();
               }
            }
         });
      }
      else
      {
         fail();
      }
   },
   /*
    refreshBadges : function()
    {
    var bstore = Ext.StoreMgr.get('BadgeStore');

    Badges['setGetBadgesUrl']();
    bstore.load(
    {
    jsonData :
    {
    },
    params :
    {
    },
    callback : function(records, operation)
    {
    if (operation.wasSuccessful())
    {
    me.persistSyncStores('BadgeStore');
    }
    }
    });
    },
    */
   earnRedeemPopup : function(callback)
   {
      var me = this;

      if (!me._earnRedeemPopup)
      {
         me._earnRedeemPopup = Ext.create('Ext.Sheet',
         {
            bottom : 0,
            left : 0,
            top : 0,
            right : 0,
            padding : '1.0',
            hideOnMaskTap : false,
            defaultUnit : 'em',
            cls : 'x-mask transmit-mask',
            layout :
            {
               type : 'vbox',
               pack : 'middle'
            },
            defaults :
            {
               xtype : 'container',
               defaultUnit : 'em'
            },
            items : [
            {
               width : '100%',
               flex : 1,
               style : 'text-align:center;display:inline-table;color:white;font-size:1.1em;',
               html : Genesis.fb.fbConnectRequestMsg
            },
            {
               docked : 'bottom',
               defaults :
               {
                  xtype : 'button',
                  defaultUnit : 'em',
                  scope : me
               },
               padding : '0 1.0 1.0 1.0',
               items : [
               {
                  margin : '0 0 0.5 0',
                  text : 'Proceed',
                  ui : 'action',
                  handler : function()
                  {
                     me._earnRedeemPopup.hide();
                     callback();
                  }
               },
               {
                  margin : '0.5 0 0 0',
                  text : 'Cancel',
                  //ui : 'decline',
                  handler : function()
                  {
                     me._earnRedeemPopup.hide();
                  }
               }]
            }]
         });
         Ext.Viewport.add(me._earnRedeemPopup);
      }
      me._earnRedeemPopup.show();
   },
   gravityThreshold : 4.0,
   accelerometerHandler : function(vol, callback)
   {
      var me = this;
      //return navigator.accelerometer.watchAcceleration(function(accel)
      navigator.accelerometer.getCurrentAcceleration(function(accel)
      {
         //
         // Mobile device lay relatively flat and stationary ...
         //
         //console.debug('Accelerometer x=' + accel.x + ' accel.y=' + y);
         if ((accel.z >= (9.81 - me.gravityThreshold)) && (accel.z <= (9.81 + me.gravityThreshold)))
         {
            if (vol != Genesis.constants.s_vol)
            {
               window.plugins.proximityID.setVolume(Genesis.constants.s_vol);
               console.debug('Accelerometer new_vol=' + Genesis.constants.s_vol);
               callback(Genesis.constants.s_vol);
            }
         }
         else
         {
            //
            // Restore to system default
            //
            if (vol != -1)
            {
               window.plugins.proximityID.setVolume(-1);
               console.debug('Accelerometer new_vol=-1');
               callback(-1);
            }
         }
      },
      {
         frequency : 250
      });
   },
   getLocalID : function(success, fail, retryFn)
   {
      var me = this, c = Genesis.constants, viewport = me.getViewPortCntlr();

      me.scanTaskWait = false;
      me.scanTask = null;

      //create the delayed task instance with our callback
      me.scanTask = setInterval(function()
      {
         if (!me.scanTaskWait)
         {
            me.scanTaskWait = true;
            clearInterval(me.scanTask);
            me.scanTask = null;
            me.self.playSoundFile(viewport.sound_files['nfcError']);
            window.plugins.proximityID.stop();
            Ext.device.Notification.show(
            {
               title : 'Local Identity',
               message : me.noPeerDiscoveredMsg,
               buttons : ['Try Again', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() != 'try again')
                  {
                     fail();
                  }
                  else
                  {
                     Ext.defer(retryFn, 1);
                  }
               }
            });
         }
      }, c.proximityRxTimeout);

      window.plugins.proximityID.scan(function(result)
      {
         clearInterval(me.scanTask);
         me.scanTask = null;
         window.plugins.proximityID.stop();
         var identifiers = Genesis.fn.processRecvLocalID(result);
         if (identifiers['message'])
         {
            me.self.playSoundFile(viewport.sound_files['nfcEnd']);
            success(identifiers);
         }
      }, function(error)
      {
         clearInterval(me.scanTask);
         me.scanTask = null;
         window.plugins.proximityID.stop();
         Ext.device.Notification.show(
         {
            title : 'Local Identity',
            message : me.noPeerIdFoundMsg(Ext.encode(error)),
            buttons : ['Dismiss']
         });
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         console.debug('Error Code[' + Ext.encode(error) + ']');
         fail();
      }, c.numSamples, c.conseqMissThreshold, c.magThreshold, c.sigOverlapRatio);

      return me.scanTask;
   },
   broadcastLocalID : function(success, fail)
   {
      var me = this, c = Genesis.constants, cancel = function()
      {
         Ext.Ajax.abort();
         if (me.send_vol != -1)
         {
            window.plugins.proximityID.setVolume(-1);
         }
         window.plugins.proximityID.stop();
      };

      me.send_vol = -1;
      success = success || Ext.emptyFn;
      fail = fail || Ext.emptyFn;

      window.plugins.proximityID.send(function(result)
      {
         console.debug("ProximityID : Broacasting Local Identity ...");
         success(Genesis.fn.processSendLocalID(result, cancel));
      }, function(error)
      {
         console.debug('Error Code[' + Ext.encode(error) + ']');
         cancel();
         fail();
      });
   },
   // --------------------------------------------------------------------------
   // Persistent Stores
   // --------------------------------------------------------------------------
   persistStore : function(storeName)
   {
      var i, stores =
      {
         'CustomerStore' : [false, Ext.StoreMgr.get('Persistent' + 'CustomerStore'), 'CustomerStore', 'Customer' + (Genesis.fn.isNative() ? 'JSON' : 'DB')],
         'LicenseStore' : [false, Ext.StoreMgr.get('Persistent' + 'LicenseStore'), 'LicenseStore', 'frontend.LicenseKey' + (Genesis.fn.isNative() ? 'JSON' : 'DB')],
         'ReceiptStore' : [true, Ext.StoreMgr.get('ReceiptStore'), 'ReceiptStore', 'frontend.Receipt']
         //'BadgeStore' : [false, Ext.StoreMgr.get('Persistent' + 'BadgeStore'), 'BadgeStore', 'BadgeJSON']
         //,'PrizeStore' : [false, Ext.StoreMgr.get('Persistent' + 'PrizeStore'), 'PrizeStore',
         // 'CustomerRewardJSON']
      };
      console.debug("Looking for " + storeName);
      for (i in stores)
      {
         if (!stores[i][0] && !stores[i][1])
         {
            Ext.regStore('Persistent' + stores[i][2],
            {
               model : 'Genesis.model.' + stores[i][3],
               syncRemovedRecords : true,
               autoLoad : false
            });
            stores[i][1] = Ext.StoreMgr.get('Persistent' + stores[i][2]);
            //console.debug("Created [" + 'Persistent' + stores[i][1] + "]");
         }
         else if (stores[i][1] && (stores[i][1].getStoreId() == ('Persistent' + storeName)))
         {
            //console.debug("Store[" + stores[i][0].getStoreId() + "] found!");
            return stores[i][1];
         }
      }

      return stores[storeName][1];
   },
   persistLoadStores : function(callback)
   {
      var me = this, _store, i, x, j, flag = 0x110000, viewport = me.getViewPortCntlr(), stores = [//
      [this.persistStore('CustomerStore'), 'CustomerStore', 0x000001], //
      [this.persistStore('LicenseStore'), 'LicenseStore', 0x000100], //
      [this.persistStore('ReceiptStore'), 'ReceiptStore', 0x001000] //
      //[this.persistStore('BadgeStore'), 'BadgeStore', 0x010000]];
      //,[this.persistStore('PrizeStore'), 'PrizeStore', 0x100000]];
      ];

      callback = callback || Ext.emptyFn;

      for ( i = 0; i < stores.length; i++)
      {
         _store = stores[i][0];
         if (!_store)
         {
            flag |= stores[i][2];
            console.debug("Cannot find Store[" + stores[i][1] + "] to be restored!");
            continue;
         }
         try
         {
            //var ids = stores[i][0].getProxy().getIds();
            //console.debug("Ids found are [" + ids + "]");
            _store.load(
            {
               callback : Ext.bind(function(results, operation, success, _flag, store)
               {
                  var me = this, items = [];

                  flag |= _flag;
                  //
                  // CustomerStore
                  //
                  if (operation.wasSuccessful())
                  {
                     store.removeAll();
                     for ( x = 0; x < results.length; x++)
                     {
                        items.push((Genesis.fn.isNative()) ? results[x].get('json') : results[x].getData(true));
                     }
                     store.setData(items);
                     console.debug("persistLoadStores  --- Restored " + results.length + " records to " + store.getStoreId());
                  }
                  else
                  {
                     console.debug("Error Restoring " + store.getStoreId() + " ...");
                  }

                  if (Genesis.fn.isNative() && (store.getStoreId() == 'CustomerStore'))
                  {
                     if (results.length > 0)
                     {
                        var createStatement = "CREATE TABLE IF NOT EXISTS Customer (id INTEGER PRIMARY KEY AUTOINCREMENT, json TEXT)";
                        var selectAllStatement = "SELECT * FROM Customer";
                        var db = Genesis.db.openDatabase();
                        try
                        {
                           db.transaction(function(tx)
                           {
                              //
                              // Create Table
                              //
                              tx.executeSql(createStatement, [], function()
                              {
                                 console.debug("Successfully created/retrieved KickBak-Customers Table");
                              }, function(tx, error)
                              {
                                 console.debug("Failed to create KickBak-Customers Table : " + error.message);
                              });
                              //
                              // Retrieve Customers
                              //
                              tx.executeSql(selectAllStatement, [], function(tx, result)
                              {
                                 var items = [];
                                 var dataset = result.rows;
                                 for ( j = 0, item = null; j < dataset.length; j++)
                                 {
                                    item = dataset.item(j);
                                    //console.debug("JSON - " + item['json'])
                                    items.push(Ext.decode(item['json']));
                                 }
                                 Ext.StoreMgr.get('CustomerStore').add(items);
                                 if ((flag |= 0x0010) == 0x11111)
                                 {
                                    callback();
                                 }
                                 console.debug("persistLoadStores  --- Restored " + items.length + " records from SQL Database, flag=" + flag);
                              }, function(tx, error)
                              {
                                 console.debug("No Customer Table found in SQL Database : " + error.message);
                              });
                           });
                        }
                        catch(e)
                        {
                        }
                     }
                     else
                     {
                        flag |= 0x000010;
                     }
                  }

                  if (flag == 0x111111)
                  {
                     callback();
                  }
               }, me, [stores[i][2], Ext.StoreMgr.get(stores[i][1])], true)
            });
         }
         catch(e)
         {
            console.debug("Stack Trace - [" + e.stack + "]");

            Ext.device.Notification.show(
            {
               title : 'Account Profile',
               message : me.errorLoadingAccountProfileMsg,
               buttons : ['Dismiss'],
               callback : function()
               {
                  viewport.resetView();
                  viewport.redirectTo('login');
               }
            });
         }
      }
   },
   persistSyncStores : function(storeName, cleanOnly)
   {
      //var updateStatement = "UPDATE Customer SET json = ? WHERE id = ?";
      //var deleteStatement = "DELETE FROM Customer WHERE id=?";
      var store, dropStatement = "DROP TABLE Customer";

      var i, x, items, json = [], stores = [//
      [this.persistStore('CustomerStore'), 'CustomerStore', 'Customer' + (Genesis.fn.isNative() ? 'JSON' : 'DB')], //
      [this.persistStore('LicenseStore'), 'LicenseStore', 'frontend.LicenseKey' + (Genesis.fn.isNative() ? 'JSON' : 'DB')], //
      [this.persistStore('ReceiptStore'), 'ReceiptStore', 'frontend.Receipt'] //
      //[this.persistStore('BadgeStore'), 'BadgeStore']];
      //, [this.persistStore('PrizeStore'), 'PrizeStore']];
      ];
      //console.debug('persistSyncStores called storeName=[' + storeName + ']');

      //
      // Other Persistent Table
      //
      for ( i = 0; i < stores.length; i++)
      {
         store = stores[i][0];
         if (!store)
         {
            console.debug("Cannot find Store[" + stores[i][1] + "] to be restored!");
            continue;
         }

         //
         // Customer Store
         //
         if ((!storeName || (storeName == stores[i][1])))
         {
            if (Genesis.fn.isNative() && (i == 0))
            {
               var createStatement = "CREATE TABLE IF NOT EXISTS Customer (id INTEGER PRIMARY KEY AUTOINCREMENT, json TEXT)";
               var insertStatement = "INSERT INTO Customer (json) VALUES (?)";
               var db = Genesis.db.openDatabase();
               try
               {
                  var cstore = Ext.StoreMgr.get('CustomerStore');
                  db.transaction(function(tx)
                  {
                     //
                     // Drop Table
                     //
                     tx.executeSql(dropStatement, [], function(tx, result)
                     {
                        console.debug("Successfully drop KickBak-Customers Table");
                     }, function(tx, error)
                     {
                        console.debug("Failed to drop KickBak-Customers Table : " + error.message);
                     });
                     //
                     // Create Table
                     //
                     tx.executeSql(createStatement, [], function(tx, result)
                     {
                        console.debug("Successfully created/retrieved KickBak-Customers Table");
                     }, function(tx, error)
                     {
                        console.debug("Failed to create KickBak-Customers Table : " + error.message);
                     });

                     //
                     // Insert into Table
                     //
                     if (!cleanOnly)
                     {
                        items = cstore.getRange();
                        for ( x = 0; x < items.length; x++)
                        {
                           item = items[x];
                           //console.debug("Inserting Customer(" + item.getId() + ") to Database");
                           tx.executeSql(insertStatement, [Ext.encode(item.getData(true))], function()
                           {
                              //console.debug("Inserted Customer(" + item.getId() + ") to Database");
                           }, function(tx, error)
                           {
                              console.debug("Failed to insert Customer(" + item.getId() + ") to Database : " + error.message);
                           });
                        }
                        console.debug("persistSyncStores  --- Inserted " + items.length + " records in Database ...");
                     }
                  });
               }
               catch(e)
               {
               }
               store.removeAll();
               store.getProxy().clear();
               store.sync();
            }
            else
            {
               store.removeAll();
               if (Genesis.fn.isNative())
               {
                  store.getProxy().clear();
               }
               if (!cleanOnly)
               {
                  items = Ext.StoreMgr.get(stores[i][1]).getRange();
                  for ( x = 0; x < items.length; x++)
                  {
                     var model = Ext.create('Genesis.model.' + stores[i][2], (Genesis.fn.isNative()) ?
                     {
                        json : items[x].getData(true)
                     } : items[x].getData(true));

                     model.phantom = true;
                     json.push(model);
                  }
                  store.add(json);
                  console.debug("persistSyncStores  --- Found " + items.length + " records in [" + stores[i][1] + "] ...");
               }
               store.sync();
            }

            //
            // We're done!
            //
            if (storeName == stores[i][1])
            {
               break;
            }
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   refreshPage : function(page)
   {
      var me = this, vport = me.getViewport(), controller = vport.getEventDispatcher().controller, anim = new Ext.fx.layout.Card(me.self.animationMode['fade']);

      anim.on('animationend', function()
      {
         console.debug("Animation Complete");
         anim.destroy();
      }, me);

      //if (!controller.isPausing)
      {
         console.debug("Reloading Current Page ...");

         // Delete current page and refresh
         page.removeAll(true);
         vport.animateActiveItem(page, anim);
         anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
         vport.doSetActiveItem(page, null);
      }
   },
   resetView : function(view)
   {
      this.fireEvent('resetview');
   },
   pushView : function(view)
   {
      this.fireEvent('pushview', view, this.getAnimationMode());
   },
   silentPopView : function(num)
   {
      this.fireEvent('silentpopview', num);
   },
   popView : function()
   {
      this.fireEvent('popview');
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   geoRetryAttempts : 3,
   getGeoLocation : function(iter)
   {
      var me = this, i = iter || 0, viewport = me.getViewPortCntlr(), position = viewport.getLastPosition();
      var options =
      {
         autoUpdate : false,
         maximumAge : 60 * 1000,
         timeout : 2 * 1000,
         allowHighAccuracy : true,
         enableHighAccuracy : true
      }

      console.debug('Getting GeoLocation ...');
      /*
       if (!Genesis.fn.isNative())
       {
       me.fireEvent('locationupdate',
       {
       coords :
       {
       getLatitude : function()
       {
       return "-50.000000";
       },
       getLongitude : function()
       {
       return '50.000000';
       }
       }
       });
       return;
       }
       */
      var successCallback = function(geo, eOpts)
      {
         if (!geo)
         {
            console.debug("No GeoLocation found!");
            return;
         }
         var position =
         {
            coords : geo
         }
         console.debug('\n' + 'Latitude: ' + geo.getLatitude() + '\n' + 'Longitude: ' + geo.getLongitude() + '\n' +
         //
         'Altitude: ' + geo.getAltitude() + '\n' + 'Accuracy: ' + geo.getAccuracy() + '\n' +
         //
         'Altitude Accuracy: ' + geo.getAltitudeAccuracy() + '\n' + 'Heading: ' + geo.getHeading() + '\n' +
         //
         'Speed: ' + geo.getSpeed() + '\n' + 'Timestamp: ' + new Date(geo.getTimestamp()) + '\n');

         viewport.setLastPosition(position);
         me.fireEvent('locationupdate', position);
      }
      var failCallback = function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
      {
         console.debug('GeoLocation Error[' + message + ']');
         if (bTimeout)
         {
            console.debug("TIMEOUT");
            if (!position)
            {
               Ext.device.Notification.show(
               {
                  title : 'Timeout Error',
                  message : me.geoLocationTimeoutErrorMsg,
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     me.fireEvent('locationupdate', position);
                  }
               });
            }
            else
            {
               me.fireEvent('locationupdate', position);
            }
         }
         else if (bLocationUnavailable)
         {
            if (i < me.geoRetryAttempts)
            {
               console.debug("Retry #" + i);
               Ext.defer(me.getGeoLocation, 0.25 * 1000, me, [++i]);
            }
            else
            {
               console.debug("POSITION_UNAVAILABLE");
               if (!position)
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Location Services',
                     message : me.geoLocationUnavailableMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        me.fireEvent('locationupdate', position);
                     }
                  });
               }
               else
               {
                  me.fireEvent('locationupdate', position);
               }
            }
         }
         else
         //if (bPermissionDenied)
         {
            console.debug("PERMISSION_DENIED");
            viewport.setLastPosition(null);
            me.fireEvent('locationupdate', null);
         }
      }
      if (!me.geoLocation)
      {
         me.geoLocation = Ext.create('Ext.util.Geolocation', Ext.applyIf(
         {
            listeners :
            {
               locationupdate : successCallback,
               locationerror : function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
               {
                  if (bTimeout && (i < me.geoRetryAttempts))
                  {
                     i = me.geoRetryAttemptsme;
                     me.getGeoLocation(i);
                  }
                  else
                  {
                     failCallback(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message);
                  }
               }
            }
         }, options));
      }
      me.geoLocation.updateLocation(null, null, (i >= me.geoRetryAttempts) ? Ext.applyIf(
      {
         allowHighAccuracy : false,
         enableHighAccuracy : false
      }, options) : options);
   },
   scanQRCode : function()
   {
      var me = this;
      var callback = function(r)
      {
         var qrcode;
         Ext.Viewport.setMasked(null);
         if (Genesis.fn.isNative())
         {
            switch(window.plugins.qrCodeReader.scanType)
            {
               case 'RL' :
               {
                  qrcode = (r.response == undefined) ? "" : (r.response || "");
                  console.debug("QR Code RL  = " + qrcode);
                  break;
               }
               case 'Nigma' :
               {
                  qrcode = (r.response == undefined) ? "" : (r.response || "");
                  if (!qrcode)
                  {
                     console.debug("QR Code Nigma = Empty");
                  }
                  else
                  {
                     console.debug("QR Code Nigma = " + ((qrcode.responseCode) ? qrcode.responseCode : "NONE") + " Sent = " + qrcode.bytesSent + " bytes");
                  }
                  if (qrcode && qrcode.responseCode)
                  {
                     qrcode = qrcode.responseCode;
                  }
                  break;
               }
               case 'Default' :
               {
                  qrcode = r;
                  if (!qrcode || qrcode.format != 'QR_CODE')
                  {
                     qrcode = null;
                     console.debug("QR Code Default = Unsupported Code");
                     //
                     // Simulator, we must pump in random values
                     //
                     if (device.platform.match(/simulator/i))
                     {
                        qrcode = Math.random().toFixed(16);
                     }
                  }
                  else if (qrcode.cancelled)
                  {
                     qrcode = Math.random().toFixed(16);
                  }
                  else
                  {
                     qrcode = qrcode.text;
                  }
                  console.debug("QR Code Default = " + ((qrcode) ? qrcode : "NONE"));
                  break;
               }
            }
         }
         else
         {
            qrcode = r.response;
            console.debug("QR Code = " + qrcode);
         }

         Ext.device.Notification.beep();
         me.fireEvent('scannedqrcode', qrcode);
      }
      var fail = function(message)
      {
         Ext.Viewport.setMasked(null);
         console.debug('Failed because: ' + message);
         Ext.device.Notification.beep();
         me.fireEvent('scannedqrcode', null);
      }

      console.debug("Scanning QR Code ...")
      if (!Genesis.fn.isNative())
      {
         //
         // pick the first one on the Neaby Venue in the store
         //
         var venueId = "0";
         if (!merchantMode)
         {
            var venue = me.getViewPortCntlr().getVenue() || Ext.StoreMgr.get('CheckinExploreStore').first() || null;
            venueId = venue ? venue.getId() : "0";
         }
         callback(
         {
            response : venueId
         });
      }
      else
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.loadingScannerMsg
         });

         window.plugins.qrCodeReader.getCode(callback, fail);
      }
   },
   tnfToString : function(tnf)
   {
      var value = tnf;

      switch (tnf)
      {
         case ndef.TNF_EMPTY:
            value = "Empty";
            break;
         case ndef.TNF_WELL_KNOWN:
            value = "Well Known";
            break;
         case ndef.TNF_MIME_MEDIA:
            value = "Mime Media";
            break;
         case ndef.TNF_ABSOLUTE_URI:
            value = "Absolute URI";
            break;
         case ndef.TNF_EXTERNAL_TYPE:
            value = "External";
            break;
         case ndef.TNF_UNKNOWN:
            value = "Unknown";
            break;
         case ndef.TNF_UNCHANGED:
            value = "Unchanged";
            break;
         case ndef.TNF_RESERVED:
            value = "Reserved";
            break;
      }
      return value;
   },
   showProperty : function(name, value)
   {
      console.debug("Name[" + name + "] Value[" + value + "]");
   },
   printNfcTag : function(nfcEvent)
   {
      var me = this;
      function template(record)
      {
         var id = "", tnf = me.tnfToString(record.tnf), recordType = nfc.bytesToString(record.type), payload;

         if (record.id && (record.id.length > 0))
         {
            id = "Record Id: " + record.id + "\n";
         }

         switch(recordType)
         {
            case 'T' :
            {
               var langCodeLength = record.payload[0], text = record.payload.slice((1 + langCodeLength), record.payload.length);
               payload = nfc.bytesToString(text);
               break;
            }
            case 'U' :
            {
               var url = nfc.bytesToString(record.payload);
               payload = "URL[" + url + "]";
               break;
            }
            default:
               // attempt display as a string
               payload = nfc.bytesToString(record.payload);
               break;
         }

         return (id + "TNF: " + tnf + "\n" + "Record Type: " + recordType + "\n" + payload);
      }

      var tag = nfcEvent.tag, records = tag.ndefMessage || [];
      console.debug("Scanned an NDEF tag with " + records.length + " record" + ((records.length === 1) ? "" : "s"));

      // Display Tag Info
      if (tag.id)
      {
         me.showProperty("Id", nfc.bytesToHexString(tag.id));
      }
      me.showProperty("Tag Type", tag.type);
      me.showProperty("Max Size", tag.maxSize + " bytes");
      me.showProperty("Is Writable", tag.isWritable);
      me.showProperty("Can Make Read Only", tag.canMakeReadOnly);

      // Display Record Info
      for (var i = 0; i < records.length; i++)
      {
         console.debug(template(records[i]));
      }
   },
   // --------------------------------------------------------------------------
   // Common Social Media Handlers
   // --------------------------------------------------------------------------
   onFbActivate : function()
   {
      var me = this, fb = Genesis.fb;

      fb.on('connected', me.updateFBSignUpPopupCallback, me);
      fb.on('unauthorized', me.updateFBSignUpPopupCallback, me);
      fb.on('exception', me.updateFBSignUpPopupCallback, me);
   },
   onFbDeactivate : function()
   {
      var me = this, fb = Genesis.fb;

      fb.un('connected', me.updateFBSignUpPopupCallback, me);
      fb.un('unauthorized', me.updateFBSignUpPopupCallback, me);
      fb.un('exception', me.updateFBSignUpPopupCallback, me);
   },
   onToggleFB : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, fb = Genesis.fb, db = Genesis.db.getLocalDB();

      if (newValue == 1)
      {
         me.onFbActivate();
         fb.facebook_onLogin(db['enableTwitter']);
      }
      else if (db['enableFB'])
      {
         me.onFbDeactivate();
      }
   },
   onFacebookChange : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      if (me.initializing)
      {
         return;
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      me.fireEvent('toggleFB', toggle, slider, thumb, newValue, oldValue, eOpts);
   },
   onTwitterChange : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      if (me.initializing)
      {
         return;
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      me.fireEvent('toggleTwitter', toggle, slider, thumb, newValue, oldValue, eOpts);
   }
});
