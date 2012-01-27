Ext.define('Genesis.model.Coupon',
{
   extend : 'Ext.data.Model',
   id : 'Coupon',
   config :
   {
      belongsTo : ['Genesis.model.User', 'Genesis.model.Deal', 'Genesis.model.Order'],
      fields : ['coupon_id', 'coupon_title', 'paid_amount', 'expiry_date', 'barcode', 'qr_code', 'redeemed', 'paid_merchant', 'created_ts', 'update_ts'],
      idProperty : 'coupon_id'
   }
});
