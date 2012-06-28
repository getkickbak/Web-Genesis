Ext.define('Genesis.view.MainPage',
{
   extend : 'Ext.Carousel',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate'],
   alias : 'widget.mainpageview',
   config :
   {
      cls : 'viewport',
      preRender : null,
      direction : 'horizontal',
      items : ( function()
         {
            var items = [
            {
               xtype : 'titlebar',
               docked : 'top',
               cls : 'navigationBarTop kbTitle',
               title : ' ',
               defaults :
               {
                  iconMask : true
               },
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
            }];
            if (!merchantMode)
            {
               items.push(
               {
                  docked : 'bottom',
                  cls : 'navigationBarBottom',
                  xtype : 'tabbar',
                  ui : 'light',
                  layout :
                  {
                     pack : 'justify',
                     align : 'stretch'
                  },
                  /*
                   scrollable :
                   {
                   direction : 'horizontal',
                   indicators : false
                   },
                   */
                  defaults :
                  {
                     flex : 1,
                     iconMask : true,
                     iconAlign : 'left'
                  },
                  items : [
                  {
                     iconCls : 'rewards',
                     tag : 'rewardsSC',
                     title : 'Earn Points'
                  },
                  //
                  // Middle Button
                  //
                  /*
                   {
                   xtype : 'spacer'
                   },
                   */
                  {
                     iconCls : 'checkin',
                     tag : 'checkInNow',
                     title : 'CheckIn Now!'
                  },
                  //
                  // Right side Buttons
                  //
                  /*
                   {
                   xtype : 'spacer'
                   },
                   */
                  {
                     iconCls : 'redeem',
                     tag : 'redemptionSC',
                     title : 'Redeem'
                  }]
               });
            }
            return items;
         }())
   },
   disableAnimation : (!merchantMode) ? true : false,
   initialize : function()
   {
      this.setPreRender([]);
      this.callParent(arguments);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      this.removeAll(true);
   },
   removeAll : function(destroy, everything)
   {
      var rc = this.callParent(arguments);
      this.setPreRender([]);

      return rc;
   },
   createView : function()
   {
      if (!Genesis.view.ViewBase.prototype.createView.apply(this, arguments))
      {
         return;
      }

      var carousel = this;
      var app = _application;
      var viewport = app.getController('Viewport');
      var vport = viewport.getViewport();
      var show = viewport.getCheckinInfo().venue != null;
      var items = Ext.StoreMgr.get('MainPageStore').getRange();
      var list = Ext.Array.clone(items);

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
         for (var i = 0; i < Math.ceil(items.length / 6); i++)
         {
            this.getPreRender().push(Ext.create('Ext.dataview.DataView',
            {
               xtype : 'dataview',
               cls : 'mainMenuSelections',
               scrollable : false,
               deferInitialRefresh : false,
               store :
               {
                  model : 'Genesis.model.frontend.MainPage',
                  data : Ext.Array.pluck(items.slice(i * 6, ((i + 1) * 6)), 'data')
               },
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="mainPageItemWrapper x-hasbadge">',
                  '{[this.getPrizeCount(values)]}',
                  '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>',
                  '<div class="photoName">{name}</div>',
               '</div>',
               // @formatter:on
               {
                  getType : function()
                  {
                     return values['pageCntlr'];
                  },
                  getPrizeCount : function(values)
                  {
                     var count = 0;
                     var type = values['pageCntlr'];
                     var pstore = Ext.StoreMgr.get('MerchantPrizeStore');
                     if (pstore)
                     {
                        count = pstore.getCount();
                     }
                     return ((type == 'Prizes') ? //
                     '<span data="' + type + '" ' + //
                     'class="x-badge round ' + ((count > 0) ? '' : 'x-item-hidden') + '">' + //
                     count + '</span>' : '');
                  },
                  getPhoto : function(photoURL)
                  {
                     return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
                  }
               }),
               autoScroll : true
            }));
         }
         console.log("MainPage Icons Refreshed.");
      }
      else
      {
         //
         // Refresh All Badge Counts
         //
         var pstore = Ext.StoreMgr.get('MerchantPrizeStore');
         if (pstore)
         {
            var count = pstore.getCount();
            var dom = Ext.DomQuery.select('span[data=Prizes]',carousel.query('dataview')[0].element.dom)[0];
            if (count > 0)
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
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      if (this.getInnerItems().length == 0)
      {
         this.add(this.getPreRender());
      }

      var carousel = this;
      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
   }
});
