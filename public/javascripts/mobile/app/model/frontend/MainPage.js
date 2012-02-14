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
            type : 'json',
            rootProperty : 'features'
         },
         type : 'ajax',
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'mainPage.json'
      }
   }
});
