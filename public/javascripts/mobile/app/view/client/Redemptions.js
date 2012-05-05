Ext.define('Genesis.view.client.Redemptions',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedemptionsPtsItem'],
   alias : 'widget.clientredemptionsview',
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
         ui : 'light',
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
         ui : 'light',
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
                  return Genesis.view.client.Redemptions.getPhoto(values['type']);
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
         var photo_url = null;
         switch (type.value)
         {
            case 'custom' :
               break;
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
