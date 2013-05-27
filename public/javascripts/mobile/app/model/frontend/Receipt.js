Ext.define('Genesis.model.frontend.ReceiptItem',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'ReceiptItem',
   id : 'ReceiptItem',
   config :
   {
      fields : ['qty', 'price', 'name']
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.model.frontend.Receipt',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Receipt',
   id : 'Receipt',
   config :
   {
      fields : ['id',
      {
         name : 'subtotal',
         type : 'float'
      },
      {
         name : 'price',
         type : 'float'
      }, 'title', 'earned', 'table', 'receipt'],
      idProperty : 'id',
      hasMany : [
      {
         model : 'Genesis.model.frontend.ReceiptItem',
         name : 'items'
      }]
   },
   inheritableStatics :
   {
   }
});
