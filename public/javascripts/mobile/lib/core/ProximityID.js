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
         //
         // Use Web Audio
         //
         if (Ext.isDefined(webkitAudioContext))
         {
            // Create the audio context
            me.context = new webkitAudioContext();
         }
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
         if (me.context)
         {
            //
            // To give loading mask a chance to render
            //
            Ext.defer(function()
            {
               // Number of samples to generate on each call to generateAudio.
               // Legal values are 256, 512, 1024, 2048, 4096, 8192, 16384.
               const BUFFER_SIZE = 16384;

               // Number of output channels. We want stereo, hence 2 (though 1 also works??).
               const NUM_OUTPUTS = 1;

               // We only want to *generate* audio, so our node has no inputs.
               //const NUM_INPUTS = 0; Results in horrible noise in Safari 6
               const NUM_INPUTS = 1;

               me.currentPhase = [];
               me.phaseIncrement = [];
               // Create a source node
               me.node = me.context.createJavaScriptNode(BUFFER_SIZE, NUM_INPUTS, NUM_OUTPUTS);

               getFreqs();
               for ( i = 0; i < me.freqs.length; i++)
               {
                  me.currentPhase[i] = 0.0;
                  me.phaseIncrement[i] = 2 * Math.PI * me.freqs[i] / me.sampleRate;
                  console.debug("Freq " + me.freqs[i]);
               }
               var s_vol = (Ext.os.is('Desktop')) ? (Genesis.constants.s_vol / 100) : 1.0;
               me.node.onaudioprocess = function(e)
               {
                  // Get the left and right output buffers
                  var left = e.outputBuffer.getChannelData(0);
                  //var right = e.outputBuffer.getChannelData(1);

                  // For each output sample
                  var numSamples = left.length;

                  for (var s = 0; s < numSamples; s++)
                  {
                     var val = 0.0;
                     for (var j = 0; j < me.freqs.length; j++)
                     {
                        val += Math.sin(me.currentPhase[j]);
                        // Increment the phase
                        me.currentPhase[j] += me.phaseIncrement[j];
                     }
                     // Get a sine wave value
                     val /= me.freqs.length;

                     // Put it in the left and right buffer
                     left[s] = s_vol * val;
                     //right[i] = val;
                  }
                  console.debug("Injected " + numSamples + " Buffers");
               };
               win();
            }, 0.25 * 1000, this);
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
         else if (me.node)
         {
            // Connect the node to a destination, i.e. the audio output.
            me.node.connect(me.context.destination);
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
         else if (me.node)
         {
            me.node.disconnect();
            delete me.node;
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
