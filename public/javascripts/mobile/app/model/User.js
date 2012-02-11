Ext.define('Genesis.model.User',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.UserProfile'],
   alternateClassName : 'User',
   id : 'User',
   config :
   {
      hasOne : [
      {
         model : 'Genesis.model.UserProfile',
         associationKey : 'profile'
      }],
      proxy :
      {
         type : 'ajax',
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'users.json',
         reader :
         {
            type : 'json',
            rootProperty : 'users'
         }
      },
      fields : ['user_id', 'name', 'email', 'facebook_id', 'photo_url', 'created_ts', 'update_ts', 'profile_id'],
      idProperty : 'user_id'
   }
});
