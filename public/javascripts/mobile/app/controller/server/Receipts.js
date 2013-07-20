Ext.merge(WebSocket.prototype,
{
   reconnectTimeoutTimer : 5 * 60 * 1000,
   reconnectTimer : 5 * 1000,
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
               receipt['table'] = match[1];
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
      var receiptsList = [], tableList = [], receiptsMetaList = [];
      for (var i = 0; i < receipts.length; i++)
      {
         var receipt = this.createReceipt(receipts[i]);
         if (receipt)
         {
            if (receipt.get('table'))
            {
               //console.debug("WebSocketClient::receiptIncomingHandler");
               tableList.push(Ext.create('Genesis.model.frontend.Table',
               {
                  id : receipt.get('table')
               }));
            }

            //console.debug("WebSocketClient::receiptIncomingHandler");
            if (!supress)
            {
               console.debug("WebSocketClient::receiptIncomingHandler - \n" + //
               "Date: " + Genesis.fn.convertDateFullTime(new Date(receipt.get('id') * 1000)) + '\n' + //
               "Subtotal: $" + receipt.get('subtotal').toFixed(2) + '\n' + //
               "Price: $" + receipt.get('price').toFixed(2) + '\n' + //
               "table: " + receipt.get('table') + '\n' + //
               "itemsPurchased: " + receipt.get('itemsPurchased') + '\n' + //
               "Title: " + receipt.get('title') + '\n' + //
               "Receipt: [\n" + Ext.decode(receipt.get('receipt')) + "\n]" + //
               "");
            }

            receiptsList.push(receipt);
            receiptsMetaList.push(receipt.getData(true));
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
         if (!Genesis.fn.isNative() && receiptMetasList.length > 0)
         {
            window.postMessage(
            {
               cmd : 'notification_post',
               receipts : receiptMetasList
            }, "*");
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
      },
      listeners :
      {
         'insertReceipts' : 'onInsertReceipts',
         'resetReceipts' : 'onResetReceipts'
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

      me.initWorker(Ext.StoreMgr.get('EarnedReceiptStore'));
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

      me.getApplication().getController('server' + '.Pos').on('onopen', function()
      {
         if (pos.isEnabled())
         {
            me.onRetrieveReceipts();
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
      var me = this, worker = me.worker = new Worker('worker/receipt.min.js');
      //worker.postMessage = worker.webkitPostMessage || worker.postMessage;
      worker.onmessage = function(e)
      {
         var result = eval('[' + e.data + ']')[0];
         switch (result['cmd'])
         {
            case 'createReceipts':
            {
               console.debug("Successfully created/retrieved KickBak-Receipt Table");
               break;
            }
            case 'uploadReceipts':
            {
               var items = [], ids = [], item;

               result = result['result'];
               for (var i = 0; i < result.length; i++)
               {
                  //console.debug("uploadReceipts  --- item=" + result[i]['receipt']);
                  item = Ext.decode(result[i]['receipt']);
                  //console.debug("uploadReceipts  --- item[txnId]=" + item['txnId'] + ", item[items]=" + Ext.encode(item['items']));
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
               if (items.length > 0)
               {
                  me.uploadReceipts(items, ids);
               }
               console.debug("uploadReceipts  --- Found(unsync) " + items.length + " Receipts to Upload to Server");
               break;
            }
            case 'insertReceipts' :
            {
               console.debug("insertReceipts --- Inserted(unsync) " + result['result'] + " Receipts into KickBak-Receipt DB ...");
               break;
            }
            case 'updateReceipts':
            {
               console.debug("updateReceipts --- Updated(synced) " + result['result'] + " Receipts in the KickBak-Receipt DB");
               break;
            }
            case 'restoreReceipts' :
            {
               for (var i = 0; i < result['result'].length; i++)
               {
                  result['result'][i] = eval('[' + result['result'][i]['receipt'] + ']')[0];
               }
               estore.setData(result['result']);
               console.debug("restoreReceipt  --- Restored " + result['result'].length + " Receipts from the KickBak-Receipt DB");
               pos.initReceipt |= 0x01;
               me.onRetrieveReceipts();
               break;
            }
            case 'resetReceipts':
            {
               console.debug("resetReceipts --- Successfully drop KickBak-Receipt Table");
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
               break;
            }
            case 'nfc':
            {
               break;
            }
            default:
               break;
         }
      };

      worker.postMessage(
      {
         "cmd" : 'createReceipts'
      });
      worker.postMessage(
      {
         "cmd" : 'restoreReceipts'
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
                     id : record.get('table')
                  });

                  if (store.tableFilterId == record.get('table'))
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
   uploadReceipts : function(receipts, ids)
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
         me.worker.postMessage(
         {
            'cmd' : 'updateReceipts',
            'ids' : ids
         });

         console.debug("Successfully DISCARDED " + receipts.length + " Receipt(s) sent to Server");
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
               me.worker.postMessage(
               {
                  'cmd' : 'updateReceipts',
                  'ids' : ids
               });

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
      var me = this;

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
            me.worker.postMessage(
            {
               'cmd' : 'uploadReceipts',
               'lastReceiptTime' : (oldestReceipt == Number.MAX_VALUE) ? 0 : oldestReceipt
            });
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
   onInsertReceipts : function(receipts)
   {
      this.worker.postMessage(
      {
         "cmd" : 'insertReceipts',
         "receipts" : receipts
      });
   },
   onResetReceipts : function()
   {
      this.worker.postMessage(
      {
         "cmd" : 'resetReceipts'
      });
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
      }
   }
});
