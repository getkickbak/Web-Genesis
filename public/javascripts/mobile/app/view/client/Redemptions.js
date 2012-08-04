Ext.define('Genesis.view.client.Redemptions',
{
   extend : 'Genesis.view.client.RedeemBase',
   alias : 'widget.clientredemptionsview',
   config :
   {
      defaultItemType : 'redeemptsitem',
      redeemTitleText : 'Rewards available to redeem (Select an item below)',
      ptsEarnTitleText : 'Rewards Points Available',
      listCls : 'redemptionsList',
      scrollable : 'vertical',
      cls : 'redemptionsMain viewport',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Redemptions',
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
      this._createView('RedeemStore', 'RedemptionRenderCStore', activeItemIndex);
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
