// =============================================================
// Utilities Functions
// =============================================================

var _codec = null, gblController = // ControllerBase
{
   unsupportedBrowser : 'This browser is not supported.',
   incorrectMobileNumberFormatMsg : 'Enter a valid Mobile Number<br/>(800-555-1234)',
   networkErrorMsg : 'Error Connecting to Sever',
   cannotDetermineLocationMsg : 'Cannot determine current location. Visit one of our venues to continue!',
   geoLocationTimeoutErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationPermissionErrorMsg : function()
   {
      var rc;
      if (!Gensis.fn.isNative())
      {
         if ($.os && $.os.ios)
         {
            rc = 'Enable Location Servies and/or Reset Location Services (Settings > General > Reset > Reset Location Warnings).';
         }
         else if ($.os && $.os.android)
         {
            rc = 'Enable Location Servies and/or Reset Location Services (Settings > Location access > Access to my location).';
         }
         else
         {
            rc = 'Enable Location Servies on your mobile device.';
         }
      }
      else
      {
         rc = 'This feature must require your GeoLocation to proceed.';
         if ($.os && $.os.android)
         {
            rc += // ((Ext.os.version.isLessThan('4.1')) ? //
            'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> GPS satellites\"';
         }
         else if ($.os && $.os.ios)
         {
            rc += ((parseFloat($.os.version) < 6.0) ? //
            'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> KICKBAK\"' :
            // //
            'Enable Location Services under Main Screen of your phone: \"Settings App >> Privacy >> Location Services >> KICKBAK\"'//
            );
         }
         else if ($.os && ($.os.blackberry || $.os.bb10 || $.os.rimtabletos))
         {
            rc += 'Enable Location Services under Main Screen of your phone: \"Settings App >> Site Permissions\"';
         }
         else
         {
            rc += 'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services\"';
         }

      }

      return rc;
   },
   geoLocationUnavailableMsg : 'To better serve you, please turn on your Location Services',
   geoLocationUseLastPositionMsg : 'We are not able to locate your current location. Using your last known GPS Coordinates ...',
   getMerchantInfoMsg : 'Retrieving Merchant Information ...',
   getVenueInfoMsg : 'Retrieving Venue Information ...',
   noVenueInfoMsg : function(errors)
   {
      return ('No Venues found in your proximity!');
   },
   missingVenueInfoMsg : function(errors)
   {
      return ('Error loading Venue information.');
   },
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
      /*
       on : function(event, callback, options)
       {
       $('document').on('kickbak:locationupdate', callback);
       },
       */
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
   },
   loadSoundFile : function(tag, sound_file, type)
   {
      var me = this, ext = '.' + (sound_file.split('.')[1] || 'mp3');
      sound_file = sound_file.split('.')[0];

      if (Genesis.fn.isNative())
      {
         var callback = function()
         {
            switch(type)
            {
               case 'FX' :
               {
                  LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, function()
                  {
                     console.debug("loaded " + sound_file);
                  }, function(err)
                  {
                     console.debug("Audio Error: " + err);
                  });
                  break;
               }
               case 'Audio' :
               {
                  LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, 3, function()
                  {
                     console.debug("loaded " + sound_file);
                  }, function(err)
                  {
                     console.debug("Audio Error: " + err);
                  });
                  break;
               }
            }
         };
         switch(type)
         {
            case 'Media' :
            {
               sound_file = new Media((($.os && $.os.android) ? '/android_asset/www/' : '') + Genesis.constants.relPath() + 'resources/audio/' + sound_file + ext, function()
               {
                  me.sound_files[tag].successCallback();
               }, function(err)
               {
                  me.sound_files[tag].successCallback();
                  console.debug("Audio Error: " + err);
               });
               break;
            }
            default :
               LowLatencyAudio['unload'](sound_file, callback, callback);
               break;
         }
      }

      me.sound_files[tag] =
      {
         name : sound_file,
         type : type
      };
   },
   playSoundFile : function(sound_file, successCallback, failCallback)
   {
      if (Genesis.fn.isNative())
      {
         switch (sound_file['type'])
         {
            case 'FX' :
            case 'Audio' :
               LowLatencyAudio.play(sound_file['name'], successCallback || Ext.emptyFn, failCallback || Ext.emptyFn);
               break;
            case 'Media' :
               sound_file['successCallback'] = successCallback || Ext.emptyFn;
               sound_file['name'].play();
               break;
         }
      }
      else
      {
         if (successCallback)
         {
            successCallback();
         }
      }
   },
   stopSoundFile : function(sound_file)
   {
      if (Genesis.fn.isNative())
      {
         switch (sound_file['type'])
         {
            case 'FX' :
            case 'Audio' :
               LowLatencyAudio.stop(sound_file['name']);
               break;
            case 'Media' :
               sound_file['name'].stop();
               break;
         }
      }
      else
      {
         /*
          var sound = Ext.get(sound_file['name']).dom;
          sound.pause();
          sound.currentTime = 0;
          */
      }
   }
};

gblController.self = gblController;

