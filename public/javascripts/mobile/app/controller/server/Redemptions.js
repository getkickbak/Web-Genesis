Ext.define('Genesis.controller.server.Redemptions',
{
   extend : 'Genesis.controller.RewardRedemptionsBase',
   inheritableStatics :
   {
   },
   xtype : 'serverRedemptionsCntlr',
   controllerType : 'redemption',
   config :
   {
   	closeBtn : null,
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
         redemptionsList : 'serverredemptionsview list[tag=redemptionsList]'
      },
      control :
      {
         verifyBtn :
         {
            tap : 'onVerifyTap'
         }
      },
      listeners :
      {
         'redeemitem' : 'onServerRedeemItem'
      }
   },
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
   onRedeemItemShowView : function(activeItem)
   {
      //
      // Hide the Merchant Info
      //
      var me = this;
      var info = activeItem.query('component[tag=info]')[0];
      info.hide();
      //
      // In Prize Mode
      //
      me.getMRedeemBtn()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      //
      // In Challendge
      //
      me.getRefreshBtn()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.callParent(arguments);

      me.getRefreshBtn()['hide']();
      me.getMRedeemBtn()['show']();
      me.getSRedeemBtn()['hide']();

      console.log("RewardItem View - Updated RewardItem View.");
   }
});

//
// Cleanup Redeem Database every 6 hours
//
var _dbCleanup = function()
{
   Ext.defer(function()
   {
      Genesis.db.redeemDBCleanup();
      _dbCleanup();
   }, 1000 * 60 * 60 * 3);
};

_dbCleanup();
