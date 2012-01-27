Ext.define('Genesis.model.EarnRewardRecord',
{
   extend : 'Ext.data.Model',
   id : 'EarnRewardRecord',
   config :
   {
      idProperty : 'reward_id',
      fields : ['reward_id', 'challenge_id', 'venue_id', 'points', 'merchant_id', 'user_id'],
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      },
      {
         model : 'Genesis.model.User',
         getterName : 'getUser',
         setterName : 'setUser'
      }]
   },
   getMerchant : function()
   {

   },
   getUser : function()
   {

   }
});
