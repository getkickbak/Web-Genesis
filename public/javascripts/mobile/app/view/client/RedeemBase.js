Ext.define('Genesis.view.client.RedeemBase',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedeemPtsItemBase'],
   alias : 'widget.clientredeeembaseview',
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
      console.debug("RedeemBase : showView");
   },
   _createView : function(store, renderStore, activeItemIndex)
   {
      var me = this;

      // ------------------------------------------------------------------------
      // Redeem Points Earned Panel
      // ------------------------------------------------------------------------
      me.setPreRender(me.getPreRender().concat([
      {
         //docked : 'top',
         cls : 'ptsEarnPanel',
         tag : 'ptsEarnPanel',
         xtype : 'dataview',
         useComponents : true,
         scrollable : undefined,
         defaultType : me.getDefaultItemType(),
         store : renderStore
      },
      // ------------------------------------------------------------------------
      // Redemptions
      // ------------------------------------------------------------------------
      Ext.create('Ext.List',
      {
         flex : 1,
         refreshHeightOnUpdate : false,
         variableHeights : false,
         deferEmptyText : false,
         itemHeight : Genesis.fn.calcPx(Genesis.fn.calcPxEm(Genesis.constants.defaultIconSize(), 2 * 0.65, 1), 1),
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
                  return me.self.getPhoto(values['type']);
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
         onItemDisclosure : Ext.emptyFn,
         // ------------------------------------------------------------------------
         // Redeem Available Panel
         // ------------------------------------------------------------------------
         items : [
         /*{
          docked : 'top',
          xtype : 'toolbar',
          ui : 'light',
          cls : 'ptsEarnPanelHdr',
          centered : false,
          items : [
          {
          xtype : 'title',
          title : me.getPtsEarnTitleText()
          },
          {
          xtype : 'spacer'
          }]
          },
          */
         {
            docked : 'top',
            xtype : 'toolbar',
            cls : 'ptsEarnPanelHdr',
            ui : 'light',
            centered : false,
            items : [
            {
               xtype : 'title',
               title : me.getRedeemTitleText()
            },
            {
               xtype : 'spacer'
            }]
         }]
      })]));
   },
   statics :
   {
   }
});
