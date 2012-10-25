Ext.define('Genesis.profile.Android',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.is('Android');
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.notification.PhoneGap
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.notification.PhoneGap',
{
   override : 'Ext.device.notification.PhoneGap',
   beep : function(times)
   {
      var viewport = _application.getController('Viewport');
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['beepSound']);
      //navigator.notification.beep(times);
   },
   vibrate : function(duration)
   {
      navigator.notification.vibrate(duration || 1000);
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// PushWoosh Push Notification API
//---------------------------------------------------------------------------------------------------------------------------------
function initPushwoosh()
{
   var pushNotification = window.plugins.pushNotification;
   var callback = function(rc)
   {
      // rc could be registrationId or errorCode

      // CHANGE projectid & appid
      pushNotification.registerDevice(
      {
         projectid : 733275653511,
         appid : pushNotifAppId
      }, function(status)
      {
         var deviceToken = status;
         console.warn('registerDevice: ' + deviceToken);
         Genesis.constants.device =
         {
            'device_type' : pushNotifType, //1 for iOS, 3 for Android
            'device_id' : deviceToken
         };
      }, function(status)
      {
         console.warn('failed to register : ' + JSON.stringify(status));
         Genesis.constants.device = null;
      });

      document.addEventListener('push-notification', function(event)
      {
         if (event.notification)
         {
            var title = event.notification.title;
            var userData = event.notification.userdata;

            if ( typeof (userData) != "undefined")
            {
               Ext.device.Notification.show(
               {
                  title : 'Push Notification Alert',
                  message : title
               });
               console.warn('push notifcation - userData [' + JSON.stringify(userData) + ']');
            }
         }
         else
         {
            console.warn('push notifcation - Null Notification');
         }
      });
   }
   pushNotification.unregisterDevice(callback, callback);
}