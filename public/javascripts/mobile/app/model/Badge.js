Ext.define('Genesis.model.Badge',
{
   extend : 'Ext.data.Model',
   id : 'Badge',
   alternateClassName : 'Badge',
   config :
   {
      idProperty : 'id',
      fields : ['id', 'type', 'visits', 'rank'],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   inheritableStatics :
   {
      setGetBadgesUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/badges');
      }
   }
});
