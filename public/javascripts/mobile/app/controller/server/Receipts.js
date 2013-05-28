var wssocket = null, posConnect = Ext.emptyFn, posDisconnect = Ext.emptyFn;
Ext.require(['Genesis.model.frontend.ReceiptItem', 'Genesis.model.frontend.Receipt', 'Ext.device.Connection', 'Genesis.controller.ControllerBase'], function()
{
   var db = Genesis.db.getLocalDB();
   if (db['receiptFilters'])
   {
      WebSocket.prototype.receiptFilters = Ext.clone(db['receiptFilters']);
      WebSocket.prototype.receiptFilters['grandtotal'] = new RegExp(db['receiptFilters']['grandtotal'], "i");
      WebSocket.prototype.receiptFilters['subtotal'] = new RegExp(db['receiptFilters']['subtotal'], "i");
      WebSocket.prototype.receiptFilters['item'] = new RegExp(db['receiptFilters']['item'], "i");
      WebSocket.prototype.receiptFilters['table'] = new RegExp(db['receiptFilters']['table'], "i");
   }

   WebSocket._connTask = Ext.create('Ext.util.DelayedTask');
   Ext.merge(WebSocket.prototype,
   {
      createReceipt : function(receiptText)
      {
         var me = this, i, match, currItemPrice = 0, maxItemPrice = 0, id = receiptText[0];

         receiptText.splice(0, 1);
         var receipt =
         {
            id : id,
            subtotal : currItemPrice.toFixed(2),
            price : currItemPrice.toFixed(2),
            table : '',
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
                  receipt['subtotal'] = match[1];
               }

               match = me.receiptFilters['grandtotal'].exec(text);
               if (match)
               {
                  receipt['price'] = match[1];
               }

               match = me.receiptFilters['table'].exec(text);
               if (match)
               {
                  receipt['table'] = match[1];
               }

               match = me.receiptFilters['item'].exec(text);
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
         var rc = Ext.create("Genesis.model.frontend.Receipt", receipt);
         rc['items']().add(receipt['items']);
         //console.debug("WebSocketClient::createReceipt");
         return rc;
      },
      receiptIncomingHandler : function(receipts, supress)
      {
         var receiptsList = [], tableList = [];
         //console.debug("WebSocketClient::onmessage - " + event);
         for (var i = 0, j = 0; i < receipts.length; i++)
         {
            var receipt = receiptsList[i] = this.createReceipt(receipts[i]);
            if (receipt.get('table'))
            {
               //console.debug("WebSocketClient::receiptIncomingHandler");
               tableList[j++] = Ext.create('Genesis.model.frontend.Table',
               {
                  id : receipt.get('table')
               });
            }

            //console.debug("WebSocketClient::receiptIncomingHandler");
            if (!supress)
            {
               console.debug("WebSocketClient::receiptIncomingHandler - \n" + //
               "Date: " + Genesis.fn.convertDateFullTime(new Date(receipt.get('id') * 1000)) + '\n' + //
               "Subtotal: $" + receipt.get('subtotal').toFixed(2) + '\n' + //
               "Price: $" + receipt.get('price').toFixed(2) + '\n' + //
               "table: " + receipt.get('table') + '\n' + //
               "Title: " + receipt.get('title') + '\n' + //
               "Receipt: [\n" + Ext.decode(receipt.get('receipt')) + "\n]" + //
               "");
            }
         }

         if (!supress)
         {
            Ext.StoreMgr.get('ReceiptStore').add(receiptsList);
            Ext.StoreMgr.get('TableStore').add(tableList);
         }

         return [receiptsList, tableList];
      },
      receiptResponseHandler : function(receipts)
      {
         var lists = this.receiptIncomingHandler(receipts, true), rstore = Ext.StoreMgr.get('ReceiptStore'), tstore = Ext.StoreMgr.get('TableStore');
         lists[1].push(Ext.create("Genesis.model.frontend.Table",
         {
            id : 'All'
         }));
         rstore.setData(lists[0]);
         rstore.tableFilterId = null;
         tstore.setData(lists[1]);

         console.debug("WebSocketClient::receiptResponseHandler - Processed " + lists[0].length + " receipts");
         Ext.Viewport.setMasked(null);
      }
   });

   posConnect = function(i)
   {
      var db = Genesis.db.getLocalDB();
      if (db['enablePosIntegration'] && db['isPosEnabled'] && Ext.Viewport)
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
                        break;
                     }
                     default:
                        break;
                  }
               }
               catch(e)
               {
                  console.debug("Exception while parsing Incoming Receipt ...\n" + Ext.encode(e));
                  Ext.Viewport.setMasked(null);
               }
            };
            wssocket.onerror = function(event)
            {
               console.debug("WebSocketClient::onerror - \r\n" + Ext.encode(event));
            };
            wssocket.onclose = function(event)
            {
               var db = Genesis.db.getLocalDB();

               console.debug("WebSocketClient::onclose - \r\n" + Ext.encode(event));
               delete WebSocket.store[event._target];
               wssocket = null;
               //
               // Reconnect to server continuously
               //
               WebSocket._connTask.delay(5 * 1000, posConnect, wssocket, [++i]);
            };

            Ext.Viewport.setMasked(null);
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : Genesis.controller.ControllerBase.prototype.lostPosConnectionMsg,
               listeners :
               {
                  'tap' : function(b, e, eOpts)
                  {
                     Ext.Viewport.setMasked(null);
                     WebSocket._connTask.cancel();
                  }
               }
            });
            console.debug("WebSocketClient::posConnect(" + url + ")");
         }
      }
   };
   posDisconnect = function(forced)
   {
      if (Genesis.db.getLocalDB()['enablePosIntegration'] || forced)
      {
         if (wssocket && wssocket.socket)
         {
            WebSocket._connTask.cancel();
            wssocket.socket.close();
            console.debug("WebSocketClient::posDisconnect called");
         }
      }
   };
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
      models : ['PurchaseReward', 'frontend.Receipt', 'frontend.Table'],
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
   _hyteresisTask : null,
   _syncTask : null,
   init : function(app)
   {
      var me = this, estore;
      var createStatement = "CREATE TABLE IF NOT EXISTS Receipt (id INTEGER PRIMARY KEY, receipt TEXT, sync INTEGER)";
      me.db = openDatabase('KickBak', 'ReceiptStore', "1.0", 5 * 1024 * 1024);
      me.db.transaction(function(tx)
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
      });

      me.callParent(arguments);

      console.log("Server Receipts Init");

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

               if (record1.data['id'] == 'All')
               {
                  return -1;
               }
               if (record2.data['id'] == 'All')
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

      me.restoreReceiptDB(estore);
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this, db = Genesis.db.getLocalDB();
      try
      {
         me.posIntegrationHandler(metaData, db['isPosEnabled']);
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
   posIntegrationHandler : function(metaData, isPosEnabled)
   {
      var db = Genesis.db.getLocalDB();

      db['enablePosIntegration'] = metaData['enablePOS'];
      db['isPosEnabled'] = ((isPosEnabled === undefined) || (isPosEnabled));
      if (db['enablePosIntegration'] && db['isPosEnabled'])
      {
         var filters = metaData['receiptFilters'] = metaData['receiptFilters'] ||
         {
         };
         db['receiptFilters'] =
         {
            minLineLength : filters['minLineLength'] || 5,
            grandtotal : filters['grandtotal'] || "\\s*\\bGrand Total\\b\\s+\\$(\\d+\.\\d{2})\\s*",
            subtotal : filters['subtotal'] || "\\s*\\bSubtotal\\b\\s+\\$(\\d+\.\\d{2})\\s*",
            item : filters['item'] || "([\\s*\\w+]+)\\s+(\\d+)\\s+\\$(\\d+\\.\\d{2})\\s*",
            table : filters['table'] || "\\s*\\bTABLE\\b:\\s+(Bar\\s+\\d+)\\s*"
         }
         WebSocket.prototype.receiptFilters = Ext.clone(db['receiptFilters']);
         WebSocket.prototype.receiptFilters['grandtotal'] = new RegExp(db['receiptFilters']['grandtotal'], "i");
         WebSocket.prototype.receiptFilters['subtotal'] = new RegExp(db['receiptFilters']['subtotal'], "i");
         WebSocket.prototype.receiptFilters['item'] = new RegExp(db['receiptFilters']['item'], "i");
         WebSocket.prototype.receiptFilters['table'] = new RegExp(db['receiptFilters']['table'], "i");
         posConnect();
         console.debug("posIntegrationHandler - Enabled");
      }
      else
      {
         var store = Ext.StoreMgr.get('ReceiptStore');
         posDisconnect(true);
         store.removeAll();
         store.remove(store.getRange());
         delete WebSocket.prototype.receiptFilters;
         // BUG: We have to remove the filtered items as well
         console.debug("posIntegrationHandler - Disabled");
      }
      db['enableReceiptUpload'] = metaData['enableReceiptUpload'];
      Genesis.db.setLocalDB(db);
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
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   restoreReceiptDB : function(estore)
   {
      var selectAllStatement = "SELECT receipt FROM Receipt";
      try
      {
         this.db.transaction(function(tx)
         {
            //
            // Retrieve Receipts
            //
            tx.executeSql(selectAllStatement, [], function(tx, result)
            {
               var items = [];
               var dataset = result.rows;
               for (var j = 0, item = null; j < dataset.length; j++)
               {
                  item = dataset.item(j);
                  items.push(Ext.decode(item));
               }
               estore.setData(items);
               console.debug("restoreReceiptDB  --- Restored " + items.length + " records in SQL Receipt Database");
            }, function(tx, error)
            {
            });
         });
      }
      catch(e)
      {
      }
   },
   uploadReceipts : function(receipts)
   {
      var me = this, proxy = PurchaseReward.getProxy(), displayMode = Genesis.db.getLocalDB["displayMode"];
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

      var ids = [];
      for (var i = 0; i < receipts.length; i++)
      {
         ids.push(receipts[i]['tnId']);
      }
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
               var len = ids.length;
               var updateStatement = "UPDATE Receipt SET sync=1 WHERE id in (" + ids.toString() + ");";
               try
               {
                  me.db.transaction(function(tx)
                  {
                     //
                     // Update Receipt Database
                     //
                     tx.executeSql(updateStatement, [], function()
                     {
                        console.debug("uploadReceipts --- Updated(synced) " + len + "Receipts from the KickBak-Receipt Database");
                     }, function(tx, error)
                     {
                     });
                  });
               }
               catch(e)
               {
               }
            }
            else
            {
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
            var selectAllStatement = "SELECT receipt FROM Receipt WHERE sync=0";
            try
            {
               me.db.transaction(function(tx)
               {
                  //
                  // Retrieve Receipts
                  //
                  tx.executeSql(selectAllStatement, [], function(tx, result)
                  {
                     var items = [], item;
                     var dataset = result.rows;
                     for ( j = 0; j < dataset.length; j++)
                     {
                        item = Ext.decode(dataset.item(j));
                        items.push(item);
                        console.debug("Receipt TnId[" + item['tnId'] + "]");
                     }

                     console.debug("syncReceiptDB  --- Found " + items.length + "Unsynchronized records in SQL Receipt Database");

                     if (items.length > 0)
                     {
                        Ext.defer(me.uploadReceipts, 1, me, [items]);
                     }
                  }, function(tx, error)
                  {
                     console.debug("No Receipt Table found in SQL Database : " + error.message);
                  });
               });
            }
            catch(e)
            {
            }
         });
      }
      me._syncTask.delay(duration);
      console.debug("syncReceiptDB - Synchronize Database to start in " + (duration / (1000 * 60)).toFixed(0) + "mins of idle");
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
         var isPosEnabled = (field.getValue() == 1) ? true : false;
         Genesis.db.setLocalDBAttrib('isPosEnabled', isPosEnabled);
         console.debug("onPosModeChange - " + isPosEnabled);
         me.updateMetaDataInfo(viewport.getMetaData());
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
      me.batteryStatusFn();
   }
});
