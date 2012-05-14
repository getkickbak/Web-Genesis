/**
 * QRCodeReader uploads a file to a remote server.
 */
(function()
{
   var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;
   // old to new fallbacks

   QRCodeReader = function()
   {
   }
   QRCodeReader.ErrorResultType =
   {
      Cancelled : 0,
      Failed : 1,
      Success : 2
   }
   //QRCodeReader.prototype.scanType = "Nigma";
   //QRCodeReader.prototype.scanType = "RL";
   QRCodeReader.prototype.scanType = "Default";

   /**
    * Given an absolute file path, uploads a file on the device to a remote server
    * using a multipart HTTP request.
    * @param successCallback (Function}  Callback to be invoked when upload has completed
    * @param errorCallback {Function}    Callback to be invoked upon error
    */
   QRCodeReader.prototype.getCode = function(successCallback, errorCallback, options)
   {
      // successCallback required
      if( typeof successCallback != "function")
      {
         console.log("QRCodeReader Error: successCallback is not a function");
         return;
      }

      // errorCallback optional
      if(errorCallback && ( typeof errorCallback != "function"))
      {
         console.log("QRCodeReader Error: errorCallback is not a function");
         return;
      }

      console.log("ScanType is [" + this.scanType + "]");
      switch (this.scanType)
      {
         case 'RL' :
         case 'Nigma' :
         {
            cordovaRef.exec(successCallback, errorCallback, 'QRCodeReader' + this.scanType, 'getCode', []);
            break;
         }
         case 'Default' :
         {
            window.plugins.barcodeScanner.scan(successCallback, errorCallback, options);
            break;
         }
         default:
            cordovaRef.exec(successCallback, errorCallback, 'QRCodeReaderRL', 'getCode', []);
            break;
      }
   };

   QRCodeReader.prototype._didNotFinishWithResult = function(fileError)
   {
      console.log("ErrorCode = " + fileError)
      pluginResult.message = fileError;
      return pluginResult;
   }

   QRCodeReader.prototype._didFinishWithResult = function(pluginResult)
   {
      var result =
      {
         //responseCode = pluginResult.message.responseCode
         response : decodeURIComponent(pluginResult.message.response)
      }
      pluginResult.message = result;

      return pluginResult;
   };

   cordovaRef.addConstructor(function()
   {
      if(!window.plugins)
      {
         window.plugins =
         {
         };
      }
      window.plugins.qrCodeReader = new QRCodeReader();
   });
})();
