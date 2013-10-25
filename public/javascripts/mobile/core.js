/**
 * @private
 *
 * This object handles communication between the WebView and Sencha's native shell.
 * Currently it has two primary responsibilities:
 *
 * 1. Maintaining unique string ids for callback functions, together with their scope objects
 * 2. Serializing given object data into HTTP GET request parameters
 *
 * As an example, to capture a photo from the device's camera, we use `Ext.device.Camera.capture()` like:
 *
 *     Ext.device.Camera.capture(
 *         function(dataUri){
 *             // Do something with the base64-encoded `dataUri` string
 *         },
 *         function(errorMessage) {
 *
 *         },
 *         callbackScope,
 *         {
 *             quality: 75,
 *             width: 500,
 *             height: 500
 *         }
 *     );
 *
 * Internally, `Ext.device.Communicator.send()` will then be invoked with the following argument:
 *
 *     Ext.device.Communicator.send({
 *         command: 'Camera#capture',
 *         callbacks: {
 *             onSuccess: function() {
 *                 // ...
 *             },
 *             onError: function() {
 *                 // ...
 *             }
 *         },
 *         scope: callbackScope,
 *         quality: 75,
 *         width: 500,
 *         height: 500
 *     });
 *
 * Which will then be transformed into a HTTP GET request, sent to native shell's local
 * HTTP server with the following parameters:
 *
 *     ?quality=75&width=500&height=500&command=Camera%23capture&onSuccess=3&onError=5
 *
 * Notice that `onSuccess` and `onError` have been converted into string ids (`3` and `5`
 * respectively) and maintained by `Ext.device.Communicator`.
 *
 * Whenever the requested operation finishes, `Ext.device.Communicator.invoke()` simply needs
 * to be executed from the native shell with the corresponding ids given before. For example:
 *
 *     Ext.device.Communicator.invoke('3', ['DATA_URI_OF_THE_CAPTURED_IMAGE_HERE']);
 *
 * will invoke the original `onSuccess` callback under the given scope. (`callbackScope`), with
 * the first argument of 'DATA_URI_OF_THE_CAPTURED_IMAGE_HERE'
 *
 * Note that `Ext.device.Communicator` maintains the uniqueness of each function callback and
 * its scope object. If subsequent calls to `Ext.device.Communicator.send()` have the same
 * callback references, the same old ids will simply be reused, which guarantee the best possible
 * performance for a large amount of repetitive calls.
 */
Ext.define('Ext.device.communicator.Default', {

    SERVER_URL: 'http://localhost:3000', // Change this to the correct server URL

    callbackDataMap: {},

    callbackIdMap: {},

    idSeed: 0,

    globalScopeId: '0',

    generateId: function() {
        return String(++this.idSeed);
    },

    getId: function(object) {
        var id = object.$callbackId;

        if (!id) {
            object.$callbackId = id = this.generateId();
        }

        return id;
    },

    getCallbackId: function(callback, scope) {
        var idMap = this.callbackIdMap,
            dataMap = this.callbackDataMap,
            id, scopeId, callbackId, data;

        if (!scope) {
            scopeId = this.globalScopeId;
        }
        else if (scope.isIdentifiable) {
            scopeId = scope.getId();
        }
        else {
            scopeId = this.getId(scope);
        }

        callbackId = this.getId(callback);

        if (!idMap[scopeId]) {
            idMap[scopeId] = {};
        }

        if (!idMap[scopeId][callbackId]) {
            id = this.generateId();
            data = {
                callback: callback,
                scope: scope
            };

            idMap[scopeId][callbackId] = id;
            dataMap[id] = data;
        }

        return idMap[scopeId][callbackId];
    },

    getCallbackData: function(id) {
        return this.callbackDataMap[id];
    },

    invoke: function(id, args) {
        var data = this.getCallbackData(id);

        data.callback.apply(data.scope, args);
    },

    send: function(args) {
        var callbacks, scope, name, callback;

        if (!args) {
            args = {};
        }
        else if (args.callbacks) {
            callbacks = args.callbacks;
            scope = args.scope;

            delete args.callbacks;
            delete args.scope;

            for (name in callbacks) {
                if (callbacks.hasOwnProperty(name)) {
                    callback = callbacks[name];

                    if (typeof callback == 'function') {
                        args[name] = this.getCallbackId(callback, scope);
                    }
                }
            }
        }

        this.doSend(args);
    },

    doSend: function(args) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', this.SERVER_URL + '?' + Ext.Object.toQueryString(args) + '&_dc=' + new Date().getTime(), false);

        // wrap the request in a try/catch block so we can check if any errors are thrown and attempt to call any
        // failure/callback functions if defined
        try {
            xhr.send(null);
        } catch(e) {
            if (args.failure) {
                this.invoke(args.failure);
            } else if (args.callback) {
                this.invoke(args.callback);
            }
        }
    }
});

/**
 * @private
 */
Ext.define('Ext.device.communicator.Android', {
    extend: 'Ext.device.communicator.Default',

    doSend: function(args) {
        window.Sencha.action(JSON.stringify(args));
    }
});
/**
 * @private
 */
Ext.define('Ext.device.Communicator', {
    requires: [
        'Ext.device.communicator.Default',
        'Ext.device.communicator.Android'
    ],

    singleton: true,

    constructor: function() {
        if (Ext.os.is.Android) {
            return new Ext.device.communicator.Android();
        }

        return new Ext.device.communicator.Default();
    }
});
/**
 * @private
 */
Ext.define('Ext.device.camera.Abstract', {

    source: {
        library: 0,
        camera: 1,
        album: 2
    },

    destination: {
        data: 0, // Returns base64-encoded string
        file: 1  // Returns file's URI
    },

    encoding: {
        jpeg: 0,
        jpg: 0,
        png: 1
    },

    /**
     * Allows you to capture a photo.
     *
     * @param {Object} options
     * The options to use when taking a photo.
     *
     * @param {Function} options.success
     * The success callback which is called when the photo has been taken.
     *
     * @param {String} options.success.image
     * The image which was just taken, either a base64 encoded string or a URI depending on which
     * option you chose (destination).
     *
     * @param {Function} options.failure
     * The function which is called when something goes wrong.
     *
     * @param {Object} scope
     * The scope in which to call the `success` and `failure` functions, if specified.
     *
     * @param {Number} options.quality
     * The quality of the image which is returned in the callback. This should be a percentage.
     *
     * @param {String} options.source
     * The source of where the image should be taken. Available options are:
     *
     * - **album** - prompts the user to choose an image from an album
     * - **camera** - prompts the user to take a new photo
     * - **library** - prompts the user to choose an image from the library
     *
     * @param {String} destination
     * The destination of the image which is returned. Available options are:
     *
     * - **data** - returns a base64 encoded string
     * - **file** - returns the file's URI
     *
     * @param {String} encoding
     * The encoding of the returned image. Available options are:
     *
     * - **jpg**
     * - **png**
     *
     * @param {Number} width
     * The width of the image to return
     *
     * @param {Number} height
     * The height of the image to return
     */
    capture: Ext.emptyFn
});
/**
 * @private
 */
Ext.define('Ext.device.camera.PhoneGap', {

    extend: 'Ext.device.camera.Abstract',

    capture: function(args) {
        var onSuccess = args.success,
            onError = args.failure,
            scope = args.scope,
            sources = this.source,
            destinations = this.destination,
            encodings = this.encoding,
            source = args.source,
            destination = args.destination,
            encoding = args.encoding,
            options = {};

        if (scope) {
            onSuccess = Ext.Function.bind(onSuccess, scope);
            onError = Ext.Function.bind(onError, scope);
        }

        if (source !== undefined) {
            options.sourceType = sources.hasOwnProperty(source) ? sources[source] : source;
        }

        if (destination !== undefined) {
            options.destinationType = destinations.hasOwnProperty(destination) ? destinations[destination] : destination;
        }

        if (encoding !== undefined) {
            options.encodingType = encodings.hasOwnProperty(encoding) ? encodings[encoding] : encoding;
        }

        if ('quality' in args) {
            options.quality = args.quality;
        }

        if ('width' in args) {
            options.targetWidth = args.width;
        }

        if ('height' in args) {
            options.targetHeight = args.height;
        }

        try {
            navigator.camera.getPicture(onSuccess, onError, options);
        }
        catch (e) {
            alert(e);
        }
    }
});
/**
 * @private
 */
Ext.define('Ext.device.camera.Sencha', {

    extend: 'Ext.device.camera.Abstract',

    requires: [
        'Ext.device.Communicator'
    ],

    capture: function(options) {
        var sources = this.source,
            destinations = this.destination,
            encodings = this.encoding,
            source = options.source,
            destination = options.destination,
            encoding = options.encoding;

        if (sources.hasOwnProperty(source)) {
            source = sources[source];
        }

        if (destinations.hasOwnProperty(destination)) {
            destination = destinations[destination];
        }

        if (encodings.hasOwnProperty(encoding)) {
            encoding = encodings[encoding];
        }

        Ext.device.Communicator.send({
            command: 'Camera#capture',
            callbacks: {
                success: options.success,
                failure: options.failure
            },
            scope: options.scope,
            quality: options.quality,
            width: options.width,
            height: options.height,
            source: source,
            destination: destination,
            encoding: encoding
        });
    }
});
/**
 * @private
 */
Ext.define('Ext.device.camera.Simulator', {
    extend: 'Ext.device.camera.Abstract',

    config: {
        samples: [
            {
                success: 'http://www.sencha.com/img/sencha-large.png'
            }
        ]
    },

    constructor: function(config) {
        this.initConfig(config);
    },

    updateSamples: function(samples) {
        this.sampleIndex = 0;
    },

    capture: function(options) {
        var index = this.sampleIndex,
            samples = this.getSamples(),
            samplesCount = samples.length,
            sample = samples[index],
            scope = options.scope,
            success = options.success,
            failure = options.failure;

        if ('success' in sample) {
            if (success) {
                success.call(scope, sample.success);
            }
        }
        else {
            if (failure) {
                failure.call(scope, sample.failure);
            }
        }

        if (++index > samplesCount - 1) {
            index = 0;
        }

        this.sampleIndex = index;
    }
});
/**
 * @private
 */
Ext.define('Ext.device.connection.Abstract', {
    extend: 'Ext.Evented',

    config: {
        online: false,
        type: null
    },

    /**
     * @property {String} UNKNOWN
     * Text label for a connection type.
     */
    UNKNOWN: 'Unknown connection',

    /**
     * @property {String} ETHERNET
     * Text label for a connection type.
     */
    ETHERNET: 'Ethernet connection',

    /**
     * @property {String} WIFI
     * Text label for a connection type.
     */
    WIFI: 'WiFi connection',

    /**
     * @property {String} CELL_2G
     * Text label for a connection type.
     */
    CELL_2G: 'Cell 2G connection',

    /**
     * @property {String} CELL_3G
     * Text label for a connection type.
     */
    CELL_3G: 'Cell 3G connection',

    /**
     * @property {String} CELL_4G
     * Text label for a connection type.
     */
    CELL_4G: 'Cell 4G connection',

    /**
     * @property {String} NONE
     * Text label for a connection type.
     */
    NONE: 'No network connection',

    /**
     * True if the device is currently online
     * @return {Boolean} online
     */
    isOnline: function() {
        return this.getOnline();
    }

    /**
     * @method getType
     * Returns the current connection type.
     * @return {String} type
     */
});
/**
 * @private
 */
Ext.define('Ext.device.connection.PhoneGap', {
    extend: 'Ext.device.connection.Abstract',

    syncOnline: function() {
        var type = navigator.network.connection.type;
        this._type = type;
        this._online = type != Connection.NONE;
    },

    getOnline: function() {
        this.syncOnline();
        return this._online;
    },

    getType: function() {
        this.syncOnline();
        return this._type;
    }
});
/**
 * @private
 */
Ext.define('Ext.device.connection.Sencha', {
    extend: 'Ext.device.connection.Abstract',

    /**
     * @event onlinechange
     * Fires when the connection status changes.
     * @param {Boolean} online True if you are {@link Ext.device.Connection#isOnline online}
     * @param {String} type The new online {@link Ext.device.Connection#getType type}
     */

    initialize: function() {
        Ext.device.Communicator.send({
            command: 'Connection#watch',
            callbacks: {
                callback: this.onConnectionChange
            },
            scope: this
        });
    },

    onConnectionChange: function(e) {
        this.setOnline(Boolean(e.online));
        this.setType(this[e.type]);

        this.fireEvent('onlinechange', this.getOnline(), this.getType());
    }
});
/**
 * @private
 */
Ext.define('Ext.device.connection.Simulator', {
    extend: 'Ext.device.connection.Abstract',

    getOnline: function() {
        this._online = navigator.onLine;
        this._type = Ext.device.Connection.UNKNOWN;
        return this._online;
    }
});
/**
 * @private
 */
Ext.define('Ext.device.geolocation.Abstract', {
    config: {
        /**
         * @cfg {Number} maximumAge
         * This option indicates that the application is willing to accept cached location information whose age
         * is no greater than the specified time in milliseconds. If maximumAge is set to 0, an attempt to retrieve
         * new location information is made immediately.
         */
        maximumAge: 0,

        /**
         * @cfg {Number} frequency The default frequency to get the current position when using {@link Ext.device.Geolocation#watchPosition}.
         */
        frequency: 10000,

        /**
         * @cfg {Boolean} allowHighAccuracy True to allow high accuracy when getting the current position.
         */
        allowHighAccuracy: false,

        /**
         * @cfg {Number} timeout
         * The maximum number of milliseconds allowed to elapse between a location update operation.
         */
        timeout: Infinity
    },

    /**
     * Attempts to get the current position of this device.
     *
     *     Ext.device.Geolocation.getCurrentPosition({
     *         success: function(position) {
     *             console.log(position);
     *         },
     *         failure: function() {
     *             Ext.Msg.alert('Geolocation', 'Something went wrong!');
     *         }
     *     });
     *
     * *Note:* If you want to watch the current position, you could use {@link Ext.device.Geolocation#watchPosition} instead.
     *
     * @param {Object} config An object which contains the following config options:
     *
     * @param {Function} config.success
     * The function to call when the location of the current device has been received.
     *
     * @param {Object} config.success.position
     *
     * @param {Function} config.failure
     * The function that is called when something goes wrong.
     *
     * @param {Object} config.scope
     * The scope of the `success` and `failure` functions.
     *
     * @param {Number} config.maximumAge
     * The maximum age of a cached location. If you do not enter a value for this, the value of {@link #maximumAge}
     * will be used.
     *
     * @param {Number} config.timeout
     * The timeout for this request. If you do not specify a value, it will default to {@link #timeout}.
     *
     * @param {Boolean} config.allowHighAccuracy
     * True to enable allow accuracy detection of the location of the current device. If you do not specify a value, it will
     * default to {@link #allowHighAccuracy}.
     */
    getCurrentPosition: function(config) {
        var defaultConfig = Ext.device.geolocation.Abstract.prototype.config;

        config = Ext.applyIf(config, {
            maximumAge: defaultConfig.maximumAge,
            frequency: defaultConfig.frequency,
            allowHighAccuracy: defaultConfig.allowHighAccuracy,
            timeout: defaultConfig.timeout
        });

        // <debug>
        if (!config.success) {
            Ext.Logger.warn('You need to specify a `success` function for #getCurrentPosition');
        }
        // </debug>

        return config;
    },

    /**
     * Watches for the current position and calls the callback when successful depending on the specified {@link #frequency}.
     *
     *     Ext.device.Geolocation.watchPosition({
     *         callback: function(position) {
     *             console.log(position);
     *         },
     *         failure: function() {
     *             Ext.Msg.alert('Geolocation', 'Something went wrong!');
     *         }
     *     });
     *
     * @param {Object} config An object which contains the following config options:
     *
     * @param {Function} config.callback
     * The function to be called when the position has been updated.
     *
     * @param {Function} config.failure
     * The function that is called when something goes wrong.
     *
     * @param {Object} config.scope
     * The scope of the `success` and `failure` functions.
     *
     * @param {Boolean} config.frequency
     * The frequency in which to call the supplied callback. Defaults to {@link #frequency} if you do not specify a value.
     *
     * @param {Boolean} config.allowHighAccuracy
     * True to enable allow accuracy detection of the location of the current device. If you do not specify a value, it will
     * default to {@link #allowHighAccuracy}.
     */
    watchPosition: function(config) {
        var defaultConfig = Ext.device.geolocation.Abstract.prototype.config;

        config = Ext.applyIf(config, {
            maximumAge: defaultConfig.maximumAge,
            frequency: defaultConfig.frequency,
            allowHighAccuracy: defaultConfig.allowHighAccuracy,
            timeout: defaultConfig.timeout
        });

        // <debug>
        if (!config.callback) {
            Ext.Logger.warn('You need to specify a `callback` function for #watchPosition');
        }
        // </debug>

        return config;
    },

    /**
     * If you are currently watching for the current position, this will stop that task.
     */
    clearWatch: function() {}
});
/**
 * @private
 */
Ext.define('Ext.device.geolocation.Sencha', {
    extend: 'Ext.device.geolocation.Abstract',

    getCurrentPosition: function(config) {
        config = this.callParent([config]);

        Ext.apply(config, {
            command: 'Geolocation#getCurrentPosition',
            callbacks: {
                success: config.success,
                failure: config.failure
            }
        });

        Ext.applyIf(config, {
            scope: this
        });

        delete config.success;
        delete config.failure;

        Ext.device.Communicator.send(config);

        return config;
    },

    watchPosition: function(config) {
        config = this.callParent([config]);

        Ext.apply(config, {
            command: 'Geolocation#watchPosition',
            callbacks: {
                success: config.callback,
                failure: config.failure
            }
        });

        Ext.applyIf(config, {
            scope: this
        });

        delete config.callback;
        delete config.failure;

        Ext.device.Communicator.send(config);

        return config;
    },

    clearWatch: function() {
        Ext.device.Communicator.send({
            command: 'Geolocation#clearWatch'
        });
    }
});
/**
 * @private
 */
Ext.define('Ext.device.geolocation.Simulator', {
    extend: 'Ext.device.geolocation.Abstract',
    requires: ['Ext.util.Geolocation'],

    getCurrentPosition: function(config) {
        config = this.callParent([config]);

        Ext.apply(config, {
            autoUpdate: false,
            listeners: {
                scope: this,
                locationupdate: function(geolocation) {
                    if (config.success) {
                        config.success.call(config.scope || this, geolocation.position);
                    }
                },
                locationerror: function() {
                    if (config.failure) {
                        config.failure.call(config.scope || this);
                    }
                }
            }
        });

        this.geolocation = Ext.create('Ext.util.Geolocation', config);
        this.geolocation.updateLocation();

        return config;
    },

    watchPosition: function(config) {
        config = this.callParent([config]);

        Ext.apply(config, {
            listeners: {
                scope: this,
                locationupdate: function(geolocation) {
                    if (config.callback) {
                        config.callback.call(config.scope || this, geolocation.position);
                    }
                },
                locationerror: function() {
                    if (config.failure) {
                        config.failure.call(config.scope || this);
                    }
                }
            }
        });

        this.geolocation = Ext.create('Ext.util.Geolocation', config);

        return config;
    },

    clearWatch: function() {
        if (this.geolocation) {
            this.geolocation.destroy();
        }

        this.geolocation = null;
    }
});
/**
 * @private
 */
Ext.define('Ext.device.orientation.Abstract', {
    extend: 'Ext.EventedBase',

    /**
     * @event orientationchange
     * Fires when the orientation has been changed on this device.
     *
     *     Ext.device.Orientation.on({
     *         scope: this,
     *         orientationchange: function(e) {
     *             console.log('Alpha: ', e.alpha);
     *             console.log('Beta: ', e.beta);
     *             console.log('Gamma: ', e.gamma);
     *         }
     *     });
     *
     * @param {Object} event The event object
     * @param {Object} event.alpha The alpha value of the orientation event
     * @param {Object} event.beta The beta value of the orientation event
     * @param {Object} event.gamma The gamma value of the orientation event
     */

    onDeviceOrientation: function(e) {
        this.doFireEvent('orientationchange', [e]);
    }
});
/**
 * Provides the HTML5 implementation for the orientation API.
 * @private
 */
Ext.define('Ext.device.orientation.HTML5', {
    extend: 'Ext.device.orientation.Abstract',

    initialize: function() {
        this.onDeviceOrientation = Ext.Function.bind(this.onDeviceOrientation, this);
        window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
    }
});
/**
 * @private
 */
Ext.define('Ext.device.orientation.Sencha', {
    extend: 'Ext.device.orientation.Abstract',

    requires: [
        'Ext.device.Communicator'
    ],

    /**
     * From the native shell, the callback needs to be invoked infinitely using a timer, ideally 50 times per second.
     * The callback expects one event object argument, the format of which should looks like this:
     *
     *     {
     *          alpha: 0,
     *          beta: 0,
     *          gamma: 0
     *     }
     *
     * Refer to [Safari DeviceOrientationEvent Class Reference][1] for more details.
     * 
     * [1]: http://developer.apple.com/library/safari/#documentation/SafariDOMAdditions/Reference/DeviceOrientationEventClassRef/DeviceOrientationEvent/DeviceOrientationEvent.html
     */
    initialize: function() {
        Ext.device.Communicator.send({
            command: 'Orientation#watch',
            callbacks: {
                callback: this.onDeviceOrientation
            },
            scope: this
        });
    }
});
// UTF8 Module
//
// Cleaner and modularized utf-8 encoding and decoding library for javascript.
//
// copyright: MIT
// author: Nijiko Yonskai, @nijikokun, nijikokun@gmail.com
(function (name, definition, context, dependencies) {
  if (typeof context['module'] !== 'undefined' && context['module']['exports']) { if (dependencies && context['require']) { for (var i = 0; i < dependencies.length; i++) context[dependencies[i]] = context['require'](dependencies[i]); } context['module']['exports'] = definition.apply(context); }
  else if (typeof context['define'] !== 'undefined' && context['define'] === 'function' && context['define']['amd']) { define(name, (dependencies || []), definition); }
  else { context[name] = definition.apply(context); }
})('utf8', function () {
  return {
    encode: function (string) {
      if (typeof string !== 'string') return string;
      else string = string.replace(/\r\n/g, "\n");
      var output = "", i = 0, charCode;

      for (i; i < string.length; i++) {
        charCode = string.charCodeAt(i);

        if (charCode < 128)
          output += String.fromCharCode(charCode);
        else if ((charCode > 127) && (charCode < 2048))
          output += String.fromCharCode((charCode >> 6) | 192),
          output += String.fromCharCode((charCode & 63) | 128);
        else
          output += String.fromCharCode((charCode >> 12) | 224),
          output += String.fromCharCode(((charCode >> 6) & 63) | 128),
          output += String.fromCharCode((charCode & 63) | 128);
      }

      return output;
    },

    decode: function (string) {
      if (typeof string !== 'string') return string;
      var output = "", i = 0, charCode = 0;

      while (i < string.length) {
        charCode = string.charCodeAt(i);

        if (charCode < 128)
          output += String.fromCharCode(charCode),
          i++;
        else if ((charCode > 191) && (charCode < 224))
          output += String.fromCharCode(((charCode & 31) << 6) | (string.charCodeAt(i + 1) & 63)),
          i += 2;
        else
          output += String.fromCharCode(((charCode & 15) << 12) | ((string.charCodeAt(i + 1) & 63) << 6) | (string.charCodeAt(i + 2) & 63)),
          i += 3;
      }

      return output;
    }
  };
}, this);

// Base64 Module
//
// Cleaner, modularized and properly scoped base64 encoding and decoding module for strings.
//
// copyright: MIT
// author: Nijiko Yonskai, @nijikokun, nijikokun@gmail.com
(function (name, definition, context, dependencies) {
  if (typeof context['module'] !== 'undefined' && context['module']['exports']) { if (dependencies && context['require']) { for (var i = 0; i < dependencies.length; i++) context[dependencies[i]] = context['require'](dependencies[i]); } context['module']['exports'] = definition.apply(context); }
  else if (typeof context['define'] !== 'undefined' && context['define'] === 'function' && context['define']['amd']) { define(name, (dependencies || []), definition); }
  else { context[name] = definition(); }
})('base64', function (utf8) {
  var $this = this;
  var $utf8 = utf8 || this.utf8;
  var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  return {
    encode: function (input) {
      if (typeof $this.btoa !== 'undefined') return $this.btoa(input);
      if (typeof $utf8 === 'undefined') throw { error: "MissingMethod", message: "UTF8 Module is missing." };
      if (typeof input !== 'string') return input;
      else input = $utf8.encode(input);
      var output = "", a, b, c, d, e, f, g, i = 0;

      while (i < input.length) {
        a = input.charCodeAt(i++);
        b = input.charCodeAt(i++);
        c = input.charCodeAt(i++);
        d = a >> 2;
        e = ((a & 3) << 4) | (b >> 4);
        f = ((b & 15) << 2) | (c >> 6);
        g = c & 63;

        if (isNaN(b)) f = g = 64;
        else if (isNaN(c)) g = 64;

        output += map.charAt(d) + map.charAt(e) + map.charAt(f) + map.charAt(g);
      }

      return output;
    },

    decode: function (input) {
      if (typeof $this.atob !== 'undefined') return $this.atob(input);
      if (typeof $utf8 === 'undefined') throw { error: "MissingMethod", message: "UTF8 Module is missing." };
      if (typeof input !== 'string') return input;
      else input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      var output = "", a, b, c, d, e, f, g, i = 0;

      while (i < input.length) {
        d = map.indexOf(input.charAt(i++));
        e = map.indexOf(input.charAt(i++));
        f = map.indexOf(input.charAt(i++));
        g = map.indexOf(input.charAt(i++));

        a = (d << 2) | (e >> 4);
        b = ((e & 15) << 4) | (f >> 2);
        c = ((f & 3) << 6) | g;

        output += String.fromCharCode(a);
        if (f != 64) output += String.fromCharCode(b);
        if (g != 64) output += String.fromCharCode(c);
      }

      return $utf8.decode(output);
    }
  }
}, this, [ "utf8" ]);
/**Works on all versions prior and including Cordova 1.6.1
 * by mcaesar
 *  MIT license
 *
 */

/* This increases plugin compatibility */
(function(cordovaRef)
{

   /**
    * The Java to JavaScript Gateway 'magic' class
    */
   Base64ToPNG = function()
   {
   }
   /**
    * Save the base64 String as a PNG file to the user's Photo Library
    */
   Base64ToPNG.prototype.saveImage = function(b64String, params, win, fail)
   {
      cordovaRef.exec(win, fail, "Base64ToPNG", "saveImage", [b64String, params]);
   };

   cordovaRef.addConstructor(function()
   {
      if (!window.plugins)
      {
         window.plugins =
         {
         };
      }
      if (!window.plugins.base64ToPNG)
      {
         window.plugins.base64ToPNG = new Base64ToPNG();
      }
   });

})(window.cordova || window.Cordova || window.PhoneGap);
/**
 * @version: 1.0 Alpha-1
 * @author: Coolite Inc. http://www.coolite.com/
 * @date: 2008-05-13
 * @copyright: Copyright (c) 2006-2008, Coolite Inc. (http://www.coolite.com/). All rights reserved.
 * @license: Licensed under The MIT License. See license.txt and http://www.datejs.com/license/. 
 * @website: http://www.datejs.com/
 */
