Ext.define('Genesis.model.frontend.MainPage',
{
   extend : 'Ext.data.Model',
   id : 'MainPage',
   config :
   {
      fields : ['name', 'photo_url', 'desc', 'pageCntlr', 'subFeature'],
      proxy :
      {
         reader :
         {
            type : 'json'
         },
         type : 'ajax',
         disableCaching : false,
         defaultHeaders :
         {
            'If-None-Match' : ''
         },
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'mainPage.json'
      }
   }
});
