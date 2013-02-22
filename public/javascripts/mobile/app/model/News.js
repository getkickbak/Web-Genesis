Ext.define('Genesis.model.News',
{
   extend : 'Ext.data.Model',
   id : 'News',
   alternateClassName : 'News',
   config :
   {
      idProperty : 'id',
      fields : ['id', 'item_id', 'title', 'text', 'type', 'item_type', 'photo',
      {
         name : 'created_date',
         type : 'date',
         convert : function(value, format)
         {
            value = Date.parse(value, "yyyy-MM-dd");
            return (value) ? Genesis.fn.convertDateNoTimeNoWeek(value) : null;
         }
      }]
   }
});
