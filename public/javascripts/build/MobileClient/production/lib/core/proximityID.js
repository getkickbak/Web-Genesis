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
                     $('#earnPtsCancel').off('tap', cancel);
                     _win(useProximity);
                  });
                  $('#earnPtsCancel').one('tap', cancel = function(e)
                  {
                     me.pendingBroadcast = false;
                     $('#earnPtsProceed').off('tap', proceed);
                  });
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
            console.debug("Initialized Proximity API");
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
               if ( typeof (webkitAudioContext) != 'undefined')
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
         scan : function(win, fail, samples, missedThreshold, magThreshold, overlapRatio)
         {
            var me = this, context = me.context, matchCount = 0;

            if (!me.context)
            {
               context = me.context = new webkitAudioContext();
            }

            if (!me.javascriptNode)
            {
               // setup a javascript node
               me.javascriptNode = context.createJavaScriptNode(me.bufSize, 1, 1);
               // when the javascript node is called
               // we use information from the analyser node
               // to draw the volume
               me.javascriptNode.onaudioprocess = function(e)
               {
                  me.fftWorker.postMessage(
                  {
                     cmd : 'forward',
                     buf : e.inputBuffer.getChannelData(0)
                  });
               };

               //var analyser = me.analyser = context.createAnalyser();
               //analyser.smoothingTimeConstant = 0;
               //analyser.fftSize = me.fftSize;
               //me.analyser.connect(me.javascriptNode);
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
                                    break;
                                 }
                              }
                              if (i != result['freqs'].length)
                              {
                                 matchCount = 0;
                                 delete me.freqs;
                              }
                              else
                              {
                                 matchCount++;
                              }
                           }
                           else
                           {
                              me.freqs = result['freqs'];
                           }

                           if (matchCount >= me.MATCH_THRESHOLD)
                           {
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
                  me.microphone = me.convertToMono(context.createMediaStreamSource(stream));
                  // connect to destination, else it isn't called
                  me.javascriptNode.connect(me.context.destination);
                  //me.microphone.connect(me.analyser);
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