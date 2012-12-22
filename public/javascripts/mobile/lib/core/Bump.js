(function(cordova)
{
   window.plugins = window.plugins ||
   {
   };
   window.plugins.bump =
   {
      init : function()
      {
         cordova.exec(function()
         {
            console.log("Initialized the BumpPlugin");
         }, function(reason)
         {
            console.log("Failed to initialize the BumpPlugin " + reason);
         }, "BumpPlugin", "init", []);
      },
      send : function(win, fail, data)
      {
         cordova.exec(win, fail, "BumpPlugin", "send", [data]);
      },
      recv : function(win, fail)
      {
         cordova.exec(win, fail, "BumpPlugin", "recv", []);
      }
   };

   cordova.addConstructor(function()
   {
   });
})(window.cordova || window.Cordova || window.PhoneGap);
