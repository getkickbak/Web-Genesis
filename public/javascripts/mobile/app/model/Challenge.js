Ext.define('Genesis.model.Challenge',
{
   extend : 'Ext.data.Model',
   id : 'Challenge',
   alternateClassName : 'Challenge',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      fields : ['id', 'type', 'name', 'description',
      // Image associated with the Challenge
      'photo_url', 'require_verif', 'data', 'points', 'created_ts', 'update_ts', 'merchant_id', 'venue_id']
   },
   getMerchant : function()
   {

   }
});
