Ext.define('Genesis.controller.client.Redemptions',
{
   extend : 'Genesis.controller.RewardRedemptionsBase',
   mixins : ['Genesis.controller.client.mixin.RedeemBase'],
   requires : ['Ext.data.Store', 'Genesis.view.client.Redemptions'],
   inheritableStatics :
   {
   },
   xtype : 'clientRedemptionsCntlr',
   config :
   {
      redeemPointsFn : 'setRedeemPointsURL',
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
         sCloseBB : 'clientredeemitemdetailview[tag=redeemReward] button[tag=close]',
         //sBB : 'clientredeemitemdetailview[tag=redeemReward] button[tag=back]',
         sDoneBtn : 'clientredeemitemdetailview[tag=redeemReward] button[tag=done]',
         sRedeemBtn : 'clientredeemitemdetailview[tag=redeemReward] button[tag=redeem]',
         redeemItem :
         {
            selector : 'clientredeemitemdetailview[tag=redeemReward]',
            autoCreate : true,
            tag : 'redeemReward',
            xtype : 'clientredeemitemdetailview'
         }
      },
      control :
      {
         sRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         },
         sDoneBtn :
         {
            tap : 'onDoneTap'
         }
      }
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.callParent(arguments);

      me.getSRedeemBtn()['show']();

      console.log("RewardItem View - Updated RewardItem View.");
   },
   redeemChooseSCPage : function()
   {
      var controller = this.getApplication().getController('client.Accounts');
      controller.redeemRewardsChooseSCPage();
   }
});
