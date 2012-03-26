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
            rootProperty : 'customers'
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
            read : 'POST'
         });
         this.getProxy().setUrl('/facebook_sign_in');
         //this.getProxy().setUrl(Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl('/sign_in');
         //this.getProxy().setUrl(Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setCreateAccountUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl('/sign_up');
         //this.getProxy().setUrl(Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setVenueScanCheckinUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      },
      setVenueCheckinUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      },
      setVenueExploreUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      }
   }
});
