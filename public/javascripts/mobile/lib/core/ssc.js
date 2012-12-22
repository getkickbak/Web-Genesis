(function(cordova)
{
   window.plugins = window.plugins ||
   {
   };
   window.plugins.ssc =
   {
      send : function(win, fail, data)
      {
         cordova.exec(win, fail, "EbkPlugin", "send", [data]);
      },
      loop : function(win, fail, data)
      {
         cordova.exec(win, fail, "EbkPlugin", "loop", [data]);
      },
      stop : function(callback)
      {
         cordova.exec(callback, callback, "EbkPlugin", "stop", []);
      },
      recv : function(win, fail)
      {
         cordova.exec(win, fail, "EbkPlugin", "recv", []);
      }
   };

   cordova.addConstructor(function()
   {
      cordova.exec(function()
      {
         console.log("Initialized the SSC EbkPlugin");
      }, function(reason)
      {
         console.log("Failed to initialize the SSC EbkPlugin " + reason);
      }, "EbkPlugin", "init", []);
   });
})(window.cordova || window.Cordova || window.PhoneGap);
