Ext.define('Genesis.view.server.Redemptions',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.serverredemptionsview',
   config :
   {
      title : 'Redemptions',
      changeTitle : false,
      scrollable : 'vertical',
      cls : 'redemptionsMain',
      layout : 'vbox',
      items : []
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
            case 'custom' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
         }
         return photo_url;
      }
   }
});
