Ext.require(['Genesis.model.User','Genesis.mode.Deal','Genesis.model.Order'], function()
{l
   Ext.define('Genesis.model.Coupon', {
      extend : 'Ext.data.Model',
      id : 'Order',
      fields : ['coupon_id', 'coupon_title', 'paid_amount', 'expiry_date', 'barcode', 'qr_code', 'redeemed', 'paid_merchant', 'created_ts', 'update_ts'],
      belongsTo : [{
         model : 'Genesis.model.User',
         name : 'user'
      }, {
         model : 'Genesis.model.Deal',
         name : 'deal'
      }, {
         model : 'Genesis.model.Order',
         name : 'order'
      }]
   });
});
