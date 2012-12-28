Ext.define('Genesis.controller.server.Prizes',
{
   extend : 'Genesis.controller.RedeemBase',
   requires : ['Ext.data.Store', 'Genesis.view.server.Prizes'],
   inheritableStatics :
   {
   },
   xtype : 'serverPrizesCntlr',
   controllerType : 'prize',
   config :
   {
      closeBtn : null,
      redeemInfoMsg : 'Getting the Prizes List ...',
      redeeemSuccessfulMsg : 'Prize selected has been successfully redeemed!',
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
         'authReward' : 'authRewardPage',
         // Browse Prizes Page
         'prizes' : 'redeemBrowsePage',
         //'prize' : 'prizePage',
         'redeemPrize' : 'redeemItemPage'
      },
      refs :
      {
         backBtn : 'serverprizesview button[tag=back]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverprizesview',
            autoCreate : true,
            xtype : 'serverprizesview'
         },
         redemptionsList : 'serverprizesview list[tag=prizesList]',
         //
         // Reward Prize
         //
         sBackBB : 'showredeemitemdetailview[tag=redeemPrize] button[tag=back]',
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
         }
      },
      control :
      {
         redemptions :
         {
            createView : 'onCreateView',
            showView : 'onShowView',
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
            createView : 'onRedeemItemCreateView',
            activate : 'onRedeemItemActivate',
            deactivate : 'onRedeemItemDeactivate'
         }
      },
      listeners :
      {
         //
         // Redeem Prize
         //
         'authreward' : 'onAuthReward',
         'redeemitem' : 'onServerRedeemItem',
         'showredeemitem' : 'onShowRedeemItem',
         'showredeemprize' : 'onShowRedeemPrize', //Redeem Prize broadcast to Social Media
         'showQRCode' : 'onShowItemQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
      }
   },
   _backToMain : false,
   checkinFirstMsg : 'Please Check-In before redeeming Prizes',
   eligibleRewardMsg : 'Check out an Eligible Prize you can redeem with your Prize Points!',
   scanPlayTitle : 'Swipe and Play',
   evtFlag : 0,
   flag : 0,
   loadCallback : null,
   initSound : false,
   authRewardVerifiedMsg : 'Verified',
   init : function()
   {
      var me = this;
      me.callParent(arguments);

      console.log("Prizes Server Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemItem();
      var item = view.getInnerItems()[0];

      var info = item.query('component[tag=info]')[0];
      info.hide();

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img',photo.element.dom)[0]);
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.25),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.25)
      });
   },
   onAuthReward : function(redeemItem)
   {
      this.redeemItem = redeemItem;
      this.redirectTo('authReward');
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
      me.redirectTo('redeemPrize');
   },
   onShowRedeemPrize : function(prize, reward_info, viewsPopLength)
   {
      var me = this;
      var info = reward_info;
      //var redeemItem = me.redeemItem = prize;

      me.redeemItem = prize
      if (viewsPopLength > 0)
      {
         console.debug("Removing Last " + viewsPopLength + " Views from History ...");
         me.silentPopView(viewsPopLength);
      }

      me.redirectTo('redeemPrize');
   },
   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;

      if (me._backToMain)
      {
         me.goToMerchantMain(true);
         me._backToMain = false;
      }
      else
      {
         me.callParent(arguments);
      }
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      var tbbar = activeItem.query('titlebar')[0];
      var photo = me.redeemItem.get('photo');

      me.getSCloseBB()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      me.getSBackBB()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();
      //me.getSBB().hide();
      tbbar.setTitle(me.getTitle());
      tbbar.removeCls('kbTitle');
      me.getRefreshBtn()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();
      me.getVerifyBtn()['hide']();
      me.getSRedeemBtn()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();

      console.log("RewardItem View - Updated RewardItem View.");
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemItemPage : function()
   {
      this.setTitle('Prizes');
      this.openPage('redeemPrize');
   },
   authRewardPage : function()
   {
      this.setTitle('Challenges');
      this.openPage('authReward');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   isOpenAllowed : function()
   {
      return true;
   }
});
