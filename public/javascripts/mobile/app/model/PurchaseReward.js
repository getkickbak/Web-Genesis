Ext.define('Genesis.model.PurchaseReward',
{
   extend : 'Ext.data.Model',
   id : 'PurchaseReward',
   alternateClassName : 'PurchaseReward',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         defaultHeaders :
         {
            'If-None-Match' : ''
         },
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      fields : ['title', 'average_price', 'reward_ratio', 'points', 'type', 'photo', 'created_ts', 'update_ts', 'venue_id', 'merchant_id',
      // Added in frontend of shopping cart tracking
      'qty']
   },
   getMerchant : function()
   {

   },
   statics :
   {
      setGetRewardsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? '/api/v1/purchase_rewards' : Ext.Loader.getPath("Genesis") + "/store/" + 'rewards.json');
      },
      setEarnRewardURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? '/api/v1/purchase_rewards/earn' : Ext.Loader.getPath("Genesis") + "/store/" + 'rewards.json');
      }
   }
});
