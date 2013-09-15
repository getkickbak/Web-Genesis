Ext.define('Genesis.profile.Android',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.is('Android');
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.notification.PhoneGap
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.notification.PhoneGap',
{
   override : 'Ext.device.notification.PhoneGap',
   beep : function(times)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['beepSound']);
      //navigator.notification.beep(times);
   },
   vibrate : function(duration)
   {
      navigator.notification.vibrate(duration || 1000);
   },
   activityStart : function(title, message)
   {
      navigator.notification.activityStart(title, message);
   },
   activityStop : function()
   {
      navigator.notification.activityStop();
   }
});
