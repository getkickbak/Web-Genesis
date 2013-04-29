Ext.define('KickBak.model.CustomerReward',
{
   extend : 'Ext.data.Model',
   id : 'CustomerReward',
   alternateClassName : 'CustomerReward',
   config :
   {
      fields : ['id', 'title', 'points', 'type', 'photo', 'quantity_limited', 'quantity', 'time_limited',
      {
         name : 'expiry_date',
         type : 'date',
         convert : function(value, format)
         {
            value = Date.parse(value, "yyyy-MM-dd");
            return (value) ? KickBak.fn.convertDateNoTimeNoWeek(value) : null;
         }
      }],
      idProperty : 'id',
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
      }
   },
   inheritableStatics :
   {
   }
});
