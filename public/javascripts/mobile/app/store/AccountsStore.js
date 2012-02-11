Ext.define('Genesis.store.AccountsStore',
{
   extend : 'Ext.data.Store',
   requires : ['Genesis.model.Venue'],
   config :
   {
      model : 'Genesis.model.Venue',
      grouper :
      {
         groupFn : function(record)
         {
            return record.get('name')[0].toUpperCase();
         }
      },
      autoLoad : false,
      proxy :
      {
         type : 'ajax',
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'accountsRecords.json',
         reader :
         {
            type : 'json',
            rootProperty : 'accounts'
         }
      }
   }
});
