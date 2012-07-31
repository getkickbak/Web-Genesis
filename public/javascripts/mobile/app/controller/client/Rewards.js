Ext.define('Genesis.controller.client.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      clientRewards_path : '/clientRewards'
   },
   xtype : 'clientRewardsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      mode : 'rewards',
      routes :
      {
         'scanAndWin' : 'scanAndWinPage'
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
         price : 'clientrewardsview textfield'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      }
   },
   loadCallback : null,
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstMsg : 'Please Check-In before earning rewards',
   authCodeReqMsg : 'Proceed to scan an Authorization Code from your server to earn Reward Points!',
   prizeCheckMsg : 'Play our Instant Win Game to find out how many Prize Points you won!',
   earnPtsMsg : 'Updating Points Earned ...',
   getPointsMsg : function(reward_info)
   {
      var points = reward_info['points'];
      var extraPoints = reward_info['referral_points'];

      return 'You\'ve earned' + points + ' Points from this purchase.' + //
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
   referralPopUp : function(points, callback)
   {
      callback = callback || Ext.emptyFn;
      Ext.device.Notification.show(
      {
         title : 'Referral Challenge',
         message : this.getReferralMsg(points),
         callback : callback
      });
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Client Rewards Init");
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
      var venueId = (!position) ? 0 : viewport.getVenue().getId();
      var reader = PurchaseReward.getProxy().getReader();

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
         params :
         {
            venue_id : venueId,
            'data' : me.qrcode,
            latitude : (position) ? position.coords.getLatitude() : 0,
            longitude : (position) ? position.coords.getLongitude() : 0
         },
         callback : function(record, operation)
         {
            reader.setRootProperty('data');
            reader.buildExtractors();
            Ext.Viewport.setMasked(false);
            if (operation.wasSuccessful())
            {
               me.loadCallback = [reader.metaData, operation];
            }
         }
      });
      delete me.qrcode;
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
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
         title : 'Earning Reward Points',
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
   updateMetaData : function(metaData)
   {
      var me = this;
      var data = metaData['data'] || null;

      metaData['data'] = null;
      var customer = me.callParent(arguments);
      var custimerId = customer.getId();
      metaData['data'] = data;
      //
      // Update points from the purchase or redemption
      //
      //if (customer)

      var exit = function()
      {
         var venue = (metaData['venue']) ? Ext.create('Genesis.model.Venue', metaData['venue']) : viewport.getVenue();
         if (venue)
         {
            var controller = me.getApplication().getController('client.Checkins');
            var merchantId = metaData['merchant_id'] || venue.getMerchant().getId();

            console.debug("customer_id - " + customerId + '\n' + //
            "merchant_id - " + merchantId + '\n' + //
            "venue - " + Ext.encode(metaData['venue']));
            controller.fireEvent('setupCheckinInfo', 'explore', venue, customer, null);
            //
            // Clear Referral DB
            //
            Genesis.db.removeReferralDBAttrib("m" + merchantId);
         }
         me.redirectTo('scanAndWin');
      };
      var info = metaData['reward_info'];
      Ext.device.Notification.show(
      {
         title : 'Reward Points',
         message : me.getPointsMsg(info),
         callback : function()
         {
            if (info['referral_points'] > 0)
            {
               me.referralPopUp(info['referral_points'], exit);
            }
            else
            {
               exit();
            }
         }
      });
      if (metaData['data'])
      {
         var controller = me.getApplication().getController('client.Prizes');
         controller.fireEvent('showQRCode', 0, metaData['data']);
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
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
            controller.fireEvent('prizecheck', me.loadCallback[0], me.loadCallback[1]);
            delete me.loadCallback;
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
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   scanAndWinPage : function()
   {
      var me = this;
      this.openPage('scanAndWin');
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
