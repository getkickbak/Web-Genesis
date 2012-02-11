Ext.define('Genesis.view.MerchantAccount',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.tab.Bar', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   alias : 'widget.merchantaccountview',
   config :
   {
      title : 'Venue Name',
      changeTitle : true,
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [
      // -----------------------------------------------------------------------
      // Customer Stats
      // -----------------------------------------------------------------------
      {
         xtype : 'container',
         cls : 'merchantStatsPanel separator',
         layout : 'fit',
         defaults :
         {
            scrollable : false,
            cls : 'merchantStats'
         },
         items : [
         {
            docked : 'left',
            xtype : 'component',
            tag : 'photo',
            tpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{photoUrl}"/></div>')
         },
         {
            docked : 'top',
            xtype : 'dataview',
            cls : 'ptsEarnPanel',
            useComponents : true,
            scrollable : false,
            defaultType : 'merchantaccountptsitem',
            store : 'CustomerStore'
         },
         {
            xtype : 'formpanel',
            defaults :
            {
               xtype : 'textfield',
               readOnly : true,
               labelAlign : 'left',
               labelWidth : '75%'
            },
            items : [
            {
               label : 'Last Check-in',
               name : 'lastCheckin',
               value : new Date()
            },
            {
               label : 'Registered Mobile Members',
               name : 'regMembers',
               value : 0
            },
            {
               label : 'Total Points Earn this year',
               name : 'ptsEarn',
               value : 0
            },
            {
               label : 'Total Points Spent this year',
               name : 'ptsSpent',
               value : 0
            }]
         }]
      },
      // -----------------------------------------------------------------------
      // Rewards / Redemption Button
      // -----------------------------------------------------------------------
      /*
      {
      xtype : 'button',
      ui : 'yellow-large',
      cls : 'separator',
      text : 'Earn & Redeem Rewards'
      },
      */
      // -----------------------------------------------------------------------
      // Newsfeed Panel
      // -----------------------------------------------------------------------
      {
         xtype : 'toolbar',
         cls : 'ptsMerchantFeedPanelHdr',
         centered : false,
         items : [
         {
            xtype : 'title',
            title : 'Latest News'
         },
         {
            xtype : 'spacer'
         }]
      },
      {
         xtype : 'list',
         scrollable : false,
         store : 'EligibleRewardsStore',
         cls : 'ptsMerchantFeedPanel separator',
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>', '<div class="listItemDetailsWrapper">', '<div class="itemDesc wrap">{[this.getDesc(values)]}</div>', '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               if(!values.photo_url)
               {
                  return Genesis.view.MerchantAccount.getPhoto(values.type);
               }
               else
               {
                  return values.photo_url;
               }
            },
            getDesc : function(values)
            {
               // Not eligible for reward yet, don't show disclosure button
               if(values.points_difference > 0)
               {
                  values.disclosure = false;
               }
               return values.reward_title;
            }
         }),
         onItemDisclosure : Ext.emptyFn
      },
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         xtype : 'tabbar',
         layout :
         {
            pack : 'justify',
            align : 'center'
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
            tag : 'redeem',
            title : 'Redeem'
         },
         {
            iconCls : 'team',
            tag : 'accounts',
            title : 'Accounts'
         }]
      }]
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url;
         switch (type)
         {
            case 'breakfast' :
               photo_url = "resources/img/sprites/shoes.jpg";
               break;
            case 'lunch' :
               photo_url = "resources/img/sprites/heroburgers.jpg";
               break;
            case 'dinner' :
               photo_url = "resources/img/sprites/springrolls.jpg";
               break;
            case 'drinks' :
               photo_url = "resources/img/sprites/phoboga.jpg";
               break;
            case 'prize' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
         }
         return photo_url;
      }
   },
   beforeActivate : function()
   {
   },
   beforeDeactivate : function()
   {
   },
   afterActivate : function()
   {
   },
   afterDeactivate : function()
   {
   }
});
