Ext.define('Genesis.controller.client.Badges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
   },
   xtype : 'clientbadgesCntlr',
   config :
   {
      routes :
      {
         'badges' : 'mainPage',
      },
      models : ['Badge', 'Customer', 'Merchant'],
      refs :
      {
         // Main Page
         main :
         {
            selector : 'clientbadgesview',
            autoCreate : true,
            xtype : 'clientbadgesview'
         },
         mainCarousel : 'clientbadgesview'
      },
      control :
      {
         main :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'clientbadgesview dataview' :
         {
            select : 'onItemSelect'
         }
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Loads Front Page Metadata
      //
      Ext.regStore('BadgeStore',
      {
         model : 'Genesis.model.Badge',
         autoLoad : false,
         sorters : [
         {
            property : 'rank',
            direction : 'ASC'
         }],
         listeners :
         {
            scope : me,
            "load" : function(store, records, successful, operation, eOpts)
            {
            }
         }
      });

      console.log("Badges Init");
      //
      // Preloading Pages to memory
      //
      me.getMain();
   },
   // --------------------------------------------------------------------------
   // EVent Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onItemSelect : function(d, model, eOpts)
   {
      d.deselect([model], false);
      return false;
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      //this.getInfoBtn().hide();
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function()
   {
      this.openPage('main');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this;

      switch (subFeature)
      {
         case 'main' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['pop']);
            me.pushView(me.getMainPage());
            break;
         }
      }
   },
   getMainPage : function()
   {
      var page = this.getMain();
      return page;
   },
   openMainPage : function()
   {
      var cntlr = this.getViewPortCntlr();
      this.setAnimationMode(this.self.superclass.self.animationMode['cover']);
      this.pushView(this.getMainPage());
      console.log("Badges Page Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
