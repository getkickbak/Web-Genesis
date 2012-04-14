Ext.define('Genesis.model.Venue',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Challenge', 'Genesis.model.PurchaseReward', 'Genesis.model.CustomerReward'],
   alternateClassName : 'Venue',
   id : 'Venue',
   config :
   {
      fields : ['id', 'name', 'address', 'city', 'state', 'country', 'zipcode', 'phone', 'website', 'latitude', 'longitude', 'created_ts', 'update_ts', 'type', 'merchant_id',
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
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      idProperty : 'id',
   },
   statics :
   {
      setFindNearestURL : function()
      {
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/venues/find_nearest' : Ext.Loader.getPath("Genesis") + "/store/" + 'checkinRecords.json');
      },
      setGetClosestVenueURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/venues/find_closest' : Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      },
      setSharePhotoURL : function()
      {
         //
         // Not used because we need to use Multipart/form upload
         //
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/venues/share_photo' : Ext.Loader.getPath("Genesis") + "/store/" + 'sharePhoto.json');
      }
   }

});
