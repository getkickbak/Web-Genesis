Ext.define('Genesis.profile.Iphone',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.is.iPhone;
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
      console.log("Beep " + times + " times.")
   },
   vibrate : function(duration)
   {
      navigator.notification.vibrate(duration || 2000);
   }
});

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
