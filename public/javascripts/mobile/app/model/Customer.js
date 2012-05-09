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
      fields : ['points', 'visits', 'id'],
      idProperty : 'id'
   },
   getUser : function()
   {

   },
   statics :
   {
      isValidCustomer : function(customerId)
      {
         return customerId != 0;
      },
      updateCustomer : function(cOld, cNew)
      {
         var attrib;
         for(var i = 0; i < cOld.fields.length; i++)
         {
            attrib = cOld.fields.items[i].getName();
            cOld.set(attrib, cNew.get(attrib));
         }
         cOld.setLastCheckin(cNew.getLastCheckin());
      },
      setFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/tokens/create_from_facebook' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setUpdateFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/account/update_facebook_info');
      },
      setLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/tokens' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setLogoutUrl : function(auth_code)
      {
         this.getProxy().setActionMethods(
         {
            read : 'DELETE'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/tokens/' + auth_code);
      },
      setCreateAccountUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/sign_up' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setVenueScanCheckinUrl : function()
      {
         this.setVenueCheckinUrl();
      },
      setVenueCheckinUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/check_ins' : Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      },
      setVenueExploreUrl : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/venues/' + venueId + '/explore' : Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      }
   }
});
