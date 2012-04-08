Ext.define('Genesis.view.CheckinExplore',
{
   extend : 'Genesis.view.ViewBase',
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
         emptyText : ' ',
         cls : 'checkInExploreList',
         itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>' + '<div class="listItemDetailsWrapper">' + '<div class="itemTitle">{name}</div>' + '<div class="itemDesc">{[this.getAddress(values)]}</div>' + '</div>',
         // @formatter:off
         // @formatter:on
         {
            getPhoto : function(values)
            {
               return values.Merchant['photo']['thumbnail_ios_small'].url;
            },
            getAddress : function(values)
            {
               return (values.address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",<br/>" + values.zipcode);
            }
         }),
         onItemDisclosure : Ext.emptyFn,
         plugins : [
         {
            xclass : 'Ext.plugin.PullRefresh',
            //pullRefreshText: 'Pull down for more new Tweets!',
            refreshFn : function(plugin)
            {
               var controller = _application.getController('Checkins');
               _application.dispatch(
               {
                  action : 'onExploreLoad',
                  args : [],
                  controller : controller,
                  scope : controller
               });
            }
         }]
      },
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
            ui : 'checkInNow',
            tag : 'checkInNow',
            text : 'Check In Now!'
         }]
      }]
   },
   beforeActivate : function(activeItem, oldActiveItem)
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
      if(oldActiveItem)
      {
         var xtypes = oldActiveItem.getXTypes();
         if(xtypes.match('merchantaccountview|checkinmerchantview'))
         {
            this.callParent(arguments);
         }
      }
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
      var xtypes = activeItem.getXTypes();
      if(xtypes.match('merchantaccountview|checkinmerchantview'))
      {
         this.callParent(arguments);
      }
   }
});
