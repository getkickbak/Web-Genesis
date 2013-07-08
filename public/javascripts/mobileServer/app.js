var launched = 0x000, pausedDisabled = true, backBtnCallbackListFn = [], offlineDialogShown = false, phoneGapAvailable = false, merchantMode = true;
var debugMode = true, serverHost;

window._application = null;
window.appName = 'MerKickBak';
window._hostPathPrefix = "/javascripts/build/MobileServer/";
window._hostPath = _hostPathPrefix + ((debugMode) ? "testing" : "production") + "/";
_totalAssetCount++;

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
   serverHost = 'http://www.getkickbak.com';
}

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

//@require ../mobile/lib/core/Overrides.js

//<debug>
Ext.Loader.setPath(
{
   'Ext' : '../touch/src',
   'Genesis' : '../mobile/app',
   'Ext.ux' : '../mobile/app'
});
//</debug>

var flag = 0x100;
var appLaunch = function()
{
   if (launched == 0x111)
   {
      var viewport = _application.getController('server' + '.Viewport');
      viewport.appName = appName;

      Ext.create('Genesis.view.Viewport');
      console.debug("Launched App");

      // Destroy the #appLoadingIndicator element
      Ext.fly('appLoadingIndicator').destroy();
      _loadingPct = null;
      Ext.fly('loadingPct').destroy();
   }
};
var appLaunchCallbackFn = function(val)
{
   _filesAssetCount++;
   if ((flag |= val) == 0x111)
   {
      Ext.application(
      {
         viewport :
         {
            autoMaximize : true
         },
         profiles : ['MobileServer'],
         name : 'Genesis',
         views : ['Document', 'server.Rewards', 'server.Redemptions', 'server.MerchantAccount', 'server.MainPage', //
         'widgets.server.RedeemItemDetail', 'server.SettingsPage', 'server.TagCreatePage', 'Viewport'],
         controllers : ['server.Viewport', 'server.MainPage', 'server.Challenges', 'server.Receipts', 'server.Rewards', //
         'server.Redemptions', 'server.Merchants', 'server.Settings', 'server.Prizes'],
         launch : function()
         {
            _application = this;
            if (launched > 0x000)
            {
               launched |= 0x001;
            }
            else
            {
               launched = 0x001;
            }
            console.debug("Ext App Launch")
            appLaunch();
         },
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
         onUpdated : function()
         {
            Ext.device.Notification.show(
            {
               title : 'Application Update',
               message : "This application has just successfully been updated to the latest version. Reload now?",
               callback : function(buttonId)
               {
                  if (buttonId === 'yes')
                  {
                     window.location.reload();
                  }
               }
            });
         }
      });
   }
};

Ext.onReady(function()
{
   console.debug = (!debugMode) ? Ext.emptyFn : console.debug || console.log;
   console.warn = console.warn || console.debug;

   launched |= 0x110;
   appLaunch();
});

// **************************************************************************
// Bootup Sequence
// **************************************************************************
_filesAssetCount++;

Ext.defer(function()
{
   var targetelement = "script", targetattr = "src";
   var allsuspects = document.getElementsByTagName(targetelement);
   var resolution = (function()
   {
      return (((window.screen.height >= 641) && ((window.devicePixelRatio == 1.0) || (window.devicePixelRatio >= 2.0))) ? 'mxhdpi' : 'lhdpi');
   })();

   for (var i = allsuspects.length; i >= 0; i--)
   {
      if (allsuspects[i])
      {
         var attr = allsuspects[i].getAttribute(targetattr);
         if (attr)
         {
            Genesis.fn.filesadded[attr.replace(location.origin, "")] = [true];
         }
      }
   }

   if (Ext.os.is('Tablet'))
   {
      if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
      {
         Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/ipad.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
      }
      else
      //if (Ext.os.is('Android'))
      {
         switch (resolution)
         {
            case 'lhdpi' :
            {
               Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-tablet-lhdpi.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
               break;
            }
            case 'mxhdpi' :
            {
               Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-tablet-mxhdpi.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
               break;
            }
         }
      }
   }
   else
   {
      if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
      {
         Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/iphone.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [(!Ext.os.is('iPhone5')) ? 0x011 : 0x001]));
         if (Ext.os.is('iPhone5'))
         {
            _totalAssetCount++;
            Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/iphone5.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x010]));
         }
      }
      else//
      //if (Ext.os.is('Android'))
      {
         switch (resolution)
         {
            case 'lhdpi' :
            {
               Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-phone-lhdpi.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
               break;
            }
            case 'mxhdpi' :
            {
               Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-phone-mxhdpi.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
               break;
            }
         }

      }
   }
}, 0.1 * 1000);
