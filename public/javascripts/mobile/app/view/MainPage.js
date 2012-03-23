Ext.define('Genesis.view.MainPage',
{
   extend : 'Ext.Carousel',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate'],
   alias : 'widget.mainpageview',
   config :
   {
      title : 'KickBak',
      changeTitle : false,
      direction : 'horizontal',
      items : [
      {
         docked : 'bottom',
         cls : 'checkInNow',
         tag : 'checkInNow',
         xtype : 'container',
         layout :
         {
            type : 'vbox',
            pack : 'center'
         },
         items : [
         {
            xtype : 'button',
            ui : 'checkInNow',
            tag : 'checkInNow',
            text : 'Check In Now!'
         }]
      }]
   },
   beforeActivate : function()
   {
      var carousel = this;
      var viewport = _application.getController('Viewport');
      var view = Ext.ComponentQuery.query('viewportview')[0];
      var show = viewport.getCheckinInfo().venue != null;
      var items = Ext.StoreMgr.get('MainPageStore').getRange();
      var list = Ext.Array.clone(items);

      carousel.removeAll(true);
      if(!show)
      {
         Ext.Array.forEach(list, function(item, index, all)
         {
            switch (item.get('pageCntlr'))
            {
               case 'MainPage' :
               {
                  Ext.Array.remove(items, item);
                  break;
               }
            }
         });
      }
      for(var i = 0; i < Math.ceil(items.length / 6); i++)
      {
         carousel.add(
         {
            xtype : 'dataview',
            cls : 'mainMenuSelections',
            scrollable : false,
            deferInitialRefresh : false,
            store :
            {
               model : 'Genesis.model.frontend.MainPage',
               data : Ext.Array.pluck(items.slice(i * 6, ((i + 1) * 6)), 'data')
            },
            itemTpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<div class="mainPageItemWrapper">', '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>', '<div class="photoName">{name}</div>', '</div>',
            // @formatter:on
            {
               getPhoto : function(photoURL)
               {
                  return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
               }
            }),
            autoScroll : true
         });
      }
      if(carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
   },
   beforeDeactivate : function()
   {
   },
   afterActivate : function()
   {
   },
   afterDeactivate : function()
   {
   }
});
