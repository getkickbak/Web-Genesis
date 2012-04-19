Ext.define('Genesis.model.EligibleReward',
{
   extend : 'Ext.data.Model',
   id : 'EligibleReward',
   alternateClassName : 'EligibleReward',
   config :
   {
      idProperty : 'reward_id',
      fields : ['reward_id', 'reward_title', 'reward_text', 'reward_type', 'photo']
   }
});
