Ext.define('Genesis.view.CheckinExplore',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.plugin.PullRefresh'],
   alias : 'widget.checkinexploreview',
   config :
   {
      layout : 'fit',
      merchant : null,
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Nearby Places',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         },
         {
            align : 'left',
            ui : 'normal',
            tag : 'close',
            text : 'Close'
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
   createView : function()
   {
      if(!this.callParent(arguments))
      {
         return;
      }
      this.getPreRender().push(Ext.create('Ext.List',
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
      }));
   },
   showView : function()
   {
      this.callParent(arguments);
      
      // Hack to fix bug in Sencha Touch API
      var plugin = this.query('list')[0].getPlugins()[0];
      plugin.refreshFn = plugin.getRefreshFn();
   }
});
