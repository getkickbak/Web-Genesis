Ext.require(['Genesis.model.User', 'Genesis.model.Deal', 'Genesis.mode.Coupon'], function()
{
   Ext.define('Genesis.model.Order', {
      extend : 'Ext.data.Model',
      id : 'Order',
      fields : ['order_id', 'subdeal_id', 'referral_id', 'quantity', 'purchase_date', 'total_payment', 'payment_confirmed', 'txn_id', 'created_ts', 'update_ts'],
      belongsTo : [{
         model : 'Genesis.model.User',
         name : 'user'
      }, {
         model : 'Genesis.model.Deal',
         name : 'deal'
      }],
      hasMany : 'Genesis.model.Coupon'
   });
});
