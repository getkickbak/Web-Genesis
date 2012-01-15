Ext.define('Genesis.controller.Checkins', {
   extend : 'Genesis.controller.ControllerBase',
   requires : [
   // Main Pages
   'Genesis.view.CheckinBrowse',
   // Main Page when the user has never checked-in before
   'Genesis.view.CheckinMerchantMainPage',
   // Main Page when the user has checked-in before
   'Genesis.view.CheckinMerchantPage',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics : {
      checkin_path : '/checkin'
   },
   xtype : 'checkinsCntlr',
   refs : [
   // Bottom Toolbar
   {
      ref : 'bottomtoolbar',
      selector : 'checkinsCntlr .navigatorBarBottom'
   }, {
      ref : 'homeButton',
      selector : 'checkinsCntlr button[iconCls=home]'
   }, {
      ref : 'displayText',
      selector : '#displayText'
   }],
   views : ['CheckinBrowse',
   // Main Page when the user has never checked-in before
   'CheckinMerchantMainPage',
   // Main Page when the user has checked-in before
   'CheckinMerchantPage'],
   config : {
      items : [{
         docked : 'bottom',
         cls : 'navigatorBarBottom',
         items : [{
            xtype : 'toolbar',
            layout : {
               pack : 'justify',
               align : 'center'
            },
            items : [{
               iconCls : 'home'
            }]
         }]
      }],
   },
   init : function()
   {
   }
});
