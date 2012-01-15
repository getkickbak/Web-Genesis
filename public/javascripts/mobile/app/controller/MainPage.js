Ext.define('Genesis.controller.MainPage',
{
   extend : 'Genesis.controller.ControllerBase',
   //requires:['Genesis.controller.Challenges'],
   statics :
   {
      mainPage_path : '/mainPage',
      loginPage_path : '/loginPage'
   },
   xtype : 'mainPageCntlr',
   refs : [
   // Login Page
   {
      ref : 'loginPage',
      selector : 'loginPageview',
      autoCreate : true,
      xtype : 'loginpageview'
   },
   // Main Page
   {
      ref : 'mainPage',
      selector : 'mainpageview',
      autoCreate : true,
      xtype : 'mainpageview'
   }],
   model : ['MainPage'],
   views : ['LoginPage', 'MainPage'],
   stores : ['MainPageStore'],
   config :
   {
   },
   init : function(app)
   {
      this.control(
      {
         'loginPageview' :
         {
            select : this.onLoginItemSelect
         },
         'mainpageview' :
         {
            //itemtap : this.onItemTap,
            select : this.onItemSelect,
            itemtouchstart : this.onItemTouchStart,
            itemtouchend : this.onItemTouchEnd,
            show : this.onActivate,
            hide : this.onDeactivate,
         }
      });
      this.callParent(arguments);
      console.log("MainPage Init");
   },
   onItemSelect : function(d, model, eOpts)
   {
      d.deselect([model], false);
      console.log("Controller=[" + model.data.pageCntlr + "]");

      this.getController(model.data.pageCntlr).openMainPage();
   },
   onItemTouchStart : function(d, index, target, e, eOpts)
   {
      Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).mask();

   },
   onItemTouchEnd : function(d, index, target, e, eOpts)
   {
      Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).unmask();
   },
   onActivate : function(c, eOpts)
   {
      if(c.rendered)
         this.getViewport().query('button[iconCls=info]')[0].show();
   },
   onDeactivate : function(c, eOpts)
   {
      if(c.rendered)
         this.getViewport().query('button[iconCls=info]')[0].hide();
   },
   onLoginItemSelect : function(d, model, eOpts)
   {
      d.deselect([model], false);
   },
   openMainPage : function(nohistory)
   {
      this.pushView(this.getMainPage(), nohistory);
      console.log("MainPage Opened");
   }
});
