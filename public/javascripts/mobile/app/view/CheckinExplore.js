Ext.require('Ext.plugin.PullRefresh', function()
{
   Ext.define('Genesis.view.CheckinExplore',
   {
      extend : 'Ext.Container',
      requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.plugin.PullRefresh'],
      alias : 'widget.checkinexploreview',
      config :
      {
         title : 'Check-in Nearby Places',
         changeTitle : false,
         layout : 'fit',
         items : [
         {
            xtype : 'list',
            store : 'CheckinExploreStore',
            scrollable : 'vertical',
            ui : 'round',
            cls : 'checkInExploreList separator_pad',
            itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>' + '<div class="listItemDetailsWrapper">' + '<div class="itemTitle">{name}</div>' + '<div class="itemDesc">{[this.getAddress(values)]}</div>' + '</div>',
            // @formatter:off
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  return values.Merchant['photo_url'];
               },
               getAddress : function(values)
               {
                  var address = (values.address2) ? values.address1 + ", " + values.address2 : values.address1;
                  return (address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",<br/>" + values.zipcode);
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
         },
         {
            docked : 'bottom',
            cls : 'checkInNow',
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
         switch (this.mode)
         {
            case 'checkin':
               this.getInitialConfig().title = 'Check-in Nearby Places';
               break;
            case 'explore' :
               this.getInitialConfig().title = 'Explore Nearby Places';
               break;
         }
      },
      beforeDeactivate : function()
      {
      },
      afterActivate : function()
      {
         var viewport = Ext.ComponentQuery.query('viewportview')[0];
         var cvenueId = viewport.getCheckinInfo().venueId;
         var show = cvenueId > 0;
         viewport.query('button[tag=main]')[0][show ? 'show' : 'hide']();
      },
      afterDeactivate : function()
      {
      }
   });
});
