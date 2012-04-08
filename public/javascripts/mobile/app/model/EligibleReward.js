Ext.define('Genesis.model.EligibleReward',
{
   extend : 'Ext.data.Model',
   id : 'EligibleReward',
   alternateClassName : 'EligibleReward',
   config :
   {
      idProperty : 'reward_id',
      fields : ['reward_id', 'reward_title', 'points_difference', 'reward_type', 'photo']
   }
});
