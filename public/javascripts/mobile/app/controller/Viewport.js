Ext.define('Genesis.controller.Viewport',
{
   extend : 'Genesis.controller.ControllerBase',
   /*
    requires : ['Genesis.controller.MainPage'
    //,'Genesis.controller.LoginPage'
    ],
    */
   statics :
   {
   },
   //Postfix convention
   //Browse - Feature Browse
   //Mode - Modes supported by the Feature
   //Page - Home Page for Feature
   config :
   {
      refs :
      {
         view :
         {
            selector : 'viewportview'
         },
         shareBtn :
         {
            selector : 'viewportview button[tag=shareBtn]'
         },
         mainBtn :
         {
            selector : 'viewportview button[tag=main]'
         }
      },
      control :
      {
         'viewportview' :
         {
            push : 'onPush'
         },
         'viewportview button[tag=shareBtn]' :
         {
            tap : 'onShareMerchantTap'
         },
         'viewportview button[tag=close]' :
         {
            tap : 'popView'
         },
         'viewportview button[tag=main]' :
         {
            tap : 'onMainButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=info]' :
         {
            tap : 'onInfoTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=home]' :
         {
            tap : 'onHomeButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=accounts]' :
         {
            tap : 'onAccountsButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=challenges]' :
         {
            tap : 'onChallengesButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=rewards]' :
         {
            tap : 'onRewardsButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=redeem]' :
         {
            tap : 'onRedemptionsButtonTap'
         },
         'tabbar' :
         {
            tabchange : 'onTabBarTabChange'
         }
      }
   },
   onFeatureTap : function(feature, subFeature)
   {
      var controller = this.getApplication().getController(feature);
      if(!subFeature)
      {
         controller.openMainPage();
      }
      else
      {
         controller.openPage(subFeature);
      }
   },
   onShareMerchantTap : function(b, e, eOpts)
   {
   },
   onInfoTap : function(b, e, eOpts)
   {
      // Open Info ActiveSheet
      //this.getApplication().getView('Viewport').pushView(vp.getInfo());
   },
   onMainButtonTap : function(b, e, eOpts, eInfo)
   {
      var viewport = this.getViewport();
      var ccustomerId = viewport.getCheckinInfo().customerId;
      var cvenueId = viewport.getCheckinInfo().venueId;
      if((ccustomerId == 0) || (cvenueId == 0))
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : 'You cannot visit Merchant Main Page until you Check in'
         });
         return;
      }

      var vrecord = Ext.StoreMgr.get('AccountsStore').getById(cvenueId);
      var cntlr = this.getApplication().getController('Checkins');
      var mCntlr = this.getApplication().getController('Merchants');
      var samePage = mCntlr.getMainPage() == viewport.getActiveItem();

      if((cvenueId > 0) && (viewport.getVenueId() != cvenueId))
      {
         // Restore Merchant Info
         var cmerchantId = vrecord.getMerchant().getId();
         cntlr.setupVenueInfoCommon(vrecord);

         viewport.setCustomerId(ccustomerId);
         viewport.setVenueId(cvenueId);
         this.setCustomerStoreFilter(ccustomerId, cmerchantId);
      }
      console.log("Going to Merchant Home Account Page ...");
      //this.onFeatureTap('Merchants');

      cntlr.setVenueInfo(cvenueId, ccustomerId);
      cntlr.onNonCheckinTap(b, e, eOpts, eInfo, Ext.bind(function()
      {
         var bar = viewport.getNavigationBar();
         bar.titleComponent.setTitle(vrecord.get('name'));

         // Doesn't get called when refreshing the same page
         if(samePage)
         {
            bar.refreshNavigationBarProxy();
            viewport.doSetActiveItem(mCntlr.getMainPage(), null);
         }
      }, this));
   },
   onAccountsButtonTap : function(b, e, eOpts)
   {
      this.onFeatureTap('Accounts');
      console.log("Going to Accounts Page ...");
   },
   onChallengesButtonTap : function(b, e, eOpts)
   {
      this.onFeatureTap('Challenges');
      console.log("Going to Challenges Page ...");
   },
   onRewardsButtonTap : function(b, e, eOpts)
   {
      this.onFeatureTap('RewardsRedemptions', 'rewards');
      console.log("Going to Rewards Page ...");
   },
   onRedemptionsButtonTap : function(b, e, eOpts)
   {
      this.onFeatureTap('RewardsRedemptions', 'redemptions');
      console.log("Going to Redemptions Page ...");
   },
   onHomeButtonTap : function(b, e, eOpts)
   {
      this.getViewport().reset(this);
      this.onFeatureTap('MainPage');
      console.log("Going back to HomePage ...");
   },
   onTabBarTabChange : function(bar, newTab, oldTab, eOpts)
   {
      Ext.defer(function()
      {
         if(newTab)
         {
            newTab.setActive(false);
         }

         if(oldTab)
         {
            oldTab.setActive(false);
         }
      }, 500);
      return true;
   },
   onPush : function(v, activeItem)
   {
   },
   init : function(app)
   {
      this.callParent(arguments);
      console.log("Viewport Init");
   },
   /*
    onSwipe : function(e, touch, opts)
    {
    var viewport = this.getView();
    var bar = viewport.getNavigationBar();
    switch (opts.direction)
    {
    case 'up' :
    case 'left' :
    break;
    case 'down' :
    {
    if(bar.getDefaultBackButtonText() == bar.config.altBackButtonText)
    {
    viewport.popView();
    }
    break;
    }
    case 'right' :
    {
    if(bar.getDefaultBackButtonText() == bar.config.defaultBackButtonText)
    {
    viewport.popView();
    }
    break;
    }
    }
    },
    */
   openMainPage : function()
   {
      // If not logged in, goto Login Page
      if(!this.loggedIn)
      {
         Ext.StoreMgr.get('AccountsStore').load(
         {
            callback : function()
            {
               this.onFeatureTap('MainPage');
               this.loggedIn = true;
            },
            scope : this
         });
      }
   }
});
