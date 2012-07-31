Ext.define('Genesis.view.client.Prizes',
{
   extend : 'Genesis.view.client.RedeemBase',
   alias : 'widget.clientprizesview',
   config :
   {
      defaultItemType : 'redeemptsitem',
      toolbarTitleText : 'Redemptions Available (Select an item below)',
      listCls : 'prizesList',
      scrollable : 'vertical',
      cls : 'prizesMain viewport',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Prizes',
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            hidden : true,
            align : 'left',
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   createView : function(activeItemIndex)
   {
      this._createView('PrizeStore', 'PrizeRenderCStore', activeItemIndex);
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
      },
      getBadge : function(badge, remote)
      {
         var photo_url = null;
         switch (type.value)
         {
            default :
               photo_url = Genesis.constants.getIconPath('badges', type.value, remote);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});