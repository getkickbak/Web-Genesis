Ext.define('Genesis.controller.ControllerBase',
{
   extend : 'Ext.app.Controller',
   requires : ['Ext.data.Store'],
   statics :
   {
      sign_in_path : '/sign_in',
      sign_out_path : '/sign_out',
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
      }(),
      connection : function()
      {
         var connection =
         {
         };
         connection[Connection.UNKNOWN] = 'Unknown connection';
         connection[Connection.ETHERNET] = 'Ethernet connection';
         connection[Connection.WIFI] = 'WiFi connection';
         connection[Connection.CELL_2G] = 'Cell 2G connection';
         connection[Connection.CELL_3G] = 'Cell 3G connection';
         connection[Connection.CELL_4G] = 'Cell 4G connection';
         connection[Connection.NONE] = 'No network connection';
         return connection;
      }()
   },
   init : function()
   {
      this.callParent(arguments);
   },
   login : function()
   {
      var profile = this.self.profile;

      // initialize opening screen ...
      // If Logged in, goto MainPage, otherwise, goto LoginPage
      var successFn = function(response)
      {
         this.getViewPort().getMainPage();
      };

      Ext.Ajax.request(
      {
         url : Genesis.site + this.self.sign_in_path,
         params :
         {
         },
         success : successFn.createDelegate(this),
         failure : function(response, opts)
         {
            if(Genesis.constants.isNative() && response.status == 0 && response.responseText != '')
            {
               successFn.call(this, response);
            }
            else
            {
               console.error('failed to complete request');
               console.error('isNative:' + Genesis.constants.isNative());
               console.error('response.status:' + response.status);
               console.error('response.responseText:' + response.responseText);
            }
         }.createDelegate(this)
      });
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
         viewport.push(view, app.getEventDispatcher().controller);
      }
   },
   popView : function(b, e, eOpts)
   {
      var viewport = this.getViewport();
      var app = this.getApplication();

      viewport.pop(app.getEventDispatcher().controller);
   },
   getMainPage : Ext.emptyFn,
   openMainPage : Ext.emptyFn,
   openPage : Ext.emptyFn,
   isOpenAllowed : function()
   {
      return "Cannot Open Folder";
   },
   getGeoLocation : function(callback)
   {
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
         var networkState = navigator.network.connection.type;
         console.log('Checking Connectivity Type ...[' + networkState + ']');
         console.log('Connection type: [' + Genesis.controller.ControllerBase.connection[networkState] + ']');
         //console.log('Checking for Network Conncetivity for [' + location.origin + ']');

         console.log('Getting GeoLocation ...');
         navigator.geolocation.getCurrentPosition(function(position)
         {
            console.log('\n' + 'Latitude: ' + position.coords.latitude + '\n' + 'Longitude: ' + position.coords.longitude + '\n' + 'Altitude: ' + position.coords.altitude + '\n' + 'Accuracy: ' + position.coords.accuracy + '\n' + 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' + 'Heading: ' + position.coords.heading + '\n' + 'Speed: ' + position.coords.speed + '\n' + 'Timestamp: ' + new Date(position.timestamp) + '\n');

            callback(position);
         }, function(error)
         {
            console.log('GeoLocation Error[' + error.message + ']');
            switch (error.code)
            {
               case PositionError.PERMISSION_DENIED:
               {
                  console.log("PERMISSION_DENIED");
                  break;
               }
               case PositionError.POSITION_UNAVAILABLE:
               {
                  console.log("PERMISSION_UNAVAILABLE");
                  break;
               }
               case PositionError.TIMEOUT:
               {
                  console.log("TIMEOUT");
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
      var fail = function(message)
      {
         config.callback();
         console.log('Failed because: ' + ftError[message.code]);
      };
      var callback = function(r)
      {
         config.callback(r.response);
         console.log("Code = " + r.response.responseCode + " Sent = " + r.bytesSent + " bytes");
      };

      console.log("Scanning QR Code ...")
      if(!Genesis.constants.isNative())
      {
         //
         // Pick whatever is currently showing on the Venue Explore screen,
         // or pick the first one on the Neaby Venue in the store
         //
         var venueId = (this.getCheckinMerchant && this.getCheckinMerchant().venue) ? this.getCheckinMerchant().venue.getId() : Ext.StoreMgr.get('CheckinExploreStore').first().getId();
         callback(
         {
            bytesSent : 0,
            response :
            {
               responseCode : venueId
            }
         });
      }
      else
      {
         window.plugins.qrCodeReader.getCode("file://localhost/test.jpg", "http://www.getkickbak.com/test", callback, fail, new FileUploadOptions());
      }
   }
});
