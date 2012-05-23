Ext.define('Genesis.view.CheckinExplore',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.plugin.PullRefresh'],
   alias : 'widget.checkinexploreview',
   config :
   {
      title : 'Nearby Places',
      changeTitle : false,
      layout : 'fit',
      merchant : null,
      items : [
      {
         xtype : 'list',
         store : 'CheckinExploreStore',
         scrollable : 'vertical',
         emptyText : ' ',
         cls : 'checkInExploreList',
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate',
         '<div class="photo">'+
            '<img src="{[this.getPhoto(values)]}"/>'+
         '</div>' +
         '<div class="listItemDetailsWrapper">' +
            '<div class="itemDistance">{[this.getDistance(values)]}</div>' +
            '<div class="itemTitle">{name}</div>' +
            '<div class="itemDesc">{[this.getAddress(values)]}</div>' +
         '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               return values.Merchant['photo']['thumbnail_ios_small'].url;
            },
            getAddress : function(values)
            {
               return (values['address'] + ",<br/>" + values['city'] + ", " + values['state'] + ", " + values['country'] + ",<br/>" + values.zipcode);
            },
            getDistance : function(values)
            {
               return values['distance'].toFixed(1) + 'km';
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
                  args : [true],
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
            tag : 'checkInNow',
            text : 'CheckIn Now!'
         }]
      }]
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      switch (this.mode)
      {
         case 'checkin':
            this.getInitialConfig().title = 'Nearby Places';
            break;
         case 'explore' :
            this.getInitialConfig().title = 'Explore Places';
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
