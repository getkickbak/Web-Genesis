window.plugins = window.plugins ||
{
};

(function(cordova)
{
   InAppBrowser = function()
   {
      this.channels =
      {
         'loadstart' : [],
         'loadstop' : [],
         'loaderror' : [],
         'exit' : []
      };
   };
   InAppBrowser.prototype =
   {
      _eventHandler : function(event)
      {
         if (event.type in this.channels)
         {
            for (var i = 0; i < this.channels[event.type].length; i++)
            {
               this.channels[event.type][i](event);
            }
         }
      },
      _cb : function(eventname)
      {
         this._eventHandler(eventname);
      },
      /*
       open : function(strUrl, strWindowName, strWindowFeatures)
       {
       cordova.exec(this._cb, this._cb, "InAppBrowserPlugin", "open", [strUrl, strWindowName, strWindowFeatures]);
       },
       */
      close : function(eventname)
      {
         cordova.exec(null, null, "InAppBrowserPlugin", "close", []);
      },
      addEventListener : function(eventname, f)
      {
         if ( eventname in this.channels)
         {
            var index = this.channels[eventname].indexOf(f);
            if (index < 0)
            {
               this.channels[eventname].push(f);
            }
         }
      },
      removeEventListener : function(eventname, f)
      {
         if ( eventname in this.channels)
         {
            var index = this.channels[eventname].indexOf(f);
            if (index >= 0)
            {
               this.channels[eventname].splice(index, 1);
            }
         }
      },
      executeScript : function(injectDetails, cb)
      {
         if (injectDetails.code)
         {
            cordova.exec(cb, null, "InAppBrowserPlugin", "injectScriptCode", [injectDetails.code, !!cb]);
         }
         else if (injectDetails.file)
         {
            cordova.exec(cb, null, "InAppBrowserPlugin", "injectScriptFile", [injectDetails.file, !!cb]);
         }
         else
         {
            throw new Error('executeScript requires exactly one of code or file to be specified');
         }
      },
      insertCSS : function(injectDetails, cb)
      {
         if (injectDetails.code)
         {
            cordova.exec(cb, null, "InAppBrowserPlugin", "injectStyleCode", [injectDetails.code, !!cb]);
         }
         else if (injectDetails.file)
         {
            cordova.exec(cb, null, "InAppBrowserPlugin", "injectStyleFile", [injectDetails.file, !!cb]);
         }
         else
         {
            throw new Error('insertCSS requires exactly one of code or file to be specified');
         }
      }
   };

   window.plugins.inAppBrowser =
   {
      open : function(strUrl, strWindowName, strWindowFeatures)
      {
         var iab = new InAppBrowser();
         var cb = Ext.bind(iab._cb, iab);
         cordova.exec(cb, cb, "InAppBrowserPlugin", "open", [strUrl, strWindowName, strWindowFeatures]);
         return iab;
      },
   };

   cordova.addConstructor(function()
   {
   });

})(window.cordova || window.Cordova || window.PhoneGap);
