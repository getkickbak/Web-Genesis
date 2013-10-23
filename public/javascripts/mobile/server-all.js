window.plugins = window.plugins ||
{
};

(function(cordova)
{
   var preLoadSendCommon =
   {
      _mobile : function(cntlr, checkUseProximity, proximityWin, win, fail)
      {
         var me = gblController, _viewport = cntlr.getViewPortCntlr(), callback = Ext.bind(function(useProximity, _cntlr, _win)
         {
            _win = _win || Ext.emptyFn;

            setLoadMask(false);
            Ext.defer(function()
            {
               if (useProximity === true)
               {
                  var proceed, cancel;
                  me.pendingBroadcast = true;
                  $('#earnPtsProceed').one('tap', proceed = function(e)
                  {
                     me.pendingBroadcast = false;
                     $('#earnPtsProceed').off('tap', proceed).off('click', proceed);
                     $('#earnPtsCancel').off('tap', cancel);
                     _win(useProximity);
                     return false;
                  }).one('click', proceed);
                  $('#earnPtsCancel').one('tap', cancel = function(e)
                  {
                     me.pendingBroadcast = false;
                     $('#earnPtsCancel').off('tap', cancel).off('click', cancel);
                     $('#earnPtsProceed').off('tap', proceed);
                     return false;
                  }).one('click', cancel);
                  $('#earnptspageview').trigger('kickbak:preLoad');
               }
               else
               {
                  $('#earnptspageview').trigger('kickbak:loyalty');
               }
            }, 0.25 * 1000, _cntlr);
         }, null, [cntlr, win], true);

         fail = fail || Ext.emptyFn;

         setLoadMask(true);
         //
         // Talk to server to see if we use Proximity Sensor or not
         //
         Ext.defer(function()
         {
            if (checkUseProximity)
            {
               $(document).one('locationupdate', function(position)
               {
                  proximityWin();
               });
               _viewport.getGeoLocation();
            }
            //
            // We must use Loyalty Card or Phone Number
            //
            else
            {
               try
               {
                  var merchant = _viewport.getVenue().getMerchant(), features_config = merchant.get('features_config');
                  //
                  // Check if the venue supports Proximity Sensor or not
                  //
                  if (features_config['enable_mobile'])
                  {
                     proximityWin();
                  }
                  else
                  {
                     callback(false);
                  }
               }
               catch(e)
               {
                  fail();
               }
            }
         }, 0.25 * 1000);

         return callback;
      },
      _native : function(cntlr, checkUseProximity, proximityWin, win, fail)
      {
         var _viewport = cntlr.getViewPortCntlr(), callback = Ext.bind(function(useProximity, _cntlr, _win)
         {
            var viewport = _cntlr.getViewPortCntlr(), _cleanup = function()
            {
               viewport.popUpInProgress = false;
               _cntlr._actions.hide();
               _cntlr._actions.destroy();
               delete _cntlr._actions;
            };

            _win = _win || Ext.emptyFn;

            Ext.Viewport.setMasked(null);
            Ext.defer(function()
            {
               if (!_cntlr._actions)
               {
                  _cntlr._actions = Ext.create('Genesis.view.widgets.PopupItemDetail', (useProximity === true) ?
                  {
                     iconType : 'prizewon',
                     icon : 'phoneInHand',
                     title : cntlr.showToServerMsg(),
                     buttons : [
                     {
                        text : 'Cancel',
                        ui : 'cancel',
                        handler : _cleanup
                     },
                     {
                        text : 'Proceed',
                        ui : 'action',
                        handler : function()
                        {
                           _cleanup();
                           _win(useProximity);
                        }
                     }]
                  } :
                  {
                     iconType : 'prizewon',
                     icon : 'loyaltycard',
                     title : cntlr.showToLoyaltyCardMsg(),
                     buttons : [
                     {
                        text : 'Dismiss',
                        ui : 'cancel',
                        handler : _cleanup
                     }]
                  });
                  Ext.Viewport.add(_cntlr._actions);
               }
               viewport.popUpInProgress = true;
               _cntlr._actions.show();
            }, 0.25 * 1000);
         }, null, [cntlr, win], true);

         fail = fail || Ext.emptyFn;

         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : cntlr.prepareToSendMerchantDeviceMsg
         });

         //
         // Talk to server to see if we use Proximity Sensor or not
         //
         Ext.defer(function()
         {
            if (checkUseProximity)
            {
               _viewport.on('locationupdate', function(position)
               {
                  proximityWin();
               }, null,
               {
                  single : true
               });
               _viewport.getGeoLocation();
            }
            //
            // We must use Loyalty Card or Phone Number
            //
            else
            {
               try
               {
                  var merchant = _viewport.getVenue().getMerchant(), features_config = merchant.get('features_config');
                  //
                  // Check if the venue supports Proximity Sensor or not
                  //
                  if (features_config['enable_mobile'])
                  {
                     proximityWin();
                  }
                  else
                  {
                     callback(false);
                  }
               }
               catch(e)
               {
                  fail();
               }
            }
         }, 0.25 * 1000);

         return callback;
      }
   };

   if (Genesis.fn.isNative())
   {
      window.plugins.proximityID =
      {
         init : function(s_vol_ratio, r_vol_ratio)
         {
            cordova.exec(function()
            {
               console.log("ProximityIDPlugin Initialized");
            }, function(reason)
            {
               console.log("Failed to initialize the ProximityIDPlugin! Reason[" + reason + "]");
            }, "ProximityIDPlugin", "init", [s_vol_ratio + "", r_vol_ratio + ""]);

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
         },
         preLoadSend : function(cntlr, checkUseProximity, win, fail)
         {
            var callback = preLoadSendCommon[(cntlr !== gblController)  ? '_native' : '_mobile'](cntlr, checkUseProximity, function()
            {
               //
               // To give loading mask a chance to render
               //
               Ext.defer(function()
               {
                  cordova.exec(function()
                  {
                     callback(true);
                  }, fail, "ProximityIDPlugin", "preLoadIdentity", []);
               }, 0.25 * 1000, this);
            }, win, fail);
         },
         send : function(win, fail)
         {
            cordova.exec(win, fail, "ProximityIDPlugin", "sendIdentity", []);
         },
         scan : function(win, fail, samples, missedThreshold, magThreshold, overlapRatio)
         {
            cordova.exec(win, fail, "ProximityIDPlugin", "scanIdentity", [samples, missedThreshold, magThreshold, overlapRatio]);
         },
         stop : function()
         {
            cordova.exec(function()
            {
               console.log("Stopped ProximityIDPlugin");
            }, function(reason)
            {
               console.log("Failed to stop the ProximityIDPlugin " + reason);
            }, "ProximityIDPlugin", "stop", []);
         },
         setVolume : function(vol)
         {
            cordova.exec(Ext.emptyFn, Ext.emptyFn, "ProximityIDPlugin", "setVolume", [vol]);
         }
      };

      cordova.addConstructor(function()
      {
      });
   }
   else
   {
      _filesAssetCount++;

      window.plugins.proximityID =
      {
         loFreq : 17000.0,
         hiFreq : 20000.0,
         FREQ_GAP : 500.0,
         NUM_SIGNALS : 3,
         SHORT_MAX : parseInt(0xFFFF / 2),
         sampleRate : 44100,
         duration : 1 * 44100,
         bufSize : 16 * 1024,
         bitRate : 128,
         MATCH_THRESHOLD : 2,
         bw : 0,
         sampleConfig : null,
         freqs : null,
         context : null,
         gainNode : null,
         oscillators : null,
         audio : null,
         bytesEncoded : null,
         unsupportedBrowserMsg : 'This browser does not support our Proximity Scanning feature',
         convertToMono : function(input)
         {
            var me = this;
            var splitter = me.context.createChannelSplitter(2);
            var merger = me.context.createChannelMerger(2);

            input.connect(splitter);
            splitter.connect(merger, 0, 0);
            splitter.connect(merger, 0, 1);
            return merger;
         },
         init : function(s_vol_ratio, r_vol_ratio)
         {
            var me = this;

            me.bw = (me.hiFreq - me.loFreq) / me.NUM_SIGNALS;

            Genesis.constants.s_vol = s_vol_ratio * 100;
            // Reduce volume by 50%
            Genesis.constants.r_vol = r_vol_ratio * 100;

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            console.debug("Initialized Proximity API");
         },
         b64toF32 : function(input)
         {
            var binary = atob(input);
            var len = binary.length;
            var buffer = new ArrayBuffer(len);
            var view = new Float32Array(buffer);
            /*
             while (--len)
             {
             view[len] = binary.charCodeAt(len);
             }
             */

            return view;
         },
         generateData : function(offset, length)
         {
            var me = this, i, c, s_vol = Genesis.constants.s_vol / 100, data = new Float32Array(length), _s_vol = s_vol;

            c = [];
            for ( i = 0; i < me.freqs.length; i++)
            {
               c[i] = 2 * Math.PI * me.freqs[i] / me.sampleRate;
            }
            for ( i = 0; i < length; i++)
            {
               //
               // Create Cross Fade
               //
               /*
               if ((i + offset) < (me.duration / 15))
               {
               _s_vol = s_vol * (i + offset + 1) / (me.duration / 15);
               }
               else if ((i + offset) > (me.duration * 8.5 / 10))
               {
               _s_vol = s_vol * 10 * (1 - ((i + offset + 1) / me.duration));
               }
               */
               // convert to 16 bit pcm sound array
               // assumes the sample buffer is normalised.
               for ( j = 0; j < (me.freqs.length); j++)
               {
                  data[i] += Math.sin(c[j] * (i + offset));
               }
               data[i] = _s_vol * data[i] / (me.freqs.length);
            }

            return data;
         },
         webAudioFnHandler : function(s_vol, callback)
         {
            var me = this, context = me.context, gain = me.gainNode;

            // Create the audio context
            if (!context)
            {
               context = me.context = new window.AudioContext();
               context.createGain = context.createGain || context.createGainNode;
               gain = me.gainNode = context.createGain();
               gain.connect(context.destination);
            }

            me.getFreqs();
            // Reduce the volume.
            gain.gain.value = s_vol;

            me.oscillators = [];
            for ( i = 0; i < me.freqs.length; i++)
            {
               var osc = me.oscillators[i] = context.createOscillator();
               osc.type = 0;
               osc.frequency.value = me.freqs[i];
               osc.connect(gain);
            }

            console.debug("OSC Gain : " + s_vol);

            callback(true);
         },
         audioFnHandler : function(config, s_vol, win)
         {
            var me = this, data = config['data'] = [], _s_vol = s_vol;
            me.getFreqs();

            for (var i = 0; i < (me.duration); i++)
            {
               var val = 0.0;
               //
               // Create Cross Fade
               //
               /*
               if (i < (me.duration / 15))
               {
               _s_vol = s_vol * (i + 1) / (me.duration / 15);
               }
               else if (i > (me.duration * 8.5 / 10))
               {
               _s_vol = s_vol * 10 * (1 - ((i + 1) / me.duration));
               }
               */
               // convert to 16 bit pcm sound array
               // assumes the sample buffer is normalised.
               for (var j = 0; j < me.freqs.length; j++)
               {
                  val += Math.sin(2 * Math.PI * me.freqs[j] * i / me.sampleRate);
               }
               val /= me.freqs.length;

               val = Math.round(_s_vol * ((me.SHORT_MAX + 1) + (val * me.SHORT_MAX)));
               data[i] = val;
            }

            //
            // Browser support WAV files
            //
            me.audio = new Audio(new RIFFWAVE(config).dataURI);
            me.audio.volume = 1.0;

            console.debug("WAV Gain : " + s_vol);

            win(true);
         },
         mp3WorkerFnHandler : function(e)
         {
            var me = this;

            switch (e.data.cmd)
            {
               case 'init' :
               {
                  me._duration = me.duration;
                  me.bytesEncoded = Math.min(me._duration, me.bufSize);
                  delete me.sampleConfig['data'];
                  //console.debug("MP3 Init");

                  _codec.postMessage(
                  {
                     cmd : 'encode',
                     buf : me.generateData(0, me.bytesEncoded)
                  });
                  break;
               }
               case 'data' :
               {
                  if (!me.sampleConfig['data'])
                  {
                     me.sampleConfig['data'] = String.fromCharCode.apply(null, e.data.buf);
                  }
                  else
                  {
                     me.sampleConfig['data'] += String.fromCharCode.apply(null, e.data.buf);
                  }
                  //console.debug("MP3 Encoded " + me.bytesEncoded + "bytes, returned " + e.data.buf.length + "bytes");

                  me._duration -= me.bytesEncoded;
                  if (me._duration > 0)
                  {
                     me.bytesEncoded = Math.min(me._duration, me.bufSize);
                     _codec.postMessage(
                     {
                        cmd : 'encode',
                        buf : me.generateData(me.duration - me._duration, me.bytesEncoded)
                     });
                  }
                  else
                  {
                     _codec.postMessage(
                     {
                        cmd : 'finish'
                     });
                  }
                  break;
               }
               case 'end' :
               {
                  me.sampleConfig['data'] += String.fromCharCode.apply(null, e.data.buf);
                  me.sampleConfig['data'] = 'data:audio/mpeg;base64,' + base64.encode(me.sampleConfig['data']);
                  //console.debug("Final MP3 File Length = " + me.sampleConfig['data'].length);
                  me.audio = new Audio(me.sampleConfig['data']);
                  me.audio.volume = 1.0;

                  console.debug("MP3 Gain : " + Genesis.constants.s_vol / 100);
                  me.sampleConfig['callback']();
                  delete me.sampleConfig;
               }
            }
         },
         mp3FnHandler : function(config, s_vol, useProximity, win)
         {
            var me = this;

            if (!_codec.onmessage || (_codec.onmessage == Ext.emptyFn))
            {
               _codec.onmessage = Ext.bind(me.mp3WorkerFnHandler, me);
            }

            me.getFreqs();

            config['callback'] = function()
            {
               win(true);
            };

            me.sampleConfig = config;

            _codec.postMessage(
            {
               cmd : 'init',
               config :
               {
                  samplerate : me.sampleRate,
                  bitrate : me.bitRate,
                  mode : 3, // MONO
                  channels : 1
               }
            });
         },
         getFreqs : function()
         {
            var me = this, stay, i;

            do
            {
               stay = false;
               for ( i = 0; i < me.NUM_SIGNALS - 1; i++)
               {
                  me.freqs[i] = //
                  parseInt(Math.random() * me.bw) + //
                  parseInt(i * me.bw) + //
                  parseInt(me.loFreq);
               }
               i = me.NUM_SIGNALS - 1;
               me.freqs[i] = //
               parseInt(Math.random() / 2 * me.bw) + //
               parseInt(i * me.bw) + //
               parseInt(me.loFreq);

               for ( i = 0; i < (me.NUM_SIGNALS - 1); i++)
               {
                  if ((me.freqs[i] + me.FREQ_GAP) > me.freqs[i + 1])
                  {
                     stay = true;
                     break;
                  }
               }
            } while (stay);
         },
         preLoadSend : function(cntlr, checkUseProximity, win, fail)
         {
            var me = this, s_vol = Genesis.constants.s_vol / 100, config =
            {
               header :
               {
                  sampleRate : me.sampleRate,
                  numChannels : 1,
                  bitsPerSample : 16
               },
               data : []
            };

            me.freqs = [];

            var callback = preLoadSendCommon['_mobile'](cntlr, checkUseProximity, function()
            {
               //
               // Use Web Audio
               //
               if ( typeof (window.AudioContext) != 'undefined')
               {
                  me.webAudioFnHandler(s_vol, callback);
               }
               else
               {
                  //
                  // Browser support WAV files
                  //
                  me.duration = 1 * 44100;
                  if (!_codec)
                  {
                     Ext.defer(me.audioFnHandler, 0.25 * 1000, me, [config, s_vol, callback]);
                  }
                  //
                  // Convert to MP3 first
                  //
                  else
                  {
                     Ext.defer(me.mp3FnHandler, 0.25 * 1000, me, [config, s_vol, callback]);
                  }
               }
            }, win, fail);
         },
         send : function(win, fail)
         {
            var me = this;

            if (me.oscillators)
            {
               for (var i = 0; i < me.freqs.length; i++)
               {
                  me.oscillators[i].noteOn && me.oscillators[i].noteOn(0);
               }
               win(
               {
                  freqs : me.freqs
               });
            }
            else if (me.audio)
            {
               me.audio.play();
               me.audioTimer = setInterval(function()
               {
                  if (me.audio.currentTime >= 0.95)
                  {
                     //console.log("Locating LocalID ...");
                     me.audio.currentTime = 0;
                  }
               }, 50);
               win(
               {
                  freqs : me.freqs
               });
            }
            else
            {
               fail();
            }
         },
         onFreqCalculated : function(freqs, error)
         {
            var me = this;

            if (freqs && me._onFreqSuccess)
            {
               me._onFreqSuccess(
               {
                  freqs : freqs
               });
            }
            else if (me._onFreqFail)
            {
               me._onFreqFail(error);
            }
            delete me._onFreqSuccess;
            delete me._onFreqFail;
         },
         scan : function(win, fail, samples, missedThreshold, magThreshold, overlapRatio)
         {
            var me = this, context = me.context;

            if (Genesis.fn.isNative())
            //if (true)
            {
               me.matchCount = 0;
               if (!me.fftWorker)
               {
                  var worker = me.fftWorker = new Worker('worker/fft.min.js');
                  worker.onmessage = function(e)
                  {
                     var i, result = eval('[' + e.data + ']')[0];
                     switch (result['cmd'])
                     {
                        case 'init':
                        {
                           console.debug("Local Identity Detector Initialized");
                           break;
                        }
                        case 'forward':
                        {
                           console.debug("Matching Freqs = [" + result['freqs'] + "]");

                           if (me.freqs)
                           {
                              for ( i = 0; i < result['freqs'].length; i++)
                              {
                                 if (me.freqs[i] != result['freqs'][i])
                                 {
                                    me.matchCount = -1;
                                    delete me.freqs;
                                    break;
                                 }
                              }

                              me.matchCount++;
                           }
                           else
                           {
                              me.freqs = result['freqs'];
                           }

                           if (me.matchCount >= me.MATCH_THRESHOLD)
                           {
                              me.matchCount = 0;
                              win(
                              {
                                 freqs : me.freqs
                              });
                           }
                           break;
                        }
                     }
                  };
                  worker.postMessage(
                  {
                     cmd : 'init',
                     config :
                     {
                        sampleRate : me.sampleRate,
                        fftSize : me.bufSize
                     }
                  });
               }

               if (!me.context)
               {
                  context = me.context = new window.AudioContext();
                  context.createScriptProcessor = context.createScriptProcessor || context.createJavaScriptNode;
               }

               if (!me.javascriptNode)
               {
                  // setup a javascript node
                  me.javascriptNode = context.createScriptProcessor(me.bufSize, 1, 1);
                  me.javascriptNode.onaudioprocess = function(e)
                  {
                     me.fftWorker.postMessage(
                     {
                        cmd : 'forward',
                        buf : e.inputBuffer.getChannelData(0)
                     });
                  };
               }

               if (navigator.webkitGetUserMedia)
               {
                  navigator.webkitGetUserMedia(
                  {
                     audio : true
                  }, function(stream)
                  {
                     if (me.microphone)
                     {
                        me.microphone.disconnect();
                     }
                     delete me.freqs;
                     me.javascriptNode.connect(me.context.destination);
                     me.microphone = me.convertToMono(context.createMediaStreamSource(stream));
                     me.microphone.connect(me.javascriptNode);
                     console.debug("Local Identity detecting host ...");
                  });
               }
               else
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Local Identity',
                     message : me.unsupportedBrowserMsg,
                     buttons : ['OK'],
                     callback : Ext.emptyFn
                  });
               }
            }
            //
            // Call Native code to get Data Stream
            //
            else if (merchantMode)
            {
               delete me.freqs;
               if (window.pos)
               {
                  window.pos.wssocket.send('proximityID_start' + Genesis.db.getLocalDB()['sensitivity']);
                  me._onFreqSuccess = win;
                  me._onFreqFail = fail;
               }
               else
               {
                  //
                  // Nothing to do, wait until POS connection is established before trying
                  //
               }
            }
         },
         stop : function()
         {
            var me = this;

            clearInterval(me.audioTimer);
            delete me.audioTimer;

            if (me.oscillators)
            {
               for (var i = 0; i < me.freqs.length; i++)
               {
                  me.oscillators[i].disconnect();
               }
               delete me.oscillators;
            }
            else if (me.audio)
            {
               me.audio.pause();
               me.audio.currentTime = 0;
               delete me.audio;
            }

            if (me.microphone)
            {
               me.javascriptNode.disconnect();
               me.microphone.disconnect();
               delete me.microphone;
            }

            if (!Genesis.fn.isNative() && merchantMode)
            {
               if (window.pos)
               {
                  me.incomingDataExpected = false;
                  window.pos.wssocket.send('proximityID_stop');
               }
            }
         },
         setVolume : function(vol)
         {
            var me = this;
            if (me.context)
            {
               if (me.gainNode)
               {
                  // Set the volume.
                  me.gainNode.gain.value = Math.max(0, vol / 100);
               }
            }
            else if (me.audio)
            {
               me.audio.volume = vol / 100;
            }

         }
      };
   }
})(window.cordova || window.Cordova || window.PhoneGap);
var LowLatencyAudio =
{

   preloadFX : function(id, assetPath, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "preloadFX", [id, assetPath]);
   },

   preloadAudio : function(id, assetPath, voices, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "preloadAudio", [id, assetPath, voices]);
   },

   play : function(id, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "play", [id]);
   },

   stop : function(id, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "stop", [id]);
   },

   loop : function(id, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "loop", [id]);
   },

   unload : function(id, success, fail)
   {
      return cordova.exec(success, fail, "LowLatencyAudio", "unload", [id]);
   }
}; /**
* @license Gibberish-AES 
* A lightweight Javascript Libray for OpenSSL compatible AES CBC encryption.
*
* Author: Mark Percival
* Email: mark@mpercival.com
* Copyright: Mark Percival - http://mpercival.com 2008
*
* With thanks to:
* Josh Davis - http://www.josh-davis.org/ecmaScrypt
* Chris Veness - http://www.movable-type.co.uk/scripts/aes.html
* Michel I. Gallant - http://www.jensign.com/
*
* License: MIT
*
* Usage: GibberishAES.enc("secret", "password")
* Outputs: AES Encrypted text encoded in Base64
*/


window.GibberishAES = (function(){
    var Nr = 14,
    /* Default to 256 Bit Encryption */
    Nk = 8,
    Decrypt = false,

    enc_utf8 = function(s)
    {
        try {
            return unescape(encodeURIComponent(s));
        }
        catch(e) {
            throw 'Error on UTF-8 encode';
        }
    },

    dec_utf8 = function(s)
    {
        try {
            return decodeURIComponent(escape(s));
        }
        catch(e) {
            throw ('Bad Key');
        }
    },

    padBlock = function(byteArr)
    {
        var array = [], cpad, i;
        if (byteArr.length < 16) {
            cpad = 16 - byteArr.length;
            array = [cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad];
        }
        for (i = 0; i < byteArr.length; i++)
        {
            array[i] = byteArr[i];
        }
        return array;
    },

    block2s = function(block, lastBlock)
    {
        var string = '', padding, i;
        if (lastBlock) {
            padding = block[15];
            if (padding > 16) {
                throw ('Decryption error: Maybe bad key');
            }
            if (padding == 16) {
                return '';
            }
            for (i = 0; i < 16 - padding; i++) {
                string += String.fromCharCode(block[i]);
            }
        } else {
            for (i = 0; i < 16; i++) {
                string += String.fromCharCode(block[i]);
            }
        }
        return string;
    },

    a2h = function(numArr)
    {
        var string = '', i;
        for (i = 0; i < numArr.length; i++) {
            string += (numArr[i] < 16 ? '0': '') + numArr[i].toString(16);
        }
        return string;
    },

    h2a = function(s)
    {
        var ret = [];
        s.replace(/(..)/g,
        function(s) {
            ret.push(parseInt(s, 16));
        });
        return ret;
    },

    s2a = function(string, binary) {
        var array = [], i;

        if (! binary) {
            string = enc_utf8(string);
        }

        for (i = 0; i < string.length; i++)
        {
            array[i] = string.charCodeAt(i);
        }

        return array;
    },

    size = function(newsize)
    {
        switch (newsize)
        {
        case 128:
            Nr = 10;
            Nk = 4;
            break;
        case 192:
            Nr = 12;
            Nk = 6;
            break;
        case 256:
            Nr = 14;
            Nk = 8;
            break;
        default:
            throw ('Invalid Key Size Specified:' + newsize);
        }
    },

    randArr = function(num) {
        var result = [], i;
        for (i = 0; i < num; i++) {
            result = result.concat(Math.floor(Math.random() * 256));
        }
        return result;
    },

    openSSLKey = function(passwordArr, saltArr) {
        // Number of rounds depends on the size of the AES in use
        // 3 rounds for 256
        //        2 rounds for the key, 1 for the IV
        // 2 rounds for 128
        //        1 round for the key, 1 round for the IV
        // 3 rounds for 192 since it's not evenly divided by 128 bits
        var rounds = Nr >= 12 ? 3: 2,
        key = [],
        iv = [],
        md5_hash = [],
        result = [],
        data00 = passwordArr.concat(saltArr),
        i;
        md5_hash[0] = GibberishAES.Hash.MD5(data00);
        result = md5_hash[0];
        for (i = 1; i < rounds; i++) {
            md5_hash[i] = GibberishAES.Hash.MD5(md5_hash[i - 1].concat(data00));
            result = result.concat(md5_hash[i]);
        }
        key = result.slice(0, 4 * Nk);
        iv = result.slice(4 * Nk, 4 * Nk + 16);
        return {
            key: key,
            iv: iv
        };
    },

    rawEncrypt = function(plaintext, key, iv) {
        // plaintext, key and iv as byte arrays
        key = expandKey(key);
        var numBlocks = Math.ceil(plaintext.length / 16),
        blocks = [],
        i,
        cipherBlocks = [];
        for (i = 0; i < numBlocks; i++) {
            blocks[i] = padBlock(plaintext.slice(i * 16, i * 16 + 16));
        }
        if (plaintext.length % 16 === 0) {
            blocks.push([16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]);
            // CBC OpenSSL padding scheme
            numBlocks++;
        }
        for (i = 0; i < blocks.length; i++) {
            blocks[i] = (i === 0) ? xorBlocks(blocks[i], iv) : xorBlocks(blocks[i], cipherBlocks[i - 1]);
            cipherBlocks[i] = encryptBlock(blocks[i], key);
        }
        return cipherBlocks;
    },

    rawDecrypt = function(cryptArr, key, iv, binary) {
        //  cryptArr, key and iv as byte arrays
        key = expandKey(key);
        var numBlocks = cryptArr.length / 16,
        cipherBlocks = [],
        i,
        plainBlocks = [],
        string = '';
        for (i = 0; i < numBlocks; i++) {
            cipherBlocks.push(cryptArr.slice(i * 16, (i + 1) * 16));
        }
        for (i = cipherBlocks.length - 1; i >= 0; i--) {
            plainBlocks[i] = decryptBlock(cipherBlocks[i], key);
            plainBlocks[i] = (i === 0) ? xorBlocks(plainBlocks[i], iv) : xorBlocks(plainBlocks[i], cipherBlocks[i - 1]);
        }
        for (i = 0; i < numBlocks - 1; i++) {
            string += block2s(plainBlocks[i]);
        }
        string += block2s(plainBlocks[i], true);
        return binary ? string : dec_utf8(string); 
    },

    encryptBlock = function(block, words) {
        Decrypt = false;
        var state = addRoundKey(block, words, 0),
        round;
        for (round = 1; round < (Nr + 1); round++) {
            state = subBytes(state);
            state = shiftRows(state);
            if (round < Nr) {
                state = mixColumns(state);
            }
            //last round? don't mixColumns
            state = addRoundKey(state, words, round);
        }

        return state;
    },

    decryptBlock = function(block, words) {
        Decrypt = true;
        var state = addRoundKey(block, words, Nr),
        round;
        for (round = Nr - 1; round > -1; round--) {
            state = shiftRows(state);
            state = subBytes(state);
            state = addRoundKey(state, words, round);
            if (round > 0) {
                state = mixColumns(state);
            }
            //last round? don't mixColumns
        }

        return state;
    },

    subBytes = function(state) {
        var S = Decrypt ? SBoxInv: SBox,
        temp = [],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = S[state[i]];
        }
        return temp;
    },

    shiftRows = function(state) {
        var temp = [],
        shiftBy = Decrypt ? [0, 13, 10, 7, 4, 1, 14, 11, 8, 5, 2, 15, 12, 9, 6, 3] : [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = state[shiftBy[i]];
        }
        return temp;
    },

    mixColumns = function(state) {
        var t = [],
        c;
        if (!Decrypt) {
            for (c = 0; c < 4; c++) {
                t[c * 4] = G2X[state[c * 4]] ^ G3X[state[1 + c * 4]] ^ state[2 + c * 4] ^ state[3 + c * 4];
                t[1 + c * 4] = state[c * 4] ^ G2X[state[1 + c * 4]] ^ G3X[state[2 + c * 4]] ^ state[3 + c * 4];
                t[2 + c * 4] = state[c * 4] ^ state[1 + c * 4] ^ G2X[state[2 + c * 4]] ^ G3X[state[3 + c * 4]];
                t[3 + c * 4] = G3X[state[c * 4]] ^ state[1 + c * 4] ^ state[2 + c * 4] ^ G2X[state[3 + c * 4]];
            }
        }else {
            for (c = 0; c < 4; c++) {
                t[c*4] = GEX[state[c*4]] ^ GBX[state[1+c*4]] ^ GDX[state[2+c*4]] ^ G9X[state[3+c*4]];
                t[1+c*4] = G9X[state[c*4]] ^ GEX[state[1+c*4]] ^ GBX[state[2+c*4]] ^ GDX[state[3+c*4]];
                t[2+c*4] = GDX[state[c*4]] ^ G9X[state[1+c*4]] ^ GEX[state[2+c*4]] ^ GBX[state[3+c*4]];
                t[3+c*4] = GBX[state[c*4]] ^ GDX[state[1+c*4]] ^ G9X[state[2+c*4]] ^ GEX[state[3+c*4]];
            }
        }
        
        return t;
    },

    addRoundKey = function(state, words, round) {
        var temp = [],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = state[i] ^ words[round][i];
        }
        return temp;
    },

    xorBlocks = function(block1, block2) {
        var temp = [],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = block1[i] ^ block2[i];
        }
        return temp;
    },

    expandKey = function(key) {
        // Expects a 1d number array
        var w = [],
        temp = [],
        i,
        r,
        t,
        flat = [],
        j;

        for (i = 0; i < Nk; i++) {
            r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
            w[i] = r;
        }

        for (i = Nk; i < (4 * (Nr + 1)); i++) {
            w[i] = [];
            for (t = 0; t < 4; t++) {
                temp[t] = w[i - 1][t];
            }
            if (i % Nk === 0) {
                temp = subWord(rotWord(temp));
                temp[0] ^= Rcon[i / Nk - 1];
            } else if (Nk > 6 && i % Nk == 4) {
                temp = subWord(temp);
            }
            for (t = 0; t < 4; t++) {
                w[i][t] = w[i - Nk][t] ^ temp[t];
            }
        }
        for (i = 0; i < (Nr + 1); i++) {
            flat[i] = [];
            for (j = 0; j < 4; j++) {
                flat[i].push(w[i * 4 + j][0], w[i * 4 + j][1], w[i * 4 + j][2], w[i * 4 + j][3]);
            }
        }
        return flat;
    },

    subWord = function(w) {
        // apply SBox to 4-byte word w
        for (var i = 0; i < 4; i++) {
            w[i] = SBox[w[i]];
        }
        return w;
    },

    rotWord = function(w) {
        // rotate 4-byte word w left by one byte
        var tmp = w[0],
        i;
        for (i = 0; i < 4; i++) {
            w[i] = w[i + 1];
        }
        w[3] = tmp;
        return w;
    },


    // S-box
    SBox = [
    99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171,
    118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164,
    114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113,
    216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226,
    235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214,
    179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203,
    190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69,
    249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245,
    188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68,
    23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42,
    144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73,
    6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109,
    141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37,
    46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62,
    181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225,
    248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223,
    140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187,
    22],

    // Precomputed lookup table for the inverse SBox
    SBoxInv = [
    82, 9, 106, 213, 48, 54, 165, 56, 191, 64, 163, 158, 129, 243, 215,
    251, 124, 227, 57, 130, 155, 47, 255, 135, 52, 142, 67, 68, 196, 222,
    233, 203, 84, 123, 148, 50, 166, 194, 35, 61, 238, 76, 149, 11, 66,
    250, 195, 78, 8, 46, 161, 102, 40, 217, 36, 178, 118, 91, 162, 73,
    109, 139, 209, 37, 114, 248, 246, 100, 134, 104, 152, 22, 212, 164, 92,
    204, 93, 101, 182, 146, 108, 112, 72, 80, 253, 237, 185, 218, 94, 21,
    70, 87, 167, 141, 157, 132, 144, 216, 171, 0, 140, 188, 211, 10, 247,
    228, 88, 5, 184, 179, 69, 6, 208, 44, 30, 143, 202, 63, 15, 2,
    193, 175, 189, 3, 1, 19, 138, 107, 58, 145, 17, 65, 79, 103, 220,
    234, 151, 242, 207, 206, 240, 180, 230, 115, 150, 172, 116, 34, 231, 173,
    53, 133, 226, 249, 55, 232, 28, 117, 223, 110, 71, 241, 26, 113, 29,
    41, 197, 137, 111, 183, 98, 14, 170, 24, 190, 27, 252, 86, 62, 75,
    198, 210, 121, 32, 154, 219, 192, 254, 120, 205, 90, 244, 31, 221, 168,
    51, 136, 7, 199, 49, 177, 18, 16, 89, 39, 128, 236, 95, 96, 81,
    127, 169, 25, 181, 74, 13, 45, 229, 122, 159, 147, 201, 156, 239, 160,
    224, 59, 77, 174, 42, 245, 176, 200, 235, 187, 60, 131, 83, 153, 97,
    23, 43, 4, 126, 186, 119, 214, 38, 225, 105, 20, 99, 85, 33, 12,
    125],
    // Rijndael Rcon
    Rcon = [1, 2, 4, 8, 16, 32, 64, 128, 27, 54, 108, 216, 171, 77, 154, 47, 94,
    188, 99, 198, 151, 53, 106, 212, 179, 125, 250, 239, 197, 145],

    G2X = [
    0x00, 0x02, 0x04, 0x06, 0x08, 0x0a, 0x0c, 0x0e, 0x10, 0x12, 0x14, 0x16,
    0x18, 0x1a, 0x1c, 0x1e, 0x20, 0x22, 0x24, 0x26, 0x28, 0x2a, 0x2c, 0x2e,
    0x30, 0x32, 0x34, 0x36, 0x38, 0x3a, 0x3c, 0x3e, 0x40, 0x42, 0x44, 0x46,
    0x48, 0x4a, 0x4c, 0x4e, 0x50, 0x52, 0x54, 0x56, 0x58, 0x5a, 0x5c, 0x5e,
    0x60, 0x62, 0x64, 0x66, 0x68, 0x6a, 0x6c, 0x6e, 0x70, 0x72, 0x74, 0x76,
    0x78, 0x7a, 0x7c, 0x7e, 0x80, 0x82, 0x84, 0x86, 0x88, 0x8a, 0x8c, 0x8e,
    0x90, 0x92, 0x94, 0x96, 0x98, 0x9a, 0x9c, 0x9e, 0xa0, 0xa2, 0xa4, 0xa6,
    0xa8, 0xaa, 0xac, 0xae, 0xb0, 0xb2, 0xb4, 0xb6, 0xb8, 0xba, 0xbc, 0xbe,
    0xc0, 0xc2, 0xc4, 0xc6, 0xc8, 0xca, 0xcc, 0xce, 0xd0, 0xd2, 0xd4, 0xd6,
    0xd8, 0xda, 0xdc, 0xde, 0xe0, 0xe2, 0xe4, 0xe6, 0xe8, 0xea, 0xec, 0xee,
    0xf0, 0xf2, 0xf4, 0xf6, 0xf8, 0xfa, 0xfc, 0xfe, 0x1b, 0x19, 0x1f, 0x1d,
    0x13, 0x11, 0x17, 0x15, 0x0b, 0x09, 0x0f, 0x0d, 0x03, 0x01, 0x07, 0x05,
    0x3b, 0x39, 0x3f, 0x3d, 0x33, 0x31, 0x37, 0x35, 0x2b, 0x29, 0x2f, 0x2d,
    0x23, 0x21, 0x27, 0x25, 0x5b, 0x59, 0x5f, 0x5d, 0x53, 0x51, 0x57, 0x55,
    0x4b, 0x49, 0x4f, 0x4d, 0x43, 0x41, 0x47, 0x45, 0x7b, 0x79, 0x7f, 0x7d,
    0x73, 0x71, 0x77, 0x75, 0x6b, 0x69, 0x6f, 0x6d, 0x63, 0x61, 0x67, 0x65,
    0x9b, 0x99, 0x9f, 0x9d, 0x93, 0x91, 0x97, 0x95, 0x8b, 0x89, 0x8f, 0x8d,
    0x83, 0x81, 0x87, 0x85, 0xbb, 0xb9, 0xbf, 0xbd, 0xb3, 0xb1, 0xb7, 0xb5,
    0xab, 0xa9, 0xaf, 0xad, 0xa3, 0xa1, 0xa7, 0xa5, 0xdb, 0xd9, 0xdf, 0xdd,
    0xd3, 0xd1, 0xd7, 0xd5, 0xcb, 0xc9, 0xcf, 0xcd, 0xc3, 0xc1, 0xc7, 0xc5,
    0xfb, 0xf9, 0xff, 0xfd, 0xf3, 0xf1, 0xf7, 0xf5, 0xeb, 0xe9, 0xef, 0xed,
    0xe3, 0xe1, 0xe7, 0xe5
    ],

    G3X = [
    0x00, 0x03, 0x06, 0x05, 0x0c, 0x0f, 0x0a, 0x09, 0x18, 0x1b, 0x1e, 0x1d,
    0x14, 0x17, 0x12, 0x11, 0x30, 0x33, 0x36, 0x35, 0x3c, 0x3f, 0x3a, 0x39,
    0x28, 0x2b, 0x2e, 0x2d, 0x24, 0x27, 0x22, 0x21, 0x60, 0x63, 0x66, 0x65,
    0x6c, 0x6f, 0x6a, 0x69, 0x78, 0x7b, 0x7e, 0x7d, 0x74, 0x77, 0x72, 0x71,
    0x50, 0x53, 0x56, 0x55, 0x5c, 0x5f, 0x5a, 0x59, 0x48, 0x4b, 0x4e, 0x4d,
    0x44, 0x47, 0x42, 0x41, 0xc0, 0xc3, 0xc6, 0xc5, 0xcc, 0xcf, 0xca, 0xc9,
    0xd8, 0xdb, 0xde, 0xdd, 0xd4, 0xd7, 0xd2, 0xd1, 0xf0, 0xf3, 0xf6, 0xf5,
    0xfc, 0xff, 0xfa, 0xf9, 0xe8, 0xeb, 0xee, 0xed, 0xe4, 0xe7, 0xe2, 0xe1,
    0xa0, 0xa3, 0xa6, 0xa5, 0xac, 0xaf, 0xaa, 0xa9, 0xb8, 0xbb, 0xbe, 0xbd,
    0xb4, 0xb7, 0xb2, 0xb1, 0x90, 0x93, 0x96, 0x95, 0x9c, 0x9f, 0x9a, 0x99,
    0x88, 0x8b, 0x8e, 0x8d, 0x84, 0x87, 0x82, 0x81, 0x9b, 0x98, 0x9d, 0x9e,
    0x97, 0x94, 0x91, 0x92, 0x83, 0x80, 0x85, 0x86, 0x8f, 0x8c, 0x89, 0x8a,
    0xab, 0xa8, 0xad, 0xae, 0xa7, 0xa4, 0xa1, 0xa2, 0xb3, 0xb0, 0xb5, 0xb6,
    0xbf, 0xbc, 0xb9, 0xba, 0xfb, 0xf8, 0xfd, 0xfe, 0xf7, 0xf4, 0xf1, 0xf2,
    0xe3, 0xe0, 0xe5, 0xe6, 0xef, 0xec, 0xe9, 0xea, 0xcb, 0xc8, 0xcd, 0xce,
    0xc7, 0xc4, 0xc1, 0xc2, 0xd3, 0xd0, 0xd5, 0xd6, 0xdf, 0xdc, 0xd9, 0xda,
    0x5b, 0x58, 0x5d, 0x5e, 0x57, 0x54, 0x51, 0x52, 0x43, 0x40, 0x45, 0x46,
    0x4f, 0x4c, 0x49, 0x4a, 0x6b, 0x68, 0x6d, 0x6e, 0x67, 0x64, 0x61, 0x62,
    0x73, 0x70, 0x75, 0x76, 0x7f, 0x7c, 0x79, 0x7a, 0x3b, 0x38, 0x3d, 0x3e,
    0x37, 0x34, 0x31, 0x32, 0x23, 0x20, 0x25, 0x26, 0x2f, 0x2c, 0x29, 0x2a,
    0x0b, 0x08, 0x0d, 0x0e, 0x07, 0x04, 0x01, 0x02, 0x13, 0x10, 0x15, 0x16,
    0x1f, 0x1c, 0x19, 0x1a
    ],

    G9X = [
    0x00, 0x09, 0x12, 0x1b, 0x24, 0x2d, 0x36, 0x3f, 0x48, 0x41, 0x5a, 0x53,
    0x6c, 0x65, 0x7e, 0x77, 0x90, 0x99, 0x82, 0x8b, 0xb4, 0xbd, 0xa6, 0xaf,
    0xd8, 0xd1, 0xca, 0xc3, 0xfc, 0xf5, 0xee, 0xe7, 0x3b, 0x32, 0x29, 0x20,
    0x1f, 0x16, 0x0d, 0x04, 0x73, 0x7a, 0x61, 0x68, 0x57, 0x5e, 0x45, 0x4c,
    0xab, 0xa2, 0xb9, 0xb0, 0x8f, 0x86, 0x9d, 0x94, 0xe3, 0xea, 0xf1, 0xf8,
    0xc7, 0xce, 0xd5, 0xdc, 0x76, 0x7f, 0x64, 0x6d, 0x52, 0x5b, 0x40, 0x49,
    0x3e, 0x37, 0x2c, 0x25, 0x1a, 0x13, 0x08, 0x01, 0xe6, 0xef, 0xf4, 0xfd,
    0xc2, 0xcb, 0xd0, 0xd9, 0xae, 0xa7, 0xbc, 0xb5, 0x8a, 0x83, 0x98, 0x91,
    0x4d, 0x44, 0x5f, 0x56, 0x69, 0x60, 0x7b, 0x72, 0x05, 0x0c, 0x17, 0x1e,
    0x21, 0x28, 0x33, 0x3a, 0xdd, 0xd4, 0xcf, 0xc6, 0xf9, 0xf0, 0xeb, 0xe2,
    0x95, 0x9c, 0x87, 0x8e, 0xb1, 0xb8, 0xa3, 0xaa, 0xec, 0xe5, 0xfe, 0xf7,
    0xc8, 0xc1, 0xda, 0xd3, 0xa4, 0xad, 0xb6, 0xbf, 0x80, 0x89, 0x92, 0x9b,
    0x7c, 0x75, 0x6e, 0x67, 0x58, 0x51, 0x4a, 0x43, 0x34, 0x3d, 0x26, 0x2f,
    0x10, 0x19, 0x02, 0x0b, 0xd7, 0xde, 0xc5, 0xcc, 0xf3, 0xfa, 0xe1, 0xe8,
    0x9f, 0x96, 0x8d, 0x84, 0xbb, 0xb2, 0xa9, 0xa0, 0x47, 0x4e, 0x55, 0x5c,
    0x63, 0x6a, 0x71, 0x78, 0x0f, 0x06, 0x1d, 0x14, 0x2b, 0x22, 0x39, 0x30,
    0x9a, 0x93, 0x88, 0x81, 0xbe, 0xb7, 0xac, 0xa5, 0xd2, 0xdb, 0xc0, 0xc9,
    0xf6, 0xff, 0xe4, 0xed, 0x0a, 0x03, 0x18, 0x11, 0x2e, 0x27, 0x3c, 0x35,
    0x42, 0x4b, 0x50, 0x59, 0x66, 0x6f, 0x74, 0x7d, 0xa1, 0xa8, 0xb3, 0xba,
    0x85, 0x8c, 0x97, 0x9e, 0xe9, 0xe0, 0xfb, 0xf2, 0xcd, 0xc4, 0xdf, 0xd6,
    0x31, 0x38, 0x23, 0x2a, 0x15, 0x1c, 0x07, 0x0e, 0x79, 0x70, 0x6b, 0x62,
    0x5d, 0x54, 0x4f, 0x46
    ],

    GBX = [
    0x00, 0x0b, 0x16, 0x1d, 0x2c, 0x27, 0x3a, 0x31, 0x58, 0x53, 0x4e, 0x45,
    0x74, 0x7f, 0x62, 0x69, 0xb0, 0xbb, 0xa6, 0xad, 0x9c, 0x97, 0x8a, 0x81,
    0xe8, 0xe3, 0xfe, 0xf5, 0xc4, 0xcf, 0xd2, 0xd9, 0x7b, 0x70, 0x6d, 0x66,
    0x57, 0x5c, 0x41, 0x4a, 0x23, 0x28, 0x35, 0x3e, 0x0f, 0x04, 0x19, 0x12,
    0xcb, 0xc0, 0xdd, 0xd6, 0xe7, 0xec, 0xf1, 0xfa, 0x93, 0x98, 0x85, 0x8e,
    0xbf, 0xb4, 0xa9, 0xa2, 0xf6, 0xfd, 0xe0, 0xeb, 0xda, 0xd1, 0xcc, 0xc7,
    0xae, 0xa5, 0xb8, 0xb3, 0x82, 0x89, 0x94, 0x9f, 0x46, 0x4d, 0x50, 0x5b,
    0x6a, 0x61, 0x7c, 0x77, 0x1e, 0x15, 0x08, 0x03, 0x32, 0x39, 0x24, 0x2f,
    0x8d, 0x86, 0x9b, 0x90, 0xa1, 0xaa, 0xb7, 0xbc, 0xd5, 0xde, 0xc3, 0xc8,
    0xf9, 0xf2, 0xef, 0xe4, 0x3d, 0x36, 0x2b, 0x20, 0x11, 0x1a, 0x07, 0x0c,
    0x65, 0x6e, 0x73, 0x78, 0x49, 0x42, 0x5f, 0x54, 0xf7, 0xfc, 0xe1, 0xea,
    0xdb, 0xd0, 0xcd, 0xc6, 0xaf, 0xa4, 0xb9, 0xb2, 0x83, 0x88, 0x95, 0x9e,
    0x47, 0x4c, 0x51, 0x5a, 0x6b, 0x60, 0x7d, 0x76, 0x1f, 0x14, 0x09, 0x02,
    0x33, 0x38, 0x25, 0x2e, 0x8c, 0x87, 0x9a, 0x91, 0xa0, 0xab, 0xb6, 0xbd,
    0xd4, 0xdf, 0xc2, 0xc9, 0xf8, 0xf3, 0xee, 0xe5, 0x3c, 0x37, 0x2a, 0x21,
    0x10, 0x1b, 0x06, 0x0d, 0x64, 0x6f, 0x72, 0x79, 0x48, 0x43, 0x5e, 0x55,
    0x01, 0x0a, 0x17, 0x1c, 0x2d, 0x26, 0x3b, 0x30, 0x59, 0x52, 0x4f, 0x44,
    0x75, 0x7e, 0x63, 0x68, 0xb1, 0xba, 0xa7, 0xac, 0x9d, 0x96, 0x8b, 0x80,
    0xe9, 0xe2, 0xff, 0xf4, 0xc5, 0xce, 0xd3, 0xd8, 0x7a, 0x71, 0x6c, 0x67,
    0x56, 0x5d, 0x40, 0x4b, 0x22, 0x29, 0x34, 0x3f, 0x0e, 0x05, 0x18, 0x13,
    0xca, 0xc1, 0xdc, 0xd7, 0xe6, 0xed, 0xf0, 0xfb, 0x92, 0x99, 0x84, 0x8f,
    0xbe, 0xb5, 0xa8, 0xa3
    ],

    GDX = [
    0x00, 0x0d, 0x1a, 0x17, 0x34, 0x39, 0x2e, 0x23, 0x68, 0x65, 0x72, 0x7f,
    0x5c, 0x51, 0x46, 0x4b, 0xd0, 0xdd, 0xca, 0xc7, 0xe4, 0xe9, 0xfe, 0xf3,
    0xb8, 0xb5, 0xa2, 0xaf, 0x8c, 0x81, 0x96, 0x9b, 0xbb, 0xb6, 0xa1, 0xac,
    0x8f, 0x82, 0x95, 0x98, 0xd3, 0xde, 0xc9, 0xc4, 0xe7, 0xea, 0xfd, 0xf0,
    0x6b, 0x66, 0x71, 0x7c, 0x5f, 0x52, 0x45, 0x48, 0x03, 0x0e, 0x19, 0x14,
    0x37, 0x3a, 0x2d, 0x20, 0x6d, 0x60, 0x77, 0x7a, 0x59, 0x54, 0x43, 0x4e,
    0x05, 0x08, 0x1f, 0x12, 0x31, 0x3c, 0x2b, 0x26, 0xbd, 0xb0, 0xa7, 0xaa,
    0x89, 0x84, 0x93, 0x9e, 0xd5, 0xd8, 0xcf, 0xc2, 0xe1, 0xec, 0xfb, 0xf6,
    0xd6, 0xdb, 0xcc, 0xc1, 0xe2, 0xef, 0xf8, 0xf5, 0xbe, 0xb3, 0xa4, 0xa9,
    0x8a, 0x87, 0x90, 0x9d, 0x06, 0x0b, 0x1c, 0x11, 0x32, 0x3f, 0x28, 0x25,
    0x6e, 0x63, 0x74, 0x79, 0x5a, 0x57, 0x40, 0x4d, 0xda, 0xd7, 0xc0, 0xcd,
    0xee, 0xe3, 0xf4, 0xf9, 0xb2, 0xbf, 0xa8, 0xa5, 0x86, 0x8b, 0x9c, 0x91,
    0x0a, 0x07, 0x10, 0x1d, 0x3e, 0x33, 0x24, 0x29, 0x62, 0x6f, 0x78, 0x75,
    0x56, 0x5b, 0x4c, 0x41, 0x61, 0x6c, 0x7b, 0x76, 0x55, 0x58, 0x4f, 0x42,
    0x09, 0x04, 0x13, 0x1e, 0x3d, 0x30, 0x27, 0x2a, 0xb1, 0xbc, 0xab, 0xa6,
    0x85, 0x88, 0x9f, 0x92, 0xd9, 0xd4, 0xc3, 0xce, 0xed, 0xe0, 0xf7, 0xfa,
    0xb7, 0xba, 0xad, 0xa0, 0x83, 0x8e, 0x99, 0x94, 0xdf, 0xd2, 0xc5, 0xc8,
    0xeb, 0xe6, 0xf1, 0xfc, 0x67, 0x6a, 0x7d, 0x70, 0x53, 0x5e, 0x49, 0x44,
    0x0f, 0x02, 0x15, 0x18, 0x3b, 0x36, 0x21, 0x2c, 0x0c, 0x01, 0x16, 0x1b,
    0x38, 0x35, 0x22, 0x2f, 0x64, 0x69, 0x7e, 0x73, 0x50, 0x5d, 0x4a, 0x47,
    0xdc, 0xd1, 0xc6, 0xcb, 0xe8, 0xe5, 0xf2, 0xff, 0xb4, 0xb9, 0xae, 0xa3,
    0x80, 0x8d, 0x9a, 0x97
    ],

    GEX = [
    0x00, 0x0e, 0x1c, 0x12, 0x38, 0x36, 0x24, 0x2a, 0x70, 0x7e, 0x6c, 0x62,
    0x48, 0x46, 0x54, 0x5a, 0xe0, 0xee, 0xfc, 0xf2, 0xd8, 0xd6, 0xc4, 0xca,
    0x90, 0x9e, 0x8c, 0x82, 0xa8, 0xa6, 0xb4, 0xba, 0xdb, 0xd5, 0xc7, 0xc9,
    0xe3, 0xed, 0xff, 0xf1, 0xab, 0xa5, 0xb7, 0xb9, 0x93, 0x9d, 0x8f, 0x81,
    0x3b, 0x35, 0x27, 0x29, 0x03, 0x0d, 0x1f, 0x11, 0x4b, 0x45, 0x57, 0x59,
    0x73, 0x7d, 0x6f, 0x61, 0xad, 0xa3, 0xb1, 0xbf, 0x95, 0x9b, 0x89, 0x87,
    0xdd, 0xd3, 0xc1, 0xcf, 0xe5, 0xeb, 0xf9, 0xf7, 0x4d, 0x43, 0x51, 0x5f,
    0x75, 0x7b, 0x69, 0x67, 0x3d, 0x33, 0x21, 0x2f, 0x05, 0x0b, 0x19, 0x17,
    0x76, 0x78, 0x6a, 0x64, 0x4e, 0x40, 0x52, 0x5c, 0x06, 0x08, 0x1a, 0x14,
    0x3e, 0x30, 0x22, 0x2c, 0x96, 0x98, 0x8a, 0x84, 0xae, 0xa0, 0xb2, 0xbc,
    0xe6, 0xe8, 0xfa, 0xf4, 0xde, 0xd0, 0xc2, 0xcc, 0x41, 0x4f, 0x5d, 0x53,
    0x79, 0x77, 0x65, 0x6b, 0x31, 0x3f, 0x2d, 0x23, 0x09, 0x07, 0x15, 0x1b,
    0xa1, 0xaf, 0xbd, 0xb3, 0x99, 0x97, 0x85, 0x8b, 0xd1, 0xdf, 0xcd, 0xc3,
    0xe9, 0xe7, 0xf5, 0xfb, 0x9a, 0x94, 0x86, 0x88, 0xa2, 0xac, 0xbe, 0xb0,
    0xea, 0xe4, 0xf6, 0xf8, 0xd2, 0xdc, 0xce, 0xc0, 0x7a, 0x74, 0x66, 0x68,
    0x42, 0x4c, 0x5e, 0x50, 0x0a, 0x04, 0x16, 0x18, 0x32, 0x3c, 0x2e, 0x20,
    0xec, 0xe2, 0xf0, 0xfe, 0xd4, 0xda, 0xc8, 0xc6, 0x9c, 0x92, 0x80, 0x8e,
    0xa4, 0xaa, 0xb8, 0xb6, 0x0c, 0x02, 0x10, 0x1e, 0x34, 0x3a, 0x28, 0x26,
    0x7c, 0x72, 0x60, 0x6e, 0x44, 0x4a, 0x58, 0x56, 0x37, 0x39, 0x2b, 0x25,
    0x0f, 0x01, 0x13, 0x1d, 0x47, 0x49, 0x5b, 0x55, 0x7f, 0x71, 0x63, 0x6d,
    0xd7, 0xd9, 0xcb, 0xc5, 0xef, 0xe1, 0xf3, 0xfd, 0xa7, 0xa9, 0xbb, 0xb5,
    0x9f, 0x91, 0x83, 0x8d
    ],

    enc = function(string, pass, binary) {
        // string, password in plaintext
        var salt = randArr(8),
        pbe = openSSLKey(s2a(pass, binary), salt),
        key = pbe.key,
        iv = pbe.iv,
        cipherBlocks,
        saltBlock = [[83, 97, 108, 116, 101, 100, 95, 95].concat(salt)];
        string = s2a(string, binary);
        cipherBlocks = rawEncrypt(string, key, iv);
        // Spells out 'Salted__'
        cipherBlocks = saltBlock.concat(cipherBlocks);
        return Base64.encode(cipherBlocks);
    },

    dec = function(string, pass, binary) {
        // string, password in plaintext
        var cryptArr = Base64.decode(string),
        salt = cryptArr.slice(8, 16),
        pbe = openSSLKey(s2a(pass, binary), salt),
        key = pbe.key,
        iv = pbe.iv;
        cryptArr = cryptArr.slice(16, cryptArr.length);
        // Take off the Salted__ffeeddcc
        string = rawDecrypt(cryptArr, key, iv, binary);
        return string;
    },
    
    MD5 = function(numArr) {

        function rotateLeft(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        }

        function addUnsigned(lX, lY) {
            var lX4,
            lY4,
            lX8,
            lY8,
            lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        }

        function f(x, y, z) {
            return (x & y) | ((~x) & z);
        }
        function g(x, y, z) {
            return (x & z) | (y & (~z));
        }
        function h(x, y, z) {
            return (x ^ y ^ z);
        }
        function funcI(x, y, z) {
            return (y ^ (x | (~z)));
        }

        function ff(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function gg(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function hh(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function ii(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(funcI(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function convertToWordArray(numArr) {
            var lWordCount,
            lMessageLength = numArr.length,
            lNumberOfWords_temp1 = lMessageLength + 8,
            lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
            lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16,
            lWordArray = [],
            lBytePosition = 0,
            lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (numArr[lByteCount] << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        }

        function wordToHex(lValue) {
            var lByte,
            lCount,
            wordToHexArr = [];
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                wordToHexArr = wordToHexArr.concat(lByte);
             }
            return wordToHexArr;
        }

        /*function utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "",
            n,
            c;

            for (n = 0; n < string.length; n++) {

                c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        }*/

        var x = [],
        k,
        AA,
        BB,
        CC,
        DD,
        a,
        b,
        c,
        d,
        S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;

        x = convertToWordArray(numArr);

        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;

        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = ff(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = ff(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = ff(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = ff(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = ff(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = ff(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = ff(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = ff(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = ff(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = ff(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = ff(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = ff(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = ff(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = ff(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = ff(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = ff(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = gg(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = gg(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = gg(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = gg(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = gg(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = gg(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = gg(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = gg(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = gg(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = gg(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = gg(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = gg(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = gg(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = gg(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = gg(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = hh(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = hh(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = hh(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = hh(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = hh(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = hh(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = hh(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = hh(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = hh(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = hh(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = hh(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = hh(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = hh(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = hh(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = hh(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = hh(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = ii(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = ii(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = ii(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = ii(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = ii(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = ii(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = ii(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = ii(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = ii(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = ii(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = ii(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = ii(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = ii(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = ii(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = ii(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = ii(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = addUnsigned(a, AA);
            b = addUnsigned(b, BB);
            c = addUnsigned(c, CC);
            d = addUnsigned(d, DD);
        }

        return wordToHex(a).concat(wordToHex(b), wordToHex(c), wordToHex(d));
    },
    

    Base64 = (function(){
        // Takes a Nx16x1 byte array and converts it to Base64
        var _chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        chars = _chars.split(''),
        
        encode = function(b, withBreaks) {
            var flatArr = [],
            b64 = '',
            i,
            broken_b64;
            totalChunks = Math.floor(b.length * 16 / 3);
            for (i = 0; i < b.length * 16; i++) {
                flatArr.push(b[Math.floor(i / 16)][i % 16]);
            }
            for (i = 0; i < flatArr.length; i = i + 3) {
                b64 += chars[flatArr[i] >> 2];
                b64 += chars[((flatArr[i] & 3) << 4) | (flatArr[i + 1] >> 4)];
                if (! (flatArr[i + 1] === undefined)) {
                    b64 += chars[((flatArr[i + 1] & 15) << 2) | (flatArr[i + 2] >> 6)];
                } else {
                    b64 += '=';
                }
                if (! (flatArr[i + 2] === undefined)) {
                    b64 += chars[flatArr[i + 2] & 63];
                } else {
                    b64 += '=';
                }
            }
            // OpenSSL is super particular about line breaks
            broken_b64 = b64.slice(0, 64) + '\n';
            for (i = 1; i < (Math.ceil(b64.length / 64)); i++) {
                broken_b64 += b64.slice(i * 64, i * 64 + 64) + (Math.ceil(b64.length / 64) == i + 1 ? '': '\n');
            }
            return broken_b64;
        },
        
        decode = function(string) {
            string = string.replace(/\n/g, '');
            var flatArr = [],
            c = [],
            b = [],
            i;
            for (i = 0; i < string.length; i = i + 4) {
                c[0] = _chars.indexOf(string.charAt(i));
                c[1] = _chars.indexOf(string.charAt(i + 1));
                c[2] = _chars.indexOf(string.charAt(i + 2));
                c[3] = _chars.indexOf(string.charAt(i + 3));

                b[0] = (c[0] << 2) | (c[1] >> 4);
                b[1] = ((c[1] & 15) << 4) | (c[2] >> 2);
                b[2] = ((c[2] & 3) << 6) | c[3];
                flatArr.push(b[0], b[1], b[2]);
            }
            flatArr = flatArr.slice(0, flatArr.length - (flatArr.length % 16));
            return flatArr;
        };
        
        //internet explorer
        if(typeof Array.indexOf === "function") {
            _chars = chars;
        }
        
        /*
        //other way to solve internet explorer problem
        if(!Array.indexOf){
            Array.prototype.indexOf = function(obj){
                for(var i=0; i<this.length; i++){
                    if(this[i]===obj){
                        return i;
                    }
                }
                return -1;
            }
        }
        */
        
        
        return {
            "encode": encode,
            "decode": decode
        };
    })();

    return {
        "size": size,
        "h2a":h2a,
        "expandKey":expandKey,
        "encryptBlock":encryptBlock,
        "decryptBlock":decryptBlock,
        "Decrypt":Decrypt,
        "s2a":s2a,
        "rawEncrypt":rawEncrypt,
        "dec":dec,
        "openSSLKey":openSSLKey,
        "a2h":a2h,
        "enc":enc,
        "Hash":{"MD5":MD5},
        "Base64":Base64
    };

})();

if ( typeof define === "function" ) {
    define(function () { return GibberishAES; });
}
/**
 * @private
 */
Ext.define('Genesis.fx.animation.Scroll',
{

   extend : 'Ext.fx.animation.Abstract',

   alternateClassName : 'Ext.fx.animation.ScrollIn',

   alias : ['animation.scroll', 'animation.scrollIn'],

   config :
   {
      /**
       * @cfg {String} direction The direction of which the slide animates
       * @accessor
       */
      direction : 'left',

      /**
       * @cfg {Boolean} out True if you want to make this animation slide out, instead of slide in.
       * @accessor
       */
      out : false,

      /**
       * @cfg {Number} offset The offset that the animation should go offscreen before entering (or when exiting)
       * @accessor
       */
      offset : 0,

      /**
       * @cfg
       * @inheritdoc
       */
      easing : 'auto',

      containerBox : 'auto',

      elementBox : 'auto',

      isElementBoxFit : true
   },

   reverseDirectionMap :
   {
      up : 'down',
      down : 'up',
      left : 'right',
      right : 'left'
   },

   applyEasing : function(easing)
   {
      if(easing === 'auto')
      {
         return 'ease-' + ((this.getOut()) ? 'in' : 'out');
      }

      return easing;
   },
   getData : function()
   {
      var element = this.getElement();
      var from = this.getFrom(), to = this.getTo(), out = this.getOut(), offset = this.getOffset(), direction = this.getDirection(), reverse = this.getReverse(), translateX = 0, translateY = 0, fromX, fromY, toX, toY;

      if(reverse)
      {
         direction = this.reverseDirectionMap[direction];
      }

      switch (direction)
      {
         case this.DIRECTION_UP:
         case this.DIRECTION_DOWN:
            translateY = element.getHeight();
            break;

         case this.DIRECTION_RIGHT:
         case this.DIRECTION_LEFT:
            translateX = element.getWidth();
            break;
      }
      //
      //
      //
      fromX = (out) ? 0 : translateX;
      fromY = (out) ? 0 : translateY;
      from.set('overflow', 'hidden');
      switch (direction)
      {
         case this.DIRECTION_UP:
         case this.DIRECTION_DOWN:
            from.set('height', fromY + 'px');
            break;

         case this.DIRECTION_RIGHT:
         case this.DIRECTION_LEFT:
            from.set('width', fromX + 'px');
            break;
      }
      toX = (out) ? translateX : 0;
      toY = (out) ? translateY : 0;
      to.set('overflow', 'hidden');
      switch (direction)
      {
         case this.DIRECTION_UP:
         case this.DIRECTION_DOWN:
            to.set('height', toY + 'px');
            break;

         case this.DIRECTION_RIGHT:
         case this.DIRECTION_LEFT:
            to.set('width', toX + 'px');
            break;
      }

      return this.callParent(arguments);
   }
});
Ext.define('Genesis.view.widgets.ListField',
{
   extend : 'Ext.field.Text',
   alternateClassName : 'Genesis.field.List',
   xtype : 'listfield',
   /**
    * @cfg {Object} component
    * @accessor
    * @hide
    */
   config :
   {
      ui : 'list',
      component :
      {
         useMask : false
      },
      /**
       * @cfg {Boolean} clearIcon
       * @hide
       * @accessor
       */
      clearIcon : true,
      iconCls : '',
      readOnly : false
   },
   // @private
   initialize : function()
   {
      var me = this, component = me.getComponent();

      me.callParent();

      if(me.getIconCls())
      {
         Ext.fly(me.element.query('.'+Ext.baseCSSPrefix.trim()+'component-outer')[0]).addCls(me.getIconCls());
      }
      component.setReadOnly(true);
   },
   // @private
   doClearIconTap : Ext.emptyFn
});
/**
 * @private
 */
Ext.define('Genesis.view.widgets.ComponentListItem',
{
   extend : 'Ext.dataview.element.List',
   config :
   {
      maxItemCache : 20
   },
   //@private
   initialize : function()
   {
      this.callParent();
      this.doInitialize();
      this.itemCache = [];
   },
   getItemElementConfig : function(index, data)
   {
      var me = this, dataview = me.dataview, itemCls = dataview.getItemCls(), cls = me.itemClsShortCache, config, iconSrc;

      if (itemCls)
      {
         cls += ' ' + itemCls;
      }
      config =
      {
         cls : cls,
         children : [
         {
            cls : me.labelClsShortCache
            //html : dataview.getItemTpl().apply(data)
         }]
      };

      if (dataview.getIcon())
      {
         iconSrc = data.iconSrc;
         config.children.push(
         {
            cls : me.iconClsShortCache,
            style : (('background-image: ' + iconSrc) ? 'url("' + newSrc + '")' : '')
         });
      }
      return config;
   },
   moveItemsToCache : function(from, to)
   {
      var me = this, dataview = me.dataview, maxItemCache = dataview.getMaxItemCache(), items = me.getViewItems(), itemCache = me.itemCache, cacheLn = itemCache.length, pressedCls = dataview.getPressedCls(), selectedCls = dataview.getSelectedCls(), i = to - from, item;

      for (; i >= 0; i--)
      {
         item = Ext.get(items[from + i]);
         var extItem = item.down(me.labelClsCache, true);
         var extCmp = Ext.getCmp(extItem.childNodes[0].id);
         if (cacheLn !== maxItemCache)
         {
            //me.remove(item, false);
            item.removeCls([pressedCls, selectedCls]);
            itemCache.push(extCmp);
            cacheLn++;
         }
         else
         {
            Ext.Array.remove(me.itemCache, extCmp);
            extCmp.destroy();
            //item.destroy();
         }
         item.dom.parentNode.removeChild(item.dom);
      }

      if (me.getViewItems().length == 0)
      {
         this.dataview.showEmptyText();
      }
   },
   moveItemsFromCache : function(records)
   {
      var me = this, dataview = me.dataview, store = dataview.getStore(), ln = records.length;
      var xtype = dataview.getDefaultType(), itemConfig = dataview.getItemConfig();
      var itemCache = me.itemCache, cacheLn = itemCache.length, items = [], i, item, record;

      if (ln)
      {
         dataview.hideEmptyText();
      }

      for ( i = 0; i < ln; i++)
      {
         records[i]._tmpIndex = store.indexOf(records[i]);
      }

      Ext.Array.sort(records, function(record1, record2)
      {
         return record1._tmpIndex > record2._tmpIndex ? 1 : -1;
      });

      for ( i = 0; i < ln; i++)
      {
         record = records[i];
         if (cacheLn)
         {
            cacheLn--;
            item = itemCache.pop();
            me.updateListItem(record, item);
         }
         me.addListItem(record._tmpIndex, record, item);
         delete record._tmpIndex;
      }
      return items;
   },
   addListItem : function(index, record, item)
   {
      var me = this, dataview = me.dataview, data = dataview.prepareData(record.getData(true), dataview.getStore().indexOf(record), record);
      var element = me.element, childNodes = element.dom.childNodes, ln = childNodes.length, wrapElement;
      wrapElement = Ext.Element.create(this.getItemElementConfig(index, data));

      var xtype = dataview.getDefaultType(), itemConfig = dataview.getItemConfig();

      if (!ln || index == ln)
      {
         wrapElement.appendTo(element);
      }
      else
      {
         wrapElement.insertBefore(childNodes[index]);
      }

      var extItem = wrapElement.down(me.labelClsCache, true);
      if (!item)
      {
         item = new Ext.widget(xtype,
         {
            xtype : xtype,
            record : record,
            dataview : dataview,
            itemCls : dataview.getItemCls(),
            defaults : itemConfig,
            renderTo : extItem
         });
      }
      else
      {
         item.element.appendTo(extItem);
      }
      //me.itemCache.push(item);
   },
   updateListItem : function(record, item)
   {
      if (item.isComponent && item.updateRecord)
      {
         item.updateRecord(record);
      }
      else
      {
         var extItem = Ext.fly(item).down(this.labelClsCache, true);
         var extCmp = Ext.getCmp(extItem.childNodes[0].id);
         extCmp.updateRecord(record);
      }
   },
   destroy : function()
   {
      var elements = this.getViewItems(), ln = elements.length, i = 0, len = this.itemCache.length;

      for (; i < len; i++)
      {
         this.itemCache[i].destroy();
         this.itemCache[i] = null;
      }
      delete this.itemCache;
      for ( i = 0; i < ln; i++)
      {
         Ext.removeNode(elements[i]);
      }
      this.callParent();
   }
});
Ext.define('Genesis.view.widgets.ComponentList',
{
   alternateClassName : 'Genesis.ComponentList',
   extend : 'Ext.dataview.List',
   xtype : 'componentlist',
   requires : ['Genesis.view.widgets.ComponentListItem'],
   initialize : function()
   {
      var me = this, container;

      me.on(me.getTriggerCtEvent(), me.onContainerTrigger, me);
      container = me.container = this.add(new Genesis.view.widgets.ComponentListItem(
      {
         baseCls : this.getBaseCls()
      }));
      container.dataview = me;

      me.on(me.getTriggerEvent(), me.onItemTrigger, me);

      container.element.on(
      {
         delegate : '.' + this.getBaseCls() + '-disclosure',
         tap : 'handleItemDisclosure',
         scope : me
      });

      container.on(
      {
         itemtouchstart : 'onItemTouchStart',
         itemtouchend : 'onItemTouchEnd',
         itemtap : 'onItemTap',
         itemtaphold : 'onItemTapHold',
         itemtouchmove : 'onItemTouchMove',
         itemsingletap : 'onItemSingleTap',
         itemdoubletap : 'onItemDoubleTap',
         itemswipe : 'onItemSwipe',
         scope : me
      });

      if(this.getStore())
      {
         this.refresh();
      }
   }
});
Ext.define('Genesis.view.ViewBase',
{
   extend : 'Ext.Container',
   xtype : 'viewbase',
   inheritableStatics :
   {
      generateTitleBarConfig : function()
      {
         return (
            {
               xtype : 'titlebar',
               docked : 'top',
               tag : 'navigationBarTop',
               cls : 'navigationBarTop',
               masked :
               {
                  xtype : 'mask',
                  transparent : true
               },
               defaults :
               {
                  iconMask : true
               }
            });
      },
      invisibleMask :
      {
         xtype : 'mask',
         transparent : true
      },
      phoneField : function()
      {
         return (
            {
               xtype : 'textfield',
               minLength : 12,
               maxLength : 12,
               placeHolder : '800-555-1234',
               listeners :
               {
                  keyup : function(f, e, eOpts)
                  {
                     var keyCode = e.browserEvent.keyCode, key = String.fromCharCode(keyCode), value = f.getValue();

                     if ((keyCode >= 48 && keyCode <= 90) || //
                     (keyCode >= 106 && keyCode <= 111) || //
                     (keyCode >= 186 && keyCode <= 192) || //
                     (keyCode >= 219 && keyCode <= 222))
                     {
                        if (key.match(/[0-9]/) && (!e.browserEvent.shiftKey && !e.browserEvent.ctrlKey && !e.browserEvent.metaKey))
                        {
                           if ((value.length == 3) || (value.length == 7))
                           {
                              f.setValue(value + "-");
                           }
                           else if ((value.length == 4) || (value.length == 8))
                           {
                              var match = value.match(/-/);
                              if (!match)
                              {
                                 f.setValue(value.slice(0, value.length - 1) + "-" + value[value.length - 1]);
                              }
                              else
                              {
                                 switch (match.length)
                                 {
                                    case 1:
                                    {
                                       if (value.length > 4)
                                       {
                                          f.setValue(value.slice(0, value.length - 1) + "-" + value[value.length - 1]);
                                       }
                                       break;
                                    }
                                    default:
                                       break;
                                 }
                              }
                           }
                        }
                        else
                        {
                           f.setValue(value.slice(0, value.length - 1));
                        }
                     }
                     //console.debug("Phone#[" + f.getValue() + "]");
                  }
               }
            });
      }
   },
   config :
   {
      preRender : null
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   calcCarouselSize : function(factor)
   {
      var me = this, spacingFactor = 50, mobile = Ext.os.is('Phone') || Ext.os.is('Tablet'), area = window.innerHeight * window.innerWidth;

      factor = factor || 1;
      console.debug("Screen Height[" + window.innerHeight + "], Width[" + window.innerWidth + "]");
      var width;

      if (Ext.os.is('Phone') || !merchantMode)
      {
         width = (Ext.os.is('iOS')) ? 320 : 384;
      }
      else if (Ext.os.is('Tablet'))
      {
         width = (Ext.os.is('iOS')) ? 768 : 480;
      }

      if (mobile)
      {
         if (area < (480 - spacingFactor) * width)
         {
            me.setItemPerPage(Math.floor(4 * factor));
         }
         else if (area < (568 - spacingFactor) * width)
         {
            me.setItemPerPage(Math.floor(6 * factor));
         }
         else if (area < (1024 - spacingFactor) * width)
         {
            me.setItemPerPage(Math.floor(8 * factor));
         }
         else
         {
            me.setItemPerPage(Math.floor(10 * factor));
         }
      }
   },
   cleanView : function()
   {
      this.fireEvent('cleanView', this);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      var rc = this.callParent(arguments);
      this.setPreRender([]);

      return rc;
   },
   createView : function()
   {
      this.fireEvent('createView', this);
      return (this.getPreRender().length == 0);
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      if (this.getInnerItems().length == 0)
      {
         this.add(this.getPreRender());
      }
      Ext.defer(this.fireEvent, 0.01 * 1000, this, ['showView', this]);
      //this.fireEvent('showView', this);
   }
});
Ext.define('Genesis.view.widgets.Item',
{
   extend : 'Ext.Container',
   requires : ['Ext.XTemplate'],
   xtype : 'item',
   alias : 'widget.item',
   config :
   {
      cls : 'item',
      tag : 'item',
      layout : 'fit'
   },
   constructor : function(config)
   {
      var me = this;

      config = config ||
      {
      };
      me.config['preItemsConfig'] = me.config['preItemsConfig'] || [];
      me.config['postItemsConfig'] = me.config['postItemsConfig'] || [];
      me.config['photoTemplate'] = me.config['photoTemplate'] || null;

      var preItemsConfig = config['preItemsConfig'] || [];
      var postItemsConfig = config['postItemsConfig'] || [];
      var photoTemplate = config['photoTemplate'] || me.config['photoTemplate'];

      Ext.merge(preItemsConfig, me.config['preItemsConfig']);
      Ext.merge(postItemsConfig, me.config['postItemsConfig']);
      //
      delete config['preItemsConfig'];
      delete config['postItemsConfig'];
      delete config['photoTemplate'];

      Ext.merge(config,
      {
         // Backgrond Image
         items : [
         {
            docked : 'top',
            xtype : 'component',
            tag : 'title',
            cls : 'title',
            defaultUnit : 'em',
            tpl : Ext.create('Ext.XTemplate', '{[this.getDescription(values)]}',
            {
               getDescription : function(values)
               {
                  return values['title'];
               }
            })
         }].concat(preItemsConfig, [
         {
            xtype : 'component',
            tag : 'itemPhoto',
            cls : 'itemPhoto',
            tpl : (photoTemplate) ? photoTemplate : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<div class="photoVCenterHelper"></div>',
            '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  var photo = values['photo'];
                  if (Ext.isString(photo))
                  {
                     return 'src="' + photo + '"';
                  }
                  else
                  {
                     return 'src="' + photo.url + '" ' + //
                     ((photo.width) ? 'style="width:' + Genesis.fn.addUnit(photo.width) + ';height:' + Genesis.fn.addUnit(photo.height) + ';"' : '');
                  }
               }
            })
         }], postItemsConfig)
      });

      this.callParent(arguments);
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.updateItem(this.getData());
   },
   updateItem : function(data)
   {
      var me = this;
      var content = data.raw;

      var itemPhoto = me.query("component[tag=itemPhoto]")[0];
      var title = me.query("component[tag=title]")[0];

      //
      if (content['title'])
      {
         title.setData(content);
         title.show();
      }
      else
      {
         title.hide();
      }
      itemPhoto.setData(content);
      me.setData(data);

      return content;
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.view.widgets.RedeemItem',
{
   extend : 'Genesis.view.widgets.Item',
   xtype : 'redeemitem',
   alias : 'widget.redeemitem',
   config :
   {
      iconType : 'prizewon',
      hideMerchant : false,
      cls : 'item redeemItem',
      // Backgrond Image
      tag : 'redeemItem',
      layout : 'fit',
      postItemsConfig : [
      {
         docked : 'bottom',
         xtype : 'component',
         hidden : true,
         tag : 'itemPoints',
         cls : 'itemPoints',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
            '{[this.getPoints(values)]}',
            // @formatter:on
         {
            getPoints : function(values)
            {
               return ((values['points'] > 0) ? values['points'] + '  Pts' : ' ');
            }
         })
      },
      {
         docked : 'bottom',
         xtype : 'component',
         tag : 'info',
         cls : 'info',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="photo">' +
            '<img src="{[this.getPhoto(values)]}"/>' +
         '</div>' +
         '<div class="infoWrapper">' +
            '<div class="name">{[this.getName(values)]}</div>' +
            '<div class="disclaimer">{[this.getDisclaimer(values)]}</div>' +
            '<div class="date">{[this.getExpiryDate(values)]}</div>' +
         '</div>',
         // @formatter:on
         {
            getExpiryDate : function(values)
            {
               var limited = values.get('time_limited');
               return ((limited) ? 'Offer Expires: ' + values.get('expiry_date') : '');
            },
            getDisclaimer : function(values)
            {
               var quantity = (values.get('quantity_limited')) ? //
               '<b>Quantity : ' + values.get('quantity') + '</b><br/>' : //
               'Limited Quantities. ';
               var terms = values.getMerchant().get('reward_terms') || '';

               return (quantity + terms);
            },
            getPhoto : function(values)
            {
               return values.getMerchant().get('photo')['thumbnail_medium_url'];
            },
            getName : function(values)
            {
               return values.getMerchant().get('name');
            }
         })
      }]
   },
   constructor : function(config)
   {
      var me = this;
      config = Ext.merge(
      {
         photoTemplate : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="photoVCenterHelper"></div>',
         '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
         '<div class="itemPoints {[this.isVisible(values)]}">{[this.getPoints(values)]}</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
               var photo = (values['photo'] && values['photo'][prefix]) ? values['photo'][prefix] : me.self.getPhoto(values['type'], me.getIconType());
               if (Ext.isString(photo))
               {
                  return 'src="' + photo + '"';
               }
               else
               {
                  return 'src="' + photo.url + '" ' + //
                  ((photo.width) ? 'style="width:' + Genesis.fn.addUnit(photo.width) + ';height:' + Genesis.fn.addUnit(photo.height) + ';"' : '');
               }
            },
            isVisible : function(values)
            {
               return ((values['merchant']) ? '' : 'x-item-hidden');
            },
            getPoints : function(values)
            {
               return ((values['points'] > 0) ? values['points'] + '  Pts' : ' ');
            }
         })
      }, config);

      this.callParent(arguments);
   },
   updateItem : function(data)
   {
      var me = this;
      var content = data.raw;
      var info = me.query("component[tag=info]")[0];
      var points = me.query("component[tag=itemPoints]")[0];

      //
      // Hide Merchant Information if it's missing
      //
      if (content['merchant'] && !me.getHideMerchant())
      {
         info.setData(data);
         info.show();
         points.setData(
         {
            points : 0
         });
      }
      else
      {
         info.hide();
         points.setData(content);
         points.show();
      }

      me.callParent(arguments);
   },
   inheritableStatics :
   {
      getPhoto : function(type, iconType)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'earn_points' :
            case 'promotion' :
            {
               break;
            }
            default :
               photo_url = Genesis.constants.getIconPath(iconType, type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }

});

Ext.define('Genesis.view.widgets.PopupItem',
{
   extend : 'Genesis.view.widgets.Item',
   xtype : 'popupitem',
   alias : 'widget.popupitem',
   config :
   {
      iconType : null
   },
   constructor : function(config)
   {
      var me = this;
      Ext.merge(config,
      {
         // Backgrond Image
         tag : 'popupItem',
         photoTemplate : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="photoVCenterHelper"></div>',
         '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               var photo = me.self.getPhoto(values['type'], me.getIconType());
               return 'src="' + photo + '"';
            }
         })
      });

      me.callParent(arguments);
   },
   inheritableStatics :
   {
      getPhoto : function(type, iconType)
      {
         var photo_url = Genesis.constants.getIconPath(iconType, type.value);
         return photo_url;
      }
   }
});
Ext.define('Genesis.view.widgets.ItemDetail',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate'],
   alias : 'widget.itemdetailview',
   config :
   {
      scrollable : undefined,
      itemXType : 'item',
      cls : 'itemDetailMain viewport',
      layout :
      {
         type : 'vbox',
         pack : 'center',
         align : 'stretch'
      }
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments) && (me.getInnerItems().length > 0))
      {
         var item = me.getInnerItems()[0];
         //
         // Refresh RedeemItem
         //
         item.setData(me.item);
         item.updateItem(me.item);
      }
      else
      {
         me.setPreRender([
         {
            flex : 1,
            xtype : me.getItemXType(),
            data : me.item
         }]);
      }
      delete me.item;
   }
});

Ext.define('Genesis.view.widgets.PopupItemDetail',
{
   extend : 'Ext.Sheet',
   alias : 'widget.popupitemdetailview',
   config :
   {
      models : ['CustomerReward'],
      bottom : 0,
      left : 0,
      top : 0,
      right : 0,
      padding : 0,
      hideOnMaskTap : false,
      defaultUnit : 'em',
      layout :
      {
         type : 'vbox',
         pack : 'middle'
      },
      defaults :
      {
         xtype : 'container',
         defaultUnit : 'em'
      }
   },
   constructor : function(config)
   {
      var me = this;
      config = config ||
      {
      };

      var buttons = config['buttons'] || [];
      config['origButtons'] = buttons;
      delete config['buttons'];

      var preItemsConfig = config['preItemsConfig'] || [];
      var postItemsConfig = config['postItemsConfig'] || [];
      delete config['preItemsConfig'];
      delete config['postItemsConfig'];

      Ext.merge(config,
      {
         items : [
         {
            preItemsConfig : preItemsConfig,
            postItemsConfig : postItemsConfig,
            iconType : config['iconType'],
            flex : 1,
            xtype : 'popupitem',
            data : Ext.create('Genesis.model.CustomerReward',
            {
               'title' : config['title'],
               'type' :
               {
                  value : config['icon']
               }
               //'photo' : photoUrl
            })
         }, me.createButtons(buttons)]
      });
      delete config['iconType'];
      delete config['icon'];

      if (Ext.os.is('Phone') || Ext.os.is('Tablet'))
      {
         Ext.Viewport.on('orientationchange', me.onOrientationChange, me);
         me.on(
         {
            destroy : 'onDestroy',
            single : true,
            scope : me
         });
      }
      me.callParent(arguments);
      me.element.setStyle('padding', '0px');
   },
   createButtons : function(buttons, orientation)
   {
      orientation = orientation || Ext.Viewport.getOrientation(), mobile = Ext.os.is('Phone') || Ext.os.is('Tablet'), landscape = (mobile && (orientation == 'landscape'));
      Ext.each(buttons, function(button, index, array)
      {
         if (index != (array.length - 1))
         {
            button['margin'] = (landscape) ? '0 0 0.5 0' : '0 0.5 0.5 0';
         }
      });
      var height = (landscape && !merchantMode && (buttons.length > 2)) ? 2 : 3;
      //console.log("LandscapeMode: " + landscape);
      return Ext.create('Ext.Container',
      {
         defaultUnit : 'em',
         right : landscape ? 0 : null,
         bottom : landscape ? 0 : null,
         docked : landscape ? null : 'bottom',
         tag : 'buttons',
         width : landscape ? ((merchantMode) ? '10em' : '7.5em') : 'auto',
         layout : landscape ?
         {
            type : 'vbox',
            pack : 'end'
         } :
         {
            type : 'hbox'
         },
         defaults :
         {
            xtype : 'button',
            defaultUnit : 'em',
            height : ((merchantMode) ? 1.5 * height : height) + 'em',
            flex : (landscape) ? null : 1
         },
         padding : '0 1.0 0.5 1.0',
         items : buttons
      });
   },
   onDestroy : function()
   {
      var me = this;
      Ext.Viewport.un('orientationchange', me.onOrientationChange, me);
   },
   onOrientationChange : function(v, newOrientation, width, height, eOpts)
   {
      var me = this;

      me.remove(me.query('container[tag=buttons]')[0], true);
      me.add(me.createButtons(me.getInitialConfig()['origButtons'], newOrientation));
   }
});
Ext.define('Genesis.view.widgets.MerchantAccountPtsItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.XTemplate'],
   xtype : 'merchantaccountptsitem',
   alias : 'widget.merchantaccountptsitem',
   config :
   {
      layout : 'vbox',
      background :
      {
         // Backgrond Image
         cls : 'tbPanel',
         tag : 'background',
         height : window.innerWidth,
         items : [
         // Display Points
         {
            xtype : 'container',
            bottom : 0,
            width : '100%',
            cls : 'container',
            layout : 'hbox',
            defaults :
            {
               flex : 1,
               xtype : 'component'
            },
            items : [
            {
               tag : 'prizepoints',
               tpl : Ext.create('Ext.XTemplate', '<span class="x-badge round {[this.isVisible()]}">✔</span>{prize_points}',
               {
                  isVisible : function()
                  {
                     var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
                     var customer = viewport.getCustomer();
                     return (customer.get('eligible_for_prize') ? '' : 'x-item-hidden');
                  }
               }),
               cls : 'prizephotodesc x-hasbadge'
            },
            {
               tag : 'points',
               tpl : Ext.create('Ext.XTemplate', '<span class="x-badge round {[this.isVisible()]}">✔</span>{points}',
               {
                  isVisible : function()
                  {
                     var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
                     var customer = viewport.getCustomer();
                     return (customer.get('eligible_for_reward') ? '' : 'x-item-hidden');
                  }
               }),
               cls : 'pointsphotodesc x-hasbadge'
            }]
         }]
      },
      winnersCount :
      {
         // -----------------------------------------------------------------------
         // Prizes won by customers!
         // -----------------------------------------------------------------------
         tag : 'prizesWonPanel',
         xtype : 'component',
         cls : 'prizesWonPanel x-list',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<tpl if="this.isVisible(values)">',
	         '<div class="prizeswonphoto">',
   	         '<div class="itemTitle">{[this.getTitle(values)]}</div>',
      	      '<div class="itemDesc">{[this.getDesc(values)]}</div>',
         	'</div>',
         	'<div class="x-list-disclosure"></div>',
         '</tpl>',
         // @formatter:on
         {
            isVisible : function(values)
            {
               return true;
            },
            getTitle : function(values)
            {
               var jackpot = ' Jackpot' + ((values['prize_jackpots'] > 1) ? 's' : '');
               var msg = ((values['prize_jackpots'] > 0) ? values['prize_jackpots'] + jackpot + ' won this month' : 'Be our first winner this month!');
               /*
                msg += '<img style="width:1em;float:right;"' + //
                ' src="' + Genesis.constants.getIconPath('miscicons', 'disclose') + '" />';
                */

               return msg;
            },
            getDesc : function(values)
            {
               return 'Check out our winners!';
            }
         })
      },
      badgeProgress :
      {
         // -----------------------------------------------------------------------
         // Prizes won by customers!
         // -----------------------------------------------------------------------
         tag : 'badgeProgressPanel',
         xtype : 'component',
         cls : 'badgeProgressPanel',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<tpl if="this.isVisible(values)">',
            '<div class="badgephoto">',
               '<img class="itemPhoto" src="{[this.getPhoto(values)]}"/>',
               '<div class="itemTitle">{[this.getTitle(values)]}</div>',
               '<div class="itemDesc">',
                  '<div class="progressBarContainer">',
                     '<div class="progressBar" style="{[this.getProgress(values)]}"></div>',
                     '<div class="progressBarValue">{[this.getDesc(values)]}</div>',
                  '</div>',
                  '{[this.cleanup(values)]}',
               '</div>',
            '</div>',
         '</tpl>',
         // @formatter:on
         {
            //
            // Hide Points if we are not a customer of the Merchant
            //
            isVisible : function(values)
            {
               var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
               var customer = viewport.getCustomer();
               var valid = false;

               if (customer)
               {
                  valid = Customer.isValid(customer.getId());
                  values['_customer'] = (valid) ? Ext.StoreMgr.get('CustomerStore').getById(customer.getId()) : null;
               }

               return valid;
            },
            getPhoto : function(values)
            {
               var bstore = Ext.StoreMgr.get('BadgeStore');
               if (bstore)
               {
                  values['_badgeType'] = bstore.getById(values['_customer'].get('badge_id')).get('type');

                  return Genesis.view.client.Badges.getPhoto(values['_badgeType'], 'thumbnail_medium_url');
               }
            },
            getTitle : function(values)
            {
               var msg = ('You are our <span class ="badgehighlight">' + //
               values['_badgeType'].display_value.toUpperCase() + '</span>');
               /*
                return msg += '<img style="width:1em;float:right;"' + //
                ' src="' + Genesis.constants.getIconPath('miscicons', 'disclose') + '" />';
                */
               return msg;

            },
            getProgress : function(values)
            {
               var customer = values['_customer'];
               var nextBadge = values['_nextBadge'] = Ext.StoreMgr.get('BadgeStore').getById(customer.get('next_badge_id'));
               var nvisit = values['_nvisit'] = nextBadge.get('visits');
               var tvisit = customer.get('next_badge_visits');

               return ('width:' + (tvisit / nvisit * 100) + '%;');
            },
            // Updated Automatically when the Customer\'s metadata is updated
            getDesc : function(values)
            {
               var customer = values['_customer'];
               var nvisit = values['_nvisit'];
               var tvisit = customer.get('next_badge_visits');
               var nextBadge = values['_nextBadge'];

               return ((nvisit - tvisit) + ' more visit' + (((nvisit - tvisit) > 1) ? 's' : '') + ' to be our ' + //
               ((nextBadge) ? nextBadge.get('type').display_value.toUpperCase() : 'None') + '!');
            },
            cleanup : function(values)
            {
               delete values['_customer'];
               delete values['_nextBadge'];
               delete values['_badgeType'];
               delete values['_nvisit'];
            }
         })
      },
      dataMap :
      {
         getBackground :
         {
            setData : 'background'
         },
         getWinnersCount :
         {
            setData : 'winnersCount'
         },
         getBadgeProgress :
         {
            setData : 'badgeProgress'
         }
      },
      listeners : [
      {
         element : 'element',
         delegate : 'div.prizephotodesc',
         event : 'tap',
         fn : "onPrizesButtonTap"
      },
      {
         element : 'element',
         delegate : 'div.pointsphotodesc',
         event : 'tap',
         fn : "onRedemptionsButtonTap"
      },
      {
         'painted' : function(c, eOpts)
         {
            //console.debug("MerchantAccountPtsItem - painted[" + c.id + "]");
         }
      }]
   },
   initialize : function()
   {
      var bg = this.query('container[tag=background]')[0];
      bg.setHeight(window.innerWidth);
   },
   applyBackground : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Container, this.getBackground());
   },
   updateBackground : function(newBackground, oldBackground)
   {
      if (newBackground)
      {
         this.add(newBackground);
      }

      if (oldBackground)
      {
         this.remove(oldBackground);
      }
   },
   setDataBackground : function(data)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var customer = viewport.getCustomer();
      var venue = viewport.getVenue();
      var merchant = venue.getMerchant();
      var venueId = venue.getId();
      var cvenue = viewport.getCheckinInfo().venue;
      var customerId = customer.getId();
      var features_config = merchant.get('features_config');

      //var crecord = cstore.getById(data.Merchant['merchant_id']);
      var bg = this.query('container[tag=background]')[0];
      var points = this.query('component[tag=points]')[0];
      var prizepoints = this.query('component[tag=prizepoints]')[0];

      // Update Background Photo
      bg.setStyle(
      {
         'background-image' : 'url(' + data.Merchant['alt_photo']['thumbnail_large_url'] + ')'
      });
      //console.debug("BgImage=[" + Ext.encode(data) + "]");

      //
      // Hide Points if we are not a customer of the Merchant
      //
      bg.getItems().items[0].show();
      if (Customer.isValid(customerId) && Ext.StoreMgr.get('CustomerStore').getById(customerId))
      {
         //Update Points
         points.setData(customer.getData());
         prizepoints.setData(customer.getData());
      }
      else
      {
         //Update Points
         points.setData(
         {
            "points" : "---"
         });
         prizepoints.setData(
         {
            "prize_points" : "---"
         });
      }
      prizepoints.setVisibility(!features_config || (features_config && features_config['enable_prizes']));

   },
   applyWinnersCount : function(config)
   {
      if (Ext.StoreMgr.get('BadgeStore'))
      {
         return Ext.factory(Ext.apply(config,
         {
         }), Ext.Container, this.getWinnersCount());
      }
      return new Ext.Container();
   },
   updateWinnersCount : function(newWinnersCount, oldWinnersCount)
   {
      if (newWinnersCount)
      {
         this.add(newWinnersCount);
      }

      if (oldWinnersCount)
      {
         this.remove(oldWinnersCount);
      }
   },
   setDataWinnersCount : function(data)
   {
      var prizePanel = this.query('component[tag=prizesWonPanel]')[0];
      if (prizePanel)
      {
         prizePanel.setData(data);
      }
   },
   applyBadgeProgress : function(config)
   {
      if (Ext.StoreMgr.get('BadgeStore'))
      {
         return Ext.factory(Ext.apply(config,
         {
         }), Ext.Container, this.getBadgeProgress());
      }
      return new Ext.Container();
   },
   updateBadgeProgress : function(newBadgeProgress, oldBadgeProgress)
   {
      if (newBadgeProgress)
      {
         this.add(newBadgeProgress);
      }

      if (oldBadgeProgress)
      {
         this.remove(oldBadgeProgress);
      }
   },
   setDataBadgeProgress : function(data)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var badgeProgress = this.query('component[tag=badgeProgressPanel]')[0];
      var valid = Customer.isValid(viewport.getCustomer().getId());

      if (badgeProgress)
      {
         if (valid)
         {
            badgeProgress.setData(data);
         }
         badgeProgress[ (valid) ? 'show' : 'hide']();
      }
   },
   /**
    * Updates this container's child items, passing through the dataMap.
    * @param newRecord
    * @private
    */
   updateRecord : function(newRecord)
   {
      if (!newRecord)
      {
         return;
      }

      var me = this, dataview = me.config.dataview, data = dataview.prepareData(newRecord.getData(true), dataview.getStore().indexOf(newRecord), newRecord), items = me.getItems(), item = items.first(), dataMap = me.getDataMap(), componentName, component, setterMap, setterName;

      if (!item)
      {
         return;
      }
      for (componentName in dataMap)
      {
         setterMap = dataMap[componentName];
         component = me[componentName]();
         if (component)
         {
            for (setterName in setterMap)
            {
               if (component[setterName])
               {
                  switch (setterMap[setterName])
                  {
                     //component[setterName](data);
                     case 'background':
                        me.setDataBackground(data);
                        break;
                     case 'badgeProgress' :
                        me.setDataBadgeProgress(data);
                        break;
                     case 'winnersCount':
                        me.setDataWinnersCount(data);
                        break;
                     default :
                        component[setterName](data[setterMap[setterName]]);
                        break;
                  }
               }
            }
         }
      }
      // Bypassing setter because sometimes we pass the same object (different properties)
      item.updateData(data);
   },
   onPrizesButtonTap : function()
   {
      var me = this;
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      if (viewport.onPrizesButtonTap)
      {
         viewport.self.playSoundFile(viewport.sound_files['clickSound']);
         viewport.onPrizesButtonTap();
      }
   },
   onRedemptionsButtonTap : function()
   {
      var me = this;
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      if (viewport.onRedemptionsButtonTap)
      {
         viewport.self.playSoundFile(viewport.sound_files['clickSound']);
         viewport.onRedemptionsButtonTap();
      }
   }
});
Ext.define('Genesis.view.widgets.RedeemPtsItemBase',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.XTemplate'],
   xtype : 'redeemptsitembase',
   alias : 'widget.redeemptsitembase',
   config :
   {
   },
   applyPoints : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getPoints());
   },
   updatePoints : function(newPoints, oldPoints)
   {
      if (newPoints)
      {
         this.add(newPoints);
      }

      if (oldPoints)
      {
         this.remove(oldPoints);
      }
   },
   updateRecord : function(newRecord)
   {
      if (!newRecord)
      {
         return;
      }

      var me = this, dataview = me.config.dataview, data = dataview.prepareData(newRecord.getData(true), dataview.getStore().indexOf(newRecord), newRecord), items = me.getItems(), item = items.first(), dataMap = me.getDataMap(), componentName, component, setterMap, setterName;

      if (!item)
      {
         return;
      }
      for (componentName in dataMap)
      {
         setterMap = dataMap[componentName];
         component = me[componentName]();
         if (component)
         {
            for (setterName in setterMap)
            {
               if (component[setterName])
               {
                  switch (setterMap[setterName])
                  {
                     case 'points':
                        component[setterName](data);
                        break;
                     default :
                        component[setterName](data[setterMap[setterName]]);
                        break;
                  }
               }
            }
         }
      }
      // Bypassing setter because sometimes we pass the same object (different properties)
      item.updateData(data);
   }
});

Ext.define('Genesis.view.widgets.RewardPtsItem',
{
   extend : 'Genesis.view.widgets.RedeemPtsItemBase',
   xtype : 'rewardptsitem',
   alias : 'widget.rewardptsitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'stretch'
      },
      points :
      {
         flex : 1,
         tpl : '{points} Pts',
         cls : 'pointsphoto'
      },
      dataMap :
      {
         getPoints :
         {
            setData : 'points'
         }
      }
   }
});

Ext.define('Genesis.view.widgets.PrizePtsItem',
{
   extend : 'Genesis.view.widgets.RedeemPtsItemBase',
   xtype : 'prizeptsitem',
   alias : 'widget.prizeptsitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'stretch'
      },
      points :
      {
         flex : 1,
         tpl : '{prize_points} Pts',
         cls : 'prizephoto'
      },
      dataMap :
      {
         getPoints :
         {
            setData : 'points'
         }
      }
   }
});
Ext.define('Genesis.view.widgets.Calculator',
{
   extend : 'Ext.Container',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.calculator',
   config :
   {
      title : null,
      bottomButtons : null,
      placeHolder : '0',
      hideZero : false,
      cls : 'calculator',
      layout : 'fit',
      // -------------------------------------------------------------------
      // Reward Calculator
      // -------------------------------------------------------------------
      items : [
      {
         height : '2.6em',
         docked : 'top',
         xtype : 'toolbar',
         centered : false,
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            xtype : 'title',
            title : ' '
         },
         {
            xtype : 'spacer',
            align : 'right'
         }]
      },
      {
         docked : 'top',
         xtype : 'textfield',
         name : 'amount',
         value : '',
         clearIcon : false,
         placeHolder : ' ',
         readOnly : true,
         required : true
      },
      {
         xtype : 'container',
         layout : 'vbox',
         tag : 'dialpad',
         cls : 'dialpad',
         defaults :
         {
            xtype : 'container',
            layout : 'hbox',
            flex : 1,
            defaults :
            {
               xtype : 'button',
               flex : 1
            }
         },
         items : [
         {
            items : [
            {
               text : '1'
            },
            {
               text : '2'
            },
            {
               text : '3'
            }]
         },
         {
            items : [
            {
               text : '4'
            },
            {
               text : '5'
            },
            {
               text : '6'
            }]
         },
         {
            items : [
            {
               text : '7'
            },
            {
               text : '8'
            },
            {
               text : '9'
            }]
         },
         {
            items : [
            {
               text : 'AC'
            },
            {
               tag : 'zero',
               flex : 2.3,
               text : '0'
            }]
         }]
      },
      {
         cls : 'bottomButtons',
         xtype : 'container',
         tag : 'bottomButtons',
         docked : 'bottom',
         layout : 'hbox',
         defaults :
         {
            xtype : 'button',
            flex : 1
         }
      }]
   },
   initialize : function()
   {
      var me = this;
      var title = me.query('title')[0];
      var textField = me.query('textfield')[0];
      var buttons = me.query('container[tag=bottomButtons]')[0];

      title.setTitle(me.getTitle());
      textField.setPlaceHolder(me.getPlaceHolder());
      buttons.add(me.getBottomButtons());

      if (me.getHideZero())
      {
         var btn = me.query("button[tag=zero]")[0];
         btn.getParent().remove(btn);
      }
   }
});
/**
 * @class Ext.data.proxy.WebSql
 * @author Paul van Santen
 * @author Grgur Grisogono
 *
 * WebSQL proxy connects models and stores to local WebSQL database.
 *
 * WebSQL is deprecated in favor of indexedDb, so use with caution.
 * IndexedDb is not available for mobile browsers at the time of writing this code
 *
 * Version: 0.3
 *
 * TODO:
 *      filters,
 *      failover option for remote proxies,
 *      database version migration
 */
Ext.define('Genesis.data.proxy.WebSql',
{
   extend : 'Ext.data.proxy.Proxy',
   alias : 'proxy.websql',

   config :
   {
      batchActions : true,

      /**
       * @cfg {String} version
       * database version. If different than current, use updatedb event to update database
       */
      dbVersion : '1.0',

      /**
       * @cfg {String} dbName
       * @required
       * Name of database
       */
      dbName : undefined,

      /**
       * @cfg {String} dbDescription
       * Description of the database
       */
      dbDescription : 'Kickbak Database',

      /**
       * @cfg {String} dbSize
       * Max storage size in bytes
       */
      dbSize : 2 * 1024 * 1024,

      /**
       * @cfg {String} dbTable
       * @required
       * Name for table where all the data will be stored
       */
      dbTable : undefined,

      /**
       * @cfg {String} pkField
       * Primary key name. Defaults to idProperty
       */
      pkField : undefined,

      /**
       * @cfg {String} pkType
       * Type of primary key. By default it an autoincrementing integer
       */
      pkType : 'INTEGER PRIMARY KEY ASC',

      /**
       * @cfg {boolean} insertReplace
       * Setting that switches the insert and save methods
       * When true it will do INSERT OR REPLACE queries, otherwise UPDATE and INSERT queries
       */
      insertOrReplace : false,

      /**
       * @cfg {boolean} autoCreateTable
       * Should we automaticly create the table if it does not exists when initializing?
       */
      autoCreateTable : true,

      /**
       * @cfg {string[]} customWhereClauses
       * The custom where clauses to use when querying
       */
      customWhereClauses : [],

      /**
       * @cfg {Array} customWhereParams
       * The parameters for the custom where clauses to use when querying
       */
      customWhereParameters : []
   },
   /**
    * @type {Database} database
    * @private
    * db object
    */
   database : undefined,

   /**
    * The maximum number of arguments in a SQLite query
    * @type {number} maxArguments
    * @private
    */
   maxArguments : 100,

   /**
    * Creates the proxy, throws an error if local storage is not supported in the current browser.
    * @param {Object} config (optional) Config object.
    */
   constructor : function(config)
   {
      this.initConfig(config);
      this.callParent(arguments);
   },

   /**
    * Sets the custom clauses and parameters
    * @param {Array} clauses
    * @param {Array} params
    */
   setCustomWhereClausesAndParameters : function(clauses, params)
   {
      this.setCustomWhereClauses(clauses);
      this.setCustomWhereParameters(params);
   },

   /**
    * Clears the custom where clauses
    */
   clearCustomWhereClauses : function()
   {
      this.setCustomWhereClauses([]);
      this.setCustomWhereParameters([]);
   },

   /**
    * Adds a custom where clause
    * @param {string} clause
    */
   addCustomWhereClause : function(clause)
   {
      this.getCustomWhereClauses().push(clause);
   },

   /**
    * Clears the custom where clauses
    */
   clearCustomWhereParameters : function()
   {
      this.setCustomWhereParameters([]);
   },

   /**
    * Adds a custom where clause
    * @param param
    */
   addCustomWhereParameter : function(param)
   {
      this.getCustomWhereParameters().push(param);
   },

   /**
    * Executes a query
    * @param {SQLTransaction} transaction
    * @param {string} query
    * @param {Array} [args]
    * @param {Function} [success]
    * @param {Function} [fail]
    * @param {Object} [scope]
    */
   doQuery : function(transaction, query, args, success, fail, scope)
   {
      if (!Ext.isFunction(success))
      {
         success = Ext.emptyFn;
      }
      //<debug>
      //        console.debug('EXEC_QUERY: ', query, args);
      //</debug>
      transaction.executeSql(query, args, Ext.bind(success, scope || this), Ext.bind(this.queryError, this, [query, args, fail, scope], true));
   },

   /**
    * Executes a single query, automaticly creates a transaction
    * @param {string} query
    * @param {Array} [args]
    * @param {Function} [success]
    * @param {Function} [fail]
    * @param {Object} [scope]
    */
   doSingleQuery : function(query, args, success, fail, scope)
   {
      var me = this, db = me.database;

      db.transaction(function(transaction)
      {
         me.doQuery(transaction, query, args, success, fail, scope);
      });
   },

   /**
    * Called when a query has an error
    * @param {SQLTransaction} transaction
    * @param {SQLError} error
    * @param {string} query
    * @param {Array} args
    * @param {Function} fail
    * @param {Object} scope
    * @throws {Object} Exception
    */
   queryError : function(transaction, error, query, args, fail, scope)
   {
      if (Ext.isFunction(fail))
      {
         fail.call(scope || this, transaction, error);
      }
      //<debug>
      console.debug('QUERY_ERROR: ', error, query, args);
      //</debug>
      throw (
         {
            code : 'websql_error',
            message : "SQL error: " + error.message + "\nSQL query: " + query + (args && args.length ? ("\nSQL params: " + args.join(', ')) : '' )
         });
   },

   /**
    * @private
    * Sets up the Proxy by opening database and creating table if necessary
    */
   initialize : function()
   {
      var me = this, pk = 'id';
      var _init_ = function()
      {
         Ext.defer(function()
         {
            if ((launched & 0x010))
            {
               var db = window.openDatabase(me.getDbName(), me.getDbVersion(), me.getDbDescription(), me.getDbSize()), query;

               db.transaction(function(transaction)
               {
                  pk = me.getPkField() || (me.getReader() && me.getReader().getIdProperty()) || pk;
                  me.setPkField(pk);

                  query = 'CREATE TABLE IF NOT EXISTS ' + me.getDbTable() + ' (' + pk + ' ' + me.getPkType() + ', ' + me.getDbFields().join(', ') + ')';
                  //console.debug("WebSql Init - QUERY - " + query);

                  me.doQuery(transaction, query, null, function()
                  {
                     //console.debug("WebSql Init - " + me.getDbName() + "," + me.getDbTable());
                     me.database = db;
                  });
               }, function()
               {
                  //console.debug("WebSql Init Fail - " + me.getDbName() + "," + me.getDbTable());
               }, function()
               {
                  //console.debug("WebSql Init Success - " + me.getDbName() + "," + me.getDbTable());
               });
            }
            else
            {
               _init_();
            }
         }, 0.1 * 1000, me);
      };

      _init_();
   },

   /**
    * Drops the table
    * @param {Function} [callback]
    * @param {Object} [scope]
    */
   dropTable : function(callback, scope)
   {
      var me = this;
      var _drop_ = function()
      {
         var dropCallback = function()
         {
            if (callback)
            {
               callback.call(scope || me);
            }
         };

         if (me.datababase)
         {
            me.database.transaction(function(transaction)
            {
               me.doQuery(transaction, 'DROP TABLE IF EXISTS ' + me.getDbTable());
            }, dropCallback, dropCallback);
         }
         else
         {
            Ext.defer(me.dropTable, 0.1 * 1000, me, arguments);
         }
      };

      _drop_();
   },

   /**
    * Empties (truncates) the table
    * @param {Function} [callback]
    * @param {Object} [scope]
    */
   emptyTable : function(callback, scope)
   {
      var me = this, emptyCallback = function()
      {
         if (callback)
         {
            callback.call(scope || me);
         }
      };

      me.database.transaction(function(transaction)
      {
         me.doQuery(transaction, 'DELETE FROM ' + me.getDbTable());
      }, emptyCallback, emptyCallback);
   },
   clear : function(callback, scope)
   {
      this.emptyTable(callback, scope);
   },

   /**
    * @private
    * Get reader data and set up fields accordingly
    * Used for table creation only
    * @return {Array} Fields array
    */
   getDbFields : function()
   {
      var me = this, fields = me.getModel().getFields(), flatFields = [], pkField = me.getPkField().toLowerCase(), name, type, sqlType, i;

      for ( i = 0; i < fields.length; i++)
      {
         name = fields.items[i].getName();
         type = fields.items[i].getType().type;

         if (name === pkField)
         {
            continue;
         }

         switch (type.toLowerCase())
         {
            case 'int':
               sqlType = 'INTEGER';
               break;
            case 'float':
               sqlType = 'FLOAT';
               break;
            case 'bool':
               sqlType = 'BOOLEAN';
               break;
            case 'date':
               sqlType = 'DATETIME';
               break;
            default:
               sqlType = 'TEXT';
               break;
         }
         flatFields.push(name + ' ' + sqlType);
      }

      return flatFields;
   },
   /**
    * Gets an object of the form {key -> value} for every field in the database table
    * Called before saving a record to determine db structure
    * @param {Ext.data.Fields} fields
    * @param {Ext.data.Model} record
    * @returns {Object}
    */
   getDbFieldData : function(fields, record)
   {
      var object =
      {
      }, fieldName, i;

      for ( i = 0; i < fields.length; i++)
      {

         fieldName = fields.items[i].getName();
         object[fieldName] = this.convertFieldToDb(fields.items[i], record.get(fieldName));
      }
      return object;
   },

   /**
    * Reads a record from a DB row
    * @param {SQLResultSetRowList} row
    * @return {Object} Model object
    */
   readRecordFromRow : function(row)
   {
      var Model = this.getModel(), fields = Model.getFields(), name, i,
      // Copy this object because apparently we are not allowed to alter the original parameter object, weird huh?
      rowObj = Ext.apply(
      {
      }, row);

      for ( i = 0; i < fields.length; i++)
      {
         name = fields.items[i].getName();
         rowObj[name] = this.convertFieldToRecord(fields.items[i], row[name]);
      }
      return new Model(rowObj);
   },

   /**
    * Converts a queried field value to the respective record value
    * @param {Ext.data.Field} field
    * @param value
    * @return
    */
   convertFieldToRecord : function(field, value)
   {
      var type = field.getType().type;
      switch (type.toLowerCase())
      {
         case 'date':
            return Ext.Date.parse(value, 'Y-m-d H:i:s', true);
         case 'bool':
            return value ? true : false;
         //            case 'auto':
         //                return Ext.decode(value, true);
      }
      return value;
   },

   /**
    * Converts a record field to the respective DB field value
    * @param {Ext.data.Field} field
    * @param value
    * @return
    */
   convertFieldToDb : function(field, value)
   {
      var type = field.getType().type;

      switch (type.toLowerCase())
      {
         case 'date':
            if (value)
            {
               return Ext.Date.format(value, 'Y-m-d H:i:s');
            }
            else
            {
               return '';
            }
         case 'bool':
            return value ? 1 : 0;
         //            case 'auto':
         //                return Ext.encode(value);
      }
      return value;
   },

   /**
    * Inserts or replaces the records of an operation
    * @param {Ext.data.Operation} operation
    * @param {Function} callback
    * @param {Object} scope
    */
   insertOrReplaceRecords : function(operation, callback, scope)
   {
      var me = this, records = operation.getRecords(), processedRecords = [];

      operation.setStarted();

      me.database.transaction(function(transaction)
      {
         if (!records.length)
         {
            return;
         }

         var fields = me.getModel().getFields(), query, queryParts, recordQueryParts, dbFieldData, args;

         Ext.each(records, function(record)
         {
            queryParts = [];
            recordQueryParts = [];
            args = [];

            query = 'INSERT OR REPLACE INTO ' + me.getDbTable() + "\n";
            dbFieldData = me.getDbFieldData(fields, record);

            for (var key in dbFieldData)
            {
               if (dbFieldData.hasOwnProperty(key))
               {
                  if (dbFieldData[key] === undefined)
                  {
                     queryParts.push(key);
                     recordQueryParts.push('?');

                     args.push(null);
                  }
                  else if (record.phantom && key == me.getPkField())
                  {
                  }
                  else
                  {
                     queryParts.push(key);
                     recordQueryParts.push('?');
                     args.push(dbFieldData[key]);
                  }
               }
            }
            query += ' ( ' + queryParts.join(', ') + " )\n";
            query += 'VALUES ( ' + recordQueryParts.join(', ') + " )\n";

            me.doQuery(transaction, query, args, function(transaction, resultset)
            {
               processedRecords.push(
               {
                  clientId : record.getId(),
                  id : record.getId()
               });
            });
         });

      }, function(error)
      {
         // Error
         operation.setException(error);

         if (Ext.isFunction(callback))
         {
            callback.call(scope || this, operation);
         }
      }, function()
      {
         // Success
         operation.setResultSet(Ext.create('Ext.data.ResultSet',
         {
            records : processedRecords,
            success : true
         }));

         operation.process(operation.getAction(), operation.getResultSet());

         operation.setSuccessful();
         operation.setCompleted();

         if (Ext.isFunction(callback))
         {
            callback.call(scope || this, operation);
         }
      });
   },

   /**
    * Called when records are created
    * @param {Ext.data.Operation} operation
    * @param {Function} callback
    * @param {Object} scope
    */
   create : function(operation, callback, scope)
   {
      if (this.getInsertOrReplace())
      {
         this.insertOrReplaceRecords(operation, callback, scope);
      }
      else
      {
         this.insertRecords(operation, callback, scope);
      }
   },

   /**
    * Executes insert queries for an operation
    * @param {Ext.data.Operation} operation
    * @param {Function} callback
    * @param {Object} scope
    */
   insertRecords : function(operation, callback, scope)
   {
      var me = this, records = operation.getRecords(), fields = me.getModel().getFields(), insertedRecords = [];

      operation.setStarted();

      me.database.transaction(function(transaction)
      {

         Ext.each(records, function(record)
         {
            var queryParts = [], recordQueryParts = [], args = [], query = 'INSERT INTO ' + me.getDbTable() + "\n", dbFieldData = me.getDbFieldData(fields, record), tempId = record.getId();

            for (var key in dbFieldData)
            {
               if (dbFieldData.hasOwnProperty(key))
               {
                  if (dbFieldData[key] === undefined)
                  {
                     queryParts.push(key);
                     recordQueryParts.push('?');

                     args.push(null);
                  }
                  else if (record.phantom && key == me.getPkField())
                  {
                  }
                  else
                  {
                     queryParts.push(key);
                     recordQueryParts.push('?');

                     args.push(dbFieldData[key]);
                  }
               }
            }
            query += ' ( ' + queryParts.join(', ') + " )\n";
            query += 'VALUES ( ' + recordQueryParts.join(', ') + " )\n";

            me.doQuery(transaction, query, args, function(transaction, resultset)
            {
               insertedRecords.push(
               {
                  clientId : record.getId(),
                  id : resultset.insertId
               });
            });
         });

      }, function(error)
      {
         // Error
         operation.setException(error);

         if (Ext.isFunction(callback))
         {
            callback.call(scope || this, operation);
         }
      }, function()
      {
         // Success
         operation.setResultSet(Ext.create('Ext.data.ResultSet',
         {
            records : insertedRecords,
            success : true
         }));

         operation.process(operation.getAction(), operation.getResultSet());

         operation.setSuccessful();
         operation.setCompleted();

         if (Ext.isFunction(callback))
         {
            callback.call(scope || this, operation);
         }
      });
   },

   /**
    * Updates records
    * @param {Ext.data.Operation} operation
    * @param {Function} callback
    * @param {Object} scope
    */
   update : function(operation, callback, scope)
   {
      if (this.getInsertOrReplace())
      {
         this.insertOrReplaceRecords(operation, callback, scope);
      }
      else
      {
         this.updateRecords(operation, callback, scope);
      }
   },

   /**
    * Executes update queries for an operation
    * @param {Ext.data.Operation} operation
    * @param {Function} callback
    * @param {Object} scope
    */
   updateRecords : function(operation, callback, scope)
   {
      var me = this, records = operation.getRecords(), updatedRecords = [];

      operation.setStarted();

      me.database.transaction(function(transaction)
      {

         var fields = me.getModel().getFields(), query, queryParts, dbFieldData, args;

         Ext.each(records, function(record)
         {
            queryParts = [];
            args = [];

            query = 'UPDATE ' + me.getDbTable() + " SET \n";
            dbFieldData = me.getDbFieldData(fields, record);

            for (var key in dbFieldData)
            {
               if (dbFieldData.hasOwnProperty(key) && key != me.getPkField())
               {
                  queryParts.push(key + ' = ?');

                  if (dbFieldData[key] === undefined)
                  {
                     args.push(null);
                  }
                  else
                  {
                     args.push(dbFieldData[key]);
                  }
               }
            }
            query += queryParts.join(', ');
            query += ' WHERE ' + me.getPkField() + ' = ? ';
            args.push(record.get(me.getPkField()));

            me.doQuery(transaction, query, args, function(transaction, resultset)
            {
               updatedRecords.push(
               {
                  clientId : record.getId(),
                  id : record.getId()
               });
            });
         });

      }, function(error)
      {
         // Error
         operation.setException(error);

         if (Ext.isFunction(callback))
         {
            callback.call(scope || this, operation);
         }
      }, function()
      {
         // Success
         operation.setResultSet(Ext.create('Ext.data.ResultSet',
         {
            records : updatedRecords,
            success : true
         }));

         operation.process(operation.getAction(), operation.getResultSet());

         operation.setSuccessful();
         operation.setCompleted();

         if (Ext.isFunction(callback))
         {
            callback.call(scope || this, operation);
         }
      });
   },

   /**
    * Reads one or more records
    * @param {Ext.data.Operation} operation
    * @param {Function} callback
    * @param {Object} scope
    */
   read : function(operation, callback, scope)
   {
      var me = this, records = [], params = operation.getParams() ||
      {
      }, wheres = [], sorters = operation.getSorters(), sortProperty, orderBy = [], args = [], limit = operation.getLimit(), start = operation.getStart(), customClauses = me.getCustomWhereClauses(), customParams = me.getCustomWhereParameters(), query = 'SELECT t.* FROM ' + me.getDbTable() + ' t';

      if (me.database)
      {
         //console.debug("WebSql read - " + me.getDbName() + "," + me.getDbTable());
         if (params)
         {
            for (var key in params)
            {
               if (params.hasOwnProperty(key))
               {
                  wheres.push('t.' + key + ' = ? ');
                  args.push(params[key]);
               }
            }
         }

         if (customClauses.length)
         {
            wheres = Ext.Array.merge(wheres, customClauses);
         }
         if (customParams.length)
         {
            args = Ext.Array.merge(args, customParams);
         }

         if (wheres.length)
         {
            query += ' WHERE ' + wheres.join(' AND ');
         }

         if (sorters)
         {
            for (var i = 0; i < sorters.length; i++)
            {
               sortProperty = sorters[i].getProperty();
               if (!sortProperty)
               {
                  sortProperty = sorters[i].getSortProperty();
               }
               orderBy.push('t.' + sortProperty + ' ' + sorters[i].getDirection());
            }
         }

         if (orderBy.length)
         {
            query += ' ORDER BY ' + orderBy.join(', ');
         }

         if (limit || start)
         {
            start = start || 0;
            query += ' LIMIT ' + limit + ' OFFSET ' + start;
         }

         me.database.transaction(function(transaction)
         {
            me.doQuery(transaction, query, args, function(transaction, resultset)
            {
               var length = resultset.rows.length, row;

               for (var i = 0; i < length; i++)
               {
                  row = resultset.rows.item(i);
                  records.push(me.readRecordFromRow(row));
               }

               operation.setCompleted();

               operation.setResultSet(Ext.create('Ext.data.ResultSet',
               {
                  records : records,
                  count : records.length,
                  total : records.length,
                  loaded : true
               }));
               operation.setRecords(records);
               operation.setSuccessful();

               if ( typeof callback == 'function')
               {
                  callback.call(scope || this, operation);
               }
            });

         }, function(error)
         {
            // Error
            operation.setException(error);

            if (Ext.isFunction(callback))
            {
               callback.call(scope || this, operation);
            }
         });
      }
      else
      {
         Ext.defer(me.read, 0.1 * 1000, me, arguments);
      }
   },

   /**
    * Destroys records
    * @param {Ext.data.Operation} operation
    * @param {Function} callback
    * @param {Object} scope
    */
   destroy : function(operation, callback, scope)
   {
      var me = this, pkField = me.getPkField(), ids = [], records = operation.getRecords(), destroyedRecords = [], query, wheres, args, id, i;

      for ( i = 0; i < records.length; i++)
      {
         ids.push(records[i].get(pkField));
      }

      me.database.transaction(function(transaction)
      {
         while (ids.length)
         {
            wheres = [];
            args = [];
            id = undefined;

            while (args.length + 1 <= me.maxArguments && ids.length)
            {
               id = ids.pop();
               wheres.push(pkField + ' = ? ');
               args.push(id);

               destroyedRecords.push(
               {
                  id : id
               });
            }

            query = 'DELETE FROM ' + me.getDbTable() + ' WHERE ' + wheres.join(' OR ');
            me.doQuery(transaction, query, args);
         }
      }, function(error)
      {
         // Error
         operation.setException(error);

         if (Ext.isFunction(callback))
         {
            callback.call(scope || this, operation);
         }
      }, function()
      {
         // Success
         operation.process(operation.getAction(), Ext.create('Ext.data.ResultSet',
         {
            records : destroyedRecords,
            success : true
         }));

         operation.setSuccessful();
         operation.setCompleted();

         if (Ext.isFunction(callback))
         {
            callback.call(scope || this, operation);
         }
      });
   }
});

/**
 * @author Grgur Grisogono
 *
 * IndexedDB proxy connects models and stores to local IndexedDB storage.
 *
 * IndexedDB is only available in Firefox 4+ and Chrome 10+ at the moment.
 *
 * Version: 0.5
 *
 * TODO: respect sorters, filters, start and limit options on the Operation; failover option for remote proxies, ..
 */
Ext.define('Genesis.data.proxy.IndexedDB',
{
   extend : 'Ext.data.proxy.Proxy',

   alias : 'proxy.idb',

   alternateClassName : 'Genesis.data.IdbProxy',

   config :
   {
      /**
       * @cfg {String} version
       * database version. If different than current, use updatedb event to update database
       */
      dbVersion : '1.0',

      /**
       * @cfg {String} dbName
       * Name of database
       */
      dbName : null,

      /**
       * @cfg {String} objectStoreName
       * Name of object store
       */
      objectStoreName : undefined,

      /**
       * @cfg {String} keyPath
       * Primary key for objectStore. Proxy will use reader's idProperty if not keyPath not defined.
       */
      keyPath : undefined,

      /**
       * @cfg {Boolean} autoIncrement
       * Set true if keyPath is to autoIncrement. Defaults to IndexedDB default specification (false)
       */
      autoIncrement : false,

      /**
       * @cfg {Array} indexes
       * Array of Objects. Properties required are "name" for index name and "field" to specify index field
       * e.g. indexes: [{name: 'name', field: 'somefield', options: {unique: false}}]
       */
      indexes : [],

      /**
       * @cfg {Array} initialData
       * Initial data that will be inserted in object store on store creation
       */
      initialData : [],

      /**
       * @private
       * indexedDB object (if browser supports it)
       */
      indexedDB : window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB,

      /**
       * @private
       * db object
       */
      db : undefined,

      /**
       * @private
       * used to monitor initial data insertion. A helper to know when all data is in. Helps fight asynchronous nature of idb.
       */
      initialDataCount : 0,

      /**
       * @private
       * Trigger that tells that proxy is currently inserting initial data
       */
      insertingInitialData : false
   },

   /**
    * Creates the proxy, throws an error if local storage is not supported in the current browser.
    * @param {Object} config (optional) Config object.
    */
   constructor : function(config)
   {
      this.initConfig(config);
      this.callParent(arguments);

      this.checkDependencies();

      this.addEvents('dbopen', 'updatedb', 'exception', 'cleardb', 'initialDataInserted', 'noIdb');

      //<debug>
      //fix old webkit references
      if ('webkitIndexedDB' in window)
      {
         window.IDBTransaction = window.webkitIDBTransaction;
         window.IDBKeyRange = window.webkitIDBKeyRange;
         window.IDBCursor = window.webkitIDBCursor;
      }
      //</debug>
   },

   /**
    * @private
    * Sets up the Proxy by opening database and creatinbg object store if necessary
    */
   initialize : function()
   {
      var me = this, request = me.getIndexedDB().open(me.getDbName(), me.getDbVersion()), indexes = me.getIndexes();

      me.on('updatedb', me.addInitialData);

      request.onsuccess = function(e)
      {
         var db = me.getIndexedDB().db = e.target.result, setVrequest, keyPath;

         me.setDb(db);

         me.fireEvent('dbopen', me, db);
      };

      request.onfailure = me.onerror;

      request.onupgradeneeded = function(e)
      {
         var i, store, db = e.target.result;

         me.setDb(db);

         //clean old versions
         if (db.objectStoreNames.contains(me.getObjectStoreName()))
         {
            db.deleteObjectStore(me.getObjectStoreName());
         }

         //set keyPath. Use idProperty if keyPath is not specified
         if (!me.getKeyPath())
         {
            me.setKeyPath(me.getReader().getIdProperty());
         }

         // create objectStore
         keyPath = me.getKeyPath() ?
         {
            keyPath : me.getKeyPath()
         } : undefined;
         store = db.createObjectStore(me.getObjectStoreName(), keyPath, me.getAutoIncrement());

         // set indexes
         for (i in indexes)
         {
            if (indexes.hasOwnProperty(i))
            {
               db.objectStore.createIndex(indexes.name, indexes.field, indexes.options);
            }
         }

         //Database is open and ready so fire dbopen event
         me.fireEvent('updatedb', me, db);
      }
   },

   /**
    * Universal error reporter for debugging purposes
    * @param {Object} err Error object.
    */
   onError : function(err)
   {
      if (window.console)
         console.debug(err);
   },

   /**
    * Check if all needed config options are set
    */
   checkDependencies : function()
   {
      var me = this;
      window.p = me;
      if (!me.getIndexedDB())
      {
         me.fireEvent('noIdb');
         Ext.Error.raise("IndexedDB is not supported in your browser.");
      }
      if (!Ext.isString(me.getDbName()))
         Ext.Error.raise("The dbName string has not been defined in your Genesis.data.proxy.IndexedDB");
      if (!Ext.isString(me.getObjectStoreName()))
         Ext.Error.raise("The objectStoreName string has not been defined in your Genesis.data.proxy.IndexedDB");

      return true;
   },

   /**
    * Add initial data if set at {@link #initialData}
    */
   addInitialData : function()
   {
      this.addData();
   },

   /**
    * Add data when needed
    * Also add initial data if set at {@link #initialData}
    * @param {Array/Ext.data.Store} newData Data to add as array of objects or a store instance. Optional
    * @param {Boolean} clearFirst Clear existing data first
    */
   addData : function(newData, clearFirst)
   {
      var me = this, model = me.getModel().getName(), data = newData || me.getInitialData();

      //clear objectStore first
      if (clearFirst === true)
      {
         me.clear();
         me.addData(data);
         return;
      }

      if (Ext.isObject(data) && data.isStore === true)
      {
         data = me.getDataFromStore(data);
      }

      me.setInitialDataCount(data.length);
      me.setInsertingInitialData(true);

      Ext.each(data, function(entry)
      {
         Ext.ModelManager.create(entry, model).save();
      })
   },

   /**
    * Get data from store. Usually from Server proxy.
    * Useful if caching data data that don't change much (e.g. for comboboxes)
    * Used at {@link #addData}
    * @private
    * @param {Ext.data.Store} store Store instance
    * @return {Array} Array of raw data
    */
   getDataFromStore : function(store)
   {
      var data = [];
      store.each(function(item)
      {
         data.push(item.data)
      });
      return data;
   },
   //inherit docs
   create : function(operation, callback, scope)
   {
      var records = operation.getRecords(), length = records.length, id, record, i;

      operation.setStarted();

      for ( i = 0; i < length; i++)
      {
         record = records[i];
         this.setRecord(record);
      }

      operation.setCompleted();
      operation.setSuccessful();

      if ( typeof callback == 'function')
      {
         callback.call(scope || this, operation);
      }
   },

   //inherit docs
   read : function(operation, callback, scope)
   {
      var records = [], me = this;

      var finishReading = function(record, request, event)
      {
         me.readCallback(operation, record);

         if ( typeof callback == 'function')
         {
            callback.call(scope || this, operation);
         }
      }
      //read a single record
      if (operation.id)
      {
         this.getRecord(operation.id, finishReading, me);
      }
      else
      {
         this.getAllRecords(finishReading, me);
         operation.setSuccessful();
      }
   },

   /**
    * Injects data in operation instance
    */
   readCallback : function(operation, records)
   {
      var rec = Ext.isArray(records) ? records : [records];
      operation.setSuccessful();
      operation.setCompleted();
      operation.setResultSet(Ext.create('Ext.data.ResultSet',
      {
         records : rec,
         total : rec.length,
         loaded : true
      }));
   },

   //inherit docs
   update : function(operation, callback, scope)
   {
      var records = operation.getRecords(), length = records.length, record, id, i;

      operation.setStarted();

      for ( i = 0; i < length; i++)
      {
         record = records[i];
         this.updateRecord(record);
      }
      operation.setCompleted();
      operation.setSuccessful();

      if ( typeof callback == 'function')
      {
         callback.call(scope || this, operation);
      }
   },

   //inherit
   destroy : function(operation, callback, scope)
   {
      var records = operation.getRecords(), length = records.length, i;

      for ( i = 0; i < length; i++)
      {
         Ext.Array.remove(newIds, records[i].getId());
         this.removeRecord(records[i], false);
      }

      //this.setIds(newIds);

      operation.setCompleted();
      operation.setSuccessful();

      if ( typeof callback == 'function')
      {
         callback.call(scope || this, operation);
      }
   },

   /**
    * Create objectStore instance
    * @param {String} type Transaction type (r, rw)
    * @param {Function} callback Callback function
    * @param {Object} scope Callback fn scope
    * @return {Object} IDB objectStore instance
    */
   getObjectStore : function(type, callback, scope)
   {
      try
      {
         var me = this, transTypes =
         {
            'rw' : "readwrite",
            'r' : "readonly",
            'vc' : "versionchange"
         }, transaction = me.getDb().transaction([me.getObjectStoreName()], type ? transTypes[type] : undefined), objectStore = transaction.objectStore(me.getObjectStoreName());
      }
      catch(e)
      {
         //retry until available due to asynchronous nature of indexedDB transaction. Not the best of workaraunds.
         Ext.defer(callback, 20, scope || me, [type, callback, scope]);
         return false;
         //callback.call(scope || me, type, callback, scope);
      }

      return objectStore;
   },

   /**
    * @private
    * Fetches a single record by id.
    * @param {Mixed} id Record id
    * @param {Function} callback Callback function
    * @param {Object} scope Callback fn scope
    */
   getRecord : function(id, callback, scope)
   {
      var me = this, objectStore = me.getObjectStore('r', Ext.bind(me.getRecord, me, [id, callback, scope])), Model = this.getModel(), record;

      if (!objectStore)
         return false;

      var request = objectStore.get(id);

      request.onerror = function(event)
      {
         me.fireEvent('exception', me, event);
      };

      request.onsuccess = function(event)
      {
         record = new Model(request.result, id);
         if ( typeof callback == 'function')
         {
            callback.call(scope || me, record, request, event);
         }
      };

      return true;
   },

   /**
    * @private
    * Fetches all records
    * @param {Function} callback Callback function
    * @param {Object} scope Callback fn scope
    */
   getAllRecords : function(callback, scope)
   {
      var me = this, objectStore = me.getObjectStore('r', Ext.bind(me.getAllRecords, me, [callback, scope])), Model = this.getModel(), records = [];

      if (!objectStore)
         return;

      var request = objectStore.openCursor();

      request.onerror = function(event)
      {
         me.fireEvent('exception', me, event);
      };

      request.onsuccess = function(event)
      {
         var cursor = event.target.result;
         if (cursor)
         {
            //res.push(cursor.value);
            records.push(new Model(cursor.value, cursor.key));
            cursor["continue"]();
         }
         else
         {

            if ( typeof callback == 'function')
            {
               callback.call(scope || me, records, request, event)
            }
         }

      };
   },

   /**
    * Saves the given record in the Proxy.
    * @param {Ext.data.Model} record The model instance
    */
   setRecord : function(record)
   {
      var me = this, rawData = record.data, objectStore = me.getObjectStore('rw', Ext.bind(me.setRecord, me, [record]));

      if (!objectStore)
         return;

      var request = objectStore.add(rawData);

      request.onsuccess = function()
      {
         if (me.getInsertingInitialData())
         {
            me.setInitialDataCount(me.getInsertingInitialData() - 1);
            if (me.getInitialDataCount() === 0)
            {
               me.setInsertingInitialData(false);
               me.fireEvent('initialDataInserted');
            }
         }
      }
   },

   /**
    * Updates the given record.
    * @param {Ext.data.Model} record The model instance
    */
   updateRecord : function(record)
   {
      var me = this, objectStore = me.getObjectStore('rw', Ext.bind(me.updateRecord, me, [record])), Model = this.getModel(), id = record.internalId || record[me.getKeyPath()], modifiedData = record.modified, newData = record.data;

      if (!objectStore)
         return false;

      var keyRange = IDBKeyRange.only(id), cursorRequest = objectStore.openCursor(keyRange);

      cursorRequest.onsuccess = function(e)
      {
         var result = e.target.result;
         if (!!!result)
         {
            return me.setRecord(record);
         }

         for (var i in modifiedData)
         {
            result.value[i] = newData[i];
         }
         result.update(result.value);
      };

      cursorRequest.onerror = function(event)
      {
         me.fireEvent('exception', me, event);
      };

      return true;
   },

   /**
    * @private
    * Physically removes a given record from the object store.
    * @param {Mixed} id The id of the record to remove
    */
   removeRecord : function(id)
   {
      var me = this, objectStore = me.getObjectStore('rw', Ext.bind(me.removeRecord, me, [id]));
      if (!objectStore)
         return;

      var request = objectStore["delete"](id);

   },

   /**
    * Destroys all records stored in the proxy
    */
   clear : function(callback, scope)
   {
      var me = this, objectStore = me.getObjectStore('r', Ext.bind(me.clear, me, [callback, scope])), Model = this.getModel(), records = [];

      if (!objectStore)
         return;

      var request = objectStore.openCursor();

      request.onerror = function(event)
      {
         me.fireEvent('exception', me, event);
      };

      request.onsuccess = function(event)
      {
         var cursor = event.target.result;
         if (cursor)
         {
            me.removeRecord(cursor.key);
            cursor["continue"]();
         }
         me.fireEvent('cleardb', me);
         callback.call(scope || me);
      };

   }
});

/**
 * @author Grgur Grisogono
 *
 * BrowserDB Proxy for Ext JS 4 uses best available browser (local) database to use for your locally stored data
 * Currently available: IndexedDB and WebSQL DB
 *
 * Version: 0.3
 *
 */
(function()
{

   var idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB, cfg =
   {
   };

   /**
    * Choose which proxy to extend based on available features. IndexedDB is preferred over Web SQL DB
    */
   if (!idb)
   {
      cfg.dbInUse = 'websql';
      
      Ext.define('Genesis.data.proxy.BrowserDB',
      {
         extend : 'Genesis.data.proxy.WebSql',

         alias : 'proxy.browserdb',

         alternateClassName : 'Genesis.data.proxy.BrowserCache',

         dbInUse : cfg.dbInUse,

         /**
          * Route to the right proxy.
          * @param {Object} config (optional) Config object.
          */
         constructor : function(config)
         {
            // make sure config options are synced
            if (this.dbInUse !== 'idb')
            {
               config.dbTable = config.dbTable || config.objectStoreName;
            }
            else
            {
               config.objectStoreName = config.objectStoreName || config.dbTable;
            }
            this.callParent(arguments);
         }
      });
   }
   else
   {
      cfg.dbInUse = 'idb';
      
      Ext.define('Genesis.data.proxy.BrowserDB',
      {
         extend : 'Genesis.data.proxy.IndexedDB',

         alias : 'proxy.browserdb',

         alternateClassName : 'Genesis.data.proxy.BrowserCache',

         dbInUse : cfg.dbInUse,

         /**
          * Route to the right proxy.
          * @param {Object} config (optional) Config object.
          */
         constructor : function(config)
         {
            // make sure config options are synced
            if (this.dbInUse !== 'idb')
            {
               config.dbTable = config.dbTable || config.objectStoreName;
            }
            else
            {
               config.objectStoreName = config.objectStoreName || config.dbTable;
            }
            this.callParent(arguments);
         }
      });
   }
})();

Ext.define('Genesis.model.frontend.LicenseKeyJSON',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'LicenseKeyJSON',
   id : 'LicenseKeyJSON',
   config :
   {
      proxy :
      {
         type : 'localstorage',
         id : 'LicenseKeyJSON',
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json'
         }
      },
      identifier : 'uuid',
      fields : ['json', 'id'],
      idProperty : 'id'
   }
});

Ext.define('Genesis.model.frontend.LicenseKeyDB',
{
   extend : 'Genesis.model.frontend.LicenseKeyJSON',
   alternateClassName : 'LicenseKeyDB',
   id : 'LicenseKeyDB',
   config :
   {
      proxy :
      {
         type : 'browserdb',
         dbName : 'KickBakLicenseKey',
         pkType : 'INTEGER PRIMARY KEY ASC',
         objectStoreName : 'LicenseKey',
         //dbVersion : '1.0',
         writer :
         {
            type : 'json',
            writeAllFields : false
         }
      }
   }
});

Ext.define('Genesis.model.frontend.LicenseKey',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'LicenseKey',
   id : 'LicenseKey',
   config :
   {
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      fields : ['venue_id', 'venue_name', 'id'],
      idProperty : 'id'
   },
   inheritableStatics :
   {
      setGetLicenseKeyURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/devices/get_encryption_key');
      }
   }
});
Ext.define('Genesis.model.frontend.MainPage',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'MainPage',
   id : 'MainPage',
   config :
   {
      fields : ['name', 'photo_url', 'desc', 'pageCntlr', 'subFeature', 'route', 'hide'],
      proxy :
      {
         noCache : false,
         enablePagingParams : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         type : 'ajax',
         disableCaching : false
      }
   }
});
Ext.define('Genesis.model.UserProfile',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'UserProfile',
   id : 'UserProfile',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.User',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      fields : ['gender', 'birthday', 'zipcode', 'created_ts', 'update_ts', 'user_id']
   },
   getUser : function()
   {

   }
});
Ext.define('Genesis.model.User',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.UserProfile'],
   alternateClassName : 'User',
   id : 'User',
   config :
   {
      hasOne : [
      {
         model : 'Genesis.model.UserProfile',
         associationKey : 'profile'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'users.json',
         reader :
         {
            type : 'json'
         }
      },
      fields : ['user_id', 'name', 'email', 'facebook_id', 'photo_url', 'created_ts', 'update_ts', 'profile_id'],
      idProperty : 'user_id'
   }
});
Ext.define('Genesis.model.Merchant',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Merchant',
   id : 'Merchant',
   config :
   {
      fields : ['id', 'name', 'email', 'photo', 'alt_photo', 'features_config', 'account_first_name', 'account_last_name', //
      'phone', 'auth_code', 'qr_code', 'features_config', 'payment_account_id', 'created_ts', 'update_ts', 'type', 'reward_terms'],
      idProperty : 'id'
   }
});
Ext.define('Genesis.model.Challenge',
{
   extend : 'Ext.data.Model',
   id : 'Challenge',
   alternateClassName : 'Challenge',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      fields : ['id', 'type', 'name', 'description',
      // Image associated with the Challenge
      'require_verif', 'data', 'points', 'created_ts', 'update_ts', 'photo', 'merchant_id', 'venue_id'],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   getMerchant : function()
   {

   },
   inheritableStatics :
   {
      setGetChallengesURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges');
      },
      setCompleteChallengeURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/' + id + '/complete');
      },
      setCompleteMerchantChallengeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/merchant_complete');
      },
      setCompleteReferralChallengeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/complete_referral');
      },
      setSendReferralsUrl : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/' + id + '/start');
      }
   }
});
Ext.define('Genesis.model.Checkin',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Checkin',
   id : 'Checkin',
   config :
   {
      identifier : 'uuid',
      belongsTo : [
      {
         model : 'Genesis.model.User',
         getterName : 'getUser',
         setterName : 'setUser'
      },
      {
         model : 'Genesis.model.Venue',
         getterName : 'getVenue',
         setterName : 'setVenue'
      }],
      fields : ['id', 'time']
   }
});
Ext.define('Genesis.model.PurchaseReward',
{
   extend : 'Ext.data.Model',
   id : 'PurchaseReward',
   alternateClassName : 'PurchaseReward',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         listeners :
         {
            'metachange' : function(proxy, metaData, eOpts)
            {
               var controller = _application.getController(((!merchantMode) ? 'client' : 'server') + '.Rewards');
               controller.fireEvent('updatemetadata', metaData);
            }
         }
      },
      fields : ['id', 'title', 'points', 'type', 'photo', 'created_ts', 'update_ts']
   },
   getMerchant : function()
   {
   },
   inheritableStatics :
   {
      setGetRewardsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/purchase_rewards');
      },
      setEarnPointsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/purchase_rewards/earn');
      },
      setMerchantEarnPointsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/purchase_rewards/merchant_earn');
      }
   }
});
Ext.define('Genesis.model.CustomerReward',
{
   extend : 'Ext.data.Model',
   id : 'CustomerReward',
   alternateClassName : 'CustomerReward',
   config :
   {
      fields : ['id', 'title', 'points', 'type', 'photo', 'quantity_limited', 'quantity', 'time_limited',
      {
         name : 'expiry_date',
         type : 'date',
         convert : function(value, format)
         {
            value = Date.parse(value, "yyyy-MM-dd");
            return (value) ? Genesis.fn.convertDateNoTimeNoWeek(value) : null;
         }
      }],
      idProperty : 'id',
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   getMerchant : function()
   {
   },
   inheritableStatics :
   {
      //
      // Redeem Points
      //
      setGetRewardsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards?mode=reward');
      },
      setRedeemPointsURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards/' + id + '/redeem');
      },
      setMerchantRedeemPointsURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards/' + id + '/merchant_redeem');
      },
      //
      // Prize Points
      //
      setGetPrizesURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards?mode=prize');
      },
      setRedeemPrizePointsURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards/' + id + '/redeem');
      }
   }
});
Ext.define('Genesis.model.Venue',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Challenge', 'Genesis.model.PurchaseReward', 'Genesis.model.CustomerReward'],
   alternateClassName : 'Venue',
   id : 'Venue',
   config :
   {
      fields : ['id', 'name', 'address', 'description', 'distance', 'city', 'state', 'country', 'zipcode', 'phone', 'website', 'latitude', 'longitude', 'created_ts', 'update_ts', 'type', 'merchant_id',
      // Winners Count for front end purposes
      'prize_jackpots'],
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      hasMany : [
      {
         model : 'Genesis.model.Challenge',
         name : 'challenges'
      },
      {
         model : 'Genesis.model.PurchaseReward',
         name : 'purchaseReward'
      },
      {
         model : 'Genesis.model.CustomerReward',
         name : 'customerReward'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      idProperty : 'id'
   },
   inheritableStatics :
   {
      setGetMerchantVenueExploreURL : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/' + venueId + '/merchant_explore');
      },
      setFindNearestURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/find_nearest');
      },
      setGetClosestVenueURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/find_closest');
      },
      setSharePhotoURL : function()
      {
         //
         // Not used because we need to use Multipart/form upload
         //
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/share_photo');
      },
      setGetLicenseKeyURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/updateLicenseKey');
      },
      setMerchantReceiptUploadURL : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost +'/api/v1/venues/' + venueId + '/merchant_add_sku_data');
      }
   }

});
Ext.define('Genesis.model.CustomerJSON',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'CustomerJSON',
   id : 'CustomerJSON',
   config :
   {
      proxy :
      {
         type : 'localstorage',
         id : 'CustomerJSON',
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json'
         }
      },
      identifier : 'uuid',
      fields : [
      {
         name : 'json',
         type : 'string'
      },
      {
         name : 'id',
         type : 'int'
      }],
      idProperty : 'id'
   }
});

Ext.define('Genesis.model.CustomerDB',
{
   extend : 'Genesis.model.CustomerJSON',
   alternateClassName : 'CustomerDB',
   id : 'CustomerDB',
   config :
   {
      proxy :
      {
         type : 'browserdb',
         dbName : 'KickBakCustomer',
         pkType : 'INTEGER PRIMARY KEY ASC',
         objectStoreName : 'Customer',
         //dbVersion : '1.0',
         writer :
         {
            type : 'json',
            writeAllFields : false
         }
      }
   }
});

Ext.define('Genesis.model.Customer',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Checkin', 'Genesis.model.Merchant'],
   alternateClassName : 'Customer',
   id : 'Customer',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         name : 'merchant',
         setterName : 'setMerchant',
         getterName : 'getMerchant'
      },
      {
         model : 'Genesis.model.User',
         associationKey : 'user',
         name : 'user',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      hasOne : [
      {
         model : 'Genesis.model.Checkin',
         associationKey : 'last_check_in',
         name : 'last_check_in',
         // User to make sure no underscore
         getterName : 'getLastCheckin',
         setterName : 'setLastCheckin'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         listeners :
         {
            'metachange' : function(proxy, metaData, eOpts)
            {
               var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
               // Let Other event handlers udpate the metaData first ...
               viewport.fireEvent('updatemetadata', metaData);
            }
         }
      },
      fields : ['id', 'points', 'prize_points', 'visits', 'next_badge_visits', 'eligible_for_reward', 'eligible_for_prize', 'badge_id', 'next_badge_id'],
      idProperty : 'id'
   },
   getUser : function()
   {

   },
   inheritableStatics :
   {
      isValid : function(customerId)
      {
         return customerId != 0;
      },
      updateCustomer : function(cOld, cNew)
      {
         var attrib, sync = false;
         cOld.beginEdit();
         for (var i = 0; i < cOld.fields.length; i++)
         {
            attrib = cOld.fields.items[i].getName();
            if (cOld.get(attrib) != cNew.get(attrib))
            {
               cOld.set(attrib, cNew.get(attrib));
               sync = true;
            }
         }
         try
         {
            if (cOld.getLastCheckin() != cNew.getLastCheckin())
            {
               cOld.setLastCheckin(cNew.getLastCheckin());
               sync = true;
            }
         }
         catch (e)
         {
            cOld.setLastCheckin(Ext.create('Genesis.model.Checkin'));
            sync = true;
         }
         var oMerchant = cOld.getMerchant() || '';
         var nMerchant = cNew.getMerchant() || '';
         var oString = oMerchant.toString();
         var nString = nMerchant.toString();
         if ((oString != nString) && (nString != ''))
         {
            cOld.handleInlineAssociationData(
            {
               'merchant' : nMerchant.raw
            });
            sync = true;
         }

         cOld.endEdit();

         return sync;
      },
      setFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/tokens/create_from_facebook');
      },
      setLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/tokens');
      },
      setLogoutUrl : function(auth_code)
      {
         this.getProxy().setActionMethods(
         {
            read : 'DELETE'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/tokens/' + auth_code);
      },
      setCreateAccountUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/sign_up');
      },
      setGetCustomerUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customers/show_account');
      },
      setGetCustomersUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customers');
      },
      setVenueScanCheckinUrl : function()
      {
         this.setVenueCheckinUrl();
      },
      setVenueCheckinUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/check_ins');
      },
      setVenueExploreUrl : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/' + venueId + '/explore');
      },
      setSendPtsXferUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customers/transfer_points');
      },
      setRecvPtsXferUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customers/receive_points');
      }
   }
});
Ext.define('Genesis.model.frontend.Account',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Account',
   id : 'Account',
   config :
   {
      fields : ['name', 'email', 'gender',
      {
         type : 'date',
         name : 'birthday',
         dateFormat : 'time'
      }, 'phone', 'password', 'username'],
      validations : [
      /*
       {
       type : 'format',
       field : 'name',
       matcher : /^([a-zA-Z'-]+\s+){1,4}[a-zA-z'-]+$/
       //matcher : /[\w]+([\s]+[\w]+){1}+/
       },
       {
       type : 'email',
       field : 'email'
       },
       */
      {
         type : 'format',
         field : 'phone',
         matcher : /^(\d{3})\D*(\d{3})\D*(\d{4})\D*(\d*)$/
      },
      {
         type : 'length',
         field : 'password',
         min : 6
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'user'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         listeners :
         {
            'metachange' : function(proxy, metaData, eOpts)
            {
               var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
               // Let Other event handlers udpate the metaData first ...
               viewport.fireEvent('updatemetadata', metaData);
            }
         }
      }
   },
   inheritableStatics :
   {
   	phoneRegex : /^(\d{3})\D*(\d{3})\D*(\d{4})\D*(\d*)$/,
      setUpdateFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/update_facebook_info');
      },
      setPasswdResetUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/reset_password');
      },
      setPasswdChangeUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/change_password');
      },
      setRefreshCsrfTokenUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/tokens/get_csrf_token');
      },
      setUpdateRegUserDeviceUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/register_user_device');
      },
      setUpdateAccountUrl : function()

      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/update');
      }
   }
});
Ext.define('Genesis.model.frontend.Signin',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Signin',
   id : 'Sigin',
   config :
   {
      fields : ['username', 'password'],
      validations : [
      {
         type : 'email',
         field : 'username'
      },
      {
         type : 'length',
         field : 'password',
         min : 6
      }]
   }
});
Ext.define('Genesis.model.frontend.ReceiptItem',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'ReceiptItem',
   id : 'ReceiptItem',
   config :
   {
      fields : ['qty', 'price', 'name']
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.model.frontend.Receipt',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Receipt',
   id : 'Receipt',
   config :
   {
      fields : ['id', 'tnxId',
      {
         name : 'subtotal',
         type : 'float'
      }, 'itemsPurchased',
      {
         name : 'price',
         type : 'float'
      }, 'title', 'tableName', 'receipt'],
      idProperty : 'id',
      hasMany : [
      {
         model : 'Genesis.model.frontend.ReceiptItem',
         name : 'items'
      }],
      proxy :
      {
         type : 'browserdb',
         dbName : 'KickBakReceipt',
         objectStoreName : 'Receipt',
         //dbVersion : '1.0',
         writer :
         {
            type : 'json',
            writeAllFields : false
         }
      }
   },
   inheritableStatics :
   {
   }
});
Ext.define('Genesis.model.frontend.Table',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Table',
   id : 'Table',
   config :
   {
      fields : ['id'],
      idProperty : 'id'
   },
   inheritableStatics :
   {
   }
});
Ext.define('Genesis.view.Document',
{
   extend : 'Genesis.view.ViewBase',
   xtype : 'documentview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'container',
         tag : 'content',
         scrollable : 'vertical',
         padding : '0.7 0.8',
         defaultUnit : 'em',
         html : ' '
      }]
   },
   disableAnimation : true,
   setHtml : function(html)
   {
      var page = this.query('container[tag=content]')[0];
      var scroll = page.getScrollable();

      page.setHtml(html);
      if (scroll)
      {
         scroll.getScroller().scrollTo(0, 0);
      }
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
   }
});

Ext.define('Genesis.view.MultipartDocument',
{
   requires : ['Ext.tab.Panel'],
   extend : 'Genesis.view.ViewBase',
   xtype : 'multipartdocumentview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'tabpanel',
         defaults :
         {
            xtype : 'container',
            scrollable : 'vertical',
            padding : '0.7 0.8',
            defaultUnit : 'em',
            html : ' '
         },
         layout : 'card',
         tabBarPosition : 'top',
         tabBar :
         {
            layout :
            {
               pack : 'justify'
            }
         }
      }]
   },
   disableAnimation : true,
   setHtml : function(index, tabConfig)
   {
      var tabPanel = this.query('tabpanel')[0];
      var page = tabPanel.getInnerItems()[index];
      if (!page)
      {
         page = tabPanel.insert(index, Ext.apply(
         {
            xtype : 'container'
         }, tabConfig));
      }
      else
      {
         var scroll = page.getScrollable();
         scroll.getScroller().scrollTo(0, 0);
         page.setHtml(html);
      }
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
   }
});
Ext.define('Genesis.view.Viewport',
{
   extend : 'Ext.Container',
   requires : ['Ext.fx.layout.Card', 'Genesis.view.ViewBase', 'Ext.plugin.ListPaging', 'Ext.plugin.PullRefresh'],
   xtype : 'viewportview',
   config :
   {
      autoDestroy : false,
      cls : 'viewport',
      layout :
      {
         type : 'card',
         animation :
         {
            type : 'cover',
            reverse : false,
            direction : 'left'
         }
      },
      fullscreen : true
   },
   // @private
   initialize : function()
   {
      this.callParent(arguments);

      //
      // Initialize NFC after DeviceReady
      //
      if (Ext.os.is('Android') && merchantMode)
      {
         handleNfcFromIntentFilter();
         nfc.isEnabled(function()
         {
            Genesis.constants.isNfcEnabled = true;
            console.debug('NFC is enabled on this device');
         });
      }
      /*
       this.on(
       {
       delegate : 'button',
       scope : this,
       tap : function(b, e, eOpts)
       {
       //
       // While Animating, disable ALL button responds in the NavigatorView
       //
       if(Ext.Animator.hasRunningAnimations(this.getNavigationBar().renderElement) ||
       Ext.Animator.hasRunningAnimations(this.getActiveItem().renderElement))
       {
       return false;
       }
       return true;
       }
       });
       */
   },
   /**
    * Animates to the supplied activeItem with a specified animation. Currently this only works
    * with a Card layout.  This passed animation will override any default animations on the
    * container, for a single card switch. The animation will be destroyed when complete.
    * @param {Object/Number} activeItem The item or item index to make active
    * @param {Object/Ext.fx.layout.Card} animation Card animation configuration or instance
    */
   animateActiveItem : function(activeItem, animation)
   {
      var oldActiveItem = this.getActiveItem();
      var layout = this.getLayout(), defaultAnimation = (layout.getAnimation) ? layout.getAnimation() : null;
      var disableAnimation = (activeItem.disableAnimation || ((oldActiveItem) ? oldActiveItem.disableAnimation : false));
      var titlebar, viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');

      if (this.activeItemAnimation)
      {
         this.activeItemAnimation.destroy();
         //console.debug("Destroying AnimateActiveItem ...");
      }
      this.activeItemAnimation = animation = new Ext.fx.layout.Card(animation);

      if (animation && layout.isCard && !disableAnimation)
      {
         animation.setLayout(layout);
         if (defaultAnimation)
         {
            var controller = viewport.getEventDispatcher().controller;

            defaultAnimation.disable();
            controller.pause();
            activeItem.createView();
            animation.on('animationend', function()
            {
               console.debug("Animation Complete");

               defaultAnimation.enable();
               animation.destroy();
               delete this.activeItemAnimation;

               if (oldActiveItem)
               {
                  if (oldActiveItem != activeItem)
                  {
                     oldActiveItem.cleanView(activeItem);
                  }

                  titlebar = oldActiveItem.query('titlebar')[0];
                  if (titlebar)
                  {
                     titlebar.setMasked(Genesis.view.ViewBase.invisibleMask);
                  }
               }
               activeItem.showView();

               titlebar = activeItem.query('titlebar')[0];
               if (titlebar)
               {
                  titlebar.setMasked(null);
               }

               //
               // Delete oldActiveItem to save DOM memory
               //
               //if (oldActiveItem)
               {
                  controller.resume();
                  //console.debug('Destroyed View [' + oldActiveItem._itemId + ']');
               }
               viewport.popViewInProgress = false;
            }, this);
         }
         else
         {
            //Ext.Viewport.setMasked(null);
         }
      }

      if (defaultAnimation && disableAnimation)
      {
         defaultAnimation.disable();
      }

      var rc = this.setActiveItem(activeItem);
      if (!layout.isCard || disableAnimation)
      {
         //
         // Defer timeout is required to ensure that
         // if createView called is delayed, we will be scheduled behind it
         //
         if (defaultAnimation)
         {
            defaultAnimation.enable();
         }
         animation.destroy();
         if (oldActiveItem)
         {
            oldActiveItem.cleanView(activeItem);
            var titlebar = oldActiveItem.query('titlebar')[0];
            if (titlebar)
            {
               titlebar.setMasked(Genesis.view.ViewBase.invisibleMask);
            }
         }
         activeItem.createView();
         Ext.defer(function()
         {
            activeItem.showView();
            titlebar = activeItem.query('titlebar')[0];
            if (titlebar)
            {
               titlebar.setMasked(null);
            }
            viewport.popViewInProgress = false;
         }, 0.1 * 1000, this);
      }
      return rc;
   }
});
Ext.define('Genesis.view.MainPageBase',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.data.Store', 'Ext.Carousel', 'Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.mainpagebaseview',
   config :
   {
      models : ['frontend.MainPage'],
      itemPerPage : 6,
      layout : 'fit',
      cls : 'viewport',
      listeners : [
      {
         element : 'element',
         delegate : 'div.itemWrapper',
         event : 'tap',
         fn : "onItemTap"
      }],
      scrollable : undefined
   },
   //disableAnimation : null,
   isEligible : Ext.emptyFn,
   initialize : function()
   {
      this.setPreRender([]);
      this.callParent(arguments);
   },
   onItemTap : function(e, target, delegate, eOpts)
   {
      var data = Ext.create('Genesis.model.frontend.MainPage', Ext.decode(decodeURIComponent(e.delegatedTarget.getAttribute('data'))));
      _application.getController(((merchantMode) ? 'server' : 'client') + '.MainPage').fireEvent('itemTap', data);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   removeAll : function(destroy, everything)
   {
      var carousel = this.query('carousel')[0];
      return carousel.removeAll(true);
   },
   createView : function()
   {
      var me = this, carousel = me.query('carousel')[0], app = _application;
      var viewport = app.getController(((merchantMode) ? 'server' : 'client') + '.Viewport'), vport = viewport.getViewport();
      var show = (!merchantMode) ? viewport.getCheckinInfo().venue != null : false;
      var items = Ext.StoreMgr.get('MainPageStore').getRange(), list = Ext.Array.clone(items);

      if (!carousel._listitems)
      {
         carousel._listitems = [];
      }

      if (!show)
      {
         Ext.Array.forEach(list, function(item, index, all)
         {
            switch (item.get('hide'))
            {
               case 'true' :
               {
                  Ext.Array.remove(items, item);
                  break;
               }
            }
         });
      }
      //
      // Only update if changes were made
      //
      if ((Ext.Array.difference(items, carousel._listitems).length > 0) || //
      (items.length != carousel._listitems.length))
      {
         carousel._listitems = items;
         carousel.removeAll(true);
         for (var i = 0; i < Math.ceil(items.length / me.getItemPerPage()); i++)
         {
            carousel.add(
            {
               xtype : 'component',
               cls : 'mainMenuSelections',
               tag : 'mainMenuSelections',
               scrollable : undefined,
               data : Ext.Array.pluck(items.slice(i * me.getItemPerPage(), ((i + 1) * me.getItemPerPage())), 'data'),
               tpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<tpl for=".">',
                  '<div class="itemWrapper x-hasbadge" data="{[this.encodeData(values)]}">',
                     '{[this.isEligible(values)]}',
                     '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>',
                     '<div class="photoName">{name}</div>',
                  '</div>',
               '</tpl>',
               // @formatter:on
               {
                  encodeData : function(values)
                  {
                     return encodeURIComponent(Ext.encode(values));
                  },
                  getType : function()
                  {
                     return values['pageCntlr'];
                  },
                  isEligible : me.isEligible,
                  getPhoto : function(photoURL)
                  {
                     return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
                  }
               })
            });
         }
         console.debug("MainPage Icons Refreshed.");
      }
      else
      {
         console.debug("MainPage Icons Not changed.");
      }
      delete carousel._listitems;

      this.callParent(arguments);
   },
   showView : function()
   {
      var carousel = this.query('carousel')[0];
      this.callParent(arguments);
      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
   }
});
Ext.define('Genesis.view.RedeemBase',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedeemPtsItemBase'],
   alias : 'widget.redeeembaseview',
   config :
   {
   },
   disableAnimation : true,
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   showView : function()
   {
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
      this.callParent(arguments);
      console.debug("RedeemBase : showView");
   },
   _createView : function(store, renderStore, activeItemIndex)
   {
      var me = this, itemHeight = 1 + Genesis.constants.defaultIconSize() + (2 * Genesis.fn.calcPx(0.65, 1));

      //console.debug("itemHeight=" + itemHeight);
      me.setPreRender([
      // ------------------------------------------------------------------------
      // Redemptions
      // ------------------------------------------------------------------------
      {
         xtype : 'list',
         flex : 1,
         refreshHeightOnUpdate : false,
         variableHeights : false,
         //deferEmptyText : false,
         itemHeight : itemHeight,
         ui : 'bottom-round',
         store : store,
         cls : me.getListCls() + ' separator_pad',
         tag : me.getListCls(),
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate',
         '<div class="photo x-hasbadge">'+
            '<span class="x-badge round">{[this.getPoints(values)]}</span>',
            '<img src="{[this.getPhoto(values)]}"/>'+
         '</div>',
         '<div class="listItemDetailsWrapper">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
            //'<div class="itemDesc">{[this.getDesc(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               if (!values.photo || !values.photo.url)
               {
                  return me.self.getPhoto(values['type']);
               }
               return values.photo.url;
            },
            getTitle : function(values)
            {
               return values['title'];
            },
            getDesc : function(values)
            {
               return 'This will cost you ' + values['points'] + ' Pts';
            },
            getPoints : function(values)
            {
               return values['points'];
            }
         }),
         onItemDisclosure : Ext.emptyFn,
         // ------------------------------------------------------------------------
         // Redeem Available Panel
         // ------------------------------------------------------------------------
         items : [
         {
            docked : 'top',
            xtype : 'toolbar',
            cls : 'ptsEarnPanelHdr',
            ui : 'light',
            centered : false,
            items : [
            {
               xtype : 'title',
               title : me.getRedeemTitleText()
            },
            {
               xtype : 'spacer'
            }]
         }]
      }]);
   },
   inheritableStatics :
   {
   }
});
Ext.define('Genesis.view.server.MainPage',
{
   extend : 'Genesis.view.MainPageBase',
   alias : 'widget.servermainpageview',
   config :
   {
      items : ( function()
         {
            var items = [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
            {
               xtype : 'titlebar',
               cls : 'navigationBarTop kbTitle'
            }),
            {
               xtype : 'carousel',
               direction : 'horizontal'
            }];
            return items;
         }())
   },
   disableAnimation : true,
   isEligible : function(values, xindex)
   {
      return '';
   }
});
Ext.define('Genesis.view.server.MerchantAccount',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.tab.Bar', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   alias : 'widget.servermerchantaccountview',
   config :
   {
      tag : 'merchantMain',
      cls : 'merchantMain viewport',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   disableAnimation : true,
   loadingText : 'Loading ...',
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function(activeItem)
   {
      if (activeItem.isXType('mainpageview', true))
      {
         this.removeAll(true);
      }
      this.callParent(arguments);
   },
   showView : function()
   {
      this.callParent(arguments);
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      me.setPreRender(me.getPreRender().concat([
      // -----------------------------------------------------------------------
      // Merchant Photos and Customer Points
      // -----------------------------------------------------------------------
      Ext.create('Ext.dataview.DataView',
      {
         tag : 'tbPanel',
         xtype : 'dataview',
         store : 'MerchantRenderStore',
         useComponents : true,
         scrollable : undefined,
         minHeight : window.innerWidth,
         defaultType : 'merchantaccountptsitem',
         defaultUnit : 'em',
         margin : '0 0 0.7 0'
      }), Ext.create('Ext.form.Panel',
      {
         xtype : 'formpanel',
         margin : '0 0.8 0.7 0.8',
         defaultUnit : 'em',
         scrollable : null,
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'fieldset',
            title : 'Account Profile',
            //instructions : 'Tell us all about yourself',
            defaults :
            {
               labelWidth : '50%',
               readOnly : true,
               required : false
            },
            items : [
            {
               xtype : 'textfield',
               name : 'tagid',
               clearIcon : false,
               label : "Tag ID",
               value : ' '
            },
            {
               xtype : 'textfield',
               cls : 'halfHeight',
               labelWidth : '100%',
               name : 'user',
               label : "John Smith" + "<br/>" + "<label>johnsmith@example.com</label>",
               value : ' '
            },
            {
               xtype : 'datepickerfield',
               labelWidth : '30%',
               label : 'Birthday',
               name : 'birthday',
               dateFormat : 'M j',
               picker :
               {
                  yearFrom : 1913,
                  doneButton :
                  {
                     ui : 'normal'
                  }
               },
               value : 0
            }, Ext.applyIf(
            {
               labelWidth : '30%',
               placeHolder : '',
               label : 'Phone #',
               name : 'phone',
               required : false
            }, Genesis.view.ViewBase.phoneField())]
         }]
      })]));
      //console.debug("minWidth[" + window.innerWidth + "], minHeight[" + window.innerHeight + "]");
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         if (!type.value)
         {
            return Genesis.constants.getIconPath('miscicons', 'pushnotification');
         }
         else
         {
         }
      }
   }
});
Ext.define('Genesis.view.server.SettingsPage',
{
   extend : 'Ext.form.Panel',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Genesis.view.widgets.ListField', 'Ext.field.Select', 'Ext.field.Text', 'Ext.field.Toggle', 'Ext.form.FieldSet'],
   alias : 'widget.serversettingspageview',
   config :
   {
      preRender : null,
      cls : 'viewport',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Settings',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Settings',
         defaults :
         {
            labelWidth : '50%'
         },
         //instructions : 'Tell us all about yourself',
         items : [
         {
            xtype : 'textfield',
            label : 'Version ' + Genesis.constants.serverVersion,
            value : ' ',
            clearIcon : false,
            readOnly : true
         },
         {
            xtype : 'textfield',
            labelWidth : '90%',
            tag : 'uuid',
            clearIcon : false,
            readOnly : true
         },
         {
            xtype : 'togglefield',
            name : 'posMode',
            tag : 'posMode',
            label : 'POS Integration',
            value : (Genesis.db.getLocalDB()['isPosEnabled'] || (Genesis.db.getLocalDB()['isPosEnabled'] == undefined)) ? 1 : 0
         },
         {
            xtype : 'selectfield',
            label : 'Display Mode',
            tag : 'displayMode',
            name : 'displayMode',
            usePicker : true,
            options : [
            {
               text : 'Mobile',
               value : 'Mobile'
            },
            {
               text : 'Fixed',
               value : 'Fixed'
            }],
            defaultPhonePickerConfig :
            {
               height : '12.5em',
               doneButton :
               {
                  ui : 'normal'
               }
            }
         },
         {
            xtype : 'spinnerfield',
            label : 'Sensitivity Level',
            tag : 'sensitivity',
            name : 'sensitivity',
            minValue : 0,
            maxValue : 120,
            stepValue : 5.0,
            cycle : false
         }
         /*,
          {
          xtype : 'listfield',
          name : 'terms',
          label : 'Terms & Conditions',
          value : ' '
          },
          {
          xtype : 'listfield',
          name : 'privacy',
          label : 'Privacy'
          value : ' '
          },
          {
          xtype : 'listfield',
          name : 'aboutus',
          label : 'About Us',
          value : ' '
          }
          */]
      },
      {
         xtype : 'fieldset',
         title : 'KICKBAK Venue',
         defaults :
         {
            labelWidth : '50%'
         },
         items : [
         {
            xtype : 'textfield',
            labelWidth : '90%',
            tag : 'merchantDevice',
            clearIcon : false,
            readOnly : true
         },
         {
            xtype : 'listfield',
            name : 'license',
            label : 'Refresh License',
            value : ' '
         },
         {
            xtype : 'listfield',
            name : 'resetdevice',
            label : 'Reset Device',
            value : ' '
         }]
      },
      {
         xtype : 'fieldset',
         hidden : true,
         tag : 'utilities',
         title : 'Utilities',
         defaults :
         {
            labelWidth : '50%'
         },
         items : [
         {
            xtype : 'listfield',
            tag : 'createTag',
            label : 'Create TAG',
            value : ' '
         }]
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});
Ext.define('Genesis.view.server.TagCreatePage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.servertagcreatepageview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         tag : 'navigationBarTop',
         cls : 'navigationBarTop kbTitle',
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      }),
      // -------------------------------------------------------------------
      // Reward TAG ID Entry
      // -------------------------------------------------------------------
      {
         xtype : 'calculator',
         tag : 'createTagId',
         title : 'Enter TAG ID',
         placeHolder : '12345678',
         bottomButtons : [
         {
            tag : 'createTagId',
            text : 'Create!',
            ui : 'orange-large'
         }]
      }]
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      //me.getPreRender().push();
   },
   inheritableStatics :
   {
   }
});
Ext.define('Genesis.view.server.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Select', 'Ext.field.Text', 'Genesis.view.widgets.Calculator', 'Ext.dataview.List', 'Ext.XTemplate', 'Ext.plugin.ListPaging', 'Ext.plugin.PullRefresh'],
   alias : 'widget.serverrewardsview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         tag : 'navigationBarTop',
         cls : 'navigationBarTop kbTitle',
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'left',
            tag : 'rptClose',
            hidden : true,
            ui : 'normal',
            text : 'Close'
         },
         {
            hidden : true,
            align : 'right',
            ui : 'normal',
            iconCls : 'order',
            tag : 'calculator'
         },
         {
            hidden : true,
            align : 'right',
            ui : 'normal',
            iconCls : 'refresh',
            tag : 'refresh',
            handler : function()
            {
               _application.getController('server' + '.Receipts').fireEvent('retrieveReceipts');
            }
         }]
      })]
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      var itemHeight = 1 + Genesis.constants.defaultIconSize() + 2 * Genesis.fn.calcPx(0.65, 1);
      var store = Ext.StoreMgr.get('ReceiptStore'), db = Genesis.db.getLocalDB(), posEnabled = pos.isEnabled(), manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0);
      console.debug("createView - rewardModel[" + db['rewardModel'] + "]")
      var toolbarBottom = function(tag, hideTb)
      {
         return (
            {
               docked : 'bottom',
               cls : 'toolbarBottom',
               tag : tag,
               hidden : hideTb,
               xtype : 'container',
               layout :
               {
                  type : 'vbox',
                  pack : 'center'
               },
               showAnimation :
               {
                  type : 'slideIn',
                  duration : 500,
                  direction : 'up'
               },
               hideAnimation :
               {
                  type : 'slideOut',
                  duration : 500,
                  direction : 'down'
               },
               items : [
               {
                  xtype : 'segmentedbutton',
                  allowMultiple : false,
                  defaults :
                  {
                     iconMask : true,
                     ui : 'blue',
                     flex : 1
                  },
                  items : [
                  {
                     iconCls : 'rewards',
                     tag : 'rewardsSC',
                     text : 'Earn Points'
                  }],
                  listeners :
                  {
                     toggle : function(container, button, pressed)
                     {
                        container.setPressedButtons([]);
                     }
                  }
               }]
            });
      };

      me.getPreRender().push(Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'rewards',
         layout :
         {
            type : 'card',
            animation :
            {
               duration : 600,
               easing : 'ease-in-out',
               type : 'slide',
               direction : 'down'
            }
         },
         defaults :
         {
            hidden : true
         },
         activeItem : (posEnabled) ? 2 : manualMode,
         items : [
         // -------------------------------------------------------------------
         // Reward Calculator
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'amount',
            title : 'Amount Spent',
            placeHolder : '0.00',
            bottomButtons : [
            {
               tag : 'earnPts',
               text : 'GO!',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // Reward TAG ID Entry
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'phoneId',
            title : 'Enter Mobile Number',
            placeHolder : '8005551234',
            bottomButtons : [
            {
               tag : 'earnTagId',
               text : 'Submit',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // POS Receipts
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'posSelect',
            layout : 'hbox',
            items : [
            {
               docked : 'top',
               hidden : (store.getCount() <= 0),
               xtype : 'selectfield',
               labelWidth : '50%',
               label : 'Sort Receipts By :',
               tag : 'tableFilter',
               name : 'tableFilter',
               margin : '0 0 0.8em 0',
               usePicker : true,
               store : 'TableStore',
               displayField : 'id',
               valueField : 'id',
               showAnimation :
               {
                  type : 'slideIn',
                  duration : 500,
                  direction : 'down'

               },
               hideAnimation :
               {
                  type : 'slideOut',
                  duration : 500,
                  direction : 'up'
               },
               defaultPhonePickerConfig :
               {
                  height : (12.5 * 1.5) + 'em',
                  doneButton :
                  {
                     ui : 'normal'
                  }
               }
            },
            {
               xtype : 'list',
               flex : 1,
               store : 'ReceiptStore',
               loadingText : null,
               //scrollable : 'vertical',
               plugins : [
               {
                  type : 'pullrefresh',
                  //pullRefreshText: 'Pull down for more new Tweets!',
                  refreshFn : function(plugin)
                  {
                     _application.getController('server' + '.Receipts').fireEvent('retrieveReceipts');
                  }
               },
               {
                  type : 'listpaging',
                  autoPaging : true,
                  loadMoreText : '',
                  noMoreRecordsText : ''
               }],
               mode : 'MULTI',
               preventSelectionOnDisclose : true,
               scrollToTopOnRefresh : true,
               refreshHeightOnUpdate : false,
               variableHeights : false,
               itemHeight : itemHeight,
               deferEmptyText : false,
               emptyText : ' ',
               tag : 'receiptList',
               cls : 'receiptList',
               // @formatter:off
               itemTpl : Ext.create('Ext.XTemplate',
               '<div class="photo">{[this.getPrice(values)]}</div>' +
               '<div class="listItemDetailsWrapper">' +
                  '<div class="itemDistance">{[this.getDate(values)]}</div>' +
                  '<div class="itemTitle">{title}</div>' +
                  //'<div class="itemDesc">{[this.getDesc(values)]}</div>',
               '</div>',
               // @formatter:on
               {
                  getPrice : function(values)
                  {
                     return '$' + Number(values['price']).toFixed(2);
                  },
                  getDate : function(values)
                  {
                     return Genesis.fn.convertDate(new Date(values['id'] * 1000));
                  }
               }),
               onItemDisclosure : Ext.emptyFn
            }, toolbarBottom('tbBottomSelection', (store.getCount() <= 0))]
         },
         // -------------------------------------------------------------------
         // POS Receipt Detail
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'posDetail',
            layout : 'hbox',
            items : [
            {
               flex : 1,
               xtype : 'dataview',
               tag : 'receiptDetail',
               cls : 'receiptDetail',
               store :
               {
                  fields : ['receipt']
               },
               // @formatter:off
               itemTpl : Ext.create('Ext.XTemplate',
               '<div class="listItemDetailsWrapper">' +
                  '<div class="itemReceipt">{[this.getReceipt(values)]}</div>' +
               '</div>',
               // @formatter:on
               {
                  getReceipt : function(values)
                  {
                     var receipt = '';
                     for (var i = 0; i < values['receipt'].length; i++)
                     {
                        receipt += '<pre>' + values['receipt'][i].replace('\n', '').replace('/r', '') + '</pre>';
                     }

                     return receipt;
                  }
               })
            }, toolbarBottom('tbBottomDetail', false)]
         },
         // -------------------------------------------------------------------
         // ItemsPurchased
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'itemsPurchased',
            title : 'Stamp Points',
            placeHolder : '0',
            hideZero : true,
            bottomButtons : [
            {
               tag : 'earnPts',
               text : 'Stamp Me!',
               ui : 'orange-large'
            }]
         }]
      }));
   },
   inheritableStatics :
   {
   }
});
Ext.define('Genesis.view.server.Redemptions',
{
   extend : 'Genesis.view.RedeemBase',
   requires : ['Genesis.view.widgets.RewardPtsItem'],
   alias : 'widget.serverredemptionsview',
   config :
   {
      defaultItemType : 'rewardptsitem',
      redeemTitleText : 'Choose a Reward to redeem',
      listCls : 'redemptionsList',
      //scrollable : 'vertical',
      scrollable : undefined,
      cls : 'redemptionsMain viewport',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Rewards',
         items : [
         {
            align : 'left',
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   createView : function(activeItemIndex)
   {
      if (!this.callParent(arguments))
      {
         return;
      }
      this._createView('RedeemStore', 'RedemptionRenderCStore', activeItemIndex);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            default :
               //photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
Ext.define('Genesis.view.server.Prizes',
{
   extend : 'Genesis.view.RedeemBase',
   requires : ['Genesis.view.widgets.PrizePtsItem'],
   alias : 'widget.serverprizesview',
   config :
   {
      defaultItemType : 'prizeptsitem',
      redeemTitleText : 'Choose a Prize to redeem',
      listCls : 'prizesList',
      //scrollable : 'vertical',
      scrollable : undefined,
      cls : 'prizesMain viewport',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Prizes',
         items : [
         {
            align : 'left',
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   createView : function(activeItemIndex)
   {
      if (!this.callParent(arguments))
      {
         return;
      }
      this._createView('PrizeStore', 'PrizeRenderCStore', activeItemIndex);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            default :
               //photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
Ext.define('Genesis.view.widgets.server.RedeemItemDetail',
{
   extend : 'Genesis.view.widgets.ItemDetail',
   requires : ['Ext.XTemplate', 'Genesis.view.widgets.RedeemItem'],
   alias : 'widget.serverredeemitemdetailview',
   config :
   {
      itemXType : 'redeemitem',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Prizes',
         items : [
         {
            hidden : true,
            align : 'left',
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            hidden : true,
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         }]
      }),
      {
         xtype : 'container',
         flex : 1,
         tag : 'redeemItemCardContainer',
         layout :
         {
            type : 'card',
            animation :
            {
               duration : 600,
               easing : 'ease-in-out',
               type : 'slide',
               direction : 'down'
            }
         },
         activeItem : 0,
         items : [
         {
            xtype : 'container',
            layout :
            {
               type : 'vbox',
               pack : 'center',
               align : 'stretch'
            },
            tag : 'redeemItemContainer',
            items : [
            {
               hidden : true,
               docked : 'bottom',
               xtype : 'component',
               tag : 'authText',
               margin : '0 0.7 0.8 0.7',
               style : 'text-align:center;',
               defaultUnit : 'em',
               html :  'Tap your Mobile Device onto the Terminal'
               //,ui : 'orange-large'
            },
            {
               hidden : true,
               docked : 'bottom',
               cls : 'bottomButtons',
               xtype : 'container',
               tag : 'bottomButtons',
               layout : 'hbox',
               marginTop : 0,
               defaults :
               {
                  xtype : 'button',
                  flex : 1
               },
               items : [
               {
                  tag : 'merchantRedeem',
                  text : 'GO!',
                  ui : 'orange-large'
               }]
            }]
         },
         // -------------------------------------------------------------------
         // Reward Calculator
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'phoneId',
            title : 'Enter Mobile Number',
            placeHolder : '8005551234',
            bottomButtons : [
            {
               tag : 'redeemTagId',
               text : 'Submit',
               ui : 'orange-large'

            }]
         }]
      }],
      listeners : [
      {
         element : 'element',
         delegate : "div.itemPhoto",
         event : "tap",
         fn : "onRedeemItemTap"
      }]
   },
   onRedeemItemTap : function(b, e, eOpts)
   {
      var me = this, viewport = _application.getController('server' + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      me.fireEvent('redeemItemTap', b);
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      var me = this, redeemItemContainer = me.query("container[tag=redeemItemContainer]")[0];
      if (redeemItemContainer)
      {
         if (redeemItemContainer.getInnerItems().length == 0)
         {
            redeemItemContainer.add(me.getPreRender());
         }
      }
      Ext.defer(me.fireEvent, 0.01 * 1000, me, ['showView', me]);
   },
   createView : function()
   {
      var me = this, redeemItemContainer = me.query("container[tag=redeemItemContainer]")[0];
      if (!Genesis.view.ViewBase.prototype.createView.call(me, arguments) && redeemItemContainer && (redeemItemContainer.getInnerItems().length > 0))
      {
         var item = redeemItemContainer.getInnerItems()[0];
         //
         // Refresh RedeemItem
         //
         item.setData(me.item)
         item.updateItem(me.item);
      }
      else
      {

         me.setPreRender([
         {
            flex : 1,
            xtype : me.getItemXType(),
            hideMerchant : true,
            data : me.item
         }]);
      }
      delete me.item;
   }
});
Ext.define('Genesis.controller.ControllerBase',
{
   extend : 'Ext.app.Controller',
   requires : ['Ext.data.Store', 'Ext.util.Geolocation'],
   config :
   {
      animationMode : null,
      models : ['Customer']
   },
   scanTaskWait : false,
   scanTask : null,
   establishConnectionMsg : 'Connecting to Server ...',
   loginMsg : 'Logging in ...',
   checkinMsg : 'Checking in ...',
   loadingScannerMsg : 'Loading Scanner ...',
   loadingMsg : 'Loading ...',
   genQRCodeMsg : 'Generating QRCode ...',
   missingLicenseKeyMsg : 'License Key for this Device is missing. Press "Procced" to Scan the License Key into the device.',
   retrieveAuthModeMsg : 'Retrieving Authorization Code from Server ...',
   noCodeScannedMsg : 'No Authorization Code was Scanned!',
   lostNetworkConnectionMsg : 'You have lost network connectivity',
   networkErrorMsg : 'Error Connecting to Sever',
   noPeerDiscoveredMsg : 'No Peers were discovered',
   noPeerIdFoundMsg : function(msg)
   {
      return ("No ID Found! (" + msg + ")");
   },
   notAtVenuePremise : 'You must be inside the Merchant\'s premises to continue.',
   errorLoadingAccountProfileMsg : 'Error Loading Account Profile',
   invalidTagIdFormatMsg : function(length)
   {
      return 'Invalid ' + length + '-digit Tag ID format (eg. 12345678)';
   },
   invalidPhoneIdFormatMsg : function(length)
   {
      return 'Invalid ' + length + '-digit Telephone format (eg. 8005551234)';
   },
   transactionCancelledMsg : 'This transaction is cancelled',
   backToMerchantPageMsg : function(venue)
   {
      return ('Would you like to visit our Main Page?');
   },
   geoLocationErrorMsg : function()
   {
      var rc = 'This feature must require your GeoLocation to proceed.';
      if (Ext.os.is('Android'))
      {
         rc += // ((Ext.os.version.isLessThan('4.1')) ? //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> GPS satellites\"';
      }
      else if (Ext.os.is('iOS'))
      {
         rc += ((Ext.os.version.isLessThan('6.0')) ? //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> KICKBAK\"' :
         // //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Privacy >> Location Services >> KICKBAK\"'//
         );
      }
      else if (Ext.os.is('BlackBerry'))
      {
         rc += 'Enable Location Services under Main Screen of your phone: \"Settings App >> Site Permissions\"';
      }
      else
      {
         rc += 'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services\"';
      }

      return rc;
   },
   geoLocationTimeoutErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationPermissionErrorMsg : 'No permission to locate current location. Please enable permission to do so!',
   geoLocationUnavailableMsg : 'To better serve you, please turn on your Location Services',
   geoLocationUseLastPositionMsg : 'We are not able to locate your current location. Using your last known GPS Coordinates ...',
   getMerchantInfoMsg : 'Retrieving Merchant Information ...',
   getVenueInfoMsg : 'Retrieving Venue Information ...',
   prepareToSendMerchantDeviceMsg : 'Confirm before tapping against the KICKBAK Card Reader ...',
   mobilePhoneInputMsg : 'Mobile Number',
   lookingForMerchantDeviceMsg : function()//Send
   {
      return 'Tap your Phone against the ' + Genesis.constants.addCRLF() + 'KICKBAK Card Reader';
   },
   detectMerchantDeviceMsg : function()//Recv
   {
      return 'Tap your Phone against the ' + Genesis.constants.addCRLF() + 'KICKBAK Card Reader';
   },
   // Merchant Device
   prepareToSendMobileDeviceMsg : 'Prepare to send data across to Mobile Device ...',
   lookingForMobileDeviceMsg : function()//Send
   {
      return 'Please Swipe TAG or' + Genesis.constants.addCRLF() + //
      'Tap Mobile Device';
   },
   detectMobileDeviceMsg : function()//Recv
   {
      return 'Please Swipe TAG or' + Genesis.constants.addCRLF() + //
      'Tap Mobile Device';
   },
   //
   //
   //
   missingVenueInfoMsg : function(errors)
   {
      var errorMsg = '';
      if (Ext.isString(errors))
      {
         errorMsg = Genesis.constants.addCRLF() + errors;
      }
      else if (Ext.isObject(errors))
      {
         errorMsg = Genesis.constants.addCRLF() + errors.statusText;
      }
      return ('Error loading Venue information.' + errorMsg);
   },
   showToServerMsg : function()
   {
      return ('Confirm before tapping against the KICKBAK Card Reader');
   },
   showToLoyaltyCardMsg : function()
   {
      return ('Show your KICKBAK Card or use your Mobile Number');
   },
   errProcQRCodeMsg : 'Error Processing Authentication Code',
   cameraAccessMsg : 'Accessing your Camera Phone ...',
   updatingServerMsg : 'Updating Server ...',
   referredByFriendsMsg : function(merchatName)
   {
      return 'Have you been referred ' + Genesis.constants.addCRLF() + //
      'by a friend to visit' + Genesis.constants.addCRLF() + //
      merchatName + '?';
   },
   recvReferralb4VisitMsg : function(name)
   {
      return 'Claim your reward points by becoming a customer at ' + Genesis.constants.addCRLF() + name + '!';
   },
   showScreenTimeoutExpireMsg : function(duration)
   {
      return duration + ' are up! Press OK to confirm.';
   },
   showScreenTimeoutMsg : function(duration)
   {
      return 'You have ' + duration + ' to show this screen to a employee before it disappears!';
   },
   uploadFbMsg : 'Uploading to Facebook ...',
   uploadServerMsg : 'Uploading to server ...',
   inheritableStatics :
   {
      animationMode :
      {
         'cover' :
         {
            type : 'cover',
            direction : 'left',
            duration : 400
         },
         'coverUp' :
         {
            type : 'cover',
            direction : 'up',
            duration : 400
         },
         'slide' :
         {
            type : 'slide',
            direction : 'left',
            duration : 400
         },
         'slideUp' :
         {
            type : 'slide',
            direction : 'up',
            duration : 400
         },
         'pop' :
         {
            type : 'pop',
            duration : 400
         },
         'flip' :
         {
            type : 'flip',
            duration : 400
         },
         'fade' :
         {
            type : 'fade',
            duration : 400

         }
      },
      playSoundFile : function(sound_file, successCallback, failCallback)
      {
         if (Genesis.fn.isNative())
         {
            switch (sound_file['type'])
            {
               case 'FX' :
               case 'Audio' :
                  LowLatencyAudio.play(sound_file['name'], successCallback || Ext.emptyFn, failCallback || Ext.emptyFn);
                  break;
               case 'Media' :
                  sound_file['successCallback'] = successCallback || Ext.emptyFn;
                  sound_file['name'].play();
                  break;
            }
         }
         else
         {
            if (merchantMode)
            {
               sound_file['successCallback'] = successCallback || Ext.emptyFn;
               Ext.get(sound_file['name']).dom.play();
            }
            else if (successCallback)
            {
               successCallback();
            }
         }
      },
      stopSoundFile : function(sound_file)
      {
         if (Genesis.fn.isNative())
         {
            switch (sound_file['type'])
            {
               case 'FX' :
               case 'Audio' :
                  LowLatencyAudio.stop(sound_file['name']);
                  break;
               case 'Media' :
                  sound_file['name'].stop();
                  break;
            }
         }
         else
         {
            /*
             var sound = Ext.get(sound_file['name']).dom;
             sound.pause();
             sound.currentTime = 0;
             */
         }
      },
      encryptFromParams : function(params, mode)
      {
         GibberishAES.size(256);
         var encrypted = null, venueId = Genesis.fn.getPrivKey('venueId'), key = null;
         if ((venueId > 0) || (venueId < 0))
         {
            try
            {
               switch (mode)
               {
                  case 'prize' :
                  {
                     key = Genesis.fn.getPrivKey('p' + venueId);
                  }
                  case 'reward' :
                  {
                     key = Genesis.fn.getPrivKey('r' + venueId);
                     break;
                  }
                  default :
                     key = Genesis.fn.getPrivKey('r' + venueId);
                     break;
               }
               encrypted = (venueId > 0) ? venueId + '$' : '';
               encrypted += GibberishAES.enc(Ext.encode(params), key);
            }
            catch (e)
            {
            }
            /*
             console.debug("Used key[" + key + "]");
             console.debug('\n' + //
             "Encrypted Code Length: " + encrypted.length + '\n' + //
             'Encrypted Code [' + encrypted + ']' + '\n');
             */
         }

         return encrypted;
      },
      genQRCodeFromParams : function(params, mode, encryptOnly)
      {
         var me = this;
         var encrypted;
         //
         // Show QRCode
         //
         // GibberishAES.enc(string, password)
         // Defaults to 256 bit encryption
         GibberishAES.size(256);
         var venueId = Genesis.fn.getPrivKey('venueId');
         var key = "";
         switch (mode)
         {
            case 'prize' :
            {
               key = Genesis.fn.getPrivKey('p' + venueId);
               break;
            }
            case 'reward' :
            {
               key = Genesis.fn.getPrivKey('r' + venueId);
               break;
            }
            default :
               key = Genesis.fn.getPrivKey('r' + venueId);
               break;
         }
         var date;
         if (venueId > 0)
         {
            try
            {
               date = new Date().addHours(3);
               encrypted = GibberishAES.enc(Ext.encode(Ext.applyIf(
               {
                  "expiry_ts" : date.getTime()
               }, params)), key);
               encrypted = venueId + '$' + encrypted;

               console.debug("Used key[" + key + "]");
               console.debug('\n' + //
               "Encrypted Code Length: " + encrypted.length + '\n' + //
               'Encrypted Code [' + encrypted + ']' + '\n' + //
               'Expiry Date: [' + date + ']');
            }
            catch (e)
            {
            }

            return (encryptOnly) ? [encrypted, 0, 0] : me.genQRCode(encrypted);
         }
         Ext.device.Notification.show(
         {
            title : 'Missing License Key!',
            message : me.prototype.missingLicenseKeyMsg,
            buttons : ['Proceed', 'Cancel'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'proceed')
               {
                  _application.getController('Settings').fireEvent('upgradeDevice');
               }
            }
         });

         return (encryptOnly) ? ['', 0, 0] : '';
      },
      genQRCode : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 3;
         QRCodeVersion = QRCodeVersion || 10;

         // size of box drawn on canvas
         var padding = 0;
         // 1-40 see http://www.denso-wave.com/qrcode/qrgene2-e.html

         // QR Code Error Correction Capability
         // Higher levels improves error correction capability while decreasing the amount of data QR Code size.
         // QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
         // eg. L can survive approx 5% damage...etc.
         var qr = QRCode(QRCodeVersion, 'L');
         qr.addData(text);
         qr.make();
         var base64 = qr.createBase64(dotsize, padding);
         console.debug("QR Code Minimum Size = [" + base64[1] + "x" + base64[1] + "]");

         return [base64[0], base64[1], base64[1]];
      },
      genQRCodeInlineImg : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 4;
         QRCodeVersion = QRCodeVersion || 8;
         var padding = 0;
         var qr = QRCode(QRCodeVersion, 'L');

         qr.addData(text);
         qr.make();

         var html = qr.createTableTag(dotsize, padding);

         return html;
      }
   },
   init : function()
   {
      this.callParent(arguments);

      this.on(
      {
         scope : this,
         'scannedqrcode' : this.onScannedQRcode,
         'locationupdate' : this.onLocationUpdate,
         'openpage' : this.onOpenPage,
         'updatemetadata' : this.updateMetaDataInfo,
         'triggerCallbacksChain' : this.triggerCallbacksChain
      });

      /*
      this.callBackStack =
      {
      callbacks : ['signupPromotionHandler', 'earnPtsHandler', 'referralHandler', 'scanAndWinHandler'],
      arguments : [],
      startIndex : 0
      };
      */
      //
      // Forward all locally generated page navigation events to viewport
      //
      //this.setAnimationMode(this.self.animationMode['cover']);

      //
      // Prevent Recursion
      //
      var viewport = this.getViewPortCntlr();
      if (viewport != this)
      {
         viewport.relayEvents(this, ['pushview', 'popview', 'silentpopview', 'resetview']);
         viewport.on('animationCompleted', this.onAnimationCompleted, this);
      }
   },
   getViewPortCntlr : function()
   {
      return this.getApplication().getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
   },
   getViewport : function()
   {
      return this.getViewPortCntlr().getView();
   },
   getMainPage : Ext.emptyFn,
   openMainPage : Ext.emptyFn,
   openPage : Ext.emptyFn,
   goToMain : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      if (viewport.setLoggedIn)
      {
         viewport.setLoggedIn(true);
      }
      me.resetView();
      me.redirectTo('main');
      console.log("LoggedIn, Going to Main Page ...");
   },
   goToMerchantMain : function(noprompt)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var info = viewport.getCheckinInfo();
      var _backToMain = function()
      {
         me.resetView();
         if (info.venue)
         {
            me.redirectTo('venue/' + info.venue.getId() + '/' + info.customer.getId() + '/1');
         }
         else
         {
            me.redirectTo('checkin');
         }
      };
      if (info.venue && !noprompt)
      {
         Ext.device.Notification.show(
         {
            title : info.venue.get('name').trunc(16),
            message : me.backToMerchantPageMsg(info.venue),
            buttons : ['OK', 'Cancel'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'ok')
               {
                  _backToMain();
               }
            }
         });
      }
      else
      {
         _backToMain();
      }
   },
   isOpenAllowed : function()
   {
      return "Cannot Open Folder";
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onBeforeNfc : function(nfcEvent)
   {
      var me = this, result = null, id = null;

      console.log("NDEF Message received");
      try
      {
         var tag = nfcEvent.tag, records = tag.ndefMessage || [], id = nfc.bytesToHexString(tag.id);
         var langCodeLength = records[0].payload[0], text = records[0].payload.slice((1 + langCodeLength), records[0].payload.length);

         console.debug("NFC ndefID[" + id + "] ndefMessage[" + nfc.bytesToString(text) + "]")
         result =
         {
            result : Ext.decode(nfc.bytesToString(text)),
            id : id
         }
         //
         // Decrypt Message
         //
         me.printNfcTag(nfcEvent);
      }
      catch (e)
      {
         console.log("Exception Thrown while processing NFC Tag[" + e + "]");
      }

      return result;
   },
   onNfc : Ext.emptyFn,
   onScannedQRcode : Ext.emptyFn,
   onLocationUpdate : Ext.emptyFn,
   onOpenPage : function(feature, subFeature, cb, eOpts, eInfo)
   {
      if ((appName == 'GetKickBak') && //
      //((Genesis.fn.isNative() && !Ext.device.Connection.isOnline()) || (!navigator.onLine)) && //
      !navigator.onLine && //
      (feature != 'MainPage'))
      {
         var viewport = me.getViewPortCntlr();
         if (!offlineDialogShown)
         {
            Ext.device.Notification.show(
            {
               title : 'Network Error',
               message : me.lostNetworkConnectionMsg,
               buttons : ['Dismiss'],
               callback : function()
               {
                  offlineDialogShown = false;
               }
            });
            offlineDialogShown = true;
         }
         console.debug("Network Error - " + feature + "," + subFeature);
         me.resetView();
         me.redirectTo(viewport.getLoggedIn() ? 'checkin' : 'login');
         return;
      }

      var app = this.getApplication();
      controller = app.getController(feature);
      if (!subFeature)
      {
         controller.openMainPage();
      }
      else
      {
         controller.openPage(subFeature, cb);
      }
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   triggerCallbacksChain : function()
   {
      var me = this;
      var startIndex = me.callBackStack['startIndex'];
      var length = me.callBackStack['callbacks'].length;
      for (var i = startIndex; i < length; i++)
      {
         me.callBackStack['startIndex']++;
         if (me[me.callBackStack['callbacks'][i]].apply(me, me.callBackStack['arguments']))
         {
            //
            // Break the chain and contine Out-of-Scope
            //
            break;
         }
      }
      if (i >= length)
      {
         console.debug("Clear Callback Chain[" + i + "].");
         //
         // End of Callback Chain
         //
         me.callBackStack['startIndex'] = 0;
         me.callBackStack['arguments'] = [];
      }
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this, viewport = me.getViewPortCntlr();
      viewport.updateMetaDataInfo(metaData);
   },
   checkReferralPrompt : function(cbOnSuccess, cbOnFail)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var customer = viewport.getCustomer();
      var merchant = viewport.getVenue().getMerchant();
      var merchantId = merchant.getId();
      var success = cbOnSuccess || Ext.emptyFn;
      var fail = cbOnFail || Ext.emptyFn;

      if (Customer.isValid(customer.getId())// Valid Customer
      && (customer.get('visits') < 2)// Not a frequent visitor yet
      && (!Genesis.db.getReferralDBAttrib("m" + merchantId))// Haven't been referred by a friend yet
      && (_build != 'MobileWebClient'))// Not a MobileWeb App
      {
         console.debug("Customer Visit Count[" + customer.get('visits') + "]")
         Ext.device.Notification.show(
         {
            title : 'Referral Challenge',
            message : me.referredByFriendsMsg(merchant.get('name')),
            buttons : ['Yes', 'No'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'yes')
               {
                  Ext.defer(function()
                  {
                     me.fireEvent('openpage', 'mobileClient.Challenges', 'referrals', success);
                  }, 1, me);
               }
               else
               {
                  fail();
               }
            }
         });
      }
      else
      {
         fail();
      }
   },
   /*
    refreshBadges : function()
    {
    var bstore = Ext.StoreMgr.get('BadgeStore');

    Badges['setGetBadgesUrl']();
    bstore.load(
    {
    jsonData :
    {
    },
    params :
    {
    },
    callback : function(records, operation)
    {
    if (operation.wasSuccessful())
    {
    me.persistSyncStores('BadgeStore');
    }
    }
    });
    },
    */
   earnRedeemPopup : function(callback)
   {
      var me = this;

      if (!me._earnRedeemPopup)
      {
         me._earnRedeemPopup = Ext.create('Ext.Sheet',
         {
            bottom : 0,
            left : 0,
            top : 0,
            right : 0,
            padding : '1.0',
            hideOnMaskTap : false,
            defaultUnit : 'em',
            cls : 'x-mask transmit-mask',
            layout :
            {
               type : 'vbox',
               pack : 'middle'
            },
            defaults :
            {
               xtype : 'container',
               defaultUnit : 'em'
            },
            items : [
            {
               width : '100%',
               flex : 1,
               style : 'text-align:center;display:inline-table;color:white;font-size:1.1em;',
               html : Genesis.fb.fbConnectRequestMsg
            },
            {
               docked : 'bottom',
               defaults :
               {
                  xtype : 'button',
                  defaultUnit : 'em',
                  scope : me
               },
               padding : '0 1.0 1.0 1.0',
               items : [
               {
                  margin : '0.5 0 0 0',
                  text : 'Cancel',
                  //ui : 'decline',
                  handler : function()
                  {
                     me._earnRedeemPopup.hide();
                  }
               },
               {
                  margin : '0 0 0.5 0',
                  text : 'Proceed',
                  ui : 'action',
                  handler : function()
                  {
                     me._earnRedeemPopup.hide();
                     callback();
                  }
               }]
            }]
         });
         Ext.Viewport.add(me._earnRedeemPopup);
      }
      me._earnRedeemPopup.show();
   },
   gravityThreshold : 4.0,
   accelerometerHandler : function(vol, callback)
   {
      var me = this;
      //return navigator.accelerometer.watchAcceleration(function(accel)
      navigator.accelerometer.getCurrentAcceleration(function(accel)
      {
         //
         // Mobile device lay relatively flat and stationary ...
         //
         //console.debug('Accelerometer x=' + accel.x + ' accel.y=' + y);
         if ((accel.z >= (9.81 - me.gravityThreshold)) && (accel.z <= (9.81 + me.gravityThreshold)))
         {
            if (vol != Genesis.constants.s_vol)
            {
               window.plugins.proximityID.setVolume(Genesis.constants.s_vol);
               console.debug('Accelerometer new_vol=' + Genesis.constants.s_vol);
               callback(Genesis.constants.s_vol);
            }
         }
         else
         {
            //
            // Restore to system default
            //
            if (vol != -1)
            {
               window.plugins.proximityID.setVolume(-1);
               console.debug('Accelerometer new_vol=-1');
               callback(-1);
            }
         }
      },
      {
         frequency : 250
      });
   },
   getLocalID : function(success, fail, retryFn)
   {
      var me = this, c = Genesis.constants, viewport = me.getViewPortCntlr();

      me.scanTaskWait = false;
      me.scanTask = null;

      //create the delayed task instance with our callback
      me.scanTask = setInterval(function()
      {
         if (!me.scanTaskWait)
         {
            me.scanTaskWait = true;
            clearInterval(me.scanTask);
            me.scanTask = null;
            me.self.playSoundFile(viewport.sound_files['nfcError']);
            window.plugins.proximityID.stop();
            Ext.device.Notification.show(
            {
               title : 'Local Identity',
               message : me.noPeerDiscoveredMsg,
               buttons : ['Try Again', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() != 'try again')
                  {
                     fail();
                  }
                  else
                  {
                     Ext.defer(retryFn, 1);
                  }
               }
            });
         }
      }, c.proximityRxTimeout);

      window.plugins.proximityID.scan(function(result)
      {
         clearInterval(me.scanTask);
         me.scanTask = null;
         window.plugins.proximityID.stop();
         var identifiers = Genesis.fn.processRecvLocalID(result);
         if (identifiers['message'])
         {
            me.self.playSoundFile(viewport.sound_files['nfcEnd']);
            success(identifiers);
         }
      }, function(error)
      {
         clearInterval(me.scanTask);
         me.scanTask = null;
         window.plugins.proximityID.stop();
         Ext.device.Notification.show(
         {
            title : 'Local Identity',
            message : me.noPeerIdFoundMsg(Ext.encode(error)),
            buttons : ['Dismiss']
         });
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         console.debug('Error Code[' + Ext.encode(error) + ']');
         fail();
      }, c.numSamples, c.conseqMissThreshold, c.magThreshold, c.sigOverlapRatio);

      return me.scanTask;
   },
   broadcastLocalID : function(success, fail)
   {
      var me = this, c = Genesis.constants, cancel = function()
      {
         Ext.Ajax.abort();
         if (me.send_vol != -1)
         {
            window.plugins.proximityID.setVolume(-1);
         }
         window.plugins.proximityID.stop();
      };

      me.send_vol = -1;
      success = success || Ext.emptyFn;
      fail = fail || Ext.emptyFn;

      window.plugins.proximityID.send(function(result)
      {
         console.debug("ProximityID : Broacasting Local Identity ...");
         success(Genesis.fn.processSendLocalID(result, cancel));
      }, function(error)
      {
         console.debug('Error Code[' + Ext.encode(error) + ']');
         cancel();
         fail();
      });
   },
   // --------------------------------------------------------------------------
   // Persistent Stores
   // --------------------------------------------------------------------------
   persistStore : function(storeName)
   {
      var i, stores =
      {
         'CustomerStore' : [false, Ext.StoreMgr.get('Persistent' + 'CustomerStore'), 'CustomerStore', 'Customer' + 'DB'],
         'LicenseStore' : [false, Ext.StoreMgr.get('Persistent' + 'LicenseStore'), 'LicenseStore', 'frontend.LicenseKey' + 'DB'],
         'ReceiptStore' : [true, Ext.StoreMgr.get('ReceiptStore'), 'ReceiptStore', 'frontend.Receipt']
         //'BadgeStore' : [false, Ext.StoreMgr.get('Persistent' + 'BadgeStore'), 'BadgeStore', 'BadgeJSON']
         //,'PrizeStore' : [false, Ext.StoreMgr.get('Persistent' + 'PrizeStore'), 'PrizeStore',
         // 'CustomerRewardJSON']
      };
      console.debug("Looking for " + storeName);
      for (i in stores)
      {
         if (!stores[i][0] && !stores[i][1])
         {
            Ext.regStore('Persistent' + stores[i][2],
            {
               model : 'Genesis.model.' + stores[i][3],
               autoLoad : false
            });
            stores[i][1] = Ext.StoreMgr.get('Persistent' + stores[i][2]);
            //console.debug("Created [" + 'Persistent' + stores[i][1] + "]");
         }
         else if (stores[i][1] && (stores[i][1].getStoreId() == ('Persistent' + storeName)))
         {
            //console.debug("Store[" + stores[i][0].getStoreId() + "] found!");
            return stores[i][1];
         }
      }

      return stores[storeName][1];
   },
   persistLoadStores : function(callback)
   {
      var me = this, _store, i, x, j, flag = 0x110000, viewport = me.getViewPortCntlr(), stores = [//
      [this.persistStore('CustomerStore'), 'CustomerStore', 0x000001], //
      [this.persistStore('LicenseStore'), 'LicenseStore', 0x000100], //
      [this.persistStore('ReceiptStore'), 'ReceiptStore', 0x001000] //
      //[this.persistStore('BadgeStore'), 'BadgeStore', 0x010000]];
      //,[this.persistStore('PrizeStore'), 'PrizeStore', 0x100000]];
      ];

      callback = callback || Ext.emptyFn;

      for ( i = 0; i < stores.length; i++)
      {
         _store = stores[i][0];
         if (!_store)
         {
            flag |= stores[i][2];
            console.debug("Cannot find Store[" + stores[i][1] + "] to be restored!");
            continue;
         }
         try
         {
            //var ids = stores[i][0].getProxy().getIds();
            //console.debug("Ids found are [" + ids + "]");
            _store.load(
            {
               callback : Ext.bind(function(results, operation, success, _flag, store)
               {
                  var me = this, items = [];

                  flag |= _flag;
                  //
                  // CustomerStore
                  //
                  if (operation.wasSuccessful())
                  {
                     store.removeAll();
                     for ( x = 0; x < results.length; x++)
                     {
                        items.push(Ext.decode(results[x].get('json')));
                     }
                     store.setData(items);
                     console.debug("persistLoadStores  --- Restored " + results.length + " records to " + store.getStoreId());
                  }
                  else
                  {
                     console.debug("Error Restoring " + store.getStoreId() + " ...");
                  }

                  flag |= 0x000010;

                  if (flag == 0x111111)
                  {
                     callback();
                  }
               }, me, [stores[i][2], Ext.StoreMgr.get(stores[i][1])], true)
            });
         }
         catch(e)
         {
            console.debug("Stack Trace - [" + e.stack + "]");

            Ext.device.Notification.show(
            {
               title : 'Account Profile',
               message : me.errorLoadingAccountProfileMsg,
               buttons : ['Dismiss'],
               callback : function()
               {
                  viewport.resetView();
                  viewport.redirectTo('login');
               }
            });
         }
      }
   },
   persistSyncStores : function(storeName)
   {
      //var updateStatement = "UPDATE Customer SET json = ? WHERE id = ?";
      //var deleteStatement = "DELETE FROM Customer WHERE id=?";
      var me = this, store, dropStatement = "DROP TABLE Customer";

      var i, items, json = [], stores = [//
      [me.persistStore('CustomerStore'), 'CustomerStore', 'Customer' + 'DB'], //
      [me.persistStore('LicenseStore'), 'LicenseStore', 'frontend.LicenseKey' + 'DB'], //
      [me.persistStore('ReceiptStore'), 'ReceiptStore', 'frontend.Receipt'] //
      //[me.persistStore('BadgeStore'), 'BadgeStore']];
      //, [me.persistStore('PrizeStore'), 'PrizeStore']];
      ];
      //console.debug('persistSyncStores called storeName=[' + storeName + ']');

      //
      // Other Persistent Table
      //
      for ( i = 0; i < stores.length; i++)
      {
         store = stores[i][0];
         if (!store)
         {
            console.debug("Cannot find Store[" + stores[i][1] + "] to be restored!");
            continue;
         }

         //
         // Customer Store
         //
         if ((!storeName || (storeName == stores[i][1])))
         {
            store.getProxy().clear(Ext.bind(function(_i, _store)
            {
               _store.removeAll(true);
               Ext.defer(function()
               {
                  items = Ext.StoreMgr.get(stores[_i][1]).getRange();
                  for (var x = 0; x < items.length; x++)
                  {
                     json.push(Ext.create('Genesis.model.' + stores[_i][2],
                     {
                        json : Ext.encode(items[x].getData(true))
                     }));
                  }
                  _store.add(json);
                  _store.sync();
                  console.debug("persistSyncStores  --- Found " + items.length + " records in [" + stores[_i][1] + "] ...");
               }, me, 1);
            }, me, [i, store]));
         }

         //
         // We're done!
         //
         if (storeName == stores[i][1])
         {
            break;
         }
      }
   },
   persistResetStores : function()
   {
      var me = this, store;

      var i, items, json = [], stores = [//
      [me.persistStore('CustomerStore'), 'CustomerStore', 'Customer' + 'DB'], //
      [me.persistStore('LicenseStore'), 'LicenseStore', 'frontend.LicenseKey' + 'DB'], //
      [me.persistStore('ReceiptStore'), 'ReceiptStore', 'frontend.Receipt'] //
      ];

      //
      // Other Persistent Table
      //
      for ( i = 0; i < stores.length; i++)
      {
         store = stores[i][0];
         if (!store)
         {
            console.debug("Cannot find Store[" + stores[i][1] + "] to be restored!");
            continue;
         }

         //
         // Customer Store
         //
         store.getProxy().dropTable(Ext.bind(function(_i, _store)
         {
            _store.removeAll(true);
            Ext.defer(function()
            {
               _store.getProxy().initialize();
               console.debug("persistResetStores  --- Reinitialized " + stores[_i][2] + "] ...");
               _store.sync();
            }, me, 1);
         }, me, [i, store]));
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   refreshPage : function(page)
   {
      var me = this, vport = me.getViewport(), controller = vport.getEventDispatcher().controller, anim = new Ext.fx.layout.Card(me.self.animationMode['fade']);

      anim.on('animationend', function()
      {
         console.debug("Animation Complete");
         anim.destroy();
      }, me);

      //if (!controller.isPausing)
      {
         console.debug("Reloading Current Page ...");

         // Delete current page and refresh
         page.removeAll(true);
         vport.animateActiveItem(page, anim);
         anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
         vport.doSetActiveItem(page, null);
      }
   },
   resetView : function(view)
   {
      this.fireEvent('resetview');
   },
   pushView : function(view)
   {
      this.fireEvent('pushview', view, this.getAnimationMode());
   },
   silentPopView : function(num)
   {
      this.fireEvent('silentpopview', num);
   },
   popView : function()
   {
      this.fireEvent('popview');
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   geoRetryAttempts : 3,
   getGeoLocation : function(iter)
   {
      var me = this, i = iter || 0, viewport = me.getViewPortCntlr(), position = viewport.getLastPosition();
      var options =
      {
         autoUpdate : false,
         maximumAge : 60 * 1000,
         timeout : 2 * 1000,
         allowHighAccuracy : true,
         enableHighAccuracy : true
      }

      console.debug('Getting GeoLocation ...');
      /*
       if (!Genesis.fn.isNative())
       {
       me.fireEvent('locationupdate',
       {
       coords :
       {
       getLatitude : function()
       {
       return "-50.000000";
       },
       getLongitude : function()
       {
       return '50.000000';
       }
       }
       });
       return;
       }
       */
      var successCallback = function(geo, eOpts)
      {
         if (!geo)
         {
            console.debug("No GeoLocation found!");
            return;
         }
         var position =
         {
            coords : geo
         }
         console.debug('\n' + 'Latitude: ' + geo.getLatitude() + '\n' + 'Longitude: ' + geo.getLongitude() + '\n' +
         //
         'Altitude: ' + geo.getAltitude() + '\n' + 'Accuracy: ' + geo.getAccuracy() + '\n' +
         //
         'Altitude Accuracy: ' + geo.getAltitudeAccuracy() + '\n' + 'Heading: ' + geo.getHeading() + '\n' +
         //
         'Speed: ' + geo.getSpeed() + '\n' + 'Timestamp: ' + new Date(geo.getTimestamp()) + '\n');

         viewport.setLastPosition(position);
         me.fireEvent('locationupdate', position);
      }
      var failCallback = function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
      {
         console.debug('GeoLocation Error[' + message + ']');
         if (bTimeout)
         {
            console.debug("TIMEOUT");
            if (!position)
            {
               Ext.device.Notification.show(
               {
                  title : 'Timeout Error',
                  message : me.geoLocationTimeoutErrorMsg,
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     me.fireEvent('locationupdate', position);
                  }
               });
            }
            else
            {
               me.fireEvent('locationupdate', position);
            }
         }
         else if (bLocationUnavailable)
         {
            if (i < me.geoRetryAttempts)
            {
               console.debug("Retry #" + i);
               Ext.defer(me.getGeoLocation, 0.25 * 1000, me, [++i]);
            }
            else
            {
               console.debug("POSITION_UNAVAILABLE");
               if (!position)
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Location Services',
                     message : me.geoLocationUnavailableMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        me.fireEvent('locationupdate', position);
                     }
                  });
               }
               else
               {
                  me.fireEvent('locationupdate', position);
               }
            }
         }
         else
         //if (bPermissionDenied)
         {
            console.debug("PERMISSION_DENIED");
            viewport.setLastPosition(null);
            me.fireEvent('locationupdate', null);
         }
      }
      if (!me.geoLocation)
      {
         me.geoLocation = Ext.create('Ext.util.Geolocation', Ext.applyIf(
         {
            listeners :
            {
               locationupdate : successCallback,
               locationerror : function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
               {
                  if (bTimeout && (i < me.geoRetryAttempts))
                  {
                     i = me.geoRetryAttemptsme;
                     me.getGeoLocation(i);
                  }
                  else
                  {
                     failCallback(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message);
                  }
               }
            }
         }, options));
      }
      me.geoLocation.updateLocation(null, null, (i >= me.geoRetryAttempts) ? Ext.applyIf(
      {
         allowHighAccuracy : false,
         enableHighAccuracy : false
      }, options) : options);
   },
   scanQRCode : function()
   {
      var me = this;
      var callback = function(r)
      {
         var qrcode;
         Ext.Viewport.setMasked(null);
         if (Genesis.fn.isNative())
         {
            switch(window.plugins.qrCodeReader.scanType)
            {
               case 'RL' :
               {
                  qrcode = (r.response == undefined) ? "" : (r.response || "");
                  console.debug("QR Code RL  = " + qrcode);
                  break;
               }
               case 'Nigma' :
               {
                  qrcode = (r.response == undefined) ? "" : (r.response || "");
                  if (!qrcode)
                  {
                     console.debug("QR Code Nigma = Empty");
                  }
                  else
                  {
                     console.debug("QR Code Nigma = " + ((qrcode.responseCode) ? qrcode.responseCode : "NONE") + " Sent = " + qrcode.bytesSent + " bytes");
                  }
                  if (qrcode && qrcode.responseCode)
                  {
                     qrcode = qrcode.responseCode;
                  }
                  break;
               }
               case 'Default' :
               {
                  qrcode = r;
                  if (!qrcode || qrcode.format != 'QR_CODE')
                  {
                     qrcode = null;
                     console.debug("QR Code Default = Unsupported Code");
                     //
                     // Simulator, we must pump in random values
                     //
                     if (device.platform.match(/simulator/i))
                     {
                        qrcode = Math.random().toFixed(16);
                     }
                  }
                  else if (qrcode.cancelled)
                  {
                     qrcode = Math.random().toFixed(16);
                  }
                  else
                  {
                     qrcode = qrcode.text;
                  }
                  console.debug("QR Code Default = " + ((qrcode) ? qrcode : "NONE"));
                  break;
               }
            }
         }
         else
         {
            qrcode = r.response;
            console.debug("QR Code = " + qrcode);
         }

         Ext.device.Notification.beep();
         me.fireEvent('scannedqrcode', qrcode);
      }
      var fail = function(message)
      {
         Ext.Viewport.setMasked(null);
         console.debug('Failed because: ' + message);
         Ext.device.Notification.beep();
         me.fireEvent('scannedqrcode', null);
      }

      console.debug("Scanning QR Code ...")
      if (!Genesis.fn.isNative())
      {
         //
         // pick the first one on the Neaby Venue in the store
         //
         var venueId = "0";
         if (!merchantMode)
         {
            var venue = me.getViewPortCntlr().getVenue() || null;
            venueId = venue ? venue.getId() : "0";
         }
         callback(
         {
            response : venueId
         });
      }
      else
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.loadingScannerMsg
         });

         window.plugins.qrCodeReader.getCode(callback, fail);
      }
   },
   tnfToString : function(tnf)
   {
      var value = tnf;

      switch (tnf)
      {
         case ndef.TNF_EMPTY:
            value = "Empty";
            break;
         case ndef.TNF_WELL_KNOWN:
            value = "Well Known";
            break;
         case ndef.TNF_MIME_MEDIA:
            value = "Mime Media";
            break;
         case ndef.TNF_ABSOLUTE_URI:
            value = "Absolute URI";
            break;
         case ndef.TNF_EXTERNAL_TYPE:
            value = "External";
            break;
         case ndef.TNF_UNKNOWN:
            value = "Unknown";
            break;
         case ndef.TNF_UNCHANGED:
            value = "Unchanged";
            break;
         case ndef.TNF_RESERVED:
            value = "Reserved";
            break;
      }
      return value;
   },
   showProperty : function(name, value)
   {
      console.debug("Name[" + name + "] Value[" + value + "]");
   },
   printNfcTag : function(nfcEvent)
   {
      var me = this;
      function template(record)
      {
         var id = "", tnf = me.tnfToString(record.tnf), recordType = nfc.bytesToString(record.type), payload;

         if (record.id && (record.id.length > 0))
         {
            id = "Record Id: " + record.id + "\n";
         }

         switch(recordType)
         {
            case 'T' :
            {
               var langCodeLength = record.payload[0], text = record.payload.slice((1 + langCodeLength), record.payload.length);
               payload = nfc.bytesToString(text);
               break;
            }
            case 'U' :
            {
               var url = nfc.bytesToString(record.payload);
               payload = "URL[" + url + "]";
               break;
            }
            default:
               // attempt display as a string
               payload = nfc.bytesToString(record.payload);
               break;
         }

         return (id + "TNF: " + tnf + "\n" + "Record Type: " + recordType + "\n" + payload);
      }

      var tag = nfcEvent.tag, records = tag.ndefMessage || [];
      console.debug("Scanned an NDEF tag with " + records.length + " record" + ((records.length === 1) ? "" : "s"));

      // Display Tag Info
      if (tag.id)
      {
         me.showProperty("Id", nfc.bytesToHexString(tag.id));
      }
      me.showProperty("Tag Type", tag.type);
      me.showProperty("Max Size", tag.maxSize + " bytes");
      me.showProperty("Is Writable", tag.isWritable);
      me.showProperty("Can Make Read Only", tag.canMakeReadOnly);

      // Display Record Info
      for (var i = 0; i < records.length; i++)
      {
         console.debug(template(records[i]));
      }
   },
   // --------------------------------------------------------------------------
   // Common Social Media Handlers
   // --------------------------------------------------------------------------
   onFbActivate : function()
   {
      var me = this, fb = Genesis.fb;

      fb.on('connected', me.updateFBSignUpPopupCallback, me);
      fb.on('unauthorized', me.updateFBSignUpPopupCallback, me);
      fb.on('exception', me.updateFBSignUpPopupCallback, me);
   },
   onFbDeactivate : function()
   {
      var me = this, fb = Genesis.fb;

      fb.un('connected', me.updateFBSignUpPopupCallback, me);
      fb.un('unauthorized', me.updateFBSignUpPopupCallback, me);
      fb.un('exception', me.updateFBSignUpPopupCallback, me);
   },
   onToggleFB : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, fb = Genesis.fb, db = Genesis.db.getLocalDB();

      if (newValue == 1)
      {
         me.onFbActivate();
         fb.facebook_onLogin(db['enableTwitter']);
      }
      else if (db['enableFB'])
      {
         me.onFbDeactivate();
      }
   },
   onFacebookChange : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      if (me.initializing)
      {
         return;
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      me.fireEvent('toggleFB', toggle, slider, thumb, newValue, oldValue, eOpts);
   },
   onTwitterChange : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      if (me.initializing)
      {
         return;
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      me.fireEvent('toggleTwitter', toggle, slider, thumb, newValue, oldValue, eOpts);
   }
});
Ext.define('Genesis.controller.ViewportBase',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.Sheet'],
   inheritableStatics :
   {
   },
   config :
   {
      models : ['Customer', 'Checkin', 'Venue', 'Genesis.model.frontend.LicenseKey'],
      sound_files : null,
      refs :
      {
         view : 'viewportview',
         backButton : 'button[tag=back]',
         closeButton : 'button[tag=close]'
      },
      control :
      {
         //
         view :
         {
            activate : 'onActivate'
         },
         backButton :
         {
            tap : 'onBackButtonTap'
         },
         closeButton :
         {
            tap : 'onBackButtonTap'
         },
         //
         'viewportview button' :
         {
            tap : 'onButtonTap'
         }
      }
   },
   mainPageStorePathToken : /\{platform_path\}/mg,
   mainPageStoreRelPathToken : /\{rel_path\}/mg,
   popViewInProgress : false,
   viewStack : [],
   animationFlag : 0,
   gatherCheckinInfoMsg : 'Prepare to scan Check-in Code ...',
   retrieveChallengesMsg : 'Retrieving Challenges ...',
   // --------------------------------------------------------------------------
   // MetaData Handlers
   // --------------------------------------------------------------------------
   updateBadges : function(badges)
   {
      var me = this, bstore = Ext.StoreMgr.get('BadgeStore');
      if (badges)
      {
         // Update All Badges
         //console.debug('badges - [' + Ext.encode(badges) + ']');
         bstore.setData(badges);
         //me.persistSyncStores('BadgeStore');
      }
   },
   updateAccountInfo : function(metaData, info)
   {
      var me = this, updateBadge = false, viewport = me.getViewPortCntlr();
      var bstore = Ext.StoreMgr.get('BadgeStore'), cstore = Ext.StoreMgr.get('CustomerStore');
      var customer = viewport.getCustomer(), customerId = metaData['customer_id'] || ((customer) ? customer.getId() : 0);
      var _createNewCustomer = function()
      {
         //
         // First Visit!
         //
         if (info && (info['visits'] == 1))
         {
            console.debug("Adding New Customer Record ...");

            var merchants = me.getApplication().getController('client' + '.Merchants'), checkins = me.getApplication().getController('client' + '.Checkins');
            var _customer = viewport.getCustomer(), ccustomer = Ext.create('Genesis.model.Customer', Ext.applyIf(
            {
               id : customerId,
               merchant : _customer.getMerchant().raw
            }, info));
            ccustomer.setLastCheckin(Ext.create('Genesis.model.Checkin'));
            cstore.add(ccustomer);

            merchants.getMain().cleanView(checkins.getExplore());
            checkins.fireEvent('setupCheckinInfo', 'checkin', viewport.getVenue(), ccustomer, metaData);

            console.debug("New Customer Record Added.");

            me.persistSyncStores('CustomerStore');

            customer = ccustomer;
         }
      };

      if (customerId > 0)
      {
         console.debug("updateAccountInfo - customerId[" + customerId + "]");

         customer = cstore.getById(customerId);
         if (customer)
         {
            customer.beginEdit();
            if (info)
            {
               if (Ext.isDefined(info['points']))
               {
                  customer.set('points', info['points']);
               }
               if (Ext.isDefined(info['prize_points']))
               {
                  customer.set('prize_points', info['prize_points']);
               }
               if (Ext.isDefined(info['visits']))
               {
                  customer.set('visits', info['visits']);
               }
               if (Ext.isDefined(info['next_badge_visits']))
               {
                  customer.set('next_badge_visits', info['next_badge_visits']);
               }
               //
               // Badge Status
               //
               var i, badges = [
               {
                  id : info['badge_id'],
                  prefix : "Customer's Current Badge is - [",
                  badgeId : 'badge_id'
               }, //
               {
                  id : info['next_badge_id'],
                  prefix : "Customer's Next Badge is - [",
                  badgeId : 'next_badge_id'
               }];
               for ( i = 0; i < badges.length; i++)
               {
                  if (Ext.isDefined(badges[i].id))
                  {
                     var badge = bstore.getById(badges[i].id);
                     console.debug(badges[i].prefix + //
                     badge.get('type').display_value + "/" + badge.get('visits') + "]");

                     customer.set(badges[i].badgeId, badges[i].id);
                  }
               }
               var eligible_reward = info['eligible_for_reward'];
               if (Ext.isDefined(eligible_reward))
               {
                  customer.set('eligible_for_reward', eligible_reward);
               }
               var eligible_prize = info['eligible_for_prize'];
               if (Ext.isDefined(eligible_prize))
               {
                  customer.set('eligible_for_prize', eligible_prize);
               }
            }
            customer.endEdit();
            me.persistSyncStores('CustomerStore');
         }
         else
         {
            _createNewCustomer();
         }
      }
      else
      {
         _createNewCustomer();
      }

      return customer;
   },
   updateRewards : function(rewards)
   {
      if (rewards && (rewards.length > 0))
      {
         var i, me = this, viewport = me.getViewPortCntlr(), merchant = viewport.getVenue().getMerchant();

         console.debug("Total Redemption Rewards - " + rewards.length);
         for ( i = 0; i < rewards.length; i++)
         {
            rewards[i]['merchant'] = merchant;
         }
         Ext.StoreMgr.get('RedeemStore').setData(rewards);
      }
   },
   updatePrizes : function(prizes)
   {
      if (prizes && (prizes.length > 0))
      {
         var i, me = this, viewport = me.getViewPortCntlr(), merchant = viewport.getVenue().getMerchant();

         console.debug("Total Redemption Prizes - " + prizes.length);
         for ( i = 0; i < prizes.length; i++)
         {
            prizes[i]['merchant'] = merchant;
         }
         Ext.StoreMgr.get('PrizeStore').setData(prizes);
      }
   },
   updateNews : function(news)
   {
      var nstore = Ext.StoreMgr.get('NewsStore');
      if (news && (news.length > 0))
      {
         console.debug("Total News Items - " + news.length);
         nstore.setData(news);
      }
      else
      {
         console.debug("No News Items");
         nstore.removeAll();
      }
   },
   updateAuthCode : function(metaData)
   {
      var me = this, rc = false, db = Genesis.db.getLocalDB();
      var authCode = metaData['auth_token'], csrfCode = metaData['csrf_token'], account = metaData['account'];

      if (!authCode)
         return rc;

      rc = true;
      if ((authCode != db['auth_code']) || (csrfCode != db['csrf_code']))
      {
         db['auth_code'] = authCode;
         db['csrf_code'] = csrfCode;
         db['account'] = account ||
         {
         };
         Genesis.db.setLocalDB(db);

         console.debug('\n' + //
         "auth_code [" + authCode + "]" + "\n" + //
         "csrf_code [" + csrfCode + "]" + "\n" + //
         "account [" + Ext.encode(account) + "]" + "\n" + //
         "currFbId [" + db['currFbId'] + "]");
      }

      return rc;
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this, customer = null, viewport = me.getViewPortCntlr(), db = Genesis.db.getLocalDB();
      try
      {
         //
         // Update Authentication Token
         //
         if (me.updateAuthCode(metaData))
         {
            viewport.setLoggedIn(true);

            // No Venue Checked-In from previous session
            if (!db['last_check_in'])
            {
               //
               // Trigger Facebook Login reminder
               //
               //console.log("Login Status - enableFB(" + db['enableFB'] + ") currFbId(" + db['currFbId'] + ")");
               if ((db['enableFB'] && (db['currFbId'] > 0)) || db['disableFBReminderMsg'])
               {
                  if (!Genesis.fb.cb || !Genesis.fb.cb['viewName'])
                  {
                     var ma_struct = db['ma_struct'];
                     // Mini App forwarding
                     if (Ext.isDefined(ma_struct) && (ma_struct['venueId'] > 0))
                     {
                        Genesis.db.removeLocalDBAttrib('ma_struct');
                        me.redirectTo('venue/' + ma_struct['venueId'] + '/' + ma_struct['merchant']['customerId']);
                     }
                     else
                     {
                        me.redirectTo('main');
                     }
                  }
               }
               else
               {
                  Genesis.fb.createFBReminderMsg();
               }
            }

            return;
         }

         //
         // Update points from the purchase or redemption
         // Update Customer info
         //
         me.updateBadges(metaData['badges']);

         customer = me.updateAccountInfo(metaData, metaData['account_info']);
         //
         // Short Cut to earn points, customer object wil be given by server
         //
         // Find venueId from metaData or from DataStore
         var new_venueId = metaData['venue_id'] || 0;
         // Find venue from DataStore or current venue info
         venue = viewport.getVenue();

         if (Ext.isDefined(metaData['venue']))
         {
            venue = Ext.create('Genesis.model.Venue', metaData['venue']);
            var controller = me.getApplication().getController('client' + '.Checkins');
            //
            // Winners' Circle'
            //
            var prizeJackpotsCount = metaData['prize_jackpots'];
            if (prizeJackpotsCount >= 0)
            {
               console.debug("Prize Jackpots won by customers at this merchant this month - [" + prizeJackpotsCount + "]");
               venue.set('prize_jackpots', prizeJackpotsCount);
            }

            console.debug("customer_id - " + customer.getId() + '\n' + //
            "merchant_id - " + venue.getMerchant().getId() + '\n' + //
            //"venue - " + Ext.encode(metaData['venue']));
            '');
            controller.fireEvent('setupCheckinInfo', 'checkin', venue, customer, metaData);
         }
         else
         {
            //
            // Winners' Circle'
            //
            var prizeJackpotsCount = metaData['prize_jackpots'];
            if (prizeJackpotsCount >= 0)
            {
               console.debug("Prize Jackpots won by customers at this merchant this month - [" + prizeJackpotsCount + "]");
               venue.set('prize_jackpots', prizeJackpotsCount);
            }
         }

         //
         // Update Customer Rewards (Rewards Redemptions)
         //
         me.updateRewards(metaData['rewards']);
         //
         // Update Customer Rewards (Prizes Redemptions)
         //
         me.updatePrizes(metaData['prizes']);
         //
         // Update News
         // (Make sure we are after Redemption because we may depend on it for rendering purposes)
         //
         me.updateNews(metaData['newsfeed']);
      }
      catch(e)
      {
         console.debug("updateMetaDataInfo Exception - " + e);
      }

      return customer;
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onActivate : function()
   {
      var me = this, file = Ext.Loader.getPath("Genesis") + "/store/" + ((!merchantMode) ? 'mainClientPage' : 'mainServerPage') + '.json', path = "", db = Genesis.db.getLocalDB();
      var request = new XMLHttpRequest(), enablePrizes = db['enablePrizes'], enableChallenges = db['enableChallenges'];

      if (( typeof (device) != 'undefined') && device.uuid)
      {
         if (Ext.os.is('iOS') || Ext.os.is("BlackBerry"))
         {
            path = "";
         }
         else if (Ext.os.is('Android'))
         {
            path = "file:///android_asset/www/";
            if (Genesis.fn.isNative() && (_build == 'MobileClientNative'))
            {
               path += "launch/";
            }
         }
      }
      file = path + file;

      console.log("Loading MainPage Store ...");
      //console.debug("Creating Request [" + path + file + "]");
      request.onreadystatechange = function()
      {
         if (request.readyState == 4)
         {
            if (request.status == 200 || request.status == 0)
            {
               try
               {
                  var text = request.responseText.replace(me.mainPageStorePathToken, Genesis.constants._iconPathCommon).replace(me.mainPageStoreRelPathToken, Genesis.constants.relPath());
                  var response = Ext.decode(text), data = response.data;

                  for (var i = 0; i < data.length; i++)
                  {
                     var item = data[i];
                     var index = data.indexOf(item);

                     if (merchantMode)
                     {
                        if (Ext.isDefined(enablePrizes))
                        {
                           if (!enablePrizes)
                           {
                              if (item['id'] == 'redeemPrizes')
                              {
                                 data.splice(index, 1);
                                 if (index == i)
                                 {
                                    i--;
                                 }
                              }
                           }
                        }
                        if (Ext.isDefined(enableChallenges))
                        {
                           if (!enableChallenges)
                           {
                              if (item['id'] == 'challenges')
                              {
                                 data.splice(index, 1);
                                 if (index == i)
                                 {
                                    i--;
                                 }
                              }
                           }
                        }
                     }
                     //
                     // MobileClient do not support Referrals and Transfers
                     //
                     else if (_build == 'MobileWebClient')
                     {
                        switch (item['id'])
                        {
                           case 'transfer':
                           case 'referrals' :
                           {
                              data.splice(index, 1);
                              if (index == i)
                              {
                                 i--;
                              }
                              break;
                           }
                        }
                     }
                  }
                  Ext.StoreMgr.get('MainPageStore').setData(response.data);
                  console.log("Loaded MainPage Store ...");
               }
               catch(e)
               {
                  console.log("Exception = " + e);
               }
            }
         }
      };
      request.open("GET", file, true);
      request.send(null);
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onButtonTap : function(b, e, eOpts)
   {
      this.self.playSoundFile(this.sound_files['clickSound']);
   },
   onBackButtonTap : function(b, e, eOpts)
   {
      this.popView();
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   resetView : function()
   {
      var me = this;
      var vport = me.getViewport();
      //
      // Remove All Views
      //
      me.viewStack = [];
      me.getApplication().getHistory().setActions([]);
      //
      // Remove all internal buffered views
      //
      //delete vport._activeItem;
   },
   pushView : function(view, animation)
   {
      if (!view)
      {
         return;
      }

      var me = this;

      animation = Ext.apply(animation,
      {
         reverse : false
      });
      var lastView = (me.viewStack.length > 1) ? me.viewStack[me.viewStack.length - 2] : null;

      //
      // Refresh view
      //
      if ((me.viewStack.length > 0) && (view == me.viewStack[me.viewStack.length - 1]['view']))
      {
      }
      //
      // Pop view
      //
      else if (lastView && (lastView['view'] == view))
      {
         me.popView();
      }
      //
      // Push view
      //
      else
      {
         //
         // Remember what animation we used to render this view
         //
         var actions = me.getApplication().getHistory().getActions();
         me.viewStack.push(
         {
            view : view,
            animation : animation,
            url : actions[actions.length - 1].getUrl()
         });
         me.getViewport().animateActiveItem(view, animation);
      }
      /*
       console.debug("pushView - length[" + me.viewStack.length + "]");
       for (var i = 0; i < me.viewStack.length; i++)
       {
       if (me.viewStack[i]['view'])
       {
       console.debug("pushView - [" + me.viewStack[i]['view']._itemId + "]")
       }
       else
       {
       console.debug("pushView - [" + Ext.encode(me.viewStack[i]['view']) + "]")
       }
       }
       */
   },
   silentPopView : function(num)
   {
      var me = this;
      num = Math.min(me.viewStack.length, num);
      var actions = me.getApplication().getHistory().getActions();

      if ((me.viewStack.length > 0) && (num > 0))
      {
         while (num-- > 0)
         {
            var lastView = me.viewStack.pop();
            actions.pop();
            //
            // Viewport will automatically detect not to delete current view
            // until is no longer the activeItem
            //
            //me.getViewport().remove(lastView['view']);
         }
      }
   },
   popView : function()
   {
      var me = this;
      var actions = me.getApplication().getHistory().getActions();

      if (me.viewStack.length > 1)
      {
         /*
          console.debug("popView - length[" + me.viewStack.length + "]");
          for (var i = 0; i < me.viewStack.length; i++)
          {
          if (me.viewStack[i]['view'])
          {
          console.debug("popView - [" + me.viewStack[i]['view']._itemId + "]")
          }
          else
          {
          console.debug("popView - [" + Ext.encode(me.viewStack[i]['view']) + "]")
          }
          }
          */
         var lastView = me.viewStack.pop();
         var currView = me.viewStack[me.viewStack.length - 1];
         /*
          if (lastView)
          {
          console.debug("popView - lastView[" + lastView['view']._itemId + "]");
          }
          console.debug("popView - currView[" + currView['view']._itemId + "]")
          */
         if (!me.popViewInProgress)
         {
            me.popViewInProgress = true;
            //Ext.defer(function()
            {
               actions.pop();
               //
               // Recreate View if the view was destroyed for DOM memory optimization
               //
               if (currView['view'].isDestroyed)
               {
                  currView['view'] = Ext.create(currView['view'].alias[0]);
                  //console.debug("Recreated View [" + currView['view']._itemId + "]")
               }

               //
               // Update URL
               //
               me.getApplication().getHistory().setToken(currView['url']);
               window.location.hash = currView['url'];

               me.getViewport().animateActiveItem(currView['view'], Ext.apply(lastView['animation'],
               {
                  reverse : true
               }));
            }
            //, 1, me);
         }
      }
      else
      {
         if (!me.getLoggedIn || me.getLoggedIn())
         {
            me.goToMerchantMain(true);
         }
         else
         {
            me.redirectTo('login');
         }
      }
   },
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   init : function(app)
   {
      var me = this;

      //
      // Initialize global constants
      //
      Genesis.constants.init();

      me.callParent(arguments);

      if (Ext.isDefined(window.device))
      {
         console.debug(//
         "\n" + "device.platform - " + device.platform + //
         "\n" + "device.uuid - " + device.uuid + //
         "\n" + "Browser EngineVersion - " + Ext.browser.engineVersion + //
         "");
      }

      me.on(
      {
         'viewanimend' : 'onViewAnimEnd',
         'baranimend' :
         {
            buffer : 0.5 * 1000,
            fn : 'onBarAnimEnd'
         },
         'pushview' : 'pushView',
         'silentpopview' : 'silentPopView',
         'popview' : 'popView',
         'resetview' : 'resetView'
      });

      Ext.regStore('LicenseStore',
      {
         model : 'Genesis.model.frontend.LicenseKey',
         autoLoad : false
      });

      me.last_click_time = new Date().getTime();
      //
      // Prevent Strange Double Click problem ...
      //
      document.addEventListener('click', function(e)
      {
         var click_time = e['timeStamp'];
         if (click_time && (click_time - me.last_click_time) < 1000)
         {
            e.stopPropagation();
            e.preventDefault();
            return false;
         }
         me.last_click_time = click_time;
         return true;
      });
      console.log("ViewportBase Init");
   },
   openMainPage : Ext.emptyFn,
   loadSoundFile : function(tag, sound_file, type)
   {
      var me = this, ext = '.' + (sound_file.split('.')[1] || 'mp3');
      sound_file = sound_file.split('.')[0];

      if (Genesis.fn.isNative())
      {
         var callback = function()
         {
            switch(type)
            {
               case 'FX' :
               {
                  LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, function()
                  {
                     console.debug("loaded " + sound_file);
                  }, function(err)
                  {
                     console.debug("Audio Error: " + err);
                  });
                  break;
               }
               case 'Audio' :
               {
                  LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, 3, function()
                  {
                     console.debug("loaded " + sound_file);
                  }, function(err)
                  {
                     console.debug("Audio Error: " + err);
                  });
                  break;
               }
            }
         };
         switch(type)
         {
            case 'Media' :
            {
               sound_file = new Media((Ext.os.is('Android') ? '/android_asset/www/' : '') + Genesis.constants.relPath() + 'resources/audio/' + sound_file + ext, function()
               {
                  me.sound_files[tag].successCallback();
               }, function(err)
               {
                  me.sound_files[tag].successCallback();
                  console.debug("Audio Error: " + err);
               });
               break;
            }
            default :
               LowLatencyAudio['unload'](sound_file, callback, callback);
               break;
         }
      }

      me.sound_files[tag] =
      {
         name : sound_file,
         type : type
      };
   }
});
Ext.define('Genesis.controller.RedeemBase',
{
   extend : 'Genesis.controller.ControllerBase',
   inheritableStatics :
   {
   },
   xtype : 'redeemBaseCntlr',
   config :
   {
      models : ['Customer', 'PurchaseReward', 'CustomerReward'],
      listeners :
      {
         'redeemitem' : 'onRedeemItem'
      }
   },
   controllerType : 'redemption',
   redeemSuccessfulMsg : 'Transaction Complete',
   redeemFailedMsg : 'Transaction Failed',
   init : function()
   {
      var me = this;
      Ext.regStore(me.getRenderStore(),
      {
         model : 'Genesis.model.Customer',
         autoLoad : false
      });
      Ext.regStore(me.getRedeemStore(),
      {
         model : 'Genesis.model.CustomerReward',
         autoLoad : false,
         pageSize : 5,
         sorters : [
         {
            property : 'points',
            direction : 'ASC'
         }],
         listeners :
         {
            scope : me,
            'metachange' : function(store, proxy, eOpts)
            {
               //
               // Prevent Incorrect Store from calling MetaData Handler
               //
               if (store.isLoading())
               {
                  me.fireEvent('updatemetadata', proxy.getReader().metaData);
               }
            }
         }
      });

      this.callParent(arguments);
      console.log("RedeemBase Init");
      //
      // Prelod Page
      //
      //
      // Preloading Pages to memory
      //
      Ext.defer(function()
      {
         me.getRedeemItem();
         me.getRedemptions();
      }, 1, me);
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onCreateView : function(activeItem)
   {
      var me = this;
      activeItem.item = me.redeemItem;
   },
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         var monitors = this.getEventDispatcher().getPublishers()['elementSize'].monitors;
         var list = activeItem.query('list[tag='+activeItem.getListCls()+']')[0];

         console.debug("Refreshing RenderStore ...");
         var panel = activeItem.query('dataview[tag=ptsEarnPanel]')[0];
         if (panel)
         {
            panel.refresh();
         }
         monitors[list.container.getId()].forceRefresh();
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var page = me.getRedemptions();

      var viewport = me.getViewPortCntlr();
      var customer = viewport.getCustomer();
      var rstore = Ext.StoreMgr.get(me.getRenderStore());
      //
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      me.exploreMode = !cvenue || (cvenue && (cvenue.getId() != venue.getId()));

      // Update Customer info
      if (customer != rstore.getRange()[0])
      {
         rstore.setData(customer);
      }
      //activeItem.createView();
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
         //activeItem.getInnerItems()[i].setVisibility(false);
      }
      console.debug("ReedeemBase: onActivate");

      //
      // Call Mixins
      //
      if (me.mixins && me.mixins.redeemBase)
      {
         me.mixins.redeemBase.onActivate.apply(me, arguments);
      }
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      console.debug("ReedeemBase: onDeactivate");
   },
   onItemListSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onItemListDisclose(d, model, null, null, null, null, null, false);
      return false;
   },
   onItemListDisclose : function(list, record, target, index, e, eOpts, dummy, supressClick)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var _showItem = function()
      {
         //
         // No Customer Account, then that means we show the item to the user regardless
         //
         if (viewport.getCustomer())
         {
            var totalPts = viewport.getCustomer().get(me.getPtsProperty());
            var points = record.get('points');
            if (points > totalPts)
            {
               Ext.device.Notification.show(
               {
                  title : 'Redeem' + me.getTitle(),
                  message : me.needPointsMsg(points - totalPts),
                  buttons : ['Dismiss']
               });
               return;
            }
         }
         me.fireEvent('showredeemitem', record);
      };

      if (!supressClick)
      {
         me.self.playSoundFile(viewport.sound_files['clickSound']);
      }
      switch (me.getBrowseMode())
      {
         case 'redeemBrowse' :
         {
            if (!me.exploreMode)
            {
               _showItem();
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Warning',
                  message : me.checkinFirstMsg,
                  buttons : ['Dismiss']
               });
            }
            break;
         }
         case 'redeemBrowseSC' :
         {
            _showItem();
            break;
         }
      }
      return true;
   },
   // --------------------------------------------------------------------------
   // Handler Functions
   // --------------------------------------------------------------------------
   onRedeemItemCreateView : function(activeItem)
   {
      var me = this;
      var view = me.getRedeemMainPage();

      view.item = me.redeemItem;
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, tbbar = activeItem.query('titlebar')[0], store = Ext.StoreMgr.get(me.getRedeemStore());

      me.getSCloseBB()[(store.getAllCount() == 1) ? 'hide' : 'show']();
      if (me.getSBackBB)
      {
         me.getSBackBB()[(store.getAllCount() == 1) ? 'show' : 'hide']();
      }

      tbbar.setTitle(me.getTitle());
      tbbar.removeCls('kbTitle');

      console.debug("Base onRedeemItemActivate - Updated RewardItem View!");
   },
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      if (me.getSDoneBtn())
      {
         me.getSDoneBtn()['hide']();
      }
      window.plugins.proximityID.stop();
      console.debug("onRedeemItemDeactivate - Done with RewardItem View!");
   },

   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;
      var view = me.getRedeemMainPage();

      if (Genesis.fn.isNative())
      {
         if (Ext.os.is('iOS'))
         {
         }
         else if (Ext.os.is('Android'))
         {
         }
         else if (Ext.os.is('BlackBerry'))
         {
         }
      }
      if (view.isPainted() && !view.isHidden())
      {
         me.popView();
      }
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   onShowItemQRCode : function(timeout, qrcode)
   {
      var me = this;
      var _qrcode;
      var title = 'Redeem ' + me.getTitle();

      /*
       console.debug("\n" + //
       "Encrypted Code :\n" + qrcode + "\n" + //
       "Encrypted Code Length: " + qrcode.length);
       */
      _qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      if (_qrcode[0])
      {
         var dom = Ext.DomQuery.select('div.itemPoints',me.getRedeemItem().element.dom)[0];
         if (me.getSRedeemBtn())
         {
            me.getSRedeemBtn().hide();
         }
         if (me.getSDoneBtn())
         {
            me.getSDoneBtn()['show']();
         }
         me.getSCloseBB().hide();
         if (dom)
         {
            Ext.fly(dom).addCls('x-item-hidden');
         }

         me.fireEvent('refreshQRCode', _qrcode);

         Ext.Viewport.setMasked(null);
         Ext.device.Notification.show(
         {
            title : title,
            message : me.showQrCodeMsg,
            buttons : ['OK']
         });
         Ext.device.Notification.vibrate();
      }
      else
      {
         console.debug("onShowItemQRCode - QR Code encoding Error");
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemBrowsePage : function()
   {
      this.openPage('redeemBrowse');
      if (this.getCloseBtn())
      {
         this.getCloseBtn().show();
         this.getBackBtn().hide();
      }
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getRedeemMainPage : function()
   {
      var me = this;
      var page = null;
      switch (me.getRedeemMode())
      {
         case 'authReward' :
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['coverUp']);
            page = me.getRedeemItem();
            break;
         }
      }

      return page;
   },
   getBrowseMainPage : function()
   {
      var me = this;
      var page = null;
      switch (me.getBrowseMode())
      {
         case 'redeemBrowseSC' :
         {
            me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['coverUp']);
            break;
         }
         case 'redeemBrowse' :
         default:
            me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['cover']);
            break;
      }

      var store = Ext.StoreMgr.get(me.getRedeemStore());
      //
      // There's only one item to redeem, autoselect item
      //
      if (store.getAllCount() == 1)
      {
         me.onItemListDisclose(null, store.first(), null, null, null, null, null, true);
      }
      else
      {
         page = me.getRedemptions();
      }

      return page;
   },
   openPage : function(subFeature)
   {
      var me = this;

      if (subFeature.match(/Browse/))
      {
         me.setBrowseMode(subFeature);
         me.pushView(me.getBrowseMainPage());
      }
      else
      {
         me.setRedeemMode(subFeature);
         me.pushView(me.getRedeemMainPage());
      }
   },
   isOpenAllowed : function()
   {
      // VenueId can be found after the User checks into a venue
      //return ((this.getViewPortCntlr().getVenue()) ? true : "You need to Explore or Check-in to a Venue first");
      return true;
   }
});
Ext.define('Genesis.controller.RewardRedemptionsBase',
{
   extend : 'Genesis.controller.RedeemBase',
   requires : ['Ext.data.Store'],
   inheritableStatics :
   {
   },
   xtype : 'rewardRedemptionsBaseCntlr',
   controllerType : 'redemption',
   config :
   {
      redeeemSuccessfulMsg : 'Reward selected has been successfully redeemed!',
      redeemInfoMsg : 'Getting the Redemptions List ...',
      redeemPopupTitle : 'Redeem Rewards',
      browseMode : 'redeemBrowse',
      redeemMode : 'redeemReward',
      renderStore : 'RedemptionRenderCStore',
      redeemStore : 'RedeemStore',
      redeemUrl : 'setGetRewardsURL',
      redeemPath : 'redeemBrowseRewardsSC',
      ptsProperty : 'points',
      title : 'Rewards',
      routes :
      {
         // Browse Redemption Page
         'redemptions' : 'redeemBrowsePage',
         //Shortcut to choose venue to redeem rewards
         'redeemRewardsChooseSC' : 'redeemChooseSCPage',
         //Shortcut to visit Merchant Account for the Venue Page
         'redeemBrowseRewardsSC' : 'redeemBrowseSCPage',
         'redeemReward' : 'redeemItemPage'
      },
      refs :
      {
      },
      control :
      {
         redemptions :
         {
            createView : 'onCreateView',
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         redemptionsList :
         {
            select : 'onItemListSelect',
            disclose : 'onItemListDisclose'
         },
         redeemItem :
         {
            createView : 'onRedeemItemCreateView',
            showView : 'onRedeemItemShowView',
            activate : 'onRedeemItemActivate',
            deactivate : 'onRedeemItemDeactivate',
            redeemItemTap : 'onRedeemItemTap'
         }
      }
   },
   xtype : 'redemptionsBaseCntlr',
   checkinFirstMsg : 'Please Check-In before redeeming Rewards',
   init : function()
   {
      var me = this;
      me.callParent(arguments);

      //
      // Redeem Rewards
      //
      me.on(
      {
         'showredeemitem' : 'onShowRedeemItem',
         'showQRCode' : 'onShowItemQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
      });
      console.log("RewardRedemptionsBase Init");
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemMainPage();
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getInnerItems()[0];

      var info = item.query('component[tag=info]')[0];
      info.hide();

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img', photo.element.dom)[0]);
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.5),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.5)
      });
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
   },
   // --------------------------------------------------------------------------
   // Redemption Page
   // --------------------------------------------------------------------------
   onShowRedeemItem : function(redeemItem)
   {
      var me = this;

      //
      // Show prize on redeemItem Container
      //
      me.redeemItem = redeemItem;
      me.redirectTo('redeemReward');
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemItemPage : function()
   {
      this.openPage('redeemReward');
   }
});
Ext.define('Genesis.controller.PrizeRedemptionsBase',
{
   extend : 'Genesis.controller.RedeemBase',
   requires : ['Ext.data.Store'],
   inheritableStatics :
   {
   },
   xtype : 'prizeRedemptionsCntlr',
   controllerType : 'prize',
   config :
   {
      redeemInfoMsg : 'Getting the Prizes List ...',
      redeemPopupTitle : 'Redeem Prizes',
      redeeemSuccessfulMsg : 'Prize selected has been successfully redeemed!',
      timeoutPeriod : 10,
      minPrizePts : 1,
      browseMode : 'redeemBrowse',
      redeemMode : 'redeemPrize',
      renderStore : 'PrizeRenderCStore',
      redeemStore : 'PrizeStore',
      redeemPointsFn : 'setRedeemPrizePointsURL',
      redeemUrl : 'setGetPrizesURL',
      ptsProperty : 'prize_points',
      title : 'Prizes',
      routes :
      {
         // Browse Prizes Page
         'prizes' : 'redeemBrowsePage',
         //'prize' : 'prizePage',
         'redeemPrize' : 'redeemItemPage'
      },
      refs :
      {
      },
      control :
      {
         redemptions :
         {
            createView : 'onCreateView',
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         redemptionsList :
         {
            select : 'onItemListSelect',
            disclose : 'onItemListDisclose'
         },
         redeemItem :
         {
            createView : 'onRedeemItemCreateView',
            showView : 'onRedeemItemShowView',
            activate : 'onRedeemItemActivate',
            deactivate : 'onRedeemItemDeactivate',
            redeemItemTap : 'onRedeemItemTap'
         }
      },
      listeners :
      {
      }
   },
   scanPlayTitle : 'Spin and Play',
   init : function()
   {
      var me = this;
      me.callParent(arguments);
      //
      // Redeem Prize
      //
      me.on(
      {
         'showredeemitem' : 'onShowRedeemItem',
         //Redeem Prize broadcast to Social Media
         'showredeemprize' : 'onShowRedeemPrize',
         'showQRCode' : 'onShowItemQRCode'
      });

      console.log("Prize Redemptions Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onShowRedeemItem : function(redeemItem)
   {
      var me = this;

      //
      // Show prize on redeemItem Container
      //
      me.redeemItem = redeemItem;
      me.redirectTo('redeemPrize');
   },
   onShowRedeemPrize : function(prize, reward_info, viewsPopLength)
   {
      var me = this;
      var info = reward_info;
      //var redeemItem = me.redeemItem = prize;

      me.redeemItem = prize
      if (viewsPopLength > 0)
      {
         console.debug("Removing Last " + viewsPopLength + " Views from History ...");
         me.silentPopView(viewsPopLength);
      }

      me.redirectTo('redeemPrize');
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, tbbar = activeItem.query('titlebar')[0];

      me.getSCloseBB()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      me.getSBackBB()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();
      //me.getSBB().hide();
      tbbar.setTitle(me.getTitle());
      tbbar.removeCls('kbTitle');
      //
      // Show redeem button on Toolbar
      //
      if (me.getSRedeemBtn())
      {
         me.getSRedeemBtn()['show']();
      }
      console.debug("Base onRedeemItemActivate - Updated RewardItem View.");
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemItemPage : function()
   {
      this.setTitle('Prizes');
      this.openPage('redeemPrize');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
Ext.define('Genesis.controller.SettingsBase',
{
   extend : 'Genesis.controller.ControllerBase',
   inheritableStatics :
   {
   },
   xtype : 'settingsBaseCntlr',
   config :
   {
      termsOfServiceTitle : 'Term of Service',
      privacyTitle : 'Privacy',
      aboutUsTitle : 'About Us',
      routes :
      {
         'aboutus' : 'documentPage',
         'privacy' : 'documentPage',
         'termsOfUse' : 'multipartDocumentPage',
         'settings' : 'openSettingsPage'
      },
      refs :
      {
         documentPage :
         {
            selector : 'documentview',
            autoCreate : true,
            xtype : 'documentview'
         },
         multipartDocumentPage :
         {
            selector : 'multipartdocumentview',
            autoCreate : true,
            xtype : 'multipartdocumentview'
         }
      }
   },
   termsLoaded : false,
   privacyLoaded : false,
   aboutUsLoaded : false,
   init : function()
   {
      this.callParent(arguments);
      this.getMultipartDocumentPage();
      this.getDocumentPage();

      console.log("Settings Base Init");
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onTermsTap : function(b, e)
   {
      var me = this, flag = 0, viewport = me.getViewPortCntlr(), responses = [], page = me.getMultipartDocumentPage();

      page.query('title')[0].setTitle(me.getTermsOfServiceTitle());
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (!me.termsLoaded)
      {
         var _exit = function()
         {
            for (var i = 0; i < responses.length; i++)
            {
               page.setHtml(i, responses[i].cardConfig);
            }
            me.redirectTo('termsOfUse');
            me.termsLoaded = true;
         }

         Ext.Ajax.request(
         {
            async : true,
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'term_of_service.htm',
            callback : function(option, success, response)
            {
               if (success || (response.status == 0))
               {
                  responses[0] = response;
                  response.cardConfig =
                  {
                     title : 'Terms of Use',
                     html : response.responseText
                  }
                  if ((flag |= 0x01) == 0x11)
                  {
                     _exit();
                  }
               }
               else
               {
                  console.debug("Error Loading Term of Service Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
         Ext.Ajax.request(
         {
            async : true,
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'program_rules.htm',
            callback : function(option, success, response)
            {
               if (success || (response.status == 0))
               {
                  responses[1] = response;
                  response.cardConfig =
                  {
                     title : 'Program Rules',
                     html : response.responseText
                  }
                  if ((flag |= 0x10) == 0x11)
                  {
                     _exit();
                  }
               }
               else
               {
                  console.debug("Error Loading Program Rules Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
      }
      else
      {
         me.redirectTo('termsOfUse');
      }
   },
   onPrivacyTap : function(b, e)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var page = me.getDocumentPage();

      page.query('title')[0].setTitle(me.getPrivacyTitle());
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (!me.privacyLoaded)
      {
         Ext.Ajax.request(
         {
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'privacy.htm',
            callback : function(option, success, response)
            {
               if (success || (response.status == 0))
               {
                  page.setHtml(response.responseText);
                  me.redirectTo('privacy');
                  me.privacyLoaded = true;
               }
               else
               {
                  console.debug("Error Loading Privacy Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
      }
      else
      {
         me.redirectTo('privacy');
      }
   },
   onAboutUsTap : function(b, e)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var page = me.getDocumentPage();

      page.query('title')[0].setTitle(me.getAboutUsTitle());
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (me.aboutUsLoaded)
      {
         Ext.Ajax.request(
         {
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'about_us.htm',
            callback : function(option, success, response)
            {
               if (success || (response.status == 0))
               {
                  page.setHtml(response.responseText);
                  me.redirectTo('aboutUs');
                  me.aboutUsLoaded = true;
               }
               else
               {
                  console.debug("Error Loading About US Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
      }
      else
      {
         me.redirectTo('aboutUs');
      }
   },
   onDeviceReset : function(b, e)
   {
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : Ext.emptyFn,
   multipartDocumentPage : function()
   {
      this.openPage('multipartDocument');
   },
   documentPage : function()
   {
      this.openPage('document');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;
      switch(subFeature)
      {
         case 'settings' :
         {
            page = me.getSettingsPage();
            me.setAnimationMode(me.self.animationMode['cover']);
            break;
         }
         case 'multipartDocument' :
         {
            page = me.getMultipartDocumentPage();
            me.setAnimationMode(me.self.animationMode['slide']);
            break;
         }
         case 'document' :
         {
            page = me.getDocumentPage();
            me.setAnimationMode(me.self.animationMode['slide']);
            break;
         }
      }
      me.pushView(page);
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
Ext.define('Genesis.controller.server.mixin.RedeemBase',
{
   extend : 'Ext.mixin.Mixin',
   inheritableStatics :
   {
   },
   config :
   {
      closeBtn : null,
      sDoneBtn : null,
      sRedeemBtn : null
   },
   phoneIdMaxLength : 10,
   redeemPtsConfirmMsg : 'Please confirm to submit',
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Tag Tab
   // --------------------------------------------------------------------------
   onEnterPhoneNum : function()
   {
      var me = this, container = me.getRedeemItemCardContainer();
      container.setActiveItem(1);
   },
   onTagIdBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, value = b.getText();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      switch (value)
      {
         case 'AC' :
         {
            phoneIdField.reset();
            break;
         }
         default :
            if (phoneIdFieldLength < me.phoneIdMaxLength)
            {
               phoneId += value;
               phoneIdField.setValue(phoneId);
            }
            break;
      }
   },
   onTagItTap : function()
   {
      var me = this, viewport = me.getViewPortCntlr(), container = me.getRedeemItemCardContainer();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      if (phoneIdFieldLength == me.phoneIdMaxLength)
      {
         me.self.playSoundFile(viewport.sound_files['nfcEnd']);
         me.onRedeemItemTap(null);

         me.onNfc(
         {
            id : null,
            result :
            {
               'phoneID' : phoneId
            }
         });
      }
      else
      {
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         Ext.device.Notification.show(
         {
            title : me.getRedeemPopupTitle(),
            message : me.invalidPhoneIdFormatMsg(me.phoneIdMaxLength),
            buttons : ['Dismiss']
         });
      }
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.redeemItemFn(
      {
         data : me.self.encryptFromParams(
         {
            'uid' : (nfcResult) ? nfcResult.id : null,
            'tag_id' : (nfcResult) ? nfcResult.result['tagID'] : null,
            'phone_id' : (nfcResult) ? nfcResult.result['phoneID'] : null,
            'expiry_ts' : new Date().addHours(3).getTime()
         }, 'reward')
      }, true);
   },
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemItem();
      var item = view.getInnerItems()[0];

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img', photo.element.dom)[0]);
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.25),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.25)
      });
   },
   redeemItemCb : function(b)
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.popUpInProgress = false;
      me._actions.hide();
      viewport.setActiveController(null);
      clearInterval(me.scanTask);
      me.scanTask = null;
      //
      // Stop receiving ProximityID
      //
      window.plugins.proximityID.stop();

      if (b && (b.toLowerCase() == 'manual'))
      {
         Ext.Viewport.setMasked(null);
         me.onEnterPhoneNum();
      }
      else if (!me.dismissDialog)
      {
         Ext.Viewport.setMasked(null);
         me.onDoneTap();
      }
   },
   onRedeemItem : function(btn, venue, view)
   {
      var me = this;
      var viewport = me.getViewPortCntlr(), item = view.query("container[tag=redeemItemContainer]")[0].getInnerItems()[0];
      var venueId = (venue) ? venue.getId() : 0;
      var storeName = me.getRedeemStore(), store = Ext.StoreMgr.get(storeName);
      var params =
      {
         version : Genesis.constants.serverVersion,
         venue_id : venueId
      }
      var message = me.lookingForMobileDeviceMsg();
      var proxy = store.getProxy();

      me.dismissDialog = false;
      me.redeemItemFn = function(p, closeDialog)
      {
         me.dismissDialog = closeDialog;
         me.redeemItemCb();
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         //Ext.device.Notification.dismiss();
         //
         // Update Server
         //
         console.debug("Updating Server with Redeem information ... dismissDialog(" + me.dismissDialog + ")");

         CustomerReward[me.getRedeemPointsFn()](item.getData().getId());

         store.load(
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : Ext.apply(params, p),
            callback : function(records, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : me.getRedeemPopupTitle(),
                     message : me.redeemSuccessfulMsg,
                     buttons : ['OK'],
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
               else
               {
                  //proxy._errorCallback = Ext.bind(me.onDoneTap, me);
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : me.getRedeemPopupTitle(),
                     message : me.redeemFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsCallbackFn();
                        me.onDoneTap();
                     }
                  });
               }
            }
         });
      };

      if (!btn)
      {
         return;
      }

      if (!me._actions)
      {
         me._actions = Ext.create('Genesis.view.widgets.PopupItemDetail',
         {
            iconType : 'prizewon',
            icon : 'rss',
            //cls : 'viewport',
            title : message,
            buttons : [
            {
               text : me.mobilePhoneInputMsg,
               ui : 'action',
               handler : Ext.bind(me.redeemItemCb, me, ['manual'])
            },
            {
               text : 'Cancel',
               ui : 'cancel',
               handler : Ext.bind(me.redeemItemCb, me, ['cancel'])
            }]
         });
         Ext.Viewport.add(me._actions);
      }
      viewport.popUpInProgress = true;
      me._actions.show();

      me.identifiers = null;
      me.getLocalID(function(idx)
      {
         me.identifiers = idx;
         me.redeemItemFn(
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : me.identifiers['localID'],
               'expiry_ts' : new Date().addHours(3).getTime()
            }, 'reward')
         }, true);
      }, function()
      {
         me._actions.hide();
         me.onDoneTap();
      }, Ext.bind(me.onRedeemItem, me, arguments));
      viewport.setActiveController(me);
   },
   onRedeemItemTap : function(b, e, eOpts, eInfo)
   {
      var me = this, btn = b, viewport = me.getViewPortCntlr(), venue = viewport.getVenue();
      var view = me.getRedeemMainPage(), title = view.query('titlebar')[0].getTitle();

      //console.debug("onRedeemItemTap - Mode[" + me.getRedeemMode() + "]");
      switch (me.getRedeemMode())
      {
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            me.fireEvent('redeemitem', btn, venue, view);
            break;
         }
         //
         // Cancel Challenge
         //
         case 'authReward' :
         {
            me.popView();
            break;
         }
      }
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, container = me.getRedeemItemCardContainer();
      container.setActiveItem(0);

      console.debug("Server ReedeemBase: onActivate");
   },
   onRedeemItemCardContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getRedeemItemCardContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'redeemItemContainer' :
         {
            animation.setReverse(true);
            break;
         }
         case 'phoneId' :
         {
            me.getPhoneId().reset();
            animation.setReverse(true);
            break;
         }
      }
      console.debug("Prizes Redeem ContainerActivate Called.");
   },
   onRedeemItemShowView : function(activeItem)
   {
      var me = this;
      console.debug("onRedeemItemShowView - RedeemMode[" + me.getRedeemMode() + "]");
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      //
      // In Redeem Mode
      //
      me.getRedeemItemButtonsContainer()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      //
      // In Challendge
      //
      me.getAuthText()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();

      console.debug("RewardItem View - Updated RewardItem View.");
   }
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
Ext.define('Genesis.controller.server.Settings',
{
   extend : 'Genesis.controller.SettingsBase',
   inheritableStatics :
   {
   },
   xtype : 'serverSettingsCntlr',
   config :
   {
      licenseTitle : 'Refresh License Key',
      routes :
      {
      },
      refs :
      {
         //
         // Settings Page
         //
         settingsPage :
         {
            selector : 'serversettingspageview',
            autoCreate : true,
            xtype : 'serversettingspageview'
         },
         utilitiesContainer : 'serversettingspageview fieldset[tag=utilities]',
         merchantDevice : 'serversettingspageview fieldset textfield[tag=merchantDevice]',
         deviceID : 'serversettingspageview fieldset textfield[tag=uuid]',
         //
         // Create Tag Page
         //
         createTagId : 'servertagcreatepageview calculator[tag=createTagId] textfield[name=amount]',
         createTagBtn : 'servertagcreatepageview container[tag=bottomButtons] button[tag=createTagId]',
         createTagPage :
         {
            selector : 'servertagcreatepageview',
            autoCreate : true,
            xtype : 'servertagcreatepageview'
         }
      },
      control :
      {
         //
         // Settings Page
         //
         'serversettingspageview listfield[name=resetdevice]' :
         {
            clearicontap : 'onDeviceResetTap'
         },
         'serversettingspageview listfield[name=license]' :
         {
            clearicontap : 'onRefreshLicenseTap'
         },
         'serversettingspageview listfield[name=terms]' :
         {
            clearicontap : 'onTermsTap'
         },
         'serversettingspageview listfield[name=privacy]' :
         {
            clearicontap : 'onPrivacyTap'
         },
         'serversettingspageview listfield[name=aboutus]' :
         {
            clearicontap : 'onAboutUsTap'
         },
         settingsPage :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'serversettingspageview listfield[tag=createTag]' :
         {
            clearicontap : 'onCreateTagPageTap'
         },
         //
         // Create Tag Page
         //
         'servertagcreatepageview calculator[tag=createTagId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         createTagBtn :
         {
            tap : 'onCreateTagTap'
         },
         createTagPage :
         {
            activate : 'onCreateTagActivate',
            deactivate : 'onCreateTagDeactivate'
         }
      },
      listeners :
      {
      }
   },
   tagIdLength : 8,
   proceedToUpdateLicenseMsg : 'Please confirm to proceed with License Update',
   proceedToResetDeviceeMsg : 'Please confirm to Reset Device',
   noLicenseKeyScannedMsg : 'No License Key was found!',
   createTagMsg : function()
   {
      return 'To program the TAG ID,' + Genesis.constants.addCRLF() + 'Please swipe tag.';
   },
   invalidTagMsg : function()
   {
      var me = this;
      return "TagID must be of a valid length[" + me.tagIdLength + "]";
   },
   licenseKeySuccessMsg : function()
   {
      return 'License Key Updated for ' + Genesis.constants.addCRLF() + '[' + Genesis.fn.getPrivKey('venue') + ']';
   },
   updateLicenseKey : function()
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.refreshLicenseKey(function()
      {
         Ext.device.Notification.show(
         {
            title : 'License Key Updated!',
            message : me.licenseKeySuccessMsg(),
            buttons : ['Restart'],
            callback : function()
            {
               //
               // Restart because we can't continue without Console Setup data
               //
               if (Genesis.fn.isNative())
               {
                  navigator.app.exitApp();
               }
               else
               {
                  window.location.reload();
               }
            }
         });
      }, true);
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onDeviceResetTap : function(b, e)
   {
      var me = this, viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);
      Ext.device.Notification.show(
      {
         title : 'Device Reset Confirmation',
         message : me.proceedToResetDeviceeMsg,
         buttons : ['Confirm', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'confirm')
            {
               _application.getController('server' + '.Receipts').fireEvent('resetEarnedReceipts');
            }
         }
      });
   },
   onRefreshLicenseTap : function(b, e, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      Ext.device.Notification.show(
      {
         title : 'License Key Refresh',
         message : me.proceedToUpdateLicenseMsg,
         buttons : ['Proceed', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'proceed')
            {
               me.updateLicenseKey();
            }
         }
      });
   },
   onCreateTagPageTap : function(b, e, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      me.openPage('createTag');
   },
   // --------------------------------------------------------------------------
   // TAG ID Page
   // --------------------------------------------------------------------------
   onTagIdBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, value = b.getText();
      var tagIdField = me.getCreateTagId(), tagId = tagIdField.getValue(), tagIdFieldLength = tagId.length;

      if (tagIdFieldLength < me.tagIdLength)
      {
         switch (value)
         {
            case 'AC' :
            {
               tagIdField.reset();
               break;
            }
            default :
               tagId += value;
               tagIdField.setValue(tagId);
               break;
         }
      }
   },
   onCreateTagTap : function(b, e, eOpts)
   {
      var me = this, tagId = me.getCreateTagId().getValue();
      if (Genesis.fn.isNative())
      {
         if (tagId.length != me.tagIdLength)
         {
            Ext.device.Notification.show(
            {
               title : "Create Tag",
               message : me.invalidTagMsg(),
               buttons : ['Dismiss']
            });
         }
         else
         {
            me.getViewPortCntlr().setActiveController(me);
            /*
             nfc.addTagDiscoveredListener(me.writeTag, function()
             {
             console.debug("Listening for NDEF tags");
             }, function()
             {
             console.debug("Failed to Listen for NDEF tags");
             });
             */

            Ext.device.Notification.show(
            {
               title : "Create Tag",
               message : me.createTagMsg(),
               buttons : ['Cancel'],
               callback : function()
               {
                  me.getViewPortCntlr().setActiveController(null);
               }
            });
         }
      }
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onBeforeNfc : function(nfcEvent)
   {
      this.writeTag(null);

      return null;
   },
   writeTag : function(nfcEvent)
   {
      // ignore what's on the tag for now, just overwrite

      var me = this, mimeType = Genesis.constants.appMimeType, tagId = me.getCreateTagId().getValue();

      var callback = function()
      {
         me.getViewPortCntlr().setActiveController(null);
         /*
          nfc.removeTagDiscoveredListener(me.writeTag, function()
          {
          console.debug("Stopped Listening for NDEF tags");
          }, function()
          {
          console.debug("Failed to stop Listen for NDEF tags");
          });
          */
      };

      var payload = Ext.encode(
      {
         'tagID' : tagId
      }), //record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));
      record = ndef.textRecord(payload);

      console.debug("Writing [" + payload + "] to TAG ...");
      nfc.write([record], function()
      {
         Ext.device.Notification.show(
         {
            title : "Create Tag",
            message : "Wrote data to TAG.",
            buttons : ['OK']
         });
         me.getCreateTagId().reset();
         callback();
      }, function(reason)
      {
         Ext.device.Notification.show(
         {
            title : "Create Tag",
            message : "Error Writing data to TAG[" + reason + "]",
            buttons : ['Dismiss']
         });
         callback();
      });
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, form = me.getSettingsPage(), db = Genesis.db.getLocalDB(), isNative = Genesis.fn.isNative();

      me.getMerchantDevice().setLabel(Genesis.fn.getPrivKey('venue'));
      me.getDeviceID().setLabel('DeviceID' + '<div style="font-size:0.60em;line-height:1;">' + (isNative ? device.uuid : db['uuid']) + '</div>');
      me.getUtilitiesContainer()[debugMode ? 'show' : 'hide']();
      form.setValues(
      {
         posMode : ((db['isPosEnabled'] === undefined) || (db['isPosEnabled'])) ? 1 : 0,
         displayMode : db["displayMode"] || (!isNative ? 'Fixed' : 'Mobile'),
         sensitivity : db["sensitivity"]
      });
      var field = form.query('togglefield[tag=posMode]')[0];
      field.setReadOnly(db['enablePosIntegration'] ? false : true);
      field[(db['enablePosIntegration']) ? 'enable' : 'disable']();

      //
      // Disable DisplayMode in Non-Native mode
      //
      field = form.query('selectfield[tag=displayMode]')[0];
      field[!isNative ? 'hide' : 'show']();
      field = form.query('spinnerfield[tag=sensitivity]')[0];
      field[!isNative ? 'show' : 'hide']();
      field.setLabel('Sensitivity (' + db["sensitivity"] + ')');
      field.getComponent().element.setMinWidth(0);
      //field.setReadOnly(true);
      //field.disable();
   },
   onDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
   },
   onCreateTagActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.getCreateTagId().reset();
   },
   onCreateTagDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : function()
   {
      this.openPage('settings');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;
      switch(subFeature)
      {
         case 'createTag' :
         {
            page = me.getCreateTagPage();
            me.setAnimationMode(me.self.animationMode['cover']);
            me.pushView(page);
            return;
            break;
         }
      }

      me.callParent(arguments);
   }
});
Ext.define('Genesis.controller.MainPageBase',
{
   extend : 'Genesis.controller.ControllerBase',
   xtype : 'mainPageBaseCntlr',
   config :
   {
      models : ['Customer', 'User', 'Merchant', 'CustomerReward', 'Genesis.model.frontend.MainPage', 'Genesis.model.frontend.Signin', 'Genesis.model.frontend.Account'],
      after :
      {
         'mainPage' : ''
      },
      routes :
      {
         'main' : 'mainPage'
      },
      refs :
      {
      },
      control :
      {
         main :
         {
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      },
      listeners :
      {
         'itemTap' : 'onItemTap'
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      if (Genesis.fn.isNative())
      {
         Genesis.db.removeLocalDBAttrib('csrf_code');
      }
      Ext.regStore('MainPageStore',
      {
         model : 'Genesis.model.frontend.MainPage',
         //autoLoad : true,
         autoLoad : false,
         listeners :
         {
            scope : me,
            "refresh" : me.initCallback
         }
      });

      Ext.Viewport.on('orientationchange', function(v, newOrientation, width, height, eOpts)
      {
         //
         // Redraw Screen
         //
         var page = me.getMain(), vport = me.getViewport();
         if (page == vport.getActiveItem())
         {
            me.refreshPage(page);
         }
      });
      console.log("MainPageBase Init");
      //
      // Preloading Pages to memory
      //
      me.getMain();

      backBtnCallbackListFn.push(function(activeItem)
      {
         var match = ((activeItem == me.getMain()) || ((merchantMode) ? false : (activeItem == me.getLogin())));
         if (match)
         {
            var viewport = me.getViewPortCntlr();
            me.self.playSoundFile(viewport.sound_files['clickSound']);
            if (!Genesis.fn.isNative())
            {
               window.parent.setChildBrowserVisibility(false, 'explore');
            }
            else
            {
               setChildBrowserVisibility(false, 'explore');
            }
            return true;
         }
         return false;
      });
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onItemTap : function(model)
   {
      var viewport = this.getViewPortCntlr();

      this.self.playSoundFile(viewport.sound_files['clickSound']);

      console.debug("Controller=[" + model.get('pageCntlr') + "]");
      var cntlr = this.getApplication().getController(model.get('pageCntlr'));
      var msg = cntlr.isOpenAllowed();
      if (msg === true)
      {
         if (model.get('route'))
         {
            this.redirectTo(model.get('route'));
         }
         else if (model.get('subFeature'))
         {
            cntlr.openPage(model.get('subFeature'));
         }
         else
         {
            cntlr.openMainPage();
         }
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : msg,
            buttons : ['Dismiss']
         });
      }
      return false;
   },
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         /*
          var carousel = activeItem.query('carousel')[0];
          var items = carousel.getInnerItems();

          console.debug("Refreshing MainPage ...");
          for (var i = 0; i < items.length; i++)
          {
          items[i].refresh();
          }
          */
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function()
   {
      this.openPage('main');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this;

      switch (subFeature)
      {
         case 'main' :
         {
            me.setAnimationMode(me.self.animationMode['pop']);
            me.pushView(me.getMainPage());
            break;
         }
         case 'merchant' :
         {
            me.goToMerchantMain(true);
            break;
         }
      }
   },
   getMainPage : function()
   {
      var page = this.getMain();
      return page;
   },
   openMainPage : function()
   {
      var cntlr = this.getViewPortCntlr();
      this.setAnimationMode(this.self.animationMode['pop']);
      this.pushView(this.getMainPage());
      console.log("MainPage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
Ext.define('Genesis.controller.server.MainPage',
{
   extend : 'Genesis.controller.MainPageBase',
   xtype : 'mainPageCntlr',
   config :
   {
      models : ['Genesis.model.frontend.MainPage', 'CustomerReward'],
      refs :
      {
         // Main Page
         main :
         {
            selector : 'servermainpageview',
            autoCreate : true,
            xtype : 'servermainpageview'
         },
         mainCarousel : 'servermainpageview'
      }
   },
   initCallback : function()
   {
      var me = this;

      me.goToMain();
      var venueId = Genesis.fn.getPrivKey('venueId');
      if (venueId == 0)
      {
         Ext.device.Notification.show(
         {
            title : 'Missing License Key!',
            message : me.missingLicenseKeyMsg,
            buttons : ['Cancel', 'Proceed'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'proceed')
               {
                  me.getApplication().getController('Settings').fireEvent('upgradeDevice');
               }
            }
         });
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      console.log("Server MainPage Init");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;
      me.getApplication().getController('server.Merchants').onNfc(nfcResult);
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.getViewPortCntlr().setActiveController(me);
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      me.getViewPortCntlr().setActiveController(null);
   }
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
// add back button listener
var onBackKeyDown = Ext.emptyFn, appWindow, appOrigin;
proximityInit = function()
{
   //
   // Sender/Receiver Volume Settings
   // ===============================
   // - For Mobile Phones
   //
   // Client Device always transmits
   //
   var s_vol_ratio, r_vol_ratio, c = Genesis.constants;

   //
   // Volume Settings
   // ===============
   s_vol_ratio = 0.4;
   //Default Volume laying flat on a surface
   c.s_vol = 40;

   r_vol_ratio = 0.5;
   // Read fresh data as soon as there's a miss
   c.conseqMissThreshold = 1;
   c.magThreshold = 20000;
   c.numSamples = 4 * 1024;
   //Default Overlap of FFT signal analysis over previous samples
   c.sigOverlapRatio = 0.25;
   c.proximityTxTimeout = 20 * 1000;
   c.proximityRxTimeout = 40 * 1000;

   Genesis.fn.printProximityConfig();
   window.plugins.proximityID.init(s_vol_ratio, r_vol_ratio);
};
soundInit = function(viewport)
{
   Ext.defer(function()
   {
      viewport.sound_files =
      {
      };
      var soundList = [//
      ['clickSound', 'click_sound', 'FX'], //
      ['nfcEnd', 'nfc_end', 'FX'], //
      ['nfcError', 'nfc_error', 'FX'], //
      //['refreshListSound', 'refresh_list_sound', 'FX'], //
      ['beepSound', 'beep.wav', 'FX']];

      for ( i = 0; i < soundList.length; i++)
      {
         //console.debug("Preloading " + soundList[i][0] + " ...");
         viewport.loadSoundFile.apply(viewport, soundList[i]);
      }
   }, 1, viewport);
};

Ext.require(['Genesis.controller.ControllerBase'], function()
{
   onBackKeyDown = function(e)
   {
      console.debug("BackButton Pressed");

      //e.preventDefault();

      //
      // Disable BackKey if something is in progress or application is not instantiated
      //
      if (!_application || Ext.Viewport.getMasked())
      {
         return;
      }

      var viewport = _application.getController('server' + '.Viewport');
      if (!viewport || viewport.popViewInProgress)
      {
         return;
      }
      else if (Ext.device.Notification.msg && !Ext.device.Notification.msg.isHidden())
      {
         Ext.device.Notification.dismiss();
         return;
      }
      else if (!viewport.popUpInProgress)
      {
         var vport = viewport.getViewport();
         var activeItem = (vport) ? vport.getActiveItem() : null;
         if (activeItem)
         {
            var success = false;
            for (var i = 0; i < backBtnCallbackListFn.length; i++)
            {
               success = backBtnCallbackListFn[i](activeItem);
               if (success)
               {
                  break;
               }
            }
            if (!success)
            {
               var backButton = activeItem.query('button[tag=back]')[0];
               var closeButton = activeItem.query('button[tag=close]')[0];
               if ((backButton && !backButton.isHidden()) || //
               (closeButton && !closeButton.isHidden()))
               {
                  viewport.self.playSoundFile(viewport.sound_files['clickSound']);
                  viewport.popView();
               }
            }
         }
         else
         {
            viewport.self.playSoundFile(viewport.sound_files['clickSound']);
            if (Genesis.fn.isNative())
            {
               navigator.app.exitApp();
            }
            else
            {
               window.location.reload();
            }
         }
      }
   };
});

Ext.merge(WebSocket.prototype,
{
   onNfc : function(inputStream)
   {
      //
      // Get NFC data from remote call
      //
      var cntlr = _application.getController('server' + '.Viewport').getActiveController(), result = inputStream;
      /*
       {
       result : Ext.decode(text),
       id : id
       };
       */
      if (result)
      {
         if (cntlr)
         {
            console.log("Received Message [" + Ext.encode(result) + "]");
            cntlr.onNfc(result);
         }
         else
         {
            console.log("Ignored Received Message [" + Ext.encode(result) + "]");
         }
      }
   }
});

window.addEventListener('message', function(e)
{
   var _data = e.data;

   if (!( typeof (_data) == 'object'))
   {
      return;
   }

   switch(_data['cmd'])
   {
      case 'init' :
      {
         appWindow = e.source;
         appOrigin = e.origin;

         console.debug("Webview connection Established.");
         break;
      }
      case  'licenseKey_ack' :
      {
         viewport = _application.getController('server' + '.Viewport');
         if (!_data['key'])
         {
            viewport.licenseKeyNackFn(_data);
         }
         else
         {
            viewport.licenseKeyAckFn(_data['key']);
         }
         break;
      }
   }
}, false);

Ext.define('Genesis.controller.server.Viewport',
{
   extend : 'Genesis.controller.ViewportBase',
   requires : ['Genesis.model.frontend.Receipt', 'Ext.dataview.List', 'Ext.XTemplate'],
   config :
   {
      customer : null,
      venue : null,
      metaData : null,
      checkinInfo :
      {
         venue : null,
         customer : null,
         metaData : null
      },
      activeController : null
   },
   setupInfoMissingMsg : 'Setup Information missing for this Terminal',
   licenseKeyInvalidMsg : 'Missing License Key',
   licenseTitle : 'LicenseKey Refresh',
   licenseRefreshMsg : function()
   {
      return 'Proceed to select' + Genesis.constants.addCRLF() + 'a LicenseKey File';
   },
   setupTitle : 'System Initialization',
   unsupportedPlatformMsg : 'This platform is not supported.',
   licenseKeySuccessMsg : function()
   {
      return 'License Key Updated for ' + Genesis.constants.addCRLF() + '[' + Genesis.fn.getPrivKey('venue') + ']';
   },
   inheritableStatics :
   {
   },
   updateMetaDataInfo : function(metaData)
   {
      try
      {
         var me = this, db = Genesis.db.getLocalDB();

         //
         // Update Customer Rewards (Rewards Redemptions)
         //
         me.updateRewards(metaData['rewards']);
         //
         // Update Customer Rewards (Prizes Redemptions)
         //
         me.updatePrizes(metaData['prizes']);

         metaData['reward_model'] = (!db['rewardModel']) ? metaData['reward_model'] || 'amount_spent' : metaData['reward_model'];
         if (metaData['reward_model'])
         {
            Genesis.db.setLocalDBAttrib('rewardModel', metaData['reward_model']);
         }
      }
      catch(e)
      {
         console.debug("updateMetaDataInfo Exception - " + e);
      }
   },
   getLicenseKey : function(uuid, callback, forceRefresh)
   {
      var me = this;

      me.persistLoadStores(function()
      {
         var lstore = Ext.StoreMgr.get('LicenseStore');
         if ((lstore.getRange().length < 1) || (forceRefresh))
         {
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.loadingMsg
            });
            lstore.removeAll();
            LicenseKey['setGetLicenseKeyURL']();
            lstore.load(
            {
               addRecords : true, //Append data
               scope : me,
               jsonData :
               {
               },
               params :
               {
                  'device_id' : uuid
               },
               callback : function(records, operation)
               {
                  console.debug("Loading License Key ... Record Length(" + records.length + ")");
                  if (operation.wasSuccessful() && records[0])
                  {
                     var venueId = records[0].get('venue_id');
                     var venueName = records[0].get('venue_name');
                     var licenseKey = Genesis.fn.privKey =
                     {
                        'venueId' : venueId,
                        'venue' : records[0].get('venue_name')
                     };
                     licenseKey['r' + venueId] = licenseKey['p' + venueId] = records[0].getId();

                     Genesis.db.resetStorage();
                     me.persistSyncStores('LicenseStore');
                     me.initializeConsole(callback);
                  }
                  else if (!records[0])
                  {
                     me.initNotification(me.licenseKeyInvalidMsg);
                  }
                  else
                  {
                     lstore.getProxy()._errorCallback = Ext.bind(me.initNotification, me, [me.licenseKeyInvalidMsg]);
                  }
                  var db = Genesis.db.getLocalDB();

                  db['uuid'] = uuid;
                  if (!Genesis.fn.isNative())
                  {
                     if (!db['sensitivity'])
                     {
                        db['sensitivity'] = 115;
                     }

                     //
                     // Set Display mode to "Fixed" in Non-Native Mode
                     //
                     db['displayMode'] = 'Fixed';
                     //console.debug("Updated Default Settings");
                  }
                  Genesis.db.setLocalDB(db);
               }
            });
         }
         else
         {
            var record = lstore.getRange()[0];
            var venueId = record.get('venue_id');
            var venueName = record.get('venue_name');
            var licenseKey = Genesis.fn.privKey =
            {
               'venueId' : venueId,
               'venue' : record.get('venue_name')
            };
            licenseKey['r' + venueId] = licenseKey['p' + venueId] = record.getId();
            me.initializeConsole(callback);
         }
      });
   },
   writeLicenseKey : function(text)
   {
      var me = this, errorHandler = function(obj, error)
      {
         console.log(error, obj);
      };

      navigator.webkitPersistentStorage.requestQuota(1 * 1024 * 1024, function(grantedBytes)
      {
         //console.log("Local Storage " + grantedBytes + " bytes granted");
         window.webkitRequestFileSystem(PERSISTENT, grantedBytes, function(fs)
         {
            fs.root.getFile('licenseKey.txt',
            {
               create : true,
               exclusive : false
            }, function(fileEntry)
            {
               // Create a FileWriter object for our FileEntry (log.txt).
               fileEntry.createWriter(function(fileWriter)
               {
                  fileWriter.onwriteend = function(e)
                  {
                     console.log('Updated LicenseKey.');
                  };
                  fileWriter.onerror = Ext.bind(errorHandler, me, ['LicenseKey Update Failed: '], true);

                  // Create a new Blob and write it to log.txt.
                  fileWriter.write(new Blob([text],
                  {
                     type : 'text/plain'
                  }));
               }, Ext.bind(errorHandler, me, ['Attempting to Update LicenseKey File : '], true));
            }, Ext.bind(errorHandler, me, ['Retrivee/Create LicenseKey File : '], true));
         }, Ext.bind(errorHandler, me, ['Requesting FS Quota : '], true));
      });
   },
   refreshLicenseKey : function(callback, forceRefresh)
   {
      var me = this, db = Genesis.db.getLocalDB();

      callback = callback || Ext.emptyFn;
      if (!Genesis.fn.isNative())
      {
         if (appWindow && !db['uuid'])
         {
            me.licenseKeyNackFn = Ext.bind(function(obj, error)
            {
               console.log(error, obj);
               me.initNotification(me.licenseKeyInvalidMsg);
            }, me, ['Cannot Read from LicenseKey: '], true);
            me.licenseKeyAckFn = Ext.bind(me.getLicenseKey, me, [callback, forceRefresh], true);

            Ext.device.Notification.show(
            {
               title : me.licenseTitle,
               message : me.licenseRefreshMsg(),
               buttons : ['Proceed'],
               callback : function(btn)
               {
                  appWindow.postMessage(
                  {
                     cmd : 'licenseKey'
                  }, appOrigin);
               }
            });
         }
         else
         {
            me.getLicenseKey(db['uuid'], callback, forceRefresh);
         }
         /*
          var errorHandler = function(obj, error)
          {
          console.log(error, obj);
          me.initNotification(me.licenseKeyInvalidMsg);
          };

          navigator.webkitPersistentStorage.requestQuota(1 * 1024 * 1024, function(grantedBytes)
          {
          window.webkitRequestFileSystem(PERSISTENT, grantedBytes, function(fs)
          {
          fs.root.getFile('file://licenseKey.txt',
          {
          }, function(fileEntry)
          {
          // Get a File object representing the file,
          // then use FileReader to read its contents.
          fileEntry.file(function(file)
          {
          var reader = new FileReader();

          reader.onloadend = function(e)
          {
          me.getLicenseKey(this.result, callback, forceRefresh);
          };

          reader.readAsText(file);
          }, Ext.bind(errorHandler, me, ['Cannot Read from LicenseKey: '], true));
          }, Ext.bind(errorHandler, me, ['Cannot retrieve LicenseKey: '], true));
          }, Ext.bind(errorHandler, me, ['Cannot retrieve granted Filesystem Quota: '], true));
          }, Ext.bind(errorHandler, me, ['Cannot retrieve requested Filesystem Quota: '], true));
          */

         /*
          var request = new XMLHttpRequest();

          //console.debug("Loading LicenseKey.txt ...");
          request.onreadystatechange = function()
          {
          if (request.readyState == 4)
          {
          if (request.status == 200 || request.status == 0)
          {
          console.debug("Loaded LicenseKey ...");
          me.getLicenseKey(request.responseText, callback, forceRefresh);
          }
          }
          };
          request.open("GET", 'licenseKey.txt', true);
          request.send(null);
          */
      }
      else
      {
         me.getLicenseKey(device.uuid, callback, forceRefresh);
      }
   },
   initNotification : function(msg)
   {
      var me = this;
      Ext.Viewport.setMasked(null);
      Ext.device.Notification.show(
      {
         title : me.setupTitle,
         message : msg,
         buttons : ['Refresh License', 'Restart'],
         callback : function(btn)
         {
            //
            // Restart, because we can't continue without Console Setup data
            //
            if (!btn || (btn.toLowerCase() == 'restart'))
            {
               if (!debugMode)
               {
                  if (Genesis.fn.isNative())
                  {
                     navigator.app.exitApp();
                  }
                  else
                  {
                     window.location.reload();
                  }
               }
            }
            else
            {
               Ext.defer(function()
               {
                  me.refreshLicenseKey(function()
                  {
                     Ext.device.Notification.show(
                     {
                        title : 'License Key Updated!',
                        message : me.licenseKeySuccessMsg(),
                        buttons : ['Restart'],
                        callback : function()
                        {
                           if (!debugMode)
                           {
                              //
                              // Restart because we can't continue without Console Setup data
                              //
                              if (Genesis.fn.isNative())
                              {
                                 navigator.app.exitApp();
                              }
                              else
                              {
                                 window.location.reload();
                              }
                           }
                        }
                     });
                  }, true);
               }, 100, me);
            }
         }
      });
   },
   initializeLicenseKey : function()
   {
      var me = this, viewport = me;

      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false
      });

      me.refreshLicenseKey(Ext.bind(pos.connect, pos, [false]));
   },
   initializeConsole : function(callback)
   {
      var me = this, viewport = me, info = viewport.getCheckinInfo(), venueId = Genesis.fn.getPrivKey('venueId'), proxy = Venue.getProxy();
      var db = Genesis.db.getLocalDB();
      var params =
      {
         'venue_id' : venueId
      };

      console.debug("Loaded License Key for Venue(" + venueId + ")...");
      Venue['setGetMerchantVenueExploreURL'](venueId);
      Venue.load(venueId,
      {
         addRecords : true,
         jsonData :
         {
         },
         params : params,
         scope : me,
         callback : function(record, operation)
         {
            if (!db['enablePosIntegration'] || !db['isPosEnabled'])
            {
               Ext.Viewport.setMasked(null);
            }

            var metaData = proxy.getReader().metaData;
            if (operation.wasSuccessful() && metaData)
            {
               metaData['features_config'] = metaData['features_config'] ||
               {
               };
               //console.debug("metaData - " + Ext.encode(metaData));
               console.debug("features_config - " + Ext.encode(metaData['features_config']));

               viewport.setVenue(record);
               viewport.setMetaData(metaData);
               info.venue = viewport.getVenue();
               info.metaData = viewport.getMetaData();

               me.fireEvent('updatemetadata', metaData);
               //
               // POS Connection needs to be established
               //
               me.getApplication().getController('server' + '.Receipts').fireEvent('updatemetadata', metaData, false);

               console.debug("Successfully acquired dataset for Venue(" + venueId + ")");
               //console.debug("Record[" + Ext.encode(record) + "]");
               //console.debug("MetaData[" + Ext.encode(metaData) + "]");
               callback();
               return;
            }
            else if (!operation.wasSuccessful() && !metaData)
            {
               proxy.supressErrorsPopup = true;
               console.debug(me.setupInfoMissingMsg);
            }
            me.initNotification(me.setupInfoMissingMsg);
         }
      });
   },
   applyActiveController : function(controller)
   {
      var me = this;

      if (Genesis.fn.isNative())
      {
         if (me._mimeTypeCallback)
         {
            nfc.removeNdefListener(me._mimeTypeCallback, function()
            //nfc.removeMimeTypeListener(Genesis.constants.appMimeType, me._mimeTypeCallback, function()
            {
               console.debug("Removed NDEF Listener for NFC detection ...");
               //console.debug("Removed MimeType[" + Genesis.constants.appMimeType + "] for NFC detection ...");
            });
            delete me._mimeTypeCallback;
         }
         if (controller && Genesis.constants.isNfcEnabled)
         {
            me._mimeTypeCallback = function(nfcEvent)
            {
               var cntlr = me.getActiveController(), result = cntlr.onBeforeNfc(nfcEvent);
               if (result)
               {
                  if (cntlr)
                  {
                     console.log("Received Message [" + Ext.encode(result) + "]");
                     cntlr.onNfc(result);
                  }
                  else
                  {
                     console.log("Ignored Received Message [" + Ext.encode(result) + "]");
                  }
               }
            };

            nfc.addNdefListener(me._mimeTypeCallback, function()
            //nfc.addMimeTypeListener(Genesis.constants.appMimeType, me._mimeTypeCallback, function()
            {
               console.debug("Listening for tags with NDEF type");
               //console.debug("Listening for tags with mime type " + Genesis.constants.appMimeType);
            }, function()
            {
               console.warn('Failed to register NDEF type with NFC');
            });
            //console.debug("Added NDEF Tags for NFC detection ...");
            //console.debug("Added MimeType[" + Genesis.constants.appMimeType + "] for NFC detection ...");
         }
      }
      return controller;
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onActivate : function()
   {
      var me = this, viewport = this;

      // Load Info into database
      if (!viewport.getVenue())
      {
         me.callParent(arguments);
      }
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   init : function(app)
   {
      var i, me = this, s_vol_ratio, r_vol_ratio, c = Genesis.constants;

      me.callParent(arguments);

      console.log("Server Viewport Init");

      me.initializeLicenseKey();
      //
      // Initialize Sound Files, make it non-blocking
      //
      proximityInit();
      soundInit(me);

      if (pos.isEnabled() && Genesis.fn.isNative())
      {
         console.debug("Server Viewport - establishPosConn");
         window.plugins.WifiConnMgr.establishPosConn();
      }

      if (Genesis.fn.isNative())
      {
         document.addEventListener("backbutton", onBackKeyDown, false);
      }
   },
   loadSoundFile : function(tag, sound_file, type)
   {
      var me = this;

      me.callParent(arguments);

      if (!Genesis.fn.isNative())
      {
         var ext = '.' + (sound_file.split('.')[1] || 'mp3'), sound_file = sound_file.split('.')[0], elem = Ext.get(sound_file);

         if (elem)
         {
            elem.dom.addEventListener('ended', function()
            {
               me.sound_files[tag].successCallback();
            }, false);
         }
      }
   }
});
Ext.define('Genesis.controller.server.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   inheritableStatics :
   {
   },
   xtype : 'serverChallengesCntlr',
   config :
   {
      models : ['PurchaseReward', 'CustomerReward'],
      refs :
      {
         //
         // Challenges
         //
         challenges : 'serverredeemitemdetailview[tag=redeemPrize]',
         authText : 'serverredeemitemdetailview[tag=redeemPrize] component[tag=authText]'
      },
      control :
      {
         /*,
          refreshBtn :
          {
          tap : 'onRefreshTap'
          }
          */
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   //genAuthCodeMsg : 'Proceed to generate Authorization Code',
   generatingAuthCodeMsg : 'Generating Code ...',
   refreshAuthCodeMsg : 'Refresing ...',
   challengeSuccessfulMsg : 'Challenge Completed!',
   challengeFailedMsg : 'Failed to Complete Challenge!',
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Challenges Init");
   },
   // --------------------------------------------------------------------------
   // Server Challenges Page
   // --------------------------------------------------------------------------
   redeemItemCb : function()
   {
      var me = this, viewport = me.getViewPortCntlr();

      //oldActiveItem.removeAll(true);
      viewport.setActiveController(null);
      if (me.scanTask)
      {
         Ext.device.Notification.show(
         {
            title : 'Challenges',
            message : me.transactionCancelledMsg,
            buttons : ['Dismiss']
         });
      }
      clearInterval(me.scanTask);
      me.scanTask = null;
      //
      // Stop receiving ProximityID
      //
      window.plugins.proximityID.stop();
   },
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      this.redeemItemCb();
   },
   onRedeemChallenges : function(refresh)
   {
      var me = this, viewport = me.getViewPortCntlr(), proxy = Challenge.getProxy();
      var params =
      {
         version : Genesis.constants.serverVersion,
         'venue_id' : Genesis.fn.getPrivKey('venueId')
      }
      me.dismissDialog = false;
      if (!refresh)
      {
         Ext.defer(function()
         {
            var controller = me.getApplication().getController('server' + '.Prizes');
            var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
            var photoUrl =
            {
            };
            photoUrl[prefix] =
            {
               url : me.self.getPhoto(
               {
                  value : 'transmit'
               })
            }
            var reward = Ext.create('Genesis.model.CustomerReward',
            {
               id : 0,
               title : 'Authorization',
               type :
               {
                  value : 'earn_points'
               },
               photo : photoUrl
            });
            controller.fireEvent('authreward', reward);
         }, 100, me);
      }

      me.challengeItemFn = function(p, closeDialog)
      {
         me.dismissDialog = closeDialog;
         me.redeemItemCb();
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         //Ext.device.Notification.dismiss();

         //
         // Updating Server ...
         //
         console.debug("Updating Server with Challenge information ... dismissDialog(" + me.dismissDialog + ")");

         Challenge['setCompleteMerchantChallengeURL']();
         Challenge.load(1,
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : Ext.apply(params, p),
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Challenge',
                     message : me.challengeSuccessfulMsg,
                     buttons : ['OK'],
                     callback : function()
                     {
                        me.popView();
                     }
                  });
               }
               else
               {
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : 'Challenge',
                     message : me.challengeFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsCallbackFn();
                        me.popView();
                     }
                  });
               }
            }
         });
      };

      me.identifiers = null;
      me.getLocalID(function(ids)
      {
         me.identifiers = ids;
         me.challengeItemFn(
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : me.identifiers['localID'],
               'expiry_ts' : new Date().addHours(3).getTime()
            }, 'reward')
         }, true);
      }, function()
      {
         viewport.setActiveController(null);
         Ext.Viewport.setMasked(null);
         me.popView();
      }, Ext.bind(me.onRedeemChallenges, me, arguments));
      viewport.setActiveController(me);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      var me = this;
      me.onRedeemChallenges();
   },
   isOpenAllowed : function()
   {
      return true;
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'transmit' :
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               break;
         }
         return photo_url;
      }
   }
});
Ext.define('Genesis.controller.server.Merchants',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   inheritableStatics :
   {
      googleMapStaticUrl : 'http://maps.googleapis.com/maps/api/staticmap'
   },
   xtype : 'servermerchantsCntlr',
   config :
   {
      routes :
      {
         'venue/:id/:id' : 'mainPage'
      },
      refs :
      {
         main :
         {
            selector : 'servermerchantaccountview',
            autoCreate : true,
            xtype : 'servermerchantaccountview'
         },
         form : 'servermerchantaccountview formpanel',
         merchantMain : 'servermerchantaccountview container[tag=merchantMain]',
         tbPanel : 'servermerchantaccountview dataview[tag=tbPanel]',
         prizesBtn : 'merchantaccountptsitem component[tag=prizepoints]',
         redeemBtn : 'merchantaccountptsitem component[tag=points]'
      },
      control :
      {
         main :
         {
            showView : 'onMainShowView',
            activate : 'onMainActivate',
            deactivate : 'onMainDeactivate'
         }
      }
   },
   init : function()
   {
      var me = this;
      //
      // Store used for rendering purposes
      //
      Ext.regStore('MerchantRenderStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });

      me.callParent(arguments);

      console.log("Merchants Server Init");

      //
      // Preloading Pages to memory
      //
      me.getMain();

      backBtnCallbackListFn.push(function(activeItem)
      {
         if (activeItem == me.getMain())
         {
            var viewport = me.getViewPortCntlr();
            me.self.playSoundFile(viewport.sound_files['clickSound']);
            me.redirectTo('main');
            return true;
         }
         return false;
      });
   },
   getAccountFields : function(account)
   {
      var me = this, form = me.getForm();

      return (
         {
            'birthday' :
            {
               field : form.query('datepickerfield[name=birthday]')[0],
               fn : function(field)
               {
                  var birthday = new Date.parse(account['birthday']);
                  return (!birthday || !( birthday instanceof Date)) ? ' ' : birthday;
               }
            },
            'phone' :
            {
               field : form.query('textfield[name=phone]')[0],
               fn : function(field)
               {
                  var phone = account['phone'].match(Account.phoneRegex);
                  return (phone[1] + '-' + phone[2] + '-' + phone[3]);
               }
            }
         });
   },
   showAccountInfo : function(account, tagId)
   {
      var i, f, me = this, fields = me.getAccountFields(account), form = me.getForm();

      for (i in fields)
      {
         f = fields[i];
         if (account[i])
         {
            f[i] = f.fn(f.field);
         }
         //
         // Default Value
         //
         else
         {
            f[i] = null;
         }
      }

      form.setValues(
      {
         birthday : fields['birthday'].birthday,
         phone : fields['phone'].phone,
         tagid : tagId
      });
      form.query('textfield[name=user]')[0].setLabel(account['name'] + '<br/>' + '<label>' + account['email'] + "</label>");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this, venueId = Genesis.fn.getPrivKey('venueId'), viewport = me.getViewPortCntlr();
      nfcResult = nfcResult ||
      {
         id : null,
         result :
         {
            'tagID' : null
         }
      };
      console.debug("Retrieving Customer Account for ID[" + nfcResult.id + "] tagID[" + nfcResult.result['tagID'] + '], venueId[' + venueId + ']');

      var params =
      {
         device_pixel_ratio : window.devicePixelRatio,
         data : me.self.encryptFromParams(
         {
            'uid' : nfcResult.id,
            'tag_id' : nfcResult.result['tagID']
         }, 'reward')
      }
      //
      // Retrieve Venue / Customer information for Merchant Account display
      //
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.establishConnectionMsg
      });
      Customer['setGetCustomerUrl']();
      Customer.load(venueId,
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         params : params,
         callback : function(record, operation)
         {
            var metaData = Customer.getProxy().getReader().metaData;
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful() && metaData)
            {
               me.account = metaData['account'];
               me.tagID = nfcResult.result['tagID'];
               //console.log("Customer[" + Ext.encode(record) + "]");
               Ext.StoreMgr.get('CustomerStore').setData(record);
               viewport.setCustomer(record);
               var info = viewport.getCheckinInfo();
               info.customer = viewport.getCustomer();
               me.redirectTo('venue/' + venueId + '/' + info.customer.getId());
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Merchant Account Page
   // --------------------------------------------------------------------------
   checkInAccount : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var venue = viewport.getVenue();

      //
      // Force Page to refresh
      //
      var controller = vport.getEventDispatcher().controller;
      var anim = new Ext.fx.layout.Card(me.self.animationMode['fade']);
      anim.on('animationend', function()
      {
         console.debug("Animation Complete");
         anim.destroy();
      }, me);
      //if (!controller.isPausing)
      {
         console.debug("Reloading current Merchant Home Account Page ...");

         var page = me.getMainPage();

         // Delete current page and refresh
         page.removeAll(true);
         vport.animateActiveItem(page, anim);
         anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
         vport.doSetActiveItem(page, null);
      }
   },
   onMainShowView : function(activeItem)
   {
      var me = this;
      if (Ext.os.is('Android'))
      {
         console.debug("Refreshing MerchantRenderStore ...");
         var monitors = this.getEventDispatcher().getPublishers()['elementPaint'].monitors;

         activeItem.query('dataview[tag=tbPanel]')[0].refresh();
         monitors[activeItem.element.getId()].onElementPainted(
         {
            animationName : 'x-paint-monitor-helper'
         });
      }
      me.showAccountInfo(me.account, me.tagID);
   },
   onMainActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      console.debug("Merchant Account Activate");
      var me = this, viewport = me.getViewPortCntlr();
      var vrecord = viewport.getVenue();
      var crecord = viewport.getCustomer();

      viewport.setActiveController(me);
      var rstore = Ext.StoreMgr.get('MerchantRenderStore');
      //if (rstore.getRange()[0] != vrecord)
      {
         rstore.setData(vrecord);
         //
         // Update Customer Statistics
         // in case venue object was never updated ...
         //
         me.onCustomerRecordUpdate(crecord);
      }
      //page.createView();

      var scroll = activeItem.getScrollable();
      scroll.getScroller().scrollTo(0, 0);

      // Update TitleBar
      var bar = activeItem.query('titlebar')[0];
      bar.setTitle(' ');
      Ext.defer(function()
      {
         // Update TitleBar
         bar.setTitle(vrecord.get('name'));
      }, 1, me);

      console.debug("TagID[" + me.tagID + "] Account Info [" + Ext.encode(me.account) + "]");
   },
   onMainDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      //
      // Disable NFC Capability
      //
      viewport.setActiveController(null);
      /*
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
      activeItem.getInnerItems()[i].setVisibility(false);
      }
      */
      //
      // Remove Customer information
      //
      viewport.setCustomer(null);
      Ext.StoreMgr.get('CustomerStore').removeAll(true);
   },
   onCustomerRecordUpdate : function(customer)
   {
      var me = this;
      var rstore = Ext.StoreMgr.get('MerchantRenderStore');
      if (rstore && (rstore.getCount() > 0))
      {
         //
         // Udpate MerchantRenderStore when CustomerStore is updated
         //
         if (rstore && rstore.getRange()[0].getMerchant().getId() == customer.getMerchant().getId())
         {
            var prize = me.getPrizesBtn(), redeem = me.getRedeemBtn();
            var dom;
            if (prize)
            {
               dom = Ext.DomQuery.select('span', prize.element.dom)[0];
               Ext.fly(dom)[customer.get('eligible_for_prize') ? 'removeCls' : 'addCls']("x-item-hidden");
            }
            if (redeem)
            {
               dom = Ext.DomQuery.select('span', redeem.element.dom)[0];
               Ext.fly(dom)[customer.get('eligible_for_reward') ? 'removeCls' : 'addCls']("x-item-hidden");
            }
            //rstore.fireEvent('refresh', rstore, rstore.data);
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function(venueId, customerId)
   {
      this.openMainPage();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getMain();
   },
   openMainPage : function()
   {
      var me = this;
      var vport = me.getViewport();

      // Refresh Merchant Panel Info
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      if (me.getMainPage() == vport.getActiveItem())
      {
         me.checkInAccount();
      }
      else
      {
         me.setAnimationMode(me.self.animationMode['pop']);
         me.pushView(me.getMainPage());
      }
      console.log("Merchant Account Opened");
   }
});

Ext.define('Genesis.controller.server.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   xtype : 'serverRewardsCntlr',
   config :
   {
      mode : 'Manual', // 'POS_Selection', 'POS_Detail', 'Maunal', 'Visit'
      models : ['PurchaseReward', 'CustomerReward'],
      routes :
      {
         'earnPts' : 'earnPtsPage'
      },
      refs :
      {
         //
         // Rewards
         //
         rewards :
         {
            selector : 'serverrewardsview',
            autoCreate : true,
            xtype : 'serverrewardsview'
         },
         calcBtn : 'serverrewardsview button[tag=calculator]',
         refreshBtn : 'serverrewardsview button[tag=refresh]',
         receiptsList : 'serverrewardsview container list',
         tableSelectField : 'serverrewardsview selectfield[tag=tableFilter]',
         backBB : 'serverrewardsview button[tag=back]',
         rptCloseBB : 'serverrewardsview button[tag=rptClose]',
         receiptDetail : 'serverrewardsview dataview[tag=receiptDetail]',
         rewardsContainer : 'serverrewardsview container[tag=rewards]',
         rewardTBar : 'serverrewardsview container[tag=tbBottomSelection]',
         rewardSelection : 'serverrewardsview container[tag=tbBottomSelection] button[tag=rewardsSC]',
         rewardDetail : 'serverrewardsview container[tag=tbBottomDetail] button[tag=rewardsSC]',
         amount : 'serverrewardsview calculator[tag=amount] textfield',
         itemsPurchased : 'serverrewardsview calculator[tag=itemsPurchased] textfield',
         phoneId : 'serverrewardsview calculator[tag=phoneId] textfield',
         //qrcode : 'serverrewardsview component[tag=qrcode]',
         title : 'serverrewardsview container[tag=qrcodeContainer] component[tag=title]'
      },
      control :
      {
         rptCloseBB :
         {
            tap : 'onRptCloseTap'
         },
         calcBtn :
         {
            tap : 'onCalcBtnOverrideTap'
         },
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         rewardsContainer :
         {
            activeitemchange : 'onContainerActivate'
         },
         receiptsList :
         {
            //select : 'onReceiptSelect',
            disclose : 'onReceiptDisclose'
         },
         tableSelectField :
         {
            change : 'onTableSelectFieldChange'
         },
         'serverrewardsview calculator[tag=amount] container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'serverrewardsview calculator[tag=amount] container[tag=bottomButtons] button[tag=earnPts]' :
         {
            tap : 'onEarnPtsTap'
         },
         'serverrewardsview calculator[tag=phoneId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverrewardsview calculator[tag=phoneId] container[tag=bottomButtons] button[tag=earnTagId]' :
         {
            tap : 'onTagItTap'
         },
         'serverrewardsview calculator[tag=itemsPurchased] container[tag=dialpad] button' :
         {
            tap : 'onStampBtnTap'
         },
         'serverrewardsview calculator[tag=itemsPurchased] container[tag=bottomButtons] button[tag=earnPts]' :
         {
            tap : 'onEarnPtsTap'
         },
         rewardSelection :
         {
            tap : 'onRewardSelectionTap'
         },
         rewardDetail :
         {
            tap : 'onRewardDetailTap'
         }
      },
      listeners :
      {
         'rewarditem' : 'onRewardItem'
      }
   },
   maxValue : 1000.00,
   maxStampValue : 9,
   phoneIdMaxLength : 10,
   rewardSuccessfulMsg : 'Transaction Complete',
   rewardFailedMsg : 'Transaction Failed',
   invalidAmountMsg : 'Please enter a valid amount (eg. 5.00), upto $1000',
   invalidStampMsg : 'Please enter a valid Stamp amount (1-9)',
   earnPtsConfirmMsg : 'Please confirm to submit',
   earnPtsTitle : 'Earn Reward Points',
   selectRewardMsg : 'Please select your Receipt(s)',
   unRegAccountMsg : function()
   {
      return ('This account is unregistered' + Genesis.constants.addCRLF() + 'Phone Number is required for registration');
   },
   init : function()
   {
      var me = this;
      me.callParent(arguments);
      console.log("Server Rewards Init");
      //
      // Preload Pages
      //
      me.getRewards();

      Ext.StoreMgr.get('ReceiptStore').on(
      {
         //clear : 'onReceiptStoreUpdate',
         filter : 'onReceiptStoreUpdate',
         addrecords : 'onReceiptStoreUpdate',
         refresh : 'onReceiptStoreUpdate',
         //removerecords : 'onReceiptStoreUpdate',
         updaterecord : 'onReceiptStoreUpdate',
         scope : me
      });

      backBtnCallbackListFn.push(function(activeItem)
      {
         var viewport = me.getViewPortCntlr(), closeButton = activeItem.query('button[tag=rptClose]')[0];
         if ((activeItem == me.getRewards()) && (closeButton && !closeButton.isHidden()))
         {
            viewport.self.playSoundFile(viewport.sound_files['clickSound']);
            closeButton.fireEvent('tap', closeButton, null);
            return true;
         }
         return false;
      });

      //
      // Post Notification
      //
      window.addEventListener('message', function(e)
      {
         var _data = e.data;

         if (( typeof (_data) == 'object') && (_data['cmd'] == 'notification_ack'))
         {
            var store = Ext.StoreMgr.get('ReceiptStore');
            var record = store.find('id', _data['id']);
            if (record)
            {
               me.receiptSelected = [record];
               me.setMode('POS_Selection');
               me.fireEvent('rewarditem', true);
            }
         }
      }, false);
   },
   getAmountPrecision : function(num)
   {
      var precision = num.split('.');
      return ((precision.length > 1) ? precision[1].length : 0);
   },
   validateAmount : function()
   {
      var me = this, amount, db = Genesis.db.getLocalDB();

      switch (db['rewardModel'])
      {
         case 'items_purchased' :
         {
            amount = me.getItemsPurchased().getValue();
            console.debug("Stamp Ammount = [" + amount + "]");
            if (amount <= 0)
            {
               Ext.device.Notification.show(
               {
                  title : 'Validation Error',
                  message : me.invalidStampMsg,
                  buttons : ['Dismiss']
               });
               amount = -1;
            }
            break;
         }
         case 'amount_spent' :
         {
            amount = me.getAmount().getValue();
            console.debug("Ammount = [" + amount + "]");
            var precision = me.getAmountPrecision(amount);
            if (precision < 2)
            {
               Ext.device.Notification.show(
               {
                  title : 'Validation Error',
                  message : me.invalidAmountMsg,
                  buttons : ['Dismiss']
               });
               amount = -1;
            }
            break;
         }
         case 'visits' :
         default:
            break;
      }

      return amount;
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, container = me.getRewardsContainer(), store = Ext.StoreMgr.get('ReceiptStore'), db = Genesis.db.getLocalDB();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0), posEnabled = pos.isEnabled();

      if (container)
      {
         me.getAmount().reset();
         me.getItemsPurchased().reset();
         me.onReceiptStoreUpdate(store);
         container.setActiveItem((posEnabled) ? 2 : manualMode);
      }
      if (debugMode)
      {
         me.getCalcBtn()[(posEnabled) ? 'show' : 'hide']();
      }
      me.getRefreshBtn()[(posEnabled) ? 'show' : 'hide']();
      //activeItem.createView();
   },
   onCalcBtnOverrideTap : function(b, e)
   {
      var me = this, container = me.getRewardsContainer(), animation = container.getLayout().getAnimation(), db = Genesis.db.getLocalDB();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0);

      if (container)
      {
         me.getAmount().reset();
         me.getItemsPurchased().reset();
         animation.setDirection('down');
         container.setActiveItem(manualMode);
         me.getRptCloseBB()['hide']();
         me.getBackBB()['show']();
         if (debugMode)
         {
            me.getCalcBtn()['hide']();
         }
      }
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;

      window.plugins.proximityID.stop();
      me.getViewPortCntlr().setActiveController(null);
      console.debug("Rewards onDeactivate Called. Reset Amount ...");
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this, container = me.getRewardsContainer(), animation = container.getLayout().getAnimation();

      me.getRefreshBtn()[(value.config.tag == 'posSelect') ? 'show'  : 'hide']();
      switch (value.config.tag)
      {
         case 'posSelect' :
         {
            animation.setDirection('left');
            console.debug("Rewards ContainerActivate Called. Showing POS Receipts ...");
            break;
         }
         case 'posDetail' :
         {
            animation.setDirection('right');
            console.debug("Rewards ContainerActivate Called. Showing POS Receipt Detail ...");
            break;
         }
         case 'amount' :
         {
            me.getAmount().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset Amount ...");
            break;
         }
         case 'itemsPurchased' :
         {
            me.getItemsPurchased().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset ItemsPurchased ...");
            break;
         }
         case 'phoneId' :
         {
            me.getPhoneId().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset PhoneID ...");
            break;
         }
         case 'qrcodeContainer' :
         {
            animation.setDirection('down');
            animation.setReverse(false);
            console.debug("Rewards ContainerActivate Called.");
            break;
         }
      }
   },
   rewardItemCb : function(b)
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.popUpInProgress = false;
      me._actions.hide();
      viewport.setActiveController(null);
      clearInterval(me.scanTask);
      me.scanTask = null;
      //
      // Stop receiving ProximityID
      //
      window.plugins.proximityID.stop();

      if (b && (b.toLowerCase() == 'manual'))
      {
         Ext.Viewport.setMasked(null);
         me.onEnterPhoneNum();
      }
      else if (!me.dismissDialog)
      {
         Ext.Viewport.setMasked(null);
         me.onDoneTap();
      }
   },
   rewardItemFn : function(params, closeDialog)
   {
      var me = this, viewport = me.getViewPortCntlr(), proxy = PurchaseReward.getProxy(), amount = 0, itemsPurchased = 0, visits = 0, db = Genesis.db.getLocalDB();
      var posEnabled = pos.isEnabled();

      switch (me.getMode())
      {
         case 'Manual' :
         {
            amount = me.getAmount().getValue();
            itemsPurchased = me.getItemsPurchased().getValue();
            visits++;
            break;
         }
         case 'POS_Detail' :
         case 'POS_Selection' :
         {
            var receiptSelected;
            for (var i = 0; i < me.receiptSelected.length; i++)
            {
               receiptSelected = me.receiptSelected[i];
               amount += Number(receiptSelected.get('subtotal'));
               itemsPurchased += Number(receiptSelected.get('itemsPurchased'));
               visits++;
            }
            break;
         }
         case 'Visit' :
         {
            visits++;
            break;
         }
         default:
            break;
      }
      console.debug("Amount:$" + amount + ", ItemsPurchased = " + itemsPurchased + ", Visits = " + visits);

      me.dismissDialog = closeDialog;
      me.rewardItemCb();

      params = Ext.merge(params,
      {
         version : Genesis.constants.serverVersion,
         'venue_id' : Genesis.fn.getPrivKey('venueId'),
         data :
         {
            "amount" : amount,
            "items" : Number(itemsPurchased),
            "visits" : Number(visits),
            "type" : 'earn_points',
            'expiry_ts' : new Date().addHours(3).getTime()
         }
      });
      me._params = params['data'];
      params['data'] = me.self.encryptFromParams(params['data']);
      //
      // Update Server
      //
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.establishConnectionMsg
      });
      //Ext.device.Notification.dismiss();

      console.debug("Updating Server with Reward information ... dismissDialog(" + me.dismissDialog + ")");
      PurchaseReward['setMerchantEarnPointsURL']();
      PurchaseReward.load(1,
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         doNotRetryAttempt : true,
         params : params,
         callback : function(record, operation)
         {
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful())
            {
               var metaData = proxy.getReader().metaData;
               Ext.device.Notification.show(
               {
                  title : me.earnPtsTitle,
                  message : me.rewardSuccessfulMsg,
                  buttons : ['OK'],
                  callback : function()
                  {
                     me.onDoneTap();
                  }
               });
               //
               // Store to Receipt Database
               //
               if (posEnabled)
               {
                  var x, receipts = [], receipt, rstore = Ext.StoreMgr.get('ReceiptStore');

                  for (var i = 0; i < me.receiptSelected.length; i++)
                  {
                     if (metaData['txn_id'] && (metaData['txn_id'] > 0))
                     {
                        me.receiptSelected[i].set('txnId', metaData['txn_id']);
                     }
                     receipts.push(me.receiptSelected[i].getData(true));
                     for (var j = 0; j < receipts[i]['items'].length; j++)
                     {
                        delete receipts[i]['items'][j]['id'];
                     }
                  }
                  //
                  // Add to Earned store
                  //
                  me.getApplication().getController('server' + '.Receipts').fireEvent('addEarnedReceipt', me.receiptSelected);
                  //
                  // Refresh Store
                  //
                  me.getReceiptsList().deselectAll();
                  rstore.filter();
               }
            }
            else
            {
               //proxy._errorCallback = Ext.bind(me.onDoneTap, me);
               proxy.supressErrorsPopup = true;
               if (proxy.getReader().metaData)
               {
                  switch(proxy.getReader().metaData['rescode'])
                  {
                     case 'unregistered_account' :
                     {
                        //
                        //
                        //
                        Ext.device.Notification.show(
                        {
                           title : me.earnPtsTitle,
                           message : me.unRegAccountMsg(),
                           buttons : ['Register', 'Cancel'],
                           callback : function(btn)
                           {
                              proxy.supressErrorsCallbackFn();
                              if (btn.toLowerCase() == 'register')
                              {
                                 me.onEnterPhoneNum();
                              }
                              else
                              {
                                 me.onDoneTap();
                              }
                           }
                        });
                        return;
                        break;
                     }
                     default :
                        break;
                  }
               }
               Ext.device.Notification.show(
               {
                  title : me.earnPtsTitle,
                  message : me.rewardFailedMsg,
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     proxy.supressErrorsCallbackFn();
                     me.onDoneTap();
                  }
               });
            }
         }
      });
   },
   onRewardItem : function(automatic)
   {
      var me = this, viewport = me.getViewPortCntlr(), proxy = PurchaseReward.getProxy();

      me.dismissDialog = false;
      if (!automatic)
      {
         return;
      }

      if (!me._actions)
      {
         me._actions = Ext.create('Genesis.view.widgets.PopupItemDetail',
         {
            iconType : 'prizewon',
            icon : 'rss',
            //cls : 'viewport',
            title : me.lookingForMobileDeviceMsg(),
            buttons : [
            {
               text : me.mobilePhoneInputMsg,
               ui : 'action',
               handler : Ext.bind(me.rewardItemCb, me, ['manual'])
            },
            {
               text : 'Cancel',
               ui : 'cancel',
               handler : Ext.bind(me.rewardItemCb, me, ['cancel'])
            }]
         });
         Ext.Viewport.add(me._actions);
      }
      viewport.popUpInProgress = true;
      me._actions.show();

      me.identifiers = null;
      me.getLocalID(function(ids)
      {
         me.identifiers = ids;
         me.rewardItemFn(
         {
            data :
            {
               'frequency' : me.identifiers['localID']
            }
         }, true);
      }, function()
      {
         me._actions.hide();
         me.onDoneTap();
      }, Ext.bind(me.onRewardItem, me, arguments));
      viewport.setActiveController(me);
   },
   // --------------------------------------------------------------------------
   // Amount Tab
   // --------------------------------------------------------------------------
   onEnterPhoneNum : function()
   {
      var me = this, amount = me.validateAmount(), container = me.getRewardsContainer();

      if (amount < 0)
      {
         return;
      }
      if (debugMode)
      {
         me.getCalcBtn()['hide']();
      }
      container.setActiveItem(1);
   },
   onEarnPtsTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRewardsContainer(), amount = me.validateAmount();

      if (amount < 0)
      {
         return;
      }

      /*
       Ext.defer(function()
       {
       var qrcodeMetaData = me.self.genQRCodeFromParams(
       {
       "amount" : amount,
       "type" : 'earn_points'
       }, 'reward', false);
       me.getQrcode().setStyle(
       {
       'background-image' : 'url(' + qrcodeMetaData[0] + ')',
       'background-size' : Genesis.fn.addUnit(qrcodeMetaData[1] * 1.25) + ' ' + Genesis.fn.addUnit(qrcodeMetaData[2] * 1.25)
       });
       }, 1, me);
       console.debug("Encrypting QRCode with Price:$" + amount);
       */
      /*
       me.getTitle().setData(
       {
       price : '$' + amount
       });
       container.setActiveItem(2);
       */

      me.setMode('Manual');
      me.fireEvent('rewarditem', b);
   },
   onRewardDetailTap : function(b, e, eOpts, eInfo)
   {
      var me = this;

      me.setMode('POS_Detail');
      me.fireEvent('rewarditem', b);
   },
   onRewardSelectionTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRewardsContainer(), receiptsList = me.getReceiptsList(), selection = receiptsList.getSelection();

      if (selection && (selection.length > 0))
      {
         me.receiptSelected = selection;
         me.setMode('POS_Selection');
         me.fireEvent('rewarditem', b);
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : me.earnPtsTitle,
            message : me.selectRewardMsg,
            buttons : ['Cancel']
         });
      }
   },
   onCalcBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var amountField = me.getAmount();
      var value = b.getText();
      switch (value)
      {
         case 'AC' :
         {
            amountField.reset();
            break;
         }
         default :
            var amountFieldLength = amountField.getValue().length, amount = Number(amountField.getValue() || 0);

            if (amountFieldLength < 2)
            {
               if ((amount == 0) && (amountFieldLength > 0))
               {
                  amount += value;
               }
               else
               {
                  amount = (10 * amount) + Number(value);
               }
            }
            else
            {
               if (amountFieldLength == 2)
               {
                  amount = (amount + value) / 100;
               }
               else
               {
                  amount = (10 * amount) + (Number(value) / 100);
               }
               amount = amount.toFixed(2);
            }

            // Max value
            if (amount <= me.maxValue)
            {
               amountField.setValue(amount);
            }
            break;
      }
   },
   onStampBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var amountField = me.getItemsPurchased();
      var value = b.getText();
      switch (value)
      {
         case 'AC' :
         {
            amountField.reset();
            break;
         }
         default :
            var amountFieldLength = amountField.getValue().length, amount = Number(amountField.getValue() || 0);

            if ((amount == 0) && (amountFieldLength > 0))
            {
               amount = Number(value);
            }
            else
            {
               amount = (10 * amount) + Number(value);
            }

            // Max value
            if (amount <= me.maxStampValue)
            {
               amountField.setValue(amount);
            }
            break;
      }
   },
   // --------------------------------------------------------------------------
   // TAG ID Tab
   // --------------------------------------------------------------------------
   onTagIdBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, value = b.getText();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      switch (value)
      {
         case 'AC' :
         {
            phoneIdField.reset();
            break;
         }
         default :
            if (phoneIdFieldLength < me.phoneIdMaxLength)
            {
               phoneId += value;
               phoneIdField.setValue(phoneId);
            }
            break;
      }
   },
   onTagItTap : function()
   {
      var me = this, viewport = me.getViewPortCntlr();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      if (phoneIdFieldLength == me.phoneIdMaxLength)
      {
         me.self.playSoundFile(viewport.sound_files['nfcEnd']);
         me.onEarnPtsTap(null);

         me.onNfc(
         {
            id : (me._params) ? me._params['uid'] : null,
            result :
            {
               'tagID' : (me._params) ? me._params['tag_id'] : null,
               'phoneID' : phoneId
            }
         });
         delete me._params;
         /*
          Ext.device.Notification.show(
          {
          title : me.earnPtsTitle,
          message : me.earnPtsConfirmMsg,
          buttons : ['Confirm', 'Cancel'],
          callback : function(btn)
          {
          if (btn.toLowerCase() == 'confirm')
          {
          me.onNfc(
          {
          id : (me._params) ? me._params['uid'] : null,
          result :
          {
          'tagID' : (me._params) ? me._params['tag_id'] : null,
          'phoneID' : phoneId
          }
          });
          delete me._params;
          }
          else
          {
          me.onDoneTap();
          }
          }
          });
          */
      }
      else
      {
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         Ext.device.Notification.show(
         {
            title : me.earnPtsTitle,
            message : me.invalidPhoneIdFormatMsg(me.phoneIdMaxLength),
            buttons : ['Dismiss']
         });
      }
   },
   // --------------------------------------------------------------------------
   // Misc Event Funcs
   // --------------------------------------------------------------------------
   onRptCloseTap : function(b, e)
   {
      var me = this;
      var container = me.getRewardsContainer();
      if (container)
      {
         container.setActiveItem(2);
         me.getRptCloseBB()['hide']();
         me.getBackBB()['show']();
         if (debugMode)
         {
            me.getCalcBtn()['show']();
         }
      }
   },
   onReceiptDisclose : function(list, record, target, index, e, eOpts, eInfo)
   {
      var me = this, viewport = me.getViewPortCntlr(), container = me.getRewardsContainer(), animation = container.getLayout().getAnimation();

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      if (container)
      {
         animation.setDirection('left');
         container.setActiveItem(3);

         var store = me.getReceiptDetail().getStore();
         store.setData(
         {
            receipt : Ext.decode(record.get('receipt'))
         });
         me.receiptSelected = [record];
         me.getRptCloseBB()['show']();
         me.getBackBB()['hide']();
         if (debugMode)
         {
            me.getCalcBtn()['show']();
         }
      }
   },
   onReceiptStoreUpdate : function(store)
   {
      var me = this, db = Genesis.db.getLocalDB(), list = me.getReceiptsList(), visible = (store.getCount() > 0) ? 'show' : 'hide';
      var posEnabled = pos.isEnabled();

      if (list)
      {
         console.debug("Refreshing ReceiptStore ... count[" + store.getCount() + "]");
         //store.setData(store.getData().all);

         if (posEnabled && me.getRewardTBar())
         {
            me.getRewardTBar()[visible]();
            me.getTableSelectField()[visible]();
         }
      }
      else
      {
         //console.debug("onReceiptStoreUpdate - list not avail for update");
      }
   },
   onTableSelectFieldChange : function(field, newValue, oldValue, eOpts)
   {
      var me = this, store = Ext.StoreMgr.get('ReceiptStore');

      store.tableFilterId = (newValue != 'None') ? newValue : null;
      console.debug("Filter by Table[" + store.tableFilterId + "] ...");

      //
      // Wait for animation to complete before we filter
      //
      Ext.defer(function()
      {
         store.filter();
         //me.onReceiptStoreUpdate(store);
      }, 1 * 1000);
   },
   // --------------------------------------------------------------------------
   // Misc Event Funcs
   // --------------------------------------------------------------------------
   onDoneTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRewardsContainer(), db = Genesis.db.getLocalDB(), store = Ext.StoreMgr.get('ReceiptStore');
      var posEnabled = pos.isEnabled();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0);
      delete me._params;
      switch (me.getMode())
      {
         case 'Manual' :
         {
            if (container)
            {
               me.getAmount().reset();
               me.getItemsPurchased().reset();
               container.setActiveItem((posEnabled) ? 2 : manualMode);
            }
            break;
         }
         case 'POS_Detail' :
         {
            if (container)
            {
               container.setActiveItem(3);
            }
            break;
         }
         case 'POS_Selection' :
         {
            if (container)
            {
               container.setActiveItem(2);
            }
            break;
         }
         case 'Visit' :
         {
            me.getViewPortCntlr().setActiveController(me.getApplication().getController('server' + '.MainPage'));
            break;
         }
         default :
            break;
      }
      console.debug("onDoneTap - Mode[" + me.getMode() + "], rewardModel[" + db['rewardModel'] + "]")
      if (me.getCalcBtn())
      {
         me.getCalcBtn()[(posEnabled) ? 'show' : 'hide']();
      }

      console.debug("Rewards onDoneTap Called ...");
   },
   onNfc : function(nfcResult)
   {
      var me = this;
      me.rewardItemFn(
      {
         data :
         {
            'uid' : (nfcResult) ? nfcResult.id : null,
            'tag_id' : (nfcResult) ? nfcResult.result['tagID'] : null,
            'phone_id' : (nfcResult) ? nfcResult.result['phoneID'] : null
         }
      }, true);
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   earnPtsPage : function()
   {
      var me = this;
      var page = me.getRewards();
      me.setAnimationMode(me.self.animationMode['cover']);
      me.pushView(page);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      var page = this.getRewards();
      return page;
   },
   openPage : function(subFeature)
   {
      var me = this, db = Genesis.db.getLocalDB(), posEnabled = pos.isEnabled();

      switch (subFeature)
      {
         case 'rewards':
         {
            switch (db['rewardModel'])
            {
               case 'visits' :
               {
                  if (!posEnabled)
                  {
                     me.setMode('Visit');
                     me.fireEvent('rewarditem', subFeature);
                     break;
                  }
               }
               case 'amount_spent' :
               case 'items_purchased' :
               default:
                  me.redirectTo('earnPts');
                  break;
            }
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

Ext.define('Genesis.controller.server.Redemptions',
{
   extend : 'Genesis.controller.RewardRedemptionsBase',
   mixins :
   {
      redeemBase : 'Genesis.controller.server.mixin.RedeemBase'
   },
   requires : ['Ext.data.Store', 'Genesis.view.server.Redemptions'],
   inheritableStatics :
   {
   },
   xtype : 'serverRedemptionsCntlr',
   config :
   {
      redeemPointsFn : 'setMerchantRedeemPointsURL',
      routes :
      {
      },
      refs :
      {
         backBtn : 'serverredemptionsview button[tag=back]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverredemptionsview',
            autoCreate : true,
            xtype : 'serverredemptionsview'
         },
         redemptionsList : 'serverredemptionsview list[tag=redemptionsList]',
         redeemItemCardContainer : 'serverredeemitemdetailview[tag=redeemReward] container[tag=redeemItemCardContainer]',
         redeemItemButtonsContainer : 'serverredeemitemdetailview[tag=redeemReward] container[tag=bottomButtons]',
         phoneId : 'serverredeemitemdetailview[tag=redeemReward] calculator[tag=phoneId] textfield',
         mRedeemBtn : 'serverredeemitemdetailview[tag=redeemReward] button[tag=merchantRedeem]',
         //
         // Redeem Rewards
         //
         sBackBB : 'serverredeemitemdetailview[tag=redeemReward] button[tag=back]',
         sCloseBB : 'serverredeemitemdetailview[tag=redeemReward] button[tag=close]',
         authText : 'serverredeemitemdetailview[tag=redeemReward] component[tag=authText]',
         redeemItem :
         {
            selector : 'serverredeemitemdetailview[tag=redeemReward]',
            autoCreate : true,
            tag : 'redeemReward',
            xtype : 'serverredeemitemdetailview'
         }
      },
      control :
      {
         mRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         },
         redeemItemCardContainer :
         {
            activeitemchange : 'onRedeemItemCardContainerActivate'
         },
         'serverredeemitemdetailview[tag=redeemReward] calculator[tag=phoneId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverredeemitemdetailview[tag=redeemReward] calculator[tag=phoneId] container[tag=bottomButtons] button[tag=redeemTagId]' :
         {
            tap : 'onTagItTap'
         }
      },
      listeners :
      {
      }
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      me.callParent(arguments);
      me.mixins.redeemBase.onRedeemItemActivate.apply(me, arguments);
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.mixins.redeemBase.onNfc.apply(me, arguments);
   }
   // --------------------------------------------------------------------------
   // Redemption Page
   // --------------------------------------------------------------------------
});
Ext.define('Genesis.controller.server.Prizes',
{
   extend : 'Genesis.controller.PrizeRedemptionsBase',
   mixins :
   {
      redeemBase : 'Genesis.controller.server.mixin.RedeemBase'
   },
   requires : ['Ext.data.Store', 'Genesis.view.server.Prizes'],
   inheritableStatics :
   {
   },
   xtype : 'serverPrizesCntlr',
   config :
   {
      redeemPointsFn : 'setMerchantRedeemPointsURL',
      routes :
      {
         'authReward' : 'authRewardPage'
      },
      refs :
      {
         backBtn : 'serverprizesview button[tag=back]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverprizesview',
            autoCreate : true,
            xtype : 'serverprizesview'
         },
         redemptionsList : 'serverprizesview list[tag=prizesList]',
         redeemItemCardContainer : 'serverredeemitemdetailview[tag=redeemPrize] container[tag=redeemItemCardContainer]',
         redeemItemButtonsContainer : 'serverredeemitemdetailview[tag=redeemPrize] container[tag=bottomButtons]',
         phoneId : 'serverredeemitemdetailview[tag=redeemPrize] calculator[tag=phoneId] textfield',
         mRedeemBtn : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=merchantRedeem]',
         //
         // Reward Prize
         //
         sBackBB : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=back]',
         sCloseBB : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=close]',
         authText : 'serverredeemitemdetailview[tag=redeemPrize] component[tag=authText]',
         redeemItem :
         {
            selector : 'serverredeemitemdetailview[tag=redeemPrize]',
            autoCreate : true,
            tag : 'redeemPrize',
            xtype : 'serverredeemitemdetailview'
         }
      },
      control :
      {
         mRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         },
         redeemItemCardContainer :
         {
            activeitemchange : 'onRedeemItemCardContainerActivate'
         },
         'serverredeemitemdetailview[tag=redeemPrize] calculator[tag=phoneId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverredeemitemdetailview[tag=redeemPrize] calculator[tag=phoneId] container[tag=bottomButtons] button[tag=redeemTagId]' :
         {
            tap : 'onTagItTap'
         }
      },
      listeners :
      {
         //
         // Redeem Prize
         //
         'authreward' : 'onAuthReward',
         'refreshQRCode' : 'onRefreshQRCode'
      }
   },
   redeemPtsConfirmMsg : 'Please confirm to submit',
   init : function()
   {
      var me = this;
      me.callParent(arguments);

      console.log("Prizes Server Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.mixins.redeemBase.onNfc.apply(me, arguments);
   },
   onAuthReward : function(redeemItem)
   {
      this.redeemItem = redeemItem;
      this.redirectTo('authReward');
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      me.callParent(arguments);
      me.mixins.redeemBase.onRedeemItemActivate.apply(me, arguments);
   },
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      if (me.getRedeemMode() == 'authReward')
      {
         me.getApplication().getController('server' + '.Challenges').onRedeemItemDeactivate(oldActiveItem, c, newActiveItem, eOpts);
      }
      me.callParent(arguments);
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   authRewardPage : function()
   {
      this.setTitle('Challenges');
      this.openPage('authReward');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
Ext.merge(WebSocket.prototype,
{
   reconnectTimeoutTimer : 5 * 60 * 1000,
   reconnectTimer : 10 * 1000,
   createReceipt : function(receiptText)
   {
      var me = this, i, match, currItemPrice = 0, maxItemPrice = 0, id = receiptText[0], matchFlag = 0x0000, rc = null;

      receiptText.splice(0, 1);
      var receipt =
      {
         id : id,
         subtotal : currItemPrice.toFixed(2),
         price : currItemPrice.toFixed(2),
         table : '',
         itemsPurchased : 0,
         title : '',
         receipt : Ext.encode(receiptText),
         items : []
      }

      //console.debug("WebSocketClient::createReceipt[" + Genesis.fn.convertDateFullTime(new Date(receipt['id']*1000)) + "]");
      for ( i = 0; i < receiptText.length; i++)
      {
         var text = receiptText[i];
         if (text.length > me.receiptFilters['minLineLength'])
         {
            match = me.receiptFilters['subtotal'].exec(text);
            if (match)
            {
               matchFlag |= 0x00001;
               receipt['subtotal'] = match[1];
               continue;
            }

            match = me.receiptFilters['grandtotal'].exec(text);
            if (match)
            {
               matchFlag |= 0x00010;
               receipt['price'] = match[1];
               continue;
            }

            match = me.receiptFilters['table'].exec(text);
            if (match)
            {
               matchFlag |= 0x00100;
               receipt['tableName'] = match[1];
               continue;
            }

            match = me.receiptFilters['item'].exec(text);
            if (match)
            {
               matchFlag |= 0x01000;
               var qty = Number(match[2]);
               var currItemPrice = (Number(match[3]) / qty);
               receipt['items'].push(new Ext.create('Genesis.model.frontend.ReceiptItem',
               {
                  qty : qty,
                  price : currItemPrice,
                  name : match[1].trim()
               }));
               //
               // Find Most expensive Item
               //
               if (Math.max(currItemPrice, maxItemPrice) == currItemPrice)
               {
                  maxItemPrice = currItemPrice;
                  receipt['title'] = match[1].trim();
               }
               //
               // Count Stamps
               //
               if (me.receiptFilters['itemsPurchased'])
               {
                  match = me.receiptFilters['itemsPurchased'].exec(text);
                  if (match)
                  {
                     matchFlag |= 0x10000;
                     receipt['itemsPurchased'] += qty;
                     //console.debug("WebSocketClient::createReceipt - Stamps(" + receipt['itemsPurchased'] + ")");
                  }
               }

               continue;
            }
         }
      }
      //
      // Meet minimum crtieria to be considered a valid receipt
      //
      if (((matchFlag & 0x00011) && !me.receiptFilters['itemsPurchased']) || //
      ((matchFlag & 0x10011) && me.receiptFilters['itemsPurchased']))
      {
         rc = Ext.create("Genesis.model.frontend.Receipt", receipt);
         rc['items']().add(receipt['items']);
         //console.debug("WebSocketClient::createReceipt");
      }

      return rc;
   },
   receiptIncomingHandler : function(receipts, supress)
   {
      var receiptsList = [], tableList = [], receiptMetaList = [];
      for (var i = 0; i < receipts.length; i++)
      {
         var receipt = this.createReceipt(receipts[i]);
         if (receipt)
         {
            if (receipt.get('tableName'))
            {
               //console.debug("WebSocketClient::receiptIncomingHandler");
               tableList.push(Ext.create('Genesis.model.frontend.Table',
               {
                  id : receipt.get('tableName')
               }));
            }

            //console.debug("WebSocketClient::receiptIncomingHandler");
            if (!supress)
            {
               console.debug("WebSocketClient::receiptIncomingHandler - \n" + //
               "Date: " + Genesis.fn.convertDateFullTime(new Date(receipt.get('id') * 1000)) + '\n' + //
               "Subtotal: $" + receipt.get('subtotal').toFixed(2) + '\n' + //
               "Price: $" + receipt.get('price').toFixed(2) + '\n' + //
               "tableName: " + receipt.get('tableName') + '\n' + //
               "itemsPurchased: " + receipt.get('itemsPurchased') + '\n' + //
               "Title: " + receipt.get('title') + '\n' + //
               "Receipt: [\n" + Ext.decode(receipt.get('receipt')) + "\n]" + //
               "");
            }

            receiptsList.push(receipt);
            receiptMetaList.push(receipt.getData(true));
         }
         else
         {
            console.debug("Receipt[" + i + "] is not valid, discarded.");
         }
      }

      if (!supress)
      {
         //
         // MobileWebServer, we create a popup for cashier to remind customers to use Loyalty Program
         //
         if (!Genesis.fn.isNative() && receiptMetaList.length > 0)
         {
            viewport = _application.getController('server' + '.Viewport');
            if (appWindow)
            {
               appWindow.postMessage(
               {
                  cmd : 'notification_post',
                  receipts : receiptMetaList
               }, appOrigin);
            }
         }

         Ext.StoreMgr.get('ReceiptStore').add(receiptsList);
         Ext.StoreMgr.get('TableStore').add(tableList);
      }

      return [receiptsList, tableList];
   },
   receiptResponseHandler : function(receipts)
   {
      var lists = this.receiptIncomingHandler(receipts, true), rstore = Ext.StoreMgr.get('ReceiptStore'), tstore = Ext.StoreMgr.get('TableStore'), cntlr = _application.getController('server' + '.Receipts');

      lists[1].push(Ext.create("Genesis.model.frontend.Table",
      {
         id : 'None'
      }));
      (lists[0].length > 0) ? rstore.setData(lists[0]) : rstore.clearData();
      rstore.tableFilterId = null;
      tstore.setData(lists[1]);

      console.debug("WebSocketClient::receiptResponseHandler - Processed " + lists[0].length + " Valid Receipts");
      cntlr.receiptCleanFn(Genesis.db.getLocalDB()["displayMode"]);
      Ext.Viewport.setMasked(null);
   }
});

Ext.define('Genesis.controller.server.Receipts',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store', 'Genesis.model.frontend.Receipt', 'Ext.dataview.List', 'Ext.XTemplate', 'Ext.util.DelayedTask'],
   inheritableStatics :
   {
   },
   xtype : 'serverreceiptsCntlr',
   config :
   {
      models : ['Venue', 'Genesis.model.frontend.Receipt', 'Genesis.model.frontend.Table'],
      refs :
      {
         posMode : 'serversettingspageview togglefield[tag=posMode]',
         displayMode : 'serversettingspageview selectfield[tag=displayMode]',
         sensitivity : 'serversettingspageview spinnerfield[tag=sensitivity]',
         receiptList : 'serverrewardsview list[tag=receiptList]'
      },
      control :
      {
         posMode :
         {
            change : 'onPosModeChange'
         },
         displayMode :
         {
            change : 'onDisplayModeChange'
         },
         sensitivity :
         {
            change : 'onSensitivityChange'
         }
      },
      listeners :
      {
         'resetEarnedReceipts' : 'onResetEarnedReceipts',
         'addEarnedReceipt' : 'onAddEarnedReceipt',
         'retrieveReceipts' : 'onRetrieveReceipts'
      }
   },
   retrieveReceiptsMsg : 'Retrieving Receipts from POS ...',
   mobileTimeout : 0,
   fixedTimeout : 0,
   cleanupTimer : 4 * 60 * 60 * 1000,
   batteryTimer : 30 * 1000,
   filter_config :
   {

      minLineLength : 5,
      grandtotal : "\\s*\\bGrand Total\\b\\s+\\$(\\d+\.\\d{2})\\s*",
      subtotal : "\\s*\\bSubtotal\\b\\s+\\$(\\d+\.\\d{2})\\s*",
      item : "\\s*([\\w+\\W*]+)\\s+\\(?(\\d+(?=\\@\\$\\d+\\.\\d{2}\\))?).*?\\s+\\$(\\d+\\.\\d{2})",
      table : "\\s*\\bTABLE\\b:\\s+(Bar\\s+\\d+)\\s*",
      itemsPurchased : ""
   },
   _statusInfo :
   {
      isPlugged : false,
      level : 0
   },
   _hyteresisTask : null,
   _syncTask : null,
   _receiptCleanTask : null,
   init : function(app)
   {
      var me = this, db = Genesis.db.getLocalDB();

      me.callParent(arguments);

      me.mobileTimeout = ((debugMode) ? 0.25 : 1) * 60 * 1000;
      me.fixedTimeout = ((debugMode) ? 0.25 : 4 * 60) * 60 * 1000;

      if (db['receiptFilters'])
      {
         WebSocket.prototype.receiptFilters = Ext.clone(db['receiptFilters']);
         for (filter in db['receiptFilters'])
         {
            if (isNaN(db['receiptFilters'][filter]))
            {
               WebSocket.prototype.receiptFilters[filter] = new RegExp(db['receiptFilters'][filter], "i");
            }
         }
      }

      console.log("Server Receipts Init");

      me.initEvent();
      me.initStore();
      me.initWorker();
   },
   initEvent : function()
   {
      var me = this;
      window.addEventListener("batterystatus", function(info)
      {
         if (!me._hyteresisTask)
         {
            me._hyteresisTask = Ext.create('Ext.util.DelayedTask');
         }
         me._hyteresisTask.delay(me.batteryTimer, me.batteryStatusFn, me, [info]);
      }, false);
      window.addEventListener("batterylow", function(info)
      {
         if (Ext.device)
         {
            Ext.device.Notification.show(
            {
               title : 'Battery Level Low',
               message : 'Battery is at ' + info.level + '%',
               buttons : ['Dismiss']
            });
            Ext.device.Notification.vibrate();
         }
      }, false);
      window.addEventListener("batterycritical", function(info)
      {
         if (Ext.device)
         {
            Ext.device.Notification.show(
            {
               title : 'Battery Level Critical',
               message : 'Battery is at ' + info.level + '%' + '\n' + //
               'Recharge Soon!',
               buttons : ['Dismiss']
            });
            Ext.device.Notification.vibrate();
            Ext.device.Notification.beep();
         }
      }, false);

      me.getApplication().getController('server' + '.Pos').on('onopen', function()
      {
         if (pos.isEnabled())
         {
            pos.wssocket.send('enable_pos:'+ Genesis.db.getLocalDB()['posExec']);
            me.fireEvent('retrieveReceipts');
         }
         else
         {
            console.debug("POS Receipt Feature is disabled");
         }
      });
      console.debug("Server Receipts : initEvent");
   },
   initWorker : function(estore)
   {
      var me = this;
      Ext.StoreMgr.get('EarnedReceiptStore').load(
      {
         callback : function(records, operation, success)
         {
            if (operation.wasSuccessful())
            {
               console.debug("restoreReceipt  --- Restored " + records.length + " Receipts from the KickBak-Receipt DB");
               pos.initReceipt |= 0x01;
               me.fireEvent('retrieveReceipts');
            }
         }
      });
      console.debug("Server Receipts : initWorker");
   },
   initStore : function()
   {
      var me = this, estore;

      Ext.regStore('TableStore',
      {
         model : 'Genesis.model.frontend.Table',
         autoLoad : false,
         sorters : [
         {
            sorterFn : function(record1, record2)
            {
               var a, b, a1, b1, i = 0, n, L, rx = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
               if (record1.data['id'] === record2.data['id'])
                  return 0;

               if (record1.data['id'] == 'None')
               {
                  return -1;
               }
               if (record2.data['id'] == 'None')
               {
                  return 1;
               }
               a = record1.data['id'].toLowerCase().match(rx);
               b = record2.data['id'].toLowerCase().match(rx);
               L = a.length;
               while (i < L)
               {
                  if (!b[i])
                     return 1;
                  a1 = a[i], b1 = b[i++];
                  if (a1 !== b1)
                  {
                     n = a1 - b1;
                     if (!isNaN(n))
                        return n;
                     return a1 > b1 ? 1 : -1;
                  }
               }
               return b[i] ? -1 : 0;
            },
            direction : 'ASC'
         }]
      });

      //
      // Store to cache whatever the server sends back
      //
      Ext.regStore('ReceiptStore',
      {
         model : 'Genesis.model.frontend.Receipt',
         autoLoad : false,
         //
         // Receipts sorted based on time
         //
         sorters : [
         {
            property : 'id',
            direction : 'DESC'
         }],
         //
         // Receipts that have not been redeemed
         //
         filters : [
         {
            //
            // Filter out any "Earned Receipts"
            //
            filterFn : function(item)
            {
               return ((estore.find('id', item.getId()) >= 0) ? false : true);
            }
         },
         {
            //
            // Filter out based on "Table Number"
            //
            filterFn : Ext.bind(me.tableFilterFn, me)
         }]
      });

      //
      // Store containing all the recent receipts earned by the loyalty program
      //
      Ext.regStore('EarnedReceiptStore',
      {
         model : 'Genesis.model.frontend.Receipt',
         autoSync : true,
         autoLoad : false,
         //
         // Receipts sorted based on time
         //
         sorters : [
         {
            property : 'id',
            direction : 'DESC'
         }]
      });
      estore = Ext.StoreMgr.get('EarnedReceiptStore');

      console.debug("Server Receipts : initStore");
   },
   updateMetaDataInfo : function(metaData, forced)
   {
      var me = this, db = Genesis.db.getLocalDB();
      try
      {
         me.posIntegrationHandler(metaData, db['isPosEnabled'], forced);
      }
      catch(e)
      {
         console.debug("updateMetaDataInfo Exception - " + e);
      }
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Callback Handlers
   // --------------------------------------------------------------------------
   posIntegrationHandler : function(metaData, posEnabled, forced)
   {
      var me = this, db = Genesis.db.getLocalDB(), features_config = metaData['features_config'];

      db['posExec'] = features_config['pos_exec'] || 'workstation';
      db['enablePosIntegration'] = features_config['enable_pos'];
      db['isPosEnabled'] = ((posEnabled === undefined) || (posEnabled));
      if (pos.isEnabled())
      {
         var filters = features_config['receipt_filter'] = (features_config['receipt_filter'] ||
         {
         });
         db['receiptFilters'] =
         {
            minLineLength : filters['min_line_length'] || me.filter_config['minLineLength'],
            grandtotal : filters['grand_total'] || me.filter_config['grandtotal'],
            subtotal : filters['subtotal'] || me.filter_config['subtotal'],
            item : filters['item'] || me.filter_config['item'],
            table : filters['table'] || me.filter_config['table'],
            itemsPurchased : filters['items_purchased'] || me.filter_config['itemsPurchased']
         }

         WebSocket.prototype.receiptFilters = Ext.clone(db['receiptFilters']);
         for (filter in db['receiptFilters'])
         {
            if (isNaN(db['receiptFilters'][filter]))
            {
               WebSocket.prototype.receiptFilters[filter] = new RegExp(db['receiptFilters'][filter], "i");
            }
         }
         //console.debug("receiptFilters - " + Ext.encode(db['receiptFilters']));
         pos.connect(forced);
         console.debug("posIntegrationHandler - Enabled " + ((forced) ? "(Forced)" : ""));
      }
      else
      {
         var store = Ext.StoreMgr.get('ReceiptStore');
         pos.disconnect(true);
         store.removeAll();
         store.remove(store.getRange());
         delete WebSocket.prototype.receiptFilters;
         // BUG: We have to remove the filtered items as well
         console.debug("posIntegrationHandler - Disabled");
      }
      db['enableReceiptUpload'] = features_config['enable_sku_data_upload'];
      db['enablePrizes'] = features_config['enable_prizes'];

      Genesis.db.setLocalDB(db);
      Genesis.controller.ViewportBase.prototype.onActivate.call(me.getViewPortCntlr());
   },
   batteryStatusFn : function(info)
   {
      var me = this, displayMode = Genesis.db.getLocalDB["displayMode"];

      info = info || me._statusInfo;
      console.debug("Device is " + ((info.isPlugged) ? "Plugged" : "Unplugged") + ", Battery " + info.level + "%");

      var plugStatusChanged = me._statusInfo.isPlugged !== info.isPlugged;

      if (!info.isPlugged)
      {
         if (me._syncTask)
         {
            me._syncTask.cancel();
         }
      }
      else
      {
         //
         // Minimum of 3% Battery
         //
         if (Ext.device && //
         (plugStatusChanged || (me._statusInfo === info)) && //
         (info.level >= 3))
         {
            switch (displayMode)
            {
               case 'Fixed' :
               {
                  me.syncReceiptDB(me.fixedTimeout);
                  break;
               }
               case 'Mobile':
               default :
                  me.syncReceiptDB(me.mobileTimeout);
                  break;
            }
         }
      }
      me._statusInfo = info;
   },
   receiptCleanFn : function(displayMode)
   {
      var me = this;
      if (!me._receiptCleanTask)
      {
         me._receiptCleanTask = Ext.create('Ext.util.DelayedTask', function()
         {
            var store = Ext.StoreMgr.get('ReceiptStore'), tstore = Ext.StoreMgr.get('TableStore');
            var records = store.getRange(), record, time;
            var items = [], tableList = [], fourhrsago = (new Date()).addHours(-4).getTime();
            var updateTableFilter = true;

            for (var i = 0, j = 0; i < records.length; i++)
            {
               record = records[i];
               time = record.getId() * 1000;

               //
               // Flush out old entries
               //
               if (fourhrsago > time)
               {
                  items.push(record);
               }
               else
               {
                  //console.debug("WebSocketClient::receiptIncomingHandler");
                  tableList[j++] = Ext.create('Genesis.model.frontend.Table',
                  {
                     id : record.get('tableName')
                  });

                  if (store.tableFilterId == record.get('tableName'))
                  {
                     updateTableFilter = false;
                  }
               }
            }
            if (items.length > 0)
            {
               store.remove(items);
            }
            //if (tableList.length > 0)
            {
               tableList.push(Ext.create("Genesis.model.frontend.Table",
               {
                  id : 'None'
               }));
               tstore.setData(tableList);
            }
            if (updateTableFilter)
            {
               store.tableFilterId = null;
            }

            console.debug("receiptCleanFn - Removed " + items.length + " old records from the Receipt Store\n" + //
            "4hrs till the next cleanup");
            me._receiptCleanTask.delay(me.cleanupTimer);
         });
      }
      switch (displayMode)
      {
         //
         // We need to clean up on a periodic basis for we don't accumulate too many receipts
         //
         case 'Fixed' :
         {
            console.debug("receiptCleanFn(Enabled) --- DisplayMode(" + displayMode + ")\n" + //
            "Cleanup is scheduled to start in 4hrs");
            me._receiptCleanTask.delay(me.cleanupTimer);
            break;
         }
         //
         // No need to clean, it will clean up itself whenever the mobile phone reconnects with the POS
         //
         case 'Mobile':
         default :
            console.debug("receiptCleanFn(Disabled) --- DisplayMode(" + displayMode + ")");
            me._receiptCleanTask.cancel();
            break;
      }
   },
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   updateReceipts : function(receipts)
   {
      var estore = Ext.StoreMgr.get('EarnedReceiptStore');
      estore.remove(receipts);
      console.debug("updateReceipts --- Updated(synced) " + receipts.length + " Receipts in the KickBak-Receipt DB");
   },
   uploadReceipts : function(result, receipts, ids)
   {
      var me = this, proxy = Venue.getProxy(), db = Genesis.db.getLocalDB();
      var displayMode = db["displayMode"], enableReceiptUpload = db['enableReceiptUpload'], posEnabled = pos.isEnabled();
      var params =
      {
         version : Genesis.constants.serverVersion,
         'venue_id' : Genesis.fn.getPrivKey('venueId'),
         data :
         {
            "receipts" : receipts
            //,"type" : 'earn_points',
            //'expiry_ts' : new Date().addHours(3).getTime()
         }
      };

      //
      // Don't upload
      //
      if (!posEnabled || (posEnabled && !enableReceiptUpload))
      {
         me.updateReceipts(result);
         console.debug("Successfully DISCARDED " + receipts.length + " Receipt updated(s) to Server");
         return;
      }

      params['data'] = me.self.encryptFromParams(params['data']);
      Venue['setMerchantReceiptUploadURL'](params['venue_id']);
      Venue.load(1,
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         doNotRetryAttempt : false,
         params : params,
         callback : function(record, operation)
         {
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful())
            {
               me.updateReceipts(result);
               console.debug("Successfully Uploaded " + receipts.length + " Receipt(s) to Server");
            }
            else
            {
               console.debug("Error Uploading Receipt information to Server");
               proxy.supressErrorsPopup = true;
               proxy.quiet = false;
               //
               // Try again at next interval
               //
               switch (displayMode)
               {
                  case 'Fixed' :
                  {
                     me.syncReceiptDB(me.fixedTimeout);
                     break;
                  }
                  case 'Mobile':
                  default :
                     me.syncReceiptDB(me.mobileTimeout);
                     break;
               }
            }
         }
      });
   },
   syncReceiptDB : function(duration)
   {
      var me = this, estore = Ext.StoreMgr.get('EarnedReceiptStore');

      //
      // Wait for time to expire before Uploading Earned Receipts to KickBak server
      //
      if (!me._syncTask)
      {
         me._syncTask = Ext.create('Ext.util.DelayedTask', function()
         {
            var allRecords = Ext.StoreMgr.get('ReceiptStore').getData().all;

            var oldestReceipt = Number.MAX_VALUE;
            for (var i = 0; i < allRecords.length; i++)
            {
               var rec = allRecords[i];
               if (Math.min(rec.getId(), oldestReceipt) == rec.getId())
               {
                  oldestReceipt = rec.getId();
               }
               //console.debug("syncReceiptDB - TimeStamp[" + Genesis.fn.convertDateFullTime(new Date(rec.getId()*1000)) + "]");
            }

            var startIndex, lastReceiptTime = (oldestReceipt == Number.MAX_VALUE) ? 0 : oldestReceipt;
            if (( startIndex = estore.findBy(function(record, id)
            {
               return (id <= lastReceiptTime);
            }, me)) >= 0)
            {
               var items = [], ids = [], item, result = estore.getRange();

               for (var i = startIndex; i < result.length; i++)
               {
                  //console.debug("uploadReceipts  --- item=" + result[i]['receipt']);
                  item = result[i].getData(true);
                  //console.debug("uploadReceipts  --- item[txnId]=" + item['txnId'] + ", item[items]=" +
                  // Ext.encode(item['items']));
                  for (var j = 0; j < item['items'].length; j++)
                  {
                     delete item['items']['receipt_id'];
                  }
                  items.push(
                  {
                     txnId : item['txnId'],
                     items : item['items']
                  });
                  ids.push(item['id']);
               }
               console.debug("syncReceiptsDB  --- Found(unsync) " + items.length + " Receipts to Upload to Server");

               if (items.length > 0)
               {
                  me.uploadReceipts(result, items, ids);
               }
            }
         });
      }

      me._syncTask.delay(duration);
      console.debug("syncReceiptDB - process starting in " + (duration / (1000 * 60)).toFixed(0) + "mins");
   },
   tableFilterFn : function(item)
   {
      var me = this, store = Ext.StoreMgr.get('ReceiptStore');
      return (store.tableFilterId) ? (item.get("table") == store.tableFilterId) : true;
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onPosModeChange : function(field, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      if (viewport.getMetaData())
      {
         var posEnabled = (field.getValue() == 1) ? true : false;
         Genesis.db.setLocalDBAttrib('isPosEnabled', posEnabled);
         console.debug("onPosModeChange - " + posEnabled);
         me.updateMetaDataInfo(viewport.getMetaData(), true);
         //
         // Update Native Code
         //
         if (Genesis.fn.isNative())
         {
            window.plugins.WifiConnMgr.setIsPosEnabled(pos.isEnabled());
         }
      }
      else
      {
         //
         // Revert to original value
         //
         Ext.defer(function()
         {
            field.toggle();
         }, 1);
      }
   },
   onDisplayModeChange : function(field, newValue, oldValue, eOpts)
   {
      var me = this;
      Genesis.db.setLocalDBAttrib("displayMode", newValue);
      console.debug("onDisplayModeChange - " + newValue);
      me.receiptCleanFn(newValue);
      me.batteryStatusFn();
   },
   onSensitivityChange : function(field, newValue, oldValue, eOpts)
   {
      var me = this;
      Genesis.db.setLocalDBAttrib("sensitivity", newValue);
      me.getSensitivity().setLabel('Sensitivity (' + newValue + ')');
      console.debug("onSensitivityChange - " + newValue);
   },
   onAddEarnedReceipt : function(receipt)
   {
      var estore = Ext.StoreMgr.get('EarnedReceiptStore');
      estore.add(receipt);

      console.debug("addEarnedReceipt --- Successfully added KickBak-Receipt");
   },
   onResetEarnedtReceipts : function()
   {
      var estore = Ext.StoreMgr.get('EarnedReceiptStore');
      estore.removeAll();

      console.debug("resetEarnedReceipts --- Successfully drop KickBak-Receipt Table");
      //
      // Restart because we can't continue without Console Setup data
      //
      if (Genesis.fn.isNative())
      {
         navigator.app.exitApp();
      }
      else
      {
         window.location.reload();
      }

   },
   onRetrieveReceipts : function()
   {
      var me = this;

      console.debug("Receipts::onRetrieveReceipts - pos.initReceipt=" + pos.initReceipt);
      if (pos.initReceipt == 0x11)
      {
         var store = Ext.StoreMgr.get('ReceiptStore');
         var db = Genesis.db.getLocalDB(), lastPosConnectTime = db['lastPosConnectTime'] || 0;

         if (((pos.lastDisconnectTime - lastPosConnectTime) > (pos.wssocket.reconnectTimeoutTimer)) || !store || !(store.getAllCount() > 0))
         {
            console.debug(me.retrieveReceiptsMsg);
            Ext.Viewport.setMasked(null);
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.retrieveReceiptsMsg
            });
            pos.wssocket.send('get_receipts');
         }
         //
         // Refresh List view if nothing is needed for update
         //
         else if (store.getAllCount() > 0)
         {
            me.getReceiptList().refresh();
         }
      }
   }
});
window.pos = null;

Ext.define('Genesis.controller.server.Pos',
{
   extend : 'Ext.app.Controller',
   initReceipt : 0x00,
   lastDisconnectTime : 0,
   scheme : 'ws://',
   hostLocal : '127.0.0.1',
   hostRemote : '192.168.159.1',
   portRemote : '443',
   portLocal : '69', // TFTP UDP Port
   wssocket : null,
   tagReaderTitle : 'Tag Reader',
   lostPosConnectionMsg : 'Reestablishing connection to POS ...',
   init : function(app)
   {
      var me = this, ws = WebSocket.prototype, isNative = Genesis.fn.isNative();

      me.host = (isNative) ? me.hostRemote : me.hostLocal;
      me.url = me.scheme + me.host + ':' + ((isNative) ? me.portRemote : me.portLocal) + "/pos";
      me.connTask = Ext.create('Ext.util.DelayedTask');

      pos = me;

      //
      // For Non-Native environments, we must connect to POS to get NFC tag info regardless
      //
      if (!isNative)
      {
         me.connect();
      }

      console.log("Pos Init");
   },
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   isEnabled : function()
   {
      var db = Genesis.db.getLocalDB(), rc = db['enablePosIntegration'] && db['isPosEnabled'];
      //console.debug("Pos::isPosEnabled(" + rc + ")");
      return rc;
   },
   setupWsCallback : function()
   {
      var me = this;

      me.wssocket.onopen = function(event)
      {
         Ext.Viewport.setMasked(null);
         //
         // Retrieve new connections after 5mins of inactivity
         //
         console.debug("WebSocketClient::onopen");

         me.lastDisconnectTime = Genesis.db.getLocalDB()['lastPosDisconnectTime'] || 0;
         Genesis.db.setLocalDBAttrib('lastPosConnectTime', Date.now());

         if (me.isEnabled())
         {
            me.initReceipt |= 0x10;
         }
         me.wssocket.send('proximityID_stop');
         me.fireEvent('onopen');
      };
      me.wssocket.onerror = function(event)
      {
         console.debug("WebSocketClient::onerror");
         me.fireEvent('onerror');
      };
      me.wssocket.onclose = function(event)
      {
         var timeout = pos.wssocket.reconnectTimer;
         console.debug("WebSocketClient::onclose, " + (timeout / 1000) + "secs before retrying ...");
         //delete WebSocket.store[event._target];
         me.wssocket = null;
         //
         // Reconnect to server continuously
         //
         Genesis.db.setLocalDBAttrib('lastPosDisconnectTime', Date.now());
         me.connTask.delay(timeout, me.connect, me.wssocket);
         if (me.isEnabled())
         {
            me.initReceipt &= ~0x10;
         }
         me.fireEvent('onclose');
      };
      me.wssocket.onmessage = function(event)
      {
         // console.debug("wssocket.onmessage - [" + event.data + "]");
         try
         {
            var inputStream = eval('[' + event.data + ']')[0];
            //inputStream = Ext.decode(event.data);

            var cmd = inputStream['code'];
            //
            // Setup calculation for time drift
            //
            switch (cmd)
            {
               case 'proximityID_freq' :
               {
                  window.plugins.proximityID.onFreqCalculated(inputStream['freqs'], inputStream['error']);
                  break;
               }
               case 'receipt_incoming' :
               {
                  Genesis.fn.systemTime = inputStream['systemTime'] * 1000;
                  Genesis.fn.clientTime = new Date().getTime();
                  //console.debug("WebSocketClient::receipt_incoming ...")
                  me.wssocket.receiptIncomingHandler(inputStream['receipts']);
                  break;
               }
               case 'receipt_response' :
               {
                  Genesis.fn.systemTime = inputStream['systemTime'] * 1000;
                  Genesis.fn.clientTime = new Date().getTime();
                  //console.debug("WebSocketClient::receipt_response ...")
                  me.wssocket.receiptResponseHandler(inputStream['receipts']);
                  break;
               }
               case 'nfc' :
               {
                  me.wssocket.onNfc(inputStream['nfc']);
                  break;
               }
               case 'nfc_error' :
               {
                  Ext.device.Notification.show(
                  {
                     title : me.tagReaderTitle,
                     message : inputStream['errorMsg'],
                     buttons : ['Dismiss']
                  });
                  break;
               }
               case 'nfc_sysError' :
               {
                  Ext.device.Notification.show(
                  {
                     title : me.tagReaderTitle,
                     ignoreOnHide : !Genesis.fn.isNative(),
                     message : inputStream['errorMsg'],
                     buttons : []
                  });
                  break;
               }
               case 'nfc_ok' :
               {
                  Ext.device.Notification.dismiss();
                  break;
               }
               default:
                  break;
            }
         }
         catch(e)
         {
            console.debug("Exception while parsing Incoming Receipt ...\n" + e);
            Ext.Viewport.setMasked(null);
         }
         me.fireEvent('onmessage');
      };
   },
   connect : function(forced)
   {
      var me = pos;

      if (Ext.Viewport && !me.wssocket && //
      ((me.isEnabled() && Genesis.fn.isNative() && Ext.device.Connection.isOnline()) || (!Genesis.fn.isNative() && navigator.onLine)))
      {
         me.wssocket = new WebSocket(me.url, 'json');

         me.setupWsCallback();

         Ext.Viewport.setMasked(null);
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.lostPosConnectionMsg
            /*
             ,listeners :
             {
             'tap' : function(b, e, eOpts)
             {
             Ext.Viewport.setMasked(null);
             me.connTask.cancel();
             }
             }
             */
         });
         console.debug("Pos::connect(" + me.url + ")");
      }
      else if (me.wssocket && forced)
      {
         me.wssocket.onopen();
         console.debug("Pos::connect(" + me.url + ") Forced");
      }
   },
   disconnect : function(forced)
   {
      var me = pos;

      if (Genesis.db.getLocalDB()['enablePosIntegration'] || forced)
      {
         if (me.wssocket && me.wssocket.socket)
         {
            me.connTask.cancel();
            me.wssocket.socket.close();
            console.debug("Pos::disconnect called");
         }
      }
   }
});
