Ext.define('Genesis.model.UserProfile',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'UserProfile',
   id : 'UserProfile',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.User',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      fields : ['gender', 'birthday', 'zipcode', 'created_ts', 'update_ts', 'user_id']
   },
   getUser : function()
   {

   }
});
