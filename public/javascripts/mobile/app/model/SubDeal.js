Ext.define('Genesis.model.SubDeal',
{
   extend : 'Ext.data.Model',
   id : 'SubDeal',
   config :
   {
      belongsTo : 'Genesis.model.Deal',
      fields : ['title', 'coupon_title', 'regular_price', 'discount_price', 'created_ts', 'update_ts']
   }
});
