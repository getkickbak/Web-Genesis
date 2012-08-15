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
         'refreshQRCode' : 'onRefreshQRCode',
         'updatePrizeViews' : 'onUpdatePrizeViews'
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
         //sBB : 'showprizeview[tag=showPrize] button[tag=back]',
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
         },
         /*
         refreshBtn :
         {
            tap : 'onRefreshQRCode'
         },
         */
         verifyBtn :
         {
            tap : 'popView'
         }
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
   wonPrizeEmailMsg : function(prizeName, venueName)
   {
      return ('I just won ' + prizeName + ' for eating out at ' + venueName + '!');
   },
   lostPrizeMsg : 'Oops, Play Again!',
   showQrCodeMsg : 'Show this Authorization Code to your server to redeem!',
   checkinFirstMsg : 'Please Check-in before claiming any prize(s)',
   redeemPrizeConfirmMsg : 'Please confim to redeem this item',
   init : function()
   {
      var me = this;
      this.callParent(arguments);

      console.log("Prizes Init");
      //
      // Preloading Pages to memory
      //
      Ext.defer(function()
      {
         me.getUserPrizes();
         me.getMerchantPrizes();
         me.getShowPrize();
      }, 1, me);
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
         var message = me.wonPrizeEmailMsg(earnprize.getCustomerReward().get('title'), venue.get('name'));

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
      var venueId = (venue) ? venue.getId() : 0;

      var store, item;
      switch (me.getMode())
      {
         case 'merchantPrizes' :
         case 'userPrizes' :
         {
            var carousel = me.getMainCarousel();
            item = carousel.getActiveItem();
            store = Ext.StoreMgr.get('PrizeStore');
            CustomerReward['setRedeemPrizeURL'](item.getStore().first().getId());
            break;
         }
         case 'showPrize' :
         {
            item = view.getInnerItems()[0];
            store = Ext.StoreMgr.get('PrizeStore');
            CustomerReward['setRedeemPrizeURL'](item.getStore().first().getId());
            break;
         }
         case 'reward' :
         {
            item = view.getInnerItems()[0];
            store = Ext.StoreMgr.get('RedeemStore');
            CustomerReward['setRedeemPointsURL'](item.getStore().first().getCustomerReward().getId());
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

      if (records.length == 0)
      {
         console.log("Prize LOST!");

         Ext.device.Notification.show(
         {
            title : 'Scan And Win!',
            message : me.lostPrizeMsg,
            callback : function()
            {
               Ext.defer(me.popView, 1 * 1000, me);
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
      var store = Ext.StoreMgr.get('PrizeStore');

      //
      // Show prize on ShowPrize Container
      //
      me.showPrize = showPrize;
      store.add(showPrize);
      me.persistSyncStores('PrizeStore');

      me.redirectTo('prize');
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      var merchantId = me.merchantId;
      var vstore = Ext.StoreMgr.get('VenueStore');
      var view = me.getMainPage();

      Venue['setFindNearestURL']();
      vstore.load(
      {
         scope : me,
         params :
         {
            'merchant_id' : merchantId,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(records, operation)
         {
            Ext.Viewport.setMasked(false);
            if (operation.wasSuccessful())
            {
               var metaData = Venue.getProxy().getReader().metaData;
               if (metaData)
               {
                  me.operation = operation;
                  me.metaData = metaData;
                  Ext.device.Notification.show(
                  {
                     title : 'Redeem Prize',
                     message : me.redeemPrizeConfirmMsg,
                     buttons : ['Confirm', 'Cancel'],
                     callback : function(btn)
                     {
                        if (btn.toLowerCase() == 'confirm')
                        {
                           me.fireEvent('redeemprize', me.getURedeemBtn(), records[0], view);
                        }
                     }
                  });
               }
               else
               {
                  console.log("No MetaData found on Venue!");
               }
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg
               });
            }
         },
      });
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onMerchantPrizesActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      me.getMCloseBB().show();
      me.getMBB().hide();

      //
      // List all the prizes won by the Customer
      //
      var viewport = me.getViewPortCntlr();
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var prizesList = [];
      var prizes = Ext.StoreMgr.get('PrizeStore').getRange();
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
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
         //activeItem.getInnerItems()[i].setVisibility(false);
      }
      //activeItem.createView();
   },
   onUserPrizesActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var prizesList = [];

      me.getUCloseBB().hide();
      me.getUBB().show();
      //me.getURedeemBtn().hide();

      var prizes = Ext.StoreMgr.get('PrizeStore').getRange();
      for (var i = 0; i < prizes.length; i++)
      {
         prizesList.push(prizes[i]);
      }
      if (prizesList.length == 0)
      {
         me.getURedeemBtn().hide();
      }
      else
      {
         me.getURedeemBtn().show();
      }
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
         //activeItem.getInnerItems()[i].setVisibility(false);
      }
      //activeItem.createView();
   },
   onShowPrizeActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();

      var tbbar = activeItem.query('titlebar')[0];
      var photo = me.showPrize.getCustomerReward().get('photo');
      me.getSCloseBB().show();
      //me.getSBB().hide();
      switch (me.getMode())
      {
         case 'authReward' :
         {
            tbbar.addCls('kbTitle');
            tbbar.setTitle(' ');
            me.getRefreshBtn()[photo ?  'show' :'hide']();
            me.getVerifyBtn()[photo ?  'hide' :'show']();
            me.getSRedeemBtn().hide();
            break;
         }
         case 'reward' :
         {
            tbbar.removeCls('kbTitle');
            tbbar.setTitle('Rewards');
            me.getRefreshBtn()['hide']();
            me.getVerifyBtn()['hide']();
            me.getSRedeemBtn().show();
            break;
         }
         case 'showPrize' :
         default:
            tbbar.removeCls('kbTitle');
            tbbar.setTitle('Prizes');
            me.getRefreshBtn()['hide']();
            me.getVerifyBtn()['hide']();
            me.getSRedeemBtn().show();
            break;
      }
      view.showPrize = me.showPrize;
      console.log("ShowPrize View - Updated ShowPrize View.");
      Ext.defer(function()
      {
         //activeItem.createView();
         delete me.showPrize;
      }, 1, activeItem);
      //view.createView();
      //delete me.showPrize;
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;
      var prizes = me.getMainPage();
      var mode = overrideMode || me.getMode();
      var carousel = prizes.query('carousel')[0];
      var prize;

      if (prizes.isPainted() && !prizes.isHidden())
      {
         //
         // Remove Prize
         //
         if (mode != 'reward')
         {
            var store = Ext.StoreMgr.get('PrizeStore');
            var container = carousel || prizes;
            var item = carousel ? carousel.getActiveItem() : container.getInnerItems()[0];

            prize = item.getStore().getData().items[0];
            store.remove(prize);
            me.persistSyncStores('PrizeStore');
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

         //
         // Remove Prize when it's not in view
         //
         if (mode != 'reward')
         {
            me.onUpdatePrizeViews(prize);
         }
      }
   },
   onRedeemPrizeTap : function(b, e, eOpts, eInfo)
   {
      var me = this, venue = null;
      var view = me.getMainPage();
      var bypass = false;
      var title = view.query('titlebar')[0].getTitle();

      switch (me.getMode())
      {
         case 'userPrizes' :
         {
            me.merchantId = view.getInnerItems()[0].getActiveItem().getStore().first().getMerchant().getId();
            break;
         }
         case 'showPrize' :
         {
            me.merchantId = view.getInnerItems()[0].getStore().first().getMerchant().getId();
            break;
         }
         case 'reward' :
         {
            bypass = me.getApplication().getController('client.Redemptions').getMode() == 'redeemSC';
         }
         default :
            var viewport = me.getViewPortCntlr();
            venue = viewport.getVenue();
            var cvenue = viewport.getCheckinInfo().venue;

            if (!bypass && (!cvenue || !venue || (venue.getId() != cvenue.getId())))
            {
               Ext.device.Notification.show(
               {
                  title : title,
                  message : me.checkinFirstMsg
               });
               return;
            }
            break;
      }
      Ext.device.Notification.show(
      {
         title : title,
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
      var title = null;

      console.log("\n" + //
      "Encrypted Code :\n" + qrcode + "\n" + //
      "Encrypted Code Length: " + qrcode.length);

      qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
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
               me.getUBB().hide();
               me.getUCloseBB().hide();
               title = 'Redeem Prize';
               break;
            }
            case 'merchantPrizes' :
            {
               dom = Ext.DomQuery.select('div.itemPoints',me.getMerchantPrizesCarousel().getActiveItem().element.dom)[0];
               me.getMRedeemBtn().hide();
               me.getMDoneBtn().show();
               me.getMCloseBB().hide();
               title = 'Redeem Prize';
               break;
            }
            case 'reward' :
            {
               title = 'Redeem Rewards';
            }
            case 'showPrize' :
            {
               dom = Ext.DomQuery.select('div.itemPoints',me.getShowPrize().element.dom)[0];
               me.getSRedeemBtn().hide();
               me.getSDoneBtn().show();
               me.getSCloseBB().hide();
               title = (!title) ? 'Redeem Prize' : title;
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
            title : title,
            message : me.showQrCodeMsg
         });
         Ext.device.Notification.vibrate();
      }
   },
   onUpdatePrizeViews : function(prize)
   {
      var me = this;
      var prizes = me.getMainPage();

      //
      // Update Prize Views
      //
      Ext.defer(function()
      {
         console.log("Updating Prize Views ...");
         var pages = [me.getMerchantPrizes(), me.getUserPrizes()];
         for (var i = 0; i < pages.length; i++)
         {
            if (prize)
            {
               var carousel = pages[i].query('carousel')[0];
               if (carousel)
               {
                  var items = carousel.getInnerItems();
                  for (var x = 0; x < items.length; x++)
                  {
                     if (items[x].getStore().getData().items[0].getId() == prize.getId())
                     {
                        console.log("Updated Prize Views[" + x + "] ...");
                        carousel.remove(items[x]);
                        break;
                     }
                  }
               }
            }
            else
            {
               console.log("Emptied Prize View Container[" + i + "] ...");
               pages[i].removeAll(true);
            }
         }
      }, 1, me);
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
      console.log("Prizes Page Opened");
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
            me.setAnimationMode(me.self.superclass.self.animationMode['cover']);
            page = me.getUserPrizes();
            break;
         }
         case 'merchantPrizes' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
            page = me.getMerchantPrizes();
            break;
         }
         case 'showPrize' :
         case 'reward' :
         case 'authReward' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
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