(function()
{
   var global = this, objectPrototype = Object.prototype, toString = objectPrototype.toString, enumerables = true, enumerablesTest =
   {
      toString : 1
   }, emptyFn = function()
   {
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
      /**
       * Returns `true` if the passed value is empty, `false` otherwise. The value is deemed to be empty if it is either:
       *
       * - `null`
       * - `undefined`
       * - a zero-length array.
       * - a zero-length string (Unless the `allowEmptyString` parameter is set to `true`).
       *
       * @param {Object} value The value to test.
       * @param {Boolean} [allowEmptyString=false] (optional) `true` to allow empty strings.
       * @return {Boolean}
       */
      isEmpty : function(value, allowEmptyString)
      {
         return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (Ext.isArray(value) && value.length === 0);
      },

      /**
       * Returns `true` if the passed value is a JavaScript Array, `false` otherwise.
       *
       * @param {Object} target The target to test.
       * @return {Boolean}
       * @method
       */
      isArray : ('isArray' in Array) ? Array.isArray : function(value)
      {
         return toString.call(value) === '[object Array]';
      },
      /**
       * Returns `true` if the passed value is a JavaScript Object, `false` otherwise.
       * @param {Object} value The value to test.
       * @return {Boolean}
       * @method
       */
      isObject : (toString.call(null) === '[object Object]') ? function(value)
      {
         // check ownerDocument here as well to exclude DOM nodes
         return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
      } : function(value)
      {
         return toString.call(value) === '[object Object]';
      },
      isFunction : ( typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value)
      {
         return toString.call(value) === '[object Function]';
      } : function(value)
      {
         return typeof value === 'function';
      },
      /**
       * Returns `true` if the passed value is defined.
       * @param {Object} value The value to test.
       * @return {Boolean}
       */
      isDefined : function(value)
      {
         return typeof value !== 'undefined';
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
      /**
       * Clone almost any type of variable including array, object, DOM nodes and Date without keeping the old reference.
       * @param {Object} item The variable to clone.
       * @return {Object} clone
       */
      clone : function(item)
      {
         if (item === null || item === undefined)
         {
            return item;
         }

         // DOM nodes
         if (item.nodeType && item.cloneNode)
         {
            return item.cloneNode(true);
         }

         // Strings
         var type = toString.call(item);

         // Dates
         if (type === '[object Date]')
         {
            return new Date(item.getTime());
         }

         var i, j, k, clone, key;

         // Arrays
         if (type === '[object Array]')
         {
            i = item.length;

            clone = [];

            while (i--)
            {
               clone[i] = Ext.clone(item[i]);
            }
         }
         // Objects
         else if (type === '[object Object]' && item.constructor === Object)
         {
            clone =
            {
            };

            for (key in item)
            {
               clone[key] = Ext.clone(item[key]);
            }

            if (enumerables)
            {
               for ( j = enumerables.length; j--; )
               {
                  k = enumerables[j];
                  clone[k] = item[k];
               }
            }
         }

         return clone || item;
      },
      emptyFn : function()
      {
      }
   };

   var ExtObject = Ext.Object =
   {
      /**
       * Merges any number of objects recursively without referencing them or their children.
       *
       *     var extjs = {
       *         companyName: 'Ext JS',
       *         products: ['Ext JS', 'Ext GWT', 'Ext Designer'],
       *         isSuperCool: true,
       *         office: {
       *             size: 2000,
       *             location: 'Palo Alto',
       *             isFun: true
       *         }
       *     };
       *
       *     var newStuff = {
       *         companyName: 'Sencha Inc.',
       *         products: ['Ext JS', 'Ext GWT', 'Ext Designer', 'Sencha Touch', 'Sencha Animator'],
       *         office: {
       *             size: 40000,
       *             location: 'Redwood City'
       *         }
       *     };
       *
       *     var sencha = Ext.Object.merge({}, extjs, newStuff);
       *
       *     // sencha then equals to
       *     {
       *         companyName: 'Sencha Inc.',
       *         products: ['Ext JS', 'Ext GWT', 'Ext Designer', 'Sencha Touch', 'Sencha Animator'],
       *         isSuperCool: true
       *         office: {
       *             size: 40000,
       *             location: 'Redwood City'
       *             isFun: true
       *         }
       *     }
       *
       * @param {Object} source The first object into which to merge the others.
       * @param {Object...} objs One or more objects to be merged into the first.
       * @return {Object} The object that is created as a result of merging all the objects passed in.
       */
      merge : function(source)
      {
         var i = 1, ln = arguments.length, mergeFn = ExtObject.merge, cloneFn = Ext.clone, object, key, value, sourceKey;

         for (; i < ln; i++)
         {
            object = arguments[i];

            for (key in object)
            {
               value = object[key];
               if (value && value.constructor === Object)
               {
                  sourceKey = source[key];
                  if (sourceKey && sourceKey.constructor === Object)
                  {
                     mergeFn(sourceKey, value);
                  }
                  else
                  {
                     source[key] = cloneFn(value);
                  }
               }
               else
               {
                  source[key] = value;
               }
            }
         }

         return source;
      }
   }

})();

Genesis = ( typeof (Genesis) != 'undefined') ? Genesis :
{
   constants :
   {
      clientVersion : '2.2.0',
      serverVersion : '2.2.0',
      s_vol : 50,
      lastLocalID : null,
      //Default Volume laying flat on a surface (tx)
      s_vol : -1,
      r_vol : -1,
      debugVPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
      debugRPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
      debugVenuePrivKey : 'Debug Venue',
      relPath : function()
      {
         return "../";
      }
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
      getLocalDB : function(refresh)
      {
         var me = Genesis.db;
         if (refresh)
         {
            delete me._localDB;
         }
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
      isNative : function()
      {
         return (( typeof (phoneGapAvailable) != 'undefined') ? phoneGapAvailable : false);
      },
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
         Genesis.fn.scriptOnReadyStateChange.call(this, loadState, true);
      },
      scriptOnReadyStateChange : function(loadState, error)
      {
         var src = this.src, profile;
         //Url.decode(this.src);
         src = src.replace(location.origin, '');
         //
         // PhoneGap App
         //
         //console.log("scriptOnReadyStateChange: " + location.host);
         if (location.host == "")
         {
            if ($.os.ios)
            {
               profile = 'ios_';
            }
            else
            //else if ($.os.android)
            {
               profile = 'android_';
            }
            src = Genesis.constants.relPath() + src.replace(location.pathname.replace('launch/index_' + profile + 'native.html', ''), '');
         }
         console.log("Script: " + src);

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
         var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none"//determine element type to
         // create
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
                           setLoadMask(false);
                        });
                        break;
                     }
                     case 2 :
                     //UNAVAIL
                     {
                        setNotificationVisibility(true, "Location Services", gblController.geoLocationUnavailableMsg, "Dismiss", function()
                        {
                           setLoadMask(false);
                        });
                        break;
                     }
                     case 3 :
                     //TIMEOUT
                     {
                        setNotificationVisibility(true, "Location Services", gblController.geoLocationTimeoutErrorMsg, "Dismiss", function()
                        {
                           setLoadMask(false);
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
               setLoadMask(false);
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

//---------------------------------------------------------------------------------------------------------------------------------
// PushWoosh Push Notification API
//---------------------------------------------------------------------------------------------------------------------------------
(function()
{
   $.Event('kickbak:updateDeviceToken');

   var me = Genesis.constants;
   if ($.os)
   {
      if ($.os.ios)
      {
         initPushwoosh = function()
         {
            if (debugMode)
            {
               me.pushNotifAppName = 'KickBak Dev Latest';
               me.pushNotifAppId = '93D8A-5BE72';
            }
            else
            {
               me.pushNotifAppName = 'KickBak Production';
               me.pushNotifAppId = '4fef6fb0691c12.54726991';
            }
            me.pushNotifType = 1;

            var pushNotification = window.plugins.pushNotification;

            document.addEventListener('push-notification', function(event)
            {
               if (event.notification)
               {
                  var notification = event.notification, userData = notification.u;
                  console.debug('push notifcation - [' + JSON.stringify(notification) + ']');

                  //if ( typeof (userData) != "undefined")
                  if (Genesis.db.getLocalDB()['auth_code'])
                  {
                     setNotificationVisibility(true, 'KICKBAK Notification', notification.aps.alert, 'Dismiss', function()
                     {
                        setChildBrowserVisibility(true, '', userData);
                     });
                  }
               }
            });

            pushNotification.onDeviceReady();

            pushNotification.registerDevice(
            {
               alert : true,
               badge : true,
               sound : true,
               pw_appid : Genesis.constants.pushNotifAppId,
               appname : Genesis.constants.pushNotifAppName
            }, function(status)
            {
               var deviceToken = status['deviceToken'], viewport;
               console.debug('registerDevice: ' + deviceToken);
               Genesis.constants.device =
               {
                  'device_type' : Genesis.constants.pushNotifType, //1 for iOS, 3 for Android
                  'device_id' : deviceToken
               };

               $(document).trigger('kickbak:updateDeviceToken');
            }, function(status)
            {
               console.debug('failed to register : ' + JSON.stringify(status));
               Genesis.constants.device = null;
               //navigator.notification.alert(JSON.stringify(['failed to register ', status]));
            });

            //pushNotification.setApplicationIconBadgeNumber(0);
         };
      }
      else if ($.os.android)
      {
         initPushwoosh = function()
         {
            if (debugMode)
            {
               me.pushNotifAppName = 'KickBak Dev Latest';
               me.pushNotifAppId = '93D8A-5BE72';
               me.pushNotifProjectId = '658015469194';
            }
            else
            {
               me.pushNotifAppName = 'KickBak Production';
               me.pushNotifAppId = '4fef6fb0691c12.54726991';
               me.pushNotifProjectId = '733275653511';
            }
            me.pushNotifType = 3;

            var pushNotification = window.plugins.pushNotification;
            document.addEventListener('push-notification', function(event)
            {
               if (event.notification)
               {
                  var notification = event.notification, title = notification.title, userData = notification.userdata, viewport = _application.getController('client' + '.Viewport');

                  console.debug('push notifcation - [' + JSON.stringify(notification) + ']');
                  //if ( typeof (userData) != "undefined")
                  if (Genesis.db.getLocalDB()['auth_code'])
                  {
                     setNotificationVisibility(true, 'KICKBAK Notification', title, 'Dismiss', function()
                     {
                        setChildBrowserVisibility(true, '', userData);
                     });
                  }
               }
               else
               {
                  console.warn('push notifcation - Null Notification');
               }
            });
            pushNotification.onDeviceReady();

            //var callback = function(rc)
            {
               // rc could be registrationId or errorCode

               // CHANGE projectid & appid
               pushNotification.registerDevice(
               {
                  projectid : Genesis.constants.pushNotifProjectId,
                  appid : Genesis.constants.pushNotifAppId
               }, function(status)
               {
                  var deviceToken = status, viewport;
                  console.debug('registerDevice: ' + deviceToken);
                  Genesis.constants.device =
                  {
                     'device_type' : Genesis.constants.pushNotifType, //1 for iOS, 3 for Android
                     'device_id' : deviceToken
                  };

                  $(document).trigger('kickbak:updateDeviceToken');
               }, function(status)
               {
                  console.debug('failed to register : ' + JSON.stringify(status));
                  Genesis.constants.device = null;
                  $(document).trigger('kickbak:updateDeviceToken');
               });
            };

            //pushNotification.unregisterDevice(callback, callback);
         };
      }
      else
      {
      }
   }
})();
//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function($)
{
   var touch =
   {
   }, touchTimeout, tapTimeout, swipeTimeout, longTapDelay = 750, longTapTimeout

   function parentIfText(node)
   {
      return 'tagName' in node ? node : node.parentNode
   }

   function swipeDirection(x1, x2, y1, y2)
   {
      var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
      return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
   }

   function longTap()
   {
      longTapTimeout = null
      if (touch.last)
      {
         touch.el.trigger('longTap')
         touch =
         {
         }
      }
   }

   function cancelLongTap()
   {
      if (longTapTimeout)
         clearTimeout(longTapTimeout)
      longTapTimeout = null
   }

   function cancelAll()
   {
      if (touchTimeout)
         clearTimeout(touchTimeout)
      if (tapTimeout)
         clearTimeout(tapTimeout)
      if (swipeTimeout)
         clearTimeout(swipeTimeout)
      if (longTapTimeout)
         clearTimeout(longTapTimeout)
      touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
      touch =
      {
      }
   };

   $(document).ready(function()
   {
      var now, delta

      $(document.body).bind('touchstart', function(e)
      {
         now = Date.now()
         delta = now - (touch.last || now)
         touch.el = $(parentIfText(e.touches[0].target))
         touchTimeout && clearTimeout(touchTimeout)
         touch.x1 = e.touches[0].pageX
         touch.y1 = e.touches[0].pageY
         if (delta > 0 && delta <= 250)
            touch.isDoubleTap = true
         touch.last = now
         longTapTimeout = setTimeout(longTap, longTapDelay)
      }).bind('touchmove', function(e)
      {
         cancelLongTap()
         touch.x2 = e.touches[0].pageX
         touch.y2 = e.touches[0].pageY
         if (Math.abs(touch.x1 - touch.x2) > 10)
            e.preventDefault()
      }).bind('touchend', function(e)
      {
         cancelLongTap()

         // swipe
         if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

            swipeTimeout = setTimeout(function()
            {
               touch.el.trigger('swipe')
               touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
               touch =
               {
               }
            }, 0)

         // normal tap
         else if ('last' in touch)

            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function()
            {

               // trigger universal 'tap' with the option to cancelTouch()
               // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
               var event = $.Event('tap')
               event.cancelTouch = cancelAll
               touch.el.trigger(event)

               // trigger double tap immediately
               if (touch.isDoubleTap)
               {
                  touch.el.trigger('doubleTap')
                  touch =
                  {
                  }
               }

               // trigger single tap after 250ms of inactivity
               else
               {
                  touchTimeout = setTimeout(function()
                  {
                     touchTimeout = null
                     touch.el.trigger('singleTap')
                     touch =
                     {
                     }
                  }, 250)
               }

            }, 0)

      }).bind('touchcancel', cancelAll)

      $(window).bind('scroll', cancelAll)
   });
   ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m)
   {
      $.fn[m] = function(callback)
      {
         return this.bind(m, callback)
      }
   })
})(Zepto);
//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()

