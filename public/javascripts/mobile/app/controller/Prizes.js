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
   initSound : false,
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
   onPrizeCheck : function(records, operation, callback)
   {
      var me = this;
      var flag = 0;
      var custore = Ext.StoreMgr.get('CustomerStore');
      var app = me.getApplication();
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var fb = Genesis.constants.getLocalStorage();

      callback = callback || Ext.emptyFn;
      if(operation.wasSuccessful())
      {
         if(records.length == 0)
         {
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
            me.playSoundFile(viewport.sound_files['winPrizeSound'], function()
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
            if(fb.getItem('currFbId') > 0)
            {
               var merchant = viewport.getVenue().getMerchant();
               FB.ui(
               {
                  method : 'stream.publish',
                  name : merchant.get('name'),
                  //link : href,
                  link : Genesis.constants.site,
                  caption : Genesis.constants.site,
                  description : merchant.get('desc'),
                  piture : Genesis.view.client.Rewards.getPhoto(records[0].getCustomerReward().get('type')),
                  message : 'I just won a prize visiting ' + merchant.get('name') + '!'
               }, function(response)
               {
                  if(response && response.post_id)
                  {
                     console.log('Posted to your Facebook Newsfeed. Post ID(' + response.post_id + ')');
                  }
                  else
                  {
                     console.log('Post was not published to Facebook.');
                  }
               });
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
      }
      callback(operation.wasSuccessful());
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
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
         me.getRedeemBtn().show();
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
      var id = item.getStore().first().getId();
      switch (me.getMode())
      {
         case 'showPrize' :
         case 'prizes' :
         {
            store = Ext.StoreMgr.get('MerchantPrizeStore');
            EarnPrize['setRedeemPrizeURL'](id);
            break;
         }
         case 'reward' :
         {
            store = Ext.StoreMgr.get('RedemptionsStore');
            CustomerReward['setRedeemPointsURL'](id);
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
         var iv = CryptoJS.enc.Hex.parse(Math.random().toFixed(20).toString().split('.')[1]);
         qrcode = iv + '$' + Ext.encode('{":expirydate" : ' + new Date().addDays(1).format('Y-M-d'));
      }

      /*
       switch (me.getMode())
       {
       case 'showPrize' :
       case 'prizes' :
       title = 'Prize Redemption Alert!';
       break;
       case 'reward' :
       title = 'Reward Redemption Alert!';
       break;
       }
       if(timeout > 0)
       {
       Ext.Viewport.setMasked(
       {
       xtype : 'loadmask',
       indicator : false,
       message : me.showScreenTimeoutMsg(timeout + ' minute(s)')
       });
       me.cancelId = Ext.defer(function(timeout)
       {
       me.showPrizeQrCode(timeout);
       }, 1 * 60 * 1000, me, [--timeout]);
       me.hidelId = Ext.defer(function(timeout)
       {
       delete me.hidelId;
       Ext.Viewport.setMasked(false);
       }, 0.25 * 1 * 60 * 1000);
       }
       else
       {
       clearTimeout(me.hideId);
       Ext.Viewport.setMasked(false);
       Ext.device.Notification.show(
       {
       title : title
       message : me.showScreenTimeoutExpireMsg(me.getTimeoutPeriod() + ' minutes'),
       callback : function()
       {
       me.onDoneTap();
       }
       });
       }
       */
      console.log("Encripted Code :\n" + qrcode);
      console.log("Encripted Code Length: " + qrcode.length);

      me.getRedeemBtn().hide();
      me.getDoneBtn().show();

      var view = me.getPrizes();
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getItems().items[0];
      var photo = item.query('component[tag=itemPhoto]')[0];
      element = Ext.fly(Ext.DomQuery.select( 'img', photo.element.dom)[0]);
      element.set(
      {
         'src' : me.genQRCode(qrcode)
      });
      Ext.device.Notification.show(
      {
         title : 'Redemption Alert',
         message : me.showQrCodeMsg
         /*,callback : function()
          {
          me.onDoneTap();
          }
          */
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
      this.showPrize = showPrize;
      this.setMode('showPrize');
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
