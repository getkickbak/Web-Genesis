Ext.define('Genesis.view.Prizes',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Ext.Carousel', 'Genesis.view.widgets.RewardItem'],
   alias : 'widget.prizesview',
   config :
   {
      title : 'Prizes Header',
      changeTitle : true,
      scrollable : false,
      layout : 'fit',
      cls : 'prizesMain'
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      var prizeMode = _application.getController('Prizes').getMode();
      switch (prizeMode)
      {
         case 'showPrize':
         case 'prizes' :
            activeItem.getInitialConfig().title = 'Prizes';
            break;
         case 'reward' :
            activeItem.getInitialConfig().title = 'Rewards';
            break;
         case 'authReward':
            activeItem.getInitialConfig().title = ' ';
            var viewport = Ext.ComponentQuery.query('viewportview')[0];
            viewport.getNavigationBar().addCls('kbTitle');
            break;
      }
      this.callParent(arguments);
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
      var prizeMode = _application.getController('Prizes').getMode();
      switch (prizeMode)
      {
         case 'showPrize':
         case 'prizes' :
         case 'reward' :
            break;
         case 'authReward':
            var viewport = Ext.ComponentQuery.query('viewportview')[0];
            viewport.getNavigationBar().removeCls('kbTitle');
            break;
      }
      this.callParent(arguments);
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
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               break;
         }
         return photo_url;
      }
   }
});
