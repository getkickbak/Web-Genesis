var _application;

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
      loggedIn : false,
      customer : null,
      venue : null,
      metaData : null,
      checkinInfo :
      {
         venue : null,
         customer : null,
         metaData : null
      },
      refs :
      {
         view : 'viewportview',
         shareBtn : 'viewportview button[tag=shareBtn]',
         checkInNowBtn : 'button[tag=checkInNow]'
      },
      control :
      {
         view :
         {
            push : 'onPush'
         },
         shareBtn :
         {
            tap : 'onShareMerchantTap'
         },
         'viewportview button[tag=close]' :
         {
            tap : 'popView'
         },
         checkInNowBtn :
         {
            tap : 'onCheckinScanTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=info]' :
         {
            tap : 'onInfoTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=home]' :
         {
            tap : 'onHomeButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=prizes]' :
         {
            tap : 'onPrizesButtonTap'
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
         'tabbar[cls=navigationBarBottom] button[tag=redemption]' :
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
      var app = this.getApplication();
      var controller = app.getController(feature);
      app.dispatch(
      {
         action : (!subFeature) ? 'openMainPage' : 'openPage',
         args : (!subFeature) ? [] : [subFeature],
         controller : controller,
         scope : controller
      });
      /*
       var controller = app.getController(feature);
       if(!subFeature)
       {
       controller.openMainPage();
       }
       else
       {
       controller.openPage(subFeature);
       }
       */
   },
   onShareMerchantTap : function(b, e, eOpts)
   {
   },
   onInfoTap : function(b, e, eOpts)
   {
      // Open Info ActiveSheet
      //this.getApplication().getView('Viewport').pushView(vp.getInfo());
   },
   onCheckinScanTap : function(b, e, eOpts, einfo)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Checkins');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');

      me.getGeoLocation(function(position)
      {
         Venue['setFindNearestURL']();
         cestore.load(
         {
            params :
            {
               latitude : position.coords.latitude,
               longitude : position.coords.longitude
            },
            callback : function(records, operation)
            {
               if(operation.wasSuccessful())
               {
                  controller.setPosition(position);
                  app.dispatch(
                  {
                     action : 'onCheckinScanTap',
                     controller : controller,
                     args : [b, e, eOpts, einfo],
                     scope : controller
                  });
               }
               else
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : 'Error loading Venue information.'
                  });
               }
            },
            scope : me
         });
      });
   },
   onAccountsButtonTap : function(b, e, eOpts)
   {
      this.onFeatureTap('Accounts');
      console.log("Going to Accounts Page ...");
   },
   onChallengesButtonTap : function(b, e, eOpts)
   {
      var me = this;
      var venue = me.getVenue();
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : 'Retrieving Challenges ...'
      });
      Challenge['setGetChallengesURL']();
      Challenge.load(venue.getId(),
      {
         params :
         {
            merchant_id : venue.getMerchant().getId(),
            venue_id : venue.getId()
         },
         callback : function(record, operation)
         {
            Ext.Viewport.setMasked(false);
            if(operation.success)
            {
               //
               // Load record into Venue Object
               //
               venue.challenges().add(record);

               me.onFeatureTap('Challenges');
               console.log("Going to Challenges Page ...");
            }
         }
      });
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
   onPrizesButtonTap : function(b, e, eOpts)
   {
      this.onFeatureTap('Prizes');
      console.log("Going to Prizes Page ...");
   },
   onHomeButtonTap : function(b, e, eOpts)
   {
      this.getViewport().reset();
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
      _application = app;
   },
   openMainPage : function()
   {
      //
      // To-do : Use remote call to check whether we have a active session or not
      //
      if(!this.getLoggedIn())
         this.onFeatureTap('MainPage', 'login');
      else
         this.onFeatureTap('MainPage', 'main');

   }
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
});
