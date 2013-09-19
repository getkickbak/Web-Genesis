Ext.define('Genesis.model.frontend.LicenseKeyJSON',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'LicenseKeyJSON',
   id : 'LicenseKeyJSON',
   config :
   {
      proxy :
      {
         type : 'localstorage',
         id : 'LicenseKeyJSON',
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json'
         }
      },
      identifier : 'uuid',
      fields : [
      {
         name : 'json',
         type : 'string'
      },
      {
         name : 'id',
         type : 'int'
      }],
      idProperty : 'id'
   }
});

Ext.define('Genesis.model.frontend.LicenseKeyDB',
{
   extend : 'Genesis.model.frontend.LicenseKeyJSON',
   alternateClassName : 'LicenseKeyDB',
   id : 'LicenseKeyDB',
   config :
   {
      proxy :
      {
         type : 'browserdb',
         dbName : 'KickBakLicenseKey',
         pkType : 'INTEGER PRIMARY KEY ASC',
         objectStoreName : 'LicenseKey',
         //dbVersion : '1.0',
         writer :
         {
            type : 'json',
            writeAllFields : false
         }
      }
   }
});

Ext.define('Genesis.model.frontend.LicenseKey',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'LicenseKey',
   id : 'LicenseKey',
   config :
   {
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      fields : ['id'],
      idProperty : 'id'
   },
   inheritableStatics :
   {
      setGetLicenseKeyURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost);
      }
   }
});
