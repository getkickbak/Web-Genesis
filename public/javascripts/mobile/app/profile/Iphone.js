Ext.define('Genesis.profile.Iphone',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.is.iPhone;
   }
});
