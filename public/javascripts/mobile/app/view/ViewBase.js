Ext.define('Genesis.view.ViewBase',
{
   extend : 'Ext.Container',
   xtype : 'viewbase',
   config :
   {
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      if(oldActiveItem)
      {
         var viewport = Ext.ComponentQuery.query('viewportview')[0];
         var oxtypes = oldActiveItem.getXTypes();

         for(var i = 0; i < viewport.stack.length; i++)
         {
            if(viewport.stack[i].getXTypes().match('merchantaccountview'))
            {
               var bar = viewport.getNavigationBar();
               var backBtn = bar.getBackButton();
               var proxy = bar.proxy.backButton;

               // Sets up for Animating the Close Button
               proxy.setUi('normal');
               backBtn.setUi('normal');
               bar.setDefaultBackButtonText(bar.getAltBackButtonText());
               proxy.setText(bar.getAltBackButtonText());
               break;
            }
         }
         //
         // Any views stems from MerchantAccount needs the "slideUp" effect
         //
         if(oxtypes.match('merchantaccountview'))
         {
            viewport.setAnimationDir('up');
         }
      }
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
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

      if(oldActiveItem)
      {
         //
         // Any views stems from MerchantAccount needs the "slideUp" effect
         //
         var axtypes = activeItem.getXTypes();
         if(axtypes.match('merchantaccountview'))
         {
            viewport.setAnimationDir('up');
         }
      }
   },
   afterActivate : function(activeItem, oldActiveItem)
   {
   },
   afterDeactivate : function(activeItem, oldActiveItem)
   {
   }
});
