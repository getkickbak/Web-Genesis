Ext.define('Genesis.model.frontend.MainPage',
{
   extend : 'Ext.data.Model',
   id : 'MainPage',
   config :
   {
      fields : ['name', 'photo_url', 'desc', 'pageCntlr', 'subFeature', 'route', 'hide'],
      proxy :
      {
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         type : 'ajax',
         disableCaching : false,
         url : Ext.Loader.getPath("Genesis") + "/store/" + ((!merchantMode) ? 'mainClientPage.json' : 'mainServerPage.json')
      }
   }
});
