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

//<debug>
Ext.Loader.setPath({
    'Ext': '../touch/src',
    'Genesis': '../mobile/app',
    'Ext.ux': '../mobile/app'
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
      navigator.splashscreen.hide();
      initPushwoosh();
   }
};

Ext.onReady(function()
{
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
   document.addEventListener("pause", function()
   {
      if (_application && (launched == 0x111))
      {
         _application.getController('client.Viewport').persistSyncStores();
      }
      console.log("App is Paused");
   }, false);

   document.addEventListener("resume", function()
   {
      if (Ext.device)
      {
         if (!Ext.device.Connection.isOnline())
         {
            _onGotoMain();
         }
         else
         {
            //_onGotoMainCallBackFn();
         }
      }
      console.log("App is Resumed");
   }, false);
});

Ext.application(
{
   viewport :
   {
      autoMaximize : true
   },
   name : 'Genesis',
   profiles : ['Iphone'],
   requires : ['Ext.MessageBox', 'Ext.device.Connection', 'Ext.device.Notification', 'Ext.device.Camera', //
   'Ext.device.Communicator', 'Ext.device.Geolocation', 'Ext.device.Orientation'],
   views : ['Document', 'client.UploadPhotosPage', 'client.ChallengePage', 'client.Rewards', 'client.Redemptions', //
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

