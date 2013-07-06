Ext.define('Genesis.view.client.MainPage',
{
   extend : 'Genesis.view.MainPageBase',
   alias : 'widget.clientmainpageview',
   config :
   {
      items : ( function()
         {
            var items = [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
            {
               xtype : 'titlebar',
               cls : 'navigationBarTop kbTitle',
               items : [
               {
                  align : 'right',
                  tag : 'info',
                  iconCls : 'info',
                  destroy : function()
                  {
                     this.actions.destroy();
                     this.callParent(arguments);
                  },
                  handler : function()
                  {
                     if (!this.actions)
                     {
                        this.actions = Ext.create('Ext.ActionSheet',
                        {
                           defaultUnit : 'em',
                           padding : '1.0',
                           hideOnMaskTap : false,
                           defaults :
                           {
                              xtype : 'button',
                              defaultUnit : 'em'
                           },
                           items : [
                           {
                              margin : '0 0 0.5 0',
                              text : 'Logout',
                              tag : 'logout'
                           },
                           {
                              margin : '0.5 0 0 0',
                              text : 'Cancel',
                              ui : 'cancel',
                              scope : this,
                              handler : function()
                              {
                                 this.actions.hide();
                              }
                           }]
                        });
                        Ext.Viewport.add(this.actions);
                     }
                     this.actions.show();
                  }
               }]
            }),
            {
               xtype : 'carousel',
               direction : 'horizontal'
            }];
            return items;
         }())
   },
   disableAnimation : true,
   isEligible : function(values, xindex)
   {
      var eligibleRewards = (values['pageCntlr'] == 'client' + '.Redemptions');
      var eligiblePrizes = (values['pageCntlr'] == 'client' + '.Prizes');
      var showIcon = false;

      values.index = xindex - 1;
      if (eligibleRewards || eligiblePrizes)
      {
         var customers = Ext.StoreMgr.get('CustomerStore').getRange();
         for (var i = 0; i < customers.length; i++)
         {
            var customer = customers[i];
            if (eligiblePrizes)
            {
               if (customer.get('eligible_for_prize'))
               {
                  showIcon = true;
                  break;
               }
            }
            else if (eligibleRewards)
            {
               if (customer.get('eligible_for_reward'))
               {
                  showIcon = true;
                  break;
               }
            }
         }
      }
      return ((eligibleRewards || eligiblePrizes) ? //
      '<span data="' + values['pageCntlr'] + '" ' + //
      'class="x-badge round ' + ((showIcon) ? '' : 'x-item-hidden') + '">' + //
      '✔' + '</span>' : '');
   },
   createView : function()
   {
      var me = this;
      var carousel = this.query('carousel')[0];
      var app = _application;
      var viewport = app.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var vport = viewport.getViewport();
      var show = (!merchantMode) ? viewport.getCheckinInfo().venue != null : false;
      var items = Ext.StoreMgr.get('MainPageStore').getRange();
      var list = Ext.Array.clone(items);

      me.calcCarouselSize();

      if (!carousel._listitems)
      {
         carousel._listitems = [];
      }

      if (!show)
      {
         Ext.Array.forEach(list, function(item, index, all)
         {
            switch (item.get('hide'))
            {
               case 'true' :
               {
                  Ext.Array.remove(items, item);
                  break;
               }
            }
         });
      }//
      // Only update if changes were made
      //
      if ((Ext.Array.difference(items, carousel._listitems).length > 0) || //
      (items.length != carousel._listitems.length))
      {
      }
      else
      {
         //
         // Refresh All Badges
         //
         var cstore = Ext.StoreMgr.get('CustomerStore');
         if (cstore)
         {
            var customers = cstore.getRange();
            var eligibleReward = false;
            var eligiblePrize = false;
            for (var i = 0; i < customers.length; i++)
            {
               var customer = customers[i];
               if (customer.get('eligible_for_reward'))
               {
                  eligibleReward = true;
                  break;
               }
               if (customer.get('eligible_for_prize'))
               {
                  eligiblePrize = true;
                  break;
               }
            }
            if (carousel.getInnerItems().length > 0)
            {
               var dom = Ext.DomQuery.select('span[data=client'+'.Redemptions]',carousel.element.dom)[0];
               if (eligibleReward)
               {
                  dom.innerHTML = count;
                  Ext.fly(dom).removeCls("x-item-hidden");
               }
               else
               {
                  if (!dom.className.match(/x-item-hidden/))
                  {
                     Ext.fly(dom).addCls("x-item-hidden");
                  }
               }

               dom = Ext.DomQuery.select('span[data=client'+'.Prizes]',carousel.element.dom)[0];
               if (eligiblePrize)
               {
                  dom.innerHTML = count;
                  Ext.fly(dom).removeCls("x-item-hidden");
               }
               else
               {
                  if (!dom.className.match(/x-item-hidden/))
                  {
                     Ext.fly(dom).addCls("x-item-hidden");
                  }
               }
            }
         }
         console.debug("MainPage Icons Not changed.");
      }

      this.callParent(arguments);
   }
});
