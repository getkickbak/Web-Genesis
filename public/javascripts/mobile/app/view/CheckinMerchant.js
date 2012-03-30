Ext.define('Genesis.view.CheckinMerchant',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Map', 'Genesis.view.widgets.CheckinMerchantDetailsItem'],
   alias : 'widget.checkinmerchantview',
   config :
   {
      title : 'Venue Name',
      changeTitle : true,
      cls : 'checkinMerchant',
      scrollable : 'vertical',
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
         xtype : 'dataview',
         cls : 'checkinMerchantWrapper separator',
         useComponents : true,
         defaultType : 'checkinmerchantdetailsitem',
         scrollable : false,
         store :
         {
            model : 'Genesis.model.Venue',
            autoLoad : false
         }
      },
      {
         xtype : 'container',
         margin : 0,
         layout :
         {
            type : 'hbox',
            align : 'stretch',
            pack : 'center'
         },
         items : [
         {
            flex : 1,
            xtype : 'button',
            ui : 'green-large',
            tag : 'checkinBtn',
            text : 'Check in'
         },
         {
            flex : 1,
            xtype : 'button',
            //margin : '0 0 0 0.8',
            //defaultUnit : 'em',
            ui : 'red-large',
            tag : 'exploreBtn',
            text : 'Explore'
         }]
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
         cls : 'separator gmap',
         defaultUnit : 'em',
         listeners :
         {
            painted : function(map, eOpts)
            {
               cntlr = _application.getController('Checkins');
               var size = map.innerElement.getSize();
               map.setSize(size.width, size.height);
               var queryString = Ext.Object.toQueryString(Ext.apply(
               {
                  zoom : 15,
                  maptype : 'roadmap',
                  sensor : false,
                  size : size.width + 'x' + size.height
               }, cntlr.markerOptions));
               var string = Ext.String.urlAppend(cntlr.self.googleMapStaticUrl, queryString);
               map.setData(
               {
                  width : size.width,
                  height : size.height,
                  photo : string
               });
            }
         },
         tpl : Ext.create('Ext.XTemplate', '<img height="{height}" width="{width}" src="{photo}"/>')
      }]
   },
   beforeActivate : function()
   {
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
