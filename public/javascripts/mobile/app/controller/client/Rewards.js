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
   authCodeReqMsg : 'Proceed to scan an Authorization Code from your server to earn Reward Points!',
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
   // Event Handlers
   // --------------------------------------------------------------------------
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      if(qrcode)
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
            if(operation.wasSuccessful())
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
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Earning Reward Points',
            message : me.authCodeReqMsg,
            buttons : ['OK', 'Cancel'],
            callback : function(btn)
            {
               if(btn.toLowerCase() == 'ok')
               {
                  me.scanQRCode();
               }
            }
         });
      }
   },
   metaDataHandler : function(metaData)
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

      //
      // Update points from the purchase or redemption
      //
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var viewport = me.getViewPortCntlr();
      var customerId = viewport.getCustomer().getId();
      if(metaData['account_points'])
      {
         cstore.getById(customerId).set('points', metaData['account_points']);
      }
      if(metaData['account_visits'])
      {
         cstore.getById(customerId).set('visits', metaData['account_visits']);
      }

      if(Ext.isDefined(metaData['points']))
      {
         me.getRewards();
         // Preload page
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
         // Preload page
         me.getRewards();
         me.vipPopUp(metaData['vip_challenge'].points, exit);
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

      if(metaData['data'])
      {
         var app = me.getApplication();
         var controller = app.getController('Prizes');
         app.dispatch(
         {
            action : 'showPrizeQRCode',
            args : [0, metaData['data']],
            controller : controller,
            scope : controller
         });
      }
   },
   onActivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      if(container)
      {
         var activeItem = container.getActiveItem();
         var animation = container.getLayout().getAnimation();
         animation.disable();
         switch (activeItem.config.tag)
         {
            case 'prizeCheck' :
            {
               var viewport = me.getViewPortCntlr();

               //container.setActiveItem(0);
               me.startRouletteScreen();
               Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['rouletteSpinSound'], function()
               {
                  console.debug("RouletteSound Done, checking for prizes ...");
                  var app = me.getApplication();
                  var controller = app.getController('Prizes');
                  app.dispatch(
                  {
                     action : 'onPrizeCheck',
                     args : me.loadCallback,
                     controller : controller,
                     scope : controller
                  });
                  delete me.loadCallback;
               });
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
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
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
      switch (subFeature)
      {
         case 'rewards':
         {
            page = me.getRewards();
            //me.pushView(page);
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
