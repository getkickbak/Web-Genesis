Ext.define('Genesis.view.Prizes',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Ext.Carousel', 'Genesis.view.widgets.RewardItem'],
   alias : 'widget.prizesview',
   config :
   {
      scrollable : undefined,
      fullscreen : true,
      cls : 'prizesMain',
      layout : 'card',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Prizes',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            align : 'left',
            tag : 'back',
            ui : 'back',
            text : 'Back'
         },
         {
            align : 'right',
            tag : 'redeem',
            text : 'Redeem'
         }]
      }]
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'earn_points':
               break;
            default :
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               break;
         }
         return photo_url;
      }
   }
});

Ext.define('Genesis.view.ShowPrize',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Ext.Carousel', 'Genesis.view.widgets.RewardItem'],
   alias : 'widget.showprizeview',
   config :
   {
      scrollable : false,
      fullscreen : true,
      cls : 'prizesMain',
      layout : 'fit',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Prizes',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            align : 'left',
            tag : 'back',
            ui : 'back',
            text : 'Back'
         },
         {
            align : 'right',
            tag : 'redeem',
            text : 'Redeem'
         }]
      },
      {
         tag : 'rewardPanel',
         xtype : 'dataview',
         store :
         {
            model : 'Genesis.model.EarnPrize',
            autoLoad : false
         },
         useComponents : true,
         scrollable : false,
         defaultType : 'rewarditem',
         defaultUnit : 'em',
         margin : '0 0 0.8 0'
      },
      {
         docked : 'bottom',
         xtype : 'button',
         margin : '0.8 0.7',
         defaultUnit : 'em',
         tag : 'refresh',
         text : 'Refresh',
         ui : 'orange-large'
      },
      {
         docked : 'bottom',
         margin : '0.8 0.7',
         defaultUnit : 'em',
         xtype : 'button',
         cls : 'separator',
         tag : 'verify',
         text : 'Verified!',
         ui : 'orange-large'
      }]
   }
});
