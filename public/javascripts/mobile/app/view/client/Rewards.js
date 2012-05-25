Ext.define('Genesis.view.client.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar'],
   alias : 'widget.clientrewardsview',
   config :
   {
      title : 'Earn Rewards',
      changeTitle : false,
      layout : 'fit',
      tag : 'prizeCheck',
      cls : 'prizeCheck',
      // -------------------------------------------------------------------
      // Checking for Prizes Screen
      // -------------------------------------------------------------------
      data :
      {
      },
      tpl :
      // @formatter:off
      '<div class="rouletteBg"></div>'+
      '<div class="rouletteTable"></div>'+
      '<div class="rouletteBall"></div>'
      // @formatter:off
   },
   hideBackButton : true,
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'vip' :
               photo_url = Genesis.constants.getIconPath('miscicons', type.value);
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
