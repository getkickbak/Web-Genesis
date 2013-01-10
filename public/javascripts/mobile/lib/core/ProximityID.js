(function(cordova)
{
   window.plugins = window.plugins ||
   {
   };
   window.plugins.proximityID =
   {
      init : function(s_vol_ratio, r_vol_ratio)
      {
         cordova.exec(function()
         {
            console.log("ProximityIDPlugin Initialized");
         }, function(reason)
         {
            console.log("Failed to initialize the ProximityIDPlugin! Reason[" + reason + "]");
         }, "ProximityIDPlugin", "init", [s_vol_ratio + "", r_vol_ratio + ""]);
      },
      preLoadSend : function(win, fail)
      {
         Ext.defer(function()
         {
            cordova.exec(win, fail, "ProximityIDPlugin", "preLoadIdentity", []);
         }, 0.3 * 1000, this);
      },
      send : function(win, fail)
      {
         cordova.exec(win, fail, "ProximityIDPlugin", "sendIdentity", []);
      },
      scan : function(win, fail, samples, missedThreshold, magThreshold, overlapRatio)
      {
         cordova.exec(win, fail, "ProximityIDPlugin", "scanIdentity", [samples, missedThreshold, magThreshold, overlapRatio]);
      },
      stop : function()
      {
         cordova.exec(function()
         {
            console.log("Stopped ProximityIDPlugin");
         }, function(reason)
         {
            console.log("Failed to stop the ProximityIDPlugin " + reason);
         }, "ProximityIDPlugin", "stop", []);
      },
      setVolume : function(vol)
      {
         cordova.exec(Ext.emptyFn, Ext.emptyFn, "ProximityIDPlugin", "setVolume", [vol]);
      }
   };

   cordova.addConstructor(function()
   {
   });
})(window.cordova || window.Cordova || window.PhoneGap);
