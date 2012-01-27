Ext.define('Genesis.controller.Merchants',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : [
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics :
   {
      merchantMain_path : '/merchantMain',
      merchant_path : '/merchant'
   },
   xtype : 'merchantsCntlr',
   config :
   {
      refs :
      {
         merchantAccountPage :
         {
            selector : 'merchantaccountpageview',
            autoCreate : true,
            xtype : 'merchantaccountpageview'
         },
         merchantAccountBrowse :
         {
            selector : 'merchantaccountbrowseview',
            autoCreate : true,
            xtype : 'merchantaccountbrowseview'
         },
         merchantAccount :
         {
            selector : 'merchantaccountview',
            autoCreate : true,
            xtype : 'merchantaccountview'
         }
      },
      control :
      {
         'merchantaccountview' :
         {
            activate : 'onMerchantAccountActivate'
         },
         'merchantaccountview button[ui=yellow]' :
         {
            tap : 'onMerchantAccountRewardsTap'
         },
         'merchantaccountview list' :
         {
            disclose : 'onMerchantAccountDisclose'
         }
      }
   },
   init : function()
   {
      this.callParent(arguments);
   },
   onMerchantAccountActivate : function()
   {
      var page = this.getMerchantAccount();
      var customerId = this.getViewport().getCustomerId();
      var venueId = this.getViewport().getVenueId();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var vrecord = Ext.StoreMgr.get('VenueStore').getById(venueId);
      var crecord = cstore.getById(customerId);

      this.setCustomerStoreFilter(customerId, vrecord.getMerchant().getId());
      page.query('component[tag=photo]')[0].setData(
      {
         photoUrl : vrecord.getMerchant().data.photo_url
      });
      page.query('formpanel')[0].setValues(
      {
         lastCheckin : crecord.getLastCheckin().data.time,
         regMembers : 0,
         ptsEarn : 0,
         ptsSpent : 0
      });
   },
   onMerchantAccountRewardsTap : function(b, e, eOpts)
   {
      this.getApplication().getController('RewardsRedemptions').openMainPage();
   },
   onMerchantAccountDisclose : function(ecord, target, index, e, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      // Check if this is the first name logging into the venue
      if(this.getViewport().getCustomerId() > 0)
      {
         var page = this.getMerchantAccount();
         var vrecord = Ext.StoreMgr.get('VenueStore').getById(this.getViewport().getVenueId());

         page.getInitialConfig().title = vrecord.getData().name;
         this.pushView(page);
      }
      else
      {
         this.pushView(this.getMerchantAccountPage());
      }
      console.log("Merchant Account Opened");
   }
});
