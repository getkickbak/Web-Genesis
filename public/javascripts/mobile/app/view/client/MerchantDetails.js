Ext.define('Genesis.view.client.MerchantDetails',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Map', 'Genesis.view.widgets.MerchantDetailsItem'],
   alias : 'widget.clientmerchantdetailsview',
   config :
   {
      cls : 'merchantDetails viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      defaults :
      {
         cls : 'separator'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'right',
            iconCls : 'share',
            tag : 'shareBtn',
            handler : function()
            {
               if (!this.actions)
               {
                  this.actions = Ext.create('Ext.ActionSheet',
                  {
                     hideOnMaskTap : false,
                     defaults :
                     {
                        defaultUnit : 'em',
                        margin : '0 0 0.5 0',
                        xtype : 'button'
                     },
                     items : [
                     {
                        text : 'Refer-A-Friend',
                        ui : 'action',
                        //iconCls : 'mail',
                        tag : 'emailShareBtn',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     },
                     {
                        text : 'Post on Facebook',
                        tag : 'fbShareBtn',
                        ui : 'fbBlue',
                        //iconCls : 'facebook',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     },
                     {
                        margin : '0.5 0 0 0',
                        text : 'Cancel',
                        iconMaskCls : 'dummymask',
                        ui : 'cancel',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     }]
                  });
                  Ext.Viewport.add(this.actions);
               }
               this.actions.show();
            }
         }]
      })]
   },
   renderView : function(map)
   {
      var cntlr = _application.getController('client.Merchants');
      var size = map.getSize();
      var padding = Genesis.fn.calcPx(0.7, 1);
      map.setSize(size.width, size.height - (1 * 12));
      var queryString = Ext.Object.toQueryString(Ext.apply(
      {
         zoom : 15,
         scale : window.devicePixelRatio,
         maptype : 'roadmap',
         sensor : false,
         size : size.width + 'x' + (size.height - (1 * padding))
      }, cntlr.markerOptions));
      var string = Ext.String.urlAppend(cntlr.self.googleMapStaticUrl, queryString);
      Ext.getCmp(map.observableId.split(map.observableIdPrefix)[1]).setData(
      {
         width : size.width,
         height : size.height - (1 * padding),
         photo : string
      });
   },
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         me.renderView(me.query('component[tag=map]')[0]);
         return;
      }

      me.setPreRender(me.getPreRender().concat([Ext.create('Ext.dataview.DataView',
      {
         xtype : 'dataview',
         cls : 'separator',
         tag : 'details',
         useComponents : true,
         defaultType : 'merchantdetailsitem',
         scrollable : undefined,
         store : 'MerchantRenderStore'
      }),
      /*
       Ext.create('Ext.Map,',
       {
       xtype : 'map',
       tag : 'map',
       mapOptions :
       {
       zoom : 15//,
       //mapTypeId : window.google.maps.MapTypeId.ROADMAP
       },
       useCurrentLocation : false,
       //store : 'VenueStore',
       flex : 1
       }),
       */
      Ext.create('Ext.Component',
      {
         xtype : 'component',
         tag : 'map',
         flex : 1,
         cls : 'separator_pad gmap',
         defaultUnit : 'em',
         listeners :
         {
            'painted' : function(c)
            {
               me.renderView(c);
            }
         },
         tpl : Ext.create('Ext.XTemplate', '<img height="{height}" width="{width}" src="{photo}"/>')
      })]));

      me.query('button[tag=shareBtn]')[0].setHidden((_application.getProfileInstances()[0].getName().match(/mobileClient/i)) ? true : false);
   }
});
