Ext.define('Genesis.controller.ControllerBase',
{
   extend : 'Ext.app.Controller',
   requires : ['Ext.data.Store', 'Ext.util.Geolocation'],
   config :
   {
      animationMode : null,
   },
   checkinMsg : 'Checking in ...',
   loadingScannerMsg : 'Loading Scanner ...',
   loadingMsg : 'Loading ...',
   genQRCodeMsg : 'Generating QRCode ...',
   retrieveAuthModeMsg : 'Retrieving Authorization Code from Server ...',
   noCodeScannedMsg : 'No Authorization Code was Scanned!',
   geoLocationErrorMsg : function()
   {
      var rc = 'Your current location is unavailable. ';
      if (Ext.os.is('Android'))
      {
         rc += // ((Ext.os.version.isLessThan('4.1')) ? //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> GPS satellites\"';
      }
      else
      if (Ext.os.is('iPhone'))
      {
         rc += ((Ext.os.version.isLessThan('6.0')) ? //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> KICKBAK\"' :
         // //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Privacy >> Location Services >> KICKBAK\"'//
         );
      }
      else
      {
         rc += 'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services\"';
      }

      return rc;
   },
   geoLocationTimeoutErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationPermissionErrorMsg : 'No permission to location current location. Please enable permission to do so!',
   geoLocationUnavailableMsg : 'We are not able to locate your GPS coordinates',
   geoLocationUseLastPositionMsg : 'We are not able to locate your current location. Using your last known GPS Coordinates ...',
   getMerchantInfoMsg : 'Retrieving Merchant Information ...',
   getVenueInfoMsg : 'Retrieving Venue Information ...',
   missingVenueInfoMsg : 'Error loading Venue information.',
   showToServerMsg : 'Show this to your server before proceeding.',
   errProcQRCodeMsg : 'Error Processing Authentication Code',
   cameraAccessMsg : 'Accessing your Camera Phone ...',
   updatingServerMsg : 'Updating Server ...',
   referredByFriendsMsg : function(merchatName)
   {
      return 'Have you been referred ' + Genesis.constants.addCRLF() + //
      'by a friend to visit' + Genesis.constants.addCRLF() + //
      merchatName + '?';
   },
   recvReferralb4VisitMsg : function(name)
   {
      return 'Claim your reward points by becoming a customer at ' + Genesis.constants.addCRLF() + name + '!';
   },
   showScreenTimeoutExpireMsg : function(duration)
   {
      return duration + ' are up! Press OK to confirm.';
   },
   showScreenTimeoutMsg : function(duration)
   {
      return 'You have ' + duration + ' to show this screen to a employee before it disappears!';
   },
   uploadFbMsg : 'Uploading to Facebook ...',
   uploadServerMsg : 'Uploading to server ...',
   statics :
   {
      animationMode :
      {
         'cover' :
         {
            type : 'cover',
            direction : 'left',
            duration : 400
         },
         'coverUp' :
         {
            type : 'cover',
            direction : 'up',
            duration : 400
         },
         'slide' :
         {
            type : 'slide',
            direction : 'left',
            duration : 400
         },
         'slideUp' :
         {
            type : 'slide',
            direction : 'up',
            duration : 400
         },
         'pop' :
         {
            type : 'pop',
            duration : 400
         },
         'flip' :
         {
            type : 'flip',
            duration : 400
         },
         'fade' :
         {
            type : 'fade',
            duration : 400

         }
      },
      playSoundFile : function(sound_file, successCallback, failCallback)
      {
         if (Genesis.constants.isNative())
         {
            switch (sound_file['type'])
            {
               case 'FX' :
               case 'Audio' :
                  LowLatencyAudio.play(sound_file['name'], successCallback || Ext.emptyFn, failCallback || Ext.emptyFn);
                  break;
               case 'Media' :
                  sound_file['successCallback'] = successCallback || Ext.emptyFn;
                  sound_file['name'].play();
                  break;
            }
         }
         else
         {
            sound_file['successCallback'] = successCallback || Ext.emptyFn;
            Ext.get(sound_file['name']).dom.play();
         }
      },
      stopSoundFile : function(sound_file)
      {
         if (Genesis.constants.isNative())
         {
            LowLatencyAudio.stop(sound_file['name']);
         }
         else
         {
            var sound = Ext.get(sound_file['name']).dom;
            sound.pause();
            sound.currentTime = 0;
         }
      },
      genQRCodeFromParams : function(params, mode, encryptOnly)
      {
         var me = this;
         var encrypted;
         //
         // Show QRCode
         //
         // GibberishAES.enc(string, password)
         // Defaults to 256 bit encryption
         GibberishAES.size(256);
         var keys = Genesis.constants.getPrivKey();
         var date, venueId;
         for (key in keys)
         {
            switch (mode)
            {
               case 'prize' :
               {
                  venueId = key.split('r')[1];
                  break;
               }
               case 'reward' :
               case 'challenge' :
               {
                  venueId = key.split('v')[1];
                  break;
               }
               default :
                  veuneId = 0;
                  break;
            }
            if (venueId > 0)
            {
               try
               {
                  date = new Date().addHours(3);
                  encrypted = GibberishAES.enc(Ext.encode(Ext.applyIf(
                  {
                     "expiry_ts" : date.getTime()
                  }, params)), keys[key]);

                  switch (mode)
                  {
                     case 'prize' :
                     case 'reward' :
                     {
                        encrypted = venueId + '$' + encrypted;
                        break;
                     }
                     default :
                        break;

                  }
               }
               catch (e)
               {
               }
               console.debug("Used key[" + keys[key] + "]");
               break;
            }
         }
         console.log('\n' + //
         "Encrypted Code Length: " + encrypted.length + '\n' + //
         'Encrypted Code [' + encrypted + ']' + '\n' + //
         'Expiry Date: [' + date + ']');

         return (encryptOnly) ? [encrypted, 0, 0] : me.genQRCode(encrypted);
      },
      genQRCode : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 3;
         QRCodeVersion = QRCodeVersion || 10;

         // size of box drawn on canvas
         var padding = 0;
         // 1-40 see http://www.denso-wave.com/qrcode/qrgene2-e.html

         // QR Code Error Correction Capability
         // Higher levels improves error correction capability while decreasing the amount of data QR Code size.
         // QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
         // eg. L can survive approx 5% damage...etc.
         var qr = QRCode(QRCodeVersion, 'L');
         qr.addData(text);
         qr.make();
         var base64 = qr.createBase64(dotsize, padding);
         console.log("QR Code Minimum Size = [" + base64[1] + "x" + base64[1] + "]");

         return [base64[0], base64[1], base64[1]];
      },
      genQRCodeInlineImg : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 4;
         QRCodeVersion = QRCodeVersion || 8;
         var padding = 0;
         var qr = QRCode(QRCodeVersion, 'L');

         qr.addData(text);
         qr.make();

         var html = qr.createTableTag(dotsize, padding);

         return html;
      }
   },
   init : function()
   {
      this.callParent(arguments);

      this.on(
      {
         scope : this,
         'scannedqrcode' : this.onScannedQRcode,
         'locationupdate' : this.onLocationUpdate,
         'openpage' : this.onOpenPage,
         'updatemetadata' : this.updateMetaDataInfo,
         'triggerCallbacksChain' : this.triggerCallbacksChain
      });

      /*
      this.callBackStack =
      {
      callbacks : ['signupPromotionHandler', 'earnPtsHandler', 'referralHandler', 'scanAndWinHandler'],
      arguments : [],
      startIndex : 0
      };
      */
      //
      // Forward all locally generated page navigation events to viewport
      //
      //this.setAnimationMode(this.self.animationMode['cover']);

      //
      // Prevent Recursion
      //
      var viewport = this.getViewPortCntlr();
      if (viewport != this)
      {
         viewport.relayEvents(this, ['pushview', 'popview', 'silentpopview', 'resetview']);
         viewport.on('animationCompleted', this.onAnimationCompleted, this);
      }
   },
   getViewPortCntlr : function()
   {
      return this.getApplication().getController('Viewport');
   },
   getViewport : function()
   {
      return this.getViewPortCntlr().getView();
   },
   getMainPage : Ext.emptyFn,
   openMainPage : Ext.emptyFn,
   openPage : Ext.emptyFn,
   goToMain : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      viewport.setLoggedIn(true);
      me.resetView();
      me.redirectTo('main');
      console.log("LoggedIn, Going to Main Page ...");
   },
   isOpenAllowed : function()
   {
      return "Cannot Open Folder";
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onScannedQRcode : Ext.emptyFn,
   onLocationUpdate : Ext.emptyFn,
   onOpenPage : function(feature, subFeature, cb, eOpts, eInfo)
   {
      if ((appName == 'GetKickBak') && !Ext.device.Connection.isOnline() && (feature != 'MainPage'))
      {
         Ext.device.Notification.show(
         {
            title : 'Network Error',
            message : 'You have lost internet connectivity'
         });
         me.resetView();
         me.redirectTo('login');
         return;
      }

      var app = this.getApplication();
      controller = app.getController(feature);
      if (!subFeature)
      {
         controller.openMainPage();
      }
      else
      {
         controller.openPage(subFeature, cb);
      }
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   triggerCallbacksChain : function()
   {
      var me = this;
      var startIndex = me.callBackStack['startIndex'];
      var length = me.callBackStack['callbacks'].length;
      for (var i = startIndex; i < length; i++)
      {
         me.callBackStack['startIndex']++;
         if (me[me.callBackStack['callbacks'][i]].apply(me, me.callBackStack['arguments']))
         {
            //
            // Break the chain and contine Out-of-Scope
            //
            break;
         }
      }
      if (i >= length)
      {
         console.debug("Clear Callback Chain[" + i + "].");
         //
         // End of Callback Chain
         //
         me.callBackStack['startIndex'] = 0;
         me.callBackStack['arguments'] = [];
      }
   },
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
   updateAuthCode : function(authCode, csrfCode)
   {
      var me = this, rc = false;

      if (authCode)
      {
         var db = Genesis.db.getLocalDB();
         if ((authCode != db['auth_code']) || (csrfCode != db['csrf_code']))
         {
            db['auth_code'] = authCode;
            db['csrf_code'] = csrfCode;
            Genesis.db.setLocalDB(db);
         }
         console.debug('\n' + //
         "auth_code [" + authCode + "]" + "\n" + //
         "csrf_code [" + csrfCode + "]" + "\n" + //
         "currFbId [" + db['currFbId'] + "]");

         // No Venue Checked-In from previous session
         if (!db['last_check_in'])
         {
            me.goToMain();
         }

         rc = true;
      }

      return rc;
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this;
      var customer = null;
      var viewport = me.getViewPortCntlr();
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');

      try
      {
         //
         // Update Authentication Token
         //
         if (me.updateAuthCode(metaData['auth_token'], metaData['csrf_token']))
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
            var controller = me.getApplication().getController('client.Checkins');
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
   checkReferralPrompt : function(cbOnSuccess, cbOnFail)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var customer = viewport.getCustomer();
      var merchant = viewport.getVenue().getMerchant();
      var merchantId = merchant.getId();
      var success = cbOnSuccess || Ext.emptyFn;
      var fail = cbOnFail || Ext.emptyFn;

      var callback = function(btn)
      {
         Ext.defer(function()
         {
            if (btn.toLowerCase() == 'yes')
            {
               me.fireEvent('openpage', 'client.Challenges', 'referrals', success);
            }
            else
            {
               fail();
            }
         }, 1, me);
      }
      if ((!Customer.isValid(customer.getId()) || (customer.get('visits') <= 0))//
      && (!Genesis.db.getReferralDBAttrib("m" + merchantId)))
      {
         console.debug("Customer Visit Count[" + customer.get('visits') + "]")
         Ext.device.Notification.show(
         {
            title : 'Referral Challenge',
            message : me.referredByFriendsMsg(merchant.get('name')),
            buttons : ['Yes', 'No'],
            callback : callback
         });
      }
      else
      {
         fail();
      }
   },
   /*
   refreshBadges : function()
   {
   var bstore = Ext.StoreMgr.get('BadgeStore');

   Badges['setGetBadgesUrl']();
   bstore.load(
   {
   jsonData :
   {
   },
   params :
   {
   },
   callback : function(records, operation)
   {
   if (operation.wasSuccessful())
   {
   me.persistSyncStores('BadgeStore');
   }
   }
   });
   },
   */
   // --------------------------------------------------------------------------
   // Persistent Stores
   // --------------------------------------------------------------------------
   persistStore : function(storeName)
   {
      var stores =
      {
         'CustomerStore' : [Ext.StoreMgr.get('Persistent' + 'CustomerStore'), 'CustomerStore', 'CustomerJSON']
         //'BadgeStore' : [Ext.StoreMgr.get('Persistent' + 'BadgeStore'), 'BadgeStore', 'BadgeJSON']
         //,'PrizeStore' : [Ext.StoreMgr.get('Persistent' + 'PrizeStore'), 'PrizeStore',
         // 'CustomerRewardJSON']
      };
      for (var i in stores)
      {
         if (!stores[i][0])
         {
            Ext.regStore('Persistent' + stores[i][1],
            {
               model : 'Genesis.model.' + stores[i][2],
               autoLoad : false
            });
            stores[i][0] = Ext.StoreMgr.get('Persistent' + stores[i][1]);
         }
      }

      return stores[storeName][0];
   },
   persistLoadStores : function(callback)
   {
      var stores = [[this.persistStore('CustomerStore'), 'CustomerStore', 0x01] //
      //[this.persistStore('BadgeStore'), 'BadgeStore', 0x10]];
      //,[this.persistStore('PrizeStore'), 'PrizeStore', 0x10]];
      ];
      var flag = 0x0;

      callback = callback || Ext.emptyFn;
      for (var i = 0; i < stores.length; i++)
      {
         stores[i][0].load(
         {
            callback : function(results, operation)
            {
               var items = [];
               if (operation.wasSuccessful())
               {
                  var cstore = Ext.StoreMgr.get(stores[i][1]);
                  cstore.removeAll();
                  for (var x = 0; x < results.length; x++)
                  {
                     items.push(results[x].get('json'));
                  }
                  cstore.setData(items);
                  console.debug("Restored " + results.length + " records to " + stores[i][1] + " ...");
               }
               else
               {
                  console.debug("Error Restoring " + stores[i][1] + " ...");
               }

               //if ((flag |= stores[i][2]) == 0x11)
               {
                  callback();
               }
            }
         });
      }
   },
   persistSyncStores : function(storeName, cleanOnly)
   {
      var stores = [[this.persistStore('CustomerStore'), 'CustomerStore', 0x01] //
      //[this.persistStore('BadgeStore'), 'BadgeStore', 0x10]];
      //, [this.persistStore('PrizeStore'), 'PrizeStore', 0x10]];
      ];
      for (var i = 0; i < stores.length; i++)
      {
         if (!storeName || (stores[i][1] == storeName))
         {
            stores[i][0].removeAll();
            if (!cleanOnly)
            {
               var items = Ext.StoreMgr.get(stores[i][1]).getRange();
               for (var x = 0; x < items.length; x++)
               {
                  var json = items[x].getData(true);
                  stores[i][0].add(
                  {
                     json : json
                  });
               }
            }
            stores[i][0].sync();
            console.debug("Synced " + stores[i][1] + " ... ");
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   resetView : function(view)
   {
      this.fireEvent('resetview');
   },
   pushView : function(view)
   {
      this.fireEvent('pushview', view, this.getAnimationMode());
   },
   silentPopView : function(num)
   {
      this.fireEvent('silentpopview', num);
   },
   popView : function()
   {
      this.fireEvent('popview');
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   getGeoLocation : function(i)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var options =
      {
         autoUpdate : false,
         maximumAge : 30000,
         timeout : 10000,
         allowHighAccuracy : true,
         enableHighAccuracy : true
      }

      i = i || 0;
      console.debug('Getting GeoLocation ...');
      if (!Genesis.constants.isNative())
      {
         me.fireEvent('locationupdate',
         {
            coords :
            {
               getLatitude : function()
               {
                  return "-50.000000";
               },
               getLongitude : function()
               {
                  return '50.000000';
               }
            }
         });
         return;
      }
      var successCallback = function(geo, eOpts)
      {
         if (!geo)
         {
            console.log("No GeoLocation found!");
            return;
         }
         var position =
         {
            coords : geo
         }
         console.debug('\n' + 'Latitude: ' + geo.getLatitude() + '\n' + 'Longitude: ' + geo.getLongitude() + '\n' +
         //
         'Altitude: ' + geo.getAltitude() + '\n' + 'Accuracy: ' + geo.getAccuracy() + '\n' +
         //
         'Altitude Accuracy: ' + geo.getAltitudeAccuracy() + '\n' + 'Heading: ' + geo.getHeading() + '\n' +
         //
         'Speed: ' + geo.getSpeed() + '\n' + 'Timestamp: ' + new Date(geo.getTimestamp()) + '\n');

         viewport.setLastPosition(position);
         me.fireEvent('locationupdate', position);
      }
      var failCallback = function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
      {
         console.debug('GeoLocation Error[' + message + ']');
         Ext.Viewport.setMasked(false);
         if (bPermissionDenied)
         {
            console.debug("PERMISSION_DENIED");
            Ext.device.Notification.show(
            {
               title : 'Permission Error',
               message : me.geoLocationPermissionErrorMsg
            });
         }
         else
         if (bTimeout)
         {
            console.debug("TIMEOUT");
            Ext.device.Notification.show(
            {
               title : 'Timeout Error',
               message : (viewport.getLastPosition()) ? me.geoLocationUseLastPositionMsg : me.geoLocationTimeoutErrorMsg,
               callback : function()
               {
                  if (viewport.getLastPosition())
                  {
                     me.fireEvent('locationupdate', viewport.getLastPosition());
                  }
               }
            });
         }
         else
         {
            if (bLocationUnavailable)
            {
               if (i < 3)
               {
                  Ext.defer(me.getGeoLocation, 1 * 1000, me, [++i]);
                  //console.debug("Retry getting current location(" + i + ") ...");
               }
               else
               {
                  console.debug("POSITION_UNAVAILABLE");
                  Ext.device.Notification.show(
                  {
                     title : 'Location Services',
                     message : (viewport.getLastPosition()) ? me.geoLocationUseLastPositionMsg : me.geoLocationUnavailableMsg,
                     callback : function()
                     {
                        if (viewport.getLastPosition())
                        {
                           me.fireEvent('locationupdate', viewport.getLastPosition());
                        }
                     }
                  });
               }
            }
            else
            {
               console.debug("PERMISSION ERROR");
               Ext.device.Notification.show(
               {
                  title : 'Location Services',
                  message : me.geoLocationErrorMsg()
               });
            }
         }
      }

      console.debug('Connection type: [' + Ext.device.Connection.getType() + ']');
      //console.debug('Checking for Network Conncetivity for [' + location.origin + ']');
      if (!me.geoLocation)
      {
         me.geoLocation = Ext.create('Ext.util.Geolocation', Ext.applyIf(
         {
            listeners :
            {
               locationupdate : successCallback,
               locationerror : function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
               {
                  if (bTimeout && (i < 4))
                  {
                     me.getGeoLocation(4);
                  }
                  else
                  {
                     failCallback(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message);
                  }
               }
            }
         }, options));
      }
      me.geoLocation.updateLocation(null, null, (i >= 4) ? Ext.applyIf(
      {
         allowHighAccuracy : false,
         enableHighAccuracy : false
      }, options) : options);
   },
   scanQRCode : function()
   {
      var me = this;
      var callback = function(r)
      {
         var qrcode;
         Ext.Viewport.setMasked(false);
         if (Genesis.constants.isNative())
         {
            switch(window.plugins.qrCodeReader.scanType)
            {
               case 'RL' :
               {
                  qrcode = (r.response == undefined) ? "" : (r.response || "");
                  console.debug("QR Code RL  = " + qrcode);
                  break;
               }
               case 'Nigma' :
               {
                  qrcode = (r.response == undefined) ? "" : (r.response || "");
                  if (!qrcode)
                  {
                     console.debug("QR Code Nigma = Empty");
                  }
                  else
                  {
                     console.debug("QR Code Nigma = " + ((qrcode.responseCode) ? qrcode.responseCode : "NONE") + " Sent = " + qrcode.bytesSent + " bytes");
                  }
                  if (qrcode && qrcode.responseCode)
                  {
                     qrcode = qrcode.responseCode;
                  }
                  break;
               }
               case 'Default' :
               {
                  qrcode = r;
                  if (!qrcode || qrcode.format != 'QR_CODE')
                  {
                     qrcode = null;
                     console.debug("QR Code Default = Unsupported Code");
                     //
                     // Simulator, we must pump in random values
                     //
                     if (device.platform.match(/simulator/i))
                     {
                        qrcode = Math.random().toFixed(16);
                     }
                  }
                  else
                  if (qrcode.cancelled)
                  {
                     qrcode = Math.random().toFixed(16);
                  }
                  else
                  {
                     qrcode = qrcode.text;
                  }
                  console.debug("QR Code Default = " + ((qrcode) ? qrcode : "NONE"));
                  break;
               }
            }
         }
         else
         {
            qrcode = r.response;
            console.debug("QR Code = " + qrcode);
         }

         Ext.device.Notification.beep();
         me.fireEvent('scannedqrcode', qrcode);
      }
      var fail = function(message)
      {
         Ext.Viewport.setMasked(false);
         console.debug('Failed because: ' + message);
         Ext.device.Notification.beep();
         me.fireEvent('scannedqrcode', null);
      }

      console.debug("Scanning QR Code ...")
      if (!Genesis.constants.isNative())
      {
         //
         // pick the first one on the Neaby Venue in the store
         //
         var venueId = "0";
         if (!merchantMode)
         {
            var venue = me.getViewPortCntlr().getVenue() || Ext.StoreMgr.get('CheckinExploreStore').first() || null;
            venueId = venue ? venue.getId() : "0";
         }
         callback(
         {
            response : venueId
         });
      }
      else
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.loadingScannerMsg
         });

         window.plugins.qrCodeReader.getCode(callback, fail);
      }
   }
});
