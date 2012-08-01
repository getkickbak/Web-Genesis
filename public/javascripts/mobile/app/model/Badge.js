Ext.define('Genesis.model.BadgeJSON',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'BadgeJSON',
   id : 'BadgeJSON',
   config :
   {
      proxy :
      {
         type : 'localstorage',
         id : 'BadgeJSON',
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

Ext.define('Genesis.model.Badge',
{
   extend : 'Ext.data.Model',
   id : 'Badge',
   alternateClassName : 'Badge',
   config :
   {
      idProperty : 'id',
      fields : ['id', 'type', 'visits', 'rank']
   },
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
   },
   statics :
   {
      setGetBadgesUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/badges');
      }
   }
});
