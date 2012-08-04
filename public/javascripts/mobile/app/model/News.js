Ext.define('Genesis.model.News',
{
   extend : 'Ext.data.Model',
   id : 'News',
   alternateClassName : 'News',
   config :
   {
      idProperty : 'id',
      fields : ['id', 'item_id', 'title', 'text', 'type', 'item_type', 'photo']
   }
});
