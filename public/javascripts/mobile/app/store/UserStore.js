Ext.require(['Genesis.model.User'], function()
{

   Ext.define('Genesis.store.UserStore', {
      extend : 'Ext.data.store',
      model : 'Genesis.model.User',
      requires : ['Genesis.model.User'],
      proxy : {
         type : (!phoneGapAvailable) ? 'ajax' : 'offlineajax',
         url : Ext.Loader.getPath("Genesis") + "/../" + 'userData.json',
         reader : {
            type : 'json',
            root : 'users'
         }
      }
      //,autoLoad : true
   });
});
