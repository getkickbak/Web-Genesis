Ext.define('Genesis.view.Prizes',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Ext.Carousel', 'Genesis.view.widgets.RewardItem'],
   alias : 'widget.prizesview',
   config :
   {
      scrollable : undefined,
      fullscreen : true,
      cls : 'prizesMain',
      layout : 'card',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
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
            align : 'left',
            tag : 'back',
            ui : 'back',
            text : 'Back'
         },
         {
            align : 'right',
            tag : 'redeem',
            text : 'Redeem'
         }]
      }]
   },
   showView : function()
   {
      switch (this.config.tag)
      {
         case 'userPrizes' :
         {
            this.onUserShowView();
            break;
         }
         case 'merchantPrizes' :
         {
            this.onMerchantShowView();
            break;
         }
      }
   },
   onUserShowView : function()
   {
      var view = this;
      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();

      if(prizes.length == 0)
      {
         view.removeAll();
         view.add(
         {
            tag : 'rewardPanel',
            cls : 'noprizes',
            xtype : 'component',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         });
         console.log("UserPrize View - No Prizes found.");
      }
      else
      {
         // Either a carousel or a empty view
         var container = view.getInnerItems()[0];
         if(container && container.isXType('carousel', true))
         {
            //
            // User Prizes have been loaded previously, no need to refresh!
            //
            console.log("UserPrize View - do not need to be updated.");
         }
         else
         {
            view.removeAll();

            var items = [];
            container = view.getInnerItems()[0];
            if(!container)
            {
               this.add(
               {
                  xtype : 'carousel',
                  scrollable : undefined,
                  masked :
                  {
                     xtype : 'loadmask',
                     message : 'Loading ...'
                  }
               });
               container = view.getInnerItems()[0];
            }
            for(var i = 0; i < prizes.length; i++)
            {
               items.push(
               {
                  tag : 'rewardPanel',
                  xtype : 'dataview',
                  store :
                  {
                     model : 'Genesis.model.EarnPrize',
                     autoLoad : false,
                     data : prizes[i]
                  },
                  useComponents : true,
                  scrollable : false,
                  defaultType : 'rewarditem',
                  defaultUnit : 'em',
                  margin : '0 0 0.8 0'
               });
            }
            container.add(items);
            container.setMasked(false);

            console.log("UserPrize View - Found " + prizes.length + " Prizes needed to update.");
         }
      }
   },
   onMerchantShowView : function()
   {
      var view = this;
      var viewport = _application.getController('Viewport');
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var container;
      var prizesList = [];

      //
      // List all the prizes won by the Customer
      //
      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      if(prizes.length > 0)
      {
         for(var i = 0; i < prizes.length; i++)
         {
            //
            // Only show prizes that matches the currently loaded Merchant Data
            //
            if(prizes[i].getMerchant().getId() != merchantId)
            {
               continue;
            }

            prizesList.push(prizes[i]);
         }
      }

      if(prizesList.length == 0)
      {
         view.removeAll();
         view.add(
         {
            tag : 'rewardPanel',
            cls : 'noprizes',
            xtype : 'component',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         });
         console.log("MerchantPrize View - No Prizes found.");
      }
      else
      {
         // Either a carousel or a empty view
         var container = view.getInnerItems()[0];
         if(!container)
         {
            this.add(
            {
               xtype : 'carousel',
               scrollable : undefined,
               masked :
               {
                  xtype : 'loadmask',
                  message : 'Loading ...'
               }
            });
            container = view.getInnerItems()[0];
         }
         if((container && container.isXType('carousel', true) && container.query('dataview')[0] &&
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
            container = view.getInnerItems()[0];
            var items = [];
            for(var i = 0; i < prizesList.length; i++)
            {
               items.push(
               {
                  tag : 'rewardPanel',
                  xtype : 'dataview',
                  store :
                  {
                     model : 'Genesis.model.EarnPrize',
                     autoLoad : false,
                     data : prizesList[i]
                  },
                  useComponents : true,
                  scrollable : false,
                  defaultType : 'rewarditem',
                  defaultUnit : 'em',
                  margin : '0 0 0.8 0'
               });
            }
            container.add(items);
            container.setMasked(false);

            console.log("MerchantPrize View - Found " + prizesList.length + " Prizes needed to update.");
         }
      }
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

Ext.define('Genesis.view.ShowPrize',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Ext.Carousel', 'Genesis.view.widgets.RewardItem'],
   alias : 'widget.showprizeview',
   config :
   {
      scrollable : false,
      fullscreen : true,
      cls : 'prizesMain',
      layout : 'fit',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
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
            align : 'left',
            tag : 'back',
            ui : 'back',
            text : 'Back'
         },
         {
            align : 'right',
            tag : 'redeem',
            text : 'Redeem'
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
   createView : function()
   {
      this.getPreRender().push(Ext.create('Ext.dataview.DataView',
      {
         tag : 'rewardPanel',
         xtype : 'dataview',
         store :
         {
            model : 'Genesis.model.EarnPrize',
            autoLoad : false,
            data : this.showPrize
         },
         useComponents : true,
         scrollable : false,
         defaultType : 'rewarditem',
         defaultUnit : 'em',
         margin : '0 0 0.8 0'
      }));
      
      delete this.showPrize;
   }
});
