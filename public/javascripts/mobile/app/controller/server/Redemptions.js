Ext.define('Genesis.controller.server.Redemptions',
{
   extend : 'Genesis.controller.RewardRedemptionsBase',
   mixins :
   {
      redeemBase : 'Genesis.controller.server.mixin.RedeemBase'
   },
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
         phoneId : 'serverredeemitemdetailview[tag=redeemReward] calculator[tag=phoneId] textfield',
         mRedeemBtn : 'serverredeemitemdetailview[tag=redeemReward] button[tag=merchantRedeem]',
         //
         // Redeem Rewards
         //
         sBackBB : 'serverredeemitemdetailview[tag=redeemReward] button[tag=back]',
         sCloseBB : 'serverredeemitemdetailview[tag=redeemReward] button[tag=close]',
         authText : 'serverredeemitemdetailview[tag=redeemReward] component[tag=authText]',
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
         'serverredeemitemdetailview[tag=redeemReward] calculator[tag=phoneId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverredeemitemdetailview[tag=redeemReward] calculator[tag=phoneId] container[tag=bottomButtons] button[tag=redeemTagId]' :
         {
            tap : 'onTagItTap'
         }
      },
      listeners :
      {
      }
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      me.callParent(arguments);
      me.mixins.redeemBase.onRedeemItemActivate.apply(me, arguments);
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.mixins.redeemBase.onNfc.apply(me, arguments);
   }
   // --------------------------------------------------------------------------
   // Redemption Page
   // --------------------------------------------------------------------------
});
