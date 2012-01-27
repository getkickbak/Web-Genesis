Ext.define('Genesis.view.CheckinMerchant',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate'],
   alias : 'widget.checkinmerchantview',
   config :
   {
      title : 'Venue Name',
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
         height : '9em',
         scrollable : false,
         store : 'VenueStore',
         layout :
         {
            type : 'hbox',
            pack : 'center',
            align : 'top'
         },
         cls : 'dataviewWrapper separator',
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto()]}"/></div>' + '<div class="dataviewItemDetailsWrapper" style="{[this.getWidth()]}">' + '<div class="itemTitle">{name}</div>' + '<div class="itemDesc">{[this.getAddress(values)]}</div>' + '</div>',
         // @formatter:on
         {
            getWidth : function()
            {
               return 'width:25em;';
            },
            getPhoto : function()
            {

               var store = Ext.StoreMgr.get('VenueStore');
               var record = store.getRange()[0];
               var values = record.getMerchant().data;

               return values.photo_url;
            },
            getAddress : function(values)
            {
               var address = (values.address2) ? values.address1 + ", " + values.address2 : values.address1;
               return (address + ", " + values.city + ", " + values.state + ", " + values.country + ", " + values.zipcode);
            }
         })
      },
      {
         xtype : 'button',
         ui : 'green-large',
         tag : 'checkinBtn',
         text : 'Check in'
      },
      {
         xtype : 'button',
         ui : 'red-large',
         tag : 'browseBtn',
         text : 'Browse'
      },
      {
         xtype : 'map',
         mapOptions :
         {
            zoom : 16,
            mapTypeId : window.google.maps.MapTypeId.ROADMAP
         },
         useCurrentLocation : false,
         store : 'VenueStore',
         flex : 1
      }]
   }
});
