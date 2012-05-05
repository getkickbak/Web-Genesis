Ext.define('Genesis.view.client.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar'],
   alias : 'widget.clientrewardsview',
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
            cls : 'prizeCheck',
            data :
            {
            },
            tpl :
            // @formatter:off
            '<div class="rouletteBg"></div>'+
            '<div class="rouletteTable"></div>'+
            '<div class="rouletteBall"></div>'
            // @formatter:off
         }]
      }]
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
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
