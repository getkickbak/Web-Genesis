Ext.define('Genesis.view.RedemptionsClient',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedemptionsPtsItem'],
   alias : 'widget.redemptionsclientview',
   config :
   {
      title : 'Redemptions',
      changeTitle : false,
      scrollable : 'vertical',
      cls : 'redemptionsMain',
      layout : 'vbox',
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
         tag : 'ptsEarnPanel',
         xtype : 'dataview',
         useComponents : true,
         scrollable : undefined,
         defaultType : 'redemptionsptsitem',
         store :
         {
            model : 'Genesis.model.Customer',
            autoLoad : false
         }
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
      // Redemptions
      // ------------------------------------------------------------------------
      {
         xtype : 'list',
         scrollable : undefined,
         //scrollable : 'vertical',
         ui : 'bottom-round',
         store :
         {
            model : 'Genesis.model.CustomerReward',
            autoLoad : false,
            grouper :
            {
               groupFn : function(record)
               {
                  return record.get('points') + ' Points';
               }
            },
            sorters : [
            {
               property : 'points',
               direction : 'ASC'
            }]
         },
         cls : 'redemptionsList separator_pad',
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
         //pinHeaders : true,
         grouped : true,
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>', '<div class="listItemDetailsWrapper">', '<div class="itemTitle">{[this.getTitle(values)]}</div>', '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               if(!values.photo)
               {
                  return Genesis.view.RedemptionsClient.getPhoto(values['type']);
               }
               return values.photo.url;
            },
            getTitle : function(values)
            {
               return values['title'];
            }
         }),
         onItemDisclosure : Ext.emptyFn
      }]
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url;
         switch (type.value)
         {
            case 'appetizers' :
               photo_url = "resources/img/sprites/shoes.jpg";
               break;
            case 'bread' :
               photo_url = "resources/img/sprites/heroburgers.jpg";
               break;
            case 'desserts' :
               photo_url = "resources/img/sprites/springrolls.jpg";
               break;
            case 'drinks' :
               photo_url = "resources/img/sprites/phoboga.jpg";
               break;
            case 'entrees' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'noodles' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'pasta' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'pastry' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'salad' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'sandwiches' :
               photo_url = "resources/img/sprites/shoes.jpg";
               break;
            case 'side_dishes' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'soup' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
            case 'custom' :
               photo_url = "resources/img/sprites/star.jpg";
               break;
         }
         return photo_url;
      }
   }
});
