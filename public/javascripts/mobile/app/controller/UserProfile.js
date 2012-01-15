Ext.define('Genesis.controller.UserProfile', {
   extend : 'Genesis.controller.ControllerBase',
   requires : [
   'Genesis.view.ProfilePage',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics : {
      challenges_path : '/profile'
   },
   xtype : 'userProfileCntlr',
   config : {
   },
   refs : [
   // Bottom Toolbar
   {
      ref : 'bottomtoolbar',
      selector : 'navigatorBarBottom'
   }, {
      ref : 'challengeBtn',
      selector : 'challengeTbButton'
   }],
   views : ['ProfilePage'],
   init : function()
   {
      this.callParent(arguments);
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
