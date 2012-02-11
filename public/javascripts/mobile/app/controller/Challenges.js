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
         'challengepageview' :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'challengepageview > dataview' :
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
      //
      // Challenges available to the currently checked-in browsing Merchant
      //
      Ext.regStore('ChallengePageStore',
      {
         model : 'Genesis.model.Challenge',
         autoLoad : false
      });
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
      var venueId = this.getViewport().getVenueId();
      var record = Ext.StoreMgr.get('VenueStore').getById(venueId);
      Ext.StoreMgr.get('ChallengePageStore').setData(record.challenges().getRange());
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
      return ((this.getViewport().getVenueId() > 0) ? true : "Cannot open Challenges until You have Checked-in into a Venue");
   }
});
