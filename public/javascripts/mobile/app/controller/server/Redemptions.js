Ext.define('Genesis.controller.server.Redemptions',
{
   extend : 'Genesis.controller.RewardRedemptionsBase',
   mixins : ['Genesis.controller.server.mixin.RedeemBase'],
   requires : ['Ext.data.Store', 'Genesis.view.server.Redemptions'],
   inheritableStatics :
   {
   },
   xtype : 'serverRedemptionsCntlr',
   config :
   {
      redeemPointsFn : 'setMerchantRedeemPointsURL',
      routes :
      {
      },
      refs :
      {
         backBtn : 'serverredemptionsview button[tag=back]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverredemptionsview',
            autoCreate : true,
            xtype : 'serverredemptionsview'
         },
         redemptionsList : 'serverredemptionsview list[tag=redemptionsList]',
         redeemItemCardContainer : 'serverredeemitemdetailview[tag=redeemReward] container[tag=redeemItemCardContainer]',
         redeemItemButtonsContainer : 'serverredeemitemdetailview[tag=redeemReward] container[tag=bottomButtons]',
         tagId : 'serverredeemitemdetailview[tag=redeemReward] calculator[tag=tagId] textfield',
         mRedeemBtn : 'serverredeemitemdetailview[tag=redeemReward] button[tag=merchantRedeem]',
         //
         // Redeem Rewards
         //
         sBackBB : 'serverredeemitemdetailview[tag=redeemReward] button[tag=back]',
         sCloseBB : 'serverredeemitemdetailview[tag=redeemReward] button[tag=close]',
         refreshBtn : 'serverredeemitemdetailview[tag=redeemReward] button[tag=refresh]',
         redeemItem :
         {
            selector : 'serverredeemitemdetailview[tag=redeemReward]',
            autoCreate : true,
            tag : 'redeemReward',
            xtype : 'serverredeemitemdetailview'
         }
      },
      control :
      {
         mRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         },
         redeemItemCardContainer :
         {
            activeitemchange : 'onRedeemItemCardContainerActivate'
         },
         'serverredeemitemdetailview[tag=redeemReward] container[tag=bottomButtons] button[tag=redeemPtsTag]' :
         {
            tap : 'onEnterTagIdTap'
         },
         'serverredeemitemdetailview[tag=redeemReward] calculator[tag=tagId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverredeemitemdetailview[tag=redeemReward] calculator[tag=tagId] container[tag=bottomButtons] button[tag=redeemTagId]' :
         {
            tap : 'onTagItTap'
         }
      },
      listeners :
      {
      }
   }
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Redemption Page
   // --------------------------------------------------------------------------
});
