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
            obj.set('id', value);
            return (value) ? Genesis.fn.convertDate(value) : null;
         }
      }, 'id', 'facebook_id', 'name', 'points'],
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
   statics :
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
