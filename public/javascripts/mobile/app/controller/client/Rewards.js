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
         price : 'clientrewardsview textfield',
         //
         // SignUp - Referral Promotion
         //
         promotion :
         {
            selector : 'promotionalitemview[tag=promotion]',
            autoCreate : true,
            tag : 'promotion',
            xtype : 'promotionalitemview'
         },
         pDoneBtn : 'promotionalitemview[tag=promotion] button[tag=done]'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         promotion :
         {
            activate : 'onPromotionActivate',
            deactivate : 'onPromotionDeactivate'
         },
         pDoneBtn :
         {
            tap : 'onPromotionDoneTap'
         }
      }
   },
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstMsg : 'Please Check-In before earning rewards',
   authCodeReqMsg : 'Proceed to scan an Authorization Code from your server to earn Reward Pts!',
   signupPageTitle : 'Signup Reward',
   signupPromotionTitle : 'Welcome!',
   referralPageTitle : 'Refer A Friend',
   referralPromotionTitle : 'Referral Award',
   prizeCheckMsg : 'Play our Instant Win Game to find out how many Prize Pts you won!',
   earnPtsMsg : 'Updating Points Earned ...',
   signupPromotionMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Reward Pts from Signing Up with this Merchant!';
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
         callbacks : ['signupPromotionHandler', 'earnPtsHandler', 'referralPromotionHandler', 'scanAndWinHandler'],
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
               //Genesis.db.removeLocalDBAttrib('last_check_in');
               me.fireEvent('triggerCallbacksChain');
            }
         }
      });
      delete me.qrcode;
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   promotionHandler : function(pageTitle, title, points)
   {
      var me = this;
      var vport = me.getViewport();
      var page = me.getPromotion();
      
      me.promoteCount++;
      me.redeemItem = Ext.create('Genesis.model.CustomerReward',
      {
         'title' : null,
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
      var tbbar = page.query('titlebar')[0];
      tbbar.setTitle(pageTitle);
      me.redirectTo('promotion');
   },
   signupPromotionHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this;
      var info = metaData['reward_info'];
      var vport = me.getViewport();
      var points = info['signup_points'];
      var rc = Ext.isDefined(points) && (points > 0);

      me.promoteCount = 0;
      if (rc)
      {
         me.promotionHandler(me.signupPageTitle, me.signupPromotionTitle, points);
         Ext.device.Notification.show(
         {
            title : 'Signup Promotion Alert!',
            message : me.signupPromotionMsg(points)
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
   referralPromotionHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this;
      var info = metaData['reward_info'];
      //
      // Update points from the purchase or redemption
      //
      var points = info['referral_points'];
      var rc = Ext.isDefined(points) && (points > 0);

      if (rc)
      {
         me.promotionHandler(me.referralPageTitle, me.referralPromotionTitle, points);
         Ext.device.Notification.show(
         {
            title : 'Referral Challenge',
            message : me.getReferralMsg(points)
         });
      }

      return rc;
   },
   scanAndWinHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this;

      if (me.promoteCount > 0)
      {
         console.debug("Removing Promotion View from History ...");
         me.silentPopView(1);
      }
      me.promoteCount = 0;
      if (merchantId > 0)
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
   updateMetaDataInfo : function(metaData)
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
   onPromotionActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      activeItem.redeemItem = me.redeemItem;
      //delete me.redeemItem;
   },
   onPromotionDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   onPromotionDoneTap : function(b, e, eOpts)
   {
      console.debug("Closing Promotional Page");
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
      var me = this;
      var vport = me.getViewport();

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
            var page = me.getPromotion();
            if (vport.getActiveItem() == page)
            {
               var controller = vport.getEventDispatcher().controller;
               var anim = new Ext.fx.layout.Card(me.self.superclass.self.animationMode['fade']);
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
               me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
               me.pushView(me.getPromotion());
            }
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
