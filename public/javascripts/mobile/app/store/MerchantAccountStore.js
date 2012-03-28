Ext.define('Genesis.store.MerchantAccountStore',
{
   extend : 'Ext.data.Store',
   requires : ['Genesis.model.Merchant'],
   config :
   {
      model : 'Genesis.model.Merchant',
      autoLoad : false,
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         defaultHeaders :
         {
            'If-None-Match' : ''
         },
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'merchantAccountRecords.json',
         reader :
         {
            type : 'json'
         }
      }
   }
});
