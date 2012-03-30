Ext.define('Genesis.model.Venue',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Challenge', 'Genesis.model.PurchaseReward', 'Genesis.model.CustomerReward'],
   alternateClassName : 'Venue',
   id : 'Venue',
   config :
   {
      fields : ['id', 'name', 'address1', 'address2', 'city', 'state', 'country', 'zipcode', 'phone', 'website', 'latitude', 'longitude', 'created_ts', 'update_ts', 'type', 'merchant_id',
      // Used for Frontend sorting purposes
      'sort_id'],
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      hasMany : [
      {
         model : 'Genesis.model.Challenge',
         name : 'challenges'
      },
      {
         model : 'Genesis.model.PurchaseReward',
         name : 'purchaseReward'
      },
      {
         model : 'Genesis.model.CustomerReward',
         name : 'customerReward'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         defaultHeaders :
         {
            'If-None-Match' : ''
         },
         url : (!debugMode) ? Genesis.constants.host + '/api/v1/venues/find_nearest' : Ext.Loader.getPath("Genesis") + "/store/" + 'checkinRecords.json',
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      idProperty : 'id'
   }
});
