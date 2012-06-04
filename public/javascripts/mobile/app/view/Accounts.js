Ext.define('Genesis.view.Accounts',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.accountsview',
   config :
   {
      cls : 'accountsMain',
      layout : 'fit',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : ' ',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            tag:'back',
            ui : 'back',
            text : 'Back'
         }]
      },
      {
         xtype : 'list',
         store : 'CustomerStore',
         tag : 'accountsList',
         scrollable : 'vertical',
         cls : 'accountsList',
         emptyText : ' ',
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
         itemTpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<tpl if="this.isValidCustomer(values)">',
            '<div class="photo">',
               '<img src="{[this.getPhoto(values)]}"/>',
            '</div>',
            '<div class="listItemDetailsWrapper">',
               '<div class="points">{[this.getPoints(values)]}</div>',
            '</div>',
         '</tpl>',
         // @formatter:on
         {
            isValidCustomer : function(values)
            {
               //return Customer.isValidCustomer(values['id']);
               return true;
            },
            getPhoto : function(values)
            {
               return values.Merchant['photo']['thumbnail_ios_small'].url;
            },
            getPoints : function(values)
            {
               return values.points + ' Pts';
            }
         }),
         onItemDisclosure : Ext.emptyFn
      }]
   }
});
