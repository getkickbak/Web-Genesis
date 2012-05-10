Ext.define('Genesis.view.client.ChallengePage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.data.Store', 'Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.model.Challenge', 'Genesis.view.widgets.ChallengeMenuItem'],
   alias : 'widget.clientchallengepageview',
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
         ui : 'light',
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
            tag : 'doit',
            iconCls : 'dochallenges',
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
   },
   takePhoto : function()
   {
      if(!this.photoAction)
      {
         this.photoAction = Ext.create('Ext.ActionSheet',
         {
            hideOnMaskTap : false,
            defaults :
            {
               defaultUnit : 'em',
               margin : '0 0 0.5 0',
               xtype : 'button',
               handler : Ext.emptyFn
            },
            items : [
            {
               text : 'Use Photo from Library',
               tag : 'library'
            },
            {
               text : 'Use Photo from Photo Album',
               tag : 'album'
            },
            {
               text : 'Take a Picture',
               tag : 'camera'
            },
            {
               margin : '0.5 0 0 0',
               text : 'Cancel',
               ui : 'cancel',
               scope : this,
               handler : function()
               {
                  this.photoAction.hide();
               }
            }]
         });
         Ext.Viewport.add(this.photoAction);
      }
      this.photoAction.show();
   }
});
