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
   window.plugins.proximityID =
   {
      loFreq : 17000.0,
      hiFreq : 20000.0,
      FREQ_GAP : 500.0,
      NUM_SIGNALS : 3,
      SHORT_MAX : parseInt(0xFFFF / 2),
      sampleRate : 44100,
      duration : 20 * 44100,
      bw : 0,
      audio : null,
      freqs : null,
      init : function(s_vol_ratio, r_vol_ratio)
      {
         var me = this;
         me.bw = (me.hiFreq - me.loFreq) / me.NUM_SIGNALS;
         console.debug("Initialized Proximity API");
      },
      preLoadSend : function(win, fail)
      {
         var me = this, i, j, stay, config =
         {
            header :
            {
               sampleRate : me.sampleRate,
               numChannels : 1,
               bitsPerSample : 16
            },
            data : []
         };

         var getFreqs = function()
         {
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
         };

         me.freqs = [];
         //
         // Use Web Audio
         //
         if (Ext.isDefined(webkitAudioContext))
         {
            // Create the audio context
            if (!me.context)
            {
               me.context = new webkitAudioContext();
               me.gainNode = me.context.createGainNode();
               me.gainNode.connect(me.context.destination);
            }

            getFreqs();
            var s_vol = (Ext.os.is('Desktop')) ? (Genesis.constants.s_vol / 100) : 1.0;
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

            win();
         }
         else
         {
            //
            // To give loading mask a chance to render
            //
            Ext.defer(function()
            {
               getFreqs();

               for ( i = 0; i < me.duration; i++)
               {
                  var val = 0.0;
                  // convert to 16 bit pcm sound array
                  // assumes the sample buffer is normalised.
                  for ( j = 0; j < me.freqs.length; j++)
                  {
                     val += Math.sin(2 * Math.PI * me.freqs[j] * i / me.sampleRate);
                  }
                  val /= me.freqs.length;

                  var s_vol = (Ext.os.is('Desktop')) ? (Genesis.constants.s_vol / 100) : 1.0;
                  config['data'][i] = Math.round(s_vol * ((me.SHORT_MAX + 1) + (val * me.SHORT_MAX)));
               }
               me.audio = new Audio(new RIFFWAVE(config).dataURI);
               if ( typeof me.audio.loop == 'boolean')
               {
                  me.audio.loop = true;
               }
               else
               {
                  me.audio.addEventListener('ended', function()
                  {
                     this.currentTime = 0;
                     this.play();
                  }, false);
               }
               win();
            }, 0.25 * 1000, this);
         }
      },
      send : function(win, fail)
      {
         var me = this;
         if (me.audio)
         {
            me.audio.play();
            win(
            {
               freqs : me.freqs
            });
         }
         else if (me.oscillators)
         {
            for (var i = 0; i < me.freqs.length; i++)
            {

               me.oscillators[i].noteOn && me.oscillators[ii].noteOn(0);
            }
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
      stop : function()
      {
         var me = this;
         if (me.audio)
         {
            me.audio.pause();
            me.audio.currentTime = 0;
            delete me.audio;
         }
         else if (me.oscillators)
         {
            for (var i = 0; i < me.freqs.length; i++)
            {
               me.oscillators[i].disconnect();
            }
            delete me.oscillators;
         }
      },
      setVolume : function(vol)
      {
         var me = this;
         if (me.audio)
         {
            me.audio.volume = vol / 100;
         }
         else if (me.context)
         {
         }
      }
   };
}
