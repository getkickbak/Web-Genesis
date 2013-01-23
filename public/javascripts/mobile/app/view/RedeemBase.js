Ext.define('Genesis.view.RedeemBase',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedeemPtsItemBase'],
   alias : 'widget.redeeembaseview',
   config :
   {
   },
   disableAnimation : true,
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   showView : function()
   {
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
      this.callParent(arguments);
      console.debug("RedeemBase : showView");
   },
   _createView : function(store, renderStore, activeItemIndex)
   {
      var me = this, itemHeight = 1 + Genesis.constants.defaultIconSize() + 2 * Genesis.fn.calcPx(0.65, 1);

      console.debug("itemHeight=" + itemHeight);
      me.setPreRender([
      // ------------------------------------------------------------------------
      // Redemptions
      // ------------------------------------------------------------------------
      {
         xtype : 'list',
         flex : 1,
         refreshHeightOnUpdate : false,
         variableHeights : false,
         //deferEmptyText : false,
         itemHeight : itemHeight,
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
      }]);
   },
   inheritableStatics :
   {
   }
});
