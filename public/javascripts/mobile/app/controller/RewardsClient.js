Ext.define('Genesis.controller.RewardsClient',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      rewardsClient_path : '/rewardsClient'
   },
   xtype : 'rewardsClientCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      prizeCheckMsg : 'Find out if you won a PRIZE!',
      refs :
      {
         backButton : 'viewportview button[text=Close]',
         //
         // Rewards
         //
         rewards :
         {
            selector : 'rewardsclientview',
            autoCreate : true,
            xtype : 'rewardsclientview'
         },
         rewardsContainer : 'rewardsclientview container[tag=rewards]',
         price : 'rewardsclientview textfield'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         rewardsContainer :
         {
            activeitemchange : 'onContainerActivate'
         }
      }
   },
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstRewardsMsg : 'You need to Check-In first before you are elibigle to Earn Rewards',
   init : function()
   {
      console.log("Rewards Calculator Client Init");
   },
   getPointsMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Points from this purchase!';
   },
   getVipMsg : function(points)
   {
      return 'You\'ve earned an additional ' + points + ' Points!' + Genesis.constants.addCRLF() + this.getPrizeCheckMsg();
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   prizeCheck : function(pstore)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Prizes');
      var pstore = Ext.StoreMgr.get('MerchantPrizeStore')
      var vport = me.getViewport();

      app.dispatch(
      {
         action : 'onPrizeCheck',
         args : pstore.loadCallback.concat([
         function(success)
         {
            if(success)
            {
            }
            else
            {
               //
               // Go back to Main Reward Screen
               //
               //var container = me.getRewardsContainer();
               //container.setActiveItem(0);
               me.popView();
            }
         }]),
         controller : controller,
         scope : controller
      });
   },
   earnPts : function(qrcode)
   {
      var me = this;
      var allowedMsg = me.isOpenAllowed();

      if(allowedMsg !== true)
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : allowedMsg
         });
         return;
      }
      var pstore = Ext.StoreMgr.get('MerchantPrizeStore')
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();
      var reader = CustomerReward.getProxy().getReader();

      me.getGeoLocation(function(position)
      {
         me.getBackButton().hide();
         console.log("Found QRCode ... [qrcode = " + qrcode + "]");
         //
         // Triggers PrizeCheck and MetaDataChange
         // - subject CustomerReward also needs to be reset to ensure property processing of objects
         //
         EarnPrize['setEarnPrizeURL']();
         reader.setRootProperty('');
         reader.buildExtractors();
         pstore.loadPage(1,
         {
            jsonData :
            {
            },
            params :
            {
               venue_id : venueId,
               data : qrcode,
               //merchant_id : merchantId,
               latitude : position.coords.getLatitude(),
               longitude : position.coords.getLongitude()
            },
            callback : function(records, operation)
            {
               reader.setRootProperty('data');
               reader.buildExtractors();
               if(!operation.wasSuccessful())
               {
                  //
                  // Go back to Main Reward Screen
                  //
                  //var container = me.getRewardsContainer();
                  //container.setActiveItem(0);
                  me.popView();
               }
            }
         });
      });
   },
   onActivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
      var container = this.getRewardsContainer();
      if(container)
      {
         var activeItem = container.getActiveItem();
         var animation = container.getLayout().getAnimation();
         animation.disable();
         switch (activeItem.config.tag)
         {
            case 'prizeCheck' :
            {
               this.onToggleBtnTap(null, null, null);
               break;
            }
            default :
               break;
         }
         animation.enable();
      }
   },
   onDeactivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
      this.getBackButton().enable();
   },
   onToggleBtnTap : function(b, e, eOpts)
   {
      var container = this.getRewardsContainer();
      var activeItem = container.getActiveItem();

      switch (activeItem.config.tag)
      {
         case 'prizeCheck' :
         {
            //container.setActiveItem(0);
            break;
         }
      }
      return true;
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'prizeCheck' :
         {
            me.getBackButton().hide();
            break;
         }
         default:
            me.onEarnPtsTap();
            break;
      }
   },
   onMetaChange : function(pstore, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = viewport.getCustomer().getId();
      var message;

      var vipPopup = function()
      {
         message = me.getVipMsg(metaData['vip_challenge'].points);
         Ext.device.Notification.show(
         {
            title : 'VIP Challenge Alert!',
            message : message,
            callback : function()
            {
               Ext.defer(function()
               {
                  me.prizeCheck(pstore);
               }, 2000);
            }
         });
      }
      //
      // Update points from the purchase or redemption
      //
      cstore.getById(customerId).set('points', metaData['account_points']);

      if(Ext.isDefined(metaData['points']))
      {
         message = me.getPointsMsg(metaData['points']);
         if(!metaData['vip_challenge'])
         {
            message += Genesis.constants.addCRLF() + me.getPrizeCheckMsg();
         }
         Ext.device.Notification.show(
         {
            title : 'Earn Points',
            message : message,
            callback : function()
            {
               if((metaData['vip_challenge']))
               {
                  vipPopup();
               }
               else
               {
                  Ext.defer(function()
                  {
                     me.prizeCheck(pstore);
                  }, 2000);
               }
            }
         });
      }
      else
      if(metaData['vip_challenge'])
      {
         vipPopup();
      }
   },
   onEarnPtsTap : function(b, e, eOpts)
   {
      var me = this;
      //var container = me.getRewardsContainer();
      //var anim = container.getLayout().getAnimation();

      me.scanQRCode(
      {
         callback : function(qrcode)
         {
            if(qrcode)
            {
               //anim.disable();
               //container.setActiveItem(0);
               //anim.enable();

               me.pushView(me.getRewards());

               me.earnPts(qrcode);
            }
            else
            {
               console.debug(me.missingEarnPtsCodeMsg);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingEarnPtsCodeMsg
               });
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getRewards();
   },
   openPage : function(subFeature)
   {
      var page;
      var me = this;
      var viewport = me.getViewPortCntlr();
      var successCallback = function()
      {
         //me.pushView(page);
         me.onEarnPtsTap();
      }
      switch (subFeature)
      {
         case 'rewards':
         {
            page = me.getRewards();
            successCallback();
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      // VenueId can be found after the User checks into a venue
      return ((this.getViewPortCntlr().getVenue()) ? true : this.checkinFirstRewardsMsg);
   }
});
