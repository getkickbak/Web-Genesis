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
            iconCls : 'home',
            //text : 'Home',
            tag : 'home'
         },
         {
            align : 'right',
            ui : 'normal',
            iconCls : 'refresh',
            tag : 'refresh'
         }]
      }),
      {
         docked : 'bottom',
         hidden : true,
         cls : 'toolbarBottom',
         tag : 'toolbarBottom',
         xtype : 'container',
         layout :
         {
            type : 'vbox',
            pack : 'center'
         },
         items : [
         {
            xtype : 'segmentedbutton',
            allowMultiple : false,
            defaults :
            {
               iconMask : true,
               ui : 'blue',
               flex : 1
            },
            items : [
            {
               iconCls : 'rewards',
               tag : 'rewardsSC',
               text : 'Earn Points'
            }],
            listeners :
            {
               toggle : function(container, button, pressed)
               {
                  //console.debug("User toggled the '" + button.getText() + "' button: " + ( pressed ? 'on' : 'off'));
                  container.setPressedButtons([]);
               }
            }
         }]
      }]
   },
   disableAnimation : true,
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         //this.query('list')[0].refresh();
         return;
      }
      var itemHeight = 1 + Math.max(Genesis.constants.defaultIconSize(), Genesis.fn.calcPx(0.75, 1) * 4 + Genesis.fn.calcPx(0.7 * 0.6, 1));
      me.getPreRender().push(Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'CheckinExploreStore',
         loadingText : null,
         //scrollable : 'vertical',
         plugins : [
         {
            type : 'pullrefresh',
            //pullRefreshText: 'Pull down for more new Tweets!',
            refreshFn : function(plugin)
            {
               me.fireEvent('exploreLoad', true);
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
         itemHeight : Genesis.fn.calcPx(Genesis.fn.calcPxEm(itemHeight, (2 * 0.65), 1), 1),
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
               return values.Merchant['photo']['thumbnail_medium_url'];
            },
            getAddress : function(values)
            {
               return (values['address'] + ",<br/>" + values['city'] + ", " + values['state'] + ", " + values['country'] + ",<br/>" + values.zipcode);
            },
            getDistance : function(values)
            {
               return ((values['distance'] > 0) ? values['distance'].toFixed(1) + 'km' : '');
            }
         }),
         onItemDisclosure : Ext.emptyFn
      }));
   }
});
