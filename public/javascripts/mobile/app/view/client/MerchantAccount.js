Ext.define('Genesis.view.client.MerchantAccount',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.tab.Bar', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   alias : 'widget.clientmerchantaccountview',
   config :
   {
      tag : 'merchantMain',
      cls : 'merchantMain viewport',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            iconCls : 'maps',
            tag : 'mapBtn'
         }
         /*,{
          align : 'right',
          hidden : true,
          tag : 'checkin',
          iconCls : 'checkin'
          }*/]
      }),
      // -----------------------------------------------------------------------
      // Toolbar
      // -----------------------------------------------------------------------

      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         tag : 'navigationBarBottom',
         xtype : 'tabbar',
         ui : 'light',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         scrollable :
         {
            direction : 'horizontal',
            indicators : false
         },
         defaults :
         {
            iconMask : true,
            iconAlign : 'top'
         },
         items : [
         {
            xtype : 'spacer'
         },
         //
         // Left side Buttons
         //
         {
            iconCls : 'home',
            tag : 'home',
            title : 'Home'
         },
         /*
          {
          //iconCls : 'prizes',
          //icon : '',
          tag : 'prizes',
          iconMask : false,
          badgeCls : 'x-badge round',
          title : 'Prizes'
          },
          */
         {
            iconCls : 'rewards',
            tag : 'rewards',
            title : 'Earn Pts'
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
            iconCls : 'challenges',
            tag : 'challenges',
            title : 'Challenges'
         },
         /*
          //
          // Right side Buttons
          //
          {
          xtype : 'spacer'
          },
          {
          iconCls : 'redeem',
          badgeCls : 'x-badge round',
          iconMask : false,
          tag : 'redemption',
          title : 'Rewards'
          },
          */
         {
            iconCls : 'tocheckedinmerch',
            tag : 'main',
            title : 'Meal Stop'
         },
         /*
          {
          iconCls : 'explore',
          tag : 'browse',
          title : 'Explore'
          }
          */
         {
            iconCls : 'explore',
            tag : 'checkin',
            title : 'Explore'
         },
         {
            xtype : 'spacer'
         }]
      }],
      listeners : [
      {
         element : 'element',
         delegate : "div.badgephoto",
         event : "tap",
         fn : "onBadgeTap"
      },
      {
         element : 'element',
         delegate : "div.prizeswonphoto",
         event : "tap",
         fn : "onJackpotWinnersTap"
      },
      {
         element : 'element',
         delegate : "div.prizesWonPanel div.x-list-disclosure",
         event : "tap",
         fn : "onJackpotWinnersTap"
      }]
   },
   disableAnimation : true,
   loadingText : 'Loading ...',
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function(activeItem)
   {
      if (activeItem.isXType('clientcheckinexploreview', true) || activeItem.isXType('clientmainpageview', true))
      {
         console.debug("Merchant Account Page cleanup");
         this.removeAll(true);
      }
      this.callParent(arguments);
   },
   showView : function()
   {
      this.callParent(arguments);
      this.query('tabbar')[0].show();
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
      var feedContainer = this.query('container[tag=feedContainer]')[0];
      if (feedContainer)
      {
         feedContainer[(Ext.StoreMgr.get('NewsStore').getRange().length > 0) ? 'show' : 'hide']();
      }
   },
   createView : function()
   {
      var me = this;

      if (!me.callParent(arguments))
      {
         return;
      }

      // -----------------------------------------------------------------------
      // Merchant Photos and Customer Points
      // -----------------------------------------------------------------------
      me.getPreRender().push(Ext.create('Ext.dataview.DataView',
      {
         tag : 'tbPanel',
         xtype : 'dataview',
         store : 'MerchantRenderStore',
         useComponents : true,
         scrollable : undefined,
         minHeight : window.innerWidth,
         defaultType : 'merchantaccountptsitem',
         defaultUnit : 'em',
         margin : '0 0 0.7 0'
      }));

      // -----------------------------------------------------------------------
      // What can I get ?
      // -----------------------------------------------------------------------
      if (me.renderFeed)// && (Ext.StoreMgr.get('NewsStore').getCount() > 0))
      {
         me.getPreRender().push(Ext.create('Ext.Container',
         {
            xtype : 'container',
            tag : 'feedContainer',
            layout :
            {
               type : 'vbox',
               align : 'stretch',
               pack : 'start'
            },
            items : [
            {
               xtype : 'dataview',
               scrollable : undefined,
               store : 'NewsStore',
               cls : 'feedPanel',
               tag : 'feedPanel',
               items : [
               {
                  docked : 'top',
                  xtype : 'toolbar',
                  ui : 'dark',
                  cls : 'feedPanelHdr',
                  centered : false,
                  items : [
                  {
                     xtype : 'title',
                     title : 'What\'s going on?'
                  },
                  {
                     xtype : 'spacer'
                  }]
               }],
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="itemWrapper" style="position:relative;{[this.getDisclose(values)]}">',
                  '<div class="photo">'+
                     '<img src="{[this.getIcon(values)]}"/>'+
                  '</div>',
                  '<div class="itemTitle">{[this.getTitle(values)]}</div>',
                  '<div class="date">{[this.getStartDate(values)]}</div>' +
                  '<div class="itemDesc">{[this.getDesc(values)]}</div>',
                  '<div class="promoImage">',
                     '<img src="{[this.getPhoto(values)]}" style="{[this.getWidth()]}"/>'+
                  '</div>',
                  '<img class="promoImageAnchor" src="{[this.getPhoto(values)]}"/>'+
               '</div>',
                // @formatter:on
               {
                  getDisclose : function(values)
                  {
                     switch (values['type'])
                     {
                        case 'vip' :
                        {
                           values['disclosure'] = false;
                           break;
                        }
                     }
                     return ((values['disclosure'] === false) ? 'padding-right:0;' : '');
                  },
                  getIcon : function(values)
                  {
                     return me.self.getPhoto(
                     {
                        value : values['type']
                     });
                  },
                  getPhoto : function(values)
                  {
                     return (!values.photo || !values.photo['thumbnail_large_url']) ? '' : values.photo['thumbnail_large_url'];
                  },
                  getStartDate : function(values)
                  {
                     return ((values['created_date']) ? 'Posted on ' + values['created_date'] : 'No Posted Date');
                  },
                  getTitle : function(values)
                  {
                     return ((values['title']) ? values['title'] : 'Mobile Promotion');
                  },
                  getDesc : function(values)
                  {
                     return values['text'];
                  },
                  getWidth : function()
                  {
                  	var fn = Genesis.fn;
                     var width = fn.calcPxEm(document.body.clientWidth, -1 * 2 * 0.50 * 0.8, 1);
                     return ('width:' + fn.addUnit(fn.calcPx(width, 1)) + ';');
                  }
               }),
               onItemDisclosure : Ext.emptyFn
            }]
         }));
      };

      me.setPreRender(me.getPreRender().concat([
      // -----------------------------------------------------------------------
      // Merchant Description Panel
      // -----------------------------------------------------------------------
      Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'descContainer',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'dataview',
            store : 'MerchantRenderStore',
            scrollable : undefined,
            cls : 'descPanel',
            tag : 'descPanel',
            items : [
            {
               docked : 'top',
               xtype : 'toolbar',
               cls : 'descPanelHdr',
               ui : 'light',
               centered : false,
               items : [
               {
                  xtype : 'title',
                  title : 'About Us'
               },
               {
                  xtype : 'spacer'
               }]
            }],
            itemTpl : Ext.create('Ext.XTemplate', '{[this.getDesc(values)]}',
            {
               getDesc : function(values)
               {
                  return values['description'];
               }
            })
         }]
      })]));
   },
   onBadgeTap : function(b, e, eOpts)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      this.fireEvent('badgeTap');
   },
   onJackpotWinnersTap : function(b, e, eOpts)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      this.fireEvent('jackpotWinnersTap');
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         if (!type.value)
         {
            return Genesis.constants.getIconPath('miscicons', 'pushnotification');
         }
         else
         {
         }
      }
   }
});
