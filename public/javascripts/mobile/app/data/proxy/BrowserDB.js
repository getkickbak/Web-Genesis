/**
 * @author Grgur Grisogono
 *
 * BrowserDB Proxy for Ext JS 4 uses best available browser (local) database to use for your locally stored data
 * Currently available: IndexedDB and WebSQL DB
 *
 * Version: 0.3
 *
 */
(function()
{

   var idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB, cfg =
   {
   };

   /**
    * Choose which proxy to extend based on available features. IndexedDB is preferred over Web SQL DB
    */
   if (!idb)
   {
      cfg.dbInUse = 'websql';
      
      Ext.define('Genesis.data.proxy.BrowserDB',
      {
         extend : 'Genesis.data.proxy.WebSql',

         alias : 'proxy.browserdb',

         alternateClassName : 'Genesis.data.proxy.BrowserCache',

         dbInUse : cfg.dbInUse,

         /**
          * Route to the right proxy.
          * @param {Object} config (optional) Config object.
          */
         constructor : function(config)
         {
            // make sure config options are synced
            if (this.dbInUse !== 'idb')
            {
               config.dbTable = config.dbTable || config.objectStoreName;
            }
            else
            {
               config.objectStoreName = config.objectStoreName || config.dbTable;
            }
            this.callParent(arguments);
         }
      });
   }
   else
   {
      cfg.dbInUse = 'idb';
      
      Ext.define('Genesis.data.proxy.BrowserDB',
      {
         extend : 'Genesis.data.proxy.IndexedDB',

         alias : 'proxy.browserdb',

         alternateClassName : 'Genesis.data.proxy.BrowserCache',

         dbInUse : cfg.dbInUse,

         /**
          * Route to the right proxy.
          * @param {Object} config (optional) Config object.
          */
         constructor : function(config)
         {
            // make sure config options are synced
            if (this.dbInUse !== 'idb')
            {
               config.dbTable = config.dbTable || config.objectStoreName;
            }
            else
            {
               config.objectStoreName = config.objectStoreName || config.dbTable;
            }
            this.callParent(arguments);
         }
      });
   }
})();

