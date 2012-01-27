Ext.define('Genesis.controller.Newsfeeds',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Genesis.view.NewsfeedPage',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics :
   {
      newsfeed_path : '/newsfeed'
   },
   xtype : 'newsfeedsCntlr',
   config :
   {
      refs : {}
   },
   init : function()
   {
      this.callParent(arguments);
   }
});
