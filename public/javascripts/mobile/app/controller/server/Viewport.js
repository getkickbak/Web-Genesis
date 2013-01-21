Ext.define('Genesis.controller.server.Viewport',
{
   extend : 'Genesis.controller.ViewportBase',
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
   setupInfoMissingMsg : 'Missing Console Initialization information.',
   licenseKeyInvalidMsg : 'Missing License Key',
   setupTitle : 'System Initialization',
   inheritableStatics :
   {
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this;
      try
      {
         //
         // Update Customer Rewards (Rewards Redemptions)
         //
         me.updateRewards(metaData['rewards']);
         //
         // Update Customer Rewards (Prizes Redemptions)
         //
         me.updatePrizes(metaData['prizes']);
      }
      catch(e)
      {
         console.debug("updateMetaDataInfo Exception - " + e);
      }
   },
   refreshLicenseKey : function(callback, forceRefresh)
   {
      var me = this;
      callback = callback || Ext.emptyFn;

      if (!Genesis.fn.isNative())
      {
         Genesis.fn.getPrivKey();
         me.initializeConsole(callback);
         return;
      }
      me.persistLoadStores(function()
      {
         var lstore = Ext.StoreMgr.get('LicenseStore');
         if ((lstore.getRange().length < 1) || (forceRefresh))
         {
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
                  'device_id' : device.uuid
               },
               callback : function(records, operation)
               {
                  console.debug("Loading License Key ...");
                  if (operation.wasSuccessful())
                  {
                     var venueId = records[0].get('venue_id');
                     var venueName = records[0].get('venue_name');
                     var licenseKey = Genesis.fn.privKey =
                     {
                        'venueId' : venueId,
                        'venue' : records[0].get('venue_name')
                     };
                     licenseKey['r' + venueId] = licenseKey['p' + venueId] = records[0].getId();

                     me.persistSyncStores('LicenseStore');
                     me.initializeConsole(callback);
                  }
                  else
                  {
                     me.initNotification(me.licenseKeyInvalidMsg);
                  }
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
   initNotification : function(msg)
   {
      var me = this;
      Ext.Viewport.setMasked(null);
      Ext.device.Notification.show(
      {
         title : me.setupTitle,
         message : msg,
         buttons : ['Dismiss'],
         callback : function()
         {
            //
            // Exit App, because we can't continue without Console Setup data
            //
            navigator.app.exitApp();
         }
      });
   },
   initializeLicenseKey : function()
   {
      var me = this, viewport = me;

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.loadingMsg
      });

      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false,
      });
      me.refreshLicenseKey();
   },
   initializeConsole : function(callback)
   {
      var me = this, viewport = me;
      var info = viewport.getCheckinInfo();

      var venueId = Genesis.fn.getPrivKey('venueId');
      var params =
      {
         'venue_id' : venueId
      }
      console.debug("Loaded License Key ...");
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
            var metaData = Venue.getProxy().getReader().metaData;
            if (operation.wasSuccessful() && metaData)
            {
               viewport.setVenue(record);
               viewport.setMetaData(metaData);
               info.venue = viewport.getVenue();
               info.metaData = viewport.getMetaData();
               me.fireEvent('updatemetadata', metaData);
               console.debug("Successfully acquired dataset for Venue(" + venueId + ")");
               //console.debug("Record[" + Ext.encode(record) + "]");
               //console.debug("MetaData[" + Ext.encode(metaData) + "]");
               callback();
               Ext.Viewport.setMasked(null);
               return;
            }
            else
            if (!operation.wasSuccessful() && !metaData)
            {
               console.log(me.setupInfoMissingMsg);
            }

            me.initNotification(me.setupInfoMissingMsg);
         }
      });
   },
   applyActiveController : function(controller)
   {
      var me = this;

      if (me._mimeTypeCallback)
      {
         nfc.removeMimeTypeListener(Genesis.constants.appMimeType, me._mimeTypeCallback, function()
         {
            console.log("Removed MimeType[" + Genesis.constants.appMimeType + "] for NFC detection ...");
         });
         delete me._mimeTypeCallback;
      }
      if (controller)
      {
         me._mimeTypeCallback = function(nfcEvent)
         {
            console.log("MimeType Message received");
            try
            {
               var tag = nfcEvent.tag, records = tag.ndefMessage, result = Ext.decode(nfc.bytesToString(records[0].payload)), cntlr = me.getActiveController();

               //
               // Decrypt Message
               //
               me.printNfcTag(nfcEvent);
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
            catch (e)
            {
               console.log("Exception Thrown while processing NFC Tag[" + e + "]");
            }
         };

         nfc.addMimeTypeListener(Genesis.constants.appMimeType, me._mimeTypeCallback, function()
         {
            console.log("Listening for tags with mime type " + Genesis.constants.appMimeType);
         }, function()
         {
            console.warn('Failed to register mime type ' + Genesis.constants.appMimeType + ' with NFC');
         });
         console.log("Added MimeType[" + Genesis.constants.appMimeType + "] for NFC detection ...");
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
      var me = this;

      me.callParent(arguments);

      console.log("Server Viewport Init");

      me.initializeLicenseKey();
      //
      // Initialize Sound Files, make it non-blocking
      //
      Ext.defer(function()
      {
         this.sound_files =
         {
         };
         var soundList = [//
         ['clickSound', 'click_sound', 'FX'], //
         ['nfcEnd', 'nfc_end', 'FX'], //
         ['nfcError', 'nfc_error', 'FX'], //
         //['refreshListSound', 'refresh_list_sound', 'FX'], //
         ['beepSound', 'beep.wav', 'FX']];

         for (var i = 0; i < soundList.length; i++)
         {
            //console.debug("Preloading " + soundList[i][0] + " ...");
            this.loadSoundFile.apply(this, soundList[i]);
         }
      }, 1, me);

      if (Genesis.fn.isNative())
      {
         var s_vol_ratio, r_vol_ratio, c = Genesis.constants;
         //
         // Sender/Receiver Volume Settings
         // ===============================
         // - For Merchant Devices
         if (Ext.os.is('iOS'))
         {
            Ext.device.Notification.show(
            {
               title : 'System Setup',
               message : 'This platform is not supported.',
               buttons : ['Dismiss'],
               callback : function(btn)
               {
                  return;
               }
            });
            return;
         }
         //
         // Merchant Device always receives
         //
         else
         if (Ext.os.is('Android'))
         {
            s_vol_ratio = 0.4;
            //Default Volume laying flat on a surface
            c.s_vol = 80;

            r_vol_ratio = 0.5;
            // Read fresh data as soon as there's a miss
            c.conseqMissThreshold = 1;
            c.magThreshold = 200000;
            c.numSamples = 4 * 1024;
            //Default Overlap of FFT signal analysis over previous samples
            c.sigOverlapRatio = 0.25;

            c.proximityTxTimeout = 20 * 1000;
            c.proximityRxTimeout = 40 * 1000;
         }
         Genesis.fn.printProximityConfig();
         window.plugins.proximityID.init(s_vol_ratio, r_vol_ratio);
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
      console.log("Name[" + name + "] Value[" + value + "]");
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
      console.log("Scanned an NDEF tag with " + records.length + " record" + ((records.length === 1) ? "" : "s"));

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
         console.log(template(records[i]));
      }
   }
});
