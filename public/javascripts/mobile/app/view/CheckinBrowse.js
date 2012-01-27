Ext.require('Ext.plugin.PullRefresh', function()
{
   Ext.define('Genesis.view.CheckinBrowse',
   {
      extend : 'Ext.Container',
      requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.plugin.PullRefresh'],
      alias : 'widget.checkinbrowseview',
      config :
      {
         title : 'Nearby Places',
         layout : 'fit',
         items : [
         {
            xtype : 'list',
            store : 'CheckinBrowseStore',
            scrollable : 'vertical',
            ui : 'round',
            cls : 'listScrollWrapper separator_pad',
            // @formatter:off
            itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>' + '<div class="listItemDetailsWrapper" style="{[this.getWidth()]}">' + '<div class="itemTitle">{name}</div>' + '<div class="itemDesc">{[this.getAddress(values)]}</div>' + '</div>',
            // @formatter:on
            {
               getWidth : function()
               {
                  return 'width:25em;';
               },
               getPhoto : function(values)
               {
                  return values.Merchant['photo_url'];
               },
               getAddress : function(values)
               {
                  var address = (values.address2) ? values.address1 + ", " + values.address2 : values.address1;
                  return (address + ", " + values.city + ", " + values.state + ", " + values.country + ", " + values.zipcode);
               }
            }),
            onItemDisclosure : Ext.emptyFn,
            plugins : [Ext.create('Ext.plugin.PullRefresh',
            {
               //ptype : 'pullrefresh',
               refreshFn : function(callback, plugin)
               {
                  var store = plugin.getList().getStore();
                  store.removeAll();
                  // call the plugins processComplete method to hide the 'loading' indicator
                  store.on('load', callback, plugin,
                  {
                     single : true
                  });
                  // do whatever needs to happen for reload
                  store.load();
               }
            })]
         }]
      }
   });
});
