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
   },
   refs : [
   // Bottom Toolbar
   {
      ref : 'bottomtoolbar',
      selector : 'navigatorBarBottom'
   },
   {
      ref : 'challengeBtn',
      selector : 'button[iconCls=challenge]'
   },
   {
      ref : 'challengePage',
      selector : 'challengepageview',
      autoCreate : true,
      xtype : 'challengepageview'
   }],
   model : ['Challenge'],
   views : ['ChallengePage'//, 'MenuChallenge'
   ],
   stores : ['ChallengePageStore'],
   init : function(app)
   {
      this.control(
      {
         'challengepageview > dataview' :
         {
            select : this.onItemSelect
         },
         'button[iconCls=challenge]' :
         {
            tap : this.onChallengeBtnTap
         }
      });
      this.callParent(arguments);
      console.log("Challenge Init");
   },
   onItemSelect : function(d, model, eOpts)
   {
      d.deselect([model], false);
      var desc = this.getChallengePage().query("container[docked=bottom][xtype=container]")[0];
      desc.updateData(model.data);
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
   openMainPage : function()
   {
      this.pushView(this.getChallengePage());
      console.log("ChallengePage Opened");
   }
});
