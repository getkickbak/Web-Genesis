Ext.define('Genesis.view.MerchantAccount',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.tab.Bar', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   alias : 'widget.merchantaccountview',
   config :
   {
      title : 'Venue Name',
      changeTitle : false,
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [
      {
         tag : 'menchantPagePanel',
         xtype : 'dataview',
         store :
         {
            model : 'Genesis.model.Venue',
            autoLoad : false
         },
         useComponents : true,
         scrollable : false,
         defaultType : 'merchantaccountptsitem',
         defaultUnit : 'em',
         margin : '0 0 0.8 0'
      },
      // -----------------------------------------------------------------------
      // Prizes won by customers!
      // -----------------------------------------------------------------------
      {
         xtype : 'container',
         tag : 'merchantFeedContainer',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'toolbar',
            cls : 'merchantFeedPanelHdr',
            centered : false,
            items : [
            {
               xtype : 'title',
               title : 'Prizes won this month'
            },
            {
               xtype : 'spacer'
            }]
         },
         {
            tag : 'menchantPrizeWonPanel',
            xtype : 'dataview',
            // @formatter:off
            itemTpl : Ext.create('Ext.XTemplate',
            '<div class="photo">'+
               '<img src="{[this.getPhoto(values)]}"/>'+
            '</div>',
            '<div class="listItemDetailsWrapper">',
               '<div class="itemTitle">{[this.getTitle(values)]}</div>',
               '<div class="itemDesc">{[this.getDesc(values)]}</div>',
            '</div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  if(!values.photo)
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
         }]
      },

      // -----------------------------------------------------------------------
      // What can I get ?
      // -----------------------------------------------------------------------
      {
         xtype : 'container',
         tag : 'merchantFeedContainer',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'toolbar',
            cls : 'merchantFeedPanelHdr',
            centered : false,
            items : [
            {
               xtype : 'title',
               title : 'What can I get?'
            },
            {
               xtype : 'spacer'
            }]
         },
         {
            xtype : 'list',
            scrollable : false,
            ui : 'bottom-round',
            store : 'EligibleRewardsStore',
            emptyText : ' ',
            cls : 'merchantFeedPanel separator',
            // @formatter:off
            itemTpl : Ext.create('Ext.XTemplate',
            '<div class="photo">'+
               '<img src="{[this.getPhoto(values)]}"/>'+
            '</div>',
            '<div class="listItemDetailsWrapper">',
               '<div class="itemTitle">{[this.getTitle(values)]}</div>',
               '<div class="itemDesc">{[this.getDesc(values)]}</div>',
            '</div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  switch (values['reward_type'])
                  {
                     case 'vip' :
                     {
                        values['disclosure'] = false;
                        break;
                     }
                  }
                  if(!values.photo)
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
      },
      // -----------------------------------------------------------------------
      // Merchant Description Panel
      // -----------------------------------------------------------------------
      {
         xtype : 'container',
         tag : 'merchantDescContainer',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'toolbar',
            cls : 'merchantDescPanelHdr',
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
            xtype : 'container',
            cls : 'merchantDescPanel separator',
            tag : 'merchantDescPanel',
            tpl : '{desc}'
         }]
      },
      // -----------------------------------------------------------------------
      // Toolbar
      // -----------------------------------------------------------------------
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         xtype : 'tabbar',
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
            title : 'Rewards'
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
   statics :
   {
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      var vrecord = ((oldActiveItem && oldActiveItem.getMerchant) ? oldActiveItem.getMerchant() : _application.getController('Viewport').getVenue());
      if(vrecord)
      {
         activeItem.getInitialConfig().title = vrecord.get('name');
      }
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
   },
   afterActivate : function(activeItem, oldActiveItem)
   {
   },
   afterDeactivate : function(activeItem, oldActiveItem)
   {
   }
});
