app.controllers.items = new Ext.Controller(
{
   index: function(options)
   {
      app.views.viewport.setActiveItem(app.views.itemsList, options.animation);
      Ext.getCmp('browsePanel').setActiveItem('itemsThumbailPanel',options.animation);
   },
   show: function(options)
   {
      var id = parseInt(options.id),
      //item = app.stores.items.getById(id);
      item = app.stores.items1.getById(id);
      if (item)
      {
         app.views.itemDetail.updateWithRecord(item);
         app.views.viewport.setActiveItem(
         app.views.itemDetail, options.animation
         );
      }
   },
   edit: function(options)
   {
      var id = parseInt(options.id),
      item = app.stores.items.getById(id);
      if (item)
      {
         app.views.itemForm.updateWithRecord(item);
         app.views.viewport.setActiveItem(
         app.views.itemForm, options.animation
         );
      }
   },
   map : function(options)
   {

      // Hard code for now, but we will retrieve all locations based on current
      // location coords
      item = app.stores.items1.getById(0);
      if (item)
      {
         app.views.viewport.setActiveItem(app.views.itemsList, options.animation);
         Ext.getCmp('browsePanel').setActiveItem('itemsMap',options.animation);
         Ext.getCmp('itemsMap').updateWithRecord(item,options.coords);
      }
   }
});