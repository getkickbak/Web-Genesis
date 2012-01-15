//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.AjaxProxy
//---------------------------------------------------------------------------------------------------------------------------------

// With Safari 5.0.3 if a resource is added to the CACHE MANIFEST we always
// get a status of 0 from Ajax calls, even though the responseText is returned
// from the cache.  This object just assumes the call was successful.
Ext.define('Ext.ux.data.OfflineAjaxProxy',
{
   extend : 'Ext.data.AjaxProxy',
   xtype : 'offlineajax',
   alias : 'proxy.offlineajax',
   requires : ['Ext.data.AjaxProxy'],
   // based on AjaxProxy::createRequestCallback
   createRequestCallback : function(request, operation, callback, scope)
   {
      var me = this;

      return function(options, success, response)
      {
         // Safari always returns status === 0 when json file
         // is in the manifest.  Assume success.
         var reader = me.getReader(), result = reader.read(response);

         Ext.apply(operation,
         {
            response : response,
            resultSet : result
         });

         operation.setCompleted();
         operation.setSuccessful();

         if( typeof callback == 'function')
         {
            callback.call(scope || me, operation);
         }

         me.afterRequest(request, true);
      };
   }
});

//
// Temporary Fix until Sencha Touch Team fixes Ext.Loader problem when running in PhoneGap
//

/**
 * Load a script file, supports both asynchronous and synchronous approaches
 *
 * @param {String} url
 * @param {Function} onLoad
 * @param {Scope} scope
 * @param {Boolean} synchronous
 * @private
 */
/*
Ext.Loader.loadScriptFile = function(url, onLoad, onError, scope, synchronous)
{
   var isPhantomJS = ( typeof phantom != 'undefined' && phantom.fs);
   var me = this, isFileLoaded = this.isFileLoaded, scriptElements = this.scriptElements, noCacheUrl = url + (this.getConfig('disableCaching') ? ('?' + this.getConfig('disableCachingParam') + '=' + Ext.Date.now()) : ''), isCrossOriginRestricted = false, xhr, status, onScriptError;

   if(isFileLoaded[url])
   {
      return this;
   }
   scope = scope || this;

   this.isLoading = true;

   if(!synchronous)
   {
      onScriptError = function()
      {
         //<debug error>
         onError.call(scope, "Failed loading '" + url + "', please verify that the file exists", synchronous);
         //</debug>
      };
      if(!Ext.isReady && Ext.onDocumentReady)
      {
         Ext.onDocumentReady(function()
         {
            if(!isFileLoaded[url])
            {
               scriptElements[url] = me.injectScriptElement(noCacheUrl, onLoad, onScriptError, scope);
            }
         });
      }
      else
      {
         scriptElements[url] = this.injectScriptElement(noCacheUrl, onLoad, onScriptError, scope);
      }
   }
   else
   {
      if( typeof XMLHttpRequest != 'undefined')
      {
         xhr = new XMLHttpRequest();
      }
      else
      {
         xhr = new ActiveXObject('Microsoft.XMLHTTP');
      }

      try
      {
         xhr.open('GET', noCacheUrl, false);
         xhr.send(null);
      }
      catch (e)
      {
         isCrossOriginRestricted = true;
      }
      status = (xhr.status === 1223) ? 204 : xhr.status;

      if(!isCrossOriginRestricted)
      {
         isCrossOriginRestricted = (status === 0);
      }

      if(isCrossOriginRestricted
      //<if isNonBrowser>
      && !isPhantomJS
      //</if>
      )
      {
         //<debug error>
         //onError.call(this, "Failed loading synchronously via XHR: '" + url + "'; It's likely that the file is either " + "being
         // loaded from a different domain or from the local file system whereby cross origin " + "requests are not allowed due to
         // security reasons. Use asynchronous loading with " + "Ext.require instead.", synchronous);
         //</debug>
      }
      else
      if(status >= 200 && status < 300
      //<if isNonBrowser>
      || isPhantomJS
      //</if>
      )
      {
         // Debugger friendly, file names are still shown even though they're eval'ed code
         // Breakpoints work on both Firebug and Chrome's Web Inspector
         Ext.globalEval(xhr.responseText + "\n//@ sourceURL=" + url);

         onLoad.call(scope);
      }
      else
      {
         //<debug>
         onError.call(this, "Failed loading synchronously via XHR: '" + url + "'; please " + "verify that the file exists. " + "XHR status code: " + status, synchronous);
         //</debug>
      }

      // Prevent potential IE memory leak
      xhr = null;
   }
}
*/