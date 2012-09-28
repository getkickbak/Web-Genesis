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
      switch (this.config.tag)
      {
         case 'userPrizes' :
         {
            break;
         }
         case 'merchantPrizes' :
         {
            this.removeAll(true);
            break;
         }
      }
   },
   createView : function()
   {
      /*
       if (!this.callParent(arguments))
       {
       return;
       }
       */

      switch (this.config.tag)
      {
         case 'userPrizes' :
         {
            this.onUserCreateView();
            break;
         }
         case 'merchantPrizes' :
         {
            this.onMerchantCreateView();
            break;
         }
      }
   },
   onUserCreateView : function()
   {
      var view = this;
      var prizes = Ext.StoreMgr.get('PrizeStore').getRange();

      if (prizes.length == 0)
      {
         this.getPreRender().push(Ext.create('Ext.Component',
         {
            tag : 'rewardPanel',
            cls : 'noprizes',
            xtype : 'component',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         }));
         console.log("UserPrize View - No Prizes found.");
      }
      else
      {
         // Either a carousel or a empty view
         var container = view.getInnerItems()[0];
         var items = [];
         if (container && container.isXType('carousel', true))
         {
            //
            // User Prizes have been loaded previously, no need to refresh!
            //
            console.log("UserPrize View - do not need to be updated.");
         }
         else
         {
            if (!container)
            {
               container = Ext.create('Ext.Carousel',
               {
                  xtype : 'carousel',
                  scrollable : undefined
               })
               this.getPreRender().push(container);
            }
            for (var i = 0; i < prizes.length; i++)
            {
               items.push(Ext.create('Ext.dataview.DataView',
               {
                  tag : 'rewardPanel',
                  xtype : 'dataview',
                  store :
                  {
                     model : 'Genesis.model.EarnPrize',
                     autoLoad : false,
                     data : prizes[i]
                  },
                  maxItemCache : 0,
                  useComponents : true,
                  scrollable : false,
                  defaultType : 'rewarditem',
                  defaultUnit : 'em',
                  margin : '0 0 0.8 0'
               }));
            }
            container.add(items);

            console.log("UserPrize View - Found " + prizes.length + " Prizes needed to update.");
         }
      }
   },
   onMerchantCreateView : function()
   {
      var view = this;
      var viewport = _application.getController('Viewport');
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var container;
      var prizesList = [];

      //
      // List all the prizes won by the Customer
      //
      var prizes = Ext.StoreMgr.get('PrizeStore').getRange();
      if (prizes.length > 0)
      {
         for (var i = 0; i < prizes.length; i++)
         {
            //
            // Only show prizes that matches the currently loaded Merchant Data
            //
            if (prizes[i].getMerchant().getId() != merchantId)
            {
               continue;
            }

            prizesList.push(prizes[i]);
         }
      }

      if (prizesList.length == 0)
      {
         //view.removeAll();
         this.getPreRender().push(Ext.create('Ext.Component',
         {
            tag : 'rewardPanel',
            cls : 'noprizes',
            xtype : 'component',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         }));
         console.log("MerchantPrize View - No Prizes found.");
      }
      else
      {
         // Either a carousel or a empty view
         var container = view.getInnerItems()[0];
         if (!container)
         {
            this.getPreRender().push( container = Ext.create('Ext.Carousel',
            {
               xtype : 'carousel',
               scrollable : undefined
            }));
         }
         if ((container && container.isXType('carousel', true) && container.query('dataview')[0] &&
         // First item in the carousel
         container.query('dataview')[0].getStore().first().getMerchant().getId() == merchantId))
         {
            //
            // Do Not need to change anything if there are already loaded from before
            //
            console.log("MerchantPrize View - do not need to be updated.");
         }
         else
         {
            //
            // Create Prizes Screen from scratch
            //
            //container = view.getInnerItems()[0];
            var items = [];
            for (var i = 0; i < prizesList.length; i++)
            {
               items.push(Ext.create('Ext.dataview.DataView',
               {
                  tag : 'rewardPanel',
                  xtype : 'dataview',
                  store :
                  {
                     model : 'Genesis.model.EarnPrize',
                     autoLoad : false,
                     data : prizesList[i]
                  },
                  maxItemCache : 0,
                  useComponents : true,
                  scrollable : false,
                  defaultType : 'rewarditem',
                  defaultUnit : 'em',
                  margin : '0 0 0.8 0'
               }));
            }
            container.add(items);
            container.setActiveItem(0);
            container.show();

            console.log("MerchantPrize View - Found " + prizesList.length + " Prizes needed to update.");
         }
      }
   },
   showView : function()
   {
      this.callParent(arguments);

      var carousel = this.query('carousel')[0];
      if (carousel)
      {
         carousel.setActiveItem(0);
      }
      this.getInnerItems()[0].setVisibility(true);
   },
   statics :
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
      layout : 'fit',
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
         xtype : 'button',
         margin : '0.8 0.7',
         defaultUnit : 'em',
         tag : 'refresh',
         text : 'Refresh',
         ui : 'orange-large'
      },
      {
         docked : 'bottom',
         margin : '0.8 0.7',
         defaultUnit : 'em',
         xtype : 'button',
         cls : 'separator',
         tag : 'verify',
         text : 'Verified!',
         ui : 'orange-large'
      }]
   },
   cleanView : function()
   {
      //this.removeAll(true);
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         //
         // Refresh RedeemItem
         //
         this.query('dataview[tag=rewardPanel]')[0].getStore().setData(this.redeemItem);
         delete this.redeemItem;
         return;
      }

      this.getPreRender().push(Ext.create('Ext.dataview.DataView',
      {
         tag : 'rewardPanel',
         xtype : 'dataview',
         store :
         {
            model : 'Genesis.model.CustomerReward',
            autoLoad : false,
            data : this.redeemItem
         },
         maxItemCache : 0,
         useComponents : true,
         scrollable : false,
         defaultType : 'redeemitem',
         defaultUnit : 'em',
         margin : '0 0 0.8 0'
      }));
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
