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
            tag : 'back',
            text : 'Back'
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
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   createView : function()
   {
      var carousel = this;

      if (!Genesis.view.ViewBase.prototype.createView.apply(this, arguments))
      {
         var ditems = carousel.query('dataview');
         for (var i = 0; i < ditems.length; i++)
         {
            ditems[i].refresh();
         }
         return;
      }

      carousel.removeAll(true);

      var app = _application;
      var viewport = app.getController('Viewport');
      var vport = viewport.getViewport();
      var items = Ext.StoreMgr.get('BadgeStore').getRange();
      var list = Ext.Array.clone(items);

      for (var i = 0; i < Math.ceil(items.length / 16); i++)
      {
         this.getPreRender().push(Ext.create('Ext.dataview.DataView',
         {
            xtype : 'dataview',
            cls : 'badgesMenuSelections',
            tag : 'badgesMenuSelections',
            scrollable : undefined,
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
                  var type = values['type'];
                  var customer = _application.getController('Viewport').getCustomer();
                  var badge = Ext.StoreMgr.get('BadgeStore').getById(customer.get('badge_id'));
                  var rank = badge.get('rank');

                  return Genesis.view.client.Badges.getPhoto((values['rank'] <= rank) ? type : 'nobadge', 'thumbnail_medium_url');
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
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   },
   statics :
   {
      getPhoto : function(type, size)
      {
         var url;
         switch (type)
         {
            case 'nobadge':
            {
               switch (size)
               {
                  case 'thumbnail_small_url' :
                  {
                     size = 'small';
                     break;
                  }
                  case 'thumbnail_medium_url' :
                  {
                     size = 'medium';
                     break;
                  }
                  case 'thumbnail_large_url' :
                  {
                     size = 'large';
                     break;
                  }
               }
               url = Genesis.constants.getIconPath('badges', size + '/' + 'nobadge', false);
               break;
            }
            default:
               url = (Genesis.constants.photoSite + type[size]);
               break;
         }
         return url;
      }
   }
});
