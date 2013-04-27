Ext.define('Genesis.view.widgets.ItemDetail',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate'],
   alias : 'widget.itemdetailview',
   config :
   {
      scrollable : undefined,
      itemXType : 'item',
      cls : 'itemDetailMain viewport',
      layout :
      {
         type : 'vbox',
         pack : 'center',
         align : 'stretch'
      }
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments) && (me.getInnerItems().length > 0))
      {
         var item = me.getInnerItems()[0];
         //
         // Refresh RedeemItem
         //
         item.setData(me.item);
         item.updateItem(me.item);
      }
      else
      {
         me.setPreRender([
         {
            flex : 1,
            xtype : me.getItemXType(),
            data : me.item
         }]);
      }
      delete me.item;
   }
});

Ext.define('Genesis.view.widgets.PopupItemDetail',
{
   extend : 'Ext.Sheet',
   alias : 'widget.popupitemdetailview',
   config :
   {
      bottom : 0,
      left : 0,
      top : 0,
      right : 0,
      //padding : '1.0',
      hideOnMaskTap : false,
      defaultUnit : 'em',
      layout :
      {
         type : 'vbox',
         pack : 'middle'
      },
      defaults :
      {
         xtype : 'container',
         defaultUnit : 'em'
      }
   },
   constructor : function(config)
   {
      var me = this;
      config = config ||
      {
      };

      var buttons = config['buttons'] || [];
      delete config['buttons'];

      Ext.merge(config,
      {
         items : [
         {
            flex : 1,
            xtype : 'popupitem',
            data : Ext.create('Genesis.model.CustomerReward',
            {
               'title' : config['title'],
               'type' :
               {
                  value : 'phoneInHand'
               }
               //'photo' : photoUrl
            })
         },
         {
            docked : 'bottom',
            defaults :
            {
               xtype : 'button',
               defaultUnit : 'em'
            },
            padding : '0 1.0 1.0 1.0',
            items : buttons
         }]
      });

      me.callParent(arguments);
   }
});
