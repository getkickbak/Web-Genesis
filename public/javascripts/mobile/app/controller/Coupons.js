Ext.define('Genesis.controller.Coupons',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Genesis.controller.ControllerBase'],
   statics :
   {
      challenges_path : '/coupons'
   },
   xtype : 'couponsCntlr',
   config :
   {
      refs :
      {
         // Bottom Toolbar
         bottomtoolbar : 'navigationBarBottom'
      },
      control :
      {
         '#button[iconCls=checkin]' :
         {
            tap : 'onCheckinTap'
         }
      }
   },
   init : function()
   {
      this.callParent(arguments);
   },
   onCheckinTap : function()
   {
   }
});
