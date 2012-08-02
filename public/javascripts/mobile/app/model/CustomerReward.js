Ext.define('Genesis.model.CustomerReward',
{
   extend : 'Ext.data.Model',
   id : 'CustomerReward',
   alternateClassName : 'CustomerReward',
   config :
   {
      fields : ['id', 'title', 'points', 'type', 'photo', 'quantity_limited', 'quantity', 'time_limited',
      {
         name : 'expiry_date',
         type : 'date',
         convert : function(value, format)
         {
            var value = Date.parse(value, "yyyy-MM-dd");
            return (!value) ? "N/A" : Genesis.fn.convertDateNoTimeNoWeek.apply(this, arguments);
         }
      }],
      idProperty : 'id',
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
      }
   },
   getMerchant : function()
   {
   },
   statics :
   {
      //
      // Redeem Points
      //
      setGetRedemptionsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/customer_rewards' : Ext.Loader.getPath("Genesis") + "/store/" + 'redemptions.json');
      },
      setRedeemPointsURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/customer_rewards/' + id + '/redeem');
      },
      //
      // Prize Points
      //
      setGetPrizesURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/customer_rewards?mode=prize' : Ext.Loader.getPath("Genesis") + "/store/" + 'redemptions.json');
      },
      setRedeemPrizeURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/customer_rewards/' + id + '/redeem?mode=prize');
      }
   }
});
