Ext.define('Genesis.view.MerchantAccount',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.tab.Bar', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   alias : 'widget.merchantaccountview',
   config :
   {
      tag : 'merchantMain',
      cls : 'merchantMain',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Venue Name',
         defaults :
         {
            iconMask : true
         },
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
      },
      {
         tag : 'tbPanel',
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
         tag : 'prizesWonPanel',
         xtype : 'component',
         cls : 'prizesWonPanel',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="prizeswonphoto">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
            '<div class="itemDesc">{[this.getDesc(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            // Updated Automatically when the Customer\'s metadata is updated
            getTitle : function(values)
            {
               return 'Prizes won this month';
            },
            // Updated Automatically when the Customer\'s metadata is updated
            getDesc : function(values)
            {
               return values['winners_count'] + ' Winners!';
            }
         }),
      },
      // -----------------------------------------------------------------------
      // What can I get ?
      // -----------------------------------------------------------------------
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
            cls : 'feedPanel separator',
            // @formatter:off
            itemTpl : Ext.create('Ext.XTemplate',
            '<div class="photo">'+
               '<img src="{[this.getPhoto(values)]}"/>'+
            '</div>',
            '<div class="listItemDetailsWrapper" style="{[this.getDisclose(values)]}">',
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
            xtype : 'container',
            cls : 'descPanel separator',
            tag : 'descPanel',
            tpl : Ext.create('Ext.XTemplate', '{[this.getDesc(values)]}',
            {
               getDesc : function(values)
               {
                  return values.get('description');
               }
            })
         }]
      },
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
   statics :
   {
   }
});
