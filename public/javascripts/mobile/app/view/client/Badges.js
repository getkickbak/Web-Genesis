Ext.define('Genesis.view.client.Badges',
{
   extend : 'Ext.Carousel',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate', 'Genesis.view.ViewBase'],
   alias : 'widget.clientbadgesview',
   config :
   {
      models : ['Badge'],
      cls : 'viewport',
      itemPerPage : 12,
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
      })],
      listeners : [
      {
         element : 'element',
         delegate : 'div.itemWrapper',
         event : 'tap',
         fn : "onItemTap"
      }]
   },
   //disableAnimation : true,
   initialize : function()
   {
      this.setPreRender([]);
      this.callParent(arguments);
   },
   onItemTap : function(e, target, delegate, eOpts)
   {
      var data = Ext.create('Genesis.model.Badge', Ext.decode(decodeURIComponent(e.delegatedTarget.getAttribute('data'))));
      this.fireEvent('itemTap', data);
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
   removeAll : function()
   {
      var me = this;

      me.setPreRender([]);
      me.callParent(arguments);
   },
   createView : function()
   {
      var me = this, carousel = this;

      if (!Genesis.view.ViewBase.prototype.createView.apply(this, arguments))
      {
         return;
      }

      switch (Ext.Viewport.getOrientation())
      {
         case 'landscape' :
         {
            Genesis.view.ViewBase.prototype.calcCarouselSize.apply(me, [4/3]);
            break;
         }
         case 'portrait' :
         {
            Genesis.view.ViewBase.prototype.calcCarouselSize.apply(me, [2]);
            break;
         }
      }

      carousel.removeAll(true);

      var app = _application, viewport = app.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var vport = viewport.getViewport(), items = Ext.StoreMgr.get('BadgeStore').getRange(), list = Ext.Array.clone(items);

      for (var i = 0; i < Math.ceil(list.length / me.getItemPerPage()); i++)
      {
         me.getPreRender().push(
         {
            xtype : 'component',
            cls : 'badgesMenuSelections',
            tag : 'badgesMenuSelections',
            scrollable : undefined,
            data : Ext.Array.pluck(list.slice(i * me.getItemPerPage(), ((i + 1) * me.getItemPerPage())), 'data'),
            tpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<tpl for=".">',
               '<div class="itemWrapper" data="{[this.encodeData(values)]}">',
                  '<div class="photo"><img src="{[this.getPhoto(values)]}" /></div>',
                  '<div class="photoName">{[this.getName(values)]}</div>',
               '</div>',
            '</tpl>',
            // @formatter:on
            {
               encodeData : function(values)
               {
                  return encodeURIComponent(Ext.encode(values));
               },
               getName : function(values)
               {
                  return values['type'].display_value;
               },
               getPhoto : function(values)
               {
                  var type = values['type'];
                  var customer = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getCustomer();
                  var badge = Ext.StoreMgr.get('BadgeStore').getById(customer.get('badge_id'));
                  var rank = badge.get('rank');
                  return me.self.getPhoto((values['rank'] <= rank) ? type : 'nobadge', 'thumbnail_medium_url');
               }
            })
         });
      }
      console.debug("Badge Icons Refreshed.");
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      /*
       if (this.getInnerItems().length == 0)
       {
       this.add(this.getPreRender());
       }
       */

      var carousel = this;

      Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
   },
   inheritableStatics :
   {
      getPhoto : function(type, size)
      {
         var url;
         switch (type)
         {
            case 'nobadge':
            {
               if (size.match(/small/))
               {
                  size = 'small';
               }
               else if (size.match(/medium/))
               {
                  size = 'medium';
               }
               else
               {
                  size = 'large';
               }

               url = Genesis.constants.getIconPath('badges', size + '/' + 'nobadge', false);
               break;
            }
            default:
               url = type[size];
               break;
         }
         return url;
      }
   }
});
