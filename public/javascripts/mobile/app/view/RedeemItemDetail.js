Ext.define('Genesis.view.RedeemItemDetail',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Ext.Carousel', 'Genesis.view.widgets.RedeemItem'],
   alias : 'widget.redeemitemdetailview',
   config :
   {
      scrollable : undefined,
      cls : 'redeemItemMain viewport',
      layout : 'fit',
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
            align : 'left',
            tag : 'back',
            //ui : 'back',
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
      })]
   },
   cleanView : function()
   {
      this.callParent(arguments);
   },
   createView : function()
   {
      this.callParent(arguments);
   },
   showView : function()
   {
      var carousel = this.query('carousel')[0];
      if (carousel)
      {
         carousel.setActiveItem(0);
      }
      this.getInnerItems()[0].setVisibility(true);

      this.callParent(arguments);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'earn_points':
               break;
            default :
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               break;
         }
         return photo_url;
      }
   }
});

Ext.define('Genesis.view.ShowRedeemItemDetail',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Genesis.view.widgets.RedeemItem'],
   alias : 'widget.showredeemitemdetailview',
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
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         tag : 'navigationBarTop',
         cls : 'navigationBarTop',
         title : 'Prizes',
         defaults :
         {
            iconMask : true
         },
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
      },
      {
         docked : 'bottom',
         hidden : true,
         xtype : 'button',
         margin : '0 0.7 0.8 0.7',
         defaultUnit : 'em',
         tag : 'refresh',
         text : 'Authorize another!',
         ui : 'orange-large'
      },
      {
         docked : 'bottom',
         hidden : true,
         margin : '0 0.7 0.8 0.7',
         defaultUnit : 'em',
         xtype : 'button',
         cls : 'separator',
         tag : 'merchantRedeem',
         text : 'Redeem!',
         ui : 'orange-large'
      }]
   },
   cleanView : function()
   {
      //this.removeAll(true);
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
         data : this.redeemItem
      }]);
      delete this.redeemItem;
   }
});

Ext.define('Genesis.view.PromotionItem',
{
   extend : 'Genesis.view.ShowRedeemItemDetail',
   alias : 'widget.promotionalitemview',
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
   }
});
