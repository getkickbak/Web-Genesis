Ext.define('Genesis.view.Accounts',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.accountsview',
   config :
   {
      cls : 'accountsMain',
      layout : 'fit',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      this.getPreRender().push(Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'CustomerStore',
         tag : 'accountsList',
         scrollable : 'vertical',
         cls : 'accountsList',
         deferEmptyText : false,
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
            '<div class="photo x-hasbadge">',
               '{[this.getPrizeCount(values)]}',
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
            getPrizeCount : function(values)
            {
               var count = 0;
               var type = values['pageCntlr'];
               var pstore = Ext.StoreMgr.get('MerchantPrizeStore');
               if (pstore)
               {
                  var collection = pstore.queryBy(function(record, id)
                  {
                     return (record.getMerchant().getId() == values.merchant['id'])
                  });
                  count = collection.getCount();
               }
               return ('<span class="x-badge round ' + //
               ((count > 0) ? '' : 'x-item-hidden') + '">' + count + '</span>');
            },
            getPhoto : function(values)
            {
               return values.merchant['photo']['thumbnail_ios_small'].url;
            },
            getPoints : function(values)
            {
               return values.points + ' Pts';
            }
         }),
         onItemDisclosure : Ext.emptyFn
      }));
   }
});
