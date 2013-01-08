Ext.define('Genesis.controller.RewardRedemptionsBase',
{
   extend : 'Genesis.controller.RedeemBase',
   requires : ['Ext.data.Store'],
   inheritableStatics :
   {
   },
   xtype : 'rewardRedemptionsBaseCntlr',
   controllerType : 'redemption',
   config :
   {
      redeeemSuccessfulMsg : 'Reward selected has been successfully redeemed!',
      redeemInfoMsg : 'Getting the Redemptions List ...',
      redeemPopupTitle : 'Redeem Rewards',
      browseMode : 'redeemBrowse',
      redeemMode : 'redeemReward',
      renderStore : 'RedemptionRenderCStore',
      redeemStore : 'RedeemStore',
      redeemUrl : 'setGetRewardsURL',
      redeemPath : 'redeemBrowseRewardsSC',
      ptsProperty : 'points',
      title : 'Rewards',
      routes :
      {
         // Browse Redemption Page
         'redemptions' : 'redeemBrowsePage',
         //Shortcut to choose venue to redeem rewards
         'redeemRewardsChooseSC' : 'redeemChooseSCPage',
         //Shortcut to visit Merchant Account for the Venue Page
         'redeemBrowseRewardsSC' : 'redeemBrowseSCPage',
         'redeemReward' : 'redeemItemPage'
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
      }
   },
   xtype : 'redemptionsBaseCntlr',
   checkinFirstMsg : 'Please Check-In before redeeming Rewards',
   init : function()
   {
      var me = this;
      me.callParent(arguments);

      //
      // Redeem Rewards
      //
      me.on(
      {
         'showredeemitem' : 'onShowRedeemItem',
         'showQRCode' : 'onShowItemQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
      });
      console.log("RewardRedemptionsBase Init");
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemMainPage();
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getInnerItems()[0];

      var info = item.query('component[tag=info]')[0];
      info.hide();

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img', photo.element.dom)[0]);
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.5),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.5)
      });
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
   },
   // --------------------------------------------------------------------------
   // Redemption Page
   // --------------------------------------------------------------------------
   onShowRedeemItem : function(redeemItem)
   {
      var me = this;

      //
      // Show prize on redeemItem Container
      //
      me.redeemItem = redeemItem;
      me.redirectTo('redeemReward');
   },
   //onRedeemItemShowView : Ext.emptyFn,
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemItemPage : function()
   {
      this.openPage('redeemReward');
   }
});
