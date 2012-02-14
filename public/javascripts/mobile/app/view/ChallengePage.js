Ext.define('Genesis.view.ChallengePage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.data.Store', 'Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.model.Challenge', 'Genesis.view.widgets.ChallengeMenuItem'],
   alias : 'widget.challengepageview',
   config :
   {
      title : 'Challenges',
      changeTitle : false,
      layout : 'fit',
      scrollable : false,
      items : [
      {
         xtype : 'carousel',
         direction : 'horizontal'
      },
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         xtype : 'tabbar',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         scrollable :
         {
            direction : 'horizontal',
            indicators : false
         },
         defaults :
         {
            iconMask : true,
            iconAlign : 'top'
         },
         items : [
         //
         // Left side Buttons
         //
         {
            xtype : 'spacer'
         },
         //
         // Middle Button
         //
         {
            iconCls : 'doit',
            title : 'Do it!'
         },
         //
         // Right side Buttons
         //
         {
            xtype : 'spacer'
         }]
      },
      {
         docked : 'bottom',
         xtype : 'container',
         cls : 'challengePageItemDescWrapper',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         defaults :
         {
            xtype : 'component'
         },
         items : [
         {
            flex : 1,
            cls : 'itemDesc',
            tpl : '{description}'
         },
         {
            cls : 'itemDescName',
            tpl : '{name}'
         }]
      }]
   }
});
