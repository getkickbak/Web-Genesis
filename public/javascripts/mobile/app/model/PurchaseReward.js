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
      fields : ['id', 'title', 'points', 'type', 'photo', 'created_ts', 'update_ts',
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
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/purchase_rewards' : Ext.Loader.getPath("Genesis") + "/store/" + 'rewards.json');
      }
   }
});
