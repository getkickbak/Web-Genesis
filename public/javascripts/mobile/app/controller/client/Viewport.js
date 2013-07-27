var onBackKeyDown = Ext.emptyFn;

Ext.require(['Genesis.controller.ControllerBase'], function()
{
   if (!Genesis.fn.isNative())
   {
      window.onhashchange = function()
      {
         if (location.hash != ('#' + _application.getHistory().getToken()))
         {
            location.hash = '#' + _application.getHistory().getToken();
            //
            // No need to differentiate between fwd/back, we are a single page app!
            //
            onBackKeyDown();
         }
      }
   }

   // add back button listener
   onBackKeyDown = function(e)
   {
      if (!_application || Ext.Viewport.getMasked())
      {
         return;
      }

      var viewport = _application.getController('client' + '.Viewport');
      if (!viewport || viewport.popViewInProgress)
      {
         return;
      }
      else if (Ext.device.Notification.msg && !Ext.device.Notification.msg.isHidden())
      {
         Ext.device.Notification.dismiss();
         return;
      }
      else if (!viewport.popUpInProgress)
      {
         console.debug("BackButton Pressed");

         var vport = viewport.getViewport();
         var activeItem = (vport) ? vport.getActiveItem() : null;
         if (activeItem)
         {
            var success = false;
            for (var i = 0; i < backBtnCallbackListFn.length; i++)
            {
               success = backBtnCallbackListFn[i](activeItem);
               if (success)
               {
                  break;
               }
            }
            if (!success)
            {
               var backButton = activeItem.query('button[tag=back]')[0];
               var closeButton = activeItem.query('button[tag=close]')[0];
               if ((backButton && !backButton.isHidden()) || //
               (closeButton && !closeButton.isHidden()))
               {
                  viewport.self.playSoundFile(viewport.sound_files['clickSound']);
                  viewport.popView();
               }
            }
            else
            {
               viewport.self.playSoundFile(viewport.sound_files['clickSound']);
               //
               // We have no way to "exit" the app in mobileClient
               //
               if (Genesis.fn.isNative())
               {
                  navigator.app.exitApp();
               }
               else
               {
                  window.location.reload();
               }
            }
         }
      }
   };
});

