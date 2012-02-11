Ext.define('Genesis.view.ViewBase',
{
   extend : 'Ext.Container',
   config :
   {
   },
   beforeActivate : function()
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      var bar = viewport.getNavigationBar();
      //var backBtn = bar.getBackButton();
      var proxy = bar.proxy.backButton;

      // Sets up for Animating the Close Button
      proxy.setUi('normal');
      bar.setDefaultBackButtonText('Close');
      proxy.setText('Close');
   },
   beforeDeactivate : function()
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      var bar = viewport.getNavigationBar();
      var proxy = bar.proxy.backButton;

      // Reset back to regular button
      proxy.setUi('back');
      bar.setDefaultBackButtonText('Back');
   },
   afterActivate : function()
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      var bar = viewport.getNavigationBar();
      var backBtn = bar.getBackButton();

      if(viewport.getCheckinInfo().venueId > 0)
      {
         viewport.query('button[tag=main]')[0].show();
      }
      
      backBtn.setUi('normal');
   },
   afterDeactivate : function()
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      var bar = viewport.getNavigationBar();
      var backBtn = bar.getBackButton();

      backBtn.setUi('back');
   }
});
