Ext.define('Genesis.model.Order',
{
   extend : 'Ext.data.Model',
   id : 'Order',
   requires : ['Genesis.model.Coupon'],
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.User',
         associatedKey : 'user'
      },
      {
         model : 'Genesis.model.Deal',
         associatedKey : 'deal'
      }],
      hasMany :
      {
         model : 'Genesis.model.Coupon',
         associatedKey : 'posts',
         name : 'posts'
      },
      fields : ['order_id', 'subdeal_id', 'referral_id', 'quantity', 'purchase_date', 'total_payment', 'payment_confirmed', 'txn_id', 'created_ts', 'update_ts']
   }
});
