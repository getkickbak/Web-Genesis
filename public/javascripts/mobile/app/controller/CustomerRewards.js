Ext.define('Genesis.controller.CustomerRewards', {
   extend : 'Genesis.controller.ControllerBase',
   requires : [
   'Genesis.view.RewardsRedeemPage', 'Genesis.view.Reward', 'Genesis.view.Redeem',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics : {
      rewards_path : '/rewards',
      redemption_path : '/redemption'
   },
   xtype : 'custRewardsCntlr',
   refs : [
   // Bottom Toolbar
   {
      ref : 'bottomtoolbar',
      selector : 'custRewardsCntlr navigatorBarBottom'
   }, {
      ref : 'homeButton',
      selector : 'custRewardsCntlr button[iconCls=home]'
   }, {
      ref : 'earnpts',
      selector : 'custRewardsCntlr #earnPtsButton'
   }, {
      ref : 'displayText',
      selector : '#displayText'
   }],
   config : {
   },
   views : ['RewardsRedeemPage', 'Reward', 'Redeem'],
   init : function()
   {
      this.control({
         '#button[iconCls=checkin]' : {
            tap : this.onCheckinTap
         }
      });
   },
   onCheckinTap : function()
   {

   }
});
