if ( typeof (importScripts) != 'undefined')
{
   importScripts('../lib/libmp3lame.min.js');
}
else
{
   Genesis.fn.checkloadjscssfile('../lib/libmp3lame.min.js', "js", Ext.emptyFn);
}

var mp3codec;
var init = function(config, scope)
{
   //console.debug("Encoder Init Received " + JSON.stringify(config));
   if (!config)
   {
      config =
      {
      };
   }
   mp3codec = Lame.init();
   Lame.set_mode(mp3codec, config.mode || Lame.JOINT_STEREO);
   Lame.set_num_channels(mp3codec, config.channels || 2);
   Lame.set_out_samplerate(mp3codec, config.samplerate || 44100);
   Lame.set_bitrate(mp3codec, config.bitrate || 128);
   Lame.init_params(mp3codec);
   //console.debug("#MP3 Init");
   scope.postMessage(
   {
      cmd : 'init'
   });
};
var encode = function(buf, scope)
{
   //console.debug("Encoder Data Buffer Len = " + buf.length);
   var mp3data = Lame.encode_buffer_ieee_float(mp3codec, buf, buf);
   //console.debug("#MP3 Encode");
   scope.postMessage(
   {
      cmd : 'data',
      buf : mp3data.data
   });
};
var finish = function(scope)
{
   //console.debug("Encoder Finish Message Received");
   var mp3data = Lame.encode_flush(mp3codec);
   //console.debug("#MP3 Complete");
   scope.postMessage(
   {
      cmd : 'end',
      buf : mp3data.data
   });
   Lame.close(mp3codec);
   mp3codec = null;
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
               inti(data.config, this.responseHandler);
               break;
            }
            case 'encode' :
            {
               encode(data.buf, this.responseHandler);
               break;
            }
            case 'finish' :
            {
               finish(this.responseHandler);
               break;
            }
         }
      },
      onmessage : Ext.emptyFn
   });
};

onmessage = function(e)
{
   var data = e.data;
   switch (data.cmd)
   {
      case 'init':
         init(data.config, self);
         break;
      case 'encode':
         encode(data.buf, self);
         break;
      case 'finish':
         finish(self);
         break;
   }
};
