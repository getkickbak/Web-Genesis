Ext.define('Genesis.model.frontend.MainPage',
{
   extend : 'Ext.data.Model',
   id : 'MainPage',
   config :
   {
      fields : ['name', 'photo_url', 'desc', 'pageCntlr', 'subFeature', 'route', 'hide'],
      proxy :
      {
         noCache : false,
         enablePagingParams : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         type : 'ajax',
         disableCaching : false
      }
   }
});
