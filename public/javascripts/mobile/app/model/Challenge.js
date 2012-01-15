Ext.require(['Genesis.model.Merchant'], function()
{
   Ext.define('Genesis.model.Challenge', {
      extend : 'Ext.data.Model',
      id : 'Challenge',
      fields : ['type', 'name', 'description',
      // Image associated with the Challenge
      'photo_url',
      'require_verif', 'data', 'points', 'created_ts', 'update_ts'],
      belongsTo : 'Genesis.model.Merchant'
   });
});
