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
      fields : ['json', 'id'],
      idProperty : 'id'
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
      fields : ['venue_id', 'venue_name', 'id'],
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
         this.getProxy().setUrl(serverHost + '/api/v1/devices/get_encryption_key');
      }
   }
});
