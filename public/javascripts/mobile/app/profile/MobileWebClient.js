Ext.define('Genesis.profile.MobileWebClient',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return true;
   }
}); 

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.notification.PhoneGap
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.notification.Sencha',
{
   override : 'Ext.device.notification.Sencha',
   beep : function(times)
   {
   },
   vibrate : function(duration)
   {
   }
});
