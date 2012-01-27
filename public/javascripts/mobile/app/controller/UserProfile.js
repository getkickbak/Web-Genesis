Ext.define('Genesis.controller.UserProfile',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Genesis.view.ProfilePage',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics :
   {
      challenges_path : '/profile'
   },
   xtype : 'userProfileCntlr',
   config :
   {
      refs :
      // Bottom Toolbar
      {
         bottomtoolbar : 'navigationBarBottom',
         challengeBtn : 'challengeTbButton'
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
