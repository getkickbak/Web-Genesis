Ext.define('Genesis.view.widgets.client.RedeemItemDetail',
{
   extend : 'Genesis.view.widgets.ItemDetail',
   requires : ['Ext.XTemplate', 'Genesis.view.widgets.RedeemItem'],
   alias : 'widget.clientredeemitemdetailview',
   config :
   {
      itemXType : 'redeemitem',
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
      var me = this, viewport = _application.getController('client' + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      me.fireEvent('redeemItemTap', null);
   }
});

Ext.define('Genesis.view.widgets.client.PromotionItem',
{
   extend : 'Genesis.view.widgets.client.RedeemItemDetail',
   alias : 'widget.clientpromotionalitemview',
   config :
   {
   },
   constructor : function(config)
   {
      var me = this;
      config = Ext.apply(
      {
         layout : 'fit',
         items : [
         {
            xtype : 'titlebar',
            docked : 'top',
            tag : 'navigationBarTop',
            cls : 'navigationBarTop',
            height : ((!(Genesis.fn.isNative() && Ext.os.is('iOS') && Ext.os.version.isGreaterThanOrEqual('7.0')) ? '2.6' : '3.7') + 'em'),
            style : (!(Genesis.fn.isNative() && Ext.os.is('iOS') && Ext.os.version.isGreaterThanOrEqual('7.0')) ? '' :
            {
               'padding-top' : '20px'
            }),
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
      }, config ||
      {
      });
   },
   onRedeemItemTap : function(b, e, eOpts)
   {
      var me = this, viewport = _application.getController('client' + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      me.fireEvent('promoteItemTap', null);
   }
});
