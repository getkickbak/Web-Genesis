Ext.define('Genesis.controller.client.Prizes',
{
   extend : 'Genesis.controller.client.RedeemBase',
   requires : ['Ext.data.Store', 'Genesis.view.client.Prizes', 'Genesis.view.client.Badges'],
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
      minPrizePts : 1,
      browseMode : 'redeemBrowse',
      redeemMode : 'redeemPrize',
      renderStore : 'PrizeRenderCStore',
      redeemStore : 'PrizeStore',
      redeemPointsFn : 'setRedeemPrizePointsURL',
      redeemUrl : 'setGetPrizesURL',
      redeemPath : 'redeemBrowsePrizesSC',
      ptsProperty : 'prize_points',
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
         'redeemPrize' : 'redeemItemPage',
         'badgeDetail' : 'badgeDetailPage'
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
         // Scan and Play Rewards Page
         //
         prizeCheckScreen : 'clientrewardsview',
         //
         // BadgeDetail
         //
         badgeDetail :
         {
            selector : 'promotionalitemview[tag=badgeDetail]',
            autoCreate : true,
            tag : 'badgeDetail',
            xtype : 'promotionalitemview'
         },
         bDoneBtn : 'promotionalitemview[tag=badgeDetail] button[tag=done]'
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
            deactivate : 'onRedeemItemDeactivate'
         },
         badgeDetail :
         {
            activate : 'onBadgeDetailActivate',
            deactivate : 'onBadgeDetailDeactivate'
         },
         bDoneBtn :
         {
            tap : 'onBadgeDetailDoneTap'
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
         'showredeemprize' : 'onShowRedeemPrize', //Redeem Prize broadcast to Social Media
         'showQRCode' : 'onShowItemQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
      }
   },
   checkinFirstMsg : 'Please Check-In before redeeming Prizes',
   eligibleRewardMsg : 'Check out an Eligible Prize you can redeem with your Prize Points!',
   scanPlayTitle : 'Scan And Play',
   evtFlag : 0,
   flag : 0,
   loadCallback : null,
   initSound : false,
   authRewardVerifiedMsg : 'Verified',
   updateOnFbMsg : 'Tell your friends on Facebook about it!',
   wonPrizeMsg : function(reward_info)
   {
      var me = this;
      var points = reward_info['prize_points'];
      var extraPoints = reward_info['badge_prize_points'];

      return (((points > me.getMinPrizePts()) ? //
      'You\'ve won a JACKPOT' + Genesis.constants.addCRLF() + 'of ' + points + ' Prize Points!' : me.gotMinPrizePtsMsg(points)) + //
      ((extraPoints == 0) ? Genesis.constants.addCRLF() + me.eligibleRewardMsg : ''));
   },
   wonPrizeEmailMsg : function(prizeName, venueName)
   {
      return ('I\'ve just won enough Prize Points to redeem "' + prizeName + '" for eating out at ' + venueName + '!');
   },
   getBadgePrizeMsg : function(points)
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

      me.callBackStack =
      {
         callbacks : ['eligibleForPrizeHandler', 'badgePrizePointsHandler', 'redeemPrizeHandler'],
         arguments : [],
         startIndex : 0
      };

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

         console.log('Posting Prize Win to Facebook ...' + '\n' + //
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
         var message = me.upgradeBadgeEmailMsg(badge.get('type').display_value, venue.get('name'));

         console.log('Posting Badge Promotion to Facebook ...' + '\n' + //
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
            picture : Genesis.view.client.Badges.getPhoto(badge.get('type'), 'thumbnail_medium_url'),
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
   removeViewHandler : function(metaData, viewsPopLength)
   {
      var me = this;
      if (viewsPopLength > 0)
      {
         me.silentPopView(viewsPopLength);
      }
      me.popView();
   },
   redeemPrizeHandler : function(metaData, viewsPopLength)
   {
      var me = this;
      var info = metaData['reward_info'];
      var eligible = info['eligible_prize_id'] > 0;

      if (eligible)
      {
         var info = metaData['reward_info'];
         var prize = Ext.StoreMgr.get('PrizeStore').getById(info['eligible_prize_id']);

         me.fireEvent('showredeemprize', prize, info, viewsPopLength);
      }
      else
      {
         me.removeViewHandler(metaData, viewsPopLength);
      }

      return false;
   },
   badgePrizePointsHandler : function(metaData, viewsPopLength)
   {
      var me = this;
      var info = metaData['reward_info'];
      var badgeId = metaData['account_info']['badge_id'];
      var rc = info['badge_prize_points'] > 0;

      if (rc)
      {
         Ext.device.Notification.show(
         {
            title : 'Badge Promotion Alert!',
            message : me.getBadgePrizeMsg(info['badge_prize_points']),
            callback : function()
            {
               var badge = Ext.StoreMgr.get('BadgeStore').getById(badgeId);
               me.redeemItem = Ext.create('Genesis.model.CustomerReward',
               {
                  'title' : badge.get('type').display_value,
                  'type' :
                  {
                     value : 'promotion'
                  },
                  'photo' :
                  {
                     'thumbnail_ios_medium' : Genesis.view.client.Badges.getPhoto(badge.get('type'), 'thumbnail_large_url')
                  },
                  'points' : info['badge_prize_points'],
                  'time_limited' : false,
                  'quantity_limited' : false,
                  'merchant' : null
               });

               me.redirectTo('badgeDetail');
            }
         });
      }

      return rc;
   },
   eligibleForPrizeHandler : function(metaData, viewsPopLength)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var info = metaData['reward_info'];
      var eligible = info['eligible_prize_id'] > 0;
      var eligiblePrizeCallback = function(setFlag, viewsPopLength)
      {
         if ((me.flag |= setFlag) == 0x11)
         {
            me.flag = 0;
            me.fireEvent('triggerCallbacksChain');
         }
      }
      if (!eligible)
      {
         console.log("No Prize to Show.");

         //
         // Play the prize winning music!
         //
         Genesis.controller.ControllerBase.playSoundFile(//
         viewport.sound_files['losePrizeSound'], Ext.bind(eligiblePrizeCallback, me, [0x01, viewsPopLength]));

         Ext.device.Notification.show(
         {
            title : me.scanPlayTitle + '!',
            message : me.gotMinPrizePtsMsg(info['prize_points']),
            callback : Ext.bind(eligiblePrizeCallback, me, [0x10, viewsPopLength])
         });
      }
      else
      {
         //
         // Play the prize winning music!
         //
         Genesis.controller.ControllerBase.playSoundFile(//
         viewport.sound_files['winPrizeSound'], //
         Ext.bind(eligiblePrizeCallback, me, [0x01, viewsPopLength]));

         Ext.device.Notification.vibrate();
         Ext.device.Notification.show(
         {
            title : me.scanPlayTitle + '!',
            message : me.wonPrizeMsg(info),
            callback : Ext.bind(eligiblePrizeCallback, me, [0x10, viewsPopLength])
         });
      }

      return true;
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onPrizeCheck : function(metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var info = metaData['reward_info'];

      me.stopRouletteBall();

      //
      // Minimum Prize Points
      //
      if (!Ext.isDefined(info['eligible_prize_id']) || (info['eligible_prize_id'] == 0))
      {
         console.log("No Prize to Show.");
         viewsPopLength = (info['badge_prize_points'] > 0) ? 1 : 0;
      }
      //
      // LumpSum Prize Points
      // Either Prize Points or Badge Prize Points
      else
      {
         console.log("WON LumpSum Prize Points.");
         viewsPopLength = (info['badge_prize_points'] > 0) ? 2 : 1;
      }

      me.callBackStack['arguments'] = [metaData, viewsPopLength];
      me.fireEvent('triggerCallbacksChain');
   },
   onBadgeDetailDoneTap : function(b, e, eOpts)
   {
      var me = this;
      me.fireEvent('triggerCallbacksChain');
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
   onShowRedeemPrize : function(prize, reward_info, viewsPopLength)
   {
      var me = this;
      var redeemItem = me.redeemItem = prize;

      me.silentPopView(viewsPopLength);

      me.stopRouletteScreen();
      //me.setRedeemMode('redeemPrize');
      //me.pushView(me.getRedeemMainPage());
      me.redirectTo('redeemPrize');
      //Update on Facebook
      Genesis.fb.facebook_onLogin(function(params)
      {
         if ((reward_info['eligible_prize_id']) && (reward_info['eligible_prize_id'] > 0))
         {
            me.updatingPrizeOnFacebook(redeemItem);
         }
         if (reward_info['badge_prize_points'] > 0)
         {
            me.updatingBadgeOnFacebook(redeemItem);
         }
      }, false, me.updateOnFbMsg);
   },
   onBadgeDetailActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var tbbar = activeItem.query('titlebar')[0];
      tbbar.setTitle('Badge Promotion');
      activeItem.redeemItem = me.redeemItem;
   },
   onBadgeDetailDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
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
   },
   badgeDetailPage : function()
   {
      this.openPage('badgeDetail');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getRedeemMainPage : function()
   {
      var me = this;
      var page = me.callParent(arguments);

      if (!page)
      {
         switch (me.getRedeemMode())
         {
            case 'badgeDetail' :
            {
               me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['coverUp']);
               page = me.getBadgeDetail();
               break;
            }
         }
      }

      return page;
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