;(function($)
{
   var data =
   {
   }, dataAttr = $.fn.data, camelize = $.camelCase, exp = $.expando = 'Zepto' + (+new Date())

   // Get value from node:
   // 1. first try key as given,
   // 2. then try camelized key,
   // 3. fall back to reading "data-*" attribute.
   function getData(node, name)
   {
      var id = node[exp], store = id && data[id]
      if (name === undefined)
         return store || setData(node)
      else
      {
         if (store)
         {
            if ( name in store)
               return store[name]
            var camelName = camelize(name)
            if ( camelName in store)
               return store[camelName]
         }
         return dataAttr.call($(node), name)
      }
   }

   // Store value under camelized key on node
   function setData(node, name, value)
   {
      var id = node[exp] || (node[exp] = ++$.uuid), store = data[id] || (data[id] = attributeData(node))
      if (name !== undefined)
         store[camelize(name)] = value
      return store
   }

   // Read all "data-*" attributes from a node
   function attributeData(node)
   {
      var store =
      {
      }
      $.each(node.attributes, function(i, attr)
      {
         if (attr.name.indexOf('data-') == 0)
            store[camelize(attr.name.replace('data-', ''))] = $.zepto.deserializeValue(attr.value)
      })
      return store
   }


   $.fn.data = function(name, value)
   {
      return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ? this.each(function(i, node)
      {
         $.each(name, function(key, value)
         {
            setData(node, key, value)
         })
      }) :
      // get value from first element
      this.length == 0 ? undefined : getData(this[0], name) :
      // set value on all elements
      this.each(function()
      {
         setData(this, name, value)
      })
   }

   $.fn.removeData = function(names)
   {
      if ( typeof names == 'string')
         names = names.split(/\s+/)
      return this.each(function()
      {
         var id = this[exp], store = id && data[id]
         if (store)
            $.each(names, function()
            {
               delete store[camelize(this)]
            })
      })
   }
})(Zepto)/**
 * infinitescroll - Lightweight Infinite Scrolling
 * Copyright (c) 2012 DIY Co
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@diy.org>
 */

