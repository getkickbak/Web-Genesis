// =============================================================
// Utilities Functions
// =============================================================
window.plugins = window.plugins ||
{
};

var _codec = null, gblController = // ControllerBase
{
   unsupportedBrowser : 'This browser is not supported.',
   incorrectMobileNumberFormatMsg : 'Enter a valid Mobile Number<br/>(800-555-1234)',
   networkErrorMsg : 'Error Connecting to Sever',
   cannotDetermineLocationMsg : 'Cannot determine current location. Visit one of our venues to continue!',
   geoLocationTimeoutErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationPermissionErrorMsg : function()
   {
      if ($.os.ios)
      {
         return 'Enable Location Servies and/or Reset Location Services (Settings > General > Reset > Reset Location Warnings).';
      }
      else if ($.os.android)
      {
         return 'Enable Location Servies and/or Reset Location Services (Settings > Location access > Access to my location).';
      }
      else
      {
         return 'Enable Location Servies on your mobile device.';
      }
   },
   geoLocationUnavailableMsg : 'To better serve you, please turn on your Location Services',
   geoLocationUseLastPositionMsg : 'We are not able to locate your current location. Using your last known GPS Coordinates ...',
   prepareToSendMerchantDeviceMsg : 'Confirm before tapping against the KICKBAK Card Reader ...',
   showToServerMsg : function()
   {
      return 'Show your KICKBAK Card or use your Mobile Number';
   },
   lookingForMerchantDeviceMsg : function()//Send
   {
      //return 'Tap your Phone against the ' + Genesis.constants.addCRLF() + 'KICKBAK Card Reader';
      return 'Tap your Phone against the KICKBAK Card Reader';
   },
   transactionCancelledMsg : 'This transaction is cancelled',
   encryptFromParams : function(params, mode)
   {
      GibberishAES.size(256);
      var encrypted = null, venueId = Genesis.fn.getPrivKey('venueId'), key = null;
      if ((venueId > 0) || (venueId < 0))
      {
         try
         {
            switch (mode)
            {
               case 'prize' :
               {
                  key = Genesis.fn.getPrivKey('p' + venueId);
               }
               case 'reward' :
               {
                  key = Genesis.fn.getPrivKey('r' + venueId);
                  break;
               }
               default :
                  key = Genesis.fn.getPrivKey('r' + venueId);
                  break;
            }
            encrypted = (venueId > 0) ? venueId + '$' : '';
            encrypted += GibberishAES.enc(Ext.encode(params), key);
         }
         catch (e)
         {
         }
      }

      return encrypted;
   },
   _merchant :
   {
   },
   _venue :
   {
      getId : function()
      {

      },
      get : function(attrib)
      {

      },
      getMerchant : function()
      {
         return gblController._merchant;
      }
   },
   _cntlr :
   {
      lastPosition : null,
      on : function(event, callback, options)
      {
         $('document').on('kickbak:locationupdate', callback);
      },
      getGeoLocation : function()
      {
         Genesis.fn.getLocation();
      },
      setLastPosition : function(position)
      {
         gblController._cntlr.lastPosition = position;
      },
      getLastPosition : function()
      {
         return gblController._cntlr.lastPosition;
      },
      getVenue : function()
      {
         return gblController._venue;
      }
   },
   // Viewport Controller
   getViewPortCntlr : function()
   {
      return gblController._cntlr;
   },
   pendingBroadcast : false,
   broadcastLocalID : function(success, fail)
   {
      var me = this, c = Genesis.constants, cancel = function()
      {
         //Ext.Ajax.abort();
         if (me.send_vol != -1)
         {
            window.plugins.proximityID.setVolume(-1);
         }
         window.plugins.proximityID.stop();
      };

      me.send_vol = -1;
      success = success || Ext.emptyFn;
      fail = fail || Ext.emptyFn;

      window.plugins.proximityID.send(function(result)
      {
         console.debug("ProximityID : Broacasting Local Identity ...");
         success(Genesis.fn.processSendLocalID(result, cancel));
      }, function(error)
      {
         console.debug('Error Code[' + Ext.encode(error) + ']');
         cancel();
         fail();
      });
   }
}, appLaunchCallbackFn = function()
{
};

