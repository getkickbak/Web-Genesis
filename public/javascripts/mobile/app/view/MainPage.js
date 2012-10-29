Ext.define('Genesis.view.MainPage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.data.Store', 'Ext.Carousel', 'Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.mainpageview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      listeners : [
      {
         element : 'element',
         delegate : 'div.itemWrapper',
         event : 'tap',
         fn : "onItemTap"
      }],
      scrollable : undefined,
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
                           padding : '1em',
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
   disableAnimation : (!merchantMode) ? true : true,
   initialize : function()
   {
      this.setPreRender([]);
      this.callParent(arguments);
   },
   onItemTap : function(e, target, delegate, eOpts)
   {
      var data = Ext.create('Genesis.model.frontend.MainPage', Ext.decode(decodeURIComponent(e.delegatedTarget.getAttribute('data'))));
      _application.getController('MainPage').fireEvent('itemTap', data);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      var carousel = this.query('carousel')[0];
      carousel.removeAll(true);
      this.callParent(arguments);
   },
   createView : function()
   {
      var carousel = this.query('carousel')[0];
      var app = _application;
      var viewport = app.getController('Viewport');
      var vport = viewport.getViewport();
      var show = viewport.getCheckinInfo().venue != null;
      var items = Ext.StoreMgr.get('MainPageStore').getRange();
      var list = Ext.Array.clone(items);
      var itemPerPage = 6;

      if (Ext.os.is('iOS'))
      {
         if (Ext.os.is.iPhone5 || Ext.os.is.iPod5)
         {
            itemPerPage = 8;
         }
      }
      else
      if (Ext.os.is('Android') && (window.screen.height > 480))
      {
         if (window.screen.height <= 568)
         {
            itemPerPage = 8;
         }
         else
         {
            itemPerPage = 10;
         }
      }

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
      }
      //
      // Only update if changes were made
      //
      if ((Ext.Array.difference(items, carousel._listitems).length > 0) || //
      (items.length != carousel._listitems.length))
      {
         carousel._listitems = items;
         carousel.removeAll(true);
         for (var i = 0; i < Math.ceil(items.length / itemPerPage); i++)
         {
            carousel.add(
            {
               xtype : 'component',
               cls : 'mainMenuSelections',
               tag : 'mainMenuSelections',
               scrollable : undefined,
               data : Ext.Array.pluck(items.slice(i * itemPerPage, ((i + 1) * itemPerPage)), 'data'),
               tpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<tpl for=".">',
                  '<div class="itemWrapper x-hasbadge" data="{[this.encodeData(values)]}">',
                     '{[this.isEligible(values)]}',
                     '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>',
                     '<div class="photoName">{name}</div>',
                  '</div>',
               '</tpl>',
               // @formatter:on
               {
                  encodeData : function(values)
                  {
                     return encodeURIComponent(Ext.encode(values));
                  },
                  getType : function()
                  {
                     return values['pageCntlr'];
                  },
                  isEligible : function(values, xindex)
                  {
                     var eligibleRewards = (values['pageCntlr'] == 'client.Redemptions');
                     var eligiblePrizes = (values['pageCntlr'] == 'client.Prizes');
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
                           else
                           if (eligibleRewards)
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
                  getPhoto : function(photoURL)
                  {
                     return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
                  }
               })
            });
         }
         console.log("MainPage Icons Refreshed.");
      }
      else
      {
         //
         // Refresh All Badges
         //
         var customers = Ext.StoreMgr.get('CustomerStore').getRange();
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
            var dom = Ext.DomQuery.select('span[data=client.Redemptions]',carousel.element.dom)[0];
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

            dom = Ext.DomQuery.select('span[data=client.Prizes]',carousel.element.dom)[0];
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
         console.log("MainPage Icons Not changed.");
      }
      delete carousel._listitems;

      this.callParent(arguments);
   },
   showView : function()
   {
      var carousel = this.query('carousel')[0];
      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
      this.callParent(arguments);
   }
});
