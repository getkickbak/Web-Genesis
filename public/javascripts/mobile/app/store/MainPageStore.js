Ext.define('Genesis.store.MainPageStore',
{
   extend : 'Ext.data.Store',
   model : 'Genesis.model.MainPage',
   requires : ['Genesis.model.MainPage'],
   autoLoad : true,
   proxy :
   {
      type : (!phoneGapAvailable) ? 'ajax' : 'offlineajax',
      url : Ext.Loader.getPath("Genesis") + "/store/" + 'mainPage.json'
   }
});
