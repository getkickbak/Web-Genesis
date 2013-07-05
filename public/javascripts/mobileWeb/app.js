var launched = 0x000, pausedDisabled = true, backBtnCallbackListFn = [], offlineDialogShown = false, serverHost, phoneGapAvailable = false, merchantMode = false;
var debugMode = false;
if (debugMode)
{
   //serverHost = 'http://192.168.0.52:3000';
   //serverHost = 'http://192.168.0.46:3000';
   //serverHost = 'http://76.10.173.153';
   serverHost = 'http://www.dev1getkickbak.com';
   //serverHost = 'http://www.devgetkickbak.com';
}
else
{
   serverHost = 'http://m.getkickbak.com';
}

window._application = null;
window.appName = 'KickBak';
window._hostPathPrefix = "/javascripts/build/Genesis/";
window._hostPath = _hostPathPrefix + ((debugMode) ? "testing" : "production") + "/";
_filesAssetCount += 3;

/*
This file is generated and updated by Sencha Cmd. You can edit this file as
needed for your application, but these edits will have to be merged by
Sencha Cmd when it performs code generation tasks such as generating new
models, controllers or views and when running "sencha app upgrade".

Ideally changes to this file would be limited and most work would be done
in other places (such as Controllers). If Sencha Cmd cannot merge your
changes and its generated code, it will produce a "merge conflict" that you
will need to resolve manually.
*/

// DO NOT DELETE - this directive is required for Sencha Cmd packages to work.
//@require @packageOverrides
//@require ../lib/core/Genesis.js

//<debug>
Ext.Loader.setPath(
{
   'Ext' : 'touch/src',
   'KickBak' : 'app'
});
//</debug>

Ext.application(
{
   viewport :
   {
      autoMaximize : true
   },
   name : 'KickBak',
   //profiles : ['Iphone'],
   requires : ['Ext.MessageBox', //
   //'Ext.device.Connection', //
   'Ext.device.Notification'], //,
   //'Ext.device.Camera', 'Ext.device.Communicator', 'Ext.device.Geolocation', 'Ext.device.Orientation'],
   views : ['ViewBase', 'Viewport', 'Document', 'client.SignUpPage'],
   controllers : ['client.Viewport', 'client.SignUp'],
   isIconPrecomposed : true,
   icon :
   {
      36 : 'resources/icons/icon36.png',
      48 : 'resources/icons/icon48.png',
      57 : 'resources/icons/icon.png',
      72 : 'resources/icons/icon@72.png',
      114 : 'resources/icons/icon@2x.png',
      144 : 'resources/icons/icon@144.png'
   },
   startupImage :
   {
      '320x460' : 'resources/startup/320x460.jpg',
      '640x920' : 'resources/startup/640x920.png',
      '768x1004' : 'resources/startup/768x1004.png',
      '748x1024' : 'resources/startup/748x1024.png',
      '1536x2008' : 'resources/startup/1536x2008.png',
      '1496x2048' : 'resources/startup/1496x2048.png'
   },
   launch : function()
   {
      _application = this;
      var viewport = _application.getController('client' + '.Viewport');
      console.log("Ext App Launch");

      viewport.appName = appName;

      // Destroy the #appLoadingIndicator element
      Ext.fly('appLoadingIndicator').destroy();
      _loadingPct = null;
      Ext.fly('loadingPct').destroy();

      Ext.create('KickBak.view.Viewport');

      if (!Genesis.db.getLocalDB()['fbLoginInProgress'])
      {
         Ext.defer(viewport.redirectTo, 1, viewport, ['signup']);
      }
      console.log("Launched App");
   },
   onUpdated : function()
   {
      Ext.Msg.confirm("Application Update", "This application has just successfully been updated to the latest version. Reload now?", function(buttonId)
      {
         if (buttonId === 'yes')
         {
            window.location.reload();
         }
      });
   }
});
