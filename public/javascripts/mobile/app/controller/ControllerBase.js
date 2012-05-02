Ext.define('Genesis.controller.ControllerBase',
{
   extend : 'Ext.app.Controller',
   requires : ['Ext.data.Store', 'Ext.util.Geolocation'],
   statics :
   {
      /*
       error : function()
       {
       var error =
       {
       };
       error[FileError.NOT_FOUND_ERR] = 'File not found';
       error[FileError.SECURITY_ERR] = 'Security error';
       error[FileError.ABORT_ERR] = 'Abort error';
       error[FileError.NOT_READABLE_ERR] = 'Not readable';
       error[FileError.ENCODING_ERR] = 'Encoding error';
       error[FileError.NO_MODIFICATION_ALLOWED_ERR] = 'No mobification allowed';
       error[FileError.INVALID_STATE_ERR] = 'Invalid state';
       error[FileError.SYFNTAX_ERR] = 'Syntax error';
       error[FileError.INVALID_MODIFICATION_ERR] = 'Invalid modification';
       error[FileError.QUOTA_EXCEEDED_ERR] = 'Quota exceeded';
       error[FileError.TYPE_MISMATCH_ERR] = 'Type mismatch';
       error[FileError.PATH_EXISTS_ERR] = 'Path does not exist';
       return error;
       }(),
       ftError : function()
       {
       var ftError =
       {
       };
       ftError[FileTransferError.FILE_NOT_FOUND_ERR] = 'File not found';
       ftError[FileTransferError.INVALID_URL_ERR] = 'Invalid URL Error';
       ftError[FileTransferError.CONNECTION_ERR] = 'Connection Error';
       return ftError;
       }()
       */
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
   getPrivKey : function()
   {
      return '000102030405060708090a0b0c0d0e0f';
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
   popView : function(b, e, eOpts)
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
         Ext.Viewport.setMasked(false);
         var qrcode = (r.response == 'undefined') ? "" : (r.response || "");
         if(Genesis.constants.isNative())
         {
            switch(window.plugins.qrCodeReader.scanType)
            {
               case 'RL' :
               {
                  console.debug("QR Code RL  = " + qrcode);
                  break;
               }
               case 'Nigma' :
               {
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
            }
         }
         else
         {
            console.debug("QR Code = " + qrcode);
         }

         config.callback(qrcode);
      };

      console.debug("Scanning QR Code ...")
      if(!Genesis.constants.isNative())
      {
         //
         // Pick whatever is currently showing on the Venue Explore screen,
         // or pick the first one on the Neaby Venue in the store
         //
         var venueId = 0;
         if(!merchantMode)
         {
            venueId = (me.getCheckinMerchant && me.getCheckinMerchant().venue) ? me.getCheckinMerchant().venue.getId() : Ext.StoreMgr.get('CheckinExploreStore').first().getId();
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
         }, 500);
      }

   },
   genQRCode : function(text)
   {
      var dotsize = 3;
      // size of box drawn on canvas
      var padding = 0;
      // (white area around your QRCode)
      var black = "rgb(0,0,0)";
      var white = "rgb(255,255,255)";
      var QRCodeVersion = 6;
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
   }
});
