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
         /*
          page :
          {
          selector : 'merchantaccountpageview',
          autoCreate : true,
          xtype : 'merchantaccountpageview'
          },
          */
         pagePanel : 'merchantaccountview dataview[tag=menchantPagePanel]',
         merchantFeedContainer : 'merchantaccountview container[tag=merchantFeedContainer]',
         merchantDescContainer : 'merchantaccountview container[tag=merchantDescContainer]',
         //merchantDescPanel : 'merchantaccountview container[tag=merchantDescPanel]',
         //merchantAddress : 'merchantaccountview component[tag=merchantAddress]',
         //merchantStats : 'merchantaccountview formpanel[tag=merchantStats]',
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
         },
         shareBtn : 'viewportview button[tag=shareBtn]',
         mainBtn : 'viewportview button[tag=main]',
         prizesBtn : 'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=prizes]'
      },
      control :
      {
         main :
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
         },
         'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=checkin]' :
         {
            tap : 'onCheckinTap'
         },
         'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=browse]' :
         {
            tap : 'onBrowseTap'
         }
         /*
          ,'merchantaccountpageview' :
          {
          activate : 'onPageActivate',
          deactivate : 'onPageDeactivate'
          }
          */

      }
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Merchants Init");
   },
   onMainActivate : function()
   {
      var viewport = this.getViewPortCntlr();
      var page = this.getMain();
      var vrecord = viewport.getVenue();
      var crecord = viewport.getCustomer();
      var customerId = viewport.getCustomer().getId();
      var venueId = vrecord.getId();
      var merchantId = vrecord.getMerchant().getId();

      var cvenue = viewport.getCheckinInfo().venue;

      // Refresh Merchant Panel Info
      this.getPagePanel().getStore().setData(vrecord);

      /*
       page.query('component[tag=photo]')[0].setData(
       {
       photoUrl : vrecord.getMerchant().get('photo').thumbnail.url
       });
       */

      if(cvenue && (cvenue.getId() == venueId))
      {
         /*
          page.query('formpanel')[0].setValues(
          {
          lastCheckin : crecord.getLastCheckin().get('time'),
          regMembers : 0,
          ptsEarn : 0,
          ptsSpent : 0,
          ptsAvail : crecord.get('points')
          });
          */
         this.getMerchantDescContainer().hide();
         this.getMerchantFeedContainer().show();
         //this.getMerchantAddress().hide();
         //this.getMerchantStats().show();
      }
      else
      {
         this.getMerchantFeedContainer().hide();
         //this.getMerchantDescPanel().setData(vrecord.getMerchant());
         this.getMerchantDescContainer().show();
         //this.getMerchantAddress().setData(vrecord.getData(true));
         //this.getMerchantAddress().show();
         //this.getMerchantStats().hide();
      }

      this.getMainBtn()[(cvenue && (cvenue.getId() != vrecord.getId())) ? 'show' : 'hide']();
      var prizesCount = 0, prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      for(var i = 0; i < prizes.length; i++)
      {
         if(prizes[i].getMerchant().getId() == merchantId)
         {
            prizesCount++;
         }
      }
      this.getPrizesBtn().setBadgeText((prizesCount > 0) ? prizesCount : null);

      //
      // Scroll to the Top of the Screen
      //
      this.getMain().getScrollable().getScroller().scrollTo(0, 0);
   },
   onMainDeactivate : function()
   {
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
   onCheckinTap : function(b, e, eOpts)
   {
      this.getApplication().getController('Checkins').openPage('checkin');
   },
   onBrowseTap : function(b, e, eOpts)
   {
      this.getApplication().getController('Checkins').openPage('explore');
   },
   // --------------------------------------------------------------------------
   // Merchant Account Page
   // --------------------------------------------------------------------------
   onPageActivate : function()
   {
   },
   onPageDeactivate : function()
   {
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      // Check if this is the first time logging into the venue
      //var view = (this.getViewport().getCustomerId() > 0);
      //return this[view ? 'getMain' : 'getPage']();
      return this.getMain();
   },
   openMainPage : function()
   {
      // Check if this is the first time logging into the venue
      this.pushView(this.getMainPage());
      console.log("Merchant Account Opened");
   }
});
