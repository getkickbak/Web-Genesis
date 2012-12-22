Ext.define('Genesis.model.frontend.JackpotWinner',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'JackpotWinner',
   id : 'JackpotWinner',
   config :
   {
      fields : [
      {
         name : 'time',
         type : 'date',
         convert : function(value, obj)
         {
            obj.set('date', value);
            return (value) ? Genesis.fn.convertDate(value) : null;
         }
      }, 'facebook_id', 'name', 'points', 'date'],
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
      setGetJackpotWinnersUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/customers/show_jackpot_winners');
      }
   }
});
