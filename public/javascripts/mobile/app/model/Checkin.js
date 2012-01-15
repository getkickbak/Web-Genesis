Ext.require(['Genesis.model.User', 'Genesis.model.Merchant'], function()
{
   Ext.define('Genesis.model.Checkin', {
      extend : 'Ext.data.Model',
      id : 'Checkin',
      fields : ['time'],
      belongsTo : ['Genesis.model.User', 'Genesis.model.Merchant']
   });
});
