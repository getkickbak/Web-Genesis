Ext.require(['Genesis.model.Merchant', 'Genesis.model.User'], function()
{
   Ext.define('Genesis.model.RedeemRewardRecord', {
      extend : 'Ext.data.Model',
      id : 'RedeemRewardRecord',
      fields : ['reward_id', 'points', 'time'],
      belongsTo : ['Genesis.model.Merchant', 'Genesis.model.User']
   });
});
