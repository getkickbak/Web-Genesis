Ext.require('Ext.util.JSONP', function()
{
   var error = {};
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

   var ftError = {};
   ftError[FileTransferError.FILE_NOT_FOUND_ERR] = 'File not found';
   ftError[FileTransferError.INVALID_URL_ERR] = 'Invalid URL Error';
   ftError[FileTransferError.CONNECTION_ERR] = 'Connection Error';

   var connection = {};
   connection[Connection.UNKNOWN] = 'Unknown connection';
   connection[Connection.ETHERNET] = 'Ethernet connection';
   connection[Connection.WIFI] = 'WiFi connection';
   connection[Connection.CELL_2G] = 'Cell 2G connection';
   connection[Connection.CELL_3G] = 'Cell 3G connection';
   connection[Connection.CELL_4G] = 'Cell 4G connection';
   connection[Connection.NONE] = 'No network connection';

   var config;
   var cmFail = function(message)
   {
      config.callback();
      console.log('Failed because: ' + message);
   };
   var fail = function(message)
   {
      config.callback();
      console.log('Failed because: ' + ftError[message.code]);
   };
   var callback = function(r)
   {
      config.callback(r.response);
      console.log("Code = " + r.responseCode + " Sent = " + r.bytesSent + " bytes");
   };
   var printObj = function(obj)
   {
      for(i in obj) {
         console.log(i + "-" + obj[i]);
      }
   }
   console.log("Loading PhotoUpload");

   Ext.PhotoUpload = {
      url : '/referrals/photo_upload',
      deal_id : 'the-runners-shop',
      origin : 'http://www.justformyfriends.com',
      getPhoto : function(cfg)
      {
         config = cfg;
         navigator.camera.getPicture(function(imageURI)
         {
            var url = Ext.PhotoUpload.origin + Ext.PhotoUpload.url;
            var options = new FileUploadOptions();
            var ft = (Ext.os.is.iOS) ? new FileTransfer() : new FileTransfer();

            options.fileKey = "image";
            //options.fileName="";
            options.mimeType = "image/jpeg";
            options.params = {
               "deal_id" : Ext.PhotoUpload.deal_id
            };
            ft.upload(imageURI, url, callback, fail, options);
            console.log("Uploaded file to [" + url + "]");
         }, cmFail, {
            quality : 50,
            sourceType : navigator.camera.PictureSourceType.CAMERA,
            destinationType : navigator.camera.DestinationType.FILE_URI,
            allowEdit : true,
            encodingType : Camera.EncodingType.JPEG,
            targetWidth : 650
         });
         console.log("Retrieving Photo ...");
      },
      scanQRCode : function(cfg)
      {
         config = cfg;
         console.log('Checking Connectivity Type ...');
         var networkState = navigator.network.connection.type;
         console.log('Connection type: ' + connection[networkState]);
         console.log('Checking for Network Conncetivity for [' + Ext.PhotoUpload.origin + ']');
         console.log('Getting GeoLocation ...');
         navigator.geolocation.getCurrentPosition(function(position)
         {
            console.log('\n' + 'Latitude: ' + position.coords.latitude + '\n' + 'Longitude: ' + position.coords.longitude + '\n' + 'Altitude: ' + position.coords.altitude + '\n' + 'Accuracy: ' + position.coords.accuracy + '\n' + 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' + 'Heading: ' + position.coords.heading + '\n' + 'Speed: ' + position.coords.speed + '\n' + 'Timestamp: ' + new Date(position.timestamp) + '\n');
            var qrCode = new JFQRCodeReader();
            qrCode.getCode("file://localhost/test.jpg", "http://www.justformyfriends.com/test", callback, fail, new FileUploadOptions());
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
         }, {
            maximumAge : 30000,
            timeout : 50000,
            enableHighAccuracy : true
         });
      }
   }
   console.log("Loading PhotoUpload View");
   Ext.define('Kitchensink.view.PhotoUpload', {
      extend : 'Ext.Container',
      config : {
         layout : 'fit',
         scrollable : true,
         items : [{
            xtype : 'panel',
            id : 'PhotoUpload',
            tpl : new Ext.XTemplate('<img width="100%" src="{photo_url}">'),
            styleHtmlContent : true,
            data : {
               "photo_url" : ''
            },
         }, {
            docked : 'top',
            xtype : 'toolbar',
            items : [{
               text : 'Scan QR Code',
               handler : function()
               {
                  var panel = Ext.getCmp('PhotoUpload');

                  panel.element.mask('Loading...', 'x-mask-loading', true);

                  Ext.PhotoUpload.scanQRCode({
                     callback : function(response)
                     {
                        if(response) {
                           console.log("response - " + response);
                        }
                        else {
                           console.log("response - NONE");
                        }
                        panel.element.unmask();
                     }
                  });
               }
            }, {
               text : 'Upload Photo',
               handler : function()
               {
                  var panel = Ext.getCmp('PhotoUpload');

                  panel.element.mask('Loading...', 'x-mask-loading', true);

                  Ext.PhotoUpload.getPhoto({
                     callback : function(response)
                     {
                        if(response) {
                           panel.updateData(Ext.decode(response));
                        }
                        else {
                           console.log("Photo - NONE");
                        }
                        panel.element.unmask();
                     }
                  });
               }
            }]
         }]
      }
   });
   console.log("Done Loading PhotoUpload");
});
