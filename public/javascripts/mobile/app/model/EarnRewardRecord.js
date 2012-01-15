Ext.require(['Genesis.model.Merchant', 'Genesis.model.User'], function()
{
   Ext.define('Genesis.model.EarnRewardRecord', {
      extend : 'Ext.data.Model',
      id : 'EarnRewardRecord',
      fields : ['reward_id', 'challenge_id', 'points', 'time'],
      belongsTo : ['Genesis.model.Merchant', 'Genesis.model.User']
   });
});
