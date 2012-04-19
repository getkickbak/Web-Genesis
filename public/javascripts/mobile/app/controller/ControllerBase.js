Ext.define('Genesis.controller.ControllerBase',
{
   extend : 'Ext.app.Controller',
   requires : ['Ext.data.Store'],
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
               latitude : "-50.000000",
               longitude : '50.000000'
            }
         });
      }
      else
      {
         console.debug('Connection type: [' + Ext.device.Connection.getType() + ']');
         //console.debug('Checking for Network Conncetivity for [' + location.origin + ']');

         navigator.geolocation.getCurrentPosition(function(position)
         {
            if(position)
            {
               console.debug('\n' + 'Latitude: ' + position.coords.latitude + '\n' + 'Longitude: ' + position.coords.longitude + '\n' + 'Altitude: ' + position.coords.altitude + '\n' + 'Accuracy: ' + position.coords.accuracy + '\n' + 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' + 'Heading: ' + position.coords.heading + '\n' + 'Speed: ' + position.coords.speed + '\n' + 'Timestamp: ' + new Date(position.timestamp) + '\n');

               callback(position);
            }
         }, function(error)
         {
            console.debug('GeoLocation Error[' + error.message + ']');
            switch (error.code)
            {
               case PositionError.PERMISSION_DENIED:
               {
                  console.debug("PERMISSION_DENIED");
                  Ext.device.Notification.show(
                  {
                     title : 'Permission Error',
                     message : me.geoLocationPermissionErrorMsg
                  });
                  break;
               }
               case PositionError.POSITION_UNAVAILABLE:
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
                  break;
               }
               case PositionError.TIMEOUT:
               {
                  console.debug("TIMEOUT");
                  Ext.device.Notification.show(
                  {
                     title : 'Timeout Error',
                     message : me.geoLocationTimeoutErrorMsg
                  });
                  break;
               }
            }
         },
         {
            maximumAge : 30000,
            timeout : 50000,
            enableHighAccuracy : true
         });
      }
   },
   scanQRCode : function(config)
   {
      var me = this;
      var fail = function(message)
      {
         Ext.Viewport.setMasked(false);
         config.callback();
         console.debug('Failed because: ' + ftError[message.code]);
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
         var venueId = (me.getCheckinMerchant && me.getCheckinMerchant().venue) ? me.getCheckinMerchant().venue.getId() : Ext.StoreMgr.get('CheckinExploreStore').first().getId();
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

   }
});
