Ext.require(['Genesis.model.Deal'], function()
{
   Ext.define('Genesis.model.SubDeal', {
      extend : 'Ext.data.Model',
      id : 'SubDeal',
      fields : ['title', 'coupon_title', 'regular_price', 'discount_price', 'created_ts', 'update_ts'],
      belongsTo : 'Genesis.model.Deal'
   });
});