Date.CultureInfo={name:"en-US",englishName:"English (United States)",nativeName:"English (United States)",dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],abbreviatedDayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],shortestDayNames:["Su","Mo","Tu","We","Th","Fr","Sa"],firstLetterDayNames:["S","M","T","W","T","F","S"],monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],abbreviatedMonthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],amDesignator:"AM",pmDesignator:"PM",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"mdy",formatPatterns:{shortDate:"M/d/yyyy",longDate:"dddd, MMMM dd, yyyy",shortTime:"h:mm tt",longTime:"h:mm:ss tt",fullDateTime:"dddd, MMMM dd, yyyy h:mm:ss tt",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"MMMM dd",yearMonth:"MMMM, yyyy"},regexPatterns:{jan:/^jan(uary)?/i,feb:/^feb(ruary)?/i,mar:/^mar(ch)?/i,apr:/^apr(il)?/i,may:/^may/i,jun:/^jun(e)?/i,jul:/^jul(y)?/i,aug:/^aug(ust)?/i,sep:/^sep(t(ember)?)?/i,oct:/^oct(ober)?/i,nov:/^nov(ember)?/i,dec:/^dec(ember)?/i,sun:/^su(n(day)?)?/i,mon:/^mo(n(day)?)?/i,tue:/^tu(e(s(day)?)?)?/i,wed:/^we(d(nesday)?)?/i,thu:/^th(u(r(s(day)?)?)?)?/i,fri:/^fr(i(day)?)?/i,sat:/^sa(t(urday)?)?/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|aft(er)?|from|hence)/i,subtract:/^(\-|bef(ore)?|ago)/i,yesterday:/^yes(terday)?/i,today:/^t(od(ay)?)?/i,tomorrow:/^tom(orrow)?/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^mn|min(ute)?s?/i,hour:/^h(our)?s?/i,week:/^w(eek)?s?/i,month:/^m(onth)?s?/i,day:/^d(ay)?s?/i,year:/^y(ear)?s?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt|utc)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a(?!u|p)|p)/i},timezones:[{name:"UTC",offset:"-000"},{name:"GMT",offset:"-000"},{name:"EST",offset:"-0500"},{name:"EDT",offset:"-0400"},{name:"CST",offset:"-0600"},{name:"CDT",offset:"-0500"},{name:"MST",offset:"-0700"},{name:"MDT",offset:"-0600"},{name:"PST",offset:"-0800"},{name:"PDT",offset:"-0700"}]};
(function(){var $D=Date,$P=$D.prototype,$C=$D.CultureInfo,p=function(s,l){if(!l){l=2;}
return("000"+s).slice(l*-1);};$P.clearTime=function(){this.setHours(0);this.setMinutes(0);this.setSeconds(0);this.setMilliseconds(0);return this;};$P.setTimeToNow=function(){var n=new Date();this.setHours(n.getHours());this.setMinutes(n.getMinutes());this.setSeconds(n.getSeconds());this.setMilliseconds(n.getMilliseconds());return this;};$D.today=function(){return new Date().clearTime();};$D.compare=function(date1,date2){if(isNaN(date1)||isNaN(date2)){throw new Error(date1+" - "+date2);}else if(date1 instanceof Date&&date2 instanceof Date){return(date1<date2)?-1:(date1>date2)?1:0;}else{throw new TypeError(date1+" - "+date2);}};$D.equals=function(date1,date2){return(date1.compareTo(date2)===0);};$D.getDayNumberFromName=function(name){var n=$C.dayNames,m=$C.abbreviatedDayNames,o=$C.shortestDayNames,s=name.toLowerCase();for(var i=0;i<n.length;i++){if(n[i].toLowerCase()==s||m[i].toLowerCase()==s||o[i].toLowerCase()==s){return i;}}
return-1;};$D.getMonthNumberFromName=function(name){var n=$C.monthNames,m=$C.abbreviatedMonthNames,s=name.toLowerCase();for(var i=0;i<n.length;i++){if(n[i].toLowerCase()==s||m[i].toLowerCase()==s){return i;}}
return-1;};$D.isLeapYear=function(year){return((year%4===0&&year%100!==0)||year%400===0);};$D.getDaysInMonth=function(year,month){return[31,($D.isLeapYear(year)?29:28),31,30,31,30,31,31,30,31,30,31][month];};$D.getTimezoneAbbreviation=function(offset){var z=$C.timezones,p;for(var i=0;i<z.length;i++){if(z[i].offset===offset){return z[i].name;}}
return null;};$D.getTimezoneOffset=function(name){var z=$C.timezones,p;for(var i=0;i<z.length;i++){if(z[i].name===name.toUpperCase()){return z[i].offset;}}
return null;};$P.clone=function(){return new Date(this.getTime());};$P.compareTo=function(date){return Date.compare(this,date);};$P.equals=function(date){return Date.equals(this,date||new Date());};$P.between=function(start,end){return this.getTime()>=start.getTime()&&this.getTime()<=end.getTime();};$P.isAfter=function(date){return this.compareTo(date||new Date())===1;};$P.isBefore=function(date){return(this.compareTo(date||new Date())===-1);};$P.isToday=function(){return this.isSameDay(new Date());};$P.isSameDay=function(date){return this.clone().clearTime().equals(date.clone().clearTime());};$P.addMilliseconds=function(value){this.setMilliseconds(this.getMilliseconds()+value);return this;};$P.addSeconds=function(value){return this.addMilliseconds(value*1000);};$P.addMinutes=function(value){return this.addMilliseconds(value*60000);};$P.addHours=function(value){return this.addMilliseconds(value*3600000);};$P.addDays=function(value){this.setDate(this.getDate()+value);return this;};$P.addWeeks=function(value){return this.addDays(value*7);};$P.addMonths=function(value){var n=this.getDate();this.setDate(1);this.setMonth(this.getMonth()+value);this.setDate(Math.min(n,$D.getDaysInMonth(this.getFullYear(),this.getMonth())));return this;};$P.addYears=function(value){return this.addMonths(value*12);};$P.add=function(config){if(typeof config=="number"){this._orient=config;return this;}
var x=config;if(x.milliseconds){this.addMilliseconds(x.milliseconds);}
if(x.seconds){this.addSeconds(x.seconds);}
if(x.minutes){this.addMinutes(x.minutes);}
if(x.hours){this.addHours(x.hours);}
if(x.weeks){this.addWeeks(x.weeks);}
if(x.months){this.addMonths(x.months);}
if(x.years){this.addYears(x.years);}
if(x.days){this.addDays(x.days);}
return this;};var $y,$m,$d;$P.getWeek=function(){var a,b,c,d,e,f,g,n,s,w;$y=(!$y)?this.getFullYear():$y;$m=(!$m)?this.getMonth()+1:$m;$d=(!$d)?this.getDate():$d;if($m<=2){a=$y-1;b=(a/4|0)-(a/100|0)+(a/400|0);c=((a-1)/4|0)-((a-1)/100|0)+((a-1)/400|0);s=b-c;e=0;f=$d-1+(31*($m-1));}else{a=$y;b=(a/4|0)-(a/100|0)+(a/400|0);c=((a-1)/4|0)-((a-1)/100|0)+((a-1)/400|0);s=b-c;e=s+1;f=$d+((153*($m-3)+2)/5)+58+s;}
g=(a+b)%7;d=(f+g-e)%7;n=(f+3-d)|0;if(n<0){w=53-((g-s)/5|0);}else if(n>364+s){w=1;}else{w=(n/7|0)+1;}
$y=$m=$d=null;return w;};$P.getISOWeek=function(){$y=this.getUTCFullYear();$m=this.getUTCMonth()+1;$d=this.getUTCDate();return p(this.getWeek());};$P.setWeek=function(n){return this.moveToDayOfWeek(1).addWeeks(n-this.getWeek());};$D._validate=function(n,min,max,name){if(typeof n=="undefined"){return false;}else if(typeof n!="number"){throw new TypeError(n+" is not a Number.");}else if(n<min||n>max){throw new RangeError(n+" is not a valid value for "+name+".");}
return true;};$D.validateMillisecond=function(value){return $D._validate(value,0,999,"millisecond");};$D.validateSecond=function(value){return $D._validate(value,0,59,"second");};$D.validateMinute=function(value){return $D._validate(value,0,59,"minute");};$D.validateHour=function(value){return $D._validate(value,0,23,"hour");};$D.validateDay=function(value,year,month){return $D._validate(value,1,$D.getDaysInMonth(year,month),"day");};$D.validateMonth=function(value){return $D._validate(value,0,11,"month");};$D.validateYear=function(value){return $D._validate(value,0,9999,"year");};$P.set=function(config){if($D.validateMillisecond(config.millisecond)){this.addMilliseconds(config.millisecond-this.getMilliseconds());}
if($D.validateSecond(config.second)){this.addSeconds(config.second-this.getSeconds());}
if($D.validateMinute(config.minute)){this.addMinutes(config.minute-this.getMinutes());}
if($D.validateHour(config.hour)){this.addHours(config.hour-this.getHours());}
if($D.validateMonth(config.month)){this.addMonths(config.month-this.getMonth());}
if($D.validateYear(config.year)){this.addYears(config.year-this.getFullYear());}
if($D.validateDay(config.day,this.getFullYear(),this.getMonth())){this.addDays(config.day-this.getDate());}
if(config.timezone){this.setTimezone(config.timezone);}
if(config.timezoneOffset){this.setTimezoneOffset(config.timezoneOffset);}
if(config.week&&$D._validate(config.week,0,53,"week")){this.setWeek(config.week);}
return this;};$P.moveToFirstDayOfMonth=function(){return this.set({day:1});};$P.moveToLastDayOfMonth=function(){return this.set({day:$D.getDaysInMonth(this.getFullYear(),this.getMonth())});};$P.moveToNthOccurrence=function(dayOfWeek,occurrence){var shift=0;if(occurrence>0){shift=occurrence-1;}
else if(occurrence===-1){this.moveToLastDayOfMonth();if(this.getDay()!==dayOfWeek){this.moveToDayOfWeek(dayOfWeek,-1);}
return this;}
return this.moveToFirstDayOfMonth().addDays(-1).moveToDayOfWeek(dayOfWeek,+1).addWeeks(shift);};$P.moveToDayOfWeek=function(dayOfWeek,orient){var diff=(dayOfWeek-this.getDay()+7*(orient||+1))%7;return this.addDays((diff===0)?diff+=7*(orient||+1):diff);};$P.moveToMonth=function(month,orient){var diff=(month-this.getMonth()+12*(orient||+1))%12;return this.addMonths((diff===0)?diff+=12*(orient||+1):diff);};$P.getOrdinalNumber=function(){return Math.ceil((this.clone().clearTime()-new Date(this.getFullYear(),0,1))/86400000)+1;};$P.getTimezone=function(){return $D.getTimezoneAbbreviation(this.getUTCOffset());};$P.setTimezoneOffset=function(offset){var here=this.getTimezoneOffset(),there=Number(offset)*-6/10;return this.addMinutes(there-here);};$P.setTimezone=function(offset){return this.setTimezoneOffset($D.getTimezoneOffset(offset));};$P.hasDaylightSavingTime=function(){return(Date.today().set({month:0,day:1}).getTimezoneOffset()!==Date.today().set({month:6,day:1}).getTimezoneOffset());};$P.isDaylightSavingTime=function(){return(this.hasDaylightSavingTime()&&new Date().getTimezoneOffset()===Date.today().set({month:6,day:1}).getTimezoneOffset());};$P.getUTCOffset=function(){var n=this.getTimezoneOffset()*-10/6,r;if(n<0){r=(n-10000).toString();return r.charAt(0)+r.substr(2);}else{r=(n+10000).toString();return"+"+r.substr(1);}};$P.getElapsed=function(date){return(date||new Date())-this;};if(!$P.toISOString){$P.toISOString=function(){function f(n){return n<10?'0'+n:n;}
return'"'+this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z"';};}
$P._toString=$P.toString;$P.toString=function(format){var x=this;if(format&&format.length==1){var c=$C.formatPatterns;x.t=x.toString;switch(format){case"d":return x.t(c.shortDate);case"D":return x.t(c.longDate);case"F":return x.t(c.fullDateTime);case"m":return x.t(c.monthDay);case"r":return x.t(c.rfc1123);case"s":return x.t(c.sortableDateTime);case"t":return x.t(c.shortTime);case"T":return x.t(c.longTime);case"u":return x.t(c.universalSortableDateTime);case"y":return x.t(c.yearMonth);}}
var ord=function(n){switch(n*1){case 1:case 21:case 31:return"st";case 2:case 22:return"nd";case 3:case 23:return"rd";default:return"th";}};return format?format.replace(/(\\)?(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|S)/g,function(m){if(m.charAt(0)==="\\"){return m.replace("\\","");}
x.h=x.getHours;switch(m){case"hh":return p(x.h()<13?(x.h()===0?12:x.h()):(x.h()-12));case"h":return x.h()<13?(x.h()===0?12:x.h()):(x.h()-12);case"HH":return p(x.h());case"H":return x.h();case"mm":return p(x.getMinutes());case"m":return x.getMinutes();case"ss":return p(x.getSeconds());case"s":return x.getSeconds();case"yyyy":return p(x.getFullYear(),4);case"yy":return p(x.getFullYear());case"dddd":return $C.dayNames[x.getDay()];case"ddd":return $C.abbreviatedDayNames[x.getDay()];case"dd":return p(x.getDate());case"d":return x.getDate();case"MMMM":return $C.monthNames[x.getMonth()];case"MMM":return $C.abbreviatedMonthNames[x.getMonth()];case"MM":return p((x.getMonth()+1));case"M":return x.getMonth()+1;case"t":return x.h()<12?$C.amDesignator.substring(0,1):$C.pmDesignator.substring(0,1);case"tt":return x.h()<12?$C.amDesignator:$C.pmDesignator;case"S":return ord(x.getDate());default:return m;}}):this._toString();};}());
(function(){var $D=Date,$P=$D.prototype,$C=$D.CultureInfo,$N=Number.prototype;$P._orient=+1;$P._nth=null;$P._is=false;$P._same=false;$P._isSecond=false;$N._dateElement="day";$P.next=function(){this._orient=+1;return this;};$D.next=function(){return $D.today().next();};$P.last=$P.prev=$P.previous=function(){this._orient=-1;return this;};$D.last=$D.prev=$D.previous=function(){return $D.today().last();};$P.is=function(){this._is=true;return this;};$P.same=function(){this._same=true;this._isSecond=false;return this;};$P.today=function(){return this.same().day();};$P.weekday=function(){if(this._is){this._is=false;return(!this.is().sat()&&!this.is().sun());}
return false;};$P.at=function(time){return(typeof time==="string")?$D.parse(this.toString("d")+" "+time):this.set(time);};$N.fromNow=$N.after=function(date){var c={};c[this._dateElement]=this;return((!date)?new Date():date.clone()).add(c);};$N.ago=$N.before=function(date){var c={};c[this._dateElement]=this*-1;return((!date)?new Date():date.clone()).add(c);};var dx=("sunday monday tuesday wednesday thursday friday saturday").split(/\s/),mx=("january february march april may june july august september october november december").split(/\s/),px=("Millisecond Second Minute Hour Day Week Month Year").split(/\s/),pxf=("Milliseconds Seconds Minutes Hours Date Week Month FullYear").split(/\s/),nth=("final first second third fourth fifth").split(/\s/),de;$P.toObject=function(){var o={};for(var i=0;i<px.length;i++){o[px[i].toLowerCase()]=this["get"+pxf[i]]();}
return o;};$D.fromObject=function(config){config.week=null;return Date.today().set(config);};var df=function(n){return function(){if(this._is){this._is=false;return this.getDay()==n;}
if(this._nth!==null){if(this._isSecond){this.addSeconds(this._orient*-1);}
this._isSecond=false;var ntemp=this._nth;this._nth=null;var temp=this.clone().moveToLastDayOfMonth();this.moveToNthOccurrence(n,ntemp);if(this>temp){throw new RangeError($D.getDayName(n)+" does not occur "+ntemp+" times in the month of "+$D.getMonthName(temp.getMonth())+" "+temp.getFullYear()+".");}
return this;}
return this.moveToDayOfWeek(n,this._orient);};};var sdf=function(n){return function(){var t=$D.today(),shift=n-t.getDay();if(n===0&&$C.firstDayOfWeek===1&&t.getDay()!==0){shift=shift+7;}
return t.addDays(shift);};};for(var i=0;i<dx.length;i++){$D[dx[i].toUpperCase()]=$D[dx[i].toUpperCase().substring(0,3)]=i;$D[dx[i]]=$D[dx[i].substring(0,3)]=sdf(i);$P[dx[i]]=$P[dx[i].substring(0,3)]=df(i);}
var mf=function(n){return function(){if(this._is){this._is=false;return this.getMonth()===n;}
return this.moveToMonth(n,this._orient);};};var smf=function(n){return function(){return $D.today().set({month:n,day:1});};};for(var j=0;j<mx.length;j++){$D[mx[j].toUpperCase()]=$D[mx[j].toUpperCase().substring(0,3)]=j;$D[mx[j]]=$D[mx[j].substring(0,3)]=smf(j);$P[mx[j]]=$P[mx[j].substring(0,3)]=mf(j);}
var ef=function(j){return function(){if(this._isSecond){this._isSecond=false;return this;}
if(this._same){this._same=this._is=false;var o1=this.toObject(),o2=(arguments[0]||new Date()).toObject(),v="",k=j.toLowerCase();for(var m=(px.length-1);m>-1;m--){v=px[m].toLowerCase();if(o1[v]!=o2[v]){return false;}
if(k==v){break;}}
return true;}
if(j.substring(j.length-1)!="s"){j+="s";}
return this["add"+j](this._orient);};};var nf=function(n){return function(){this._dateElement=n;return this;};};for(var k=0;k<px.length;k++){de=px[k].toLowerCase();$P[de]=$P[de+"s"]=ef(px[k]);$N[de]=$N[de+"s"]=nf(de);}
$P._ss=ef("Second");var nthfn=function(n){return function(dayOfWeek){if(this._same){return this._ss(arguments[0]);}
if(dayOfWeek||dayOfWeek===0){return this.moveToNthOccurrence(dayOfWeek,n);}
this._nth=n;if(n===2&&(dayOfWeek===undefined||dayOfWeek===null)){this._isSecond=true;return this.addSeconds(this._orient);}
return this;};};for(var l=0;l<nth.length;l++){$P[nth[l]]=(l===0)?nthfn(-1):nthfn(l);}}());
(function(){Date.Parsing={Exception:function(s){this.message="Parse error at '"+s.substring(0,10)+" ...'";}};var $P=Date.Parsing;var _=$P.Operators={rtoken:function(r){return function(s){var mx=s.match(r);if(mx){return([mx[0],s.substring(mx[0].length)]);}else{throw new $P.Exception(s);}};},token:function(s){return function(s){return _.rtoken(new RegExp("^\s*"+s+"\s*"))(s);};},stoken:function(s){return _.rtoken(new RegExp("^"+s));},until:function(p){return function(s){var qx=[],rx=null;while(s.length){try{rx=p.call(this,s);}catch(e){qx.push(rx[0]);s=rx[1];continue;}
break;}
return[qx,s];};},many:function(p){return function(s){var rx=[],r=null;while(s.length){try{r=p.call(this,s);}catch(e){return[rx,s];}
rx.push(r[0]);s=r[1];}
return[rx,s];};},optional:function(p){return function(s){var r=null;try{r=p.call(this,s);}catch(e){return[null,s];}
return[r[0],r[1]];};},not:function(p){return function(s){try{p.call(this,s);}catch(e){return[null,s];}
throw new $P.Exception(s);};},ignore:function(p){return p?function(s){var r=null;r=p.call(this,s);return[null,r[1]];}:null;},product:function(){var px=arguments[0],qx=Array.prototype.slice.call(arguments,1),rx=[];for(var i=0;i<px.length;i++){rx.push(_.each(px[i],qx));}
return rx;},cache:function(rule){var cache={},r=null;return function(s){try{r=cache[s]=(cache[s]||rule.call(this,s));}catch(e){r=cache[s]=e;}
if(r instanceof $P.Exception){throw r;}else{return r;}};},any:function(){var px=arguments;return function(s){var r=null;for(var i=0;i<px.length;i++){if(px[i]==null){continue;}
try{r=(px[i].call(this,s));}catch(e){r=null;}
if(r){return r;}}
throw new $P.Exception(s);};},each:function(){var px=arguments;return function(s){var rx=[],r=null;for(var i=0;i<px.length;i++){if(px[i]==null){continue;}
try{r=(px[i].call(this,s));}catch(e){throw new $P.Exception(s);}
rx.push(r[0]);s=r[1];}
return[rx,s];};},all:function(){var px=arguments,_=_;return _.each(_.optional(px));},sequence:function(px,d,c){d=d||_.rtoken(/^\s*/);c=c||null;if(px.length==1){return px[0];}
return function(s){var r=null,q=null;var rx=[];for(var i=0;i<px.length;i++){try{r=px[i].call(this,s);}catch(e){break;}
rx.push(r[0]);try{q=d.call(this,r[1]);}catch(ex){q=null;break;}
s=q[1];}
if(!r){throw new $P.Exception(s);}
if(q){throw new $P.Exception(q[1]);}
if(c){try{r=c.call(this,r[1]);}catch(ey){throw new $P.Exception(r[1]);}}
return[rx,(r?r[1]:s)];};},between:function(d1,p,d2){d2=d2||d1;var _fn=_.each(_.ignore(d1),p,_.ignore(d2));return function(s){var rx=_fn.call(this,s);return[[rx[0][0],r[0][2]],rx[1]];};},list:function(p,d,c){d=d||_.rtoken(/^\s*/);c=c||null;return(p instanceof Array?_.each(_.product(p.slice(0,-1),_.ignore(d)),p.slice(-1),_.ignore(c)):_.each(_.many(_.each(p,_.ignore(d))),px,_.ignore(c)));},set:function(px,d,c){d=d||_.rtoken(/^\s*/);c=c||null;return function(s){var r=null,p=null,q=null,rx=null,best=[[],s],last=false;for(var i=0;i<px.length;i++){q=null;p=null;r=null;last=(px.length==1);try{r=px[i].call(this,s);}catch(e){continue;}
rx=[[r[0]],r[1]];if(r[1].length>0&&!last){try{q=d.call(this,r[1]);}catch(ex){last=true;}}else{last=true;}
if(!last&&q[1].length===0){last=true;}
if(!last){var qx=[];for(var j=0;j<px.length;j++){if(i!=j){qx.push(px[j]);}}
p=_.set(qx,d).call(this,q[1]);if(p[0].length>0){rx[0]=rx[0].concat(p[0]);rx[1]=p[1];}}
if(rx[1].length<best[1].length){best=rx;}
if(best[1].length===0){break;}}
if(best[0].length===0){return best;}
if(c){try{q=c.call(this,best[1]);}catch(ey){throw new $P.Exception(best[1]);}
best[1]=q[1];}
return best;};},forward:function(gr,fname){return function(s){return gr[fname].call(this,s);};},replace:function(rule,repl){return function(s){var r=rule.call(this,s);return[repl,r[1]];};},process:function(rule,fn){return function(s){var r=rule.call(this,s);return[fn.call(this,r[0]),r[1]];};},min:function(min,rule){return function(s){var rx=rule.call(this,s);if(rx[0].length<min){throw new $P.Exception(s);}
return rx;};}};var _generator=function(op){return function(){var args=null,rx=[];if(arguments.length>1){args=Array.prototype.slice.call(arguments);}else if(arguments[0]instanceof Array){args=arguments[0];}
if(args){for(var i=0,px=args.shift();i<px.length;i++){args.unshift(px[i]);rx.push(op.apply(null,args));args.shift();return rx;}}else{return op.apply(null,arguments);}};};var gx="optional not ignore cache".split(/\s/);for(var i=0;i<gx.length;i++){_[gx[i]]=_generator(_[gx[i]]);}
var _vector=function(op){return function(){if(arguments[0]instanceof Array){return op.apply(null,arguments[0]);}else{return op.apply(null,arguments);}};};var vx="each any all".split(/\s/);for(var j=0;j<vx.length;j++){_[vx[j]]=_vector(_[vx[j]]);}}());(function(){var $D=Date,$P=$D.prototype,$C=$D.CultureInfo;var flattenAndCompact=function(ax){var rx=[];for(var i=0;i<ax.length;i++){if(ax[i]instanceof Array){rx=rx.concat(flattenAndCompact(ax[i]));}else{if(ax[i]){rx.push(ax[i]);}}}
return rx;};$D.Grammar={};$D.Translator={hour:function(s){return function(){this.hour=Number(s);};},minute:function(s){return function(){this.minute=Number(s);};},second:function(s){return function(){this.second=Number(s);};},meridian:function(s){return function(){this.meridian=s.slice(0,1).toLowerCase();};},timezone:function(s){return function(){var n=s.replace(/[^\d\+\-]/g,"");if(n.length){this.timezoneOffset=Number(n);}else{this.timezone=s.toLowerCase();}};},day:function(x){var s=x[0];return function(){this.day=Number(s.match(/\d+/)[0]);};},month:function(s){return function(){this.month=(s.length==3)?"jan feb mar apr may jun jul aug sep oct nov dec".indexOf(s)/4:Number(s)-1;};},year:function(s){return function(){var n=Number(s);this.year=((s.length>2)?n:(n+(((n+2000)<$C.twoDigitYearMax)?2000:1900)));};},rday:function(s){return function(){switch(s){case"yesterday":this.days=-1;break;case"tomorrow":this.days=1;break;case"today":this.days=0;break;case"now":this.days=0;this.now=true;break;}};},finishExact:function(x){x=(x instanceof Array)?x:[x];for(var i=0;i<x.length;i++){if(x[i]){x[i].call(this);}}
var now=new Date();if((this.hour||this.minute)&&(!this.month&&!this.year&&!this.day)){this.day=now.getDate();}
if(!this.year){this.year=now.getFullYear();}
if(!this.month&&this.month!==0){this.month=now.getMonth();}
if(!this.day){this.day=1;}
if(!this.hour){this.hour=0;}
if(!this.minute){this.minute=0;}
if(!this.second){this.second=0;}
if(this.meridian&&this.hour){if(this.meridian=="p"&&this.hour<12){this.hour=this.hour+12;}else if(this.meridian=="a"&&this.hour==12){this.hour=0;}}
if(this.day>$D.getDaysInMonth(this.year,this.month)){throw new RangeError(this.day+" is not a valid value for days.");}
var r=new Date(this.year,this.month,this.day,this.hour,this.minute,this.second);if(this.timezone){r.set({timezone:this.timezone});}else if(this.timezoneOffset){r.set({timezoneOffset:this.timezoneOffset});}
return r;},finish:function(x){x=(x instanceof Array)?flattenAndCompact(x):[x];if(x.length===0){return null;}
for(var i=0;i<x.length;i++){if(typeof x[i]=="function"){x[i].call(this);}}
var today=$D.today();if(this.now&&!this.unit&&!this.operator){return new Date();}else if(this.now){today=new Date();}
var expression=!!(this.days&&this.days!==null||this.orient||this.operator);var gap,mod,orient;orient=((this.orient=="past"||this.operator=="subtract")?-1:1);if(!this.now&&"hour minute second".indexOf(this.unit)!=-1){today.setTimeToNow();}
if(this.month||this.month===0){if("year day hour minute second".indexOf(this.unit)!=-1){this.value=this.month+1;this.month=null;expression=true;}}
if(!expression&&this.weekday&&!this.day&&!this.days){var temp=Date[this.weekday]();this.day=temp.getDate();if(!this.month){this.month=temp.getMonth();}
this.year=temp.getFullYear();}
if(expression&&this.weekday&&this.unit!="month"){this.unit="day";gap=($D.getDayNumberFromName(this.weekday)-today.getDay());mod=7;this.days=gap?((gap+(orient*mod))%mod):(orient*mod);}
if(this.month&&this.unit=="day"&&this.operator){this.value=(this.month+1);this.month=null;}
if(this.value!=null&&this.month!=null&&this.year!=null){this.day=this.value*1;}
if(this.month&&!this.day&&this.value){today.set({day:this.value*1});if(!expression){this.day=this.value*1;}}
if(!this.month&&this.value&&this.unit=="month"&&!this.now){this.month=this.value;expression=true;}
if(expression&&(this.month||this.month===0)&&this.unit!="year"){this.unit="month";gap=(this.month-today.getMonth());mod=12;this.months=gap?((gap+(orient*mod))%mod):(orient*mod);this.month=null;}
if(!this.unit){this.unit="day";}
if(!this.value&&this.operator&&this.operator!==null&&this[this.unit+"s"]&&this[this.unit+"s"]!==null){this[this.unit+"s"]=this[this.unit+"s"]+((this.operator=="add")?1:-1)+(this.value||0)*orient;}else if(this[this.unit+"s"]==null||this.operator!=null){if(!this.value){this.value=1;}
this[this.unit+"s"]=this.value*orient;}
if(this.meridian&&this.hour){if(this.meridian=="p"&&this.hour<12){this.hour=this.hour+12;}else if(this.meridian=="a"&&this.hour==12){this.hour=0;}}
if(this.weekday&&!this.day&&!this.days){var temp=Date[this.weekday]();this.day=temp.getDate();if(temp.getMonth()!==today.getMonth()){this.month=temp.getMonth();}}
if((this.month||this.month===0)&&!this.day){this.day=1;}
if(!this.orient&&!this.operator&&this.unit=="week"&&this.value&&!this.day&&!this.month){return Date.today().setWeek(this.value);}
if(expression&&this.timezone&&this.day&&this.days){this.day=this.days;}
return(expression)?today.add(this):today.set(this);}};var _=$D.Parsing.Operators,g=$D.Grammar,t=$D.Translator,_fn;g.datePartDelimiter=_.rtoken(/^([\s\-\.\,\/\x27]+)/);g.timePartDelimiter=_.stoken(":");g.whiteSpace=_.rtoken(/^\s*/);g.generalDelimiter=_.rtoken(/^(([\s\,]|at|@|on)+)/);var _C={};g.ctoken=function(keys){var fn=_C[keys];if(!fn){var c=$C.regexPatterns;var kx=keys.split(/\s+/),px=[];for(var i=0;i<kx.length;i++){px.push(_.replace(_.rtoken(c[kx[i]]),kx[i]));}
fn=_C[keys]=_.any.apply(null,px);}
return fn;};g.ctoken2=function(key){return _.rtoken($C.regexPatterns[key]);};g.h=_.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2]|[1-9])/),t.hour));g.hh=_.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2])/),t.hour));g.H=_.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3]|[0-9])/),t.hour));g.HH=_.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3])/),t.hour));g.m=_.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/),t.minute));g.mm=_.cache(_.process(_.rtoken(/^[0-5][0-9]/),t.minute));g.s=_.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/),t.second));g.ss=_.cache(_.process(_.rtoken(/^[0-5][0-9]/),t.second));g.hms=_.cache(_.sequence([g.H,g.m,g.s],g.timePartDelimiter));g.t=_.cache(_.process(g.ctoken2("shortMeridian"),t.meridian));g.tt=_.cache(_.process(g.ctoken2("longMeridian"),t.meridian));g.z=_.cache(_.process(_.rtoken(/^((\+|\-)\s*\d\d\d\d)|((\+|\-)\d\d\:?\d\d)/),t.timezone));g.zz=_.cache(_.process(_.rtoken(/^((\+|\-)\s*\d\d\d\d)|((\+|\-)\d\d\:?\d\d)/),t.timezone));g.zzz=_.cache(_.process(g.ctoken2("timezone"),t.timezone));g.timeSuffix=_.each(_.ignore(g.whiteSpace),_.set([g.tt,g.zzz]));g.time=_.each(_.optional(_.ignore(_.stoken("T"))),g.hms,g.timeSuffix);g.d=_.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1]|\d)/),_.optional(g.ctoken2("ordinalSuffix"))),t.day));g.dd=_.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1])/),_.optional(g.ctoken2("ordinalSuffix"))),t.day));g.ddd=g.dddd=_.cache(_.process(g.ctoken("sun mon tue wed thu fri sat"),function(s){return function(){this.weekday=s;};}));g.M=_.cache(_.process(_.rtoken(/^(1[0-2]|0\d|\d)/),t.month));g.MM=_.cache(_.process(_.rtoken(/^(1[0-2]|0\d)/),t.month));g.MMM=g.MMMM=_.cache(_.process(g.ctoken("jan feb mar apr may jun jul aug sep oct nov dec"),t.month));g.y=_.cache(_.process(_.rtoken(/^(\d\d?)/),t.year));g.yy=_.cache(_.process(_.rtoken(/^(\d\d)/),t.year));g.yyy=_.cache(_.process(_.rtoken(/^(\d\d?\d?\d?)/),t.year));g.yyyy=_.cache(_.process(_.rtoken(/^(\d\d\d\d)/),t.year));_fn=function(){return _.each(_.any.apply(null,arguments),_.not(g.ctoken2("timeContext")));};g.day=_fn(g.d,g.dd);g.month=_fn(g.M,g.MMM);g.year=_fn(g.yyyy,g.yy);g.orientation=_.process(g.ctoken("past future"),function(s){return function(){this.orient=s;};});g.operator=_.process(g.ctoken("add subtract"),function(s){return function(){this.operator=s;};});g.rday=_.process(g.ctoken("yesterday tomorrow today now"),t.rday);g.unit=_.process(g.ctoken("second minute hour day week month year"),function(s){return function(){this.unit=s;};});g.value=_.process(_.rtoken(/^\d\d?(st|nd|rd|th)?/),function(s){return function(){this.value=s.replace(/\D/g,"");};});g.expression=_.set([g.rday,g.operator,g.value,g.unit,g.orientation,g.ddd,g.MMM]);_fn=function(){return _.set(arguments,g.datePartDelimiter);};g.mdy=_fn(g.ddd,g.month,g.day,g.year);g.ymd=_fn(g.ddd,g.year,g.month,g.day);g.dmy=_fn(g.ddd,g.day,g.month,g.year);g.date=function(s){return((g[$C.dateElementOrder]||g.mdy).call(this,s));};g.format=_.process(_.many(_.any(_.process(_.rtoken(/^(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?)/),function(fmt){if(g[fmt]){return g[fmt];}else{throw $D.Parsing.Exception(fmt);}}),_.process(_.rtoken(/^[^dMyhHmstz]+/),function(s){return _.ignore(_.stoken(s));}))),function(rules){return _.process(_.each.apply(null,rules),t.finishExact);});var _F={};var _get=function(f){return _F[f]=(_F[f]||g.format(f)[0]);};g.formats=function(fx){if(fx instanceof Array){var rx=[];for(var i=0;i<fx.length;i++){rx.push(_get(fx[i]));}
return _.any.apply(null,rx);}else{return _get(fx);}};g._formats=g.formats(["\"yyyy-MM-ddTHH:mm:ssZ\"","yyyy-MM-ddTHH:mm:ssZ","yyyy-MM-ddTHH:mm:ssz","yyyy-MM-ddTHH:mm:ss","yyyy-MM-ddTHH:mmZ","yyyy-MM-ddTHH:mmz","yyyy-MM-ddTHH:mm","ddd, MMM dd, yyyy H:mm:ss tt","ddd MMM d yyyy HH:mm:ss zzz","MMddyyyy","ddMMyyyy","Mddyyyy","ddMyyyy","Mdyyyy","dMyyyy","yyyy","Mdyy","dMyy","d"]);g._start=_.process(_.set([g.date,g.time,g.expression],g.generalDelimiter,g.whiteSpace),t.finish);g.start=function(s){try{var r=g._formats.call({},s);if(r[1].length===0){return r;}}catch(e){}
return g._start.call({},s);};$D._parse=$D.parse;$D.parse=function(s){var r=null;if(!s){return null;}
if(s instanceof Date){return s;}
try{r=$D.Grammar.start.call({},s.replace(/^\s*(\S*(\s+\S+)*)\s*$/,"$1"));}catch(e){return null;}
return((r[1].length===0)?r[0]:null);};$D.getParseFunction=function(fx){var fn=$D.Grammar.formats(fx);return function(s){var r=null;try{r=fn.call({},s);}catch(e){return null;}
return((r[1].length===0)?r[0]:null);};};$D.parseExact=function(s,fx){return $D.getParseFunction(fx)(s);};}());
/**
 * @version: 1.0 Alpha-1
 * @author: Coolite Inc. http://www.coolite.com/
 * @date: 2008-04-13
 * @copyright: Copyright (c) 2006-2008, Coolite Inc. (http://www.coolite.com/). All rights reserved.
 * @license: Licensed under The MIT License. See license.txt and http://www.datejs.com/license/.
 * @website: http://www.datejs.com/
 */

