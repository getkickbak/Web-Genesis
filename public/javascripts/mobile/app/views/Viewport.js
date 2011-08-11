app.views.Viewport = Ext.extend(Ext.Panel,
{
   style:'background: url(resources/img/groupon-bg.png) repeat;',
   fullscreen: true,
   layout: 'card',
   cardSwitchAnimation: 'slide',
   initComponent: function()
   {
      //put instances of cards into app.views namespace
      Ext.apply(app.views,
      {
         //itemsList: new app.views.ItemsList(),
         itemDetail: new app.views.ItemDetail(),
         itemForm: new app.views.ItemForm(),
      });
      //put instances of cards into viewport
      Ext.apply(this,
      {
         items: [
         //app.views.itemsList,
         app.views.itemDetail,
         app.views.itemForm
         ]
      });
      app.views.Viewport.superclass.initComponent.apply(this, arguments);
   }
});