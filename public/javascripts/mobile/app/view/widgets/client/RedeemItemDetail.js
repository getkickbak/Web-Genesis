Ext.define('Genesis.view.widgets.client.RedeemItemDetail',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Genesis.view.widgets.RedeemItem'],
   alias : 'widget.clientredeemitemdetailview',
   config :
   {
      scrollable : undefined,
      cls : 'redeemItemMain viewport',
      layout :
      {
         type : 'vbox',
         pack : 'center',
         align : 'stretch'
      },
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
         },
         {
            align : 'right',
            tag : 'redeem',
            text : 'Redeem'
         },
         {
            align : 'right',
            hidden : true,
            tag : 'done',
            text : 'Done'
         }]
      })],
      listeners : [
      {
         element : 'element',
         delegate : "div.itemPhoto",
         event : "tap",
         fn : "onRedeemItemTap"
      }]
   },
   onRedeemItemTap : function(b, e, eOpts)
   {
      var me = this, viewport = _application.getController(((!merchantMode) ? 'client' : 'server') + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      me.fireEvent('redeemItemTap', null);
   },
   cleanView : function()
   {
      this.callParent(arguments);
   },
   createView : function()
   {
      if (!this.callParent(arguments) && (this.getInnerItems().length > 0))
      {
         //
         // Refresh RedeemItem
         //
         this.getInnerItems()[0].updateItem(this.redeemItem);
         delete this.redeemItem;
         return;
      }

      this.setPreRender([
      {
         flex : 1,
         xtype : 'redeemitem',
         hideMerchant : false,
         data : this.redeemItem
      }]);
      delete this.redeemItem;
   }
});

Ext.define('Genesis.view.widgets.client.PromotionItem',
{
   extend : 'Genesis.view.widgets.client.RedeemItemDetail',
   alias : 'widget.client.promotionalitemview',
   config :
   {
      scrollable : undefined,
      cls : 'redeemItemMain viewport',
      layout : 'fit',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         tag : 'navigationBarTop',
         cls : 'navigationBarTop',
         title : ' ',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            hidden : true,
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'right',
            tag : 'done',
            text : 'Done'
         }]
      }]
   },
   onRedeemItemTap : function(b, e, eOpts)
   {
      me.fireEvent('promoteItemTap', null);
   }
});
