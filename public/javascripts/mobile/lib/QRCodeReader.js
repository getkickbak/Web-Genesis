
/**
 * QRCodeReader uploads a file to a remote server.
 */
JFQRCodeReader = function() {}

/**
 * Given an absolute file path, uploads a file on the device to a remote server 
 * using a multipart HTTP request.
 * @param filePath {String}           Full path of the file on the device
 * @param server {String}             URL of the server to receive the file
 * @param successCallback (Function}  Callback to be invoked when upload has completed
 * @param errorCallback {Function}    Callback to be invoked upon error
 * @param options {FileUploadOptions} Optional parameters such as file name and mimetype           
 */
JFQRCodeReader.prototype.getCode = function(filePath, server, successCallback, errorCallback, options) {
	if(!options.params) {
		options.params = {};
	}
	options.filePath = filePath;
	options.server = server;
	if(!options.fileKey) {
		options.fileKey = 'file';
	}
	if(!options.fileName) {
		options.fileName = 'image.jpg';
	}
	if(!options.mimeType) {
		options.mimeType = 'image/jpeg';
	}
	if(!options.chunkedMode) {
		options.chunkedMode = false;
	}
	// successCallback required
	if (typeof successCallback != "function") {
      console.log("JFQRCodeReader Error: successCallback is not a function");
      return;
   }
   
   
   // errorCallback optional
   if (errorCallback && (typeof errorCallback != "function")) {
      console.log("JFQRCodeReader Error: errorCallback is not a function");
      return;
   }
	
   
   console.log("Uploading file to [" + server + "]");
   console.log("filePath is [" + filePath + "]");
   PhoneGap.exec(successCallback, errorCallback, 'QRCodeReader', 'getCode', [options]);
};

JFQRCodeReader.prototype._castOpenCodeError = function(pluginResult) {
	var fileError = new QRCodeReaderError(pluginResult.message);
	//fileError.code = pluginResult.message;
	pluginResult.message = fileError;
   Ext.Msg.hide();
	return pluginResult;
}

JFQRCodeReader.prototype._castGetCodeResult = function(pluginResult) {
	var result = new FileUploadResult();
	result.responseCode = pluginResult.message.responseCode;
	result.response = decodeURIComponent(pluginResult.message.response);
	pluginResult.message = result;
   Ext.Msg.hide();
	return pluginResult;
}

JFQRCodeReader.prototype._updateProgress = function(pluginResult) {
   var progress = pluginResult.message.progress;
   var total = pluginResult.message.total;
   console.log("Transferred " + progress + " of " + total + " bytes");
   //if (Ext.Msg.isHidden())
   {
      Ext.Msg.show({
         title : '',
         msg: "Transferred " + progress + " of " + total + " bytes",
         width: 300,
         buttons: [],
         fn: Ext.emptyFn
      });
   }
   /*
   else
   {
      Ext.Msg.updateMsg("Transferred " + progress + " of " + total + " bytes");
   }
   */
}

PhoneGap.addConstructor(function()  {
                        if (typeof navigator.jfqrCodeReader == "undefined") navigator.jfqrCodeReader = new JFQRCodeReader();
                        });
