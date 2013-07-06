var launched = 0x000, pausedDisabled = true, backBtnCallbackListFn = [], offlineDialogShown = false, phoneGapAvailable = false, merchantMode = false;
var debugMode = true, serverHost;

window._application = null;
window._codec = null;
window.appName = 'GetKickBak';
window._hostPathPrefix = "/javascripts/build/Genesis/";
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

// If you want to prevent dragging, uncomment this section
/*
function preventBehavior(e)
{
e.preventDefault();
};
document.addEventListener("touchmove", preventBehavior, false);
*/

/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
for more details -jm */
/*
function handleOpenURL(url)
{
// TODO: do something with the url passed in.
}
*/
/* When this function is called, PhoneGap has been initialized and is ready to roll */
/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
for more details -jm */

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
//@require lib/core/Overrides.js

//<debug>
Ext.Loader.setPath(
{
   'Ext' : '../touch/src',
   'Genesis' : '../mobile/app',
   'Ext.ux' : '../mobile/app'
});
//</debug>

function _onGotoMainCallBackFn()
{
   Ext.Viewport.setMasked(null);
   var viewport = _application.getController('client' + '.Viewport');
   if (viewport)
   {
      viewport.resetView();
      if (viewport.getLoggedIn())
      {
         viewport.redirectTo('checkin');
      }
      else
      {
         viewport.redirectTo('login');
      }
   }
   offlineDialogShown = false;
};

function _onGotoMain()
{
   if (!offlineDialogShown)
   {
      Ext.device.Notification.show(
      {
         title : 'Network Error',
         message : Genesis.controller.ControllerBase.prototype.lostNetworkConenction,
         callback : _onGotoMainCallBackFn
      });
   }
   offlineDialogShown = true;
};

function _appLaunch()
{
   if (launched == 0x111)
   {
      var viewport = _application.getController('client' + '.Viewport');
      viewport.appName = appName;

      Ext.create('Genesis.view.Viewport');
      console.debug("Launched App");

      // Destroy the #appLoadingIndicator element
      Ext.fly('appLoadingIndicator').destroy();
      _loadingPct = null;
      Ext.fly('loadingPct').destroy();
   }
};

var flag = 0x000;
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
         name : 'Genesis',
         profiles : ['MobileWebClient'],
         requires : ['Ext.MessageBox', 'Ext.device.Notification', 'Ext.device.Geolocation', 'Ext.device.Orientation'],
         views : ['ViewBase', 'Document', 'client.UploadPhotosPage', 'client.ChallengePage', 'client.Rewards', 'client.Redemptions',
         // //
         'client.AccountsTransfer', 'client.SettingsPage', 'client.CheckinExplore', 'LoginPage', 'SignInPage', //
         'client.MainPage', 'widgets.client.RedeemItemDetail', 'client.Badges', 'client.JackpotWinners', 'client.MerchantAccount', //
         'client.MerchantDetails', 'client.Accounts', 'client.Prizes', 'Viewport'],
         controllers : ['mobileWebClient.Challenges', 'client.Rewards', 'client.Redemptions', 'client.Viewport', 'client.MainPage',
         // //
         'client.Badges', 'client.Merchants', 'client.Accounts', 'client.Settings', 'client.Checkins', 'client.JackpotWinners', //
         'client.Prizes'],
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
            _appLaunch();
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

   document.addEventListener("online", function()
   {
      if (Ext.device)
      {
         console.debug("Phone is Online" + ", " + //
         "devicePixelRatio - " + window.devicePixelRatio + ", " + ']');
         //console.debug('Checking for Network Conncetivity for [' + location.origin + ']');
         if (!navigator.onLine)
         {
            _onGotoMain();
         }
      }
   }, false);

   document.addEventListener("offline", function()
   {
      if (Ext.device)
      {
         if (!navigator.onLine)
         {
            _onGotoMain();
         }
      }
      console.debug("Phone is Offline");
   }, false);

   launched |= 0x110;
   _appLaunch();
});

// **************************************************************************
// Bootup Sequence
// **************************************************************************
var resolution = function()
{
   return (((window.screen.height >= 641) && ((window.devicePixelRatio == 1.0) || (window.devicePixelRatio >= 2.0))) ? 'mxhdpi' : 'lhdpi');
};
var imagePath = _hostPath + "resources/themes/images/v1/", images = [new Image(400, 400)], prefix;

_filesAssetCount++;
if (Ext.os.is('Tablet'))
{
   if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
   {
      prefix = imagePath + "ios";
      Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/ipad.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
   }
   else
   //if (Ext.os.is('Android'))
   {
      prefix = imagePath + "android/" + resolution();
      switch (resolution())
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
      prefix = imagePath + "ios";
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
      prefix = imagePath + "android/" + resolution();
      switch (resolution())
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

   var canPlayAudio = (new Audio()).canPlayType('audio/wav; codecs=1');
   if (!canPlayAudio)
   {
      //
      // If Worker is not supported, preload it
      //
      if ( typeof (Worker) == 'undefined')
      {
         Genesis.fn.checkloadjscssfile(_hostPath + "worker/encoder.js", "js", function()
         {
            _codec = new Worker('worker/encoder.js');
            appLaunchCallbackFn(0x100);
            console.debug("Enable MP3 Encoder");
         });
      }
      else
      {
         _codec = new Worker('worker/encoder.js');
         appLaunchCallbackFn(0x100);
         console.debug("Enable MP3 Encoder");
      }
   }
   else
   {
      appLaunchCallbackFn(0x100);
      console.debug("Enable WAV/WebAudio Encoder");
   }
}
images[0].src = prefix + "/prizewon/transmit.png";
