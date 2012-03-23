Ext.define('Genesis.view.Prizes',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Ext.Carousel', 'Genesis.view.widgets.RewardItem'],
   alias : 'widget.prizesview',
   config :
   {
      title : 'Prizes',
      changeTitle : false,
      scrollable : false,
      layout : 'fit'
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      var prizeMode = !(oldActiveItem && oldActiveItem.getXTypes().match('redemptionsview'));
      activeItem.getInitialConfig().title = (prizeMode) ? 'Prizes' : 'Redeem Reward';
      this.callParent(arguments);
      if(!prizeMode)
      {
         var viewport = Ext.ComponentQuery.query('viewportview')[0];
         viewport.setAnimationDir('up');
      }
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
      var prizeMode = !activeItem.getXTypes().match('redemptionsview');
      this.callParent(arguments);
      if(!prizeMode)
      {
         var viewport = Ext.ComponentQuery.query('viewportview')[0];
         viewport.setAnimationDir('up');
      }
   }
});
