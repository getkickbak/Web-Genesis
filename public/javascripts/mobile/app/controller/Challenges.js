Ext.define('Genesis.controller.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
      challenges_path : '/challenges'
   },
   xtype : 'challengesCntlr',
   config :
   {
      refs :
      {
         challengeBtn : 'button[iconCls=challenge]',
         challengePage :
         {
            selector : 'challengepageview',
            autoCreate : true,
            xtype : 'challengepageview'
         }
      },
      control :
      {
         challengePage :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'challengepageview > carousel dataview' :
         {
            select : 'onItemSelect'
         },
         'challengepageview tabbar button[iconCls=doit]' :
         {
            tap : 'onChallengeBtnTap'
         }
      }
   },
   model : ['Challenge'],
   init : function(app)
   {
      this.callParent(arguments);
      console.log("Challenge Init");
   },
   // --------------------------------------------------------------------------
   // Challenge Page
   // --------------------------------------------------------------------------
   onItemSelect : function(d, model, eOpts)
   {
      d.deselect([model], false);
      var desc = this.getChallengePage().query("container[docked=bottom][xtype=container]")[0];
      for(var i = 0; i < desc.getItems().length; i++)
      {
         desc.getItems().getAt(i).updateData(model.getData());
      }
      return true;
   },
   onItemTouchStart : function(d, index, target, e, eOpts)
   {
      Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).mask();

   },
   onItemTouchEnd : function(d, index, target, e, eOpts)
   {
      Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).unmask();
   },
   onChallengeBtnTap : function(d, index, target, e, eOpts)
   {
   },
   onActivate : function()
   {
      var record = this.getViewPortCntlr().getVenue();
      var venueId = record.getId();
      var carousel = this.getChallengePage().query('carousel')[0];
      var items = record.challenges().getRange();

      carousel.removeAll(true);
      for(var i = 0; i < Math.ceil(items.length / 6); i++)
      {
         carousel.add(
         {
            xtype : 'dataview',
            cls : 'challengeMenuSelections',
            useComponents : true,
            defaultType : 'challengemenuitem',
            scrollable : false,
            store :
            {
               model : 'Genesis.model.Challenge',
               data : Ext.Array.pluck(items.slice(i * 6, ((i + 1) * 6)), 'data')
            }
         });
      }
      if(carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
   },
   onDeactivate : function()
   {
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getChallengePage();
   },
   openMainPage : function()
   {
      this.pushView(this.getMainPage());
      console.log("ChallengePage Opened");
   },
   isOpenAllowed : function()
   {
      // Check whether Page cannot opened
      return ((this.getViewportCntlr().getVenue()) ? true : "Cannot open Challenges until You have Checked-in into a Venue");
   }
});
