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
      mode : 'userPrizes',
      models : ['Venue', 'Merchant', 'EarnPrize', 'CustomerReward'],
      listeners :
      {
         'redeemprize' : 'onRedeemPrize',
         'prizecheck' : 'onPrizeCheck',
         'showprize' : 'onShowPrize'
      },
      refs :
      {
         // UserPrizes
         uCloseBB : 'prizesview[tag=userPrizes] button[tag=close]',
         uBB : 'prizesview[tag=userPrizes] button[tag=back]',
         uDoneBtn : 'prizesview[tag=userPrizes] button[tag=done]',
         uRedeemBtn : 'prizesview[tag=userPrizes] button[tag=redeem]',
         // MerchantPrizes
         mCloseBB : 'prizesview[tag=merchantPrizes] button[tag=close]',
         mBB : 'prizesview[tag=merchantPrizes] button[tag=back]',
         mDoneBtn : 'prizesview[tag=merchantPrizes] button[tag=done]',
         mRedeemBtn : 'prizesview[tag=merchantPrizes] button[tag=redeem]',
         // ShowPrizes
         sCloseBB : 'showprizeview[tag=showPrize] button[tag=close]',
         sBB : 'showprizeview[tag=showPrize] button[tag=back]',
         sDoneBtn : 'showprizeview[tag=showPrize] button[tag=done]',
         sRedeemBtn : 'showprizeview[tag=showPrize] button[tag=redeem]',
         refreshBtn : 'showprizeview[tag=showPrize] button[tag=refresh]',
         verifyBtn : 'showprizeview[tag=showPrize] button[tag=verify]',

         prizeCheckScreen : 'clientrewardsview',
         merchantPrizes :
         {
            selector : 'prizesview[tag=merchantPrizes]',
            autoCreate : true,
            tag : 'merchantPrizes',
            xtype : 'prizesview'
         },
         userPrizes :
         {
            selector : 'prizesview[tag=userPrizes]',
            autoCreate : true,
            tag : 'userPrizes',
            xtype : 'prizesview'
         },
         showPrize :
         {
            selector : 'showprizeview[tag=showPrize]',
            autoCreate : true,
            tag : 'showPrize',
            xtype : 'showprizeview'
         },
         merchantPrizesCarousel : 'prizesview[tag=merchantPrizes] carousel',
         userPrizesCarousel : 'prizesview[tag=userPrizes] carousel',
      },
      control :
      {
         uDoneBtn :
         {
            tap : 'onDoneTap'
         },
         mDoneBtn :
         {
            tap : 'onDoneTap'
         },
         sDoneBtn :
         {
            tap : 'onDoneTap'
         },
         uRedeemBtn :
         {
            tap : 'onRedeemPrizeTap'
         },
         mRedeemBtn :
         {
            tap : 'onRedeemPrizeTap'
         },
         sRedeemBtn :
         {
            tap : 'onRedeemPrizeTap'
         },
         merchantPrizes :
         {
            activate : 'onMerchantPrizesActivate',
            deactivate : 'onDeactivate'
         },
         userPrizes :
         {
            activate : 'onUserPrizesActivate',
            deactivate : 'onDeactivate'
         },
         showPrize :
         {
            activate : 'onShowPrizeActivate',
            deactivate : 'onDeactivate'
         }
         /*
          ,refreshBtn :
          {
          tap : 'onRefreshQRCode'
          },
          verifyBtn :
          {
          tap : 'popView'
          }
          */
      }
   },
   evtFlag : 0,
   loadCallback : null,
   initSound : false,
   authRewardVerifiedMsg : 'Verified',
   updatePrizeOnFbMsg : 'Tell your friends on Facebook about the prize you just won!',
   retrievingQRCodeMsg : 'Retrieving QRCode ...',
   wonPrizeMsg : function(numPrizes)
   {
      return 'You haved won ' + ((numPrizes > 1) ? 'some PRIZES' : 'a PRIZE') + '!'
   },
   lostPrizeMsg : 'Oops, Play Again!',
   showQrCodeMsg : 'Show this Authorization Code to your server to redeem!',
   checkinFirstMsg : 'Please Check-in before claiming any prize(s)',
   redeemPrizeConfirmMsg : 'Please confim to redeem this item',
   init : function()
   {
      var me = this;
      this.callParent(arguments);

      // Preload Pages
      Ext.defer(me.getMerchantPrizes, 1, me);
      Ext.defer(me.getUserPrizes, 1, me);
      Ext.defer(me.getShowPrize, 1, me);
      console.log("Prizes Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
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
   updatingPrizeOnFacebook : function(earnprize)
   {
      var me = this;
      try
      {
         var viewport = me.getViewPortCntlr();
         var venue = viewport.getVenue();
         var site = Genesis.constants.site;
         var wsite = venue.get('website') ? venue.get('website').split(/http[s]*:\/\//) : [null];
         var name = venue.get('name');
         var link = wsite[wsite.length - 1] || site;
         var desc = venue.get('description').trunc(256);
         var message = 'I just won ' + earnprize.getCustomerReward().get('title') + ' for purchasing at ' + venue.get('name') + '!';

         console.log('Posting to Facebook ...' + '\n' + //
         'Name: ' + name + '\n' + //
         'Caption: ' + link + '\n' + //
         'Description: ' + desc + '\n' + //
         'Message : ' + message + '\n' //
         );
         FB.api('/me/feed', 'post',
         {
            name : name,
            //link : href,
            link : venue.get('website') || site,
            caption : link,
            description : desc,
            picture : venue.getMerchant().get('photo')['thumbnail_ios_medium'].url,
            message : message
         }, function(response)
         {
            Ext.Viewport.setMasked(false);
            if(!response || response.error)
            {
               console.log('Post was not published to Facebook.');
            }
            else
            {
               console.log('Posted to your Facebook Newsfeed.');
            }
         });
      }
      catch (e)
      {
         Ext.Viewport.setMasked(false);
         console.log('Exception [' + e + ']' + '\n' + //
         'Post was not published to Facebook.');
      }
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onRedeemPrize : function(venue, view)
   {
      var me = this;
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      var store, btn;
      switch (me.getMode())
      {
         case 'merchantPrizes' :
            me.getMCloseBB().hide();
            me.getMBB().hide();
         case 'userPrizes' :
         {
            var carousel = me.getMainCarousel();
            var item = carousel.getActiveItem();
            store = Ext.StoreMgr.get('MerchantPrizeStore');
            EarnPrize['setRedeemPrizeURL'](item.getStore().first().getId());
            me.getUCloseBB().hide();
            me.getUBB().hide();
            break;
         }
         case 'showPrize' :
         {
            var item = view.getInnerItems()[0];
            store = Ext.StoreMgr.get('MerchantPrizeStore');
            EarnPrize['setRedeemPrizeURL'](item.getStore().first().getId());
            me.getSCloseBB().hide();
            me.getSBB().hide();
            break;
         }
         case 'reward' :
         {
            var item = view.getInnerItems()[0];
            store = Ext.StoreMgr.get('RedemptionsStore');
            CustomerReward['setRedeemPointsURL'](item.getStore().first().getCustomerReward().getId());
            me.getSCloseBB().hide();
            me.getSBB().hide();
            break;
         }
      }

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.retrievingQRCodeMsg
      });
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
               Ext.Viewport.setMasked(false);
               btn.show();
            }
         }
      });
   },
   onPrizeCheck : function(records, operation)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.stopRouletteBall();
      //console.debug("onPrizeCheck Completed!");

      if(records.length == 0)
      {
         console.log("Prize LOST!");

         Ext.device.Notification.show(
         {
            title : 'Scan And Win!',
            message : me.lostPrizeMsg,
            callback : function()
            {
               Ext.defer(me.popView, 3 * 1000, me);
            }
         });
      }
      else
      {
         console.log("Prize WON!");

         var flag = 0;
         var custore = Ext.StoreMgr.get('CustomerStore');
         var app = me.getApplication();
         var vport = me.getViewport();

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
         Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['winPrizeSound'], function()
         {
            if(flag & 0x10)
            {
               me.silentPopView(1);
            }
            if((flag |= 0x01) == 0x11)
            {
               me.fireEvent('showprize', records[0]);
            }
         });
         //
         // Update Facebook
         //
         Ext.device.Notification.vibrate();
         Ext.device.Notification.show(
         {
            title : 'Scan And Win!',
            message : me.wonPrizeMsg(records.length),
            callback : function()
            {
               if(flag & 0x01)
               {
                  me.silentPopView(1);
               }
               if((flag |= 0x10) == 0x11)
               {
                  me.fireEvent('showprize', records[0]);
               }
            }
         });
      }
   },
   onShowPrize : function(showPrize)
   {
      var me = this;
      var carousel;
      //
      // Show prize on ShowPrize Container
      //
      me.showPrize = showPrize;

      var _insertPrize = function()
      {
         carousel = me.getMainCarousel();
         carousel.insert(0,
         {
            tag : 'rewardPanel',
            xtype : 'dataview',
            store :
            {
               model : 'Genesis.model.EarnPrize',
               autoLoad : false,
               data : me.showPrize
            },
            useComponents : true,
            scrollable : false,
            defaultType : 'rewarditem',
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         });
         carousel.setActiveItem(0);
      }
      //
      // Add Entry to both views
      //
      me.setMode('userPrizes');
      var prizes = me.getMainPage();
      if(prizes.isPainted() && !prizes.isHidden())
      {
         // Either a carousel or a empty view
         var container = view.getInnerItems()[0];
         if(container && container.isXType('carousel', true))
         {
            _insertPrize();
            console.log("onShowPrize View - Updated UserPrize View.");
         }
      }

      me.setMode('merchantPrizes');
      prizes = me.getMainPage();
      if(prizes.isPainted() && !prizes.isHidden())
      {
         var container = me.getMainCarousel();
         var item = prizes.getItems().item[0];

         //
         // Insert into Carousel only if it's necessary
         //
         if((container && item && item.isXType('carousel', true) && //
         container.query('dataview')[0].getStore().first().getMerchant().getId() == merchantId))
         {
            _insertPrize();
            console.log("onShowPrize View - Updated MerchantPrize View.");
         }
      }

      me.setMode('showPrize');
      Ext.defer(function()
      {
         me.stopRouletteScreen();

         me.pushView(me.getMainPage());

         //Update on Facebook
         Genesis.fb.facebook_onLogin(function(params)
         {
            me.updatingPrizeOnFacebook(me.showPrize);
         }, false, me.updatePrizeOnFbMsg);
      }, 3 * 1000, me);
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onMerchantPrizesActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var container;
      var prizesList = [];

      var tbbar = activeItem.query('titlebar')[0];
      me.getMCloseBB().show();
      me.getMBB().hide();

      //
      // List all the prizes won by the Customer
      //
      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      if(prizes.length > 0)
      {
         for(var i = 0; i < prizes.length; i++)
         {
            //
            // Only show prizes that matches the currently loaded Merchant Data
            //
            if(prizes[i].getMerchant().getId() != merchantId)
            {
               continue;
            }

            prizesList.push(prizes[i]);
         }
      }

      if(prizesList.length == 0)
      {
         view.removeAll();
         view.add(
         {
            tag : 'rewardPanel',
            cls : 'noprizes',
            xtype : 'component',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         });
         me.getMRedeemBtn().hide();
         console.log("MerchantPrize View - No Prizes found.");
      }
      else
      {
         // Either a carousel or a empty view
         var container = view.getInnerItems()[0];
         if((container && container.isXType('carousel', true) &&
         // First item in the carousel
         container.query('dataview')[0].getStore().first().getMerchant().getId() == merchantId))
         {
            //
            // Do Not need to change anything if there are already loaded from before
            //
            console.log("MerchantPrize View - do not need to be updated.");
         }
         else
         {
            //
            // Create Prizes Screen from scratch
            //
            view.removeAll();
            container = me.getMainCarousel();
            var items = [];
            for(var i = 0; i < prizesList.length; i++)
            {
               items.push(
               {
                  tag : 'rewardPanel',
                  xtype : 'dataview',
                  store :
                  {
                     model : 'Genesis.model.EarnPrize',
                     autoLoad : false,
                     data : prizesList[i]
                  },
                  useComponents : true,
                  scrollable : false,
                  defaultType : 'rewarditem',
                  defaultUnit : 'em',
                  margin : '0 0 0.8 0'
               });
            }
            container.add(items);

            console.log("MerchantPrize View - Found " + prizesList.length + " Prizes needed to update.");
         }
         me.getMRedeemBtn().show();
      }
   },
   onUserPrizesActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var items = [], container;
      var prizesList = [];

      var tbbar = activeItem.query('titlebar')[0];
      me.getUCloseBB().hide();
      me.getUBB().show();

      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      for(var i = 0; i < prizes.length; i++)
      {

         prizesList.push(prizes[i]);
      }

      if(prizesList.length == 0)
      {
         view.removeAll();
         view.add(
         {
            tag : 'rewardPanel',
            cls : 'noprizes',
            xtype : 'component',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         });
         me.getURedeemBtn().hide();

         console.log("UserPrize View - No Prizes found.");
      }
      else
      {
         // Either a carousel or a empty view
         var container = view.getInnerItems()[0];
         if(container && container.isXType('carousel', true))
         {
            //
            // User Prizes have been loaded previously, no need to refresh!
            //
            console.log("UserPrize View - do not need to be updated.");
         }
         else
         {
            view.removeAll();
            container = me.getMainCarousel();
            for(var i = 0; i < prizesList.length; i++)
            {
               items.push(
               {
                  tag : 'rewardPanel',
                  xtype : 'dataview',
                  store :
                  {
                     model : 'Genesis.model.EarnPrize',
                     autoLoad : false,
                     data : prizesList[i]
                  },
                  useComponents : true,
                  scrollable : false,
                  defaultType : 'rewarditem',
                  defaultUnit : 'em',
                  margin : '0 0 0.8 0'
               });
            }
            container.add(items);

            console.log("UserPrize View - Found " + prizesList.length + " Prizes needed to update.");
         }

         me.getURedeemBtn().show();
      }
   },
   onShowPrizeActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var container = view;

      var tbbar = activeItem.query('titlebar')[0];
      var photo = me.showPrize.getCustomerReward().get('photo');
      me.getSCloseBB().show();
      me.getSBB().hide();
      switch (me.getMode())
      {
         case 'authReward' :
         {
            me.getSRedeemBtn().hide();
            tbbar.addCls('kbTitle');
            tbbar.setTitle(' ');
            me.getRefreshBtn()[photo ?  'show' :'hide']();
            me.getVerifyBtn()[photo ?  'hide' :'show']();
            break;
         }
         case 'reward' :
         {
            tbbar.removeCls('kbTitle');
            tbbar.setTitle('Rewards');
            me.getRefreshBtn()['hide']();
            me.getVerifyBtn()['hide']();
            break;
         }
         case 'showPrize' :
         default:
            tbbar.removeCls('kbTitle');
            me.getSRedeemBtn().show();
            tbbar.setTitle('Prizes');
            me.getRefreshBtn()['hide']();
            me.getVerifyBtn()['hide']();
            break;
      }
      container.query('dataview[tag=rewardPanel]')[0].getStore().setData(me.showPrize);
      delete me.showPrize;
      console.log("ShowPrize View - Updated ShowPrize View.");
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;
      var prizes = me.getMainPage();
      var mode = overrideMode || me.getMode();

      if(prizes.isPainted() && !prizes.isHidden())
      {
         var store = Ext.StoreMgr.get('MerchantPrizeStore');
         switch (mode)
         {
            case 'merchantPrizes' :
            {
               me.getMDoneBtn().hide();
               me.getMRedeemBtn().hide();
            }
            case 'userPrizes' :
            {
               me.setMode('userPrizes');
               me.onDoneTap(null, null, null, null, 'showPrize');
               me.setMode('merchantPrizes');
               me.onDoneTap(null, null, null, null, 'showPrize');

               me.getUDoneBtn().hide();
               me.getURedeemBtn().hide();
               me.popView();
               break;
            }
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
               if(!overrideMode)
               {
                  me.getSDoneBtn().hide();
                  me.getSRedeemBtn().hide();
                  me.popView();
               }
               break;
            }
            case 'reward' :
            {
               if(!overrideMode)
               {
                  me.getSDoneBtn().hide();
                  me.getSRedeemBtn().hide();
                  me.popView();
               }
               break;
            }
         }
      }
   },
   onRedeemPrizeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var cvenue = viewport.getCheckinInfo().venue;

      if(!cvenue || !venue || (venue.getId() != cvenue.getId()))
      {
         Ext.device.Notification.show(
         {
            title : view.query('titlebar')[0].getTitle(),
            message : me.checkinFirstMsg
         });
         return;
      }

      Ext.device.Notification.show(
      {
         title : view.query('titlebar')[0].getTitle(),
         message : me.redeemPrizeConfirmMsg,
         buttons : ['Confirm', 'Cancel'],
         callback : function(btn)
         {
            if(btn.toLowerCase() == 'confirm')
            {
               me.fireEvent('redeemprize', venue, view);
            }
         }
      });
   },
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getMainPage();
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getInnerItems()[0];
      var photo = item.query('component[tag=itemPhoto]')[0];
      photo.element.setStyle(
      {
         'background-image' : 'url(' + qrcodeMeta[0] + ')',
         'background-size' : Genesis.fn.addUnit(qrcodeMeta[1]) + ' ' + Genesis.fn.addUnit(qrcodeMeta[2])
      });
   },
   showPrizeQRCode : function(timeout, qrcode)
   {
      var me = this;

      //
      // For Debugging purposes
      //
      /*
       if(!qrcode)
       {
       console.log("Generaintg QR Code ... we lack one");
       qrcode = Genesis.controller.ControllerBase.genQRCodeFromParams(
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
       */
      {
         console.log("\n" + //
         "Encrypted Code :\n" + qrcode + "\n" + //
         "Encrypted Code Length: " + qrcode.length);

         qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      }
      if(qrcode[0])
      {
         me.getURedeemBtn().hide();
         me.getUDoneBtn().show();
         me.getMRedeemBtn().hide();
         me.getMDoneBtn().show();
         me.getSRedeemBtn().hide();
         me.getSDoneBtn().show();

         me.onRefreshQRCode(qrcode);

         Ext.Viewport.setMasked(false);
         Ext.device.Notification.show(
         {
            title : 'Redemption Alert',
            message : me.showQrCodeMsg
         });
         Ext.device.Notification.vibrate();
      }
   },
   onRedeemRewards : function(showPrize)
   {
      this.showPrize = showPrize;
      this.setMode('reward');
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
   openPage : function(subFeature)
   {
      switch (subFeature)
      {
         case 'merchantPrizes' :
         {
            this.setMode('merchantPrizes');
            this.pushView(this.getMainPage());
            break;
         }
         case 'userPrizes' :
         {
            this.setMode('userPrizes');
            this.pushView(this.getMainPage());
            break;
         }
      }
   },
   getMainCarousel : function()
   {
      var carousel = null;
      switch (this.getMode())
      {
         case 'userPrizes' :
         {
            carousel = this.getUserPrizesCarousel();
            if(!carousel)
            {
               var container = this.getMainPage();
               container.removeAll();
               container.add(
               {
                  xtype : 'carousel',
                  scrollable : undefined
               });
               carousel = this.getUserPrizesCarousel();
            }
            break;
         }
         case 'merchantPrizes' :
         {
            carousel = this.getMerchantPrizesCarousel();
            if(!carousel)
            {
               var container = this.getMainPage();
               container.removeAll();
               container.add(
               {
                  xtype : 'carousel',
                  scrollable : undefined
               });
               carousel = this.getMerchantPrizesCarousel();
            }
            break;
         }
         case 'showPrize' :
         case 'reward' :
         case 'authReward' :
         {
            break;
         }
      }
      return carousel;
   },
   getMainPage : function()
   {
      var me = this;
      var page;
      switch (me.getMode())
      {
         case 'userPrizes' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
            page = me.getUserPrizes();
            break;
         }
         case 'merchantPrizes' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            page = me.getMerchantPrizes();
            break;
         }
         case 'showPrize' :
         case 'reward' :
            page = me.getShowPrize();
         case 'authReward' :
         {
            page = me.getShowPrize();
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            break;
         }
      }
      return page;
   },
   openMainPage : function()
   {
      this.setMode('userPrizes');
      this.pushView(this.getMainPage());
      console.log("Prizes Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});
