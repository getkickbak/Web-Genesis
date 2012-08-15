Ext.define('Genesis.controller.client.Redemptions',
{
   extend : 'Genesis.controller.client.RedeemBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      clientRedemption_path : '/clientRedemptions'
   },
   xtype : 'clientRedemptionsCntlr',
   controllerType : 'redemption',
   config :
   {
      browseMode : 'redeemBrowse',
      redeemMode : 'redeemReward',
      renderStore : 'RedemptionRenderCStore',
      redeemStore : 'RedeemStore',
      redeemPointsFn : 'setRedeemPointsURL',
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
         //Shortcut to visit Merchant Account for the Vnue Page
         'redeemBrowseRewardsSC' : 'redeemBrowseSCPage',
         'redeemReward' : 'redeemItemPage'
      },
      refs :
      {
         backBtn : 'clientredemptionsview button[tag=back]',
         closeBtn : 'clientredemptionsview button[tag=close]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'clientredemptionsview',
            autoCreate : true,
            xtype : 'clientredemptionsview'
         },
         redemptionsList : 'clientredemptionsview list[tag=redemptionsList]',
         redemptionsPts : 'clientredemptionsview component[tag=points]',
         redemptionsPtsEarnPanel : 'clientredemptionsview dataview[tag=ptsEarnPanel]',
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
         verifyBtn :
         {
            tap : 'popView'
         }
      },
      listeners :
      {
         //
         // Redeem Rewards
         //
         'redeemitem' : 'onRedeemItem',
         'showredeemitem' : 'onShowRedeemItem',
         'showQRCode' : 'onShowItemQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
      }
   },
   checkinFirstMsg : 'Please Check-In before redeeming Rewards',
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
   },
});
