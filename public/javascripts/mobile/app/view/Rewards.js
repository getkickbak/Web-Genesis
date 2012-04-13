Ext.define('Genesis.view.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.ComponentList', 'Genesis.view.widgets.RewardsCartItem'],
   alias : 'widget.rewardsview',
   config :
   {
      title : 'Earn Rewards',
      changeTitle : false,
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
               xtype : 'componentlist',
               flex : 1,
               defaultType : 'rewardscartitem',
               scrollable : 'vertical',
               store :
               {
                  model : 'Genesis.model.PurchaseReward',
                  grouper :
                  {
                     groupFn : function(record)
                     {
                        return record.get('points') + ' Points';
                     }
                  },
                  sorters : [
                  {
                     property : 'points',
                     direction : 'ASC'
                  }],
                  autoLoad : false
               },
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
               grouped : true
            }]
         },
         // -------------------------------------------------------------------
         // Ordered Items
         // -------------------------------------------------------------------
         {
            tag : 'rewardTallyList',
            items : [
            {
               xtype : 'componentlist',
               flex : 1,
               defaultType : 'rewardscheckoutitem',
               //cls : 'shadows',
               scrollable : 'vertical',
               tag : 'rewardsCart',
               //useComponents : true,
               cls : 'rewardsCart',
               store : 'RewardsCartStore',
               sorters : [
               {
                  property : 'points',
                  direction : 'DESC'
               }]
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
         },
         // -------------------------------------------------------------------
         // Checking for Prizes Screen
         // -------------------------------------------------------------------
         {
            xtype : 'component',
            tag : 'prizeCheck',
            cls : 'prizeCheck'
         }]
      },
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         showAnimation : !Ext.os.is.Android2 ?
         {
            type : 'slideIn',
            direction : 'up',
            duration : 250,
            easing : 'ease-out'
         } : null,
         hideAnimation : !Ext.os.is.Android2 ?
         {
            type : 'scroll',
            direction : 'up',
            duration : 250,
            easing : 'ease-out'
         } : null,
         xtype : 'tabbar',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         scrollable :
         {
            direction : 'horizontal',
            indicators : false
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
            badgeCls : 'x-badge round',
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
         switch (type.value)
         {
            case 'appetizer' :
               photo_url = "resources/img/sprites/shoes.jpg";
               break;
            case 'bread' :
               photo_url = "resources/img/sprites/heroburgers.jpg";
               break;
            case 'dessert' :
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
            case 'sandwich' :
               photo_url = "resources/img/sprites/shoes.jpg";
               break;
            case 'side_dish' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'soup' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
         }
         return photo_url;
      }
   }
});
