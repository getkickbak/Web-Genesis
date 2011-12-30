Ext.require(['Genesis.model.Merchant'], function()
{

   Ext.define('Genesis.store.MerchanStore', {
      extend : 'Ext.data.store',
      model : 'Genesis.model.Merchant',
      requires : ['Genesis.model.Merchant'],
      proxy : {
         type : (!phoneGapAvailable) ? 'ajax' : 'offlineajax',
         url : Ext.Loader.getPath("Genesis") + "/../" + 'merchantData.json',
         reader : {
            type : 'json',
            root : 'accounts'
         }
      }
      //,autoLoad : true
   });
});
