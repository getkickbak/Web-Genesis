Ext.require(['Genesis.model.Merchant'], function()
{
   Ext.define('Genesis.model.Venue', {
      extend : 'Ext.data.Model',
      id : 'Merchant',
      fields : ['name', 'address1', 'address2', 'city', 'state', 'country', 'zipcode', 'phone', 'website', 'latitude', 'longtitude', 'created_ts', 'update_ts'],
      belongsTo : 'Genesis.model.Merchant'
   });
});
