Ext.define('Genesis.controller.Merchants',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
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
         page :
         {
            selector : 'merchantaccountpageview',
            autoCreate : true,
            xtype : 'merchantaccountpageview'
         },
         explore :
         {
            selector : 'merchantaccountexploreview',
            autoCreate : true,
            xtype : 'merchantaccountexploreview'
         },
         main :
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
            activate : 'onMainActivate',
            deactivate : 'onMainDeactivate'
         },
         'merchantaccountview button[ui=yellow]' :
         {
            tap : 'onMerchantAccountRewardsTap'
         },
         'merchantaccountview list' :
         {
            select : 'onMainSelect',
            disclose : 'onMainDisclose'
         }
      }
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Merchants Init");
   },
   onMainActivate : function()
   {
      var viewport = this.getViewport();
      var page = this.getMain();
      var customerId = viewport.getCustomerId();
      var venueId = viewport.getVenueId();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var vrecord = Ext.StoreMgr.get('VenueStore').getById(venueId);
      var merchantId = vrecord.getMerchant().getId();
      var crecord = cstore.getById(merchantId);

      this.setCustomerStoreFilter(customerId, merchantId);
      page.query('component[tag=photo]')[0].setData(
      {
         photoUrl : vrecord.getMerchant().data.photo_url
      });
      page.query('formpanel')[0].setValues(
      {
         lastCheckin : crecord.getLastCheckin().data.time,
         regMembers : 0,
         ptsEarn : 0,
         ptsSpent : 0,
         ptsAvail : crecord.get('points')
      });
      var cvenueId = viewport.getCheckinInfo().venueId;
      var show = (venueId != cvenueId) && (cvenueId > 0);
      viewport.query('button[tag=main]')[0][show ? 'show' : 'hide']();
      viewport.query('button[tag=browse]')[0].show();
   },
   onMainDeactivate : function()
   {
      var viewport = this.getViewport();
      viewport.query('button[tag=browse]')[0].hide();
   },
   onMainDisclose : function(list, record, target, index, e, eOpts)
   {
   },
   onMainSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onMainDisclose(d, model);
      return false;
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      // Check if this is the first time logging into the venue
      var view = (this.getViewport().getCustomerId() > 0);
      return this[view ? 'getMain' : 'getPage']();
   },
   openMainPage : function()
   {
      // Check if this is the first time logging into the venue
      this.pushView(this.getMainPage());
      console.log("Merchant Account Opened");
   }
});
