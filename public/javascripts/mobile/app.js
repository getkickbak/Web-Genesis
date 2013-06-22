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

      //console.log("Launching App");
      Ext.create('Genesis.view.Viewport');
      //this.redirectTo('');
      console.log("Launched App");
   }
};

var appLaunchCallbackFn = function()
{
   Ext.application(
   {
      viewport :
      {
         autoMaximize : true
      },
      name : 'Genesis',
      //profiles : ['Iphone'],
      requires : ['Ext.MessageBox', 'Ext.device.Connection', 'Ext.device.Notification', //
      'Ext.device.Geolocation', 'Ext.device.Orientation'],
      views : ['ViewBase', 'Document', 'client.UploadPhotosPage', 'client.ChallengePage', 'client.Rewards', 'client.Redemptions',
      // //
      'client.AccountsTransfer', 'client.SettingsPage', 'client.CheckinExplore', 'LoginPage', 'SignInPage', //
      'client.MainPage', 'widgets.client.RedeemItemDetail', 'client.Badges', 'client.JackpotWinners', 'client.MerchantAccount', //
      'client.MerchantDetails', 'client.Accounts', 'client.Prizes', 'Viewport'],
      controllers : ['client.Challenges', 'client.Rewards', 'client.Redemptions', 'client.Viewport', 'client.MainPage', //
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
         console.log("Ext App Launch")
         _appLaunch();
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
};

Ext.onReady(function()
{
   console.debug = console.debug || console.log;
   console.warn = console.warn || console.debug;

   document.addEventListener("online", function()
   {
      if (Ext.device)
      {
         console.log("Phone is Online" + ", " + //
         Ext.device.Connection.__proto__.$className + ", " + //
         "devicePixelRatio - " + window.devicePixelRatio + ", " + //
         'Connection type: [' + Ext.device.Connection.getType() + ']');
         //console.debug('Checking for Network Conncetivity for [' + location.origin + ']');
         if (!Ext.device.Connection.isOnline())
         {
            _onGotoMain();
         }
      }
   }, false);

   document.addEventListener("offline", function()
   {
      if (Ext.device)
      {
         if (!Ext.device.Connection.isOnline())
         {
            _onGotoMain();
         }
      }
      console.log("Phone is Offline");
   }, false);

   launched |= 0x110;
   _appLaunch();
});

// **************************************************************************
// Bootup Sequence
// **************************************************************************
(function()
{
   var host = "/javascripts/build/Genesis/testing/";
   var resolution = function()
   {
      return (((window.screen.height >= 641) && ((window.devicePixelRatio == 1.0) || (window.devicePixelRatio >= 2.0))) ? 'mxhdpi' : 'lhdpi');
   };

   if (Ext.os.is('Tablet'))
   {
      if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
      {
         Genesis.fn.checkloadjscssfile(host + "resources/css/ipad.css?v=" + Genesis.constants.clientVersion, "css", appLaunchCallbackFn);
      }
      else
      //if (Ext.os.is('Android'))
      {
         switch (resolution())
         {
            case 'lhdpi' :
            {
               Genesis.fn.checkloadjscssfile(host + "resources/css/android-tablet-lhdpi.css?v=" + Genesis.constants.clientVersion, "css", appLaunchCallbackFn);
               break;
            }
            case 'mxhdpi' :
            {
               Genesis.fn.checkloadjscssfile(host + "resources/css/android-tablet-mxhdpi.css?v=" + Genesis.constants.clientVersion, "css", appLaunchCallbackFn);
               break;
            }
         }
      }
   }
   else
   {
      if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
      {
         if (Ext.os.is('iPhone5'))
         {
            var flag = 0x00;
            Genesis.fn.checkloadjscssfile(host + "resources/css/iphone.css?v=" + Genesis.constants.clientVersion, "css", function()
            {
               if ((flag |= 0x01) == 0x11)
               {
                  appLaunchCallbackFn();
               }
            });
            Genesis.fn.checkloadjscssfile(host + "resources/css/iphone5.css?v=" + Genesis.constants.clientVersion, "css", function()
            {
               if ((flag |= 0x10) == 0x11)
               {
                  appLaunchCallbackFn();
               }
            });
         }
         else
         {
            Genesis.fn.checkloadjscssfile(host + "resources/css/iphone.css?v=" + Genesis.constants.clientVersion, "css", appLaunchCallbackFn);
         }
      }
      else//
      //if (Ext.os.is('Android'))
      {
         switch (resolution())
         {
            case 'lhdpi' :
            {
               Genesis.fn.checkloadjscssfile(host + "resources/css/android-phone-lhdpi.css?v=" + Genesis.constants.clientVersion, "css", appLaunchCallbackFn);
               break;
            }
            case 'mxhdpi' :
            {
               Genesis.fn.checkloadjscssfile(host + "resources/css/android-phone-mxhdpi.css?v=" + Genesis.constants.clientVersion, "css", appLaunchCallbackFn);
               break;
            }
         }
      }
   }
})();
