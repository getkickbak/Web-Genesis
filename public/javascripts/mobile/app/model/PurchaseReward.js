Ext.define('Genesis.model.PurchaseReward',
{
   extend : 'Ext.data.Model',
   id : 'Venue',
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
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'rewards.json',
         reader :
         {
            type : 'json',
            rootProperty : 'rewards'
         }
      },
      fields : ['title', 'average_price', 'reward_ratio', 'points', 'type', 'photo_url', 'created_ts', 'update_ts', 'venue_id', 'merchant_id',
      // Added in frontend of shopping cart tracking
      'qty']
   },
   getMerchant : function()
   {

   }
});
