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
         disableCaching : false,
         defaultHeaders :
         {
            'If-None-Match' : ''
         },
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'rewards.json',
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

   }
});
