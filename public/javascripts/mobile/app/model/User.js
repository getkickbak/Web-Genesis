Ext.require(['Genesis.model.UserProfile'], function()
{

   Ext.define('Genesis.model.User', {
      extend : 'Ext.data.Model',
      id : 'User',
      fields : ['user_id', 'name', 'email', 'facebook_id', 'photo_url', 'created_ts', 'update_ts'],
      hasOne : {
         model : 'Genesis.model.UserProfile',
         name : 'profile'
      }
   });

});
