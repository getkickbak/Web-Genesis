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
      },
      listeners :
      {
         'metadataChange' : 'onPrizeStoreMetaChange'
      }
   },
   loadCallback : null,
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstMsg : 'Please Check-In before earning rewards',
   authCodeReqMsg : 'Proceed to scan an Authorization Code from your server to earn Reward Points!',
   prizeCheckMsg : 'Find out if you won a PRIZE!',
   earnPtsMsg : 'Updating Points Earned ...',
   getPointsMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Points from this purchase!';
   },
   getReferralMsg : function(points)
   {
      return this.getVipMsg(points);
   },
   getVipMsg : function(points)
   {
      return 'You\'ve earned an ' + Genesis.constants.addCRLF() + //
      'additional ' + points + ' Points!' + Genesis.constants.addCRLF() + //
      this.prizeCheckMsg;
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
         me.getGeoLocation();
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
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var reader = CustomerReward.getProxy().getReader();
      var pstore = Ext.StoreMgr.get('MerchantPrizeStore');

      //
      // Triggers PrizeCheck and MetaDataChange
      // - subject CustomerReward also needs to be reset to ensure property processing of objects
      //
      //console.debug("qrcode =[" + me.qrcode + ']');
      EarnPrize['setEarnPrizeURL']();
      reader.setRootProperty('');
      reader.buildExtractors();
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.earnPtsMsg
      });
      pstore.loadPage(1,
      {
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId,
            'data' : me.qrcode,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(records, operation)
         {
            reader.setRootProperty('data');
            reader.buildExtractors();
            Ext.Viewport.setMasked(false);
            if (operation.wasSuccessful())
            {
               me.loadCallback = arguments;
            }
            else
            {
               //me.popView();
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
   onEarnPtsTap : function(b, e, eOpts, eInfo)
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
         var _onSuccess = function()
         {
            //me.popView();
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
         };
         me.checkReferralPrompt(_onSuccess, _onSuccess);
      }
   },
   metaDataHandler : function(metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var exit = function()
      {
         //
         // Clear Referral DB
         //
         Genesis.db.removeReferralDBAttrib("m" + viewport.getVenue().getMerchant().getId());
         me.redirectTo('scanAndWin');
      };

      //
      // Update points from the purchase or redemption
      //
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = viewport.getCustomer().getId();
      if (metaData['account_points'])
      {
         cstore.getById(customerId).set('points', metaData['account_points']);
      }
      if (metaData['account_visits'])
      {
         cstore.getById(customerId).set('visits', metaData['account_visits']);
      }

      if (Ext.isDefined(metaData['points']))
      {
         me.getRewards();
         // Preload page
         message = me.getPointsMsg(metaData['points']);
         if (!metaData['vip_challenge'] && !metaData['referral_challenge'])
         {
            message += Genesis.constants.addCRLF() + me.prizeCheckMsg;
         }
         Ext.device.Notification.show(
         {
            title : 'Reward Points Update',
            message : message,
            callback : function()
            {
               if ((metaData['vip_challenge']))
               {
                  me.vipPopUp(metaData['vip_challenge'].points, exit);
               }
               else
               if ((metaData['referral_challenge']))
               {
                  me.referralPopUp(metaData['referral_challenge'].points, exit);
               }
               else
               {
                  exit();
               }
            }
         });
      }
      else
      if (metaData['vip_challenge'])
      {
         // Preload page
         me.getRewards();
         me.vipPopUp(metaData['vip_challenge'].points, exit);
      }
      else
      if (metaData['referral_challenge'])
      {
         // Preload page
         me.getRewards();
         me.referralPopUp(metaData['referral_challenge'].points, exit);
      }
   },
   onPrizeStoreMetaChange : function(pstore, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      //
      // Added to Earn Rewards Handling
      //
      me.metaDataHandler(metaData);

      if (metaData['data'])
      {
         var controller = me.getApplication().getController('Prizes');
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

         //activeItem.createView();
         me.startRouletteScreen();
         Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['rouletteSpinSound'], function()
         {
            console.debug("RouletteSound Done, checking for prizes ...");
            var app = me.getApplication();
            app.getController('Prizes').fireEvent('prizecheck', me.loadCallback[0], me.loadCallback[1]);
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
      switch (subFeature)
      {
         case 'scanAndWin' :
         {
            //
            // Go back to Main Reward Screen
            //
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            me.pushView(me.getRewards());
            break;
         }
         case 'rewards':
         {
            me.onEarnPtsTap();
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
