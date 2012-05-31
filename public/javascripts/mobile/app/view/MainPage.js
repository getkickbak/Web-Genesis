Ext.define('Genesis.view.MainPage',
{
   extend : 'Ext.Carousel',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate'],
   alias : 'widget.mainpageview',
   config :
   {
      title : ' ',
      changeTitle : false,
      direction : 'horizontal',
      items : (!merchantMode) ? [

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
            tag : 'checkInNow',
            text : 'CheckIn Now!'
         }]
      }] : null
   },
   beforeActivate : function()
   {
      var carousel = this;
      var viewport = _application.getController('Viewport');
      var view = Ext.ComponentQuery.query('viewportview')[0];
      var show = viewport.getCheckinInfo().venue != null;
      var items = Ext.StoreMgr.get('MainPageStore').getRange();
      var list = Ext.Array.clone(items);

      if(!carousel._listitems)
      {
         carousel._listitems = [];
      }

      if(!show)
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
      if((Ext.Array.difference(items, carousel._listitems).length > 0) || //
      (items.length != carousel._listitems.length))
      {
         carousel._listitems = items;
         carousel.removeAll(true);
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
            '<div class="mainPageItemWrapper x-hasbadge">',
               '{[this.getPrizeCount(values)]}',
               '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>',
               '<div class="photoName">{name}</div>',
            '</div>',
            // @formatter:on
               {
                  getType : function()
                  {
                     return values['pageCntlr'];
                  },
                  getPrizeCount : function(values)
                  {
                     var count = 0;
                     var type = values['pageCntlr'];
                     var pstore = Ext.StoreMgr.get('MerchantPrizeStore');
                     if(pstore)
                     {
                        count = pstore.getCount();
                     }
                     return ((type == 'Prizes') ? //
                     '<span class="x-badge round" data="' + type + '" ' + //
                     'class="' + ((count > 0) ? '' : 'x-item-hidden') + '">' + count + '</span>' : '');
                  },
                  getPhoto : function(photoURL)
                  {
                     return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
                  }
               }),
               autoScroll : true
            });
         }
         console.log("MainPage Icons Refreshed.");
      }
      else
      {
         //
         // Refresh All Badge Counts
         //
         var pstore = Ext.StoreMgr.get('MerchantPrizeStore');
         if(pstore)
         {
            var count = pstore.getCount();
            var dom = Ext.DomQuery.select('span[data=Prizes]',carousel.query('dataview')[0].element.dom)[0];
            if(count > 0)
            {
               dom.innerHTML = count;
               Ext.fly(dom).removeCls("x-item-hidden");
            }
            else
            {
               if(!dom.className.match(/x-item-hidden/))
               {
                  Ext.fly(dom).addCls("x-item-hidden");
               }
            }
         }
         console.log("MainPage Icons Not changed.");
      }

      if(carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
   },
   beforeDeactivate : function()
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      viewport.getNavigationBar().removeCls('kbTitle');
   },
   afterActivate : function()
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      viewport.getNavigationBar().addCls('kbTitle');
   },
   afterDeactivate : function()
   {
   }
});
