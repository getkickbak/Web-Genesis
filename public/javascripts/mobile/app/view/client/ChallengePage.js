Ext.define('Genesis.view.client.ChallengePage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.data.Store', 'Ext.Carousel', 'Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.model.Challenge'],
   alias : 'widget.clientchallengepageview',
   config :
   {
      models : ['Challenge'],
      itemPerPage : 6,
      layout : 'fit',
      cls : 'viewport',
      scrollable : undefined,
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Challenges',
         items : [
         {
            align : 'left',
            ui : 'normal',
            tag : 'close',
            text : 'Close'
         }]
      }),
      {
         xtype : 'carousel',
         cls : 'challengePageItem shadows',
         direction : 'horizontal'
      },
      {
         docked : 'bottom',
         cls : 'challengeContainer',
         tag : 'challengeContainer',
         hidden : true,
         xtype : 'container',
         layout :
         {
            type : 'vbox',
            pack : 'center'
         },
         items : [
         {
            xtype : 'button',
            iconCls : 'dochallenges',
            iconMask : true,
            tag : 'doit',
            text : 'Lets do it!'
         }]
      },
      {
         docked : 'bottom',
         xtype : 'container',
         tag : 'challengePageItemDescWrapper',
         cls : 'challengePageItemDescWrapper',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         defaults :
         {
            xtype : 'component'
         },
         items : [
         {
            //flex : 1,
            cls : 'itemDesc',
            data :
            {
               description : ''
            },
            tpl : Ext.create('Ext.XTemplate', '{[this.getDesc(values)]}',
            {
               getDesc : function(values)
               {
                  return values['description']
               }
            })
         }
         /*,
          {
          cls : 'itemDescName',
          tpl : '{name}'
          }
          */]
      }],
      listeners : [
      {
         element : 'element',
         delegate : 'div.itemWrapper',
         event : 'tap',
         fn : "onItemTap"
      }]
   },
   takePhoto : function()
   {
      if (!this.photoAction)
      {
         this.photoAction = Ext.create('Ext.ActionSheet',
         {
            hideOnMaskTap : false,
            defaults :
            {
               defaultUnit : 'em',
               margin : '0 0 0.5 0',
               xtype : 'button',
               handler : Ext.emptyFn
            },
            items : [
            {
               text : 'Use Photo from Library',
               tag : 'library'
            },
            {
               text : 'Use Photo from Photo Album',
               tag : 'album'
            },
            {
               text : 'Take a Picture',
               tag : 'camera'
            },
            {
               margin : '0.5 0 0 0',
               text : 'Cancel',
               ui : 'cancel',
               scope : this,
               handler : function()
               {
                  this.photoAction.hide();
               }
            }]
         });
         Ext.Viewport.add(this.photoAction);
      }
      this.photoAction.show();
   },
   deselectItems : function()
   {
      var carousel = this.query('carousel')[0];
      var items = Ext.DomQuery.select('div.itemWrapper', carousel.element.dom);
      for (var i = 0; i < items.length; i++)
      {
         Ext.get(items).removeCls('x-item-selected');
      }
   },
   onItemTap : function(e, target, delegate, eOpts)
   {
      this.deselectItems();

      var element = Ext.get(e.delegatedTarget);
      element.addCls('x-item-selected');

      var data = Ext.create('Genesis.model.Challenge', Ext.decode(decodeURIComponent(e.delegatedTarget.getAttribute('data'))));
      var mobileClient = (_build == 'MobileWebClient');
      _application.getController(((mobileClient) ? 'mobileClient' : 'client') + '.Challenges').fireEvent('itemTap', data);
   },
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   removeAll : function(destroy, everything)
   {
      var carousel = this.query('carousel')[0];
      return carousel.removeAll(true);
   },
   _createView : function(carousel, items)
   {
      var me = this;

      //
      // Disable unsupported features on MobileClient
      //
      if (_build == 'MobileWebClient')
      {
         for (var i = 0; i < items.length; i++)
         {
            var item = items[i];
            switch (item.get('type').value)
            {
               case 'photo':
               case 'referral' :
               {
                  var index = items.indexOf(item);
                  items.splice(index, 1);
                  if (index == i)
                  {
                     i--;
                  }
                  break;
               }
            }
         }
      }

      switch (Ext.Viewport.getOrientation())
      {
         case 'landscape' :
         {
            me.calcCarouselSize(0.75);
            break;
         }
         case 'portrait' :
         {
            me.calcCarouselSize(1.5);
            break;
         }
      }

      carousel.removeAll(true);
      for (var i = 0; i < Math.ceil(items.length / me.getItemPerPage()); i++)
      {
         carousel.add(
         {
            xtype : 'component',
            cls : 'challengeMenuSelections',
            tag : 'challengeMenuSelections',
            scrollable : undefined,
            data : Ext.Array.pluck(items.slice(i * me.getItemPerPage(), ((i + 1) * me.getItemPerPage())), 'data'),
            tpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<tpl for=".">',
               '<div class="itemWrapper x-hasbadge" data="{[this.encodeData(values)]}">',
                  '<span class="x-badge round">{[this.getPoints(values)]}</span>',
                  '<div class="photo">'+
                     '<img src="{[this.getPhoto(values)]}" />'+
                  '</div>',
                  '<div class="photoName">{name}</div>',
               '</div>',
            '</tpl>',
            // @formatter:on
            {
               encodeData : function(values)
               {
                  return encodeURIComponent(Ext.encode(values));
               },
               getPoints : function(values)
               {
                  return values['points'] + ' Points';
               },
               getPhoto : function(values)
               {
                  if (!values.photo || !values.photo.url)
                  {
                     return me.self.getPhoto(values['type']);
                  }
                  return values.photo.url;
               }
            })
         });
      }
      console.debug("ChallengePage Icons Updated.");
   },
   createView : function()
   {
      var carousel = this.query('carousel')[0];
      var record = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getVenue();
      var venueId = record.getId();
      var items = record.challenges().getRange();
      var element = Ext.DomQuery.select('div.itemWrapper',carousel.element.dom)[0];

      if ((carousel.getInnerItems().length > 0) && element)
      {
         var data = Ext.create('Genesis.model.Challenge', Ext.decode(decodeURIComponent(element.getAttribute('data'))));
         if (data.getId() == items[0].getId())
         {
            this.deselectItems();

            console.debug("ChallengePage Icons Refreshed.");
         }
         else
         {
            this._createView(carousel, items);
         }
      }
      else
      {
         this._createView(carousel, items);
      }

      this.callParent(arguments);

      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
      //return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         var value = type.value;
         switch (value)
         {
            case 'custom' :
               value = 'mystery';
            default :
               photo_url = Genesis.constants.getIconPath('mainicons', value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
