Ext.define('Genesis.model.EarnPrize',
{
   extend : 'Ext.data.Model',
   id : 'EarnPrize',
   alternateClassName : 'EarnPrize',
   config :
   {
      fields : ['id',
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
         model : 'Genesis.model.CustomerReward',
         associationKey : 'reward',
         getterName : 'getCustomerReward',
         setterName : 'setCustomerReward'
      },
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      },
      {
         model : 'Genesis.model.User',
         associationKey : 'user',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         actionMethods :
         {
            create : 'POST',
            read : 'POST',
            update : 'POST',
            destroy : 'POST'
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
      }
   },
   getUser : function()
   {
   },
   statics :
   {
      setEarnPrizeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/purchase_rewards/earn');
      },
      setRedeemPrizeURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/earn_prizes/' + id + '/redeem');
      }
   }
});
