Ext.define('Genesis.view.server.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar'],
   alias : 'widget.serverrewardsview',
   config :
   {
      title : 'Kickbak Rewards',
      changeTitle : false,
      layout : 'vbox',
      items : [
      {
         xtype : 'container',
         tag : 'rewards',
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
               cls : 'earnPtsPanelHdr',
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
               placeHolder : 'Enter the price',
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
               ui : 'yellow-large'
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
               xtype : 'component',
               tag : 'qrcode',
               cls : 'qrcode'
               //itemTpl : Ext.create('Ext.XTemplate', '<img src="{photo_url}"/>')
            },
            {
               docked : 'bottom',
               xtype : 'button',
               cls : 'separator done',
               tag : 'done',
               text : 'Done',
               ui : 'yellow-large'
            }]
         }]
      }]
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url;
         switch (type.value)
         {
            case 'appetizers' :
               photo_url = "resources/img/sprites/shoes.jpg";
               break;
            case 'bread' :
               photo_url = "resources/img/sprites/heroburgers.jpg";
               break;
            case 'desserts' :
               photo_url = "resources/img/sprites/springrolls.jpg";
               break;
            case 'drinks' :
               photo_url = "resources/img/sprites/phoboga.jpg";
               break;
            case 'entrees' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'noodles' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'pasta' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'pastry' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'salad' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'sandwiches' :
               photo_url = "resources/img/sprites/shoes.jpg";
               break;
            case 'side_dishes' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'soup' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'vip' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
         }
         return photo_url;
      }
   }
});