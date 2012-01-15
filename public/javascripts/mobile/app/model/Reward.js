Ext.require(['Genesis.model.Merchant'], function()
{
   Ext.define('Genesis.model.Reward', {
      extend : 'Ext.data.Model',
      id : 'Reward',
      fields : ['type', 'title', 'points', 'created_ts', 'update_ts'],
      belongsTo : 'Genesis.model.Merchant'
   });
});
