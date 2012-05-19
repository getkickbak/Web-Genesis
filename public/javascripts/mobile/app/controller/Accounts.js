Ext.define('Genesis.controller.Accounts',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      accounts_path : '/accounts'
   },
   xtype : 'accountsCntlr',
   config :
   {
      refs :
      {
         accounts :
         {
            selector : 'accountsview',
            autoCreate : true,
            xtype : 'accountsview'
         },
         accountsList : 'accountsview list[tag=accountsList]'
      },
      control :
      {
         accounts :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         accountsList :
         {
            select : 'onSelect',
            disclose : 'onDisclose'
         }
      }
   },
   models : ['Venue'],
   init : function()
   {
      this.callParent(arguments);
      console.log("Accounts Init");
   },
   // --------------------------------------------------------------------------
   // Accounts Page
   // --------------------------------------------------------------------------
   onActivate : function()
   {
      //
      // Scroll to the Top of the Screen
      //
      this.getAccountsList().getScrollable().getScroller().scrollTo(0, 0);
   },
   onDeactivate : function()
   {
   },
   onSelect : function(list, model, eOpts)
   {
      list.deselect([model]);
      this.onDisclose(list, model);
      return false;
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      var merchantId = me.merchantId;
      var rec = me.rec;
      var mId = rec.getMerchant().getId();
      var customerId = rec.getId();
      var merchantName = rec.getMerchant().get('name');

      /*
       console.debug("AFTER\n" + //
       "Merchant Name : [" + merchantName + "]" + "\n" +
       //
       "Merchant ID : [" + merchantId + "]" + "\n" +
       //
       "Customer ID : [" + customerId + "]");
       */
      Venue['setGetClosestVenueURL']();
      Venue.load(merchantId,
      {
         scope : me,
         params :
         {
            'merchant_id' : merchantId,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(record, operation)
         {
            if(operation.wasSuccessful())
            {
               var metaData = Venue.getProxy().getReader().metaData;
               if(metaData)
               {
                  var app = me.getApplication();
                  var controller = app.getController('Checkins');
                  var cstore = Ext.StoreMgr.get('CustomerStore');
                  var viewport = me.getViewPortCntlr();

                  //
                  // Automatically trigger "metachagne" event
                  // updateRewards(metaData);
                  //

                  //
                  // Setup minimum customer information require for explore
                  //
                  metaData['venue_id'] = record.getId();
                  viewport.setVenue(record);
                  app.dispatch(
                  {
                     action : 'onCheckinHandler',
                     args : ['explore', metaData, cstore, null, [rec], operation],
                     controller : controller,
                     scope : controller
                  });
               }
               else
               {
                  console.log("No MetaData found on Venue!");
               }
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg
               });
            }
         },
      });
   },
   onDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var customerId = record.getId();
      var merchantName = record.getMerchant().get('name');

      me.merchantId = record.getMerchant().getId();
      me.rec = record;

      //
      // Bug Stack Corruption from JS interpreter, probably a JS compiler bug
      //
      /*
       console.debug("BEFORE\n" + //
       "Merchant Name : [" + merchantName + "]" + "\n" +
       //
       "Merchant ID : [" + me.merchantId + "]" + "\n" +
       //
       "Customer ID : [" + customerId + "]");
       */
      me.getGeoLocation();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getAccounts();
   },
   openMainPage : function()
   {
      this.pushView(this.getMainPage());
      console.log("Accounts Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});