( function()
{
   var $D = Date, $P = $D.prototype, $C = $D.CultureInfo, $f = [], p = function(s, l)
   {
      if(!l)
      {
         l = 2;
      }
      return ("000" + s).slice(l * -1);
   };
   /**
    * Converts a PHP format string to Java/.NET format string.
    * A PHP format string can be used with .$format or .format.
    * A Java/.NET format string can be used with .toString().
    * The .parseExact function will only accept a Java/.NET format string
    *
    * Example
    <pre>
    var f1 = "%m/%d/%y"
    var f2 = Date.normalizeFormat(f1); // "MM/dd/yy"

    new Date().format(f1);    // "04/13/08"
    new Date().$format(f1);   // "04/13/08"
    new Date().toString(f2);  // "04/13/08"

    var date = Date.parseExact("04/13/08", f2); // Sun Apr 13 2008
    </pre>
    * @param {String}   A PHP format string consisting of one or more format spcifiers.
    * @return {String}  The PHP format converted to a Java/.NET format string.
    */
   $D.normalizeFormat = function(format)
   {
      $f = [];
      var t = new Date().$format(format);
      return $f.join("");
   };
   /**
    * Format a local Unix timestamp according to locale settings
    *
    * Example
    <pre>
    Date.strftime("%m/%d/%y", new Date());       // "04/13/08"
    Date.strftime("c", "2008-04-13T17:52:03Z");  // "04/13/08"
    </pre>
    * @param {String}   A format string consisting of one or more format spcifiers [Optional].
    * @param {Number}   The number representing the number of seconds that have elapsed since January 1, 1970 (local time).
    * @return {String}  A string representation of the current Date object.
    */
   $D.strftime = function(format, time)
   {
      return new Date(time * 1000).$format(format);
   };
   /**
    * Parse any textual datetime description into a Unix timestamp.
    * A Unix timestamp is the number of seconds that have elapsed since January 1, 1970 (midnight UTC/GMT).
    *
    * Example
    <pre>
    Date.strtotime("04/13/08");              // 1208044800
    Date.strtotime("1970-01-01T00:00:00Z");  // 0
    </pre>
    * @param {String}   A format string consisting of one or more format spcifiers [Optional].
    * @param {Object}   A string or date object.
    * @return {String}  A string representation of the current Date object.
    */
   $D.strtotime = function(time)
   {
      var d = $D.parse(time);
      d.addMinutes(d.getTimezoneOffset() * -1);
      return Math.round($D.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()) / 1000);
   };
   /**
    * Converts the value of the current Date object to its equivalent string representation using a PHP/Unix style of date format
    * specifiers.
    *
    * The following descriptions are from http://www.php.net/strftime and http://www.php.net/manual/en/function.date.php.
    * Copyright © 2001-2008 The PHP Group
    *
    * Format Specifiers
    <pre>
    Format  Description                                                                  Example
    ------  ---------------------------------------------------------------------------  -----------------------
    %a     abbreviated weekday name according to the current localed                    "Mon" through "Sun"
    %A     full weekday name according to the current locale                            "Sunday" through "Saturday"
    %b     abbreviated month name according to the current locale                       "Jan" through "Dec"
    %B     full month name according to the current locale                              "January" through "December"
    %c     preferred date and time representation for the current locale                "4/13/2008 12:33 PM"
    %C     century number (the year divided by 100 and truncated to an integer)         "00" to "99"
    %d     day of the month as a decimal number                                         "01" to "31"
    %D     same as %m/%d/%y                                                             "04/13/08"
    %e     day of the month as a decimal number, a single digit is preceded by a space  "1" to "31"
    %g     like %G, but without the century                                             "08"
    %G     The 4-digit year corresponding to the ISO week number (see %V).              "2008"
    This has the same format and value as %Y, except that if the ISO week number
    belongs to the previous or next year, that year is used instead.
    %h     same as %b                                                                   "Jan" through "Dec"
    %H     hour as a decimal number using a 24-hour clock                               "00" to "23"
    %I     hour as a decimal number using a 12-hour clock                               "01" to "12"
    %j     day of the year as a decimal number                                          "001" to "366"
    %m     month as a decimal number                                                    "01" to "12"
    %M     minute as a decimal number                                                   "00" to "59"
    %n     newline character                                                            "\n"
    %p     either "am" or "pm" according to the given time value, or the                "am" or "pm"
    corresponding strings for the current locale
    %r     time in a.m. and p.m. notation                                               "8:44 PM"
    %R     time in 24 hour notation                                                     "20:44"
    %S     second as a decimal number                                                   "00" to "59"
    %t     tab character                                                                "\t"
    %T     current time, equal to %H:%M:%S                                              "12:49:11"
    %u     weekday as a decimal number ["1", "7"], with "1" representing Monday         "1" to "7"
    %U     week number of the current year as a decimal number, starting with the       "0" to ("52" or "53")
    first Sunday as the first day of the first week
    %V     The ISO 8601:1988 week number of the current year as a decimal number,       "00" to ("52" or "53")
    range 01 to 53, where week 1 is the first week that has at least 4 days
    in the current year, and with Monday as the first day of the week.
    (Use %G or %g for the year component that corresponds to the week number
    for the specified timestamp.)
    %W     week number of the current year as a decimal number, starting with the       "00" to ("52" or "53")
    first Monday as the first day of the first week
    %w     day of the week as a decimal, Sunday being "0"                               "0" to "6"
    %x     preferred date representation for the current locale without the time        "4/13/2008"
    %X     preferred time representation for the current locale without the date        "12:53:05"
    %y     year as a decimal number without a century                                   "00" "99"
    %Y     year as a decimal number including the century                               "2008"
    %Z     time zone or name or abbreviation                                            "UTC", "EST", "PST"
    %z     same as %Z
    %%     a literal "%" character                                                      "%"

    d      Day of the month, 2 digits with leading zeros                                "01" to "31"
    D      A textual representation of a day, three letters                             "Mon" through "Sun"
    j      Day of the month without leading zeros                                       "1" to "31"
    l      A full textual representation of the day of the week (lowercase "L")         "Sunday" through "Saturday"
    N      ISO-8601 numeric representation of the day of the week (added in PHP 5.1.0)  "1" (for Monday) through "7" (for Sunday)
    S      English ordinal suffix for the day of the month, 2 characters                "st", "nd", "rd" or "th". Works well with j
    w      Numeric representation of the day of the week                                "0" (for Sunday) through "6" (for Saturday)
    z      The day of the year (starting from "0")                                      "0" through "365"
    W      ISO-8601 week number of year, weeks starting on Monday                       "00" to ("52" or "53")
    F      A full textual representation of a month, such as January or March           "January" through "December"
    m      Numeric representation of a month, with leading zeros                        "01" through "12"
    M      A short textual representation of a month, three letters                     "Jan" through "Dec"
    n      Numeric representation of a month, without leading zeros                     "1" through "12"
    t      Number of days in the given month                                            "28" through "31"
    L      Whether it's a leap year                                                     "1" if it is a leap year, "0" otherwise
    o      ISO-8601 year number. This has the same value as Y, except that if the       "2008"
    ISO week number (W) belongs to the previous or next year, that year
    is used instead.
    Y      A full numeric representation of a year, 4 digits                            "2008"
    y      A two digit representation of a year                                         "08"
    a      Lowercase Ante meridiem and Post meridiem                                    "am" or "pm"
    A      Uppercase Ante meridiem and Post meridiem                                    "AM" or "PM"
    B      Swatch Internet time                                                         "000" through "999"
    g      12-hour format of an hour without leading zeros                              "1" through "12"
    G      24-hour format of an hour without leading zeros                              "0" through "23"
    h      12-hour format of an hour with leading zeros                                 "01" through "12"
    H      24-hour format of an hour with leading zeros                                 "00" through "23"
    i      Minutes with leading zeros                                                   "00" to "59"
    s      Seconds, with leading zeros                                                  "00" through "59"
    u      Milliseconds                                                                 "54321"
    e      Timezone identifier                                                          "UTC", "EST", "PST"
    I      Whether or not the date is in daylight saving time (uppercase i)             "1" if Daylight Saving Time, "0" otherwise
    O      Difference to Greenwich time (GMT) in hours                                  "+0200", "-0600"
    P      Difference to Greenwich time (GMT) with colon between hours and minutes      "+02:00", "-06:00"
    T      Timezone abbreviation                                                        "UTC", "EST", "PST"
    Z      Timezone offset in seconds. The offset for timezones west of UTC is          "-43200" through "50400"
    always negative, and for those east of UTC is always positive.
    c      ISO 8601 date                                                                "2004-02-12T15:19:21+00:00"
    r      RFC 2822 formatted date                                                      "Thu, 21 Dec 2000 16:01:07 +0200"
    U      Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)                   "0"
    </pre>
    * @param {String}   A format string consisting of one or more format spcifiers [Optional].
    * @return {String}  A string representation of the current Date object.
    */
   $P.$format = function(format)
   {
      var x = this, y, t = function(v)
      {
         $f.push(v);
         return x.toString(v);
      };
      return format ? format.replace(/(%|\\)?.|%%/g, function(m)
      {
         if(m.charAt(0) === "\\" || m.substring(0, 2) === "%%")
         {
            return m.replace("\\", "").replace("%%", "%");
         }
         switch (m)
         {
            case "d":
            case "%d":
               return t("dd");
            case "D":
            case "%a":
               return t("ddd");
            case "j":
            case "%e":
               return t("d");
            case "l":
            case "%A":
               return t("dddd");
            case "N":
            case "%u":
               return x.getDay() + 1;
            case "S":
               return t("S");
            case "w":
            case "%w":
               return x.getDay();
            case "z":
               return x.getOrdinalNumber();
            case "%j":
               return p(x.getOrdinalNumber(), 3);
            case "%U":
               var d1 = x.clone().set(
               {
                  month : 0,
                  day : 1
               }).addDays(-1).moveToDayOfWeek(0), d2 = x.clone().addDays(1).moveToDayOfWeek(0, -1);
               return (d2 < d1) ? "00" : p((d2.getOrdinalNumber() - d1.getOrdinalNumber()) / 7 + 1);
            case "W":
            case "%V":
               return x.getISOWeek();
            case "%W":
               return p(x.getWeek());
            case "F":
            case "%B":
               return t("MMMM");
            case "m":
            case "%m":
               return t("MM");
            case "M":
            case "%b":
            case "%h":
               return t("MMM");
            case "n":
               return t("M");
            case "t":
               return $D.getDaysInMonth(x.getFullYear(), x.getMonth());
            case "L":
               return ($D.isLeapYear(x.getFullYear())) ? 1 : 0;
            case "o":
            case "%G":
               return x.setWeek(x.getISOWeek()).toString("yyyy");
            case "%g":
               return x.$format("%G").slice(-2);
            case "Y":
            case "%Y":
               return t("yyyy");
            case "y":
            case "%y":
               return t("yy");
            case "a":
            case "%p":
               return t("tt").toLowerCase();
            case "A":
               return t("tt").toUpperCase();
            case "g":
            case "%I":
               return t("h");
            case "G":
               return t("H");
            case "h":
               return t("hh");
            case "H":
            case "%H":
               return t("HH");
            case "i":
            case "%M":
               return t("mm");
            case "s":
            case "%S":
               return t("ss");
            case "u":
               return p(x.getMilliseconds(), 3);
            case "I":
               return (x.isDaylightSavingTime()) ? 1 : 0;
            case "O":
               return x.getUTCOffset();
            case "P":
               y = x.getUTCOffset();
               return y.substring(0, y.length - 2) + ":" + y.substring(y.length - 2);
            case "e":
            case "T":
            case "%z":
            case "%Z":
               return x.getTimezone();
            case "Z":
               return x.getTimezoneOffset() * -60;
            case "B":
               var now = new Date();
               return Math.floor(((now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds() + (now.getTimezoneOffset() + 60) * 60) / 86.4);
            case "c":
               return x.toISOString().replace(/\"/g, "");
            case "U":
               return $D.strtotime("now");
            case "%c":
               return t("d") + " " + t("t");
            case "%C":
               return Math.floor(x.getFullYear() / 100 + 1);
            case "%D":
               return t("MM/dd/yy");
            case "%n":
               return "\\n";
            case "%t":
               return "\\t";
            case "%r":
               return t("hh:mm tt");
            case "%R":
               return t("H:mm");
            case "%T":
               return t("H:mm:ss");
            case "%x":
               return t("d");
            case "%X":
               return t("t");
            default:
               $f.push(m);
               return m;
         }
      }) : this._toString();
   };
   if(!$P.format)
   {
      $P.format = $P.$format;
   }
}());
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//	http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//	http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var QRCode = function() {

	//---------------------------------------------------------------------
	// qrcode
	//---------------------------------------------------------------------

	/**
	 * qrcode
	 * @param typeNumber 1 to 10
	 * @param errorCorrectLevel 'L','M','Q','H'
	 */
	var qrcode = function(typeNumber, errorCorrectLevel) {

		var PAD0 = 0xEC;
		var PAD1 = 0x11;

		var _typeNumber = typeNumber;
		var _errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
		var _modules = null;
		var _moduleCount = 0;
		var _dataCache = null;
		var _dataList = new Array();

		var _this = {};

		var makeImpl = function(test, maskPattern) {

			_moduleCount = _typeNumber * 4 + 17;
			_modules = function(moduleCount) {
				var modules = new Array(moduleCount);
				for (var row = 0; row < moduleCount; row += 1) {
					modules[row] = new Array(moduleCount);
					for (var col = 0; col < moduleCount; col += 1) {
						modules[row][col] = null;
					}
				}
				return modules;
			}(_moduleCount);

			setupPositionProbePattern(0, 0);
			setupPositionProbePattern(_moduleCount - 7, 0);
			setupPositionProbePattern(0, _moduleCount - 7);
			setupPositionAdjustPattern();
			setupTimingPattern();
			setupTypeInfo(test, maskPattern);

			if (_typeNumber >= 7) {
				setupTypeNumber(test);
			}

			if (_dataCache == null) {
				_dataCache = createData(_typeNumber, _errorCorrectLevel, _dataList);
			}

			mapData(_dataCache, maskPattern);
		};

		var setupPositionProbePattern = function(row, col) {

			for (var r = -1; r <= 7; r += 1) {

				if (row + r <= -1 || _moduleCount <= row + r) continue;

				for (var c = -1; c <= 7; c += 1) {

					if (col + c <= -1 || _moduleCount <= col + c) continue;

					if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
							|| (0 <= c && c <= 6 && (r == 0 || r == 6) )
							|| (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
						_modules[row + r][col + c] = true;
					} else {
						_modules[row + r][col + c] = false;
					}
				}
			}
		};

		var getBestMaskPattern = function() {

			var minLostPoint = 0;
			var pattern = 0;

			for (var i = 0; i < 8; i += 1) {

				makeImpl(true, i);

				var lostPoint = QRUtil.getLostPoint(_this);

				if (i == 0 || minLostPoint > lostPoint) {
					minLostPoint = lostPoint;
					pattern = i;
				}
			}

			return pattern;
		};

		var setupTimingPattern = function() {

			for (var r = 8; r < _moduleCount - 8; r += 1) {
				if (_modules[r][6] != null) {
					continue;
				}
				_modules[r][6] = (r % 2 == 0);
			}

			for (var c = 8; c < _moduleCount - 8; c += 1) {
				if (_modules[6][c] != null) {
					continue;
				}
				_modules[6][c] = (c % 2 == 0);
			}
		};

		var setupPositionAdjustPattern = function() {

			var pos = QRUtil.getPatternPosition(_typeNumber);

			for (var i = 0; i < pos.length; i += 1) {

				for (var j = 0; j < pos.length; j += 1) {

					var row = pos[i];
					var col = pos[j];

					if (_modules[row][col] != null) {
						continue;
					}

					for (var r = -2; r <= 2; r += 1) {

						for (var c = -2; c <= 2; c += 1) {

							if (r == -2 || r == 2 || c == -2 || c == 2
									|| (r == 0 && c == 0) ) {
								_modules[row + r][col + c] = true;
							} else {
								_modules[row + r][col + c] = false;
							}
						}
					}
				}
			}
		};

		var setupTypeNumber = function(test) {

			var bits = QRUtil.getBCHTypeNumber(_typeNumber);

			for (var i = 0; i < 18; i += 1) {
				var mod = (!test && ( (bits >> i) & 1) == 1);
				_modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
			}

			for (var i = 0; i < 18; i += 1) {
				var mod = (!test && ( (bits >> i) & 1) == 1);
				_modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
			}
		};

		var setupTypeInfo = function(test, maskPattern) {

			var data = (_errorCorrectLevel << 3) | maskPattern;
			var bits = QRUtil.getBCHTypeInfo(data);

			// vertical
			for (var i = 0; i < 15; i += 1) {

				var mod = (!test && ( (bits >> i) & 1) == 1);

				if (i < 6) {
					_modules[i][8] = mod;
				} else if (i < 8) {
					_modules[i + 1][8] = mod;
				} else {
					_modules[_moduleCount - 15 + i][8] = mod;
				}
			}

			// horizontal
			for (var i = 0; i < 15; i += 1) {

				var mod = (!test && ( (bits >> i) & 1) == 1);

				if (i < 8) {
					_modules[8][_moduleCount - i - 1] = mod;
				} else if (i < 9) {
					_modules[8][15 - i - 1 + 1] = mod;
				} else {
					_modules[8][15 - i - 1] = mod;
				}
			}

			// fixed module
			_modules[_moduleCount - 8][8] = (!test);
		};

		var mapData = function(data, maskPattern) {

			var inc = -1;
			var row = _moduleCount - 1;
			var bitIndex = 7;
			var byteIndex = 0;
			var maskFunc = QRUtil.getMaskFunction(maskPattern);

			for (var col = _moduleCount - 1; col > 0; col -= 2) {

				if (col == 6) col -= 1;

				while (true) {

					for (var c = 0; c < 2; c += 1) {

						if (_modules[row][col - c] == null) {

							var dark = false;

							if (byteIndex < data.length) {
								dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
							}

							var mask = maskFunc(row, col - c);

							if (mask) {
								dark = !dark;
							}

							_modules[row][col - c] = dark;
							bitIndex -= 1;

							if (bitIndex == -1) {
								byteIndex += 1;
								bitIndex = 7;
							}
						}
					}

					row += inc;

					if (row < 0 || _moduleCount <= row) {
						row -= inc;
						inc = -inc;
						break;
					}
				}
			}
		};

		var createBytes = function(buffer, rsBlocks) {

			var offset = 0;

			var maxDcCount = 0;
			var maxEcCount = 0;

			var dcdata = new Array(rsBlocks.length);
			var ecdata = new Array(rsBlocks.length);

			for (var r = 0; r < rsBlocks.length; r += 1) {

				var dcCount = rsBlocks[r].dataCount;
				var ecCount = rsBlocks[r].totalCount - dcCount;

				maxDcCount = Math.max(maxDcCount, dcCount);
				maxEcCount = Math.max(maxEcCount, ecCount);

				dcdata[r] = new Array(dcCount);

				for (var i = 0; i < dcdata[r].length; i += 1) {
					dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
				}
				offset += dcCount;

				var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
				var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

				var modPoly = rawPoly.mod(rsPoly);
				ecdata[r] = new Array(rsPoly.getLength() - 1);
				for (var i = 0; i < ecdata[r].length; i += 1) {
					var modIndex = i + modPoly.getLength() - ecdata[r].length;
					ecdata[r][i] = (modIndex >= 0)? modPoly.get(modIndex) : 0;
				}
			}

			var totalCodeCount = 0;
			for (var i = 0; i < rsBlocks.length; i += 1) {
				totalCodeCount += rsBlocks[i].totalCount;
			}

			var data = new Array(totalCodeCount);
			var index = 0;

			for (var i = 0; i < maxDcCount; i += 1) {
				for (var r = 0; r < rsBlocks.length; r += 1) {
					if (i < dcdata[r].length) {
						data[index] = dcdata[r][i];
						index += 1;
					}
				}
			}

			for (var i = 0; i < maxEcCount; i += 1) {
				for (var r = 0; r < rsBlocks.length; r += 1) {
					if (i < ecdata[r].length) {
						data[index] = ecdata[r][i];
						index += 1;
					}
				}
			}

			return data;
		};

		var createData = function(typeNumber, errorCorrectLevel, dataList) {

			var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

			var buffer = qrBitBuffer();

			for (var i = 0; i < dataList.length; i += 1) {
				var data = dataList[i];
				buffer.put(data.getMode(), 4);
				buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
				data.write(buffer);
			}

			// calc num max data.
			var totalDataCount = 0;
			for (var i = 0; i < rsBlocks.length; i += 1) {
				totalDataCount += rsBlocks[i].dataCount;
			}

			if (buffer.getLengthInBits() > totalDataCount * 8) {
				throw new Error('code length overflow. ('
					+ buffer.getLengthInBits()
					+ '>'
					+ totalDataCount * 8
					+ ')');
			}

			// end code
			if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
				buffer.put(0, 4);
			}

			// padding
			while (buffer.getLengthInBits() % 8 != 0) {
				buffer.putBit(false);
			}

			// padding
			while (true) {

				if (buffer.getLengthInBits() >= totalDataCount * 8) {
					break;
				}
				buffer.put(PAD0, 8);

				if (buffer.getLengthInBits() >= totalDataCount * 8) {
					break;
				}
				buffer.put(PAD1, 8);
			}

			return createBytes(buffer, rsBlocks);
		};

		_this.addData = function(data) {
			var newData = qr8BitByte(data);
			_dataList.push(newData);
			_dataCache = null;
		};

		_this.isDark = function(row, col) {
			if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
				throw new Error(row + ',' + col);
			}
			return _modules[row][col];
		};

		_this.getModuleCount = function() {
			return _moduleCount;
		};

		_this.make = function() {
			makeImpl(false, getBestMaskPattern() );
		};

		_this.createTableTag = function(cellSize, margin) {

			cellSize = cellSize || 2;
			margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

			var qrHtml = '';

			qrHtml += '<table style="';
			qrHtml += ' border-width: 0px; border-style: none;';
			qrHtml += ' border-collapse: collapse;';
			qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
			qrHtml += '">';
			qrHtml += '<tbody>';

			for (var r = 0; r < _this.getModuleCount(); r += 1) {

				qrHtml += '<tr>';

				for (var c = 0; c < _this.getModuleCount(); c += 1) {
					qrHtml += '<td style="';
					qrHtml += ' border-width: 0px; border-style: none;';
					qrHtml += ' border-collapse: collapse;';
					qrHtml += ' padding: 0px; margin: 0px;';
					qrHtml += ' width: ' + cellSize + 'px;';
					qrHtml += ' height: ' + cellSize + 'px;';
					qrHtml += ' background-color: ';
					qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
					qrHtml += ';';
					qrHtml += '"/>';
				}

				qrHtml += '</tr>';
			}

			qrHtml += '</tbody>';
			qrHtml += '</table>';

			return qrHtml;
		};

		_this.createImgTag = function(cellSize, margin) {

			cellSize = cellSize || 2;
			margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

			var size = _this.getModuleCount() * cellSize + margin * 2;
			var min = margin;
			var max = size - margin;

			return createImgTag(size, size, function(x, y) {
				if (min <= x && x < max && min <= y && y < max) {
					var c = Math.floor( (x - min) / cellSize);
					var r = Math.floor( (y - min) / cellSize);
					return _this.isDark(r, c)? 0 : 1;
				} else {
					return 1;
				}
			} );
		};

      _this.createBase64 = function(cellSize, margin) {

         cellSize = cellSize || 2;
         margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

         var size = _this.getModuleCount() * cellSize + margin * 2;
         var min = margin;
         var max = size - margin;

         return [createBase64(size, size, function(x, y) {
            if (min <= x && x < max && min <= y && y < max) {
               var c = Math.floor( (x - min) / cellSize);
               var r = Math.floor( (y - min) / cellSize);
               return _this.isDark(r, c)? 0 : 1;
            } else {
               return 1;
            }
         } ),size];
      };
      
		return _this;
	};

	//---------------------------------------------------------------------
	// qrcode.stringToBytes
	//---------------------------------------------------------------------

	qrcode.stringToBytes = function(s) {
		var bytes = new Array();
		for (var i = 0; i < s.length; i += 1) {
			var c = s.charCodeAt(i);
			bytes.push(c & 0xff);
		}
		return bytes;
	};

	//---------------------------------------------------------------------
	// qrcode.createStringToBytes
	//---------------------------------------------------------------------

	/**
	 * @param unicodeData base64 string of byte array.
	 * [16bit Unicode],[16bit Bytes], ...
	 * @param numChars
	 */
	qrcode.createStringToBytes = function(unicodeData, numChars) {

		// create conversion map.

		var unicodeMap = function() {

			var bin = base64DecodeInputStream(unicodeData);
			var read = function() {
				var b = bin.read();
				if (b == -1) throw new Error();
				return b;
			};

			var count = 0;
			var unicodeMap = {};
			while (true) {
				var b0 = bin.read();
				if (b0 == -1) break;
				var b1 = read();
				var b2 = read();
				var b3 = read();
				var k = String.fromCharCode( (b0 << 8) | b1);
				var v = (b2 << 8) | b3;
				unicodeMap[k] = v;
				count += 1;
			}
			if (count != numChars) {
				throw new Error(count + ' != ' + numChars);
			}

			return unicodeMap;
		}();

		var unknownChar = '?'.charCodeAt(0);

		return function(s) {
			var bytes = new Array();
			for (var i = 0; i < s.length; i += 1) {
				var c = s.charCodeAt(i);
				if (c < 128) {
					bytes.push(c);
				} else {
					var b = unicodeMap[s.charAt(i)];
					if (typeof b == 'number') {
						if ( (b & 0xff) == b) {
							// 1byte
							bytes.push(b);
						} else {
							// 2bytes
							bytes.push(b >>> 8);
							bytes.push(b & 0xff);
						}
					} else {
						bytes.push(unknownChar);
					}
				}
			}
			return bytes;
		};
	};

	//---------------------------------------------------------------------
	// QRMode
	//---------------------------------------------------------------------

	var QRMode = {
		MODE_NUMBER :		1 << 0,
		MODE_ALPHA_NUM : 	1 << 1,
		MODE_8BIT_BYTE : 	1 << 2,
		MODE_KANJI :		1 << 3
	};

	//---------------------------------------------------------------------
	// QRErrorCorrectLevel
	//---------------------------------------------------------------------

	var QRErrorCorrectLevel = {
		L : 1,
		M : 0,
		Q : 3,
		H : 2
	};

	//---------------------------------------------------------------------
	// QRMaskPattern
	//---------------------------------------------------------------------

	var QRMaskPattern = {
		PATTERN000 : 0,
		PATTERN001 : 1,
		PATTERN010 : 2,
		PATTERN011 : 3,
		PATTERN100 : 4,
		PATTERN101 : 5,
		PATTERN110 : 6,
		PATTERN111 : 7
	};

	//---------------------------------------------------------------------
	// QRUtil
	//---------------------------------------------------------------------

	var QRUtil = function() {

		var PATTERN_POSITION_TABLE = [
			[],
			[6, 18],
			[6, 22],
			[6, 26],
			[6, 30],
			[6, 34],
			[6, 22, 38],
			[6, 24, 42],
			[6, 26, 46],
			[6, 28, 50],
			[6, 30, 54],
			[6, 32, 58],
			[6, 34, 62],
			[6, 26, 46, 66],
			[6, 26, 48, 70],
			[6, 26, 50, 74],
			[6, 30, 54, 78],
			[6, 30, 56, 82],
			[6, 30, 58, 86],
			[6, 34, 62, 90],
			[6, 28, 50, 72, 94],
			[6, 26, 50, 74, 98],
			[6, 30, 54, 78, 102],
			[6, 28, 54, 80, 106],
			[6, 32, 58, 84, 110],
			[6, 30, 58, 86, 114],
			[6, 34, 62, 90, 118],
			[6, 26, 50, 74, 98, 122],
			[6, 30, 54, 78, 102, 126],
			[6, 26, 52, 78, 104, 130],
			[6, 30, 56, 82, 108, 134],
			[6, 34, 60, 86, 112, 138],
			[6, 30, 58, 86, 114, 142],
			[6, 34, 62, 90, 118, 146],
			[6, 30, 54, 78, 102, 126, 150],
			[6, 24, 50, 76, 102, 128, 154],
			[6, 28, 54, 80, 106, 132, 158],
			[6, 32, 58, 84, 110, 136, 162],
			[6, 26, 54, 82, 110, 138, 166],
			[6, 30, 58, 86, 114, 142, 170]
		];
		var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
		var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
		var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

		var _this = {};

		var getBCHDigit = function(data) {
			var digit = 0;
			while (data != 0) {
				digit += 1;
				data >>>= 1;
			}
			return digit;
		};

		_this.getBCHTypeInfo = function(data) {
			var d = data << 10;
			while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
				d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
			}
			return ( (data << 10) | d) ^ G15_MASK;
		};

		_this.getBCHTypeNumber = function(data) {
			var d = data << 12;
			while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
				d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
			}
			return (data << 12) | d;
		};

		_this.getPatternPosition = function(typeNumber) {
			return PATTERN_POSITION_TABLE[typeNumber - 1];
		};

		_this.getMaskFunction = function(maskPattern) {

			switch (maskPattern) {

			case QRMaskPattern.PATTERN000 :
				return function(i, j) { return (i + j) % 2 == 0; };
			case QRMaskPattern.PATTERN001 :
				return function(i, j) { return i % 2 == 0; };
			case QRMaskPattern.PATTERN010 :
				return function(i, j) { return j % 3 == 0; };
			case QRMaskPattern.PATTERN011 :
				return function(i, j) { return (i + j) % 3 == 0; };
			case QRMaskPattern.PATTERN100 :
				return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
			case QRMaskPattern.PATTERN101 :
				return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
			case QRMaskPattern.PATTERN110 :
				return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
			case QRMaskPattern.PATTERN111 :
				return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

			default :
				throw new Error('bad maskPattern:' + maskPattern);
			}
		};

		_this.getErrorCorrectPolynomial = function(errorCorrectLength) {
			var a = qrPolynomial([1], 0);
			for (var i = 0; i < errorCorrectLength; i += 1) {
				a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
			}
			return a;
		};

		_this.getLengthInBits = function(mode, type) {

			if (1 <= type && type < 10) {

				// 1 - 9

				switch(mode) {
				case QRMode.MODE_NUMBER 	: return 10;
				case QRMode.MODE_ALPHA_NUM 	: return 9;
				case QRMode.MODE_8BIT_BYTE	: return 8;
				case QRMode.MODE_KANJI		: return 8;
				default :
					throw new Error('mode:' + mode);
				}

			} else if (type < 27) {

				// 10 - 26

				switch(mode) {
				case QRMode.MODE_NUMBER 	: return 12;
				case QRMode.MODE_ALPHA_NUM 	: return 11;
				case QRMode.MODE_8BIT_BYTE	: return 16;
				case QRMode.MODE_KANJI		: return 10;
				default :
					throw new Error('mode:' + mode);
				}

			} else if (type < 41) {

				// 27 - 40

				switch(mode) {
				case QRMode.MODE_NUMBER 	: return 14;
				case QRMode.MODE_ALPHA_NUM	: return 13;
				case QRMode.MODE_8BIT_BYTE	: return 16;
				case QRMode.MODE_KANJI		: return 12;
				default :
					throw new Error('mode:' + mode);
				}

			} else {
				throw new Error('type:' + type);
			}
		};

		_this.getLostPoint = function(qrcode) {

			var moduleCount = qrcode.getModuleCount();

			var lostPoint = 0;

			// LEVEL1

			for (var row = 0; row < moduleCount; row += 1) {
				for (var col = 0; col < moduleCount; col += 1) {

					var sameCount = 0;
					var dark = qrcode.isDark(row, col);

					for (var r = -1; r <= 1; r += 1) {

						if (row + r < 0 || moduleCount <= row + r) {
							continue;
						}

						for (var c = -1; c <= 1; c += 1) {

							if (col + c < 0 || moduleCount <= col + c) {
								continue;
							}

							if (r == 0 && c == 0) {
								continue;
							}

							if (dark == qrcode.isDark(row + r, col + c) ) {
								sameCount += 1;
							}
						}
					}

					if (sameCount > 5) {
						lostPoint += (3 + sameCount - 5);
					}
				}
			};

			// LEVEL2

			for (var row = 0; row < moduleCount - 1; row += 1) {
				for (var col = 0; col < moduleCount - 1; col += 1) {
					var count = 0;
					if (qrcode.isDark(row, col) ) count += 1;
					if (qrcode.isDark(row + 1, col) ) count += 1;
					if (qrcode.isDark(row, col + 1) ) count += 1;
					if (qrcode.isDark(row + 1, col + 1) ) count += 1;
					if (count == 0 || count == 4) {
						lostPoint += 3;
					}
				}
			}

			// LEVEL3

			for (var row = 0; row < moduleCount; row += 1) {
				for (var col = 0; col < moduleCount - 6; col += 1) {
					if (qrcode.isDark(row, col)
							&& !qrcode.isDark(row, col + 1)
							&&  qrcode.isDark(row, col + 2)
							&&  qrcode.isDark(row, col + 3)
							&&  qrcode.isDark(row, col + 4)
							&& !qrcode.isDark(row, col + 5)
							&&  qrcode.isDark(row, col + 6) ) {
						lostPoint += 40;
					}
				}
			}

			for (var col = 0; col < moduleCount; col += 1) {
				for (var row = 0; row < moduleCount - 6; row += 1) {
					if (qrcode.isDark(row, col)
							&& !qrcode.isDark(row + 1, col)
							&&  qrcode.isDark(row + 2, col)
							&&  qrcode.isDark(row + 3, col)
							&&  qrcode.isDark(row + 4, col)
							&& !qrcode.isDark(row + 5, col)
							&&  qrcode.isDark(row + 6, col) ) {
						lostPoint += 40;
					}
				}
			}

			// LEVEL4

			var darkCount = 0;

			for (var col = 0; col < moduleCount; col += 1) {
				for (var row = 0; row < moduleCount; row += 1) {
					if (qrcode.isDark(row, col) ) {
						darkCount += 1;
					}
				}
			}

			var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
			lostPoint += ratio * 10;

			return lostPoint;
		};

		return _this;
	}();

	//---------------------------------------------------------------------
	// QRMath
	//---------------------------------------------------------------------

	var QRMath = function() {

		var EXP_TABLE = new Array(256);
		var LOG_TABLE = new Array(256);

		// initialize tables
		for (var i = 0; i < 8; i += 1) {
			EXP_TABLE[i] = 1 << i;
		}
		for (var i = 8; i < 256; i += 1) {
			EXP_TABLE[i] = EXP_TABLE[i - 4]
				^ EXP_TABLE[i - 5]
				^ EXP_TABLE[i - 6]
				^ EXP_TABLE[i - 8];
		}
		for (var i = 0; i < 255; i += 1) {
			LOG_TABLE[EXP_TABLE[i] ] = i;
		}

		var _this = {};

		_this.glog = function(n) {

			if (n < 1) {
				throw new Error('glog(' + n + ')');
			}

			return LOG_TABLE[n];
		};

		_this.gexp = function(n) {

			while (n < 0) {
				n += 255;
			}

			while (n >= 256) {
				n -= 255;
			}

			return EXP_TABLE[n];
		};

		return _this;
	}();

	//---------------------------------------------------------------------
	// qrPolynomial
	//---------------------------------------------------------------------

	function qrPolynomial(num, shift) {

		if (typeof num.length == 'undefined') {
			throw new Error(num.length + '/' + shift);
		}

		var _num = function() {
			var offset = 0;
			while (offset < num.length && num[offset] == 0) {
				offset += 1;
			}
			var _num = new Array(num.length - offset + shift);
			for (var i = 0; i < num.length - offset; i += 1) {
				_num[i] = num[i + offset];
			}
			return _num;
		}();

		var _this = {};

		_this.get = function(index) {
			return _num[index];
		};

		_this.getLength = function() {
			return _num.length;
		};

		_this.multiply = function(e) {

			var num = new Array(_this.getLength() + e.getLength() - 1);

			for (var i = 0; i < _this.getLength(); i += 1) {
				for (var j = 0; j < e.getLength(); j += 1) {
					num[i + j] ^= QRMath.gexp(QRMath.glog(_this.get(i) ) + QRMath.glog(e.get(j) ) );
				}
			}

			return qrPolynomial(num, 0);
		};

		_this.mod = function(e) {

			if (_this.getLength() - e.getLength() < 0) {
				return _this;
			}

			var ratio = QRMath.glog(_this.get(0) ) - QRMath.glog(e.get(0) );

			var num = new Array(_this.getLength() );
			for (var i = 0; i < _this.getLength(); i += 1) {
				num[i] = _this.get(i);
			}

			for (var i = 0; i < e.getLength(); i += 1) {
				num[i] ^= QRMath.gexp(QRMath.glog(e.get(i) ) + ratio);
			}

			// recursive call
			return qrPolynomial(num, 0).mod(e);
		};

		return _this;
	};

	//---------------------------------------------------------------------
	// QRRSBlock
	//---------------------------------------------------------------------

	var QRRSBlock = function() {

		var RS_BLOCK_TABLE = [

			// L
			// M
			// Q
			// H

			// 1
			[1, 26, 19],
			[1, 26, 16],
			[1, 26, 13],
			[1, 26, 9],

			// 2
			[1, 44, 34],
			[1, 44, 28],
			[1, 44, 22],
			[1, 44, 16],

			// 3
			[1, 70, 55],
			[1, 70, 44],
			[2, 35, 17],
			[2, 35, 13],

			// 4
			[1, 100, 80],
			[2, 50, 32],
			[2, 50, 24],
			[4, 25, 9],

			// 5
			[1, 134, 108],
			[2, 67, 43],
			[2, 33, 15, 2, 34, 16],
			[2, 33, 11, 2, 34, 12],

			// 6
			[2, 86, 68],
			[4, 43, 27],
			[4, 43, 19],
			[4, 43, 15],

			// 7
			[2, 98, 78],
			[4, 49, 31],
			[2, 32, 14, 4, 33, 15],
			[4, 39, 13, 1, 40, 14],

			// 8
			[2, 121, 97],
			[2, 60, 38, 2, 61, 39],
			[4, 40, 18, 2, 41, 19],
			[4, 40, 14, 2, 41, 15],

			// 9
			[2, 146, 116],
			[3, 58, 36, 2, 59, 37],
			[4, 36, 16, 4, 37, 17],
			[4, 36, 12, 4, 37, 13],

			// 10
			[2, 86, 68, 2, 87, 69],
			[4, 69, 43, 1, 70, 44],
			[6, 43, 19, 2, 44, 20],
			[6, 43, 15, 2, 44, 16]
		];

		var qrRSBlock = function(totalCount, dataCount) {
			var _this = {};
			_this.totalCount = totalCount;
			_this.dataCount = dataCount;
			return _this;
		};

		var _this = {};

		var getRsBlockTable = function(typeNumber, errorCorrectLevel) {

			switch(errorCorrectLevel) {
			case QRErrorCorrectLevel.L :
				return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
			case QRErrorCorrectLevel.M :
				return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
			case QRErrorCorrectLevel.Q :
				return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
			case QRErrorCorrectLevel.H :
				return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
			default :
				return undefined;
			}
		};

		_this.getRSBlocks = function(typeNumber, errorCorrectLevel) {

			var rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);

			if (typeof rsBlock == 'undefined') {
				throw new Error('bad rs block @ typeNumber:' + typeNumber +
						'/errorCorrectLevel:' + errorCorrectLevel);
			}

			var length = rsBlock.length / 3;

			var list = new Array();

			for (var i = 0; i < length; i += 1) {

				var count = rsBlock[i * 3 + 0];
				var totalCount = rsBlock[i * 3 + 1];
				var dataCount = rsBlock[i * 3 + 2];

				for (var j = 0; j < count; j += 1) {
					list.push(qrRSBlock(totalCount, dataCount) );
				}
			}

			return list;
		};

		return _this;
	}();

	//---------------------------------------------------------------------
	// qrBitBuffer
	//---------------------------------------------------------------------

	var qrBitBuffer = function() {

		var _buffer = new Array();
		var _length = 0;

		var _this = {};

		_this.getBuffer = function() {
			return _buffer;
		};

		_this.get = function(index) {
			var bufIndex = Math.floor(index / 8);
			return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
		};

		_this.put = function(num, length) {
			for (var i = 0; i < length; i += 1) {
				_this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
			}
		};

		_this.getLengthInBits = function() {
			return _length;
		};

		_this.putBit = function(bit) {

			var bufIndex = Math.floor(_length / 8);
			if (_buffer.length <= bufIndex) {
				_buffer.push(0);
			}

			if (bit) {
				_buffer[bufIndex] |= (0x80 >>> (_length % 8) );
			}

			_length += 1;
		};

		return _this;
	};

	//---------------------------------------------------------------------
	// qr8BitByte
	//---------------------------------------------------------------------

	var qr8BitByte = function(data) {

		var _mode = QRMode.MODE_8BIT_BYTE;
		var _data = data;
		var _bytes = qrcode.stringToBytes(data);

		var _this = {};

		_this.getMode = function() {
			return _mode;
		};

		_this.getLength = function(buffer) {
			return _bytes.length;
		};

		_this.write = function(buffer) {
			for (var i = 0; i < _bytes.length; i += 1) {
				buffer.put(_bytes[i], 8);
			}
		};

		return _this;
	};

	//=====================================================================
	// GIF Support etc.
	//

	//---------------------------------------------------------------------
	// byteArrayOutputStream
	//---------------------------------------------------------------------

	var byteArrayOutputStream = function() {

		var _bytes = new Array();

		var _this = {};

		_this.writeByte = function(b) {
			_bytes.push(b & 0xff);
		};

		_this.writeShort = function(i) {
			_this.writeByte(i);
			_this.writeByte(i >>> 8);
		};

		_this.writeBytes = function(b, off, len) {
			off = off || 0;
			len = len || b.length;
			for (var i = 0; i < len; i += 1) {
				_this.writeByte(b[i + off]);
			}
		};

		_this.writeString = function(s) {
			for (var i = 0; i < s.length; i += 1) {
				_this.writeByte(s.charCodeAt(i) );
			}
		};

		_this.toByteArray = function() {
			return _bytes;
		};

		_this.toString = function() {
			var s = '';
			s += '[';
			for (var i = 0; i < _bytes.length; i += 1) {
				if (i > 0) {
					s += ',';
				}
				s += _bytes[i];
			}
			s += ']';
			return s;
		};

		return _this;
	};

	//---------------------------------------------------------------------
	// base64EncodeOutputStream
	//---------------------------------------------------------------------

	var base64EncodeOutputStream = function() {

		var _buffer = 0;
		var _buflen = 0;
		var _length = 0;
		var _base64 = '';

		var _this = {};

		var writeEncoded = function(b) {
			_base64 += String.fromCharCode(encode(b & 0x3f) );
		};

		var encode = function(n) {
			if (n < 0) {
				// error.
			} else if (n < 26) {
				return 0x41 + n;
			} else if (n < 52) {
				return 0x61 + (n - 26);
			} else if (n < 62) {
				return 0x30 + (n - 52);
			} else if (n == 62) {
				return 0x2b;
			} else if (n == 63) {
				return 0x2f;
			}
			throw new Error('n:' + n);
		};

		_this.writeByte = function(n) {

			_buffer = (_buffer << 8) | (n & 0xff);
			_buflen += 8;
			_length += 1;

			while (_buflen >= 6) {
				writeEncoded(_buffer >>> (_buflen - 6) );
				_buflen -= 6;
			}
		};

		_this.flush = function() {

			if (_buflen > 0) {
				writeEncoded(_buffer << (6 - _buflen) );
				_buffer = 0;
				_buflen = 0;
			}

			if (_length % 3 != 0) {
				// padding
				var padlen = 3 - _length % 3;
				for (var i = 0; i < padlen; i += 1) {
					_base64 += '=';
				}
			}
		};

		_this.toString = function() {
			return _base64;
		};

		return _this;
	};

	//---------------------------------------------------------------------
	// base64DecodeInputStream
	//---------------------------------------------------------------------

	var base64DecodeInputStream = function(str) {

		var _str = str;
		var _pos = 0;
		var _buffer = 0;
		var _buflen = 0;

		var _this = {};

		_this.read = function() {

			while (_buflen < 8) {

				if (_pos >= _str.length) {
					if (_buflen == 0) {
						return -1;
					}
					throw new Error('unexpected end of file./' + _buflen);
				}

				var c = _str.charAt(_pos);
				_pos += 1;

				if (c == '=') {
					_buflen = 0;
					return -1;
				} else if (c.match(/^\s$/) ) {
					// ignore if whitespace.
					continue;
				}

				_buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
				_buflen += 6;
			}

			var n = (_buffer >>> (_buflen - 8) ) & 0xff;
			_buflen -= 8;
			return n;
		};

		var decode = function(c) {
			if (0x41 <= c && c <= 0x5a) {
				return c - 0x41;
			} else if (0x61 <= c && c <= 0x7a) {
				return c - 0x61 + 26;
			} else if (0x30 <= c && c <= 0x39) {
				return c - 0x30 + 52;
			} else if (c == 0x2b) {
				return 62;
			} else if (c == 0x2f) {
				return 63;
			} else {
				throw new Error('c:' + c);
			}
		};

		return _this;
	};

	//---------------------------------------------------------------------
	// gifImage (B/W)
	//---------------------------------------------------------------------

	var gifImage = function(width, height) {

		var _width = width;
		var _height = height;
		var _data = new Array(width * height);

		var _this = {};

		_this.setPixel = function(x, y, pixel) {
			_data[y * _width + x] = pixel;
		};

		_this.write = function(out) {

			//---------------------------------
			// GIF Signature

			out.writeString('GIF87a');

			//---------------------------------
			// Screen Descriptor

			out.writeShort(_width);
			out.writeShort(_height);

			out.writeByte(0x80); // 2bit
			out.writeByte(0);
			out.writeByte(0);

			//---------------------------------
			// Global Color Map

			// black
			out.writeByte(0x00);
			out.writeByte(0x00);
			out.writeByte(0x00);

			// white
			out.writeByte(0xff);
			out.writeByte(0xff);
			out.writeByte(0xff);

			//---------------------------------
			// Image Descriptor

			out.writeString(',');
			out.writeShort(0);
			out.writeShort(0);
			out.writeShort(_width);
			out.writeShort(_height);
			out.writeByte(0);

			//---------------------------------
			// Local Color Map

			//---------------------------------
			// Raster Data

			var lzwMinCodeSize = 2;
			var raster = getLZWRaster(lzwMinCodeSize);

			out.writeByte(lzwMinCodeSize);

			var offset = 0;

			while (raster.length - offset > 255) {
				out.writeByte(255);
				out.writeBytes(raster, offset, 255);
				offset += 255;
			}

			out.writeByte(raster.length - offset);
			out.writeBytes(raster, offset, raster.length - offset);
			out.writeByte(0x00);

			//---------------------------------
			// GIF Terminator
			out.writeString(';');
		};

		var bitOutputStream = function(out) {

			var _out = out;
			var _bitLength = 0;
			var _bitBuffer = 0;

			var _this = {};

			_this.write = function(data, length) {

				if ( (data >>> length) != 0) {
					throw new Error('length over');
				}

				while (_bitLength + length >= 8) {
					_out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
					length -= (8 - _bitLength);
					data >>>= (8 - _bitLength);
					_bitBuffer = 0;
					_bitLength = 0;
				}

				_bitBuffer = (data << _bitLength) | _bitBuffer;
				_bitLength = _bitLength + length;
			};

			_this.flush = function() {
				if (_bitLength > 0) {
					_out.writeByte(_bitBuffer);
				}
			};

			return _this;
		};

		var getLZWRaster = function(lzwMinCodeSize) {

			var clearCode = 1 << lzwMinCodeSize;
			var endCode = (1 << lzwMinCodeSize) + 1;
			var bitLength = lzwMinCodeSize + 1;

			// Setup LZWTable
			var table = lzwTable();

			for (var i = 0; i < clearCode; i += 1) {
				table.add(String.fromCharCode(i) );
			}
			table.add(String.fromCharCode(clearCode) );
			table.add(String.fromCharCode(endCode) );

			var byteOut = byteArrayOutputStream();
			var bitOut = bitOutputStream(byteOut);

			// clear code
			bitOut.write(clearCode, bitLength);

			var dataIndex = 0;

			var s = String.fromCharCode(_data[dataIndex]);
			dataIndex += 1;

			while (dataIndex < _data.length) {

				var c = String.fromCharCode(_data[dataIndex]);
				dataIndex += 1;

				if (table.contains(s + c) ) {

					s = s + c;

				} else {

					bitOut.write(table.indexOf(s), bitLength);

					if (table.size() < 0xfff) {

						if (table.size() == (1 << bitLength) ) {
							bitLength += 1;
						}

						table.add(s + c);
					}

					s = c;
				}
			}

			bitOut.write(table.indexOf(s), bitLength);

			// end code
			bitOut.write(endCode, bitLength);

			bitOut.flush();

			return byteOut.toByteArray();
		};

		var lzwTable = function() {

			var _map = {};
			var _size = 0;

			var _this = {};

			_this.add = function(key) {
				if (_this.contains(key) ) {
					throw new Error('dup key:' + key);
				}
				_map[key] = _size;
				_size += 1;
			};

			_this.size = function() {
				return _size;
			};

			_this.indexOf = function(key) {
				return _map[key];
			};

			_this.contains = function(key) {
				return typeof _map[key] != 'undefined';
			};

			return _this;
		};

		return _this;
	};

   var createBase64 = function(width, height, getPixel) {

      var gif = gifImage(width, height);
      for (var y = 0; y < height; y += 1) {
         for (var x = 0; x < width; x += 1) {
            gif.setPixel(x, y, getPixel(x, y) );
         }
      }

      var b = byteArrayOutputStream();
      gif.write(b);

      var base64 = base64EncodeOutputStream();
      var bytes = b.toByteArray();
      for (var i = 0; i < bytes.length; i += 1) {
         base64.writeByte(bytes[i]);
      }
      base64.flush();

      var obj = '';
      obj += 'data:image/gif;base64,';
      obj += base64;

      return obj;
   };
   
	var createImgTag = function(width, height, getPixel, alt) {

		var base64 = createBase64(width, height, getPixel);
		var img = '';
		img += '<img';
		img += '\u0020src="';
		img += base64;
		img += '"';
		img += '\u0020width="';
		img += width;
		img += '"';
		img += '\u0020height="';
		img += height;
		img += '"';
		if (alt) {
			img += '\u0020alt="';
			img += alt;
			img += '"';
		}
		img += '/>';

		return img;
	};

	//---------------------------------------------------------------------
	// returns qrcode function.

	return qrcode;
}();
/*
 * RIFFWAVE.js v0.03 - Audio encoder for HTML5 <audio> elements.
 * Copyleft 2011 by Pedro Ladaria <pedro.ladaria at Gmail dot com>
 *
 * Public Domain
 *
 * Changelog:
 *
 * 0.01 - First release
 * 0.02 - New faster base64 encoding
 * 0.03 - Support for 16bit samples
 *
 * Notes:
 *
 * 8 bit data is unsigned: 0..255
 * 16 bit data is signed: âˆ’32,768..32,767
 *
 */

