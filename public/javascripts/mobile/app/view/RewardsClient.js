Ext.define('Genesis.view.RewardsClient',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar'],
   alias : 'widget.rewardsclientview',
   config :
   {
      title : 'Earn Rewards',
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
         // Checking for Prizes Screen
         // -------------------------------------------------------------------
         {
            xtype : 'component',
            tag : 'prizeCheck',
            cls : 'prizeCheck'
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
