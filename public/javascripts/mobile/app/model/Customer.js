Ext.define('Genesis.model.Customer',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Checkin'],
   alternateClassName : 'Customer',
   id : 'Customer',
   config :
   {
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
      }],
      hasOne :
      {
         model : 'Genesis.model.Checkin',
         associationKey : 'last_check_in',
         // User to make sure no underscore
         getterName : 'getLastCheckin',
         setterName : 'setLastCheckin'
      },
      proxy :
      {
         type : 'ajax',
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json',
         reader :
         {
            type : 'json',
            rootProperty : 'customers'
         }
      },
      fields : ['auth_code', 'qr_code', 'points', 'created_ts', 'update_ts', 'merchant_id', 'user_id'],
      idProperty : 'merchant_id'
   },
   getMerchant : function()
   {

   },
   getUser : function()
   {

   }
});