var FastBase64 =
{

   chars : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
   encLookup : [],

   Init : function()
   {
      for (var i = 0; i < 4096; i++)
      {
         this.encLookup[i] = this.chars[i >> 6] + this.chars[i & 0x3F];
      }
   },

   Encode : function(src)
   {
      var len = src.length;
      var dst = '';
      var i = 0;
      while (len > 2)
      {
         n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
         dst += this.encLookup[n >> 12] + this.encLookup[n & 0xFFF];
         len -= 3;
         i += 3;
      }
      if (len > 0)
      {
         var n1 = (src[i] & 0xFC) >> 2;
         var n2 = (src[i] & 0x03) << 4;
         if (len > 1)
            n2 |= (src[++i] & 0xF0) >> 4;
         dst += this.chars[n1];
         dst += this.chars[n2];
         if (len == 2)
         {
            var n3 = (src[i++] & 0x0F) << 2;
            n3 |= (src[i] & 0xC0) >> 6;
            dst += this.chars[n3];
         }
         if (len == 1)
            dst += '=';
         dst += '=';
      }
      return dst;
   } // end Encode
}

FastBase64.Init();

var RIFFWAVE = function(config)
{
   config = config ||
   {
   };

   this.data = [];
   // Array containing audio samples
   this.wav = [];
   // Array containing the generated wave file
   this.dataURI = '';
   // http://en.wikipedia.org/wiki/Data_URI_scheme

   this.header = Ext.apply(
   {
      // OFFS SIZE NOTES
      chunkId : [0x52, 0x49, 0x46, 0x46], // 0    4    "RIFF" = 0x52494646
      chunkSize : 0, // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
      format : [0x57, 0x41, 0x56, 0x45], // 8    4    "WAVE" = 0x57415645
      subChunk1Id : [0x66, 0x6d, 0x74, 0x20], // 12   4    "fmt " = 0x666d7420
      subChunk1Size : 16, // 16   4    16 for PCM
      audioFormat : 1, // 20   2    PCM = 1
      numChannels : 1, // 22   2    Mono = 1, Stereo = 2...
      sampleRate : 8000, // 24   4    8000, 44100...
      byteRate : 0, // 28   4    SampleRate*NumChannels*BitsPerSample/8
      blockAlign : 0, // 32   2    NumChannels*BitsPerSample/8
      bitsPerSample : 8, // 34   2    8 bits = 8, 16 bits = 16
      subChunk2Id : [0x64, 0x61, 0x74, 0x61], // 36   4    "data" = 0x64617461
      subChunk2Size : 0 // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
   }, config['header']);

   function u32ToArray(i)
   {
      return [i & 0xFF, (i >> 8) & 0xFF, (i >> 16) & 0xFF, (i >> 24) & 0xFF];
   }

   function u16ToArray(i)
   {
      return [i & 0xFF, (i >> 8) & 0xFF];
   }

   function split16bitArray(data)
   {
      var r = [];
      var j = 0;
      var len = data.length;
      for (var i = 0; i < len; i++)
      {
         r[j++] = data[i] & 0xFF;
         r[j++] = (data[i] >> 8) & 0xFF;
      }
      return r;
   }


   this.Make = function(data)
   {
      if ((config['data'] instanceof Array) || (( typeof (Int16Array) != 'undefined') && (config['data'] instanceof Int16Array)))
      {
         this.data = data;
         this.header.blockAlign = (this.header.numChannels * this.header.bitsPerSample) >> 3;
         this.header.byteRate = this.header.blockAlign * this.header.sampleRate;
         this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3);
         this.header.chunkSize = 36 + this.header.subChunk2Size;
      }
      console.debug("RIFFWAVE - " + Ext.encode(this.header));
   };
   this.MakeData = function(data)
   {
      this.wav = this.header.chunkId.concat(u32ToArray(this.header.chunkSize), this.header.format, this.header.subChunk1Id, u32ToArray(this.header.subChunk1Size), u16ToArray(this.header.audioFormat), u16ToArray(this.header.numChannels), u32ToArray(this.header.sampleRate), u32ToArray(this.header.byteRate), u16ToArray(this.header.blockAlign), u16ToArray(this.header.bitsPerSample), this.header.subChunk2Id, u32ToArray(this.header.subChunk2Size), (this.header.bitsPerSample == 16) ? split16bitArray(this.data) : this.data);
      this.dataURI = 'data:audio/wav;base64,' + FastBase64.Encode(this.wav);
   };

   if ((config['data'] instanceof Array) || (( typeof (Int16Array) != 'undefined') && (config['data'] instanceof Int16Array)))
   {
      this.Make(config['data']);
      if (!config['headerOnly'])
      {
         this.MakeData(config['data']);
      }
   }
};
// end RIFFWAVE
__initFb__ = function(_app, _appName)
{
   var app = _app;
   var buttons = [
   {
      margin : '0 0.5 0.5 0',
      text : 'Decline',
      //ui : 'decline',
      handler : function()
      {
         var me = window[_appName].fb;

         me.actions.hide();
         app.db.setLocalDBAttrib('disableFBReminderMsg', true);

         _application.getController('client' + '.Viewport').redirectTo('checkin');

         callback(onOrientationChange);
      }
   },
   {
      margin : '0 0.5 0.5 0',
      text : 'Sign In',
      ui : 'fbBlue',
      handler : function()
      {
         var me = window[_appName].fb;
         var login = _application.getController('client' + '.Login');

         me.actions.hide();
         Ext.Viewport.setMasked(null);
         login.fireEvent('facebookTap', null, null, null, null, function()
         {
            Ext.device.Notification.show(
            {
               title : me.titleMsg,
               message : me.fbPermissionFailMsg,
               buttons : ['Dismiss'],
               callback : function(button)
               {
                  login._loggingIn = false;

                  var vport = viewport.getViewport();
                  var activeItem = vport.getActiveItem();
                  if (!activeItem)
                  {
                     Ext.Viewport.setMasked(null);
                     viewport.resetView();
                     viewport.redirectTo('login');
                  }
                  else
                  {
                     //console.debug("XType:" + activeItem.getXTypes())
                  }
               }
            });
         });

         callback(onOrientationChange);
      }
   },
   {
      text : 'Skip',
      ui : 'cancel',
      handler : function()
      {
         var me = window[_appName].fb;

         me.actions.hide();
         _application.getController('client' + '.Viewport').redirectTo('main');

         callback(onOrientationChange);
      }
   }];
   var createButtons = function(orientation)
   {
      orientation = orientation || Ext.Viewport.getOrientation(), mobile = Ext.os.is('Phone') || Ext.os.is('Tablet'), landscape = (mobile && (orientation == 'landscape'));

      Ext.each(buttons, function(button, index, array)
      {
         if (index != (array.length - 1))
         {
            button['margin'] = (landscape) ? '0 0 0.5 0' : '0 0.5 0.5 0';
         }
      });
      return Ext.create('Ext.Container',
      {
         defaultUnit : 'em',
         right : landscape ? 0 : null,
         bottom : landscape ? 0 : null,
         docked : landscape ? null : 'bottom',
         tag : 'buttons',
         width : landscape ? '7.5em' : 'auto',
         layout : landscape ?
         {
            type : 'vbox',
            pack : 'end'
         } :
         {
            type : 'hbox'
         },
         defaults :
         {
            xtype : 'button',
            defaultUnit : 'em',
            height : ((landscape && (buttons.length > 2)) ? 2 : 3) + 'em',
            flex : (landscape) ? null : 1
         },
         padding : '0 1.0 0.5 1.0',
         items : buttons
      });
   };
   var onOrientationChange = function(v, newOrientation, width, height, eOpts)
   {
      var me = window[_appName].fb;

      me.actions.remove(me.actions.query('container[tag=buttons]')[0], true);
      me.actions.add(createButtons(newOrientation));
   };
   var callback = function(onOrientationChange)
   {
      var me = window[_appName].fb;
      var viewport = _application.getController('client' + '.Viewport');

      me.actions.destroy();
      delete me.actions;
      viewport.popUpInProgress = false;
      Ext.Viewport.un('orientationchange', onOrientationChange, me);
   };

   // **************************************************************************
   // Facebook API
   // **************************************************************************
   Ext.define(_appName + '.fb',
   {
      mixins : ['Ext.mixin.Observable'],
      singleton : true,
      appId : null,
      fbTimeout : 2 * 60 * 1000, // 2minute timeout period to login
      titleMsg : 'Facebook Connect',
      fbScope : ['email', 'user_birthday', 'publish_stream', 'read_friendlists', 'publish_actions'],
      fbConnectErrorMsg : 'Cannot retrive Facebook account information!',
      fbConnectRequestMsg : 'Connect your Facebook account to KICKBAK, and you will receive bonus Reward Pts on every purchase!',
      //   fbConnectRequestMsg : 'Would you like to update your Facebook Timeline?',
      fbConnectReconnectMsg : 'Connect your Facebook account to KICKBAK, and you will receive bonus Reward Pts on every purchase!',
      //fbConnectReconnectMsg : 'Please confirm to Reconnect to Facebook',
      connectingToFBMsg : function()
      {
         return ('Connecting to Facebook ...' + app.constants.addCRLF() + '(Tap to Close)');
      },
      loggingOutOfFBMsg : 'Logging out of Facebook ...',
      fbConnectFailMsg : 'Error Connecting to Facebook.',
      fbPermissionFailMsg : 'Failed to get the required access permission.',
      friendsRetrieveErrorMsg : 'You cannot retrieve your Friends List from Facebook. Login and Try Again.',
      /*
      * Clean up any Facebook cookies, otherwise, we have page loading problems
      * One set for production domain, another for developement domain
      */
      // **************************************************************************
      initialize : function()
      {
         var me = this, db = app.db.getLocalDB();

         me.appId = (app.constants.debugMode()) ? 477780595628080 : 197968780267830;
         console.log("FacebookConnect::initialize");

         if (!app.fn.isNative() && db['fbLoginInProgress'])
         {
            me.cb = Ext.decode(db['fbLoginInProgress']);
            me.setLoadMask();
            me.detectAccessToken(location.href);
         }
      },
      /**
       * Returns the app location. If we're inside an iFrame, return the top level path
       */
      currentLocation : function()
      {
         /*
          if (window.top.location.host)
          {
          return window.top.location.protocol + "//" + window.top.location.host + window.top.location.pathname
          }
          else
          {
          return window.location.protocol + "//" + window.location.host + window.location.pathname
          }
          */
         return (((app.constants.debugMode()) ? app.constants.serverHost() : 'http://m.getkickbak.com') + "/");
      },
      /**
       * The Facebook authentication URL.
       */
      redirectUrl : function()
      {
         var redirectUrl = Ext.Object.toQueryString(
         {
            redirect_uri : this.currentLocation(),
            client_id : this.appId,
            state : appName,
            response_type : 'token',
            scope : this.fbScope.toString()
         });

         if (!Ext.os.is('Android') && !Ext.os.is('iOS') && /Windows|Linux|MacOS/.test(Ext.os.name))
         {
            return "https://www.facebook.com/dialog/oauth?" + redirectUrl;
         }
         else
         {
            return "https://m.facebook.com/dialog/oauth?" + redirectUrl;
         }
      },
      createFbResponse : function(response)
      {
         var birthday = response.birthday.split('/');
         birthday = birthday[2] + "-" + birthday[0] + "-" + birthday[1];
         var params =
         {
            name : response.name,
            email : response.email,
            //facebook_email : response.email,
            facebook_id : response.id,
            facebook_uid : response.username,
            gender : (response.gender == "male") ? "m" : "f",
            birthday : birthday,
            photoURL : this.getFbProfilePhoto(response.id),
            //accessToken : FB.getAuthResponse()['accessToken']
            accessToken : app.db.getLocalDB()['access_token']
         }
         console.debug("FbResponse - [" + Ext.encode(params) + "]");

         return params;
      },
      facebook_onLogin : function(supress, message, activeConnRequired)
      {
         var me = this, refreshConn = true, db = app.db.getLocalDB();
         var connected = (db['currFbId'] > 0) && (parseInt(db['fbExpiresIn']) > 0);

         console.debug(//
         "connected = " + connected + "\n" + //
         "fbExpiresIn = " + parseInt(db['fbExpiresIn']) + "\n" + //
         "time-30min = " + ((new Date().addMinutes(-30)).getTime()) + "\n" + //
         "");

         //
         // No need, continue as before
         //
         if (connected)
         {

            var refreshConn = (!connected || //
            (connected && (parseInt(db['fbExpiresIn']) <= (new Date().addMinutes(-30)).getTime())));

            if (!activeConnRequired || (activeConnRequired && !refreshConn))
            {
               console.debug("Facebook already connected. Bypass relogin process");
               me.fireEvent('connected', db['fbResponse'], null);
               return;
            }
         }

         //
         // Acquired a new access token
         //
         me.cb =
         {
            supress : supress,
            messsage : message,
            viewName : _application.getController('client.Viewport').getViewport().getActiveItem().xtype,
            iter : 0
         }

         me.setLoadMask();

         app.db.setLocalDBAttrib('fbLoginInProgress', Ext.encode(me.cb));
         //window.top.location = me.redirectUrl();
         //
         // Open InAppBrowser
         //
         me.inAppBrowserCallback();
      },
      setLoadMask : function()
      {
         var me = this;

         Ext.Viewport.setMasked(null);
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.connectingToFBMsg(),
            listeners :
            {
               'tap' : function()
               {
                  app.db.removeLocalDBAttrib('fbLoginInProgress');
                  me.facebook_loginCallback(null);
                  Ext.Viewport.setMasked(null);
               }
            }
         });
      },
      detectAccessToken : function(url)
      {
         var me = this;

         //
         // Wait until Application is initialized
         //
         if (!_application)
         {
            Ext.defer(me.detectAccessToken, 250, me, [url]);
            return;
         }
         
         var db = app.db.getLocalDB(), viewport = _application.getController('client' + '.Viewport');

         if (url.indexOf("access_token=") >= 1)
         {
            var params = Ext.Object.fromQueryString(url.split("#")[1]);
            if (params['state'] == appName)
            {
               //console.debug("FacebookConnect::authDialog = " + Ext.encode(params));
               me.code = db['access_token'] = params['access_token'] || params['token'];
               db['fbExpiresIn'] = (new Date(Date.now() + Number(params['expires_in']))).getTime();
               //console.debug("FacebookConnect::access_token=" + db['access_token']);
               //console.debug("FacebookConnect::fbExpiresIn=" + db['fbExpiresIn']);
               app.db.setLocalDB(db);

               if (!app.fn.isNative())
               {
                  var callback = function(p, op)
                  {
                     app.db.removeLocalDBAttrib('fbLoginInProgress');
                     app.fb.un('connected', callback);
                     app.fb.un('unauthorized', callback);
                     app.fb.un('exception', callback);

                     var origin = me.cb ||
                     {
                     };
                     console.log("Originated from - " + origin['viewName']);
                     switch(origin['viewName'])
                     {
                        case 'createaccountpageview' :
                        {
                           viewport.redirectTo('createAccount');
                           break;
                        }
                        case "signinpageview" :
                        {
                           viewport.redirectTo('signin');
                           break;
                        }
                        case 'clientsettingspageview' :
                        {
                           viewport.redirectTo('settings');
                           break;
                        }
                        case "loginpageview" :
                        {
                           delete me.cb;
                           _application.getController('client' + '.Login').onFacebookLoginCallback(p, op);
                           break;
                        }
                        default :
                           viewport.redirectTo('signup');
                           break;
                     }
                     delete me.cb;
                  };

                  app.fb.on('connected', callback);
                  app.fb.on('unauthorized', callback);
                  app.fb.on('exception', callback);

                  //location.hash = "#";
                  me.accessTokenCallback();
               }
            }
            else
            {
               console.error("CSRF Forgery detected! Ignore Request");
            }
         }
      },
      accessTokenCallback : function()
      {
         var me = this;

         Ext.Ajax.request(
         {
            async : true,
            disableCaching : false,
            url : 'https://graph.facebook.com/me?access_token=' + app.db.getLocalDB()['access_token'],
            callback : function(option, success, response)
            {
               if (success || (response.status == 200))
               {
                  try
                  {
                     var res = Ext.decode(response.responseText);
                     res['status'] = 'connected';
                     me.facebook_loginCallback(res);
                  }
                  catch(e)
                  {
                  }
               }
               else
               {
                  console.debug("Error Logging into Facebook\n" + //
                  'Return ' + Ext.encode(response));
                  me.facebook_loginCallback(null);
               }
            }
         });
         delete me.code;
      },
      inAppBrowserCallback : function()
      {
         var me = this;

         if (app.fn.isNative())
         {
            var ref = window.open(me.redirectUrl(), '_blank', 'location=no,toolbar=no,closebuttoncaption=Cancel');
            ref.addEventListener('loadstart', function(event)
            {
               //console.debug("FacebookConnect::loadstart - url(" + event.url + ")");
               if (event.url.match(me.currentLocation()))
               {
                  me.detectAccessToken(event.url);
                  Ext.defer(ref.close, 200);
               }
            });
            ref.addEventListener('loadstop', function(event)
            {
               //console.debug("FacebookConnect::loadstop - url(" + event.url + ")");
            });
            ref.addEventListener('exit', function(event)
            {
               clearTimeout(me.fbLoginTimeout);
               delete me.fbLoginTimeout;
               app.db.removeLocalDBAttrib('fbLoginInProgress');

               if (me.code)
               {
                  Ext.defer(function()
                  {
                     me.accessTokenCallback();
                  }, 100);
               }
               else
               {
                  me.facebook_loginCallback(null);
               }
            });

            me.fbLoginTimeout = setTimeout(function()
            {
               me.fireEvent('loginStatus');
               me.fireEvent('exception',
               {
                  type : 'timeout',
                  msg : 'The request to Facebook timed out.'
               }, null);

               app.db.removeLocalDBAttrib('fbLoginInProgress');
               ref.close();
               me.facebook_loginCallback(null);
            }, me.fbTimeout);
         }
         else
         {
            //
            // Let code update LocalStorage before leaving site
            //
            Ext.defer(function()
            {
               top.location.href = me.redirectUrl();
               // Reload parent window
            }, 0.5 * 1000);
         }
      },
      facebook_loginCallback : function(res)
      {
         var me = this, rc = null;

         // Check for cancellation/error
         if (!res || res.cancelled || res.error || (res.status != 'connected'))
         {
            console.debug("FacebookConnect.login:failedWithError:" + ((res) ? res.message : 'None'));
            if (!me.cb || !me.cb['supress'])
            {
               Ext.device.Notification.show(
               {
                  title : me.titleMsg,
                  message : me.fbConnectErrorMsg,
                  buttons : (app.fn.isNative() ? ['Try Again', 'Continue'] : ['Dismiss']),
                  callback : function(btn)
                  {
                     if (btn.toLowerCase() == 'try again')
                     {
                        Ext.defer(function()
                        {
                           me.facebook_onLogin(false, me.cb['message']);
                        }, 1, me);
                        delete me.cb;
                     }
                     else
                     {
                        Ext.Viewport.setMasked(null);
                        delete me.cb;

                        me.fireEvent('unauthorized', null, null);
                     }
                  }
               });
            }
            else if (res && res.cancelled)
            //else if (!res || res.cancelled || me.cb['iter'] >= 3)
            {
               Ext.Viewport.setMasked(null);
               delete me.cb;

               me.fireEvent('exception',
               {
                  type : 'timeout',
                  msg : 'The request to Facebook cancelled.'
               }, null);
            }
            /*
             else if (me.cb['iter'] < 3)
             {
             me.cb['iter']++;
             Ext.defer(function()
             {
             me.facebook_onLogin(false, me.cb['message']);

             }, 2 * me.cb['iter'] * 1000, me);
             }*/
         }
         else
         {
            console.log("Retrieving Facebook profile information ...");
            var response = res;
            Ext.defer(function()
            {
               //FB.api('/me', function(response)
               {
                  if (!response.error || (response.id && (response.id > 0)))
                  {
                     var db = app.db.getLocalDB(), facebook_id = response.id;

                     //console.debug("facebookConnect.login/me:[" + Ext.encode(response) + "]");
                     console.debug("Session ID[" + facebook_id + "]");
                     db['currFbId'] = facebook_id;
                     db['fbAccountId'] = response.email;
                     rc = db['fbResponse'] = me.createFbResponse(response);
                     db['enableFB'] = true;

                     app.db.setLocalDB(db);
                     db = app.db.getLocalDB();

                     console.debug('You\`ve logged into Facebook! ' + '\n' + //
                     'Email(' + rc['email'] + ')' + '\n' + //
                     'auth_code(' + db['auth_code'] + ')' + '\n' + //
                     'ID(' + facebook_id + ')' + '\n');
                     //me.getFriendsList();

                     me._fb_connect();
                     //me.getFriendsList();

                     if (db['auth_code'])
                     {
                        console.log("Updating Facebook Login Info ...");
                        Account['setUpdateFbLoginUrl']();
                        Account.load(0,
                        {
                           jsonData :
                           {
                           },
                           params :
                           {
                              user : Ext.encode(db['fbResponse'])
                           },
                           callback : function(record, operation)
                           {
                              Ext.Viewport.setMasked(null);
                              if (operation.wasSuccessful())
                              {
                                 me.fireEvent('connected', rc, operation);
                              }
                              else
                              {
                                 app.db.setLocalDBAttrib('enableFB', false);
                              }
                              delete me.cb;
                           }
                        });
                     }
                     else
                     {
                        me.fireEvent('connected', rc, null);
                        delete me.cb;
                     }
                  }
                  else
                  {
                     Ext.Viewport.setMasked(null);
                     me.fireEvent('unauthorized', null, null);
                     me.facebook_onLogout(null, false);
                     delete me.cb;
                  }
               }
               //);
            }, 0.5 * 1000, me);
         }
         delete me.fbLoginTimeout;
      },
      facebook_onLogout : function(cb, contactFB)
      {
         var me = this;

         cb = cb || Ext.emptyFn;

         console.debug("facebook_onLogout");
         try
         {
            var db = app.db.getLocalDB();
            db['currFbId'] = 0;
            delete db['fbAccountId'];
            delete db['fbResponse'];
            delete db['fbAuthCode'];
            delete db['fbExpiresIn'];
            app.db.setLocalDB(db);
            /*
             if (contactFB)
             {
             Ext.Viewport.setMasked(
             {
             xtype : 'loadmask',
             message : me.loggingOutOfFBMsg
             });
             FB.logout(function(response)
             {
             Ext.Viewport.setMasked(null);
             //FB.Auth.setAuthResponse(null, 'unknown');
             cb();
             });
             }
             else
             */
            {
               cb();
            }
         }
         catch(e)
         {
            cb();
         }
      },
      //
      // Graph API
      //
      getFbProfilePhoto : function(fbId)
      {
         return 'http://graph.facebook.com/' + fbId + '/picture?type=square';
      },
      createFBReminderMsg : function()
      {
         var me = this, viewport = _application.getController('client' + '.Viewport');

         if (!me.actions)
         {
            var iconEm = 8, iconSize = Genesis.fn.calcPx(iconEm, 1.1);
            var orientation = Ext.Viewport.getOrientation(), mobile = Ext.os.is('Phone') || Ext.os.is('Tablet'), landscape = (mobile && (orientation == 'landscape'));
            me.actions = (Ext.create('Ext.Sheet',
               {
                  bottom : 0,
                  left : 0,
                  top : 0,
                  right : 0,
                  hideOnMaskTap : false,
                  defaultUnit : 'em',
                  padding : '0.8 0.7 0 0.7',
                  layout :
                  {
                     type : 'vbox',
                     pack : 'middle'
                  },
                  defaults :
                  {
                     xtype : 'container',
                     defaultUnit : 'em'
                  },
                  items : [
                  {
                     width : '100%',
                     flex : 1,
                     style : 'text-align:center;color:white;font-size:1.1em;',
                     html : me.fbConnectRequestMsg + '<br/>' + //
                     '<img width="' + iconSize + '" ' + //
                     'style="position: absolute;top:50%;left:50%;' + //
                     'margin-top:' + Genesis.fn.addUnit(-1 * (iconEm / 2 - 1.5), 'em') + ';' + //
                     'margin-left:' + Genesis.fn.addUnit(-1 * (iconEm / 2), 'em') + ';" ' + //
                     'src="' + Genesis.constants.relPath() + 'resources/themes/images/v1/facebook_icon.png"/>'
                  }, createButtons()]
               }));
            viewport.popUpInProgress = true;
            Ext.Viewport.add(me.actions);
            if (mobile)
            {
               Ext.Viewport.on('orientationchange', onOrientationChange, me);
            }
            me.actions.show();
         }
         else
         {
            //
            // Prevent Recursion ... Do nothing
            //
         }
      },
      postCommon : function(url, params, success, fail)
      {
         var me = this;

         params = Ext.apply(params,
         {
            access_token : app.db.getLocalDB()['fbResponse']['accessToken']
         });
         Ext.Ajax.request(
         {
            async : true,
            disableCaching : false,
            method : 'POST',
            params : params,
            url : 'https://graph.facebook.com' + url,
            callback : function(option, successBool, response)
            {
               try
               {
                  var res = Ext.decode(response.responseText);
                  if (successBool || (response.status == 200))
                  {
                     success(res);
                  }
                  else if (response.status == 400)
                  {
                     //
                     // Reconnect to Facebook
                     //
                     me.facebook_onLogout();
                     Ext.defer(me.facebook_onLogin, 1, me, [false, null, true]);
                  }
                  else
                  {
                     console.debug("Error Logging into Facebook\n" + //
                     'Status code ' + Ext.encode(response.responseText));
                     fail(res);
                  }
               }
               catch(e)
               {
                  fail(res);
               }
            }
         });
      },
      uploadPhoto : function(params, success, fail)
      {
         this.postCommon('/me/photos', params, success, fail);
      },
      share : function(params, success, fail)
      {
         this.postCommon('/me/feed', params, success, fail);
      },
      _fb_connect : function()
      {
         //$.cookie(this.appId + "_expires", null);
         //$.cookie(this.appId + "_session_key", null);
         //$.cookie(this.appId + "_ss", null);
         //$.cookie(this.appId + "_user", null);
         //$.cookie(this.appId, null);
         //$.cookie("base_domain_", null);
         //$.cookie("fbsr_" + this.appId, null);
      },
      _fb_disconnect : function()
      {
         this._fb_connect();
      }
   });
   app.fb.initialize();
}

