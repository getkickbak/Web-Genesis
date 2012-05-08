Ext.define('Genesis.view.server.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar'],
   alias : 'widget.serverrewardsview',
   config :
   {
      title : ' ',
      changeTitle : false,
      layout : 'vbox',
      items : [
      {
         xtype : 'container',
         tag : 'rewards',
         cls : 'rewardsServerMain',
         flex : 1,
         layout :
         {
            type : 'card',
            animation :
            {
               duration : 600,
               easing : 'ease-in-out',
               type : 'slide',
               direction : 'down'
            }
         },
         activeItem : 0,
         defaults :
         {
            layout : 'fit'
         },
         items : [
         // -------------------------------------------------------------------
         // Reward Calculator
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'rewardsMainCalculator',
            cls : 'rewardsMainCalculator',
            items : [
            {
               docked : 'top',
               xtype : 'toolbar',
               centered : false,
               defaults :
               {
                  iconMask : true
               },
               items : [
               {
                  xtype : 'title',
                  title : 'Amount Spent'
               },
               {
                  xtype : 'spacer',
                  align : 'right'
               }]
            },
            {
               docked : 'top',
               xtype : 'textfield',
               name : 'price',
               clearIcon : false,
               placeHolder : 'Enter Sales Price',
               readOnly : true,
               required : true,
               cls : 'rewardsCalculator'
            },
            {
               xtype : 'container',
               layout : 'vbox',
               tag : 'dialpad',
               cls : 'dialpad',
               defaults :
               {
                  xtype : 'container',
                  layout : 'hbox',
                  flex : 1,
                  defaults :
                  {
                     xtype : 'button',
                     flex : 1
                  }
               },
               items : [
               {
                  items : [
                  {
                     text : '1'
                  },
                  {
                     text : '2'
                  },
                  {
                     text : '3'
                  }]
               },
               {
                  items : [
                  {
                     text : '4'
                  },
                  {
                     text : '5'
                  },
                  {
                     text : '6'
                  }]
               },
               {
                  items : [
                  {
                     text : '7'
                  },
                  {
                     text : '8'
                  },
                  {
                     text : '9'
                  }]
               },
               {
                  items : [
                  {
                     text : 'AC'
                  },
                  {
                     text : '0'
                  },
                  {
                     text : '.'
                  }]
               }]
            },
            {
               docked : 'bottom',
               xtype : 'button',
               cls : 'separator',
               tag : 'showQrCode',
               text : 'Show QRCode',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // Show for QRCode Screen
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'qrcodeContainer',
            cls : 'qrcodeContainer',
            items : [
            {
               docked : 'top',
               xtype : 'component',
               tag : 'title',
               width : '100%',
               cls : 'title',
               defaultUnit : 'em',
               tpl : Ext.create('Ext.XTemplate', '{[this.getPrice(values)]}',
               {
                  getPrice : function(values)
                  {
                     return values['price'];
                  }
               })
            },
            {
               xtype : 'component',
               tag : 'qrcode',
               cls : 'qrcode'
            },
            {
               docked : 'bottom',
               xtype : 'button',
               cls : 'separator done',
               tag : 'done',
               text : 'Done',
               ui : 'large'
            }]
         }]
      }]
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      viewport.getNavigationBar().addCls('kbTitle');
      this.callParent(arguments);
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      viewport.getNavigationBar().removeCls('kbTitle');
      this.callParent(arguments);
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'custom' :
               break;
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               break;
         }
         return photo_url;
      }
   }
});
