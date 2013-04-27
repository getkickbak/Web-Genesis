Ext.define('Genesis.model.Venue',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Challenge', 'Genesis.model.PurchaseReward', 'Genesis.model.CustomerReward'],
   alternateClassName : 'Venue',
   id : 'Venue',
   config :
   {
      fields : ['id', 'name', 'address', 'description', 'distance', 'city', 'state', 'country', 'zipcode', 'phone', 'website', 'latitude', 'longitude', 'created_ts', 'update_ts', 'type', 'merchant_id',
      // Winners Count for front end purposes
      'prize_jackpots'],
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
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      idProperty : 'id'
   },
   inheritableStatics :
   {
      setGetMerchantVenueExploreURL : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/' + venueId + '/merchant_explore');
      },
      setFindNearestURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/find_nearest');
      },
      setGetClosestVenueURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/find_closest');
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
         this.getProxy().setUrl(serverHost + '/api/v1/venues/share_photo');
      },
      setGetLicenseKeyURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/updateLicenseKey');
      }
   }

});