// **************************************************************************
// System Functions
// **************************************************************************
if ( typeof (Genesis) == 'undefined')
{
   Genesis =
   {
   };
}

window.plugins = window.plugins ||
{
};

// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  �yvind Sean Kinsey http://kinsey.no/blog (2010)
//
// Information and discussions
// http://jspoker.pokersource.info/skin/test-printstacktrace.html
// http://eriwen.com/javascript/js-stack-trace/
// http://eriwen.com/javascript/stacktrace-update/
// http://pastie.org/253058
// http://browsershots.org/http://jspoker.pokersource.info/skin/test-printstacktrace.html
//

//
// guessFunctionNameFromLines comes from firebug
//
// Software License Agreement (BSD License)
//
// Copyright (c) 2007, Parakey Inc.
// All rights reserved.
//
// Redistribution and use of this software in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above
//   copyright notice, this list of conditions and the
//   following disclaimer.
//
// * Redistributions in binary form must reproduce the above
//   copyright notice, this list of conditions and the
//   following disclaimer in the documentation and/or other
//   materials provided with the distribution.
//
// * Neither the name of Parakey Inc. nor the names of its
//   contributors may be used to endorse or promote products
//   derived from this software without specific prior
//   written permission of Parakey Inc.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
// IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
// OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/**
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 */
function printStackTrace(options)
{
   var ex = (options && options.e) ? options.e : null;
   var guess = options ? !!options.guess : true;

   var p = new printStackTrace.implementation();
   var result = p.run(ex);
   return (guess) ? p.guessFunctions(result) : result;
};
printStackTrace.implementation = function()
{
};
printStackTrace.implementation.prototype =
{
   run : function(ex)
   {
      // Use either the stored mode, or resolve it
      var mode = this._mode || this.mode();
      if (mode === 'other')
      {
         return this.other(arguments.callee).join('\n');
      }
      else
      {
         ex = ex || (function()
         {
            try
            {
               (0)();
            }
            catch (e)
            {
               return e;
            }
         })();
         var stack = (this[mode](ex));
         return ( typeof (stack) == 'object') ? stack.join('\n') : stack;
      }
   },
   mode : function()
   {
      try
      {
         (0)();
      }
      catch (e)
      {
         if (e.arguments)
         {
            return (this._mode = 'chrome');
         }
         else if (e.stack)
         {
            return (this._mode = 'firefox');
         }
         else if (window.opera && !('stacktrace' in e))
         {
            //Opera 9-
            return (this._mode = 'opera');
         }
      }
      return (this._mode = 'other');
   },
   chrome : function(e)
   {
      if (e.stack)
      {
         return e.stack.replace(/^.*?\n/, '').replace(/^.*?\n/, '').replace(/^.*?\n/, '').replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').split('\n');
      }
      else
      {
         return '';
      }
   },
   firefox : function(e)
   {
      if (e.stack)
      {
         return e.stack.replace(/^.*?\n/, '').replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
      }
      else
      {
         return '';
      }
   },
   // Opera 7.x and 8.x only!
   opera : function(e)
   {
      if (e.message)
      {
         var lines = e.message.split('\n'), ANON = '{anonymous}', lineRE = /Line\s+(\d+).*?script\s+(http\S+)(?:.*?in\s+function\s+(\S+))?/i, i, j, len;

         for ( i = 4, j = 0, len = lines.length; i < len; i += 2)
         {
            if (lineRE.test(lines[i]))
            {
               lines[j++] = (RegExp.$3 ? RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 : ANON + '()@' + RegExp.$2 + ':' + RegExp.$1) + ' -- ' + lines[i + 1].replace(/^\s+/, '');
            }
         }

         lines.splice(j, lines.length - j);
         return lines;
      }
      else
      {
         return '';
      }
   },
   // Safari, Opera 9+, IE, and others
   other : function(curr)
   {
      var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], j = 0, fn, args;

      var maxStackSize = 10;
      while (curr && stack.length < maxStackSize)
      {
         fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
         args = Array.prototype.slice.call(curr['arguments']);
         stack[j++] = fn + '(' + printStackTrace.implementation.prototype.stringifyArguments(args) + ')';

         //Opera bug: if curr.caller does not exist, Opera returns curr (WTF)
         if (curr === curr.caller && window.opera)
         {
            //TODO: check for same arguments if possible
            break;
         }
         curr = curr.caller;
      }
      return stack;
   },
   /**
    * @return given arguments array as a String, subsituting type names for non-string types.
    */
   stringifyArguments : function(args)
   {
      for (var i = 0; i < args.length; ++i)
      {
         var arg = args[i];
         if (arg === undefined)
         {
            args[i] = 'undefined';
         }
         else if (arg === null)
         {
            args[i] = 'null';
         }
         else if (arg.constructor)
         {
            if (arg.constructor === Array)
            {
               if (arg.length < 3)
               {
                  args[i] = '[' + this.stringifyArguments(arg) + ']';
               }
               else
               {
                  args[i] = '[' + this.stringifyArguments(Array.prototype.slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(Array.prototype.slice.call(arg, -1)) + ']';
               }
            }
            else if (arg.constructor === Object)
            {
               args[i] = '#object';
            }
            else if (arg.constructor === Function)
            {
               args[i] = '#function';
            }
            else if (arg.constructor === String)
            {
               args[i] = '"' + arg + '"';
            }
         }
      }
      return (( typeof (args) == 'object') ? args.join(',') : args);
   },
   sourceCache :
   {
   },
   /**
    * @return the text from a given URL.
    */
   ajax : function(url)
   {
      var req = this.createXMLHTTPObject();
      if (!req)
      {
         return;
      }
      req.open('GET', url, false);
      req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
      req.send('');
      return req.responseText;
   },
   createXMLHTTPObject : function()
   {
      // Try XHR methods in order and store XHR factory
      var xmlhttp, XMLHttpFactories = [
      function()
      {
         return new XMLHttpRequest();
      },
      function()
      {
         return new ActiveXObject('Msxml2.XMLHTTP');
      },
      function()
      {
         return new ActiveXObject('Msxml3.XMLHTTP');
      },
      function()
      {
         return new ActiveXObject('Microsoft.XMLHTTP');
      }];
      for (var i = 0; i < XMLHttpFactories.length; i++)
      {
         try
         {
            xmlhttp = XMLHttpFactories[i]();
            // Use memoization to cache the factory
            this.createXMLHTTPObject = XMLHttpFactories[i];
            return xmlhttp;
         }
         catch (e)
         {
         }
      }
   },
   getSource : function(url)
   {
      if (!( url in this.sourceCache))
      {
         this.sourceCache[url] = this.ajax(url).split('\n');
      }
      return this.sourceCache[url];
   },
   guessFunctions : function(stack)
   {
      if (stack.length)
      {
         for (var i = 0; i < stack.length; ++i)
         {
            var reStack = /{anonymous}\(.*\)@(\w+:\/\/([-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;
            var frame = stack[i], m = reStack.exec(frame);
            if (m)
            {
               var file = m[1], lineno = m[4];
               //m[7] is character position in Chrome
               if (file && lineno)
               {
                  var functionName = this.guessFunctionName(file, lineno);
                  stack[i] = frame.replace('{anonymous}', functionName);
               }
            }
         }
         return ( typeof (stack) == 'object') ? stack.join('\n') : stack;
      }
      return stack;
   },
   guessFunctionName : function(url, lineNo)
   {
      try
      {
         return this.guessFunctionNameFromLines(lineNo, this.getSource(url));
      }
      catch (e)
      {
         return 'getSource failed with url: ' + url + ', exception: ' + e.toString();
      }
   },
   guessFunctionNameFromLines : function(lineNo, source)
   {
      var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/;
      var reGuessFunction = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;
      // Walk backwards from the first line in the function until we find the line which
      // matches the pattern above, which is the function definition
      var line = "", maxLines = 10;
      for (var i = 0; i < maxLines; ++i)
      {
         line = source[lineNo - i] + line;
         if (line !== undefined)
         {
            var m = reGuessFunction.exec(line);
            if (m && m[1])
            {
               return m[1];
            }
            else
            {
               m = reFunctionArgNames.exec(line);
               if (m && m[1])
               {
                  return m[1];
               }
            }
         }
      }
      return '(?)';
   }
};

/**
 *
 *  URL encode / decode
 *  http://www.webtoolkit.info/
 *
 **/
var Url =
{
   // public method for url encoding
   encode : function(string)
   {
      return escape(this._utf8_encode(string));
   },
   // public method for url decoding
   decode : function(string)
   {
      return this._utf8_decode(unescape(string));
   },
   // private method for UTF-8 encoding
   _utf8_encode : function(string)
   {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++)
      {

         var c = string.charCodeAt(n);

         if (c < 128)
         {
            utftext += String.fromCharCode(c);
         }
         else if ((c > 127) && (c < 2048))
         {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
         }
         else
         {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
         }

      }

      return utftext;
   },
   // private method for UTF-8 decoding
   _utf8_decode : function(utftext)
   {
      var string = "";
      var i = 0;
      var c = 0, c1 = 0, c2 = 0, c3 = 0;

      while (i < utftext.length)
      {

         c = utftext.charCodeAt(i);

         if (c < 128)
         {
            string += String.fromCharCode(c);
            i++;
         }
         else if ((c > 191) && (c < 224))
         {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
         }
         else
         {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
         }

      }

      return string;
   }
};

(function()
{
   __initLibExtensions__ = function()
   {
      //---------------------------------------------------------------------------------
      // Array
      //---------------------------------------------------------------------------------
      Ext.merge(Array.prototype,
      {
         binarySearch : function(find, comparator)
         {
            var low = 0, high = this.length - 1, i, comparison;
            while (low <= high)
            {
               i = Math.floor((low + high) / 2);
               comparison = comparator(this[i], find);
               if (comparison < 0)
               {
                  low = i + 1;
                  continue;
               };
               if (comparison > 0)
               {
                  high = i - 1;
                  continue;
               };
               return i;
            }
            return null;
         }
      });

      //---------------------------------------------------------------------------------
      // String
      //---------------------------------------------------------------------------------
      Ext.merge(String.prototype,
      {
         hashCode : function()
         {
            for (var ret = 0, i = 0, len = this.length; i < len; i++)
            {
               ret = (31 * ret + this.charCodeAt(i)) << 0;
            }
            return ret;
         },
         getFuncBody : function()
         {
            var str = this.toString();
            str = str.replace(/[^{]+\{/, "");
            str = str.substring(0, str.length - 1);
            str = str.replace(/\n/gi, "");
            if (!str.match(/\(.*\)/gi))
               str += ")";
            return str;
         },
         strip : function()
         {
            return this.replace(/^\s+/, '').replace(/\s+$/, '');
         },
         stripScripts : function()
         {
            //    return this.replace(new
            // RegExp('\\bon[^=]*=[^>]*(?=>)|<\\s*(script|link|iframe|embed|object|applet|form|button|input)[^>]*[\\S\\s]*?<\\/\\1>|<[^>]*include[^>]*>',
            // 'ig'),"");
            return this.replace(new RegExp('<noscript[^>]*?>([\\S\\s]*?)<\/noscript>', 'img'), '').replace(new RegExp('<script[^>]*?>([\\S\\s]*?)<\/script>', 'img'), '').replace(new RegExp('<link[^>]*?>([\\S\\s]*?)<\/link>', 'img'), '').replace(new RegExp('<link[^>]*?>', 'img'), '').replace(new RegExp('<iframe[^>]*?>([\\S\\s]*?)<\/iframe>', 'img'), '').replace(new RegExp('<iframe[^>]*?>', 'img'), '').replace(new RegExp('<embed[^>]*?>([\\S\\s]*?)<\/embed>', 'img'), '').replace(new RegExp('<embed[^>]*?>', 'img'), '').replace(new RegExp('<object[^>]*?>([\\S\\s]*?)<\/object>', 'img'), '').replace(new RegExp('<object[^>]*?>', 'img'), '').replace(new RegExp('<applet[^>]*?>([\\S\\s]*?)<\/applet>', 'img'), '').replace(new RegExp('<applet[^>]*?>', 'img'), '').replace(new RegExp('<button[^>]*?>([\\S\\s]*?)<\/button>', 'img'), '').replace(new RegExp('<button[^>]*?>', 'img'), '').replace(new RegExp('<input[^>]*?>([\\S\\s]*?)<\/input>', 'img'), '').replace(new RegExp('<input[^>]*?>', 'img'), '').replace(new RegExp('<style[^>]*?>([\\S\\s]*?)<\/style>', 'img'), '').replace(new RegExp('<style[^>]*?>', 'img'), '')
         },
         stripTags : function()
         {
            return this.replace(/<\/?[^>]+>/gi, '');
         },
         stripComments : function()
         {
            return this.replace(/<!(?:--[\s\S]*?--\s*)?>\s*/g, '');
         },
         times : function(n)
         {
            var s = '', i;
            for ( i = 0; i < n; i++)
            {
               s += this;
            }
            return s;
         },
         zp : function(n)
         {
            return ('0'.times(n - this.length) + this);
         },
         capitalize : function()
         {
            return this.replace(/\w+/g, function(a)
            {
               return a.charAt(0).toUpperCase() + a.substr(1);
            });
         },
         uncapitalize : function()
         {
            return this.replace(/\w+/g, function(a)
            {
               return a.charAt(0).toLowerCase() + a.substr(1);
            });
         },
         trim : function(x)
         {
            if (x == 'left')
               return this.replace(/^\s*/, '');
            if (x == 'right')
               return this.replace(/\s*$/, '');
            if (x == 'normalize')
               return this.replace(/\s{2,}/g, ' ').trim();

            return this.trim('left').trim('right');
         },
         trunc : function(length)
         {
            return (this.length > (length - 4)) ? this.substring(0, length - 4) + ' ...' : this;
         },
         /**
          * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
          * @param {String} value The string to encode
          * @return {String} The encoded text
          */
         htmlEncode : (function()
         {
            var entities =
            {
               '&' : '&amp;',
               '>' : '&gt;',
               '<' : '&lt;',
               '"' : '&quot;'
            }, keys = [], p, regex;

            for (p in entities)
            {
               keys.push(p);
            }
            regex = new RegExp('(' + keys.join('|') + ')', 'g');

            return function(value)
            {
               return (!value) ? value : String(value).replace(regex, function(match, capture)
               {
                  return entities[capture];
               });
            };
         })(),
         /**
          * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
          * @param {String} value The string to decode
          * @return {String} The decoded text
          */
         htmlDecode : (function()
         {
            var entities =
            {
               '&amp;' : '&',
               '&gt;' : '>',
               '&lt;' : '<',
               '&quot;' : '"'
            }, keys = [], p, regex;

            for (p in entities)
            {
               keys.push(p);
            }
            regex = new RegExp('(' + keys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');

            return function(value)
            {
               return (!value) ? value : String(value).replace(regex, function(match, capture)
               {
                  if ( capture in entities)
                  {
                     return entities[capture];
                  }
                  else
                  {
                     return String.fromCharCode(parseInt(capture.substr(2), 10));
                  }
               });
            }
         })()
      });

      // **************************************************************************
      // Math
      // **************************************************************************
      Ext.merge(Math,
      {
         radians : function(degrees)
         {
            return (degrees * Math.PI / 180);
         }
      });
   }
})();

Genesis.constants =
{
   isNfcEnabled : false,
   userName : 'Eric Chan',
   appMimeType : 'application/kickbak',
   clientVersion : '2.2.0',
   serverVersion : '2.2.0',
   themeName : 'v1',
   _thumbnailAttribPrefix : '',
   _iconPath : '',
   _iconSize : 0,
   fontSize : 0,
   defaultIconSize : function()
   {
      return this._iconSize;
   },
   relPath : function()
   {
      return ((window.jQuery) ? "../" : "");
   },
   site : (location.origin.match(/^file/) ? "www" : location.host.split(".")[0]) + '.getkickbak.com',
   photoSite : 'https://s3.amazonaws.com/files.getkickbak.com',
   resourceSite : function()
   {
      return this.relPath() + "resources/" + ((_build == "MobileWeb") ? "" : "themes/");
   },
   debugVPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
   debugRPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
   debugVenuePrivKey : 'Debug Venue',
   privKey : null,
   //
   // Constants for Proximity Identifier
   //
   lastLocalID : null,
   numSamples : -1,
   conseqMissThreshold : -1,
   sigOverlapRatio : -1,
   //Default Volume laying flat on a surface (tx)
   s_vol : -1,
   r_vol : -1,
   //
   //device : null,
   minDistance : 0.3 * 1000,
   //minDistance : 100000 * 1000,
   createAccountMsg : 'Create user account using Facebook Profile information',
   spinnerDom : '<div class="x-loading-spinner-outer"><div class="x-loading-spinner"><span class="x-loading-top"></span><span class="x-loading-right"></span><span class="x-loading-bottom"></span><span class="x-loading-left"></span></div></div>',
   debugMode : function()
   {
      return debugMode;
   },
   serverHost : function()
   {
      return serverHost;
   },
   init : function()
   {
      var me = this, ratio = 1.14;

      __initLibExtensions__();

      if (merchantMode)
      {
         ratio = (Ext.os.is('Tablet') ? 1.5 * ratio : 1.0 * ratio);
      }
      me.fontSize = Math.floor(((16 * ratio * Math.min(1.0, window.devicePixelRatio)) || (16 * ratio)));

      if (Ext.os.is('iOS'))
      {
         me._iconPath = '/ios';
         me._thumbnailAttribPrefix = 'thumbnail_ios_';
         me._iconSize = 57 * ( merchantMode ? 1.5 : 1.0);

         console.log("Running a iOS System");
      }
      else if (Ext.os.is('Android') || Ext.os.is('Desktop'))
      {
         if ((window.devicePixelRatio == 1) || (window.devicePixelRatio >= 2))
         {
            me._iconSize = 48 * ((merchantMode && (Ext.os.is('Tablet'))) ? 3.0 : 1.2);
            me._iconPath = '/ios';
            //            me._iconPath = '/android/mxhdpi';
            me._thumbnailAttribPrefix = 'thumbnail_android_mxhdpi_';
         }
         else
         {
            me._iconSize = 36 * ((merchantMode && (Ext.os.is('Tablet'))) ? 3.0 : 1.5);
            me._iconPath = '/ios';
            //            me._iconPath = '/android/lhdpi';
            me._thumbnailAttribPrefix = 'thumbnail_android_lhdpi_';
         }

         console.log("Running a Android or Desktop System");
      }
      else
      {
         me._iconPath = '/ios';
         me._thumbnailAttribPrefix = 'thumbnail_ios_';
         me._iconSize = 57;

         console.log("Running a Unknown System");
      }
      me._iconPath = me.themeName + me._iconPath;
      me._iconPathCommon = me.themeName + '/ios';

      console.debug("IconSize = " + me._iconSize + "px");
   },
   addCRLF : function()
   {
      //return ((!Genesis.fn.isNative()) ? '<br/>' : '\n');
      return ('<br/>');
   },
   getIconPath : function(type, name, remote)
   {
      return ((!remote) ? //
      this.relPath() + 'resources/themes/images/' + this._iconPathCommon + '/' + type + '/' + name + '.svg' : //
      this.photoSite + '/' + this._iconPath + '/' + 'icons' + '/' + type + '/' + name + '.png');
   }
};

// **************************************************************************
// Utility Functions
// **************************************************************************
(function()
{
   var __fn__ =
   {
      isNative : function()
      {
         //return Ext.isDefined(cordova);
         return window.phoneGapAvailable;
      },
      // **************************************************************************
      // Dynamic CSS/JS loading
      // **************************************************************************
      filesadded :
      {
      }, //list of files already added
      checkloadjscssfile : function(filename, filetype, cb)
      {
         var decodeFilename = Url.decode(filename);
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
         filename = Url.decode(filename);
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
         href = Url.decode(href);
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
                  console.debug(printStackTrace(
                  {
                     e : e
                  }));
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
         filename = Url.decode(filename);
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
         filename = Url.decode(filename);
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
      findjscssfile : function(filename, filetype)
      {
         filename = Url.decode(filename);
         var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "style" : "none"//determine element type to create
         // nodelist from
         var targetattr = (filetype == "js") ? "id" : (filetype == "css") ? "id" : "none"//determine corresponding attribute to test
         // for
         var allsuspects = document.getElementsByTagName(targetelement)
         for (var i = allsuspects.length; i >= 0; i--)
         {
            //search backwards within nodelist for matching elements to remove
            if (allsuspects[i])
            {
               var attr = allsuspects[i].getAttribute(targetattr);
               if (attr != null && attr.search(filename) != -1)
               {
                  return allsuspects[i];
               }
            }
         }
         return null;
      },
      removejscsstext : function(filename, filetype)
      {
         filename = Url.decode(filename);
         var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "style" : "none"//determine element type to create
         // nodelist from
         var targetattr = (filetype == "js") ? "id" : (filetype == "css") ? "id" : "none"//determine corresponding attribute to test
         // for
         var allsuspects = document.getElementsByTagName(targetelement)
         for (var i = allsuspects.length; i >= 0; i--)
         {
            //search backwards within nodelist for matching elements to remove
            if (allsuspects[i])
            {
               var attr = allsuspects[i].getAttribute(targetattr);
               if (attr != null && ((attr == filename) || (attr.search(filename) != -1)))
               {
                  allsuspects[i].parentNode.removeChild(allsuspects[i])//remove element by calling parentNode.removeChild()
                  delete Genesis.fn.filesadded[filename];
               }
            }
         }
      },
      replacejscssfile : function(oldfilename, newfilename, filetype)
      {
         newfilename = Url.decode(newfilename);
         oldfilename = Url.decode(oldfilename);
         var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none"//determine element type to create
         // nodelist using
         var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none"//determine corresponding attribute to
         // test
         // for
         var allsuspects = document.getElementsByTagName(targetelement)
         for (var i = allsuspects.length; i >= 0; i--)
         {
            //search backwards within nodelist for matching elements to remove
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename) != -1)
            {
               var newelement = this.createjscssfile(newfilename, filetype)
               allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i])
               delete this.filesadded[oldfilename];
               this.filesadded[newfilename] = [true];
            }
         }
      },
      // **************************************************************************
      // Date Time
      // **************************************************************************
      systemTime : (new Date()).getTime(),
      clientTime : (new Date()).getTime(),
      weekday : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      convertDateCommon : function(v, dateFormat, noConvert)
      {
         var date;
         var format = dateFormat || this.dateFormat;

         if (!( v instanceof Date))
         {
            if ( typeof (JSON) != 'undefined')
            {
               //v = (jQuery.browser.msie) ? v.split(/Z$/)[0] : v.split('.')[0];
               //v = (Ext.os.deviceType.toLowerCase() != 'desktop') ? v : v.split('.')[0];
               //v = (Genesis.fn.isNative()) ? v : v.split('.')[0];
            }

            if ((v === null) || (v === undefined) || v === '')
            {
               date = new Date();
            }
            else
            {
               if (format)
               {
                  date = Date.parse(v, format);
                  if ((date === null) || (date === undefined) || date === '')
                  {
                     date = new Date(v).format(format);
                  }
                  return [date, date];
               }
               date = new Date(v);
               if (date.toString() == 'Invalid Date')
               {
                  date = Date.parse(v, format);
               }
            }
         }
         else
         {
            date = v;
         }
         if (!noConvert)
         {
            var currentDate = new Date().getTime();
            // Adjust for time drift between Client computer and Application Server
            var offsetTime = this.currentDateTime(currentDate);

            var timeExpiredSec = (offsetTime - date.getTime()) / 1000;

            if (timeExpiredSec > -10)
            {
               if ((timeExpiredSec) < 2)
                  return [timeExpiredSec, 'a sec ago'];
               if ((timeExpiredSec) < 60)
                  return [timeExpiredSec, parseInt(timeExpiredSec) + ' secs ago'];
               timeExpiredSec = timeExpiredSec / 60;
               if ((timeExpiredSec) < 2)
                  return [timeExpiredSec, 'a min ago'];
               if ((timeExpiredSec) < 60)
                  return [timeExpiredSec, parseInt(timeExpiredSec) + ' mins ago'];
               timeExpiredSec = timeExpiredSec / 60;
               if ((timeExpiredSec) < 2)
                  return [date, '1 hr ago'];
               if ((timeExpiredSec) < 24)
                  return [date, parseInt(timeExpiredSec) + ' hrs ago'];
               timeExpiredSec = timeExpiredSec / 24;
               if (((timeExpiredSec) < 2) && ((new Date().getDay() - date.getDay()) == 1))
                  return [date, 'Yesterday at ' + date.format('g:i A')];
               if ((timeExpiredSec) < 7)
                  return [date, this.weekday[date.getDay()] + ' at ' + date.format('g:i A')];
               timeExpiredSec = timeExpiredSec / 7;
               if (((timeExpiredSec) < 2) && (timeExpiredSec % 7 == 0))
                  return [date, '1 wk ago'];
               if (((timeExpiredSec) < 5) && (timeExpiredSec % 7 == 0))
                  return [date, parseInt(timeExpiredSec) + ' wks ago'];

               if (timeExpiredSec < 5)
                  return [date, parseInt(timeExpiredSec * 7) + ' days ago']
               return [date, null];
            }
            // Back to the Future! Client might have changed it's local clock
            else
            {
            }
         }

         return [date, -1];
      },
      convertDateFullTime : function(v)
      {
         return v.format('D, M d, Y \\a\\t g:i A');
      },
      convertDateReminder : function(v)
      {
         var today = new Date();
         var todayDate = today.getDate();
         var todayMonth = today.getMonth();
         var todayYear = today.getFullYear();
         var date = v.getDate();
         var month = v.getMonth();
         var year = v.getFullYear();
         if (todayDate == date && todayMonth == month && todayYear == year)
         {
            return 'Today ' + v.format('g:i A');
         }
         return v.format('D g:i A');
      },
      convertDate : function(v, dateFormat)
      {
         var rc = this.convertDateCommon(v, dateFormat);
         if (rc[1] != -1)
         {
            return (rc[1] == null) ? rc[0].format('M d, Y') : rc[1];
         }
         else
         {
            return rc[0].format('D, M d, Y \\a\\t g:i A');
         }
      },
      convertDateNoTime : function(v)
      {
         var rc = this.convertDateCommon(v, null, true);
         if (rc[1] != -1)
         {
            return (rc[1] == null) ? rc[0].format('D, M d, Y') : rc[1];
         }
         else
         {
            return rc[0].format('D, M d, Y')
         }
      },
      convertDateNoTimeNoWeek : function(v)
      {
         var rc = this.convertDateCommon(v, null, true);
         if (rc[1] != -1)
         {
            rc = (rc[1] == null) ? rc[0].format('M d, Y') : rc[1];
         }
         else
         {
            rc = rc[0].format('M d, Y');
         }
         return rc;
      },
      convertDateInMins : function(v)
      {
         var rc = this.convertDateCommon(v, null, true);
         if (rc[1] != -1)
         {
            return (rc[1] == null) ? rc[0].format('h:ia T') : rc[1];
         }
         else
         {
            return rc[0].format('h:ia T');
         }
      },
      currentDateTime : function(currentDate)
      {
         return (this.systemTime - this.clientTime) + currentDate;
      },
      // **************************************************************************
      // PX and EM Calculations
      // **************************************************************************
      addUnit : function(unit, metric)
      {
         return unit + ((!metric) ? 'px' : metric);
      },
      _removeUnitRegex : /(\d+)px/,
      removeUnit : function(unit)
      {
         return unit.match(this._removeUnitRegex)[1];
      },
      //
      // Convert to equivalent px given the fontsize
      //
      calcPx : function(em, fontsize)
      {
         return Math.floor((em * fontsize * Genesis.constants.fontSize));
      },
      //
      // Convert to equivalent em given the fontsize
      //
      calcEm : function(px, fontsize)
      {
         return Math.floor(px / Genesis.constants.fontSize / fontsize);
      },
      // **************************************************************************
      // File IO
      // **************************************************************************
      failFileHandler : function(error)
      {
         var errorCode =
         {
         };
         errorCode[FileError.NOT_FOUND_ERR] = 'File not found';
         errorCode[FileError.SECURITY_ERR] = 'Security error';
         errorCode[FileError.ABORT_ERR] = 'Abort error';
         errorCode[FileError.NOT_READABLE_ERR] = 'Not readable';
         errorCode[FileError.ENCODING_ERR] = 'Encoding error';
         errorCode[FileError.NO_MODIFICATION_ALLOWED_ERR] = 'No mobification allowed';
         errorCode[FileError.INVALID_STATE_ERR] = 'Invalid state';
         errorCode[FileError.SYFNTAX_ERR] = 'Syntax error';
         errorCode[FileError.INVALID_MODIFICATION_ERR] = 'Invalid modification';
         errorCode[FileError.QUOTA_EXCEEDED_ERR] = 'Quota exceeded';
         errorCode[FileError.TYPE_MISMATCH_ERR] = 'Type mismatch';
         errorCode[FileError.PATH_EXISTS_ERR] = 'Path does not exist';
         var ftErrorCode =
         {
         };
         ftErrorCode[FileTransferError.FILE_NOT_FOUND_ERR] = 'File not found';
         ftErrorCode[FileTransferError.INVALID_URL_ERR] = 'Invalid URL Error';
         ftErrorCode[FileTransferError.CONNECTION_ERR] = 'Connection Error';

         console.log("File Error - [" + errorCode[error.code] + "]");
      },
      readFile : function(path, callback)
      {
         var me = this, rfile;
         var failFileHandler = function(error)
         {
            me.failFileHandler(error);
            callback(null);
         };

         if (Genesis.fn.isNative())
         {
            var handler = function(fileEntry)
            {
               fileEntry.file(function(file)
               {
                  var reader = new FileReader();
                  reader.onloadend = function(evt)
                  {
                     callback(evt.target.result);
                  };
                  reader.readAsText(rfile);
               }, failFileHandler);
            };

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
            {
               if (Ext.os.is('iOS'))
               {
                  rfile = (fileSystem.root.fullPath + '/../' + appName + '.app' + '/www/') + path;
               }
               else if (Ext.os.is('Android'))
               {
                  //rfile = ('file:///mnt/sdcard/' + appName + '/') + path;
                  rfile = (appName + '/') + path;
               }
               console.debug("Reading from File - [" + rfile + "]");
               fileSystem.root.getFile(rfile, null, handler, failFileHandler);
            }, failFileHandler);
         }
         else
         {
            callback(true);
         }
      },
      writeFile : function(path, content, callback)
      {
         var me = this, wfile;
         var failFileHandler = function(error)
         {
            me.failFileHandler(error);
            callback(false);
         };

         if (Genesis.fn.isNative())
         {
            var handler = function(fileEntry)
            {
               console.debug("Created File - [" + wfile + "]");
               fileEntry.createWriter(function(writer)
               {
                  console.debug("Writing to File - [" + wfile + "], Content - [" + content + "]");
                  writer.onwrite = function(evt)
                  {
                     console.debug("Write End Callback - [" + Ext.encode(evt) + "]");
                     callback(true);
                  };
                  writer.write(content);
               }, failFileHandler);
            };

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
            {
               if (Ext.os.is('iOS'))
               {
                  wfile = (fileSystem.root.fullPath + '/../' + appName + '.app' + '/www/') + path;
               }
               else if (Ext.os.is('Android'))
               {
                  //wfile = ('file:///mnt/sdcard/' + appName + '/') + path;
                  wfile = (appName + '/') + path;
               }
               fileSystem.root.getDirectory(wfile.substring(0, wfile.lastIndexOf('/')),
               {
                  create : true
               });
               fileSystem.root.getFile(wfile,
               {
                  create : true,
                  exclusive : false
               }, handler, failFileHandler);
            }, failFileHandler);
         }
         else
         {
            callback();
         }
      },
      getPrivKey : function(id, callback)
      {
         var me = this;
         callback = callback || Ext.emptyFn;
         if (!me.privKey)
         {
            if (!Genesis.fn.isNative())
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
            else
            {
               me.privKey =
               {
               };
            }
         }

         return ((id) ? me.privKey[id] : me.privKey);
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
      processRecvLocalID : function(result)
      {
         var identifiers = null;
         var localID = result.freqs;
         if (localID)
         {
            identifiers = 'LocalID=[' + localID[0] + ', ' + localID[1] + ', ' + localID[2] + ']';
            //console.log('Recv\'d ' + identifiers);
         }
         else
         {
            console.log('Already listening for LocalID ...');
         }

         return (
            {
               message : identifiers,
               localID : localID
            });
      }
   };

   Genesis.fn = (Genesis.fn) ? Ext.merge(Genesis.fn, __fn__) : __fn__;
})();

// **************************************************************************
// Persistent DB API
// **************************************************************************
Genesis.db =
{
   _localDB : null,
   _idxDB : window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
   _idxDBTrans : window.IDBTransaction || window.webkitIDBTransaction,
   _idxDBKeyRange : window.IDBKeyRange || window.webkitIDBKeyRange,
   _indexDB :
   {
      v : 1,
      db : null,
      //default error handler outputs errors to console
      onError : function(event)
      {
         console.debug("IndexDB error: " + event.target.errorCode, event.target);
      }
   },
   getLocalStorage : function()
   {
      return window.localStorage;
   },
   //
   // Redeem Index DB
   //
   getRedeemIndexDB : function(index)
   {
      try
      {
         if (!this.kickbakRedeemIndex)
         {
            this.kickbakRedeemIndex = Ext.decode(this.getLocalStorage().getItem('kickbakRedeemIndex'));
         }
      }
      catch(e)
      {
      }

      if (!this.kickbakRedeemIndex)
      {
         this.kickbakRedeemIndex =
         {
         };
      }
      return ( index ? this.kickbakRedeemIndex[index] : this.kickbakRedeemIndex);
   },
   addRedeemIndexDB : function(index, value)
   {
      var db = this.getRedeemIndexDB();
      db[index] = value;
      console.debug("Add to KickBak Redeem DB[" + index + "]");
      //this.getLocalStorage().setItem('kickbakRedeemIndex', Ext.encode(db));
   },
   setRedeemIndexDB : function(db)
   {
      //console.debug("Setting KickBak Redeem DB[" + Ext.encode(db) + "]");
      //this.getLocalStorage().setItem('kickbakRedeemIndex', Ext.encode(db));
   },
   //
   // Redeem Sorted DB
   //
   getRedeemSortedDB : function(index)
   {
      try
      {
         if (!this.kickbakRedeemSorted)
         {
            this.kickbakRedeemSorted = Ext.decode(this.getLocalStorage().getItem('kickbakRedeemSorted'));
         }
      }
      catch(e)
      {

      }
      if (!this.kickbakRedeemSorted)
      {
         this.kickbakRedeemSorted = [];
      }
      return ( index ? this.kickbakRedeemSorted[index] : this.kickbakRedeemSorted);
   },
   //
   // LocalDB
   //
   getLocalDB : function()
   {
      return (!this._localDB) ? (this._localDB = JSON.parse(this.getLocalStorage().getItem('kickbak') || "{}")) : this._localDB;
   },
   setLocalDB : function(db)
   {
      this._localDB = db;
      //console.debug("Setting KickBak DB[" + Ext.encode(db) + "]");
      this.getLocalStorage().setItem('kickbak', JSON.stringify(db));
   },
   setLocalDBAttrib : function(attrib, value)
   {
      //console.debug("Setting KickBak Attrib[" + attrib + "] to [" + value + "]");
      var db = this.getLocalDB();
      db[attrib] = value;
      this.setLocalDB(db);
   },
   removeLocalDBAttrib : function(attrib)
   {
      var db = this.getLocalDB();
      if ( typeof (db[attrib]) != 'undefined')
      {
         delete db[attrib];
         this.setLocalDB(db);
      }
   },
   openDatabase : function(callback)
   {
      var me = this, db = null;
      if (Genesis.fn.isNative())
      {
         db = openDatabase('KickBak', '1.0', 'KickBakDB', 2 * 1024 * 1024);
      }
      return db;
   },
   //
   // Referral DB
   //
   getReferralDBAttrib : function(index)
   {
      var db = this.getReferralDB();
      return db[index];
   },
   addReferralDBAttrib : function(index, value)
   {
      var db = this.getReferralDB();
      db[index] = value;
      this.setReferralDB(db);
   },
   removeReferralDBAttrib : function(index)
   {
      var db = this.getReferralDB();
      delete db[index];
      this.setReferralDB(db);
   },
   getReferralDB : function()
   {
      var db = this.getLocalStorage().getItem('kickbakreferral');
      return ((db) ? Ext.decode(db) :
      {
      });
   },
   setReferralDB : function(db)
   {
      console.debug("Setting Referral DB[" + Ext.encode(db) + "]");
      this.getLocalStorage().setItem('kickbakreferral', Ext.encode(db));
   },
   //
   // Reset Local DB
   //
   resetStorage : function()
   {
      var me = this, db = Genesis.db.getLocalDB(), i;
      if (db['fbLoginInProgress'])
      {
         return;
      }

      if (Genesis.fb)
      {
         Genesis.fb.facebook_onLogout(null, false);
      }
      db = me.getLocalStorage();
      for (i in db)
      {
         if ((i == 'kickbak') || (i == 'kickbakreferral'))
         {
            try
            {
               db.removeItem(i);
            }
            catch(e)
            {
            }
            console.debug("Removed [" + i + "]");
         }
      }
      me._localDB = null;
      //
      // Clean up ALL Object cache!
      //
      if ( typeof (Ext) != 'undefined')
      {
         Ext.data.Model.cache =
         {
         };
      }

      //
      // Legacy Code Cleanup
      //
      /*
       var db = Genesis.db.openDatabase();
       if (db)
       {
       db.transaction(function(tx)
       {
       var dropStatement = "DROP TABLE Customer";
       //
       // Drop Table
       //
       tx.executeSql(dropStatement, [], function(tx, result)
       {
       console.debug("ResetStorage --- Successfully drop KickBak-Customers Table");
       }, function(tx, error)
       {
       console.debug("Failed to drop KickBak-Customers Table : " + error.message);
       });
       });
       }
       */
   }
};
(function(cordova)
{
   /*
    window.plugins = window.plugins ||
    {
    };
    */
   navigator.notification =
   //window.plugins.notification =
   {
      /**
       * Open a native alert dialog, with a customizable title and button text.
       *
       * @param {String} message              Message to print in the body of the alert
       * @param {Function} completeCallback   The callback that is called when user clicks on a button.
       * @param {String} title                Title of the alert dialog (default: Alert)
       * @param {String} buttonLabel          Label of the close button (default: OK)
       */
      alert : function(message, completeCallback, title, buttonLabel)
      {
         var _title = (title || "Alert");
         var _buttonLabel = (buttonLabel || "OK");
         cordova.exec(completeCallback, null, "NotificationPlugin", "alert", [message, _title, _buttonLabel]);
      },

      /**
       * Open a native confirm dialog, with a customizable title and button text.
       * The result that the user selects is returned to the result callback.
       *
       * @param {String} message              Message to print in the body of the alert
       * @param {Function} resultCallback     The callback that is called when user clicks on a button.
       * @param {String} title                Title of the alert dialog (default: Confirm)
       * @param {String} buttonLabels         Comma separated list of the labels of the buttons (default: 'OK,Cancel')
       */
      confirm : function(message, resultCallback, title, buttonLabels)
      {
         var me = this;
         var _title = (title || "Confirm");
         //var _buttonLabels = (buttonLabels || "OK,Cancel");
         var _buttonLabels = (buttonLabels);
         var args = (_buttonLabels) ? [message, _title, _buttonLabels] : [message, _title];

         cordova.exec(function(response)
         {
            if (response > 10000)
            {
               me.alertViewId = response;
               console.debug("Notification confirm callbackId[" + me.alertViewId + "]");
            }
            else
            {
               delete me.alertViewId;
               resultCallback(response);
            }
         }, null, "NotificationPlugin", "confirm", args);
      },

      /**
       * Causes the device to vibrate.
       *
       * @param {Integer} mills       The number of milliseconds to vibrate for.
       */
      vibrate : function(mills)
      {
         cordova.exec(null, null, "NotificationPlugin", "vibrate", [mills]);
      },

      /**
       * Causes the device to beep.
       * On Android, the default notification ringtone is played "count" times.
       *
       * @param {Integer} count       The number of beeps.
       */
      beep : function(count)
      {
         cordova.exec(null, null, "NotificationPlugin", "beep", [count]);
      },

      dismiss : function()
      {
         var me = this;
         if (me.alertViewId)
         {
            cordova.exec(null, null, "NotificationPlugin", "dismiss", [me.alertViewId]);
            //console.debug("alertId[" + me.alertViewId + "]");
         }
      }
   };

   cordova.addConstructor(function()
   {
   });
})(window.cordova || window.Cordova || window.PhoneGap);
/**
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) Matt Kane 2010
 * Copyright (c) 2010, IBM Corporation
 */

(function(cordovaRef)
{
   //-------------------------------------------------------------------
   BarcodeScanner = function()
   {
   }
   //-------------------------------------------------------------------
   BarcodeScanner.Encode =
   {
      TEXT_TYPE : "TEXT_TYPE",
      EMAIL_TYPE : "EMAIL_TYPE",
      PHONE_TYPE : "PHONE_TYPE",
      SMS_TYPE : "SMS_TYPE",
      CONTACT_TYPE : "CONTACT_TYPE",
      LOCATION_TYPE : "LOCATION_TYPE"
   }

   //-------------------------------------------------------------------
   BarcodeScanner.prototype.scan = function(success, fail, options)
   {
      function successWrapper(result)
      {
         result.cancelled = (result.cancelled == 1)
         success.call(null, result)
      }

      if(!fail)
      {
         fail = function()
         {
         }
      }

      if( typeof fail != "function")
      {
         console.log("BarcodeScanner.scan failure: failure parameter not a function")
         return
      }

      if( typeof success != "function")
      {
         fail("success callback parameter must be a function")
         return
      }

      if(null == options)
         options = []

      //return PhoneGap.exec(successWrapper, fail, "com.phonegap.barcodeScanner", "scan", options);
      cordovaRef.exec(successWrapper, fail, 'BarCodeScanner', 'scan', options);
   }
   //-------------------------------------------------------------------
   BarcodeScanner.prototype.encode = function(type, data, success, fail, options)
   {
      if(!fail)
      {
         fail = function()
         {
         }
      }

      if( typeof fail != "function")
      {
         console.log("BarcodeScanner.scan failure: failure parameter not a function")
         return
      }

      if( typeof success != "function")
      {
         fail("success callback parameter must be a function")
         return
      }

      //      return PhoneGap.exec(success, fail, "com.phonegap.barcodeScanner", "encode", [
      return cordovaRef.exec(success, fail, 'BarCodeScanner', 'encode', [
      {
         type : type,
         data : data,
         options : options
      }])
   }
   //-------------------------------------------------------------------
   cordovaRef.addConstructor(function()
   {
      if(!window.plugins)
      {
         window.plugins =
         {
         };
      }
      window.plugins.barcodeScanner = new BarcodeScanner();
   });
})(window.cordova || window.Cordova || window.PhoneGap);

/**
 * QRCodeReader uploads a file to a remote server.
 */
(function()
{
   var cordovaRef = window.cordova;
   // old to new fallbacks

   QRCodeReader = function()
   {
   }
   QRCodeReader.ErrorResultType =
   {
      Cancelled : 0,
      Failed : 1,
      Success : 2
   }
   //Values are "Nigma", "RL", "Default";
   QRCodeReader.prototype.scanType = "Default";

   /**
    * Given an absolute file path, uploads a file on the device to a remote server
    * using a multipart HTTP request.
    * @param successCallback (Function}  Callback to be invoked when upload has completed
    * @param errorCallback {Function}    Callback to be invoked upon error
    */
   QRCodeReader.prototype.getCode = function(successCallback, errorCallback, options)
   {
      // successCallback required
      if( typeof successCallback != "function")
      {
         console.log("QRCodeReader Error: successCallback is not a function");
         return;
      }

      // errorCallback optional
      if(errorCallback && ( typeof errorCallback != "function"))
      {
         console.log("QRCodeReader Error: errorCallback is not a function");
         return;
      }

      console.log("ScanType is [" + this.scanType + "]");
      switch (this.scanType)
      {
         case 'RL' :
         case 'Nigma' :
         {
            cordovaRef.exec(successCallback, errorCallback, 'QRCodeReader' + this.scanType, 'getCode', []);
            break;
         }
         case 'Default' :
         {
            window.plugins.barcodeScanner.scan(successCallback, errorCallback, options);
            break;
         }
         default:
            cordovaRef.exec(successCallback, errorCallback, 'QRCodeReaderRL', 'getCode', []);
            break;
      }
   };

   QRCodeReader.prototype._didNotFinishWithResult = function(fileError)
   {
      console.log("ErrorCode = " + fileError)
      pluginResult.message = fileError;
      return pluginResult;
   }

   QRCodeReader.prototype._didFinishWithResult = function(pluginResult)
   {
      var result =
      {
         //responseCode = pluginResult.message.responseCode
         response : decodeURIComponent(pluginResult.message.response)
      }
      pluginResult.message = result;

      return pluginResult;
   };

   cordovaRef.addConstructor(function()
   {
      if(!window.plugins)
      {
         window.plugins =
         {
         };
      }
      window.plugins.qrCodeReader = new QRCodeReader();
   });
})();
// window.plugins.emailComposer

EmailComposer =
{
   ComposeResultType :
   {
      Cancelled : 0,
      Saved : 1,
      Sent : 2,
      Failed : 3,
      NotSent : 4
   }
};

(function(cordova)
{
   function EmailComposer()
   {
      this.resultCallback = null;
      // Function
   }

   // showEmailComposer : all args optional

   EmailComposer.prototype.showEmailComposer = function(subject, body, toRecipients, ccRecipients, bccRecipients, bIsHTML, images)
   {
      var args =
      {
      };
      if (toRecipients)
         args.toRecipients = toRecipients;
      if (ccRecipients)
         args.ccRecipients = ccRecipients;
      if (bccRecipients)
         args.bccRecipients = bccRecipients;
      if (subject)
         args.subject = subject;
      if (body)
         args.body = body;
      if (bIsHTML)
         args.bIsHTML = bIsHTML;
      if (images)
         args.images = images;

      cordova.exec(null, null, "EmailComposer", "showEmailComposer", [args]);
   }
   // this will be forever known as the orch-func -jm
   EmailComposer.prototype.showEmailComposerWithCB = function(cbFunction, subject, body, toRecipients, ccRecipients, bccRecipients, bIsHTML, images)
   {
      this.resultCallback = cbFunction;
      this.showEmailComposer.apply(this, [subject, body, toRecipients, ccRecipients, bccRecipients, bIsHTML, images]);
   }

   EmailComposer.prototype._didFinishWithResult = function(res)
   {
      this.resultCallback(res);
   }
   //-------------------------------------------------------------------
   cordova.addConstructor(function()
   {
      if (!window.plugins)
      {
         window.plugins =
         {
         };
      }
      window.plugins.emailComposer = new EmailComposer();
   });
})(window.cordova || window.Cordova || window.PhoneGap);
/**
 * cordova Web Intent plugin
 * Copyright (c) Boris Smus 2010
 *
 */
var WebIntent = function() { 

};

WebIntent.ACTION_SEND = "android.intent.action.SEND";
WebIntent.ACTION_VIEW= "android.intent.action.VIEW";
WebIntent.EXTRA_TEXT = "android.intent.extra.TEXT";
WebIntent.EXTRA_SUBJECT = "android.intent.extra.SUBJECT";
WebIntent.EXTRA_STREAM = "android.intent.extra.STREAM";
WebIntent.EXTRA_EMAIL = "android.intent.extra.EMAIL";

WebIntent.prototype.startActivity = function(params, success, fail) {
	return cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'startActivity', [params]);
};

