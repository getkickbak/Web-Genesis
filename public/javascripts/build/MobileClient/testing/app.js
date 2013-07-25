//@tag dom,core
//@define Ext-more
//@require Ext.EventManager

/**
 * @class Ext
 *
 * Ext is the global namespace for the whole Sencha Touch framework. Every class, function and configuration for the
 * whole framework exists under this single global variable. The Ext singleton itself contains a set of useful helper
 * functions (like {@link #apply}, {@link #min} and others), but most of the framework that you use day to day exists
 * in specialized classes (for example {@link Ext.Panel}, {@link Ext.Carousel} and others).
 *
 * If you are new to Sencha Touch we recommend starting with the [Getting Started Guide][getting_started] to
 * get a feel for how the framework operates. After that, use the more focused guides on subjects like panels, forms and data
 * to broaden your understanding. The MVC guides take you through the process of building full applications using the
 * framework, and detail how to deploy them to production.
 *
 * The functions listed below are mostly utility functions used internally by many of the classes shipped in the
 * framework, but also often useful in your own apps.
 *
 * A method that is crucial to beginning your application is {@link #setup Ext.setup}. Please refer to it's documentation, or the
 * [Getting Started Guide][getting_started] as a reference on beginning your application.
 *
 *     Ext.setup({
 *         onReady: function() {
 *             Ext.Viewport.add({
 *                 xtype: 'component',
 *                 html: 'Hello world!'
 *             });
 *         }
 *     });
 *
 * [getting_started]: #!/guide/getting_started
 */
Ext.setVersion('touch', '2.1.1');

Ext.apply(Ext, {
    /**
     * The version of the framework
     * @type String
     */
    version: Ext.getVersion('touch'),

    /**
     * @private
     */
    idSeed: 0,

    /**
     * Repaints the whole page. This fixes frequently encountered painting issues in mobile Safari.
     */
    repaint: function() {
        var mask = Ext.getBody().createChild({
            cls: Ext.baseCSSPrefix + 'mask ' + Ext.baseCSSPrefix + 'mask-transparent'
        });
        setTimeout(function() {
            mask.destroy();
        }, 0);
    },

    /**
     * Generates unique ids. If the element already has an `id`, it is unchanged.
     * @param {Mixed} el (optional) The element to generate an id for.
     * @param {String} [prefix=ext-gen] (optional) The `id` prefix.
     * @return {String} The generated `id`.
     */
    id: function(el, prefix) {
        if (el && el.id) {
            return el.id;
        }

        el = Ext.getDom(el) || {};

        if (el === document || el === document.documentElement) {
            el.id = 'ext-application';
        }
        else if (el === document.body) {
            el.id = 'ext-viewport';
        }
        else if (el === window) {
            el.id = 'ext-window';
        }

        el.id = el.id || ((prefix || 'ext-element-') + (++Ext.idSeed));

        return el.id;
    },

    /**
     * Returns the current document body as an {@link Ext.Element}.
     * @return {Ext.Element} The document body.
     */
    getBody: function() {
        if (!Ext.documentBodyElement) {
            if (!document.body) {
                throw new Error("[Ext.getBody] document.body does not exist at this point");
            }

            Ext.documentBodyElement = Ext.get(document.body);
        }

        return Ext.documentBodyElement;
    },

    /**
     * Returns the current document head as an {@link Ext.Element}.
     * @return {Ext.Element} The document head.
     */
    getHead: function() {
        if (!Ext.documentHeadElement) {
            Ext.documentHeadElement = Ext.get(document.head || document.getElementsByTagName('head')[0]);
        }

        return Ext.documentHeadElement;
    },

    /**
     * Returns the current HTML document object as an {@link Ext.Element}.
     * @return {Ext.Element} The document.
     */
    getDoc: function() {
        if (!Ext.documentElement) {
            Ext.documentElement = Ext.get(document);
        }

        return Ext.documentElement;
    },

    /**
     * This is shorthand reference to {@link Ext.ComponentMgr#get}.
     * Looks up an existing {@link Ext.Component Component} by {@link Ext.Component#getId id}
     * @param {String} id The component {@link Ext.Component#getId id}
     * @return {Ext.Component} The Component, `undefined` if not found, or `null` if a
     * Class was found.
    */
    getCmp: function(id) {
        return Ext.ComponentMgr.get(id);
    },

    /**
     * Copies a set of named properties from the source object to the destination object.
     *
     * Example:
     *
     *     ImageComponent = Ext.extend(Ext.Component, {
     *         initComponent: function() {
     *             this.autoEl = { tag: 'img' };
     *             MyComponent.superclass.initComponent.apply(this, arguments);
     *             this.initialBox = Ext.copyTo({}, this.initialConfig, 'x,y,width,height');
     *         }
     *     });
     *
     * Important note: To borrow class prototype methods, use {@link Ext.Base#borrow} instead.
     *
     * @param {Object} dest The destination object.
     * @param {Object} source The source object.
     * @param {String/String[]} names Either an Array of property names, or a comma-delimited list
     * of property names to copy.
     * @param {Boolean} [usePrototypeKeys=false] (optional) Pass `true` to copy keys off of the prototype as well as the instance.
     * @return {Object} The modified object.
     */
    copyTo : function(dest, source, names, usePrototypeKeys) {
        if (typeof names == 'string') {
            names = names.split(/[,;\s]/);
        }
        Ext.each (names, function(name) {
            if (usePrototypeKeys || source.hasOwnProperty(name)) {
                dest[name] = source[name];
            }
        }, this);
        return dest;
    },

    /**
     * Attempts to destroy any objects passed to it by removing all event listeners, removing them from the
     * DOM (if applicable) and calling their destroy functions (if available).  This method is primarily
     * intended for arguments of type {@link Ext.Element} and {@link Ext.Component}.
     * Any number of elements and/or components can be passed into this function in a single
     * call as separate arguments.
     * @param {Mixed...} args An {@link Ext.Element}, {@link Ext.Component}, or an Array of either of these to destroy.
     */
    destroy: function() {
        var args = arguments,
            ln = args.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = args[i];

            if (item) {
                if (Ext.isArray(item)) {
                    this.destroy.apply(this, item);
                }
                else if (Ext.isFunction(item.destroy)) {
                    item.destroy();
                }
            }
        }
    },

    /**
     * Return the dom node for the passed String (id), dom node, or Ext.Element.
     * Here are some examples:
     *
     *     // gets dom node based on id
     *     var elDom = Ext.getDom('elId');
     *
     *     // gets dom node based on the dom node
     *     var elDom1 = Ext.getDom(elDom);
     *
     *     // If we don't know if we are working with an
     *     // Ext.Element or a dom node use Ext.getDom
     *     function(el){
     *         var dom = Ext.getDom(el);
     *         // do something with the dom node
     *     }
     *
     * __Note:__ the dom node to be found actually needs to exist (be rendered, etc)
     * when this method is called to be successful.
     * @param {Mixed} el
     * @return {HTMLElement}
     */
    getDom: function(el) {
        if (!el || !document) {
            return null;
        }

        return el.dom ? el.dom : (typeof el == 'string' ? document.getElementById(el) : el);
    },

    /**
     * Removes this element from the document, removes all DOM event listeners, and deletes the cache reference.
     * All DOM event listeners are removed from this element.
     * @param {HTMLElement} node The node to remove.
     */
    removeNode: function(node) {
        if (node && node.parentNode && node.tagName != 'BODY') {
            Ext.get(node).clearListeners();
            node.parentNode.removeChild(node);
            delete Ext.cache[node.id];
        }
    },

    /**
     * @private
     */
    defaultSetupConfig: {
        eventPublishers: {
            dom: {
                xclass: 'Ext.event.publisher.Dom'
            },
            touchGesture: {
                xclass: 'Ext.event.publisher.TouchGesture',
                recognizers: {
                    drag: {
                        xclass: 'Ext.event.recognizer.Drag'
                    },
                    tap: {
                        xclass: 'Ext.event.recognizer.Tap'
                    },
                    doubleTap: {
                        xclass: 'Ext.event.recognizer.DoubleTap'
                    },
                    longPress: {
                        xclass: 'Ext.event.recognizer.LongPress'
                    },
                    swipe: {
                        xclass: 'Ext.event.recognizer.HorizontalSwipe'
                    },
                    pinch: {
                        xclass: 'Ext.event.recognizer.Pinch'
                    },
                    rotate: {
                        xclass: 'Ext.event.recognizer.Rotate'
                    }
                }
            },
            componentDelegation: {
                xclass: 'Ext.event.publisher.ComponentDelegation'
            },
            componentPaint: {
                xclass: 'Ext.event.publisher.ComponentPaint'
            },
//            componentSize: {
//                xclass: 'Ext.event.publisher.ComponentSize'
//            },
            elementPaint: {
                xclass: 'Ext.event.publisher.ElementPaint'
            },
            elementSize: {
                xclass: 'Ext.event.publisher.ElementSize'
            }
        },


        animator: {
            xclass: 'Ext.fx.Runner'
        },

        viewport: {
            xclass: 'Ext.viewport.Viewport'
        }
    },

    /**
     * @private
     */
    isSetup: false,

    /**
     * This indicate the start timestamp of current cycle.
     * It is only reliable during dom-event-initiated cycles and
     * {@link Ext.draw.Animator} initiated cycles.
     */
    frameStartTime: +new Date(),

    /**
     * @private
     */
    setupListeners: [],

    /**
     * @private
     */
    onSetup: function(fn, scope) {
        if (Ext.isSetup) {
            fn.call(scope);
        }
        else {
            Ext.setupListeners.push({
                fn: fn,
                scope: scope
            });
        }
    },

    /**
     * Ext.setup() is the entry-point to initialize a Sencha Touch application. Note that if your application makes
     * use of MVC architecture, use {@link Ext#application} instead.
     *
     * This method accepts one single argument in object format. The most basic use of Ext.setup() is as follows:
     *
     *     Ext.setup({
     *         onReady: function() {
     *             // ...
     *         }
     *     });
     *
     * This sets up the viewport, initializes the event system, instantiates a default animation runner, and a default
     * logger (during development). When all of that is ready, it invokes the callback function given to the `onReady` key.
     *
     * The default scope (`this`) of `onReady` is the main viewport. By default the viewport instance is stored in
     * {@link Ext.Viewport}. For example, this snippet adds a 'Hello World' button that is centered on the screen:
     *
     *     Ext.setup({
     *         onReady: function() {
     *             this.add({
     *                 xtype: 'button',
     *                 centered: true,
     *                 text: 'Hello world!'
     *             }); // Equivalent to Ext.Viewport.add(...)
     *         }
     *     });
     *
     * @param {Object} config An object with the following config options:
     *
     * @param {Function} config.onReady
     * A function to be called when the application is ready. Your application logic should be here.
     *
     * @param {Object} config.viewport
     * A custom config object to be used when creating the global {@link Ext.Viewport} instance. Please refer to the
     * {@link Ext.Viewport} documentation for more information.
     *
     *     Ext.setup({
     *         viewport: {
     *             width: 500,
     *             height: 500
     *         },
     *         onReady: function() {
     *             // ...
     *         }
     *     });
     *
     * @param {String/Object} config.icon
     * Specifies a set of URLs to the application icon for different device form factors. This icon is displayed
     * when the application is added to the device's Home Screen.
     *
     *     Ext.setup({
     *         icon: {
     *             57: 'resources/icons/Icon.png',
     *             72: 'resources/icons/Icon~ipad.png',
     *             114: 'resources/icons/Icon@2x.png',
     *             144: 'resources/icons/Icon~ipad@2x.png'
     *         },
     *         onReady: function() {
     *             // ...
     *         }
     *     });
     *
     * Each key represents the dimension of the icon as a square shape. For example: '57' is the key for a 57 x 57
     * icon image. Here is the breakdown of each dimension and its device target:
     *
     * - 57: Non-retina iPhone, iPod touch, and all Android devices
     * - 72: Retina iPhone and iPod touch
     * - 114: Non-retina iPad (first and second generation)
     * - 144: Retina iPad (third generation)
     *
     * Note that the dimensions of the icon images must be exactly 57x57, 72x72, 114x114 and 144x144 respectively.
     *
     * It is highly recommended that you provide all these different sizes to accommodate a full range of
     * devices currently available. However if you only have one icon in one size, make it 57x57 in size and
     * specify it as a string value. This same icon will be used on all supported devices.
     *
     *     Ext.setup({
     *         icon: 'resources/icons/Icon.png',
     *         onReady: function() {
     *             // ...
     *         }
     *     });
     *
     * @param {Object} config.startupImage
     * Specifies a set of URLs to the application startup images for different device form factors. This image is
     * displayed when the application is being launched from the Home Screen icon. Note that this currently only applies
     * to iOS devices.
     *
     *     Ext.setup({
     *         startupImage: {
     *             '320x460': 'resources/startup/320x460.jpg',
     *             '640x920': 'resources/startup/640x920.png',
     *             '640x1096': 'resources/startup/640x1096.png',
     *             '768x1004': 'resources/startup/768x1004.png',
     *             '748x1024': 'resources/startup/748x1024.png',
     *             '1536x2008': 'resources/startup/1536x2008.png',
     *             '1496x2048': 'resources/startup/1496x2048.png'
     *         },
     *         onReady: function() {
     *             // ...
     *         }
     *     });
     *
     * Each key represents the dimension of the image. For example: '320x460' is the key for a 320px x 460px image.
     * Here is the breakdown of each dimension and its device target:
     *
     * - 320x460: Non-retina iPhone, iPod touch, and all Android devices
     * - 640x920: Retina iPhone and iPod touch
     * - 640x1096: iPhone 5 and iPod touch (fifth generation)
     * - 768x1004: Non-retina iPad (first and second generation) in portrait orientation
     * - 748x1024: Non-retina iPad (first and second generation) in landscape orientation
     * - 1536x2008: Retina iPad (third generation) in portrait orientation
     * - 1496x2048: Retina iPad (third generation) in landscape orientation
     *
     * Please note that there's no automatic fallback mechanism for the startup images. In other words, if you don't specify
     * a valid image for a certain device, nothing will be displayed while the application is being launched on that device.
     *
     * @param {Boolean} isIconPrecomposed
     * True to not having a glossy effect added to the icon by the OS, which will preserve its exact look. This currently
     * only applies to iOS devices.
     *
     * @param {String} statusBarStyle
     * The style of status bar to be shown on applications added to the iOS home screen. Valid options are:
     *
     * * `default`
     * * `black`
     * * `black-translucent`
     *
     * @param {String[]} config.requires
     * An array of required classes for your application which will be automatically loaded before `onReady` is invoked.
     * Please refer to {@link Ext.Loader} and {@link Ext.Loader#require} for more information.
     *
     *     Ext.setup({
     *         requires: ['Ext.Button', 'Ext.tab.Panel'],
     *         onReady: function() {
     *             // ...
     *         }
     *     });
     *
     * @param {Object} config.eventPublishers
     * Sencha Touch, by default, includes various {@link Ext.event.recognizer.Recognizer} subclasses to recognize events fired
     * in your application. The list of default recognizers can be found in the documentation for
     * {@link Ext.event.recognizer.Recognizer}.
     *
     * To change the default recognizers, you can use the following syntax:
     *
     *     Ext.setup({
     *         eventPublishers: {
     *             touchGesture: {
     *                 recognizers: {
     *                     swipe: {
     *                         // this will include both vertical and horizontal swipe recognizers
     *                         xclass: 'Ext.event.recognizer.Swipe'
     *                     }
     *                 }
     *             }
     *         },
     *         onReady: function() {
     *             // ...
     *         }
     *     });
     *
     * You can also disable recognizers using this syntax:
     *
     *     Ext.setup({
     *         eventPublishers: {
     *             touchGesture: {
     *                 recognizers: {
     *                     swipe: null,
     *                     pinch: null,
     *                     rotate: null
     *                 }
     *             }
     *         },
     *         onReady: function() {
     *             // ...
     *         }
     *     });
     */
    setup: function(config) {
        var defaultSetupConfig = Ext.defaultSetupConfig,
            emptyFn = Ext.emptyFn,
            onReady = config.onReady || emptyFn,
            onUpdated = config.onUpdated || emptyFn,
            scope = config.scope,
            requires = Ext.Array.from(config.requires),
            extOnReady = Ext.onReady,
            head = Ext.getHead(),
            callback, viewport, precomposed;

        Ext.setup = function() {
            throw new Error("Ext.setup has already been called before");
        };

        delete config.requires;
        delete config.onReady;
        delete config.onUpdated;
        delete config.scope;

        Ext.require(['Ext.event.Dispatcher']);

        callback = function() {
            var listeners = Ext.setupListeners,
                ln = listeners.length,
                i, listener;

            delete Ext.setupListeners;
            Ext.isSetup = true;

            for (i = 0; i < ln; i++) {
                listener = listeners[i];
                listener.fn.call(listener.scope);
            }

            Ext.onReady = extOnReady;
            Ext.onReady(onReady, scope);
        };

        Ext.onUpdated = onUpdated;
        Ext.onReady = function(fn, scope) {
            var origin = onReady;

            onReady = function() {
                origin();
                Ext.onReady(fn, scope);
            };
        };

        config = Ext.merge({}, defaultSetupConfig, config);

        Ext.onDocumentReady(function() {
            Ext.factoryConfig(config, function(data) {
                Ext.event.Dispatcher.getInstance().setPublishers(data.eventPublishers);

                if (data.logger) {
                    Ext.Logger = data.logger;
                }

                if (data.animator) {
                    Ext.Animator = data.animator;
                }

                if (data.viewport) {
                    Ext.Viewport = viewport = data.viewport;

                    if (!scope) {
                        scope = viewport;
                    }

                    Ext.require(requires, function() {
                        Ext.Viewport.on('ready', callback, null, {single: true});
                    });
                }
                else {
                    Ext.require(requires, callback);
                }
            });
        });

        function addMeta(name, content) {
            var meta = document.createElement('meta');
            meta.setAttribute('name', name);
            meta.setAttribute('content', content);
            head.append(meta);
        }

        function addIcon(href, sizes, precomposed) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'apple-touch-icon' + (precomposed ? '-precomposed' : ''));
            link.setAttribute('href', href);
            if (sizes) {
                link.setAttribute('sizes', sizes);
            }
            head.append(link);
        }

        function addStartupImage(href, media) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'apple-touch-startup-image');
            link.setAttribute('href', href);
            if (media) {
                link.setAttribute('media', media);
            }
            head.append(link);
        }

        var icon = config.icon,
            isIconPrecomposed = Boolean(config.isIconPrecomposed),
            startupImage = config.startupImage || {},
            statusBarStyle = config.statusBarStyle,
            devicePixelRatio = window.devicePixelRatio || 1;

        if (navigator.standalone) {
            addMeta('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0');
        }
        else {
            addMeta('viewport', 'initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0');
        }
        addMeta('apple-mobile-web-app-capable', 'yes');
        addMeta('apple-touch-fullscreen', 'yes');

        // status bar style
        if (statusBarStyle) {
            addMeta('apple-mobile-web-app-status-bar-style', statusBarStyle);
        }

        if (Ext.isString(icon)) {
            icon = {
                57: icon,
                72: icon,
                114: icon,
                144: icon
            };
        }
        else if (!icon) {
            icon = {};
        }


        if (Ext.os.is.iPad) {
            if (devicePixelRatio >= 2) {
                // Retina iPad - Landscape
                if ('1496x2048' in startupImage) {
                    addStartupImage(startupImage['1496x2048'], '(orientation: landscape)');
                }
                // Retina iPad - Portrait
                if ('1536x2008' in startupImage) {
                    addStartupImage(startupImage['1536x2008'], '(orientation: portrait)');
                }

                // Retina iPad
                if ('144' in icon) {
                    addIcon(icon['144'], '144x144', isIconPrecomposed);
                }
            }
            else {
                // Non-Retina iPad - Landscape
                if ('748x1024' in startupImage) {
                    addStartupImage(startupImage['748x1024'], '(orientation: landscape)');
                }
                // Non-Retina iPad - Portrait
                if ('768x1004' in startupImage) {
                    addStartupImage(startupImage['768x1004'], '(orientation: portrait)');
                }

                // Non-Retina iPad
                if ('72' in icon) {
                    addIcon(icon['72'], '72x72', isIconPrecomposed);
                }
            }
        }
        else {
            // Retina iPhone, iPod touch with iOS version >= 4.3
            if (devicePixelRatio >= 2 && Ext.os.version.gtEq('4.3')) {
                if (Ext.os.is.iPhone5) {
                    addStartupImage(startupImage['640x1096']);
                } else {
                    addStartupImage(startupImage['640x920']);
                }

                // Retina iPhone and iPod touch
                if ('114' in icon) {
                    addIcon(icon['114'], '114x114', isIconPrecomposed);
                }
            }
            else {
                addStartupImage(startupImage['320x460']);

                // Non-Retina iPhone, iPod touch, and Android devices
                if ('57' in icon) {
                    addIcon(icon['57'], null, isIconPrecomposed);
                }
            }
        }
    },

    /**
     * @member Ext
     * @method application
     *
     * Loads Ext.app.Application class and starts it up with given configuration after the page is ready.
     *
     *     Ext.application({
     *         launch: function() {
     *             alert('Application launched!');
     *         }
     *     });
     *
     * See {@link Ext.app.Application} for details.
     *
     * @param {Object} config An object with the following config options:
     *
     * @param {Function} config.launch
     * A function to be called when the application is ready. Your application logic should be here. Please see {@link Ext.app.Application}
     * for details.
     *
     * @param {Object} config.viewport
     * An object to be used when creating the global {@link Ext.Viewport} instance. Please refer to the {@link Ext.Viewport}
     * documentation for more information.
     *
     *     Ext.application({
     *         viewport: {
     *             layout: 'vbox'
     *         },
     *         launch: function() {
     *             Ext.Viewport.add({
     *                 flex: 1,
     *                 html: 'top (flex: 1)'
     *             });
     *
     *             Ext.Viewport.add({
     *                 flex: 4,
     *                 html: 'bottom (flex: 4)'
     *             });
     *         }
     *     });
     *
     * @param {String/Object} config.icon
     * Specifies a set of URLs to the application icon for different device form factors. This icon is displayed
     * when the application is added to the device's Home Screen.
     *
     *     Ext.application({
     *         icon: {
     *             57: 'resources/icons/Icon.png',
     *             72: 'resources/icons/Icon~ipad.png',
     *             114: 'resources/icons/Icon@2x.png',
     *             144: 'resources/icons/Icon~ipad@2x.png'
     *         },
     *         launch: function() {
     *             // ...
     *         }
     *     });
     *
     * Each key represents the dimension of the icon as a square shape. For example: '57' is the key for a 57 x 57
     * icon image. Here is the breakdown of each dimension and its device target:
     *
     * - 57: Non-retina iPhone, iPod touch, and all Android devices
     * - 72: Retina iPhone and iPod touch
     * - 114: Non-retina iPad (first and second generation)
     * - 144: Retina iPad (third generation)
     *
     * Note that the dimensions of the icon images must be exactly 57x57, 72x72, 114x114 and 144x144 respectively.
     *
     * It is highly recommended that you provide all these different sizes to accommodate a full range of
     * devices currently available. However if you only have one icon in one size, make it 57x57 in size and
     * specify it as a string value. This same icon will be used on all supported devices.
     *
     *     Ext.setup({
     *         icon: 'resources/icons/Icon.png',
     *         onReady: function() {
     *             // ...
     *         }
     *     });
     *
     * @param {Object} config.startupImage
     * Specifies a set of URLs to the application startup images for different device form factors. This image is
     * displayed when the application is being launched from the Home Screen icon. Note that this currently only applies
     * to iOS devices.
     *
     *     Ext.application({
     *         startupImage: {
     *             '320x460': 'resources/startup/320x460.jpg',
     *             '640x920': 'resources/startup/640x920.png',
     *             '640x1096': 'resources/startup/640x1096.png',
     *             '768x1004': 'resources/startup/768x1004.png',
     *             '748x1024': 'resources/startup/748x1024.png',
     *             '1536x2008': 'resources/startup/1536x2008.png',
     *             '1496x2048': 'resources/startup/1496x2048.png'
     *         },
     *         launch: function() {
     *             // ...
     *         }
     *     });
     *
     * Each key represents the dimension of the image. For example: '320x460' is the key for a 320px x 460px image.
     * Here is the breakdown of each dimension and its device target:
     *
     * - 320x460: Non-retina iPhone, iPod touch, and all Android devices
     * - 640x920: Retina iPhone and iPod touch
     * - 640x1096: iPhone 5 and iPod touch (fifth generation)
     * - 768x1004: Non-retina iPad (first and second generation) in portrait orientation
     * - 748x1024: Non-retina iPad (first and second generation) in landscape orientation
     * - 1536x2008: Retina iPad (third generation) in portrait orientation
     * - 1496x2048: Retina iPad (third generation) in landscape orientation
     *
     * Please note that there's no automatic fallback mechanism for the startup images. In other words, if you don't specify
     * a valid image for a certain device, nothing will be displayed while the application is being launched on that device.
     *
     * @param {Boolean} config.isIconPrecomposed
     * True to not having a glossy effect added to the icon by the OS, which will preserve its exact look. This currently
     * only applies to iOS devices.
     *
     * @param {String} config.statusBarStyle
     * The style of status bar to be shown on applications added to the iOS home screen. Valid options are:
     *
     * * `default`
     * * `black`
     * * `black-translucent`
     *
     * @param {String[]} config.requires
     * An array of required classes for your application which will be automatically loaded if {@link Ext.Loader#enabled} is set
     * to `true`. Please refer to {@link Ext.Loader} and {@link Ext.Loader#require} for more information.
     *
     *     Ext.application({
     *         requires: ['Ext.Button', 'Ext.tab.Panel'],
     *         launch: function() {
     *             // ...
     *         }
     *     });
     *
     * @param {Object} config.eventPublishers
     * Sencha Touch, by default, includes various {@link Ext.event.recognizer.Recognizer} subclasses to recognize events fired
     * in your application. The list of default recognizers can be found in the documentation for {@link Ext.event.recognizer.Recognizer}.
     *
     * To change the default recognizers, you can use the following syntax:
     *
     *     Ext.application({
     *         eventPublishers: {
     *             touchGesture: {
     *                 recognizers: {
     *                     swipe: {
     *                         // this will include both vertical and horizontal swipe recognizers
     *                         xclass: 'Ext.event.recognizer.Swipe'
     *                     }
     *                 }
     *             }
     *         },
     *         launch: function() {
     *             // ...
     *         }
     *     });
     *
     * You can also disable recognizers using this syntax:
     *
     *     Ext.application({
     *         eventPublishers: {
     *             touchGesture: {
     *                 recognizers: {
     *                     swipe: null,
     *                     pinch: null,
     *                     rotate: null
     *                 }
     *             }
     *         },
     *         launch: function() {
     *             // ...
     *         }
     *     });
     */
    application: function(config) {
        var appName = config.name,
            onReady, scope, requires;

        if (!config) {
            config = {};
        }

        if (!Ext.Loader.config.paths[appName]) {
            Ext.Loader.setPath(appName, config.appFolder || 'app');
        }

        requires = Ext.Array.from(config.requires);
        config.requires = ['Ext.app.Application'];

        onReady = config.onReady;
        scope = config.scope;

        config.onReady = function() {
            config.requires = requires;
            new Ext.app.Application(config);

            if (onReady) {
                onReady.call(scope);
            }
        };

        Ext.setup(config);
    },

    /**
     * @private
     * @param config
     * @param callback
     * @member Ext
     */
    factoryConfig: function(config, callback) {
        var isSimpleObject = Ext.isSimpleObject(config);

        if (isSimpleObject && config.xclass) {
            var className = config.xclass;

            delete config.xclass;

            Ext.require(className, function() {
                Ext.factoryConfig(config, function(cfg) {
                    callback(Ext.create(className, cfg));
                });
            });

            return;
        }

        var isArray = Ext.isArray(config),
            keys = [],
            key, value, i, ln;

        if (isSimpleObject || isArray) {
            if (isSimpleObject) {
                for (key in config) {
                    if (config.hasOwnProperty(key)) {
                        value = config[key];
                        if (Ext.isSimpleObject(value) || Ext.isArray(value)) {
                            keys.push(key);
                        }
                    }
                }
            }
            else {
                for (i = 0,ln = config.length; i < ln; i++) {
                    value = config[i];

                    if (Ext.isSimpleObject(value) || Ext.isArray(value)) {
                        keys.push(i);
                    }
                }
            }

            i = 0;
            ln = keys.length;

            if (ln === 0) {
                callback(config);
                return;
            }

            function fn(value) {
                config[key] = value;
                i++;
                factory();
            }

            function factory() {
                if (i >= ln) {
                    callback(config);
                    return;
                }

                key = keys[i];
                value = config[key];

                Ext.factoryConfig(value, fn);
            }

            factory();
            return;
        }

        callback(config);
    },

    /**
     * A global factory method to instantiate a class from a config object. For example, these two calls are equivalent:
     *
     *     Ext.factory({ text: 'My Button' }, 'Ext.Button');
     *     Ext.create('Ext.Button', { text: 'My Button' });
     *
     * If an existing instance is also specified, it will be updated with the supplied config object. This is useful
     * if you need to either create or update an object, depending on if an instance already exists. For example:
     *
     *     var button;
     *     button = Ext.factory({ text: 'New Button' }, 'Ext.Button', button);     // Button created
     *     button = Ext.factory({ text: 'Updated Button' }, 'Ext.Button', button); // Button updated
     *
     * @param {Object} config  The config object to instantiate or update an instance with.
     * @param {String} classReference  The class to instantiate from.
     * @param {Object} [instance]  The instance to update.
     * @param [aliasNamespace]
     * @member Ext
     */
    factory: function(config, classReference, instance, aliasNamespace) {
        var manager = Ext.ClassManager,
            newInstance;

        // If config is falsy or a valid instance, destroy the current instance
        // (if it exists) and replace with the new one
        if (!config || config.isInstance) {
            if (instance && instance !== config) {
                instance.destroy();
            }

            return config;
        }

        if (aliasNamespace) {
             // If config is a string value, treat it as an alias
            if (typeof config == 'string') {
                return manager.instantiateByAlias(aliasNamespace + '.' + config);
            }
            // Same if 'type' is given in config
            else if (Ext.isObject(config) && 'type' in config) {
                return manager.instantiateByAlias(aliasNamespace + '.' + config.type, config);
            }
        }

        if (config === true) {
            return instance || manager.instantiate(classReference);
        }


        if ('xtype' in config) {
            newInstance = manager.instantiateByAlias('widget.' + config.xtype, config);
        }
        else if ('xclass' in config) {
            newInstance = manager.instantiate(config.xclass, config);
        }

        if (newInstance) {
            if (instance) {
                instance.destroy();
            }

            return newInstance;
        }

        if (instance) {
            return instance.setConfig(config);
        }

        return manager.instantiate(classReference, config);
    },

    /**
     * @private
     * @member Ext
     */
    deprecateClassMember: function(cls, oldName, newName, message) {
        return this.deprecateProperty(cls.prototype, oldName, newName, message);
    },

    /**
     * @private
     * @member Ext
     */
    deprecateClassMembers: function(cls, members) {
       var prototype = cls.prototype,
           oldName, newName;

       for (oldName in members) {
           if (members.hasOwnProperty(oldName)) {
               newName = members[oldName];

               this.deprecateProperty(prototype, oldName, newName);
           }
       }
    },

    /**
     * @private
     * @member Ext
     */
    deprecateProperty: function(object, oldName, newName, message) {
        if (!message) {
            message = "'" + oldName + "' is deprecated";
        }
        if (newName) {
            message += ", please use '" + newName + "' instead";
        }

        if (newName) {
            Ext.Object.defineProperty(object, oldName, {
                get: function() {
                    return this[newName];
                },
                set: function(value) {

                    this[newName] = value;
                },
                configurable: true
            });
        }
    },

    /**
     * @private
     * @member Ext
     */
    deprecatePropertyValue: function(object, name, value, message) {
        Ext.Object.defineProperty(object, name, {
            get: function() {
                return value;
            },
            configurable: true
        });
    },

    /**
     * @private
     * @member Ext
     */
    deprecateMethod: function(object, name, method, message) {
        object[name] = function() {
            if (method) {
                return method.apply(this, arguments);
            }
        };
    },

    /**
     * @private
     * @member Ext
     */
    deprecateClassMethod: function(cls, name, method, message) {
        if (typeof name != 'string') {
            var from, to;

            for (from in name) {
                if (name.hasOwnProperty(from)) {
                    to = name[from];
                    Ext.deprecateClassMethod(cls, from, to);
                }
            }
            return;
        }

        var isLateBinding = typeof method == 'string',
            member;

        if (!message) {
            message = "'" + name + "()' is deprecated, please use '" + (isLateBinding ? method : method.name) +
                "()' instead";
        }

        if (isLateBinding) {
            member = function() {

                return this[method].apply(this, arguments);
            };
        }
        else {
            member = function() {

                return method.apply(this, arguments);
            };
        }

        if (name in cls.prototype) {
            Ext.Object.defineProperty(cls.prototype, name, {
                value: null,
                writable: true,
                configurable: true
            });
        }

        cls.addMember(name, member);
    },


    /**
     * True when the document is fully initialized and ready for action
     * @type Boolean
     * @member Ext
     * @private
     */
    isReady : false,

    /**
     * @private
     * @member Ext
     */
    readyListeners: [],

    /**
     * @private
     * @member Ext
     */
    triggerReady: function() {
        var listeners = Ext.readyListeners,
            i, ln, listener;

        if (!Ext.isReady) {
            Ext.isReady = true;

            for (i = 0,ln = listeners.length; i < ln; i++) {
                listener = listeners[i];
                listener.fn.call(listener.scope);
            }
            delete Ext.readyListeners;
        }
    },

    /**
     * @private
     * @member Ext
     */
    onDocumentReady: function(fn, scope) {
        if (Ext.isReady) {
            fn.call(scope);
        }
        else {
            var triggerFn = Ext.triggerReady;

            Ext.readyListeners.push({
                fn: fn,
                scope: scope
            });

            if (Ext.browser.is.PhoneGap && !Ext.os.is.Desktop) {
                if (!Ext.readyListenerAttached) {
                    Ext.readyListenerAttached = true;
                    document.addEventListener('deviceready', triggerFn, false);
                }
            }
            else {
                if (document.readyState.match(/interactive|complete|loaded/) !== null) {
                    triggerFn();
                }
                else if (!Ext.readyListenerAttached) {
                    Ext.readyListenerAttached = true;
                    window.addEventListener('DOMContentLoaded', triggerFn, false);
                }
            }
        }
    },

    /**
     * Calls function after specified delay, or right away when delay == 0.
     * @param {Function} callback The callback to execute.
     * @param {Object} scope (optional) The scope to execute in.
     * @param {Array} args (optional) The arguments to pass to the function.
     * @param {Number} delay (optional) Pass a number to delay the call by a number of milliseconds.
     * @member Ext
     */
    callback: function(callback, scope, args, delay) {
        if (Ext.isFunction(callback)) {
            args = args || [];
            scope = scope || window;
            if (delay) {
                Ext.defer(callback, delay, scope, args);
            } else {
                callback.apply(scope, args);
            }
        }
    }
});



Ext.define('Genesis.model.Checkin',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'Checkin',
   id : 'Checkin',
   config :
   {
      identifier : 'uuid',
      belongsTo : [
      {
         model : 'Genesis.model.User',
         getterName : 'getUser',
         setterName : 'setUser'
      },
      {
         model : 'Genesis.model.Venue',
         getterName : 'getVenue',
         setterName : 'setVenue'
      }],
      fields : ['id', 'time']
   }
});

Ext.define('Genesis.model.Merchant',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'Merchant',
   id : 'Merchant',
   config :
   {
      fields : ['id', 'name', 'email', 'photo', 'alt_photo', 'account_first_name', 'account_last_name', //
      'phone', 'auth_code', 'qr_code', 'features_config', 'payment_account_id', 'created_ts', 'update_ts', 'type', 'reward_terms'],
      idProperty : 'id'
   }
});

Ext.define('Genesis.model.CustomerJSON',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'CustomerJSON',
   id : 'CustomerJSON',
   config :
   {
      proxy :
      {
         type : 'localstorage',
         id : 'CustomerJSON',
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json'
         }
      },
      identifier : 'uuid',
      fields : ['json', 'id'],
      idProperty : 'id'
   }
});

Ext.define('Genesis.model.Customer',
{
   extend :  Ext.data.Model ,
                                                                  
   alternateClassName : 'Customer',
   id : 'Customer',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         name : 'merchant',
         setterName : 'setMerchant',
         getterName : 'getMerchant'
      },
      {
         model : 'Genesis.model.User',
         associationKey : 'user',
         name : 'user',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      hasOne : [
      {
         model : 'Genesis.model.Checkin',
         associationKey : 'last_check_in',
         name : 'last_check_in',
         // User to make sure no underscore
         getterName : 'getLastCheckin',
         setterName : 'setLastCheckin'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         listeners :
         {
            'metachange' : function(proxy, metaData, eOpts)
            {
               var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
               // Let Other event handlers udpate the metaData first ...
               viewport.fireEvent('updatemetadata', metaData);
            }
         }
      },
      fields : ['id', 'points', 'prize_points', 'visits', 'next_badge_visits', 'eligible_for_reward', 'eligible_for_prize', 'badge_id', 'next_badge_id'],
      idProperty : 'id'
   },
   getUser : function()
   {

   },
   inheritableStatics :
   {
      isValid : function(customerId)
      {
         return customerId != 0;
      },
      updateCustomer : function(cOld, cNew)
      {
         var attrib, sync = false;
         cOld.beginEdit();
         for (var i = 0; i < cOld.fields.length; i++)
         {
            attrib = cOld.fields.items[i].getName();
            if (cOld.get(attrib) != cNew.get(attrib))
            {
               cOld.set(attrib, cNew.get(attrib));
               sync = true;
            }
         }
         try
         {
            if (cOld.getLastCheckin() != cNew.getLastCheckin())
            {
               cOld.setLastCheckin(cNew.getLastCheckin());
               sync = true;
            }
         }
         catch (e)
         {
            cOld.setLastCheckin(Ext.create('Genesis.model.Checkin'));
            sync = true;
         }
         var oMerchant = cOld.getMerchant() || '';
         var nMerchant = cNew.getMerchant() || '';
         var oString = oMerchant.toString();
         var nString = nMerchant.toString();
         if ((oString != nString) && (nString != ''))
         {
            cOld.handleInlineAssociationData(
            {
               'merchant' : nMerchant.raw
            });
            sync = true;
         }

         cOld.endEdit();

         return sync;
      },
      setFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/tokens/create_from_facebook');
      },
      setLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/tokens');
      },
      setLogoutUrl : function(auth_code)
      {
         this.getProxy().setActionMethods(
         {
            read : 'DELETE'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/tokens/' + auth_code);
      },
      setCreateAccountUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/sign_up');
      },
      setGetCustomerUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customers/show_account');
      },
      setGetCustomersUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customers');
      },
      setVenueScanCheckinUrl : function()
      {
         this.setVenueCheckinUrl();
      },
      setVenueCheckinUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/check_ins');
      },
      setVenueExploreUrl : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/' + venueId + '/explore');
      },
      setSendPtsXferUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customers/transfer_points');
      },
      setRecvPtsXferUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customers/receive_points');
      }
   }
});

Ext.define('Genesis.controller.ControllerBase',
{
   extend :  Ext.app.Controller ,
                                                         
   config :
   {
      animationMode : null,
      models : ['Customer']
   },
   scanTaskWait : false,
   scanTask : null,
   establishConnectionMsg : 'Connecting to Server ...',
   loginMsg : 'Logging in ...',
   checkinMsg : 'Checking in ...',
   loadingScannerMsg : 'Loading Scanner ...',
   loadingMsg : 'Loading ...',
   genQRCodeMsg : 'Generating QRCode ...',
   missingLicenseKeyMsg : 'License Key for this Device is missing. Press "Procced" to Scan the License Key into the device.',
   retrieveAuthModeMsg : 'Retrieving Authorization Code from Server ...',
   noCodeScannedMsg : 'No Authorization Code was Scanned!',
   lostNetworkConnectionMsg : 'You have lost network connectivity',
   networkErrorMsg : 'Error Connecting to Sever',
   noPeerDiscoveredMsg : 'No Peers were discovered',
   noPeerIdFoundMsg : function(msg)
   {
      return ("No ID Found! ErrorCode(" + msg + ")");
   },
   notAtVenuePremise : 'You must be inside the Merchant\'s premises to continue.',
   errorLoadingAccountProfileMsg : 'Error Loading Account Profile',
   invalidTagIdFormatMsg : function(length)
   {
      return 'Invalid ' + length + '-digit Tag ID format (eg. 12345678)';
   },
   invalidPhoneIdFormatMsg : function(length)
   {
      return 'Invalid ' + length + '-digit Telephone format (eg. 8005551234)';
   },
   transactionCancelledMsg : 'This transaction is cancelled',
   backToMerchantPageMsg : function(venue)
   {
      return ('Would you like to visit our Main Page?');
   },
   geoLocationErrorMsg : function()
   {
      var rc = 'This feature must require your GeoLocation to proceed.';
      if (Ext.os.is('Android'))
      {
         rc += // ((Ext.os.version.isLessThan('4.1')) ? //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> GPS satellites\"';
      }
      else if (Ext.os.is('iOS'))
      {
         rc += ((Ext.os.version.isLessThan('6.0')) ? //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services >> KICKBAK\"' :
         // //
         'Enable Location Services under Main Screen of your phone: \"Settings App >> Privacy >> Location Services >> KICKBAK\"'//
         );
      }
      else if (Ext.os.is('BlackBerry'))
      {
         rc += 'Enable Location Services under Main Screen of your phone: \"Settings App >> Site Permissions\"';
      }
      else
      {
         rc += 'Enable Location Services under Main Screen of your phone: \"Settings App >> Location Services\"';
      }

      return rc;
   },
   geoLocationTimeoutErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationPermissionErrorMsg : 'No permission to locate current location. Please enable permission to do so!',
   geoLocationUnavailableMsg : 'To better serve you, please turn on your Location Services',
   geoLocationUseLastPositionMsg : 'We are not able to locate your current location. Using your last known GPS Coordinates ...',
   getMerchantInfoMsg : 'Retrieving Merchant Information ...',
   getVenueInfoMsg : 'Retrieving Venue Information ...',
   prepareToSendMerchantDeviceMsg : 'Prepare to send data across to Merchant Device ...',
   mobilePhoneInputMsg : 'Enter Mobile Number',
   lookingForMerchantDeviceMsg : function()//Send
   {
      return 'Tap your Phone against the ' + Genesis.constants.addCRLF() + 'Merchant Device'
   },
   detectMerchantDeviceMsg : function()//Recv
   {
      return 'Tap your Phone against the ' + Genesis.constants.addCRLF() + 'Merchant Device'
   },
   // Merchant Device
   prepareToSendMobileDeviceMsg : 'Prepare to send data across to Mobile Device ...',
   lookingForMobileDeviceMsg : function()//Send
   {
      return 'Please Swipe TAG or' + Genesis.constants.addCRLF() + //
      'Tap Mobile Device';
   },
   detectMobileDeviceMsg : function()//Recv
   {
      return 'Please Swipe TAG or' + Genesis.constants.addCRLF() + //
      'Tap Mobile Device';
   },
   //
   //
   //
   missingVenueInfoMsg : function(errors)
   {
      var errorMsg = '';
      if (Ext.isString(errors))
      {
         errorMsg = Genesis.constants.addCRLF() + errors;
      }
      else if (Ext.isObject(errors))
      {
         errorMsg = Genesis.constants.addCRLF() + errors.statusText;
      }
      return ('Error loading Venue information.' + errorMsg);
   },
   showToServerMsg : function()
   {
      return ('Please confirm to Proceed');
   },
   errProcQRCodeMsg : 'Error Processing Authentication Code',
   cameraAccessMsg : 'Accessing your Camera Phone ...',
   updatingServerMsg : 'Updating Server ...',
   referredByFriendsMsg : function(merchatName)
   {
      return 'Have you been referred ' + Genesis.constants.addCRLF() + //
      'by a friend to visit' + Genesis.constants.addCRLF() + //
      merchatName + '?';
   },
   recvReferralb4VisitMsg : function(name)
   {
      return 'Claim your reward points by becoming a customer at ' + Genesis.constants.addCRLF() + name + '!';
   },
   showScreenTimeoutExpireMsg : function(duration)
   {
      return duration + ' are up! Press OK to confirm.';
   },
   showScreenTimeoutMsg : function(duration)
   {
      return 'You have ' + duration + ' to show this screen to a employee before it disappears!';
   },
   uploadFbMsg : 'Uploading to Facebook ...',
   uploadServerMsg : 'Uploading to server ...',
   inheritableStatics :
   {
      animationMode :
      {
         'cover' :
         {
            type : 'cover',
            direction : 'left',
            duration : 400
         },
         'coverUp' :
         {
            type : 'cover',
            direction : 'up',
            duration : 400
         },
         'slide' :
         {
            type : 'slide',
            direction : 'left',
            duration : 400
         },
         'slideUp' :
         {
            type : 'slide',
            direction : 'up',
            duration : 400
         },
         'pop' :
         {
            type : 'pop',
            duration : 400
         },
         'flip' :
         {
            type : 'flip',
            duration : 400
         },
         'fade' :
         {
            type : 'fade',
            duration : 400

         }
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
            if (merchantMode)
            {
               sound_file['successCallback'] = successCallback || Ext.emptyFn;
               Ext.get(sound_file['name']).dom.play();
            }
            else if (successCallback)
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
      },
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
            /*
             console.debug("Used key[" + key + "]");
             console.debug('\n' + //
             "Encrypted Code Length: " + encrypted.length + '\n' + //
             'Encrypted Code [' + encrypted + ']' + '\n');
             */
         }

         return encrypted;
      },
      genQRCodeFromParams : function(params, mode, encryptOnly)
      {
         var me = this;
         var encrypted;
         //
         // Show QRCode
         //
         // GibberishAES.enc(string, password)
         // Defaults to 256 bit encryption
         GibberishAES.size(256);
         var venueId = Genesis.fn.getPrivKey('venueId');
         var key = "";
         switch (mode)
         {
            case 'prize' :
            {
               key = Genesis.fn.getPrivKey('p' + venueId);
               break;
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
         var date;
         if (venueId > 0)
         {
            try
            {
               date = new Date().addHours(3);
               encrypted = GibberishAES.enc(Ext.encode(Ext.applyIf(
               {
                  "expiry_ts" : date.getTime()
               }, params)), key);
               encrypted = venueId + '$' + encrypted;

               console.debug("Used key[" + key + "]");
               console.debug('\n' + //
               "Encrypted Code Length: " + encrypted.length + '\n' + //
               'Encrypted Code [' + encrypted + ']' + '\n' + //
               'Expiry Date: [' + date + ']');
            }
            catch (e)
            {
            }

            return (encryptOnly) ? [encrypted, 0, 0] : me.genQRCode(encrypted);
         }
         Ext.device.Notification.show(
         {
            title : 'Missing License Key!',
            message : me.prototype.missingLicenseKeyMsg,
            buttons : ['Proceed', 'Cancel'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'proceed')
               {
                  _application.getController('Settings').fireEvent('upgradeDevice');
               }
            }
         });

         return (encryptOnly) ? ['', 0, 0] : '';
      },
      genQRCode : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 3;
         QRCodeVersion = QRCodeVersion || 10;

         // size of box drawn on canvas
         var padding = 0;
         // 1-40 see http://www.denso-wave.com/qrcode/qrgene2-e.html

         // QR Code Error Correction Capability
         // Higher levels improves error correction capability while decreasing the amount of data QR Code size.
         // QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
         // eg. L can survive approx 5% damage...etc.
         var qr = QRCode(QRCodeVersion, 'L');
         qr.addData(text);
         qr.make();
         var base64 = qr.createBase64(dotsize, padding);
         console.debug("QR Code Minimum Size = [" + base64[1] + "x" + base64[1] + "]");

         return [base64[0], base64[1], base64[1]];
      },
      genQRCodeInlineImg : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 4;
         QRCodeVersion = QRCodeVersion || 8;
         var padding = 0;
         var qr = QRCode(QRCodeVersion, 'L');

         qr.addData(text);
         qr.make();

         var html = qr.createTableTag(dotsize, padding);

         return html;
      }
   },
   init : function()
   {
      this.callParent(arguments);

      this.on(
      {
         scope : this,
         'scannedqrcode' : this.onScannedQRcode,
         'locationupdate' : this.onLocationUpdate,
         'openpage' : this.onOpenPage,
         'updatemetadata' : this.updateMetaDataInfo,
         'triggerCallbacksChain' : this.triggerCallbacksChain
      });

      /*
      this.callBackStack =
      {
      callbacks : ['signupPromotionHandler', 'earnPtsHandler', 'referralHandler', 'scanAndWinHandler'],
      arguments : [],
      startIndex : 0
      };
      */
      //
      // Forward all locally generated page navigation events to viewport
      //
      //this.setAnimationMode(this.self.animationMode['cover']);

      //
      // Prevent Recursion
      //
      var viewport = this.getViewPortCntlr();
      if (viewport != this)
      {
         viewport.relayEvents(this, ['pushview', 'popview', 'silentpopview', 'resetview']);
         viewport.on('animationCompleted', this.onAnimationCompleted, this);
      }
   },
   getViewPortCntlr : function()
   {
      return this.getApplication().getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
   },
   getViewport : function()
   {
      return this.getViewPortCntlr().getView();
   },
   getMainPage : Ext.emptyFn,
   openMainPage : Ext.emptyFn,
   openPage : Ext.emptyFn,
   goToMain : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      if (viewport.setLoggedIn)
      {
         viewport.setLoggedIn(true);
      }
      me.resetView();
      me.redirectTo('main');
      console.log("LoggedIn, Going to Main Page ...");
   },
   goToMerchantMain : function(noprompt)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var info = viewport.getCheckinInfo();
      var _backToMain = function()
      {
         me.resetView();
         if (info.venue)
         {
            me.redirectTo('venue/' + info.venue.getId() + '/' + info.customer.getId() + '/1');
         }
         else
         {
            me.redirectTo('checkin');
         }
      };
      if (info.venue && !noprompt)
      {
         Ext.device.Notification.show(
         {
            title : info.venue.get('name').trunc(16),
            message : me.backToMerchantPageMsg(info.venue),
            buttons : ['OK', 'Cancel'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'ok')
               {
                  _backToMain();
               }
            }
         });
      }
      else
      {
         _backToMain();
      }
   },
   isOpenAllowed : function()
   {
      return "Cannot Open Folder";
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onBeforeNfc : function(nfcEvent)
   {
      var me = this, result = null, id = null;

      console.log("NDEF Message received");
      try
      {
         var tag = nfcEvent.tag, records = tag.ndefMessage || [], id = nfc.bytesToHexString(tag.id);
         var langCodeLength = records[0].payload[0], text = records[0].payload.slice((1 + langCodeLength), records[0].payload.length);

         console.debug("NFC ndefID[" + id + "] ndefMessage[" + nfc.bytesToString(text) + "]")
         result =
         {
            result : Ext.decode(nfc.bytesToString(text)),
            id : id
         }
         //
         // Decrypt Message
         //
         me.printNfcTag(nfcEvent);
      }
      catch (e)
      {
         console.log("Exception Thrown while processing NFC Tag[" + e + "]");
      }

      return result;
   },
   onNfc : Ext.emptyFn,
   onScannedQRcode : Ext.emptyFn,
   onLocationUpdate : Ext.emptyFn,
   onOpenPage : function(feature, subFeature, cb, eOpts, eInfo)
   {
      if ((appName == 'GetKickBak') && //
      //((Genesis.fn.isNative() && !Ext.device.Connection.isOnline()) || (!navigator.onLine)) && //
      !navigator.onLine && //
      (feature != 'MainPage'))
      {
         var viewport = me.getViewPortCntlr();
         if (!offlineDialogShown)
         {
            Ext.device.Notification.show(
            {
               title : 'Network Error',
               message : me.lostNetworkConnectionMsg,
               buttons : ['Dismiss'],
               callback : function()
               {
                  offlineDialogShown = false;
               }
            });
            offlineDialogShown = true;
         }
         console.debug("Network Error - " + feature + "," + subFeature);
         me.resetView();
         me.redirectTo(viewport.getLoggedIn() ? 'checkin' : 'login');
         return;
      }

      var app = this.getApplication();
      controller = app.getController(feature);
      if (!subFeature)
      {
         controller.openMainPage();
      }
      else
      {
         controller.openPage(subFeature, cb);
      }
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   triggerCallbacksChain : function()
   {
      var me = this;
      var startIndex = me.callBackStack['startIndex'];
      var length = me.callBackStack['callbacks'].length;
      for (var i = startIndex; i < length; i++)
      {
         me.callBackStack['startIndex']++;
         if (me[me.callBackStack['callbacks'][i]].apply(me, me.callBackStack['arguments']))
         {
            //
            // Break the chain and contine Out-of-Scope
            //
            break;
         }
      }
      if (i >= length)
      {
         console.debug("Clear Callback Chain[" + i + "].");
         //
         // End of Callback Chain
         //
         me.callBackStack['startIndex'] = 0;
         me.callBackStack['arguments'] = [];
      }
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this, viewport = me.getViewPortCntlr();
      viewport.updateMetaDataInfo(metaData);
   },
   checkReferralPrompt : function(cbOnSuccess, cbOnFail)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var customer = viewport.getCustomer();
      var merchant = viewport.getVenue().getMerchant();
      var merchantId = merchant.getId();
      var success = cbOnSuccess || Ext.emptyFn;
      var fail = cbOnFail || Ext.emptyFn;

      if (Customer.isValid(customer.getId())// Valid Customer
      && (customer.get('visits') < 2)// Not a frequent visitor yet
      && (!Genesis.db.getReferralDBAttrib("m" + merchantId))// Haven't been referred by a friend yet
      && (_build != 'MobileWebClient'))// Not a MobileWeb App
      {
         console.debug("Customer Visit Count[" + customer.get('visits') + "]")
         Ext.device.Notification.show(
         {
            title : 'Referral Challenge',
            message : me.referredByFriendsMsg(merchant.get('name')),
            buttons : ['Yes', 'No'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'yes')
               {
                  Ext.defer(function()
                  {
                     me.fireEvent('openpage', 'mobileClient.Challenges', 'referrals', success);
                  }, 1, me);
               }
               else
               {
                  fail();
               }
            }
         });
      }
      else
      {
         fail();
      }
   },
   /*
    refreshBadges : function()
    {
    var bstore = Ext.StoreMgr.get('BadgeStore');

    Badges['setGetBadgesUrl']();
    bstore.load(
    {
    jsonData :
    {
    },
    params :
    {
    },
    callback : function(records, operation)
    {
    if (operation.wasSuccessful())
    {
    me.persistSyncStores('BadgeStore');
    }
    }
    });
    },
    */
   earnRedeemPopup : function(callback)
   {
      var me = this;

      if (!me.earnRedeemPopup)
      {
         me.earnRedeemPopup = (Ext.create('Ext.Sheet',
            {
               bottom : 0,
               left : 0,
               top : 0,
               right : 0,
               padding : '1.0',
               hideOnMaskTap : false,
               defaultUnit : 'em',
               cls : 'x-mask transmit-mask',
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
                  style : 'text-align:center;display:inline-table;color:white;font-size:1.1em;',
                  html : me.fbConnectRequestMsg + '<img width="160" style="margin:0.7em 0;" src="' + //
                  Genesis.constants.resourceSite + 'images/' + Genesis.constants.themeName + '/' + 'facebook_icon.png"/>'
               },
               {
                  docked : 'bottom',
                  defaults :
                  {
                     xtype : 'button',
                     defaultUnit : 'em',
                     scope : me
                  },
                  padding : '0 1.0 1.0 1.0',
                  items : [
                  {
                     margin : '0 0 0.5 0',
                     text : 'Proceed',
                     ui : 'action',
                     handler : function()
                     {
                        me.earnRedeemPopup.hide();
                        callback();
                     }
                  },
                  {
                     margin : '0.5 0 0 0',
                     text : 'Cancel',
                     //ui : 'decline',
                     handler : function()
                     {
                        me.earnRedeemPopup.hide();
                     }
                  }]
               }]
            }));
         Ext.Viewport.add(me.earnRedeemPopup);
      }
      me.earnRedeemPopup.show();
   },
   gravityThreshold : 4.0,
   accelerometerHandler : function(vol, callback)
   {
      var me = this;
      //return navigator.accelerometer.watchAcceleration(function(accel)
      navigator.accelerometer.getCurrentAcceleration(function(accel)
      {
         //
         // Mobile device lay relatively flat and stationary ...
         //
         //console.debug('Accelerometer x=' + accel.x + ' accel.y=' + y);
         if ((accel.z >= (9.81 - me.gravityThreshold)) && (accel.z <= (9.81 + me.gravityThreshold)))
         {
            if (vol != Genesis.constants.s_vol)
            {
               window.plugins.proximityID.setVolume(Genesis.constants.s_vol);
               console.debug('Accelerometer new_vol=' + Genesis.constants.s_vol);
               callback(Genesis.constants.s_vol);
            }
         }
         else
         {
            //
            // Restore to system default
            //
            if (vol != -1)
            {
               window.plugins.proximityID.setVolume(-1);
               console.debug('Accelerometer new_vol=-1');
               callback(-1);
            }
         }
      },
      {
         frequency : 250
      });
   },
   getLocalID : function(success, fail, retryFn)
   {
      var me = this, c = Genesis.constants, viewport = me.getViewPortCntlr();

      me.scanTaskWait = false;
      me.scanTask = null;

      //create the delayed task instance with our callback
      me.scanTask = setInterval(function()
      {
         if (!me.scanTaskWait)
         {
            me.scanTaskWait = true;
            clearInterval(me.scanTask);
            me.scanTask = null;
            me.self.playSoundFile(viewport.sound_files['nfcError']);
            window.plugins.proximityID.stop();
            Ext.device.Notification.show(
            {
               title : 'Local Identity',
               message : me.noPeerDiscoveredMsg,
               buttons : ['Try Again', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() != 'try again')
                  {
                     fail();
                  }
                  else
                  {
                     Ext.defer(retryFn, 1);
                  }
               }
            });
         }
      }, c.proximityRxTimeout);

      window.plugins.proximityID.scan(function(result)
      {
         clearInterval(me.scanTask);
         me.scanTask = null;
         window.plugins.proximityID.stop();
         var identifiers = Genesis.fn.processRecvLocalID(result);
         if (identifiers['message'])
         {
            me.self.playSoundFile(viewport.sound_files['nfcEnd']);
            success(identifiers);
         }
      }, function(error)
      {
         clearInterval(me.scanTask);
         me.scanTask = null;
         window.plugins.proximityID.stop();
         Ext.device.Notification.show(
         {
            title : 'Local Identity',
            message : me.noPeerIdFoundMsg(Ext.encode(error)),
            buttons : ['Dismiss']
         });
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         console.debug('Error Code[' + Ext.encode(error) + ']');
         fail();
      }, c.numSamples, c.conseqMissThreshold, c.magThreshold, c.sigOverlapRatio);

      return me.scanTask;
   },
   broadcastLocalID : function(success, fail)
   {
      var me = this, c = Genesis.constants, cancel = function()
      {
         Ext.Ajax.abort();
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
   // --------------------------------------------------------------------------
   // Persistent Stores
   // --------------------------------------------------------------------------
   persistStore : function(storeName)
   {
      var i, stores =
      {
         'CustomerStore' : [Ext.StoreMgr.get('Persistent' + 'CustomerStore'), 'CustomerStore', 'CustomerJSON'],
         'LicenseStore' : [Ext.StoreMgr.get('Persistent' + 'LicenseStore'), 'LicenseStore', 'frontend.LicenseKeyJSON']
         //'BadgeStore' : [Ext.StoreMgr.get('Persistent' + 'BadgeStore'), 'BadgeStore', 'BadgeJSON']
         //,'PrizeStore' : [Ext.StoreMgr.get('Persistent' + 'PrizeStore'), 'PrizeStore',
         // 'CustomerRewardJSON']
      };
      console.debug("Looking for " + storeName);
      for (i in stores)
      {
         if (!stores[i][0])
         {
            Ext.regStore('Persistent' + stores[i][1],
            {
               model : 'Genesis.model.' + stores[i][2],
               syncRemovedRecords : true,
               autoLoad : false
            });
            stores[i][0] = Ext.StoreMgr.get('Persistent' + stores[i][1]);
            //console.debug("Created [" + 'Persistent' + stores[i][1] + "]");
         }
         else if (stores[i][0].getStoreId() == ('Persistent' + storeName))
         {
            //console.debug("Store[" + stores[i][0].getStoreId() + "] found!");
            return stores[i][0];
         }
      }

      return stores[storeName][0];
   },
   persistLoadStores : function(callback)
   {
      var createStatement = "CREATE TABLE IF NOT EXISTS Customer (id INTEGER PRIMARY KEY AUTOINCREMENT, json TEXT)";
      var selectAllStatement = "SELECT * FROM Customer";

      var me = this, store, i, x, j, flag = 0x11000, viewport = me.getViewPortCntlr(), stores = [//
      [this.persistStore('CustomerStore'), 'CustomerStore', 0x00001], //
      [this.persistStore('LicenseStore'), 'LicenseStore', 0x00100] //
      //[this.persistStore('BadgeStore'), 'BadgeStore', 0x01000]];
      //,[this.persistStore('PrizeStore'), 'PrizeStore', 0x10000]];
      ];

      callback = callback || Ext.emptyFn;

      for ( i = 0; i < stores.length; i++)
      {
         store = Ext.StoreMgr.get(stores[i][1]);
         if (!store)
         {
            console.debug("Cannot find Store[" + stores[i][1] + "] to be restored!");
         }
         try
         {
            //var ids = stores[i][0].getProxy().getIds();
            //console.debug("Ids found are [" + ids + "]");
            stores[i][0].load(
            {
               callback : function(results, operation)
               {
                  flag |= stores[i][2];
                  var items = [];
                  if (operation.wasSuccessful())
                  {
                     store.removeAll();
                     for ( x = 0; x < results.length; x++)
                     {
                        var data = results[x].get('json');
                        items.push(data);
                     }
                     store.setData(items);
                     console.debug("persistLoadStores  --- Restored " + results.length + " records to " + stores[i][1]);
                  }
                  else
                  {
                     console.debug("Error Restoring " + stores[i][1] + " ...");
                  }

                  //
                  // CustomerStore
                  //
                  if (stores[i][1] == 'CustomerStore')
                  {
                     var db = Genesis.db.openDatabase();
                     try
                     {
                        db.transaction(function(tx)
                        {
                           //
                           // Create Table
                           //
                           tx.executeSql(createStatement, [], function()
                           {
                              console.debug("Successfully created/retrieved KickBak-Customers Table");
                           }, function(tx, error)
                           {
                              console.debug("Failed to create KickBak-Customers Table : " + error.message);
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
                                 //console.debug("JSON - " + item['json'])
                                 items.push(Ext.decode(item['json']));
                              }
                              Ext.StoreMgr.get('CustomerStore').add(items);
                              if ((flag |= 0x0010) == 0x11111)
                              {
                                 callback();
                              }
                              console.debug("persistLoadStores  --- Restored " + items.length + " records from SQL Database, flag=" + flag);
                           }, function(tx, error)
                           {
                              console.debug("No Customer Table found in SQL Database : " + error.message);
                           });
                        });
                     }
                     catch(e)
                     {
                     }
                  }

                  if (flag == 0x11111)
                  {
                     callback();
                  }
               }
            });
         }
         catch(e)
         {
            console.debug("Stack Trace - [" + e.stack + "]");

            Ext.device.Notification.show(
            {
               title : 'Account Profile',
               message : me.errorLoadingAccountProfileMsg,
               buttons : ['Dismiss'],
               callback : function()
               {
                  viewport.resetView();
                  viewport.redirectTo('login');
               }
            });
         }
      }
   },
   persistSyncStores : function(storeName, cleanOnly)
   {
      var createStatement = "CREATE TABLE IF NOT EXISTS Customer (id INTEGER PRIMARY KEY AUTOINCREMENT, json TEXT)";
      var insertStatement = "INSERT INTO Customer (json) VALUES (?)";
      //var updateStatement = "UPDATE Customer SET json = ? WHERE id = ?";
      //var deleteStatement = "DELETE FROM Customer WHERE id=?";
      var dropStatement = "DROP TABLE Customer";

      var i, x, items, json, stores = [//
      [this.persistStore('CustomerStore'), 'CustomerStore', 'Genesis.model.CustomerJSON'], //
      [this.persistStore('LicenseStore'), 'LicenseStore', 'Genesis.model.frontend.LicenseKeyJSON'] //
      //[this.persistStore('BadgeStore'), 'BadgeStore']];
      //, [this.persistStore('PrizeStore'), 'PrizeStore']];
      ];
      //console.debug('persistSyncStores called storeName=[' + storeName + ']');

      //
      // Customer Store
      //
      if (!storeName || (storeName == stores[0][1]))
      {
         var db = Genesis.db.openDatabase();
         var cstore = Ext.StoreMgr.get('CustomerStore');

         try
         {
            db.transaction(function(tx)
            {
               //
               // Drop Table
               //
               tx.executeSql(dropStatement, [], function(tx, result)
               {
                  console.debug("Successfully drop KickBak-Customers Table");
               }, function(tx, error)
               {
                  console.debug("Failed to drop KickBak-Customers Table : " + error.message);
               });
               //
               // Create Table
               //
               tx.executeSql(createStatement, [], function(tx, result)
               {
                  console.debug("Successfully created/retrieved KickBak-Customers Table");
               }, function(tx, error)
               {
                  console.debug("Failed to create KickBak-Customers Table : " + error.message);
               });

               //
               // Insert into Table
               //
               if (!cleanOnly)
               {
                  items = cstore.getRange();
                  for ( x = 0; x < items.length; x++)
                  {
                     item = items[x];
                     //console.debug("Inserting Customer(" + item.getId() + ") to Database");
                     tx.executeSql(insertStatement, [Ext.encode(item.getData(true))], function()
                     {
                        //console.debug("Inserted Customer(" + item.getId() + ") to Database");
                     }, function(tx, error)
                     {
                        console.debug("Failed to insert Customer(" + item.getId() + ") to Database : " + error.message);
                     });
                  }
                  console.debug("persistSyncStores  --- Inserted " + items.length + " records in Database ...");
               }
            });
         }
         catch(e)
         {
         }
         stores[0][0].removeAll();
         stores[0][0].getProxy().clear();
         stores[0][0].sync();
      }

      //
      // Other Persistent Table
      //
      for ( i = 1; i < stores.length; i++)
      {
         if (!storeName || (stores[i][1] == storeName))
         {
            stores[i][0].removeAll();
            stores[i][0].getProxy().clear();

            if (!cleanOnly)
            {
               items = Ext.StoreMgr.get(stores[i][1]).getRange();
               for ( x = 0; x < items.length; x++)
               {
                  json = items[x].getData(true);

                  stores[i][0].add(Ext.create(stores[i][2],
                  {
                     json : json
                  }));
               }
               console.debug("persistSyncStores  --- Found " + items.length + " records in [" + stores[i][1] + "] ...");
            }
            stores[i][0].sync();
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   refreshPage : function(page)
   {
      var me = this, vport = me.getViewport(), controller = vport.getEventDispatcher().controller, anim = new Ext.fx.layout.Card(me.self.animationMode['fade']);

      anim.on('animationend', function()
      {
         console.debug("Animation Complete");
         anim.destroy();
      }, me);

      //if (!controller.isPausing)
      {
         console.debug("Reloading Current Page ...");

         // Delete current page and refresh
         page.removeAll(true);
         vport.animateActiveItem(page, anim);
         anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
         vport.doSetActiveItem(page, null);
      }
   },
   resetView : function(view)
   {
      this.fireEvent('resetview');
   },
   pushView : function(view)
   {
      this.fireEvent('pushview', view, this.getAnimationMode());
   },
   silentPopView : function(num)
   {
      this.fireEvent('silentpopview', num);
   },
   popView : function()
   {
      this.fireEvent('popview');
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   geoRetryAttempts : 3,
   getGeoLocation : function(iter)
   {
      var me = this, i = iter || 0, viewport = me.getViewPortCntlr(), position = viewport.getLastPosition();
      var options =
      {
         autoUpdate : false,
         maximumAge : 60 * 1000,
         timeout : 2 * 1000,
         allowHighAccuracy : true,
         enableHighAccuracy : true
      }

      console.debug('Getting GeoLocation ...');
      /*
       if (!Genesis.fn.isNative())
       {
       me.fireEvent('locationupdate',
       {
       coords :
       {
       getLatitude : function()
       {
       return "-50.000000";
       },
       getLongitude : function()
       {
       return '50.000000';
       }
       }
       });
       return;
       }
       */
      var successCallback = function(geo, eOpts)
      {
         if (!geo)
         {
            console.debug("No GeoLocation found!");
            return;
         }
         var position =
         {
            coords : geo
         }
         console.debug('\n' + 'Latitude: ' + geo.getLatitude() + '\n' + 'Longitude: ' + geo.getLongitude() + '\n' +
         //
         'Altitude: ' + geo.getAltitude() + '\n' + 'Accuracy: ' + geo.getAccuracy() + '\n' +
         //
         'Altitude Accuracy: ' + geo.getAltitudeAccuracy() + '\n' + 'Heading: ' + geo.getHeading() + '\n' +
         //
         'Speed: ' + geo.getSpeed() + '\n' + 'Timestamp: ' + new Date(geo.getTimestamp()) + '\n');

         viewport.setLastPosition(position);
         me.fireEvent('locationupdate', position);
      }
      var failCallback = function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
      {
         console.debug('GeoLocation Error[' + message + ']');
         if (bTimeout)
         {
            console.debug("TIMEOUT");
            if (!position)
            {
               Ext.device.Notification.show(
               {
                  title : 'Timeout Error',
                  message : me.geoLocationTimeoutErrorMsg,
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     me.fireEvent('locationupdate', position);
                  }
               });
            }
            else
            {
               me.fireEvent('locationupdate', position);
            }
         }
         else if (bLocationUnavailable)
         {
            if (i < me.geoRetryAttempts)
            {
               console.debug("Retry #" + i);
               Ext.defer(me.getGeoLocation, 0.25 * 1000, me, [++i]);
            }
            else
            {
               console.debug("POSITION_UNAVAILABLE");
               if (!position)
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Location Services',
                     message : me.geoLocationUnavailableMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        me.fireEvent('locationupdate', position);
                     }
                  });
               }
               else
               {
                  me.fireEvent('locationupdate', position);
               }
            }
         }
         else
         //if (bPermissionDenied)
         {
            console.debug("PERMISSION_DENIED");
            viewport.setLastPosition(null);
            me.fireEvent('locationupdate', null);
         }
      }
      if (!me.geoLocation)
      {
         me.geoLocation = Ext.create('Ext.util.Geolocation', Ext.applyIf(
         {
            listeners :
            {
               locationupdate : successCallback,
               locationerror : function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
               {
                  if (bTimeout && (i < me.geoRetryAttempts))
                  {
                     i = me.geoRetryAttemptsme;
                     me.getGeoLocation(i);
                  }
                  else
                  {
                     failCallback(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message);
                  }
               }
            }
         }, options));
      }
      me.geoLocation.updateLocation(null, null, (i >= me.geoRetryAttempts) ? Ext.applyIf(
      {
         allowHighAccuracy : false,
         enableHighAccuracy : false
      }, options) : options);
   },
   scanQRCode : function()
   {
      var me = this;
      var callback = function(r)
      {
         var qrcode;
         Ext.Viewport.setMasked(null);
         if (Genesis.fn.isNative())
         {
            switch(window.plugins.qrCodeReader.scanType)
            {
               case 'RL' :
               {
                  qrcode = (r.response == undefined) ? "" : (r.response || "");
                  console.debug("QR Code RL  = " + qrcode);
                  break;
               }
               case 'Nigma' :
               {
                  qrcode = (r.response == undefined) ? "" : (r.response || "");
                  if (!qrcode)
                  {
                     console.debug("QR Code Nigma = Empty");
                  }
                  else
                  {
                     console.debug("QR Code Nigma = " + ((qrcode.responseCode) ? qrcode.responseCode : "NONE") + " Sent = " + qrcode.bytesSent + " bytes");
                  }
                  if (qrcode && qrcode.responseCode)
                  {
                     qrcode = qrcode.responseCode;
                  }
                  break;
               }
               case 'Default' :
               {
                  qrcode = r;
                  if (!qrcode || qrcode.format != 'QR_CODE')
                  {
                     qrcode = null;
                     console.debug("QR Code Default = Unsupported Code");
                     //
                     // Simulator, we must pump in random values
                     //
                     if (device.platform.match(/simulator/i))
                     {
                        qrcode = Math.random().toFixed(16);
                     }
                  }
                  else if (qrcode.cancelled)
                  {
                     qrcode = Math.random().toFixed(16);
                  }
                  else
                  {
                     qrcode = qrcode.text;
                  }
                  console.debug("QR Code Default = " + ((qrcode) ? qrcode : "NONE"));
                  break;
               }
            }
         }
         else
         {
            qrcode = r.response;
            console.debug("QR Code = " + qrcode);
         }

         Ext.device.Notification.beep();
         me.fireEvent('scannedqrcode', qrcode);
      }
      var fail = function(message)
      {
         Ext.Viewport.setMasked(null);
         console.debug('Failed because: ' + message);
         Ext.device.Notification.beep();
         me.fireEvent('scannedqrcode', null);
      }

      console.debug("Scanning QR Code ...")
      if (!Genesis.fn.isNative())
      {
         //
         // pick the first one on the Neaby Venue in the store
         //
         var venueId = "0";
         if (!merchantMode)
         {
            var venue = me.getViewPortCntlr().getVenue() || Ext.StoreMgr.get('CheckinExploreStore').first() || null;
            venueId = venue ? venue.getId() : "0";
         }
         callback(
         {
            response : venueId
         });
      }
      else
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.loadingScannerMsg
         });

         window.plugins.qrCodeReader.getCode(callback, fail);
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
      console.debug("Name[" + name + "] Value[" + value + "]");
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
      console.debug("Scanned an NDEF tag with " + records.length + " record" + ((records.length === 1) ? "" : "s"));

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
         console.debug(template(records[i]));
      }
   },
   // --------------------------------------------------------------------------
   // Common Social Media Handlers
   // --------------------------------------------------------------------------
   onFbActivate : function()
   {
      var me = this, fb = Genesis.fb;

      fb.on('connected', me.updateFBSignUpPopupCallback, me);
      fb.on('unauthorized', me.updateFBSignUpPopupCallback, me);
      fb.on('exception', me.updateFBSignUpPopupCallback, me);
   },
   onFbDeactivate : function()
   {
      var me = this, fb = Genesis.fb;

      fb.un('connected', me.updateFBSignUpPopupCallback);
      fb.un('unauthorized', me.updateFBSignUpPopupCallback);
      fb.un('exception', me.updateFBSignUpPopupCallback);
   },
   onToggleFB : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, fb = Genesis.fb, db = Genesis.db.getLocalDB();

      if (newValue == 1)
      {
         me.onFbActivate();
         fb.facebook_onLogin(db['enableTwitter']);
      }
      else if (db['enableFB'])
      {
         me.onFbDeactivate();
      }
   },
   onFacebookChange : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      if (me.initializing)
      {
         return;
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      me.fireEvent('toggleFB', toggle, slider, thumb, newValue, oldValue, eOpts);
   },
   onTwitterChange : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      if (me.initializing)
      {
         return;
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      me.fireEvent('toggleTwitter', toggle, slider, thumb, newValue, oldValue, eOpts);
   }
});

Ext.define('Genesis.model.UserProfile',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'UserProfile',
   id : 'UserProfile',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.User',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      fields : ['gender', 'birthday', 'zipcode', 'created_ts', 'update_ts', 'user_id']
   },
   getUser : function()
   {

   }
});

Ext.define('Genesis.model.User',
{
   extend :  Ext.data.Model ,
                                            
   alternateClassName : 'User',
   id : 'User',
   config :
   {
      hasOne : [
      {
         model : 'Genesis.model.UserProfile',
         associationKey : 'profile'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'users.json',
         reader :
         {
            type : 'json'
         }
      },
      fields : ['user_id', 'name', 'email', 'facebook_id', 'photo_url', 'created_ts', 'update_ts', 'profile_id'],
      idProperty : 'user_id'
   }
});

Ext.define('Genesis.model.CustomerReward',
{
   extend :  Ext.data.Model ,
   id : 'CustomerReward',
   alternateClassName : 'CustomerReward',
   config :
   {
      fields : ['id', 'title', 'points', 'type', 'photo', 'quantity_limited', 'quantity', 'time_limited',
      {
         name : 'expiry_date',
         type : 'date',
         convert : function(value, format)
         {
            value = Date.parse(value, "yyyy-MM-dd");
            return (value) ? Genesis.fn.convertDateNoTimeNoWeek(value) : null;
         }
      }],
      idProperty : 'id',
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   getMerchant : function()
   {
   },
   inheritableStatics :
   {
      //
      // Redeem Points
      //
      setGetRewardsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards?mode=reward');
      },
      setRedeemPointsURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards/' + id + '/redeem');
      },
      setMerchantRedeemPointsURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards/' + id + '/merchant_redeem');
      },
      //
      // Prize Points
      //
      setGetPrizesURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards?mode=prize');
      },
      setRedeemPrizePointsURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customer_rewards/' + id + '/redeem');
      }
   }
});

Ext.define('Genesis.model.frontend.MainPage',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'MainPage',
   id : 'MainPage',
   config :
   {
      fields : ['name', 'photo_url', 'desc', 'pageCntlr', 'subFeature', 'route', 'hide'],
      proxy :
      {
         noCache : false,
         enablePagingParams : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         type : 'ajax',
         disableCaching : false
      }
   }
});

Ext.define('Genesis.model.frontend.Signin',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'Signin',
   id : 'Sigin',
   config :
   {
      fields : ['username', 'password'],
      validations : [
      {
         type : 'email',
         field : 'username'
      },
      {
         type : 'length',
         field : 'password',
         min : 6
      }]
   }
});

Ext.define('Genesis.model.frontend.Account',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'Account',
   id : 'Account',
   config :
   {
      fields : ['name', 'email', 'gender',
      {
         type : 'date',
         name : 'birthday',
         dateFormat : 'time'
      }, 'phone', 'password', 'username'],
      validations : [
      /*
       {
       type : 'format',
       field : 'name',
       matcher : /^([a-zA-Z'-]+\s+){1,4}[a-zA-z'-]+$/
       //matcher : /[\w]+([\s]+[\w]+){1}+/
       },
       {
       type : 'email',
       field : 'email'
       },
       */
      {
         type : 'format',
         field : 'phone',
         matcher : /^(\d{3})\D*(\d{3})\D*(\d{4})\D*(\d*)$/
      },
      {
         type : 'length',
         field : 'password',
         min : 6
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'user'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         listeners :
         {
            'metachange' : function(proxy, metaData, eOpts)
            {
               var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
               // Let Other event handlers udpate the metaData first ...
               viewport.fireEvent('updatemetadata', metaData);
            }
         }
      }
   },
   inheritableStatics :
   {
   	phoneRegex : /^(\d{3})\D*(\d{3})\D*(\d{4})\D*(\d*)$/,
      setUpdateFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/update_facebook_info');
      },
      setPasswdResetUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/reset_password');
      },
      setPasswdChangeUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/change_password');
      },
      setRefreshCsrfTokenUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/tokens/get_csrf_token');
      },
      setUpdateRegUserDeviceUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/register_user_device');
      },
      setUpdateAccountUrl : function()

      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/update');
      }
   }
});

Ext.define('Genesis.controller.MainPageBase',
{
   extend :  Genesis.controller.ControllerBase ,
   xtype : 'mainPageBaseCntlr',
   config :
   {
      csrfTokenRecv : false,
      models : ['Customer', 'User', 'Merchant', 'CustomerReward', 'Genesis.model.frontend.MainPage', 'Genesis.model.frontend.Signin', 'Genesis.model.frontend.Account'],
      after :
      {
         'mainPage' : ''
      },
      routes :
      {
         //'' : 'openPage', //Default do nothing
         'main' : 'mainPage'
      },
      refs :
      {
      },
      control :
      {
         main :
         {
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      },
      listeners :
      {
         'itemTap' : 'onItemTap'
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      Genesis.db.removeLocalDBAttrib('csrf_code');
      Ext.regStore('MainPageStore',
      {
         model : 'Genesis.model.frontend.MainPage',
         //autoLoad : true,
         autoLoad : false,
         listeners :
         {
            scope : me,
            "refresh" : me.initCallback
         }
      });

      Ext.Viewport.on('orientationchange', function(v, newOrientation, width, height, eOpts)
      {
         //
         // Redraw Screen
         //
         var page = me.getMain(), vport = me.getViewport();
         if (page == vport.getActiveItem())
         {
            me.refreshPage(page);
         }
      });
      console.log("MainPageBase Init");
      //
      // Preloading Pages to memory
      //
      me.getMain();

      backBtnCallbackListFn.push(function(activeItem)
      {
         var match = ((activeItem == me.getMain()) || ((merchantMode) ? false : (activeItem == me.getLogin())));
         if (match)
         {
            var viewport = me.getViewPortCntlr();
            me.self.playSoundFile(viewport.sound_files['clickSound']);
            if (Ext.os.is('Android'))
            {
               navigator.app.exitApp();
            }
            else if (!Genesis.fn.isNative())
            {
               window.location.reload();
            }
            return true;
         }
         return false;
      });
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onItemTap : function(model)
   {
      var viewport = this.getViewPortCntlr();

      this.self.playSoundFile(viewport.sound_files['clickSound']);

      console.debug("Controller=[" + model.get('pageCntlr') + "]");
      var cntlr = this.getApplication().getController(model.get('pageCntlr'));
      var msg = cntlr.isOpenAllowed();
      if (msg === true)
      {
         if (model.get('route'))
         {
            this.redirectTo(model.get('route'));
         }
         else if (model.get('subFeature'))
         {
            cntlr.openPage(model.get('subFeature'));
         }
         else
         {
            cntlr.openMainPage();
         }
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : msg,
            buttons : ['Dismiss']
         });
      }
      return false;
   },
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         /*
          var carousel = activeItem.query('carousel')[0];
          var items = carousel.getInnerItems();

          console.debug("Refreshing MainPage ...");
          for (var i = 0; i < items.length; i++)
          {
          items[i].refresh();
          }
          */
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function()
   {
      this.openPage('main');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this;

      switch (subFeature)
      {
         case 'main' :
         {
            me.setAnimationMode(me.self.animationMode['pop']);
            me.pushView(me.getMainPage());
            break;
         }
         case 'merchant' :
         {
            me.goToMerchantMain(true);
            break;
         }
         case 'login' :
         {
            // Remove all previous view from viewStack
            var controller = me.getApplication().getController('client' + '.Checkins');
            controller.fireEvent('setupCheckinInfo', 'checkin', null, null, null);
            //me.getApplication().getController('client' + '.Prizes').fireEvent('updatePrizeViews', null);
            me.setAnimationMode(me.self.animationMode['fade']);
            me.pushView(me.getLogin());
            break;
         }
      }
   },
   getMainPage : function()
   {
      var page = this.getMain();
      return page;
   },
   openMainPage : function()
   {
      var cntlr = this.getViewPortCntlr();
      this.setAnimationMode(this.self.animationMode['pop']);
      this.pushView(this.getMainPage());
      console.log("MainPage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

Ext.define('Genesis.model.PurchaseReward',
{
   extend :  Ext.data.Model ,
   id : 'PurchaseReward',
   alternateClassName : 'PurchaseReward',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         listeners :
         {
            'metachange' : function(proxy, metaData, eOpts)
            {
               var controller = _application.getController(((!merchantMode) ? 'client' : 'server') + '.Rewards');
               controller.fireEvent('updatemetadata', metaData);
            }
         }
      },
      fields : ['id', 'title', 'points', 'type', 'photo', 'created_ts', 'update_ts']
   },
   getMerchant : function()
   {
   },
   inheritableStatics :
   {
      setGetRewardsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/purchase_rewards');
      },
      setEarnPointsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/purchase_rewards/earn');
      },
      setMerchantEarnPointsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/purchase_rewards/merchant_earn');
      }
   }
});

Ext.define('Genesis.controller.RedeemBase',
{
   extend :  Genesis.controller.ControllerBase ,
   inheritableStatics :
   {
   },
   xtype : 'redeemBaseCntlr',
   config :
   {
      models : ['Customer', 'PurchaseReward', 'CustomerReward'],
      listeners :
      {
         'redeemitem' : 'onRedeemItem'
      }
   },
   controllerType : 'redemption',
   redeemSuccessfulMsg : 'Transaction Complete',
   redeemFailedMsg : 'Transaction Failed',
   init : function()
   {
      var me = this;
      Ext.regStore(me.getRenderStore(),
      {
         model : 'Genesis.model.Customer',
         autoLoad : false
      });
      Ext.regStore(me.getRedeemStore(),
      {
         model : 'Genesis.model.CustomerReward',
         autoLoad : false,
         pageSize : 5,
         sorters : [
         {
            property : 'points',
            direction : 'ASC'
         }],
         listeners :
         {
            scope : me,
            'metachange' : function(store, proxy, eOpts)
            {
               //
               // Prevent Incorrect Store from calling MetaData Handler
               //
               if (store.isLoading())
               {
                  me.fireEvent('updatemetadata', proxy.getReader().metaData);
               }
            }
         }
      });

      this.callParent(arguments);
      console.log("RedeemBase Init");
      //
      // Prelod Page
      //
      //
      // Preloading Pages to memory
      //
      Ext.defer(function()
      {
         me.getRedeemItem();
         me.getRedemptions();
      }, 1, me);
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onCreateView : function(activeItem)
   {
      var me = this;
      activeItem.item = me.redeemItem;
   },
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         var monitors = this.getEventDispatcher().getPublishers()['elementSize'].monitors;
         var list = activeItem.query('list[tag='+activeItem.getListCls()+']')[0];

         console.debug("Refreshing RenderStore ...");
         var panel = activeItem.query('dataview[tag=ptsEarnPanel]')[0];
         if (panel)
         {
            panel.refresh();
         }
         monitors[list.container.getId()].forceRefresh();
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var page = me.getRedemptions();

      var viewport = me.getViewPortCntlr();
      var customer = viewport.getCustomer();
      var rstore = Ext.StoreMgr.get(me.getRenderStore());
      //
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      me.exploreMode = !cvenue || (cvenue && (cvenue.getId() != venue.getId()));

      // Update Customer info
      if (customer != rstore.getRange()[0])
      {
         rstore.setData(customer);
      }
      //activeItem.createView();
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
         //activeItem.getInnerItems()[i].setVisibility(false);
      }
      console.debug("ReedeemBase: onActivate");

      //
      // Call Mixins
      //
      if (me.mixins && me.mixins.redeemBase)
      {
         me.mixins.redeemBase.onActivate.apply(me, arguments);
      }
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      console.debug("ReedeemBase: onDeactivate");
   },
   onItemListSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onItemListDisclose(d, model, null, null, null, null, null, false);
      return false;
   },
   onItemListDisclose : function(list, record, target, index, e, eOpts, dummy, supressClick)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var _showItem = function()
      {
         //
         // No Customer Account, then that means we show the item to the user regardless
         //
         if (viewport.getCustomer())
         {
            var totalPts = viewport.getCustomer().get(me.getPtsProperty());
            var points = record.get('points');
            if (points > totalPts)
            {
               Ext.device.Notification.show(
               {
                  title : 'Redeem' + me.getTitle(),
                  message : me.needPointsMsg(points - totalPts),
                  buttons : ['Dismiss']
               });
               return;
            }
         }
         me.fireEvent('showredeemitem', record);
      };

      if (!supressClick)
      {
         me.self.playSoundFile(viewport.sound_files['clickSound']);
      }
      switch (me.getBrowseMode())
      {
         case 'redeemBrowse' :
         {
            if (!me.exploreMode)
            {
               _showItem();
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Warning',
                  message : me.checkinFirstMsg,
                  buttons : ['Dismiss']
               });
            }
            break;
         }
         case 'redeemBrowseSC' :
         {
            _showItem();
            break;
         }
      }
      return true;
   },
   // --------------------------------------------------------------------------
   // Handler Functions
   // --------------------------------------------------------------------------
   onRedeemItemCreateView : function(activeItem)
   {
      var me = this;
      var view = me.getRedeemMainPage();

      view.item = me.redeemItem;
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, tbbar = activeItem.query('titlebar')[0], store = Ext.StoreMgr.get(me.getRedeemStore());

      me.getSCloseBB()[(store.getAllCount() == 1) ? 'hide' : 'show']();
      if (me.getSBackBB)
      {
         me.getSBackBB()[(store.getAllCount() == 1) ? 'show' : 'hide']();
      }

      tbbar.setTitle(me.getTitle());
      tbbar.removeCls('kbTitle');

      console.debug("Base onRedeemItemActivate - Updated RewardItem View!");
   },
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      if (me.getSDoneBtn())
      {
         me.getSDoneBtn()['hide']();
      }
      window.plugins.proximityID.stop();
      console.debug("onRedeemItemDeactivate - Done with RewardItem View!");
   },

   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;
      var view = me.getRedeemMainPage();

      if (Genesis.fn.isNative())
      {
         if (Ext.os.is('iOS'))
         {
         }
         else if (Ext.os.is('Android'))
         {
         }
         else if (Ext.os.is('BlackBerry'))
         {
         }
      }
      if (view.isPainted() && !view.isHidden())
      {
         me.popView();
      }
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   onShowItemQRCode : function(timeout, qrcode)
   {
      var me = this;
      var _qrcode;
      var title = 'Redeem ' + me.getTitle();

      /*
       console.debug("\n" + //
       "Encrypted Code :\n" + qrcode + "\n" + //
       "Encrypted Code Length: " + qrcode.length);
       */
      _qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      if (_qrcode[0])
      {
         var dom = Ext.DomQuery.select('div.itemPoints',me.getRedeemItem().element.dom)[0];
         if (me.getSRedeemBtn())
         {
            me.getSRedeemBtn().hide();
         }
         if (me.getSDoneBtn())
         {
            me.getSDoneBtn()['show']();
         }
         me.getSCloseBB().hide();
         if (dom)
         {
            Ext.fly(dom).addCls('x-item-hidden');
         }

         me.fireEvent('refreshQRCode', _qrcode);

         Ext.Viewport.setMasked(null);
         Ext.device.Notification.show(
         {
            title : title,
            message : me.showQrCodeMsg,
            buttons : ['OK']
         });
         Ext.device.Notification.vibrate();
      }
      else
      {
         console.debug("onShowItemQRCode - QR Code encoding Error");
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemBrowsePage : function()
   {
      this.openPage('redeemBrowse');
      if (this.getCloseBtn())
      {
         this.getCloseBtn().show();
         this.getBackBtn().hide();
      }
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getRedeemMainPage : function()
   {
      var me = this;
      var page = null;
      switch (me.getRedeemMode())
      {
         case 'authReward' :
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['coverUp']);
            page = me.getRedeemItem();
            break;
         }
      }

      return page;
   },
   getBrowseMainPage : function()
   {
      var me = this;
      var page = null;
      switch (me.getBrowseMode())
      {
         case 'redeemBrowseSC' :
         {
            me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['coverUp']);
            break;
         }
         case 'redeemBrowse' :
         default:
            me.setAnimationMode(Genesis.controller.ControllerBase.animationMode['cover']);
            break;
      }

      var store = Ext.StoreMgr.get(me.getRedeemStore());
      //
      // There's only one item to redeem, autoselect item
      //
      if (store.getAllCount() == 1)
      {
         me.onItemListDisclose(null, store.first(), null, null, null, null, null, true);
      }
      else
      {
         page = me.getRedemptions();
      }

      return page;
   },
   openPage : function(subFeature)
   {
      var me = this;

      if (subFeature.match(/Browse/))
      {
         me.setBrowseMode(subFeature);
         me.pushView(me.getBrowseMainPage());
      }
      else
      {
         me.setRedeemMode(subFeature);
         me.pushView(me.getRedeemMainPage());
      }
   },
   isOpenAllowed : function()
   {
      // VenueId can be found after the User checks into a venue
      //return ((this.getViewPortCntlr().getVenue()) ? true : "You need to Explore or Check-in to a Venue first");
      return true;
   }
});

Ext.define('Genesis.controller.PrizeRedemptionsBase',
{
   extend :  Genesis.controller.RedeemBase ,
                                 
   inheritableStatics :
   {
   },
   xtype : 'prizeRedemptionsCntlr',
   controllerType : 'prize',
   config :
   {
      redeemInfoMsg : 'Getting the Prizes List ...',
      redeemPopupTitle : 'Redeem Prizes',
      redeeemSuccessfulMsg : 'Prize selected has been successfully redeemed!',
      timeoutPeriod : 10,
      minPrizePts : 1,
      browseMode : 'redeemBrowse',
      redeemMode : 'redeemPrize',
      renderStore : 'PrizeRenderCStore',
      redeemStore : 'PrizeStore',
      redeemPointsFn : 'setRedeemPrizePointsURL',
      redeemUrl : 'setGetPrizesURL',
      ptsProperty : 'prize_points',
      title : 'Prizes',
      routes :
      {
         // Browse Prizes Page
         'prizes' : 'redeemBrowsePage',
         //'prize' : 'prizePage',
         'redeemPrize' : 'redeemItemPage'
      },
      refs :
      {
      },
      control :
      {
         redemptions :
         {
            createView : 'onCreateView',
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         redemptionsList :
         {
            select : 'onItemListSelect',
            disclose : 'onItemListDisclose'
         },
         redeemItem :
         {
            createView : 'onRedeemItemCreateView',
            showView : 'onRedeemItemShowView',
            activate : 'onRedeemItemActivate',
            deactivate : 'onRedeemItemDeactivate',
            redeemItemTap : 'onRedeemItemTap'
         }
      },
      listeners :
      {
      }
   },
   scanPlayTitle : 'Spin and Play',
   init : function()
   {
      var me = this;
      me.callParent(arguments);
      //
      // Redeem Prize
      //
      me.on(
      {
         'showredeemitem' : 'onShowRedeemItem',
         //Redeem Prize broadcast to Social Media
         'showredeemprize' : 'onShowRedeemPrize',
         'showQRCode' : 'onShowItemQRCode'
      });

      console.log("Prize Redemptions Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onShowRedeemItem : function(redeemItem)
   {
      var me = this;

      //
      // Show prize on redeemItem Container
      //
      me.redeemItem = redeemItem;
      me.redirectTo('redeemPrize');
   },
   onShowRedeemPrize : function(prize, reward_info, viewsPopLength)
   {
      var me = this;
      var info = reward_info;
      //var redeemItem = me.redeemItem = prize;

      me.redeemItem = prize
      if (viewsPopLength > 0)
      {
         console.debug("Removing Last " + viewsPopLength + " Views from History ...");
         me.silentPopView(viewsPopLength);
      }

      me.redirectTo('redeemPrize');
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, tbbar = activeItem.query('titlebar')[0];

      me.getSCloseBB()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      me.getSBackBB()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();
      //me.getSBB().hide();
      tbbar.setTitle(me.getTitle());
      tbbar.removeCls('kbTitle');
      //
      // Show redeem button on Toolbar
      //
      if (me.getSRedeemBtn())
      {
         me.getSRedeemBtn()['show']();
      }
      console.debug("Base onRedeemItemActivate - Updated RewardItem View.");
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemItemPage : function()
   {
      this.setTitle('Prizes');
      this.openPage('redeemPrize');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});

Ext.define('Genesis.controller.RewardRedemptionsBase',
{
   extend :  Genesis.controller.RedeemBase ,
                                 
   inheritableStatics :
   {
   },
   xtype : 'rewardRedemptionsBaseCntlr',
   controllerType : 'redemption',
   config :
   {
      redeeemSuccessfulMsg : 'Reward selected has been successfully redeemed!',
      redeemInfoMsg : 'Getting the Redemptions List ...',
      redeemPopupTitle : 'Redeem Rewards',
      browseMode : 'redeemBrowse',
      redeemMode : 'redeemReward',
      renderStore : 'RedemptionRenderCStore',
      redeemStore : 'RedeemStore',
      redeemUrl : 'setGetRewardsURL',
      redeemPath : 'redeemBrowseRewardsSC',
      ptsProperty : 'points',
      title : 'Rewards',
      routes :
      {
         // Browse Redemption Page
         'redemptions' : 'redeemBrowsePage',
         //Shortcut to choose venue to redeem rewards
         'redeemRewardsChooseSC' : 'redeemChooseSCPage',
         //Shortcut to visit Merchant Account for the Venue Page
         'redeemBrowseRewardsSC' : 'redeemBrowseSCPage',
         'redeemReward' : 'redeemItemPage'
      },
      refs :
      {
      },
      control :
      {
         redemptions :
         {
            createView : 'onCreateView',
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         redemptionsList :
         {
            select : 'onItemListSelect',
            disclose : 'onItemListDisclose'
         },
         redeemItem :
         {
            createView : 'onRedeemItemCreateView',
            showView : 'onRedeemItemShowView',
            activate : 'onRedeemItemActivate',
            deactivate : 'onRedeemItemDeactivate',
            redeemItemTap : 'onRedeemItemTap'
         }
      }
   },
   xtype : 'redemptionsBaseCntlr',
   checkinFirstMsg : 'Please Check-In before redeeming Rewards',
   init : function()
   {
      var me = this;
      me.callParent(arguments);

      //
      // Redeem Rewards
      //
      me.on(
      {
         'showredeemitem' : 'onShowRedeemItem',
         'showQRCode' : 'onShowItemQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
      });
      console.log("RewardRedemptionsBase Init");
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemMainPage();
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getInnerItems()[0];

      var info = item.query('component[tag=info]')[0];
      info.hide();

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img', photo.element.dom)[0]);
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.5),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.5)
      });
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
   },
   // --------------------------------------------------------------------------
   // Redemption Page
   // --------------------------------------------------------------------------
   onShowRedeemItem : function(redeemItem)
   {
      var me = this;

      //
      // Show prize on redeemItem Container
      //
      me.redeemItem = redeemItem;
      me.redirectTo('redeemReward');
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemItemPage : function()
   {
      this.openPage('redeemReward');
   }
});

Ext.define('Genesis.view.ViewBase',
{
   extend :  Ext.Container ,
   xtype : 'viewbase',
   inheritableStatics :
   {
      generateTitleBarConfig : function()
      {
         return (
            {
               xtype : 'titlebar',
               docked : 'top',
               tag : 'navigationBarTop',
               cls : 'navigationBarTop',
               masked :
               {
                  xtype : 'mask',
                  transparent : true
               },
               defaults :
               {
                  iconMask : true
               }
            });
      },
      invisibleMask :
      {
         xtype : 'mask',
         transparent : true
      },
      phoneField : function()
      {
         return (
            {
               xtype : 'textfield',
               minLength : 12,
               maxLength : 12,
               placeHolder : '800-555-1234',
               listeners :
               {
                  keyup : function(f, e, eOpts)
                  {
                     var keyCode = e.browserEvent.keyCode, key = String.fromCharCode(keyCode), value = f.getValue();

                     if ((keyCode >= 48 && keyCode <= 90) || //
                     (keyCode >= 106 && keyCode <= 111) || //
                     (keyCode >= 186 && keyCode <= 192) || //
                     (keyCode >= 219 && keyCode <= 222))
                     {
                        if (key.match(/[0-9]/) && (!e.browserEvent.shiftKey && !e.browserEvent.ctrlKey && !e.browserEvent.metaKey))
                        {
                           if ((value.length == 3) || (value.length == 7))
                           {
                              f.setValue(value + "-");
                           }
                           else if ((value.length == 4) || (value.length == 8))
                           {
                              var match = value.match(/-/);
                              if (!match)
                              {
                                 f.setValue(value.slice(0, value.length - 1) + "-" + value[value.length - 1]);
                              }
                              else
                              {
                                 switch (match.length)
                                 {
                                    case 1:
                                    {
                                       if (value.length > 4)
                                       {
                                          f.setValue(value.slice(0, value.length - 1) + "-" + value[value.length - 1]);
                                       }
                                       break;
                                    }
                                    default:
                                       break;
                                 }
                              }
                           }
                        }
                        else
                        {
                           f.setValue(value.slice(0, value.length - 1));
                        }
                     }
                     //console.debug("Phone#[" + f.getValue() + "]");
                  }
               }
            });
      }
   },
   config :
   {
      preRender : null
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   calcCarouselSize : function(factor)
   {
      var me = this, spacingFactor = 50;

      factor = factor || 1;
      console.debug("Screen Height[" + window.innerHeight + "], Width[" + window.innerWidth + "]");
      if (window.innerHeight < (480 - spacingFactor))
      {
         me.setItemPerPage(4 * factor);
      }
      else if (window.innerHeight < (568 - spacingFactor))
      {
         me.setItemPerPage(6 * factor);
      }
      else if (window.innerHeight < (1024 - spacingFactor))
      {
         me.setItemPerPage(8 * factor);
      }
      else
      {
         me.setItemPerPage(10 * factor);
      }
   },
   cleanView : function()
   {
      this.fireEvent('cleanView', this);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      var rc = this.callParent(arguments);
      this.setPreRender([]);

      return rc;
   },
   createView : function()
   {
      this.fireEvent('createView', this);
      return (this.getPreRender().length == 0);
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      if (this.getInnerItems().length == 0)
      {
         this.add(this.getPreRender());
      }
      Ext.defer(this.fireEvent, 0.01 * 1000, this, ['showView', this]);
      //this.fireEvent('showView', this);
   }
});

Ext.define('Genesis.view.Document',
{
   extend :  Genesis.view.ViewBase ,
   xtype : 'documentview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'container',
         tag : 'content',
         scrollable : 'vertical',
         padding : '0.7 0.8',
         defaultUnit : 'em',
         html : ' '
      }]
   },
   disableAnimation : true,
   setHtml : function(html)
   {
      var page = this.query('container[tag=content]')[0];
      var scroll = page.getScrollable();

      page.setHtml(html);
      if (scroll)
      {
         scroll.getScroller().scrollTo(0, 0);
      }
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
   }
});

Ext.define('Genesis.view.MultipartDocument',
{
                                
   extend :  Genesis.view.ViewBase ,
   xtype : 'multipartdocumentview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'tabpanel',
         defaults :
         {
            xtype : 'container',
            scrollable : 'vertical',
            padding : '0.7 0.8',
            defaultUnit : 'em',
            html : ' '
         },
         layout : 'card',
         tabBarPosition : 'top',
         tabBar :
         {
            layout :
            {
               pack : 'justify'
            }
         }
      }]
   },
   disableAnimation : true,
   setHtml : function(index, tabConfig)
   {
      var tabPanel = this.query('tabpanel')[0];
      var page = tabPanel.getInnerItems()[index];
      if (!page)
      {
         page = tabPanel.insert(index, Ext.apply(
         {
            xtype : 'container'
         }, tabConfig));
      }
      else
      {
         var scroll = page.getScrollable();
         scroll.getScroller().scrollTo(0, 0);
         page.setHtml(html);
      }
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
   }
});

Ext.define('Genesis.controller.SettingsBase',
{
   extend :  Genesis.controller.ControllerBase ,
   inheritableStatics :
   {
   },
   xtype : 'settingsBaseCntlr',
   config :
   {
      termsOfServiceTitle : 'Term of Service',
      privacyTitle : 'Privacy',
      aboutUsTitle : 'About Us',
      routes :
      {
         'aboutus' : 'documentPage',
         'privacy' : 'documentPage',
         'termsOfUse' : 'multipartDocumentPage',
         'settings' : 'openSettingsPage'
      },
      refs :
      {
         documentPage :
         {
            selector : 'documentview',
            autoCreate : true,
            xtype : 'documentview'
         },
         multipartDocumentPage :
         {
            selector : 'multipartdocumentview',
            autoCreate : true,
            xtype : 'multipartdocumentview'
         }
      }
   },
   termsLoaded : false,
   privacyLoaded : false,
   aboutUsLoaded : false,
   init : function()
   {
      this.callParent(arguments);
      this.getMultipartDocumentPage();
      this.getDocumentPage();

      console.log("Settings Base Init");
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onTermsTap : function(b, e)
   {
      var me = this, flag = 0, viewport = me.getViewPortCntlr(), responses = [], page = me.getMultipartDocumentPage();

      page.query('title')[0].setTitle(me.getTermsOfServiceTitle());
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (!me.termsLoaded)
      {
         var _exit = function()
         {
            for (var i = 0; i < responses.length; i++)
            {
               page.setHtml(i, responses[i].cardConfig);
            }
            me.redirectTo('termsOfUse');
            me.termsLoaded = true;
         }

         Ext.Ajax.request(
         {
            async : true,
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'term_of_service.htm',
            callback : function(option, success, response)
            {
               if (success || (response.status == 0))
               {
                  responses[0] = response;
                  response.cardConfig =
                  {
                     title : 'Terms of Use',
                     html : response.responseText
                  }
                  if ((flag |= 0x01) == 0x11)
                  {
                     _exit();
                  }
               }
               else
               {
                  console.debug("Error Loading Term of Service Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
         Ext.Ajax.request(
         {
            async : true,
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'program_rules.htm',
            callback : function(option, success, response)
            {
               if (success || (response.status == 0))
               {
                  responses[1] = response;
                  response.cardConfig =
                  {
                     title : 'Program Rules',
                     html : response.responseText
                  }
                  if ((flag |= 0x10) == 0x11)
                  {
                     _exit();
                  }
               }
               else
               {
                  console.debug("Error Loading Program Rules Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
      }
      else
      {
         me.redirectTo('termsOfUse');
      }
   },
   onPrivacyTap : function(b, e)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var page = me.getDocumentPage();

      page.query('title')[0].setTitle(me.getPrivacyTitle());
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (!me.privacyLoaded)
      {
         Ext.Ajax.request(
         {
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'privacy.htm',
            callback : function(option, success, response)
            {
               if (success || (response.status == 0))
               {
                  page.setHtml(response.responseText);
                  me.redirectTo('privacy');
                  me.privacyLoaded = true;
               }
               else
               {
                  console.debug("Error Loading Privacy Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
      }
      else
      {
         me.redirectTo('privacy');
      }
   },
   onAboutUsTap : function(b, e)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var page = me.getDocumentPage();

      page.query('title')[0].setTitle(me.getAboutUsTitle());
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (me.aboutUsLoaded)
      {
         Ext.Ajax.request(
         {
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'about_us.htm',
            callback : function(option, success, response)
            {
               if (success || (response.status == 0))
               {
                  page.setHtml(response.responseText);
                  me.redirectTo('aboutUs');
                  me.aboutUsLoaded = true;
               }
               else
               {
                  console.debug("Error Loading About US Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
      }
      else
      {
         me.redirectTo('aboutUs');
      }
   },
   onDeviceReset : function(b, e)
   {
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : Ext.emptyFn,
   multipartDocumentPage : function()
   {
      this.openPage('multipartDocument');
   },
   documentPage : function()
   {
      this.openPage('document');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;
      switch(subFeature)
      {
         case 'settings' :
         {
            page = me.getSettingsPage();
            me.setAnimationMode(me.self.animationMode['cover']);
            break;
         }
         case 'multipartDocument' :
         {
            page = me.getMultipartDocumentPage();
            me.setAnimationMode(me.self.animationMode['slide']);
            break;
         }
         case 'document' :
         {
            page = me.getDocumentPage();
            me.setAnimationMode(me.self.animationMode['slide']);
            break;
         }
      }
      me.pushView(page);
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

Ext.define('Genesis.model.Challenge',
{
   extend :  Ext.data.Model ,
   id : 'Challenge',
   alternateClassName : 'Challenge',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      fields : ['id', 'type', 'name', 'description',
      // Image associated with the Challenge
      'require_verif', 'data', 'points', 'created_ts', 'update_ts', 'photo', 'merchant_id', 'venue_id'],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   getMerchant : function()
   {

   },
   inheritableStatics :
   {
      setGetChallengesURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges');
      },
      setCompleteChallengeURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/' + id + '/complete');
      },
      setCompleteMerchantChallengeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/merchant_complete');
      },
      setCompleteReferralChallengeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/complete_referral');
      },
      setSendReferralsUrl : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/' + id + '/start');
      }
   }
});

Ext.define('Genesis.model.Venue',
{
   extend :  Ext.data.Model ,
                                                                                                          
   alternateClassName : 'Venue',
   id : 'Venue',
   config :
   {
      fields : ['id', 'name', 'address', 'description', 'distance', 'city', 'state', 'country', 'zipcode', 'phone', 'website', 'latitude', 'longitude', 'created_ts', 'update_ts', 'type', 'merchant_id',
      // Winners Count for front end purposes
      'prize_jackpots'],
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      hasMany : [
      {
         model : 'Genesis.model.Challenge',
         name : 'challenges'
      },
      {
         model : 'Genesis.model.PurchaseReward',
         name : 'purchaseReward'
      },
      {
         model : 'Genesis.model.CustomerReward',
         name : 'customerReward'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      idProperty : 'id'
   },
   inheritableStatics :
   {
      setGetMerchantVenueExploreURL : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/' + venueId + '/merchant_explore');
      },
      setFindNearestURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/find_nearest');
      },
      setGetClosestVenueURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/find_closest');
      },
      setSharePhotoURL : function()
      {
         //
         // Not used because we need to use Multipart/form upload
         //
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/share_photo');
      },
      setGetLicenseKeyURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/venues/updateLicenseKey');
      },
      setMerchantReceiptUploadURL : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost +'/api/v1/venues/' + venueId + '/merchant_add_sku_data');
      }
   }

});

Ext.define('Genesis.model.frontend.LicenseKeyJSON',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'LicenseKeyJSON',
   id : 'LicenseKeyJSON',
   config :
   {
      proxy :
      {
         type : 'localstorage',
         id : 'LicenseKeyJSON',
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json'
         }
      },
      identifier : 'uuid',
      fields : ['json', 'id'],
      idProperty : 'id'
   }
});

Ext.define('Genesis.model.frontend.LicenseKey',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'LicenseKey',
   id : 'LicenseKey',
   config :
   {
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      fields : ['venue_id', 'venue_name', 'id'],
      idProperty : 'id'
   },
   inheritableStatics :
   {
      setGetLicenseKeyURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/devices/get_encryption_key');
      }
   }
});

Ext.define('Genesis.controller.ViewportBase',
{
   extend :  Genesis.controller.ControllerBase ,
                            
   inheritableStatics :
   {
   },
   config :
   {
      models : ['Customer', 'Checkin', 'Venue', 'Genesis.model.frontend.LicenseKey'],
      sound_files : null,
      refs :
      {
         view : 'viewportview',
         backButton : 'button[tag=back]',
         closeButton : 'button[tag=close]'
      },
      control :
      {
         //
         view :
         {
            activate : 'onActivate'
         },
         backButton :
         {
            tap : 'onBackButtonTap'
         },
         closeButton :
         {
            tap : 'onBackButtonTap'
         },
         //
         'viewportview button' :
         {
            tap : 'onButtonTap'
         }
      }
   },
   mainPageStorePathToken : /\{platform_path\}/mg,
   popViewInProgress : false,
   viewStack : [],
   animationFlag : 0,
   gatherCheckinInfoMsg : 'Prepare to scan Check-in Code ...',
   retrieveChallengesMsg : 'Retrieving Challenges ...',
   // --------------------------------------------------------------------------
   // MetaData Handlers
   // --------------------------------------------------------------------------
   updateBadges : function(badges)
   {
      var me = this, bstore = Ext.StoreMgr.get('BadgeStore');
      if (badges)
      {
         // Update All Badges
         //console.debug('badges - [' + Ext.encode(badges) + ']');
         bstore.setData(badges);
         //me.persistSyncStores('BadgeStore');
      }
   },
   updateAccountInfo : function(metaData, info)
   {
      var me = this, updateBadge = false, viewport = me.getViewPortCntlr();
      var bstore = Ext.StoreMgr.get('BadgeStore'), cstore = Ext.StoreMgr.get('CustomerStore');
      var customer = viewport.getCustomer(), customerId = metaData['customer_id'] || ((customer) ? customer.getId() : 0);
      var _createNewCustomer = function()
      {
         //
         // First Visit!
         //
         if (info && (info['visits'] == 1))
         {
            console.debug("Adding New Customer Record ...");

            var merchants = me.getApplication().getController('client' + '.Merchants'), checkins = me.getApplication().getController('client' + '.Checkins');
            var _customer = viewport.getCustomer(), ccustomer = Ext.create('Genesis.model.Customer', Ext.applyIf(
            {
               id : customerId,
               merchant : _customer.getMerchant().raw
            }, info));
            ccustomer.setLastCheckin(Ext.create('Genesis.model.Checkin'));
            cstore.add(ccustomer);

            merchants.getMain().cleanView(checkins.getExplore());
            checkins.fireEvent('setupCheckinInfo', 'checkin', viewport.getVenue(), ccustomer, metaData);

            console.debug("New Customer Record Added.");

            me.persistSyncStores('CustomerStore');

            customer = ccustomer;
         }
      };

      if (customerId > 0)
      {
         console.debug("updateAccountInfo - customerId[" + customerId + "]");

         customer = cstore.getById(customerId);
         if (customer)
         {
            customer.beginEdit();
            if (info)
            {
               if (Ext.isDefined(info['points']))
               {
                  customer.set('points', info['points']);
               }
               if (Ext.isDefined(info['prize_points']))
               {
                  customer.set('prize_points', info['prize_points']);
               }
               if (Ext.isDefined(info['visits']))
               {
                  customer.set('visits', info['visits']);
               }
               if (Ext.isDefined(info['next_badge_visits']))
               {
                  customer.set('next_badge_visits', info['next_badge_visits']);
               }
               //
               // Badge Status
               //
               var i, badges = [
               {
                  id : info['badge_id'],
                  prefix : "Customer's Current Badge is - [",
                  badgeId : 'badge_id'
               }, //
               {
                  id : info['next_badge_id'],
                  prefix : "Customer's Next Badge is - [",
                  badgeId : 'next_badge_id'
               }];
               for ( i = 0; i < badges.length; i++)
               {
                  if (Ext.isDefined(badges[i].id))
                  {
                     var badge = bstore.getById(badges[i].id);
                     console.debug(badges[i].prefix + //
                     badge.get('type').display_value + "/" + badge.get('visits') + "]");

                     customer.set(badges[i].badgeId, badges[i].id);
                  }
               }
               var eligible_reward = info['eligible_for_reward'];
               if (Ext.isDefined(eligible_reward))
               {
                  customer.set('eligible_for_reward', eligible_reward);
               }
               var eligible_prize = info['eligible_for_prize'];
               if (Ext.isDefined(eligible_prize))
               {
                  customer.set('eligible_for_prize', eligible_prize);
               }
            }
            customer.endEdit();
            me.persistSyncStores('CustomerStore');
         }
         else
         {
            _createNewCustomer();
         }
      }
      else
      {
         _createNewCustomer();
      }

      return customer;
   },
   updateRewards : function(rewards)
   {
      if (rewards && (rewards.length > 0))
      {
         var i, me = this, viewport = me.getViewPortCntlr(), merchant = viewport.getVenue().getMerchant();

         console.debug("Total Redemption Rewards - " + rewards.length);
         for ( i = 0; i < rewards.length; i++)
         {
            rewards[i]['merchant'] = merchant;
         }
         Ext.StoreMgr.get('RedeemStore').setData(rewards);
      }
   },
   updatePrizes : function(prizes)
   {
      if (prizes && (prizes.length > 0))
      {
         var i, me = this, viewport = me.getViewPortCntlr(), merchant = viewport.getVenue().getMerchant();

         console.debug("Total Redemption Prizes - " + prizes.length);
         for ( i = 0; i < prizes.length; i++)
         {
            prizes[i]['merchant'] = merchant;
         }
         Ext.StoreMgr.get('PrizeStore').setData(prizes);
      }
   },
   updateNews : function(news)
   {
      var nstore = Ext.StoreMgr.get('NewsStore');
      if (news && (news.length > 0))
      {
         console.debug("Total News Items - " + news.length);
         nstore.setData(news);
      }
      else
      {
         console.debug("No News Items");
         nstore.removeAll();
      }
   },
   updateAuthCode : function(metaData)
   {
      var me = this, rc = false, db = Genesis.db.getLocalDB();
      var authCode = metaData['auth_token'], csrfCode = metaData['csrf_token'], account = metaData['account'];

      if (!authCode)
         return rc;

      rc = true;
      if ((authCode != db['auth_code']) || (csrfCode != db['csrf_code']))
      {
         db['auth_code'] = authCode;
         db['csrf_code'] = csrfCode;
         db['account'] = account ||
         {
         };
         Genesis.db.setLocalDB(db);

         console.debug('\n' + //
         "auth_code [" + authCode + "]" + "\n" + //
         "csrf_code [" + csrfCode + "]" + "\n" + //
         "account [" + Ext.encode(account) + "]" + "\n" + //
         "currFbId [" + db['currFbId'] + "]");
      }

      return rc;
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this, customer = null, viewport = me.getViewPortCntlr(), db = Genesis.db.getLocalDB(), cestore = Ext.StoreMgr.get('CheckinExploreStore');
      try
      {
         //
         // Update Authentication Token
         //
         if (me.updateAuthCode(metaData))
         {
            viewport.setLoggedIn(true);
            viewport.fireEvent('updateDeviceToken');

            // No Venue Checked-In from previous session
            if (!db['last_check_in'])
            {
               //
               // Trigger Facebook Login reminder
               //
               if ((db['enableFB'] && (db['currFbId'] > 0)) || db['disableFBReminderMsg'])
               {
                  me.redirectTo('checkin');
               }
               else
               {
                  Genesis.fb.createFBReminderMsg();
               }
            }

            return;
         }

         //
         // Update points from the purchase or redemption
         // Update Customer info
         //
         me.updateBadges(metaData['badges']);

         customer = me.updateAccountInfo(metaData, metaData['account_info']);
         //
         // Short Cut to earn points, customer object wil be given by server
         //
         // Find venueId from metaData or from DataStore
         var new_venueId = metaData['venue_id'] || ((cestore.first()) ? cestore.first().getId() : 0);
         // Find venue from DataStore or current venue info
         venue = cestore.getById(new_venueId) || viewport.getVenue();

         if (Ext.isDefined(metaData['venue']))
         {
            venue = Ext.create('Genesis.model.Venue', metaData['venue']);
            var controller = me.getApplication().getController('client' + '.Checkins');
            //
            // Winners' Circle'
            //
            var prizeJackpotsCount = metaData['prize_jackpots'];
            if (prizeJackpotsCount >= 0)
            {
               console.debug("Prize Jackpots won by customers at this merchant this month - [" + prizeJackpotsCount + "]");
               venue.set('prize_jackpots', prizeJackpotsCount);
            }

            console.debug("customer_id - " + customer.getId() + '\n' + //
            "merchant_id - " + venue.getMerchant().getId() + '\n' + //
            //"venue - " + Ext.encode(metaData['venue']));
            '');
            controller.fireEvent('setupCheckinInfo', 'checkin', venue, customer, metaData);
         }
         else
         {
            //
            // Winners' Circle'
            //
            var prizeJackpotsCount = metaData['prize_jackpots'];
            if (prizeJackpotsCount >= 0)
            {
               console.debug("Prize Jackpots won by customers at this merchant this month - [" + prizeJackpotsCount + "]");
               venue.set('prize_jackpots', prizeJackpotsCount);
            }
         }

         //
         // Update Customer Rewards (Rewards Redemptions)
         //
         me.updateRewards(metaData['rewards']);
         //
         // Update Customer Rewards (Prizes Redemptions)
         //
         me.updatePrizes(metaData['prizes']);
         //
         // Update News
         // (Make sure we are after Redemption because we may depend on it for rendering purposes)
         //
         me.updateNews(metaData['newsfeed']);
      }
      catch(e)
      {
         console.debug("updateMetaDataInfo Exception - " + e);
      }

      return customer;
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onCompleteRefreshCSRF : Ext.emptyFn,
   onUpdateDeviceToken : Ext.emptyFn,
   onActivate : function()
   {
      var me = this, file = Ext.Loader.getPath("Genesis") + "/store/" + ((!merchantMode) ? 'mainClientPage' : 'mainServerPage') + '.json', path = "", db = Genesis.db.getLocalDB();
      var request = new XMLHttpRequest(), enablePrizes = db['enablePrizes'], enableChallenges = db['enableChallenges'];

      if (( typeof (device) != 'undefined') && device.uuid)
      {
         if (Ext.os.is('iOS') || Ext.os.is("BlackBerry"))
         {
            path = "";
         }
         else if (Ext.os.is('Android'))
         {
            path = "file:///android_asset/www/";
         }
      }
      file = path + file;

      console.log("Loading MainPage Store ...");
      //console.debug("Creating Request [" + path + file + "]");
      request.onreadystatechange = function()
      {
         if (request.readyState == 4)
         {
            if (request.status == 200 || request.status == 0)
            {
               var text = request.responseText.replace(me.mainPageStorePathToken, Genesis.constants._iconPath);
               console.log("Loaded MainPage Store ...");
               var response = Ext.decode(text);
               var data = response.data;
               for (var i = 0; i < data.length; i++)
               {
                  var item = data[i];
                  var index = data.indexOf(item);
                  if (merchantMode)
                  {
                     if (Ext.isDefined(enablePrizes))
                     {
                        if (!enablePrizes)
                        {
                           if (item['id'] == 'redeemPrizes')
                           {
                              data.splice(index, 1);
                              if (index == i)
                              {
                                 i--;
                              }
                           }
                        }
                     }
                     if (Ext.isDefined(enableChallenges))
                     {
                        if (!enableChallenges)
                        {
                           if (item['id'] == 'challenges')
                           {
                              data.splice(index, 1);
                              if (index == i)
                              {
                                 i--;
                              }
                           }
                        }
                     }
                  }
                  //
                  // MobileClient do not support Referrals and Transfers
                  //
                  else if (_build == 'MobileWebClient')
                  {
                     switch (item['id'])
                     {
                        case 'transfer':
                        case 'referrals' :
                        {
                           data.splice(index, 1);
                           if (index == i)
                           {
                              i--;
                           }
                           break;
                        }
                     }
                  }
               }
               Ext.StoreMgr.get('MainPageStore').setData(response.data);
            }
         }
      };
      request.open("GET", file, true);
      request.send(null);
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onButtonTap : function(b, e, eOpts)
   {
      this.self.playSoundFile(this.sound_files['clickSound']);
   },
   onBackButtonTap : function(b, e, eOpts)
   {
      this.popView();
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   resetView : function()
   {
      var me = this;
      var vport = me.getViewport();
      //
      // Remove All Views
      //
      me.viewStack = [];
      me.getApplication().getHistory().setActions([]);
      //
      // Remove all internal buffered views
      //
      //delete vport._activeItem;
   },
   pushView : function(view, animation)
   {
      if (!view)
      {
         return;
      }

      var me = this;

      animation = Ext.apply(animation,
      {
         reverse : false
      });
      var lastView = (me.viewStack.length > 1) ? me.viewStack[me.viewStack.length - 2] : null;

      //
      // Refresh view
      //
      if ((me.viewStack.length > 0) && (view == me.viewStack[me.viewStack.length - 1]['view']))
      {
      }
      //
      // Pop view
      //
      else if (lastView && (lastView['view'] == view))
      {
         me.popView();
      }
      //
      // Push view
      //
      else
      {
         //
         // Remember what animation we used to render this view
         //
         var actions = me.getApplication().getHistory().getActions();
         me.viewStack.push(
         {
            view : view,
            animation : animation,
            url : actions[actions.length - 1].getUrl()
         });
         me.getViewport().animateActiveItem(view, animation);
      }
      /*
       console.debug("pushView - length[" + me.viewStack.length + "]");
       for (var i = 0; i < me.viewStack.length; i++)
       {
       if (me.viewStack[i]['view'])
       {
       console.debug("pushView - [" + me.viewStack[i]['view']._itemId + "]")
       }
       else
       {
       console.debug("pushView - [" + Ext.encode(me.viewStack[i]['view']) + "]")
       }
       }
       */
   },
   silentPopView : function(num)
   {
      var me = this;
      num = Math.min(me.viewStack.length, num);
      var actions = me.getApplication().getHistory().getActions();

      if ((me.viewStack.length > 0) && (num > 0))
      {
         while (num-- > 0)
         {
            var lastView = me.viewStack.pop();
            actions.pop();
            //
            // Viewport will automatically detect not to delete current view
            // until is no longer the activeItem
            //
            //me.getViewport().remove(lastView['view']);
         }
      }
   },
   popView : function()
   {
      var me = this;
      var actions = me.getApplication().getHistory().getActions();

      if (me.viewStack.length > 1)
      {
         /*
          console.debug("popView - length[" + me.viewStack.length + "]");
          for (var i = 0; i < me.viewStack.length; i++)
          {
          if (me.viewStack[i]['view'])
          {
          console.debug("popView - [" + me.viewStack[i]['view']._itemId + "]")
          }
          else
          {
          console.debug("popView - [" + Ext.encode(me.viewStack[i]['view']) + "]")
          }
          }
          */
         var lastView = me.viewStack.pop();
         var currView = me.viewStack[me.viewStack.length - 1];
         /*
          if (lastView)
          {
          console.debug("popView - lastView[" + lastView['view']._itemId + "]");
          }
          console.debug("popView - currView[" + currView['view']._itemId + "]")
          */
         if (!me.popViewInProgress)
         {
            me.popViewInProgress = true;
            //Ext.defer(function()
            {
               actions.pop();
               //
               // Recreate View if the view was destroyed for DOM memory optimization
               //
               if (currView['view'].isDestroyed)
               {
                  currView['view'] = Ext.create(currView['view'].alias[0]);
                  //console.debug("Recreated View [" + currView['view']._itemId + "]")
               }

               //
               // Update URL
               //
               me.getApplication().getHistory().setToken(currView['url']);
               window.location.hash = currView['url'];

               me.getViewport().animateActiveItem(currView['view'], Ext.apply(lastView['animation'],
               {
                  reverse : true
               }));
            }
            //, 1, me);
         }
      }
      else
      {
         if (!me.getLoggedIn || me.getLoggedIn())
         {
            me.goToMerchantMain(true);
         }
         else
         {
            me.redirectTo('login');
         }
      }
   },
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   init : function(app)
   {
      var me = this;

      //
      // Initialize global constants
      //
      Genesis.constants.init();

      me.callParent(arguments);

      if (Ext.isDefined(window.device))
      {
         console.debug(//
         "\n" + "device.platform - " + device.platform + //
         "\n" + "device.uuid - " + device.uuid + //
         "\n" + "Browser EngineVersion - " + Ext.browser.engineVersion + //
         "");
      }

      me.on(
      {
         'viewanimend' : 'onViewAnimEnd',
         'baranimend' :
         {
            buffer : 0.5 * 1000,
            fn : 'onBarAnimEnd'
         },
         'pushview' : 'pushView',
         'silentpopview' : 'silentPopView',
         'popview' : 'popView',
         'resetview' : 'resetView'
      });

      Ext.regStore('LicenseStore',
      {
         model : 'Genesis.model.frontend.LicenseKey',
         autoLoad : false
      });

      me.last_click_time = new Date().getTime();
      //
      // Prevent Strange Double Click problem ...
      //
      document.addEventListener('click', function(e)
      {
         var click_time = e['timeStamp'];
         if (click_time && (click_time - me.last_click_time) < 1000)
         {
            e.stopPropagation();
            e.preventDefault();
            return false;
         }
         me.last_click_time = click_time;
         return true;
      });
      console.log("ViewportBase Init");
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
               sound_file = new Media((Ext.os.is('Android') ? '/android_asset/www/' : '') + 'resources/audio/' + sound_file + ext, function()
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
      else if (merchantMode)
      {
         var elem = Ext.get(sound_file);
         if (elem)
         {
            elem.dom.addEventListener('ended', function()
            {
               me.sound_files[tag].successCallback();
            }, false);
         }
      }

      me.sound_files[tag] =
      {
         name : sound_file,
         type : type
      };
   },
   openMainPage : Ext.emptyFn
});

Ext.define('Genesis.view.client.Accounts',
{
   extend :  Genesis.view.ViewBase ,
                                                                                             
   alias : 'widget.clientaccountsview',
   config :
   {
      cls : 'accountsMain viewport',
      layout :
      {
         type : 'card',
         animation :
         {
            duration : 400,
            easing : 'ease-in-out',
            type : 'slide',
            direction : 'left'
         }
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'left',
            tag : 'vback',
            hidden : true,
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'right',
            ui : 'normal',
            iconCls : 'refresh',
            tag : 'refresh'
         }]
      })]
   },
   showTransferHdr : false,
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         /*
          var isEligible;
          //
          // Badge Update for Eligible for Rewards/Prizes
          //
          var merchants = Ext.DomQuery.select('.x-badge', me.query('container[tag=accountsList]
          list[tag=accountsList]')[0].element.dom);
          var customers = Ext.StoreMgr.get('CustomerStore').getRange();

          for (var i = 0; i < merchants.length; i++)
          {
          var merchant = Ext.get(merchants[i]);
          var customer = customers[i];

          switch (me.mode)
          {
          case 'redeemRewardsProfile' :
          {
          isEligible = customer.get('eligible_for_reward');
          break;
          }
          case 'redeemPrizesProfile' :
          {
          isEligible = customer.get('eligible_for_prize');
          break;
          }
          case 'profile' :
          {
          isEligible = customer.get('eligible_for_reward') || customer.get('eligible_for_prize');
          break;
          }
          case 'emailtransfer' :
          case 'transfer' :
          default :
          break;
          }

          merchant[(isEligible) ? 'removeCls' : 'addCls']('x-item-hidden');
          }
          */

         return;
      }

      var itemHeight = 1 + Genesis.constants.defaultIconSize();
      me.setPreRender(me.getPreRender().concat([
      //
      // Accounts List
      //
      Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'CustomerStore',
         tag : 'accountsList',
         cls : 'accountsList',
         plugins : [
         {
            type : 'pullrefresh',
            //pullRefreshText: 'Pull down for more new Tweets!',
            refreshFn : function(plugin)
            {
               me.fireEvent('refresh');
            }
         },
         {
            type : 'listpaging',
            autoPaging : true,
            noMoreRecordsText : '',
            loadMoreText : ''
         }],
         refreshHeightOnUpdate : false,
         variableHeights : false,
         itemHeight : itemHeight + 2 * Genesis.fn.calcPx(0.65, 1),
         loadingText : null,
         deferEmptyText : false,
         emptyText : ' ',
         /*
          indexBar :
          {
          docked : 'right',
          overlay : true,
          alphabet : true,
          centered : false
          //letters : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
          },
          */
         pinHeaders : false,
         grouped : true,
         items : [
         //
         // Transfer Account Hdr
         //
         {
            docked : 'top',
            xtype : 'toolbar',
            centered : false,
            tag : 'transferHdr',
            hidden : !me.showTransferHdr,
            defaults :
            {
               iconMask : true
            },
            items : [
            {
               xtype : 'title',
               title : 'Select Account :'
            },
            {
               xtype : 'spacer',
               align : 'right'
            }]
         }],
         itemTpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<tpl if="this.isValidCustomer(values)">',
            '<div class="photo x-hasbadge">',
               '{[this.isEligible(values)]}',
               '<img src="{[this.getPhoto(values)]}"/>',
            '</div>',
            '<div class="listItemDetailsWrapper {[this.isSingle(values)]}" style="position:relative;{[this.getDisclose(values)]}">',
               //'<div class="title">{[this.getTitle()]}</div>',
               '<tpl if="this.showRewardPoints(values)">',
                  '<div class="points">',
                     '{[this.getRewardPoints(values)]}',
                  '</div>',
               '</tpl>',
               '<tpl if="this.showPrizePoints(values)">',
                  '<div class="points">',
                      '{[this.getPrizePoints(values)]}'+
                 '</div>',
                '</tpl>',
            '</div>',
         '</tpl>',
         // @formatter:on
         {
            getDisclose : function(customer)
            {
               var rc = '', merchant = customer.merchant;
               customer['disclosure'] = true;

               switch (me.mode)
               {
                  case 'redeemPrizesProfile' :
                  {
                     if (merchant['features_config'] && !merchant['features_config']['enable_prizes'])
                     {
                        customer['disclosure'] = false;
                     }
                     rc = ((customer['disclosure'] === false) ? 'padding-right:0;' : '');
                     break;
                  }
                  case 'redeemRewardsProfile' :
                  case 'emailtransfer' :
                  case 'transfer' :
                  case 'profile' :
                  default :
                     break;
               }

               return rc;
            },
            isSingle : function(customer)
            {
               rc = '';
               var merchant = customer.merchant;
               switch (me.mode)
               {
                  case 'redeemPrizesProfile' :
                  case 'redeemRewardsProfile' :
                  case 'emailtransfer' :
                  case 'transfer' :
                  {
                     rc = 'single';
                     break;
                  }
                  case 'profile' :
                  {
                     if (merchant['features_config'] && !merchant['features_config']['enable_prizes'])
                     {
                        rc = 'single';
                     }
                     break;
                  }
                  default :
                     break;
               }
               return rc;
            },
            getTitle : function()
            {
               return ('Reward Points: <br/>Prize Points:');
            },
            isValidCustomer : function(values)
            {
               return Customer.isValid(values['id']);
            },
            isEligible : function(customer)
            {
               var isEligible = false;
               switch (me.mode)
               {
                  case 'redeemRewardsProfile' :
                  {
                     isEligible = customer['eligible_for_reward'];
                     break;
                  }
                  case 'redeemPrizesProfile' :
                  {
                     isEligible = customer['eligible_for_prize'];
                     break;
                  }
                  case 'profile' :
                  {
                     isEligible = customer['eligible_for_reward'] || customer['eligible_for_prize'];
                     break;
                  }
                  case 'emailtransfer' :
                  case 'transfer' :
                  default :
                     break;
               }

               return ('<span class="x-badge round ' + //
               ((isEligible) ? '' : 'x-item-hidden') + '">✔</span>');
            },
            getPhoto : function(values)
            {
               return values.merchant['photo']['thumbnail_medium_url'];
            },
            showRewardPoints : function(customer)
            {
               var rc = true;
               switch (me.mode)
               {
                  case 'redeemPrizesProfile' :
                  {
                     rc = false;
                     break;
                  }
                  case 'redeemRewardsProfile' :
                  case 'emailtransfer' :
                  case 'transfer' :
                  default :
                     break;
               }

               return rc;
            },
            getRewardPoints : function(values)
            {
               return values['points'] + '<img src="' + Genesis.constants.getIconPath('miscicons', 'points') + '">';
            },
            showPrizePoints : function(customer)
            {
               var rc = true, merchant = customer.merchant;
               switch (me.mode)
               {
                  case 'redeemRewardsProfile' :
                  case 'emailtransfer' :
                  case 'transfer' :
                  {
                     rc = false;
                     break;
                  }
                  case 'profile' :
                  {
                     if (merchant['features_config'] && !merchant['features_config']['enable_prizes'])
                     {
                        rc = false;
                     }
                     break;
                  }
                  case 'redeemPrizesProfile' :
                  default :
                     break;
               }

               return rc;
            },
            getPrizePoints : function(customer)
            {
               var rc, merchant = customer.merchant;
               switch (me.mode)
               {
                  case 'redeemPrizesProfile' :
                  {
                     if (merchant['features_config'] && !merchant['features_config']['enable_prizes'])
                     {
                        rc = 'Not Participating';
                        break;
                     }
                  }
                  case 'redeemRewardsProfile' :
                  case 'emailtransfer' :
                  case 'transfer' :
                  case 'profile' :
                  default :
                     rc = customer['prize_points'] + '<img src="' + Genesis.constants.getIconPath('miscicons', 'prize_points') + '">';
                     break;
               }

               return rc;
            }
         }),
         onItemDisclosure : Ext.emptyFn
      }),
      //
      // Venues List
      //
      Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'VenueStore',
         tag : 'venuesList',
         loadingText : null,
         refreshHeightOnUpdate : false,
         variableHeights : false,
         deferEmptyText : false,
         itemHeight : itemHeight + 2 * Genesis.fn.calcPx(0.65, 1),
         cls : 'venuesList',
         deferEmptyText : false,
         emptyText : ' ',
         itemTpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="listItemDetailsWrapper" style="padding-left:0;">',
            '<div class="itemDistance">{[this.getDistance(values)]}</div>' +
            '<div class="itemTitle">{name}</div>',
            '<div class="itemDesc">{[this.getAddress(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            getAddress : function(values)
            {
               return (values.address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",</br>" + values.zipcode);
            },
            getDistance : function(values)
            {
               return ((values['distance'] > 0) ? values['distance'].toFixed(1) + 'km' : '');
            }
         }),
         onItemDisclosure : Ext.emptyFn
      })]));
   }
});

Ext.define('Genesis.view.widgets.Calculator',
{
   extend :  Ext.Container ,
                                                
   alias : 'widget.calculator',
   config :
   {
      title : null,
      bottomButtons : null,
      placeHolder : '0',
      hideZero : false,
      cls : 'calculator',
      layout : 'fit',
      // -------------------------------------------------------------------
      // Reward Calculator
      // -------------------------------------------------------------------
      items : [
      {
         height : '2.6em',
         docked : 'top',
         xtype : 'toolbar',
         centered : false,
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            xtype : 'title',
            title : ' '
         },
         {
            xtype : 'spacer',
            align : 'right'
         }]
      },
      {
         docked : 'top',
         xtype : 'textfield',
         name : 'amount',
         value : '',
         clearIcon : false,
         placeHolder : ' ',
         readOnly : true,
         required : true
      },
      {
         xtype : 'container',
         layout : 'vbox',
         tag : 'dialpad',
         cls : 'dialpad',
         defaults :
         {
            xtype : 'container',
            layout : 'hbox',
            flex : 1,
            defaults :
            {
               xtype : 'button',
               flex : 1
            }
         },
         items : [
         {
            items : [
            {
               text : '1'
            },
            {
               text : '2'
            },
            {
               text : '3'
            }]
         },
         {
            items : [
            {
               text : '4'
            },
            {
               text : '5'
            },
            {
               text : '6'
            }]
         },
         {
            items : [
            {
               text : '7'
            },
            {
               text : '8'
            },
            {
               text : '9'
            }]
         },
         {
            items : [
            {
               text : 'AC'
            },
            {
               tag : 'zero',
               flex : 2.3,
               text : '0'
            }]
         }]
      },
      {
         cls : 'bottomButtons',
         xtype : 'container',
         tag : 'bottomButtons',
         docked : 'bottom',
         layout : 'hbox',
         defaults :
         {
            xtype : 'button',
            flex : 1
         }
      }]
   },
   initialize : function()
   {
      var me = this;
      var title = me.query('title')[0];
      var textField = me.query('textfield')[0];
      var buttons = me.query('container[tag=bottomButtons]')[0];

      title.setTitle(me.getTitle());
      textField.setPlaceHolder(me.getPlaceHolder());
      buttons.add(me.getBottomButtons());

      if (me.getHideZero())
      {
         var btn = me.query("button[tag=zero]")[0];
         btn.getParent().remove(btn);
      }
   }
});

Ext.define('Genesis.view.client.AccountsTransfer',
{
   extend :  Genesis.view.ViewBase ,
                                                                                   
   alias : 'widget.clientaccountstransferview',
   config :
   {
      tag : 'accountsTransferMain',
      cls : 'viewport accountsTransferMain',
      layout : 'card',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         tag : 'navigationBarTop',
         cls : 'navigationBarTop kbTitle',
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            align : 'left',
            tag : 'calcClose',
            hidden : true,
            ui : 'normal',
            text : 'Close'
         }]
      })],
      listeners : [
      {
         element : 'element',
         delegate : 'div.listItemDetailsWrapper',
         event : 'tap',
         fn : "onItemTap"
      }]
   },
   disableAnimation : true,
   onItemTap : function(e, target, delegate, eOpts)
   {
      _application.getController('client.Accounts').fireEvent('xferItemTap', e.delegatedTarget.getAttribute('data'));
   },
   createView : function(store, activeItemIndex)
   {
      if (!this.callParent(arguments))
      {
         return;
      }
      this.num = activeItemIndex;

      this.setPreRender(this.getPreRender().concat([
      // -------------------------------------------------------------------
      // Accounts Transfer Mode (0)
      // -------------------------------------------------------------------
      Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'accountsTransferMode',
         cls : 'accountsTransferMode',
         layout : 'vbox',
         items : [
         {
            docked : 'top',
            xtype : 'toolbar',
            centered : false,
            defaults :
            {
               iconMask : true
            },
            items : [
            {
               xtype : 'title',
               title : 'Select Options :'
            },
            {
               xtype : 'spacer',
               align : 'right'
            }]
         },
         {
            xtype : 'component',
            flex : 1,
            scrollable : undefined,
            cls : 'transferPanel',
            tag : 'transferPanel',
            data : [
            {
               text : 'Transfer Out',
               desc : '(Send it directly over to your friend\'s mobile phone)',
               cls : 'sender',
               tag : 'sender'
            },
            {
               text : 'Email Transfer',
               desc : '(Send it over to your friend\'s email account)',
               cls : 'emailsender',
               tag : 'emailsender'
            },
            {
               text : 'Receive',
               desc : '(Scan your friend\'s Transfer Code)',
               cls : 'recipient',
               tag : 'recipient'
            }],
            tpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<tpl for=".">',
               '<div class="listItemDetailsWrapper" data="{[this.encodeData(values)]}">',
                  '<div class="itemTitle {[this.getCls(values)]}">{[this.getTitle(values)]}</div>',
                  '<div class="itemDesc {[this.getCls(values)]}">{[this.getDesc(values)]}</div>',
               '</div>',
            '</tpl>',
            // @formatter:on
            {
               encodeData : function(values)
               {
                  return values['tag'];
               },
               getCls : function(values)
               {
                  return values['cls'];
               },
               getDesc : function(values)
               {
                  return values['desc'];
               },
               getTitle : function(values)
               {
                  return values['text'];
               }
            })
         }]
      }),
      // -------------------------------------------------------------------
      // Accounts Calculator (1)
      // -------------------------------------------------------------------
      {
         xtype : 'calculator',
         tag : 'accountsMainCalculator',
         cls : 'accountsMainCalculator',
         title : 'Points to Send',
         placeHolder : '0',
         bottomButtons : [
         {
            tag : 'showQrCode',
            text : 'Transfer Points!',
            ui : 'orange-large'
         }]
      },
      // -------------------------------------------------------------------
      // Show for QRCode Screen (2)
      // -------------------------------------------------------------------
      Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'qrcodeContainer',
         cls : 'qrcodeContainer',
         layout : 'fit',
         items : [
         {
            docked : 'top',
            xtype : 'component',
            tag : 'title',
            width : '100%',
            cls : 'title',
            tpl : Ext.create('Ext.XTemplate', '{[this.getPoints(values)]}',
            {
               getPoints : function(values)
               {
                  return values['points'];
               }
            })
         },
         {
            xtype : 'component',
            tag : 'qrcode',
            cls : 'qrcode'
         },
         {
            docked : 'bottom',
            xtype : 'button',
            cls : 'separator done',
            tag : 'done',
            text : 'Done!',
            ui : 'orange-large'
         }]
      })]));
   },
   showView : function()
   {
      if (this.num)
      {
         this.setActiveItem(this.num);
      }
      this.callParent(arguments);
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.controller.client.Accounts',
{
   extend :  Genesis.controller.ControllerBase ,
                                 
   inheritableStatics :
   {
   },
   xtype : 'accountsCntlr',
   config :
   {
      mode : 'profile',
      routes :
      {
         'accounts' : 'mainPage',
         'etransfer' : 'emailTransferPage',
         'transfer' : 'transferPage',
         'selectTransfer' : 'selectTransferPage',
         'transferComplete' : 'transferCompletePage'
         //,'redememChooseSC' : 'redeemChooseSCPage'
      },
      refs :
      {
         //
         // Account Profiles
         //
         aBB : 'clientaccountsview button[tag=back]',
         avBB : 'clientaccountsview button[tag=vback]',
         accounts :
         {
            selector : 'clientaccountsview',
            autoCreate : true,
            xtype : 'clientaccountsview'
         },
         accountsList : 'clientaccountsview list[tag=accountsList]',
         venuesList : 'clientaccountsview list[tag=venuesList]',
         transferHdr : 'clientaccountsview toolbar[tag=transferHdr]',
         refreshBtn : 'clientaccountsview button[tag=refresh]',
         //
         // Account Transfers
         //
         atrCloseBB : 'clientaccountstransferview button[tag=close]',
         atrCalcCloseBB : 'clientaccountstransferview button[tag=calcClose]',
         atrBB : 'clientaccountstransferview button[tag=back]',
         transferPage :
         {
            selector : 'clientaccountstransferview',
            autoCreate : true,
            xtype : 'clientaccountstransferview'
         },
         points : 'clientaccountstransferview textfield',
         qrcodeContainer : 'clientaccountstransferview component[tag=qrcodeContainer]',
         qrcode : 'clientaccountstransferview component[tag=qrcode]',
         title : 'clientaccountstransferview component[tag=title]',
         transferContainer : 'clientaccountstransferview'
      },
      control :
      {
         //
         // Account Profiles
         //
         accounts :
         {
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate',
            activeitemchange : 'onItemChangeActivate',
            refresh : 'onRefresh'
         },
         refreshBtn :
         {
            tap : 'onRefresh'
         },
         accountsList :
         {
            select : 'onSelect',
            disclose : 'onDisclose'
         },
         venuesList :
         {
            select : 'onVenueSelect',
            disclose : 'onVenueDisclose'
         },
         avBB :
         {
            tap : 'onAvBBTap'
         },
         //
         // Account Transfers
         //
         transferPage :
         {
            showView : 'onTransferShowView',
            activate : 'onTransferActivate',
            deactivate : 'onTransferDeactivate'
         },
         'clientaccountstransferview container[tag=accountsTransferMode] list' :
         {
            select : 'onTransferSelect'
         },
         'clientaccountstransferview container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'clientaccountstransferview button[tag=showQrCode]' :
         {
            tap : 'onShowQrCodeTap'
         },
         'clientaccountstransferview container button[tag=done]' :
         {
            tap : 'onTransferCompleteTap'
         },
         atrCalcCloseBB :
         {
            tap : 'onTransferCompleteTap'
         }
      },
      listeners :
      {
         'selectMerchant' : 'onDisclose',
         'xferItemTap' : 'onTransferTap'
      }
   },
   qrcodeRegExp : /%qrcode_image%/,
   noTransferCodeMsg : 'No Transfer Code was scanned',
   pointsReqMsg : 'Points are required for transfer',
   startTransferMsg : 'Prepare to scan the Sender\'s Transfer Code',
   transferFailedMsg : 'Transfer operation did not complete',
   transferSavedMsg : 'Transfer messasge was saved, but not sent.',
   transferSuccessMsg : function()
   {
      return 'Your account information won\'t be updated until your next check-in.';
   },
   xferWithinRangeMsg : function(min, max)
   {
      return 'Please enter a value between ' + Genesis.constants.addCRLF() + min + ' and ' + max;
   },
   noPtsXferMsg : function()
   {
      return 'No Points were transferred.' + Genesis.constants.addCRLF() + //
      'Please Try Again.';
   },
   recvTransferMsg : function(points, merchantName)
   {
      return 'We have added ' + points + ' points ' + Genesis.constants.addCRLF() + //
      'towards your account at ' + Genesis.constants.addCRLF() + //
      merchantName + '!';
   },
   xferCodeRecv : false,
   init : function()
   {
      var me = this;
      me.callParent(arguments);
      console.log("Accounts Init");

      me.callBackStack =
      {
         callbacks : ['onXferCodeRecv'],
         arguments : [],
         startIndex : 0
      };

      me.getAccounts();

      backBtnCallbackListFn.push(function(activeItem)
      {
         if ((activeItem == me.getAccounts()) && (activeItem.getActiveItem() != me.getAccountsList()))
         {
            var viewport = me.getViewPortCntlr();
            me.self.playSoundFile(viewport.sound_files['clickSound']);

            me.onAvBBTap();

            return true;
         }
         else if (activeItem == me.getTransferPage())
         {
            if (activeItem.getActiveItem() == me.getQrcodeContainer())
            {
               activeItem.setActiveItem(1);
            }
            else
            {
               me.onTransferCompleteTap();
            }
            return true;
         }
         return false;
      });
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      var vport = me.getViewport();
      var cstore = Ext.StoreMgr.get('CustomerStore');

      if (qrcode)
      {
         //
         // Send QRCode to server for processing
         //
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.updatingServerMsg
         });
         Customer['setRecvPtsXferUrl']();
         cstore.load(
         {
            addRecords : true, //Append data
            jsonData :
            {
            },
            params :
            {
               'data' : qrcode
            },
            callback : function(records, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  var metaData = Customer.getProxy().getReader().metaData;
                  Ext.device.Notification.show(
                  {
                     title : 'Transfer Received',
                     message : me.recvTransferMsg(metaData['points'], records[0].getMerchant().get('name')),
                     buttons : ['OK'],
                     callback : function(btn)
                     {
                        me.resetView();
                        me.redirectTo('accounts');
                        //me.fireEvent('selectmerchant', cstore, records[0]);
                     }
                  });
                  me.persistSyncStores('CustomerStore');
               }
            }
         });
      }
      else
      {
         console.debug(me.noCodeScannedMsg);
         Ext.Viewport.setMasked(null);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.noCodeScannedMsg,
            buttons : ['Dismiss']
         });
      }
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      var merchantId = me.merchantId;
      var vstore = Ext.StoreMgr.get('VenueStore');
      var proxy = vstore.getProxy();
      var params =
      {
         'merchant_id' : merchantId
      }

      //
      // GeoLocation is optional
      //
      if (position)
      {
         params = Ext.apply(params,
         {
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         });
      }

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.getVenueInfoMsg
      });
      Venue['setFindNearestURL']();
      vstore.load(
      {
         scope : me,
         params : params,
         callback : function(records, operation)
         {
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful())
            {
               console.debug('Found ' + records.length + ' venues matching current location ...');
               if (records.length > 1)
               {
                  var view = me.getAccounts();
                  if (!view.isPainted() || view.isHidden())
                  {
                     console.debug('Opening Accounts Page ...');
                     view.on('showView', function()
                     {
                        this.setActiveItem(1);
                     }, view,
                     {
                        single : true
                     });
                     me.redirectTo('accounts');
                  }
                  else
                  {
                     view.setActiveItem(1);
                  }

               }
               else
               {
                  me.getVenueMetaData(records[0]);
               }
            }
            else
            {
               proxy.supressErrorsPopup = true;
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg(operation.getError()),
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     proxy.supressErrorsCallbackFn();
                  }
               });
            }
         }
      });
   },
   onRefresh : function()
   {
      var me = this;
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.establishConnectionMsg
      });
      Customer['setGetCustomersUrl']();
      Ext.StoreMgr.get('CustomerStore').load(
      {
         jsonData :
         {
         },
         callback : function(records, operation)
         {
            if (operation.wasSuccessful())
            {
               // Remove all previous view from viewStack
               var controller = me.getApplication().getController('client.' + 'Checkins');
               controller.fireEvent('setupCheckinInfo', 'checkin', null, null, null);
               me.persistSyncStores('CustomerStore');
            }
            Ext.Viewport.setMasked(null);
         }
      });
   },
   // --------------------------------------------------------------------------
   // Accounts Page
   // --------------------------------------------------------------------------
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         var monitors = this.getEventDispatcher().getPublishers()['elementSize'].monitors;
         var list = activeItem.query('list[tag=accountsList]')[0];

         console.debug("Refreshing CustomerStore ...");
         monitors[list.container.getId()].forceRefresh();
      }
      else
      {
         activeItem.query('list[tag=accountsList]')[0].refresh();
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var mode = me.getMode();
      var tbbar = activeItem.query('titlebar')[0];

      activeItem.mode = mode;
      switch(mode)
      {
         case 'profile' :
         {
            tbbar.setTitle('Accounts');
            tbbar.removeCls('kbTitle');
            break;
         }
         case 'redeemRewardsProfile' :
         {
            tbbar.setTitle('Rewards');
            tbbar.removeCls('kbTitle');
            break;
         }
         case 'redeemPrizesProfile' :
         {
            tbbar.setTitle('Prizes');
            tbbar.removeCls('kbTitle');
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            tbbar.setTitle(' ');
            tbbar.addCls('kbTitle');
            var transferHdr = me.getTransferHdr();
            activeItem.showTransferHdr = true;
            if (transferHdr)
            {
               transferHdr.show();
            }
            break;
         }
      }
      if (activeItem.getInnerItems().length > 0)
      {
         activeItem.setActiveItem(0);
         //me.getAccountsList().setVisibility(false);
      }
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      me.getTransferHdr().hide();
   },
   onSelect : function(list, model, eOpts)
   {
      list.deselect([model]);
      this.onDisclose(list, model);
      return false;
   },
   onDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var customerId = record.getId();
      var merchant = record.getMerchant();
      //var merchantName = record.getMerchant().get('name');
      var vport = me.getViewport();

      switch(me.getMode())
      {
         case 'redeemPrizesProfile' :
         {
            if (merchant.get('features_config') && !merchant.get('features_config')['enable_prizes'])
            {
               return;
            }
            break;
         }
         case 'profile' :
         case 'redeemRewardsProfile' :
         case 'emailtransfer' :
         case 'transfer' :
         default:
            break;
      }

      me.self.playSoundFile(me.getViewPortCntlr().sound_files['clickSound']);
      me.merchantId = merchant.getId();
      me.rec = record;

      switch(me.getMode())
      {
         case 'profile' :
         case 'redeemRewardsProfile' :
         case 'redeemPrizesProfile' :
         {
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.getMerchantInfoMsg
            });
            me.getGeoLocation();
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            if (record.get('points') < 1)
            {
               Ext.device.Notification.show(
               {
                  title : 'Points Required',
                  message : me.pointsReqMsg,
                  buttons : ['Dismiss']
               });
               return;
            }

            // Drop the previous page history
            me.silentPopView(2);
            me.redirectTo('transferComplete');
            break;
         }
      }
   },
   onAvBBTap : function(b, e, eOpts)
   {
      this.getAccounts().setActiveItem(0);
   },
   onVenueSelect : function(list, model, eOpts)
   {
      list.deselect([model]);
      this.onVenueDisclose(list, model);
      return false;
   },
   getVenueMetaData : function(venue)
   {
      var me = this;
      var venueId = venue.getId();
      var viewport = me.getViewPortCntlr();
      var rstore, url, controller;
      var rec = me.rec;

      switch (me.getMode())
      {
         case 'redeemPrizesProfile' :
         {
            controller = me.getApplication().getController('client.Prizes');
            break;
         }
         case 'redeemRewardsProfile' :
         {
            controller = me.getApplication().getController('client.Redemptions');
            break;
         }
         case 'profile' :
         default :
            viewport.setVenue(venue);
            controller = me.getApplication().getController('client.Checkins');
            controller.fireEvent('checkin');
            return;
            break;
      }

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : controller.getRedeemInfoMsg()
      });
      rstore = Ext.StoreMgr.get(controller.getRedeemStore());
      url = controller.getRedeemUrl();
      path = controller.getRedeemPath();
      CustomerReward[url]();
      rstore.load(
      {
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId
         },
         scope : me,
         callback : function(records, operation)
         {
            if (operation.wasSuccessful())
            {
               Ext.Viewport.setMasked(null);

               var metaData =
               {
                  'venue_id' : venueId
               };

               for (var i = 0; i < records.length; i++)
               {
                  records[i].handleInlineAssociationData(
                  {
                     'merchant' : venue.getMerchant().raw
                  });
                  //records[i].setMerchant(venue.getMerchant());
               }
               viewport.setVenue(venue);
               // We need it for checkinMerchant
               switch(me.getMode())
               {
                  /*
                   case 'profile' :
                   {
                   controller.fireEvent('checkinMerchant', 'explore', metaData, venueId, rec, operation, Ext.emptyFn);
                   break;
                   }
                   */
                  case 'redeemRewardsProfile' :
                  case 'redeemPrizesProfile' :
                  default:
                     controller = me.getApplication().getController('client.Checkins');
                     controller.fireEvent('checkinMerchant', 'redemption', metaData, venueId, rec, operation, function()
                     {
                        me.redirectTo(path);
                        //Ext.device.Notification.beep();
                     });
                     break;
               }
               delete me.rec;
            }
            else if (!operation.wasSuccessful() && !metaData)
            {
               Ext.Viewport.setMasked(null);
               console.log(me.metaDataMissingMsg);
            }
         }
      });
   },
   onVenueDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);
      //
      // Setup minimum customer information require for explore
      //
      me.getVenueMetaData(record);
   },
   onItemChangeActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getAccounts();
      var animation = container.getLayout().getAnimation();

      if (Ext.isObject(value))
      {
         switch (value.config.tag)
         {
            case 'accountsList' :
            {
               animation.setReverse(true);
               me.getABB().show();
               me.getAvBB().hide();
               break;
            }
            case 'venuesList' :
            {
               animation.setReverse(false);
               me.getABB().hide();
               me.getAvBB().show();
               break;
            }
         }
         console.debug("Accounts onItemChangeActivate[" + value.config.tag + "] Called.");
      }
   },
   sendEmailIOS : function(qrcode, emailTpl, subject)
   {
      var me = this;
      window.plugins.emailComposer.showEmailComposerWithCB(function(res)
      {
         // Delay is needed to not block email sending ...
         console.log("Email callback response(" + res + ")");
         Ext.defer(function()
         {
            Ext.Viewport.setMasked(null);
            switch (res)
            {
               case EmailComposer.ComposeResultType.Failed:
               case EmailComposer.ComposeResultType.NotSent:
               case EmailComposer.ComposeResultType.Cancelled:
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Transfer Failed',
                     message : me.transferFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        //me.onTransferCompleteTap();
                     }
                  });
                  break;
               }
               case EmailComposer.ComposeResultType.Saved:
               {
                  me.onTransferCompleteTap();
                  Ext.device.Notification.show(
                  {
                     title : 'Trasfer Deferred',
                     message : me.transferSavedMsg,
                     buttons : ['Dismiss']
                  });
                  break;
               }
               case EmailComposer.ComposeResultType.Sent:
               {
                  me.xferCodeRecv = true;
                  me.onTransferCompleteTap();
                  break;
               }
            }
         }, 1, me);
      }, subject, emailTpl, null, null, null, true, [qrcode]);
   },
   sendEmailAndroid : function(stream, emailTpl, subject)
   {
      var me = this;
      /*
       var extras =
       {
       };
       extras[WebIntent.EXTRA_SUBJECT] = subject;
       extras[WebIntent.EXTRA_TEXT] = emailTpl;

       console.log("Saving QRCode to temporary file ...");
       window.plugins.base64ToPNG.saveImage(stream,
       {
       filename : 'qrcode.gif',
       overwrite : true
       }, function(result)
       {
       extras[WebIntent.EXTRA_STREAM] = 'file://' + result.filename;

       console.log("QRCode saved to " + extras[WebIntent.EXTRA_STREAM]);
       window.plugins.webintent.startActivity(
       {
       action : WebIntent.ACTION_SEND,
       type : 'text/html',
       extras : extras
       }, function()
       {
       Ext.Viewport.setMasked(null);
       me.xferCodeRecv = true;
       me.onTransferCompleteTap();
       }, function()
       {
       Ext.Viewport.setMasked(null);
       Ext.device.Notification.show(
       {
       title : 'Transfer Failed',
       message : me.transferFailedMsg,
       buttons : ['Dismiss'],
       callback : function()
       {
       //me.onTransferCompleteTap();
       }
       });
       });
       }, function(error)
       {
       });
       //var writer = new FileWriter('/android_asset/www/' + 'tmp_' + appName + '_' + 'qrcode.gif');
       //writer.write(window.atob(stream), false);
       //console.debug("Content Written to Disk");
       //Genesis.fn.writeFile('qrcode.gif', stream, function(evt)
       //{
       //}
       //);
       */
      me.sendEmailIOS.apply(me, arguments);
   },
   onXferCodeRecv : function(metaData)
   {
      var me = this;

      switch (me.getMode())
      {
         case 'transfer' :
         {
            me.xferCodeRecv = true;
            var container = me.getTransferContainer();
            var qrcode = Genesis.controller.ControllerBase.genQRCode(metaData['data']);
            var points = metaData['points'] || me.getPoints().getValue();

            console.debug('\n' + //
            //'QRCode - ' + qrcode[0] + '\n' + //
            //'Body - ' + emailTpl + '\n' + //
            'Points - ' + points);
            //
            // Query server to get generate qrcode
            //
            if (qrcode[0])
            {
               me.getQrcode().setStyle(
               {
                  'background-image' : 'url(' + qrcode[0] + ')',
                  'background-size' : Genesis.fn.addUnit(qrcode[1] * 1.25) + ' ' + Genesis.fn.addUnit(qrcode[2] * 1.25)
               });
               me.getTitle().setData(
               {
                  points : points + ' Pts'
               });
               container.setActiveItem(2);
            }
            Ext.Viewport.setMasked(null);
            break;
         }
         case 'emailtransfer' :
         {
            var qrcode = metaData['data']['qrcode'];
            var emailTpl = metaData['data']['body'];
            var subject = metaData['data']['subject'];

            console.debug('\n' + //
            //'QRCode - ' + qrcode + '\n' + //
            //'Body - ' + emailTpl + '\n' + //
            'Subject - ' + subject + '\n' //
            );

            qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode)[0].replace('data:image/gif;base64,', "");
            //emailTpl = emailTpl.replace(me.qrcodeRegExp, Genesis.controller.ControllerBase.genQRCodeInlineImg(qrcode));
            //console.debug('\n' + //
            //'Encoded Body - ' + emailTpl);

            if (Ext.os.is('iOS'))
            {
               me.sendEmailIOS(qrcode, emailTpl, subject);
            }
            else if (Ext.os.is('Android'))
            {
               me.sendEmailAndroid(qrcode, emailTpl, subject);
            }
            break;
         }
      }

      return false;
   },
   // --------------------------------------------------------------------------
   // Accounts Transfer Page
   // --------------------------------------------------------------------------
   onTransferShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         //var monitors = this.getEventDispatcher().getPublishers()['elementSize'].monitors;
         //var list = activeItem.query('list[tag=transferPanel]')[0];

         //console.debug("Refreshing TransferPanel ...");
         //monitors[list.container.getId()].forceRefresh();
      }
   },
   onTransferActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var screenShow = 0;
      var container = me.getTransferContainer();

      switch(me.getMode())
      {
         case 'redeemRewardsProfile' :
         case 'redeemPrizesProfile' :
         case 'profile' :
         {
            me.getAtrCloseBB().hide();
            me.getAtrCalcCloseBB().hide();
            me.getAtrBB().show();
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            me.getAtrCloseBB().hide();
            me.getAtrCalcCloseBB().show();
            me.getAtrBB().hide();
            if (oldActiveItem && (oldActiveItem == me.getAccounts() && !me.rec))
            {
               me.setMode('profile');
            }
            else
            {
               if (me.getPoints())
               {
                  me.getPoints().setValue(null);
               }
               screenShow = 1;
            }
            break;
         }
      }
      //activeItem.createView(screenShow);
   },
   onTransferDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      var container = me.getTransferContainer();

      if (container)
      {
         container.setActiveItem(0);
      }
   },
   onTransferTap : function(tag)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);
      delete me.merchantId;
      delete me.rec;

      switch (tag)
      {
         //
         // Select the Merchant to generate the QRCode
         //
         case 'sender' :
         {
            me.setMode('transfer')
            me.redirectTo('selectTransfer');
            break;
         }
         case 'emailsender' :
         {
            me.setMode('emailtransfer')
            me.redirectTo('selectTransfer');
            break;
         }
         //
         // Scan Sender's QRCode
         //
         case 'recipient' :
         {
            me.setMode('profile');
            Ext.device.Notification.show(
            {
               title : 'Start Transfer',
               message : me.startTransferMsg,
               buttons : ['Proceed', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() == 'proceed')
                  {
                     me.scanQRCode();
                  }
               }
            });
            break;
         }
      }
      return false;
   },
   onCalcBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      //me.self..playSoundFile(viewport.sound_files['clickSound']);

      var value = b.getText();
      var pointsField = me.getPoints();
      var points = pointsField.getValue() || "0";
      if (points.length < 8)
      {
         switch (value)
         {
            case 'AC' :
            {
               points = null;
               break;
            }
            default :
               points = (points != "0") ? points.concat(value) : value;
               break;
         }
         pointsField.setValue(points);
      }
   },
   onShowQrCodeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var points = me.getPoints().getValue();
      var type;
      if ((Number(points) > 0) && (Number(points) <= me.rec.get('points') ))
      {
         switch (me.getMode())
         {
            case 'transfer' :
            {
               type = 'direct';
               Ext.Viewport.setMasked(
               {
                  xtype : 'loadmask',
                  message : me.genQRCodeMsg
               });
               break;
            }
            case 'emailtransfer' :
            {
               type = 'email';
               Ext.Viewport.setMasked(
               {
                  xtype : 'loadmask',
                  message : me.retrieveAuthModeMsg
               });
               break;
            }
         }

         // Send QRCode to server for processing
         //
         Customer['setSendPtsXferUrl']();
         cstore.load(
         {
            addRecords : true,
            jsonData :
            {
            },
            params :
            {
               'merchant_id' : me.merchantId,
               'points' : points,
               'type' : type
            },
            callback : function(records, operation)
            {
               var metaData = cstore.getProxy().getReader().metaData;
               if (operation.wasSuccessful() && (!metaData['data']))
               {
                  Ext.Viewport.setMasked(null);
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : me.noPtsXferMsg(),
                     buttons : ['Dismiss']
                  });
               }
            }
         });
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.xferWithinRangeMsg(1, me.rec.get('points')),
            buttons : ['Dismiss']
         });
      }
   },
   onTransferCompleteTap : function(b, e, eOpts, eInfo)
   {
      var me = this;

      me.setMode('profile');
      if (me.xferCodeRecv)
      {
         Ext.device.Notification.show(
         {
            title : 'Transfer Success!',
            message : me.transferSuccessMsg(),
            buttons : ['OK']
         });
      }
      me.popView();

      me.xferCodeRecv = false;
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function()
   {
      this.openPage('profile');
   },
   emailTransferPage : function()
   {
      this.openPage('emailtransfer');
   },
   transferPage : function()
   {
      this.openPage('transfer');
   },
   selectTransferPage : function()
   {
      this.openMainPage();
   },
   transferCompletePage : function()
   {
      var me = this;
      var container = me.getTransferContainer();
      //
      // Select the Amounts of points to Transfer!
      //
      container.setActiveItem(1);

      me.setAnimationMode(me.self.animationMode['coverUp']);
      me.pushView(me.getTransferPage());
   },
   redeemRewardsChooseSCPage : function()
   {
      this.openPage('redeemRewardsProfile');
   },
   redeemPrizesChooseSCPage : function()
   {
      this.openPage('redeemPrizesProfile');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;

      me.setAnimationMode(me.self.animationMode['cover']);
      switch (subFeature)
      {
         case 'emailtransfer' :
         case 'transfer' :
         {
            me.setMode('profile');
            page = me.getTransferPage();
            break;
         }
         case 'redeemPrizesProfile' :
         case 'redeemRewardsProfile' :
         case 'profile' :
         default :
            me.setMode(subFeature);
            page = me.getMainPage();
            break;
      }

      me.pushView(page);
   },
   getMainPage : function()
   {
      var page = this.getAccounts();
      return page;
   },
   openMainPage : function()
   {
      this.pushView(this.getMainPage());
      console.log("Accounts Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});

Ext.define('Genesis.model.Badge',
{
   extend :  Ext.data.Model ,
   id : 'Badge',
   alternateClassName : 'Badge',
   config :
   {
      idProperty : 'id',
      fields : ['id', 'type', 'visits', 'rank'],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   inheritableStatics :
   {
      setGetBadgesUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/badges');
      }
   }
});

Ext.define('Genesis.view.client.Badges',
{
   extend :  Ext.Carousel ,
                                                                                  
   alias : 'widget.clientbadgesview',
   config :
   {
      models : ['Badge'],
      cls : 'viewport',
      itemPerPage : 12,
      preRender : null,
      direction : 'horizontal',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Badges',
         items : [
         {
            align : 'left',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      })],
      listeners : [
      {
         element : 'element',
         delegate : 'div.itemWrapper',
         event : 'tap',
         fn : "onItemTap"
      }]
   },
   //disableAnimation : true,
   initialize : function()
   {
      this.setPreRender([]);
      this.callParent(arguments);
   },
   onItemTap : function(e, target, delegate, eOpts)
   {
      var data = Ext.create('Genesis.model.Badge', Ext.decode(decodeURIComponent(e.delegatedTarget.getAttribute('data'))));
      this.fireEvent('itemTap', data);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      this.removeAll(true);
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   removeAll : function()
   {
      var me = this;

      me.setPreRender([]);
      me.callParent(arguments);
   },
   createView : function()
   {
      var me = this, carousel = this;

      if (!Genesis.view.ViewBase.prototype.createView.apply(this, arguments))
      {
         return;
      }

      Genesis.view.ViewBase.prototype.calcCarouselSize.apply(me, [2]);

      carousel.removeAll(true);

      var app = _application, viewport = app.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var vport = viewport.getViewport(), items = Ext.StoreMgr.get('BadgeStore').getRange(), list = Ext.Array.clone(items);

      for (var i = 0; i < Math.ceil(list.length / me.getItemPerPage()); i++)
      {
         me.getPreRender().push(
         {
            xtype : 'component',
            cls : 'badgesMenuSelections',
            tag : 'badgesMenuSelections',
            scrollable : undefined,
            data : Ext.Array.pluck(list.slice(i * me.getItemPerPage(), ((i + 1) * me.getItemPerPage())), 'data'),
            tpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<tpl for=".">',
               '<div class="itemWrapper" data="{[this.encodeData(values)]}">',
                  '<div class="photo"><img src="{[this.getPhoto(values)]}" /></div>',
                  '<div class="photoName">{[this.getName(values)]}</div>',
               '</div>',
            '</tpl>',
            // @formatter:on
            {
               encodeData : function(values)
               {
                  return encodeURIComponent(Ext.encode(values));
               },
               getName : function(values)
               {
                  return values['type'].display_value;
               },
               getPhoto : function(values)
               {
                  var type = values['type'];
                  var customer = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getCustomer();
                  var badge = Ext.StoreMgr.get('BadgeStore').getById(customer.get('badge_id'));
                  var rank = badge.get('rank');
                  return me.self.getPhoto((values['rank'] <= rank) ? type : 'nobadge', 'thumbnail_medium_url');
               }
            })
         });
      }
      console.debug("Badge Icons Refreshed.");
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      /*
       if (this.getInnerItems().length == 0)
       {
       this.add(this.getPreRender());
       }
       */

      var carousel = this;
      
      Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
   },
   inheritableStatics :
   {
      getPhoto : function(type, size)
      {
         var url;
         switch (type)
         {
            case 'nobadge':
            {
               if (size.match(/small/))
               {
                  size = 'small';
               }
               else if (size.match(/medium/))
               {
                  size = 'medium';
               }
               else
               {
                  size = 'large';
               }

               url = Genesis.constants.getIconPath('badges', size + '/' + 'nobadge', false);
               break;
            }
            default:
               url = type[size];
               break;
         }
         return url;
      }
   }
});

Ext.define('Genesis.view.widgets.ItemDetail',
{
   extend :  Genesis.view.ViewBase ,
                                
   alias : 'widget.itemdetailview',
   config :
   {
      scrollable : undefined,
      itemXType : 'item',
      cls : 'itemDetailMain viewport',
      layout :
      {
         type : 'vbox',
         pack : 'center',
         align : 'stretch'
      }
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments) && (me.getInnerItems().length > 0))
      {
         var item = me.getInnerItems()[0];
         //
         // Refresh RedeemItem
         //
         item.setData(me.item);
         item.updateItem(me.item);
      }
      else
      {
         me.setPreRender([
         {
            flex : 1,
            xtype : me.getItemXType(),
            data : me.item
         }]);
      }
      delete me.item;
   }
});

Ext.define('Genesis.view.widgets.PopupItemDetail',
{
   extend :  Ext.Sheet ,
   alias : 'widget.popupitemdetailview',
   config :
   {
      models : ['CustomerReward'],
      bottom : 0,
      left : 0,
      top : 0,
      right : 0,
      padding : 0,
      hideOnMaskTap : false,
      defaultUnit : 'em',
      layout :
      {
         type : 'vbox',
         pack : 'middle'
      },
      defaults :
      {
         xtype : 'container',
         defaultUnit : 'em'
      }
   },
   constructor : function(config)
   {
      var me = this;
      config = config ||
      {
      };

      var buttons = config['buttons'] || [];
      delete config['buttons'];

      var preItemsConfig = config['preItemsConfig'] || [];
      var postItemsConfig = config['postItemsConfig'] || [];
      delete config['preItemsConfig'];
      delete config['postItemsConfig'];

      var orientation = Ext.Viewport.getOrientation();
      var mobile = Ext.os.is('Phone') || Ext.os.is('Tablet');
      Ext.merge(config,
      {
         items : [
         {
            preItemsConfig : preItemsConfig,
            postItemsConfig : postItemsConfig,
            iconType : config['iconType'],
            flex : 1,
            xtype : 'popupitem',
            data : Ext.create('Genesis.model.CustomerReward',
            {
               'title' : config['title'],
               'type' :
               {
                  value : config['icon']
               }
               //'photo' : photoUrl
            })
         },
         {
            right : (mobile && (orientation == 'landscape')) ? 0 : null,
            bottom : (mobile && (orientation == 'landscape')) ? 0 : null,
            docked : (mobile && (orientation == 'landscape')) ? null : 'bottom',
            tag : 'buttons',
            width : (mobile && (orientation == 'landscape')) ? '10em' : 'auto',
            layout :
            {
               type : 'vbox',
               pack : 'end'
            },
            defaults :
            {
               xtype : 'button',
               defaultUnit : 'em'
            },
            padding : '0 1.0 1.0 1.0',
            items : buttons
         }]
      });
      delete config['iconType'];
      delete config['icon'];

      Ext.Viewport.on('orientationchange', me.onOrientationChange, me);
      me.on(
      {
         destroy : 'onDestroy',
         single : true,
         scope : me
      });
      me.callParent(arguments);
      me.element.setStyle('padding', '0px');
   },
   onDestroy : function()
   {
      Ext.Viewport.un('orientationchange', me.onOrientationChange);
   },
   onOrientationChange : function(v, newOrientation, width, height, eOpts)
   {
      var me = this, buttons = me.query('container[tag=buttons]')[0];
      buttons.setDocked((newOrientation == 'landscape') ? null : 'bottom');
      switch (newOrientation)
      {
         case 'landscape' :
         {
            buttons.setRight(0);
            buttons.setBottom(0);
            buttons.setWidth('10em');
            break;
         }
         case 'portrait' :
         {
            buttons.setRight(null);
            buttons.setBottom(null);
            buttons.setWidth('auto');
            break;
         }
      }
   }
});

Ext.define('Genesis.view.widgets.Item',
{
   extend :  Ext.Container ,
                                
   xtype : 'item',
   alias : 'widget.item',
   config :
   {
      cls : 'item',
      tag : 'item',
      layout : 'fit'
   },
   constructor : function(config)
   {
      var me = this;

      config = config ||
      {
      };
      me.config['preItemsConfig'] = me.config['preItemsConfig'] || [];
      me.config['postItemsConfig'] = me.config['postItemsConfig'] || [];
      me.config['photoTemplate'] = me.config['photoTemplate'] || null;

      var preItemsConfig = config['preItemsConfig'] || [];
      var postItemsConfig = config['postItemsConfig'] || [];
      var photoTemplate = config['photoTemplate'] || me.config['photoTemplate'];

      Ext.merge(preItemsConfig, me.config['preItemsConfig']);
      Ext.merge(postItemsConfig, me.config['postItemsConfig']);
      //
      delete config['preItemsConfig'];
      delete config['postItemsConfig'];
      delete config['photoTemplate'];

      Ext.merge(config,
      {
         // Backgrond Image
         items : [
         {
            docked : 'top',
            xtype : 'component',
            tag : 'title',
            cls : 'title',
            defaultUnit : 'em',
            tpl : Ext.create('Ext.XTemplate', '{[this.getDescription(values)]}',
            {
               getDescription : function(values)
               {
                  return values['title'];
               }
            })
         }].concat(preItemsConfig, [
         {
            xtype : 'component',
            tag : 'itemPhoto',
            cls : 'itemPhoto',
            tpl : (photoTemplate) ? photoTemplate : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<div class="photoVCenterHelper"></div>',
            '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  var photo = values['photo'];
                  if (Ext.isString(photo))
                  {
                     return 'src="' + photo + '"';
                  }
                  else
                  {
                     return 'src="' + photo.url + '" ' + //
                     ((photo.width) ? 'style="width:' + Genesis.fn.addUnit(photo.width) + ';height:' + Genesis.fn.addUnit(photo.height) + ';"' : '');
                  }
               }
            })
         }], postItemsConfig)
      });

      this.callParent(arguments);
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.updateItem(this.getData());
   },
   updateItem : function(data)
   {
      var me = this;
      var content = data.raw;

      var itemPhoto = me.query("component[tag=itemPhoto]")[0];
      var title = me.query("component[tag=title]")[0];

      //
      if (content['title'])
      {
         title.setData(content);
         title.show();
      }
      else
      {
         title.hide();
      }
      itemPhoto.setData(content);
      me.setData(data);

      return content;
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.view.widgets.RedeemItem',
{
   extend :  Genesis.view.widgets.Item ,
   xtype : 'redeemitem',
   alias : 'widget.redeemitem',
   config :
   {
      iconType : 'prizewon',
      hideMerchant : false,
      cls : 'item redeemItem',
      // Backgrond Image
      tag : 'redeemItem',
      layout : 'fit',
      postItemsConfig : [
      {
         docked : 'bottom',
         xtype : 'component',
         hidden : true,
         tag : 'itemPoints',
         cls : 'itemPoints',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
            '{[this.getPoints(values)]}',
            // @formatter:on
         {
            getPoints : function(values)
            {
               return ((values['points'] > 0) ? values['points'] + '  Pts' : ' ');
            }
         })
      },
      {
         docked : 'bottom',
         xtype : 'component',
         tag : 'info',
         cls : 'info',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="photo">' +
            '<img src="{[this.getPhoto(values)]}"/>' +
         '</div>' +
         '<div class="infoWrapper">' +
            '<div class="name">{[this.getName(values)]}</div>' +
            '<div class="disclaimer">{[this.getDisclaimer(values)]}</div>' +
            '<div class="date">{[this.getExpiryDate(values)]}</div>' +
         '</div>',
         // @formatter:on
         {
            getExpiryDate : function(values)
            {
               var limited = values.get('time_limited');
               return ((limited) ? 'Offer Expires: ' + values.get('expiry_date') : '');
            },
            getDisclaimer : function(values)
            {
               var quantity = (values.get('quantity_limited')) ? //
               '<b>Quantity : ' + values.get('quantity') + '</b><br/>' : //
               'Limited Quantities. ';
               var terms = values.getMerchant().get('reward_terms') || '';

               return (quantity + terms);
            },
            getPhoto : function(values)
            {
               return values.getMerchant().get('photo')['thumbnail_medium_url'];
            },
            getName : function(values)
            {
               return values.getMerchant().get('name');
            }
         })
      }]
   },
   constructor : function(config)
   {
      var me = this;
      config = Ext.merge(
      {
         photoTemplate : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="photoVCenterHelper"></div>',
         '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
         '<div class="itemPoints {[this.isVisible(values)]}">{[this.getPoints(values)]}</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
               var photo = (values['photo'] && values['photo'][prefix]) ? values['photo'][prefix] : me.self.getPhoto(values['type'], me.getIconType());
               if (Ext.isString(photo))
               {
                  return 'src="' + photo + '"';
               }
               else
               {
                  return 'src="' + photo.url + '" ' + //
                  ((photo.width) ? 'style="width:' + Genesis.fn.addUnit(photo.width) + ';height:' + Genesis.fn.addUnit(photo.height) + ';"' : '');
               }
            },
            isVisible : function(values)
            {
               return ((values['merchant']) ? '' : 'x-item-hidden');
            },
            getPoints : function(values)
            {
               return ((values['points'] > 0) ? values['points'] + '  Pts' : ' ');
            }
         })
      }, config);

      this.callParent(arguments);
   },
   updateItem : function(data)
   {
      var me = this;
      var content = data.raw;
      var info = me.query("component[tag=info]")[0];
      var points = me.query("component[tag=itemPoints]")[0];

      //
      // Hide Merchant Information if it's missing
      //
      if (content['merchant'] && !me.getHideMerchant())
      {
         info.setData(data);
         info.show();
         points.setData(
         {
            points : 0
         });
      }
      else
      {
         info.hide();
         points.setData(content);
         points.show();
      }

      me.callParent(arguments);
   },
   inheritableStatics :
   {
      getPhoto : function(type, iconType)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'earn_points' :
            case 'promotion' :
            {
               break;
            }
            default :
               photo_url = Genesis.constants.getIconPath(iconType, type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }

});

Ext.define('Genesis.view.widgets.PopupItem',
{
   extend :  Genesis.view.widgets.Item ,
   xtype : 'popupitem',
   alias : 'widget.popupitem',
   config :
   {
      iconType : null
   },
   constructor : function(config)
   {
      var me = this;
      Ext.merge(config,
      {
         // Backgrond Image
         tag : 'popupItem',
         photoTemplate : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="photoVCenterHelper"></div>',
         '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               var photo = me.self.getPhoto(values['type'], me.getIconType());
               return 'src="' + photo + '"';
            }
         })
      });

      me.callParent(arguments);
   },
   inheritableStatics :
   {
      getPhoto : function(type, iconType)
      {
         var photo_url = Genesis.constants.getIconPath(iconType, type.value);
         return photo_url;
      }
   }
});

Ext.define('Genesis.view.widgets.client.RedeemItemDetail',
{
   extend :  Genesis.view.widgets.ItemDetail ,
                                                                   
   alias : 'widget.clientredeemitemdetailview',
   config :
   {
   	itemXType : 'redeemitem',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Prizes',
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            hidden : true,
            align : 'left',
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'right',
            tag : 'redeem',
            text : 'Redeem'
         },
         {
            align : 'right',
            hidden : true,
            tag : 'done',
            text : 'Done'
         }]
      })],
      listeners : [
      {
         element : 'element',
         delegate : "div.itemPhoto",
         event : "tap",
         fn : "onRedeemItemTap"
      }]
   },
   onRedeemItemTap : function(b, e, eOpts)
   {
      var me = this, viewport = _application.getController('client' + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      me.fireEvent('redeemItemTap', null);
   }
});

Ext.define('Genesis.view.widgets.client.PromotionItem',
{
   extend :  Genesis.view.widgets.client.RedeemItemDetail ,
   alias : 'widget.clientpromotionalitemview',
   config :
   {
      layout : 'fit',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         tag : 'navigationBarTop',
         cls : 'navigationBarTop',
         title : ' ',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            hidden : true,
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'right',
            tag : 'done',
            text : 'Done'
         }]
      }]
   },
   onRedeemItemTap : function(b, e, eOpts)
   {
      var me = this, viewport = _application.getController('client' + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      me.fireEvent('promoteItemTap', null);
   }
});

Ext.define('Genesis.controller.client.Badges',
{
   extend :  Genesis.controller.ControllerBase ,
                                 
   inheritableStatics :
   {
   },
   xtype : 'clientbadgesCntlr',
   config :
   {
      routes :
      {
         'badges' : 'mainPage',
         'badgeDesc' : 'badgeDescPage'
      },
      models : ['CustomerReward', 'Badge', 'Customer', 'Merchant'],
      refs :
      {
         // Main Page
         main :
         {
            selector : 'clientbadgesview',
            autoCreate : true,
            xtype : 'clientbadgesview'
         },
         mainCarousel : 'clientbadgesview',
         //
         // BadgeDesc
         //
         badgeDesc :
         {
            selector : 'clientpromotionalitemview[tag=badgeDesc]',
            autoCreate : true,
            tag : 'badgeDesc',
            xtype : 'clientpromotionalitemview'
         }
      },
      control :
      {
         main :
         {
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate',
            itemTap : 'onItemTap'
         },
         badgeDesc :
         {
            createView : 'onBadgeDescCreateView',
            activate : 'onBadgeDescActivate',
            deactivate : 'onBadgeDescDeactivate',
            promoteItemTap : 'onPromoteItemTap'
         }
      }
   },
   badgeLevelNotAchievedMsg : function()
   {
      return ('You have achieved this' + Genesis.constants.addCRLF() + 'badge level yet!');
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Loads Front Page Metadata
      //
      Ext.regStore('BadgeStore',
      {
         model : 'Genesis.model.Badge',
         autoLoad : false,
         sorters : [
         {
            property : 'rank',
            direction : 'ASC'
         }],
         listeners :
         {
            scope : me,
            "load" : function(store, records, successful, operation, eOpts)
            {
            }
         }
      });

      Ext.Viewport.on('orientationchange', function(v, newOrientation, width, height, eOpts)
      {
         //
         // Redraw Screen
         //
         var mainPage = me.getMain(), vport = me.getViewport();
         if (mainPage == vport.getActiveItem())
         {
            me.refreshPage(mainPage);
         }
      });
      console.log("Badges Init");
      //
      // Preloading Pages to memory
      //
      me.getMain();
   },
   // --------------------------------------------------------------------------
   // EVent Handlers
   // --------------------------------------------------------------------------
   onPromoteItemTap : function(b, e, eOpts, eInfo)
   {
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         var monitors = this.getEventDispatcher().getPublishers()['elementSize'].monitors;
         monitors[activeItem.element.getId()].forceRefresh();
         console.debug("Refreshing BadgesPage ...");
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   onBadgeDescCreateView : function(activeItem)
   {
      var me = this;
      activeItem.item = me.item;
   },
   onBadgeDescActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var tbbar = activeItem.query('titlebar')[0];

      activeItem.query('button[tag=back]')[0].show();
      activeItem.query('button[tag=done]')[0].hide();
      tbbar.setTitle('Badge Promotion');
   },
   onBadgeDescDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   onItemTap : function(model)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      var customer = viewport.getCustomer();
      var badge = model;
      var rank = badge.get('rank');
      var cbadge = Ext.StoreMgr.get('BadgeStore').getById(customer.get('badge_id'));
      var crank = cbadge.get('rank');

      if (rank <= crank)
      {
         var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
         var photoUrl =
         {
         };
         photoUrl[prefix] = Genesis.view.client.Badges.getPhoto(badge.get('type'), 'thumbnail_large_url');

         me.item = Ext.create('Genesis.model.CustomerReward',
         {
            'title' : badge.get('type').display_value,
            'type' :
            {
               value : 'promotion'
            },
            'photo' : photoUrl,
            //'points' : info['badge_points'],
            'time_limited' : false,
            'quantity_limited' : false,
            'merchant' : null
         });
         me.redirectTo('badgeDesc');
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Badges',
            message : me.badgeLevelNotAchievedMsg(),
            buttons : ['Dismiss']
         });
      }
      return false;
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   badgeDescPage : function()
   {
      this.openPage('badgeDesc')
   },
   mainPage : function()
   {
      this.openPage('main');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this;

      switch (subFeature)
      {
         case 'badgeDesc' :
         {
            me.setAnimationMode(me.self.animationMode['cover']);
            me.pushView(me.getBadgeDesc());
            break;
         }
         case 'main' :
         {
            me.setAnimationMode(me.self.animationMode['coverUp']);
            me.pushView(me.getMainPage());
            break;
         }
      }
   },
   getMainPage : function()
   {
      var page = this.getMain();
      return page;
   },
   openMainPage : function()
   {
      var cntlr = this.getViewPortCntlr();
      this.setAnimationMode(this.self.animationMode['cover']);
      this.pushView(this.getMainPage());
      console.log("Badges Page Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

Ext.define('Genesis.view.client.ChallengePage',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                                                     
   alias : 'widget.clientchallengepageview',
   config :
   {
      models : ['Challenge'],
      itemPerPage : 6,
      layout : 'fit',
      cls : 'viewport',
      scrollable : undefined,
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Challenges',
         items : [
         {
            align : 'left',
            ui : 'normal',
            tag : 'close',
            text : 'Close'
         }]
      }),
      {
         xtype : 'carousel',
         cls : 'challengePageItem shadows',
         direction : 'horizontal'
      },
      {
         docked : 'bottom',
         cls : 'challengeContainer',
         tag : 'challengeContainer',
         hidden : true,
         xtype : 'container',
         layout :
         {
            type : 'vbox',
            pack : 'center'
         },
         items : [
         {
            xtype : 'button',
            iconCls : 'dochallenges',
            iconMask : true,
            tag : 'doit',
            text : 'Lets do it!'
         }]
      },
      {
         docked : 'bottom',
         xtype : 'container',
         tag : 'challengePageItemDescWrapper',
         cls : 'challengePageItemDescWrapper',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         defaults :
         {
            xtype : 'component'
         },
         items : [
         {
            //flex : 1,
            cls : 'itemDesc',
            data :
            {
               description : ''
            },
            tpl : Ext.create('Ext.XTemplate', '{[this.getDesc(values)]}',
            {
               getDesc : function(values)
               {
                  return values['description']
               }
            })
         }
         /*,
          {
          cls : 'itemDescName',
          tpl : '{name}'
          }
          */]
      }],
      listeners : [
      {
         element : 'element',
         delegate : 'div.itemWrapper',
         event : 'tap',
         fn : "onItemTap"
      }]
   },
   takePhoto : function()
   {
      if (!this.photoAction)
      {
         this.photoAction = Ext.create('Ext.ActionSheet',
         {
            hideOnMaskTap : false,
            defaults :
            {
               defaultUnit : 'em',
               margin : '0 0 0.5 0',
               xtype : 'button',
               handler : Ext.emptyFn
            },
            items : [
            {
               text : 'Use Photo from Library',
               tag : 'library'
            },
            {
               text : 'Use Photo from Photo Album',
               tag : 'album'
            },
            {
               text : 'Take a Picture',
               tag : 'camera'
            },
            {
               margin : '0.5 0 0 0',
               text : 'Cancel',
               ui : 'cancel',
               scope : this,
               handler : function()
               {
                  this.photoAction.hide();
               }
            }]
         });
         Ext.Viewport.add(this.photoAction);
      }
      this.photoAction.show();
   },
   deselectItems : function()
   {
      var carousel = this.query('carousel')[0];
      var items = Ext.DomQuery.select('div.itemWrapper', carousel.element.dom);
      for (var i = 0; i < items.length; i++)
      {
         Ext.get(items).removeCls('x-item-selected');
      }
   },
   onItemTap : function(e, target, delegate, eOpts)
   {
      this.deselectItems();

      var element = Ext.get(e.delegatedTarget);
      element.addCls('x-item-selected');

      var data = Ext.create('Genesis.model.Challenge', Ext.decode(decodeURIComponent(e.delegatedTarget.getAttribute('data'))));
      var mobileClient = (_build == 'MobileWebClient');
      _application.getController(((mobileClient) ? 'mobileClient' : 'client') + '.Challenges').fireEvent('itemTap', data);
   },
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   removeAll : function(destroy, everything)
   {
      var carousel = this.query('carousel')[0];
      return carousel.removeAll(true);
   },
   _createView : function(carousel, items)
   {
      var me = this;

      //
      // Disable unsupported features on MobileClient
      //
      if (_build == 'MobileWebClient')
      {
         for (var i = 0; i < items.length; i++)
         {
            var item = items[i];
            switch (item.get('type').value)
            {
               case 'photo':
               case 'referral' :
               {
                  var index = items.indexOf(item);
                  items.splice(index, 1);
                  if (index == i)
                  {
                     i--;
                  }
                  break;
               }
            }
         }
      }

      switch (Ext.Viewport.getOrientation())
      {
         case 'landscape' :
         {
            me.setItemPerPage(4);
            break;
         }
         default:
            me.calcCarouselSize();
            break;
      }

      carousel.removeAll(true);
      for (var i = 0; i < Math.ceil(items.length / me.getItemPerPage()); i++)
      {
         carousel.add(
         {
            xtype : 'component',
            cls : 'challengeMenuSelections',
            tag : 'challengeMenuSelections',
            scrollable : undefined,
            data : Ext.Array.pluck(items.slice(i * me.getItemPerPage(), ((i + 1) * me.getItemPerPage())), 'data'),
            tpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<tpl for=".">',
               '<div class="itemWrapper x-hasbadge" data="{[this.encodeData(values)]}">',
                  '<span class="x-badge round">{[this.getPoints(values)]}</span>',
                  '<div class="photo">'+
                     '<img src="{[this.getPhoto(values)]}" />'+
                  '</div>',
                  '<div class="photoName">{name}</div>',
               '</div>',
            '</tpl>',
            // @formatter:on
            {
               encodeData : function(values)
               {
                  return encodeURIComponent(Ext.encode(values));
               },
               getPoints : function(values)
               {
                  return values['points'] + ' Points';
               },
               getPhoto : function(values)
               {
                  if (!values.photo || !values.photo.url)
                  {
                     return me.self.getPhoto(values['type']);
                  }
                  return values.photo.url;
               }
            })
         });
      }
      console.debug("ChallengePage Icons Updated.");
   },
   createView : function()
   {
      var carousel = this.query('carousel')[0];
      var record = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getVenue();
      var venueId = record.getId();
      var items = record.challenges().getRange();
      var element = Ext.DomQuery.select('div.itemWrapper',carousel.element.dom)[0];

      if ((carousel.getInnerItems().length > 0) && element)
      {
         var data = Ext.create('Genesis.model.Challenge', Ext.decode(decodeURIComponent(element.getAttribute('data'))));
         if (data.getId() == items[0].getId())
         {
            this.deselectItems();

            console.debug("ChallengePage Icons Refreshed.");
         }
         else
         {
            this._createView(carousel, items);
         }
      }
      else
      {
         this._createView(carousel, items);
      }

      this.callParent(arguments);

      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
      //return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         var value = type.value;
         switch (value)
         {
            case 'custom' :
               value = 'mystery';
            default :
               photo_url = Genesis.constants.getIconPath('mainicons', value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});

Ext.define('Genesis.controller.mobileClient.Challenges',
{
   extend :  Genesis.controller.ControllerBase ,
                           
   inheritableStatics :
   {
   },
   xtype : 'clientChallengesCntlr',
   config :
   {
      routes :
      {
         'challenges' : 'challengesPage'
      },
      refs :
      {
         //
         // Challenges
         //
         challengeBtn : 'clientchallengepageview button[tag=doit]',
         challengePage :
         {
            selector : 'clientchallengepageview',
            autoCreate : true,
            xtype : 'clientchallengepageview'
         },
         challengeContainer : 'clientchallengepageview container[tag=challengeContainer]',
         challengeDescContainer : 'clientchallengepageview container[tag=challengePageItemDescWrapper]'
      },
      control :
      {
         challengePage :
         {
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'clientchallengepageview > carousel dataview' :
         {
            select : 'onItemSelect'
         },
         challengeBtn :
         {
            tap : 'onChallengeBtnTap'
         }
      },
      listeners :
      {
         'challengecomplete' : 'onChallengeComplete',
         'doChallenge' : 'onChallengeBtnTap',
         'itemTap' : 'onItemTap'
      }
   },
   metaData : null,
   defaultDescText : 'Please Select a challenge to perform',
   samplePhotoURL : 'http://photos.getkickbak.com/paella9finish1.jpg',
   checkinFirstMsg : 'Please Check-In before performing challenges',
   completingChallengeMsg : 'Completing Challenge ...',
   updateAccountInfoMsg : 'Your Birthday information is missing. Update your Account Settings to continue.',
   getPointsMsg : function(points, total)
   {
      return 'You have earned ' + points + ' Pts from this challenge!';
   },
   getConsolationMsg : function(message)
   {
      return message + Genesis.constants.addCRLF() + 'Try our other challenges as well!';
      //return message;
   },
   visitFirstMsg : 'You must visit this establishment first before you are eligible to do this Challenge',
   init : function(app)
   {
      var me = this;
      this.callParent(arguments);

      if (Ext.os.is('Phone'))
      {
         Ext.Viewport.on('orientationchange', function(v, newOrientation, width, height, eOpts)
         {
            //
            // Redraw Screen
            //
            var page = me.getChallengePage(), vport = me.getViewport();
            if (page == vport.getActiveItem())
            {
               me.refreshPage(page);
            }
         });
      }
      console.log("Challenge Init");
      //
      // Preload Pages
      //
      me.getChallengePage();
   },
   challengeItemFn : function(params, id, type, venueId, qrcode, position)
   {
      var me = this, viewport = me.getViewPortCntlr(), params, customerId = viewport.getCustomer().getId();
      //
      // With or without Geolocation support
      //
      if (!venueId)
      {
         //
         // We cannot use short cut method unless we have either GeoLocation or VenueId
         //
         /*
          if (!position)
          {
          //
          // Stop broadcasting now ...
          //
          if (me.identifiers)
          {
          me.identifiers['cancelFn']();
          }
          Ext.Viewport.setMasked(null);
          Ext.device.Notification.show(
          {
          title : 'Rewards',
          message : me.cannotDetermineLocationMsg,
          buttons : ['Dismiss']
          });
          return;
          }
          */
      }
      else
      {
         params = Ext.apply(params,
         {
            venue_id : venueId
         });
      }

      if (qrcode)
      {
         params = Ext.apply(params,
         {
            data : qrcode
         });
      }
      else
      {
         params = Ext.apply(params,
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : me.identifiers['localID']
            })
         });
      }

      console.debug("Transmitting Completing Challenge ID(" + id + ")");
      Challenge.load(id,
      {
         jsonData :
         {
         },
         params : params,
         callback : function(record, operation)
         {
            var metaData = Challenge.getProxy().getReader().metaData;
            console.debug('Challenge Completed(' + operation.wasSuccessful() + ')');
            //
            // Stop broadcasting now ...
            //
            if (me.identifiers)
            {
               me.identifiers['cancelFn']();
            }
            Ext.Viewport.setMasked(null);

            if (operation.wasSuccessful() && metaData)
            {
               Ext.device.Notification.beep();
               me.fireEvent('challengecomplete', type, qrcode, venueId, customerId, position);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   vipEventHandler : function(position)
   {
      this.completeChallenge(null, position);
   },
   onLocationUpdate : function(position)
   {
      var me = this;

      me.metaData =
      {
         'position' : position
      };

      //
      // Either we are in PhotoUpload mode, or we are in Challenge Authorization Mode
      //
      switch (me.selectedItem.get('type').value)
      {
         case 'vip' :
         {
            me.vipEventHandler(position);
            break;
         }
         case 'menu' :
         case 'birthday' :
         case 'custom' :
            me.completeChallenge(null, position);
            //me.scanQRCode();
            break;
         default:
            break;
      }
   },
   onChallengeComplete : function(type, qrcode, venueId, customerId, position, eOpts, eInfo)
   {
      var me = this;
      var metaData = Challenge.getProxy().getReader().metaData;

      switch (type)
      {
         case 'vip' :
         {
            Ext.device.Notification.show(
            {
               title : 'VIP Challenge',
               message : me.getConsolationMsg(metaData['message']),
               buttons : ['OK']
            });
            me.fireEvent('updatemetadata', metaData);
            break;
         }
         default:
            var account_info = metaData['account_info'];
            var reward_info = metaData['reward_info'];
            Ext.device.Notification.show(
            {
               title : 'Completed Challenge!',
               message : ((reward_info['points'] > 0) ? //
               me.getPointsMsg(reward_info['points'], account_info['points']) : //
               me.getConsolationMsg(metaData['message'])),
               buttons : ['OK']
            });

            me.fireEvent('updatemetadata', metaData);
            break;
      }
   },
   // --------------------------------------------------------------------------
   // Challenge Page
   // --------------------------------------------------------------------------
   onItemTap : function(model)
   {
      var me = this, viewport = me.getViewPortCntlr(), db = Genesis.db.getLocalDB();

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      var desc = me.getChallengeDescContainer();
      Ext.Anim.run(desc.element, 'fade',
      {
         //direction : 'right',
         duration : 600,
         out : false,
         autoClear : true,
         scope : me,
         before : function()
         {
            for (var i = 0; i < desc.getItems().length; i++)
            {
               desc.getItems().getAt(i).updateData(model.getData());
            }
            me.selectedItem = model;
         }
      });
      switch (model.get('type').value)
      {
         case 'facebook' :
         {
            var hideFB = (db['enableFB'] && (db['currFbId'] > 0)) || !Genesis.fn.isNative();
            me.getChallengeContainer()[hideFB ? 'hide' : 'show']();
            break;
         }
         case 'birthday' :
         {
            me.getChallengeContainer()['hide']();
            if (!db['account'].birthday)
            {
               Ext.device.Notification.show(
               {
                  title : me.selectedItem.get('name').capitalize() + ' Challenge',
                  message : me.updateAccountInfoMsg,
                  buttons : ['OK', 'Cancel'],
                  callback : function(btn)
                  {
                     if (btn.toLowerCase() == 'ok')
                     {
                        me.redirectTo('settings');
                     }
                  }
               });
            }
            break;
         }
         default :
            me.getChallengeContainer()['show']();
            break;
      }
      return true;
   },
   onChallengeBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, db = Genesis.db.getLocalDB();
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var selectedItem = me.selectedItem;

      if (selectedItem)
      {
         switch (selectedItem.get('type').value)
         {
            default :
               // VenueId can be found after the User checks into a venue
               if (!(cvenue && venue && (cvenue.getId() == venue.getId())))
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : me.checkinFirstMsg,
                     buttons : ['Dismiss']
                  });
                  return true;
               }
               break;
         }

         switch (selectedItem.get('type').value)
         {
            case 'birthday' :
            {
               break;
            }
            case 'facebook' :
            {
               var controller = me.getApplication().getController('client' + '.Settings');
               controller.updateFBSettingsPopup(selectedItem.get('name') + ' Challenge', null);
               break;
            }
            case 'menu' :
            case 'vip' :
            case 'custom' :
            {
               if (selectedItem.get('require_verif'))
               {
                  window.plugins.proximityID.preLoadSend(me, Ext.bind(function(_selectedItem)
                  {
                     if (_selectedItem.get('type').value == 'photo')
                     {
                        me.getGeoLocation();
                     }
                     else
                     {
                        me.onLocationUpdate(null);
                     }
                  }, me, [selectedItem]));
               }
               else
               {
                  me.onLocationUpdate(null);
               }
               break;
            }
         }
      }
   },
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         //var carousel = activeItem.query('carousel')[0];
         //var items = carousel.getInnerItems();

         console.debug("Refreshing Challenge Main Page ...");
         /*
          for (var i = 0; i < items.length; i++)
          {
          items[i].refresh();
          }
          */
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      Ext.defer(function()
      {
         //activeItem.createView();
         var desc = me.getChallengeDescContainer();
         for (var i = 0; i < desc.getItems().length; i++)
         {
            desc.getItems().getAt(i).updateData(
            {
               description : me.defaultDescText
            });
            me.getChallengeContainer().hide();
         }
      }, 1, activeItem);
      //activeItem.createView();

      delete me.selectedItem;
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   completeChallenge : function(qrcode, position, eOpts, eInfo)
   {
      var me = this, viewport = me.getViewPortCntlr(), params, db = Genesis.db.getLocalDB(), venue = viewport.getVenue(), venueId = venue.getId();

      me.identifiers = null;
      if (me.selectedItem)
      {
         params =
         {
            venue_id : venueId
         }
         if (position)
         {
            params = Ext.apply(params,
            {
               latitude : position.coords.getLatitude(),
               longitude : position.coords.getLongitude()
            });
         }
         Challenge['setCompleteChallengeURL'](me.selectedItem.getId());

         var privKey = Genesis.fn.privKey =
         {
            'venueId' : venueId,
            'venue' : venue.get('name')
         };
         privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];

         me.broadcastLocalID(function(idx)
         {
            me.identifiers = idx;
            Ext.Viewport.setMasked(
            {
               xtype : 'mask',
               cls : 'transmit-mask',
               html : me.lookingForMerchantDeviceMsg(),
               listeners :
               {
                  'tap' : function(b, e, eOpts)
                  {
                     //
                     // Stop broadcasting now ...
                     //
                     /*
                      if (!Ext.get(Ext.DomQuery.select('.x-innerhtml',b.element.dom)[0]).getPageBox(true).isOutOfBound(
                      {
                      x : e.pageX,
                      y : e.pageY
                      }))
                      */
                     {
                        Ext.Ajax.abort();
                        if (me.identifiers)
                        {
                           me.identifiers['cancelFn']();
                        }
                        Ext.Viewport.setMasked(null);
                        me.onDoneTap();
                        Ext.device.Notification.show(
                        {
                           title : me.selectedItem.get('name').capitalize() + ' Challenge',
                           message : me.transactionCancelledMsg,
                           buttons : ['Dismiss']
                        });
                     }
                  }
               }
            });
            console.debug("Broadcast underway ...");
            me.challengeItemFn(params, me.selectedItem.getId(), me.selectedItem.get('type').value, venueId, qrcode, position);
         }, function()
         {
            Ext.Viewport.setMasked(null);
         });
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   challengesPage : function()
   {
      this.setAnimationMode(this.self.animationMode['coverUp']);
      this.pushView(this.getMainPage());
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, cb)
   {
      var me = this;
      switch (subFeature)
      {
         default:
            break;
      }
   },
   getMainPage : function()
   {
      var page = this.getChallengePage();
      return page;
   },
   openMainPage : function()
   {
      this.redirectTo('challenges');
      console.log("Client ChallengePage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

Ext.define('Genesis.view.client.UploadPhotosPage',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                 
   alias : 'widget.clientuploadphotospageview',
   scrollable : 'vertical',
   config :
   {
      cls : 'photoUploadPage',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Photo Upload',
         items : [
         {
            align : 'right',
            tag : 'post',
            text : 'Post'
         }]
      }),
      // Display Comment
      {
         xtype : 'textareafield',
         labelAlign : 'top',
         bottom : 0,
         left : 0,
         right : 0,
         name : 'desc',
         tag : 'desc',
         cls : 'desc',
         autoComplete : true,
         defaultUnit : 'em',
         //minHeight : '2em',
         autoCorrect : true,
         autoCapitalize : true,
         maxLength : 256,
         maxRows : 4,
         placeHolder : 'Please enter your photo description',
         clearIcon : false
      }]
   },
   showView : function()
   {
      this.callParent(arguments);

      console.debug("Rendering [" + this.metaData['photo_url'] + "]");
      this.query('container[tag=background]')[0].element.dom.style.cssText += 'background-image:url(' + this.metaData['photo_url'] + ');'
      delete this.metaData;
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      this.setPreRender(this.getPreRender().concat([
      // Uploaded Image
      photo = Ext.create('Ext.Container',
      {
         flex : 1,
         width : '100%',
         xtype : 'container',
         tag : 'background',
         cls : 'background'
      })]));
   }
});

Ext.define('Genesis.view.client.CheckinExplore',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                        
   alias : 'widget.clientcheckinexploreview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      merchant : null,
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            iconCls : 'home',
            //text : 'Home',
            tag : 'home'
         },
         {
            align : 'right',
            ui : 'normal',
            iconCls : 'refresh',
            tag : 'refresh'
         }]
      }),
      {
         docked : 'bottom',
         hidden : true,
         cls : 'toolbarBottom',
         tag : 'toolbarBottom',
         xtype : 'container',
         layout :
         {
            type : 'vbox',
            pack : 'center'
         },
         items : [
         {
            xtype : 'segmentedbutton',
            allowMultiple : false,
            defaults :
            {
               iconMask : true,
               ui : 'blue',
               flex : 1
            },
            items : [
            {
               iconCls : 'rewards',
               tag : 'rewardsSC',
               text : 'Earn Points'
            }],
            listeners :
            {
               toggle : function(container, button, pressed)
               {
                  //console.debug("User toggled the '" + button.getText() + "' button: " + ( pressed ? 'on' : 'off'));
                  container.setPressedButtons([]);
               }
            }
         }]
      }]
   },
   disableAnimation : true,
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         //this.query('list')[0].refresh();
         return;
      }
      var itemHeight = 1 + Genesis.constants.defaultIconSize();
      me.getPreRender().push(Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'CheckinExploreStore',
         loadingText : null,
         //scrollable : 'vertical',
         plugins : [
         {
            type : 'pullrefresh',
            //pullRefreshText: 'Pull down for more new Tweets!',
            refreshFn : function(plugin)
            {
               me.fireEvent('exploreLoad', true);
            }
         },
         {
            type : 'listpaging',
            autoPaging : true,
            loadMoreText : '',
            noMoreRecordsText : ''
         }],
         refreshHeightOnUpdate : false,
         variableHeights : false,
         deferEmptyText : false,
         itemHeight : itemHeight + Genesis.fn.calcPx(2 * 0.65, 1),
         emptyText : ' ',
         tag : 'checkInExploreList',
         cls : 'checkInExploreList',
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate',
         '<div class="photo">'+
            '<img src="{[this.getPhoto(values)]}"/>'+
         '</div>' +
         '<div class="listItemDetailsWrapper">' +
            '<div class="itemDistance">{[this.getDistance(values)]}</div>' +
            '<div class="itemTitle">{name}</div>' +
            '<div class="itemDesc">{[this.getAddress(values)]}</div>' +
         '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               return values.Merchant['photo']['thumbnail_medium_url'];
            },
            getAddress : function(values)
            {
               return (values['address'] + ",<br/>" + values['city'] + ", " + values['state'] + ", " + values['country'] + ",<br/>" + values.zipcode);
            },
            getDistance : function(values)
            {
               return ((values['distance'] > 0) ? values['distance'].toFixed(1) + 'km' : '');
            }
         }),
         onItemDisclosure : Ext.emptyFn
      }));
   }
});

Ext.define('Genesis.controller.client.Checkins',
{
   extend :  Genesis.controller.ControllerBase ,
   inheritableStatics :
   {
   },
   xtype : 'clientcheckinsCntlr',
   config :
   {
      models : ['Venue'],
      routes :
      {
         'exploreS' : 'explorePageUp',
         'explore' : 'explorePage',
         'checkin' : 'checkinPage'
      },
      refs :
      {
         //backBtn : 'clientcheckinexploreview button[tag=back]',
         //closeBtn : 'clientcheckinexploreview button[tag=close]',
         exploreList : 'clientcheckinexploreview list',
         explore :
         {
            selector : 'clientcheckinexploreview',
            autoCreate : true,
            xtype : 'clientcheckinexploreview'
         },
         toolbarBottom : 'clientcheckinexploreview container[tag=toolbarBottom]',
         shareBtn : 'viewportview button[tag=shareBtn]',
         refreshBtn : 'clientcheckinexploreview button[tag=refresh]',
         // Login Page
         login : 'loginpageview'
      },
      control :
      {
         //
         // Checkin Explore
         //
         explore :
         {
            showView : 'onExploreShowView',
            activate : 'onExploreActivate',
            deactivate : 'onExploreDeactivate',
            exploreLoad : 'onExploreLoad'

         },
         refreshBtn :
         {
            tap : 'onRefreshTap'
         },
         exploreList :
         {
            select : 'onExploreSelect',
            disclose : 'onExploreDisclose'
         },
         login :
         {
            activate : 'onLoginActivate'
         }
      },
      listeners :
      {
         'checkin' : 'onCheckinTap',
         'explore' : 'onNonCheckinTap',
         'checkinScan' : 'onCheckinScanTap',
         'checkinMerchant' : 'onCheckinHandler',
         'setupCheckinInfo' : 'onSetupCheckinInfo',
         'exploreLoad' : 'onExploreLoad'
      },
      position : null
   },
   metaDataMissingMsg : 'Missing Checkin MetaData information.',
   noCheckinCodeMsg : 'No Checkin Code found!',
   init : function()
   {
      var me = this;
      //
      // Store storing the Venue object for Checked-In / Explore views
      //
      Ext.regStore('CheckinExploreStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false,
         sorters : [
         {
            property : 'distance',
            direction : 'ASC'
         }],
         listeners :
         {
            'metachange' : function(store, proxy, eOpts)
            {
               // Let Other event handlers udpate the metaData first ...
               if (store.isLoading())
               {
                  me.fireEvent('updatemetadata', proxy.getReader().metaData);
               }
            }
         }
      });
      me.callParent(arguments);
      console.log("Checkins Init");
      //
      // Prelod Page
      //
      me.getExplore();

      backBtnCallbackListFn.push(function(activeItem)
      {
         if (activeItem == me.getExplore())
         {
            var viewport = me.getViewPortCntlr();
            me.self.playSoundFile(viewport.sound_files['clickSound']);
            viewport.goToMain();
            return true;
         }
         return false;
      });
   },
   checkinCommon : function(qrcode)
   {
      var me = this;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var mode = me.callback['mode'];
      var url = me.callback['url'];
      var position = me.callback['position'];
      var callback = me.callback['callback'];
      var viewport = me.getViewPortCntlr();
      var venueId = null;

      switch (me.callback['url'])
      {
         case 'setVenueScanCheckinUrl' :
         {
            break;
         }
         default:
            venueId = (viewport.getVenue() ? viewport.getVenue().getId() : null);
            break;
      }

      // Load Info into database
      Customer[url](venueId);
      var params =
      {
         latitude : (position) ? position.coords.getLatitude() : 0,
         longitude : (position) ? position.coords.getLongitude() : 0,
         auth_code : qrcode || 0
      }
      if (venueId)
      {
         params = Ext.apply(params,
         {
            venue_id : venueId
         });
      }

      console.debug("CheckIn - auth_code:'" + qrcode + "' venue_id:'" + venueId + "'");

      cstore.load(
      {
         addRecords : true,
         jsonData :
         {
         },
         params : params,
         scope : me,
         callback : function(records, operation)
         {
            var metaData = Customer.getProxy().getReader().metaData;
            if (operation.wasSuccessful() && metaData)
            {
               me.fireEvent('checkinMerchant', mode, metaData, venueId, records[0], operation, callback);
            }
            else if (!operation.wasSuccessful() && !metaData)
            {
               console.debug(me.metaDataMissingMsg);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Common Functions
   // --------------------------------------------------------------------------
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      if (qrcode)
      {
         console.debug(me.checkinMsg);
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.checkinMsg
         });

         // Retrieve GPS Coordinates
         me.checkinCommon(qrcode);
      }
      else
      {
         console.debug(me.noCheckinCodeMsg);
         Ext.Viewport.setMasked(null);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.noCheckinCodeMsg,
            buttons : ['Dismiss']

         });
      }
   },
   onCheckInScanNow : function(b, e, eOpts, eInfo, mode, url, type, callback)
   {
      var me = this;

      switch(type)
      {
         case 'scan' :
         {
            me.callback =
            {
               mode : mode,
               position : me.getPosition(),
               url : url,
               type : type,
               callback : callback
            };
            me.scanQRCode();
            break;
         }
         default:
            me.callback =
            {
               mode : mode,
               position : me.getPosition(),
               url : url,
               type : '',
               callback : callback
            };
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.getMerchantInfoMsg
            });
            me.checkinCommon(null);
            break;
      }
      me.setPosition(null);
   },
   onSetupCheckinInfo : function(mode, venue, customer, metaData)
   {
      var viewport = this.getViewPortCntlr();
      viewport.setVenue(venue)
      viewport.setCustomer(customer);
      viewport.setMetaData(metaData);

      switch (mode)
      {
         case 'checkin' :
         {
            viewport.setCheckinInfo(
            {
               venue : viewport.getVenue(),
               customer : viewport.getCustomer(),
               metaData : viewport.getMetaData()
            });
            /*
             if (venue)
             {
             Genesis.db.setLocalDBAttrib('last_check_in',
             {
             venue : viewport.getVenue().raw,
             customerId : viewport.getCustomer().getId(),
             metaData : viewport.getMetaData()
             });
             }
             else
             {
             Genesis.db.removeLocalDBAttrib('last_check_in');
             }
             */
            break;
         }
         case 'explore' :
         case 'redemption' :
         default :
            break;
      }
   },
   onCheckinScanTap : function(b, e, eOpts, einfo)
   {
      // Scan QR Code to confirm Checkin
      this.onCheckInScanNow(b, e, eOpts, einfo, 'checkin', 'setVenueScanCheckinUrl', 'scan', Ext.emptyFn);
   },
   onCheckinTap : function(promotion)
   {
      var me = this;

      if (promotion)
      {
         var controller = me.getApplication().getController('client' + '.Merchants');
         var page = controller.getMain();
         page.promotion = true;
      }

      // Checkin directly to Venue
      me.onCheckInScanNow(null, null, null, null, 'checkin', 'setVenueCheckinUrl', 'noscan', Ext.emptyFn);
   },
   onNonCheckinTap : function(b, e, eOpts, einfo, callback)
   {
      // No scanning required
      this.onCheckInScanNow(b, e, eOpts, einfo, 'explore', 'setVenueExploreUrl', 'noscan', callback);
   },
   onCheckinHandler : function(mode, metaData, venueId, record, operation, callback)
   {
      var me = this;
      var app = me.getApplication();
      var custore = Ext.StoreMgr.get('CustomerStore');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var mcntlr = app.getController('client.Merchants');
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var sync = false, checkinMode = false, redeemmode = false;

      var customerId, customer, venue, points;
      customerId = record.getId();
      points = record.get('points');
      callback = callback || Ext.emptyFn;

      // Find venueId from metaData or from DataStore
      var new_venueId = metaData['venue_id'] || ((cestore.first()) ? cestore.first().getId() : 0);
      // Find venue from DataStore or current venue info
      venue = cestore.getById(new_venueId) || viewport.getVenue();

      // Find Matching Venue or pick the first one returned if no venueId is set
      console.debug("CheckIn - new_venueId:'" + new_venueId + //
      "' venue_id:'" + venueId + //
      "' points:'" + points + "'");
      if ((new_venueId == venueId) || (venueId == null))
      {
         checkinMode = (mode == 'checkin');
         redeemMode = (mode == 'redemption');
         //
         // Update our Database with the latest value from Server
         //
         if (Customer.isValid(customerId))
         {
            customer = custore.getById(customerId);
            console.debug("Checking In Venue ...");
         }
         else
         {
            console.debug("Exploring Venue ...");
         }

         me.fireEvent('setupCheckinInfo', mode, venue, customer || record, metaData);
         me.fireEvent('updatemetadata', metaData);
      }
      else
      {
         console.debug("CheckIn - venueIDs do not match!");
      }

      //
      // Cleans up Back Buttons on Check-in
      //
      switch(mode)
      {
         case 'checkin' :
         case 'explore' :
         {
            me.resetView();
            Ext.Viewport.setMasked(null);
            me.redirectTo('venue/' + venue.getId() + '/' + customerId);
            break;
         }
         case 'redemption' :
         default:
            break;
      }

      callback();

      if (checkinMode || redeemMode)
      {
         /*
          if (checkinMode)
          {
          // Let the screen complete the rendering process
          Ext.defer(me.checkReferralPrompt, 0.1 * 1000, me, [
          function()
          {
          //
          // We are in Merchant Account screen,
          // there's nothing to do after Successful Referral Challenge
          //
          //me.popView();
          Ext.device.Notification.show(
          {
          title : 'Successful Referral!',
          message : me.recvReferralb4VisitMsg(customer.getMerchant().get('name')),
          buttons : ['Dismiss']
          });
          }, null]);
          }
          */
         console.debug("CheckIn - Complete");
      }
      else
      {
         console.debug("CheckInExplore - Complete");
      }
   },
   // --------------------------------------------------------------------------
   // Login Page
   // --------------------------------------------------------------------------
   onLoginActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      cestore.removeAll();
   },
   // --------------------------------------------------------------------------
   // CheckinExplore Page
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this, tbb = me.getToolbarBottom(), viewport = me.getViewPortCntlr(), params =
      {
      }, cestore = Ext.StoreMgr.get('CheckinExploreStore'), proxy = cestore.getProxy();

      Ext.Viewport.setMasked(null);
      if (!Genesis.db.getLocalDB()['csrf_code'])
      {
         viewport.on('completeRefreshCSRF', function()
         {
            me.onLocationUpdate(position);
         }, viewport,
         {
            single : true
         });
      }
      else
      {
         pausedDisabled = false;
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.getVenueInfoMsg
         });
         if (position)
         {
            params = Ext.apply(params,
            {
               latitude : position.coords.getLatitude(),
               longitude : position.coords.getLongitude()
            });
         }
         tbb[(position) ? 'show' : 'hide']();

         Venue['setFindNearestURL']();
         cestore.load(
         {
            params : params,
            callback : function(records, operation)
            {
               //Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.Viewport.setMasked(null);

                  tbb.setDisabled(false);
                  me.setPosition(position);
                  console.debug("Found " + records.length + " venues.");
               }
               else
               {
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : 'Warning',
                     message : me.missingVenueInfoMsg(operation.getError()),
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsCallbackFn();
                     }
                  });
               }
            },
            scope : me
         });
      }
   },
   onExploreLoad : function(forceReload)
   {
      var me = this;
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      //
      // Do not reload page unless this is the first time!
      // Saves bandwidth
      //
      if ((cestore.getCount() == 0) || forceReload)
      {
         me.getGeoLocation();
      }
   },
   onExploreShowView : function(activeItem)
   {
      var list = this.getExploreList();
      if (Ext.os.is('Android'))
      {
         var monitors = this.getEventDispatcher().getPublishers()['elementSize'].monitors;

         console.debug("Refreshing CheckinExploreStore ...");
         monitors[list.container.getId()].forceRefresh();
      }
   },
   onExploreActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      var viewport = me.getViewPortCntlr();
      var tbb = me.getToolbarBottom();
      var tbbar = activeItem.query('titlebar')[0];

      switch (me.animMode)
      {
         case 'cover' :
            //me.getBackBtn().show();
            //me.getCloseBtn().hide();
            break;
         case 'coverUp' :
            //me.getBackBtn().hide();
            //me.getCloseBtn().show();
            break;
      }
      tbbar.removeCls('kbTitle');
      switch (me.mode)
      {
         case 'checkin':
            tbbar.setTitle(' ');
            tbbar.addCls('kbTitle');
            tbb.setDisabled(true);
            //tbb.show();
            break;
         case 'explore' :
            //tbb.hide();
            break;
      }
      //activeItem.createView();
      if (me.getExploreList())
      {
         //me.getExploreList().setVisibility(false);
      }
      me.fireEvent('exploreLoad', false);

      //
      // Display Add2Home Feature is necessary to remind users
      //
      if (!Genesis.fn.isNative())
      {
         addToHome.show();
      }
   },
   onExploreDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      if (!Genesis.fn.isNative())
      {
         addToHome.close();
      }
   },
   onRefreshTap : function(b, e, eOpts)
   {
      var me = this;
      me.fireEvent('exploreLoad', true);
   },
   onExploreSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onExploreDisclose(d, model);
      return false;
   },
   onExploreDisclose : function(list, record, target, index, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);
      viewport.setVenue(record);
      switch (this.mode)
      {
         case 'checkin':
         {
            this.onCheckinTap(null, e, eOpts, eInfo);
            break;
         }
         case 'explore' :
         {
            this.onNonCheckinTap(null, e, eOpts, eInfo);
            break;
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   explorePageUp : function()
   {
      this.openPage('explore', 'coverUp');
   },
   explorePage : function()
   {
      this.openPage('explore');
   },
   checkinPage : function()
   {
      this.openPage('checkin');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, animMode)
   {
      var me = this;
      var page = me.getMainPage();
      me.mode = page.mode = subFeature;
      me.animMode = animMode || 'cover';
      me.setAnimationMode(me.self.animationMode[me.animMode]);
      me.pushView(page);
   },
   getMainPage : function()
   {
      var page = this.getExplore();
      return page;
   },
   openMainPage : function()
   {
      var page = this.getMainPage();
      // Hack to fix bug in Sencha Touch API
      //var plugin = page.query('list')[0].getPlugins()[0];
      //plugin.refreshFn = plugin.getRefreshFn();

      this.pushView(page);
      console.log("Checkin Explore Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

Ext.define('Genesis.model.frontend.JackpotWinner',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'JackpotWinner',
   id : 'JackpotWinner',
   config :
   {
      fields : [
      {
         name : 'time',
         type : 'date',
         convert : function(value, obj)
         {
            obj.set('date', value);
            return (value) ? Genesis.fn.convertDate(value) : null;
         }
      }, 'facebook_id', 'name', 'points', 'date'],
      idProperty : 'id',
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   inheritableStatics :
   {
      setGetJackpotWinnersUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/customers/show_jackpot_winners');
      }
   }
});

Ext.define('Genesis.view.client.JackpotWinners',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                        
   alias : 'widget.clientjackpotwinnersview',
   config :
   {
      cls : 'jackpotWinnersMain viewport',
      layout : 'fit',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Jackpot Winners',
         items : [
         {
            align : 'left',
            tag : 'close',
            //ui : 'back',
            ui : 'normal',
            text : 'Close'
         }]
      })]
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   createView : function()
   {
      var me = this;

      /*
       if (Ext.StoreMgr.get('JackpotWinnerStore').getCount() == 0)
       {
       me.getPreRender().push(Ext.create('Ext.Component',
       {
       cls : 'noprizes',
       xtype : 'component',
       scrollable : false,
       defaultUnit : 'em',
       margin : '0 0 0.8 0'
       }));
       console.log("Jackpot Winners No Winners found.");
       }
       else
       */
      {
         me.setPreRender(me.getPreRender().concat([
         //
         // JackpotWinners List
         //
         Ext.create('Ext.dataview.List',
         {
            tag : 'jackpotWinnersList',
            store : 'JackpotWinnerStore',
            cls : 'jackpotWinnersList',
            scrollable : 'vertical',
            deferEmptyText : false,
            disableSelection : true,
            emptyText : ' ',
            itemTpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<div class="photo">',
               '<img src="{[this.getPhoto(values)]}"/>',
            '</div>',
           '<div class="listItemDetailsWrapper">',
               '<div class="itemTitle">{[this.getTitle(values)]}</div>',
               '<div class="itemDesc">{[this.getDesc(values)]}</div>',
            '</div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  return ((values['facebook_id'] > 0) ? Genesis.fb.getFbProfilePhoto(values['facebook_id']) : Genesis.constants.getIconPath('miscicons', 'profile'));
               },
               getTitle : function(values)
               {
                  console.debug(values['name'] + ' won ' + values['points'] + ' Points!');
                  return (values['name'] + ' won ' + values['points'] + ' Points!');
               },
               getDesc : function(values)
               {
                  return values['time'];
               }
            }),
            //onItemDisclosure : Ext.emptyFn,
            plugins : [
            {
               type : 'listpaging',
               autoPaging : true,
               loadMoreText : '',
               noMoreRecordsText : ''
            },
            {
               type : 'pullrefresh',
               refreshFn : function(plugin)
               {
                  _application.getController('client.JackpotWinners').fireEvent('reload');
               }
            }]
         })]));
      }
      this.callParent(arguments);
   }
});

Ext.define('Genesis.controller.client.JackpotWinners',
{
   extend :  Genesis.controller.ControllerBase ,
                                 
   inheritableStatics :
   {
   },
   xtype : 'clientJackpotWinnersCntlr',
   config :
   {
      routes :
      {
         'jackpotWinners/:id' : 'mainPage'
      },
      models : ['Genesis.model.frontend.JackpotWinner'],
      refs :
      {
         // Main Page
         main :
         {
            selector : 'clientjackpotwinnersview',
            autoCreate : true,
            xtype : 'clientjackpotwinnersview'
         }
      },
      control :
      {
         main :
         {
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      },
      listeners :
      {
         'reload' : 'onReload'
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Loads Front Page Metadata
      //
      Ext.regStore('JackpotWinnerStore',
      {
         model : 'Genesis.model.frontend.JackpotWinner',
         autoLoad : false,
         pageSize : 5,
         sorters : [
         {
            property : 'date',
            direction : 'DESC'
         }],
         listeners :
         {
            scope : me,
            "load" : function(store, records, successful, operation, eOpts)
            {
            }
         }
      });

      console.log("JackpotWinners Init");
      //
      // Preloading Pages to memory
      //
      me.getMain();
   },
   // --------------------------------------------------------------------------
   // EVent Handlers
   // --------------------------------------------------------------------------
   onReload : function()
   {
      var me = this;
      JackpotWinner['setGetJackpotWinnersUrl']();
      Ext.StoreMgr.get('JackpotWinnerStore').load(
      {
         jsonData :
         {
         },
         params :
         {
            'merchant_id' : me.merchantId
         },
         callback : function(records, operation)
         {
         }
      })
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
      	var monitors = this.getEventDispatcher().getPublishers()['elementSize'].monitors;
      	var list = activeItem.query('list[tag=jackpotWinnersList]')[0];
      	
         console.debug("Refreshing RenderStore ...");
         monitors[list.container.getId()].forceRefresh();
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function(merchantId)
   {
      this.openPage('main', merchantId);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, merchantId)
   {
      var me = this;

      switch (subFeature)
      {
         case 'main' :
         {
            me.merchantId = merchantId;
            me.setAnimationMode(me.self.animationMode['coverUp']);
            me.pushView(me.getMainPage());
            me.onReload();
            break;
         }
      }
   },
   getMainPage : function()
   {
      var page = this.getMain();
      return page;
   },
   openMainPage : function()
   {
      var me = this;
      me.setAnimationMode(me.self.animationMode['coverUp']);
      me.pushView(me.getMainPage());
      console.log("Jackpot Winners Page Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

Ext.define('Genesis.model.frontend.ChangePassword',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'ChangePassword',
   id : 'ChangePassword',
   config :
   {
      fields : ['oldpassword', 'newpassword'],
      validations : [
      {
         type : 'length',
         field : 'oldpassword',
         min : 6
      },
      {
         type : 'length',
         field : 'newpassword',
         min : 6
      }]
   }
});

Ext.define('Genesis.view.MainPageBase',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                          
   alias : 'widget.mainpagebaseview',
   config :
   {
      models : ['frontend.MainPage'],
      itemPerPage : 6,
      layout : 'fit',
      cls : 'viewport',
      listeners : [
      {
         element : 'element',
         delegate : 'div.itemWrapper',
         event : 'tap',
         fn : "onItemTap"
      }],
      scrollable : undefined
   },
   //disableAnimation : null,
   isEligible : Ext.emptyFn,
   initialize : function()
   {
      this.setPreRender([]);
      this.callParent(arguments);
   },
   onItemTap : function(e, target, delegate, eOpts)
   {
      var data = Ext.create('Genesis.model.frontend.MainPage', Ext.decode(decodeURIComponent(e.delegatedTarget.getAttribute('data'))));
      _application.getController(((merchantMode) ? 'server' : 'client') + '.MainPage').fireEvent('itemTap', data);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   removeAll : function(destroy, everything)
   {
      var carousel = this.query('carousel')[0];
      return carousel.removeAll(true);
   },
   createView : function()
   {
      var me = this, carousel = me.query('carousel')[0], app = _application;
      var viewport = app.getController(((merchantMode) ? 'server' : 'client') + '.Viewport'), vport = viewport.getViewport();
      var show = (!merchantMode) ? viewport.getCheckinInfo().venue != null : false;
      var items = Ext.StoreMgr.get('MainPageStore').getRange(), list = Ext.Array.clone(items);

      if (!carousel._listitems)
      {
         carousel._listitems = [];
      }

      if (!show)
      {
         Ext.Array.forEach(list, function(item, index, all)
         {
            switch (item.get('hide'))
            {
               case 'true' :
               {
                  Ext.Array.remove(items, item);
                  break;
               }
            }
         });
      }
      //
      // Only update if changes were made
      //
      if ((Ext.Array.difference(items, carousel._listitems).length > 0) || //
      (items.length != carousel._listitems.length))
      {
         carousel._listitems = items;
         carousel.removeAll(true);
         for (var i = 0; i < Math.ceil(items.length / me.getItemPerPage()); i++)
         {
            carousel.add(
            {
               xtype : 'component',
               cls : 'mainMenuSelections',
               tag : 'mainMenuSelections',
               scrollable : undefined,
               data : Ext.Array.pluck(items.slice(i * me.getItemPerPage(), ((i + 1) * me.getItemPerPage())), 'data'),
               tpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<tpl for=".">',
                  '<div class="itemWrapper x-hasbadge" data="{[this.encodeData(values)]}">',
                     '{[this.isEligible(values)]}',
                     '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>',
                     '<div class="photoName">{name}</div>',
                  '</div>',
               '</tpl>',
               // @formatter:on
               {
                  encodeData : function(values)
                  {
                     return encodeURIComponent(Ext.encode(values));
                  },
                  getType : function()
                  {
                     return values['pageCntlr'];
                  },
                  isEligible : me.isEligible,
                  getPhoto : function(photoURL)
                  {
                     return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
                  }
               })
            });
         }
         console.debug("MainPage Icons Refreshed.");
      }
      else
      {
         console.debug("MainPage Icons Not changed.");
      }
      delete carousel._listitems;

      this.callParent(arguments);
   },
   showView : function()
   {
      var carousel = this.query('carousel')[0];
      this.callParent(arguments);
      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
   }
});

Ext.define('Genesis.view.client.MainPage',
{
   extend :  Genesis.view.MainPageBase ,
   alias : 'widget.clientmainpageview',
   config :
   {
      items : ( function()
         {
            var items = [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
            {
               xtype : 'titlebar',
               cls : 'navigationBarTop kbTitle',
               items : [
               {
                  align : 'right',
                  tag : 'info',
                  iconCls : 'info',
                  destroy : function()
                  {
                     this.actions.destroy();
                     this.callParent(arguments);
                  },
                  handler : function()
                  {
                     if (!this.actions)
                     {
                        this.actions = Ext.create('Ext.ActionSheet',
                        {
                           defaultUnit : 'em',
                           padding : '1.0',
                           hideOnMaskTap : false,
                           //layout : 'hbox',
                           defaults :
                           {
                              //flex : 1,
                              xtype : 'button',
                              defaultUnit : 'em'
                           },
                           items : [
                           {
                              margin : '0 0 0.5 0',
                              text : 'Logout',
                              tag : 'logout'
                           },
                           {
                              text : 'Cancel',
                              ui : 'cancel',
                              scope : this,
                              handler : function()
                              {
                                 this.actions.hide();
                              }
                           }]
                        });
                        Ext.Viewport.add(this.actions);
                     }
                     this.actions.show();
                  }
               }]
            }),
            {
               xtype : 'carousel',
               direction : 'horizontal'
            }];
            return items;
         }())
   },
   disableAnimation : true,
   isEligible : function(values, xindex)
   {
      var eligibleRewards = (values['pageCntlr'] == 'client' + '.Redemptions');
      var eligiblePrizes = (values['pageCntlr'] == 'client' + '.Prizes');
      var showIcon = false;

      values.index = xindex - 1;
      if (eligibleRewards || eligiblePrizes)
      {
         var customers = Ext.StoreMgr.get('CustomerStore').getRange();
         for (var i = 0; i < customers.length; i++)
         {
            var customer = customers[i];
            if (eligiblePrizes)
            {
               if (customer.get('eligible_for_prize'))
               {
                  showIcon = true;
                  break;
               }
            }
            else if (eligibleRewards)
            {
               if (customer.get('eligible_for_reward'))
               {
                  showIcon = true;
                  break;
               }
            }
         }
      }
      return ((eligibleRewards || eligiblePrizes) ? //
      '<span data="' + values['pageCntlr'] + '" ' + //
      'class="x-badge round ' + ((showIcon) ? '' : 'x-item-hidden') + '">' + //
      '✔' + '</span>' : '');
   },
   createView : function()
   {
      var me = this;
      var carousel = this.query('carousel')[0];
      var app = _application;
      var viewport = app.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var vport = viewport.getViewport();
      var show = (!merchantMode) ? viewport.getCheckinInfo().venue != null : false;
      var items = Ext.StoreMgr.get('MainPageStore').getRange();
      var list = Ext.Array.clone(items);

      me.calcCarouselSize();

      if (!carousel._listitems)
      {
         carousel._listitems = [];
      }

      if (!show)
      {
         Ext.Array.forEach(list, function(item, index, all)
         {
            switch (item.get('hide'))
            {
               case 'true' :
               {
                  Ext.Array.remove(items, item);
                  break;
               }
            }
         });
      }//
      // Only update if changes were made
      //
      if ((Ext.Array.difference(items, carousel._listitems).length > 0) || //
      (items.length != carousel._listitems.length))
      {
      }
      else
      {
         //
         // Refresh All Badges
         //
         var cstore = Ext.StoreMgr.get('CustomerStore');
         if (cstore)
         {
            var customers = cstore.getRange();
            var eligibleReward = false;
            var eligiblePrize = false;
            for (var i = 0; i < customers.length; i++)
            {
               var customer = customers[i];
               if (customer.get('eligible_for_reward'))
               {
                  eligibleReward = true;
                  break;
               }
               if (customer.get('eligible_for_prize'))
               {
                  eligiblePrize = true;
                  break;
               }
            }
            if (carousel.getInnerItems().length > 0)
            {
               var dom = Ext.DomQuery.select('span[data=client'+'.Redemptions]',carousel.element.dom)[0];
               if (eligibleReward)
               {
                  dom.innerHTML = count;
                  Ext.fly(dom).removeCls("x-item-hidden");
               }
               else
               {
                  if (!dom.className.match(/x-item-hidden/))
                  {
                     Ext.fly(dom).addCls("x-item-hidden");
                  }
               }

               dom = Ext.DomQuery.select('span[data=client'+'.Prizes]',carousel.element.dom)[0];
               if (eligiblePrize)
               {
                  dom.innerHTML = count;
                  Ext.fly(dom).removeCls("x-item-hidden");
               }
               else
               {
                  if (!dom.className.match(/x-item-hidden/))
                  {
                     Ext.fly(dom).addCls("x-item-hidden");
                  }
               }
            }
         }
         console.debug("MainPage Icons Not changed.");
      }

      this.callParent(arguments);
   }
});

Ext.define('Genesis.view.LoginPage',
{
   extend :  Genesis.view.ViewBase ,
                                  
   alias : 'widget.loginpageview',
   config :
   {
      cls : 'bgImage',
      scrollable : undefined
   },
   initialize : function()
   {
      var actions = Ext.create('Ext.ActionSheet',
      {
         modal : false,
         style :
         {
            background : 'transparent',
            border : 'none'
         },
         layout : 'hbox',
         showAnimation : null,
         hideAnimation : null,
         defaultUnit : 'em',
         //padding : '1em',
         hideOnMaskTap : false,
         defaults :
         {
            height : '4em',
            flex : 1,
            defaultUnit : 'em',
            xtype : 'button'
         },
         items : [
         {
            margin : '0 0.7 0 0',
            tag : 'signIn',
            text : 'Sign-In'
         },
         {
            labelCls : 'x-button-label wrap',
            margin : '0 0.7 0 0',
            tag : 'facebook',
            ui : 'fbBlue',
            text : 'Facebook Sign-In'
         },
         {
            labelCls : 'x-button-label wrap',
            tag : 'createAccount',
            ui : 'action',
            text : 'Create Account'
         }]
      });
      this.add(actions);
      this.callParent(arguments);
   }
});

Ext.define('Genesis.view.SignInPage',
{
   extend :  Ext.form.Panel ,
   alias : 'widget.signinpageview',
                                                                                 
   config :
   {
      preRender : null,
      fullscreen : true,
      cls : 'viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      changeTitle : false,
      //scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Sign In',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Login Credentials:',
         defaults :
         {
            required : true,
            labelAlign : 'top',
            clearIcon : true
         },
         items : [
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'Email Address',
            placeHolder : 'johndoe@example.com'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password'
         }]
      },
      {
         xtype : 'button',
         ui : 'action',
         tag : 'login',
         text : 'Sign In',
         defaultUnit : 'em',
         height : '3em',
         xtype : 'button',
         margin : '0.5 0 0 0'
      },
      {
         xtype : 'button',
         tag : 'reset',
         text : 'Password Reset',
         height : '3em',
         defaultUnit : 'em',
         xtype : 'button',
         margin : '0.5 0 0 0'
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

Ext.define('Genesis.view.PasswdResetPage',
{
   extend :  Ext.form.Panel ,
   alias : 'widget.passwdresetpageview',
                                                           
   config :
   {
      preRender : null,
      fullscreen : true,
      cls : 'viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      changeTitle : false,
      scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Password Reset',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Login Credentials:',
         defaults :
         {
            required : true,
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'Email Address',
            clearIcon : true,
            placeHolder : 'johndoe@example.com'
         }]
      },
      {
         xtype : 'button',
         tag : 'submit',
         text : 'Reset',
         defaultUnit : 'em',
         xtype : 'button',
         margin : '0.5 0 0 0'
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

Ext.define('Genesis.view.PasswdChangePage',
{
   extend :  Ext.form.Panel ,
   alias : 'widget.passwdchangepageview',
                                                       
   config :
   {
      preRender : null,
      fullscreen : true,
      cls : 'viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      changeTitle : false,
      scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Password Change',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Login Credentials:',
         defaults :
         {
            required : true,
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'passwordfield',
            name : 'oldpassword',
            label : 'Old Password',
            clearIcon : true
         },
         {
            xtype : 'passwordfield',
            name : 'newpassword',
            label : 'New Password',
            clearIcon : true
         }]
      },
      {
         xtype : 'button',
         tag : 'submit',
         text : 'Change Password',
         defaultUnit : 'em',
         xtype : 'button',
         margin : '0.5 0 0 0'
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

Ext.define('Genesis.view.CreateAccountPage',
{
   extend :  Ext.form.Panel ,
   alias : 'widget.createaccountpageview',
                                                                          
   config :
   {
      preRender : null,
      fullscreen : true,
      cls : 'viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      changeTitle : false,
      scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Create Account',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         tag : 'social',
         title : 'Social Media',
         //instructions : Genesis.fb.fbConnectRequestMsg,
         defaults :
         {
            labelWidth : '60%'
         },
         items : [
         {
            xtype : 'togglefield',
            name : 'facebook',
            label : '<img src="' + //
            Genesis.constants.resourceSite + 'images/' + Genesis.constants.themeName + '/' + 'facebook_icon.png" ' + //
            'style="height:' + (2.5 / 0.8) + 'em' + ';float:left;margin-right:0.8em;"/> Facebook',
            value : 0
         },
         {
            hidden : true,
            xtype : 'togglefield',
            name : 'twitter',
            label : '<img src="' + //
            Genesis.constants.resourceSite + 'images/' + Genesis.constants.themeName + '/' + 'twitter_icon.png" ' + //
            'style="height:' + (2.5 / 0.8) + 'em' + ';float:left;margin-right:0.8em;"/> Twitter',
            value : 0
         }]
      },
      {
         xtype : 'fieldset',
         title : 'Account Credentials:',
         //instructions : 'Enter Username (email address) and Password',
         defaults :
         {
            clearIcon : true,
            required : true,
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'textfield',
            name : 'name',
            label : 'Full Name',
            placeHolder : 'John Smith'
         },
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'Email Address',
            placeHolder : 'johndoe@example.com'
         }, Ext.apply(
         {
            label : 'Phone Number',
            name : 'phone'
         }, Genesis.view.ViewBase.phoneField()),
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password'
         }]
      },
      {
         height : '3em',
         xtype : 'button',
         ui : 'action',
         tag : 'createAccount',
         text : 'Create Account'
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   createView : function()
   {
      var rc = Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
      this.query('fieldset[tag=social]')[0].setInstructions(Genesis.fb.fbConnectRequestMsg);
      return rc;
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

Ext.define('Genesis.controller.client.MainPage',
{
   extend :  Genesis.controller.MainPageBase ,
   xtype : 'clientMainPageCntlr',
   config :
   {
      csrfTokenRecv : false,
      models : ['Genesis.model.frontend.MainPage', 'Genesis.model.frontend.Signin', 'Genesis.model.frontend.Account', 'Genesis.model.frontend.ChangePassword', 'Venue', 'Customer', 'User', 'Merchant', 'CustomerReward'],
      after :
      {
         'mainPage' : ''
      },
      routes :
      {
         //'' : 'openPage', //Default do nothing
         'login' : 'loginPage',
         'merchant' : 'merchantPage',
         'signin' : 'signInPage',
         'password_reset' : 'signInResetPage',
         'password_change' : 'signInChangePage',
         'createAccount' : 'createAccountPage'
      },
      refs :
      {
         // Main Page
         main :
         {
            selector : 'clientmainpageview',
            autoCreate : true,
            xtype : 'clientmainpageview'
         },
         mainCarousel : 'clientmainpageview',
         infoBtn : 'button[tag=info]',
         // Login Page
         login :
         {
            selector : 'loginpageview',
            autoCreate : true,
            xtype : 'loginpageview'
         },
         signin :
         {
            selector : 'signinpageview',
            autoCreate : true,
            xtype : 'signinpageview'
         },
         passwdReset :
         {
            selector : 'passwdresetpageview',
            autoCreate : true,
            xtype : 'passwdresetpageview'
         },
         passwdChange :
         {
            selector : 'passwdchangepageview',
            autoCreate : true,
            xtype : 'passwdchangepageview'
         },
         createAccount :
         {
            selector : 'createaccountpageview',
            autoCreate : true,
            xtype : 'createaccountpageview'
         },
         mainCarousel : 'clientmainpageview',
         shortcutTabBar : 'clientmainpageview tabbar[tag=navigationBarBottom]',
         prizesBtn : 'clientmainpageview tabbar[tag=navigationBarBottom] button[tag=prizesSC]'
      },
      control :
      {
         login :
         {
            activate : 'onLoginActivate',
            deactivate : 'onLoginDeactivate'
         },
         'actionsheet button[tag=facebook]' :
         {
            tap : 'onMainFacebookTap'
         },
         'actionsheet button[tag=createAccount]' :
         {
            tap : 'onCreateAccountTap'
         },
         'actionsheet button[tag=signIn]' :
         {
            tap : 'onSignInTap'
         },
         'signinpageview button[tag=login]' :
         {
            tap : 'onSignInSubmit'
         },
         'signinpageview button[tag=reset]' :
         {
            tap : 'onSignInResetSubmit'
         },
         'passwdresetpageview button[tag=submit]' :
         {
            tap : 'onPasswdResetSubmit'
         },
         'passwdchangepageview button[tag=submit]' :
         {
            tap : 'onPasswdChangeSubmit'
         },
         'actionsheet button[tag=logout]' :
         {
            tap : 'onLogoutTap'
         },
         shortcutTabBar :
         {
            tabchange : 'onTabBarTabChange'
         },
         createAccount :
         {
            activate : 'onCreateActivate',
            deactivate : 'onCreateDeactivate'
         },
         'createaccountpageview togglefield[name=facebook]' :
         {
            change : 'onFacebookChange'
         },
         'createaccountpageview togglefield[name=twitter]' :
         {
            change : 'onTwitterChange'
         },
         'createaccountpageview button[tag=createAccount]' :
         {
            tap : 'onCreateAccountSubmit'
         }
      },
      listeners :
      {
         'refreshCSRF' : 'onRefreshCSRF',
         'facebookTap' : 'onMainFacebookTap',
         'toggleFB' :
         {
            fn : 'onToggleFB',
            buffer : 500
         },
         'toggleTwitter' :
         {
            fn : 'onToggleTwitter',
            buffer : 300
         }
      }
   },
   initializing : true,
   _loggingIn : false,
   _loggingOut : false,
   _logoutflag : 0,
   creatingAccountMsg : 'Creating Your Account ...',
   sessionTimeoutMsg : 'Session Timeout',
   passwdResetConfirmMsg : 'Please confirm to reset your account password',
   passwdResetSuccessMsg : function()
   {
      return ('Password Reset was Successful.' + Genesis.constants.addCRLF() + //
      'Please check your email account for instructions.');
   },
   passwdChangeSuccessMsg : 'Password Change was Successful.',
   signInFailMsg : function(msg)
   {
      return msg + Genesis.constants.addCRLF() + 'Please Try Again';
   },
   passwdResetFailMsg : function(msg)
   {
      return msg + Genesis.constants.addCRLF() + 'Please fix the errors';
   },
   passwdChangeFailMsg : function(msg)
   {
      return msg + Genesis.constants.addCRLF() + 'Please retype the passwords';
   },
   initCallback : function()
   {
      var me = this;
      var db = Genesis.db.getLocalDB();
      if (db['auth_code'])
      {
         me.fireEvent('refreshCSRF');
      }
      else
      {
         me.resetView();
         me.redirectTo('login');
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Customer Accounts for an user
      //
      me.initCustomerStore();

      //
      // Venue Store for Redeem Shorcuts
      //
      me.initVenueStore();

      console.log("Client MainPage Init");
   },
   initCustomerStore : function()
   {
      var me = this;
      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false,
         pageSize : 1000,
         listeners :
         {
            scope : me,
            'load' : function(store, records, successful, operation, eOpts)
            {
            },
            'metachange' : function(store, proxy, eOpts)
            {
               var metaData = proxy.getReader().metaData;
               //
               // QR Code from Transfer Points
               //
               var qrcode = metaData['data'];
               if (qrcode)
               {
                  /*
                   console.debug("QRCode received for Points Transfer" + '\n' + //
                   qrcode);
                   */
                  var app = me.getApplication();
                  var controller = app.getController('client.Accounts');
                  controller.callBackStack['arguments'] = [metaData];
                  controller.fireEvent('triggerCallbacksChain');
               }
            }
         },
         grouper :
         {
            groupFn : function(record)
            {
               return record.getMerchant().get('name');
            }
         },
         filters : [
         {
            filterFn : function(record)
            {
               return Customer.isValid(record.getId());
            }
         }],
         sorters : [
         {
            sorterFn : function(o1, o2)
            {
               var name1 = o1.getMerchant().get('name'), name2 = o2.getMerchant().get('name');
               if (name1 < name2)//sort string ascending
                  return -1
               if (name1 > name2)
                  return 1
               return 0 //default return value (no sorting)
            }
         }]
      });
   },
   initVenueStore : function()
   {
      var me = this;
      Ext.regStore('VenueStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false,
         sorters : [
         {
            property : 'distance',
            direction : 'ASC'
         }],
         listeners :
         {
            'metachange' : function(store, proxy, eOpts)
            {
               // Let Other event handlers udpate the metaData first ...
               //
               // No MetaData returned for now ...
               //
               if (store.isLoading())
               {
                  me.fireEvent('updatemetadata', proxy.getReader().metaData);
               }
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this, viewport = me.getViewPortCntlr(), db = Genesis.db.getLocalDB(), venue = Ext.create('Genesis.model.Venue', db['last_check_in'].venue);
      var latitude_1 = position.coords.getLatitude(), longitude_1 = position.coords.getLongitude();
      var latitude_2 = venue.get('latitude'), longitude_2 = venue.get('longitude');

      var distance = 6371000 * Math.acos(Math.cos(Math.radians(latitude_1)) * Math.cos(Math.radians(latitude_2)) * Math.cos(Math.radians(longitude_2) - Math.radians(longitude_1)) + Math.sin(Math.radians(latitude_1)) * Math.sin(Math.radians(latitude_2)));

      //
      // In proximity of the last_check_in location
      //
      if (distance <= Genesis.constants.minDistance)
      {
         var app = me.getApplication(), controller = app.getController('client.Checkins');
         var customer = Ext.StoreMgr.get('CustomerStore').getById(db['last_check_in'].customerId), metaData = db['last_check_in'].metaData;

         console.debug("Restoring Previous Venue Location ...");
         controller.fireEvent('setupCheckinInfo', 'explore', venue, customer, metaData)
         controller.fireEvent('checkinMerchant', 'checkin', metaData, venue.getId(), customer, null, Ext.emptyFn);
      }
      //
      // We've at somewhere
      else
      {
         console.debug("Reset Previous Location back to Home Page ...");
         Genesis.db.removeLocalDBAttrib('last_check_in');
         me.redirectTo('checkin');
      }
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      if (Genesis.fn.isNative())
      {
         navigator.splashscreen.hide();
      }
      //activeItem.createView();
      this.getInfoBtn()[(merchantMode) ? 'hide' : 'show']();
      //Ext.Viewport.setMasked(null);
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      //this.getInfoBtn().hide();
   },
   onTabBarTabChange : function(bar, newTab, oldTab, eOpts)
   {
      switch(newTab.config.tag)
      {
         default :
         case 'rewards' :
         {
            Ext.defer(function()
            {
               try
               {
                  if (newTab)
                  {
                     newTab.setActive(false);
                  }

                  if (oldTab)
                  {
                     oldTab.setActive(false);
                  }
                  bar._activeTab = null;
               }
               catch(e)
               {
               }
            }, 2 * 1000);
            break;
         }
      }

      return true;
   },
   // --------------------------------------------------------------------------
   // Login Page
   // --------------------------------------------------------------------------
   onLoginActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      Genesis.db.resetStorage();
      Ext.StoreMgr.get('CustomerStore').removeAll();
      Ext.StoreMgr.get('VenueStore').removeAll();
      me.persistSyncStores(null, true);
      viewport.setLoggedIn(false);
      me._loggingIn = false;

      //this.getInfoBtn().hide();
      //activeItem.createView();
   },
   onLoginDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //oldActiveItem.removeAll(true);
   },
   _logout : function()
   {
      var me = this, authCode = Genesis.db.getLocalDB()['auth_code'];
      if (authCode)
      {
         console.log("Logging out ...");
         Customer['setLogoutUrl'](authCode);
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            callback : function(records, operation)
            {
               me._loggingIn = false;
               me._loggingOut = false;
               if (operation.wasSuccessful())
               {
                  console.log("Logout Successful!")
               }
               else
               {
                  console.log("Logout Failed!")
               }
            }
         });
      }
      else
      {
         me._loggingOut = false;
      }
      console.debug("Resetting Session information ...")
      if ((Genesis.db.getLocalDB()['currFbId'] > 0) && (Genesis.fn.isNative()))
      {
         console.debug("Logging out of Facebook ...")
         Genesis.fb.facebook_onLogout(null, true);
      }
      me.resetView();
      me.redirectTo('login');
   },
   onLogoutTap : function(b, e, eOpts, eInfo)
   {
      var me = this, vport = me.getViewport(), viewport = me.getViewPortCntlr();

      if (me._loggingOut)
      {
         return;
      }

      me._logoutflag = 0;
      me._loggingOut = true;
      b.parent.onAfter(
      {
         hiddenchange : function()
         {
            if ((me._logoutflag |= 0x01) == 0x11)
            {
               me._logout();
            }
         },
         single : true
      });
      b.parent.hide();
      if (Genesis.db.getLocalDB()['currFbId'] > 0)
      {
      }
      else
      {
         console.debug("No Login info found from Facebook ...")
      }
      //
      // Login as someone else?
      //
      if ((me._logoutflag |= 0x10) == 0x11)
      {
         me._logout();
      }
   },
   onFacebookLoginCallback : function(params, op, eOpts, eInfo, failCallback)
   {
      var me = this, fb = Genesis.fb;

      fb.un('connected', me.fn);
      fb.un('unauthorized', me.fn);
      fb.un('exception', me.fn);
      delete me.fn;

      if ((op && op.wasSuccessful()) || (params && (params['type'] != 'timeout')))
      {
         Customer['setFbLoginUrl']();
         console.debug("setFbLoginUrl - Logging in ... params(" + Ext.encode(params) + ")");
         me.updatedDeviceToken = (Genesis.constants.device) ? true : false;
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            params : Ext.apply(
            {
               version : Genesis.constants.clientVersion,
               device_pixel_ratio : window.devicePixelRatio,
               device : Ext.encode(Genesis.constants.device)
            }, params),
            callback : function(records, operation)
            {
               me._loggingIn = false;
               //
               // Login Error, let the user login again
               //
               if (!operation.wasSuccessful())
               {
                  //
                  // If we are already in Login Page, reset all values
                  //
                  //Genesis.db.resetStorage();
                  failCallback();
               }
               else
               {
                  Ext.Viewport.setMasked(null);
                  Genesis.db.setLocalDBAttrib('enableFB', true);
                  me.persistSyncStores('CustomerStore');
               }
            }
         });
      }
      else
      {
         me._loggingIn = false;
         failCallback();
      }
   },
   onMainFacebookTap : function(b, e, eOpts, eInfo, failCallback)
   {
      var me = this, fb = Genesis.fb;
      failCallback = (Ext.isFunction(failCallback)) ? failCallback : Ext.emptyFn;
      //
      // Forced to Login to Facebook
      //
      if (Ext.Viewport.getMasked() || me._loggingOut || me._loggingIn)
      {
         failCallback();
         return;
      }

      me._loggingIn = true;
      Genesis.db.removeLocalDBAttrib('currFbId');

      me.fn = Ext.bind(me.onFacebookLoginCallback, me, [failCallback], true);
      fb.on('connected', me.fn);
      fb.on('unauthorized', me.fn);
      fb.on('exception', me.fn);

      Genesis.fb.facebook_onLogin(false);
   },
   onCreateAccountTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      //if (!me._loggingIn)
      {
         me.redirectTo('createAccount');
      }
   },
   onSignInTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      //if (!me._loggingIn)
      {
         //this.resetView();
         me.redirectTo('signin');
      }
   },
   // --------------------------------------------------------------------------
   // SignIn and CreateAccount Page
   // --------------------------------------------------------------------------
   onRefreshCSRF : function()
   {
      var me = this, viewport = me.getViewPortCntlr(), proxy = Account.getProxy(), db = Genesis.db.getLocalDB();

      Account['setRefreshCsrfTokenUrl']();
      console.debug("setRefreshCsrfTokenUrl - Refreshing CSRF Token ...");
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.establishConnectionMsg
      });

      me.updatedDeviceToken = (Genesis.constants.device) ? true : false;
      Account.load(0,
      {
         jsonData :
         {
         },
         params :
         {
            version : Genesis.constants.clientVersion,
            device_pixel_ratio : window.devicePixelRatio,
            device : Ext.encode(Genesis.constants.device)
         },
         callback : function(record, operation)
         {
            //console.debug("CSRF callback - " + operation.wasSuccessful());
            if (operation.wasSuccessful())
            {
               viewport.fireEvent('completeRefreshCSRF');
               me.persistLoadStores(Ext.emptyFn);

               // Return to previous Venue
               if (db['last_check_in'])
               {
                  me.getGeoLocation();
               }
            }
            //
            // Error refresh CSRF Token. go back to Login screen
            //
            else
            {
               me.resetView();
               me.redirectTo('login');
            }
         }
      });
   },
   onCreateAccountSubmit : function(b, e, eOpts, eInfo)
   {
      var me = this, account = me.getCreateAccount(), response = Genesis.db.getLocalDB()['fbResponse'] || null, values = account.getValues();
      var user = me.getApplication().getController('client.Settings').self.accountValidate(account, values);

      if (user)
      {
         console.debug("Creating Account ...");
         var params =
         {
            version : Genesis.constants.clientVersion,
            name : values.name,
            email : values.username,
            password : values.password,
            phone : values.phone.replace(/-/g, '')
         };

         if (response)
         {
            params = Ext.applyIf(params, response);
         }
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.creatingAccountMsg
         });

         Customer['setCreateAccountUrl']();
         me.updatedDeviceToken = (Genesis.constants.device) ? true : false;
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            params :
            {
               version : Genesis.constants.clientVersion,
               device_pixel_ratio : window.devicePixelRatio,
               user : Ext.encode(params),
               device : Ext.encode(Genesis.constants.device)
            },
            callback : function(records, operation)
            {
               //
               // Login Error, redo login
               //
               if (!operation.wasSuccessful())
               {
               }
               else
               {
                  if (response)
                  {
                     Genesis.db.setLocalDBAttrib('enableFB', true);
                  }
                  me.persistSyncStores();
               }
               Ext.Viewport.setMasked(null);
            }
         });
      }
   },
   onSignIn : function(username, password)
   {
      var me = this;
      //
      // Forced to Login
      //
      if (Ext.Viewport.getMasked() || me._loggingOut || me._loggingIn)
      {
         return;
      }

      //Cleanup any outstanding registrations
      if (Genesis.fn.isNative())
      {
         Genesis.fb.facebook_onLogout(null, Genesis.db.getLocalDB()['currFbId'] > 0);
      }
      var me = this;
      var params =
      {
         version : Genesis.constants.clientVersion,
         device_pixel_ratio : window.devicePixelRatio,
         device : Ext.encode(Genesis.constants.device)
      };

      if (username)
      {
         params = Ext.apply(params,
         {
            email : username,
            password : password
         });
      }
      Customer['setLoginUrl']();
      console.debug("setLoginUrl - Logging in ...");
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.loginMsg
      });
      me.updatedDeviceToken = (Genesis.constants.device) ? true : false;
      Ext.StoreMgr.get('CustomerStore').load(
      {
         params : params,
         jsonData :
         {
         },
         callback : function(records, operation)
         {
            me._loggingIn = false;
            //
            // Login Error, redo login
            //
            if (!operation.wasSuccessful())
            {
               //me.resetView();
               //me.redirectTo('login');
            }
            else
            {
               me.persistSyncStores('CustomerStore');
            }
            Ext.Viewport.setMasked(null);
         }
      });
   },
   onSignInResetSubmit : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('password_reset');
   },
   onSignInSubmit : function(b, e, eOpts, eInfo)
   {
      var signin = this.getSignin();
      var values = signin.getValues();
      var user = Ext.create('Genesis.model.frontend.Signin', values);
      var validateErrors = user.validate();

      if (!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         Ext.device.Notification.show(
         {
            title : 'Sign In',
            message : this.signInFailMsg(label + ' ' + field.getMessage()),
            buttons : ['Dismiss']
         });
      }
      else
      {
         this.onSignIn(values.username, values.password);
      }
   },
   onPasswdReset : function(username)
   {
      var me = this;
      var params =
      {
         device : Ext.encode(Genesis.constants.device)
      };

      if (username)
      {
         params = Ext.apply(params,
         {
            email : username
         });
      }
      Account['setPasswdResetUrl']();
      console.debug("setPasswdResetUrl - Resetting Password ...");
      Account.load(0,
      {
         params : params,
         jsonData :
         {
         },
         callback : function(record, operation)
         {
            //
            // Login Error, redo login
            //
            if (operation.wasSuccessful())
            {
               Ext.device.Notification.show(
               {
                  title : 'Password Reset',
                  message : me.passwdResetSuccessMsg(),
                  buttons : ['OK']
               });
               me.popView();
            }
            Ext.Viewport.setMasked(null);
         }
      });
   },
   onPasswdResetSubmit : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var confirmReset = function()
      {
         var reset = me.getPasswdReset();
         var values = reset.getValues();
         var user = Ext.create('Genesis.model.frontend.Signin', values);
         var validateErrors = user.validate();
         var resetPassword = true;

         if (!validateErrors.isValid())
         {
            validateErrors.each(function(item, index, length)
            {
               if (item.getField() == 'username')
               {
                  var label = reset.query('field[name=username]')[0].getLabel();
                  Ext.device.Notification.show(
                  {
                     title : 'Password Reset',
                     message : me.passwdResetFailMsg(label + ' ' + field.getMessage()),
                     buttons : ['Dismiss']
                  });
                  resetPassword = false;
               }
            }, me);
         }

         if (resetPassword)
         {
            me.onPasswdReset(values.username);
         }
      }
      Ext.device.Notification.show(
      {
         title : 'Password Reset',
         message : this.passwdResetConfirmMsg,
         buttons : ['Confirm', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'confirm')
            {
               Ext.defer(confirmReset, 1);
            }
         }
      });
   },
   onPasswdChange : function(oldpassword, newpassword)
   {
      var me = this;
      var params =
      {
         device : Ext.encode(Genesis.constants.device)
      };

      if (oldpassword && newpassword)
      {
         params = Ext.apply(params,
         {
            old_password : oldpassword,
            new_password : newpassword
         });
      }
      Account['setPasswdChangeUrl']();
      console.debug("setPasswdChangeUrl - Changing Password ...");
      Account.load(0,
      {
         params : params,
         jsonData :
         {
         },
         callback : function(record, operation)
         {
            //
            // Login Error, redo login
            //
            if (operation.wasSuccessful())
            {
               Ext.Viewport.setMasked(null);
               Ext.device.Notification.show(
               {
                  title : 'Password Reset',
                  message : me.passwdChangeSuccessMsg,
                  buttons : ['OK']
               });
            }
         }
      });
   },
   onPasswdChangeSubmit : function(b, e, eOpts, eInfo)
   {
      var change = this.getPasswdChange();
      var values = change.getValues(true);
      var user = Ext.create('Genesis.model.frontend.ChangePassword', values);
      var validateErrors = user.validate();

      if (!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         var message = this.passwdChangeFailMsg(label + ' ' + field.getMessage());
         console.debug(message);
         Ext.device.Notification.show(
         {
            title : 'Password Change',
            message : message,
            buttons : ['Dismiss']
         });
      }
      else
      {
         this.onPasswdChange(values['oldpassword'], values['newpassword']);
      }
   },
   onCreateActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, db = Genesis.db.getLocalDB(), response = db['fbResponse'] || null;
      console.debug("onCreateActivate - fbResponse[" + Ext.encode(response) + "]");
      console.log("enableFB - " + db['enableFB'] + ", enableTwitter - " + db['enableTwitter']);
      me.initializing = true;
      if (response)
      {
         var form = this.getCreateAccount();
         form.setValues(
         {
            facebook : (db['enableFB']) ? 1 : 0,
            twitter : (db['enableTwitter']) ? 1 : 0,
            name : response.name,
            username : response.email
         });
      }
      me.initializing = false;
      //activeItem.createView();
   },
   onCreateDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this, fb = Genesis.fb;
      //console.debug("onCreateDeactivate");
      me.onFbDeactivate();
   },
   updateFBSignUpPopupCallback : function(params, operation)
   {
      var me = this, page = me.getCreateAccount();
      var toggle = (page) ? page.query('togglefield[name=facebook]')[0] : null;

      Ext.Viewport.setMasked(null);
      if ((operation && operation.wasSuccessful()) || (params && (params['type'] != 'timeout')))
      {
         me.updateFBSettings(params);
         if (toggle)
         {
            toggle.originalValue = 1;
            me.onCreateActivate();
         }
      }
      else
      {
         if (toggle)
         {
            toggle.toggle();
         }
         Ext.device.Notification.show(
         {
            title : 'Facebook Connect',
            message : Genesis.fb.fbConnectFailMsg,
            buttons : ['Dismiss']
         });
      }
   },
   onToggleFB : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, fb = Genesis.fb, db = Genesis.db.getLocalDB();

      me.callParent(arguments);
      if (newValue == 1)
      {
      }
      else if (db['enableFB'])
      {
         console.debug("Cancelling Facebook Login ...");
         db = Genesis.db.getLocalDB();
         db['enableFB'] = false;
         db['currFbId'] = 0;
         delete db['fbAccountId'];
         delete db['fbResponse'];
         Genesis.db.setLocalDB(db);

         if (Genesis.fn.isNative())
         {
            Genesis.fb.facebook_onLogout(null, true);
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   loginPage : function()
   {
      this.openPage('login');
   },
   merchantPage : function()
   {
      this.openPage('merchant');
   },
   signInPage : function()
   {
      /*
       *  No automatic login
       var db = Genesis.db.getLocalDB();
       if (db['currFbId'] > 0)
       {
       this.facebookLogin(db['fbResponse']);
       }
       else
       */
      {
         this.setAnimationMode(this.self.animationMode['cover']);
         this.pushView(this.getSignin());
      }
   },
   signInResetPage : function()
   {
      this.setAnimationMode(this.self.animationMode['slide']);
      this.pushView(this.getPasswdReset());
   },
   signInChangePage : function()
   {
      this.setAnimationMode(this.self.animationMode['slide']);
      this.pushView(this.getPasswdChange());
   },
   createAccountPage : function()
   {
      this.setAnimationMode(this.self.animationMode['slide']);
      this.pushView(this.getCreateAccount());
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});

Ext.define('Genesis.model.News',
{
   extend :  Ext.data.Model ,
   id : 'News',
   alternateClassName : 'News',
   config :
   {
      idProperty : 'id',
      fields : ['id', 'item_id', 'title', 'text', 'type', 'item_type', 'photo',
      {
         name : 'created_date',
         type : 'date',
         convert : function(value, format)
         {
            value = Date.parse(value, "yyyy-MM-dd");
            return (value) ? Genesis.fn.convertDateNoTimeNoWeek(value) : null;
         }
      }]
   }
});

Ext.define('Genesis.view.widgets.MerchantAccountPtsItem',
{
   extend :  Ext.dataview.component.DataItem ,
                                              
   xtype : 'merchantaccountptsitem',
   alias : 'widget.merchantaccountptsitem',
   config :
   {
      layout : 'vbox',
      background :
      {
         // Backgrond Image
         cls : 'tbPanel',
         tag : 'background',
         height : window.innerWidth,
         items : [
         // Display Points
         {
            xtype : 'container',
            bottom : 0,
            width : '100%',
            cls : 'container',
            layout : 'hbox',
            defaults :
            {
               flex : 1,
               xtype : 'component'
            },
            items : [
            {
               tag : 'prizepoints',
               tpl : Ext.create('Ext.XTemplate', '<span class="x-badge round {[this.isVisible()]}">✔</span>{prize_points}',
               {
                  isVisible : function()
                  {
                     var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
                     var customer = viewport.getCustomer();
                     return (customer.get('eligible_for_prize') ? '' : 'x-item-hidden');
                  }
               }),
               cls : 'prizephotodesc x-hasbadge'
            },
            {
               tag : 'points',
               tpl : Ext.create('Ext.XTemplate', '<span class="x-badge round {[this.isVisible()]}">✔</span>{points}',
               {
                  isVisible : function()
                  {
                     var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
                     var customer = viewport.getCustomer();
                     return (customer.get('eligible_for_reward') ? '' : 'x-item-hidden');
                  }
               }),
               cls : 'pointsphotodesc x-hasbadge'
            }]
         }]
      },
      winnersCount :
      {
         // -----------------------------------------------------------------------
         // Prizes won by customers!
         // -----------------------------------------------------------------------
         tag : 'prizesWonPanel',
         xtype : 'component',
         cls : 'prizesWonPanel x-list',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<tpl if="this.isVisible(values)">',
	         '<div class="prizeswonphoto">',
   	         '<div class="itemTitle">{[this.getTitle(values)]}</div>',
      	      '<div class="itemDesc">{[this.getDesc(values)]}</div>',
         	'</div>',
         	'<div class="x-list-disclosure"></div>',
         '</tpl>',
         // @formatter:on
         {
            isVisible : function(values)
            {
               return true;
            },
            getTitle : function(values)
            {
               var jackpot = ' Jackpot' + ((values['prize_jackpots'] > 1) ? 's' : '');
               var msg = ((values['prize_jackpots'] > 0) ? values['prize_jackpots'] + jackpot + ' won this month' : 'Be our first winner this month!');
               /*
                msg += '<img style="width:1em;float:right;"' + //
                ' src="' + Genesis.constants.getIconPath('miscicons', 'disclose') + '" />';
                */

               return msg;
            },
            getDesc : function(values)
            {
               return 'Check out our winners!';
            }
         })
      },
      badgeProgress :
      {
         // -----------------------------------------------------------------------
         // Prizes won by customers!
         // -----------------------------------------------------------------------
         tag : 'badgeProgressPanel',
         xtype : 'component',
         cls : 'badgeProgressPanel',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<tpl if="this.isVisible(values)">',
            '<div class="badgephoto">',
               '<img class="itemPhoto" src="{[this.getPhoto(values)]}"/>',
               '<div class="itemTitle">{[this.getTitle(values)]}</div>',
               '<div class="itemDesc">',
                  '<div class="progressBarContainer">',
                     '<div class="progressBar" style="{[this.getProgress(values)]}"></div>',
                     '<div class="progressBarValue">{[this.getDesc(values)]}</div>',
                  '</div>',
                  '{[this.cleanup(values)]}',
               '</div>',
            '</div>',
         '</tpl>',
         // @formatter:on
         {
            //
            // Hide Points if we are not a customer of the Merchant
            //
            isVisible : function(values)
            {
               var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
               var customer = viewport.getCustomer();
               var valid = false;

               if (customer)
               {
                  valid = Customer.isValid(customer.getId());
                  values['_customer'] = (valid) ? Ext.StoreMgr.get('CustomerStore').getById(customer.getId()) : null;
               }

               return valid;
            },
            getPhoto : function(values)
            {
               var bstore = Ext.StoreMgr.get('BadgeStore');
               if (bstore)
               {
                  values['_badgeType'] = bstore.getById(values['_customer'].get('badge_id')).get('type');

                  return Genesis.view.client.Badges.getPhoto(values['_badgeType'], 'thumbnail_medium_url');
               }
            },
            getTitle : function(values)
            {
               var msg = ('You are our <span class ="badgehighlight">' + //
               values['_badgeType'].display_value.toUpperCase() + '</span>');
               /*
                return msg += '<img style="width:1em;float:right;"' + //
                ' src="' + Genesis.constants.getIconPath('miscicons', 'disclose') + '" />';
                */
               return msg;

            },
            getProgress : function(values)
            {
               var customer = values['_customer'];
               var nextBadge = values['_nextBadge'] = Ext.StoreMgr.get('BadgeStore').getById(customer.get('next_badge_id'));
               var nvisit = values['_nvisit'] = nextBadge.get('visits');
               var tvisit = customer.get('next_badge_visits');

               return ('width:' + (tvisit / nvisit * 100) + '%;');
            },
            // Updated Automatically when the Customer\'s metadata is updated
            getDesc : function(values)
            {
               var customer = values['_customer'];
               var nvisit = values['_nvisit'];
               var tvisit = customer.get('next_badge_visits');
               var nextBadge = values['_nextBadge'];

               return ((nvisit - tvisit) + ' more visit' + (((nvisit - tvisit) > 1) ? 's' : '') + ' to be our ' + //
               ((nextBadge) ? nextBadge.get('type').display_value.toUpperCase() : 'None') + '!');
            },
            cleanup : function(values)
            {
               delete values['_customer'];
               delete values['_nextBadge'];
               delete values['_badgeType'];
               delete values['_nvisit'];
            }
         })
      },
      dataMap :
      {
         getBackground :
         {
            setData : 'background'
         },
         getWinnersCount :
         {
            setData : 'winnersCount'
         },
         getBadgeProgress :
         {
            setData : 'badgeProgress'
         }
      },
      listeners : [
      {
         element : 'element',
         delegate : 'div.prizephotodesc',
         event : 'tap',
         fn : "onPrizesButtonTap"
      },
      {
         element : 'element',
         delegate : 'div.pointsphotodesc',
         event : 'tap',
         fn : "onRedemptionsButtonTap"
      },
      {
         'painted' : function(c, eOpts)
         {
            //console.debug("MerchantAccountPtsItem - painted[" + c.id + "]");
         }
      }]
   },
   initialize : function()
   {
      var bg = this.query('container[tag=background]')[0];
      bg.setHeight(window.innerWidth);
   },
   applyBackground : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Container, this.getBackground());
   },
   updateBackground : function(newBackground, oldBackground)
   {
      if (newBackground)
      {
         this.add(newBackground);
      }

      if (oldBackground)
      {
         this.remove(oldBackground);
      }
   },
   setDataBackground : function(data)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var customer = viewport.getCustomer();
      var venue = viewport.getVenue();
      var merchant = venue.getMerchant();
      var venueId = venue.getId();
      var cvenue = viewport.getCheckinInfo().venue;
      var customerId = customer.getId();
      var features_config = merchant.get('features_config');

      //var crecord = cstore.getById(data.Merchant['merchant_id']);
      var bg = this.query('container[tag=background]')[0];
      var points = this.query('component[tag=points]')[0];
      var prizepoints = this.query('component[tag=prizepoints]')[0];

      // Update Background Photo
      bg.setStyle(
      {
         'background-image' : 'url(' + data.Merchant['alt_photo']['thumbnail_large_url'] + ')'
      });
      //console.debug("BgImage=[" + Ext.encode(data) + "]");

      //
      // Hide Points if we are not a customer of the Merchant
      //
      bg.getItems().items[0].show();
      if (Customer.isValid(customerId) && Ext.StoreMgr.get('CustomerStore').getById(customerId))
      {
         //Update Points
         points.setData(customer.getData());
         prizepoints.setData(customer.getData());
      }
      else
      {
         //Update Points
         points.setData(
         {
            "points" : "---"
         });
         prizepoints.setData(
         {
            "prize_points" : "---"
         });
      }
      prizepoints.setVisibility(!features_config || (features_config && features_config['enable_prizes']));

   },
   applyWinnersCount : function(config)
   {
      if (Ext.StoreMgr.get('BadgeStore'))
      {
         return Ext.factory(Ext.apply(config,
         {
         }), Ext.Container, this.getWinnersCount());
      }
      return new Ext.Container();
   },
   updateWinnersCount : function(newWinnersCount, oldWinnersCount)
   {
      if (newWinnersCount)
      {
         this.add(newWinnersCount);
      }

      if (oldWinnersCount)
      {
         this.remove(oldWinnersCount);
      }
   },
   setDataWinnersCount : function(data)
   {
      var prizePanel = this.query('component[tag=prizesWonPanel]')[0];
      if (prizePanel)
      {
         prizePanel.setData(data);
      }
   },
   applyBadgeProgress : function(config)
   {
      if (Ext.StoreMgr.get('BadgeStore'))
      {
         return Ext.factory(Ext.apply(config,
         {
         }), Ext.Container, this.getBadgeProgress());
      }
      return new Ext.Container();
   },
   updateBadgeProgress : function(newBadgeProgress, oldBadgeProgress)
   {
      if (newBadgeProgress)
      {
         this.add(newBadgeProgress);
      }

      if (oldBadgeProgress)
      {
         this.remove(oldBadgeProgress);
      }
   },
   setDataBadgeProgress : function(data)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var badgeProgress = this.query('component[tag=badgeProgressPanel]')[0];
      var valid = Customer.isValid(viewport.getCustomer().getId());

      if (badgeProgress)
      {
         if (valid)
         {
            badgeProgress.setData(data);
         }
         badgeProgress[ (valid) ? 'show' : 'hide']();
      }
   },
   /**
    * Updates this container's child items, passing through the dataMap.
    * @param newRecord
    * @private
    */
   updateRecord : function(newRecord)
   {
      if (!newRecord)
      {
         return;
      }

      var me = this, dataview = me.config.dataview, data = dataview.prepareData(newRecord.getData(true), dataview.getStore().indexOf(newRecord), newRecord), items = me.getItems(), item = items.first(), dataMap = me.getDataMap(), componentName, component, setterMap, setterName;

      if (!item)
      {
         return;
      }
      for (componentName in dataMap)
      {
         setterMap = dataMap[componentName];
         component = me[componentName]();
         if (component)
         {
            for (setterName in setterMap)
            {
               if (component[setterName])
               {
                  switch (setterMap[setterName])
                  {
                     //component[setterName](data);
                     case 'background':
                        me.setDataBackground(data);
                        break;
                     case 'badgeProgress' :
                        me.setDataBadgeProgress(data);
                        break;
                     case 'winnersCount':
                        me.setDataWinnersCount(data);
                        break;
                     default :
                        component[setterName](data[setterMap[setterName]]);
                        break;
                  }
               }
            }
         }
      }
      // Bypassing setter because sometimes we pass the same object (different properties)
      item.updateData(data);
   },
   onPrizesButtonTap : function()
   {
      var me = this;
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      if (viewport.onPrizesButtonTap)
      {
         viewport.self.playSoundFile(viewport.sound_files['clickSound']);
         viewport.onPrizesButtonTap();
      }
   },
   onRedemptionsButtonTap : function()
   {
      var me = this;
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      if (viewport.onRedemptionsButtonTap)
      {
         viewport.self.playSoundFile(viewport.sound_files['clickSound']);
         viewport.onRedemptionsButtonTap();
      }
   }
});

Ext.define('Genesis.view.client.MerchantAccount',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                                                  
   alias : 'widget.clientmerchantaccountview',
   config :
   {
      tag : 'merchantMain',
      cls : 'merchantMain viewport',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            iconCls : 'maps',
            tag : 'mapBtn'
         }
         /*,{
          align : 'right',
          hidden : true,
          tag : 'checkin',
          iconCls : 'checkin'
          }*/]
      }),
      // -----------------------------------------------------------------------
      // Toolbar
      // -----------------------------------------------------------------------

      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         tag : 'navigationBarBottom',
         xtype : 'tabbar',
         ui : 'light',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         scrollable :
         {
            direction : 'horizontal',
            indicators : false
         },
         defaults :
         {
            iconMask : true,
            iconAlign : 'top'
         },
         items : [
         {
            xtype : 'spacer'
         },
         //
         // Left side Buttons
         //
         {
            iconCls : 'home',
            tag : 'home',
            title : 'Home'
         },
         /*
          {
          //iconCls : 'prizes',
          //icon : '',
          tag : 'prizes',
          iconMask : false,
          badgeCls : 'x-badge round',
          title : 'Prizes'
          },
          */
         {
            iconCls : 'rewards',
            tag : 'rewards',
            title : 'Earn Pts'
         },
         //
         // Middle Button
         //
         /*
          {
          xtype : 'spacer'
          },
          */
         {
            iconCls : 'challenges',
            tag : 'challenges',
            title : 'Challenges'
         },
         /*
          //
          // Right side Buttons
          //
          {
          xtype : 'spacer'
          },
          {
          iconCls : 'redeem',
          badgeCls : 'x-badge round',
          iconMask : false,
          tag : 'redemption',
          title : 'Rewards'
          },
          */
         {
            iconCls : 'tocheckedinmerch',
            tag : 'main',
            title : 'Meal Stop'
         },
         /*
          {
          iconCls : 'explore',
          tag : 'browse',
          title : 'Explore'
          }
          */
         {
            iconCls : 'explore',
            tag : 'checkin',
            title : 'Explore'
         },
         {
            xtype : 'spacer'
         }]
      }],
      listeners : [
      {
         element : 'element',
         delegate : "div.badgephoto",
         event : "tap",
         fn : "onBadgeTap"
      },
      {
         element : 'element',
         delegate : "div.prizeswonphoto",
         event : "tap",
         fn : "onJackpotWinnersTap"
      },
      {
         element : 'element',
         delegate : "div.prizesWonPanel div.x-list-disclosure",
         event : "tap",
         fn : "onJackpotWinnersTap"
      }]
   },
   disableAnimation : true,
   loadingText : 'Loading ...',
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function(activeItem)
   {
      if (activeItem.isXType('clientcheckinexploreview', true) || activeItem.isXType('clientmainpageview', true))
      {
         console.debug("Merchant Account Page cleanup");
         this.removeAll(true);
      }
      this.callParent(arguments);
   },
   showView : function()
   {
      this.callParent(arguments);
      this.query('tabbar')[0].show();
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
      var feedContainer = this.query('container[tag=feedContainer]')[0];
      if (feedContainer)
      {
         feedContainer[(Ext.StoreMgr.get('NewsStore').getRange().length > 0) ? 'show' : 'hide']();
      }
   },
   createView : function()
   {
      var me = this;

      if (!me.callParent(arguments))
      {
         return;
      }

      // -----------------------------------------------------------------------
      // Merchant Photos and Customer Points
      // -----------------------------------------------------------------------
      me.getPreRender().push(Ext.create('Ext.dataview.DataView',
      {
         tag : 'tbPanel',
         xtype : 'dataview',
         store : 'MerchantRenderStore',
         useComponents : true,
         scrollable : undefined,
         minHeight : window.innerWidth,
         defaultType : 'merchantaccountptsitem',
         defaultUnit : 'em',
         margin : '0 0 0.7 0'
      }));

      // -----------------------------------------------------------------------
      // What can I get ?
      // -----------------------------------------------------------------------
      if (me.renderFeed)// && (Ext.StoreMgr.get('NewsStore').getCount() > 0))
      {
         me.getPreRender().push(Ext.create('Ext.Container',
         {
            xtype : 'container',
            tag : 'feedContainer',
            layout :
            {
               type : 'vbox',
               align : 'stretch',
               pack : 'start'
            },
            items : [
            {
               xtype : 'dataview',
               scrollable : undefined,
               store : 'NewsStore',
               cls : 'feedPanel',
               tag : 'feedPanel',
               items : [
               {
                  docked : 'top',
                  xtype : 'toolbar',
                  ui : 'dark',
                  cls : 'feedPanelHdr',
                  centered : false,
                  items : [
                  {
                     xtype : 'title',
                     title : 'What\'s going on?'
                  },
                  {
                     xtype : 'spacer'
                  }]
               }],
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="itemWrapper" style="position:relative;{[this.getDisclose(values)]}">',
                  '<div class="photo">',
                     '<img src="{[this.getIcon(values)]}"/>',
                  '</div>',
                  '<div class="itemTitle">{[this.getTitle(values)]}</div>',
                  '<div class="date">{[this.getStartDate(values)]}</div>',
                  '<div class="itemDesc">{[this.getDesc(values)]}</div>',
                  '<tpl if="this.showImage(values)">',
                     '<div class="x-mask x-mask-transparent promoImage">',
                        '<img src="{[this.getPhoto(values)]}" style="{[this.getWidth()]}" onload="Ext.removeNode(this.nextSibling);"/>',
                        Genesis.constants.spinnerDom,
                     '</div>',
                     '<img class="promoImageAnchor" src="{[this.getPhoto(values)]}"/>',
                  '</tpl>',                  
               '</div>',
                // @formatter:on
               {
                  getDisclose : function(values)
                  {
                     switch (values['type'])
                     {
                        case 'vip' :
                        {
                           values['disclosure'] = false;
                           break;
                        }
                     }
                     return ((values['disclosure'] === false) ? 'padding-right:0;' : '');
                  },
                  getIcon : function(values)
                  {
                     return me.self.getPhoto(
                     {
                        value : values['type']
                     });
                  },
                  showImage : function(values)
                  {
                     return (values.photo && values.photo['thumbnail_large_url']);
                  },
                  getPhoto : function(values)
                  {
                     return (values.photo['thumbnail_large_url']);
                  },
                  getStartDate : function(values)
                  {
                     return ((values['created_date']) ? 'Posted on ' + values['created_date'] : 'No Posted Date');
                  },
                  getTitle : function(values)
                  {
                     return ((values['title']) ? values['title'] : 'Mobile Promotion');
                  },
                  getDesc : function(values)
                  {
                     return values['text'];
                  },
                  getWidth : function()
                  {
                     var fn = Genesis.fn;
                     var width = document.body.clientWidth + fn.calcPx(-1 * 2 * 0.50 * 0.8, 1);
                     return ('width:' + fn.addUnit(width) + ';');
                  }
               }),
               onItemDisclosure : Ext.emptyFn
            }]
         }));
      };

      me.setPreRender(me.getPreRender().concat([
      // -----------------------------------------------------------------------
      // Merchant Description Panel
      // -----------------------------------------------------------------------
      Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'descContainer',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'dataview',
            store : 'MerchantRenderStore',
            scrollable : undefined,
            cls : 'descPanel',
            tag : 'descPanel',
            items : [
            {
               docked : 'top',
               xtype : 'toolbar',
               cls : 'descPanelHdr',
               ui : 'light',
               centered : false,
               items : [
               {
                  xtype : 'title',
                  title : 'About Us'
               },
               {
                  xtype : 'spacer'
               }]
            }],
            itemTpl : Ext.create('Ext.XTemplate', '{[this.getDesc(values)]}',
            {
               getDesc : function(values)
               {
                  return values['description'];
               }
            })
         }]
      })]));
   },
   onBadgeTap : function(b, e, eOpts)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      this.fireEvent('badgeTap');
   },
   onJackpotWinnersTap : function(b, e, eOpts)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      this.fireEvent('jackpotWinnersTap');
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         if (!type.value)
         {
            return Genesis.constants.getIconPath('miscicons', 'pushnotification');
         }
         else
         {
         }
      }
   }
});

Ext.define('Genesis.view.widgets.MerchantDetailsItem',
{
   extend :  Ext.dataview.component.DataItem ,
                                
   xtype : 'merchantdetailsitem',
   alias : 'widget.merchantdetailsitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'stretch'
      },
      image :
      {
         docked : 'left',
         cls : 'photo',
         tpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>',
         {
            getPhoto : function(values)
            {
               return values.Merchant['photo']['thumbnail_large_url'];
            }
         })
      },
      address :
      {
         flex : 1,
         // @formatter:off
         tpl : Ext.create('Ext.XTemplate',
         '<div class="merchantDetailsWrapper">' +
            '<div class="itemTitle">{name}</div>' +
            '<div class="itemDesc">{[this.getAddress(values)]}</div>' +
         '</div>',
         // @formatter:on
         {
            getAddress : function(values)
            {
               return (values.address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",</br>" + values.zipcode);
            }
         }),
         cls : 'address'
      },
      dataMap :
      {
         getImage :
         {
            setData : 'image'
         },
         getAddress :
         {
            setData : 'address'
         }
      }
   },
   applyImage : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getImage());
   },
   updateImage : function(newImage, oldImage)
   {
      if (newImage)
      {
         this.add(newImage);
      }

      if (oldImage)
      {
         this.remove(oldImage);
      }
   },
   applyAddress : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getAddress());
   },
   updateAddress : function(newAddress, oldAddress)
   {
      if (newAddress)
      {
         this.add(newAddress);
      }

      if (oldAddress)
      {
         this.remove(oldAddress);
      }
   },
   updateRecord : function(newRecord)
   {
      if (!newRecord)
      {
         return;
      }

      var me = this, dataview = me.config.dataview, data = dataview.prepareData(newRecord.getData(true), dataview.getStore().indexOf(newRecord), newRecord), items = me.getItems(), item = items.first(), dataMap = me.getDataMap(), componentName, component, setterMap, setterName;

      if (!item)
      {
         return;
      }
      for (componentName in dataMap)
      {
         setterMap = dataMap[componentName];
         component = me[componentName]();
         if (component)
         {
            for (setterName in setterMap)
            {
               if (component[setterName])
               {
                  switch (setterMap[setterName])
                  {
                     case 'image':
                     case 'address':
                        component[setterName](data);
                        break;
                     default :
                        component[setterName](data[setterMap[setterName]]);
                        break;
                  }
               }
            }
         }
      }
      // Bypassing setter because sometimes we pass the same object (different properties)
      item.updateData(data);
   }
});

Ext.define('Genesis.view.client.MerchantDetails',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                                
   alias : 'widget.clientmerchantdetailsview',
   config :
   {
      cls : 'merchantDetails viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      defaults :
      {
         cls : 'separator'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'right',
            iconCls : 'share',
            tag : 'shareBtn',
            handler : function()
            {
               if (!this.actions)
               {
                  this.actions = Ext.create('Ext.ActionSheet',
                  {
                     hideOnMaskTap : false,
                     defaults :
                     {
                        defaultUnit : 'em',
                        margin : '0 0 0.5 0',
                        xtype : 'button'
                     },
                     items : [
                     {
                        text : 'Refer-A-Friend',
                        ui : 'action',
                        //iconCls : 'mail',
                        tag : 'emailShareBtn',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     },
                     {
                        text : 'Post on Facebook',
                        tag : 'fbShareBtn',
                        ui : 'fbBlue',
                        //iconCls : 'facebook',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     },
                     {
                        margin : '0.5 0 0 0',
                        text : 'Cancel',
                        iconMaskCls : 'dummymask',
                        ui : 'cancel',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     }]
                  });
                  Ext.Viewport.add(this.actions);
               }
               this.actions.show();
            }
         }]
      })]
   },
   renderView : function(map)
   {
      var cntlr = _application.getController('client.Merchants');
      var size = map.getSize();
      var padding = Genesis.fn.calcPx(0.7, 1);
      map.setSize(size.width, size.height - (1 * 12));
      var queryString = Ext.Object.toQueryString(Ext.apply(
      {
         zoom : 15,
         scale : window.devicePixelRatio,
         maptype : 'roadmap',
         sensor : false,
         size : size.width + 'x' + (size.height - (1 * padding))
      }, cntlr.markerOptions));
      var string = Ext.String.urlAppend(cntlr.self.googleMapStaticUrl, queryString);
      Ext.getCmp(map.observableId.split(map.observableIdPrefix)[1]).setData(
      {
         width : size.width,
         height : size.height - (1 * padding),
         photo : string
      });
   },
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         me.renderView(me.query('component[tag=map]')[0]);
         return;
      }

      me.setPreRender(me.getPreRender().concat([Ext.create('Ext.dataview.DataView',
      {
         xtype : 'dataview',
         cls : 'separator',
         tag : 'details',
         useComponents : true,
         defaultType : 'merchantdetailsitem',
         scrollable : undefined,
         store : 'MerchantRenderStore'
      }),
      /*
       Ext.create('Ext.Map,',
       {
       xtype : 'map',
       tag : 'map',
       mapOptions :
       {
       zoom : 15//,
       //mapTypeId : window.google.maps.MapTypeId.ROADMAP
       },
       useCurrentLocation : false,
       //store : 'VenueStore',
       flex : 1
       }),
       */
      Ext.create('Ext.Component',
      {
         xtype : 'component',
         tag : 'map',
         flex : 1,
         cls : 'separator_pad gmap',
         defaultUnit : 'em',
         listeners :
         {
            'painted' : function(c)
            {
               me.renderView(c);
            }
         },
         tpl : Ext.create('Ext.XTemplate', '<img height="{height}" width="{width}" src="{photo}"/>')
      })]));

      me.query('button[tag=shareBtn]')[0].setHidden(_build == 'MobileWebClient');
   }
});

Ext.define('Genesis.controller.client.Merchants',
{
   extend :  Genesis.controller.ControllerBase ,
                                 
   inheritableStatics :
   {
      googleMapStaticUrl : 'http://maps.googleapis.com/maps/api/staticmap'
   },
   xtype : 'clientmerchantsCntlr',
   config :
   {
      models : ['News', 'Venue'],
      routes :
      {
         'venue/:id/:id' : 'mainPage',
         'venue/:id/:id/:id' : 'backToMainPage',
         'venueDetails' : 'venueDetails'
      },
      refs :
      {
         main :
         {
            selector : 'clientmerchantaccountview',
            autoCreate : true,
            xtype : 'clientmerchantaccountview'
         },
         merchantMain : 'clientmerchantaccountview container[tag=merchantMain]',
         tbPanel : 'clientmerchantaccountview dataview[tag=tbPanel]',
         feedContainer : 'clientmerchantaccountview container[tag=feedContainer]',
         descContainer : 'clientmerchantaccountview container[tag=descContainer]',
         descPanel : 'clientmerchantaccountview container[tag=descPanel]',
         //address : 'clientmerchantaccountview component[tag=address]',
         //stats : 'clientmerchantaccountview formpanel[tag=stats]',
         merchantDetails :
         {
            selector : 'clientmerchantdetailsview',
            autoCreate : true,
            xtype : 'clientmerchantdetailsview'
         },
         mapBtn : 'viewportview button[tag=mapBtn]',
         shareBtn : 'viewportview button[tag=shareBtn]',
         //checkinBtn : 'viewportview button[tag=checkin]',
         mainBtn : 'clientmerchantaccountview tabbar[tag=navigationBarBottom] button[tag=main]',
         /*
          prizesBtn : 'clientmerchantaccountview tabbar[tag=navigationBarBottom] button[tag=prizes]',
          redeemBtn : 'clientmerchantaccountview tabbar[tag=navigationBarBottom] button[tag=redemption]',
          */
         prizesBtn : 'merchantaccountptsitem component[tag=prizepoints]',
         redeemBtn : 'merchantaccountptsitem component[tag=points]',
         merchantTabBar : 'clientmerchantaccountview tabbar'
      },
      control :
      {
         main :
         {
            showView : 'onMainShowView',
            activate : 'onMainActivate',
            deactivate : 'onMainDeactivate',
            jackpotWinnersTap : 'onJackpotWinnersTap',
            badgeTap : 'onBadgeTap'
         },
         mapBtn :
         {
            tap : 'onMapBtnTap'
         },
         'clientmerchantaccountview button[ui=orange]' :
         {
            tap : 'onMerchantAccountRewardsTap'
         },
         'clientmerchantaccountview list' :
         {
            select : 'onMainSelect',
            disclose : 'onMainDisclose'
         },
         /*
          checkinBtn :
          {
          tap : 'onCheckinTap'
          },
          */
         merchantTabBar :
         {
            tabchange : 'onTabBarTabChange'
         },
         //
         //  Merchant Details Page
         //
         merchantDetails :
         {
            showView : 'onDetailsShowView',
            activate : 'onDetailsActivate',
            deactivate : 'onDetailsDeactivate'
         },
         'clientmerchantdetailsview map' :
         {
            maprender : 'onMapRender'
         },
         'clientmerchantdetailsview component[tag=map]' :
         {
            // Goto CheckinMerchant.js for "painted" support
            //painted : 'onMapPainted'
         }
      },
      listeners :
      {
         'backToMain' : 'onBackToCheckIn'
      }
   },
   checkinFirstMsg : 'Please Check-in before redeeming rewards',
   init : function()
   {
      var me = this;
      //
      // Clears all Markers on Google Map
      //
      me.markersArray = [];
      if (window.google && window.google.maps && window.google.maps.Map)
      {
         google.maps.Map.prototype.clearOverlays = function()
         {
            if (me.markersArray)
            {
               for (var i = 0; i < me.markersArray.length; i++)
               {
                  me.markersArray[i].setMap(null);
               }
            }
         }
      }
      else
      {
         console.debug("Google Maps API cannot be instantiated");
      }

      //
      // Store storing the Customer's Eligible Rewards at a Venue
      // Used during Checkin
      //
      Ext.regStore('NewsStore',
      {
         model : 'Genesis.model.News',
         autoLoad : false
      });

      //
      // Store used for rendering purposes
      //
      Ext.regStore('MerchantRenderStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });

      me.callParent(arguments);

      //
      // Preloading Pages to memory
      //
      me.getMain();

      backBtnCallbackListFn.push(function(activeItem)
      {
         if (activeItem == me.getMain())
         {
            var viewport = me.getViewPortCntlr();
            me.self.playSoundFile(viewport.sound_files['clickSound']);
            me.redirectTo('checkin');
            return true;
         }
         return false;
      });

      Ext.Viewport.on('orientationchange', function(v, newOrientation, width, height, eOpts)
      {
         //
         // Redraw Screen
         //
         var mainPage = me.getMain(), vport = me.getViewport(), detailsPage = me.getMerchantDetails();
         if (mainPage == vport.getActiveItem())
         {
            me.refreshPage(mainPage);
         }
         else if (detailsPage == vport.getActiveItem())
         {
            me.refreshPage(detailsPage);
         }
      });
      console.log("Merchants Client Init");
   },
   // --------------------------------------------------------------------------
   // Merchant Details Page
   // --------------------------------------------------------------------------
   onActivateCommon : function(map, gmap)
   {
      var gm = (window.google && window.google.maps && window.google.maps.Marker) ? window.google.maps : null;
      if (gmap && gm)
      {
         map.getMap().clearOverlays();
         this.marker = new gm.Marker(Ext.apply(this.markerOptions,
         {
            map : gmap
         }));
         map.setMapCenter(this.latLng);
      }
      else
      //if(!gm)
      {
         //this.onMapWidthChange(map);
         //console.debug("Cannot load Google Maps");
      }
   },
   onDetailsShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         var monitors = this.getEventDispatcher().getPublishers()['elementPaint'].monitors;
         var map = activeItem.query('component[tag=map]')[0];

         console.debug("Refreshing MerchantDetails ...");
         activeItem.query('dataview[tag=details]')[0].refresh();
         monitors[map.element.getId()].onElementPainted(
         {
            animationName : 'x-paint-monitor-helper'
         });

         //activeItem.renderView(map);
      }
   },
   onDetailsActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var venue = this.getViewPortCntlr().getVenue();

      // Show Share Icon
      this.getShareBtn().show();
      //this.getMainBtn().hide();

      // Update TitleBar
      activeItem.query('titlebar')[0].setTitle(venue.get('name'));

      //var map = page.query('component[tag=map]')[0];
      //var map = page.query('map')[0];

      //this.onActivateCommon(map, map.getMap());
      //this.onActivateCommon(map, null);

      //activeItem.createView();
   },
   onDetailsDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      //this.getShareBtn().hide();
   },
   onMapRender : function(map, gmap, eOpts)
   {
      //this.onActivateCommon(map, gmap);
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Merchant Account Page
   // --------------------------------------------------------------------------
   checkInAccount : function()
   {
      var me = this, page = me.getMainPage();

      //
      // Force Page to refresh
      //
      if (page == vport.getActiveItem())
      {
         me.refreshPage(page);
      }
      else
      {
         var viewport = me.getViewPortCntlr(), venue = viewport.getVenue(), info = viewport.getCheckinInfo();

         console.debug("Going back to Checked-In Merchant Home Account Page ...");
         me.resetView();
         me.redirectTo('venue/' + info.venue.getId() + '/' + info.customer.getId());
      }
   },
   onMainShowView : function(activeItem)
   {
      var me = this;

      if (Ext.os.is('Android'))
      {
         console.debug("Refreshing MerchantRenderStore ...");
         var monitors = this.getEventDispatcher().getPublishers()['elementPaint'].monitors;

         activeItem.query('dataview[tag=tbPanel]')[0].refresh();
         var feedPanel = activeItem.query('dataview[tag=feedPanel]')[0];
         if (feedPanel)
         {
            feedPanel.refresh();
         }
         activeItem.query('dataview[tag=descPanel]')[0].refresh();

         monitors[activeItem.element.getId()].onElementPainted(
         {
            animationName : 'x-paint-monitor-helper'
         });
      }

      //
      // Set the initial page location to show to user
      //
      var feedContainer = me.getFeedContainer(), scroll = activeItem.getScrollable();

      if (!activeItem.promotion || !feedContainer || !feedContainer.element)
      {
         scroll.getScroller().scrollTo(0, 0);
      }
      else
      {
         //
         // Wait for rendering of the page to complete
         //
         Ext.defer(function()
         {
            scroll.getScroller().scrollBy(0, feedContainer.element.getY(), true);
            console.debug("Located the latest Promotional Message Offset[" + feedContainer.element.getY() + "]");
            delete activeItem.promotion;
         }, 3 * 1000, me);
      }
   },
   onMainActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      console.debug("Merchant Account Activate");
      var me = this;
      var viewport = me.getViewPortCntlr();
      var vrecord = viewport.getVenue();
      var crecord = viewport.getCustomer();
      var mrecord = vrecord.getMerchant();
      var customerId = crecord.getId();
      var venueId = vrecord.getId();
      var merchantId = mrecord.getId();

      var cvenue = viewport.getCheckinInfo().venue;
      var checkedIn = (cvenue != null);
      var checkedInMatch = (checkedIn && (cvenue.getId() == venueId));

      //me.getDescPanel().setData(vrecord);
      //me.getDescContainer().show();

      var rstore = Ext.StoreMgr.get('MerchantRenderStore'), cestore = Ext.StoreMgr.get('CheckinExploreStore');
      //if (rstore.getRange()[0] != vrecord)
      {
         //
         // Sync CheckinExplore with Venue object value
         //
         var vrec = cestore.getById(vrecord.getId());
         if (vrec)
         {
            vrec.set('prize_jackpots', vrecord.get('prize_jackpots'));
         }
         rstore.setData(vrecord);
         //
         // Update Customer Statistics
         // in case venue object was never updated ...
         //
         me.onCustomerRecordUpdate(crecord);
      }
      console.debug("Updated Merchant Account Info");
      //
      // Main Menu button
      //
      activeItem.showMainBtn = (checkedIn && !checkedInMatch);
      //
      // CheckIn button
      //
      //activeItem.showCheckinBtn = (!checkedIn || !checkedInMatch);
      //
      // Either we are checked-in or
      // customer exploring a venue they checked-in in the past ...
      //
      if (checkedInMatch)
      {
         activeItem.renderFeed = true;
         //me.getAddress().hide();
         //me.getStats().show();
         console.debug("Merchant Checkin Mode");
      }
      //
      // Explore Mode
      //
      else
      {
         activeItem.renderFeed = me.showFeed;
         //me.getAddress().setData(vrecord.getData(true));
         //me.getAddress().show();
         //me.getStats().hide();
         console.debug("Merchant Explore Mode");
      }
      //page.createView();
      var feedContainer = me.getFeedContainer();
      if (feedContainer)
      {
         feedContainer[(activeItem.renderFeed && (Ext.StoreMgr.get('NewsStore').getCount() > 0)) ? 'show' : 'hide']();
      }

      //me.getCheckinBtn()[(activeItem.showCheckinBtn) ? 'show':'hide']();
      me.getMainBtn()[(activeItem.showMainBtn) ? 'show':'hide']();

      var prizeBtn = me.getPrizesBtn(), features_config = mrecord.get('features_config');
      if (prizeBtn)
      {
         prizeBtn.setVisibility(!features_config || (features_config && features_config['enable_prizes']));
      }

      // Update TitleBar
      var bar = activeItem.query('titlebar')[0];
      bar.setTitle(' ');
      Ext.defer(function()
      {
         // Update TitleBar
         bar.setTitle(vrecord.get('name'));
      }, 1, me);
   },
   onMainDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
         //activeItem.getInnerItems()[i].setVisibility(false);
      }
      //this.getCheckinBtn().hide();
   },
   onMainDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();

      //me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (!cvenue || !venue || (venue.getId() != cvenue.getId()))
      {
         Ext.device.Notification.show(
         {
            title : 'Rewards',
            message : me.checkinFirstMsg,
            buttons : ['Dismiss']
         });
         return;
      }
      switch (record.get('reward_type'))
      {
         case 'vip' :
         {
            break;
         }
         default:
            var app = me.getApplication();
            //
            // To-do : Depending on what to redeem
            //
            var controller = app.getController('client.Prizes');
            var rstore = Ext.StoreMgr.get('RedeemStore');

            record = rstore.getById(record.get('reward_id'));
            controller.fireEvent('showredeemitem', record);
            break;
      }
   },
   onMainSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onMainDisclose(d, model);
      return false;
   },
   onCustomerRecordUpdate : function(customer)
   {
      var me = this;
      var rstore = Ext.StoreMgr.get('MerchantRenderStore');
      if (rstore && (rstore.getCount() > 0))
      {
         //
         // Udpate MerchantRenderStore when CustomerStore is updated
         //
         if (rstore && rstore.getRange()[0].getMerchant().getId() == customer.getMerchant().getId())
         {
            var prize = me.getPrizesBtn(), redeem = me.getRedeemBtn();
            var dom;
            if (prize)
            {
               //me.getPrizesBtn().setBadgeText(customer.get('eligible_for_prize') ? '✔' : null);
               dom = Ext.DomQuery.select('span', prize.element.dom)[0];
               if (dom)
               {
                  Ext.fly(dom)[customer.get('eligible_for_prize') ? 'removeCls' : 'addCls']("x-item-hidden");
               }
            }
            if (redeem)
            {
               //me.getRedeemBtn().setBadgeText(customer.get('eligible_for_reward') ? '✔' : null);
               dom = Ext.DomQuery.select('span', redeem.element.dom)[0];
               if (dom)
               {
                  Ext.fly(dom)[customer.get('eligible_for_reward') ? 'removeCls' : 'addCls']("x-item-hidden");
               }
            }
            //rstore.fireEvent('refresh', rstore, rstore.data);
         }
      }
   },
   onCheckinTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('client.Checkins');
      //controller.setPosition(position);
      controller.fireEvent('checkin');
   },
   onBackToCheckIn : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var cinfo = viewport.getCheckinInfo();
      var app = me.getApplication();
      var ccntlr = app.getController('client.Checkins');

      var ccustomer = cinfo.customer;
      var cvenue = cinfo.venue;
      var cmetaData = cinfo.metaData;

      if (venue.getId() != cvenue.getId())
      {
         console.debug("Update current Venue to be Checked-In Merchant Account ...");

         // Restore Merchant Info
         ccntlr.fireEvent('setupCheckinInfo', 'checkin', cvenue, ccustomer, cmetaData);
         me.fireEvent('updatemetadata', cmetaData);
      }

      me.checkInAccount();
   },
   onMapBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      me.redirectTo('venueDetails');
   },
   onTabBarTabChange : function(bar, newTab, oldTab, eOpts)
   {
      switch(newTab.config.tag)
      {
         default :
         case 'rewards' :
         case 'main' :
         {
            Ext.defer(function()
            {
               try
               {
                  if (newTab)
                  {
                     newTab.setActive(false);
                  }

                  if (oldTab)
                  {
                     oldTab.setActive(false);
                  }
                  bar._activeTab = null;
               }
               catch(e)
               {
               }
            }, 2 * 1000);
            break;
         }
      }

      return true;
   },
   onJackpotWinnersTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var merchantId = me.getViewPortCntlr().getVenue().getMerchant().getId();
      me.redirectTo('jackpotWinners/' + merchantId);
   },
   onBadgeTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('badges');
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function(venueId, customerId)
   {
      this.backToMainPage(venueId, customerId, 0);
   },
   backToMainPage : function(venueId, customerId, backToMain)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      //var cvenue = viewport.getCheckinInfo().venue;
      //var showFeed = (customerId > 0) || (cvenue && (cvenue.getId() == venueId));
      var showFeed = true;
      this.openMainPage(showFeed, backToMain > 0);
   },
   venueDetails : function()
   {
      var me = this;
      /*
       var gm = (window.google && window.google.maps && window.google.maps.LatLng) ? window.google.maps : null;
       //
       // Loads currently checked-in / explore Venue into the store
       //
       if(gm)
       {
       this.latLng = new gm.LatLng(record.get('latitude'), record.get('longitude'));
       this.markerOptions =
       {
       position : this.latLng,
       title : record.get('name')
       }
       }
       else
       */
      {
         var record = me.getViewPortCntlr().getVenue();
         me.latLng = record.get('latitude') + ',' + record.get('longitude');
         var color = 'red', label = '';
         var address = record.get('address') + ', ' + record.get('city') + ', ' +
         //
         record.get('state') + ', ' + record.get('country') + ', ' + record.get('zipcode');

         me.markerOptions =
         {
            markers : 'color:' + color + '|' + 'label:' + label + '|' + this.latLng,
            //center : address,
            center : me.latLng,
            title : record.get('name')
         }
         //console.debug("Cannot Retrieve Google Map Information.");
      }

      me.setAnimationMode(me.self.animationMode['cover']);
      me.pushView(me.getMerchantDetails());
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      // Check if this is the first time logging into the venue
      //var view = (this.getViewport().getCustomerId() > 0);
      //return this[view ? 'getMain' : 'getPage']();
      return this.getMain();
   },
   openMainPage : function(showFeed, backToMain)
   {
      var me = this;
      var vport = me.getViewport();

      // Check if this is the first time logging into the venue
      me.showFeed = showFeed;
      if (!backToMain)
      {
         // Refresh Merchant Panel Info
         var viewport = me.getViewPortCntlr();
         var venue = viewport.getVenue();
         if (me.getMainPage() == vport.getActiveItem())
         {
            me.checkInAccount();
         }
         else
         {
            me.setAnimationMode(me.self.animationMode['pop']);
            me.pushView(me.getMainPage());
         }
         console.log("Merchant Account Opened");
      }
      else
      {
         me.fireEvent('backToMain');
      }
   }
});

Ext.define('Genesis.controller.client.mixin.RedeemBase',
{
   extend :  Ext.mixin.Mixin ,
   inheritableStatics :
   {
   },
   config :
   {
   },
   redeemFbMsg : 'Use your KICKBAK card or mobile app to earn rewards in your local area',
   needPointsMsg : function(pointsDiff)
   {
      return ('You need ' + pointsDiff + ' more points ' + Genesis.constants.addCRLF() + 'to be eligible for this item.');
   },
   retrievingQRCodeMsg : 'Retrieving QRCode ...',
   showQrCodeMsg : 'Show this Authorization Code to your merchant to redeem!',
   updateOnFbMsg : 'Would you like to tell your friends on Facebook about it?',
   redeemItemEmailMsg : function(redemptionName, venueName)
   {
      return ('I just got "' + redemptionName + '" from ' + venueName + '!');
   },
   updatingRedemptionOnFacebook : function(earnprize)
   {
      var me = this, FB = window.plugins.facebookConnect;
      try
      {
         var viewport = me.getViewPortCntlr(), venue = viewport.getVenue(), site = Genesis.constants.site;
         var wsite = venue.get('website') ? venue.get('website').split(/http[s]*:\/\//) : [null];
         var name = venue.get('name'), link = wsite[wsite.length - 1] || site, desc = me.redeemFbMsg;
         //venue.get('description').trunc(256);
         var message = me.redeemItemEmailMsg(earnprize.get('title'), venue.get('name'));
         var params =
         {
         }
         console.log('Posting Redemption to Facebook ...' + '\n' + //
         'Name: ' + name + '\n' + //
         'Caption: ' + link + '\n' + //
         'Description: ' + desc + '\n' + //
         'Message : ' + message + '\n' //
         );
         /*,params1 = Ext.urlEncode({
          og_url : encodeURIComponent(link),
          og_type : getkickbak:rewards,
          og_title : 'KICKBAK Rewards',
          og_image : encodeURIComponent(venue.getMerchant().get('photo')['thumbnail_large_url']),
          og_description : desc,
          body : message
          });
          switch (me.getTitle().toLowerCase())
          {
          case 'rewards' :
          {
          params['rewards'] = serverHost + "/opengraph?" + params1;
          break;
          }
          case 'prizes' :
          {
          params['prizes'] = serverHost + "/opengraph?" + params1;
          break;
          }
          }
          */
         FB.requestWithGraphPath(//
         '/me/feed',
         //'/me/getkickbak:got',
         Ext.apply(params,
         {
            name : name,
            //link : href,
            link : link,
            caption : link,
            description : desc,
            picture : venue.getMerchant().get('photo')['thumbnail_large_url'],
            message : message
         }), 'POST', function(response)
         {
            if (!response || response.error || Ext.isString(response))
            {
               console.log('Post was not published to Facebook.');
               Ext.defer(function(earnprize)
               {
                  var me = this;
                  Genesis.fb.facebook_onLogout(null, false);
                  Genesis.fb.facebook_onLogin(function()
                  {
                     me.updatingRedemptionOnFacebook(earnprize);
                  }, false);
               }, 1, me, [earnprize]);
            }
            else
            {
               console.log('Posted to your Facebook Newsfeed.');
            }
         });
      }
      catch (e)
      {
         console.log('Exception [' + e + ']' + '\n' + //
         'Post was not published to Facebook.');
      }
   },
   redeemItemFn : function(params, view)
   {
      var me = this, proxy = CustomerReward.getProxy(), item = view.getInnerItems()[0], storeName = me.getRedeemStore(), store = Ext.StoreMgr.get(storeName);
      //
      // Updating Server ...
      //
      console.debug("Transmitting Redeem Points Request ...");
      if (me.getSRedeemBtn())
      {
         me.getSRedeemBtn()['hide']();
      }
      CustomerReward[me.getRedeemPointsFn()](item.getData().getId());
      store.load(
      {
         addRecords : true, //Append data
         scope : me,
         //timeout : 30*1000,
         jsonData :
         {
         },
         doNotRetryAttempt : true,
         params : params,
         callback : function(records, operation)
         {
            //
            // Stop broadcasting now ...
            //
            if (me.identifiers)
            {
               me.identifiers['cancelFn']();
            }
            Ext.Viewport.setMasked(null);

            if (operation.wasSuccessful())
            {
               Ext.device.Notification.beep();

               //Update on Facebook
               /*
                if ((db['currFbId'] > 0) && ( typeof (FB) != "undefined"))
                {
                Genesis.fb.facebook_onLogin(function(params)
                {
                if (params)
                {
                var redeemItem = store.getById(item.getData().getId());
                Ext.Viewport.setMasked(null);
                me.updatingRedemptionOnFacebook(redeemItem);
                }
                //}, false, me.updateOnFbMsg);
                }, false);
                }
                */

               Ext.device.Notification.show(
               {
                  title : me.getRedeemPopupTitle(),
                  message : me.redeemSuccessfulMsg,
                  buttons : ['OK'],
                  callback : function()
                  {
                     me.onDoneTap();
                  }
               });
            }
            else
            {
               if (me.getSRedeemBtn())
               {
                  me.getSRedeemBtn()['show']();
               }
               //proxy._errorCallback = Ext.bind(me.onDoneTap, me);
               proxy.supressErrorsPopup = true;
               Ext.device.Notification.show(
               {
                  title : me.getRedeemPopupTitle(),
                  message : me.redeemFailedMsg,
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     proxy.supressErrorsCallbackFn();
                     me.onDoneTap();
                  }
               });
            }
         }
      });
   },

   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   updateMetaDataInfo : function(metaData)
   {
      var me = this, customer = me.callParent(arguments);

      //
      // Claim Reward Item by showing QRCode to Merchant Device!
      //
      if (metaData['data'])
      {
         me.fireEvent('showQRCode', 0, metaData['data']);
      }

      return customer;
   },
   // --------------------------------------------------------------------------
   // Handler Functions
   // --------------------------------------------------------------------------
   onRedeemItem : function(btn, venue, view)
   {
      var me = this, FB = window.plugins.facebookConnect, venueId = (venue) ? venue.getId() : 0, db = Genesis.db.getLocalDB(), params =
      {
         venue_id : venueId
      };
      var privKey = Genesis.fn.privKey =
      {
         'venueId' : venueId,
         'venue' : venue.get('name')
      };
      privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];

      me.identifiers = null;
      me.broadcastLocalID(function(ids)
      {
         me.identifiers = ids;
         Ext.Viewport.setMasked(
         {
            xtype : 'mask',
            cls : 'transmit-mask',
            html : me.lookingForMerchantDeviceMsg(),
            listeners :
            {
               'tap' : function(b, e, eOpts)
               {
                  //
                  // Stop broadcasting now ...
                  //
                  /*
                   if (!Ext.get(Ext.DomQuery.select('.x-innerhtml',b.element.dom)[0]).getPageBox(true).isOutOfBound(
                   {
                   x : e.pageX,
                   y : e.pageY
                   }))
                   */
                  {
                     me.self.playSoundFile(viewport.sound_files['clickSound']);
                     Ext.Ajax.abort();
                     if (me.identifiers)
                     {
                        me.identifiers['cancelFn']();
                     }
                     Ext.Viewport.setMasked(null);
                     me.onDoneTap();
                     Ext.device.Notification.show(
                     {
                        title : me.getRedeemPopupTitle(),
                        message : me.transactionCancelledMsg,
                        buttons : ['Dismiss']
                     });
                  }
               }
            }
         });
         console.debug("Broadcast underway ...");
         me.redeemItemFn(Ext.apply(params,
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : me.identifiers['localID']
            }, 'reward')
         }), view);
      }, function()
      {
         Ext.Viewport.setMasked(null);
      });
   },
   onRedeemItemTap : function(b, e, eOpts, eInfo)
   {
      var me = this, btn = b, viewport = me.getViewPortCntlr(), venue = viewport.getVenue();
      var view = me.getRedeemMainPage(), title = view.query('titlebar')[0].getTitle();

      //console.debug("onRedeemItemTap - Mode[" + me.getRedeemMode() + "]");
      switch (me.getRedeemMode())
      {
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            window.plugins.proximityID.preLoadSend(me, Ext.bind(function(_btn, _venue, _view)
            {
               me.fireEvent('redeemitem', _btn, _venue, _view);
            }, me, [btn, venue, view]));
            break;
         }
      }
   },
   onRedeemItemShowView : Ext.emptyFn,
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   onShowItemQRCode : function(timeout, qrcode)
   {
      var me = this;
      var _qrcode;
      var title = 'Redeem ' + me.getTitle();

      /*
       console.debug("\n" + //
       "Encrypted Code :\n" + qrcode + "\n" + //
       "Encrypted Code Length: " + qrcode.length);
       */
      _qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      if (_qrcode[0])
      {
         var dom = Ext.DomQuery.select('div.itemPoints',me.getRedeemItem().element.dom)[0];
         if (me.getSRedeemBtn())
         {
            me.getSRedeemBtn().hide();
         }
         if (me.getSDoneBtn())
         {
            me.getSDoneBtn()['show']();
         }
         me.getSCloseBB().hide();
         if (dom)
         {
            Ext.fly(dom).addCls('x-item-hidden');
         }

         me.fireEvent('refreshQRCode', _qrcode);

         Ext.Viewport.setMasked(null);
         Ext.device.Notification.show(
         {
            title : title,
            message : me.showQrCodeMsg,
            buttons : ['OK']
         });
         Ext.device.Notification.vibrate();
      }
      else
      {
         console.debug("onShowItemQRCode - QR Code encoding Error");
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemBrowseSCPage : function()
   {
      this.openPage('redeemBrowseSC');
      if (this.getCloseBtn())
      {
         this.getCloseBtn().hide();
         this.getBackBtn().show();
      }
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});

Ext.define('Genesis.view.widgets.RedeemPtsItemBase',
{
   extend :  Ext.dataview.component.DataItem ,
                                
   xtype : 'redeemptsitembase',
   alias : 'widget.redeemptsitembase',
   config :
   {
   },
   applyPoints : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getPoints());
   },
   updatePoints : function(newPoints, oldPoints)
   {
      if (newPoints)
      {
         this.add(newPoints);
      }

      if (oldPoints)
      {
         this.remove(oldPoints);
      }
   },
   updateRecord : function(newRecord)
   {
      if (!newRecord)
      {
         return;
      }

      var me = this, dataview = me.config.dataview, data = dataview.prepareData(newRecord.getData(true), dataview.getStore().indexOf(newRecord), newRecord), items = me.getItems(), item = items.first(), dataMap = me.getDataMap(), componentName, component, setterMap, setterName;

      if (!item)
      {
         return;
      }
      for (componentName in dataMap)
      {
         setterMap = dataMap[componentName];
         component = me[componentName]();
         if (component)
         {
            for (setterName in setterMap)
            {
               if (component[setterName])
               {
                  switch (setterMap[setterName])
                  {
                     case 'points':
                        component[setterName](data);
                        break;
                     default :
                        component[setterName](data[setterMap[setterName]]);
                        break;
                  }
               }
            }
         }
      }
      // Bypassing setter because sometimes we pass the same object (different properties)
      item.updateData(data);
   }
});

Ext.define('Genesis.view.widgets.RewardPtsItem',
{
   extend :  Genesis.view.widgets.RedeemPtsItemBase ,
   xtype : 'rewardptsitem',
   alias : 'widget.rewardptsitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'stretch'
      },
      points :
      {
         flex : 1,
         tpl : '{points} Pts',
         cls : 'pointsphoto'
      },
      dataMap :
      {
         getPoints :
         {
            setData : 'points'
         }
      }
   }
});

Ext.define('Genesis.view.widgets.PrizePtsItem',
{
   extend :  Genesis.view.widgets.RedeemPtsItemBase ,
   xtype : 'prizeptsitem',
   alias : 'widget.prizeptsitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'stretch'
      },
      points :
      {
         flex : 1,
         tpl : '{prize_points} Pts',
         cls : 'prizephoto'
      },
      dataMap :
      {
         getPoints :
         {
            setData : 'points'
         }
      }
   }
});

Ext.define('Genesis.view.RedeemBase',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                              
   alias : 'widget.redeeembaseview',
   config :
   {
   },
   disableAnimation : true,
   cleanView : function()
   {
      this.removeAll(true);
      this.callParent(arguments);
   },
   showView : function()
   {
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
      this.callParent(arguments);
      console.debug("RedeemBase : showView");
   },
   _createView : function(store, renderStore, activeItemIndex)
   {
      var me = this, itemHeight = 1 + Genesis.constants.defaultIconSize() + (2 * Genesis.fn.calcPx(0.65, 1));

      //console.debug("itemHeight=" + itemHeight);
      me.setPreRender([
      // ------------------------------------------------------------------------
      // Redemptions
      // ------------------------------------------------------------------------
      {
         xtype : 'list',
         flex : 1,
         refreshHeightOnUpdate : false,
         variableHeights : false,
         //deferEmptyText : false,
         itemHeight : itemHeight,
         ui : 'bottom-round',
         store : store,
         cls : me.getListCls() + ' separator_pad',
         tag : me.getListCls(),
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate',
         '<div class="photo x-hasbadge">'+
            '<span class="x-badge round">{[this.getPoints(values)]}</span>',
            '<img src="{[this.getPhoto(values)]}"/>'+
         '</div>',
         '<div class="listItemDetailsWrapper">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
            //'<div class="itemDesc">{[this.getDesc(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               if (!values.photo || !values.photo.url)
               {
                  return me.self.getPhoto(values['type']);
               }
               return values.photo.url;
            },
            getTitle : function(values)
            {
               return values['title'];
            },
            getDesc : function(values)
            {
               return 'This will cost you ' + values['points'] + ' Pts';
            },
            getPoints : function(values)
            {
               return values['points'];
            }
         }),
         onItemDisclosure : Ext.emptyFn,
         // ------------------------------------------------------------------------
         // Redeem Available Panel
         // ------------------------------------------------------------------------
         items : [
         {
            docked : 'top',
            xtype : 'toolbar',
            cls : 'ptsEarnPanelHdr',
            ui : 'light',
            centered : false,
            items : [
            {
               xtype : 'title',
               title : me.getRedeemTitleText()
            },
            {
               xtype : 'spacer'
            }]
         }]
      }]);
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.view.client.Prizes',
{
   extend :  Genesis.view.RedeemBase ,
                                                    
   alias : 'widget.clientprizesview',
   config :
   {
      defaultItemType : 'prizeptsitem',
      ptsEarnTitleText : 'Prize Points Available',
      redeemTitleText : 'Choose a Prize to redeem',
      listCls : 'prizesList',
      //scrollable : 'vertical',
      scrollable : undefined,
      cls : 'prizesMain viewport',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Prizes',
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            hidden : true,
            align : 'left',
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   _createView : function(store, renderStore, activeItemIndex)
   {
      var me = this;
      var customer = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getCustomer();

      me.callParent(arguments);
      // ------------------------------------------------------------------------
      // Redeem Points Earned Panel
      // ------------------------------------------------------------------------
      if (Customer.isValid(customer.getId()))
      {
         me.setPreRender([
         {
            //docked : 'top',
            cls : 'ptsEarnPanel',
            tag : 'ptsEarnPanel',
            xtype : 'dataview',
            useComponents : true,
            scrollable : undefined,
            defaultType : me.getDefaultItemType(),
            store : renderStore
         }].concat(me.getPreRender()));
      }
   },
   createView : function(activeItemIndex)
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         var customer = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getCustomer();
         me.query('dataview[tag=ptsEarnPanel]')[0](Customer.isValid(customer.getId()) ? 'show' : 'hide')();
         return;
      }
      me._createView('PrizeStore', 'PrizeRenderCStore', activeItemIndex);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});

Ext.define('Genesis.controller.client.Prizes',
{
   extend :  Genesis.controller.PrizeRedemptionsBase ,
   mixins : [ Genesis.controller.client.mixin.RedeemBase ],
                                                                                             
   inheritableStatics :
   {
   },
   xtype : 'clientPrizesCntlr',
   config :
   {
      models : ['CustomerReward'],
      redeemPath : 'redeemBrowsePrizesSC',
      routes :
      {
         //Shortcut to choose venue to redeem prizes
         'redeemPrizesChooseSC' : 'redeemChooseSCPage',
         //Shortcut to visit Merchant Account for the Vnue Page
         'redeemBrowsePrizesSC' : 'redeemBrowseSCPage'
      },
      refs :
      {
         backBtn : 'clientprizesview button[tag=back]',
         closeBtn : 'clientprizesview button[tag=close]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'clientprizesview',
            autoCreate : true,
            xtype : 'clientprizesview'
         },
         redemptionsList : 'clientprizesview list[tag=prizesList]',
         redemptionsPts : 'clientprizesview component[tag=points]',
         redemptionsPtsEarnPanel : 'clientprizesview dataview[tag=ptsEarnPanel]',
         //
         // Spin and Play Rewards Page
         //
         prizeCheckScreen : 'clientrewardsview',
         //
         // Reward Prize
         //
         sBackBB : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=back]',
         sCloseBB : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=close]',
         //sBB : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=back]',
         sDoneBtn : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=done]',
         sRedeemBtn : 'clientredeemitemdetailview[tag=redeemPrize] button[tag=redeem]',
         redeemItem :
         {
            selector : 'clientredeemitemdetailview[tag=redeemPrize]',
            autoCreate : true,
            tag : 'redeemPrize',
            xtype : 'clientredeemitemdetailview'
         }
      },
      control :
      {
         sRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         }
      },
      listeners :
      {
         'prizecheck' : 'onPrizeCheck',
         //
         // Redeem Prize
         //
         'refreshQRCode' : 'onRefreshQRCode'
      }
   },
   _backToMain : false,
   checkinFirstMsg : 'Please Check-In before redeeming Prizes',
   eligibleRewardMsg : 'Check out an Eligible Prize you can redeem with your Prize Points!',
   flag : 0,
   wonPrizeMsg : function(reward_info)
   {
      var me = this;
      var points = reward_info['prize_points'];
      var extraPoints = reward_info['badge_points'];

      return (((points > me.getMinPrizePts()) ? //
      'You\'ve won a JACKPOT of' + Genesis.constants.addCRLF() + points + ' Prize Points!' : me.gotMinPrizePtsMsg(points)) + Genesis.constants.addCRLF() +
      // //
      me.eligibleRewardMsg);
   },
   wonPrizeEmailMsg : function(prizeName, venueName)
   {
      return ('I just won enough Prize Points to redeem "' + prizeName + '" from ' + venueName + '!');
   },
   upgradeBadgeEmailMsg : function(badge, venueName)
   {
      return ('I\'ve just been promoted to ' + badge.toUpperCase() + ' at ' + venueName + '!');
   },
   gotMinPrizePtsMsg : function(points)
   {
      return ('You\'ve won ' + points + ' Prize Points!');
   },
   init : function()
   {
      var me = this;
      me.callParent(arguments);

      me.callBackStack =
      {
         callbacks : ['eligibleForPrizeHandler', 'redeemPrizeHandler'],
         arguments : [],
         startIndex : 0
      };

      console.log("Prizes Client Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   stopRouletteTable : function(scn)
   {
      if (scn)
      {
         var rouletteTable = Ext.get(Ext.DomQuery.select('div.rouletteTable',scn.element.dom)[0]);
         if (rouletteTable)
         {
            rouletteTable.removeCls('spinFwd');
            rouletteTable.removeCls('spinBack');
         }
      }
   },
   stopRouletteBall : function(scn)
   {
      if (scn)
      {
         var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
         if (rouletteBall)
         {
            rouletteBall.removeCls('spinBack');
            rouletteBall.addCls('spinFwd');
         }
      }
   },
   startRouletteScreen : function(scn)
   {
      if (scn)
      {
         var rouletteTable = Ext.get(Ext.DomQuery.select('div.rouletteTable',scn.element.dom)[0]);
         if (rouletteTable)
         {
            rouletteTable.addCls('spinFwd');
         }
         var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
         if (rouletteBall)
         {
            rouletteBall.addCls('spinBack');
         }
      }
   },
   stopRouletteScreen : function(scn)
   {
      this.stopRouletteTable(scn);
      if (scn)
      {
         var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
         if (rouletteBall)
         {
            rouletteBall.removeCls('spinBack');
            rouletteBall.removeCls('spinFwd');
         }
      }
      //this.stopRouletteBall(view);
   },
   updatingPrizeOnFacebook : function(earnprize)
   {
      var me = this, FB = window.plugins.facebookConnect;
      try
      {
         var viewport = me.getViewPortCntlr();
         var venue = viewport.getVenue();
         var site = Genesis.constants.site;
         var wsite = venue.get('website') ? venue.get('website').split(/http[s]*:\/\//) : [null];
         var name = venue.get('name');
         var link = wsite[wsite.length - 1] || site;
         var desc = me.redeemFbMsg;
         //venue.get('description').trunc(256);
         var message = me.wonPrizeEmailMsg(earnprize.get('title'), venue.get('name'));
         var params =
         {
         };

         /*,params1 = Ext.urlEncode({
          og_url : encodeURIComponent(link),
          og_type : getkickbak:rewards,
          og_title : 'KICKBAK Prizes',
          og_image : encodeURIComponent(venue.getMerchant().get('photo')['thumbnail_large_url']),
          og_description : desc,
          body : message
          });
          switch (me.getTitle().toLowerCase())
          {
          case 'rewards' :
          {
          params['rewards'] = serverHost + "/opengraph?" + params1;
          break;
          }
          case 'prizes' :
          {
          params['prizes'] = serverHost + "/opengraph?" + params1;
          break;
          }
          }
          */
         console.log('Posting Prize Win to Facebook ...' + '\n' + //
         'Name: ' + name + '\n' + //
         'Caption: ' + link + '\n' + //
         'Description: ' + desc + '\n' + //
         'Message : ' + message + '\n' //
         );
         FB.requestWithGraphPath(//
         '/me/feed',
         //'/me/getkickbak:got',
         Ext.apply(params,
         {
            name : name,
            //link : href,
            link : link,
            caption : link,
            description : desc,
            picture : venue.getMerchant().get('photo')['thumbnail_large_url'],
            message : message
         }), 'POST', function(response)
         {
            if (!response || response.error || Ext.isString(response))
            {
               console.log('Post was not published to Facebook.');
               Ext.defer(function(earnprize)
               {
                  var me = this;
                  Genesis.fb.facebook_onLogout(null, false);
                  Genesis.fb.facebook_onLogin(function()
                  {
                     me.updatingPrizeOnFacebook(earnprize);
                  }, false);
               }, 1, me, [earnprize]);
            }
            else
            {
               console.log('Posted to your Facebook Newsfeed.');
            }
         });
      }
      catch (e)
      {
         console.log('Exception [' + e + ']' + '\n' + //
         'Post was not published to Facebook.');
      }
   },
   updatingBadgeOnFacebook : function(badge)
   {
      var me = this, FB = window.plugins.facebookConnect;
      try
      {
         var viewport = me.getViewPortCntlr(), venue = viewport.getVenue(), site = Genesis.constants.site;
         var wsite = venue.get('website') ? venue.get('website').split(/http[s]*:\/\//) : [null];
         var name = venue.get('name'), link = wsite[wsite.length - 1] || site;
         var badgeURL = badge.get('photo')[Genesis.constants._thumbnailAttribPrefix + 'large'];
         //var desc = venue.get('description').trunc(256);
         var desc = me.redeemFbMsg;
         var message = me.upgradeBadgeEmailMsg(badge.get('title'), name);
         var params =
         {
         };
         /*,params1 = Ext.urlEncode({
          og_url : encodeURIComponent(link),
          og_type : getkickbak:promotions,
          og_title : 'KICKBAK Badge Promotion',
          og_image : encodeURIComponent(badgeURL),
          og_description : desc,
          body : message
          });
          params['promotions'] = serverHost + "/opengraph?" + params1;
          */

         console.log('Posting Badge Promotion to Facebook ...' + '\n' + //
         'Name: ' + name + '\n' + //
         'Caption: ' + link + '\n' + //
         'Description: ' + desc + '\n' + //
         'Message : ' + message + '\n' //
         );
         FB.requestWithGraphPath(//
         '/me/feed',
         //'/me/getkickbak:promote',
         Ext.apply(params,
         {
            name : name,
            //link : href,
            link : link,
            caption : link,
            description : desc,
            picture : badgeURL,
            message : message
         }), 'POST', function(response)
         {
            if (!response || response.error || Ext.isString(response))
            {
               console.log('Post was not published to Facebook.');
               Ext.defer(function(badge)
               {
                  var me = this;
                  Genesis.fb.facebook_onLogout(null, false);
                  Genesis.fb.facebook_onLogin(function()
                  {
                     me.updatingBadgeOnFacebook(badge);
                  }, false);
               }, 1, me, [badge]);
            }
            else
            {
               console.log('Posted to your Facebook Newsfeed.');
            }
         });
      }
      catch (e)
      {
         console.log('Exception [' + e + ']' + '\n' + //
         'Post was not published to Facebook.');
      }
   },
   removeViewHandler : function(metaData, viewsPopLength)
   {
      var me = this;
      if (viewsPopLength > 0)
      {
         console.debug("Removing Last " + viewsPopLength + " Views from History ...");
         me.silentPopView(viewsPopLength);
      }
      if (me._backToMain)
      {
         me.goToMerchantMain(true);
         me._backToMain = false;
      }
      else
      {
         me.popView();
      }
   },
   redeemPrizeHandler : function(metaData, viewsPopLength)
   {
      var me = this, FB = window.plugins.facebookConnect;
      var info = metaData['reward_info'], points = info['badge_points'];
      var eligible = Ext.isDefined(info['eligible_prize_id']) && (info['eligible_prize_id'] > 0);

      me._backToMain = true;
      if (eligible)
      {
         var prize = Ext.StoreMgr.get('PrizeStore').getById(info['eligible_prize_id']);

         console.debug("Eligible Prize Id[" + info['eligible_prize_id'] + "]");
         me.fireEvent('showredeemprize', prize, info, viewsPopLength);
      }
      else
      {
         console.debug("No Eligible Prize");
         me.removeViewHandler(metaData, viewsPopLength);
      }

      //Update on Facebook
      /*
       if (( typeof (FB) != "undefined") && ((eligible) || (points > 0)))
       {
       Genesis.fb.facebook_onLogin(function(params)
       {
       if (params)
       {
       Ext.Viewport.setMasked(null);
       if (eligible)
       {
       //me.updatingPrizeOnFacebook(prize);
       }
       if (points > 0)
       {
       var ainfo = metaData['account_info'], badgeId = ainfo['badge_id'], badge = Ext.StoreMgr.get('BadgeStore').getById(badgeId);
       me.updatingBadgeOnFacebook(Ext.create('Genesis.model.CustomerReward',
       {
       'title' : badge.get('type').display_value,
       'type' :
       {
       value : 'promotion'
       },
       'photo' : Genesis.view.client.Badges.getPhoto(badge.get('type'), 'thumbnail_large_url'),
       'points' : points,
       'time_limited' : false,
       'quantity_limited' : false,
       'merchant' : null
       }));
       }
       }
       //}, false, me.updateOnFbMsg);
       }, false);
       }
       */

      return false;
   },
   eligibleForPrizeHandler : function(metaData, viewsPopLength)
   {
      var me = this, viewport = me.getViewPortCntlr(), soundType, message;
      var info = metaData['reward_info'], eligible = info['eligible_prize_id'] > 0;
      var ppoints = info['prize_points'];

      //
      // Can't win PrizePoints if you didn't win any Reward Points
      //
      me.flag = 0;
      var rc = Ext.isDefined(ppoints) && (ppoints > 0);
      if (rc)
      {
         var eligiblePrizeCallback = function(setFlag, viewsPopLength)
         {
            if (me.task && (setFlag == 0x01))
            {
               me.task.cancel();
               me.task = null;
            }
            if ((me.flag |= setFlag) == 0x11)
            {
               me.flag = 0;
               me.fireEvent('triggerCallbacksChain');
            }
         };

         if (ppoints > me.getMinPrizePts())
         {
            soundType = 'winPrizeSound';
            message = me.wonPrizeMsg(info);

            Ext.device.Notification.vibrate();
            me.task = Ext.create('Ext.util.DelayedTask', function()
            {
               try
               {
                  me.self.stopSoundFile(viewport.sound_files[soundType]);
                  eligiblePrizeCallback(0x01, viewsPopLength);
               }
               catch(e)
               {
               }

            });
            me.task.delay(10 * 1000);
         }
         else
         {
            soundType = 'losePrizeSound';
            message = me.gotMinPrizePtsMsg(ppoints);
         }
         //
         // Play the prize winning music!
         //
         me.self.playSoundFile(//
         viewport.sound_files[soundType], Ext.bind(eligiblePrizeCallback, me, [0x01, viewsPopLength]));
         Ext.device.Notification.show(
         {
            title : me.scanPlayTitle,
            message : message,
            buttons : ['OK'],
            callback : Ext.bind(eligiblePrizeCallback, me, [0x10, viewsPopLength])
         });

      }

      return rc;
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onPrizeCheck : function(metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var info = metaData['reward_info'];
      var ainfo = metaData['account_info'];

      me.stopRouletteBall(me.getPrizeCheckScreen());

      //
      // Minimum Prize Points
      //
      if (!Ext.isDefined(info['eligible_prize_id']) || (info['eligible_prize_id'] == 0))
      {
         viewsPopLength = ((info['badge_points'] > 0) || (ainfo['visits'] == 1)) ? 1 : 0;
         console.debug("No Prize to Show. viewsPopLength =" + viewsPopLength);
      }
      //
      // LumpSum Prize Points
      // Either Prize Points or Badge Prize Points
      else
      {
         viewsPopLength = ((info['badge_points'] > 0) || (ainfo['visits'] == 1)) ? 2 : 1;
         console.debug("WON LumpSum Prize Points. viewsPopLength =" + viewsPopLength);
      }

      me.callBackStack['arguments'] = [metaData, viewsPopLength];
      me.fireEvent('triggerCallbacksChain');
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.callParent(arguments);

      me.getSRedeemBtn()['show']();
   },
   onShowRedeemPrize : function(prize, reward_info, viewsPopLength)
   {
      var me = this;
      me.callParent(arguments);
      me.stopRouletteScreen(me.getPrizeCheckScreen());
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemChooseSCPage : function()
   {
      var controller = this.getApplication().getController('client' + '.Accounts');
      controller.redeemPrizesChooseSCPage();
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});

Ext.define('Genesis.view.client.Redemptions',
{
   extend :  Genesis.view.RedeemBase ,
                                                     
   alias : 'widget.clientredemptionsview',
   config :
   {
      defaultItemType : 'rewardptsitem',
      redeemTitleText : 'Rewards available to redeem',
      ptsEarnTitleText : 'Rewards Points Available',
      listCls : 'redemptionsList',
      //scrollable : 'vertical',
      scrollable : undefined,
      cls : 'redemptionsMain viewport',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Rewards',
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            hidden : true,
            align : 'left',
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   _createView : function(store, renderStore, activeItemIndex)
   {
      var me = this;
      var customer = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getCustomer();

      me.callParent(arguments);
      // ------------------------------------------------------------------------
      // Redeem Points Earned Panel
      // ------------------------------------------------------------------------
      if (Customer.isValid(customer.getId()))
      {
         me.setPreRender([
         {
            //docked : 'top',
            cls : 'ptsEarnPanel',
            tag : 'ptsEarnPanel',
            xtype : 'dataview',
            useComponents : true,
            scrollable : undefined,
            defaultType : me.getDefaultItemType(),
            store : renderStore
         }].concat(me.getPreRender()));
      }
   },
   createView : function(activeItemIndex)
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         var customer = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getCustomer();
         me.query('dataview[tag=ptsEarnPanel]')[0](Customer.isValid(customer.getId()) ? 'show' : 'hide')();
         return;
      }
      this._createView('RedeemStore', 'RedemptionRenderCStore', activeItemIndex);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});

Ext.define('Genesis.controller.client.Redemptions',
{
   extend :  Genesis.controller.RewardRedemptionsBase ,
   mixins : [ Genesis.controller.client.mixin.RedeemBase ],
                                                                    
   inheritableStatics :
   {
   },
   xtype : 'clientRedemptionsCntlr',
   config :
   {
      redeemPointsFn : 'setRedeemPointsURL',
      refs :
      {
         backBtn : 'clientredemptionsview button[tag=back]',
         closeBtn : 'clientredemptionsview button[tag=close]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'clientredemptionsview',
            autoCreate : true,
            xtype : 'clientredemptionsview'
         },
         redemptionsList : 'clientredemptionsview list[tag=redemptionsList]',
         redemptionsPts : 'clientredemptionsview component[tag=points]',
         redemptionsPtsEarnPanel : 'clientredemptionsview dataview[tag=ptsEarnPanel]',
         //
         // Redeem Rewards
         //
         sBackBB : 'clientredeemitemdetailview[tag=redeemReward] button[tag=back]',
         sCloseBB : 'clientredeemitemdetailview[tag=redeemReward] button[tag=close]',
         //sBB : 'clientredeemitemdetailview[tag=redeemReward] button[tag=back]',
         sDoneBtn : 'clientredeemitemdetailview[tag=redeemReward] button[tag=done]',
         sRedeemBtn : 'clientredeemitemdetailview[tag=redeemReward] button[tag=redeem]',
         redeemItem :
         {
            selector : 'clientredeemitemdetailview[tag=redeemReward]',
            autoCreate : true,
            tag : 'redeemReward',
            xtype : 'clientredeemitemdetailview'
         }
      },
      control :
      {
         sRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         },
         sDoneBtn :
         {
            tap : 'onDoneTap'
         }
      }
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.callParent(arguments);

      me.getSRedeemBtn()['show']();

      console.debug("RewardItem View - Updated RewardItem View.");
   },
   redeemChooseSCPage : function()
   {
      var controller = this.getApplication().getController('client.Accounts');
      controller.redeemRewardsChooseSCPage();
   }
});

Ext.define('Genesis.view.client.Rewards',
{
   extend :  Genesis.view.ViewBase ,
                              
   alias : 'widget.clientrewardsview',
   config :
   {
      layout : 'fit',
      cls : 'rouletteBg',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Spin and Play'
      }),
      {
         xtype : 'component',
         tag : 'prizeCheck',
         cls : 'prizeCheck',
         // -------------------------------------------------------------------
         // Checking for Prizes Screen
         // -------------------------------------------------------------------
         data :
         {
         },
         tpl :
         // @formatter:off
         '<div class="rouletteTable"></div>'+
         '<div class="rouletteBall"></div>'
          // @formatter:on
      }],
      listeners : [
      {
         element : 'element',
         delegate : "div.prizeCheck",
         event : "tap",
         fn : "onRouletteTap"
      }]
   },
   onRouletteTap : function(b, e, eOpts)
   {
      this.fireEvent('rouletteTap', this.metaData);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'vip' :
               photo_url = Genesis.constants.getIconPath('miscicons', type.value);
               break;
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});

Ext.define('Genesis.controller.client.Rewards',
{
   extend :  Genesis.controller.ControllerBase ,
                                                               
   inheritableStatics :
   {
   },
   xtype : 'clientRewardsCntlr',
   config :
   {
      mode : 'rewards',
      models : ['PurchaseReward', 'CustomerReward'],
      routes :
      {
         'scanAndWin' : 'scanAndWinPage',
         'promotion' : 'promotionPage'
      },
      refs :
      {
         //backButton : 'clientrewardsview button[tag=close]',
         //
         // Rewards
         //
         rewards :
         {
            selector : 'clientrewardsview',
            autoCreate : true,
            xtype : 'clientrewardsview'
         },
         //
         // SignUp - Referral Promotion
         //
         promotion :
         {
            selector : 'clientpromotionalitemview[tag=promotion]',
            autoCreate : true,
            tag : 'promotion',
            xtype : 'clientpromotionalitemview'
         },
         pDoneBtn : 'clientpromotionalitemview[tag=promotion] button[tag=done]'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate',
            rouletteTap : 'onRouletteTap'
         },
         promotion :
         {
            createView : 'onPromotionCreateView',
            activate : 'onPromotionActivate',
            deactivate : 'onPromotionDeactivate',
            promoteItemTap : 'onPromoteItemTap'
         },
         pDoneBtn :
         {
            tap : 'onPromotionDoneTap'
         }
      },
      listeners :
      {
         'rewarditem' : 'onRewardItem'
      }
   },
   cannotDetermineLocationMsg : 'Cannot determine current location. Visit one of our venues to continue!',
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstMsg : 'Please Check-In before earning rewards',
   authCodeReqMsg : 'Proceed to scan an Authorization Code from your merchant to earn Reward Pts!',
   birthdayPageTitle : 'Birthday Reward',
   birthdayTitle : 'Happy Brithday!',
   signupPageTitle : 'Signup Reward',
   signupPromotionTitle : 'Welcome!',
   referralPageTitle : 'Refer A Friend',
   referralPromotionTitle : 'Referral Award',
   badgePageTitle : 'Badge Promotion',
   badgePromotionTitle : 'Badge Promotion Award',
   prizeCheckMsg : 'Play our Instant Win Game to win Bonus Prize Points!',
   signupPromotionMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Reward Pts from Signing Up for this merchant!';
   },
   birthdayMsg : function(points)
   {
      return 'You\'ve earned ' + points + 'Bonus Reward Pts!';
   },
   getPointsMsg : function(reward_info)
   {
      var me = this;
      var points = reward_info['points'];
      var extraPoints = reward_info['referral_points'];
      var msg = (reward_info['prize_points'] && (reward_info['prize_points'] > 0)) ? me.prizeCheckMsg : '';

      return 'You\'ve earned ' + points + ' Reward Pts from this purchase.' + //
      ((extraPoints > 0) ? '' : ' ' + msg);
   },
   getReferralMsg : function(points)
   {
      return this.getVipMsg(points);
   },
   getVipMsg : function(points)
   {
      return ('You\'ve earned an additional ' + Genesis.constants.addCRLF() + //
      points + ' Reward Pts!' + Genesis.constants.addCRLF() + //
      this.prizeCheckMsg);
   },
   getBadgeMsg : function(points, badge)
   {
      var rc = 'You\'ve been Promoted to' + Genesis.constants.addCRLF() + 'Badge Level ' + badge.get('type').display_value + '!';
      if (points > 0)
      {
         rc += (Genesis.constants.addCRLF() + 'For that, you\'ve earned ' + Genesis.constants.addCRLF() + points + ' Bonus Reward Pts!');
      }

      return rc;
   },
   vipPopUp : function(points, callback)
   {
      callback = callback || Ext.emptyFn;
      Ext.device.Notification.show(
      {
         title : 'VIP Challenge',
         message : this.getVipMsg(points),
         buttons : ['OK'],
         callback : callback
      });
   },
   identifiers : null,
   init : function()
   {
      this.callParent(arguments);
      console.log("Client Rewards Init");

      this.callBackStack =
      {
         callbacks : ['birthdayHandler', 'signupPromotionHandler', 'badgePtsHandler', 'earnPtsHandler', 'referralPromotionHandler', 'scanAndWinHandler'],
         arguments : [],
         startIndex : 0
      };
      //
      // Preload Pages
      //
      this.getRewards();
   },
   rewardItemFn : function(notUseGeolocation)
   {
      var me = this, viewport = me.getViewPortCntlr();
      //
      // Not ready to process data
      //
      if (me.identifiers == null)
      {
         return;
      }

      var db = Genesis.db.getLocalDB(), position = viewport.getLastPosition(), localID = me.identifiers['localID'];
      var venue = viewport.getVenue(), venueId = (notUseGeolocation) ? venue.getId() : null;
      var reader = PurchaseReward.getProxy().getReader();
      var params =
      {
      }, privKey;

      //
      // With or without Geolocation support
      //
      if (!venueId)
      {
         //
         // We cannot use short cut method unless we have either GeoLocation or VenueId
         //
         if (!position)
         {
            //
            // Stop broadcasting now ...
            //
            if (me.identifiers)
            {
               me.identifiers['cancelFn']();
            }
            Ext.Viewport.setMasked(null);
            Ext.device.Notification.show(
            {
               title : 'Rewards',
               message : me.cannotDetermineLocationMsg,
               buttons : ['Dismiss']
            });
            return;
         }

         params = Ext.apply(params,
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : localID
            }, 'reward'),
            //'data' : me.qrcode,
            'latitude' : position.coords.getLatitude(),
            'longitude' : position.coords.getLongitude()
         });
      }
      else
      {
         params = Ext.apply(params,
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : localID
            }, 'reward'),
            venue_id : venueId
         });
      }
      //
      // Triggers PrizeCheck and MetaDataChange
      // - subject CustomerReward also needs to be reset to ensure property processing of objects
      //
      console.debug("Transmitting Reward Points Request ...");
      PurchaseReward['setEarnPointsURL']();
      reader.setRootProperty('');
      reader.buildExtractors();
      PurchaseReward.load(1,
      {
         jsonData :
         {
         },
         doNotRetryAttempt : true,
         params : params,
         callback : function(record, operation)
         {
            reader.setRootProperty('data');
            reader.buildExtractors();
            //
            // Stop broadcasting now ...
            //
            if (me.identifiers)
            {
               me.identifiers['cancelFn']();
            }
            Ext.Viewport.setMasked(null);

            if (operation.wasSuccessful())
            {
               Ext.device.Notification.beep();
               //Genesis.db.removeLocalDBAttrib('last_check_in');

               //
               // Refresh screen on first visit
               //
               me.fireEvent('triggerCallbacksChain');
            }
         }
      });
      delete me.qrcode;
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      if (qrcode)
      {
         //anim.disable();
         //container.setActiveItem(0);
         //anim.enable();
         me.qrcode = qrcode;
         switch (me.getMode())
         {
            case 'rewardsSC' :
            {
               me.onLocationUpdate();
               break;
            }
            default :
               me.getGeoLocation();
               break;
         }
      }
      else
      {
         console.debug(me.missingEarnPtsCodeMsg);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.missingEarnPtsCodeMsg,
            buttons : ['Dismiss'],
            callback : function()
            {
               //me.popView();
            }
         });
      }
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      me.rewardItemFn(false);
   },
   onPromoteItemTap : function(b, e, eOpts, eInfo)
   {
      this.onPromotionDoneTap();
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   promotionHandler : function(pageTitle, title, points, photoType, message, callback)
   {
      var me = this, vport = me.getViewport(), page = me.getPromotion();
      var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
      var photoUrl =
      {
      };
      photoUrl[prefix] = (Ext.isObject(photoType)) ? //
      Genesis.view.client.Badges.getPhoto(photoType.get('type'), 'thumbnail_large_url') : //
      photoUrl[prefix] = Genesis.constants.getIconPath(photoType, 'reward');

      me.promoteCount++;
      me.redeemItem = Ext.create('Genesis.model.CustomerReward',
      {
         'title' : (Ext.isObject(photoType)) ? photoType.get('type').display_value : null,
         'type' :
         {
            value : 'promotion'
         },
         'photo' : photoUrl,
         'points' : points,
         'time_limited' : false,
         'quantity_limited' : false,
         'merchant' : null
      });
      var tbbar = page.query('titlebar')[0];
      tbbar.setTitle(pageTitle);
      me.redirectTo('promotion');
      Ext.device.Notification.show(
      {
         title : title,
         message : message,
         buttons : ['OK'],
         callback : callback || Ext.emptyFn
      });
   },
   birthdayHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], vport = me.getViewport(), points = info['birthday_points'];
      var rc = Ext.isDefined(points) && (points > 0);

      me.promoteCount = 0;
      if (rc)
      {
         me.promotionHandler(me.birthdayPageTitle, me.birthdayTitle, points, 'prizewon', me.birthdayMsg(points), function()
         {
            me.self.stopSoundFile(me.getViewPortCntlr().sound_files['birthdaySound']);
         });
         me.self.playSoundFile(me.getViewPortCntlr().sound_files['birthdaySound']);
      }

      return rc;
   },
   signupPromotionHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], vport = me.getViewport(), points = info['signup_points'];

      var rc = Ext.isDefined(points) && (points > 0);
      if (rc)
      {
         me.promotionHandler(me.signupPageTitle, me.signupPromotionTitle, points, 'prizewon', me.signupPromotionMsg(points));
      }

      return rc;
   },
   earnPtsHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], points = info['points'];
      var rc = Ext.isDefined(points) && (points > 0);

      //
      // Play Scan-To-Win if you won any Reward Points
      //
      if (rc)
      {
         Ext.device.Notification.show(
         {
            title : 'Rewards',
            message : me.getPointsMsg(info),
            buttons : ['OK'],
            callback : function()
            {
               me.fireEvent('triggerCallbacksChain');
            }
         });
      }

      return rc;
   },
   referralPromotionHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], points = info['referral_points'];

      var rc = Ext.isDefined(points) && (points > 0);
      if (rc)
      {
         me.promotionHandler(me.referralPageTitle, me.referralPromotionTitle, points, 'prizewon', me.getReferralMsg(points));
      }

      return rc;
   },
   badgePtsHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], ainfo = metaData['account_info'], points = info['badge_points'], badgeId = ainfo['badge_id'];
      var viewport = me.getViewPortCntlr(), badge = Ext.StoreMgr.get('BadgeStore').getById(badgeId);
      //
      // Badge Promotion or First time visit
      //
      var rc = (points > 0) || (ainfo['visits'] == 1);
      if (rc)
      {
         me.promotionHandler(me.badgePageTitle, me.badgePromotionTitle, points, badge, me.getBadgeMsg(points, badge), function()
         {
            me.self.stopSoundFile(viewport.sound_files['promoteSound']);
         });
         me.self.playSoundFile(viewport.sound_files['promoteSound']);
      }
      return rc;
   },
   scanAndWinHandler : function(metaData, customer, venue, merchantId)
   {
      var me = this, info = metaData['reward_info'], ainfo = metaData['account_info'], points = info['points'], ppoints = info['prize_points'];
      var rc = Ext.isDefined(points) && (points > 0);
      var prc = Ext.isDefined(ppoints) && (ppoints > 0);

      if (me.promoteCount > 0)
      {
         console.debug("Removing Promotion View from History ...");
         me.silentPopView(1);
      }
      me.promoteCount = 0;

      if ((merchantId > 0) && (ainfo['visits'] >= 2))
      {
         //
         // Clear Referral DB
         //
         Genesis.db.removeReferralDBAttrib("m" + merchantId);
      }
      //
      // Can't play Scan-To-Win if you didn't win any Reward Points
      //
      if (rc && prc)
      {
         me.redirectTo('scanAndWin');
      }
      else if (prc)
      {
         var app = me.getApplication(), controller = app.getController('client' + '.Prizes');
         controller.fireEvent('prizecheck', metaData);
      }
      //
      // Default Action is go back to Merchant Page after earning rewards
      //
      else if (rc)
      {
         me.goToMerchantMain(true);
      }

      return false;
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.callParent(arguments);

      me.getRefreshBtn()['hide']();
      me.getSRedeemBtn()['show']();
   },
   onRewardItem : function(notUseGeolocation)
   {
      var me = this, task, viewport = me.getViewPortCntlr();

      me.identifiers = null;

      var db = Genesis.db.getLocalDB(), venue = viewport.getVenue(), venueId, position = viewport.getLastPosition();

      if (!position || (position['coords'] && (position['coords'].getTimestamp() < (new Date()).addMinutes(-5).getTime())))
      {
         viewport.setLastPosition(null);
      }
      //
      // Get GeoLocation and frequency markers
      //
      if (!notUseGeolocation)
      {
         venueId = -1;
         privKey = Genesis.fn.privKey =
         {
            'venueId' : venueId,
            'venue' : Genesis.constants.debugVenuePrivKey
         };
         privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];
         if (!viewport.getLastPosition())
         {
            me.getGeoLocation();
         }
      }
      else
      {
         venueId = venue.getId();
         privKey = Genesis.fn.privKey =
         {
            'venueId' : venueId,
            'venue' : venue.get('name')
         };
         privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];
      }

      me.broadcastLocalID(function(idx)
      {
         me.identifiers = idx;
         Ext.Viewport.setMasked(
         {
            xtype : 'mask',
            cls : 'transmit-mask',
            html : me.lookingForMerchantDeviceMsg(),
            listeners :
            {
               'tap' : function(b, e, eOpts)
               {
                  //
                  // Stop broadcasting now ...
                  //
                  /*
                   if (!Ext.get(Ext.DomQuery.select('.x-innerhtml',b.element.dom)[0]).getPageBox(true).isOutOfBound(
                   {
                   x : e.pageX,
                   y : e.pageY
                   }))
                   */
                  {
                     me.self.playSoundFile(viewport.sound_files['clickSound']);
                     Ext.Ajax.abort();
                     if (me.identifiers)
                     {
                        me.identifiers['cancelFn']();
                     }
                     Ext.Viewport.setMasked(null);
                     Ext.device.Notification.show(
                     {
                        title : 'Rewards',
                        message : me.transactionCancelledMsg,
                        buttons : ['Dismiss']
                     });
                  }
               }
            }
         });
         console.debug("Broadcast underway ...");
         if (notUseGeolocation || viewport.getLastPosition())
         {
            me.rewardItemFn(notUseGeolocation);
         }
      }, function()
      {
         Ext.Viewport.setMasked(null);
      });
   },
   onEarnPts : function(notUseGeolocation)
   {
      var me = this, allowedMsg = me.isOpenAllowed();

      if (allowedMsg !== true)
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : allowedMsg,
            buttons : ['Dismiss']
         });
         return;
      }
      else
      {
         window.plugins.proximityID.preLoadSend(me, Ext.bind(function(_notUseGeolocation)
         {
            //var earnPts = Ext.bind(me.onEarnPtsSC, me);
            //me.checkReferralPrompt(earnPts, earnPts);
            me.fireEvent('rewarditem', _notUseGeolocation);
         }, me, [notUseGeolocation]));
      }
   },
   updateMetaDataInfo : function(metaData)
   {
      var me = this, viewport = me.getViewPortCntlr(), customer = me.callParent(arguments);
      var venue = viewport.getVenue(), merchantId = metaData['merchant_id'] || venue.getMerchant().getId();

      me.callBackStack['arguments'] = [metaData, customer, venue, merchantId];
      //console.debug("updateMetaDataInfo - metaData[" + Ext.encode(metaData) + "]");
      if (metaData['data'])
      {
         var controller = me.getApplication().getController('client.Prizes');
         controller.fireEvent('showQRCode', 0, metaData['data']);
      }
   },
   onRouletteTap : function(metaData)
   {
      var me = this, viewport = me.getViewPortCntlr();
      var app = me.getApplication(), controller = app.getController('client.Prizes');
      if (me.task)
      {
         try
         {
            me.task.cancel();
            delete me.task;
            me.self.stopSoundFile(viewport.sound_files['rouletteSpinSound']);
            me.self.playSoundFile(viewport.sound_files['clickSound']);
         }
         catch(e)
         {
         }
         console.debug("Stopped RouletteSound, checking for prizes ...");
         controller.fireEvent('prizecheck', metaData);
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();
      var app = me.getApplication(), controller = app.getController('client.Prizes');
      var metaData = me.callBackStack['arguments'][0], rouletteTap = Ext.bind(me.onRouletteTap, me, [metaData]);

      // Safe guard in case the music doesn't stop
      activeItem.metaData = metaData;
      me.task = Ext.create('Ext.util.DelayedTask', rouletteTap);
      me.task.delay(15 * 1000);

      me.self.playSoundFile(viewport.sound_files['rouletteSpinSound'], rouletteTap);

      Ext.defer(controller.startRouletteScreen, 1 * 1000, controller, [me.getRewards()]);
      /*
       Ext.defer(function()
       {
       //activeItem.createView();
       }, 1, activeItem);
       //activeItem.createView();
       */
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      //this.getBackButton().enable();
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
   },
   onPromotionCreateView : function(activeItem)
   {
      var me = this;
      activeItem.item = me.redeemItem;
   },
   onPromotionActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //delete me.redeemItem;
   },
   onPromotionDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   onPromotionDoneTap : function(b, e, eOpts)
   {
      var me = this;
      me.fireEvent('triggerCallbacksChain');
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   scanAndWinPage : function()
   {
      var me = this;
      this.openPage('scanAndWin');
   },
   promotionPage : function()
   {
      var me = this;
      this.openPage('promotion');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      var page = this.getRewards();
      return page;
   },
   openPage : function(subFeature)
   {
      var me = this, vport = me.getViewport();

      me.setMode(subFeature);
      switch (subFeature)
      {
         case 'scanAndWin' :
         {
            //
            // Go back to Main Reward Screen
            //
            me.setAnimationMode(me.self.animationMode['coverUp']);
            me.pushView(me.getRewards());
            break;
         }
         case 'rewardsSC':
         {
            me.onEarnPts(false);
            break;
         }
         case 'rewards':
         {
            me.onEarnPts(true);
            break;
         }
         case 'promotion' :
         {
            var page = me.getPromotion();
            if (vport.getActiveItem() == page)
            {
               var controller = vport.getEventDispatcher().controller, anim = new Ext.fx.layout.Card(me.self.animationMode['fade']);
               anim.on('animationend', function()
               {
                  console.debug("Animation Complete");
                  anim.destroy();
               }, me);
               //if (!controller.isPausing)
               {
                  console.debug("Reloading Promotion Page");
                  // Delete current page and refresh
                  //page.removeAll(true);
                  vport.animateActiveItem(page, anim);
                  anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
                  vport.doSetActiveItem(page, null);
               }
            }
            else
            {
               me.setAnimationMode(me.self.animationMode['coverUp']);
               me.pushView(me.getPromotion());
            }
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
      /*
       var viewport = this.getViewPortCntlr();
       var cvenue = viewport.getCheckinInfo().venue;
       var venue = viewport.getVenue();

       // VenueId can be found after the User checks into a venue
       //return ((this.getViewPortCntlr().getVenue()) ? true : this.checkinFirstMsg);
       return ((cvenue && venue && (cvenue.getId() == venue.getId())) ? true : this.checkinFirstMsg);
       */
   }
});

Ext.define('Genesis.view.widgets.ListField',
{
   extend :  Ext.field.Text ,
   alternateClassName : 'Genesis.field.List',
   xtype : 'listfield',
   /**
    * @cfg {Object} component
    * @accessor
    * @hide
    */
   config :
   {
      ui : 'list',
      component :
      {
         useMask : false
      },
      /**
       * @cfg {Boolean} clearIcon
       * @hide
       * @accessor
       */
      clearIcon : true,
      iconCls : '',
      readOnly : false
   },
   // @private
   initialize : function()
   {
      var me = this, component = me.getComponent();

      me.callParent();

      if(me.getIconCls())
      {
         Ext.fly(me.element.query('.'+Ext.baseCSSPrefix.trim()+'component-outer')[0]).addCls(me.getIconCls());
      }
      component.setReadOnly(true);
   },
   // @private
   doClearIconTap : Ext.emptyFn
});

Ext.define('Genesis.view.client.SettingsPage',
{
   extend :  Ext.form.Panel ,
                                                                                       
   alias : 'widget.clientsettingspageview',
   config :
   {
      preRender : null,
      cls : 'viewport',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Settings',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Account Profile',
         //instructions : 'Tell us all about yourself',
         defaults :
         {
            labelWidth : '50%'
         },
         items : [
         /*
          {
          xtype : 'textfield',
          name : 'tagid',
          clearIcon : false,
          label : "Mobile Tag ID",
          value : ' ',
          readOnly : true
          },
          */
         {
            xtype : 'textfield',
            cls : 'halfHeight',
            labelWidth : '100%',
            name : 'user',
            label : "John Smith" + "<br/>" + "<label>johnsmith@example.com</label>",
            value : ' ',
            required : false,
            readOnly : true
         },
         {
            xtype : 'datepickerfield',
            labelWidth : '30%',
            label : 'Birthday',
            name : 'birthday',
            dateFormat : 'M j, Y',
            required : false,
            picker :
            {
               yearFrom : 1913,
               doneButton :
               {
                  ui : 'normal'
               }
            },
            value : 0
         }, Ext.apply(
         {
            labelWidth : '30%',
            label : 'Phone#',
            name : 'phone',
            required : false
         }, Genesis.view.ViewBase.phoneField()),
         {
            xtype : 'listfield',
            name : 'changepassword',
            label : 'Change Password',
            value : ' '
         }]
      },
      {
         tag : 'accountUpdate',
         xtype : 'button',
         ui : 'orange-large',
         style : 'margin-bottom:1.5em',
         text : 'Update'
      },
      {
         xtype : 'fieldset',
         title : 'Social Settings',
         //instructions : 'Tell us all about yourself',
         defaults :
         {
            labelWidth : '60%'
         },
         items : [
         {
            xtype : 'togglefield',
            name : 'facebook',
            label : '<img src="' + //
            Genesis.constants.resourceSite + 'images/' + Genesis.constants.themeName + '/' + 'facebook_icon.png" ' + //
            'style="height:' + (2.5 / 0.8) + 'em' + ';float:left;margin-right:0.8em;"/> Facebook',
            value : 0
         },
         {
            hidden : true,
            xtype : 'togglefield',
            name : 'twitter',
            label : '<img src="' + //
            Genesis.constants.resourceSite + 'images/' + Genesis.constants.themeName + '/' + 'twitter_icon.png" ' + //
            'style="height:' + (2.5 / 0.8) + 'em' + ';float:left;margin-right:0.8em;"/> Twitter',
            value : 0
         }]
      },
      {
         xtype : 'fieldset',
         title : 'About Kickbak',
         defaults :
         {
            labelWidth : '50%'
         },
         //instructions : 'Tell us all about yourself',
         items : [
         {
            xtype : 'textfield',
            label : 'Version ' + Genesis.constants.clientVersion,
            clearIcon : false,
            readOnly : true
         },
         {
            xtype : 'listfield',
            name : 'terms',
            label : 'Terms of Use',
            value : ' '
         },
         {
            xtype : 'listfield',
            name : 'privacy',
            label : 'Privacy',
            value : ' '
         }/*,
          {
          xtype : 'listfield',
          name : 'aboutus',
          label : 'About Us'
          value : ' '
          }*/]
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

Ext.define('Genesis.controller.client.Settings',
{
   extend :  Genesis.controller.SettingsBase ,
   settingsTitle : 'Account Settings',
   enableFBMsg : 'By connecting to Facebook, you will receive additional Reward Pts everytime we update your KICKBAK activity to your Facebook account!',
   disableFBMsg : '',
   enableTwitterMsg : 'By enabling Twitter connectivity, you will receive additional reward points everytime we update your KICKBAK activity to their site!',
   disableTwitterMsg : '',
   twitterUnconfiguredMsg : 'Please configure your Twitter App',
   inheritableStatics :
   {
      accountValidateFailedMsg : function(msg)
      {
         return msg + Genesis.constants.addCRLF() + 'Please with correct syntax.';
      },
      accountValidate : function(page, values)
      {
         var me = this, account = Ext.create('Genesis.model.frontend.Account', values), validateErrors = account.validate(), field, fieldCmp, valid, label, message;

         if (!validateErrors.isValid())
         {
            do
            {
               valid = false;
               field = validateErrors.first();
               if (field)
               {
                  fieldCmp = page.query('field[name='+field.getField()+']')[0];
                  if (!fieldCmp || !fieldCmp.getRequired() || (field.getField() == 'password'))
                  {
                     if (!fieldCmp || !fieldCmp.getValue() || (fieldCmp.getValue() == '') || (fieldCmp.getValue() == ' '))
                     {
                        validateErrors.remove(field);
                        valid = true;
                     }
                  }
               }
               else
               {
                  fieldCmp = null;
               }
            } while(valid);

            if (fieldCmp)
            {
               label = fieldCmp.getLabel();
               message = me.accountValidateFailedMsg(label + ' ' + field.getMessage());
               console.debug(message);
               Ext.device.Notification.show(
               {
                  title : me.settingsTitle,
                  message : message,
                  buttons : ['Dismiss']
               });
               return null;
            }
         }
         return account;
      }
   },
   xtype : 'clientSettingsCntlr',
   config :
   {
      models : ['Genesis.model.frontend.Account'],
      routes :
      {
         'settings' : 'openSettingsPage'
      },
      refs :
      {
         settingsPage :
         {
            selector : 'clientsettingspageview',
            autoCreate : true,
            xtype : 'clientsettingspageview'
         }
      },
      control :
      {
         settingsPage :
         {
            deactivate : 'onDeactivate'
         },
         'clientsettingspageview togglefield[name=facebook]' :
         {
            change : 'onFacebookChange'
         },
         'clientsettingspageview togglefield[name=twitter]' :
         {
            change : 'onTwitterChange'
         },
         'clientsettingspageview listfield[name=changepassword]' :
         {
            clearicontap : 'onPasswordChangeTap'
         },
         'clientsettingspageview button[tag=accountUpdate]' :
         {
            tap : 'onAccountUpdateTap'
         },
         //
         // Terms & Conditions
         //
         'clientsettingspageview listfield[name=terms]' :
         {
            clearicontap : 'onTermsTap'
         },
         'clientsettingspageview listfield[name=privacy]' :
         {
            clearicontap : 'onPrivacyTap'
         },
         'clientsettingspageview listfield[name=aboutus]' :
         {
            clearicontap : 'onAboutUsTap'
         }
      },
      listeners :
      {
         'toggleFB' :
         {
            fn : 'onToggleFB',
            buffer : 500
         },
         'toggleTwitter' :
         {
            fn : 'onToggleTwitter',
            buffer : 300
         }
      }
   },
   initializing : true,
   accountUpdateSuccessMsg : 'Update Successful',
   accountUpdateFailedMsg : 'Update Failed',
   fbLoggedInIdentityMsg : function(email)
   {
      return 'You\'re logged into Facebook as ' + Genesis.constants.addCRLF() + email;
   },
   updatingFbLoginMsg : 'Updating Facebok Login Credentials',
   // --------------------------------------------------------------------------
   // Misc Utilities
   // --------------------------------------------------------------------------
   getAccountFields : function()
   {
      var me = this, db = Genesis.db.getLocalDB(), form = me.getSettingsPage();
      return (
         {
            'birthday' :
            {
               preLoadFn : function(field)
               {
                  field.setReadOnly(false);
               },
               field : form.query('datepickerfield[name=birthday]')[0],
               fn : function(field)
               {
                  var birthday = new Date.parse(db['account']['birthday']);
                  return (!birthday || !( birthday instanceof Date)) ? ' ' : birthday;
               },
               fbFn : function(field)
               {
                  var birthday = new Date.parse(db['fbResponse']['birthday']);
                  if (!birthday || !( birthday instanceof Date))
                  {
                     birthday = ' ';
                  }
                  if ( birthday instanceof Date)
                  {
                     field.setReadOnly(true);
                  }
                  return birthday;
               }
            },
            'phone' :
            {
               preLoadFn : Ext.emptyFn,
               field : form.query('textfield[name=phone]')[0],
               fn : function(field)
               {
                  var phone = db['account']['phone'].match(Account.phoneRegex);
                  return (phone[1] + '-' + phone[2] + '-' + phone[3]);
               },
               fbFn : Ext.emptyFn
            }
         });
   },
   updateFBSettings : function(params)
   {
      var me = this;

      Ext.defer(function()
      {
         Ext.device.Notification.show(
         {
            title : 'Facebook Connect',
            message : me.fbLoggedInIdentityMsg(params['email']),
            buttons : ['OK']
         });
      }, 1, me);
   },
   updateFBSettingsPopup : function(title, toggle)
   {
      var me = this, db = Genesis.db.getLocalDB();

      Genesis.fb.facebook_onLogin(function(params, operation)
      {
         Ext.Viewport.setMasked(null);
         if (!params || ((operation && !operation.wasSuccessful())))
         {
            if (me.getSettingsPage() && !me.getSettingsPage().isHidden() && toggle)
            {
               toggle.toggle();
            }
         }
         else
         {
            me.updateFBSettings(params);
            if (toggle)
            {
               toggle.originalValue = 1;
               me.updateAccountInfo();
            }
         }
      }, db['enableTwitter']);
   },
   updateAccountInfo : function()
   {
      var i, f, me = this, db = Genesis.db.getLocalDB(), fields = me.getAccountFields(), form = me.getSettingsPage();

      for (i in fields)
      {
         f = fields[i];
         f.preLoadFn(f.field);
         if (db['account'][i])
         {
            f[i] = f.fn(f.field);
         }
         else if (db['fbResponse'])
         {
            f[i] = f.fbFn(f.field);
         }
         //
         // Default Value
         //
         else
         {
            f[i] = null;
         }
      }

      console.log("enableFB - " + db['enableFB'] + ", enableTwitter - " + db['enableTwitter']);
      me.initializing = true;
      form.setValues(
      {
         birthday : fields['birthday'].birthday,
         phone : fields['phone'].phone,
         //tagid : db['account'].virtual_tag_id || 'None',
         facebook : (db['enableFB']) ? 1 : 0,
         twitter : (db['enableTwitter']) ? 1 : 0
      });
      form.query('textfield[name=user]')[0].setLabel(db['account'].name + '<br/>' + '<label>' + db['account'].email + "</label>");
      me.initializing = false;
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onPasswordChangeTap : function(b, e)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);
      me.redirectTo('password_change');
   },
   onAccountUpdateTap : function(b, e, eOpts)
   {
      var me = this, form = me.getSettingsPage(), values = form.getValues(true), proxy = Account.getProxy();
      var account = me.self.accountValidate(form, values);

      if (account)
      {
         //
         // Upate Account
         //
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         Account['setUpdateAccountUrl']();
         account.save(
         {
            action : 'read',
            jsonData :
            {
            },
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : me.settingsTitle,
                     message : me.accountUpdateSuccessMsg,
                     buttons : ['OK']
                  });
               }
               else
               {
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : me.settingsTitle,
                     message : me.accountUpdateFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsCallbackFn();
                     }
                  });
               }
            }
         });
      }
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this, fb = Genesis.fb;
      console.debug("Settings: onDeactivate");
      me.onFbDeactivate();
   },
   onToggleFB : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, fb = Genesis.fb, db = Genesis.db.getLocalDB();

      me.callParent(arguments);
      if (newValue == 1)
      {
      }
      else if (db['enableFB'])
      {
         console.debug("Cancelling Facebook Login ...");
         var params =
         {
            facebook_id : 0
         };

         Account['setUpdateFbLoginUrl']();
         Account.load(0,
         {
            jsonData :
            {
            },
            params :
            {
               user : Ext.encode(params)
            },
            callback : function(record, operation)
            {
               if (operation.wasSuccessful())
               {
                  db = Genesis.db.getLocalDB();
                  db['enableFB'] = false;
                  db['currFbId'] = 0;
                  delete db['fbAccountId'];
                  delete db['fbResponse'];
                  Genesis.db.setLocalDB(db);

                  if (Genesis.fn.isNative())
                  {
                     Genesis.fb.facebook_onLogout(null, true);
                  }
               }
               else if (!me.getSettingsPage().isHidden())
               {
                  toggle.toggle();
               }
            }
         });
      }
   },
   updateFBSignUpPopupCallback : function(params, operation)
   {
      var me = this, page = me.getSettingsPage();
      var toggle = (page) ? page.query('togglefield[name=facebook]')[0] : null;

      Ext.Viewport.setMasked(null);
      if ((operation && operation.wasSuccessful()) || (params && (params['type'] != 'timeout')))
      {
         me.updateFBSettings(params);
         if (toggle)
         {
            toggle.originalValue = 1;
            me.updateAccountInfo();
         }
      }
      else
      {
         if (toggle)
         {
            toggle.toggle();
         }
         Ext.device.Notification.show(
         {
            title : 'Facebook Connect',
            message : Genesis.fb.fbConnectFailMsg,
            buttons : ['Dismiss']
         });
      }
   },
   updateFBSignUp : function(params)
   {
      var me = this;

      Ext.defer(function()
      {
         Ext.device.Notification.show(
         {
            title : 'Facebook Connect',
            message : me.fbLoggedInIdentityMsg(params['email']),
            buttons : ['OK']
         });
      }, 1, me);

      me.response = params;
   },
   onToggleTwitter : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, db = Genesis.db.getLocalDB();
      var updateTwitterSettings = function()
      {
         Ext.device.Notification.show(
         {
            title : me.settingsTitle,
            message : me.enableTwitterMsg,
            buttons : ['Dismiss']
         });
         db['enableTwitter'] = true;
         Genesis.db.setLocalDB(db);
      };

      if (newValue == 1)
      {
         console.debug("Enabling Twitter Login ...");
         if (Genesis.fn.isNative())
         {
            window.plugins.twitter.isTwitterSetup(function(r)
            {
               if (r == 1)
               {
                  if (!db['enableFB'])
                  {
                     //
                     // Update Server to enable Twitter updates
                     //
                     updateTwitterSettings();
                  }
               }
               else
               {
                  Ext.device.Notification.show(
                  {
                     title : me.settingsTitle,
                     message : me.twitterUnconfiguredMsg,
                     buttons : ['Dismiss']
                  });
                  if (!me.getSettingsPage().isHidden())
                  {
                     toggle.toggle();
                  }
               }
            });
         }
         else
         {
            updateTwitterSettings();
         }
      }
      else if (db['enableTwitter'])
      {
         console.debug("Cancelling Twitter Login ...");
         //
         // Update Server to disable Twitter updates
         //
         db['enableTwitter'] = false;
         Genesis.db.setLocalDB(db);
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : function()
   {
      var me = this;
      me.updateAccountInfo();
      me.openPage('settings');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});

var onBackKeyDown = Ext.emptyFn;

Ext.require(['Genesis.controller.ControllerBase'], function()
{
   if (!Genesis.fn.isNative())
   {
      window.onhashchange = function()
      {
         if (location.hash != ('#' + _application.getHistory().getToken()))
         {
            location.hash = '#' + _application.getHistory().getToken();
            //
            // No need to differentiate between fwd/back, we are a single page app!
            //
            onBackKeyDown();
         }
      }
   }

   // add back button listener
   onBackKeyDown = function(e)
   {
      if (!_application || Ext.Viewport.getMasked())
      {
         return;
      }

      var viewport = _application.getController('client' + '.Viewport');
      if (!viewport || viewport.popViewInProgress)
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
            else
            {
               viewport.self.playSoundFile(viewport.sound_files['clickSound']);
               //
               // We have no way to "exit" the app in mobileClient
               //
               if (Genesis.fn.isNative())
               {
                  navigator.app.exitApp();
               }
               else
               {
                  window.location.reload();
               }
            }
         }
      }
   };
});

Ext.define('Genesis.controller.client.Viewport',
{
   extend :  Genesis.controller.ViewportBase ,
   inheritableStatics :
   {
   },
   config :
   {
      apsPayload : null,
      loggedIn : false,
      customer : null,
      venue : null,
      metaData : null,
      checkinInfo :
      {
         venue : null,
         customer : null,
         metaData : null
      },
      lastPosition : null,
      refs :
      {
         shareBtn : 'button[tag=shareBtn]',
         emailShareBtn : 'actionsheet button[tag=emailShareBtn]',
         fbShareBtn : 'actionsheet button[tag=fbShareBtn]'
      },
      control :
      {
         fbShareBtn :
         {
            tap : 'onShareMerchantTap'
         },
         emailShareBtn :
         {
            tap : 'onShareEmailTap'
         },
         'tabbar[tag=navigationBarTop] button[tag=info]' :
         {
            tap : 'onInfoTap'
         },
         'viewportview button[tag=home]' :
         {
            tap : 'onHomeButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=prizes]' :
         {
            tap : 'onPrizesButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=prizesSC]' :
         {
            tap : 'onRedeemPrizesSCButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=accounts]' :
         {
            tap : 'onAccountsButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=challenges]' :
         {
            tap : 'onChallengesButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=rewards]' :
         {
            tap : 'onRewardsButtonTap'
         },
         'viewportview button[tag=rewardsSC]' :
         {
            tap : 'onRewardsSCButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=redemption]' :
         {
            tap : 'onRedemptionsButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=redemptionSC]' :
         {
            tap : 'onRedeemRewardsSCButtonTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=main]' :
         {
            tap : 'onCheckedInAccountTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=checkin]' :
         {
            tap : 'onCheckinTap'
         },
         'tabbar[tag=navigationBarBottom] button[tag=browse]' :
         {
            tap : 'onBrowseTap'
         },
         'viewportview dataview[tag=mainMenuSelections]' :
         {
            select : 'onButtonTap'
         },
         'viewportview dataview[tag=badgesMenuSelections]' :
         {
            select : 'onButtonTap'
         },
         'viewportview dataview[tag=challengeMenuSelections]' :
         {
            select : 'onButtonTap'
         },
         'viewportview list[tag=jackpotWinnersList]' :
         {
            select : 'onButtonTap'
         },
         'actionsheet button' :
         {
            tap : 'onButtonTap'
         },
         'datepicker button' :
         {
            tap : 'onButtonTap'
         }
      },
      listeners :
      {
         'completeRefreshCSRF' : 'onCompleteRefreshCSRF',
         'updateDeviceToken' : 'onUpdateDeviceToken'
      }
   },
   fbShareSuccessMsg : 'Posted on your Facebook Timeline!',
   shareReqMsg : function()
   {
      return 'Would you like to do our' + Genesis.constants.addCRLF() + //
      'Referral Challenge?';
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this, payload = me.getApsPayload(), vstore = Ext.StoreMgr.get('VenueStore'), viewport = me, proxy = vstore.getProxy(), params =
      {
         'merchant_id' : payload['merchant_id']
      };

      //
      // GeoLocation is optional
      //
      if (position)
      {
         params = Ext.apply(params,
         {
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         });
      }

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.getVenueInfoMsg
      });
      Venue['setGetClosestVenueURL']();
      vstore.load(
      {
         scope : me,
         params : params,
         callback : function(records, operation)
         {
            me.setApsPayload(null);
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful())
            {
               var record = records[0];
               if (records.length > 1)
               {
                  console.debug('Found ' + records.length + ' venues matching current location, pick the first one ...');
               }

               viewport.setVenue(record);
               controller = me.getApplication().getController('client' + '.Checkins');
               controller.setPosition(position);
               controller.fireEvent('checkin');
            }
            else
            {
               proxy.supressErrorsPopup = true;
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg(operation.getError()),
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     proxy.supressErrorsCallbackFn();
                  }
               });
            }
         }
      });
   },
   onUpdateDeviceToken : function()
   {
      var me = this, mainPage = me.getApplication().getController('client' + '.MainPage'), proxy = Account.getProxy();

      if (me.getLoggedIn() && Genesis.constants.device && mainPage && !mainPage.updatedDeviceToken)
      {
         Account['setUpdateRegUserDeviceUrl']();
         console.debug("setUpdateRegUserDeviceUrl - Refreshing Device Token ...");
         proxy.supressErrorsPopup = true;
         Account.load(0,
         {
            jsonData :
            {
            },
            params :
            {
               device : Ext.encode(Genesis.constants.device)
            },
            callback : function(record, operation)
            {
               proxy.supressErrorsPopup = false;
               if (operation.wasSuccessful())
               {
                  mainPage.updatedDeviceToken = true;
               }
            }
         });
      }
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onShareEmailTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Referral Challenge',
         message : me.shareReqMsg(),
         buttons : ['Yes', 'No'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'yes')
            {
               var app = me.getApplication();
               me.onChallengesButtonTap(null, null, null, null, function()
               {
                  var venue = me.getViewPortCntlr().getVenue();
                  var venueId = venue.getId();
                  var items = venue.challenges().getRange();
                  var controller = app.getController('mobileClient' + '.Challenges');
                  //var list = controller.getReferralsPage().query('list')[0];

                  for (var i = 0; i < items.length; i++)
                  {
                     if (items[i].get('type').value == 'referral')
                     {
                        controller.selectedItem = items[i];
                        break;
                     }
                  }
                  controller.fireEvent('doChallenge');
               });
            }
         }
      });
   },
   onFacebookShareCallback : function(params, op)
   {
      var me = this, fb = Genesis.fb;
      if ((op && op.wasSuccessful()) || (params && (params['type'] != 'timeout')))
      {
         var venue = me.getVenue();
         var merchant = venue.getMerchant();
         var photoUrl = merchant.get('photo')['thumbnail_large_url'];

         console.debug('Posting to Facebook ...');

         Genesis.fb.share(
         {
            name : venue.get('name'),
            //link : href,
            link : venue.get('website') || site,
            caption : venue.get('website') || site,
            description : venue.get('description'),
            picture : photoUrl,
            message : 'Check out this place!'
         }, function(response)
         {
            Ext.Viewport.setMasked(null);
            console.debug(me.fbShareSuccessMsg);

            Ext.device.Notification.show(
            {
               title : 'Facebook Connect',
               message : me.fbShareSuccessMsg,
               buttons : ['OK']
            });
            fb.un('connected', me.onFacebookShareCallback);
            fb.un('unauthorized', me.onFacebookShareCallback);
            fb.un('exception', me.onFacebookShareCallback);
         }, function(response)
         {
            Ext.Viewport.setMasked(null);
            console.debug('Post was not published to Facebook.');
            /*
             Ext.device.Notification.show(
             {
             title : 'Facebook Connect',
             message : me.fbShareSuccessMsg,
             buttons : ['OK']
             });
             */
            fb.un('connected', me.onFacebookShareCallback);
            fb.un('unauthorized', me.onFacebookShareCallback);
            fb.un('exception', me.onFacebookShareCallback);
         });
      }
   },
   onShareMerchantTap : function(b, e, eOpts, eInfo)
   {
      var me = this, site = Genesis.constants.site, fb = Genesis.fb;
      //var FB = window.plugins.facebookConnect;
      //var db = Genesis.db.getLocaDB();
      fb.on('connected', me.onFacebookShareCallback, me);
      fb.on('unauthorized', me.onFacebookShareCallback, me);
      fb.on('exception', me.onFacebookShareCallback, me);
      Genesis.fb.facebook_onLogin(true, null, true);
   },
   onInfoTap : function(b, e, eOpts, eInfo)
   {
      // Open Info ActiveSheet
      // this.application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').pushView(vp.getInfo());
   },
   onAccountsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirect('accounts');
      //this.fireEvent('openpage', 'client.Accounts', null, null);
      console.log("Going to Accounts Page ...");
   },
   onChallengesButtonTap : function(b, e, eOpts, eInfo, callback)
   {
      var me = this;
      var venue = me.getVenue();

      var _onDone = function()
      {
         if (callback)
         {
            callback();
         }
         else
         {
            me.redirectTo('challenges');
            console.log("Going to Challenges Page ...");
         }
      }
      //
      // Retrieve Challenges from server
      //
      if (venue.challenges().getData().length == 0)
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.retrieveChallengesMsg
         });
         Challenge['setGetChallengesURL']();
         Challenge.load(venue.getId(),
         {
            params :
            {
               merchant_id : venue.getMerchant().getId(),
               venue_id : venue.getId()
            },
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  //
                  // Load record into Venue Object
                  //
                  venue.challenges().add(operation.getRecords());

                  _onDone();
               }
            }
         });
      }
      else
      {
         _onDone();
      }
   },
   onRewardsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.fireEvent('openpage', 'client.Rewards', 'rewards', null);
      console.log("Going to Client Rewards Page ...");
   },
   onRewardsSCButtonTap : function(b, e, eOpts, eInfo)
   {
      this.fireEvent('openpage', 'client.Rewards', 'rewardsSC', null);
      console.log("Going to Client Rewards Shortcut Page ...");
   },
   onRedemptionsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('redemptions');
      //this.fireEvent('openpage', 'client.Redemptions', 'redemptions', null);
      console.log("Going to Client Redemptions Page ...");
   },
   onRedeemRewardsSCButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('redeemRewardsChooseSC');
      console.log("Going to Client Redeem Rewards Choose Page ...");
   },
   onPrizesButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('prizes');
      //this.fireEvent('openpage', 'client.Prizes', 'prizes', null);
      console.log("Going to Merchant Prizes Page ...");
   },
   onRedeemPrizesSCButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('redeemPrizesChooseSC');
      console.log("Going to Client Redeem Prizes Choose Page ...");
   },
   onHomeButtonTap : function(b, e, eOpts, eInfo)
   {
      this.resetView();
      this.redirectTo('main');
      console.log("Going back to HomePage ...");
   },
   onCheckedInAccountTap : function(b, e, eOpts, eInfo)
   {
      this.goToMerchantMain(true);
   },
   onBrowseTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('exploreS');
      //this.fireEvent('openpage', 'client.Checkins', 'explore', 'coverUp');
   },
   onCheckinTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('checkin');
      //this.fireEvent('openpage', 'client.Checkins', 'explore', 'coverUp');
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   init : function(app)
   {
      var me = this;

      __initFb__(Genesis, "Genesis");

      me.callParent(arguments);

      console.log("Client Viewport Init");

      //
      // Initialize Sound Files, make it non-blocking
      //
      Ext.defer(function()
      {
         this.sound_files =
         {
         };
         var soundList = [//
         ['rouletteSpinSound', 'roulette_spin_sound', 'Media'], //
         ['winPrizeSound', 'win_prize_sound', 'Media'], //
         ['losePrizeSound', 'lose_prize_sound', 'Media'], //
         ['birthdaySound', 'birthday_surprise', 'Media'], //
         ['promoteSound', 'promote_sound', 'FX'], //
         ['clickSound', 'click_sound', 'FX'], //
         //['refreshListSound', 'refresh_list_sound', 'FX'], //
         ['beepSound', 'beep.wav', 'FX']];

         for (var i = 0; i < soundList.length; i++)
         {
            //console.debug("Preloading " + soundList[i][0] + " ...");
            this.loadSoundFile.apply(this, soundList[i]);
         }
      }, 1, me);

      //
      // Sender/Receiver Volume Settings
      // ===============================
      // - For Mobile Phones
      //
      // Client Device always transmits
      //
      var s_vol_ratio, r_vol_ratio, c = Genesis.constants;
      if (Ext.os.is('Android') || Ext.os.is('BlackBerry'))
      {
         //(tx)
         s_vol_ratio = 0.50;
         //Default Volume laying flat on a surface (tx)
         c.s_vol = 50;

         //(rx)
         r_vol_ratio = 0.5;
         c.conseqMissThreshold = 1;
         c.magThreshold = 20000;
         c.numSamples = 4 * 1024;
         //Default Overlap of FFT signal analysis over previous samples
         c.sigOverlapRatio = 0.25;
      }
      else if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
      {
         //(tx)
         s_vol_ratio = 0.50;
         //Default Volume laying flat on a surface (tx)
         c.s_vol = 50;

         r_vol_ratio = 0.5;
         //(rx)
         c.conseqMissThreshold = 1;
         c.magThreshold = 20000;
         // More samples for better accuracy
         c.numSamples = 4 * 1024;
         //Default Overlap of FFT signal analysis over previous samples
         c.sigOverlapRatio = 0.25;
      }

      c.proximityTxTimeout = 20 * 1000;
      c.proximityRxTimeout = 40 * 1000;
      Genesis.fn.printProximityConfig();
      window.plugins.proximityID.init(s_vol_ratio, r_vol_ratio);
   },
   openMainPage : function()
   {
      var me = this;
      var db = Genesis.db.getLocalDB();
      var loggedIn = (db['auth_code']) ? true : false;
      me.resetView();
      if (loggedIn)
      {
         //var app = this.getApplication();
         //var controller = app.getController(()(merchantMode) ? 'server': 'client') + '.MainPage');

         me.setLoggedIn(loggedIn);
         console.debug("Going to SignIn Page ...");
         me.redirectTo('signIn');
      }
      else
      {
         console.debug("Going to Login Page ...");
         Genesis.db.resetStorage();
         me.redirectTo('login');
      }
   }
});

function _onGotoMain()
{
   if (!offlineDialogShown)
   {
      Ext.device.Notification.show(
      {
         title : 'Network Error',
         message : Genesis.controller.ControllerBase.prototype.lostNetworkConenction,
         callback : function()
         {
            Ext.Viewport.setMasked(null);
            var viewport = _application.getController('client' + '.Viewport');
            if (viewport)
            {
               viewport.resetView();
               if (viewport.getLoggedIn())
               {
                  viewport.redirectTo('checkin');
               }
               else
               {
                  viewport.redirectTo('login');
               }
            }
            offlineDialogShown = false;
         }
      });
   }
   offlineDialogShown = true;
};

Ext.define('Genesis.profile.MobileClient',
{
   extend :  Ext.app.Profile ,
   config :
   {
   },
   isActive : function()
   {
      return true;
   }
}); 

Ext.define('Genesis.view.Viewport',
{
   extend :  Ext.Container ,
                                                              
   xtype : 'viewportview',
   config :
   {
      autoDestroy : false,
      cls : 'viewport',
      layout :
      {
         type : 'card',
         animation :
         {
            type : 'cover',
            reverse : false,
            direction : 'left'
         }
      },
      fullscreen : true
   },
   // @private
   initialize : function()
   {
      this.callParent(arguments);

      //
      // Initialize NFC after DeviceReady
      //
      if (Ext.os.is('Android') && merchantMode)
      {
         handleNfcFromIntentFilter();
         nfc.isEnabled(function()
         {
            Genesis.constants.isNfcEnabled = true;
            console.debug('NFC is enabled on this device');
         });
      }
      /*
       this.on(
       {
       delegate : 'button',
       scope : this,
       tap : function(b, e, eOpts)
       {
       //
       // While Animating, disable ALL button responds in the NavigatorView
       //
       if(Ext.Animator.hasRunningAnimations(this.getNavigationBar().renderElement) ||
       Ext.Animator.hasRunningAnimations(this.getActiveItem().renderElement))
       {
       return false;
       }
       return true;
       }
       });
       */
   },
   /**
    * Animates to the supplied activeItem with a specified animation. Currently this only works
    * with a Card layout.  This passed animation will override any default animations on the
    * container, for a single card switch. The animation will be destroyed when complete.
    * @param {Object/Number} activeItem The item or item index to make active
    * @param {Object/Ext.fx.layout.Card} animation Card animation configuration or instance
    */
   animateActiveItem : function(activeItem, animation)
   {
      var oldActiveItem = this.getActiveItem();
      var layout = this.getLayout(), defaultAnimation = (layout.getAnimation) ? layout.getAnimation() : null;
      var disableAnimation = (activeItem.disableAnimation || ((oldActiveItem) ? oldActiveItem.disableAnimation : false));
      var titlebar, viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');

      if (this.activeItemAnimation)
      {
         this.activeItemAnimation.destroy();
         //console.debug("Destroying AnimateActiveItem ...");
      }
      this.activeItemAnimation = animation = new Ext.fx.layout.Card(animation);

      if (animation && layout.isCard && !disableAnimation)
      {
         animation.setLayout(layout);
         if (defaultAnimation)
         {
            var controller = viewport.getEventDispatcher().controller;

            defaultAnimation.disable();
            controller.pause();
            activeItem.createView();
            animation.on('animationend', function()
            {
               console.debug("Animation Complete");

               defaultAnimation.enable();
               animation.destroy();
               delete this.activeItemAnimation;

               if (oldActiveItem)
               {
                  if (oldActiveItem != activeItem)
                  {
                     oldActiveItem.cleanView(activeItem);
                  }

                  titlebar = oldActiveItem.query('titlebar')[0];
                  if (titlebar)
                  {
                     titlebar.setMasked(Genesis.view.ViewBase.invisibleMask);
                  }
               }
               activeItem.showView();

               titlebar = activeItem.query('titlebar')[0];
               if (titlebar)
               {
                  titlebar.setMasked(null);
               }

               //
               // Delete oldActiveItem to save DOM memory
               //
               //if (oldActiveItem)
               {
                  controller.resume();
                  //console.debug('Destroyed View [' + oldActiveItem._itemId + ']');
               }
               viewport.popViewInProgress = false;
            }, this);
         }
         else
         {
            //Ext.Viewport.setMasked(null);
         }
      }

      if (defaultAnimation && disableAnimation)
      {
         defaultAnimation.disable();
      }

      var rc = this.setActiveItem(activeItem);
      if (!layout.isCard || disableAnimation)
      {
         //
         // Defer timeout is required to ensure that
         // if createView called is delayed, we will be scheduled behind it
         //
         if (defaultAnimation)
         {
            defaultAnimation.enable();
         }
         animation.destroy();
         if (oldActiveItem)
         {
            oldActiveItem.cleanView(activeItem);
            var titlebar = oldActiveItem.query('titlebar')[0];
            if (titlebar)
            {
               titlebar.setMasked(Genesis.view.ViewBase.invisibleMask);
            }
         }
         activeItem.createView();
         Ext.defer(function()
         {
            activeItem.showView();
            titlebar = activeItem.query('titlebar')[0];
            if (titlebar)
            {
               titlebar.setMasked(null);
            }
            viewport.popViewInProgress = false;
         }, 0.1 * 1000, this);
      }
      return rc;
   }
});

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
      if (db['csrf_code'] && (method == 'POST'))
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
            config.callback.apply(config.scope, [itemId]);
         }
      };
      msg._hideCallbackFn = Ext.bind(callback, this, [buttons[buttons.length - 1].itemId]);
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

/*!
 * Add to Homescreen v2.0.7 ~ Copyright (c) 2013 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
var addToHome = (function(w)
{
   var nav = w.navigator, isIDevice = 'platform' in nav && (/iphone|ipod|ipad/gi).test(nav.platform), isAndroid = 'platform' in nav && (/android/gi).test(nav.platform), isBB = 'platform' in nav && (/blackberry|bb\d+/gi).test(nav.userAgent), isWP = 'platform' in nav && (/Windows\ Phone/gi).test(nav.userAgent), isIPad, isRetina, isSafari, isStandalone, OSVersion, startX = 0, startY = 0, lastVisit = 0, isExpired, isSessionActive, isReturningVisitor, balloon, overrideChecks, positionInterval, closeTimeout, options =
   {
      autostart : true, // Automatically open the balloon
      returningVisitor : false, // Show the balloon to returning visitors only (setting this to true is HIGHLY RECCOMENDED)
      animationIn : 'drop', // drop || bubble || fade
      animationOut : 'fade', // drop || bubble || fade
      startDelay : 2000, // 2 seconds from page load before the balloon appears
      lifespan : 15000, // 15 seconds before it is automatically destroyed
      bottomOffset : 14, // Distance of the balloon from bottom
      expire : 0, // Minutes to wait before showing the popup again (0 = always displayed)
      message : '', // Customize your message or force a language ('' = automatic)
      touchIcon : false, // Display the touch icon
      arrow : true, // Display the balloon arrow
      hookOnLoad : true, // Should we hook to onload event? (really advanced usage)
      closeButton : true, // Let the user close the balloon
      iterations : 100	// Internal/debug use
   }, intl =
   {
      ar : '<span dir="rtl">قم بتثبيت هذا التطبيق على <span dir="ltr">%device:</span>انقر<span dir="ltr">%icon</span> ،<strong>ثم اضفه الى الشاشة الرئيسية.</strong></span>',
      ca_es : 'Per instal·lar aquesta aplicació al vostre %device premeu %icon i llavors <strong>Afegir a pantalla d\'inici</strong>.',
      cs_cz : 'Pro instalaci aplikace na Váš %device, stiskněte %icon a v nabídce <strong>Přidat na plochu</strong>.',
      da_dk : 'Tilføj denne side til din %device: tryk på %icon og derefter <strong>Føj til hjemmeskærm</strong>.',
      de_de : 'Installieren Sie diese App auf Ihrem %device: %icon antippen und dann <strong>Zum Home-Bildschirm</strong>.',
      el_gr : 'Εγκαταστήσετε αυτήν την Εφαρμογή στήν συσκευή σας %device: %icon μετά πατάτε <strong>Προσθήκη σε Αφετηρία</strong>.',
      en_us : 'Install this web app on your %device: tap %icon and then <strong>Add to Home Screen</strong>.',
      es_es : 'Para instalar esta app en su %device, pulse %icon y seleccione <strong>Añadir a pantalla de inicio</strong>.',
      fi_fi : 'Asenna tämä web-sovellus laitteeseesi %device: paina %icon ja sen jälkeen valitse <strong>Lisää Koti-valikkoon</strong>.',
      fr_fr : 'Ajoutez cette application sur votre %device en cliquant sur %icon, puis <strong>Ajouter à l\'écran d\'accueil</strong>.',
      he_il : '<span dir="rtl">התקן אפליקציה זו על ה-%device שלך: הקש %icon ואז <strong>הוסף למסך הבית</strong>.</span>',
      hr_hr : 'Instaliraj ovu aplikaciju na svoj %device: klikni na %icon i odaberi <strong>Dodaj u početni zaslon</strong>.',
      hu_hu : 'Telepítse ezt a web-alkalmazást az Ön %device-jára: nyomjon a %icon-ra majd a <strong>Főképernyőhöz adás</strong> gombra.',
      it_it : 'Installa questa applicazione sul tuo %device: premi su %icon e poi <strong>Aggiungi a Home</strong>.',
      ja_jp : 'このウェブアプリをあなたの%deviceにインストールするには%iconをタップして<strong>ホーム画面に追加</strong>を選んでください。',
      ko_kr : '%device에 웹앱을 설치하려면 %icon을 터치 후 "홈화면에 추가"를 선택하세요',
      nb_no : 'Installer denne appen på din %device: trykk på %icon og deretter <strong>Legg til på Hjem-skjerm</strong>',
      nl_nl : 'Installeer deze webapp op uw %device: tik %icon en dan <strong>Voeg toe aan beginscherm</strong>.',
      pl_pl : 'Aby zainstalować tę aplikacje na %device: naciśnij %icon a następnie <strong>Dodaj jako ikonę</strong>.',
      pt_br : 'Instale este aplicativo em seu %device: aperte %icon e selecione <strong>Adicionar à Tela Inicio</strong>.',
      pt_pt : 'Para instalar esta aplicação no seu %device, prima o %icon e depois o <strong>Adicionar ao ecrã principal</strong>.',
      ru_ru : 'Установите это веб-приложение на ваш %device: нажмите %icon, затем <strong>Добавить в «Домой»</strong>.',
      sv_se : 'Lägg till denna webbapplikation på din %device: tryck på %icon och därefter <strong>Lägg till på hemskärmen</strong>.',
      th_th : 'ติดตั้งเว็บแอพฯ นี้บน %device ของคุณ: แตะ %icon และ <strong>เพิ่มที่หน้าจอโฮม</strong>',
      tr_tr : 'Bu uygulamayı %device\'a eklemek için %icon simgesine sonrasında <strong>Ana Ekrana Ekle</strong> düğmesine basın.',
      uk_ua : 'Встановіть цей веб сайт на Ваш %device: натисніть %icon, а потім <strong>На початковий екран</strong>.',
      zh_cn : '您可以将此应用程式安装到您的 %device 上。请按 %icon 然后点选<strong>添加至主屏幕</strong>。',
      zh_tw : '您可以將此應用程式安裝到您的 %device 上。請按 %icon 然後點選<strong>加入主畫面螢幕</strong>。'
   };

   isIDevice = isIDevice || isAndroid || isBB || isWP;

   function init()
   {
      // Preliminary check, all further checks are performed on iDevices only
      if (!isIDevice)
         return;

      var now = Date.now(), i;

      // Merge local with global options
      if (w.addToHomeConfig)
      {
         for (i in w.addToHomeConfig )
         {
            options[i] = w.addToHomeConfig[i];
         }
      }
      if (!options.autostart)
         options.hookOnLoad = false;

      isIPad = (/ipad/gi).test(nav.platform);
      isRetina = w.devicePixelRatio && w.devicePixelRatio > 1;
      //isSafari = (/Safari/i).test(nav.appVersion) && !(/CriOS/i).test(nav.appVersion);
      isSafari = true;
      isStandalone = nav.standalone;

      if (isIDevice)
      {
         OSVersion = navigator.userAgent.match(/Version\/(\d+\.*\d+)/)[1];
      }
      else if (isAndroid)
      {
         OSVersion = navigator.userAgent.match(/(Android|Silk)\ (\d+\.*\d*)/)[2];
      }
      else if (isBB)
      {
         OSVersion = navigator.userAgent.match(/BB(\d+\.*\d*)/)[1] || navigator.userAgent.match(/BlackBerry\ (\d+)/)[1];
      }
      else if (isWP)
      {
         OSVersion = navigator.userAgent.match(/Windows\ Phone\ (\d+\.*\d*)/)[1];
      }
      OSSVersion = OSSVersion || 0;
      //OSVersion = nav.appVersion.match(/OS (\d+_\d+)/i);
      //OSVersion = OSVersion && OSVersion[1] ? +OSVersion[1].replace('_', '.') : 0;

      lastVisit = +w.localStorage.getItem('addToHome');

      isSessionActive = w.sessionStorage.getItem('addToHomeSession');
      isReturningVisitor = options.returningVisitor ? lastVisit && lastVisit + 28 * 24 * 60 * 60 * 1000 > now : true;

      if (!lastVisit)
         lastVisit = now;

      // If it is expired we need to reissue a new balloon
      isExpired = isReturningVisitor && lastVisit <= now;

      if (options.hookOnLoad)
         w.addEventListener('load', loaded, false);
      else if (!options.hookOnLoad && options.autostart)
         loaded();
   }

   function loaded()
   {
      w.removeEventListener('load', loaded, false);

      if (!isReturningVisitor)
         w.localStorage.setItem('addToHome', Date.now());
      else if (options.expire && isExpired)
         w.localStorage.setItem('addToHome', Date.now() + options.expire * 60000);

      if (!overrideChecks && (!isSafari || !isExpired || isSessionActive || isStandalone || !isReturningVisitor ))
         return;

      var touchIcon = '', platform = nav.platform.split(' ')[0], language = nav.language.replace('-', '_');

      balloon = document.createElement('div');
      balloon.id = 'addToHomeScreen';
      balloon.style.cssText += 'left:-9999px;-webkit-transition-property:-webkit-transform,opacity;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);position:' + (OSVersion < 5 ? 'absolute' : 'fixed');

      // Localize message
      if (options.message in intl)
      {
         // You may force a language despite the user's locale
         language = options.message;
         options.message = '';
      }
      if (options.message === '')
      {
         // We look for a suitable language (defaulted to en_us)
         options.message = language in intl ? intl[language] : intl['en_us'];
      }

      if (options.touchIcon)
      {
         touchIcon = isRetina ? document.querySelector('head link[rel^=apple-touch-icon][sizes="114x114"],head link[rel^=apple-touch-icon][sizes="144x144"],head link[rel^=apple-touch-icon]') : document.querySelector('head link[rel^=apple-touch-icon][sizes="57x57"],head link[rel^=apple-touch-icon]');

         if (touchIcon)
         {
            touchIcon = '<span style="background-image:url(' + touchIcon.href + ')" class="addToHomeTouchIcon"></span>';
         }
      }

      balloon.className = ( isIPad ? 'addToHomeIpad' : 'addToHomeIphone') + ( touchIcon ? ' addToHomeWide' : '');
      balloon.innerHTML = touchIcon + options.message.replace('%device', platform).replace('%icon', OSVersion >= 4.2 ? '<span class="addToHomeShare"></span>' : '<span class="addToHomePlus">+</span>') + (options.arrow ? '<span class="addToHomeArrow"></span>' : '') + (options.closeButton ? '<span class="addToHomeClose">\u00D7</span>' : '');

      document.body.appendChild(balloon);

      // Add the close action
      if (options.closeButton)
         balloon.addEventListener('click', clicked, false);

      if (!isIPad && OSVersion >= 6)
         window.addEventListener('orientationchange', orientationCheck, false);

      setTimeout(show, options.startDelay);
   }

   function show()
   {
      var duration, iPadXShift = 208;

      // Set the initial position
      if (isIPad)
      {
         if (OSVersion < 5)
         {
            startY = w.scrollY;
            startX = w.scrollX;
         }
         else if (OSVersion < 6)
         {
            iPadXShift = 160;
         }

         balloon.style.top = startY + options.bottomOffset + 'px';
         balloon.style.left = startX + iPadXShift - Math.round(balloon.offsetWidth / 2) + 'px';

         switch ( options.animationIn )
         {
            case 'drop':
               duration = '0.6s';
               balloon.style.webkitTransform = 'translate3d(0,' + -(w.scrollY + options.bottomOffset + balloon.offsetHeight) + 'px,0)';
               break;
            case 'bubble':
               duration = '0.6s';
               balloon.style.opacity = '0';
               balloon.style.webkitTransform = 'translate3d(0,' + (startY + 50) + 'px,0)';
               break;
            default:
               duration = '1s';
               balloon.style.opacity = '0';
         }
      }
      else
      {
         startY = w.innerHeight + w.scrollY;

         if (OSVersion < 5)
         {
            startX = Math.round((w.innerWidth - balloon.offsetWidth) / 2) + w.scrollX;
            balloon.style.left = startX + 'px';
            balloon.style.top = startY - balloon.offsetHeight - options.bottomOffset + 'px';
         }
         else
         {
            balloon.style.left = '50%';
            balloon.style.marginLeft = -Math.round(balloon.offsetWidth / 2) - (w.orientation % 180 && OSVersion >= 6 ? 40 : 0 ) + 'px';
            balloon.style.bottom = options.bottomOffset + 'px';
         }

         switch (options.animationIn)
         {
            case 'drop':
               duration = '1s';
               balloon.style.webkitTransform = 'translate3d(0,' + -(startY + options.bottomOffset) + 'px,0)';
               break;
            case 'bubble':
               duration = '0.6s';
               balloon.style.webkitTransform = 'translate3d(0,' + (balloon.offsetHeight + options.bottomOffset + 50) + 'px,0)';
               break;
            default:
               duration = '1s';
               balloon.style.opacity = '0';
         }
      }

      balloon.offsetHeight// repaint trick
      balloon.style.webkitTransitionDuration = duration;
      balloon.style.opacity = '1';
      balloon.style.webkitTransform = 'translate3d(0,0,0)';
      balloon.addEventListener('webkitTransitionEnd', transitionEnd, false);

      closeTimeout = setTimeout(close, options.lifespan);
   }

   function manualShow(override)
   {
      if (!isIDevice || balloon)
         return;

      overrideChecks = override;
      loaded();
   }

   function close()
   {
      clearInterval(positionInterval);
      clearTimeout(closeTimeout);
      closeTimeout = null;

      // check if the popup is displayed and prevent errors
      if (!balloon)
         return;

      var posY = 0, posX = 0, opacity = '1', duration = '0';

      if (options.closeButton)
         balloon.removeEventListener('click', clicked, false);
      if (!isIPad && OSVersion >= 6)
         window.removeEventListener('orientationchange', orientationCheck, false);

      if (OSVersion < 5)
      {
         posY = isIPad ? w.scrollY - startY : w.scrollY + w.innerHeight - startY;
         posX = isIPad ? w.scrollX - startX : w.scrollX + Math.round((w.innerWidth - balloon.offsetWidth) / 2) - startX;
      }

      balloon.style.webkitTransitionProperty = '-webkit-transform,opacity';

      switch ( options.animationOut )
      {
         case 'drop':
            if (isIPad)
            {
               duration = '0.4s';
               opacity = '0';
               posY += 50;
            }
            else
            {
               duration = '0.6s';
               posY += balloon.offsetHeight + options.bottomOffset + 50;
            }
            break;
         case 'bubble':
            if (isIPad)
            {
               duration = '0.8s';
               posY -= balloon.offsetHeight + options.bottomOffset + 50;
            }
            else
            {
               duration = '0.4s';
               opacity = '0';
               posY -= 50;
            }
            break;
         default:
            duration = '0.8s';
            opacity = '0';
      }

      balloon.addEventListener('webkitTransitionEnd', transitionEnd, false);
      balloon.style.opacity = opacity;
      balloon.style.webkitTransitionDuration = duration;
      balloon.style.webkitTransform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
   }

   function clicked()
   {
      w.sessionStorage.setItem('addToHomeSession', '1');
      isSessionActive = true;
      close();
   }

   function transitionEnd()
   {
      balloon.removeEventListener('webkitTransitionEnd', transitionEnd, false);

      balloon.style.webkitTransitionProperty = '-webkit-transform';
      balloon.style.webkitTransitionDuration = '0.2s';

      // We reached the end!
      if (!closeTimeout)
      {
         balloon.parentNode.removeChild(balloon);
         balloon = null;
         return;
      }

      // On iOS 4 we start checking the element position
      if (OSVersion < 5 && closeTimeout)
         positionInterval = setInterval(setPosition, options.iterations);
   }

   function setPosition()
   {
      var matrix = new WebKitCSSMatrix(w.getComputedStyle(balloon, null).webkitTransform), posY = isIPad ? w.scrollY - startY : w.scrollY + w.innerHeight - startY, posX = isIPad ? w.scrollX - startX : w.scrollX + Math.round((w.innerWidth - balloon.offsetWidth) / 2) - startX;

      // Screen didn't move
      if (posY == matrix.m42 && posX == matrix.m41)
         return;

      balloon.style.webkitTransform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
   }

   // Clear local and session storages (this is useful primarily in development)
   function reset()
   {
      w.localStorage.removeItem('addToHome');
      w.sessionStorage.removeItem('addToHomeSession');
   }

   function orientationCheck()
   {
      balloon.style.marginLeft = -Math.round(balloon.offsetWidth / 2) - (w.orientation % 180 && OSVersion >= 6 ? 40 : 0 ) + 'px';
   }

   // Bootstrap!
   init();

   return (
      {
         show : manualShow,
         close : close,
         reset : reset
      });
})(window);

window.debugMode = true;
window.merchantMode = false;
window.serverHost = location.origin;
window._application = null;
window._codec = null;
window.appName = 'GetKickBak';
window._hostPathPrefix = (debugMode) ? "/javascripts/build/MobileClient/" : "/";
window._hostPath = _hostPathPrefix + ((debugMode) ? "testing/" : "") + "";
window.phoneGapAvailable = false;

_totalAssetCount++;

/*
This file is generated and updated by Sencha Cmd. You can edit this file as
needed for your application, but these edits will have to be merged by
Sencha Cmd when it performs code generation tasks such as generating new
models, controllers or views and when running "sencha app upgrade".

Ideally changes to this file would be limited and most work would be done
in other places (such as Controllers). If Sencha Cmd cannot merge your
changes and its generated code, it will produce a "merge conflict" that you
will need to resolve manually.
*/

// DO NOT DELETE - this directive is required for Sencha Cmd packages to work.
//@require @packageOverrides

//@require ../mobile/lib/core/Overrides.js
//@require ../lib/add2home.js


(function()
{
   Genesis.db.getLocalDB();
   Genesis.db.getReferralDB();
   Genesis.db.getRedeemIndexDB();
   Genesis.db.getRedeemSortedDB();

   var launched = 0x000, pausedDisabled = true, backBtnCallbackListFn = [], offlineDialogShown = false, flag = 0x001, _error = false;
   var appLaunch = function()
   {
      if (launched == 0x111)
      {
         var viewport = _application.getController('client' + '.Viewport');
         viewport.appName = appName;

         if (_error)
         {
            console.log("Error Loading system File.");
            Ext.device.Notification.show(
            {
               title : 'KickBak',
               message : 'Error Connecting to Server.',
               buttons : ['Retry'],
               disableAnimations : true,
               callback : function(buttonId)
               {
                  window.location.reload();
               }
            });
         }
         else
         {
            Ext.create('Genesis.view.Viewport');
            console.debug("Launched App");
         }

         // Destroy the #appLoadingIndicator element
         Ext.fly('appLoadingIndicator').destroy();
         _loadingPct = null;
         Ext.fly('loadingPct').destroy();
      }
   };
   var appLaunchCallbackFn = function(success, val)
   {
      if (!success)
      {
         _error = success;
      }

      _filesAssetCount++;
      if ((flag |= val) == 0x111)
      {
         Ext.application(
         {
            viewport :
            {
               autoMaximize : true
            },
            name : 'Genesis',
            profiles : ['MobileClient'],
                                                                                                                         
            views : ['ViewBase', 'Document', 'client.UploadPhotosPage', 'client.ChallengePage', 'client.Rewards', 'client.Redemptions',
            // //
            'client.AccountsTransfer', 'client.SettingsPage', 'client.CheckinExplore', 'LoginPage', 'SignInPage', //
            'client.MainPage', 'widgets.client.RedeemItemDetail', 'client.Badges', 'client.JackpotWinners', 'client.MerchantAccount',
            // //
            'client.MerchantDetails', 'client.Accounts', 'client.Prizes', 'Viewport'],
            controllers : ['mobileClient.Challenges', 'client.Rewards', 'client.Redemptions', 'client.Viewport', 'client.MainPage',
            // //
            'client.Badges', 'client.Merchants', 'client.Accounts', 'client.Settings', 'client.Checkins', 'client.JackpotWinners', //
            'client.Prizes'],
            launch : function()
            {
               _application = this;
               if (launched > 0x000)
               {
                  launched |= 0x001;
               }
               else
               {
                  launched = 0x001;
               }
               console.debug("Ext App Launch")
               appLaunch();
            },
            isIconPrecomposed : true,
            icon :
            {
               36 : 'resources/icons/icon36.png',
               48 : 'resources/icons/icon48.png',
               57 : 'resources/icons/icon.png',
               72 : 'resources/icons/icon@72.png',
               114 : 'resources/icons/icon@2x.png',
               144 : 'resources/icons/icon@144.png'
            },
            onUpdated : function()
            {
               Ext.device.Notification.show(
               {
                  title : 'Application Update',
                  message : "This application has just successfully been updated to the latest version. Reload now?",
                  buttons : ['No', 'Yes'],
                  disableAnimations : true,
                  callback : function(buttonId)
                  {
                     if (!buttonId || (buttonId.toLowerCase() === 'yes'))
                     {
                        window.location.reload();
                     }
                  }
               });
            }
         });
      }
   };

   Ext.onReady(function()
   {
      console.debug = (!debugMode) ? Ext.emptyFn : console.debug || console.log;
      console.warn = console.warn || console.debug;

      launched |= 0x110;
      appLaunch();
   });

   // **************************************************************************
   // Bootup Sequence
   // **************************************************************************
   _filesAssetCount++;

   Ext.defer(function()
   {
      var targetelement = "script", targetattr = "src";
      var allsuspects = document.getElementsByTagName(targetelement);
      var imagePath = _hostPath + "resources/themes/images/v1/", images = [new Image(400, 400)], prefix;
      var resolution = (function()
      {
         return (((window.screen.height >= 641) && ((window.devicePixelRatio == 1.0) || (window.devicePixelRatio >= 2.0))) ? 'mxhdpi' : 'lhdpi');
      })();

      for (var i = allsuspects.length; i >= 0; i--)
      {
         if (allsuspects[i])
         {
            var attr = allsuspects[i].getAttribute(targetattr);
            if (attr)
            {
               Genesis.fn.filesadded[attr.replace(location.origin, "")] = [true];
            }
         }
      }

      if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
      {
         prefix = imagePath + "ios";
         if (Ext.os.is('iPhone5'))
         {
            _totalAssetCount++;
            Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/iphone5.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x010], true));
         }
         else
         {
            flag |= 0x010;
         }
      }
      else//
      //if (Ext.os.is('Android'))
      {
         flag |= 0x010;
         prefix = imagePath + "android/" + resolution;
         /*
          switch (resolution)
          {
          case 'lhdpi' :
          {
          Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-phone-lhdpi.css?v=" + Genesis.constants.clientVersion,
          "css",
          Ext.bind(appLaunchCallbackFn, null, [0x011], true));
          break;
          }
          case 'mxhdpi' :
          {
          Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-phone-mxhdpi.css?v=" + Genesis.constants.clientVersion,
          "css", Ext.bind(appLaunchCallbackFn, null, [0x011], true));
          break;
          }
          }
          */
      }

      var canPlayAudio = (new Audio()).canPlayType('audio/wav; codecs=1');
      if (!canPlayAudio)
      {
         //
         // If Worker is not supported, preload it
         //
         if ( typeof (Worker) == 'undefined')
         {
            Genesis.fn.checkloadjscssfile(_hostPathPrefix + 'lib/libmp3lame.min.js', "js", function(success)
            {
               console.log("Error Loading Application Resource File.");
               Ext.device.Notification.show(
               {
                  title : 'KickBak',
                  message : "Error Loading Application Resource File.",
                  buttons : ['Reload'],
                  disableAnimations : true,
                  callback : function(buttonId)
                  {
                     window.location.reload();
                  }
               });
            });
            Genesis.fn.checkloadjscssfile(_hostPath + "worker/encoder.js", "js", function()
            {
               _codec = new Worker('worker/encoder.js');
               appLaunchCallbackFn(true, 0x100);
               console.debug("Enable MP3 Encoder");
            });
         }
         else
         {
            _codec = new Worker('worker/encoder.js');
            appLaunchCallbackFn(true, 0x100);
            console.debug("Enable MP3 Encoder");
         }
      }
      else
      {
         appLaunchCallbackFn(true, 0x100);
         console.debug("Enable WAV/WebAudio Encoder");
      }
      images[0].src = prefix + "/prizewon/transmit.png";
   }, 0.1 * 1000);
})();

