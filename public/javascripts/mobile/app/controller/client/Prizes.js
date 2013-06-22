Ext.define('Genesis.controller.client.Prizes',
{
   extend : 'Genesis.controller.PrizeRedemptionsBase',
   mixins : ['Genesis.controller.client.mixin.RedeemBase'],
   requires : ['Ext.data.Store', 'Genesis.view.client.Prizes', 'Genesis.view.client.Badges'],
   inheritableStatics :
   {
   },
   xtype : 'clientPrizesCntlr',
   config :
   {
      models : ['CustomerReward'],
      redeemPath : 'redeemBrowsePrizesSC',
      routes :
      {
         //Shortcut to choose venue to redeem prizes
         'redeemPrizesChooseSC' : 'redeemChooseSCPage',
         //Shortcut to visit Merchant Account for the Vnue Page
         'redeemBrowsePrizesSC' : 'redeemBrowseSCPage'
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
         // Spin and Play Rewards Page
         //
         prizeCheckScreen : 'clientrewardsview',
         //
         // Reward Prize
         //
         sBackBB : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=back]',
         sCloseBB : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=close]',
         //sBB : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=back]',
         sDoneBtn : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=done]',
         sRedeemBtn : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=redeem]',
         redeemItem :
         {
            selector : 'clientredeemitemdetailview[tag=redeemPrize]',
            autoCreate : true,
            tag : 'redeemPrize',
            xtype : 'clientredeemitemdetailview'
         }
      },
      control :
      {
         sRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         }
      },
      listeners :
      {
         'prizecheck' : 'onPrizeCheck',
         //
         // Redeem Prize
         //
         'refreshQRCode' : 'onRefreshQRCode'
      }
   },
   _backToMain : false,
   checkinFirstMsg : 'Please Check-In before redeeming Prizes',
   eligibleRewardMsg : 'Check out an Eligible Prize you can redeem with your Prize Points!',
   flag : 0,
   wonPrizeMsg : function(reward_info)
   {
      var me = this;
      var points = reward_info['prize_points'];
      var extraPoints = reward_info['badge_points'];

      return (((points > me.getMinPrizePts()) ? //
      'You\'ve won a JACKPOT of' + Genesis.constants.addCRLF() + points + ' Prize Points!' : me.gotMinPrizePtsMsg(points)) + Genesis.constants.addCRLF() +
      // //
      me.eligibleRewardMsg);
   },
   wonPrizeEmailMsg : function(prizeName, venueName)
   {
      return ('I just won enough Prize Points to redeem "' + prizeName + '" from ' + venueName + '!');
   },
   upgradeBadgeEmailMsg : function(badge, venueName)
   {
      return ('I\'ve just been promoted to ' + badge.toUpperCase() + ' at ' + venueName + '!');
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
         callbacks : ['eligibleForPrizeHandler', 'redeemPrizeHandler'],
         arguments : [],
         startIndex : 0
      };

      console.log("Prizes Client Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   stopRouletteTable : function(scn)
   {
      if (scn)
      {
         var rouletteTable = Ext.get(Ext.DomQuery.select('div.rouletteTable',scn.element.dom)[0]);
         if (rouletteTable)
         {
            rouletteTable.removeCls('spinFwd');
            rouletteTable.removeCls('spinBack');
         }
      }
   },
   stopRouletteBall : function(scn)
   {
      if (scn)
      {
         var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
         if (rouletteBall)
         {
            rouletteBall.removeCls('spinBack');
            rouletteBall.addCls('spinFwd');
         }
      }
   },
   startRouletteScreen : function(scn)
   {
      if (scn)
      {
         var rouletteTable = Ext.get(Ext.DomQuery.select('div.rouletteTable',scn.element.dom)[0]);
         if (rouletteTable)
         {
            rouletteTable.addCls('spinFwd');
         }
         var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
         if (rouletteBall)
         {
            rouletteBall.addCls('spinBack');
         }
      }
   },
   stopRouletteScreen : function(scn)
   {
      this.stopRouletteTable(scn);
      if (scn)
      {
         var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
         if (rouletteBall)
         {
            rouletteBall.removeCls('spinBack');
            rouletteBall.removeCls('spinFwd');
         }
      }
      //this.stopRouletteBall(view);
   },
   updatingPrizeOnFacebook : function(earnprize)
   {
      var me = this, FB = window.plugins.facebookConnect;
      try
      {
         var viewport = me.getViewPortCntlr();
         var venue = viewport.getVenue();
         var site = Genesis.constants.site;
         var wsite = venue.get('website') ? venue.get('website').split(/http[s]*:\/\//) : [null];
         var name = venue.get('name');
         var link = wsite[wsite.length - 1] || site;
         var desc = me.redeemFbMsg;
         //venue.get('description').trunc(256);
         var message = me.wonPrizeEmailMsg(earnprize.get('title'), venue.get('name'));
         var params =
         {
         };

         /*,params1 = Ext.urlEncode({
          og_url : encodeURIComponent(link),
          og_type : getkickbak:rewards,
          og_title : 'KICKBAK Prizes',
          og_image : encodeURIComponent(venue.getMerchant().get('photo')['thumbnail_large_url']),
          og_description : desc,
          body : message
          });
          switch (me.getTitle().toLowerCase())
          {
          case 'rewards' :
          {
          params['rewards'] = serverHost + "/opengraph?" + params1;
          break;
          }
          case 'prizes' :
          {
          params['prizes'] = serverHost + "/opengraph?" + params1;
          break;
          }
          }
          */
         console.log('Posting Prize Win to Facebook ...' + '\n' + //
         'Name: ' + name + '\n' + //
         'Caption: ' + link + '\n' + //
         'Description: ' + desc + '\n' + //
         'Message : ' + message + '\n' //
         );
         FB.requestWithGraphPath(//
         '/me/feed',
         //'/me/getkickbak:got',
         Ext.apply(params,
         {
            name : name,
            //link : href,
            link : link,
            caption : link,
            description : desc,
            picture : venue.getMerchant().get('photo')['thumbnail_large_url'],
            message : message
         }), 'POST', function(response)
         {
            if (!response || response.error || Ext.isString(response))
            {
               console.log('Post was not published to Facebook.');
               Ext.defer(function(earnprize)
               {
                  var me = this;
                  Genesis.fb.facebook_onLogout(null, false);
                  Genesis.fb.facebook_onLogin(function()
                  {
                     me.updatingPrizeOnFacebook(earnprize);
                  }, false);
               }, 1, me, [earnprize]);
            }
            else
            {
               console.log('Posted to your Facebook Newsfeed.');
            }
         });
      }
      catch (e)
      {
         console.log('Exception [' + e + ']' + '\n' + //
         'Post was not published to Facebook.');
      }
   },
   updatingBadgeOnFacebook : function(badge)
   {
      var me = this, FB = window.plugins.facebookConnect;
      try
      {
         var viewport = me.getViewPortCntlr(), venue = viewport.getVenue(), site = Genesis.constants.site;
         var wsite = venue.get('website') ? venue.get('website').split(/http[s]*:\/\//) : [null];
         var name = venue.get('name'), link = wsite[wsite.length - 1] || site;
         var badgeURL = badge.get('photo')[Genesis.constants._thumbnailAttribPrefix + 'large'];
         //var desc = venue.get('description').trunc(256);
         var desc = me.redeemFbMsg;
         var message = me.upgradeBadgeEmailMsg(badge.get('title'), name);
         var params =
         {
         };
         /*,params1 = Ext.urlEncode({
          og_url : encodeURIComponent(link),
          og_type : getkickbak:promotions,
          og_title : 'KICKBAK Badge Promotion',
          og_image : encodeURIComponent(badgeURL),
          og_description : desc,
          body : message
          });
          params['promotions'] = serverHost + "/opengraph?" + params1;
          */

         console.log('Posting Badge Promotion to Facebook ...' + '\n' + //
         'Name: ' + name + '\n' + //
         'Caption: ' + link + '\n' + //
         'Description: ' + desc + '\n' + //
         'Message : ' + message + '\n' //
         );
         FB.requestWithGraphPath(//
         '/me/feed',
         //'/me/getkickbak:promote',
         Ext.apply(params,
         {
            name : name,
            //link : href,
            link : link,
            caption : link,
            description : desc,
            picture : badgeURL,
            message : message
         }), 'POST', function(response)
         {
            if (!response || response.error || Ext.isString(response))
            {
               console.log('Post was not published to Facebook.');
               Ext.defer(function(badge)
               {
                  var me = this;
                  Genesis.fb.facebook_onLogout(null, false);
                  Genesis.fb.facebook_onLogin(function()
                  {
                     me.updatingBadgeOnFacebook(badge);
                  }, false);
               }, 1, me, [badge]);
            }
            else
            {
               console.log('Posted to your Facebook Newsfeed.');
            }
         });
      }
      catch (e)
      {
         console.log('Exception [' + e + ']' + '\n' + //
         'Post was not published to Facebook.');
      }
   },
   removeViewHandler : function(metaData, viewsPopLength)
   {
      var me = this;
      if (viewsPopLength > 0)
      {
         console.debug("Removing Last " + viewsPopLength + " Views from History ...");
         me.silentPopView(viewsPopLength);
      }
      if (me._backToMain)
      {
         me.goToMerchantMain(true);
         me._backToMain = false;
      }
      else
      {
         me.popView();
      }
   },
   redeemPrizeHandler : function(metaData, viewsPopLength)
   {
      var me = this, FB = window.plugins.facebookConnect;
      var info = metaData['reward_info'], points = info['badge_points'];
      var eligible = Ext.isDefined(info['eligible_prize_id']) && (info['eligible_prize_id'] > 0);

      me._backToMain = true;
      if (eligible)
      {
         var prize = Ext.StoreMgr.get('PrizeStore').getById(info['eligible_prize_id']);

         console.debug("Eligible Prize Id[" + info['eligible_prize_id'] + "]");
         me.fireEvent('showredeemprize', prize, info, viewsPopLength);
      }
      else
      {
         console.debug("No Eligible Prize");
         me.removeViewHandler(metaData, viewsPopLength);
      }

      //Update on Facebook
      /*
       if (( typeof (FB) != "undefined") && ((eligible) || (points > 0)))
       {
       Genesis.fb.facebook_onLogin(function(params)
       {
       if (params)
       {
       Ext.Viewport.setMasked(null);
       if (eligible)
       {
       //me.updatingPrizeOnFacebook(prize);
       }
       if (points > 0)
       {
       var ainfo = metaData['account_info'], badgeId = ainfo['badge_id'], badge = Ext.StoreMgr.get('BadgeStore').getById(badgeId);
       me.updatingBadgeOnFacebook(Ext.create('Genesis.model.CustomerReward',
       {
       'title' : badge.get('type').display_value,
       'type' :
       {
       value : 'promotion'
       },
       'photo' : Genesis.view.client.Badges.getPhoto(badge.get('type'), 'thumbnail_large_url'),
       'points' : points,
       'time_limited' : false,
       'quantity_limited' : false,
       'merchant' : null
       }));
       }
       }
       //}, false, me.updateOnFbMsg);
       }, false);
       }
       */

      return false;
   },
   eligibleForPrizeHandler : function(metaData, viewsPopLength)
   {
      var me = this, viewport = me.getViewPortCntlr(), soundType, message;
      var info = metaData['reward_info'], eligible = info['eligible_prize_id'] > 0;
      var ppoints = info['prize_points'];

      //
      // Can't win PrizePoints if you didn't win any Reward Points
      //
      me.flag = 0;
      var rc = Ext.isDefined(ppoints) && (ppoints > 0);
      if (rc)
      {
         var eligiblePrizeCallback = function(setFlag, viewsPopLength)
         {
            if (me.task && (setFlag == 0x01))
            {
               me.task.cancel();
               me.task = null;
            }
            if ((me.flag |= setFlag) == 0x11)
            {
               me.flag = 0;
               me.fireEvent('triggerCallbacksChain');
            }
         };

         if (ppoints > me.getMinPrizePts())
         {
            soundType = 'winPrizeSound';
            message = me.wonPrizeMsg(info);

            Ext.device.Notification.vibrate();
            me.task = Ext.create('Ext.util.DelayedTask', function()
            {
               try
               {
                  me.self.stopSoundFile(viewport.sound_files[soundType]);
                  eligiblePrizeCallback(0x01, viewsPopLength);
               }
               catch(e)
               {
               }

            });
            me.task.delay(10 * 1000);
         }
         else
         {
            soundType = 'losePrizeSound';
            message = me.gotMinPrizePtsMsg(ppoints);
         }
         //
         // Play the prize winning music!
         //
         me.self.playSoundFile(//
         viewport.sound_files[soundType], Ext.bind(eligiblePrizeCallback, me, [0x01, viewsPopLength]));
         Ext.device.Notification.show(
         {
            title : me.scanPlayTitle,
            message : message,
            buttons : ['OK'],
            callback : Ext.bind(eligiblePrizeCallback, me, [0x10, viewsPopLength])
         });

      }

      return rc;
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onPrizeCheck : function(metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var info = metaData['reward_info'];
      var ainfo = metaData['account_info'];

      me.stopRouletteBall(me.getPrizeCheckScreen());

      //
      // Minimum Prize Points
      //
      if (!Ext.isDefined(info['eligible_prize_id']) || (info['eligible_prize_id'] == 0))
      {
         viewsPopLength = ((info['badge_points'] > 0) || (ainfo['visits'] == 1)) ? 1 : 0;
         console.log("No Prize to Show. viewsPopLength =" + viewsPopLength);
      }
      //
      // LumpSum Prize Points
      // Either Prize Points or Badge Prize Points
      else
      {
         viewsPopLength = ((info['badge_points'] > 0) || (ainfo['visits'] == 1)) ? 2 : 1;
         console.log("WON LumpSum Prize Points. viewsPopLength =" + viewsPopLength);
      }

      me.callBackStack['arguments'] = [metaData, viewsPopLength];
      me.fireEvent('triggerCallbacksChain');
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.callParent(arguments);

      me.getSRedeemBtn()['show']();
   },
   onShowRedeemPrize : function(prize, reward_info, viewsPopLength)
   {
      var me = this;
      me.callParent(arguments);
      me.stopRouletteScreen(me.getPrizeCheckScreen());
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemChooseSCPage : function()
   {
      var controller = this.getApplication().getController('client' + '.Accounts');
      controller.redeemPrizesChooseSCPage();
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
