Ext.define('Genesis.controller.RedemptionsBase',
{
   extend : 'Genesis.controller.RedeemBase',
   inheritableStatics :
   {
   },
   config :
   {
      redeemInfoMsg : 'Getting the Redemptions List ...',
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
         //
         // Redeem Rewards
         //
         sCloseBB : 'showredeemitemdetailview[tag=redeemReward] button[tag=close]',
         //sBB : 'showredeemitemdetailview[tag=redeemReward] button[tag=back]',
         sDoneBtn : 'showredeemitemdetailview[tag=redeemReward] button[tag=done]',
         sRedeemBtn : 'showredeemitemdetailview[tag=redeemReward] button[tag=redeem]',
         refreshBtn : 'showredeemitemdetailview[tag=redeemReward] button[tag=refresh]',
         verifyBtn : 'showredeemitemdetailview[tag=redeemReward] button[tag=verify]',
         redeemItem :
         {
            selector : 'showredeemitemdetailview[tag=redeemReward]',
            autoCreate : true,
            tag : 'redeemReward',
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
         },
         verifyBtn :
         {
            tap : 'popView'
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
         'redeemitem' : 'onRedeemItem',
         'showredeemitem' : 'onShowRedeemItem',
         'showQRCode' : 'onShowItemQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
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
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemChooseSCPage : function()
   {
      var controller = this.getApplication().getController('client.Accounts');
      controller.redeemRewardsChooseSCPage();
   },
   redeemItemPage : function()
   {
      this.openPage('redeemReward');
   }
});