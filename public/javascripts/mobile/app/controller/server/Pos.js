window.pos = null;

Ext.define('Genesis.controller.server.Pos',
{
   extend : 'Ext.app.Controller',
   initReceipt : 0x00,
   lastDisonnectTime : 0,
   scheme : 'ws://',
   port : '443',
   wssocket : null,
   lostPosConnectionMsg : 'Reestablishing connection to POS ...',
   init : function(app)
   {
      var me = this, ws = WebSocket.prototype;

      me.host = (Genesis.fn.isNative()) ? '192.168.159.1' : '127.0.0.1';
      me.url = me.scheme + me.host + ':' + me.port + "/pos";
      me.connTask = Ext.create('Ext.util.DelayedTask');

      //
      // For Non-Native environments, we must connect to POS to get NFC tag info regardless
      //
      if (!Genesis.fn.isNative())
      {
         me.wssocket = new WebSocket(me.url, 'json');
         //wssocket.binaryType = 'arraybuffer';

         me.setupWsCallback();
      }

      pos = me;

      console.log("Pos Init");
   },
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   isEnabled : function()
   {
      var db = Genesis.db.getLocalDB(), rc = db['enablePosIntegration'] && db['isPosEnabled'];
      //console.debug("Pos::isPosEnabled(" + rc + ")");
      return rc;
   },
   setupWsCallback : function()
   {
      var me = this;

      me.wssocket.onopen = function(event)
      {
         var posEnabled = me.isEnabled();
         if (posEnabled)
         {
            var db = Genesis.db.getLocalDB(), cntlr = me.getApplication().getController('server' + '.Receipts');

            Ext.Viewport.setMasked(null);
            //
            // Retrieve new connections after 5mins of inactivity
            //
            console.debug("WebSocketClient::onopen");

            me.lastDisonnectTime = db['lastPosDisconnectTime'] || 0;
            me.initReceipt |= 0x10;
            if (cntlr)
            {
               cntlr.fireEvent('retrieveReceipts');
            }
            Genesis.db.setLocalDBAttrib('lastPosConnectTime', Date.now());
         }
         me.fireEvent('onopen');
      };
      me.wssocket.onerror = function(event)
      {
         console.debug("WebSocketClient::onerror");
         me.fireEvent('onerror');
      };
      me.wssocket.onclose = function(event)
      {
         var timeout = pos.wssocket.reconnectTimer;
         console.debug("WebSocketClient::onclose, 5sec before retrying ...");
         //delete WebSocket.store[event._target];
         me.wssocket = null;
         //
         // Reconnect to server continuously
         //
         Genesis.db.setLocalDBAttrib('lastPosDisconnectTime', Date.now());
         me.connTask.delay(timeout, me.connect, me.wssocket);
         me.initReceipt &= ~0x10;
         me.fireEvent('onclose');
      };
      me.wssocket.onmessage = function(event)
      {
         // console.debug("wssocket.onmessage - [" + event.data + "]");
         try
         {
            var inputStream = eval('[' + event.data + ']')[0];
            //inputStream = Ext.decode(event.data);

            var cmd = inputStream['code'];
            //
            // Setup calculation for time drift
            //
            switch (cmd)
            {
               case 'receipt_incoming' :
               {
                  Genesis.fn.systemTime = inputStream['systemTime'] * 1000;
                  Genesis.fn.clientTime = new Date().getTime();
                  //console.debug("WebSocketClient::receipt_incoming ...")
                  me.wssocket.receiptIncomingHandler(inputStream['receipts']);
                  break;
               }
               case 'receipt_response' :
               {
                  Genesis.fn.systemTime = inputStream['systemTime'] * 1000;
                  Genesis.fn.clientTime = new Date().getTime();
                  //console.debug("WebSocketClient::receipt_response ...")
                  me.wssocket.receiptResponseHandler(inputStream['receipts']);
                  break;
               }
               case 'nfc' :
               {
                  me.wssocket.onNfc(inputStream['nfc']);
                  break;
               }
               default:
                  break;
            }
         }
         catch(e)
         {
            console.debug("Exception while parsing Incoming Receipt ...\n" + e);
            Ext.Viewport.setMasked(null);
         }
         me.fireEvent('onmessage');
      };
   },
   connect : function(forced)
   {
      var me = pos;

      if (Ext.Viewport && !me.wssocket && me.isEnabled() && //
      ((Genesis.fn.isNative() && Ext.device.Connection.isOnline()) || (!Genesis.fn.isNative() && navigator.onLine)))
      {
         me.wssocket = new WebSocket(me.url, 'json');

         me.setupWsCallback();

         Ext.Viewport.setMasked(null);
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.lostPosConnectionMsg,
            listeners :
            {
               'tap' : function(b, e, eOpts)
               {
                  Ext.Viewport.setMasked(null);
                  me.connTask.cancel();
               }
            }
         });
         console.debug("Pos::connect(" + me.url + ")");
      }
      else if (me.wssocket && forced)
      {
         me.wssocket.onopen();
         console.debug("Pos::connect(" + me.url + ")");
      }
   },
   disconnect : function(forced)
   {
      var me = pos;

      if (Genesis.db.getLocalDB()['enablePosIntegration'] || forced)
      {
         if (me.wssocket && me.wssocket.socket)
         {
            me.connTask.cancel();
            me.wssocket.socket.close();
            console.debug("Pos::disconnect called");
         }
      }
   }
});
