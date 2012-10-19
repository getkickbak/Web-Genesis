Ext.define('Genesis.view.client.CheckinExplore',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.plugin.ListPaging', 'Ext.plugin.PullRefresh'],
   alias : 'widget.clientcheckinexploreview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      merchant : null,
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'home',
            text : 'Home'
         },
         {
            align : 'right',
            ui : 'normal',
            tag : 'rewardsSC',
            text : 'Earn Pts!'
         }]
      }),
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
   disableAnimation : true,
   createView : function()
   {
      if (!this.callParent(arguments))
      {
      	//this.query('list')[0].refresh();
         return;
      }
      this.getPreRender().push(Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'CheckinExploreStore',
         //scrollable : 'vertical',
         plugins : [
         {
            type : 'pullrefresh',
            //pullRefreshText: 'Pull down for more new Tweets!',
            refreshFn : function(plugin)
            {
               var controller = _application.getController('client.Checkins');
               controller.fireEvent('exploreLoad', true);
            }
         },
         {
            type : 'listpaging',
            autoPaging : true,
            loadMoreText : '',
            noMoreRecordsText : ''
         }],
         refreshHeightOnUpdate : false,
         variableHeights : false,
         deferEmptyText : false,
         itemHeight : Genesis.fn.calcPx(Genesis.fn.calcPxEm(Genesis.constants.defaultIconSize(), 2 * 0.65, 1), 1),
         emptyText : ' ',
         tag : 'checkInExploreList',
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
         onItemDisclosure : Ext.emptyFn
      }));
   }
});
