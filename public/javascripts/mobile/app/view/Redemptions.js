Ext.define('Genesis.view.Redemptions',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedemptionsPts'],
   alias : 'widget.redemptionsview',
   config :
   {
      title : 'Venue Name',
      scrollable : true,
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
         xtype : 'redemptionspts',
         cls : 'ptsEarnPanel separator',
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
            title : 'Redemptions Available'
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
         layout :
         {
            type : 'card',
            animation :
            {
               type : '',

            }
         },
         xtype : 'container',
         cls : 'redemptionsSelection separator',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'list',
            scrollable : 'horizontal',
            cls : 'separator',
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
            cls : 'desc separator',
            data :
            {
               title : 'Empty Description'
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
            ui : 'black-large',
            text : 'Redeem it!'
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
