Ext.define('Genesis.controller.Prizes',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store', 'Ext.util.Sorter'],
   statics :
   {
      prizes_path : '/prizes'
   },
   xtype : 'prizesCntlr',
   config :
   {
      timeoutPeriod : 10,
      mode : 'prizes',
      models : ['Venue', 'Merchant', 'EarnPrize', 'CustomerReward'],
      refs :
      {
         closeBackButton : 'viewportview button[text=Close]',
         backButton : 'viewportview button[ui=back]',
         doneBtn : 'viewportview button[tag=done]',
         redeemBtn : 'viewportview button[tag=redeem]',
         prizeCheckScreen : 'clientrewardsview component[tag=prizeCheck]',
         prizes :
         {
            selector : 'prizesview',
            autoCreate : true,
            xtype : 'prizesview'
         },
         prizesCarousel : 'prizesview carousel'
      },
      control :
      {
         doneBtn :
         {
            tap : 'onDoneTap'
         },
         redeemBtn :
         {
            tap : 'onRedeemPrizeTap'
         },
         prizes :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         prizesCarousel :
         {
            activeitemchange : 'onPrizeCarouselItemChange'
         }
      }
   },
   evtFlag : 0,
   loadCallback : null,
   initSound : false,
   authRewardVerifiedMsg : 'Verified',
   wonPrizeMsg : function(numPrizes)
   {
      return 'You haved won ' + ((numPrizes > 1) ? 'some PRIZES' : 'a PRIZE') + '!'
   },
   lostPrizeMsg : 'Oops, Play Again!',
   showQrCodeMsg : 'Show this Authorization Code to your server to redeem!',
   checkinFirstMsg : 'Please Check-in before claiming any prize(s)',
   init : function()
   {
      this.callParent(arguments);
      console.log("Prizes Init");
   },
   stopRouletteTable : function()
   {
      var scn = this.getPrizeCheckScreen();
      var rouletteTable = Ext.get(Ext.DomQuery.select('div.rouletteTable',scn.element.dom)[0]);
      rouletteTable.removeCls('spinFwd');
      rouletteTable.removeCls('spinBack');
   },
   stopRouletteBall : function()
   {
      var scn = this.getPrizeCheckScreen();
      var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
      rouletteBall.removeCls('spinBack');
      rouletteBall.addCls('spinFwd');
      // Match the speed of Roulette Table to make it look like it stopped
   },
   stopRouletteScreen : function()
   {
      this.stopRouletteTable();
      var scn = this.getPrizeCheckScreen();
      var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
      rouletteBall.removeCls('spinBack');
      rouletteBall.removeCls('spinFwd');
   },
   updatingPrizeOnFacebook : function(record)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var merchant = venue.getMerchant();
      var site = Genesis.constants.site;
      
      console.log('Posting to Facebook ...');
      FB.api('/me/feed', 'post',
      {
         name : venue.get('name'),
         //link : href,
         link : venue.get('website') || site,
         caption : venue.get('website') || site,
         description : venue.get('description'),
         //
         // To-do : Get Prize Photo
         //
         //picture : Genesis.view.client.Rewards.getPhoto(records[0].getCustomerReward().get('type')),
         message : 'I just won "' + record.getCustomerReward().get('title') + '" for purchasing at ' + venue.get('name') + '!'
      }, function(response)
      {
         if(!response || response.error)
         {
            console.log('Post was not published to Facebook.');
         }
         else
         {
            console.log('Posted to your Facebook Newsfeed.');
         }
      });
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onPrizeCheck : function(records, operation)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.stopRouletteBall();
      console.debug("onPrizeCheck Completed!");

      if(records.length == 0)
      {
         console.log("Prize LOST!");
         Ext.device.Notification.show(
         {
            title : 'Scan And Win!',
            message : me.lostPrizeMsg,
            callback : function()
            {
               me.popView();
            }
         });
      }
      else
      {
         var flag = 0;
         var custore = Ext.StoreMgr.get('CustomerStore');
         var app = me.getApplication();
         var vport = me.getViewport();
         var db = Genesis.constants.getLocalDB();

         /*
         vport.setEnableAnim(false);
         vport.getNavigationBar().setCallbackFn(function()
         {
         vport.setEnableAnim(true);
         vport.getNavigationBar().setCallbackFn(Ext.emptyFn);
         });
         */
         //
         // Play the prize winning music!
         //
         console.log("Prize WON!");
         Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['winPrizeSound'], function()
         {
            if(flag & 0x10)
            {
               vport.silentPop(1);
            }
            if((flag |= 0x01) == 0x11)
            {
               me.onShowPrize(records[0]);
            }
         });
         //
         // Update Facebook
         //
         if(db['currFbId'] > 0)
         {
            me.updatingPrizeOnFacebook(records[0]);
         }
         Ext.device.Notification.vibrate();
         Ext.device.Notification.show(
         {
            title : 'Scan And Win!',
            message : me.wonPrizeMsg(records.length),
            callback : function()
            {
               if(flag & 0x01)
               {
                  vport.silentPop(1);
               }
               if((flag |= 0x10) == 0x11)
               {
                  me.onShowPrize(records[0]);
               }
            }
         });
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var view = me.getPrizes();
      var viewport = me.getViewPortCntlr();
      var items = [], container;

      var createPrize = function(prize)
      {
         items.push(
         {
            tag : 'rewardPanel',
            xtype : 'dataview',
            store :
            {
               model : 'Genesis.model.EarnPrize',
               autoLoad : false,
               data : prize
            },
            useComponents : true,
            scrollable : false,
            defaultType : 'rewarditem',
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         });
      }

      view.removeAll();
      switch (me.getMode())
      {
         //
         // List all the prizes won by the Customer
         //
         case 'prizes' :
         {
            var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
            if(prizes.length > 0)
            {
               var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
               for(var i = 0; i < prizes.length; i++)
               {
                  if(oldActiveItem)
                  {
                     var xtypes = oldActiveItem.getXTypes();
                     if(xtypes.match('merchantaccountview') || xtypes.match('clientrewardsview'))
                     {
                        //
                        // Only show prizes that matches the currently loaded Merchant Data
                        //
                        if(prizes[i].getMerchant().getId() != merchantId)
                        {
                           continue;
                        }
                     }
                     if(!container)
                     {
                        view.add(
                        {
                           xtype : 'carousel',
                           scrollable : undefined
                        });
                        container = view.getItems().items[0];
                     }
                  }
                  else
                  {
                     view.add(
                     {
                        xtype : 'carousel',
                        scrollable : undefined
                     });
                     container = view.getItems().items[0];
                  }
                  if(container)
                  {
                     createPrize(prizes[i]);
                  }
               }
            }

            if(!container)
            {
               container = view;
            }
            break;
         }
         //
         // Show the Prize won by Customer on EarnPts
         //
         case 'reward' :
         case 'authReward' :
         case 'showPrize' :
         {
            createPrize(me.showPrize);
            delete me.showPrize;
            container = view;
            break;
         }
      }

      //
      // To-do : show No Prize screen
      //
      if(items.length == 0)
      {
         container.add(
         {
            tag : 'rewardPanel',
            cls : 'noprizes',
            xtype : 'component',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         });
         me.getRedeemBtn().hide();
      }
      else
      {
         container.add(items);
         switch (me.getMode())
         {
            case 'authReward' :
               break;
            default:
               me.getRedeemBtn().show();
               break;
         }
      }
   },
   onDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      me.getDoneBtn().hide();
      me.getRedeemBtn().hide();
   },
   onDoneTap : function(b, e, eOpts, eInfo)
   {
      var prizes = this.getPrizes();
      if(prizes.isPainted() && !prizes.isHidden())
      {
         var me = this;
         var store = Ext.StoreMgr.get('MerchantPrizeStore');
         clearTimeout(me.cancelId);
         clearTimeout(me.hideId);
         delete me.cancelId;
         delete me.hidelId;

         switch (me.getMode())
         {
            case 'prizes' :
            case 'showPrize' :
            {
               var carousel = prizes.query('carousel')[0];
               var container = carousel || prizes;
               var item = carousel ? container.getActiveItem() : container.getItems().items[0];
               //
               // Remove Prize
               //
               container.remove(item, true);
               store.remove(item.getStore().getData().items[0])
               break;
            }
            case 'reward' :
            {
               break;
            }
         }
         me.getDoneBtn().hide();
         me.getRedeemBtn().hide();
         me.popView();
      }
   },
   onPrizeCarouselItemChange : function(c, value, oldValue, eOpts)
   {
      var data = (value.getStore()) ? value.getStore().getData().get(0) : null;
      var merchantId = (data) ? data.getMerchant().getId() : 0;
      var cvenue = this.getViewPortCntlr().getCheckinInfo().venue;
      var cmerchantId = (cvenue) ? cvenue.getMerchant().getId() : 0;

      //this.getRedeemBtn()[((merchantId == cmerchantId) && (merchantId > 0)) ? 'enable' : 'disable']();
   },
   onRedeemPrizeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var view = me.getPrizes();
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var cvenue = viewport.getCheckinInfo().venue;

      if(!cvenue || !venue || (venue.getId() != cvenue.getId()))
      {
         Ext.device.Notification.show(
         {
            title : 'Prizes',
            message : me.checkinFirstMsg
         });
         return;
      }

      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      var btn = me.getCloseBackButton() || me.getBackButton();
      btn.hide();

      var store;
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getItems().items[0];
      switch (me.getMode())
      {
         case 'showPrize' :
         case 'prizes' :
         {
            store = Ext.StoreMgr.get('MerchantPrizeStore');
            EarnPrize['setRedeemPrizeURL'](item.getStore().first().getId());
            break;
         }
         case 'reward' :
         {
            store = Ext.StoreMgr.get('RedemptionsStore');
            CustomerReward['setRedeemPointsURL'](item.getStore().first().getCustomerReward().getId());
            break;
         }
      }
      store.load(
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId
            //merchant_id : merchantId
         },
         callback : function(records, operation)
         {
            if(!operation.wasSuccessful())
            {
               btn.show();
            }
         }
      })
   },
   showPrizeQrCode : function(timeout, qrcode)
   {
      var me = this;

      //
      // For Debugging purposes
      //
      if(!qrcode)
      {
         console.log("Generaintg QR Code ... we lack one");
         qrcode = ControllerBase.genQRCodeFromParams(
         {
            type : 'redeem_prize',
            reward :
            {
               type :
               {
                  value : 'prize'
               },
               title : 'Test QR Code'
            }
         });
      }
      else
      {
         console.log("\n" + //
         "Encrypted Code :\n" + qrcode + "\n" + //
         "Encrypted Code Length: " + qrcode.length);

         qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      }

      me.getRedeemBtn().hide();
      me.getDoneBtn().show();

      var view = me.getPrizes();
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getItems().items[0];
      var photo = item.query('component[tag=itemPhoto]')[0];
      photo.element.setStyle('background-image', 'url(' + qrcode + ')');
      Ext.device.Notification.show(
      {
         title : 'Redemption Alert',
         message : me.showQrCodeMsg
      });
      Ext.device.Notification.vibrate();
   },
   onRedeemRewards : function(showPrize)
   {
      this.showPrize = showPrize;
      this.setMode('reward');
      this.pushView(this.getMainPage());
   },
   onShowPrize : function(showPrize)
   {
      this.stopRouletteScreen();
      this.showPrize = showPrize;
      this.setMode('showPrize');
      this.pushView(this.getMainPage());
   },
   onAuthReward : function(showPrize)
   {
      this.showPrize = showPrize;
      this.setMode('authReward');
      this.pushView(this.getMainPage());
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getPrizes();
   },
   openMainPage : function()
   {
      this.setMode('prizes');
      this.pushView(this.getMainPage());
      console.log("Prizes Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});
