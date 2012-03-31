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
            return (!value) ? "N/A" : Genesis.constants.convertDateNoTimeNoWeek.apply(this, arguments);
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
      }]
   },
   getUser : function()
   {
   }
});
