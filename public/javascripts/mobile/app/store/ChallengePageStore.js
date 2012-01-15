Ext.define('Genesis.store.ChallengePageStore',
{
   extend : 'Ext.data.Store',
   model : 'Genesis.model.Challenge',
   requires : ['Genesis.model.Challenge'],
   autoLoad : true,
   proxy :
   {
      type : (!phoneGapAvailable) ? 'ajax' : 'offlineajax',
      url : Ext.Loader.getPath("Genesis") + "/store/" + 'challengePage.json'
   }
});
