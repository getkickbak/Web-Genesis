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
      models : ['CustomerReward'],
      bottom : 0,
      left : 0,
      top : 0,
      right : 0,
      padding : 0,
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

      var preItemsConfig = config['preItemsConfig'] || [];
      var postItemsConfig = config['postItemsConfig'] || [];
      delete config['preItemsConfig'];
      delete config['postItemsConfig'];

      var orientation = Ext.Viewport.getOrientation(), mobile = Ext.os.is('Phone') || Ext.os.is('Tablet'), landscape = (mobile && (orientation == 'landscape'));
      Ext.merge(config,
      {
         items : [
         {
            preItemsConfig : preItemsConfig,
            postItemsConfig : postItemsConfig,
            iconType : config['iconType'],
            flex : 1,
            xtype : 'popupitem',
            data : Ext.create('Genesis.model.CustomerReward',
            {
               'title' : config['title'],
               'type' :
               {
                  value : config['icon']
               }
               //'photo' : photoUrl
            })
         },
         {
            right : landscape ? 0 : null,
            bottom : landscape ? 0 : null,
            docked : landscape ? null : 'bottom',
            tag : 'buttons',
            width : landscape ? '10em' : 'auto',
            layout : landscape ?
            {
               type : 'vbox',
               pack : 'end'
            } :
            {
               type : 'hbox'
            },
            defaults :
            {
               xtype : 'button',
               defaultUnit : 'em',
               flex : 1
            },
            padding : '0 1.0 1.0 1.0',
            items : buttons
         }]
      });
      delete config['iconType'];
      delete config['icon'];

      if (mobile)
      {
         Ext.Viewport.on('orientationchange', me.onOrientationChange, me);
         me.on(
         {
            destroy : 'onDestroy',
            single : true,
            scope : me
         });
      }
      me.callParent(arguments);
      me.element.setStyle('padding', '0px');
   },
   onDestroy : function()
   {
      Ext.Viewport.un('orientationchange', me.onOrientationChange);
   },
   onOrientationChange : function(v, newOrientation, width, height, eOpts)
   {
      var me = this, buttons = me.query('container[tag=buttons]')[0];
      buttons.setDocked((newOrientation == 'landscape') ? null : 'bottom');
      buttons.setLayout((newOrientation == 'landscape') ?
      {
         type : 'vbox',
         pack : 'end'
      } :
      {
         type : 'hbox'
      });
      switch (newOrientation)
      {
         case 'landscape' :
         {
            buttons.setRight(0);
            buttons.setBottom(0);
            buttons.setWidth('10em');
            break;
         }
         case 'portrait' :
         {
            buttons.setRight(null);
            buttons.setBottom(null);
            buttons.setWidth('auto');
            break;
         }
      }
   }
});
