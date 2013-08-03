Ext.define('Genesis.view.client.Prizes',
{
   extend : 'Genesis.view.RedeemBase',
   requires : ['Genesis.view.widgets.PrizePtsItem'],
   alias : 'widget.clientprizesview',
   config :
   {
      defaultItemType : 'prizeptsitem',
      ptsEarnTitleText : 'Prize Points Available',
      redeemTitleText : 'Choose a Prize to redeem',
      listCls : 'prizesList',
      //scrollable : 'vertical',
      scrollable : undefined,
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
   _createView : function(store, renderStore, activeItemIndex)
   {
      var me = this;
      var customer = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getCustomer();

      me.callParent(arguments);
      // ------------------------------------------------------------------------
      // Redeem Points Earned Panel
      // ------------------------------------------------------------------------
      if (Customer.isValid(customer.getId()))
      {
         me.setPreRender([
         {
            //docked : 'top',
            cls : 'ptsEarnPanel',
            tag : 'ptsEarnPanel',
            xtype : 'dataview',
            useComponents : true,
            scrollable : undefined,
            defaultType : me.getDefaultItemType(),
            store : renderStore
         }].concat(me.getPreRender()));
      }
   },
   createView : function(activeItemIndex)
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         var customer = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getCustomer();
         me.query('dataview[tag=ptsEarnPanel]')[0](Customer.isValid(customer.getId()) ? 'show' : 'hide')();
         return;
      }
      me._createView('PrizeStore', 'PrizeRenderCStore', activeItemIndex);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            default :
               //photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
