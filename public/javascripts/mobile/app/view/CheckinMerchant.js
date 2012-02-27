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
         store : 'VenueStore'
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
