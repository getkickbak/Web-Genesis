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
         var photo_url = null;
         switch (type.value)
         {
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
