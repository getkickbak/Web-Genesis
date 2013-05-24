Ext.define('Genesis.controller.client.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store', 'Genesis.view.client.Badges'],
   inheritableStatics :
   {
   },
   xtype : 'clientRewardsCntlr',
   config :
   {
      mode : 'rewards',
      models : ['PurchaseReward', 'CustomerReward'],
      routes :
      {
         'scanAndWin' : 'scanAndWinPage',
         'promotion' : 'promotionPage'
      },
      refs :
      {
         //backButton : 'clientrewardsview button[tag=close]',
         //
         // Rewards
         //
         rewards :
         {
            selector : 'clientrewardsview',
            autoCreate : true,
            xtype : 'clientrewardsview'
         },
         //
         // SignUp - Referral Promotion
         //
         promotion :
         {
            selector : 'clientpromotionalitemview[tag=promotion]',
            autoCreate : true,
            tag : 'promotion',
            xtype : 'clientpromotionalitemview'
         },
         pDoneBtn : 'clientpromotionalitemview[tag=promotion] button[tag=done]'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate',
            rouletteTap : 'onRouletteTap'
         },
         promotion :
         {
            createView : 'onPromotionCreateView',
            activate : 'onPromotionActivate',
            deactivate : 'onPromotionDeactivate',
            promoteItemTap : 'onPromoteItemTap'
         },
         pDoneBtn :
         {
            tap : 'onPromotionDoneTap'
         }
      },
      listeners :
      {
         'rewarditem' : 'onRewardItem'
      }
   },
   cannotDetermineLocationMsg : 'Cannot determine current location. Visit one of our venues to continue!',
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstMsg : 'Please Check-In before earning rewards',
   authCodeReqMsg : 'Proceed to scan an Authorization Code from your merchant to earn Reward Pts!',
   birthdayPageTitle : 'Birthday Reward',
   birthdayTitle : 'Happy Brithday!',
   signupPageTitle : 'Signup Reward',
   signupPromotionTitle : 'Welcome!',
   referralPageTitle : 'Refer A Friend',
   referralPromotionTitle : 'Referral Award',
   badgePageTitle : 'Badge Promotion',
   badgePromotionTitle : 'Badge Promotion Award',
   prizeCheckMsg : 'Play our Instant Win Game to win Bonus Prize Points!',
   signupPromotionMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Reward Pts from Signing Up for this merchant!';
   },
   birthdayMsg : function(points)
   {
      return 'You\'ve earned ' + points + 'Bonus Reward Pts!';
   },
   getPointsMsg : function(reward_info)
   {
      var me = this;
      var points = reward_info['points'];
      var extraPoints = reward_info['referral_points'];

      return 'You\'ve earned ' + points + ' Reward Pts from this purchase.' + //
      ((extraPoints > 0) ? '' : ' ' + me.prizeCheckMsg);
   },
   getReferralMsg : function(points)
   {
      return this.getVipMsg(points);
   },
   getVipMsg : function(points)
   {
      return ('You\'ve earned an additional ' + Genesis.constants.addCRLF() + //
      points + ' Reward Pts!' + Genesis.constants.addCRLF() + //
      this.prizeCheckMsg);
   },
   getBadgeMsg : function(points, badge)
   {
      var rc = 'You\'ve been Promoted to' + Genesis.constants.addCRLF() + 'Badge Level ' + badge.get('type').display_value + '!';
      if (points > 0)
      {
         rc += (Genesis.constants.addCRLF() + 'For that, you\'ve earned ' + Genesis.constants.addCRLF() + points + ' Bonus Reward Pts!');
      }

      return rc;
   },
   vipPopUp : function(points, callback)
   {
      callback = callback || Ext.emptyFn;
      Ext.device.Notification.show(
      {
         title : 'VIP Challenge',
         message : this.getVipMsg(points),
         buttons : ['OK'],
         callback : callback
      });
   },
   identifiers : null,
   init : function()
   {
      this.callParent(arguments);
      console.log("Client Rewards Init");

      this.callBackStack =
      {
         callbacks : ['birthdayHandler', 'signupPromotionHandler', 'badgePtsHandler', 'earnPtsHandler', 'referralPromotionHandler', 'scanAndWinHandler'],
         arguments : [],
         startIndex : 0
      };
      //
      // Preload Pages
      //
      this.getRewards();
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      if (qrcode)
      {
         //anim.disable();
         //container.setActiveItem(0);
         //anim.enable();
         me.qrcode = qrcode;
         switch (me.getMode())
         {
            case 'rewardsSC' :
            {
               me.onLocationUpdate();
               break;
            }
            default :
               me.getGeoLocation();
               break;
         }
      }
      else
      {
         console.debug(me.missingEarnPtsCodeMsg);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.missingEarnPtsCodeMsg,
            buttons : ['Dismiss'],
            callback : function()
            {
               //me.popView();
            }
         });
      }
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      me.rewardItemFn();
   },
   onPromoteItemTap : function(b, e, eOpts, eInfo)
   {
      this.onPromotionDoneTap();
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   promotionHandler : function(pageTitle, title, points, photoType, message, callback)
   {
      var me = this, vport = me.getViewport(), page = me.getPromotion();
      var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
      var photoUrl =
      {
      };
      photoUrl[prefix] = (Ext.isObject(photoType)) ? //
      Genesis.view.client.Badges.getPhoto(photoType.get('type'), 'thumbnail_large_url') : //
      photoUrl[prefix] = Genesis.constants.getIconPath(photoType, 'reward');

      me.promoteCount++;
      me.redeemItem = Ext.create('Genesis.model.CustomerReward',
      {
         'title' : (Ext.isObject(photoType)) ? photoType.get('type').display_value : null,
         'type' :
         {
            value : 'promotion'
         },
         'photo' : photoUrl,
         'points' : points,
         'time_limited' : false,
         'quantity_limited' : false,
         'merchant' : null
      });
      var tbbar = page.query('titlebar')[0];
      tbbar.setTitle(pageTitle);
      me.redirectTo('promotion');
      Ext.device.Notification.show(
      {
         title : title,
         message : message,
         buttons : ['OK'],
         callback : callback || Ext.emptyFn
      });
   },
   birthdayHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], vport = me.getViewport(), points = info['birthday_points'];
      var rc = Ext.isDefined(points) && (points > 0);

      me.promoteCount = 0;
      if (rc)
      {
         me.promotionHandler(me.birthdayPageTitle, me.birthdayTitle, points, 'prizewon', me.birthdayMsg(points), function()
         {
            me.self.stopSoundFile(me.getViewPortCntlr().sound_files['birthdaySound']);
         });
         me.self.playSoundFile(me.getViewPortCntlr().sound_files['birthdaySound']);
      }

      return rc;
   },
   signupPromotionHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], vport = me.getViewport(), points = info['signup_points'];

      var rc = Ext.isDefined(points) && (points > 0);
      if (rc)
      {
         me.promotionHandler(me.signupPageTitle, me.signupPromotionTitle, points, 'prizewon', me.signupPromotionMsg(points));
      }

      return rc;
   },
   earnPtsHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], points = info['points'];
      var rc = Ext.isDefined(points) && (points > 0);

      //
      // Play Scan-To-Win if you won any Reward Points
      //
      if (rc)
      {
         Ext.device.Notification.show(
         {
            title : 'Rewards',
            message : me.getPointsMsg(info),
            buttons : ['OK'],
            callback : function()
            {
               me.fireEvent('triggerCallbacksChain');
            }
         });
      }

      return rc;
   },
   referralPromotionHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], points = info['referral_points'];

      var rc = Ext.isDefined(points) && (points > 0);
      if (rc)
      {
         me.promotionHandler(me.referralPageTitle, me.referralPromotionTitle, points, 'prizewon', me.getReferralMsg(points));
      }

      return rc;
   },
   badgePtsHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], ainfo = metaData['account_info'], points = info['badge_points'], badgeId = ainfo['badge_id'];
      var viewport = me.getViewPortCntlr(), badge = Ext.StoreMgr.get('BadgeStore').getById(badgeId);
      //
      // Badge Promotion or First time visit
      //
      var rc = (points > 0) || (ainfo['visits'] == 1);
      if (rc)
      {
         me.promotionHandler(me.badgePageTitle, me.badgePromotionTitle, points, badge, me.getBadgeMsg(points, badge), function()
         {
            me.self.stopSoundFile(viewport.sound_files['promoteSound']);
         });
         me.self.playSoundFile(viewport.sound_files['promoteSound']);
      }
      return rc;
   },
   scanAndWinHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], ainfo = metaData['account_info'], points = info['points'];
      var rc = Ext.isDefined(points) && (points > 0);

      if (me.promoteCount > 0)
      {
         console.debug("Removing Promotion View from History ...");
         me.silentPopView(1);
      }
      me.promoteCount = 0;

      if ((merchantId > 0) && (ainfo['visits'] >= 2))
      {
         //
         // Clear Referral DB
         //
         Genesis.db.removeReferralDBAttrib("m" + merchantId);
      }
      //
      // Can't play Scan-To-Win if you didn't win any Reward Points
      //
      if (rc)
      {
         me.redirectTo('scanAndWin');
      }
      else
      {
         var app = me.getApplication(), controller = app.getController('client.Prizes');
         controller.fireEvent('prizecheck', metaData);
      }

      return false;
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.callParent(arguments);

      me.getRefreshBtn()['hide']();
      me.getSRedeemBtn()['show']();
   },
   onRewardItem : function(notUseGeolocation)
   {
      var me = this, task, viewport = me.getViewPortCntlr();

      me.identifiers = null;
      me.rewardItemFn = function()
      {
         //
         // Not ready to process data
         //
         if (me.identifiers == null)
         {
            return;
         }

         var db = Genesis.db.getLocalDB(), position = viewport.getLastPosition(), localID = me.identifiers['localID'];
         var venue = viewport.getVenue(), venueId = (notUseGeolocation) ? venue.getId() : null;
         var reader = PurchaseReward.getProxy().getReader();
         var params =
         {
         }, privKey;

         //
         // With or without Geolocation support
         //
         if (!venueId)
         {
            //
            // We cannot use short cut method unless we have either GeoLocation or VenueId
            //
            if (!position)
            {
               //
               // Stop broadcasting now ...
               //
               if (me.identifiers)
               {
                  me.identifiers['cancelFn']();
               }
               Ext.Viewport.setMasked(null);
               Ext.device.Notification.show(
               {
                  title : 'Rewards',
                  message : me.cannotDetermineLocationMsg,
                  buttons : ['Dismiss']
               });
               return;
            }

            params = Ext.apply(params,
            {
               data : me.self.encryptFromParams(
               {
                  'frequency' : localID
               }, 'reward'),
               //'data' : me.qrcode,
               'latitude' : position.coords.getLatitude(),
               'longitude' : position.coords.getLongitude()
            });
         }
         else
         {
            params = Ext.apply(params,
            {
               data : me.self.encryptFromParams(
               {
                  'frequency' : localID
               }, 'reward'),
               venue_id : venueId
            });
         }
         //
         // Triggers PrizeCheck and MetaDataChange
         // - subject CustomerReward also needs to be reset to ensure property processing of objects
         //
         PurchaseReward['setEarnPointsURL']();
         reader.setRootProperty('');
         reader.buildExtractors();
         PurchaseReward.load(1,
         {
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : params,
            callback : function(record, operation)
            {
               reader.setRootProperty('data');
               reader.buildExtractors();
               //
               // Stop broadcasting now ...
               //
               if (me.identifiers)
               {
                  me.identifiers['cancelFn']();
               }
               Ext.Viewport.setMasked(null);

               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.beep();
                  //Genesis.db.removeLocalDBAttrib('last_check_in');

                  //
                  // Refresh screen on first visit
                  //
                  me.fireEvent('triggerCallbacksChain');
               }
            }
         });
         delete me.qrcode;
      };

      if (Genesis.fn.isNative())
      {
         var db = Genesis.db.getLocalDB(), venue = viewport.getVenue(), venueId;

         viewport.setLastPosition(null);
         //
         // Get GeoLocation and frequency markers
         //
         if (!notUseGeolocation)
         {
            venueId = -1;
            privKey = Genesis.fn.privKey =
            {
               'venueId' : venueId,
               'venue' : Genesis.constants.debugVenuePrivKey
            };
            privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];
            me.getGeoLocation();
         }
         else
         {
            venueId = venue.getId();
            privKey = Genesis.fn.privKey =
            {
               'venueId' : venueId,
               'venue' : venue.get('name')
            };
            privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];
         }

         me.broadcastLocalID(function(idx)
         {
            me.identifiers = idx;
            Ext.Viewport.setMasked(
            {
               xtype : 'mask',
               cls : 'transmit-mask',
               html : me.lookingForMerchantDeviceMsg(),
               listeners :
               {
                  'tap' : function(b, e, eOpts)
                  {
                     //
                     // Stop broadcasting now ...
                     //
                     if (!Ext.get(Ext.DomQuery.select('.x-innerhtml',b.element.dom)[0]).getPageBox(true).isOutOfBound(
                     {
                        x : e.pageX,
                        y : e.pageY
                     }))
                     {
                        Ext.Ajax.abort();
                        if (me.identifiers)
                        {
                           me.identifiers['cancelFn']();
                        }
                        Ext.Viewport.setMasked(null);
                        Ext.device.Notification.show(
                        {
                           title : 'Rewards',
                           message : me.transactionCancelledMsg,
                           buttons : ['Dismiss']
                        });
                     }
                  }
               }
            });
            console.log("Broadcast underway ...");
            if (notUseGeolocation || viewport.getLastPosition())
            {
               me.rewardItemFn();
            }
         }, function()
         {
            Ext.Viewport.setMasked(null);
         });
      }
      else
      {
         me.scanQRCode();
      }
   },
   onEarnPts : function(notUseGeolocation)
   {
      var me = this;
      var allowedMsg = me.isOpenAllowed();
      if (allowedMsg !== true)
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : allowedMsg,
            buttons : ['Dismiss']
         });
         return;
      }
      else
      {
         var send = function()
         {
            if (!me._actions)
            {
               me._actions = Ext.create('Genesis.view.widgets.PopupItemDetail',
               {
                  iconType : 'prizewon',
                  icon : 'phoneInHand',
                  title : me.showToServerMsg(),
                  buttons : [
                  {
                     margin : '0 0 0.5 0',
                     text : 'Proceed',
                     ui : 'action',
                     height : '3em',
                     handler : function()
                     {
                        viewport.popUpInProgress = false;
                        me._actions.hide();
                        //var earnPts = Ext.bind(me.onEarnPtsSC, me);
                        //me.checkReferralPrompt(earnPts, earnPts);
                        me.fireEvent('rewarditem', notUseGeolocation);
                     }
                  },
                  {
                     margin : '0.5 0 0 0',
                     text : 'Cancel',
                     ui : 'cancel',
                     height : '3em',
                     handler : function()
                     {
                        viewport.popUpInProgress = false;
                        me._actions.hide();
                     }
                  }]
               });
               Ext.Viewport.add(me._actions);
            }
            viewport.popUpInProgress = true;
            me._actions.show();
            /*
             Ext.device.Notification.show(
             {
             title : 'Earn Reward Points',
             message : me.showToServerMsg(),
             buttons : ['Proceed', 'Cancel'],
             callback : function(btn)
             {
             if (btn.toLowerCase() == 'proceed')
             {
             //var earnPts = Ext.bind(me.onEarnPtsSC, me);
             //me.checkReferralPrompt(earnPts, earnPts);
             me.fireEvent('rewarditem', notUseGeolocation);
             }
             }
             });
             */
         };

         if (Genesis.fn.isNative())
         {
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.prepareToSendMerchantDeviceMsg
            });
            window.plugins.proximityID.preLoadSend(function()
            {
               Ext.Viewport.setMasked(null);
               Ext.defer(send, 0.25 * 1000, me);
            });
         }
         else
         {
            send();
         }
      }
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this, viewport = me.getViewPortCntlr(), customer = me.callParent(arguments);
      var venue = viewport.getVenue(), merchantId = metaData['merchant_id'] || venue.getMerchant().getId();

      me.callBackStack['arguments'] = [metaData, customer, venue, merchantId];
      //console.debug("updateMetaDataInfo - metaData[" + Ext.encode(metaData) + "]");
      if (metaData['data'])
      {
         var controller = me.getApplication().getController('client.Prizes');
         controller.fireEvent('showQRCode', 0, metaData['data']);
      }
   },
   onRouletteTap : function(metaData)
   {
      var me = this, viewport = me.getViewPortCntlr();
      var app = me.getApplication(), controller = app.getController('client.Prizes');
      if (me.task)
      {
         try
         {
            me.task.cancel();
            delete me.task;
            me.self.stopSoundFile(viewport.sound_files['rouletteSpinSound']);
            me.self.playSoundFile(viewport.sound_files['clickSound']);
         }
         catch(e)
         {
         }
         console.debug("Stopped RouletteSound, checking for prizes ...");
         controller.fireEvent('prizecheck', metaData);
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();
      var app = me.getApplication(), controller = app.getController('client.Prizes');
      var metaData = me.callBackStack['arguments'][0], rouletteTap = Ext.bind(me.onRouletteTap, me, [metaData]);

      // Safe guard in case the music doesn't stop
      activeItem.metaData = metaData;
      me.task = Ext.create('Ext.util.DelayedTask', rouletteTap);
      me.task.delay(15 * 1000);

      me.self.playSoundFile(viewport.sound_files['rouletteSpinSound'], rouletteTap);

      Ext.defer(controller.startRouletteScreen, 1 * 1000, controller, [me.getRewards()]);
      /*
       Ext.defer(function()
       {
       //activeItem.createView();
       }, 1, activeItem);
       //activeItem.createView();
       */
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      //this.getBackButton().enable();
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
   },
   onPromotionCreateView : function(activeItem)
   {
      var me = this;
      activeItem.item = me.redeemItem;
   },
   onPromotionActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //delete me.redeemItem;
   },
   onPromotionDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   onPromotionDoneTap : function(b, e, eOpts)
   {
      var me = this;
      me.fireEvent('triggerCallbacksChain');
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   scanAndWinPage : function()
   {
      var me = this;
      this.openPage('scanAndWin');
   },
   promotionPage : function()
   {
      var me = this;
      this.openPage('promotion');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      var page = this.getRewards();
      return page;
   },
   openPage : function(subFeature)
   {
      var me = this, vport = me.getViewport();

      me.setMode(subFeature);
      switch (subFeature)
      {
         case 'scanAndWin' :
         {
            //
            // Go back to Main Reward Screen
            //
            me.setAnimationMode(me.self.animationMode['coverUp']);
            me.pushView(me.getRewards());
            break;
         }
         case 'rewardsSC':
         {
            me.onEarnPts(false);
            break;
         }
         case 'rewards':
         {
            me.onEarnPts(true);
            break;
         }
         case 'promotion' :
         {
            var page = me.getPromotion();
            if (vport.getActiveItem() == page)
            {
               var controller = vport.getEventDispatcher().controller, anim = new Ext.fx.layout.Card(me.self.animationMode['fade']);
               anim.on('animationend', function()
               {
                  console.debug("Animation Complete");
                  anim.destroy();
               }, me);
               //if (!controller.isPausing)
               {
                  console.log("Reloading Promotion Page");
                  // Delete current page and refresh
                  //page.removeAll(true);
                  vport.animateActiveItem(page, anim);
                  anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
                  vport.doSetActiveItem(page, null);
               }
            }
            else
            {
               me.setAnimationMode(me.self.animationMode['coverUp']);
               me.pushView(me.getPromotion());
            }
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
      /*
       var viewport = this.getViewPortCntlr();
       var cvenue = viewport.getCheckinInfo().venue;
       var venue = viewport.getVenue();

       // VenueId can be found after the User checks into a venue
       //return ((this.getViewPortCntlr().getVenue()) ? true : this.checkinFirstMsg);
       return ((cvenue && venue && (cvenue.getId() == venue.getId())) ? true : this.checkinFirstMsg);
       */
   }
});
