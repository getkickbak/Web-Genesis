Ext.define('Genesis.view.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RewardsCartItem'],
   alias : 'widget.rewardsview',
   config :
   {
      title : 'Venue Name',
      changeTitle : true,
      scrollable : false,
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [
      {
         xtype : 'container',
         tag : 'rewards',
         flex : 1,
         layout :
         {
            type : 'card',
            // animation: false
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
            xtype : 'container',
            layout :
            {
               type : 'vbox',
               align : 'stretch',
               pack : 'top'
            }
         },
         items : [
         // -------------------------------------------------------------------
         // Reward Points Menu
         // -------------------------------------------------------------------
         {
            tag : 'rewardMainList',
            items : [
            {
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
                  title : 'Earn Points (Select Items in your Order)'
               },
               {
                  xtype : 'spacer',
                  align : 'right'
               }]
            },
            {
               xtype : 'list',
               flex : 1,
               scrollable : 'vertical',
               store : 'RewardsStore',
               cls : 'rewardsMain',
               /*
                indexBar :
                {
                docked : 'right',
                overlay : true,
                alphabet : false,
                centered : false,
                letters : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
                },
                */
               pinHeaders : false,
               grouped : true,
               // @formatter:off
               itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>', '<div class="listItemDetailsWrapper">', '<div class="itemDesc wrap">{[this.getDesc(values)]}</div>', '</div>',
               // @formatter:on
               {
                  getPhoto : function(values)
                  {
                     if(!values.photo_url)
                     {
                        return Genesis.view.Rewards.getPhoto(values.type);
                     }
                     return values.photo_url;
                  },
                  getDesc : function(values)
                  {
                     return values.title;
                  }
               })
            }]
         },
         // -------------------------------------------------------------------
         // Ordered Items
         // -------------------------------------------------------------------
         {
            tag : 'rewardTallyList',
            items : [
            {
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
                  title : 'Shopping Cart'
               },
               {
                  xtype : 'spacer',
                  align : 'right'
               },
               {
                  xtype : 'button',
                  text : 'Edit'
               },
               {
                  xtype : 'button',
                  text : 'Done',
                  hidden : true
               }]
            },
            {
               flex : 1,
               cls : 'shadows',
               xtype : 'dataview',
               scrollable : 'vertical',
               useComponents : true,
               tag : 'rewardsCart',
               defaultType : 'rewardscartitem',
               cls : 'rewardsCart separator_pad',
               store : 'RewardsCartStore'
            },
            {
               xtype : 'container',
               cls : 'separator rewardsCartFooter',
               defaults :
               {
                  xtype : 'component'
               },
               items : [
               {
                  docked : 'left',
                  html : 'Total'
               },
               {
                  cls : 'points',
                  tag : 'total',
                  docked : 'right',
                  data :
                  {
                     points : 0
                  },
                  tpl : '{points} Pts'
               }]
            },
            {
               xtype : 'button',
               cls : 'separator',
               tag : 'earnPts',
               text : 'Earn Points!',
               ui : 'yellow-large'
            }]
         }]
      },
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         xtype : 'tabbar',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         defaults :
         {
            iconMask : true,
            iconAlign : 'top'
         },
         items : [
         //
         // Left side Buttons
         //
         {
            xtype : 'spacer'
         },
         //
         // Middle Button
         //
         {
            iconCls : 'shop2',
            tag : 'cart',
            title : 'Check Out'
         },
         //
         // Right side Buttons
         //
         {
            xtype : 'spacer'
         }]
      }]

   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url;
         switch (type)
         {
            case 'breakfast' :
               photo_url = "resources/img/sprites/shoes.jpg";
               break;
            case 'lunch' :
               photo_url = "resources/img/sprites/heroburgers.jpg";
               break;
            case 'dinner' :
               photo_url = "resources/img/sprites/springrolls.jpg";
               break;
            case 'drinks' :
               photo_url = "resources/img/sprites/phoboga.jpg";
               break;
            case 'prize' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
         }
         return photo_url;
      }
   }
});
