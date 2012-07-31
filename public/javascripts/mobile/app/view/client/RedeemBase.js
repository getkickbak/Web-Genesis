Ext.define('Genesis.view.client.RedemptionsBase',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedemptionsPtsItem'],
   alias : 'widget.clientredemptionsbaseview',
   config :
   {
   },
   disableAnimation : true,
   cleanView : function()
   {
      this.removeAll(true);
   },
   showView : function()
   {
      this.callParent(arguments);
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
   },
   _createView : function(store, renderStore, activeItemIndex)
   {
      var me = this;

      if (!me.callParent(arguments))
      {
         return;
      }

      // ------------------------------------------------------------------------
      // Redemptions Points Earned Panel
      // ------------------------------------------------------------------------
      me.setPreRender(me.getPreRender().concat([Ext.create('Ext.Toolbar',
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
         defaultType : me.getDefaultItemType(),
         store : renderStore
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
            title : me.getToolbarTitleText()
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
         deferEmptyText : false,
         scrollable : undefined,
         ui : 'bottom-round',
         store : store,
         cls : me.getListCls() + ' separator_pad',
         tag : me.getListCls(),
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate',
         '<div class="photo x-hasbadge">'+
            '<span class="x-badge round">{[this.getPoints(values)]}</span>',
            '<img src="{[this.getPhoto(values)]}"/>'+
         '</div>',
         '<div class="listItemDetailsWrapper">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
            //'<div class="itemDesc">{[this.getDesc(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               if (!values.photo)
               {
                  return me.statics().getPhoto(values['type']);
               }
               return values.photo.url;
            },
            getTitle : function(values)
            {
               return values['title'];
            },
            getDesc : function(values)
            {
               return 'This will cost you ' + values['points'] + ' Pts';
            },
            getPoints : function(values)
            {
               return values['points'];
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
