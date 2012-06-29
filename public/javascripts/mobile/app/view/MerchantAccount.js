Ext.define('Genesis.view.MerchantAccount',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.tab.Bar', 'Ext.plugin.ListPaging', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   alias : 'widget.merchantaccountview',
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
         },
         {
            align : 'right',
            hidden : true,
            tag : 'checkin',
            iconCls : 'checkin'
         }]
      }),
      // -----------------------------------------------------------------------
      // Toolbar
      // -----------------------------------------------------------------------

      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
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
         //
         // Left side Buttons
         //
         {
            iconCls : 'home',
            tag : 'home',
            title : 'Home'
         },
         {
            iconCls : 'prizes',
            tag : 'prizes',
            badgeCls : 'x-badge round',
            title : 'Prizes'
         },
         {
            iconCls : 'rewards',
            tag : 'rewards',
            title : 'Earn Pts'
         },
         //
         // Middle Button
         //
         {
            xtype : 'spacer'
         },
         {
            iconCls : 'challenges',
            tag : 'challenges',
            title : 'Challenges'
         },
         //
         // Right side Buttons
         //
         {
            xtype : 'spacer'
         },
         {
            iconCls : 'redeem',
            tag : 'redemption',
            title : 'Redeem'
         },
         {
            iconCls : 'tocheckedinmerch',
            tag : 'main',
            title : 'Main Menu'
         },
         {
            iconCls : 'explore',
            tag : 'browse',
            title : 'Explore'
         }]
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
   cleanView : function()
   {
      //this.removeAll(true);
   },
   showView : function()
   {
      this.callParent(arguments);

      this.query('tabbar')[0].show();
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
      //Ext.StoreMgr.get('EligibleRewardsStore').load();
      var feedContainer = this.query('container[tag=feedContainer]')[0];
      if (feedContainer)
      {
         feedContainer[(Ext.StoreMgr.get('EligibleRewardsStore').getRange().length > 0) ? 'show' : 'hide']();
      }
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      // -----------------------------------------------------------------------
      // Merchant Photos and Customer Points
      // -----------------------------------------------------------------------
      this.getPreRender().push(Ext.create('Ext.dataview.DataView',
      {
         tag : 'tbPanel',
         xtype : 'dataview',
         store : 'MerchantRenderStore',
         useComponents : true,
         scrollable : false,
         defaultType : 'merchantaccountptsitem',
         defaultUnit : 'em',
         margin : '0 0 0.8 0'
      }));

      // -----------------------------------------------------------------------
      // What can I get ?
      // -----------------------------------------------------------------------
      if (this.renderFeed)
      {
         this.getPreRender().push(Ext.create('Ext.Container',
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
            },
            {
               xtype : 'dataview',
               scrollable : undefined,
               store : 'EligibleRewardsStore',
               cls : 'feedPanel',
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="itemWrapper" style="{[this.getDisclose(values)]}">',
                  '<div class="photo">'+
                     '<img src="{[this.getPhoto(values)]}"/>'+
                  '</div>',
                  '<div class="itemTitle">{[this.getTitle(values)]}</div>',
                  '<div class="itemDesc">{[this.getDesc(values)]}</div>',
               '</div>',
                // @formatter:on
               {
                  getDisclose : function(values)
                  {
                     switch (values['reward_type'])
                     {
                        case 'vip' :
                        {
                           values['disclosure'] = false;
                           break;
                        }
                     }
                     return ((values['disclosure'] === false) ? 'padding-right:0;' : '');
                  },
                  getPhoto : function(values)
                  {
                     if (!values.photo)
                     {
                        return Genesis.view.client.Rewards.getPhoto(
                        {
                           value : values['reward_type']
                        });
                     }
                     return values.photo.url;
                  },
                  getTitle : function(values)
                  {
                     return values['reward_title'];
                  },
                  getDesc : function(values)
                  {
                     return values['reward_text'];
                  }
               }),
               onItemDisclosure : Ext.emptyFn
            }]
         }));
      };

      this.setPreRender(this.getPreRender().concat([
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
         },
         {
            xtype : 'dataview',
            store : 'MerchantRenderStore',
            scrollable : undefined,
            cls : 'descPanel separator',
            tag : 'descPanel',
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
   statics :
   {
   }
});
