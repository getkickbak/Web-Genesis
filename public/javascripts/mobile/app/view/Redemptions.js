Ext.define('Genesis.view.Redemptions',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedemptionsPtsItem'],
   alias : 'widget.redemptionsview',
   config :
   {
      title : 'Venue Name',
      changeTitle : true,
      scrollable : 'vertical',
      cls : 'redemptionsMain',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [
      // ------------------------------------------------------------------------
      // Redemptions Points Earned Panel
      // ------------------------------------------------------------------------
      {
         xtype : 'toolbar',
         cls : 'ptsEarnPanelHdr',
         centered : false,
         items : [
         {
            xtype : 'title',
            title : 'Points Earned'
         },
         {
            xtype : 'spacer'
         }]
      },
      {
         cls : 'ptsEarnPanel separator',
         xtype : 'dataview',
         useComponents : true,
         scrollable : false,
         defaultType : 'redemptionsptsitem',
         store : 'CustomerStore'
      },
      // ------------------------------------------------------------------------
      // Redemptions Available Panel
      // ------------------------------------------------------------------------
      {
         xtype : 'toolbar',
         cls : 'ptsEarnPanelHdr',
         centered : false,
         items : [
         {
            xtype : 'title',
            title : 'Redemptions Available (Select an item below)'
         },
         {
            xtype : 'spacer'
         }]
      },
      // ------------------------------------------------------------------------
      // Redemptions AVailable CardsLayout
      // ------------------------------------------------------------------------
      {
         xtype : 'container',
         height : 10000,
         layout :
         {
            type : 'card',
            animation :
            {
               type : 'flip'

            }
         },
         cls : 'redemptionsView separator',
         tag : 'redemptionsView',
         items : [
         {
            xtype : 'container',
            cls : 'redemptionsDataviewWrapper',
            tag : 'redemptionsDataviewWrapper',
            layout :
            {
               type : 'vbox',
               align : 'stretch',
               pack : 'start'
            },
            items : [
            {
               xtype : 'list',
               scrollable :
               {
                  direction : 'horizontal',
                  indicators : false
               },
               inline: { wrap: false },
               cls : 'redemptionsDataview separator',
               loadingText : null, // Disable Loading Mask
               tag : 'redemptionsDataview',
               store : 'RedemptionsStore',
               // @formatter:off
               itemTpl : Ext.create('Ext.XTemplate', '<img class="photo" src="{[this.getPhoto(values)]}"/>',
               // @formatter:on
               {
                  getPhoto : function(values)
                  {
                     if(!values.photo_url)
                     {
                        return Genesis.view.Redemptions.getPhoto(values.type);
                     }
                     return values.photo_url;
                  }
               })
            },
            {
               xtype : 'container',
               cls : 'desc separator',
               tag : 'desc',
               data :
               {
                  title : 'Empty Description Empty Description Empty Description Empty Description Empty Description Empty Description Empty Description Empty Description Empty Description Empty Description'
               },
               tpl : '{title}'
            },
            {
               xtype : 'container',
               cls : 'ptsContainer separator',
               layout :
               {
                  type : 'hbox',
                  align : 'middle',
                  pack : 'center'
               },
               height : '',
               items : [
               {
                  xtype : 'component',
                  data :
                  {
                     points : 0
                  },
                  tpl : '{points} ',
                  tag : 'points',
                  cls : 'points'
               },
               {
                  xtype : 'component',
                  cls : 'photo',
                  data :
                  {
                     photo_url : 'resources/img/sprites/coin.jpg'
                  },
                  tpl : '<img src="{photo_url}"/>'
               }]
            },
            {
               xtype : 'button',
               cls : 'separator',
               tag : 'redeem',
               ui : 'black-large',
               text : 'Redeem it!'
            }]
         },
         {
            xtype : 'list',
            scrollable : false,
            ui : 'bottom-round',
            store : 'RedemptionsStore',
            cls : 'redemptionsList',
            tag : 'redemptionsList',
            /*
             indexBar :
             {
             docked : 'right',
             overlay : true,
             alphabet : false,
             centered : false,
             letters : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
             },
             */
            pinHeaders : false,
            grouped : true,
            // @formatter:off
            itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>', '<div class="listItemDetailsWrapper">', '<div class="itemDesc wrap">{[this.getDesc(values)]}</div>', '</div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  if(!values.photo_url)
                  {
                     return Genesis.view.Redemptions.getPhoto(values.type);
                  }
                  return values.photo_url;
               },
               getDesc : function(values)
               {
                  return values.title;
               }
            })
         }]
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
            xtype : 'spacer'
         },
         //
         // Middle Button
         //
         {
            xtype : 'segmentedbutton',
            allowMultiple : false,
            tag : 'redemptions',
            items : [
            {
               text : 'Detailed',
               tag : 'detailed',
               pressed : true
            },
            {
               text : 'Summary',
               tag : 'summary',
            }]
         },
         //
         // Right side Buttons
         //
         {
            xtype : 'spacer'
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
   }
});
