Ext.define('Genesis.model.Deal',
{
   extend : 'Ext.data.Model',
   id : 'Deal',
   requires : ['Genesis.model.SubDeal', 'Genesis.model.Order'],
   config :
   {
      fields : ['deal_id', 'title', 'description', 'mini_description', 'highlights', 'details', 'photo_urls', 'location', 'start_date', 'end_date', 'expiry_date', 'max_per_person', 'max_limit', 'limit_count',
      //'reward_secret_code',
      'created_ts', 'update_ts'],
      belongsTo : 'Genesis.model.Merchant',
      hasMany : [
      /*
       {
       model : 'Genesis.model.Order',
       name : 'orders'
       },
       */
      {
         model : 'Genesis.model.SubDeal',
         name : 'subdeals'
      }]
   }
});
