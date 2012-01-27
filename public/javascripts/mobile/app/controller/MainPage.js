Ext.define('Genesis.controller.MainPage',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store',
   //'Genesis.controller.Challenges', 'Genesis.controller.Checkins', 'Genesis.controller.RewardsRedemptions'
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics :
   {
      mainPage_path : '/mainPage',
      loginPage_path : '/loginPage'
   },
   xtype : 'mainPageCntlr',
   models : ['MainPage', 'EligibleReward', 'Customer', 'User'],
   config :
   {
      refs :
      {
         // Login Page
         loginPage :
         {
            selector : 'loginPageview',
            autoCreate : true,
            xtype : 'loginpageview'
         },
         // Main Page
         mainPage :
         {
            selector : 'mainpageview',
            autoCreate : true,
            xtype : 'mainpageview'
         }
      },
      control :
      {
         'loginPageview' :
         {
            select : 'onLoginItemSelect'
         },
         'mainpageview' :
         {
            //itemtap : 'onItemTap',
            select : 'onItemSelect',
            itemtouchstart : 'onItemTouchStart',
            itemtouchend : 'onItemTouchEnd',
            show : 'onActivate',
            hide : 'onDeactivate',
         }
      }
   },
   init : function(app)
   {
      this.callParent(arguments);
      console.log("MainPage Init");

      //
      // Load all the info into Stores
      // Normally we do this in the Login screen
      //
      Ext.regStore('UserStore',
      {
         model : 'Genesis.model.User',
         autoLoad : false
      });
      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : true
      });
      //
      // Store storing the Venue viewing
      //
      Ext.regStore('VenueStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });
      //
      // Store storing the Customer's Eligible Rewards at a Venue
      //
      Ext.regStore('EligibleRewardsStore',
      {
         model : 'Genesis.model.EligibleReward',
         autoLoad : false
      });
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onItemSelect : function(d, model, eOpts)
   {
      d.deselect([model], false);
      console.log("Controller=[" + model.data.pageCntlr + "]");

      var cntlr = this.getApplication().getController(model.data.pageCntlr);
      var msg = cntlr.isOpenAllowed();
      if(msg === true)
      {
         cntlr.openMainPage();
      }
      else
      {
         Ext.Msg.alert("", msg);
      }
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
   // --------------------------------------------------------------------------
   // Login Page
   // --------------------------------------------------------------------------
   onLoginItemSelect : function(d, model, eOpts)
   {
      d.deselect([model], false);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      this.pushView(this.getMainPage());
      console.log("MainPage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
