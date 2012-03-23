Ext.define('Genesis.view.Redemptions',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedemptionsPtsItem'],
   alias : 'widget.redemptionsview',
   config :
   {
      title : 'Redemptions',
      changeTitle : false,
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
         tag : 'ptsEarnPanel',
         xtype : 'dataview',
         useComponents : true,
         scrollable : false,
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
         scrollable : false,
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
         cls : 'redemptionsList separator',
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
         }),
         onItemDisclosure : Ext.emptyFn
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
