Ext.require(['Genesis.model.Deal'], function()
{

   Ext.define('Genesis.model.Merchant', {
      extend : 'Ext.data.Model',
      id : 'Merchant',
      fields : ['merchant_id', 'name', 'photo_url', 'email', 'paypal_account', 'first_name', 'last_name', 'address1', 'address2', 'city', 'state', 'country', 'zipcode', 'phone', 'website', 'latitude', 'longtitude', 'created_ts', 'update_ts'],
      hasMany : [{
         model : 'Genesis.model.Deal',
         name : 'deals'
      }]
   });

});
