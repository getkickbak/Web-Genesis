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
   onDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Checkins');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var merchantId = record.getMerchant().getId();
      var viewport = me.getViewPortCntlr();

      // Load Venue Info
      //
      me.getGeoLocation(function(position)
      {
         Venue['setGetClosestVenueURL']();
         cestore.load(
         {
            scope : me,
            params :
            {
               'merchant_id' : merchantId,
               latitude : position.coords.latitude,
               longitude : position.coords.longitude
            },
            callback : function(records, operation)
            {
               if(operation.wasSuccessful())
               {
                  for(var i = 0; i < records.length; i++)
                  {
                     viewport.setVenue(records[i]);
                     app.dispatch(
                     {
                        action : 'onCheckinHandler',
                        args : ['explore', cestore.getProxy().getReader().metaData, cstore, null, [record], operation],
                        controller : controller,
                        scope : controller
                     });
                     //
                     // Return to first match
                     //
                     break;
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