WebIntent.prototype.hasExtra = function(params, success, fail) {
	return cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'hasExtra', [params]);
};

WebIntent.prototype.getUri = function(success, fail) {
	return cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'getUri', []);
};

WebIntent.prototype.getExtra = function(params, success, fail) {
	return cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'getExtra', [params]);
};


WebIntent.prototype.onNewIntent = function(callback) {
	return cordova.exec(function(args) {
		callback(args);
    }, function(args) {
    }, 'WebIntent', 'onNewIntent', []);
};

WebIntent.prototype.sendBroadcast = function(params, success, fail) {
    return cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'WebIntent', 'sendBroadcast', [params]);
};

cordova.addConstructor(function() {
	window.webintent = new WebIntent();
	
	// backwards compatibility	
	window.plugins = window.plugins || {};
	window.plugins.webintent = window.webintent;
});
(function(cordova)
{
   /**
    * @constructor
    */
   var Twitter = function()
   {
   };
   /**
    * Checks if the Twitter SDK is loaded
    * @param {Function} response callback on result
    * @param {Number} response.response is 1 for success, 0 for failure
    * @example
    *      window.plugins.twitter.isTwitterAvailable(function (response) {
    *          console.log("twitter available? " + response);
    *      });
    */
   Twitter.prototype.isTwitterAvailable = function(response)
   {
      cordova.exec(response, null, "TwitterPlugin", "isTwitterAvailable", []);
   };
   /**
    * Checks if the Twitter SDK can send a tweet
    * @param {Function} response callback on result
    * @param {Number} response.response is 1 for success, 0 for failure
    * @example
    *      window.plugins.twitter.isTwitterSetup(function (r) {
    *          console.log("twitter configured? " + r);
    *      });
    */
   Twitter.prototype.isTwitterSetup = function(response)
   {
      cordova.exec(response, null, "TwitterPlugin", "isTwitterSetup", []);
   };
   /**
    * Sends a Tweet to Twitter
    * @param {Function} success callback
    * @param {Function} failure callback
    * @param {String} failure.error reason for failure
    * @param {String} tweetText message to send to twitter
    * @param {Object} options (optional)
    * @param {String} options.urlAttach URL to embed in Tweet
    * @param {String} options.imageAttach Image URL to embed in Tweet
    * @param {Number} response.response - 1 on success, 0 on failure
    * @example
    *     window.plugins.twitter.composeTweet(
    *         function () { console.log("tweet success"); },
    *         function (error) { console.log("tweet failure: " + error); },
    *         "Text, Image, URL",
    *         {
    *             urlAttach:"http://m.youtube.com/#/watch?v=obx2VOtx0qU",
    *             imageAttach:"http://i.ytimg.com/vi/obx2VOtx0qU/hqdefault.jpg?w=320&h=192&sigh=QD3HYoJj9dtiytpCSXhkaq1oG8M"
    *         }
    * );
    */
   Twitter.prototype.composeTweet = function(success, failure, tweetText, options)
   {
      options = options ||
      {
      };
      options.text = tweetText;
      cordova.exec(success, failure, "TwitterPlugin", "composeTweet", [options]);
   };
   /**
    * Gets Tweets from Twitter Timeline
    * @param {Function} success callback
    * @param {Object[]} success.response Tweet objects, see [Twitter Timeline Doc]
    * @param {Function} failure callback
    * @param {String} failure.error reason for failure
    * @example
    *     window.plugins.twitter.getPublicTimeline(
    *         function (response) { console.log("timeline success: " + JSON.stringify(response)); },
    *         function (error) { console.log("timeline failure: " + error); }
    *     );
    *
    * [Twitter Timeline Doc]: https://dev.twitter.com/docs/api/1/get/statuses/public_timeline
    */
   Twitter.prototype.getPublicTimeline = function(success, failure)
   {
      cordova.exec(success, failure, "TwitterPlugin", "getPublicTimeline", []);
   };
   /**
    * Gets Tweets from Twitter Mentions
    * @param {Function} success callback
    * @param {Object[]} success.result Tweet objects, see [Twitter Mentions Doc]
    * @param {Function} failure callback
    * @param {String} failure.error reason for failure
    * @example
    *     window.plugins.twitter.getMentions(
    *         function (response) { console.log("mentions success: " + JSON.stringify(response)); },
    *         function (error) { console.log("mentions failure: " + error); }
    *     );
    *
    * [Twitter Timeline Doc]: https://dev.twitter.com/docs/api/1/get/statuses/public_timeline
    */
   Twitter.prototype.getMentions = function(success, failure)
   {
      cordova.exec(success, failure, "TwitterPlugin", "getMentions", []);
   };
   /**
    * Gets Tweets from Twitter Mentions API
    * @param {Function} success callback
    * @param {String} success.response Twitter Username
    * @param {Object[]} success.result Tweet objects, see [Twitter Mentions Doc]
    * @param {Function} failure callback
    * @param {String} failure.error reason for failure
    *
    * [Twitter Mentions Doc]: https://dev.twitter.com/docs/api/1/get/statuses/mentions
    */
   Twitter.prototype.getTwitterUsername = function(success, failure)
   {
      cordova.exec(success, failure, "TwitterPlugin", "getTwitterUsername", []);
   };
   /**
    * Gets Tweets from Twitter Mentions API
    * @param {String} url of [Twitter API Endpoint]
    * @param {Object} params key-value map, matching [Twitter API Endpoint]
    * @param {Function} success callback
    * @param {Object[]} success.response objects returned from Twitter API (Tweets, Users,...)
    * @param {Function} failure callback
    * @param {String} failure.error reason for failure
    * @param {Object} options (optional) other options for the HTTP request
    * @param {String} options.requestMethod HTTP Request type, ex: "POST"
    * @example
    *     window.plugins.twitter.getTWRequest(
    *          'users/lookup.json',
    *          {user_id: '16141659,783214,6253282'},
    *          function (response) { console.log("usersLookup success: " + JSON.stringify(response)); },
    *          function (error) { console.log("usersLookup failure: " + error); },
    *          {requestMethod: 'POST'}
    *     );
    *
    * [Twitter API Endpoints]: https://dev.twitter.com/docs/api
    */
   Twitter.prototype.getTWRequest = function(url, params, success, failure, options)
   {
      options = options ||
      {
      };
      options.url = url;
      options.params = params;
      cordova.exec(success, failure, "TwitterPlugin", "getTWRequest", [options]);
   };
   // Plug in to Cordova
   cordova.addConstructor(function()
   {

      if (!window.plugins)
         window.plugins =
         {
         };
      window.plugins.twitter = new Twitter();
   });
})(window.cordova || window.Cordova || window.PhoneGap);
// **************************************************************************
// Ext.dom.Element
// **************************************************************************
Ext.define('Genesis.dom.Element',
{
   override : 'Ext.dom.Element',
   // Bug fix for adding units
   setMargin : function(margin, unit)
   {
      if (margin || margin === 0)
      {
         margin = this.self.unitizeBox((margin === true) ? 5 : margin, unit);
      }
      else
      {
         margin = null;
      }
      this.dom.style.margin = margin;
   },
   setPadding : function(padding, unit)
   {
      if (padding || padding === 0)
      {
         padding = this.self.unitizeBox((padding === true) ? 5 : padding, unit);
      }
      else
      {
         padding = null;
      }
      this.dom.style.padding = padding;
   },
   replaceCls : function(oldName, newName, prefix, suffix)
   {
      // If nothing has changed, why are we removing all classes and readding them causing a repaint?
      if (Ext.isArray(oldName) && Ext.isArray(newName) && oldName.join() === newName.join())
      {
         return;
      }
      return this.removeCls(oldName, prefix, suffix).addCls(newName, prefix, suffix);
   }
});

