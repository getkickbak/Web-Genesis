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
      routes :
      {
         'userPrizes' : 'userPrizesPage',
         'merchantPrizes' : 'merchantPrizesPage',
         'prize' : 'prizePage',
         'authReward' : 'authRewardPage',
         'redeemRewards' : 'redeemRewardsPage'
      },
      listeners :
      {
         'redeemprize' : 'onRedeemPrize',
         'prizecheck' : 'onPrizeCheck',
         'showprize' : 'onShowPrize',
         'authreward' : 'onAuthReward',
         'redeemrewards' : 'onRedeemRewards',
         'showQRCode' : 'onShowPrizeQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
      },
      refs :
      {
         // UserPrizes
         uCloseBB : 'prizesview[tag=userPrizes] button[tag=close]',
         uBB : 'prizesview[tag=userPrizes] button[tag=back]',
         uDoneBtn : 'prizesview[tag=userPrizes] button[tag=done]',
         uRedeemBtn : 'prizesview[tag=userPrizes] button[tag=redeem]',
         //uMerchantBtn : 'prizesview[tag=userPrizes] rewarditem component[tag=info]',
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
            if (!response || response.error)
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
   onRedeemPrize : function(btn, venue, view)
   {
      var me = this;
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      var store;
      switch (me.getMode())
      {
         case 'merchantPrizes' :
         //me.getMCloseBB().hide();
         //me.getMBB().hide();
         case 'userPrizes' :
         {
            var carousel = me.getMainCarousel();
            var item = carousel.getActiveItem();
            store = Ext.StoreMgr.get('MerchantPrizeStore');
            EarnPrize['setRedeemPrizeURL'](item.getStore().first().getId());
            //me.getUCloseBB().hide();
            //me.getUBB().hide();
            break;
         }
         case 'showPrize' :
         {
            var item = view.getInnerItems()[0];
            store = Ext.StoreMgr.get('MerchantPrizeStore');
            EarnPrize['setRedeemPrizeURL'](item.getStore().first().getId());
            //me.getSCloseBB().hide();
            //me.getSBB().hide();
            break;
         }
         case 'reward' :
         {
            var item = view.getInnerItems()[0];
            store = Ext.StoreMgr.get('RedemptionsStore');
            CustomerReward['setRedeemPointsURL'](item.getStore().first().getCustomerReward().getId());
            //me.getSCloseBB().hide();
            //me.getSBB().hide();
            break;
         }
      }

      btn.hide();
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
         },
         callback : function(records, operation)
         {
            if (!operation.wasSuccessful())
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

      if (records.length == 0)
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
            if ((flag |= 0x01) == 0x11)
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
               if ((flag |= 0x10) == 0x11)
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
      var store = Ext.StoreMgr.get('MerchantPrizeStore');

      //
      // Show prize on ShowPrize Container
      //
      me.showPrize = showPrize;
      store.add(showPrize);
      me.persistSyncStores('MerchantPrizeStore');

      me.redirectTo('prize');
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onMerchantPrizesActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var prizesList = [];

      me.getMCloseBB().show();
      me.getMBB().hide();

      //
      // List all the prizes won by the Customer
      //
      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      if (prizes.length > 0)
      {
         for (var i = 0; i < prizes.length; i++)
         {
            //
            // Only show prizes that matches the currently loaded Merchant Data
            //
            if (prizes[i].getMerchant().getId() != merchantId)
            {
               continue;
            }

            prizesList.push(prizes[i]);
         }
      }

      if (prizesList.length == 0)
      {
         me.getMRedeemBtn().hide();
      }
      else
      {
         me.getMRedeemBtn().show();
      }
      activeItem.createView();
   },
   onUserPrizesActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var items = [], prizesList = [];
      var views;

      me.getUCloseBB().hide();
      me.getUBB().show();
      me.getURedeemBtn().hide();

      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      for (var i = 0; i < prizes.length; i++)
      {

         prizesList.push(prizes[i]);
      }
      /*
       if (prizesList.length == 0)
       {
       me.getURedeemBtn().hide();
       }
       else
       {
       me.getURedeemBtn().show();
       }
       */
      activeItem.createView();
   },
   onShowPrizeActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();

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
      view.showPrize = me.showPrize;
      console.log("ShowPrize View - Updated ShowPrize View.");
      view.createView();
      delete me.showPrize;
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;
      var prizes = me.getMainPage();
      var mode = overrideMode || me.getMode();

      if (prizes.isPainted() && !prizes.isHidden())
      {
         //
         // Remove Prize
         //
         if (mode != 'reward')
         {
            var store = Ext.StoreMgr.get('MerchantPrizeStore');
            var carousel = prizes.query('carousel')[0];
            var container = carousel || prizes;
            var item = carousel ? carousel.getActiveItem() : container.getInnerItems()[0];

            store.remove(item.getStore().getData().items[0]);
            me.persistSyncStores('MerchantPrizeStore');
         }

         switch (mode)
         {
            case 'merchantPrizes' :
            {
               me.getMDoneBtn().hide();
               me.getMRedeemBtn().hide();
               break;
            }
            case 'userPrizes' :
            {
               me.getUDoneBtn().hide();
               me.getURedeemBtn().hide();
               break;
            }
            case 'reward' :
            case 'showPrize' :
            {
               me.getSDoneBtn().hide();
               me.getSRedeemBtn().hide();
               break;
            }
         }
         me.popView();
      }
   },
   onRedeemPrizeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var cvenue = viewport.getCheckinInfo().venue;

      if (!cvenue || !venue || (venue.getId() != cvenue.getId()))
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
            if (btn.toLowerCase() == 'confirm')
            {
               me.fireEvent('redeemprize', b, venue, view);
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
   onShowPrizeQRCode : function(timeout, qrcode)
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
      if (qrcode[0])
      {
         var dom;
         switch (me.getMode())
         {
            case 'userPrizes' :
            {
               dom = Ext.DomQuery.select('div.itemPoints',me.getUserPrizesCarousel().getActiveItem().element.dom)[0];
               me.getURedeemBtn().hide();
               me.getUDoneBtn().show();
               break;
            }
            case 'merchantPrizes' :
            {
               dom = Ext.DomQuery.select('div.itemPoints',me.getMerchantPrizesCarousel().getActiveItem().element.dom)[0];
               me.getMRedeemBtn().hide();
               me.getMDoneBtn().show();
               me.getMCloseBB().hide();
               break;
            }
            case 'reward' :
            case 'showPrize' :
            {
               dom = Ext.DomQuery.select('div.itemPoints',me.getShowPrize().element.dom)[0];
               me.getSRedeemBtn().hide();
               me.getSDoneBtn().show();
               me.getSCloseBB().hide();
               break;
            }
         }
         if (dom)
         {
            Ext.fly(dom).addCls('x-item-hidden');
         }

         me.fireEvent('refreshQRCode', qrcode);

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
      this.redirectTo('redeemRewards');
   },
   onAuthReward : function(showPrize)
   {
      this.showPrize = showPrize;
      this.redirectTo('authReward');
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   userPrizesPage : function()
   {
      this.openPage('userPrizes');
   },
   merchantPrizesPage : function()
   {
      this.openPage('merchantPrizes');
   },
   prizePage : function()
   {
      var me = this;
      var showPrize = me.showPrize;

      me.silentPopView(1);
      me.setMode('showPrize');
      //Ext.defer(function()
      {
         me.stopRouletteScreen();

         me.pushView(me.getMainPage());
         //me.showPrize get deleted

         //Update on Facebook
         Genesis.fb.facebook_onLogin(function(params)
         {
            me.updatingPrizeOnFacebook(showPrize);
         }, false, me.updatePrizeOnFbMsg);
      } //
      //,3 * 1000, me);
   },
   redeemRewardsPage : function()
   {
      this.openPage('reward');
   },
   authRewardPage : function()
   {
      this.openPage('authReward');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      this.setMode(subFeature);
      this.pushView(this.getMainPage());
   },
   getMainCarousel : function()
   {
      var carousel = null;
      switch (this.getMode())
      {
         case 'userPrizes' :
         {
            carousel = this.getUserPrizesCarousel();
            if (!carousel)
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
            if (!carousel)
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
         case 'authReward' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            page = me.getShowPrize();
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
