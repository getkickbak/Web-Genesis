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
