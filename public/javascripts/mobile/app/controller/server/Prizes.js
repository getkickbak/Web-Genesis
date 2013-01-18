Ext.define('Genesis.controller.server.Prizes',
{
   extend : 'Genesis.controller.PrizeRedemptionsBase',
   mixins : ['Genesis.controller.server.mixin.RedeemBase'],
   requires : ['Ext.data.Store', 'Genesis.view.server.Prizes'],
   inheritableStatics :
   {
   },
   xtype : 'serverPrizesCntlr',
   config :
   {
      redeemPointsFn : 'setMerchantRedeemPointsURL',
      routes :
      {
         'authReward' : 'authRewardPage'
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
         redeemItemCardContainer : 'serverredeemitemdetailview[tag=redeemPrize] container[tag=redeemItemCardContainer]',
         redeemItemButtonsContainer : 'serverredeemitemdetailview[tag=redeemPrize] container[tag=bottomButtons]',
         tagId : 'serverredeemitemdetailview[tag=redeemPrize] calculator[tag=tagId] textfield',
         mRedeemBtn : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=merchantRedeem]',
         //
         // Reward Prize
         //
         sBackBB : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=back]',
         sCloseBB : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=close]',
         refreshBtn : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=refresh]',
         redeemItem :
         {
            selector : 'serverredeemitemdetailview[tag=redeemPrize]',
            autoCreate : true,
            tag : 'redeemPrize',
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
         'serverredeemitemdetailview[tag=redeemPrize] container[tag=bottomButtons] button[tag=redeemPtsTag]' :
         {
            tap : 'onEnterTagIdTap'
         },
         'serverredeemitemdetailview[tag=redeemPrize] calculator[tag=tagId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverredeemitemdetailview[tag=redeemPrize] calculator[tag=tagId] container[tag=bottomButtons] button[tag=redeemTagId]' :
         {
            tap : 'onTagItTap'
         }
      },
      listeners :
      {
         //
         // Redeem Prize
         //
         'authreward' : 'onAuthReward',
         'refreshQRCode' : 'onRefreshQRCode'
      }
   },
   redeemPtsConfirmMsg : 'Please confirm to submit',
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
   onNfc : function(nfcResult)
   {
      var me = this;

      me.redeemItemFn(
      {
         data : me.self.encryptFromParams(
         {
            'tag_id' : (nfcResult) ? nfcResult['tagID'] : null,
            'expiry_ts' : new Date().addHours(3).getTime()
         }, 'reward')
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
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   authRewardPage : function()
   {
      this.setTitle('Challenges');
      this.openPage('authReward');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
