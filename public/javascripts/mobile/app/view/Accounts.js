Ext.define('Genesis.view.Accounts',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.accountsview',
   config :
   {
      title : 'Loyalty Accounts',
      scrollable : false,
      changeTitle : false,
      cls : 'accountsMain',
      layout : 'fit',
      items : [
      {
         xtype : 'list',
         store : 'CustomerStore',
         tag : 'accountsList',
         scrollable : 'vertical',
         cls : 'accountsList',
         /*
          indexBar :
          {
          docked : 'right',
          overlay : true,
          alphabet : true,
          centered : false
          //letters : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
          },
          */
         pinHeaders : false,
         grouped : true,
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>', '<div class="listItemDetailsWrapper">', '<div class="points">{[this.getPoints(values)]}</div>' +
         // //'<div class="coin"><img src="{[this.getCoin()]}" /></div>',
         '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               return values.Merchant['icon_url'];
            },
            getCoin : function()
            {
               return 'resources/img/sprites/coin.jpg';
            },
            getPoints : function(values)
            {
               return values.points + ' Pts';
            }
         }),
         onItemDisclosure : Ext.emptyFn
      }]
   },
   beforeActivate : function(activeItem, oldActiveItem)
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
