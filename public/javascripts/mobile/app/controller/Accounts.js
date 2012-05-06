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
   onDisclose : function(list, rec, target, index, e, eOpts)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Checkins');
      //var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var merchantId = rec.getMerchant().getId();
      var viewport = me.getViewPortCntlr();

      // Load Venue Info
      //
      me.getGeoLocation(function(position)
      {
         Venue['setGetClosestVenueURL']();
         Venue.load(merchantId,
         //cestore.load(
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
      });
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
