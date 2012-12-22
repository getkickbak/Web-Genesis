Ext.define('Genesis.profile.Desktop',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.deviceType == 'Desktop';
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.notification.Simulator
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.notification.Simulator',
{
   override : 'Ext.device.notification.Simulator',
   beep : function(times)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['beepSound']);
      console.log("Beep " + times + " times.")
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.notification.Desktop
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.notification.Desktop',
{
   override : 'Ext.device.notification.Desktop',
   beep : function(times)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['beepSound']);
      console.log("Beep " + times + " times.")
   }
});
