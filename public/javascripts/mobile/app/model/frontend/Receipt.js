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
      fields : ['id', 'tnxId',
      {
         name : 'subtotal',
         type : 'float'
      }, 'itemsPurchased',
      {
         name : 'price',
         type : 'float'
      }, 'title', 'table', 'receipt'],
      idProperty : 'id',
      hasMany : [
      {
         model : 'Genesis.model.frontend.ReceiptItem',
         name : 'items'
      }],
      proxy :
      {
         type : 'browserdb',
         dbName : 'KickBak',
         objectStoreName : 'Receipt',
         //dbVersion : '1.0',
         writer :
         {
            type : 'json',
            writeAllFields : false
         }
      }
   },
   inheritableStatics :
   {
   }
});
