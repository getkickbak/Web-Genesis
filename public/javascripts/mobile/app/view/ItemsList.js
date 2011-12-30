
var onSuccess = function(position)
{
   // onSuccess Callback
   //   This method accepts a `Position` object, which contains
   //   the current GPS coordinates
   //
   /*
    alert('Latitude: '          + position.coords.latitude          +
    '\n' +
    'Longitude: '         + position.coords.longitude         + '\n' +
    'Altitude: '          + position.coords.altitude          + '\n' +
    'Accuracy: '          + position.coords.accuracy          + '\n' +
    'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
    'Heading: '           + position.coords.heading           + '\n' +
    'Speed: '             + position.coords.speed             + '\n' +
    'Timestamp: '         + new Date(position.timestamp)      + '\n');
    */
   Ext.dispatch(
   {
      controller: app.controllers.items,
      action: 'map',
      coords : position.coords
   });
}
// onError Callback receives a PositionError object
//
function onError(error)
{
   alert('code: '    + error.code    + '\n' +
   'message: ' + error.message + '\n');
}

// Horizontally scrolling thumbnails.
app.views.ItemsListThumbnail = Ext.extend(Ext.Container,
{
   autoEl:
   {
   },
   autoWidth:true,
   defaults:
   {
      autoEl:
      {
      },
      autoWidth:true,
      xtype : 'container'
   },
   items:[
   {
      cls : 'bannerCls',
      html : 'Groupon',
      height:100
   },
   {
      style:'background:transparent;',
      cls:'x-list',
      scroll:'horizontal',
      items:[
      new Ext.DataView(
      {
         id : 'itemsThumbnail',
         store: app.stores.items1,
         cls: 'x-list',
         scroll:false,
         style:'overflow:hidden;background:transparent;',
         itemSelector: 'div.thumb',
         html: 'New',
         tpl: new Ext.XTemplate(
         '<tpl for=".">',
         '<div class="thumb">',
         '<img src="{url}" />',
         '</div>',
         '</tpl>'
         ),
         listeners:
         {
            'refresh' : function(d)
            {
               d.setWidth(d.store.data.length * (605));
            },
            'itemtap' : function(d, index, elem, e)
            {
               var item = d.store.data[index];
               Ext.getCmp('viewSwitch').fireEvent('tap',Ext.getCmp('viewSwitch'));
            }
         }
      })]
   }]
});

app.views.ItemsList = Ext.extend(Ext.TabPanel,
{
   id : 'itemsList',
   grouped: true,
   activeItem : 'browse',
   tabBar:
   {
      ui: 'dark',
      dock: 'bottom',
      defaults:
      {
         //iconMask: true
      },
      scroll:
      {
         direction: 'horizontal',
         //useIndicators: false
      },
      layout:
      {
         type:'hbox',
         pack: 'justify'
      }
   },
   dockedItems: [
   {
      xtype: 'toolbar',
      //title: 'Contacts',
      ui: 'dark',
      layout:
      {
         type:'hbox'
      },
      defaults:
      {
         iconMask: true
      },
      items: [
      {
         iconCls : 'refresh',
         ui : 'light',
         listeners:
         {
            'tap': function ()
            {
            }
         }
      },
      {
         width:20,
         xtype:'spacer'
      },
      {
         flex:1,
         layout:
         {
            type:'hbox'
         },
         centered:true,
         xtype: 'segmentedbutton',
         defaults:
         {
            ui :'light',
            flex:1,
            xtype:'button'
         },
         items:[
         {
            text: 'Nearest',
            pressed : true,
            handler : function()
            {
               //Ext.getCmp('itemsList').setActiveItem('nearest');
            }
         },
         {
            text: 'Latest',
         },
         {
            id: 'suggestions',
            text: 'Suggestions'
         }],
         listeners:
         {
            toggle: function(container, button, pressed)
            {
               console.log("User toggled the '" + button.text + "' button: " + (pressed ? 'on' : 'off'));
            }
         }
      },
      {
         width:20,
         xtype:'spacer'
      },
      {
         ui : 'light',
         id : 'viewSwitch',
         iconCls : 'maps',
         // text: 'Home',
         listeners:
         {
            'tap': function (b,e)
            {
               if (b.iconCls != 'maps')
               {
                  b.setIconClass('maps');
                  Ext.dispatch(
                  {
                     controller: app.controllers.items,
                     action: 'index',
                     animation:
                     {
                        type:'slide',
                        direction:'right'
                     }
                  });
               }
               else
               {
                  b.setIconClass('home');
                  if (Ext.is.Desktop)
                     onSuccess(
                     {
                        coords :
                        {
                           latitude : 39.9492017,
                           longitude : -75.1631272
                        }
                     });
                  else
                     navigator.geolocation.getCurrentPosition( onSuccess, onError);
               }
            }
         }
      }
      ]
   }],
   defaults:
   {
      flex:1
   },
   cardSwitchAnimation:
   {
      type: 'slide',
      cover: true
   },
   items:[
   {
      id:'browse',
      iconCls: 'download',
      title: 'Browse',
      //html: 'Pressed Download'
      items:[
      {
         id : 'browsePanel',
         xtype: 'container',
         autoEl:
         {
         },
         style:'background:transparent;',
         autoHeight:true,
         autoWidth:true,
         height:'100%',
         layout: 'card',
         cardSwitchAnimation: 'slide',
         items:[
         new app.views.ItemsListThumbnail(
         {
            id : 'itemsThumbailPanel'
         }),
         new app.views.ItemsMap(
         {
            id : 'itemsMap'
         })]
      }]
   },
   {
      id:'find',
      iconCls: 'search',
      title: 'Find'
   },
   {
      id:'spot',
      iconCls: 'download',
      title: 'Spot'
      //html: 'Pressed Download'
   },
   {
      id:'guides',
      iconCls: 'download',
      title: 'Guides'
      //html: 'Pressed Download'
   },
   {
      id:'profile',
      iconCls: 'download',
      title: 'Profile'
      //html: 'Pressed Download'
   }
   /*
    {
    xtype: 'list',
    store: app.stores.items,
    itemTpl: '{givenName} {familyName}',
    onItemDisclosure: function (record)
    {
    Ext.dispatch(
    {
    controller: app.controllers.items,
    action: 'show',
    id: record.getId()
    });
    }
    }
    */
   ],
   initComponent: function()
   {
      app.stores.items.load();
      app.views.ItemsList.superclass.initComponent.apply(this, arguments);
   }
});
