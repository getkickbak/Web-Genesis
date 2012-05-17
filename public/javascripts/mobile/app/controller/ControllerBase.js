Ext.define('Genesis.controller.ControllerBase',
{
   extend : 'Ext.app.Controller',
   requires : ['Ext.data.Store', 'Ext.util.Geolocation'],
   statics :
   {
      playSoundFile : function(sound_file, successCallback, failCallback)
      {
         if(Genesis.constants.isNative())
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
            sound_file['successCallback'] = successCallback || Ext.emptyFn;
            Ext.get(sound_file['name']).dom.play();
         }
      },
      stopSoundFile : function(sound_file)
      {
         if(Genesis.constants.isNative())
         {
            LowLatencyAudio.stop(sound_file['name']);
         }
         else
         {
            var sound = Ext.get(sound_file['name']).dom;
            sound.pause();
            sound.currentTime = 0;
         }
      },
      genQRCodeFromParams : function(params, encryptOnly)
      {
         var me = this;
         var encrypted;
         var seed = function()
         {
            return Math.random().toFixed(16);
         }
         //
         // Show QRCode
         //
         // GibberishAES.enc(string, password)
         // Defaults to 256 bit encryption
         GibberishAES.size(256);
         var keys = Genesis.constants.getPrivKey();
         for(key in keys)
         {
            try
            {
               encrypted = GibberishAES.enc(Ext.encode(Ext.applyIf(
               {
                  "expiry_ts" : new Date().addHours(3).getTime()
               }, params)), keys[key]);
            }
            catch (e)
            {
            }
            break;
         }
         console.log('\n' + //
         "Encrypted Code Length: " + encrypted.length + '\n' + //
         'Encrypted Code [' + encrypted + ']');

         return (encryptOnly) ? encrypted : me.genQRCode(encrypted);
      },
      genQRCode : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 2;
         QRCodeVersion = QRCodeVersion || 9;

         // size of box drawn on canvas
         var padding = 0;
         // (white area around your QRCode)
         var black = "rgb(0,0,0)";
         var white = "rgb(255,255,255)";
         // 1-40 see http://www.denso-wave.com/qrcode/qrgene2-e.html

         var canvas = document.createElement('canvas');
         var qrCanvasContext = canvas.getContext('2d');
         try
         {
            // QR Code Error Correction Capability
            // Higher levels improves error correction capability while decreasing the amount of data QR Code size.
            // QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
            // eg. L can survive approx 5% damage...etc.
            var qr = new QRCode(QRCodeVersion, QRErrorCorrectLevel.L);
            qr.addData(text);
            qr.make();
         }
         catch(err)
         {
            console.log("Error Code : " + err);
            Ext.device.Notification.show(
            {
               title : 'Code Generation Error',
               message : err
            });
            return null;
         }

         var qrsize = qr.getModuleCount();
         var height = (qrsize * dotsize) + padding;
         canvas.setAttribute('height', height);
         canvas.setAttribute('width', height);
         console.log("QR Code Size = [" + height + "x" + height + "]");
         var shiftForPadding = padding / 2;
         if(canvas.getContext)
         {
            for(var r = 0; r < qrsize; r++)
            {
               for(var c = 0; c < qrsize; c++)
               {
                  if(qr.isDark(r, c))
                     qrCanvasContext.fillStyle = black;
                  else
                     qrCanvasContext.fillStyle = white;
                  qrCanvasContext.fillRect((c * dotsize) + shiftForPadding, (r * dotsize) + shiftForPadding, dotsize, dotsize);
                  // x, y, w, h
               }
            }
         }
         return canvas.toDataURL("image/png");
      },
   },
   loadingScannerMsg : 'Loading Scanner ...',
   loadingMsg : 'Loading ...',
   noCodeScannedMsg : 'No QR Code Scanned!',
   geoLocationErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationTimeoutErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationPermissionErrorMsg : 'No permission to location current location. Please enable permission to do so!',
   missingVenueInfoMsg : 'Error loading Venue information.',
   showToServerMsg : 'Show this to your server before proceeding.',
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
   init : function()
   {
      this.callParent(arguments);
   },
   getViewPortCntlr : function()
   {
      return this.getApplication().getController('Viewport');
   },
   getViewport : function()
   {
      return this.getViewPortCntlr().getView();
   },
   updateRewards : function(metaData)
   {
      var me = this;
      //
      // Update Eligible Rewards
      //
      var erewards = metaData['eligible_rewards'];
      if(erewards)
      {
         console.debug("Total Eligible Rewards - " + erewards.length);
         var estore = Ext.StoreMgr.get('EligibleRewardsStore');
         estore.setData(erewards);
      }
      //
      // Update Customer Rewards (Redemptions)
      //
      var rewards = metaData['rewards'];
      if(rewards)
      {
         var viewport = this.getViewPortCntlr();
         var venueId = metaData['venue_id'] || viewport.getVenue().getId();
         console.debug("Total Redemption Rewards - " + rewards.length);
         var rstore = Ext.StoreMgr.get('RedemptionsStore');
         for(var i = 0; i < rewards.length; i++)
         {
            rewards[i]['venue_id'] = venueId;
         }
         rstore.setData(rewards);
      }

      //
      // Winners' Circle'
      //
      var prizesCount = metaData['winners_count'];
      if(prizesCount >= 0)
      {
         console.debug("Prizes won by customers at this merchant this month - [" + prizesCount + "]");
         var app = me.getApplication();
         var controller = app.getController('Merchants');
         app.dispatch(
         {
            action : 'onUpdateWinnersCount',
            args : [metaData],
            controller : controller,
            scope : controller
         });
      }
   },
   pushView : function(view)
   {
      var viewport = this.getViewport();
      var app = this.getApplication();
      var stack = viewport.stack;
      var lastView = (stack.length > 1) ? stack[stack.length - 2] : null;
      if(lastView && lastView == view)
      {
         this.popView();
      }
      else
      {
         viewport.push(view);
      }
   },
   popView : function(b, e, eOpts, eInfo)
   {
      var viewport = this.getViewport();
      var app = this.getApplication();

      viewport.pop();
   },
   getMainPage : Ext.emptyFn,
   openMainPage : Ext.emptyFn,
   openPage : Ext.emptyFn,
   goToMain : function()
   {
      console.log("LoggedIn, Going to Main Page ...");

      var me = this;
      var vport = me.getViewPortCntlr();
      vport.setLoggedIn(true);
      me.getViewport().reset();
      vport.onFeatureTap('MainPage', 'main');
   },
   isOpenAllowed : function()
   {
      return "Cannot Open Folder";
   },
   getGeoLocation : function(callback, i)
   {
      var me = this;
      i = i || 0;
      console.debug('Getting GeoLocation ...');
      if(!Genesis.constants.isNative())
      {
         callback(
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
      }
      else
      {
         console.debug('Connection type: [' + Ext.device.Connection.getType() + ']');
         //console.debug('Checking for Network Conncetivity for [' + location.origin + ']');
         if(!me.geoLocation)
         {
            me.geoLocation = Ext.create('Ext.util.Geolocation',
            {
               autoUpdate : false,
               frequency : 1,
               maximumAge : 30000,
               timeout : 50000,
               allowHighAccuracy : true,
               listeners :
               {
                  locationupdate : function(geo, eOpts)
                  {
                     if(!geo)
                     {
                        console.log("No GeoLocation found!");
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

                     callback(position);
                  },
                  locationerror : function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
                  {
                     console.debug('GeoLocation Error[' + message + ']');

                     if(bPermissionDenied)
                     {
                        console.debug("PERMISSION_DENIED");
                        Ext.device.Notification.show(
                        {
                           title : 'Permission Error',
                           message : me.geoLocationPermissionErrorMsg
                        });
                     }
                     else
                     if(bLocationUnavailable)
                     {
                        console.debug("POSITION_UNAVAILABLE");
                        if(++i <= 5)
                        {
                           Ext.Function.defer(me.getGeoLocation, 1 * 1000, me, [callback, i]);
                           console.debug("Retry getting current location(" + i + ") ...");
                        }
                        else
                        {
                           Ext.device.Notification.show(
                           {
                              title : 'Error',
                              message : me.geoLocationErrorMsg
                           });
                        }
                     }
                     else
                     if(bTimeout)
                     {
                        console.debug("TIMEOUT");
                        Ext.device.Notification.show(
                        {
                           title : 'Timeout Error',
                           message : me.geoLocationTimeoutErrorMsg
                        });
                     }
                  }
               }
            });
         }
         me.geoLocation.updateLocation();
      }
   },
   scanQRCode : function(config)
   {
      var me = this;
      var fail = function(message)
      {
         Ext.Viewport.setMasked(false);
         config.callback();
         console.debug('Failed because: ' + message);
      };
      var callback = function(r)
      {
         var qrcode;
         Ext.Viewport.setMasked(false);
         if(Genesis.constants.isNative())
         {
            switch(window.plugins.qrCodeReader.scanType)
            {
               case 'RL' :
               {
                  qrcode = (r.response == 'undefined') ? "" : (r.response || "");
                  console.debug("QR Code RL  = " + qrcode);
                  break;
               }
               case 'Nigma' :
               {
                  qrcode = (r.response == 'undefined') ? "" : (r.response || "");
                  if(!qrcode)
                  {
                     console.debug("QR Code Nigma = Empty");
                  }
                  else
                  {
                     console.debug("QR Code Nigma = " + ((qrcode.responseCode) ? qrcode.responseCode : "NONE") + " Sent = " + qrcode.bytesSent + " bytes");
                  }
                  if(qrcode && qrcode.responseCode)
                  {
                     qrcode = qrcode.responseCode;
                  }
                  break;
               }
               case 'Default' :
               {
                  qrcode = r;
                  if(!qrcode || qrcode.format != 'QR_CODE')
                  {
                     qrcode = null;
                     console.debug("QR Code Default = Unsupported Code");
                  }
                  if(qrcode.cancelled)
                  {
                     qrcode = Math.random().toFixed(16);
                  }
                  else
                  {
                     qrcode = qrcode.text;
                     console.debug("QR Code Default = " + ((qrcode) ? qrcode : "NONE"));
                  }
                  break;
               }
            }
         }
         else
         {
            qrcode = r.response;
            console.debug("QR Code = " + qrcode);
         }

         config.callback(qrcode);
      };

      console.debug("Scanning QR Code ...")
      if(!Genesis.constants.isNative())
      {
         //
         // pick the first one on the Neaby Venue in the store
         //
         var venueId = 0;
         if(!merchantMode)
         {
            var venue = Ext.StoreMgr.get('CheckinExploreStore').first();
            venueId = venue ? venue.getId() : me.getViewPortCntlr().getVenue().getId()
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
         Ext.defer(function()
         {
            window.plugins.qrCodeReader.getCode(callback, fail);
         }, 1);
      }

   }
});
