window.plugins = window.plugins ||
{
};

if (window.cordova || window.Cordova || window.PhoneGap)
{
   (function(cordova)
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
         },
         preLoadSend : function(win, fail)
         {
            //
            // To give loading mask a chance to render
            //
            Ext.defer(function()
            {
               cordova.exec(win, fail, "ProximityIDPlugin", "preLoadIdentity", []);
            }, 0.25 * 1000, this);
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
   })(window.cordova || window.Cordova || window.PhoneGap);
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
      bw : 0,
      sampleConfig : null,
      freqs : null,
      context : null,
      gainNode : null,
      oscillators : null,
      audio : null,
      bytesEncoded : null,
      init : function(s_vol_ratio, r_vol_ratio)
      {
         var me = this;

         me.bw = (me.hiFreq - me.loFreq) / me.NUM_SIGNALS;
         Genesis.constants.s_vol = s_vol_ratio * 100 * ((Ext.os.is('Android')) ? 0.8 : 1.0);
         // Reduce volume by 50%
         Genesis.constants.r_vol = r_vol_ratio * 100 * 0.8;

         console.debug("Initialized Proximity API");
      },
      generateData : function(offset, length)
      {
         var me = this, i, c, s_vol = Genesis.constants.s_vol / 100, data = new Float32Array(length);

         c = [];
         for ( i = 0; i < me.freqs.length; i++)
         {
            c[i] = 2 * Math.PI * me.freqs[i] / me.sampleRate;
         }
         for ( i = 0; i < length; i++)
         {
            // convert to 16 bit pcm sound array
            // assumes the sample buffer is normalised.
            for ( j = 0; j < me.freqs.length; j++)
            {
               data[i] += Math.sin(c[j] * (i + offset));
            }
            data[i] = s_vol * data[i] / me.freqs.length;
         }

         return data;
      },
      createAudioLoop : function()
      {
         var me = this;
         /*
          if ( typeof me.audio.loop == 'boolean')
          {
          me.audio.loop = true;
          }
          else
          */
         {
            me.audio.addEventListener('ended', function()
            {
               this.currentTime = 0;
               this.play();
            }, false);
         }
      },
      webAudioFnHandler : function(s_vol)
      {
         var me = this;

         // Create the audio context
         if (!me.context)
         {
            me.context = new webkitAudioContext();
            me.gainNode = me.context.createGainNode();
            me.gainNode.connect(me.context.destination);
         }

         me.getFreqs();
         // Reduce the volume.
         me.gainNode.gain.value = s_vol;

         me.oscillators = [];
         for ( i = 0; i < me.freqs.length; i++)
         {
            var osc = me.oscillators[i] = me.context.createOscillator();
            osc.type = 0;
            osc.frequency.value = me.freqs[i];
            osc.connect(me.gainNode);
         }

         console.debug("OSC Gain : " + s_vol);
      },
      audioFnHandler : function(config, s_vol, win)
      {
         var me = this, data = config['data'] = [];
         me.getFreqs();

         for (var i = 0; i < (me.duration); i++)
         {
            var val = 0.0;
            // convert to 16 bit pcm sound array
            // assumes the sample buffer is normalised.
            for (var j = 0; j < me.freqs.length; j++)
            {
               val += Math.sin(2 * Math.PI * me.freqs[j] * i / me.sampleRate);
            }
            val /= me.freqs.length;

            val = Math.round(s_vol * ((me.SHORT_MAX + 1) + (val * me.SHORT_MAX)));
            data[i] = val;
         }

         //
         // Browser support WAV files
         //
         me.audio = new Audio(new RIFFWAVE(config).dataURI);
         me.createAudioLoop();

         console.debug("WAV Gain : " + s_vol);

         win();
      },
      mp3WorkerFnHandler : function(e)
      {
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
               me.createAudioLoop();

               console.debug("MP3 Gain : " + Genesis.constants.s_vol / 100);
               me.sampleConfig['callback']();
               delete me.sampleConfig;
            }
         }
      },
      mp3FnHandler : function(config, s_vol, win)
      {
         var me = this;

         if (!_codec.onmessage || (_codec.onmessage == Ext.emptyFn))
         {
            _codec.onmessage = Ext.bind(me.mp3WorkerFnHandler, me);
         }

         me.getFreqs();

         config['callback'] = win;
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
      preLoadSend : function(win, fail)
      {
         var me = this, config =
         {
            header :
            {
               sampleRate : me.sampleRate,
               numChannels : 1,
               bitsPerSample : 16
            },
            data : []
         };

         var s_vol = Genesis.constants.s_vol / 100;

         me.freqs = [];
         //
         // Use Web Audio
         //
         if ( typeof (webkitAudioContext) != 'undefined')
         {
            me.webAudioFnHandler(s_vol);
            win();
         }
         else
         {
            //
            // Browser support WAV files
            //
            if (!_codec)
            {
               me.duration = 1 * 44100;
               Ext.defer(me.audioFnHandler, 0.25 * 1000, me, [config, s_vol, win]);
            }
            //
            // Convert to MP3 first
            //
            else
            {
               me.duration = 1 * 44100;
               Ext.defer(me.mp3FnHandler, 0.25 * 1000, me, [config, s_vol, win]);
            }
         }
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
      scan : function(win, fail, samples, missedThreshold, magThreshold, overlapRatio)
      {
         var me = this;

         //
         // Turn on microphone, listen for frequencies
         //
         if (me.audio)
         {
            me.audio.play();
            win(
            {
               freqs : me.freqs
            });
         }
         else
         {
            fail();
         }
         //cordova.exec(win, fail, "ProximityIDPlugin", "scanIdentity", [samples, missedThreshold, magThreshold, overlapRatio]);
      },
      stop : function()
      {
         var me = this;
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
      },
      setVolume : function(vol)
      {
         var me = this;
         if (me.context)
         {
            // Set the volume.
            me.gainNode.gain.value = Math.max(0, vol / 100);
         }
         else if (me.audio)
         {
            me.audio.volume = vol / 100;
         }

      }
   };
}
