Ext.define('Genesis.profile.Iphone',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.is('iOS');
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
      //var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      //viewport.self.playSoundFile(viewport.sound_files['beepSound']);
      navigator.notification.beep(times);
      console.log("Beep " + times + " times.")
   },
   vibrate : function(duration)
   {
      navigator.notification.vibrate(duration || 1000);
   },
   activityStart : function(title, message)
   {
      navigator.notification.activityStart(title, message);
   },
   activityStop : function()
   {
      navigator.notification.activityStop();
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.camera.PhoneGap
//---------------------------------------------------------------------------------------------------------------------------------
/**
 * @private
 */
Ext.define('Genesis.device.camera.PhoneGap',
{
   override : 'Ext.device.camera.PhoneGap',
   capture : function(args)
   {
      var onSuccess = args.success, onError = args.failure, scope = args.scope, sources = this.source, destinations = this.destination, encodings = this.encoding, source = args.source, destination = args.destination, encoding = args.encoding, options =
      {
      };

      if (scope)
      {
         onSuccess = Ext.Function.bind(onSuccess, scope);
         onError = Ext.Function.bind(onError, scope);
      }
      if (source !== undefined)
      {
         options.sourceType = sources.hasOwnProperty(source) ? sources[source] : source;
      }
      if (destination !== undefined)
      {
         options.destinationType = destinations.hasOwnProperty(destination) ? destinations[destination] : destination;
      }
      if (encoding !== undefined)
      {
         options.encodingType = encodings.hasOwnProperty(encoding) ? encodings[encoding] : encoding;
      }
      if ('quality' in args)
      {
         options.quality = args.quality;
      }
      if ('width' in args)
      {
         options.targetWidth = args.width;
      }
      if ('height' in args)
      {
         options.targetHeight = args.height;
      }
      if ('allowEdit' in args)
      {
         options.allowEdit = args.allowEdit;
      }
      if ('correctOrientation' in args)
      {
         options.correctOrientation = args.correctOrientation;
      }
      try
      {
         navigator.camera.getPicture(onSuccess, onError, options);
      }
      catch (e)
      {
      }
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// PushWoosh Push Notification API
//---------------------------------------------------------------------------------------------------------------------------------
function initPushwoosh()
{
   var pushNotification = window.plugins.pushNotification;
   pushNotification.onDeviceReady();

   pushNotification.registerDevice(
   {
      alert : true,
      badge : true,
      sound : true,
      pw_appid : pushNotifAppId,
      appname : pushNotifAppName
   }, function(status)
   {
      var deviceToken = status['deviceToken'];
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
      //navigator.notification.alert(JSON.stringify(['failed to register ', status]));
   });

   pushNotification.setApplicationIconBadgeNumber(0);

   document.addEventListener('push-notification', function(event)
   {
      var notification = event.notification;
      Ext.device.Notification.show(
      {
         title : 'Push Notification Alert',
         message : notification.aps.alert
      });
      //navigator.notification.alert(notification.aps.alert);
      pushNotification.setApplicationIconBadgeNumber(0);
   });
}
