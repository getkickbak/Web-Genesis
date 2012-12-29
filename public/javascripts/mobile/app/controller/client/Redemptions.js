Ext.define('Genesis.controller.client.Redemptions',
{
   extend : 'Genesis.controller.RewardRedemptionsBase',
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
         redemptionsPtsEarnPanel : 'clientredemptionsview dataview[tag=ptsEarnPanel]'
      },
      listeners :
      {
         'redeemitem' : 'onClientRedeemItem'
      }
   }
});
