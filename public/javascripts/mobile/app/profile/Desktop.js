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
