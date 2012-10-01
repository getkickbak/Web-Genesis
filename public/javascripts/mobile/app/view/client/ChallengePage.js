Ext.define('Genesis.view.client.ChallengePage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.data.Store', 'Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.model.Challenge', 'Genesis.view.widgets.ChallengeMenuItem'],
   alias : 'widget.clientchallengepageview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      scrollable : undefined,
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Challenges',
         items : [
         {
            align : 'left',
            ui : 'normal',
            tag : 'close',
            text : 'Close'
         }]
      }),
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
            //flex : 1,
            cls : 'itemDesc',
            data :
            {
               description : ''
            },
            tpl : Ext.create('Ext.XTemplate', '{[this.getDesc(values)]}',
            {
               getDesc : function(values)
               {
                  return values['description']
               }
            })
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
      if (!this.photoAction)
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
   },
   cleanView : function()
   {
      //this.removeAll(true);
   },
   createView : function()
   {
      var carousel = this.query('carousel')[0];
      var record = _application.getController('Viewport').getVenue();
      var venueId = record.getId();
      var items = record.challenges().getRange();

      if ((carousel.getInnerItems().length > 0) && //
      (carousel.getInnerItems()[0].getStore().getRange()[0].getId() == items[0].getId()))
      {
         // No need to update the Challenge Menu. Nothing changed.
         for (var i = 0; i < carousel.getInnerItems().length; i++)
         {
            carousel.getInnerItems()[i].deselectAll();
         }

         var ditems = carousel.query('dataview');
         for (var i = 0; i < ditems.length; i++)
         {
            ditems[i].refresh();
         }
         console.log("ChallengePage Icons Refreshed.");
      }
      else
      {
         carousel.removeAll(true);
         for (var i = 0; i < Math.ceil(items.length / 6); i++)
         {
            carousel.add(Ext.create('Ext.dataview.DataView',
            {
               xtype : 'dataview',
               cls : 'challengeMenuSelections',
               tag : 'challengeMenuSelections',
               useComponents : true,
               defaultType : 'challengemenuitem',
               scrollable : undefined,
               store :
               {
                  model : 'Genesis.model.Challenge',
                  data : Ext.Array.pluck(items.slice(i * 6, ((i + 1) * 6)), 'data')
               }
            }));
         }
         if (carousel.getInnerItems().length > 0)
         {
            carousel.setActiveItem(0);
         }
         console.log("ChallengePage Icons Updated.");
      }
   }
});
