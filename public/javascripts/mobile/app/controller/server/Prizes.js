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

   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemItemPage : function()
   {
      this.openPage('redeemPrize');
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
         }
      }

      return page;
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

/*
 Ext.define('Genesis.controller.server.Prizes',
 {
 extend : 'Genesis.controller.ControllerBase',
 requires : ['Ext.data.Store', 'Ext.util.Sorter'],
 inheritableStatics :
 {
 },
 xtype : 'serverprizesCntlr',
 config :
 {
 timeoutPeriod : 10,
 mode : 'authReward',
 routes :
 {
 'authReward' : 'authRewardPage'
 },
 listeners :
 {
 'authreward' : 'onAuthReward',
 'refreshQRCode' : 'onRefreshQRCode'
 },
 refs :
 {
 // ShowPrizes
 sCloseBB : 'showredeemitemdetailview[tag=redeemItem] button[tag=close]',
 //sBB : 'showredeemitemdetailview[tag=redeemItem] button[tag=back]',
 sDoneBtn : 'showredeemitemdetailview[tag=redeemItem] button[tag=done]',
 sRedeemBtn : 'showredeemitemdetailview[tag=redeemItem] button[tag=redeem]',
 refreshBtn : 'showredeemitemdetailview[tag=redeemItem] button[tag=refresh]',
 verifyBtn : 'showredeemitemdetailview[tag=redeemItem] button[tag=verify]',

 redeemItem :
 {
 selector : 'showredeemitemdetailview[tag=redeemItem]',
 autoCreate : true,
 tag : 'redeemItem',
 xtype : 'showredeemitemdetailview'
 }
 },
 control :
 {
 sDoneBtn :
 {
 tap : 'onDoneTap'
 },
 sRedeemBtn :
 {
 tap : 'onRedeemPrizeTap'
 },
 redeemItem :
 {
 createView : 'onCreateView',
 activate : 'onActivate',
 deactivate : 'onDeactivate'
 }
 }
 },
 authRewardVerifiedMsg : 'Verified',
 retrievingQRCodeMsg : 'Retrieving QRCode ...',
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
 me.getRedeemItem();
 }, 1, me);
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

 var view = me.getMainPage();
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
 // --------------------------------------------------------------------------
 // Prizes Page
 // --------------------------------------------------------------------------
 onCreateView : function(activeItem)
 {
 var me = this;
 var view = me.getMainPage();

 view.redeemItem = me.redeemItem;
 },
 onActivate : function(activeItem, c, oldActiveItem, eOpts)
 {
 var me = this;
 var viewport = me.getViewPortCntlr();

 var tbbar = activeItem.query('titlebar')[0];
 var photo = me.redeemItem.get('photo');
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
 }
 console.log("ShowPrize View - Updated ShowPrize View.");

 //delete me.redeemItem;
 },
 onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
 {
 },
 onAuthReward : function(redeemItem)
 {
 this.redeemItem = redeemItem;
 this.redirectTo('authReward');
 },
 // --------------------------------------------------------------------------
 // Page Navigation
 // --------------------------------------------------------------------------
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
 case 'authReward' :
 {
 me.setAnimationMode(me.self.animationMode['coverUp']);
 page = me.getRedeemItem();
 break;
 }
 }

 return page;
 },
 openMainPage : function()
 {
 this.setMode('authReward');
 this.pushView(this.getMainPage());
 console.log("Prizes Page Opened");
 },
 isOpenAllowed : function()
 {
 // If not logged in, forward to login page
 return true;
 }
 });
 */
