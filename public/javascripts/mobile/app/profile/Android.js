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