Ext.define('Genesis.controller.client.Viewport',
{
   extend : 'Genesis.controller.ViewportBase',
   inheritableStatics :
   {
   },
   config :
   {
      apsPayload : null,
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
      lastPosition : null,
      refs :
      {
         shareBtn : 'button[tag=shareBtn]',
         emailShareBtn : 'actionsheet button[tag=emailShareBtn]',
         fbShareBtn : 'actionsheet button[tag=fbShareBtn]'
      },
      control :
      {
         fbShareBtn :
         {
            tap : 'onShareMerchantTap'
         },
         emailShareBtn :
         {
            tap : 'onShareEmailTap'
         },
         'tabbar[tag=navigationBarTop] button[tag=info]' :
         {
            tap : 'onInfoTap'
         },
         'viewportview button[tag=home]' :
         {
            tap : 'onHomeButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=prizes]' :
         {
            tap : 'onPrizesButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=prizesSC]' :
         {
            tap : 'onRedeemPrizesSCButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=accounts]' :
         {
            tap : 'onAccountsButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=challenges]' :
         {
            tap : 'onChallengesButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=rewards]' :
         {
            tap : 'onRewardsButtonTap'
         },
         'viewportview button[tag=rewardsSC]' :
         {
            tap : 'onRewardsSCButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=redemption]' :
         {
            tap : 'onRedemptionsButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=redemptionSC]' :
         {
            tap : 'onRedeemRewardsSCButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=main]' :
         {
            tap : 'onCheckedInAccountTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=checkin]' :
         {
            tap : 'onCheckinTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=browse]' :
         {
            tap : 'onBrowseTap'
         },
         'viewportview dataview[tag=mainMenuSelections]' :
         {
            select : 'onButtonTap'
         },
         'viewportview dataview[tag=badgesMenuSelections]' :
         {
            select : 'onButtonTap'
         },
         'viewportview dataview[tag=challengeMenuSelections]' :
         {
            select : 'onButtonTap'
         },
         'viewportview list[tag=jackpotWinnersList]' :
         {
            select : 'onButtonTap'
         },
         'actionsheet button' :
         {
            tap : 'onButtonTap'
         },
         'datepicker button' :
         {
            tap : 'onButtonTap'
         }
      },
      listeners :
      {
         'completeRefreshCSRF' : 'onCompleteRefreshCSRF',
         'updateDeviceToken' : 'onUpdateDeviceToken'
      }
   },
   fbShareSuccessMsg : 'Posted on your Facebook Timeline!',
   shareReqMsg : function()
   {
      return 'Would you like to do our' + Genesis.constants.addCRLF() + //
      'Referral Challenge?';
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this, payload = me.getApsPayload(), vstore = Ext.StoreMgr.get('VenueStore'), viewport = me, proxy = vstore.getProxy(), params =
      {
         'merchant_id' : payload['merchant_id']
      };

      //
      // GeoLocation is optional
      //
      if (position)
      {
         params = Ext.apply(params,
         {
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         });
      }

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.getVenueInfoMsg
      });
      Venue['setGetClosestVenueURL']();
      vstore.load(
      {
         scope : me,
         params : params,
         callback : function(records, operation)
         {
            me.setApsPayload(null);
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful())
            {
               var record = records[0];
               if (records.length > 1)
               {
                  console.debug('Found ' + records.length + ' venues matching current location, pick the first one ...');
               }

               viewport.setVenue(record);
               controller = me.getApplication().getController('client' + '.Checkins');
               controller.setPosition(position);
               controller.fireEvent('checkin');
            }
            else
            {
               proxy.supressErrorsPopup = true;
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg(operation.getError()),
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     proxy.supressErrorsCallbackFn();
                  }
               });
            }
         }
      });
   },
   onUpdateDeviceToken : function()
   {
      var me = this, mainPage = me.getApplication().getController('client' + '.MainPage'), proxy = Account.getProxy();

      if (me.getLoggedIn() && Genesis.constants.device && mainPage && !mainPage.updatedDeviceToken)
      {
         Account['setUpdateRegUserDeviceUrl']();
         console.debug("setUpdateRegUserDeviceUrl - Refreshing Device Token ...");
         proxy.supressErrorsPopup = true;
         Account.load(0,
         {
            jsonData :
            {
            },
            params :
            {
               device : Ext.encode(Genesis.constants.device)
            },
            callback : function(record, operation)
            {
               proxy.supressErrorsPopup = false;
               if (operation.wasSuccessful())
               {
                  mainPage.updatedDeviceToken = true;
               }
            }
         });
      }
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onShareEmailTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Referral Challenge',
         message : me.shareReqMsg(),
         buttons : ['Yes', 'No'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'yes')
            {
               var app = me.getApplication();
               me.onChallengesButtonTap(null, null, null, null, function()
               {
                  var venue = me.getViewPortCntlr().getVenue();
                  var venueId = venue.getId();
                  var items = venue.challenges().getRange();
                  var controller = app.getController('mobileClient' + '.Challenges');
                  //var list = controller.getReferralsPage().query('list')[0];

                  for (var i = 0; i < items.length; i++)
                  {
                     if (items[i].get('type').value == 'referral')
                     {
                        controller.selectedItem = items[i];
                        break;
                     }
                  }
                  controller.fireEvent('doChallenge');
               });
            }
         }
      });
   },
   onFacebookShareCallback : function(params, op)
   {
      var me = this, fb = Genesis.fb;
      if ((op && op.wasSuccessful()) || (params && (params['type'] != 'timeout')))
      {
         var venue = me.getVenue();
         var merchant = venue.getMerchant();
         var photoUrl = merchant.get('photo')['thumbnail_large_url'];

         console.debug('Posting to Facebook ...');

         Genesis.fb.share(
         {
            name : venue.get('name'),
            //link : href,
            link : venue.get('website') || site,
            caption : venue.get('website') || site,
            description : venue.get('description'),
            picture : photoUrl,
            message : 'Check out this place!'
         }, function(response)
         {
            Ext.Viewport.setMasked(null);
            console.debug(me.fbShareSuccessMsg);

            Ext.device.Notification.show(
            {
               title : 'Facebook Connect',
               message : me.fbShareSuccessMsg,
               buttons : ['OK']
            });
            fb.un('connected', me.onFacebookShareCallback);
            fb.un('unauthorized', me.onFacebookShareCallback);
            fb.un('exception', me.onFacebookShareCallback);
         }, function(response)
         {
            Ext.Viewport.setMasked(null);
            console.debug('Post was not published to Facebook.');
            /*
             Ext.device.Notification.show(
             {
             title : 'Facebook Connect',
             message : me.fbShareSuccessMsg,
             buttons : ['OK']
             });
             */
            fb.un('connected', me.onFacebookShareCallback);
            fb.un('unauthorized', me.onFacebookShareCallback);
            fb.un('exception', me.onFacebookShareCallback);
         });
      }
   },
   onShareMerchantTap : function(b, e, eOpts, eInfo)
   {
      var me = this, site = Genesis.constants.site, fb = Genesis.fb;
      //var FB = window.plugins.facebookConnect;
      //var db = Genesis.db.getLocaDB();
      fb.on('connected', me.onFacebookShareCallback, me);
      fb.on('unauthorized', me.onFacebookShareCallback, me);
      fb.on('exception', me.onFacebookShareCallback, me);
      Genesis.fb.facebook_onLogin(true, null, true);
   },
   onInfoTap : function(b, e, eOpts, eInfo)
   {
      // Open Info ActiveSheet
      // this.application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').pushView(vp.getInfo());
   },
   onAccountsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirect('accounts');
      //this.fireEvent('openpage', 'client.Accounts', null, null);
      console.log("Going to Accounts Page ...");
   },
   onChallengesButtonTap : function(b, e, eOpts, eInfo, callback)
   {
      var me = this;
      var venue = me.getVenue();

      var _onDone = function()
      {
         if (callback)
         {
            callback();
         }
         else
         {
            me.redirectTo('challenges');
            console.log("Going to Challenges Page ...");
         }
      }
      //
      // Retrieve Challenges from server
      //
      if (venue.challenges().getData().length == 0)
      {
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
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  //
                  // Load record into Venue Object
                  //
                  venue.challenges().add(operation.getRecords());

                  _onDone();
               }
            }
         });
      }
      else
      {
         _onDone();
      }
   },
   onRewardsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.fireEvent('openpage', 'client.Rewards', 'rewards', null);
      console.log("Going to Client Rewards Page ...");
   },
   onRewardsSCButtonTap : function(b, e, eOpts, eInfo)
   {
      this.fireEvent('openpage', 'client.Rewards', 'rewardsSC', null);
      console.log("Going to Client Rewards Shortcut Page ...");
   },
   onRedemptionsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('redemptions');
      //this.fireEvent('openpage', 'client.Redemptions', 'redemptions', null);
      console.log("Going to Client Redemptions Page ...");
   },
   onRedeemRewardsSCButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('redeemRewardsChooseSC');
      console.log("Going to Client Redeem Rewards Choose Page ...");
   },
   onPrizesButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('prizes');
      //this.fireEvent('openpage', 'client.Prizes', 'prizes', null);
      console.log("Going to Merchant Prizes Page ...");
   },
   onRedeemPrizesSCButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('redeemPrizesChooseSC');
      console.log("Going to Client Redeem Prizes Choose Page ...");
   },
   onHomeButtonTap : function(b, e, eOpts, eInfo)
   {
      this.resetView();
      this.redirectTo('main');
      console.log("Going back to HomePage ...");
   },
   onCheckedInAccountTap : function(b, e, eOpts, eInfo)
   {
      this.goToMerchantMain(true);
   },
   onBrowseTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('exploreS');
      //this.fireEvent('openpage', 'client.Checkins', 'explore', 'coverUp');
   },
   onCheckinTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('checkin');
      //this.fireEvent('openpage', 'client.Checkins', 'explore', 'coverUp');
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   init : function(app)
   {
      var me = this;

      __initFb__(Genesis, "Genesis");

      me.callParent(arguments);

      console.log("Client Viewport Init");

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
         ['losePrizeSound', 'lose_prize_sound', 'Media'], //
         ['birthdaySound', 'birthday_surprise', 'Media'], //
         ['promoteSound', 'promote_sound', 'FX'], //
         ['clickSound', 'click_sound', 'FX'], //
         //['refreshListSound', 'refresh_list_sound', 'FX'], //
         ['beepSound', 'beep.wav', 'FX']];

         for (var i = 0; i < soundList.length; i++)
         {
            //console.debug("Preloading " + soundList[i][0] + " ...");
            this.loadSoundFile.apply(this, soundList[i]);
         }
      }, 1, me);

      //
      // Sender/Receiver Volume Settings
      // ===============================
      // - For Mobile Phones
      //
      // Client Device always transmits
      //
      var s_vol_ratio, r_vol_ratio, c = Genesis.constants;
      if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
      {
         //(tx)
         s_vol_ratio = (Genesis.fn.isNative()) ? 0.50 : 1.0;
         //Default Volume laying flat on a surface (tx)
         c.s_vol = 50;

         r_vol_ratio = 0.5;
         //(rx)
         c.conseqMissThreshold = 1;
         c.magThreshold = 20000;
         // More samples for better accuracy
         c.numSamples = 4 * 1024;
         //Default Overlap of FFT signal analysis over previous samples
         c.sigOverlapRatio = 0.25;
      }
      //else if (Ext.os.is('Android') || Ext.os.is('BlackBerry'))
      {
         //(tx)
         s_vol_ratio = (Genesis.fn.isNative()) ? 0.50 : 0.30;
         //Default Volume laying flat on a surface (tx)
         c.s_vol = 50;

         //(rx)
         r_vol_ratio = 0.5;
         c.conseqMissThreshold = 1;
         c.magThreshold = 20000;
         c.numSamples = 4 * 1024;
         //Default Overlap of FFT signal analysis over previous samples
         c.sigOverlapRatio = 0.25;
      }

      c.proximityTxTimeout = 20 * 1000;
      c.proximityRxTimeout = 40 * 1000;
      Genesis.fn.printProximityConfig();
      window.plugins.proximityID.init(s_vol_ratio, r_vol_ratio);
   },
   openMainPage : function()
   {
      var me = this;
      var db = Genesis.db.getLocalDB();
      var loggedIn = (db['auth_code']) ? true : false;
      me.resetView();
      if (loggedIn)
      {
         //var app = this.getApplication();
         //var controller = app.getController(()(merchantMode) ? 'server': 'client') + '.MainPage');

         me.setLoggedIn(loggedIn);
         console.debug("Going to SignIn Page ...");
         me.redirectTo('signIn');
      }
      else
      {
         console.debug("Going to Login Page ...");
         Genesis.db.resetStorage();
         me.redirectTo('login');
      }
   }
});

function _onGotoMain()
{
   if (!offlineDialogShown)
   {
      Ext.device.Notification.show(
      {
         title : 'Network Error',
         message : Genesis.controller.ControllerBase.prototype.lostNetworkConenction,
         callback : function()
         {
            Ext.Viewport.setMasked(null);
            var viewport = _application.getController('client' + '.Viewport');
            if (viewport)
            {
               viewport.resetView();
               if (viewport.getLoggedIn())
               {
                  viewport.redirectTo('checkin');
               }
               else
               {
                  viewport.redirectTo('login');
               }
            }
            offlineDialogShown = false;
         }
      });
   }
   offlineDialogShown = true;
};
