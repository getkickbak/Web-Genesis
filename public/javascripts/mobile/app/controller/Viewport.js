var _application;

Ext.define('Genesis.controller.Viewport',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.util.DelayedTask'],
   statics :
   {
   },
   config :
   {
      sound_files : null,
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
         checkInNowBtn : 'button[tag=checkInNow]' //All CheckInNow Buttons
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
   gatherCheckinInfoMsg : 'Gathering Checkin information ...',
   retrieveChallengesMsg : 'Retrieving Challenges ...',
   fbShareSuccessMsg : 'Posted on your Timeline!',
   onFeatureTap : function(feature, subFeature)
   {
      if((appName == 'GetKickBak') && !Ext.device.Connection.isOnline() && (subFeature != 'login'))
      {
         Ext.device.Notification.show(
         {
            title : 'Network Error',
            message : 'You have lost internet connectivity'
         });
         return;
      }

      var app = this.getApplication();
      var controller = app.getController(feature);
      app.dispatch(
      {
         action : (!subFeature) ? 'openMainPage' : 'openPage',
         args : (!subFeature) ? [] : [subFeature],
         controller : controller,
         scope : controller
      });
   },
   onShareMerchantTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var site = Genesis.constants.site;
      //var db = Genesis.constants.getLocaDB();
      Genesis.constants.facebook_onLogin(function(params)
      {
         var venue = me.getVenue();
         var merchant = venue.getMerchant();
         console.log('Posting to Facebook ...');
         FB.api('/me/feed', 'post',
         {
            name : venue.get('name'),
            //link : href,
            link : venue.get('website') || site,
            caption : venue.get('website') || site,
            description : venue.get('description'),
            picture : merchant.get('photo')['thumbnail_ios_medium'].url,
            message : 'Check out this place!'
         }, function(response)
         {
            Ext.Viewport.setMasked(false);
            if(!response || response.error)
            {
               console.log('Post was not published to Facebook.');
            }
            else
            {
               console.log(me.fbShareSuccessMsg);
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : me.fbShareSuccessMsg
               });
            }
         });
      }, true, false);
   },
   onInfoTap : function(b, e, eOpts, eInfo)
   {
      // Open Info ActiveSheet
      //this.getApplication().getView('Viewport').pushView(vp.getInfo());
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Checkins');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');

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
                  args : [],
                  scope : controller
               });
            }
            else
            {
               Ext.Viewport.setMasked(false);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg
               });
            }
         },
         scope : me
      });
   },
   onCheckinScanTap : function(b, e, eOpts, einfo)
   {
      var me = this;

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.gatherCheckinInfoMsg
      });
      me.getGeoLocation();
   },
   onAccountsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.onFeatureTap('Accounts');
      console.log("Going to Accounts Page ...");
   },
   onChallengesButtonTap : function(b, e, eOpts, eInfo)
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

               me.onFeatureTap('client.Challenges');
               console.log("Going to Challenges Page ...");
            }
         }
      });
   },
   onRewardsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.onFeatureTap('client.Rewards', 'rewards');
      console.log("Going to Client Rewards Page ...");
   },
   onRedemptionsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.onFeatureTap('client.Redemptions', 'redemptions');
      console.log("Going to Client Redemptions Page ...");
   },
   onPrizesButtonTap : function(b, e, eOpts, eInfo)
   {
      this.onFeatureTap('Prizes');
      console.log("Going to Prizes Page ...");
   },
   onHomeButtonTap : function(b, e, eOpts, eInfo)
   {
      var vport = this.getViewport();
      vport.reset();
      vport.setFlipAnimation();
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
      var me = this;
      console.log("Viewport Init");
      _application = app;

      me.callParent(arguments);

      console.log("Loading License Keys ...");
      Genesis.constants.getPrivKey();
      QRCodeReader.prototype.scanType = "Default";
      console.debug("QRCode Scanner Mode[" + QRCodeReader.prototype.scanType + "]")

      //
      // Initialize Facebook
      //
      if(!merchantMode)
      {
         Genesis.constants.initFb();
         me.updateRewardsTask = Ext.create('Ext.util.DelayedTask');
      }

      //
      // Initialize Sound Files, make it non-blocking
      //
      Ext.defer(function()
      {
         this.sound_files =
         {
         };
         var soundList = [//
         ['rouletteSpinSound', 'roulette_spin_sound', 'Media'], //
         ['winPrizeSound', 'win_prize_sound', 'Media'], //
         ['clickSound', 'click_sound', 'FX'], //
         //['refreshListSound', 'refresh_list_sound', 'FX'], //
         ['beepSound', 'beep.wav', 'FX']];

         for(var i = 0; i < soundList.length; i++)
         {
            this.loadSoundFile.apply(this, soundList[i]);
         }
      }, 1, me);
   },
   loadSoundFile : function(tag, sound_file, type)
   {
      var me = this;
      var ext = '.' + (sound_file.split('.')[1] || 'mp3');
      sound_file = sound_file.split('.')[0];
      if(Genesis.constants.isNative())
      {
         switch (type)
         {
            case 'FX' :
               LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, function()
               {
                  console.debug("loaded " + sound_file);
               }, function(err)
               {
                  console.debug("Audio Error: " + err);
               });
               break;
            case 'Audio' :
               LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, 3, function()
               {
                  console.debug("loaded " + sound_file);
               }, function(err)
               {
                  console.debug("Audio Error: " + err);
               });
               break;
            case 'Media' :
               sound_file = new Media('resources/audio/' + sound_file + ext, function()
               {
                  //console.log("loaded " + me.sound_files[tag].name);
                  me.sound_files[tag].successCallback();
               }, function(err)
               {
                  console.log("Audio Error: " + err);
               });
               break;
         }
      }
      else
      {
         var elem = Ext.get(sound_file);
         if(elem)
         {
            elem.dom.addEventListener('ended', function()
            {
               me.sound_files[tag].successCallback();
            }, false);
         }
      }

      //console.debug("Preloading " + sound_file + " ...");

      me.sound_files[tag] =
      {
         name : sound_file,
         type : type
      };
   },
   openMainPage : function()
   {
      var db = Genesis.constants.getLocalDB();
      var loggedIn = (db['auth_code']) ? true : false;
      if(!merchantMode)
      {
         if(loggedIn)
         {
            var app = this.getApplication();
            var controller = app.getController('MainPage');

            this.setLoggedIn(loggedIn);
            console.debug("Going to Main Page ...");
            if(db['currFbId'] > 0)
            {
               app.dispatch(
               {
                  action : 'facebookLogin',
                  args : [db['fbResponse']],
                  controller : controller,
                  scope : controller
               });
            }
            else
            {
               // No need to pass login info, the auth_code will take care of that!
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
            console.debug("Going to Login Page ...");
            this.onFeatureTap('MainPage', 'login');
         }
      }
   }
});
