Ext.define('Genesis.model.CustomerJSON',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'CustomerJSON',
   id : 'CustomerJSON',
   config :
   {
      proxy :
      {
         type : 'localstorage',
         id : 'CustomerJSON',
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json'
         }
      },
      identifier : 'uuid',
      fields : ['json', 'id'],
      idProperty : 'id'
   }
});

Ext.define('Genesis.model.Customer',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Checkin', 'Genesis.model.Merchant'],
   alternateClassName : 'Customer',
   id : 'Customer',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         name : 'merchant',
         setterName : 'setMerchant',
         getterName : 'getMerchant',
      },
      {
         model : 'Genesis.model.User',
         associationKey : 'user',
         name : 'user',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      hasOne : [
      {
         model : 'Genesis.model.Checkin',
         associationKey : 'last_check_in',
         name : 'last_check_in',
         // User to make sure no underscore
         getterName : 'getLastCheckin',
         setterName : 'setLastCheckin'
      }],
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
      fields : ['id', 'points', 'prize_points', 'visits', 'next_badge_visits', 'eligible_for_reward', 'eligible_for_prize', 'badge_id', 'next_badge_id'],
      idProperty : 'id'
   },
   getUser : function()
   {

   },
   inheritableStatics :
   {
      isValid : function(customerId)
      {
         return customerId != 0;
      },
      updateCustomer : function(cOld, cNew)
      {
         var attrib, sync = false;
         cOld.beginEdit();
         for (var i = 0; i < cOld.fields.length; i++)
         {
            attrib = cOld.fields.items[i].getName();
            if (cOld.get(attrib) != cNew.get(attrib))
            {
               cOld.set(attrib, cNew.get(attrib));
               sync = true;
            }
         }
         try
         {
            if (cOld.getLastCheckin() != cNew.getLastCheckin())
            {
               cOld.setLastCheckin(cNew.getLastCheckin());
               sync = true;
            }
         }
         catch (e)
         {
            cOld.setLastCheckin(Ext.create('Genesis.model.Checkin'));
            sync = true;
         }
         var oMerchant = cOld.getMerchant() || '';
         var nMerchant = cNew.getMerchant() || '';
         var oString = oMerchant.toString();
         var nString = nMerchant.toString();
         if ((oString != nString) && (nString != ''))
         {
            cOld.handleInlineAssociationData(
            {
               'merchant' : nMerchant.raw
            });
            sync = true;
         }

         cOld.endEdit();

         return sync;
      },
      setFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/tokens/create_from_facebook' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
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
      setGetCustomerUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/customers/show_account');
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
      },
      setSendPtsXferUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/customers/transfer_points');
      },
      setRecvPtsXferUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/customers/receive_points');
      }
   }
});
