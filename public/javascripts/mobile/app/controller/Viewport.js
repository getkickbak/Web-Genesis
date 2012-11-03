Ext.define('Genesis.controller.Viewport',
{
   extend : 'Genesis.controller.ControllerBase',
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
      lastPosition : null,
      refs :
      {
         view : 'viewportview',
         backButton : 'button[tag=back]',
         closeButton : 'button[tag=close]',
         shareBtn : 'button[tag=shareBtn]',
         emailShareBtn : 'actionsheet button[tag=emailShareBtn]',
         fbShareBtn : 'actionsheet button[tag=fbShareBtn]',
         checkInNowBtn : 'button[tag=checkInNow]' //All CheckInNow Buttons
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
         backButton :
         {
            tap : 'onBackButtonTap'
         },
         closeButton :
         {
            tap : 'onBackButtonTap'
         },
         checkInNowBtn :
         {
            tap : 'onCheckinScanTap'
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
         //
         view :
         {
            activate : 'onActivate'
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
         //
         'viewportview button' :
         {
            tap : 'onButtonTap'
         },
         'actionsheet button' :
         {
            tap : 'onButtonTap'
         }
      },
      listeners :
      {
         'viewanimend' : 'onViewAnimEnd',
         'baranimend' :
         {
            buffer : 0.5 * 1000,
            fn : 'onBarAnimEnd'
         },
         'completeRefreshCSRF' : 'onCompleteRefreshCSRF',
         'pushview' : 'pushView',
         'silentpopview' : 'silentPopView',
         'popview' : 'popView',
         'resetview' : 'resetView'
      }
   },
   mainPageStorePathToken : /\{platform_path\}/mg,
   popViewInProgress : false,
   viewStack : [],
   animationFlag : 0,
   gatherCheckinInfoMsg : 'Gathering Checkin information ...',
   retrieveChallengesMsg : 'Retrieving Challenges ...',
   fbShareSuccessMsg : 'Posted on your Facebook Timeline!',
   shareReqMsg : function()
   {
      return 'Would you like to do our' + Genesis.constants.addCRLF() + //
      'Referral Challenge?';
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onCompleteRefreshCSRF : Ext.emptyFn,
   onLocationUpdate : function(position)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('client.Checkins');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var proxy = cestore.getProxy();

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
            if (operation.wasSuccessful())
            {
               controller.setPosition(position);
               controller.fireEvent('checkinScan');
            }
            else
            {
               proxy.supressErrorsPopup = true;
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg(operation.getError()),
                  callback : function()
                  {
                     proxy.supressErrorsPopup = false;
                  }
               });
            }
         },
         scope : me
      });
   },
   onActivate : function()
   {
      var me = this;

      //file = Ext.Loader.getPath("Genesis") + "/store/" + ((!merchantMode) ? 'mainClientPage-' : 'mainServerPage-') + file +
      // '.json';
      var file = Ext.Loader.getPath("Genesis") + "/store/" + ((!merchantMode) ? 'mainClientPage' : 'mainServerPage') + '.json';
      var path = "";
      if (Ext.os.is('iOS'))
      {
         path = "";
      }
      else
      if (Ext.os.is('Android'))
      {
         path = "file:///android_asset/www/";
      }
      file = path + file;

      console.log("Loading MainPage Store ...");
      //console.debug("Creating Request [" + path + file + "]");
      var request = new XMLHttpRequest();
      request.onreadystatechange = function()
      {
         if (request.readyState == 4)
         {
            if (request.status == 200 || request.status == 0)
            {
               console.log("Loaded MainPage Store ...");
               var response = Ext.decode(request.responseText.replace(me.mainPageStorePathToken, Genesis.constants._iconPath));
               Ext.StoreMgr.get('MainPageStore').setData(response.data);
            }
         }
      }
      request.open("GET", file, true);
      request.send(null);
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onButtonTap : function(b, e, eOpts)
   {
      Genesis.controller.ControllerBase.playSoundFile(this.sound_files['clickSound']);
   },
   onBackButtonTap : function(b, e, eOpts)
   {
      this.popView();
   },
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
                  var controller = app.getController('client.Challenges');
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
   onShareMerchantTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var site = Genesis.constants.site;
      //var db = Genesis.db.getLocaDB();
      Genesis.fb.facebook_onLogin(function(params)
      {
         var venue = me.getVenue();
         var merchant = venue.getMerchant();
         var photoUrl = merchant.get('photo')['thumbnail_medium_url'];

         console.log('Posting to Facebook ...');
         FB.api('/me/feed', 'post',
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
            Ext.Viewport.setMasked(false);
            if (!response || response.error)
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
      }, true);
   },
   onInfoTap : function(b, e, eOpts, eInfo)
   {
      // Open Info ActiveSheet
      //this.getApplication().getController('Viewport').pushView(vp.getInfo());
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
               Ext.Viewport.setMasked(false);
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
      var info = this.getViewPortCntlr().getCheckinInfo();
      this.redirectTo('venue' + '/' + info.venue.getId() + '/' + info.customer.getId() + '/1');
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
   resetView : function()
   {
      var me = this;
      var vport = me.getViewport();
      //
      // Remove All Views
      //
      me.viewStack = [];
      me.getApplication().getHistory().setActions([]);
      //
      // Remove all internal buffered views
      //
      //delete vport._activeItem;
   },
   pushView : function(view, animation)
   {
      var me = this;
      animation = Ext.apply(animation,
      {
         reverse : false
      });
      var lastView = (me.viewStack.length > 1) ? me.viewStack[me.viewStack.length - 2] : null;

      //
      // Refresh view
      //
      if ((me.viewStack.length > 0) && (view == me.viewStack[me.viewStack.length - 1]['view']))
      {
      }
      //
      // Pop view
      //
      else
      if (lastView && (lastView['view'] == view))
      {
         me.popView();
      }
      //
      // Push view
      //
      else
      {
         //
         // Remember what animation we used to render this view
         //
         var actions = me.getApplication().getHistory().getActions();
         me.viewStack.push(
         {
            view : view,
            animation : animation,
            url : actions[actions.length - 1].getUrl()
         });
         me.getViewport().animateActiveItem(view, animation);
      }
   },
   silentPopView : function(num)
   {
      var me = this;
      num = Math.min(me.viewStack.length, num);
      var actions = me.getApplication().getHistory().getActions();

      if ((me.viewStack.length > 0) && (num > 0))
      {
         while (num-- > 0)
         {
            var lastView = me.viewStack.pop();
            actions.pop();
            //
            // Viewport will automatically detect not to delete current view
            // until is no longer the activeItem
            //
            //me.getViewport().remove(lastView['view']);
         }
      }
   },
   popView : function()
   {
      var me = this;
      var actions = me.getApplication().getHistory().getActions();

      if (me.viewStack.length > 1)
      {
         var lastView = me.viewStack.pop();
         var currView = me.viewStack[me.viewStack.length - 1];

         if (!me.popViewInProgress)
         {
            me.popViewInProgress = true;
            //Ext.defer(function()
            {
               actions.pop();
               //
               // Recreate View if the view was destroyed for DOM memory optimization
               //
               if (currView['view'].isDestroyed)
               {
                  currView['view'] = Ext.create(currView['view'].alias[0]);
                  //console.debug("Recreated View [" + currView['view']._itemId + "]")
               }

               //
               // Update URL
               //
               me.getApplication().getHistory().setToken(currView['url']);
               window.location.hash = currView['url'];

               me.getViewport().animateActiveItem(currView['view'], Ext.apply(lastView['animation'],
               {
                  reverse : true
               }));
            }
            //, 1, me);
         }
      }
      else
      {
         //
         // Go back to HomePage by default
         //
         var info = this.getViewPortCntlr().getCheckinInfo();
         if (info.venue)
         {
            me.redirectTo('venue/' + info.venue.getId() + '/' + info.customer.getId() + '/1');
         }
         else
         {
            me.redirectTo('checkin');
         }
      }
   },
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   init : function(app)
   {
      var me = this;
      console.log("Viewport Init");

      //
      // Initialize global constants
      //
      Genesis.constants.init();

      me.callParent(arguments);

      if (merchantMode)
      {
         console.log("Loading License Keys ...");
         Genesis.constants.getPrivKey();
      }

      QRCodeReader.prototype.scanType = "Default";
      console.debug("QRCode Scanner Mode[" + QRCodeReader.prototype.scanType + "]")

      //
      // Initialize Facebook
      //
      if (!merchantMode)
      {
         Genesis.fb.initFb();
      }

      if (Ext.isDefined(window.device))
      {
         console.debug(//
         "\n" + "device.platform - " + device.platform + //
         "\n" + "Browser EngineVersion - " + Ext.browser.engineVersion + //
         "");
      }

      //
      // Initialize Sound Files, make it non-blocking
      //
      Ext.defer(function()
      {
         this.sound_files =
         {
         };
         var soundList;
         if (merchantMode)
         {
            soundList = [//
            ['clickSound', 'click_sound', 'FX'], //
            //['refreshListSound', 'refresh_list_sound', 'FX'], //
            ['beepSound', 'beep.wav', 'FX']];
         }
         else
         {
            soundList = [//
            ['rouletteSpinSound', 'roulette_spin_sound', 'Media'], //
            ['winPrizeSound', 'win_prize_sound', 'Media'], //
            ['losePrizeSound', 'lose_prize_sound', 'Media'], //
            ['promoteSound', 'promote_sound', 'FX'], //
            ['clickSound', 'click_sound', 'FX'], //
            //['refreshListSound', 'refresh_list_sound', 'FX'], //
            ['beepSound', 'beep.wav', 'FX']];
         }

         for (var i = 0; i < soundList.length; i++)
         {
            //console.debug("Preloading " + soundList[i][0] + " ...");
            this.loadSoundFile.apply(this, soundList[i]);
         }
      }, 1, me);
   },
   loadSoundFile : function(tag, sound_file, type)
   {
      var me = this;
      var ext = '.' + (sound_file.split('.')[1] || 'mp3');
      sound_file = sound_file.split('.')[0];
      if (Genesis.constants.isNative())
      {
         var callback = function()
         {
            switch(type)
            {
               case 'FX' :
               {
                  LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, function()
                  {
                     console.debug("loaded " + sound_file);
                  }, function(err)
                  {
                     console.debug("Audio Error: " + err);
                  });
                  break;
               }
               case 'Audio' :
               {
                  LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, 3, function()
                  {
                     console.debug("loaded " + sound_file);
                  }, function(err)
                  {
                     console.debug("Audio Error: " + err);
                  });
                  break;
               }
            }
         }
         switch(type)
         {
            case 'Media' :
            {
               sound_file = new Media((Ext.os.is('Android') ? '/android_asset/www/' : '') + 'resources/audio/' + sound_file + ext, function()
               {
                  //console.log("loaded " + me.sound_files[tag].name);
                  me.sound_files[tag].successCallback();
               }, function(err)
               {
                  me.sound_files[tag].successCallback();
                  console.log("Audio Error: " + err);
               });
               break;
            }
            default :
               LowLatencyAudio['unload'](sound_file, callback, callback);
               break;
         }
      }
      else
      {
         var elem = Ext.get(sound_file);
         if (elem)
         {
            elem.dom.addEventListener('ended', function()
            {
               me.sound_files[tag].successCallback();
            }, false);
         }
      }

      me.sound_files[tag] =
      {
         name : sound_file,
         type : type
      };
   },
   openMainPage : function()
   {
      var me = this;
      if (!merchantMode)
      {
         var db = Genesis.db.getLocalDB();
         var loggedIn = (db['auth_code']) ? true : false;
         me.resetView();
         if (loggedIn)
         {
            //var app = this.getApplication();
            //var controller = app.getController('MainPage');

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
   }
});
