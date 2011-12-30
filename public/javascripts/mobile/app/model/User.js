Ext.require(['Genesis.model.UserProfile'], function()
{

   Ext.define('Genesis.model.User', {
      extend : 'Ext.data.Model',
      id : 'User',
      fields : ['id', 'user_id', 'name', 'email', 'facebook_id', 'facebook_uid', 'photo_url', 'created_ts', 'update_ts'],
      hasOne : {
         model : 'Genesis.model.UserProfile',
         name : 'profile'
      }
   });

});
