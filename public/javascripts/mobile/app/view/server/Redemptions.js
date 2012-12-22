Ext.define('Genesis.view.server.Redemptions',
{
   extend : 'Genesis.view.RedeemBase',
   requires : ['Genesis.view.widgets.RewardPtsItem'],
   alias : 'widget.serverredemptionsview',
   config :
   {
      defaultItemType : 'rewardptsitem',
      redeemTitleText : 'Rewards available to redeem (Select an item below)',
      listCls : 'redemptionsList',
      //scrollable : 'vertical',
      scrollable : undefined,
      cls : 'redemptionsMain viewport',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Redemptions',
         items : [
         {
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
   inheritableStatics :
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
