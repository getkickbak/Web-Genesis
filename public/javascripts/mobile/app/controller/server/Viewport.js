// add back button listener
var onBackKeyDown, wssocket, posConnect, posDisconnect;
Ext.require(['Genesis.model.frontend.ReceiptItem', 'Genesis.model.frontend.Receipt', 'Ext.device.Connection', 'Genesis.controller.ControllerBase'], function()
{
   onBackKeyDown = function(e)
   {
      var viewport = _application.getController('server.Viewport');

      //e.preventDefault();

      //
      // Disable BackKey if something is in progress or application is not instantiated
      //
      if (!_application || Ext.Viewport.getMasked() || !viewport || viewport.popViewInProgress)
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
         console.debug("BackButton Pressed");

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
            navigator.app.exitApp();
         }
      }
   };

   wssocket = null;
   posConnect = function(i)
   {
      var db = Genesis.db.getLocalDB();
      if (db['enablePosIntegration'] && db['isPosEnabled'])
      {
         var scheme = 'ws://';
         var host = '192.168.159.1';
         var port = '443';

         i = i || 0;
         if (!wssocket && Ext.device.Connection.isOnline())
         {
            var url = scheme + host + ':' + port + "/pos";
            wssocket = new WebSocket(url, 'json');
            //wssocket.binaryType = 'arraybuffer';
            wssocket.onopen = function(event)
            {
               console.debug("WebSocketClient::onopen - \r\n" + Ext.encode(event));
               wssocket.send("get_receipts");
            };
            wssocket.onmessage = function(event)
            {
               try
               {

                  var inputStream = Ext.decode(event.data);
                  var cmd = inputStream['code'];
                  //
                  // Setup calculation for time drift
                  //
                  Genesis.fn.systemTime = inputStream['systemTime'] * 1000;
                  Genesis.fn.clientTime = new Date().getTime();

                  switch (cmd)
                  {
                     case 'receipt_incoming' :
                     {
                        console.debug("receipt_incoming ...")
                        wssocket.receiptIncomingHandler(inputStream['receipts']);
                        break;
                     }
                     case 'receipt_response' :
                     {
                        console.debug("receipt_response ...")
                        wssocket.receiptResponseHandler(inputStream['receipts']);
                        Ext.Viewport.setMasked(null);
                        break;
                     }
                     default:
                        break;
                  }
               }
               catch(e)
               {
                  console.debug("Exception while parsing Incoming Receipt ...\n" + Ext.encode(e));
               }
            };
            wssocket.onerror = function(event)
            {
               console.debug("WebSocketClient::onerror - \r\n" + Ext.encode(event));
            };
            wssocket.onclose = function(event)
            {
               Ext.Viewport.setMasked(
               {
                  xtype : 'loadmask',
                  message : Genesis.controller.ControllerBase.prototype.lostPosConnectionMsg
               });
               console.debug("WebSocketClient::onclose - \r\n" + Ext.encode(event));
               delete WebSocket.store[event._target];
               wssocket = null;
               //
               // Reconnect to server continuously
               //
               Ext.defer(posConnect, 5 * 1000, [++i]);
            };

            console.debug("WebSocketClient::posConnect(" + url + ")");
         }
      }
      else if (Ext.Viewport)
      {
         Ext.Viewport.setMasked(null);
      }
   };
   posDisconnect = function(forced)
   {
      if (Genesis.db.getLocalDB()['enablePosIntegration'] || forced)
      {
         if (wssocket && wssocket.socket)
         {
            wssocket.socket.close();
            console.debug("WebSocketClient::posDisconnect called");
         }
      }
   };

   WebSocket.prototype.minLineLength = 10;
   WebSocket.prototype.grandtotalRegexp = new RegExp("\\s*\\bGrand Total\\b\\s+\\$(\\d+\.\\d{2})\\s*", "i");
   WebSocket.prototype.subtotalRegexp = new RegExp("\\s*\\bSubtotal\\b\\s+\\$(\\d+\.\\d{2})\\s*", "i");
   WebSocket.prototype.itemRegexp = new RegExp("([\\s*\\w+]+)\\s+(\\d+)\\s+\\$(\\d+\\.\\d{2})\\s*", "i");

   WebSocket.prototype.createReceipt = function(receiptText)
   {
      var i, match, currItemPrice = 0, maxItemPrice = 0, id = receiptText[0];

      receiptText.splice(0, 1);
      var receipt =
      {
         id : id,
         subtotal : currItemPrice.toFixed(2),
         price : currItemPrice.toFixed(2),
         title : '',
         earned : false,
         receipt : Ext.encode(receiptText),
         items : []
      }

      //console.debug("WebSocketClient::createReceipt[" + Genesis.fn.convertDateFullTime(new Date(receipt['id']*1000)) + "]");
      for ( i = 0; i < receiptText.length; i++)
      {
         var text = receiptText[i];
         if (text.length > this.minLineLength)
         {
            match = this.subtotalRegexp.exec(text);
            if (match)
            {
               receipt['subtotal'] = match[1];
            }

            match = this.grandtotalRegexp.exec(text);
            if (match)
            {
               receipt['price'] = match[1];
            }

            match = this.itemRegexp.exec(text);
            if (match)
            {
               var qty = Number(match[2]);
               var currItemPrice = (Number(match[3]) / qty);
               receipt['items'].push(new Ext.create('Genesis.model.frontend.ReceiptItem',
               {
                  qty : qty,
                  price : currItemPrice,
                  name : match[1].trim()
               }));
               if (Math.max(currItemPrice, maxItemPrice) == currItemPrice)
               {
                  maxItemPrice = currItemPrice;
                  receipt['title'] = match[1].trim();
               }
            }
         }
      }
      //console.debug("WebSocketClient::createReceipt");
      var rc = Ext.create("Genesis.model.frontend.Receipt", receipt);
      rc['items']().add(receipt['items']);
      return rc;
   };
   WebSocket.prototype.receiptIncomingHandler = function(receipts, supress)
   {
      var receiptsList = [];
      //console.debug("WebSocketClient::onmessage - " + event);
      for (var i = 0; i < receipts.length; i++)
      {
         var receipt = receiptsList[i] = this.createReceipt(receipts[i]);

         //console.debug("WebSocketClient::receiptIncomingHandler");
         if (!supress)
         {
            console.debug("WebSocketClient::receiptIncomingHandler - \n" + //
            "Date: " + Genesis.fn.convertDateFullTime(new Date(receipt.get('id') * 1000)) + '\n' + //
            "Subtotal: $" + receipt.get('subtotal').toFixed(2) + '\n' + //
            "Price: $" + receipt.get('price').toFixed(2) + '\n' + //
            "Earned: " + receipt.get('earned') + '\n' + //
            "Title: " + receipt.get('title') + '\n' + //
            "Receipt: [\n" + Ext.decode(receipt.get('receipt')) + "\n]" + //
            "");
         }
      }

      if (!supress)
      {
         Ext.StoreMgr.get('ReceiptStore').add(receiptsList);
      }

      return receiptsList;
   };
   WebSocket.prototype.receiptResponseHandler = function(receipts)
   {
      var receiptsList = this.receiptIncomingHandler(receipts, true);
      Ext.StoreMgr.get('ReceiptStore').setData(receiptsList);

      console.debug("WebSocketClient::receiptResponseHandler - Processed " + receiptsList.length + " receipts");
   };
});

