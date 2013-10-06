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
   setupInfoMissingMsg : 'Trouble initializing KICKBAK Service',
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
