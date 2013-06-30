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
      duration : 1 * 44100,
      bw : 0,
      audio : null,
      freqs : null,
      init : function(s_vol_ratio, r_vol_ratio)
      {
         var me = this;
         me.bw = (me.hiFreq - me.loFreq) / me.NUM_SIGNALS;
         Genesis.constants.s_vol = s_vol_ratio * 100;
         Genesis.constants.r_vol = r_vol_ratio * 100;
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

         var s_vol = Genesis.constants.s_vol / 100;
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
         var u16ToLow = function(i)
         {
            return (i & 0xFFFF);
         };
         var u16ToHigh = function(i)
         {
            return ((i >> 16) & 0xFFFF);
         };

         me.freqs = [];
         //
         // Use Web Audio
         //
         if (( typeof (webkitAudioContext) != 'undefined') && !debugMode)
         {
            // Create the audio context
            if (!me.context)
            {
               me.context = new webkitAudioContext();
               me.gainNode = me.context.createGainNode();
               me.gainNode.connect(me.context.destination);
            }

            getFreqs();
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

            console.debug("Gain : " + s_vol);
            win();
         }
         else
         {
            //
            // Browser support WAV files
            //
            var hdr, hdrLen, data, canPlayAudio = (new Audio()).canPlayType('audio/wav; codecs=1') && !debugMode;
            if (canPlayAudio)
            {
               hdrLen = 0;
               data = config['data'];
            }
            //
            // Convert to OGG first
            //
            else
            {
               hdrLen = 44 / 2;
               config['headerOnly'] = true;
               hdr = (new RIFFWAVE(config)).header;
               data = config['data'] = new Int16Array(hdrLen + me.duration);
            }

            //
            // To give loading mask a chance to render
            //
            Ext.defer(function()
            {
               getFreqs();

               for ( i = hdrLen; i < (me.duration + hdrLen); i++)
               {
                  var val = 0.0;
                  // convert to 16 bit pcm sound array
                  // assumes the sample buffer is normalised.
                  for ( j = 0; j < me.freqs.length; j++)
                  {
                     val += Math.sin(2 * Math.PI * me.freqs[j] * i / me.sampleRate);
                  }
                  val /= me.freqs.length;

                  data[i] = Math.round(s_vol * ((me.SHORT_MAX + 1) + (val * me.SHORT_MAX)));
               }

               //
               // Browser support WAV files
               //
               if (canPlayAudio)
               {
                  me.audio = new Audio(new RIFFWAVE(config).dataURI);
               }
               //
               // Convert to OGG first
               //
               else
               {
                  // OFFS SIZE NOTES
                  //      chunkId : [0x52, 0x49, 0x46, 0x46], // 0    4    "RIFF" = 0x52494646
                  //      chunkSize : 0, // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
                  //      format : [0x57, 0x41, 0x56, 0x45], // 8    4    "WAVE" = 0x57415645
                  //      subChunk1Id : [0x66, 0x6d, 0x74, 0x20], // 12   4    "fmt " = 0x666d7420
                  //      subChunk1Size : 16, // 16   4    16 for PCM
                  //      audioFormat : 1, // 20   2    PCM = 1
                  //      numChannels : 1, // 22   2    Mono = 1, Stereo = 2...
                  //      sampleRate : 8000, // 24   4    8000, 44100...
                  //      byteRate : 0, // 28   4    SampleRate*NumChannels*BitsPerSample/8
                  //      blockAlign : 0, // 32   2    NumChannels*BitsPerSample/8
                  //      bitsPerSample : 8, // 34   2    8 bits = 8, 16 bits = 16
                  //      subChunk2Id : [0x64, 0x61, 0x74, 0x61], // 36   4    "data" = 0x64617461
                  //      subChunk2Size : 0 // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
                  data[0] = u16ToHigh(hdr.chunkId);
                  data[1] = u16ToLow(hdr.chunkId);
                  data[2] = u16ToHigh(hdr.chunkSize);
                  data[3] = u16ToLow(hdr.chunkSize);
                  data[4] = u16ToHigh(hdr.format);
                  data[5] = u16ToLow(hdr.format);
                  data[6] = u16ToHigh(hdr.subChunk1Id);
                  data[7] = u16ToLow(hdr.subChunk1Id);
                  data[8] = u16ToHigh(hdr.subChunk1Size);
                  data[9] = u16ToLow(hdr.subChunk1Size);
                  data[10] = hdr.audioFormat;
                  data[11] = hdr.numChannels;
                  data[12] = u16ToHigh(hdr.sampleRate);
                  data[13] = u16ToLow(hdr.sampleRate);
                  data[14] = u16ToHigh(hdr.byteRate);
                  data[15] = u16ToLow(hdr.byteRate);
                  data[16] = hdr.blockAlign;
                  data[17] = hdr.bitsPerSample;
                  data[18] = u16ToHigh(hdr.subChunk2Id);
                  data[19] = u16ToLow(hdr.subChunk2Id);
                  data[20] = u16ToHigh(hdr.subChunk2Size);
                  data[21] = u16ToLow(hdr.subChunk2Size);

                  var codec = new Speex(
                  {
                     benchmark : false,
                     quality : 2,
                     complexity : 2,
                     bits_size : 15
                  })

                  data = "data:audio/ogg;base64," + base64.encode(codec.encode(data, true));
                  //Speex.util.play(codec.decode(spxdata));
                  codec.close();

                  console.debug("OGG Encode Data :" + data);
                  me.audio = new Audio(data);
               }

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
               console.debug("Gain : " + s_vol);
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
               me.oscillators[i].noteOn && me.oscillators[i].noteOn(0);
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
            // Set the volume.
            me.gainNode.gain.value = Math.max(0, vol / 100);
         }
      }
   };
}
