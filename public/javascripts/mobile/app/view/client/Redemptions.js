Ext.define('Genesis.view.client.Redemptions',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedemptionsPtsItem'],
   alias : 'widget.clientredemptionsview',
   config :
   {
      scrollable : 'vertical',
      cls : 'redemptionsMain',
      layout : 'vbox',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Redemptions',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         }]
      }]
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
      // ------------------------------------------------------------------------
      // Redemptions Points Earned Panel
      // ------------------------------------------------------------------------
      this.setPreRender(this.getPreRender().concat([Ext.create('Ext.Toolbar',
      {
         xtype : 'toolbar',
         ui : 'light',
         cls : 'ptsEarnPanelHdr',
         centered : false,
         items : [
         {
            xtype : 'title',
            title : 'Points Earned'
         },
         {
            xtype : 'spacer'
         }]
      }), Ext.create('Ext.dataview.DataView',
      {
         cls : 'ptsEarnPanel separator',
         tag : 'ptsEarnPanel',
         xtype : 'dataview',
         useComponents : true,
         scrollable : undefined,
         defaultType : 'redemptionsptsitem',
         store : 'RedemptionRenderCStore'
      }),
      // ------------------------------------------------------------------------
      // Redemptions Available Panel
      // ------------------------------------------------------------------------
      Ext.create('Ext.Toolbar',
      {
         xtype : 'toolbar',
         cls : 'ptsEarnPanelHdr',
         ui : 'light',
         centered : false,
         items : [
         {
            xtype : 'title',
            title : 'Redemptions Available (Select an item below)'
         },
         {
            xtype : 'spacer'
         }]
      }),
      // ------------------------------------------------------------------------
      // Redemptions
      // ------------------------------------------------------------------------
      Ext.create('Ext.List',
      {
         xtype : 'list',
         scrollable : undefined,
         ui : 'bottom-round',
         store : 'RedemptionsStore',
         cls : 'redemptionsList separator_pad',
         tag : 'redemptionsList',
         /*
         indexBar :
         {
         docked : 'right',
         overlay : true,
         alphabet : false,
         centered : false,
         letters : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
         },
         */
         //pinHeaders : true,
         grouped : true,
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate',
         '<div class="photo">'+
            '<img src="{[this.getPhoto(values)]}"/>'+
         '</div>',
         '<div class="listItemDetailsWrapper">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               if(!values.photo)
               {
                  return Genesis.view.client.Redemptions.getPhoto(values['type']);
               }
               return values.photo.url;
            },
            getTitle : function(values)
            {
               return values['title'];
            }
         }),
         onItemDisclosure : Ext.emptyFn
      })]));
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
