Ext.define('Genesis.controller.client.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      clientRewards_path : '/clientRewards'
   },
   xtype : 'clientRewardsCntlr',
   config :
   {
      mode : 'rewards',
      models : ['PurchaseReward', 'CustomerReward'],
      routes :
      {
         'scanAndWin' : 'scanAndWinPage',
         'signupPromotion' : 'signupPromotionPage'
      },
      refs :
      {
         backButton : 'clientrewardsview button[tag=close]',
         //
         // Rewards
         //
         rewards :
         {
            selector : 'clientrewardsview',
            autoCreate : true,
            xtype : 'clientrewardsview'
         },
         price : 'clientrewardsview textfield',
         //
         // SignUp Promotion
         //
         signupPromotion :
         {
            selector : 'promotionalitemview[tag=signupPromotion]',
            autoCreate : true,
            tag : 'signupPromotion',
            xtype : 'promotionalitemview'
         },
         sDoneBtn : 'promotionalitemview[tag=signupPromotion] button[tag=done]'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         signupPromotion :
         {
            activate : 'onSignupPromotionActivate',
            deactivate : 'onSignupPromotionDeactivate'
         },
         sDoneBtn :
         {
            tap : 'onSignupPromotionDoneTap'
         }
      }
   },
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstMsg : 'Please Check-In before earning rewards',
   authCodeReqMsg : 'Proceed to scan an Authorization Code from your server to earn Reward Points!',
   signupPromotionTitle : 'Welcome!',
   prizeCheckMsg : 'Play our Instant Win Game to find out how many Prize Points you won!',
   earnPtsMsg : 'Updating Points Earned ...',
   signupPromotionMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Reward Points from Signing Up with this Merchant!';
   },
   getPointsMsg : function(reward_info)
   {
      var points = reward_info['points'];
      var extraPoints = reward_info['referral_points'];

      return 'You\'ve earned ' + points + ' Reward Points from this purchase.' + //
      ((extraPoints > 0) ? Genesis.constants.addCRLF() + me.prizeCheckMsg : '');
   },
   getReferralMsg : function(points)
   {
      return this.getVipMsg(points);
   },
   getVipMsg : function(points)
   {
      return ('You\'ve earned an ' + Genesis.constants.addCRLF() + //
      'additional ' + points + ' Reward Points!' + Genesis.constants.addCRLF() + //
      this.prizeCheckMsg);
   },
   vipPopUp : function(points, callback)
   {
      callback = callback || Ext.emptyFn;
      Ext.device.Notification.show(
      {
         title : 'VIP Challenge',
         message : this.getVipMsg(points),
         callback : callback
      });
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Client Rewards Init");

      this.callBackStack =
      {
         callbacks : ['signupPromotionHandler', 'earnPtsHandler', 'referralHandler', 'scanAndWinHandler'],
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
      var viewport = me.getViewPortCntlr();
      var venueId = (!position) ? null : viewport.getVenue().getId();
      var reader = PurchaseReward.getProxy().getReader();
      var params =
      {
         'data' : me.qrcode,
         latitude : (position) ? position.coords.getLatitude() : 0,
         longitude : (position) ? position.coords.getLongitude() : 0
      }

      if (venueId)
      {
         params = Ext.apply(params,
         {
            venue_id : venueId
         });
      }
      //
      // Triggers PrizeCheck and MetaDataChange
      // - subject CustomerReward also needs to be reset to ensure property processing of objects
      //
      //console.debug("qrcode =[" + me.qrcode + ']');
      PurchaseReward['setEarnPointsURL']();
      reader.setRootProperty('');
      reader.buildExtractors();
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.earnPtsMsg
      });
      PurchaseReward.load(1,
      {
         jsonData :
         {
         },
         params : params,
         callback : function(record, operation)
         {
            reader.setRootProperty('data');
            reader.buildExtractors();
            Ext.Viewport.setMasked(false);
            if (operation.wasSuccessful())
            {
               me.fireEvent('triggerCallbacksChain');
            }
         }
      });
      delete me.qrcode;
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   signupPromotionHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this;
      var info = metaData['reward_info'];
      var points = info['signup_points'];
      var rc = Ext.isDefined(points) && (points > 0);

      if (rc)
      {
         Ext.device.Notification.show(
         {
            title : 'Signup Promotion Alert!',
            message : me.signupPromotionMsg(points),
            callback : function()
            {
               me.redeemItem = Ext.create('Genesis.model.CustomerReward',
               {
                  'title' : me.signupPromotionTitle,
                  'type' :
                  {
                     value : 'promotion'
                  },
                  'photo' :
                  {
                     'thumbnail_ios_medium' : Genesis.constants.getIconPath('prizewon', 'reward')
                  },
                  'points' : points,
                  'time_limited' : false,
                  'quantity_limited' : false,
                  'merchant' : null
               });
               me.redirectTo('signupPromotion');
            }
         });
      }

      return rc;
   },
   earnPtsHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this;
      var info = metaData['reward_info'];
      //
      // Update points from the purchase or redemption
      //

      Ext.device.Notification.show(
      {
         title : 'Rewards',
         message : me.getPointsMsg(info),
         callback : function()
         {
            me.fireEvent('triggerCallbacksChain');
         }
      });

      return true;
   },
   referralHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this;
      //
      // Update points from the purchase or redemption
      //
      var info = metaData['reward_info'];
      var rc = Ext.isDefined(info['referral_points']) && (info['referral_points'] > 0);

      if (rc)
      {
         Ext.device.Notification.show(
         {
            title : 'Referral Challenge',
            message : me.getReferralMsg(points),
            callback : function()
            {
               me.fireEvent('triggerCallbacksChain');
            }
         });
      }

      return rc;
   },
   scanAndWinHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this;

      if (venue)
      {
         //
         // Clear Referral DB
         //
         Genesis.db.removeReferralDBAttrib("m" + merchantId);
      }
      me.redirectTo('scanAndWin');

      return false;
   },
   startRouletteScreen : function()
   {
      var scn = this.getRewards();
      var rouletteTable = Ext.get(Ext.DomQuery.select('div.rouletteTable',scn.element.dom)[0]);
      rouletteTable.addCls('spinFwd');
      var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
      rouletteBall.addCls('spinBack');
   },
   onEarnPtsSC : function()
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Rewards',
         message : me.authCodeReqMsg,
         buttons : ['OK', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'ok')
            {
               me.scanQRCode();
            }
         }
      });
   },
   onEarnPts : function()
   {
      var me = this;
      var allowedMsg = me.isOpenAllowed();
      if (allowedMsg !== true)
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : allowedMsg
         });
         return;
      }
      else
      {
         var earnPts = Ext.bind(me.onEarnPtsSC, me);
         me.checkReferralPrompt(earnPts, earnPts);
      }
   },
   onSignupPromotionDoneTap : function(b, e, eOpts)
   {
      var me = this;
      me.silentPopView(1);
      me.fireEvent('triggerCallbacksChain');
   },
   updateMetaData : function(metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var customer = me.callParent(arguments);
      var venue = viewport.getVenue();
      var merchantId = metaData['merchant_id'] || venue.getMerchant().getId();

      me.callBackStack['arguments'] = [metaData, customer, venue, merchantId];
      if (metaData['data'])
      {
         var controller = me.getApplication().getController('client.Prizes');
         controller.fireEvent('showQRCode', 0, metaData['data']);
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var metaData = me.callBackStack['arguments'][0];
      // cache this object before deletion.

      Ext.defer(function()
      {
         var container = me.getRewards();
         var viewport = me.getViewPortCntlr();
         var app = me.getApplication();
         var controller = app.getController('client.Prizes');

         //activeItem.createView();
         me.startRouletteScreen();
         Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['rouletteSpinSound'], function()
         {
            console.debug("RouletteSound Done, checking for prizes ...");
            controller.fireEvent('prizecheck', metaData);
         });
      }, 1, activeItem);
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      //this.getBackButton().enable();
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
   },
   onSignupPromotionActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var tbbar = activeItem.query('titlebar')[0];

      tbbar.setTitle('Signup Reward');
      activeItem.redeemItem = me.redeemItem;
      //delete me.redeemItem;
   },
   onSignupPromotionDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   scanAndWinPage : function()
   {
      var me = this;
      this.openPage('scanAndWin');
   },
   signupPromotionPage : function()
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
      var me = this;

      me.setMode(subFeature);
      switch (subFeature)
      {
         case 'scanAndWin' :
         {
            //
            // Go back to Main Reward Screen
            //
            me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
            me.pushView(me.getRewards());
            break;
         }
         case 'rewardsSC':
         {
            me.onEarnPtsSC();
            break;
         }
         case 'rewards':
         {
            me.onEarnPts();
            break;
         }
         case 'promotion' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
            me.pushView(me.getSignupPromotion());
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      var viewport = this.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();

      // VenueId can be found after the User checks into a venue
      //return ((this.getViewPortCntlr().getVenue()) ? true : this.checkinFirstMsg);
      return ((cvenue && venue && (cvenue.getId() == venue.getId())) ? true : this.checkinFirstMsg);
   }
});
