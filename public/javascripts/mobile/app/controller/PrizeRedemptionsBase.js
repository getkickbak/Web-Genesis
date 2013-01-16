Ext.define('Genesis.controller.PrizeRedemptionsBase',
{
   extend : 'Genesis.controller.RedeemBase',
   requires : ['Ext.data.Store'],
   inheritableStatics :
   {
   },
   xtype : 'prizeRedemptionsCntlr',
   controllerType : 'prize',
   config :
   {
      redeemInfoMsg : 'Getting the Prizes List ...',
      redeemPopupTitle : 'Redeem Prizes',
      redeeemSuccessfulMsg : 'Prize selected has been successfully redeemed!',
      timeoutPeriod : 10,
      minPrizePts : 1,
      browseMode : 'redeemBrowse',
      redeemMode : 'redeemPrize',
      renderStore : 'PrizeRenderCStore',
      redeemStore : 'PrizeStore',
      redeemPointsFn : 'setRedeemPrizePointsURL',
      redeemUrl : 'setGetPrizesURL',
      ptsProperty : 'prize_points',
      title : 'Prizes',
      routes :
      {
         // Browse Prizes Page
         'prizes' : 'redeemBrowsePage',
         //'prize' : 'prizePage',
         'redeemPrize' : 'redeemItemPage'
      },
      refs :
      {
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
         redeemItem :
         {
            createView : 'onRedeemItemCreateView',
            showView : 'onRedeemItemShowView',
            activate : 'onRedeemItemActivate',
            deactivate : 'onRedeemItemDeactivate',
            redeemItemTap : 'onRedeemItemTap'
         }
      },
      listeners :
      {
      }
   },
   scanPlayTitle : 'Swipe and Play',
   init : function()
   {
      var me = this;
      me.callParent(arguments);
      //
      // Redeem Prize
      //
      me.on(
      {
         'showredeemitem' : 'onShowRedeemItem',
         //Redeem Prize broadcast to Social Media
         'showredeemprize' : 'onShowRedeemPrize',
         'showQRCode' : 'onShowItemQRCode'
      });

      console.log("Prize Redemptions Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
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
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, tbbar = activeItem.query('titlebar')[0];

      me.getSCloseBB()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      me.getSBackBB()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();
      //me.getSBB().hide();
      tbbar.setTitle(me.getTitle());
      tbbar.removeCls('kbTitle');
      //
      // Show redeem button on Toolbar
      //
      if (me.getSRedeemBtn())
      {
         me.getSRedeemBtn()['show']();
      }
      console.log("Base onRedeemItemActivate - Updated RewardItem View.");
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemItemPage : function()
   {
      this.setTitle('Prizes');
      this.openPage('redeemPrize');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
