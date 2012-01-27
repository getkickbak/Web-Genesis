Ext.define('Genesis.model.MainPage',
{
   extend : 'Ext.data.Model',
   id : 'MainPage',
   config :
   {
      fields : ['name', 'photo_url', 'desc', 'pageCntlr'],
      proxy :
      {
         reader :
         {
            type : 'json',
            rootProperty : 'features'
         },
         type : (!phoneGapAvailable) ? 'ajax' : 'offlineajax',
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'mainPage.json'
      }
   }
});
