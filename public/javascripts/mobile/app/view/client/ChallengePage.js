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
      scrollable : undefined,
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Challenges',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            ui : 'normal',
            tag:'close',
            text : 'Close'
         }]
      },
      {
         xtype : 'carousel',
         cls : 'challengePageItem shadows',
         direction : 'horizontal'
      },
      {
         docked : 'bottom',
         cls : 'checkInNow',
         tag : 'challengeContainer',
         hidden : true,
         xtype : 'container',
         layout :
         {
            type : 'vbox',
            pack : 'center'
         },
         items : [
         {
            xtype : 'button',
            iconCls : 'dochallenges',
            iconMask : true,
            tag : 'doit',
            text : 'Lets do it!'
         }]
      },
      {
         docked : 'bottom',
         xtype : 'container',
         tag : 'challengePageItemDescWrapper',
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
         }
         /*,
          {
          cls : 'itemDescName',
          tpl : '{name}'
          }
          */]
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
