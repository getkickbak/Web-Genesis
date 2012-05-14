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
      refs :
      {
         backButton : 'viewportview button[text=Close]',
         //
         // Rewards
         //
         rewards :
         {
            selector : 'clientrewardsview',
            autoCreate : true,
            xtype : 'clientrewardsview'
         },
         rewardsContainer : 'clientrewardsview container[tag=rewards]',
         price : 'clientrewardsview textfield',
         prizeCheckScreen : 'clientrewardsview component[tag=prizeCheck]'
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
   loadCallback : null,
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstMsg : 'Please Check-In before earning rewards',
   prizeCheckMsg : 'Find out if you won a PRIZE!',
   getPointsMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Points from this purchase!';
   },
   getVipMsg : function(points)
   {
      return 'You\'ve earned an additional ' + points + ' Points!' + Genesis.constants.addCRLF() + this.prizeCheckMsg;
   },
   vipPopUp : function(points, callback)
   {
      callback = callback || Ext.emptyFn;
      Ext.device.Notification.show(
      {
         title : 'VIP Challenge Update',
         message : this.getVipMsg(points),
         callback : callback
      });
   },
   init : function()
   {
      console.log("Client Rewards Init");
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   startRouletteScreen : function()
   {
      var scn = this.getPrizeCheckScreen();
      var rouletteTable = Ext.get(Ext.DomQuery.select('div.rouletteTable',scn.element.dom)[0]);
      rouletteTable.addCls('spinFwd');
      var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
      rouletteBall.addCls('spinBack');
   },
   onEarnPtsTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      //var container = me.getRewardsContainer();
      //var anim = container.getLayout().getAnimation();

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

      me.scanQRCode(
      {
         callback : function(qrcode)
         {
            if(qrcode)
            {
               //anim.disable();
               //container.setActiveItem(0);
               //anim.enable();

               me.earnPts(qrcode);
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
                     me.popView();
                  }
               });
            }
         }
      });
   },
   earnPts : function(qrcode)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var reader = CustomerReward.getProxy().getReader();
      var pstore = Ext.StoreMgr.get('MerchantPrizeStore');

      me.getGeoLocation(function(position)
      {
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
               'data' : qrcode,
               latitude : position.coords.getLatitude(),
               longitude : position.coords.getLongitude()
            },
            callback : function(records, operation)
            {
               reader.setRootProperty('data');
               reader.buildExtractors();
               if(operation.wasSuccessful())
               {
                  me.loadCallback = arguments;
               }
               else
               {
                  me.popView();
               }
            }
         });
      });
   },
   onPrizeCheckMetaData : function(metaData)
   {
      var me = this;
      var exit = function()
      {
         //
         // Go back to Main Reward Screen
         //
         //var container = me.getRewardsContainer();
         //container.setActiveItem(0);
         //me.popView();
         me.pushView(me.getRewards());
      };

      if(Ext.isDefined(metaData['points']))
      {
         message = me.getPointsMsg(metaData['points']);
         if(!metaData['vip_challenge'])
         {
            message += Genesis.constants.addCRLF() + me.prizeCheckMsg;
         }
         Ext.device.Notification.show(
         {
            title : 'Reward Points Update',
            message : message,
            callback : function()
            {
               if((metaData['vip_challenge']))
               {
                  me.vipPopUp(metaData['vip_challenge'].points, exit);
               }
               else
               {
                  exit();
               }
            }
         });
      }
      else
      if(metaData['vip_challenge'])
      {
         me.vipPopUp(metaData['vip_challenge'].points, exit);
      }
   },
   onPrizeStoreMetaChange : function(pstore, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = viewport.getCustomer().getId();
      var message;

      //
      // Update points from the purchase or redemption
      //
      cstore.getById(customerId).set('points', metaData['account_points']);

      //
      // Added to Earn Rewards Handling
      //
      me.onPrizeCheckMetaData(metaData);

      if(metaData['data'])
      {
         var app = me.getApplication();
         var controller = app.getController('Prizes');
         app.dispatch(
         {
            action : 'showPrizeQrCode',
            args : [0, metaData['data']],
            controller : controller,
            scope : controller
         });
      }
   },
   onPrizeCheck : function(records, operation)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Prizes');
      app.dispatch(
      {
         action : 'onPrizeCheck',
         args : arguments,
         controller : controller,
         scope : controller
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
               this.onToggleBtnTap(null, null, null, null);
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
   onToggleBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var container = me.getRewardsContainer();
      var activeItem = container.getActiveItem();

      switch (activeItem.config.tag)
      {
         case 'prizeCheck' :
         {
            //container.setActiveItem(0);
            me.startRouletteScreen();
            me.playSoundFile(viewport.sound_files['rouletteSpinSound'], function()
            {
               console.debug("RouletteSound Done, checking for prizes ...");
               me.onPrizeCheck.apply(me, me.loadCallback);
               delete me.loadCallback;
            });
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
      var viewport = this.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();

      // VenueId can be found after the User checks into a venue
      //return ((this.getViewPortCntlr().getVenue()) ? true : this.checkinFirstMsg);
      return ((cvenue && venue && (cvenue.getId() == venue.getId())) ? true : this.checkinFirstMsg);
   }
});
