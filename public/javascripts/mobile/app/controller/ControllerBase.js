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
            if(phoneGapAvailable && response.status == 0 && response.responseText != '')
            {
               successFn.call(this, response);
            }
            else
            {
               console.error('failed to complete request');
               console.error('phoneGapAvailable:' + phoneGapAvailable);
               console.error('response.status:' + response.status);
               console.error('response.responseText:' + response.responseText);
            }
         }.createDelegate(this)
      });
      /*
       var navigation = this.getApplication().getView('Viewport'), toolbar;
       switch (profile)
       {
       case 'desktop':
       case 'tablet':
       navigation.setDetailContainer(this.getMain());
       break;

       case 'phone':
       toolbar = navigation.navigationBar()[0];
       toolbar.add({
       xtype : 'button',
       id : 'viewSourceButton',
       hidden : true,
       align : 'right',
       ui : 'action',
       action : 'viewSource',
       text : 'Source'
       });
       break;
       }
       */
   },
   getViewPortCntlr : function()
   {
      return this.getApplication().getController('Viewport');
   },
   getViewport : function()
   {
      return this.getViewPortCntlr().getView();
   },
   setCustomerStoreFilter : function(customerId, merchantId)
   {
      var cstore = Ext.StoreMgr.get('CustomerStore');
      cstore.clearFilter();
      cstore.filter([
      {
         filterFn : Ext.bind(function(item)
         {
            return ((item.get("user_id") == customerId) && (item.get("merchant_id") == merchantId));
         }, this)
      }]);
   },
   pushView : function(view)
   {
      var viewport = this.getViewport();
      //var stack = viewport.getInnerItems();
      var stack = viewport.stack;
      var lastView = (stack.length > 1) ? stack[stack.length - 2] : null;
      if(lastView && lastView == view)
      {
         this.popView();
      }
      else
      {
         /*
          var items = viewport.getInnerItems();
          if(items.indexOf(view) < 0)
          {
          viewport.push(view);
          }
          else
          {
          viewport.onItemAdd(view, items.length);
          //viewport.setActiveItem(view);
          }
          */
         viewport.push(view, this.getEventDispatcher().controller);
      }
   },
   popView : function(b, e, eOpts)
   {
      this.getViewport().pop(this.getEventDispatcher().controller);
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
      switch (Ext.os.deviceType.toLowerCase())
      {
         case 'desktop':
            callback(
            {
               coords :
               {
                  latitude : "-50.000000",
                  longitude : '50.000000'
               }
            });
            break;
         default:
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
            break;
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
         console.log("Code = " + r.responseCode + " Sent = " + r.bytesSent + " bytes");
      };

      console.log("Scanning QR Code ...")
      switch (Ext.os.deviceType.toLowerCase())
      {
         case 'desktop':
            callback(
            {
               responseCode : "Test QR Code",
               response :
               {
                  response : "Test QR Code",
               }
            });
            break;
         default:
            var qrCode = new JFQRCodeReader();
            qrCode.getCode("file://localhost/test.jpg", "http://www.justformyfriends.com/test", callback, fail, new FileUploadOptions());
            break;
      }
   }
});
