Ext.define('Genesis.profile.Android',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.is.Android;
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
      _application.getController('Viewport').playSoundFile('beepSound');
      //navigator.notification.beep(times);
   },
   vibrate : function(duration)
   {
      navigator.notification.vibrate(duration || 2000);
   }
}); 