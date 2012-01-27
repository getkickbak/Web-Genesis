Ext.define('Genesis.store.MainPageStore',
{
   extend : 'Ext.data.Store',
   requires : ['Genesis.model.MainPage'],
   config :
   {
      model : 'Genesis.model.MainPage',
      autoLoad : true
   },
});
