Ext.define('Genesis.view.MerchantAccount',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.tab.Bar', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   alias : 'widget.merchantaccountview',
   config :
   {
      tag : 'merchantMain',
      cls : 'merchantMain',
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
         tpl : Ext.create('Ext.XTemplate', '<div class="prizeswonphoto">{[this.getTitle(values)]}</div>',
         {
            getTitle : function(values)
            {
               return values['winners_count'] + ' Prizes won this month';
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
            ui:'light',
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
      var vrecord = _application.getController('Viewport').getVenue();
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