;(function($)
{

   $.fn.infiniteScroll = function()
   {
      var $container = $(this);
      var $window = $(window);
      var $body = $('body');
      var action = 'init';
      var waiting = false;
      var moreExists = true;

      // defaults
      // -----------------------------------------------------------------------------
      var options =
      {
         threshold : 80,
         onBottom : function()
         {
         },
         onEnd : null,
         iScroll : null
      };

      // parse arguments
      // -----------------------------------------------------------------------------
      if (arguments.length)
      {
         if ( typeof arguments[0] === 'string')
         {
            action = arguments[0];
            if (arguments.length > 1 && typeof arguments[1] === 'object')
            {
               options = $.extend(options, arguments[1]);
            }
         }
         else if ( typeof arguments[0] === 'object')
         {
            options = $.extend(options, arguments[0]);
         }
      }

      // initialize
      // -----------------------------------------------------------------------------
      if (action === 'init')
      {
         var onScroll = function()
         {
            if (waiting || !moreExists)
               return;

            var dy = options.iScroll ? -options.iScroll.maxScrollY + options.iScroll.y : $body.outerHeight() - $window.height() - $window.scrollTop();

            if (dy < options.threshold)
            {
               waiting = true;
               options.onBottom(function(more)
               {
                  if (more === false)
                  {
                     moreExists = false;
                     if ( typeof options.onEnd === 'function')
                     {
                        options.onEnd();
                     }
                  }
                  waiting = false;
               });
            }
         }
         if (options.iScroll)
         {
            // ios scrolling
            var onScrollMove = options.iScroll.options.onScrollMove || null;
            options.iScroll.options.onScrollMove = function()
            {
               if (onScrollMove)
                  onScrollMove();
               onScroll();
            }
            options.iScroll_scrollMove = onScrollMove;
         }
         else
         {
            // traditional scrolling
            $window.on('scroll.infinite resize.infinite', onScroll);
         }

         $container.data('infinite-scroll', options);
         $(onScroll);
      }

      // reinitialize (for when content changes)
      // -----------------------------------------------------------------------------
      if (action === 'reset')
      {
         var options = $container.data('infinite-scroll');
         if (options.iScroll)
         {
            if (options.iScroll_scrollMove)
            {
               options.iScroll.options.onScrollMove = options.iScroll_scrollMove;
            }
            options.iScroll.scrollTo(0, 0, 0, false);
         }
         $window.off('scroll.infinite resize.infinite');
         $container.infiniteScroll(options);
      }

      return this;
   };

})(jQuery);
/*! iScroll v5.0.4 ~ (c) 2008-2013 Matteo Spinelli ~ http://cubiq.org/license */
var IScroll=function(t,i,s){function e(t,s){this.wrapper="string"==typeof t?i.querySelector(t):t,this.scroller=this.wrapper.children[0],this.scrollerStyle=this.scroller.style,this.options={resizeIndicator:!0,mouseWheelSpeed:20,snapThreshold:.334,startX:0,startY:0,scrollY:!0,directionLockThreshold:5,momentum:!0,bounce:!0,bounceTime:600,bounceEasing:"",preventDefault:!0,HWCompositing:!0,useTransition:!0,useTransform:!0};for(var e in s)this.options[e]=s[e];this.translateZ=this.options.HWCompositing&&h.hasPerspective?" translateZ(0)":"",this.options.useTransition=h.hasTransition&&this.options.useTransition,this.options.useTransform=h.hasTransform&&this.options.useTransform,this.options.eventPassthrough=this.options.eventPassthrough===!0?"vertical":this.options.eventPassthrough,this.options.preventDefault=!this.options.eventPassthrough&&this.options.preventDefault,this.options.scrollY="vertical"==this.options.eventPassthrough?!1:this.options.scrollY,this.options.scrollX="horizontal"==this.options.eventPassthrough?!1:this.options.scrollX,this.options.freeScroll=this.options.freeScroll&&!this.options.eventPassthrough,this.options.directionLockThreshold=this.options.eventPassthrough?0:this.options.directionLockThreshold,this.options.bounceEasing="string"==typeof this.options.bounceEasing?h.ease[this.options.bounceEasing]||h.ease.circular:this.options.bounceEasing,this.options.resizePolling=void 0===this.options.resizePolling?60:this.options.resizePolling,this.options.tap===!0&&(this.options.tap="tap"),this.options.invertWheelDirection=this.options.invertWheelDirection?-1:1,this.x=0,this.y=0,this.directionX=0,this.directionY=0,this._events={},this._init(),this.refresh(),this.scrollTo(this.options.startX,this.options.startY),this.enable()}function o(t,s,e){var o=i.createElement("div"),n=i.createElement("div");return e===!0&&(o.style.cssText="position:absolute;z-index:9999",n.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px"),n.className="iScrollIndicator","h"==t?(e===!0&&(o.style.cssText+=";height:7px;left:2px;right:2px;bottom:0",n.style.height="100%"),o.className="iScrollHorizontalScrollbar"):(e===!0&&(o.style.cssText+=";width:7px;bottom:2px;top:2px;right:1px",n.style.width="100%"),o.className="iScrollVerticalScrollbar"),s||(o.style.pointerEvents="none"),o.appendChild(n),o}function n(s,e){this.wrapper="string"==typeof e.el?i.querySelector(e.el):e.el,this.indicator=this.wrapper.children[0],this.indicatorStyle=this.indicator.style,this.scroller=s,this.options={listenX:!0,listenY:!0,interactive:!1,resize:!0,defaultScrollbars:!1,speedRatioX:0,speedRatioY:0};for(var o in e)this.options[o]=e[o];this.sizeRatioX=1,this.sizeRatioY=1,this.maxPosX=0,this.maxPosY=0,this.options.interactive&&(h.addEvent(this.indicator,"touchstart",this),h.addEvent(this.indicator,"MSPointerDown",this),h.addEvent(this.indicator,"mousedown",this),h.addEvent(t,"touchend",this),h.addEvent(t,"MSPointerUp",this),h.addEvent(t,"mouseup",this))}var r=t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||t.msRequestAnimationFrame||function(i){t.setTimeout(i,1e3/60)},h=function(){function e(t){return r===!1?!1:""===r?t:r+t.charAt(0).toUpperCase()+t.substr(1)}var o={},n=i.createElement("div").style,r=function(){for(var t,i=["t","webkitT","MozT","msT","OT"],s=0,e=i.length;e>s;s++)if(t=i[s]+"ransform",t in n)return i[s].substr(0,i[s].length-1);return!1}();o.getTime=Date.now||function(){return(new Date).getTime()},o.extend=function(t,i){for(var s in i)t[s]=i[s]},o.addEvent=function(t,i,s,e){t.addEventListener(i,s,!!e)},o.removeEvent=function(t,i,s,e){t.removeEventListener(i,s,!!e)},o.momentum=function(t,i,e,o,n){var r,h,a=t-i,l=s.abs(a)/e,c=6e-4;return r=t+l*l/(2*c)*(0>a?-1:1),h=l/c,o>r?(r=n?o-n/2.5*(l/8):o,a=s.abs(r-t),h=a/l):r>0&&(r=n?n/2.5*(l/8):0,a=s.abs(t)+r,h=a/l),{destination:s.round(r),duration:h}};var h=e("transform");return o.extend(o,{hasTransform:h!==!1,hasPerspective:e("perspective")in n,hasTouch:"ontouchstart"in t,hasPointer:navigator.msPointerEnabled,hasTransition:e("transition")in n}),o.isAndroidBrowser=/Android/.test(t.navigator.appVersion)&&/Version\/\d/.test(t.navigator.appVersion),o.extend(o.style={},{transform:h,transitionTimingFunction:e("transitionTimingFunction"),transitionDuration:e("transitionDuration"),transformOrigin:e("transformOrigin")}),o.hasClass=function(t,i){var s=new RegExp("(^|\\s)"+i+"(\\s|$)");return s.test(t.className)},o.addClass=function(t,i){if(!o.hasClass(t,i)){var s=t.className.split(" ");s.push(i),t.className=s.join(" ")}},o.removeClass=function(t,i){if(o.hasClass(t,i)){var s=new RegExp("(^|\\s)"+i+"(\\s|$)","g");t.className=t.className.replace(s,"")}},o.offset=function(t){for(var i=-t.offsetLeft,s=-t.offsetTop;t=t.offsetParent;)i-=t.offsetLeft,s-=t.offsetTop;return{left:i,top:s}},o.extend(o.eventType={},{touchstart:1,touchmove:1,touchend:1,mousedown:2,mousemove:2,mouseup:2,MSPointerDown:3,MSPointerMove:3,MSPointerUp:3}),o.extend(o.ease={},{quadratic:{style:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(t){return t*(2-t)}},circular:{style:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(t){return s.sqrt(1- --t*t)}},back:{style:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",fn:function(t){var i=4;return(t-=1)*t*((i+1)*t+i)+1}},bounce:{style:"",fn:function(t){return(t/=1)<1/2.75?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}},elastic:{style:"",fn:function(t){var i=.22,e=.4;return 0===t?0:1==t?1:e*s.pow(2,-10*t)*s.sin((t-i/4)*2*s.PI/i)+1}}}),o.tap=function(t,s){var e=i.createEvent("Event");e.initEvent(s,!0,!0),e.pageX=t.pageX,e.pageY=t.pageY,t.target.dispatchEvent(e)},o.click=function(t){var s,e=t.target;"SELECT"!=e.tagName&&"INPUT"!=e.tagName&&"TEXTAREA"!=e.tagName&&(s=i.createEvent("MouseEvents"),s.initMouseEvent("click",!0,!0,t.view,1,e.screenX,e.screenY,e.clientX,e.clientY,t.ctrlKey,t.altKey,t.shiftKey,t.metaKey,0,null),s._constructed=!0,e.dispatchEvent(s))},o}();return e.prototype={version:"5.0.4",_init:function(){this._initEvents(),(this.options.scrollbars||this.options.indicators)&&this._initIndicators(),this.options.mouseWheel&&this._initWheel(),this.options.snap&&this._initSnap(),this.options.keyBindings&&this._initKeys()},destroy:function(){this._initEvents(!0),this._execEvent("destroy")},_transitionEnd:function(t){t.target==this.scroller&&(this._transitionTime(0),this.resetPosition(this.options.bounceTime)||this._execEvent("scrollEnd"))},_start:function(t){if(!(1!=h.eventType[t.type]&&0!==t.button||!this.enabled||this.initiated&&h.eventType[t.type]!==this.initiated)){this.options.preventDefault&&!h.isAndroidBrowser&&t.preventDefault();var i,e=t.touches?t.touches[0]:t;this.initiated=h.eventType[t.type],this.moved=!1,this.distX=0,this.distY=0,this.directionX=0,this.directionY=0,this.directionLocked=0,this._transitionTime(),this.isAnimating=!1,this.startTime=h.getTime(),this.options.useTransition&&this.isInTransition&&(i=this.getComputedPosition(),this._translate(s.round(i.x),s.round(i.y)),this.isInTransition=!1),this.startX=this.x,this.startY=this.y,this.absStartX=this.x,this.absStartY=this.y,this.pointX=e.pageX,this.pointY=e.pageY,this._execEvent("scrollStart")}},_move:function(t){if(this.enabled&&h.eventType[t.type]===this.initiated){this.options.preventDefault&&t.preventDefault();var i,e,o,n,r=t.touches?t.touches[0]:t,a=this.hasHorizontalScroll?r.pageX-this.pointX:0,l=this.hasVerticalScroll?r.pageY-this.pointY:0,c=h.getTime();if(this.pointX=r.pageX,this.pointY=r.pageY,this.distX+=a,this.distY+=l,o=s.abs(this.distX),n=s.abs(this.distY),!(c-this.endTime>300&&10>o&&10>n)){if(this.directionLocked||this.options.freeScroll||(this.directionLocked=o>n+this.options.directionLockThreshold?"h":n>=o+this.options.directionLockThreshold?"v":"n"),"h"==this.directionLocked){if("vertical"==this.options.eventPassthrough)t.preventDefault();else if("horizontal"==this.options.eventPassthrough)return this.initiated=!1,void 0;l=0}else if("v"==this.directionLocked){if("horizontal"==this.options.eventPassthrough)t.preventDefault();else if("vertical"==this.options.eventPassthrough)return this.initiated=!1,void 0;a=0}i=this.x+a,e=this.y+l,(i>0||i<this.maxScrollX)&&(i=this.options.bounce?this.x+a/3:i>0?0:this.maxScrollX),(e>0||e<this.maxScrollY)&&(e=this.options.bounce?this.y+l/3:e>0?0:this.maxScrollY),this.directionX=a>0?-1:0>a?1:0,this.directionY=l>0?-1:0>l?1:0,this.moved=!0,this._translate(i,e),c-this.startTime>300&&(this.startTime=c,this.startX=this.x,this.startY=this.y)}}},_end:function(t){if(this.enabled&&h.eventType[t.type]===this.initiated){this.options.preventDefault&&t.preventDefault();var i,e,o=(t.changedTouches?t.changedTouches[0]:t,h.getTime()-this.startTime),n=s.round(this.x),r=s.round(this.y),a=s.abs(n-this.startX),l=s.abs(r-this.startY),c=0,p="";if(this.scrollTo(n,r),this.isInTransition=0,this.initiated=0,this.endTime=h.getTime(),!this.resetPosition(this.options.bounceTime)){if(!this.moved)return this.options.tap&&h.tap(t,this.options.tap),this.options.click&&h.click(t),void 0;if(this._events.flick&&200>o&&100>a&&100>l)return this._execEvent("flick"),void 0;if(this.options.momentum&&300>o&&(i=this.hasHorizontalScroll?h.momentum(this.x,this.startX,o,this.maxScrollX,this.options.bounce?this.wrapperWidth:0):{destination:n,duration:0},e=this.hasVerticalScroll?h.momentum(this.y,this.startY,o,this.maxScrollY,this.options.bounce?this.wrapperHeight:0):{destination:r,duration:0},n=i.destination,r=e.destination,c=s.max(i.duration,e.duration),this.isInTransition=1),this.options.snap){var u=this._nearestSnap(n,r);this.currentPage=u,n=u.x,r=u.y,c=this.options.snapSpeed||s.max(s.max(s.min(a,1e3),s.min(a,1e3)),300),this.directionX=0,this.directionY=0,p=this.options.bounceEasing}return n!=this.x||r!=this.y?((n>0||n<this.maxScrollX||r>0||r<this.maxScrollY)&&(p=h.ease.quadratic),this.scrollTo(n,r,c,p),void 0):(this._execEvent("scrollEnd"),void 0)}}},_resize:function(){var t=this;clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(function(){t.refresh()},this.options.resizePolling)},resetPosition:function(t){var i=this.x,s=this.y;return t=t||0,!this.hasHorizontalScroll||this.x>0?i=0:this.x<this.maxScrollX&&(i=this.maxScrollX),!this.hasVerticalScroll||this.y>0?s=0:this.y<this.maxScrollY&&(s=this.maxScrollY),i==this.x&&s==this.y?!1:(this.scrollTo(i,s,t,this.options.bounceEasing),!0)},disable:function(){this.enabled=!1},enable:function(){this.enabled=!0},refresh:function(){if(this.wrapper.offsetHeight,this.wrapperWidth=this.wrapper.clientWidth,this.wrapperHeight=this.wrapper.clientHeight,this.scrollerWidth=this.scroller.offsetWidth,this.scrollerHeight=this.scroller.offsetHeight,this.maxScrollX=this.wrapperWidth-this.scrollerWidth,this.maxScrollY=this.wrapperHeight-this.scrollerHeight,this.hasHorizontalScroll=this.options.scrollX&&this.maxScrollX<0,this.hasVerticalScroll=this.options.scrollY&&this.maxScrollY<0,this.hasHorizontalScroll||(this.maxScrollX=0,this.scrollerWidth=this.wrapperWidth),this.hasVerticalScroll||(this.maxScrollY=0,this.scrollerHeight=this.wrapperHeight),this.endTime=0,this.directionX=0,this.directionY=0,this.wrapperOffset=h.offset(this.wrapper),this._execEvent("refresh"),this.resetPosition(),this.options.snap){var t=this._nearestSnap(this.x,this.y);if(this.x==t.x&&this.y==t.y)return;this.currentPage=t,this.scrollTo(t.x,t.y)}},on:function(t,i){this._events[t]||(this._events[t]=[]),this._events[t].push(i)},_execEvent:function(t){if(this._events[t]){var i=0,s=this._events[t].length;if(s)for(;s>i;i++)this._events[t][i].call(this)}},scrollBy:function(t,i,s,e){t=this.x+t,i=this.y+i,s=s||0,this.scrollTo(t,i,s,e)},scrollTo:function(t,i,s,e){e=e||h.ease.circular,!s||this.options.useTransition&&e.style?(this._transitionTimingFunction(e.style),this._transitionTime(s),this._translate(t,i)):this._animate(t,i,s,e.fn)},scrollToElement:function(t,i,e,o,n){if(t=t.nodeType?t:this.scroller.querySelector(t)){var r=h.offset(t);r.left-=this.wrapperOffset.left,r.top-=this.wrapperOffset.top,e===!0&&(e=s.round(t.offsetWidth/2-this.wrapper.offsetWidth/2)),o===!0&&(o=s.round(t.offsetHeight/2-this.wrapper.offsetHeight/2)),r.left-=e||0,r.top-=o||0,r.left=r.left>0?0:r.left<this.maxScrollX?this.maxScrollX:r.left,r.top=r.top>0?0:r.top<this.maxScrollY?this.maxScrollY:r.top,i=void 0===i||null===i||"auto"===i?s.max(2*s.abs(r.left),2*s.abs(r.top)):i,this.scrollTo(r.left,r.top,i,n)}},_transitionTime:function(t){t=t||0,this.scrollerStyle[h.style.transitionDuration]=t+"ms",this.indicator1&&this.indicator1.transitionTime(t),this.indicator2&&this.indicator2.transitionTime(t)},_transitionTimingFunction:function(t){this.scrollerStyle[h.style.transitionTimingFunction]=t,this.indicator1&&this.indicator1.transitionTimingFunction(t),this.indicator2&&this.indicator2.transitionTimingFunction(t)},_translate:function(t,i){this.options.useTransform?this.scrollerStyle[h.style.transform]="translate("+t+"px,"+i+"px)"+this.translateZ:(t=s.round(t),i=s.round(i),this.scrollerStyle.left=t+"px",this.scrollerStyle.top=i+"px"),this.x=t,this.y=i,this.indicator1&&this.indicator1.updatePosition(),this.indicator2&&this.indicator2.updatePosition()},_initEvents:function(i){var s=i?h.removeEvent:h.addEvent,e=this.options.bindToWrapper?this.wrapper:t;s(t,"orientationchange",this),s(t,"resize",this),s(this.wrapper,"mousedown",this),s(e,"mousemove",this),s(e,"mousecancel",this),s(e,"mouseup",this),h.hasPointer&&(s(this.wrapper,"MSPointerDown",this),s(e,"MSPointerMove",this),s(e,"MSPointerCancel",this),s(e,"MSPointerUp",this)),h.hasTouch&&(s(this.wrapper,"touchstart",this),s(e,"touchmove",this),s(e,"touchcancel",this),s(e,"touchend",this)),s(this.scroller,"transitionend",this),s(this.scroller,"webkitTransitionEnd",this),s(this.scroller,"oTransitionEnd",this),s(this.scroller,"MSTransitionEnd",this)},getComputedPosition:function(){var i,s,e=t.getComputedStyle(this.scroller,null);return this.options.useTransform?(e=e[h.style.transform].split(")")[0].split(", "),i=+(e[12]||e[4]),s=+(e[13]||e[5])):(i=+e.left.replace(/[^-\d]/g,""),s=+e.top.replace(/[^-\d]/g,"")),{x:i,y:s}},_initIndicators:function(){var t,i,s=this.options.interactiveScrollbars,e=("object"!=typeof this.options.scrollbars,"string"!=typeof this.options.scrollbars);this.options.scrollbars?(this.options.scrollY&&(t={el:o("v",s,this.options.scrollbars),interactive:s,defaultScrollbars:!0,customStyle:e,resize:this.options.resizeIndicator,listenX:!1},this.wrapper.appendChild(t.el)),this.options.scrollX&&(i={el:o("h",s,this.options.scrollbars),interactive:s,defaultScrollbars:!0,customStyle:e,resize:this.options.resizeIndicator,listenY:!1},this.wrapper.appendChild(i.el))):(t=this.options.indicators.length?this.options.indicators[0]:this.options.indicators,i=this.options.indicators[1]&&this.options.indicators[1]),t&&(this.indicator1=new n(this,t)),i&&(this.indicator2=new n(this,i)),this.on("refresh",function(){this.indicator1&&this.indicator1.refresh(),this.indicator2&&this.indicator2.refresh()}),this.on("destroy",function(){this.indicator1&&(this.indicator1.destroy(),this.indicator1=null),this.indicator2&&(this.indicator2.destroy(),this.indicator2=null)})},_initWheel:function(){h.addEvent(this.wrapper,"mousewheel",this),h.addEvent(this.wrapper,"DOMMouseScroll",this),this.on("destroy",function(){h.removeEvent(this.wrapper,"mousewheel",this),h.removeEvent(this.wrapper,"DOMMouseScroll",this)})},_wheel:function(t){if(this.enabled){var i,s,e,o,n=this;if(clearTimeout(this.wheelTimeout),this.wheelTimeout=setTimeout(function(){n._execEvent("scrollEnd")},400),t.preventDefault(),"wheelDeltaX"in t)i=t.wheelDeltaX/120,s=t.wheelDeltaY/120;else if("wheelDelta"in t)i=s=t.wheelDelta/120;else{if(!("detail"in t))return;i=s=-t.detail/3}i*=this.options.mouseWheelSpeed,s*=this.options.mouseWheelSpeed,this.hasVerticalScroll||(i=s),e=this.x+(this.hasHorizontalScroll?i*this.options.invertWheelDirection:0),o=this.y+(this.hasVerticalScroll?s*this.options.invertWheelDirection:0),e>0?e=0:e<this.maxScrollX&&(e=this.maxScrollX),o>0?o=0:o<this.maxScrollY&&(o=this.maxScrollY),this.scrollTo(e,o,0)}},_initSnap:function(){this.currentPage={},"string"==typeof this.options.snap&&(this.options.snap=this.scroller.querySelectorAll(this.options.snap)),this.on("refresh",function(){var t,i,e,o,n,r,h=0,a=0,l=0,c=this.options.snapStepX||this.wrapperWidth,p=this.options.snapStepY||this.wrapperHeight;if(this.pages=[],this.options.snap===!0)for(e=s.round(c/2),o=s.round(p/2);l>-this.scrollerWidth;){for(this.pages[h]=[],t=0,n=0;n>-this.scrollerHeight;)this.pages[h][t]={x:s.max(l,this.maxScrollX),y:s.max(n,this.maxScrollY),width:c,height:p,cx:l-e,cy:n-o},n-=p,t++;l-=c,h++}else for(r=this.options.snap,t=r.length,i=-1;t>h;h++)(0===h||r[h].offsetLeft<=r[h-1].offsetLeft)&&(a=0,i++),this.pages[a]||(this.pages[a]=[]),l=s.max(-r[h].offsetLeft,this.maxScrollX),n=s.max(-r[h].offsetTop,this.maxScrollY),e=l-s.round(r[h].offsetWidth/2),o=n-s.round(r[h].offsetHeight/2),this.pages[a][i]={x:l,y:n,width:r[h].offsetWidth,height:r[h].offsetHeight,cx:e,cy:o},l>this.maxScrollX&&a++;this.goToPage(this.currentPage.pageX||0,this.currentPage.pageY||0,0),0===this.options.snapThreshold%1?(this.snapThresholdX=this.options.snapThreshold,this.snapThresholdY=this.options.snapThreshold):(this.snapThresholdX=s.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width*this.options.snapThreshold),this.snapThresholdY=s.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height*this.options.snapThreshold))}),this.on("flick",function(){var t=this.options.snapSpeed||s.max(s.max(s.min(s.abs(this.x-this.startX),1e3),s.min(s.abs(this.y-this.startY),1e3)),300);this.goToPage(this.currentPage.pageX+this.directionX,this.currentPage.pageY+this.directionY,t)})},_nearestSnap:function(t,i){var e=0,o=this.pages.length,n=0;if(s.abs(t-this.absStartX)<this.snapThresholdX&&s.abs(i-this.absStartY)<this.snapThresholdY)return this.currentPage;for(t>0?t=0:t<this.maxScrollX&&(t=this.maxScrollX),i>0?i=0:i<this.maxScrollY&&(i=this.maxScrollY);o>e;e++)if(t>=this.pages[e][0].cx){t=this.pages[e][0].x;break}for(o=this.pages[e].length;o>n;n++)if(i>=this.pages[0][n].cy){i=this.pages[0][n].y;break}return e==this.currentPage.pageX&&(e+=this.directionX,0>e?e=0:e>=this.pages.length&&(e=this.pages.length-1),t=this.pages[e][0].x),n==this.currentPage.pageY&&(n+=this.directionY,0>n?n=0:n>=this.pages[0].length&&(n=this.pages[0].length-1),i=this.pages[0][n].y),{x:t,y:i,pageX:e,pageY:n}},goToPage:function(t,i,e,o){o=o||this.options.bounceEasing,t>=this.pages.length?t=this.pages.length-1:0>t&&(t=0),i>=this.pages[0].length?i=this.pages[0].length-1:0>i&&(i=0);var n=this.pages[t][i].x,r=this.pages[t][i].y;e=void 0===e?this.options.snapSpeed||s.max(s.max(s.min(s.abs(n-this.x),1e3),s.min(s.abs(r-this.y),1e3)),300):e,this.currentPage={x:n,y:r,pageX:t,pageY:i},this.scrollTo(n,r,e,o)},next:function(t,i){var s=this.currentPage.pageX,e=this.currentPage.pageY;s++,s>=this.pages.length&&this.hasVerticalScroll&&(s=0,e++),this.goToPage(s,e,t,i)},prev:function(t,i){var s=this.currentPage.pageX,e=this.currentPage.pageY;s--,0>s&&this.hasVerticalScroll&&(s=0,e--),this.goToPage(s,e,t,i)},_initKeys:function(){var i,s={pageUp:33,pageDown:34,end:35,home:36,left:37,up:38,right:39,down:40};if("object"==typeof this.options.keyBindings)for(i in this.options.keyBindings)"string"==typeof this.options.keyBindings[i]&&(this.options.keyBindings[i]=this.options.keyBindings[i].toUpperCase().charCodeAt(0));else this.options.keyBindings={};for(i in s)this.options.keyBindings[i]=this.options.keyBindings[i]||s[i];h.addEvent(t,"keydown",this),this.on("destroy",function(){h.removeEvent(t,"keydown",this)})},_key:function(t){if(this.enabled){var i,e=this.options.snap,o=e?this.currentPage.pageX:this.x,n=e?this.currentPage.pageY:this.y,r=h.getTime(),a=this.keyTime||0,l=.25;switch(this.options.useTransition&&this.isInTransition&&(i=this.getComputedPosition(),this._translate(s.round(i.x),s.round(i.y)),this.isInTransition=!1),this.keyAcceleration=200>r-a?s.min(this.keyAcceleration+l,50):0,t.keyCode){case this.options.keyBindings.pageUp:this.hasHorizontalScroll&&!this.hasVerticalScroll?o+=e?1:this.wrapperWidth:n+=e?1:this.wrapperHeight;break;case this.options.keyBindings.pageDown:this.hasHorizontalScroll&&!this.hasVerticalScroll?o-=e?1:this.wrapperWidth:n-=e?1:this.wrapperHeight;break;case this.options.keyBindings.end:o=e?this.pages.length-1:this.maxScrollX,n=e?this.pages[0].length-1:this.maxScrollY;break;case this.options.keyBindings.home:o=0,n=0;break;case this.options.keyBindings.left:o+=e?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.up:n+=e?1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.right:o-=e?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.down:n-=e?1:5+this.keyAcceleration>>0}if(e)return this.goToPage(o,n),void 0;o>0?(o=0,this.keyAcceleration=0):o<this.maxScrollX&&(o=this.maxScrollX,this.keyAcceleration=0),n>0?(n=0,this.keyAcceleration=0):n<this.maxScrollY&&(n=this.maxScrollY,this.keyAcceleration=0),this.scrollTo(o,n,0),this.keyTime=r}},_animate:function(t,i,s,e){function o(){var u,d,m,f=h.getTime();return f>=p?(n.isAnimating=!1,n._translate(t,i),n.resetPosition(n.options.bounceTime)||n._execEvent("scrollEnd"),void 0):(f=(f-c)/s,m=e(f),u=(t-a)*m+a,d=(i-l)*m+l,n._translate(u,d),n.isAnimating&&r(o),void 0)}var n=this,a=this.x,l=this.y,c=h.getTime(),p=c+s;this.isAnimating=!0,o()},handleEvent:function(t){switch(t.type){case"touchstart":case"MSPointerDown":case"mousedown":this._start(t);break;case"touchmove":case"MSPointerMove":case"mousemove":this._move(t);break;case"touchend":case"MSPointerUp":case"mouseup":case"touchcancel":case"MSPointerCancel":case"mousecancel":this._end(t);break;case"orientationchange":case"resize":this._resize();break;case"transitionend":case"webkitTransitionEnd":case"oTransitionEnd":case"MSTransitionEnd":this._transitionEnd(t);break;case"DOMMouseScroll":case"mousewheel":this._wheel(t);break;case"keydown":this._key(t)}}},n.prototype={handleEvent:function(t){switch(t.type){case"touchstart":case"MSPointerDown":case"mousedown":this._start(t);break;case"touchmove":case"MSPointerMove":case"mousemove":this._move(t);break;case"touchend":case"MSPointerUp":case"mouseup":case"touchcancel":case"MSPointerCancel":case"mousecancel":this._end(t)}},destroy:function(){this.options.interactive&&(h.removeEvent(this.indicator,"touchstart",this),h.removeEvent(this.indicator,"MSPointerDown",this),h.removeEvent(this.indicator,"mousedown",this),h.removeEvent(t,"touchmove",this),h.removeEvent(t,"MSPointerMove",this),h.removeEvent(t,"mousemove",this),h.removeEvent(t,"touchend",this),h.removeEvent(t,"MSPointerUp",this),h.removeEvent(t,"mouseup",this)),this.options.defaultScrollbars&&this.wrapper.parentNode.removeChild(this.wrapper)},_start:function(i){var s=i.touches?i.touches[0]:i;i.preventDefault(),i.stopPropagation(),this.transitionTime(0),this.initiated=!0,this.moved=!1,this.lastPointX=s.pageX,this.lastPointY=s.pageY,this.startTime=h.getTime(),h.addEvent(t,"touchmove",this),h.addEvent(t,"MSPointerMove",this),h.addEvent(t,"mousemove",this),this.scroller._execEvent("scrollStart")},_move:function(t){var i,s,e,o,n=t.touches?t.touches[0]:t;h.getTime(),this.moved=!0,i=n.pageX-this.lastPointX,this.lastPointX=n.pageX,s=n.pageY-this.lastPointY,this.lastPointY=n.pageY,e=this.x+i,o=this.y+s,this._pos(e,o),t.preventDefault(),t.stopPropagation()},_end:function(i){this.initiated&&(this.initiated=!1,i.preventDefault(),i.stopPropagation(),h.removeEvent(t,"touchmove",this),h.removeEvent(t,"MSPointerMove",this),h.removeEvent(t,"mousemove",this),this.moved&&this.scroller._execEvent("scrollEnd"))},transitionTime:function(t){t=t||0,this.indicatorStyle[h.style.transitionDuration]=t+"ms"},transitionTimingFunction:function(t){this.indicatorStyle[h.style.transitionTimingFunction]=t},refresh:function(){this.transitionTime(0),this.indicatorStyle.display=this.options.listenX&&!this.options.listenY?this.scroller.hasHorizontalScroll?"block":"none":this.options.listenY&&!this.options.listenX?this.scroller.hasVerticalScroll?"block":"none":this.scroller.hasHorizontalScroll||this.scroller.hasVerticalScroll?"block":"none",this.scroller.hasHorizontalScroll&&this.scroller.hasVerticalScroll?(h.addClass(this.wrapper,"iScrollBothScrollbars"),h.removeClass(this.wrapper,"iScrollLoneScrollbar"),this.options.defaultScrollbars&&this.options.customStyle&&(this.options.listenX?this.wrapper.style.right="8px":this.wrapper.style.bottom="8px")):(h.removeClass(this.wrapper,"iScrollBothScrollbars"),h.addClass(this.wrapper,"iScrollLoneScrollbar"),this.options.defaultScrollbars&&this.options.customStyle&&(this.options.listenX?this.wrapper.style.right="2px":this.wrapper.style.bottom="2px")),this.wrapper.offsetHeight,this.options.listenX&&(this.wrapperWidth=this.wrapper.clientWidth,this.options.resize?(this.indicatorWidth=s.max(s.round(this.wrapperWidth*this.wrapperWidth/this.scroller.scrollerWidth),8),this.indicatorStyle.width=this.indicatorWidth+"px"):this.indicatorWidth=this.indicator.clientWidth,this.maxPosX=this.wrapperWidth-this.indicatorWidth,this.sizeRatioX=this.options.speedRatioX||this.scroller.maxScrollX&&this.maxPosX/this.scroller.maxScrollX),this.options.listenY&&(this.wrapperHeight=this.wrapper.clientHeight,this.options.resize?(this.indicatorHeight=s.max(s.round(this.wrapperHeight*this.wrapperHeight/this.scroller.scrollerHeight),8),this.indicatorStyle.height=this.indicatorHeight+"px"):this.indicatorHeight=this.indicator.clientHeight,this.maxPosY=this.wrapperHeight-this.indicatorHeight,this.sizeRatioY=this.options.speedRatioY||this.scroller.maxScrollY&&this.maxPosY/this.scroller.maxScrollY),this.updatePosition()},updatePosition:function(){var t=s.round(this.sizeRatioX*this.scroller.x)||0,i=s.round(this.sizeRatioY*this.scroller.y)||0;this.options.ignoreBoundaries||(0>t?t=0:t>this.maxPosX&&(t=this.maxPosX),0>i?i=0:i>this.maxPosY&&(i=this.maxPosY)),this.x=t,this.y=i,this.scroller.options.useTransform?this.indicatorStyle[h.style.transform]="translate("+t+"px,"+i+"px)"+this.scroller.translateZ:(this.indicatorStyle.left=t+"px",this.indicatorStyle.top=i+"px")},_pos:function(t,i){0>t?t=0:t>this.maxPosX&&(t=this.maxPosX),0>i?i=0:i>this.maxPosY&&(i=this.maxPosY),t=this.options.listenX?s.round(t/this.sizeRatioX):this.scroller.x,i=this.options.listenY?s.round(i/this.sizeRatioY):this.scroller.y,this.scroller.scrollTo(t,i)}},e.ease=h.ease,e}(window,document,Math);/*!
 * Bootstrap v3.0.0
 *
 * Copyright 2013 Twitter, Inc
 * Licensed under the Apache License v2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Designed and built with all the love in the world @twitter by @mdo and @fat.
 */

+function(a){function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(a.style[c]!==undefined)return{end:b[c]}}"use strict",a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one(a.support.transition.end,function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b()})}(window.jQuery)