Ext.define('Genesis.controller.Newsfeeds', {
   extend : 'Genesis.controller.ControllerBase',
   requires : [
   'Genesis.view.NewsfeedPage',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics : {
      newsfeed_path : '/newsfeed'
   },
   xtype : 'newsfeedsCntlr',
   refs : [],
   views : ['NewsfeedPage'],
   config : {
   },
   init : function()
   {
      this.callParent(arguments);
   }
});
