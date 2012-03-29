Ext.define('Genesis.model.Customer',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Checkin'],
   alternateClassName : 'Customer',
   id : 'Customer',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      },
      {
         model : 'Genesis.model.User',
         associationKey : 'user',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      hasOne :
      {
         model : 'Genesis.model.Checkin',
         associationKey : 'last_check_in',
         // User to make sure no underscore
         getterName : 'getLastCheckin',
         setterName : 'setLastCheckin'
      },
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         defaultHeaders :
         {
            'If-None-Match' : ''
         },
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      fields : ['points', 'id'],
      idProperty : 'id'
   },
   getUser : function()
   {

   },
   statics :
   {
      setFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? '/facebook_sign_in' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? '/api/v1/tokens' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setLogoutUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'DELETE'
         });
         this.getProxy().setUrl('/api/v1/tokens');
      },
      setCreateAccountUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? '/sign_up' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setVenueScanCheckinUrl : function()
      {
         this.self.setVenueCheckinUrl();
      },
      setVenueCheckinUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? '/api/vi/check_ins' : Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      },
      setVenueExploreUrl : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? '/api/vi/venues/' + venueId + '/show' : Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      }
   }
});
