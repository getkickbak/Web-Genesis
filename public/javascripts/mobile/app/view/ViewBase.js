Ext.define('Genesis.view.ViewBase',
{
   extend : 'Ext.Container',
   xtype : 'viewbase',
   config :
   {
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      var bar = viewport.getNavigationBar();
      var backBtn = bar.getBackButton();
      var proxy = bar.proxy.backButton;

      // Sets up for Animating the Close Button
      proxy.setUi('normal');
      backBtn.setUi('normal');
      bar.setDefaultBackButtonText(bar.getAltBackButtonText());
      proxy.setText(bar.getAltBackButtonText());

      if(!oldActiveItem.getXTypes().match('mainpageview'))
      {
         viewport.changeAnimationCfg();
      }
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
   },
   afterActivate : function(activeItem, oldActiveItem)
   {
   },
   afterDeactivate : function(activeItem, oldActiveItem)
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      var bar = viewport.getNavigationBar();
      var backBtn = bar.getBackButton();
      var proxy = bar.proxy.backButton;

      // Reset back to regular button
      proxy.setUi('back');
      backBtn.setUi('back');
      bar.setDefaultBackButtonText(bar.config.defaultBackButtonText);
      proxy.setText(bar.config.defaultBackButtonText);
   }
});
