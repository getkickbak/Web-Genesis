Ext.define('Genesis.view.MerchantDetails',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Map', 'Genesis.view.widgets.MerchantDetailsItem'],
   alias : 'widget.merchantdetailsview',
   config :
   {
      cls : 'merchantDetails',
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
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Venue Name',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            tag:'back',
            ui : 'back',
            text : 'Back'
         },
         {
            align : 'right',
            iconCls : 'share',
            tag : 'shareBtn',
            handler : function()
            {
               if(!this.actions)
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
      },
      {
         xtype : 'dataview',
         cls : 'separator',
         useComponents : true,
         defaultType : 'merchantdetailsitem',
         scrollable : undefined,
         store :
         {
            model : 'Genesis.model.Venue',
            autoLoad : false
         }
      },
      /*
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
       }
       */
      {
         xtype : 'component',
         tag : 'map',
         flex : 1,
         cls : 'separator_pad gmap',
         defaultUnit : 'em',
         listeners :
         {
            painted : function(map, eOpts)
            {
               cntlr = _application.getController('Merchants');
               var size = map.innerElement.getSize();
               map.setSize(size.width - (1 * 15), size.height - (1 * 12));
               var queryString = Ext.Object.toQueryString(Ext.apply(
               {
                  zoom : 15,
                  scale : window.devicePixelRatio,
                  maptype : 'roadmap',
                  sensor : false,
                  size : (size.width - (1 * 15)) + 'x' + (size.height - (1 * 12))
               }, cntlr.markerOptions));
               var string = Ext.String.urlAppend(cntlr.self.googleMapStaticUrl, queryString);
               map.setData(
               {
                  width : size.width - (1 * 15),
                  height : size.height - (1 * 12),
                  photo : string
               });
            }
         },
         tpl : Ext.create('Ext.XTemplate', '<img height="{height}" width="{width}" src="{photo}"/>')
      }]
   }
});
