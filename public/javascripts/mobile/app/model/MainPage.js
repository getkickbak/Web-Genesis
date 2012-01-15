Ext.define('Genesis.model.MainPage',
{
   extend : 'Ext.data.Model',
   id : 'MainPage',
   fields : [
   {
      name : 'name',
      type : 'string'
   },
   {
      name : 'photo_url',
      type : 'string'
   },
   {
      name : 'desc',
      type : 'string'
   },
   {
      name : 'pageCntlr',
      type : 'string'
   }]
});
