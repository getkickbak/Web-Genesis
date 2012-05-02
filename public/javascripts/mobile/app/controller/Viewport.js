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
         fbShareBtn : 'actionsheet button[tag=fbShareBtn]',
         checkInNowBtn : 'button[tag=checkInNow]'
      },
      control :
      {
         view :
         {
            push : 'onPush'
         },
         fbShareBtn :
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
   retrieveChallengesMsg : 'Retrieving Challenges ...',
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
      var fb = window.localStorage;
      Genesis.constants.facebook_onLogin(function(params)
      {
         var merchant = this.getVenue().getMerchant();
         FB.ui(
         {
            method : 'stream.publish',
            name : merchant.get('name'),
            //link : href,
            link : Genesis.constants.site,
            caption : Genesis.constants.site,
            description : merchant.get('desc'),
            piture : merchant.get('photo')['thumbnail_ios_medium'].url,
            message : 'Comment'
         }, function(response)
         {
            if(response && response.post_id)
            {
               console.log('Posted to your Facebook Newsfeed. Post ID(' + response.post_id + ')');
            }
            else
            {
               console.log('Post was not published to Facebook.');
            }
         });
      });
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
               latitude : position.coords.getLatitude(),
               longitude : position.coords.getLongitude()
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
                     message : me.missingVenueInfoMsg
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
         message : me.retrieveChallengesMsg
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
            if(operation.wasSuccessful())
            {
               //
               // Load record into Venue Object
               //
               venue.challenges().add(operation.getRecords());

               me.onFeatureTap('Challenges');
               console.log("Going to Challenges Page ...");
            }
         }
      });
   },
   onRewardsButtonTap : function(b, e, eOpts)
   {
      this.onFeatureTap('client.Rewards', 'rewards');
      console.log("Going to Client Rewards Page ...");
   },
   onRedemptionsButtonTap : function(b, e, eOpts)
   {
      this.onFeatureTap('client.Redemptions', 'redemptions');
      console.log("Going to Client Redemptions Page ...");
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
      var local = window.localStorage;
      var loggedIn = (local.getItem('auth_code')) ? true : false;
      if(!merchantMode)
      {
         if(loggedIn)
         {
            var app = this.getApplication();
            var controller = app.getController('MainPage');

            this.setLoggedIn(loggedIn);
            if(local.getItem('currFbId') > 0)
            {
               app.dispatch(
               {
                  action : 'onFacebookTap',
                  args : [],
                  controller : controller,
                  scope : controller
               });
            }
            else
            {
               app.dispatch(
               {
                  action : 'onSignIn',
                  args : [],
                  controller : controller,
                  scope : controller
               });
            }
         }
         else
         {
            this.onFeatureTap('MainPage', 'login');
         }
      }
   }
});