gblController.self = gblController;

(function()
{
   var enumerables = true, enumerablesTest =
   {
      toString : 1
   }, i;

   for (i in enumerablesTest)
   {
      enumerables = null;
   }

   if (enumerables)
   {
      enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];
   }

   Ext = ( typeof (Ext) != 'undefined') ? Ext :
   {
      apply : function(object, config, defaults)
      {
         if (defaults)
         {
            Ext.apply(object, defaults);
         }

         if (object && config && typeof config === 'object')
         {
            var i, j, k;

            for (i in config)
            {
               object[i] = config[i];
            }

            if (enumerables)
            {
               for ( j = enumerables.length; j--; )
               {
                  k = enumerables[j];
                  if (config.hasOwnProperty(k))
                  {
                     object[k] = config[k];
                  }
               }
            }
         }

         return object;
      },
      decode : JSON.parse,
      encode : JSON.stringify,
      isFunction : ( typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value)
      {
         return toString.call(value) === '[object Function]';
      } : function(value)
      {
         return typeof value === 'function';
      },
      defer : function(fn, millis, scope, args, appendArgs)
      {
         fn = Ext.bind(fn, scope, args, appendArgs);
         if (millis > 0)
         {
            return setTimeout(fn, millis);
         }
         fn();
         return 0;
      },
      bind : function(fn, scope, args, appendArgs)
      {
         if (arguments.length === 2)
         {
            return function()
            {
               return fn.apply(scope, arguments);
            }
         }

         var method = fn, slice = Array.prototype.slice;

         return function()
         {
            var callArgs = args || arguments;

            if (appendArgs === true)
            {
               callArgs = slice.call(arguments, 0);
               callArgs = callArgs.concat(args);
            }

            return method.apply(scope || window, callArgs);
         };
      },
      Viewport :
      {
         setMasked : function(config)
         {
            $('#loadingMask')[config ? 'removeClass' : 'addClass']('x-item-hidden');
         }
      },
      emptyFn : function()
      {
      }
   };

})();

