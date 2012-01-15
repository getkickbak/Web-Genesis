Ext.require(['Genesis.model.User', 'Genesis.mode.Deal', 'Genesis.model.Order'], function()
{
   Ext.define('Genesis.model.Coupon', {
      extend : 'Ext.data.Model',
      id : 'Coupon',
      fields : ['coupon_id', 'coupon_title', 'paid_amount', 'expiry_date', 'barcode', 'qr_code', 'redeemed', 'paid_merchant', 'created_ts', 'update_ts'],
      belongsTo : ['Genesis.model.User', 'Genesis.model.Deal', 'Genesis.model.Order']
   });
});
