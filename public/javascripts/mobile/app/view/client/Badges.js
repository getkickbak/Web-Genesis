Ext.define('Genesis.view.client.Badges',
{
   extend : 'Ext.Carousel',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate'],
   alias : 'widget.clientbadgesview',
   config :
   {
      cls : 'viewport',
      preRender : null,
      direction : 'horizontal',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Badges',
         items : [
         {
            align : 'left',
            ui : 'normal',
            tag : 'close',
            text : 'Close'
         }]
      })]
   },
   //disableAnimation : true,
   initialize : function()
   {
      this.setPreRender([]);
      this.callParent(arguments);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      this.removeAll(true);
   },
   removeAll : function(destroy, everything)
   {
      var rc = this.callParent(arguments);
      this.setPreRender([]);

      return rc;
   },
   createView : function()
   {
      if (!Genesis.view.ViewBase.prototype.createView.apply(this, arguments))
      {
         return;
      }

      var carousel = this;
      var app = _application;
      var viewport = app.getController('Viewport');
      var vport = viewport.getViewport();
      var items = Ext.StoreMgr.get('BadgeStore').getRange();
      var list = Ext.Array.clone(items);

      carousel.removeAll(true);
      for (var i = 0; i < Math.ceil(items.length / 16); i++)
      {
         this.getPreRender().push(Ext.create('Ext.dataview.DataView',
         {
            xtype : 'dataview',
            cls : 'badgesMenuSelections',
            scrollable : false,
            deferInitialRefresh : false,
            store :
            {
               model : 'Genesis.model.Badge',
               data : Ext.Array.pluck(items.slice(i * 16, ((i + 1) * 16)), 'data')
            },
            itemTpl : Ext.create('Ext.XTemplate',
            // @formatter:off
               '<div class="itemWrapper">',
                  '<div class="photo"><img src="{[this.getPhoto(values)]}" /></div>',
                  '<div class="photoName">{[this.getName(values)]}</div>',
               '</div>',
               // @formatter:on
            {
               getName : function(values)
               {
                  return values['type'].display_value;
               },
               getPhoto : function(values)
               {
                  return Genesis.view.client.Badges.getPhoto(values['type'], 'thumbnail_medium_url');
               }
            }),
            autoScroll : true
         }));
      }
      console.log("Badge Icons Refreshed.");
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      if (this.getInnerItems().length == 0)
      {
         this.add(this.getPreRender());
      }

      var carousel = this;
      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
   },
   statics :
   {
      getPhoto : function(type, size)
      {
         return (Genesis.constants.photoSite + type[size]);
      }
   }
});