// **************************************************************************
// Ext.Component
// **************************************************************************
Ext.define('Genesis.Component',
{
   override : 'Ext.Component',
   // Bug fix for adding "units"
   updatePadding : function(padding)
   {
      this.innerElement.setPadding(padding, this.getInitialConfig().defaultUnit);
   },
   updateMargin : function(margin)
   {
      this.element.setMargin(margin, this.getInitialConfig().defaultUnit);
   }
});

// **************************************************************************
// Ext.util.Collection
// **************************************************************************
Ext.define('Genesis.util.Collection',
{
   override : 'Ext.util.Collection',
   // Bug fix
   clear : function()
   {
      this.callParent(arguments);
      this.indices =
      {
      };
   }
});

// **************************************************************************
// Ext.Mask
// **************************************************************************
Ext.define('Genesis.Mask',
{
   override : 'Ext.Mask',
   onEvent : function(e)
   {
      var controller = arguments[arguments.length - 1];

      if (controller.info.eventName === 'tap')
      {
         this.fireEvent('tap', this, e);
         return false;
      }

      // Propagate the event
      /*
       if (e && e.stopEvent)
       {
       e.stopEvent();
       }
       */

      return false;
   }
});

// **************************************************************************
// Ext.data.reader.Json
// **************************************************************************
Ext.define('Genesis.data.reader.Json',
{
   override : 'Ext.data.reader.Json',
   getResponseData : function(response)
   {
      var data;
      if (response && response.responseText)
      {
         //console.debug("ResponseText - \n" + response.responseText);
      }
      data = this.callParent(arguments);
      if (!data.metaData)
      {
         delete this.metaData;
      }
      return data;
   }
});

Ext.define('Genesis.data.writer.Writer',
{
   override : 'Ext.data.writer.Writer',
   writeDate : function(field, date)
   {
      if (date)
      {
         return this.callParent(arguments);
      }

      return null;
   }
});

