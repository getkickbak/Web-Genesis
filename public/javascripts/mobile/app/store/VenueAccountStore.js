Ext.define('Genesis.store.VenueAccountStore',
{
   extend : 'Ext.data.Store',
   requires : ['Genesis.model.Venue'],
   config :
   {
      model : 'Genesis.model.Veune',
      autoLoad : false,
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         defaultHeaders :
         {
            'If-None-Match' : ''
         },
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'venueAccountRecords.json',
         reader :
         {
            type : 'json',
            rootProperty : 'venues'
         }
      }
   }
});
