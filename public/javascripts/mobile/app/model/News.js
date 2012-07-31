Ext.define('Genesis.model.News',
{
   extend : 'Ext.data.Model',
   id : 'News',
   alternateClassName : 'News',
   config :
   {
      idProperty : 'id',
      fields : ['id', 'news_id', 'news_title', 'news_text', 'news_type', 'photo']
   }
});
