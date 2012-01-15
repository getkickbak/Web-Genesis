Ext.define('Genesis.controller.Coupons', {
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Genesis.controller.ControllerBase'],
   statics : {
      challenges_path : '/coupons'
   },
   xtype : 'couponsCntlr',
   config : {
   },
   refs : [
   // Bottom Toolbar
   {
      ref : 'bottomtoolbar',
      selector : 'navigatorBarBottom'
   }],
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