Genesis = ( typeof (Genesis) != 'undefined') ? Genesis :
{
   constants :
   {
      s_vol : 50,
      lastLocalID : null,
      //Default Volume laying flat on a surface (tx)
      s_vol : -1,
      r_vol : -1,
      debugVPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
      debugRPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
      debugVenuePrivKey : 'Debug Venue'
   },
   db :
   {
      _localDB : null,
      getLocalStorage : function()
      {
         return window.localStorage;
      },
      //
      // LocalDB
      //
      getLocalDB : function()
      {
         var me = Genesis.db;
         return (!me._localDB) ? (me._localDB = JSON.parse(me.getLocalStorage().getItem('kickbak') || "{}")) : me._localDB;
      },
      setLocalDB : function(db)
      {
         var me = Genesis.db;

         me._localDB = db;
         //console.debug("Setting KickBak DB[" + Ext.encode(db) + "]");
         me.getLocalStorage().setItem('kickbak', JSON.stringify(db));
      },
      setLocalDBAttrib : function(attrib, value)
      {
         //console.debug("Setting KickBak Attrib[" + attrib + "] to [" + value + "]");
         var me = Genesis.db;

         db = me.getLocalDB();
         db[attrib] = value;
         me.setLocalDB(db);
      },
      removeLocalDBAttrib : function(attrib)
      {
         var me = Genesis.db;

         db = me.getLocalDB();
         if ( typeof (db[attrib]) != 'undefined')
         {
            delete db[attrib];
            me.setLocalDB(db);
         }
      }
   },
   fn :
   {
      debugVPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
      debugRPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
      debugVenuePrivKey : 'Debug Venue',
      privKey : null,
      filesadded :
      {
      }, //list of files already added
      checkloadjscssfile : function(filename, filetype, cb)
      {
         //var decodeFilename = Url.decode(filename);
         var decodeFilename = filename;
         var index = this.filesadded[decodeFilename];
         if (Ext.isEmpty(index))
         {
            index = this.filesadded[decodeFilename] = [];
            if (Ext.isFunction(cb))
            {
               index[0] = false;
               index[1] = [cb];
               this.loadjscssfile(filename, filetype, false);
            }
            else
            {
               index[0] = true;
               this.loadjscssfile(filename, filetype, true);
            }
         }
         else if (index[0] == true)
         {
            if (Ext.isFunction(cb))
               cb(true);
         }
         else if (Ext.isFunction(cb))
         {
            if (index[1].indexOf(cb) < 0)
            {
               index[1].push(cb);
            }
         }
         else
         {
            console.debug("Do nothing for file[" + filename + "]");
         }
      },
      createjscssfile : function(filename, filetype)
      {
         var fileref;
         //filename = Url.decode(filename);
         if (filetype == "js")
         {
            //if filename is a external JavaScript file
            fileref = document.createElement('script')
            fileref.setAttribute("type", "text/javascript")
            fileref.setAttribute("src", filename)
         }
         else if (filetype == "css")
         {
            //if filename is an external CSS file
            fileref = document.createElement("link")
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("href", filename)
         }

         return fileref;
      },
      loadjscsstext : function(filename, filetype, text, cb)
      {
         var fileref;
         filename = Url.decode(filename);
         if (filetype == "js")
         {
            //if filename is a external JavaScript file
            fileref = document.createElement('script')
            fileref.setAttribute("type", "text/javascript")
            fileref.setAttribute("id", filename)
            //      fileref.innerHTML = "<!-- " + text + " -->";
            fileref.innerHTML = text;
         }
         else if (filetype == "css")
         {
            log("Loading cssfile (" + filename + ")");
            //if filename is an external CSS file
            fileref = document.createElement("style")
            fileref.setAttribute("id", filename)
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            // FF, Safari
            if ( typeof (fileref.textContent) != 'undefined')
            {
               fileref.textContent = text;
            }
            else
            {
               fileref.styleSheet.cssText = text;
               // FF, IE
            }
         }
         fileref.onerror = fileref.onload = fileref.onreadystatechange = function()
         {
            var rs = this.readyState;
            if (rs && (rs != 'complete' && rs != 'loaded'))
               return;
            if (cb)
               cb();
         }
         if (( typeof fileref) != undefined)
            document.getElementsByTagName("head")[0].appendChild(fileref)

         return fileref;
      },
      loadjscssfileCallBackFunc : function(b, t, href)
      {
         //href = Url.decode(href);
         if (t < 100)
         {
            /* apply only if the css is completely loded in DOM */
            try
            {
               var url = (document.styleSheets[b].href) ? document.styleSheets[b].href.replace(location.origin, '') : '';
               console.debug("url = " + url);
               //if (url.search(href) < 0)
               if (url != href)
               {
                  for (var i = 0; i < document.styleSheets.length; i++)
                  {
                     url = (document.styleSheets[i].href) ? document.styleSheets[i].href.replace(location.origin, '') : '';
                     console.debug("url = " + url);
                     //if (url.search(href) >= 0)
                     if (url == href)
                     {
                        b = i;
                        break;
                     }
                  }
               }
               // FF if css not loaded an exception is fired
               if (document.styleSheets[b].cssRules)
               {
                  this.cssOnReadyStateChange(href, false);
               }
               // IE no exception is fired!!!
               else
               {
                  if (document.styleSheets[b].rules && document.styleSheets[b].rules.length)
                  {
                     this.cssOnReadyStateChange(href, false);
                     return;
                  }
                  t++;
                  Ext.defer(this.loadjscssfileCallBackFunc, 250, this, [b, t, href]);
                  if ((t / 25 > 0) && (t % 25 == 0))
                  {
                     console.debug("IE Exception : Loading [" + href + "] index[" + b + "] try(" + t + ")");
                  }
               }
            }
            catch(e)
            {
               t++;
               if ((t / 25 > 0) && (t % 25 == 0))
               {
                  /*
                   console.debug(printStackTrace(
                   {
                   e : e
                   }));
                   */
                  console.debug("FF Exception : Loading [" + href + "] index[" + b + "] try(" + t + ")");
               }
               Ext.defer(this.loadjscssfileCallBackFunc, 250, this, [b, t, href]);
            }
         }
         else
         {
            //this.removejscssfile(href,"css");
            console.debug("Cannot load [" + href + "], index=[" + b + "]");
            //Cannot load CSS, but we still need to continue processing
            this.cssOnReadyStateChange(href, true);
         }
      },
      scriptOnError : function(loadState)
      {
         this.scriptOnReadyStateChange.call(this, loadState, true);
      },
      scriptOnReadyStateChange : function(loadState, error)
      {
         var src = this.src;
         //Url.decode(this.src);
         src = src.replace(location.origin, '');
         if (!error)
         {
            var rs = this.readyState;
            if (rs && (rs != 'complete' && rs != 'loaded'))
            {
               //console.debug("file ["+this.src+"] not loaded yet");
               return;
            }
            else if (!rs)
            {
               //console.debug("file ["+this.src+"] is loading");
               //return;
            }
         }
         else
         {
            console.debug("Error Loading JS file[" + src + "]");
         }

         var i = 0, cbList = Genesis.fn.filesadded[src];
         if (cbList)
         {
            cbList[0] = true;
            /*
             try
             {
             */
            for (; i < cbList[1].length; i++)
            {
               Ext.defer(function(index)
               {
                  cbList[1][index](!error);
               }, 1, null, [i]);
            }
            /*
             }
             catch (e)
             {
             debug(printStackTrace(
             {
             e: e
             }));
             debug("Error Calling callback on JS file["+src+"] index["+i+"]\nStack: ===========\n"+e.stack);
             }
             */
         }
         else
         {
            console.debug("Cannot find callback on JS file[" + src + "] index[" + i + "]");
         }
      },
      cssOnReadyStateChange : function(href, error)
      {
         //href = Url.decode(href);
         var cbList = Genesis.fn.filesadded[href];
         if (cbList)
         {
            cbList[0] = true;
            var i = 0;
            /*
             try
             {
             */
            for (; i < cbList[1].length; i++)
            {
               Ext.defer(function(index)
               {
                  cbList[1][index](!error);
               }, 1, null, [i]);
            }
            /*
             }
             catch (e)
             {
             console.debug(printStackTrace(
             {
             e : e
             }));
             console.debug("Error Calling callback on CSS file[" + href + "] index[" + i + "]\nStack: ===========\n" + e.stack);
             }
             */
         }
         else
         {
            console.debug("Cannot find callback on CSSS file[" + href + "] index[" + i + "]");
         }
      },
      loadjscssfile : function(filename, filetype, noCallback)
      {
         var fileref;
         //filename = Url.decode(filename);
         if (filetype == "js")
         {
            //if filename is a external Javascript file
            fileref = document.createElement('script')
            fileref.setAttribute("type", "text/javascript")
            if (!noCallback)
            {
               fileref.onerror = this.scriptOnError;
               fileref.onload = fileref.onreadystatechange = this.scriptOnReadyStateChange;
            }
            fileref.setAttribute("src", filename)
            document.getElementsByTagName("head")[0].appendChild(fileref)
         }
         else if (filetype == "css")
         {
            var len = document.styleSheets.length;

            // if filename is an external CSS file
            fileref = document.createElement('link')
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("media", "screen")
            fileref.setAttribute("href", filename)

            document.getElementsByTagName("head")[0].appendChild(fileref);
            if (!noCallback)
            {
               // +1 for inline style in webpage
               Ext.defer(this.loadjscssfileCallBackFunc, 50, this, [len, 0, filename]);
            }
         }
      },
      removejscssfile : function(filename, filetype)
      {
         //filename = Url.decode(filename);
         var efilename = escape(filename);
         var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none"//determine element type to create
         // nodelist from
         var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none"//determine corresponding attribute to
         // test
         // for
         var allsuspects = document.getElementsByTagName(targetelement)
         for (var i = allsuspects.length; i >= 0; i--)
         {
            //search backwards within nodelist for matching elements to remove
            if (allsuspects[i])
            {
               var attr = escape(allsuspects[i].getAttribute(targetattr));
               if (attr != null && ((attr == efilename) || (attr.search(efilename) != -1)))
               {
                  allsuspects[i].disabled = true;
                  allsuspects[i].parentNode.removeChild(allsuspects[i])//remove element by calling parentNode.removeChild()
                  delete Genesis.fn.filesadded[filename];
               }
            }
         }
      },
      // **************************************************************************
      // Proximity ID API Utilities
      // **************************************************************************
      printProximityConfig : function()
      {
         var c = Genesis.constants;
         console.debug("ProximityID Configuration");
         console.debug("=========================");
         console.debug("\n" + //
         "Signal Samples[" + c.numSamples + "]\n" + //
         "Missed Threshold[" + c.conseqMissThreshold + "]\n" + //
         "Signal Overlap Ratio[" + c.sigOverlapRatio + "]\n" + //
         "Default Volume[" + c.s_vol + "%]\n" //
         );
      },
      processSendLocalID : function(result, cancelFn)
      {
         var localID, identifiers = null;

         if (result.freqs)
         {
            Genesis.constants.lastLocalID = result.freqs;
         }

         localID = Genesis.constants.lastLocalID;
         if (localID)
         {
            identifiers = 'LocalID=[' + localID[0] + ', ' + localID[1] + ', ' + localID[2] + ']';
            //console.log('Sending out ' + identifiers);
         }
         return (
            {
               'message' : identifiers,
               'localID' : localID,
               'cancelFn' : cancelFn
            });
      },
      getLocation : function()
      {
         if (navigator.geolocation)
         {
            var viewport = gblController.getViewPortCntlr(), position = viewport.getLastPosition();

            if (!position || (position['coords'] && (position['coords'].timestamp > (Date.now() - (5 * 60 * 1000)))))
            {
               viewport.setLastPosition(null);
               navigator.geolocation.getCurrentPosition(function(_position)
               {
                  console.debug("Latitude: " + _position.coords.latitude + "\nLongitude: " + _position.coords.longitude);
                  viewport.setLastPosition(_position);
                  $(document).trigger('locationupdate', [_position]);
               }, function(error)
               {
                  switch (error.code)
                  {
                     //DENIED
                     case 1 :
                     {
                        setNotificationVisibility(true, "Permission Denied", gblController.geoLocationPermissionErrorMsg, "Dismiss", function()
                        {
                           Ext.Viewport.setMasked(null);
                        });
                        break;
                     }
                     case 2 :
                     //UNAVAIL
                     {
                        setNotificationVisibility(true, "Location Services", gblController.geoLocationUnavailableMsg, "Dismiss", function()
                        {
                           Ext.Viewport.setMasked(null);
                        });
                        break;
                     }
                     case 3 :
                     //TIMEOUT
                     {
                        setNotificationVisibility(true, "Location Services", gblController.geoLocationTimeoutErrorMsg, "Dismiss", function()
                        {
                           Ext.Viewport.setMasked(null);
                        });
                        break;
                     }
                  }
               },
               {
                  timeout : (30 * 1000),
                  maximumAge : (1000 * 60 * 5),
                  enableHighAccuracy : true
               });

               var positionTimer = navigator.geolocation.watchPosition(function(_position)
               {
                  // Log that a newer, perhaps more accurate
                  // position has been found.
                  console.debug("Newer Position Found", _position);

                  viewport.setLastPosition(_position);
                  $(document).trigger('locationupdate', [_position]);
               });
            }
            else
            {
               $(document).trigger('locationupdate', [position]);
            }
         }
         else
         {
            setNotificationVisibility(true, "Location Services", gblController.unsupportBrowserMsg, "Dismiss", function()
            {
               Ext.Viewport.setMasked(null);
            });
         }
      },
      getPrivKey : function(id, callback)
      {
         var me = this;
         callback = callback || Ext.emptyFn;
         if (!me.privKey)
         {
            // Hardcoded for now ...
            me.privKey =
            {
               'v1' : me.debugVPrivKey,
               'r1' : me.debugRPrivKey,
               'venue' : me.debugVenuePrivKey,
               'venueId' : 1
            }
         }

         return ((id) ? me.privKey[id] : me.privKey);
      }
   }
};
