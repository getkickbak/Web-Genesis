Ext.define('Genesis.view.MainPageBase',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.data.Store', 'Ext.Carousel', 'Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.mainpagebaseview',
   config :
   {
      models : ['frontend.MainPage'],
      itemPerPage : 6,
      layout : 'fit',
      cls : 'viewport',
      listeners : [
      {
         element : 'element',
         delegate : 'div.itemWrapper',
         event : 'tap',
         fn : "onItemTap"
      }],
      scrollable : undefined
   },
   //disableAnimation : null,
   isEligible : Ext.emptyFn,
   initialize : function()
   {
      this.setPreRender([]);
      this.callParent(arguments);
   },
   onItemTap : function(e, target, delegate, eOpts)
   {
      var data = Ext.create('Genesis.model.frontend.MainPage', Ext.decode(decodeURIComponent(e.delegatedTarget.getAttribute('data'))));
      _application.getController(((merchantMode) ? 'server' : 'client') + '.MainPage').fireEvent('itemTap', data);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      var carousel = this.query('carousel')[0];
      carousel.removeAll(true);
      this.callParent(arguments);
   },
   createView : function()
   {
      var me = this, carousel = me.query('carousel')[0], app = _application;
      var viewport = app.getController(((merchantMode) ? 'server' : 'client') + '.Viewport'), vport = viewport.getViewport();
      var show = (!merchantMode) ? viewport.getCheckinInfo().venue != null : false;
      var items = Ext.StoreMgr.get('MainPageStore').getRange(), list = Ext.Array.clone(items);

      if (!carousel._listitems)
      {
         carousel._listitems = [];
      }

      if (!show)
      {
         Ext.Array.forEach(list, function(item, index, all)
         {
            switch (item.get('hide'))
            {
               case 'true' :
               {
                  Ext.Array.remove(items, item);
                  break;
               }
            }
         });
      }
      //
      // Only update if changes were made
      //
      if ((Ext.Array.difference(items, carousel._listitems).length > 0) || //
      (items.length != carousel._listitems.length))
      {
         carousel._listitems = items;
         carousel.removeAll(true);
         for (var i = 0; i < Math.ceil(items.length / me.getItemPerPage()); i++)
         {
            carousel.add(
            {
               xtype : 'component',
               cls : 'mainMenuSelections',
               tag : 'mainMenuSelections',
               scrollable : undefined,
               data : Ext.Array.pluck(items.slice(i * me.getItemPerPage(), ((i + 1) * me.getItemPerPage())), 'data'),
               tpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<tpl for=".">',
                  '<div class="itemWrapper x-hasbadge" data="{[this.encodeData(values)]}">',
                     '{[this.isEligible(values)]}',
                     '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>',
                     '<div class="photoName">{name}</div>',
                  '</div>',
               '</tpl>',
               // @formatter:on
               {
                  encodeData : function(values)
                  {
                     return encodeURIComponent(Ext.encode(values));
                  },
                  getType : function()
                  {
                     return values['pageCntlr'];
                  },
                  isEligible : me.isEligible,
                  getPhoto : function(photoURL)
                  {
                     return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
                  }
               })
            });
         }
         console.debug("MainPage Icons Refreshed.");
      }
      else
      {
         console.debug("MainPage Icons Not changed.");
      }
      delete carousel._listitems;

      this.callParent(arguments);
   },
   showView : function()
   {
      var carousel = this.query('carousel')[0];
      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
      this.callParent(arguments);
   }
});
