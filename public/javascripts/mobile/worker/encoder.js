if ( typeof (importScripts) != 'undefined')
{
      //
      // Desktop testing mode
      //
      if (location.href.match('testing'))
      {
         prefix = '..'
      }
      //
      // Native code or emualtor
      //
      else if (location.href.match(/mobileCilent/i))
      {
         prefix = '../..';
      }
      //
      // Desktop production mode
      //
      else
      {
         prefix = '/merchant';
      }
   importScripts((location.href.match('testing') ? '' : '/merchant') + 'lib/libmp3lame.min.js');
}
else
{
   //Genesis.fn.checkloadjscssfile(_hostPathPrefix + 'lib/libmp3lame.min.js', "js", Ext.emptyFn);
}

var encoder_mp3codec = null;
var encoder_init = function(config, scope)
{
   var wait, _init = function()
   {
      //
      // Wait until Lame is loaded into memory
      //
      if ( typeof (Lame) != 'undefined')
      {
         encoder_mp3codec = Lame.init();
         Lame.set_mode(encoder_mp3codec, config.mode || Lame.JOINT_STEREO);
         Lame.set_num_channels(encoder_mp3codec, config.channels || 2);
         Lame.set_out_samplerate(encoder_mp3codec, config.samplerate || 44100);
         Lame.set_bitrate(encoder_mp3codec, config.bitrate || 128);
         Lame.init_params(encoder_mp3codec);
         //console.debug("#MP3 Init");
         scope.postMessage(
         {
            cmd : 'init'
         });
         clearInterval(wait);
      }
   };

   //console.debug("Encoder Init Received " + JSON.stringify(config));
   if (!config)
   {
      config =
      {
      };
   }

   wait = setInterval(_init, 0.1 * 1000);

};
var encoder_encode = function(buf, scope)
{
   //console.debug("Encoder Data Buffer Len = " + buf.length);
   var mp3data = Lame.encode_buffer_ieee_float(encoder_mp3codec, buf, []);
   //console.debug("#MP3 Encode");
   scope.postMessage(
   {
      cmd : 'data',
      buf : mp3data.data
   });
};
var encoder_finish = function(scope)
{
   //console.debug("Encoder Finish Message Received");
   var mp3data = Lame.encode_flush(encoder_mp3codec);
   //console.debug("#MP3 Complete");
   scope.postMessage(
   {
      cmd : 'end',
      buf : mp3data.data
   });
   Lame.close(encoder_mp3codec);
   encoder_mp3codec = null;
};

//
// WebWorker not supported
//
if (( typeof (Worker) == 'undefined') && ( typeof (Ext) != 'undefined'))
{
   Ext.define('Worker',
   {
      constructor : function(config)
      {
         var me = this;
         me.responseHandler =
         {
            postMessage : function(result)
            {
               me.onmessage(
               {
                  data : result
               });
            }
         }
      },
      postMessage : function(data)
      {
         switch (data.cmd)
         {
            case 'init' :
            {
               encoder_init(data.config, this.responseHandler);
               break;
            }
            case 'encode' :
            {
               encoder_encode(data.buf, this.responseHandler);
               break;
            }
            case 'finish' :
            {
               encoder_finish(this.responseHandler);
               break;
            }
         }
      },
      onmessage : Ext.emptyFn
   });
}
else
{
   onmessage = function(e)
   {
      var data = e.data;
      switch (data.cmd)
      {
         case 'init':
            encoder_init(data.config, self);
            break;
         case 'encode':
            encoder_encode(data.buf, self);
            break;
         case 'finish':
            encoder_finish(self);
            break;
      }
   };
}