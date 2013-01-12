Ext.define('Genesis.controller.ViewportBase',
{
   extend : 'Genesis.controller.ControllerBase',
   inheritableStatics :
   {
   },
   config :
   {
      sound_files : null,
      refs :
      {
         view : 'viewportview',
         backButton : 'button[tag=back]',
         closeButton : 'button[tag=close]'
      },
      control :
      {
         //
         view :
         {
            activate : 'onActivate'
         },
         backButton :
         {
            tap : 'onBackButtonTap'
         },
         closeButton :
         {
            tap : 'onBackButtonTap'
         },
         //
         'viewportview button' :
         {
            tap : 'onButtonTap'
         },
      }
   },
   mainPageStorePathToken : /\{platform_path\}/mg,
   popViewInProgress : false,
   viewStack : [],
   animationFlag : 0,
   gatherCheckinInfoMsg : 'Prepare to scan Check-in Code ...',
   retrieveChallengesMsg : 'Retrieving Challenges ...',
   // --------------------------------------------------------------------------
   // MetaData Handlers
   // --------------------------------------------------------------------------
   updateBadges : function(badges)
   {
      var me = this;
      var bstore = Ext.StoreMgr.get('BadgeStore');
      if (badges)
      {
         // Update All Badges
         //console.debug('badges - [' + Ext.encode(badges) + ']');
         bstore.setData(badges);
         //me.persistSyncStores('BadgeStore');
      }
   },
   updateAccountInfo : function(metaData, info)
   {
      var me = this;
      var updateBadge = false;
      var viewport = me.getViewPortCntlr();
      var bstore = Ext.StoreMgr.get('BadgeStore');
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customer = viewport.getCustomer();
      var customerId = metaData['customer_id'] || ((customer) ? customer.getId() : 0);
      if (customerId > 0)
      {
         console.debug("updateAccountInfo - customerId[" + customerId + "]");

         customer = cstore.getById(customerId);
         if (customer)
         {
            customer.beginEdit();
            if (info)
            {
               if (Ext.isDefined(info['points']))
               {
                  customer.set('points', info['points']);
               }
               if (Ext.isDefined(info['prize_points']))
               {
                  customer.set('prize_points', info['prize_points']);
               }
               if (Ext.isDefined(info['visits']))
               {
                  customer.set('visits', info['visits']);
               }
               if (Ext.isDefined(info['next_badge_visits']))
               {
                  customer.set('next_badge_visits', info['next_badge_visits']);
               }
               //
               // Badge Status
               //
               var badges = [
               {
                  id : info['badge_id'],
                  prefix : "Customer's Current Badge is - [",
                  badgeId : 'badge_id'
               }, //
               {
                  id : info['next_badge_id'],
                  prefix : "Customer's Next Badge is - [",
                  badgeId : 'next_badge_id'
               }];
               for (var i = 0; i < badges.length; i++)
               {
                  if (Ext.isDefined(badges[i].id))
                  {
                     var badge = bstore.getById(badges[i].id);
                     console.debug(badges[i].prefix + //
                     badge.get('type').display_value + "/" + badge.get('visits') + "]");

                     customer.set(badges[i].badgeId, badges[i].id);
                  }
               }
               var eligible_reward = info['eligible_for_reward'];
               if (Ext.isDefined(eligible_reward))
               {
                  customer.set('eligible_for_reward', eligible_reward);
               }
               var eligible_prize = info['eligible_for_prize'];
               if (Ext.isDefined(eligible_prize))
               {
                  customer.set('eligible_for_prize', eligible_prize);
               }
            }
            customer.endEdit();
            me.persistSyncStores('CustomerStore');
         }
      }
      /*
       if (updateBadge)
       {
       Ext.defer(me.refreshBadges, 0.1 * 1000, me);
       }
       */

      return customer;
   },
   updateRewards : function(rewards)
   {
      if (rewards && (rewards.length > 0))
      {
         var me = this;
         var viewport = me.getViewPortCntlr();
         var merchant = viewport.getVenue().getMerchant();

         console.debug("Total Redemption Rewards - " + rewards.length);
         for (var i = 0; i < rewards.length; i++)
         {
            rewards[i]['merchant'] = merchant;
         }
         var rstore = Ext.StoreMgr.get('RedeemStore');
         rstore.setData(rewards);
      }
   },
   updatePrizes : function(prizes)
   {
      if (prizes && (prizes.length > 0))
      {
         var me = this;
         var viewport = me.getViewPortCntlr();
         var merchant = viewport.getVenue().getMerchant();

         console.debug("Total Redemption Prizes - " + prizes.length);
         for (var i = 0; i < prizes.length; i++)
         {
            prizes[i]['merchant'] = merchant;
         }
         var pstore = Ext.StoreMgr.get('PrizeStore');
         pstore.setData(prizes);
      }
   },
   updateNews : function(news)
   {
      if (news && (news.length > 0))
      {
         console.debug("Total News Items - " + news.length);
         var nstore = Ext.StoreMgr.get('NewsStore');
         nstore.setData(news);
      }
   },
   updateAuthCode : function(metaData)
   {
      var me = this, rc = false, db = Genesis.db.getLocalDB();
      var authCode = metaData['auth_token'], csrfCode = metaData['csrf_token'], account = metaData['account'];

      if (!authCode)
         return rc;

      rc = true;

      if ((authCode != db['auth_code']) || (csrfCode != db['csrf_code']))
      {
         db['auth_code'] = authCode;
         db['csrf_code'] = csrfCode;
         db['account'] = account ||
         {
         };
         Genesis.db.setLocalDB(db);

         console.debug('\n' + //
         "auth_code [" + authCode + "]" + "\n" + //
         "csrf_code [" + csrfCode + "]" + "\n" + //
         "account [" + Ext.encode(account) + "]" + "\n" + //
         "currFbId [" + db['currFbId'] + "]");
      }

      // No Venue Checked-In from previous session
      if (!db['last_check_in'])
      {
         me.redirectTo('checkin');
      }

      return rc;
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this, customer = null, viewport = me.getViewPortCntlr(), cestore = Ext.StoreMgr.get('CheckinExploreStore');
      try
      {
         //
         // Update Authentication Token
         //
         if (me.updateAuthCode(metaData))
         {
            return;
         }

         //
         // Update points from the purchase or redemption
         // Update Customer info
         //
         me.updateBadges(metaData['badges']);

         customer = me.updateAccountInfo(metaData, metaData['account_info']);
         //
         // Short Cut to earn points, customer object wil be given by server
         //
         // Find venueId from metaData or from DataStore
         var new_venueId = metaData['venue_id'] || ((cestore.first()) ? cestore.first().getId() : 0);
         // Find venue from DataStore or current venue info
         venue = cestore.getById(new_venueId) || viewport.getVenue();

         if (Ext.isDefined(metaData['venue']))
         {
            venue = Ext.create('Genesis.model.Venue', metaData['venue']);
            var controller = me.getApplication().getController('client' + '.Checkins');
            //
            // Winners' Circle'
            //
            var prizeJackpotsCount = metaData['prize_jackpots'];
            if (prizeJackpotsCount >= 0)
            {
               console.debug("Prize Jackpots won by customers at this merchant this month - [" + prizeJackpotsCount + "]");
               venue.set('prize_jackpots', prizeJackpotsCount);
            }

            console.debug("customer_id - " + customer.getId() + '\n' + //
            "merchant_id - " + venue.getMerchant().getId() + '\n' + //
            //"venue - " + Ext.encode(metaData['venue']));
            '');
            controller.fireEvent('setupCheckinInfo', 'checkin', venue, customer, metaData);
         }
         else
         {
            //
            // Winners' Circle'
            //
            var prizeJackpotsCount = metaData['prize_jackpots'];
            if (prizeJackpotsCount >= 0)
            {
               console.debug("Prize Jackpots won by customers at this merchant this month - [" + prizeJackpotsCount + "]");
               venue.set('prize_jackpots', prizeJackpotsCount);
            }
         }

         //
         // Update Customer Rewards (Rewards Redemptions)
         //
         me.updateRewards(metaData['rewards']);
         //
         // Update Customer Rewards (Prizes Redemptions)
         //
         me.updatePrizes(metaData['prizes']);
         //
         // Update News
         // (Make sure we are after Redemption because we may depend on it for rendering purposes)
         //
         me.updateNews(metaData['newsfeed']);
      }
      catch(e)
      {
         console.debug("updateMetaDataInfo Exception - " + e);
      }

      return customer;
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onActivate : function()
   {
      var me = this;

      var file = Ext.Loader.getPath("Genesis") + "/store/" + ((!merchantMode) ? 'mainClientPage' : 'mainServerPage') + '.json';
      var path = "";
      if (( typeof (device) != 'undefined') && device.uuid)
      {
         if (Ext.os.is('iOS'))
         {
            path = "";
         }
         else
         if (Ext.os.is('Android'))
         {
            path = "file:///android_asset/www/";
         }
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
      this.self.playSoundFile(this.sound_files['clickSound']);
   },
   onBackButtonTap : function(b, e, eOpts)
   {
      this.popView();
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
         me.goToMerchantMain(true);
      }
   },
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   init : function(app)
   {
      var me = this;

      //
      // Initialize global constants
      //
      Genesis.constants.init();

      me.callParent(arguments);

      QRCodeReader.prototype.scanType = "Default";
      console.debug("QRCode Scanner Mode[" + QRCodeReader.prototype.scanType + "]")

      if (Ext.isDefined(window.device))
      {
         console.debug(//
         "\n" + "device.platform - " + device.platform + //
         "\n" + "device.uuid - " + device.uuid + //
         "\n" + "Browser EngineVersion - " + Ext.browser.engineVersion + //
         "");
      }

      me.on(
      {
         'viewanimend' : 'onViewAnimEnd',
         'baranimend' :
         {
            buffer : 0.5 * 1000,
            fn : 'onBarAnimEnd'
         },
         'pushview' : 'pushView',
         'silentpopview' : 'silentPopView',
         'popview' : 'popView',
         'resetview' : 'resetView'
      });

      if (Ext.os.is('Android'))
      {
         if (merchantMode)
         {
            nfc.isEnabled(function()
            {
               Genesis.constants.isNfcEnabled = true;
               console.log('NFC is enabled on this device');
            });
         }
      }

      Ext.regStore('LicenseStore',
      {
         model : 'Genesis.model.frontend.LicenseKey',
         autoLoad : false,
      });

      console.log("ViewportBase Init");
   },
   loadSoundFile : function(tag, sound_file, type)
   {
      var me = this, ext = '.' + (sound_file.split('.')[1] || 'mp3');
      sound_file = sound_file.split('.')[0];
      if (Genesis.fn.isNative())
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
   openMainPage : Ext.emptyFn
});
