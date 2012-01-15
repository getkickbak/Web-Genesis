Ext.require(['Genesis.model.Merchant', 'Genesis.model.User'], function()
{
   Ext.define('Genesis.model.Customer', {
      extend : 'Ext.data.Model',
      id : 'Customer',
      fields : ['auth_code', 'qr_code', 'points', 'last_check_in', 'created_ts', 'update_ts'],
      belongsTo : ['Genesis.model.Merchant', 'Genesis.model.User']
   });
});