// **************************************************************************
// Ext.data.proxy.Server
// **************************************************************************
Ext.define('Genesis.data.proxy.Server',
{
   override : 'Ext.data.proxy.Server',
   errorResponseHandlerFn : function(metaData, messages, success, operation, request, response, callback, scope)
   {
      var me = this, action = operation.getAction(), app = _application;
      var viewport = app.getController(((!merchantMode) ? 'client' : 'server') + '.Viewport');

      switch (metaData['rescode'])
      {
         case 'unregistered_account' :
         {
            break;
         }
         //
         // Error from server, display this to user
         //
         case 'server_error' :
         {
            Ext.device.Notification.show(
            {
               title : 'Server Error(s)',
               message : messages,
               buttons : ['Dismiss'],
               callback : function(btn)
               {
                  if (metaData['session_timeout'])
                  {
                     viewport.resetView();
                     viewport.redirectTo('login');
                     return;
                  }
                  else
                  {
                     //
                     // No need to take any action. Let to user try again.
                     //
                  }
               }
            });
            break;
         }
         //
         // Sign in failed due to invalid Facebook info, Create Account.
         //
         case 'login_invalid_facebook_info' :
         {
            Ext.device.Notification.show(
            {
               title : 'Create Account',
               message : Genesis.constants.createAccountMsg,
               buttons : ['OK'],
               callback : function(btn)
               {
                  viewport.setLoggedIn(false);
                  viewport.redirectTo('createAccount');
               }
            });
            return;
         }
         case 'update_account_invalid_info' :
         case 'signup_invalid_info' :
         case 'update_account_invalid_facebook_info' :
         case 'login_invalid_info' :
         {
            Ext.device.Notification.show(
            {
               title : 'Login Error',
               message : messages,
               buttons : ['Dismiss'],
               callback : function(btn)
               {
                  viewport.resetView();
                  viewport.redirectTo('login');
               }
            });
            return;
         }
         default:
            //console.log("Error - " + metaData['rescode']);
            if (messages && (messages != 'Error Connecting to Server'))
            {
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : messages,
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     if (me._errorCallback)
                     {
                        me._errorCallback();
                        delete me._errorCallback;
                     }
                  }
               });
            }
            else if (operation.initialConfig.doNotRetryAttempt)
            {
               Ext.device.Notification.show(
               {
                  title : 'Network Error',
                  message : "Error Contacting Server",
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     if (me._errorCallback)
                     {
                        me._errorCallback();
                        delete me._errorCallback;
                     }
                  }
               });
            }
            break;
      }
      console.debug("Ajax ErrorHandler called. Operation(" + operation.wasSuccessful() + ")" + //
      ((messages) ? '\n' + messages : ''));
      me.fireEvent('exception', me, response, operation);
   },
   processResponse : function(success, operation, request, response, callback, scope)
   {
      var me = this, action = operation.getAction(), reader = me.getReader(), resultSet, messages, metaData;

      //console.debug("request = [" + Ext.encode(operation.initialConfig) + "]");
      if (response.timedout || ((response.status == 0) && (!request.aborted) && (!operation.initialConfig.doNotRetryAttempt)))
      {
         if (!me.quiet)
         {
            Ext.device.Notification.show(
            {
               title : 'Server Timeout',
               message : "Error Contacting Server",
               buttons : ['Try Again', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() == 'try again')
                  {
                     me.afterRequest(request, success);
                     //
                     // Resend request
                     //
                     Ext.Ajax.request(response.request.options);
                  }
                  else
                  {
                     response.timedout = false;
                     request.aborted = true;
                     success = false;
                     operation.success = false;
                     me.processResponse(success, operation, request, response, callback, scope);
                  }
               }
            });
         }
         else
         {
            me.quiet = false;
            response.timedout = false;
            request.aborted = true;
            success = false;
            operation.success = false;
            me.processResponse(success, operation, request, response, callback, scope);
         };

         return;
      }

      var errorHandler = function()
      {
         messages = ((resultSet && Ext.isDefined(resultSet.getMessage)) ? (Ext.isArray(resultSet.getMessage()) ? resultSet.getMessage().join(Genesis.constants.addCRLF()) : resultSet.getMessage()) : 'Error Connecting to Server');
         metaData = reader.metaData ||
         {
         };
         if (!me.quiet)
         {
            Ext.Viewport.setMasked(null);
         }

         //this callback is the one that was passed to the 'read' or 'write' function above
         if ( typeof callback == 'function')
         {
            callback.call(scope || me, operation);
         }

         if (me.supressErrorsPopup)
         {
            if (!me.quiet)
            {
               me.supressErrorsCallbackFn = function()
               {
                  me.supressErrorsPopup = false;
                  me.errorResponseHandlerFn(metaData, messages, success, operation, request, response, callback, scope);
                  delete me.supressErrorsCallbackFn;
               }
            }
            else
            {
               me.supressErrorsPopup = false;
            }
         }
         else
         {
            me.errorResponseHandlerFn(metaData, messages, success, operation, request, response, callback, scope);
         }
         me.quiet = false;
      };

      if (!response.aborted)
      {
         try
         {
            //console.debug("Response [" + response.responseText + "]");
            resultSet = reader.process(response);
         }
         catch(e)
         {
            console.debug('Ajax call failed with message=[' + e.message + '] url=[' + request.getUrl() + ']');
            operation.setException(operation,
            {
               status : null,
               statusText : e.message
            });

            errorHandler();
            return;
         }
         //if ((success === true) || (Genesis.fn.isNative() === true))
         if (success === true)
         {
            if (operation.process(action, resultSet, request, response) === false)
            {
               errorHandler();
            }
            else
            {
               //this callback is the one that was passed to the 'read' or 'write' function above
               if ( typeof callback == 'function')
               {
                  callback.call(scope || me, operation);
               }
            }
            me.afterRequest(request, success);
            return;
         }
      }
      console.debug('Ajax call failed with status=[' + response.status + '] url=[' + request.getUrl() + ']');
      /**
       * @event exception
       * Fires when the server returns an exception
       * @param {Ext.data.proxy.Proxy} this
       * @param {Object} response The response from the AJAX request
       * @param {Ext.data.Operation} operation The operation that triggered request
       */
      //
      // Override Default Error Messages
      //
      if (messages)
      {
         operation.setException(operation,
         {
            status : null,
            statusText : messages
         });
      }
      else
      {
         me.setException(operation, response);
      }

      if (!response.aborted)
      {
         errorHandler();
      }
      me.afterRequest(request, success);
   },
   /**
    * Creates and returns an Ext.data.Request object based on the options passed by the {@link Ext.data.Store Store}
    * that this Proxy is attached to.
    * @param {Ext.data.Operation} operation The {@link Ext.data.Operation Operation} object to execute
    * @return {Ext.data.Request} The request object
    */
   buildRequest : function(operation)
   {
      var db = Genesis.db.getLocalDB();
      if (db['auth_code'])
      {
         this.setExtraParam("auth_token", db['auth_code']);
      }
      else
      {
         delete this.getExtraParams()["auth_token"];
      }

      var request = this.callParent(arguments);

      if (operation.initialConfig.jsonData)
      {
         request.setJsonData(operation.initialConfig.jsonData);
      }

      return request;
   }
});

// **************************************************************************
// Ext.data.Connection
// **************************************************************************
Ext.define('Genesis.data.Connection',
{
   override : 'Ext.data.Connection',

   /**
    * Setup all the headers for the request
    * @private
    * @param {Object} xhr The xhr object
    * @param {Object} options The options for the request
    * @param {Object} data The data for the request
    * @param {Object} params The params for the request
    */
   setupHeaders : function(xhr, options, data, params)
   {
      var me = this;
      options = options ||
      {
      };
      var db = Genesis.db.getLocalDB();
      var method = (options.method || me.getMethod() || ((params || data) ? 'POST' : 'GET')).toUpperCase();
      options.headers = Ext.apply(options.headers,
      {
         'Accept' : '*/*'
      });
      if (db['auth_code'] && (method == 'POST'))
      {
         options.headers = Ext.apply(options.headers,
         {
            'X-CSRF-Token' : db['csrf_code']
         });
      }
      var headers = me.callParent(arguments);

      //console.debug("Remote Ajax Call Header -\n" + Ext.encode(headers));
      return headers;
   },
   /**
    * Checks if the response status was successful
    * @param {Number} status The status code
    * @return {Object} An object containing success/status state
    */
   parseStatus : function(status, xhr)
   {
      // see: https://prototype.lighthouseapp.com/projects/8886/tickets/129-ie-mangles-http-response-status-code-204-to-1223
      status = status == 1223 ? 204 : status;

      var success = (status >= 200 && status < 300) || status == 304, isException = false;

      //console.debug("xhr[" + Ext.encode(xhr));
      if (!xhr.onreadystatechange)
      {
         success = false;
      }
      /*
       else
       if (Genesis.fn.isNative() && (status === 0))
       {
       success = true;
       }
       */

      if (!success)
      {
         switch (status)
         {
            case 12002:
            case 12029:
            case 12030:
            case 12031:
            case 12152:
            case 13030:
               isException = true;
               break;
         }
      }
      return (
         {
            success : success,
            isException : isException
         });
   }
});

Ext.define('Genesis.field.Text',
{
   override : 'Ext.field.Text',
   updateReadOnly : function(newReadOnly)
   {
      this[(newReadOnly)?'addCls' : 'removeCls']('readOnly');
      this.callParent(arguments);
   }
});

// **************************************************************************
// Ext.field.Select
// **************************************************************************
Ext.define('Genesis.field.Select',
{
   override : 'Ext.field.Select',
   // @private
   getListPanel : function()
   {
      if (!this.listPanel)
      {
         this.listPanel = Ext.create('Ext.Panel',
         {
            top : 0,
            left : 0,
            height : '9em',
            modal : true,
            cls : Ext.baseCSSPrefix + 'select-overlay',
            layout : 'fit',
            hideOnMaskTap : true,
            items :
            {
               xtype : 'list',
               store : this.getStore(),
               itemTpl : '<span class="x-list-label">{' + this.getDisplayField() + '}</span>',
               listeners :
               {
                  select : this.onListSelect,
                  itemtap : this.onListTap,
                  scope : this
               }
            }
         });
      }

      return this.listPanel;
   }
});

// **************************************************************************
// Ext.dataview.DataView
// **************************************************************************
Ext.define('Genesis.dataview.DataView',
{
   override : 'Ext.dataview.DataView',
   updateStore : function(newStore, oldStore)
   {
      var me = this, bindEvents = Ext.apply(
      {
      }, me.storeEventHooks,
      {
         scope : me
      }), proxy, reader;

      if (oldStore && Ext.isObject(oldStore) && oldStore.isStore)
      {
         oldStore.un(bindEvents);

         if (!me.isDestroyed)
         {
            me.onStoreClear();
         }

         if (oldStore.getAutoDestroy())
         {
            oldStore.destroy();
         }
         else
         {
            proxy = oldStore.getProxy();
            if (proxy)
            {
               reader = proxy.getReader();
               if (reader)
               {
                  reader.un('exception', 'handleException', this);
               }
            }
         }
      }

      if (newStore)
      {
         if (newStore.isLoaded())
         {
            this.hasLoadedStore = true;
         }

         if (newStore.isLoading())
         {
            me.onBeforeLoad();
         }
         if (me.container)
         {
            me.refresh();
         }
      }
   },
   destroy : function()
   {
      var store = this.getStore(), proxy = (store && store.getProxy()), reader = (proxy && proxy.getReader());

      if (reader)
      {
         // TODO: Use un() instead of clearListeners() when TOUCH-2723 is fixed.
         //          reader.un('exception', 'handleException', this);
         reader.clearListeners();
      }

      this.callSuper(arguments);

      this.setStore(null);
   }
});

// **************************************************************************
// Ext.dataview.element.List
// **************************************************************************
/**
 * @private
 */
Ext.define('Genesis.dataview.element.List',
{
   override : 'Ext.dataview.element.List',

   updateListItem : function(record, item)
   {
      var me = this, dataview = me.dataview, extItem = Ext.fly(item), innerItem = extItem.down(me.labelClsCache, true), data = dataview.prepareData(record.getData(true), dataview.getStore().indexOf(record), record), disclosureProperty = dataview.getDisclosureProperty(), hasDisclosureProperty, iconSrc = data && data.hasOwnProperty('iconSrc'), disclosureEl, iconEl;

      innerItem.innerHTML = dataview.getItemTpl().apply(data);

      hasDisclosureProperty = data && data.hasOwnProperty(disclosureProperty);
      if (hasDisclosureProperty)
      {
         disclosureEl = extItem.down(me.disclosureClsCache);
         disclosureEl[data[disclosureProperty] === false ? 'addCls' : 'removeCls'](me.hiddenDisplayCache);
      }

      if (dataview.getIcon())
      {
         iconEl = extItem.down(me.iconClsCache, true);
         iconEl.style.backgroundImage = iconSrc ? 'url("' + iconSrc + '")' : '';
      }
   }
});

// **************************************************************************
// Ext.tab.Bar
// **************************************************************************
/**
 * @private
 */
Ext.define('Genesis.tab.Bar',
{
   override : 'Ext.tab.Bar',

   /**
    * @private
    * Fires off the tabchange action
    */
   doSetActiveTab : function(newTab, oldTab)
   {
      this.callParent(arguments);
      this.fireAction('tabchange', [this, newTab, oldTab]);
   }
});

// **************************************************************************
// Ext.MessageBox
// **************************************************************************
Ext.define('Genesis.MessageBox',
{
   override : 'Ext.MessageBox',
   /**
    * Adds the new {@link Ext.Toolbar} instance into this container.
    * @private
    */
   updateButtons : function(newButtons)
   {
      var me = this;

      if (newButtons)
      {
         if (me.buttonsToolbar)
         {
            me.buttonsToolbar.removeAll();
            me.buttonsToolbar.setItems(newButtons);
         }
         else
         {
            me.buttonsToolbar = Ext.create('Ext.Toolbar',
            {
               docked : 'bottom',
               height : "2.6em",
               defaultType : 'button',
               layout :
               {
                  type : 'hbox',
                  pack : 'center'
               },
               ui : me.getUi(),
               cls : me.getBaseCls() + '-buttons',
               items : newButtons
            });

            me.add(me.buttonsToolbar);
         }
      }
   },
   // @private
   // pass `fn` config to show method instead
   onClick : function(button)
   {
      if (button && this._hideCallbackFn)
      {
         this.getModal().un('hide', this._hideCallbackFn, Ext.device.Notification);
         delete this._hideCallbackFn;
      }

      this.callParent(arguments);
   }
});

// **************************************************************************
// Ext.device.connection.PhoneGap
// **************************************************************************
Ext.define('Genesis.device.connection.PhoneGap',
{
   override : 'Ext.device.connection.PhoneGap',
   syncOnline : function()
   {
      var type = navigator.connection.type;
      this._type = type;
      this._online = type != Connection.NONE;
   }
});
// **************************************************************************
// Ext.device.notification.Abstract
// **************************************************************************
Ext.define('Ext.device.notification.Abstract',
{
   /**
    * A simple way to show a notification.
    *
    *     Ext.device.Notification.show({
    *        title: 'Verification',
    *        message: 'Is your email address is: test@sencha.com',
    *        buttons: Ext.MessageBox.OKCANCEL,
    *        callback: function(button) {
    *            if (button == "ok") {
    *                console.log('Verified');
    *            } else {
    *                console.log('Nope.');
    *            }
    *        }
    *     });
    *
    * @param {Object} config An object which contains the following config options:
    *
    * @param {String} config.title The title of the notification
    *
    * @param {String} config.message The message to be displayed on the notification
    *
    * @param {String/String[]} [config.buttons="OK"]
    * The buttons to be displayed on the notification. It can be a string, which is the title of the button, or an array of multiple
    * strings.
    * Please not that you should not use more than 2 buttons, as they may not be displayed correct on all devices.
    *
    * @param {Function} config.callback
    * A callback function which is called when the notification is dismissed by clicking on the configured buttons.
    * @param {String} config.callback.buttonId The id of the button pressed, one of: 'ok', 'yes', 'no', 'cancel'.
    *
    * @param {Object} config.scope The scope of the callback function
    */
   show : function(config)
   {
      if (!config.message)
      {
         throw ('[Ext.device.Notification#show] You passed no message');
      }

      if (config.buttons)
      {
         if (!Ext.isArray(config.buttons))
         {
            config.buttons = [config.buttons];
         }
      }
      else
      {
         config.buttons = null;
      }

      if (!config.scope)
      {
         config.scope = this;
      }

      return config;
   },
   /**
    * Vibrates the device.
    */
   vibrate : Ext.emptyFn
});

// **************************************************************************
// Ext.device.notification.PhoneGap
// **************************************************************************
/*
 Ext.define('Ext.device.notification.PhoneGap',
 {
 extend : 'Ext.device.notification.Abstract',
 requires : ['Ext.device.Communicator'],
 show : function(config)
 {
 config = this.callParent(arguments)
 var buttons = (config.buttons) ? config.buttons.join(',') : null;

 var ln = (buttons) ? buttons.length : 0;
 var onShowCallback = function(index)
 {
 if (index > ln)
 {
 if (config.callback)
 {
 config.callback.apply(config.scope, [index]);
 }
 return;
 }

 if (!index || (index < 1))
 {
 index = (config.buttons) ? config.buttons.length : 1;
 }
 if (config.callback)
 {
 config.callback.apply(config.scope, (config.buttons) ? [config.buttons[index - 1].toLowerCase()] : []);
 }
 };

 // change Ext.MessageBox buttons into normal arrays
 if ((ln > 0) && typeof buttons[0] != "string")
 {
 var newButtons = [], i;

 for ( i = 0; i < ln; i++)
 {
 newButtons.push(buttons[i].text);
 }

 buttons = newButtons;
 }

 navigator.notification.confirm(config.message, // message
 onShowCallback, // callback
 config.title, // title
 buttons // array of button names
 );
 },
 */

Ext.define('Ext.device.notification.Simulator',
{
   extend : 'Ext.device.notification.Abstract',
   requires : ['Ext.MessageBox'],
   // @private
   msg : null,
   show : function()
   {
      var config = this.callSuper(arguments), buttons = [], ln = config.buttons.length, button, i, callback, msg;

      //buttons
      for ( i = 0; i < ln; i++)
      {
         button = config.buttons[i];
         if (Ext.isString(button))
         {
            button =
            {
               text : config.buttons[i],
               itemId : config.buttons[i].toLowerCase()
            };
         }

         buttons.push(button);
      }

      if (this.msg)
      {
         this.msg.destroy();
      }
      if (config.disableAnimations)
      {
         this.msg = Ext.create('Ext.MessageBox',
         {
            showAnimation : null,
            hideAnimation : null
         });
         this.msg.defaultAllowedConfig.showAnimation = false;
         this.msg.defaultAllowedConfig.hideAnimation = false;
      }
      else
      {
         this.msg = Ext.create('Ext.MessageBox');
      }

      msg = this.msg;
      msg.setHideOnMaskTap((!config.ignoreOnHide) ? true : false);
      callback = function(itemId)
      {
         if (config.callback)
         {
            //
            // Prevent UI from being blocked
            //
            Ext.defer(function()
            {
               config.callback.apply(config.scope, [itemId]);
            }, 1);
         }
      };
      var itemId = (buttons.length >= 1) ? buttons[buttons.length - 1].itemId : "";
      msg._hideCallbackFn = Ext.bind(callback, this, [itemId]);
      msg.getModal().on('hide', msg._hideCallbackFn, this);

      msg.show(
      {
         title : config.title,
         message : config.message,
         scope : msg,
         buttons : buttons,
         fn : callback
      });
   },
   beep : Ext.emptyFn,
   vibrate : Ext.emptyFn,
   dismiss : function()
   {
      var msg = this.msg
      if (msg)
      {
         if (msg._hideCallbackFn)
         {
            msg._hideCallbackFn();
         }
         msg.hide();
      }
      //navigator.notification.dismiss();
   }
});

Ext.define('Ext.device.notification.PhoneGap',
{
   extend : 'Ext.device.notification.Simulator'
});

Ext.define('Ext.device.notification.Sencha',
{
   extend : 'Ext.device.notification.Simulator'
});

Ext.define('Ext.device.Notification',
{
   singleton : true,

   requires : ['Ext.device.notification.Sencha', 'Ext.device.notification.Simulator'],

   constructor : function()
   {
      var browserEnv = Ext.browser.is;

      if (browserEnv.WebView)
      {
         if (browserEnv.PhoneGap)
         {
            return Ext.create('Ext.device.notification.PhoneGap');
         }
         else
         {
            return Ext.create('Ext.device.notification.Sencha');
         }
      }
      else
      {
         return Ext.create('Ext.device.notification.Simulator');
      }
   }
});

// **************************************************************************
// Ext.util.Geolocation
// **************************************************************************
Ext.define('Genesis.util.Geolocation',
{
   override : 'Ext.util.Geolocation',
   parseOptions : function()
   {
      var timeout = this.getTimeout(), ret =
      {
         maximumAge : this.getMaximumAge(),
         allowHighAccuracy : this.getAllowHighAccuracy(),
         enableHighAccuracy : this.getAllowHighAccuracy()
      };

      //Google doesn't like Infinity
      if (timeout !== Infinity)
      {
         ret.timeout = timeout;
      }
      console.debug("Geolocation - " + Ext.encode(ret));
      return ret;
   }
});

// **************************************************************************
// Ext.data.proxy.Memory
// **************************************************************************
Ext.define('Genesis.data.proxy.PagingMemory',
{
   extend : 'Ext.data.proxy.Memory',
   alias : 'proxy.pagingmemory',
   alternateClassName : 'Genesis.data.PagingMemoryProxy',
   /**
    * Reads data from the configured {@link #data} object. Uses the Proxy's {@link #reader}, if present.
    * @param {Ext.data.Operation} operation The read Operation
    * @param {Function} callback The callback to call when reading has completed
    * @param {Object} scope The scope to call the callback function in
    */
   read : function(operation, callback, scope)
   {
      var me = this, reader = me.getReader();
      var data =
      {
         data : reader.getRoot(me.getData()).slice(operation.getStart(), operation.getStart() + operation.getLimit()),
         total : reader.getTotal(me.getData())
      }

      if (operation.process('read', reader.process(data)) === false)
      {
         this.fireEvent('exception', this, null, operation);
      }

      Ext.callback(callback, scope || me, [operation]);
   },
});

// **************************************************************************
// Ext.plugin.ListPaging
// **************************************************************************
Ext.define('Genesis.plugin.ListPaging',
{
   extend : 'Ext.plugin.ListPaging',
   /**
    * @private
    */
   loadNextPage : function()
   {
      var me = this;
      if (!me.storeFullyLoaded())
      {
         me.callParent(arguments);
      }
   }
});

// **************************************************************************
// Ext.plugin.PullRefresh
// **************************************************************************
Ext.define('Genesis.plugin.PullRefresh',
{
   override : 'Ext.plugin.PullRefresh',
   resetRefreshState : function()
   {
      Ext.device.Notification.beep(1);
      this.callParent(arguments);
   }
});
/**
 * @private
 */
Ext.define('Ext.device.notification.Sencha', {
    extend: 'Ext.device.notification.Abstract',
    requires: ['Ext.device.Communicator'],

    show: function() {
        var config = this.callParent(arguments);

        Ext.device.Communicator.send({
            command: 'Notification#show',
            callbacks: {
                callback: config.callback
            },
            scope  : config.scope,
            title  : config.title,
            message: config.message,
            buttons: config.buttons.join(',') //@todo fix this
        });
    },

    vibrate: function() {
        Ext.device.Communicator.send({
            command: 'Notification#vibrate'
        });
    }
});
/**
 * @private
 */
Ext.define('Ext.device.notification.Simulator', {
    extend: 'Ext.device.notification.Abstract',
    requires: ['Ext.MessageBox'],

    // @private
    msg: null,

	show: function() {
        var config = this.callParent(arguments),
            buttons = [],
            ln = config.buttons.length,
            button, i, callback, msg;

        //buttons
        for (i = 0; i < ln; i++) {
            button = config.buttons[i];
            if (Ext.isString(button)) {
                button = {
                    text: config.buttons[i],
                    itemId: config.buttons[i].toLowerCase()
                };
            }

            buttons.push(button);
        }

        this.msg = Ext.create('Ext.MessageBox');

        msg = this.msg;

        callback = function(itemId) {
            if (config.callback) {
                config.callback.apply(config.scope, [itemId]);
            }
        };

        this.msg.show({
            title  : config.title,
            message: config.message,
            scope  : this.msg,
            buttons: buttons,
            fn     : callback
        });
    },

    vibrate: function() {
        //nice animation to fake vibration
        var animation = [
            "@-webkit-keyframes vibrate{",
            "    from {",
            "        -webkit-transform: rotate(-2deg);",
            "    }",
            "    to{",
            "        -webkit-transform: rotate(2deg);",
            "    }",
            "}",

            "body {",
            "    -webkit-animation: vibrate 50ms linear 10 alternate;",
            "}"
        ];

        var head = document.getElementsByTagName("head")[0];
        var cssNode = document.createElement('style');
        cssNode.innerHTML = animation.join('\n');
        head.appendChild(cssNode);

        setTimeout(function() {
            head.removeChild(cssNode);
        }, 400);
    }
});
/**
 * Provides a cross device way to show notifications. There are three different implementations:
 *
 * - Sencha Packager
 * - PhoneGap
 * - Simulator
 *
 * When this singleton is instantiated, it will automatically use the correct implementation depending on the current device.
 *
 * Both the Sencha Packager and PhoneGap versions will use the native implementations to display the notification. The
 * Simulator implementation will use {@link Ext.MessageBox} for {@link #show} and a simply animation when you call {@link #vibrate}.
 *
 * ## Examples
 *
 * To show a simple notification:
 *
 *     Ext.device.Notification.show({
 *         title: 'Verification',
 *         message: 'Is your email address: test@sencha.com',
 *         buttons: Ext.MessageBox.OKCANCEL,
 *         callback: function(button) {
 *             if (button === "ok") {
 *                 console.log('Verified');
 *             } else {
 *                 console.log('Nope');
 *             }
 *         }
 *     });
 *
 * To make the device vibrate:
 *
 *     Ext.device.Notification.vibrate();
 * 
 * @mixins Ext.device.notification.Abstract
 *
 * @aside guide native_apis
 */
Ext.define('Ext.device.Notification', {
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.notification.PhoneGap',
        'Ext.device.notification.Sencha',
        'Ext.device.notification.Simulator'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;

        if (browserEnv.WebView) {
            if (browserEnv.PhoneGap) {
                return Ext.create('Ext.device.notification.PhoneGap');
            }
            else {
                return Ext.create('Ext.device.notification.Sencha');
            }
        }
        else {
            return Ext.create('Ext.device.notification.Simulator');
        }
    }
});
/**
 * This class is used to check if the current device is currently online or not. It has three different implementations:
 *
 * - Sencha Packager
 * - PhoneGap
 * - Simulator
 *
 * Both the Sencha Packager and PhoneGap implementations will use the native functionality to determine if the current
 * device is online. The Simulator version will simply use `navigator.onLine`.
 *
 * When this singleton ({@link Ext.device.Connection}) is instantiated, it will automatically decide which version to
 * use based on the current platform.
 *
 * ## Examples
 *
 * Determining if the current device is online:
 *
 *     alert(Ext.device.Connection.isOnline());
 *
 * Checking the type of connection the device has:
 *
 *     alert('Your connection type is: ' + Ext.device.Connection.getType());
 *
 * The available connection types are:
 *
 * - {@link Ext.device.Connection#UNKNOWN UNKNOWN} - Unknown connection
 * - {@link Ext.device.Connection#ETHERNET ETHERNET} - Ethernet connection
 * - {@link Ext.device.Connection#WIFI WIFI} - WiFi connection
 * - {@link Ext.device.Connection#CELL_2G CELL_2G} - Cell 2G connection
 * - {@link Ext.device.Connection#CELL_3G CELL_3G} - Cell 3G connection
 * - {@link Ext.device.Connection#CELL_4G CELL_4G} - Cell 4G connection
 * - {@link Ext.device.Connection#NONE NONE} - No network connection
 * 
 * @mixins Ext.device.connection.Abstract
 *
 * @aside guide native_apis
 */
Ext.define('Ext.device.Connection', {
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.connection.Sencha',
        'Ext.device.connection.PhoneGap',
        'Ext.device.connection.Simulator'
    ],
    
    /**
     * @event onlinechange
     * @inheritdoc Ext.device.connection.Sencha#onlinechange
     */

    constructor: function() {
        var browserEnv = Ext.browser.is;

        if (browserEnv.WebView) {
            if (browserEnv.PhoneGap) {
                return Ext.create('Ext.device.connection.PhoneGap');
            }
            else {
                return Ext.create('Ext.device.connection.Sencha');
            }
        }
        else {
            return Ext.create('Ext.device.connection.Simulator');
        }
    }
});
/**
 * This class allows you to use native APIs to take photos using the device camera.
 *
 * When this singleton is instantiated, it will automatically select the correct implementation depending on the
 * current device:
 *
 * - Sencha Packager
 * - PhoneGap
 * - Simulator
 *
 * Both the Sencha Packager and PhoneGap implementations will use the native camera functionality to take or select
 * a photo. The Simulator implementation will simply return fake images.
 *
 * ## Example
 *
 * You can use the {@link Ext.device.Camera#capture} function to take a photo:
 *
 *     Ext.device.Camera.capture({
 *         success: function(image) {
 *             imageView.setSrc(image);
 *         },
 *         quality: 75,
 *         width: 200,
 *         height: 200,
 *         destination: 'data'
 *     });
 *
 * See the documentation for {@link Ext.device.Camera#capture} all available configurations.
 *
 * @mixins Ext.device.camera.Abstract
 *
 * @aside guide native_apis
 */
Ext.define('Ext.device.Camera', {
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.camera.PhoneGap',
        'Ext.device.camera.Sencha',
        'Ext.device.camera.Simulator'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;

        if (browserEnv.WebView) {
            if (browserEnv.PhoneGap) {
                return Ext.create('Ext.device.camera.PhoneGap');
            }
            else {
                return Ext.create('Ext.device.camera.Sencha');
            }
        }
        else {
            return Ext.create('Ext.device.camera.Simulator');
        }
    }
});
/**
 * This class provides you with a cross platform way of listening to when the the orientation changes on the
 * device your application is running on.
 *
 * The {@link Ext.device.Orientation#orientationchange orientationchange} event gets passes the `alpha`, `beta` and
 * `gamma` values.
 *
 * You can find more information about these values and how to use them on the [W3C device orientation specification](http://dev.w3.org/geo/api/spec-source-orientation.html#deviceorientation).
 *
 * ## Example
 *
 * To listen to the device orientation, you can do the following:
 *
*     Ext.device.Orientation.on({
*         scope: this,
*         orientationchange: function(e) {
*             console.log('Alpha: ', e.alpha);
*             console.log('Beta: ', e.beta);
*             console.log('Gamma: ', e.gamma);
*         }
*     });
 *
 * @mixins Ext.device.orientation.Abstract
 * 
 * @aside guide native_apis
 */
Ext.define('Ext.device.Orientation', {
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.orientation.HTML5',
        'Ext.device.orientation.Sencha'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;

        if (browserEnv.Sencha) {
            return Ext.create('Ext.device.orientation.Sencha');
        }
        else {
            return Ext.create('Ext.device.orientation.HTML5');
        }
    }
});
