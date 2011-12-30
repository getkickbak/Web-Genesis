Ext.require('Genesis.model.User', function()
{

   Ext.define('Genesis.model.UserProfile', {
      extend : 'Ext.data.Model',
      id : 'UserProfile',
      fields : ['gender', 'birthday', 'zipcode', 'created_ts', 'update_ts'],
      belongsTo : 'Genesis.model.User'
   });

});
