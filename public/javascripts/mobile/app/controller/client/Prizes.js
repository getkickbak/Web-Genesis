Ext.define('Genesis.controller.client.Prizes',
{
   extend : 'Genesis.controller.client.RedeemBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      clientRedemption_path : '/clientPrizes',
      prizes_path : '/prizes'
   },
   xtype : 'clientPrizesCntlr',
   controllerType : 'prize',
   config :
   {
      timeoutPeriod : 10,
      minPrizePts : 10,
      mode : 'redeemBrowse',
      renderStore : 'PrizesRenderCStore',
      redemptionsStore : 'PrizesStore',
      redeemPointsFn : 'setRedeemPrizePointsURL',
      getRedemptionURL : 'setGetPrizesURL',
      getRedemptionPath : 'redeemBrowsePrizesSC',
      title : 'Prizes',
      routes :
      {
         // Browse Prizes Page
         'prizes' : 'redeemBrowsePage',
         //Shortcut to choose venue to redeem prizes
         'redeemPrizesChooseSC' : 'redeemChooseSCPage',
         //Shortcut to visit Merchant Account for the Vnue Page
         'redeemBrowsePrizesSC' : 'redeemBrowseSCPage',
         //'prize' : 'prizePage',
         'redeemPrize' : 'redeemItemPage'
      },
      refs :
      {
         backBtn : 'clientprizesview button[tag=back]',
         closeBtn : 'clientprizesview button[tag=close]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'clientprizesview',
            autoCreate : true,
            xtype : 'clientprizesview'
         },
         redemptionsList : 'clientprizesview list[tag=prizesList]',
         redemptionsPts : 'clientprizesview component[tag=points]',
         redemptionsPtsEarnPanel : 'clientprizesview dataview[tag=ptsEarnPanel]',
         //
         // Reward Prize
         //
         sCloseBB : 'showredeemitemdetailview[tag=redeemPrize] button[tag=close]',
         //sBB : 'showredeemitemdetailview[tag=redeemPrize] button[tag=back]',
         sDoneBtn : 'showredeemitemdetailview[tag=redeemPrize] button[tag=done]',
         sRedeemBtn : 'showredeemitemdetailview[tag=redeemPrize] button[tag=redeem]',
         refreshBtn : 'showredeemitemdetailview[tag=redeemPrize] button[tag=refresh]',
         verifyBtn : 'showredeemitemdetailview[tag=redeemPrize] button[tag=verify]',
         redeemItem :
         {
            selector : 'showredeemitemdetailview[tag=redeemPrize]',
            autoCreate : true,
            tag : 'redeemPrize',
            xtype : 'showredeemitemdetailview'
         },
         //
         // Scan and Win Rewards Page
         //
         prizeCheckScreen : 'clientrewardsview'
      },
      control :
      {
         redemptions :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         redemptionsList :
         {
            select : 'onItemListSelect',
            disclose : 'onItemListDisclose'

         },
         sDoneBtn :
         {
            tap : 'onDoneTap'
         },
         sRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         },
         redeemItem :
         {
            activate : 'onRedeemItemActivate',
            deactivate : 'onDeactivate'
         }
      },
      listeners :
      {
         'prizecheck' : 'onPrizeCheck',
         //
         // Redeem Prize
         //
         'redeemitem' : 'onRedeemItem',
         'showredeemitem' : 'onShowRedeemItem',
         'showredeemprize' : 'onShowRedeemPrize',
         'showQRCode' : 'onShowItemQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
      }
   },
   checkinFirstMsg : 'Please Check-In before redeeming Prizes',
   eligibleRewardMsg : 'Find out an Eligible Prize you can redeem with your Prize Points!',
   evtFlag : 0,
   loadCallback : null,
   initSound : false,
   authRewardVerifiedMsg : 'Verified',
   updateOnFbMsg : 'Tell your friends on Facebook about it!',
   wonPrizeMsg : function(reward_info)
   {
      var points = reward_info['prize_points'];
      var badgePrizePts = reward_info['badge_prize_points'];

      return ('You\'ve earned' + points + ' Prize Points from this purchase.' + //
      ((!extraPoints) ? Genesis.constants.addCRLF() + me.eligibleRewardMsg : ''));
   },
   wonPrizeEmailMsg : function(prizeName, venueName)
   {
      return ('I\'ve just won enough Prize Points to redeem "' + prizeName + '" for eating out at ' + venueName + '!');
   },
   badgePrizePopUp : function(points, callback)
   {
      callback = callback || Ext.emptyFn;
      Ext.device.Notification.show(
      {
         title : 'Badge Upgrade Alert!',
         message : this.getBadegePrizeMsg(points),
         callback : callback
      });
   },
   getBadegePrizeMsg : function(points)
   {
      return ('You\'ve been awarded an ' + Genesis.constants.addCRLF() + //
      'additional ' + points + ' Prize Points!' + Genesis.constants.addCRLF() + //
      this.eligibleRewardMsg);
   },
   upgradeBadgeEmailMsg : function(badge)
   {
      return ('Your status have been upgraded to ' + badge.toUpperCase() + ' at ' + venueName + '!');
   },
   gotMinPrizePtsMsg : function(points)
   {
      return ('You\'ve won ' + points + ' Prize Points!');
   },
   init : function()
   {
      var me = this;
      me.callParent(arguments);

      console.log("Prizes Init");
   },
   /*
   initPrizeStore : function()
   {
   var me = this;
   var app = me.getApplication();
   Ext.regStore('PrizeStore',
   {
   model : 'Genesis.model.CustomerReward',
   autoLoad : false,
   clearOnPageLoad : false,
   sorters : [
   {
   // Clump by merchant (ascending order)
   sorterFn : function(o1, o2)
   {
   var name1 = o1.getMerchant().get('name');
   var name2 = o2.getMerchant().get('name');
   return (name1 < name2 ? -1 : (name1 > name2 ? 1 : 0));
   },
   direction : 'ASC'
   },

   //{
   // Return based on expiry date (descending order)
   //sorterFn : function(o1, o2)
   //{
   //return Date.parse(o2.get('expiry_date')) - Date.parse(o1.get('expiry_date'));
   //}
   //},
   {
   // Return based on issue date (Bigger Id == issued later)
   sorterFn : function(o1, o2)
   {
   return o2.getId() - o1.getId();
   }
   }],
   listeners :
   {
   scope : this,
   'metachange' : function(store, proxy, eOpts)
   {
   var viewport = _application.getController('Viewport');
   var controller = _application.getController('client.Rewards');
   viewport.updateMetaDataTask.delay(0.1 * 1000, controller.updateMetaData, controller, [metaData]);
   }
   }
   });
   },
   */
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
         var message = me.wonPrizeEmailMsg(earnprize.get('title'), venue.get('name'));

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
   updatingBadgeOnFacebook : function(badge)
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
         var message = me.upgradeBadgeEmailMsg(badge.get('type').value, venue.get('name'));

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
            picture : Genesis.view.client.Badges.getPhoto(badge.get('type'), true),
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
   onPrizeCheck : function(metaData, operation)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var info = metaData['reward_info'];

      me.stopRouletteBall();
      //
      // Minimum Prize Points
      //
      if ((!info['eligible_prize_id']) || (info['eligible_prize_id'] <= 0))
      {
         console.log("No Prize to Show.");

         Ext.device.Notification.show(
         {
            title : 'Scan And Win!',
            message : me.gotMinPrizePtsMsg(info['prize_points']),
            callback : function()
            {
               Ext.defer(me.popView, 1 * 1000, me);
            }
         });
      }
      //
      // LumpSum Prize Points
      // Either Prize Points or Badge Prize Points
      else
      {
         console.log("WON LumpSum Prize Points.");

         var flag = 0;
         var pstore = Ext.StoreMgr.get('PrizeStore');
         var prize = pstore.getById(metaData['eligible_prize_id']);

         //
         // Play the prize winning music!
         //
         Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['winPrizeSound'], function()
         {
            if ((flag |= 0x01) == 0x11)
            {
               me.fireEvent('showredeemprize', prize, info);
            }
         });

         Ext.device.Notification.vibrate();
         Ext.device.Notification.show(
         {
            title : 'Scan And Win!',
            message : me.wonPrizeMsg(info),
            callback : function()
            {
               if (info['badge_prize_points'] > me.getMinPrizePts())
               {
                  me.badgePrizePopUp(info['badge_prize_points'], function()
                  {
                     if ((flag |= 0x01) == 0x11)
                     {
                        me.fireEvent('showredeemprize', prize, info);
                     }
                  });
               }
               else
               {
                  if ((flag |= 0x01) == 0x11)
                  {
                     me.fireEvent('showredeemprize', prize, info);
                  }
               }
            }
         });
      }
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onShowRedeemItem : function(redeemItem)
   {
      var me = this;

      //
      // Show prize on redeemItem Container
      //
      me.redeemItem = redeemItem;
      /*
       var store = Ext.StoreMgr.get('PrizeStore');
       store.add(redeemItem);
       me.persistSyncStores('PrizeStore');
       */
      me.redirectTo('redeemPrize');
   },
   onShowRedeemPrize : function(reward_info)
   {
      var me = this;
      var redeemItem = me.redeemItem;

      me.silentPopView(1);
      me.setMode('redeemPrize');
      //Ext.defer(function()
      {
         me.stopRouletteScreen();

         me.pushView(me.getMainPage());
         //me.redeemItem get deleted

         //Update on Facebook
         Genesis.fb.facebook_onLogin(function(params)
         {
            if ((reward_info['eligible_prize_id']) && (reward_info['eligible_prize_id'] > 0))
            {
               me.updatingPrizeOnFacebook(redeemItem);
            }
            if ((reward_info['badge_prize_points']) && (reward_info['badge_prize_points'] > 0))
            {
               me.updatingBadgeOnFacebook(redeemItem);
            }
         }, false, me.updateOnFbMsg);
      }
      //,3 * 1000, me);
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemChooseSCPage : function()
   {
      var controller = this.getApplication().getController('client.Accounts');
      controller.redeemPrizesChooseSCPage();
   },
   redeemItemPage : function()
   {
      this.openPage('redeemPrize');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