Ext.define('Genesis.controller.server.Viewport',
{
   extend : 'Genesis.controller.ViewportBase',
   requires : ['Genesis.model.frontend.Receipt', 'Ext.dataview.List', 'Ext.XTemplate', 'Ext.util.DelayedTask'],
   config :
   {
      models : ['PurchaseReward'],
      customer : null,
      venue : null,
      metaData : null,
      checkinInfo :
      {
         venue : null,
         customer : null,
         metaData : null
      },
      activeController : null,
      refs :
      {
         posMode : 'serversettingspageview togglefield[tag=posMode]',
         displayMode : 'serversettingspageview selectfield[tag=displayMode]'
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
         }
      }
   },
   mobileTimeout : 1 * 60 * 1000,
   fixedTimeout : 1 * 60 * 1000,
   _statusInfo :
   {
      isPlugged : false,
      level : 0
   },
   setupInfoMissingMsg : 'Trouble initializing Merchant Device',
   licenseKeyInvalidMsg : 'Missing License Key',
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
      var me = this, db = Genesis.db.getLocalDB();
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

         me.posIntegrationHandler(metaData, db['isPOSEnabled']);
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
                     lstore.getProxy()._errorCallback = Ext.bind(me.initNotification, me, [me.licenseKeyInvalidMsg]);
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
         buttons : ['Refresh License', 'Restart'],
         callback : function(btn)
         {
            //
            // Restart, because we can't continue without Console Setup data
            //
            if (!btn || (btn.toLowerCase() == 'restart'))
            {
               navigator.app.exitApp();
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
                           //
                           // Restart because we can't continue without Console Setup data
                           //
                           navigator.app.exitApp();
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

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.loadingMsg
      });

      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false
      });

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
            filterFn : function(item)
            {
               return (item.get('earned') == false);
            }
         }]
      });
      me.refreshLicenseKey(posConnect);
   },
   initializeConsole : function(callback)
   {
      var me = this, viewport = me, info = viewport.getCheckinInfo(), venueId = Genesis.fn.getPrivKey('venueId'), proxy = Venue.getProxy();
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
            var metaData = proxy.getReader().metaData;
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
               return;
            }
            else if (!operation.wasSuccessful() && !metaData)
            {
               proxy.supressErrorsPopup = true;
               console.log(me.setupInfoMissingMsg);
            }
            me.initNotification(me.setupInfoMissingMsg);
         }
      });
   },
   applyActiveController : function(controller)
   {
      var me = this;

      if (!Genesis.fn.isNative())
      {
         return;
      }
      if (me._mimeTypeCallback)
      {
         nfc.removeNdefListener(me._mimeTypeCallback, function()
         //nfc.removeMimeTypeListener(Genesis.constants.appMimeType, me._mimeTypeCallback, function()
         {
            console.log("Removed NDEF Listener for NFC detection ...");
            //console.log("Removed MimeType[" + Genesis.constants.appMimeType + "] for NFC detection ...");
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
            console.log("Listening for tags with NDEF type");
            //console.log("Listening for tags with mime type " + Genesis.constants.appMimeType);
         }, function()
         {
            console.warn('Failed to register NDEF type with NFC');
         });
         //console.log("Added NDEF Tags for NFC detection ...");
         //console.log("Added MimeType[" + Genesis.constants.appMimeType + "] for NFC detection ...");
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
   onPosModeChange : function(field, newValue, oldValue, eOpts)
   {
      var me = this;
      if (me.getMetaData())
      {
         me.posIntegrationHandler(me.getMetaData(), (newValue) ? true : false);
      }
      else
      {
         //
         // Revert to original value
         //
         field.toggle();
      }
   },
   onDisplayModeChange : function(field, newValue, oldValue, eOpts)
   {
      var me = this;
      Genesis.db.setLocalDBAttrib("displayMode", newValue);
      me.batteryStatusFn();
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

         for ( i = 0; i < soundList.length; i++)
         {
            //console.debug("Preloading " + soundList[i][0] + " ...");
            this.loadSoundFile.apply(this, soundList[i]);
         }
      }, 1, me);

      if (Genesis.fn.isNative())
      {
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
      }

      me.initListeners();

   },
   batteryStatusFn : function(info)
   {
      var me = this, displayMode = Genesis.db.getLocalDB["displayMode"];

      info = info || me._statusInfo;
      console.log("Device is " + ((info.isPlugged) ? "Plugged" : "Unplugged") + ", Battery " + info.level + "%");

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
   initListeners : function()
   {
      var me = this;
      window.addEventListener("batterystatus", function(info)
      {
         if (!me._hyteresisTask)
         {
            me._hyteresisTask = Ext.create('Ext.util.DelayedTask', me.batteryStatusFn);
         }
         me._hyteresisTask.delay(30 * 1000, me.batteryStatusFn, me, [info]);
      }, false);
      window.addEventListener("batterylow", function(info)
      {
         if (Ext.device)
         {
            Ext.device.Notification.show(
            {
               title : 'Battery Level Low',
               messsage : 'Battery is at ' + info.level + '%'
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
               messsage : 'Battery is at ' + info.level + '%' + '\n' + //
               'Recharge Soon!'
            });
            Ext.device.Notification.vibrate();
            Ext.device.Notification.beep();
         }
      }, false);
   },
   uploadReceipts : function(receipts)
   {
      var me = this, proxy = PurchaseReward.getProxy();
      var params =
      {
         version : Genesis.constants.serverVersion,
         'venue_id' : Genesis.fn.getPrivKey('venueId'),
         data :
         {
            "receipts" : receipts,
            "type" : 'earn_points',
            'expiry_ts' : new Date().addHours(3).getTime()
         }
      };
      params['data'] = me.self.encryptFromParams(params['data']);

      PurchaseReward['setMerchantReceiptUploadURL']();
      PurchaseReward.load(1,
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
               var createStatement = "CREATE TABLE IF NOT EXISTS Receipt (id INTEGER PRIMARY KEY, receipts TEXT)";
               var deleteStatement = "DELETE FROM Receipt WHERE id=?";
               var db = openDatabase('KickBak', 'ReceiptStore', "1.0", 5 * 1024 * 1024);
               db.transaction(function(tx)
               {
                  //
                  // Create Table
                  //
                  tx.executeSql(createStatement, [], function()
                  {
                     console.debug("Successfully created/retrieved KickBak-Receipt Table");
                  }, function(tx, error)
                  {
                     console.debug("Failed to create KickBak-Receipt Table : " + error.message);
                  });
                  //
                  // Retrieve Customers
                  //
                  for (var i = 0; i < receipts.length; i++)
                  {
                     tx.executeSql(deleteStatement, [receipts[i]['id']], function()
                     {
                     }, function(tx, error)
                     {
                     });
                  }
                  console.debug("uploadReceipts --- Removed " + receipts.length + "Receipts from  KickBak-Receipt Table");
               });
            }
            else
            {
               proxy.supressErrorsPopup = true;
               proxy.quiet = false;
               //
               // Try again at next interval
               //
               syncReceiptDB();
            }
         }
      });
   },
   syncReceiptDB : function(duration)
   {
      var me = this;
      //
      // Wait for time to expire before Synchronizing Receipt Database with server
      //
      if (!me._syncTask)
      {
         me._syncTask = Ext.create('Ext.util.DelayedTask', function()
         {
            var createStatement = "CREATE TABLE IF NOT EXISTS Receipt (id INTEGER PRIMARY KEY, receipts TEXT)";
            var selectAllStatement = "SELECT * FROM Receipt";
            var db = openDatabase('KickBak', 'ReceiptStore', "1.0", 5 * 1024 * 1024);
            db.transaction(function(tx)
            {
               //
               // Create Table
               //
               tx.executeSql(createStatement, [], function()
               {
                  console.debug("Successfully created/retrieved KickBak-Receipt Table");
               }, function(tx, error)
               {
                  console.debug("Failed to create KickBak-Receipt Table : " + error.message);
               });
               //
               // Retrieve Customers
               //
               tx.executeSql(selectAllStatement, [], function(tx, result)
               {
                  var items = [];
                  var dataset = result.rows;
                  for ( j = 0, item = null; j < dataset.length; j++)
                  {
                     item = dataset.item(j);
                     console.debug("TxId - " + item['id'])
                     items.push(
                     {
                        id : item['id'],
                        receipts : Ext.decode(item['receipts'])
                     });
                  }
                  console.debug("syncReceiptDB  --- Found " + items.length + " records in SQL Receipt Database");

                  if (items.length > 0)
                  {
                     me.uploadReceipts(items);
                  }
               }, function(tx, error)
               {
                  console.debug("No Receipt Table found in SQL Database : " + error.message);
               });
            });
         });
      }
      me._syncTask.delay(duration);
      console.debug("syncReceiptDB - Synchronize Database after " + (duration / 1000) + "sec of idle");
   },
   posIntegrationHandler : function(metaData, isPosEnabled)
   {
      var db = Genesis.db.getLocalDB();

      db['enablePosIntegration'] = metaData['enablePOS'];
      db['isPosEnabled'] = ((isPosEnabled === undefined) || (isPosEnabled));
      if (db['enablePosIntegration'] && db['isPosEnabled'])
      {
         posConnect();
      }
      else
      {
         var store = Ext.StoreMgr.get('ReceiptStore');
         posDisconnect(true);
         store.removeAll();
         store.remove(store.getRange());
         // BUG: We have to remove the filtered items as well
      }
      db['enableReceiptUpload'] = metaData['enableReceiptUpload'];
      Genesis.db.setLocalDB(db);
   }
});
