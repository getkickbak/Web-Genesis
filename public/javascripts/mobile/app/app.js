Ext.regApplication(
{
   name: 'app',
   launch: function()
   {
      this.launched = true;
      this.mainLaunch();
   },
   mainLaunch: function()
   {
      /* When this function is called, PhoneGap has been initialized and is ready to roll */
      /* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
      see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
      for more details -jm */
      // do your thing!
      //navigator.notification.alert("PhoneGap is working")
      if ((Ext.is.Desktop && (typeof(device) != 'undefined')) || ((typeof(device) != 'undefined') && !device) || !this.launched)
      {
         return;
      }
      this.views.viewport = new this.views.Viewport();
   }
});