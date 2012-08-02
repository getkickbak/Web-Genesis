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
         },
         listeners :
         {
            'metachange' : function(proxy, metaData, eOpts)
            {
               var controller = _application.getController('client.Rewards');
               Ext.defer(controller.updateMetaData, 0.1 * 1000, controller, [metaData]);
            }
         }
      },
      fields : ['id', 'title', 'points', 'type', 'photo', 'created_ts', 'update_ts']
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
      },
      setEarnPointsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/purchase_rewards/earn');
      },
   }
});
