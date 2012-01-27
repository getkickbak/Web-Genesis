Ext.define('Genesis.model.CustomerReward',
{
   extend : 'Ext.data.Model',
   id : 'Venue',
   config :
   {
      fields : ['title', 'average_price', 'points', 'type', 'photo_url', 'created_ts', 'update_ts', 'merchant_id'],
      idProperty : 'merchant_id',
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      proxy :
      {
         type : (!phoneGapAvailable) ? 'ajax' : 'offlineajax',
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'redemptions.json',
         reader :
         {
            type : 'json',
            rootProperty : 'redemptions'
         }
      }
   },
   getMerchant : function()
   {

   }
});
