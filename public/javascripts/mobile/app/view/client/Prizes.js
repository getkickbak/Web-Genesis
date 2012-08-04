Ext.define('Genesis.view.client.Prizes',
{
   extend : 'Genesis.view.client.RedeemBase',
   alias : 'widget.clientprizesview',
   config :
   {
      defaultItemType : 'redeemptsitem',
      ptsEarnTitleText : 'Prize Points Available',
      redeemTitleText : 'Prizes available to redeem (Select an item below)',
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
      if (!this.callParent(arguments))
      {
         return;
      }
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
      }
   }
});
