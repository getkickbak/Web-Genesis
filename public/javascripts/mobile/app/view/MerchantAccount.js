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
      // Merchant Info
      // -----------------------------------------------------------------------
      /*
      {
      xtype : 'toolbar',
      cls : 'merchantContactPanelHdr',
      centered : false,
      items : [
      {
      xtype : 'title',
      title : 'Contact Us'
      },
      {
      xtype : 'spacer'
      }]
      },
      {
      xtype : 'container',
      cls : 'merchantStatsPanel separator',
      layout : 'fit',
      defaults :
      {
      scrollable : false
      },
      items : [
      // -----------------------------------------------------------------------
      // Merchant Photo & Address
      // -----------------------------------------------------------------------
      {
      docked : 'right',
      xtype : 'component',
      cls : 'merchantPhoto',
      tag : 'photo',
      tpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{photoUrl}"/></div>')
      },
      {
      xtype : 'component',
      cls : 'merchantAddress',
      tag : 'merchantAddress',
      tpl : Ext.create('Ext.XTemplate', '{[this.getAddress(values)]}',
      {
      getAddress : function(values)
      {
      var address = (values.address2) ? values.address1 + ", " + values.address2 : values.address1;
      return (address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",<br/>" + values.zipcode);
      }
      })
      },
      // -----------------------------------------------------------------------
      // Customer's Stats
      // -----------------------------------------------------------------------
      {
      xtype : 'formpanel',
      tag : 'merchantStats',
      cls : 'merchantStats',
      defaults :
      {
      xtype : 'textfield',
      readOnly : true,
      labelAlign : 'left',
      labelWidth : '60%'
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
      */
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
      // Latest Newsfeed Panel
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
               title : 'Latest News'
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
            itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>', '<div class="listItemDetailsWrapper">', '<div class="itemDesc wrap">{[this.getDesc(values)]}</div>', '</div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  if(!values.photo)
                  {
                     return Genesis.view.MerchantAccount.getPhoto(values.type);
                  }
                  else
                  {
                     return values.photo.url;
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
            iconCls : 'prize',
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
            iconCls : 'redemption',
            tag : 'redemption',
            title : 'Redeem'
         },
         {
            iconCls : 'check_black1',
            tag : 'checkin',
            title : 'Check-In'
         },
         {
            tag : 'browse',
            iconCls : 'search1',
            title : 'Explore'
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
