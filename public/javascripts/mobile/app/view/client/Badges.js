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
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   createView : function()
   {
      var me = this;
      var carousel = this;
      var itemsPerPage = 12;

      if (Ext.os.is('iOS'))
      {
         if (Ext.os.is.iPhone5 || Ext.os.is.iPod5)
         {
            itemPerPage = 15;
         }
      }
      else if (Ext.os.is('Android') && (window.screen.height > 480))
      {
         if (window.screen.height <= 568)
         {
            itemPerPage = 15;
         }
         else
         {
            itemPerPage = 18;
         }
      }

      if (!Genesis.view.ViewBase.prototype.createView.apply(this, arguments))
      {
         return;
      }

      carousel.removeAll(true);

      var app = _application;
      var viewport = app.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var vport = viewport.getViewport();
      var items = Ext.StoreMgr.get('BadgeStore').getRange();
      var list = Ext.Array.clone(items);

      for (var i = 0; i < Math.ceil(list.length / itemsPerPage); i++)
      {
         me.getPreRender().push(
         {
            xtype : 'component',
            cls : 'badgesMenuSelections',
            tag : 'badgesMenuSelections',
            scrollable : undefined,
            data : Ext.Array.pluck(list.slice(i * itemsPerPage, ((i + 1) * itemsPerPage)), 'data'),
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
