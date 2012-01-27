Ext.define('Genesis.model.Reward',
{
   extend : 'Ext.data.Model',
   id : 'Reward',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      fields : ['type', 'title', 'points', 'created_ts', 'update_ts']
   },
   getMerchant : function()
   {
   }
});
