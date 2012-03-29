Ext.define('Genesis.model.CustomerReward',
{
   extend : 'Ext.data.Model',
   id : 'Venue',
   config :
   {
      fields : ['id', 'title', 'average_price', 'points', 'type', 'photo_url', 'created_ts', 'update_ts'],
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
         defaultHeaders :
         {
            'If-None-Match' : ''
         },
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'redemptions.json',
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
   }
});
