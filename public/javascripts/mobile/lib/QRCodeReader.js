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
   QRCodeReader.prototype.scanType = "RL";

   /**
    * Given an absolute file path, uploads a file on the device to a remote server
    * using a multipart HTTP request.
    * @param filePath {String}           Full path of the file on the device
    * @param server {String}             URL of the server to receive the file
    * @param successCallback (Function}  Callback to be invoked when upload has completed
    * @param errorCallback {Function}    Callback to be invoked upon error
    * @param options {FileUploadOptions} Optional parameters such as file name and mimetype
    */
   QRCodeReader.prototype.getCode = function(filePath, server, successCallback, errorCallback, options)
   {
      if(!options.params)
      {
         options.params =
         {
         };
      }
      options.filePath = filePath;
      options.server = server;
      if(!options.fileKey)
      {
         options.fileKey = 'file';
      }
      if(!options.fileName)
      {
         options.fileName = 'image.jpg';
      }
      if(!options.mimeType)
      {
         options.mimeType = 'image/jpeg';
      }
      if(!options.chunkedMode)
      {
         options.chunkedMode = false;
      }
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

      console.log("Uploading file to [" + server + "]\nfilePath is [" + filePath + "]");
      console.log("ScanType is [" + this.scanType + "]");
      switch (this.scanType)
      {
         case 'RL' :
         case 'Nigma' :
         {
            cordovaRef.exec(successCallback, errorCallback, 'QRCodeReader' + this.scanType, 'getCode', [options]);
            break;
         }
         default:
            cordovaRef.exec(successCallback, errorCallback, 'QRCodeReaderRL', 'getCode', [options]);
            break;
      }
   };

   QRCodeReader.prototype._didNotFinishWithResult = function(fileError)
   {
      pluginResult.message = fileError;
      //Ext.Msg.hide();
      console.log("ErrorCode = " + fileError)
      return pluginResult;
   }

   QRCodeReader.prototype._didFinishWithResult = function(pluginResult)
   {
      var result = new FileUploadResult();
      //result.responseCode = pluginResult.message.responseCode;
      result.response = decodeURIComponent(pluginResult.message.response);
      pluginResult.message = result;

      //Ext.Msg.hide();
      return pluginResult;
   }

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
