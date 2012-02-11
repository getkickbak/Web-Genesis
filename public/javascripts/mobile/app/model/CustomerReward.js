Ext.define('Genesis.model.CustomerReward',
{
   extend : 'Ext.data.Model',
   id : 'Venue',
   config :
   {
      fields : ['id', 'title', 'average_price', 'points', 'type', 'photo_url', 'created_ts', 'update_ts', 'merchant_id',
      // Filled in by frontend
      'venue_id'],
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
