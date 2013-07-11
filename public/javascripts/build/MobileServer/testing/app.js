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
   lostPosConnectionMsg : 'Reestablishing connection to POS ...',
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
            if (successCallback)
            {
               successCallback();
            }
            //sound_file['successCallback'] = successCallback || Ext.emptyFn;
            //Ext.get(sound_file['name']).dom.play();
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
      && (!Genesis.db.getReferralDBAttrib("m" + merchantId)))// Haven't been referred by a friend yet
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
                  html : me.fbConnectRequestMsg + '<img width="160" style="margin:0.7em 0;" src="' + Genesis.constants.resourceSite + 'images/facebook_icon.png"/>'
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
                  // MobileWeb do not support Referrals and Transfers
                  //
                  else if (_application.getProfileInstances()[0].getName().match(/mobileWeb/i))
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
      //padding : '1.0',
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
            docked : 'bottom',
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

      me.callParent(arguments);
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
      var me = this, itemHeight = 1 + Genesis.constants.defaultIconSize() + 2 * Genesis.fn.calcPx(0.65, 1);

      console.debug("itemHeight=" + itemHeight);
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

Ext.define('Genesis.controller.server.Challenges',
{
   extend :  Genesis.controller.ControllerBase ,
                                 
   inheritableStatics :
   {
   },
   xtype : 'serverChallengesCntlr',
   config :
   {
      models : ['PurchaseReward', 'CustomerReward'],
      refs :
      {
         //
         // Challenges
         //
         challenges : 'serverredeemitemdetailview[tag=redeemPrize]',
         authText : 'serverredeemitemdetailview[tag=redeemPrize] component[tag=authText]'
      },
      control :
      {
         /*,
          refreshBtn :
          {
          tap : 'onRefreshTap'
          }
          */
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   //genAuthCodeMsg : 'Proceed to generate Authorization Code',
   generatingAuthCodeMsg : 'Generating Code ...',
   refreshAuthCodeMsg : 'Refresing ...',
   challengeSuccessfulMsg : 'Challenge Completed!',
   challengeFailedMsg : 'Failed to Complete Challenge!',
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Challenges Init");
   },
   generateQRCode : function()
   {
      return this.self.genQRCodeFromParams(
      {
         "type" : 'earn_points'
      }, 'challenge', false);
   },
   // --------------------------------------------------------------------------
   // Server Challenges Page
   // --------------------------------------------------------------------------
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      //oldActiveItem.removeAll(true);
      viewport.setActiveController(null);
      if (me.scanTask)
      {
         clearInterval(me.scanTask);
         me.scanTask = null;
      }
   },
   /*
    onRefreshTap : function(b, e, eOpts)
    {
    var me = this;
    //Ext.Viewport.setMasked(
    //{
    //xtype : 'loadmask',
    //message : me.refreshAuthCodeMsg
    //});
    var app = me.getApplication();
    var controller = app.getController('server.Prizes');
    Ext.defer(function()
    {
    var qrcode = me.generateQRCode();
    if (qrcode[0])
    {
    controller.fireEvent('refreshQRCode', qrcode);
    }
    //Ext.Viewport.setMasked(null);
    }, 100, me);
    me.onGenerateQRCode(true);
    },
    */
   onGenerateQRCode : function(refresh)
   {
      var me = this, identifiers = null, viewport = me.getViewPortCntlr(), proxy = Challenge.getProxy();

      me.dismissDialog = false;
      if (!refresh)
      {
         /*
          Ext.Viewport.setMasked(
          {
          xtype : 'loadmask',
          message : me.generatingAuthCodeMsg
          });
          */
         Ext.defer(function()
         {
            /*
             var qrcode = me.generateQRCode();
             if (qrcode[0])
             {
             console.debug("Rendering QRCode ...");
             */
            {
               var controller = me.getApplication().getController('server.Prizes');
               var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
               var photoUrl =
               {
               };
               /*
                photoUrl[prefix] =
                {
                url : qrcode[0],
                height : qrcode[1] * 1.25,
                width : qrcode[2] * 1.25,
                }
                */
               photoUrl[prefix] =
               {
                  url : me.self.getPhoto(
                  {
                     value : 'transmit'
                  })
               }
               var reward = Ext.create('Genesis.model.CustomerReward',
               {
                  id : 0,
                  title : 'Authorization',
                  type :
                  {
                     value : 'earn_points'
                  },
                  //photo : photoUrl
                  photo : photoUrl
               });
               controller.fireEvent('authreward', reward);
            }
            //Ext.Viewport.setMasked(null);
         }, 100, me);
      }

      me.challengeItemFn = function(params, closeDialog)
      {
         me.dismissDialog = closeDialog;
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         Ext.device.Notification.dismiss();

         params = Ext.merge(params,
         {
            'venue_id' : Genesis.fn.getPrivKey('venueId'),
            data :
            {
               "type" : 'earn_points',
               'expiry_ts' : new Date().addHours(3).getTime()
            }
         });
         params['data'] = me.self.encryptFromParams(params['data']);

         //
         // Updating Server ...
         //
         console.debug("Updating Server with EarnPoints information ... dismissDialog(" + me.dismissDialog + ")");
         Challenge['setCompleteMerchantChallengeURL']();
         Challenge.load(1,
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : params,
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Challenge',
                     message : me.challengeSuccessfulMsg,
                     buttons : ['OK'],
                     callback : function()
                     {
                        me.popView();
                     }
                  });
               }
               else
               {
                  //proxy._errorCallback = Ext.bind(me.popView, me);
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : 'Challenge',
                     message : me.challengeFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsCallbackFn();
                     }
                  });
               }
            }
         });
      };

      me.getLocalID(function(ids)
      {
         identifiers = ids;
         me.challengeItemFn(
         {
            data :
            {
               'frequency' : identifiers['localID']
            }
         }, true);
      }, function()
      {
         viewport.setActiveController(null);
         Ext.Viewport.setMasked(null);
         me.popView();
      }, Ext.bind(me.onGenerateQRCode, me, arguments));
      viewport.setActiveController(me);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      var me = this;
      me.onGenerateQRCode();
   },
   isOpenAllowed : function()
   {
      return true;
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'transmit' :
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               break;
         }
         return photo_url;
      }
   }
});

Ext.define('Genesis.view.server.MainPage',
{
   extend :  Genesis.view.MainPageBase ,
   alias : 'widget.servermainpageview',
   config :
   {
      items : ( function()
         {
            var items = [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
            {
               xtype : 'titlebar',
               cls : 'navigationBarTop kbTitle'
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
      return '';
   }
});

Ext.define('Genesis.controller.server.MainPage',
{
   extend :  Genesis.controller.MainPageBase ,
   xtype : 'mainPageCntlr',
   config :
   {
      models : ['Genesis.model.frontend.MainPage', 'CustomerReward'],
      refs :
      {
         // Main Page
         main :
         {
            selector : 'servermainpageview',
            autoCreate : true,
            xtype : 'servermainpageview'
         },
         mainCarousel : 'servermainpageview'
      }
   },
   initCallback : function()
   {
      var me = this;

      me.goToMain();
      var venueId = Genesis.fn.getPrivKey('venueId');
      if (venueId == 0)
      {
         Ext.device.Notification.show(
         {
            title : 'Missing License Key!',
            message : me.missingLicenseKeyMsg,
            buttons : ['Cancel', 'Proceed'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'proceed')
               {
                  me.getApplication().getController('Settings').fireEvent('upgradeDevice');
               }
            }
         });
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      console.log("Server MainPage Init");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;
      me.getApplication().getController('server.Merchants').onNfc(nfcResult);
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.getViewPortCntlr().setActiveController(me);
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      me.getViewPortCntlr().setActiveController(null);
   }
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});

Ext.define('Genesis.view.server.MerchantAccount',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                                                  
   alias : 'widget.servermerchantaccountview',
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
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
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
      if (activeItem.isXType('mainpageview', true))
      {
         this.removeAll(true);
      }
      this.callParent(arguments);
   },
   showView : function()
   {
      this.callParent(arguments);
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      me.setPreRender(me.getPreRender().concat([
      // -----------------------------------------------------------------------
      // Merchant Photos and Customer Points
      // -----------------------------------------------------------------------
      Ext.create('Ext.dataview.DataView',
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
      }), Ext.create('Ext.form.Panel',
      {
         xtype : 'formpanel',
         margin : '0 0.8 0.7 0.8',
         defaultUnit : 'em',
         scrollable : null,
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'fieldset',
            title : 'Account Profile',
            //instructions : 'Tell us all about yourself',
            defaults :
            {
               labelWidth : '50%',
               readOnly : true,
               required : false
            },
            items : [
            {
               xtype : 'textfield',
               name : 'tagid',
               clearIcon : false,
               label : "Tag ID",
               value : ' '
            },
            {
               xtype : 'textfield',
               cls : 'halfHeight',
               labelWidth : '100%',
               name : 'user',
               label : "John Smith" + "<br/>" + "<label>johnsmith@example.com</label>",
               value : ' '
            },
            {
               xtype : 'datepickerfield',
               labelWidth : '30%',
               label : 'Birthday',
               name : 'birthday',
               dateFormat : 'M j',
               picker :
               {
                  yearFrom : 1913,
                  doneButton :
                  {
                     ui : 'normal'
                  }
               },
               value : 0
            }, Ext.applyIf(
            {
               labelWidth : '30%',
               placeHolder : '',
               label : 'Phone #',
               name : 'phone',
               required : false
            }, Genesis.view.ViewBase.phoneField())]
         }]
      })]));
      //console.debug("minWidth[" + window.innerWidth + "], minHeight[" + window.innerHeight + "]");
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

Ext.define('Genesis.controller.server.Merchants',
{
   extend :  Genesis.controller.ControllerBase ,
                                 
   inheritableStatics :
   {
      googleMapStaticUrl : 'http://maps.googleapis.com/maps/api/staticmap'
   },
   xtype : 'servermerchantsCntlr',
   config :
   {
      routes :
      {
         'venue/:id/:id' : 'mainPage'
      },
      refs :
      {
         main :
         {
            selector : 'servermerchantaccountview',
            autoCreate : true,
            xtype : 'servermerchantaccountview'
         },
         form : 'servermerchantaccountview formpanel',
         merchantMain : 'servermerchantaccountview container[tag=merchantMain]',
         tbPanel : 'servermerchantaccountview dataview[tag=tbPanel]',
         prizesBtn : 'merchantaccountptsitem component[tag=prizepoints]',
         redeemBtn : 'merchantaccountptsitem component[tag=points]'
      },
      control :
      {
         main :
         {
            showView : 'onMainShowView',
            activate : 'onMainActivate',
            deactivate : 'onMainDeactivate'
         }
      }
   },
   init : function()
   {
      var me = this;
      //
      // Store used for rendering purposes
      //
      Ext.regStore('MerchantRenderStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });

      me.callParent(arguments);

      console.log("Merchants Server Init");

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
            me.redirectTo('main');
            return true;
         }
         return false;
      });
   },
   getAccountFields : function(account)
   {
      var me = this, form = me.getForm();

      return (
         {
            'birthday' :
            {
               field : form.query('datepickerfield[name=birthday]')[0],
               fn : function(field)
               {
                  var birthday = new Date.parse(account['birthday']);
                  return (!birthday || !( birthday instanceof Date)) ? ' ' : birthday;
               }
            },
            'phone' :
            {
               field : form.query('textfield[name=phone]')[0],
               fn : function(field)
               {
                  var phone = account['phone'].match(Account.phoneRegex);
                  return (phone[1] + '-' + phone[2] + '-' + phone[3]);
               }
            }
         });
   },
   showAccountInfo : function(account, tagId)
   {
      var i, f, me = this, fields = me.getAccountFields(account), form = me.getForm();

      for (i in fields)
      {
         f = fields[i];
         if (account[i])
         {
            f[i] = f.fn(f.field);
         }
         //
         // Default Value
         //
         else
         {
            f[i] = null;
         }
      }

      form.setValues(
      {
         birthday : fields['birthday'].birthday,
         phone : fields['phone'].phone,
         tagid : tagId
      });
      form.query('textfield[name=user]')[0].setLabel(account['name'] + '<br/>' + '<label>' + account['email'] + "</label>");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this, venueId = Genesis.fn.getPrivKey('venueId'), viewport = me.getViewPortCntlr();
      nfcResult = nfcResult ||
      {
         id : null,
         result :
         {
            'tagID' : null
         }
      };
      console.debug("Retrieving Customer Account for ID[" + nfcResult.id + "] tagID[" + nfcResult.result['tagID'] + '], venueId[' + venueId + ']');

      var params =
      {
         device_pixel_ratio : window.devicePixelRatio,
         data : me.self.encryptFromParams(
         {
            'uid' : nfcResult.id,
            'tag_id' : nfcResult.result['tagID']
         }, 'reward')
      }
      //
      // Retrieve Venue / Customer information for Merchant Account display
      //
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.establishConnectionMsg
      });
      Customer['setGetCustomerUrl']();
      Customer.load(venueId,
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         params : params,
         callback : function(record, operation)
         {
            var metaData = Customer.getProxy().getReader().metaData;
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful() && metaData)
            {
               me.account = metaData['account'];
               me.tagID = nfcResult.result['tagID'];
               //console.log("Customer[" + Ext.encode(record) + "]");
               Ext.StoreMgr.get('CustomerStore').setData(record);
               viewport.setCustomer(record);
               var info = viewport.getCheckinInfo();
               info.customer = viewport.getCustomer();
               me.redirectTo('venue/' + venueId + '/' + info.customer.getId());
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Merchant Account Page
   // --------------------------------------------------------------------------
   checkInAccount : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var venue = viewport.getVenue();

      //
      // Force Page to refresh
      //
      var controller = vport.getEventDispatcher().controller;
      var anim = new Ext.fx.layout.Card(me.self.animationMode['fade']);
      anim.on('animationend', function()
      {
         console.debug("Animation Complete");
         anim.destroy();
      }, me);
      //if (!controller.isPausing)
      {
         console.debug("Reloading current Merchant Home Account Page ...");

         var page = me.getMainPage();

         // Delete current page and refresh
         page.removeAll(true);
         vport.animateActiveItem(page, anim);
         anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
         vport.doSetActiveItem(page, null);
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
         monitors[activeItem.element.getId()].onElementPainted(
         {
            animationName : 'x-paint-monitor-helper'
         });
      }
      me.showAccountInfo(me.account, me.tagID);
   },
   onMainActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      console.debug("Merchant Account Activate");
      var me = this, viewport = me.getViewPortCntlr();
      var vrecord = viewport.getVenue();
      var crecord = viewport.getCustomer();

      viewport.setActiveController(me);
      var rstore = Ext.StoreMgr.get('MerchantRenderStore');
      //if (rstore.getRange()[0] != vrecord)
      {
         rstore.setData(vrecord);
         //
         // Update Customer Statistics
         // in case venue object was never updated ...
         //
         me.onCustomerRecordUpdate(crecord);
      }
      //page.createView();

      var scroll = activeItem.getScrollable();
      scroll.getScroller().scrollTo(0, 0);

      // Update TitleBar
      var bar = activeItem.query('titlebar')[0];
      bar.setTitle(' ');
      Ext.defer(function()
      {
         // Update TitleBar
         bar.setTitle(vrecord.get('name'));
      }, 1, me);

      console.debug("TagID[" + me.tagID + "] Account Info [" + Ext.encode(me.account) + "]");
   },
   onMainDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      //
      // Disable NFC Capability
      //
      viewport.setActiveController(null);
      /*
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
      activeItem.getInnerItems()[i].setVisibility(false);
      }
      */
      //
      // Remove Customer information
      //
      viewport.setCustomer(null);
      Ext.StoreMgr.get('CustomerStore').removeAll(true);
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
               dom = Ext.DomQuery.select('span', prize.element.dom)[0];
               Ext.fly(dom)[customer.get('eligible_for_prize') ? 'removeCls' : 'addCls']("x-item-hidden");
            }
            if (redeem)
            {
               dom = Ext.DomQuery.select('span', redeem.element.dom)[0];
               Ext.fly(dom)[customer.get('eligible_for_reward') ? 'removeCls' : 'addCls']("x-item-hidden");
            }
            //rstore.fireEvent('refresh', rstore, rstore.data);
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function(venueId, customerId)
   {
      this.openMainPage();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getMain();
   },
   openMainPage : function()
   {
      var me = this;
      var vport = me.getViewport();

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
});


Ext.define('Genesis.controller.server.mixin.RedeemBase',
{
   extend :  Ext.mixin.Mixin ,
   inheritableStatics :
   {
   },
   config :
   {
      closeBtn : null,
      sDoneBtn : null,
      sRedeemBtn : null
   },
   phoneIdMaxLength : 10,
   redeemPtsConfirmMsg : 'Please confirm to submit',
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Tag Tab
   // --------------------------------------------------------------------------
   onEnterPhoneNum : function()
   {
      var me = this, container = me.getRedeemItemCardContainer();
      container.setActiveItem(1);
   },
   onTagIdBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, value = b.getText();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      switch (value)
      {
         case 'AC' :
         {
            phoneIdField.reset();
            break;
         }
         default :
            if (phoneIdFieldLength < me.phoneIdMaxLength)
            {
               phoneId += value;
               phoneIdField.setValue(phoneId);
            }
            break;
      }
   },
   onTagItTap : function()
   {
      var me = this, viewport = me.getViewPortCntlr(), container = me.getRedeemItemCardContainer();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      if (phoneIdFieldLength == me.phoneIdMaxLength)
      {
         me.self.playSoundFile(viewport.sound_files['nfcEnd']);
         me.onRedeemItemTap(null);

         me.onNfc(
         {
            id : null,
            result :
            {
               'phoneID' : phoneId
            }
         });
      }
      else
      {
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         Ext.device.Notification.show(
         {
            title : me.getRedeemPopupTitle(),
            message : me.invalidPhoneIdFormatMsg(me.phoneIdMaxLength),
            buttons : ['Dismiss']
         });
      }
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.redeemItemFn(
      {
         data : me.self.encryptFromParams(
         {
            'uid' : (nfcResult) ? nfcResult.id : null,
            'tag_id' : (nfcResult) ? nfcResult.result['tagID'] : null,
            'phone_id' : (nfcResult) ? nfcResult.result['phoneID'] : null,
            'expiry_ts' : new Date().addHours(3).getTime()
         }, 'reward')
      }, true);
   },
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemItem();
      var item = view.getInnerItems()[0];

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img', photo.element.dom)[0]);
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.25),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.25)
      });
   },
   redeemItemCb : function(b)
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.popUpInProgress = false;
      me._actions.hide();
      viewport.setActiveController(null);
      clearInterval(me.scanTask);
      me.scanTask = null;
      //
      // Stop receiving ProximityID
      //
      window.plugins.proximityID.stop();

      if (b && (b.toLowerCase() == 'manual'))
      {
         Ext.Viewport.setMasked(null);
         me.onEnterPhoneNum();
      }
      else if (!me.dismissDialog)
      {
         Ext.Viewport.setMasked(null);
         me.onDoneTap();
      }
   },
   onRedeemItem : function(btn, venue, view)
   {
      var me = this, identifiers = null;
      var viewport = me.getViewPortCntlr(), item = view.query("container[tag=redeemItemContainer]")[0].getInnerItems()[0];
      var venueId = (venue) ? venue.getId() : 0;
      var storeName = me.getRedeemStore(), store = Ext.StoreMgr.get(storeName);
      var params =
      {
         version : Genesis.constants.serverVersion,
         venue_id : venueId
      }
      var message = me.lookingForMobileDeviceMsg();
      var proxy = store.getProxy();

      me.dismissDialog = false;
      me.redeemItemFn = function(p, closeDialog)
      {
         me.dismissDialog = closeDialog;
         me.redeemItemCb();
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         //Ext.device.Notification.dismiss();
         //
         // Update Server
         //
         console.debug("Updating Server with Redeem information ... dismissDialog(" + me.dismissDialog + ")");

         CustomerReward[me.getRedeemPointsFn()](item.getData().getId());

         store.load(
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : Ext.apply(params, p),
            callback : function(records, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
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
      };

      if (!btn)
      {
         return;
      }

      if (!me._actions)
      {
         me._actions = Ext.create('Genesis.view.widgets.PopupItemDetail',
         {
            iconType : 'prizewon',
            icon : 'rss',
            //cls : 'viewport',
            title : message,
            buttons : [
            {
               margin : '0 0 0.5 0',
               text : me.mobilePhoneInputMsg,
               ui : 'action',
               height : '3em',
               handler : Ext.bind(me.redeemItemCb, me, ['manual'])
            },
            {
               margin : '0.5 0 0 0',
               text : 'Cancel',
               ui : 'cancel',
               height : '3em',
               handler : Ext.bind(me.redeemItemCb, me, ['cancel'])
            }]
         });
         Ext.Viewport.add(me._actions);
      }
      viewport.popUpInProgress = true;
      me._actions.show();

      me.getLocalID(function(idx)
      {
         identifiers = idx;
         me.redeemItemFn(
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : identifiers['localID'],
               'expiry_ts' : new Date().addHours(3).getTime()
            }, 'reward')
         }, true);
      }, function()
      {
         me._actions.hide();
         me.onDoneTap();
      }, Ext.bind(me.onRedeemItem, me, arguments));
      viewport.setActiveController(me);
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
            me.fireEvent('redeemitem', btn, venue, view);
            break;
         }
      }
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, container = me.getRedeemItemCardContainer();
      container.setActiveItem(0);

      console.debug("Server ReedeemBase: onActivate");
   },
   onRedeemItemCardContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getRedeemItemCardContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'redeemItemContainer' :
         {
            animation.setReverse(true);
            break;
         }
         case 'phoneId' :
         {
            me.getPhoneId().reset();
            animation.setReverse(true);
            break;
         }
      }
      console.debug("Prizes Redeem ContainerActivate Called.");
   },
   onRedeemItemShowView : function(activeItem)
   {
      var me = this;
      console.debug("onRedeemItemShowView - RedeemMode[" + me.getRedeemMode() + "]");
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      //
      // In Redeem Mode
      //
      me.getRedeemItemButtonsContainer()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      //
      // In Challendge
      //
      me.getAuthText()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();

      console.debug("RewardItem View - Updated RewardItem View.");
   }
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});

Ext.define('Genesis.view.server.Prizes',
{
   extend :  Genesis.view.RedeemBase ,
                                                    
   alias : 'widget.serverprizesview',
   config :
   {
      defaultItemType : 'prizeptsitem',
      redeemTitleText : 'Prizes available to redeem (Select an item below)',
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
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   createView : function(activeItemIndex)
   {
      if (!this.callParent(arguments))
      {
         return;
      }
      this._createView('PrizeStore', 'PrizeRenderCStore', activeItemIndex);
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

Ext.define('Genesis.view.widgets.server.RedeemItemDetail',
{
   extend :  Genesis.view.widgets.ItemDetail ,
                                                                   
   alias : 'widget.serverredeemitemdetailview',
   config :
   {
      itemXType : 'redeemitem',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Prizes',
         items : [
         {
            hidden : true,
            align : 'left',
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            hidden : true,
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         }]
      }),
      {
         xtype : 'container',
         flex : 1,
         tag : 'redeemItemCardContainer',
         layout :
         {
            type : 'card',
            animation :
            {
               duration : 600,
               easing : 'ease-in-out',
               type : 'slide',
               direction : 'down'
            }
         },
         activeItem : 0,
         items : [
         {
            xtype : 'container',
            layout :
            {
               type : 'vbox',
               pack : 'center',
               align : 'stretch'
            },
            tag : 'redeemItemContainer',
            items : [
            {
               hidden : true,
               docked : 'bottom',
               xtype : 'component',
               tag : 'authText',
               margin : '0 0.7 0.8 0.7',
               style : 'text-align:center;',
               defaultUnit : 'em',
               html : (function()//Send
               {
                  return 'Tap your Mobile Device onto the Terminal' + Genesis.constants.addCRLF()//
               })()
               //,ui : 'orange-large'
            },
            {
               hidden : true,
               docked : 'bottom',
               cls : 'bottomButtons',
               xtype : 'container',
               tag : 'bottomButtons',
               layout : 'hbox',
               marginTop : 0,
               defaults :
               {
                  xtype : 'button',
                  flex : 1
               },
               items : [
               {
                  tag : 'merchantRedeem',
                  text : 'GO!',
                  ui : 'orange-large'
               }]
            }]
         },
         // -------------------------------------------------------------------
         // Reward Calculator
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'phoneId',
            title : 'Enter Mobile Number',
            placeHolder : '8005551234',
            bottomButtons : [
            {
               tag : 'redeemTagId',
               text : 'Submit',
               ui : 'orange-large'

            }]
         }]
      }],
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
      var me = this, viewport = _application.getController('server' + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      me.fireEvent('redeemItemTap', b);
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      var me = this, redeemItemContainer = me.query("container[tag=redeemItemContainer]")[0];
      if (redeemItemContainer)
      {
         if (redeemItemContainer.getInnerItems().length == 0)
         {
            redeemItemContainer.add(me.getPreRender());
         }
      }
      Ext.defer(me.fireEvent, 0.01 * 1000, me, ['showView', me]);
   },
   createView : function()
   {
      var me = this, redeemItemContainer = me.query("container[tag=redeemItemContainer]")[0];
      if (!Genesis.view.ViewBase.prototype.createView.call(me, arguments) && redeemItemContainer && (redeemItemContainer.getInnerItems().length > 0))
      {
         var item = redeemItemContainer.getInnerItems()[0];
         //
         // Refresh RedeemItem
         //
         item.setData(me.item)
         item.updateItem(me.item);
      }
      else
      {

         me.setPreRender([
         {
            flex : 1,
            xtype : me.getItemXType(),
            hideMerchant : true,
            data : me.item
         }]);
      }
      delete me.item;
   }
});

Ext.define('Genesis.controller.server.Prizes',
{
   extend :  Genesis.controller.PrizeRedemptionsBase ,
   mixins :
   {
      redeemBase :  Genesis.controller.server.mixin.RedeemBase 
   },
                                                               
   inheritableStatics :
   {
   },
   xtype : 'serverPrizesCntlr',
   config :
   {
      redeemPointsFn : 'setMerchantRedeemPointsURL',
      routes :
      {
         'authReward' : 'authRewardPage'
      },
      refs :
      {
         backBtn : 'serverprizesview button[tag=back]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverprizesview',
            autoCreate : true,
            xtype : 'serverprizesview'
         },
         redemptionsList : 'serverprizesview list[tag=prizesList]',
         redeemItemCardContainer : 'serverredeemitemdetailview[tag=redeemPrize] container[tag=redeemItemCardContainer]',
         redeemItemButtonsContainer : 'serverredeemitemdetailview[tag=redeemPrize] container[tag=bottomButtons]',
         phoneId : 'serverredeemitemdetailview[tag=redeemPrize] calculator[tag=phoneId] textfield',
         mRedeemBtn : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=merchantRedeem]',
         //
         // Reward Prize
         //
         sBackBB : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=back]',
         sCloseBB : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=close]',
         authText : 'serverredeemitemdetailview[tag=redeemPrize] component[tag=authText]',
         redeemItem :
         {
            selector : 'serverredeemitemdetailview[tag=redeemPrize]',
            autoCreate : true,
            tag : 'redeemPrize',
            xtype : 'serverredeemitemdetailview'
         }
      },
      control :
      {
         mRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         },
         redeemItemCardContainer :
         {
            activeitemchange : 'onRedeemItemCardContainerActivate'
         },
         'serverredeemitemdetailview[tag=redeemPrize] calculator[tag=phoneId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverredeemitemdetailview[tag=redeemPrize] calculator[tag=phoneId] container[tag=bottomButtons] button[tag=redeemTagId]' :
         {
            tap : 'onTagItTap'
         }
      },
      listeners :
      {
         //
         // Redeem Prize
         //
         'authreward' : 'onAuthReward',
         'refreshQRCode' : 'onRefreshQRCode'
      }
   },
   redeemPtsConfirmMsg : 'Please confirm to submit',
   init : function()
   {
      var me = this;
      me.callParent(arguments);

      console.log("Prizes Server Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.mixins.redeemBase.onNfc.apply(me, arguments);
   },
   onAuthReward : function(redeemItem)
   {
      this.redeemItem = redeemItem;
      this.redirectTo('authReward');
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      me.callParent(arguments);
      me.mixins.redeemBase.onRedeemItemActivate.apply(me, arguments);
   },
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      if (me.getRedeemMode() == 'authReward')
      {
         me.getApplication().getController('server' + '.Challenges').onRedeemItemDeactivate(oldActiveItem, c, newActiveItem, eOpts);
      }
      me.callParent(arguments);
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   authRewardPage : function()
   {
      this.setTitle('Challenges');
      this.openPage('authReward');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});

Ext.define('Genesis.model.frontend.ReceiptItem',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'ReceiptItem',
   id : 'ReceiptItem',
   config :
   {
      fields : ['qty', 'price', 'name']
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.model.frontend.Receipt',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'Receipt',
   id : 'Receipt',
   config :
   {
      fields : ['id', 'tnxId',
      {
         name : 'subtotal',
         type : 'float'
      },
      'itemsPurchased',
      {
         name : 'price',
         type : 'float'
      }, 'title', 'table', 'receipt'],
      idProperty : 'id',
      hasMany : [
      {
         model : 'Genesis.model.frontend.ReceiptItem',
         name : 'items'
      }]
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.model.frontend.Table',
{
   extend :  Ext.data.Model ,
   alternateClassName : 'Table',
   id : 'Table',
   config :
   {
      fields : ['id'],
      idProperty : 'id'
   },
   inheritableStatics :
   {
   }
});

var wssocket = null, initReceipt = 0x00, posConnect = Ext.emptyFn, posDisconnect = Ext.emptyFn, lastPosDisonnectTime = 0;
var isPosEnabled = function()
{
   var db = Genesis.db.getLocalDB(), rc = db['enablePosIntegration'] && db['isPosEnabled'];
   //console.debug("WebSocketClient::isPosEnabled(" + rc + ")");
   return rc;
};
var retrieveReceipts = function()
{
   if (wssocket)
   {
      Ext.Viewport.setMasked(null);
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : Genesis.controller.server.Receipts.prototype.retrieveReceiptsMsg
      });
      wssocket.send('get_receipts');
   }
};

Ext.require(['Genesis.model.frontend.ReceiptItem', 'Genesis.model.frontend.Receipt', 'Genesis.controller.ControllerBase'], function()
{
   var db = Genesis.db.getLocalDB();
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

   WebSocket._connTask = Ext.create('Ext.util.DelayedTask');
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
         var receiptsList = [], tableList = [];
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
            }
            else
            {
               console.debug("Receipt[" + i + "] is not valid, discarded.");
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

   posConnect = function(i)
   {
      var posEnabled = isPosEnabled(), scheme = 'ws://', host = (Genesis.fn.isNative()) ? '192.168.159.1' : '127.0.0.1', port = '443';

      if (posEnabled && Ext.Viewport)
      {
         i = i || 0;
         if (!wssocket && //
         ((Genesis.fn.isNative() && Ext.device.Connection.isOnline()) || (navigator.onLine)))
         {
            var ws = WebSocket.prototype;
            var url = scheme + host + ':' + port + "/pos";
            wssocket = new WebSocket(url, 'json');
            //wssocket.binaryType = 'arraybuffer';
            wssocket.onopen = function(event)
            {
               Ext.Viewport.setMasked(null);

               var db = Genesis.db.getLocalDB();
               var cntlr = _application.getController('server' + '.Receipts');
               //
               // Retrieve new connections after 5mins of inactivity
               //
               console.debug("WebSocketClient::onopen");

               lastPosDisonnectTime = db['lastPosDisconnectTime'] || 0;
               initReceipt |= 0x10;
               if (cntlr)
               {
                  cntlr.fireEvent('retrieveReceipts');
               }
               Genesis.db.setLocalDBAttrib('lastPosConnectTime', Date.now());
            };
            wssocket.onmessage = function(event)
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
                  Genesis.fn.systemTime = inputStream['systemTime'] * 1000;
                  Genesis.fn.clientTime = new Date().getTime();

                  switch (cmd)
                  {
                     case 'receipt_incoming' :
                     {
                        //console.debug("WebSocketClient::receipt_incoming ...")
                        wssocket.receiptIncomingHandler(inputStream['receipts']);
                        break;
                     }
                     case 'receipt_response' :
                     {
                        //console.debug("WebSocketClient::receipt_response ...")
                        wssocket.receiptResponseHandler(inputStream['receipts']);
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
            };
            wssocket.onerror = function(event)
            {
               console.debug("WebSocketClient::onerror");
            };
            wssocket.onclose = function(event)
            {
               var timeout = wssocket.reconnectTimer;
               console.debug("WebSocketClient::onclose, 5sec before retrying ...");
               //delete WebSocket.store[event._target];
               wssocket = null;
               //
               // Reconnect to server continuously
               //
               Genesis.db.setLocalDBAttrib('lastPosDisconnectTime', Date.now());
               WebSocket._connTask.delay(timeout, posConnect, wssocket, [++i]);
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
   extend :  Genesis.controller.ControllerBase ,
                                                                                                                                 
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
         'resetReceipts' : 'onResetReceipts',
         'retrieveReceipts' : 'onRetrieveReceipts'
      }
   },
   retrieveReceiptsMsg : 'Retrieving Receipts from POS ...',
   mobileTimeout : ((debugMode) ? 0.25 : 1) * 60 * 1000,
   fixedTimeout : ((debugMode) ? 0.25 : 4 * 60) * 60 * 1000,
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
      var me = this;

      me.callParent(arguments);

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
               initReceipt |= 0x01;
               me.fireEvent('retrieveReceipts', null);
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
   posIntegrationHandler : function(metaData, posEnabled)
   {
      var me = this, db = Genesis.db.getLocalDB(), features_config = metaData['features_config'];

      db['enablePosIntegration'] = features_config['enable_pos'];
      db['isPosEnabled'] = ((posEnabled === undefined) || (posEnabled));
      if (isPosEnabled())
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
      var displayMode = db["displayMode"], enableReceiptUpload = db['enableReceiptUpload'], posEnabled = isPosEnabled();
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
         me.updateMetaDataInfo(viewport.getMetaData());
         //
         // Update Native Code
         //
         if (Genesis.fn.isNative())
         {
            window.plugins.WifiConnMgr.setIsPosEnabled(isPosEnabled());
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

      if (initReceipt == 0x11)
      {
         var store = Ext.StoreMgr.get('ReceiptStore');
         var db = Genesis.db.getLocalDB(), lastPosConnectTime = db['lastPosConnectTime'] || 0;

         if (((lastPosDisonnectTime - lastPosConnectTime) > (wssocket.reconnectTimeoutTimer)) || !store || !(store.getAllCount() > 0))
         {
            retrieveReceipts();
         }
      }
   }
});

Ext.define('Genesis.view.server.Redemptions',
{
   extend :  Genesis.view.RedeemBase ,
                                                     
   alias : 'widget.serverredemptionsview',
   config :
   {
      defaultItemType : 'rewardptsitem',
      redeemTitleText : 'Rewards available to redeem (Select an item below)',
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
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   createView : function(activeItemIndex)
   {
      if (!this.callParent(arguments))
      {
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

Ext.define('Genesis.controller.server.Redemptions',
{
   extend :  Genesis.controller.RewardRedemptionsBase ,
   mixins :
   {
      redeemBase :  Genesis.controller.server.mixin.RedeemBase 
   },
                                                                    
   inheritableStatics :
   {
   },
   xtype : 'serverRedemptionsCntlr',
   config :
   {
      redeemPointsFn : 'setMerchantRedeemPointsURL',
      routes :
      {
      },
      refs :
      {
         backBtn : 'serverredemptionsview button[tag=back]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverredemptionsview',
            autoCreate : true,
            xtype : 'serverredemptionsview'
         },
         redemptionsList : 'serverredemptionsview list[tag=redemptionsList]',
         redeemItemCardContainer : 'serverredeemitemdetailview[tag=redeemReward] container[tag=redeemItemCardContainer]',
         redeemItemButtonsContainer : 'serverredeemitemdetailview[tag=redeemReward] container[tag=bottomButtons]',
         phoneId : 'serverredeemitemdetailview[tag=redeemReward] calculator[tag=phoneId] textfield',
         mRedeemBtn : 'serverredeemitemdetailview[tag=redeemReward] button[tag=merchantRedeem]',
         //
         // Redeem Rewards
         //
         sBackBB : 'serverredeemitemdetailview[tag=redeemReward] button[tag=back]',
         sCloseBB : 'serverredeemitemdetailview[tag=redeemReward] button[tag=close]',
         authText : 'serverredeemitemdetailview[tag=redeemReward] component[tag=authText]',
         redeemItem :
         {
            selector : 'serverredeemitemdetailview[tag=redeemReward]',
            autoCreate : true,
            tag : 'redeemReward',
            xtype : 'serverredeemitemdetailview'
         }
      },
      control :
      {
         mRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         },
         redeemItemCardContainer :
         {
            activeitemchange : 'onRedeemItemCardContainerActivate'
         },
         'serverredeemitemdetailview[tag=redeemReward] calculator[tag=phoneId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverredeemitemdetailview[tag=redeemReward] calculator[tag=phoneId] container[tag=bottomButtons] button[tag=redeemTagId]' :
         {
            tap : 'onTagItTap'
         }
      },
      listeners :
      {
      }
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      me.callParent(arguments);
      me.mixins.redeemBase.onRedeemItemActivate.apply(me, arguments);
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.mixins.redeemBase.onNfc.apply(me, arguments);
   }
   // --------------------------------------------------------------------------
   // Redemption Page
   // --------------------------------------------------------------------------
});

Ext.define('Genesis.view.server.Rewards',
{
   extend :  Genesis.view.ViewBase ,
                                                                                                                                                                                                
   alias : 'widget.serverrewardsview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
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
            tag : 'rptClose',
            hidden : true,
            ui : 'normal',
            text : 'Close'
         },
         {
            hidden : true,
            align : 'right',
            ui : 'normal',
            iconCls : 'order',
            tag : 'calculator'
         },
         {
            hidden : true,
            align : 'right',
            ui : 'normal',
            iconCls : 'refresh',
            tag : 'refresh',
            handler : function()
            {
               retrieveReceipts();
            }
         }]
      })]
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      var itemHeight = 1 + Genesis.constants.defaultIconSize() + 2 * Genesis.fn.calcPx(0.65, 1), store = Ext.StoreMgr.get('ReceiptStore'), db = Genesis.db.getLocalDB();
      var posEnabled = isPosEnabled();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0);
      console.debug("createView - rewardModel[" + db['rewardModel'] + "]")
      var toolbarBottom = function(tag, hideTb)
      {
         return (
            {
               docked : 'bottom',
               cls : 'toolbarBottom',
               tag : tag,
               hidden : hideTb,
               xtype : 'container',
               layout :
               {
                  type : 'vbox',
                  pack : 'center'
               },
               showAnimation :
               {
                  type : 'slideIn',
                  duration : 500,
                  direction : 'up'
               },
               hideAnimation :
               {
                  type : 'slideOut',
                  duration : 500,
                  direction : 'down'
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
                        container.setPressedButtons([]);
                     }
                  }
               }]
            });
      };

      me.getPreRender().push(Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'rewards',
         layout :
         {
            type : 'card',
            animation :
            {
               duration : 600,
               easing : 'ease-in-out',
               type : 'slide',
               direction : 'down'
            }
         },
         defaults :
         {
            hidden : true
         },
         activeItem : (posEnabled) ? 2 : manualMode,
         items : [
         // -------------------------------------------------------------------
         // Reward Calculator
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'amount',
            title : 'Amount Spent',
            placeHolder : '0.00',
            bottomButtons : [
            {
               tag : 'earnPts',
               text : 'GO!',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // Reward TAG ID Entry
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'phoneId',
            title : 'Enter Mobile Number',
            placeHolder : '8005551234',
            bottomButtons : [
            {
               tag : 'earnTagId',
               text : 'Submit',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // POS Receipts
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'posSelect',
            layout : 'hbox',
            items : [
            {
               docked : 'top',
               hidden : (store.getCount() <= 0),
               xtype : 'selectfield',
               labelWidth : '50%',
               label : 'Sort Receipts By :',
               tag : 'tableFilter',
               name : 'tableFilter',
               margin : '0 0 0.8em 0',
               usePicker : true,
               store : 'TableStore',
               displayField : 'id',
               valueField : 'id',
               showAnimation :
               {
                  type : 'slideIn',
                  duration : 500,
                  direction : 'down'

               },
               hideAnimation :
               {
                  type : 'slideOut',
                  duration : 500,
                  direction : 'up'
               },
               defaultPhonePickerConfig :
               {
                  height : (12.5 * 1.5) + 'em',
                  doneButton :
                  {
                     ui : 'normal'
                  }
               }
            },
            {
               xtype : 'list',
               flex : 1,
               store : 'ReceiptStore',
               loadingText : null,
               //scrollable : 'vertical',
               plugins : [
               {
                  type : 'pullrefresh',
                  //pullRefreshText: 'Pull down for more new Tweets!',
                  refreshFn : function(plugin)
                  {
                     retrieveReceipts();
                  }
               },
               {
                  type : 'listpaging',
                  autoPaging : true,
                  loadMoreText : '',
                  noMoreRecordsText : ''
               }],
               mode : 'MULTI',
               preventSelectionOnDisclose : true,
               scrollToTopOnRefresh : true,
               refreshHeightOnUpdate : false,
               variableHeights : false,
               itemHeight : itemHeight,
               deferEmptyText : false,
               emptyText : ' ',
               tag : 'receiptList',
               cls : 'receiptList',
               // @formatter:off
               itemTpl : Ext.create('Ext.XTemplate',
               '<div class="photo">{[this.getPrice(values)]}</div>' +
               '<div class="listItemDetailsWrapper">' +
                  '<div class="itemDistance">{[this.getDate(values)]}</div>' +
                  '<div class="itemTitle">{title}</div>' +
                  //'<div class="itemDesc">{[this.getDesc(values)]}</div>',
               '</div>',
               // @formatter:on
               {
                  getPrice : function(values)
                  {
                     return '$' + Number(values['price']).toFixed(2);
                  },
                  getDate : function(values)
                  {
                     return Genesis.fn.convertDate(new Date(values['id'] * 1000));
                  }
               }),
               onItemDisclosure : Ext.emptyFn
            }, toolbarBottom('tbBottomSelection', (store.getCount() <= 0))]
         },
         // -------------------------------------------------------------------
         // POS Receipt Detail
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'posDetail',
            layout : 'hbox',
            items : [
            {
               flex : 1,
               xtype : 'dataview',
               tag : 'receiptDetail',
               cls : 'receiptDetail',
               store :
               {
                  fields : ['receipt']
               },
               // @formatter:off
               itemTpl : Ext.create('Ext.XTemplate',
               '<div class="listItemDetailsWrapper">' +
                  '<div class="itemReceipt">{[this.getReceipt(values)]}</div>' +
               '</div>',
               // @formatter:on
               {
                  getReceipt : function(values)
                  {
                     var receipt = '';
                     for (var i = 0; i < values['receipt'].length; i++)
                     {
                        receipt += '<pre>' + values['receipt'][i].replace('\n', '').replace('/r', '') + '</pre>';
                     }

                     return receipt;
                  }
               })
            }, toolbarBottom('tbBottomDetail', false)]
         },
         // -------------------------------------------------------------------
         // ItemsPurchased
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'itemsPurchased',
            title : 'Stamp Points',
            placeHolder : '0',
            hideZero : true,
            bottomButtons : [
            {
               tag : 'earnPts',
               text : 'Stamp Me!',
               ui : 'orange-large'
            }]
         }]
      }));
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.controller.server.Rewards',
{
   extend :  Genesis.controller.ControllerBase ,
                                 
   xtype : 'serverRewardsCntlr',
   config :
   {
      mode : 'Manual', // 'POS_Selection', 'POS_Detail', 'Maunal', 'Visit'
      models : ['PurchaseReward', 'CustomerReward'],
      routes :
      {
         'earnPts' : 'earnPtsPage'
      },
      refs :
      {
         //
         // Rewards
         //
         rewards :
         {
            selector : 'serverrewardsview',
            autoCreate : true,
            xtype : 'serverrewardsview'
         },
         calcBtn : 'serverrewardsview button[tag=calculator]',
         refreshBtn : 'serverrewardsview button[tag=refresh]',
         receiptsList : 'serverrewardsview container list',
         tableSelectField : 'serverrewardsview selectfield[tag=tableFilter]',
         backBB : 'serverrewardsview button[tag=back]',
         rptCloseBB : 'serverrewardsview button[tag=rptClose]',
         receiptDetail : 'serverrewardsview dataview[tag=receiptDetail]',
         rewardsContainer : 'serverrewardsview container[tag=rewards]',
         rewardTBar : 'serverrewardsview container[tag=tbBottomSelection]',
         rewardSelection : 'serverrewardsview container[tag=tbBottomSelection] button[tag=rewardsSC]',
         rewardDetail : 'serverrewardsview container[tag=tbBottomDetail] button[tag=rewardsSC]',
         amount : 'serverrewardsview calculator[tag=amount] textfield',
         itemsPurchased : 'serverrewardsview calculator[tag=itemsPurchased] textfield',
         phoneId : 'serverrewardsview calculator[tag=phoneId] textfield',
         //qrcode : 'serverrewardsview component[tag=qrcode]',
         title : 'serverrewardsview container[tag=qrcodeContainer] component[tag=title]'
      },
      control :
      {
         rptCloseBB :
         {
            tap : 'onRptCloseTap'
         },
         calcBtn :
         {
            tap : 'onCalcBtnOverrideTap'
         },
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         rewardsContainer :
         {
            activeitemchange : 'onContainerActivate'
         },
         receiptsList :
         {
            //select : 'onReceiptSelect',
            disclose : 'onReceiptDisclose'
         },
         tableSelectField :
         {
            change : 'onTableSelectFieldChange'
         },
         'serverrewardsview calculator[tag=amount] container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'serverrewardsview calculator[tag=amount] container[tag=bottomButtons] button[tag=earnPts]' :
         {
            tap : 'onEarnPtsTap'
         },
         'serverrewardsview calculator[tag=phoneId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         'serverrewardsview calculator[tag=phoneId] container[tag=bottomButtons] button[tag=earnTagId]' :
         {
            tap : 'onTagItTap'
         },
         'serverrewardsview calculator[tag=itemsPurchased] container[tag=dialpad] button' :
         {
            tap : 'onStampBtnTap'
         },
         'serverrewardsview calculator[tag=itemsPurchased] container[tag=bottomButtons] button[tag=earnPts]' :
         {
            tap : 'onEarnPtsTap'
         },
         rewardSelection :
         {
            tap : 'onRewardSelectionTap'
         },
         rewardDetail :
         {
            tap : 'onRewardDetailTap'
         }
      },
      listeners :
      {
         'rewarditem' : 'onRewardItem'
      }
   },
   maxValue : 1000.00,
   maxStampValue : 9,
   phoneIdMaxLength : 10,
   rewardSuccessfulMsg : 'Transaction Complete',
   rewardFailedMsg : 'Transaction Failed',
   invalidAmountMsg : 'Please enter a valid amount (eg. 5.00), upto $1000',
   invalidStampMsg : 'Please enter a valid Stamp amount (1-9)',
   earnPtsConfirmMsg : 'Please confirm to submit',
   earnPtsTitle : 'Earn Reward Points',
   selectRewardMsg : 'Please select your Receipt(s)',
   unRegAccountMsg : function()
   {
      return ('This account is unregistered' + Genesis.constants.addCRLF() + 'Phone Number is required for registration');
   },
   init : function()
   {
      var me = this;
      me.callParent(arguments);
      console.log("Server Rewards Init");
      //
      // Preload Pages
      //
      me.getRewards();

      Ext.StoreMgr.get('ReceiptStore').on(
      {
         //clear : 'onReceiptStoreUpdate',
         filter : 'onReceiptStoreUpdate',
         addrecords : 'onReceiptStoreUpdate',
         refresh : 'onReceiptStoreUpdate',
         //removerecords : 'onReceiptStoreUpdate',
         updaterecord : 'onReceiptStoreUpdate',
         scope : me
      });

      backBtnCallbackListFn.push(function(activeItem)
      {
         var viewport = me.getViewPortCntlr(), closeButton = activeItem.query('button[tag=rptClose]')[0];
         if ((activeItem == me.getRewards()) && (closeButton && !closeButton.isHidden()))
         {
            viewport.self.playSoundFile(viewport.sound_files['clickSound']);
            closeButton.fireEvent('tap', closeButton, null);
            return true;
         }
         return false;
      });

   },
   getAmountPrecision : function(num)
   {
      var precision = num.split('.');
      return ((precision.length > 1) ? precision[1].length : 0);
   },
   validateAmount : function()
   {
      var me = this, amount, db = Genesis.db.getLocalDB();

      switch (db['rewardModel'])
      {
         case 'items_purchased' :
         {
            amount = me.getItemsPurchased().getValue();
            console.debug("Stamp Ammount = [" + amount + "]");
            if (amount <= 0)
            {
               Ext.device.Notification.show(
               {
                  title : 'Validation Error',
                  message : me.invalidStampMsg,
                  buttons : ['Dismiss']
               });
               amount = -1;
            }
            break;
         }
         case 'amount_spent' :
         {
            amount = me.getAmount().getValue();
            console.debug("Ammount = [" + amount + "]");
            var precision = me.getAmountPrecision(amount);
            if (precision < 2)
            {
               Ext.device.Notification.show(
               {
                  title : 'Validation Error',
                  message : me.invalidAmountMsg,
                  buttons : ['Dismiss']
               });
               amount = -1;
            }
            break;
         }
         case 'visits' :
         default:
            break;
      }

      return amount;
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, container = me.getRewardsContainer(), store = Ext.StoreMgr.get('ReceiptStore'), db = Genesis.db.getLocalDB();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0), posEnabled = isPosEnabled();

      if (container)
      {
         me.getAmount().reset();
         me.getItemsPurchased().reset();
         me.onReceiptStoreUpdate(store);
         container.setActiveItem((posEnabled) ? 2 : manualMode);
      }
      if (debugMode)
      {
         me.getCalcBtn()[(posEnabled) ? 'show' : 'hide']();
      }
      me.getRefreshBtn()[(posEnabled) ? 'show' : 'hide']();
      //activeItem.createView();
   },
   onCalcBtnOverrideTap : function(b, e)
   {
      var me = this, container = me.getRewardsContainer(), animation = container.getLayout().getAnimation(), db = Genesis.db.getLocalDB();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0);

      if (container)
      {
         me.getAmount().reset();
         me.getItemsPurchased().reset();
         animation.setDirection('down');
         container.setActiveItem(manualMode);
         me.getRptCloseBB()['hide']();
         me.getBackBB()['show']();
         if (debugMode)
         {
            me.getCalcBtn()['hide']();
         }
      }
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;

      window.plugins.proximityID.stop();
      me.getViewPortCntlr().setActiveController(null);
      console.debug("Rewards onDeactivate Called. Reset Amount ...");
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this, container = me.getRewardsContainer(), animation = container.getLayout().getAnimation();

      me.getRefreshBtn()[(value.config.tag == 'posSelect') ? 'show'  : 'hide']();
      switch (value.config.tag)
      {
         case 'posSelect' :
         {
            animation.setDirection('left');
            console.debug("Rewards ContainerActivate Called. Showing POS Receipts ...");
            break;
         }
         case 'posDetail' :
         {
            animation.setDirection('right');
            console.debug("Rewards ContainerActivate Called. Showing POS Receipt Detail ...");
            break;
         }
         case 'amount' :
         {
            me.getAmount().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset Amount ...");
            break;
         }
         case 'itemsPurchased' :
         {
            me.getItemsPurchased().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset ItemsPurchased ...");
            break;
         }
         case 'phoneId' :
         {
            me.getPhoneId().reset();
            animation.setReverse(true);
            console.debug("Rewards ContainerActivate Called. Reset PhoneID ...");
            break;
         }
         case 'qrcodeContainer' :
         {
            animation.setDirection('down');
            animation.setReverse(false);
            console.debug("Rewards ContainerActivate Called.");
            break;
         }
      }
   },
   rewardItemCb : function(b)
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.popUpInProgress = false;
      me._actions.hide();
      viewport.setActiveController(null);
      clearInterval(me.scanTask);
      me.scanTask = null;
      //
      // Stop receiving ProximityID
      //
      window.plugins.proximityID.stop();

      if (b && (b.toLowerCase() == 'manual'))
      {
         Ext.Viewport.setMasked(null);
         me.onEnterPhoneNum();
      }
      else if (!me.dismissDialog)
      {
         Ext.Viewport.setMasked(null);
         me.onDoneTap();
      }
   },
   rewardItemFn : function(params, closeDialog)
   {
      var me = this, viewport = me.getViewPortCntlr(), proxy = PurchaseReward.getProxy(), amount = 0, itemsPurchased = 0, visits = 0, db = Genesis.db.getLocalDB();
      var posEnabled = isPosEnabled();

      switch (me.getMode())
      {
         case 'Manual' :
         {
            amount = me.getAmount().getValue();
            itemsPurchased = me.getItemsPurchased().getValue();
            visits++;
            break;
         }
         case 'POS_Detail' :
         case 'POS_Selection' :
         {
            var receiptSelected;
            for (var i = 0; i < me.receiptSelected.length; i++)
            {
               receiptSelected = me.receiptSelected[i];
               amount += Number(receiptSelected.get('subtotal'));
               itemsPurchased += Number(receiptSelected.get('itemsPurchased'));
               visits++;
            }
            break;
         }
         case 'Visit' :
         {
            visits++;
            break;
         }
         default:
            break;
      }
      console.debug("Amount:$" + amount + ", ItemsPurchased = " + itemsPurchased + ", Visits = " + visits);

      me.dismissDialog = closeDialog;
      me.rewardItemCb();

      params = Ext.merge(params,
      {
         version : Genesis.constants.serverVersion,
         'venue_id' : Genesis.fn.getPrivKey('venueId'),
         data :
         {
            "amount" : amount,
            "items" : Number(itemsPurchased),
            "visits" : Number(visits),
            "type" : 'earn_points',
            'expiry_ts' : new Date().addHours(3).getTime()
         }
      });
      me._params = params['data'];
      params['data'] = me.self.encryptFromParams(params['data']);
      //
      // Update Server
      //
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.establishConnectionMsg
      });
      //Ext.device.Notification.dismiss();

      console.debug("Updating Server with Reward information ... dismissDialog(" + me.dismissDialog + ")");
      PurchaseReward['setMerchantEarnPointsURL']();
      PurchaseReward.load(1,
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         doNotRetryAttempt : true,
         params : params,
         callback : function(record, operation)
         {
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful())
            {
               var metaData = proxy.getReader().metaData;
               Ext.device.Notification.show(
               {
                  title : me.earnPtsTitle,
                  message : me.rewardSuccessfulMsg,
                  buttons : ['OK'],
                  callback : function()
                  {
                     me.onDoneTap();
                  }
               });
               //
               // Store to Receipt Database
               //
               if (posEnabled)
               {
                  var x, receipts = [], receipt, rstore = Ext.StoreMgr.get('ReceiptStore'), estore = Ext.StoreMgr.get('EarnedReceiptStore');

                  for (var i = 0; i < me.receiptSelected.length; i++)
                  {
                     if (metaData['txn_id'] && (metaData['txn_id'] > 0))
                     {
                        me.receiptSelected[i].set('txnId', metaData['txn_id']);
                     }
                     receipts.push(me.receiptSelected[i].getData(true));
                     for (var j = 0; j < receipts[i]['items'].length; j++)
                     {
                        delete receipts[i]['items'][j]['id'];
                     }
                  }
                  //
                  // Add to Earned store
                  //
                  estore.add(me.receiptSelected);

                  _application.getController('server' + '.Receipts').fireEvent('insertReceipts', receipts);
                  //
                  // Refresh Store
                  //
                  me.getReceiptsList().deselectAll();
                  rstore.filter();
               }
            }
            else
            {
               //proxy._errorCallback = Ext.bind(me.onDoneTap, me);
               proxy.supressErrorsPopup = true;
               if (proxy.getReader().metaData)
               {
                  switch(proxy.getReader().metaData['rescode'])
                  {
                     case 'unregistered_account' :
                     {
                        //
                        //
                        //
                        Ext.device.Notification.show(
                        {
                           title : me.earnPtsTitle,
                           message : me.unRegAccountMsg(),
                           buttons : ['Register', 'Cancel'],
                           callback : function(btn)
                           {
                              proxy.supressErrorsCallbackFn();
                              if (btn.toLowerCase() == 'register')
                              {
                                 me.onEnterPhoneNum();
                              }
                              else
                              {
                                 me.onDoneTap();
                              }
                           }
                        });
                        return;
                        break;
                     }
                     default :
                        break;
                  }
               }
               Ext.device.Notification.show(
               {
                  title : me.earnPtsTitle,
                  message : me.rewardFailedMsg,
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
   onRewardItem : function(automatic)
   {
      var me = this, identifiers = null, viewport = me.getViewPortCntlr(), proxy = PurchaseReward.getProxy();

      me.dismissDialog = false;
      if (!automatic)
      {
         return;
      }

      if (!me._actions)
      {
         me._actions = Ext.create('Genesis.view.widgets.PopupItemDetail',
         {
            iconType : 'prizewon',
            icon : 'rss',
            //cls : 'viewport',
            title : me.lookingForMobileDeviceMsg(),
            buttons : [
            {
               margin : '0 0 0.5 0',
               text : me.mobilePhoneInputMsg,
               ui : 'action',
               height : '3em',
               handler : Ext.bind(me.rewardItemCb, me, ['manual'])
            },
            {
               margin : '0.5 0 0 0',
               text : 'Cancel',
               ui : 'cancel',
               height : '3em',
               handler : Ext.bind(me.rewardItemCb, me, ['cancel'])
            }]
         });
         Ext.Viewport.add(me._actions);
      }
      viewport.popUpInProgress = true;
      me._actions.show();
      
      me.getLocalID(function(ids)
      {
         identifiers = ids;
         me.rewardItemFn(
         {
            data :
            {
               'frequency' : identifiers['localID']
            }
         }, true);
      }, function()
      {
         me._actions.hide();
         me.onDoneTap();
      }, Ext.bind(me.onRewardItem, me, arguments));
      viewport.setActiveController(me);
   },
   // --------------------------------------------------------------------------
   // Amount Tab
   // --------------------------------------------------------------------------
   onEnterPhoneNum : function()
   {
      var me = this, amount = me.validateAmount(), container = me.getRewardsContainer();

      if (amount < 0)
      {
         return;
      }
      if (debugMode)
      {
         me.getCalcBtn()['hide']();
      }
      container.setActiveItem(1);
   },
   onEarnPtsTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRewardsContainer(), amount = me.validateAmount();

      if (amount < 0)
      {
         return;
      }

      /*
       Ext.defer(function()
       {
       var qrcodeMetaData = me.self.genQRCodeFromParams(
       {
       "amount" : amount,
       "type" : 'earn_points'
       }, 'reward', false);
       me.getQrcode().setStyle(
       {
       'background-image' : 'url(' + qrcodeMetaData[0] + ')',
       'background-size' : Genesis.fn.addUnit(qrcodeMetaData[1] * 1.25) + ' ' + Genesis.fn.addUnit(qrcodeMetaData[2] * 1.25)
       });
       }, 1, me);
       console.debug("Encrypting QRCode with Price:$" + amount);
       */
      /*
       me.getTitle().setData(
       {
       price : '$' + amount
       });
       container.setActiveItem(2);
       */

      me.setMode('Manual');
      me.fireEvent('rewarditem', b);
   },
   onRewardDetailTap : function(b, e, eOpts, eInfo)
   {
      var me = this;

      me.setMode('POS_Detail');
      me.fireEvent('rewarditem', b);
   },
   onRewardSelectionTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRewardsContainer(), receiptsList = me.getReceiptsList(), selection = receiptsList.getSelection();

      if (selection && (selection.length > 0))
      {
         me.receiptSelected = selection;
         me.setMode('POS_Selection');
         me.fireEvent('rewarditem', b);
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : me.earnPtsTitle,
            message : me.selectRewardMsg,
            buttons : ['Cancel']
         });
      }
   },
   onCalcBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var amountField = me.getAmount();
      var value = b.getText();
      switch (value)
      {
         case 'AC' :
         {
            amountField.reset();
            break;
         }
         default :
            var amountFieldLength = amountField.getValue().length, amount = Number(amountField.getValue() || 0);

            if (amountFieldLength < 2)
            {
               if ((amount == 0) && (amountFieldLength > 0))
               {
                  amount += value;
               }
               else
               {
                  amount = (10 * amount) + Number(value);
               }
            }
            else
            {
               if (amountFieldLength == 2)
               {
                  amount = (amount + value) / 100;
               }
               else
               {
                  amount = (10 * amount) + (Number(value) / 100);
               }
               amount = amount.toFixed(2);
            }

            // Max value
            if (amount <= me.maxValue)
            {
               amountField.setValue(amount);
            }
            break;
      }
   },
   onStampBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var amountField = me.getItemsPurchased();
      var value = b.getText();
      switch (value)
      {
         case 'AC' :
         {
            amountField.reset();
            break;
         }
         default :
            var amountFieldLength = amountField.getValue().length, amount = Number(amountField.getValue() || 0);

            if ((amount == 0) && (amountFieldLength > 0))
            {
               amount = Number(value);
            }
            else
            {
               amount = (10 * amount) + Number(value);
            }

            // Max value
            if (amount <= me.maxStampValue)
            {
               amountField.setValue(amount);
            }
            break;
      }
   },
   // --------------------------------------------------------------------------
   // TAG ID Tab
   // --------------------------------------------------------------------------
   onTagIdBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, value = b.getText();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      switch (value)
      {
         case 'AC' :
         {
            phoneIdField.reset();
            break;
         }
         default :
            if (phoneIdFieldLength < me.phoneIdMaxLength)
            {
               phoneId += value;
               phoneIdField.setValue(phoneId);
            }
            break;
      }
   },
   onTagItTap : function()
   {
      var me = this, viewport = me.getViewPortCntlr();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      if (phoneIdFieldLength == me.phoneIdMaxLength)
      {
         me.self.playSoundFile(viewport.sound_files['nfcEnd']);
         me.onEarnPtsTap(null);

         me.onNfc(
         {
            id : (me._params) ? me._params['uid'] : null,
            result :
            {
               'tagID' : (me._params) ? me._params['tag_id'] : null,
               'phoneID' : phoneId
            }
         });
         delete me._params;
         /*
          Ext.device.Notification.show(
          {
          title : me.earnPtsTitle,
          message : me.earnPtsConfirmMsg,
          buttons : ['Confirm', 'Cancel'],
          callback : function(btn)
          {
          if (btn.toLowerCase() == 'confirm')
          {
          me.onNfc(
          {
          id : (me._params) ? me._params['uid'] : null,
          result :
          {
          'tagID' : (me._params) ? me._params['tag_id'] : null,
          'phoneID' : phoneId
          }
          });
          delete me._params;
          }
          else
          {
          me.onDoneTap();
          }
          }
          });
          */
      }
      else
      {
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         Ext.device.Notification.show(
         {
            title : me.earnPtsTitle,
            message : me.invalidPhoneIdFormatMsg(me.phoneIdMaxLength),
            buttons : ['Dismiss']
         });
      }
   },
   // --------------------------------------------------------------------------
   // Misc Event Funcs
   // --------------------------------------------------------------------------
   onRptCloseTap : function(b, e)
   {
      var me = this;
      var container = me.getRewardsContainer();
      if (container)
      {
         container.setActiveItem(2);
         me.getRptCloseBB()['hide']();
         me.getBackBB()['show']();
         if (debugMode)
         {
            me.getCalcBtn()['show']();
         }
      }
   },
   onReceiptDisclose : function(list, record, target, index, e, eOpts, eInfo)
   {
      var me = this, viewport = me.getViewPortCntlr(), container = me.getRewardsContainer(), animation = container.getLayout().getAnimation();

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      if (container)
      {
         animation.setDirection('left');
         container.setActiveItem(3);

         var store = me.getReceiptDetail().getStore();
         store.setData(
         {
            receipt : Ext.decode(record.get('receipt'))
         });
         me.receiptSelected = [record];
         me.getRptCloseBB()['show']();
         me.getBackBB()['hide']();
         if (debugMode)
         {
            me.getCalcBtn()['show']();
         }
      }
   },
   onReceiptStoreUpdate : function(store)
   {
      var me = this, db = Genesis.db.getLocalDB(), list = me.getReceiptsList(), visible = (store.getCount() > 0) ? 'show' : 'hide';
      var posEnabled = isPosEnabled();

      if (list)
      {
         console.debug("Refreshing ReceiptStore ... count[" + store.getCount() + "]");
         //store.setData(store.getData().all);

         if (posEnabled && me.getRewardTBar())
         {
            me.getRewardTBar()[visible]();
            me.getTableSelectField()[visible]();
         }
      }
      else
      {
         //console.debug("onReceiptStoreUpdate - list not avail for update");
      }
   },
   onTableSelectFieldChange : function(field, newValue, oldValue, eOpts)
   {
      var me = this, store = Ext.StoreMgr.get('ReceiptStore');

      store.tableFilterId = (newValue != 'None') ? newValue : null;
      console.debug("Filter by Table[" + store.tableFilterId + "] ...");

      //
      // Wait for animation to complete before we filter
      //
      Ext.defer(function()
      {
         store.filter();
         //me.onReceiptStoreUpdate(store);
      }, 1 * 1000);
   },
   // --------------------------------------------------------------------------
   // Misc Event Funcs
   // --------------------------------------------------------------------------
   onDoneTap : function(b, e, eOpts, eInfo)
   {
      var me = this, container = me.getRewardsContainer(), db = Genesis.db.getLocalDB(), store = Ext.StoreMgr.get('ReceiptStore');
      var posEnabled = isPosEnabled();
      var manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0);
      delete me._params;
      switch (me.getMode())
      {
         case 'Manual' :
         {
            if (container)
            {
               me.getAmount().reset();
               me.getItemsPurchased().reset();
               container.setActiveItem((posEnabled) ? 2 : manualMode);
            }
            break;
         }
         case 'POS_Detail' :
         {
            if (container)
            {
               container.setActiveItem(3);
            }
            break;
         }
         case 'POS_Selection' :
         {
            if (container)
            {
               container.setActiveItem(2);
            }
            break;
         }
         case 'Visit' :
         {
            me.getViewPortCntlr().setActiveController(me.getApplication().getController('server' + '.MainPage'));
            break;
         }
         default :
            break;
      }
      console.debug("onDoneTap - Mode[" + me.getMode() + "], rewardModel[" + db['rewardModel'] + "]")
      if (me.getCalcBtn())
      {
         me.getCalcBtn()[(posEnabled) ? 'show' : 'hide']();
      }

      console.debug("Rewards onDoneTap Called ...");
   },
   onNfc : function(nfcResult)
   {
      var me = this;
      me.rewardItemFn(
      {
         data :
         {
            'uid' : (nfcResult) ? nfcResult.id : null,
            'tag_id' : (nfcResult) ? nfcResult.result['tagID'] : null,
            'phone_id' : (nfcResult) ? nfcResult.result['phoneID'] : null
         }
      }, true);
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   earnPtsPage : function()
   {
      var me = this;
      var page = me.getRewards();
      me.setAnimationMode(me.self.animationMode['cover']);
      me.pushView(page);
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
      var me = this, db = Genesis.db.getLocalDB(), posEnabled = isPosEnabled();

      switch (subFeature)
      {
         case 'rewards':
         {
            switch (db['rewardModel'])
            {
               case 'visits' :
               {
                  if (!posEnabled)
                  {
                     me.setMode('Visit');
                     me.fireEvent('rewarditem', subFeature);
                     break;
                  }
               }
               case 'amount_spent' :
               case 'items_purchased' :
               default:
                  me.redirectTo('earnPts');
                  break;
            }
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});


Ext.define('Genesis.view.server.SettingsPage',
{
   extend :  Ext.form.Panel ,
                                                                                                                                                                      
   alias : 'widget.serversettingspageview',
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
         title : 'About Kickbak',
         defaults :
         {
            labelWidth : '50%'
         },
         //instructions : 'Tell us all about yourself',
         items : [
         {
            xtype : 'textfield',
            clearIcon : false,
            label : 'Version ' + Genesis.constants.serverVersion,
            value : ' ',
            readOnly : true
         },
         {
            xtype : 'togglefield',
            name : 'posMode',
            tag : 'posMode',
            label : 'POS Integration',
            value : (Genesis.db.getLocalDB()['isPosEnabled'] || (Genesis.db.getLocalDB()['isPosEnabled'] == undefined)) ? 1 : 0
         },
         {
            xtype : 'selectfield',
            label : 'Display Mode',
            tag : 'displayMode',
            name : 'displayMode',
            usePicker : true,
            options : [
            {
               text : 'Mobile',
               value : 'Mobile'
            },
            {
               text : 'Fixed',
               value : 'Fixed'
            }],
            defaultPhonePickerConfig :
            {
               height : '12.5em',
               doneButton :
               {
                  ui : 'normal'
               }
            }
         }
         /*,
          {
          xtype : 'listfield',
          name : 'terms',
          label : 'Terms & Conditions',
          value : ' '
          },
          {
          xtype : 'listfield',
          name : 'privacy',
          label : 'Privacy'
          value : ' '
          },
          {
          xtype : 'listfield',
          name : 'aboutus',
          label : 'About Us',
          value : ' '
          }
          */]
      },
      {
         xtype : 'fieldset',
         title : 'Merchant Device',
         defaults :
         {
            labelWidth : '50%'
         },
         items : [
         {
            xtype : 'textfield',
            labelWidth : '90%',
            tag : 'merchantDevice',
            clearIcon : false,
            readOnly : true
         },
         {
            xtype : 'listfield',
            name : 'license',
            label : 'Refresh License',
            value : ' '
         },
         {
            xtype : 'listfield',
            name : 'resetdevice',
            label : 'Reset Device',
            value : ' '
         }]
      },
      {
         xtype : 'fieldset',
         hidden : true,
         tag : 'utilities',
         title : 'Utilities',
         defaults :
         {
            labelWidth : '50%'
         },
         items : [
         {
            xtype : 'listfield',
            tag : 'createTag',
            label : 'Create TAG',
            value : ' '
         }]
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

Ext.define('Genesis.view.server.TagCreatePage',
{
   extend :  Genesis.view.ViewBase ,
                                                
   alias : 'widget.servertagcreatepageview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
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
         }]
      }),
      // -------------------------------------------------------------------
      // Reward TAG ID Entry
      // -------------------------------------------------------------------
      {
         xtype : 'calculator',
         tag : 'createTagId',
         title : 'Enter TAG ID',
         placeHolder : '12345678',
         bottomButtons : [
         {
            tag : 'createTagId',
            text : 'Create!',
            ui : 'orange-large'
         }]
      }]
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      //me.getPreRender().push();
   },
   inheritableStatics :
   {
   }
});

Ext.define('Genesis.controller.server.Settings',
{
   extend :  Genesis.controller.SettingsBase ,
   inheritableStatics :
   {
   },
   xtype : 'serverSettingsCntlr',
   config :
   {
      licenseTitle : 'Refresh License Key',
      routes :
      {
      },
      refs :
      {
         //
         // Settings Page
         //
         settingsPage :
         {
            selector : 'serversettingspageview',
            autoCreate : true,
            xtype : 'serversettingspageview'
         },
         utilitiesContainer : 'serversettingspageview fieldset[tag=utilities]',
         merchantDevice : 'serversettingspageview fieldset textfield[tag=merchantDevice]',
         //
         // Create Tag Page
         //
         createTagId : 'servertagcreatepageview calculator[tag=createTagId] textfield[name=amount]',
         createTagBtn : 'servertagcreatepageview container[tag=bottomButtons] button[tag=createTagId]',
         createTagPage :
         {
            selector : 'servertagcreatepageview',
            autoCreate : true,
            xtype : 'servertagcreatepageview'
         }
      },
      control :
      {
         //
         // Settings Page
         //
         'serversettingspageview listfield[name=resetdevice]' :
         {
            clearicontap : 'onDeviceResetTap'
         },
         'serversettingspageview listfield[name=license]' :
         {
            clearicontap : 'onRefreshLicenseTap'
         },
         'serversettingspageview listfield[name=terms]' :
         {
            clearicontap : 'onTermsTap'
         },
         'serversettingspageview listfield[name=privacy]' :
         {
            clearicontap : 'onPrivacyTap'
         },
         'serversettingspageview listfield[name=aboutus]' :
         {
            clearicontap : 'onAboutUsTap'
         },
         settingsPage :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'serversettingspageview listfield[tag=createTag]' :
         {
            clearicontap : 'onCreateTagPageTap'
         },
         //
         // Create Tag Page
         //
         'servertagcreatepageview calculator[tag=createTagId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         createTagBtn :
         {
            tap : 'onCreateTagTap'
         },
         createTagPage :
         {
            activate : 'onCreateTagActivate',
            deactivate : 'onCreateTagDeactivate'
         }
      },
      listeners :
      {
      }
   },
   tagIdLength : 8,
   proceedToUpdateLicenseMsg : 'Please confirm to proceed with License Update',
   proceedToResetDeviceeMsg : 'Please confirm to Reset Device',
   noLicenseKeyScannedMsg : 'No License Key was found!',
   createTagMsg : function()
   {
      return 'To program the TAG ID,' + Genesis.constants.addCRLF() + 'Please swipe tag.';
   },
   invalidTagMsg : function()
   {
      var me = this;
      return "TagID must be of a valid length[" + me.tagIdLength + "]";
   },
   licenseKeySuccessMsg : function()
   {
      return 'License Key Updated for ' + Genesis.constants.addCRLF() + '[' + Genesis.fn.getPrivKey('venue') + ']';
   },
   updateLicenseKey : function()
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.refreshLicenseKey(function()
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
               if (Genesis.fn.isNative())
               {
                  navigator.app.exitApp();
               }
               else
               {
                  window.location.reload();
               }
            }
         });
      }, true);
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onDeviceResetTap : function(b, e)
   {
      var me = this, viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);
      Ext.device.Notification.show(
      {
         title : 'Device Reset Confirmation',
         message : me.proceedToResetDeviceeMsg,
         buttons : ['Confirm', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'confirm')
            {
               _application.getController('server' + '.Receipts').fireEvent('resetReceipts');
            }
         }
      });
   },
   onRefreshLicenseTap : function(b, e, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      Ext.device.Notification.show(
      {
         title : 'License Key Refresh',
         message : me.proceedToUpdateLicenseMsg,
         buttons : ['Proceed', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'proceed')
            {
               me.updateLicenseKey();
            }
         }
      });
   },
   onCreateTagPageTap : function(b, e, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      me.openPage('createTag');
   },
   // --------------------------------------------------------------------------
   // TAG ID Page
   // --------------------------------------------------------------------------
   onTagIdBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, value = b.getText();
      var tagIdField = me.getCreateTagId(), tagId = tagIdField.getValue(), tagIdFieldLength = tagId.length;

      if (tagIdFieldLength < me.tagIdLength)
      {
         switch (value)
         {
            case 'AC' :
            {
               tagIdField.reset();
               break;
            }
            default :
               tagId += value;
               tagIdField.setValue(tagId);
               break;
         }
      }
   },
   onCreateTagTap : function(b, e, eOpts)
   {
      var me = this, tagId = me.getCreateTagId().getValue();
      if (Genesis.fn.isNative())
      {
         if (tagId.length != me.tagIdLength)
         {
            Ext.device.Notification.show(
            {
               title : "Create Tag",
               message : me.invalidTagMsg(),
               buttons : ['Dismiss']
            });
         }
         else
         {
            me.getViewPortCntlr().setActiveController(me);
            /*
             nfc.addTagDiscoveredListener(me.writeTag, function()
             {
             console.debug("Listening for NDEF tags");
             }, function()
             {
             console.debug("Failed to Listen for NDEF tags");
             });
             */

            Ext.device.Notification.show(
            {
               title : "Create Tag",
               message : me.createTagMsg(),
               buttons : ['Cancel'],
               callback : function()
               {
                  me.getViewPortCntlr().setActiveController(null);
               }
            });
         }
      }
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onBeforeNfc : function(nfcEvent)
   {
      this.writeTag(null);

      return null;
   },
   writeTag : function(nfcEvent)
   {
      // ignore what's on the tag for now, just overwrite

      var me = this, mimeType = Genesis.constants.appMimeType, tagId = me.getCreateTagId().getValue();

      var callback = function()
      {
         me.getViewPortCntlr().setActiveController(null);
         /*
          nfc.removeTagDiscoveredListener(me.writeTag, function()
          {
          console.debug("Stopped Listening for NDEF tags");
          }, function()
          {
          console.debug("Failed to stop Listen for NDEF tags");
          });
          */
      };

      var payload = Ext.encode(
      {
         'tagID' : tagId
      }), //record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));
      record = ndef.textRecord(payload);

      console.debug("Writing [" + payload + "] to TAG ...");
      nfc.write([record], function()
      {
         Ext.device.Notification.show(
         {
            title : "Create Tag",
            message : "Wrote data to TAG.",
            buttons : ['OK']
         });
         me.getCreateTagId().reset();
         callback();
      }, function(reason)
      {
         Ext.device.Notification.show(
         {
            title : "Create Tag",
            message : "Error Writing data to TAG[" + reason + "]",
            buttons : ['Dismiss']
         });
         callback();
      });
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, form = me.getSettingsPage(), db = Genesis.db.getLocalDB();

      me.getMerchantDevice().setLabel(Genesis.fn.getPrivKey('venue'));
      me.getUtilitiesContainer()[debugMode ? 'show' : 'hide']();
      form.setValues(
      {
         posMode : ((db['isPosEnabled'] === undefined) || (db['isPosEnabled'])) ? 1 : 0,
         displayMode : db["displayMode"] || 'Mobile'
      });
      var field = form.query('togglefield[tag=posMode]')[0];
      field.setReadOnly(db['enablePosIntegration'] ? false : true);
      field[(db['enablePosIntegration']) ? 'enable' : 'disable']();
   },
   onDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
   },
   onCreateTagActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.getCreateTagId().reset();
   },
   onCreateTagDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : function()
   {
      this.openPage('settings');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;
      switch(subFeature)
      {
         case 'createTag' :
         {
            page = me.getCreateTagPage();
            me.setAnimationMode(me.self.animationMode['cover']);
            me.pushView(page);
            return;
            break;
         }
      }

      me.callParent(arguments);
   }
});

// add back button listener
var onBackKeyDown = Ext.emptyFn;
Ext.require(['Genesis.controller.ControllerBase'], function()
{
   onBackKeyDown = function(e)
   {

      //e.preventDefault();

      //
      // Disable BackKey if something is in progress or application is not instantiated
      //
      if (!_application || Ext.Viewport.getMasked())
      {
         return;
      }

      var viewport = _application.getController('server.Viewport');
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
         }
         else
         {
            viewport.self.playSoundFile(viewport.sound_files['clickSound']);
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
   };
});

Ext.define('Genesis.controller.server.Viewport',
{
   extend :  Genesis.controller.ViewportBase ,
                                                                                       
   config :
   {
      customer : null,
      venue : null,
      metaData : null,
      checkinInfo :
      {
         venue : null,
         customer : null,
         metaData : null
      },
      activeController : null
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
      try
      {
         var me = this, db = Genesis.db.getLocalDB();

         //
         // Update Customer Rewards (Rewards Redemptions)
         //
         me.updateRewards(metaData['rewards']);
         //
         // Update Customer Rewards (Prizes Redemptions)
         //
         me.updatePrizes(metaData['prizes']);

         metaData['reward_model'] = (!db['rewardModel']) ? metaData['reward_model'] || 'amount_spent' : metaData['reward_model'];
         if (metaData['reward_model'])
         {
            Genesis.db.setLocalDBAttrib('rewardModel', metaData['reward_model']);
         }
      }
      catch(e)
      {
         console.debug("updateMetaDataInfo Exception - " + e);
      }
   },
   getLicenseKey : function(uuid, callback, forceRefresh)
   {
      var me = this;

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
                  'device_id' : uuid
               },
               callback : function(records, operation)
               {
                  console.debug("Loading License Key ... Record Length(" + records.length + ")");
                  if (operation.wasSuccessful() && records[0])
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
                     Genesis.db.resetStorage();
                     me.initializeConsole(callback);
                  }
                  else if (!records[0])
                  {
                     me.initNotification(me.licenseKeyInvalidMsg);
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
   refreshLicenseKey : function(callback, forceRefresh)
   {
      var me = this;

      callback = callback || Ext.emptyFn;
      if (!Genesis.fn.isNative())
      {
         var request = new XMLHttpRequest();

         //console.debug("Loading LicenseKey.txt ...");
         request.onreadystatechange = function()
         {
            if (request.readyState == 4)
            {
               if (request.status == 200 || request.status == 0)
               {
                  console.debug("Loaded LicenseKey ...");
                  me.getLicenseKey(request.responseText, callback, forceRefresh);
               }
            }
         };
         request.open("GET", 'licenseKey.txt', true);
         request.send(null);
      }
      else
      {
         me.getLicenseKey(device.uuid, callback, forceRefresh);
      }
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
               if (!debugMode)
               {
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
                           if (!debugMode)
                           {
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
                           }
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

      me.refreshLicenseKey(posConnect);
   },
   initializeConsole : function(callback)
   {
      var me = this, viewport = me, info = viewport.getCheckinInfo(), venueId = Genesis.fn.getPrivKey('venueId'), proxy = Venue.getProxy();
      var db = Genesis.db.getLocalDB();
      var params =
      {
         'venue_id' : venueId
      }
      console.debug("Loaded License Key for Venue(" + venueId + ")...");
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
            if (!db['enablePosIntegration'] || !db['isPosEnabled'])
            {
               Ext.Viewport.setMasked(null);
            }

            var metaData = proxy.getReader().metaData;
            if (operation.wasSuccessful() && metaData)
            {
               metaData['features_config'] = metaData['features_config'] ||
               {
               };
               //console.debug("metaData - " + Ext.encode(metaData));
               console.debug("features_config - " + Ext.encode(metaData['features_config']));

               viewport.setVenue(record);
               viewport.setMetaData(metaData);
               info.venue = viewport.getVenue();
               info.metaData = viewport.getMetaData();

               me.fireEvent('updatemetadata', metaData);
               //
               // POS Connection needs to be established
               //
               me.getApplication().getController('server' + '.Receipts').fireEvent('updatemetadata', metaData);

               console.debug("Successfully acquired dataset for Venue(" + venueId + ")");
               //console.debug("Record[" + Ext.encode(record) + "]");
               //console.debug("MetaData[" + Ext.encode(metaData) + "]");
               callback();
               return;
            }
            else if (!operation.wasSuccessful() && !metaData)
            {
               proxy.supressErrorsPopup = true;
               console.debug(me.setupInfoMissingMsg);
            }
            me.initNotification(me.setupInfoMissingMsg);
         }
      });
   },
   applyActiveController : function(controller)
   {
      var me = this;

      if (Genesis.fn.isNative())
      {
         if (me._mimeTypeCallback)
         {
            nfc.removeNdefListener(me._mimeTypeCallback, function()
            //nfc.removeMimeTypeListener(Genesis.constants.appMimeType, me._mimeTypeCallback, function()
            {
               console.debug("Removed NDEF Listener for NFC detection ...");
               //console.debug("Removed MimeType[" + Genesis.constants.appMimeType + "] for NFC detection ...");
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
               console.debug("Listening for tags with NDEF type");
               //console.debug("Listening for tags with mime type " + Genesis.constants.appMimeType);
            }, function()
            {
               console.warn('Failed to register NDEF type with NFC');
            });
            //console.debug("Added NDEF Tags for NFC detection ...");
            //console.debug("Added MimeType[" + Genesis.constants.appMimeType + "] for NFC detection ...");
         }
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

      //if (Genesis.fn.isNative())
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

      if (isPosEnabled() && Genesis.fn.isNative())
      {
         console.debug("Server Viewport - establishPosConn");
         window.plugins.WifiConnMgr.establishPosConn();
      }

      if (!Genesis.fn.isNative())
      {
         Ext.merge(WebSocket.prototype,
         {
            onNfc : function(inputStream)
            {
               //
               // Get NFC data from remote call
               //
               var cntlr = me.getActiveController(), result = Ext.decode(inputStream['data']);
               /*
                {
                result : Ext.decode(text),
                id : id
                };
                */
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
            }
         });

         var scheme = 'ws://', host = (Genesis.fn.isNative()) ? '192.168.159.1' : '127.0.0.1', port = '443';
         var url = scheme + host + ':' + port + "/nfc";
         var wssocket = me.wssocket = new WebSocket(url, 'json');
         wssocket.onopen = function(event)
         {
         };
         wssocket.onmessage = function(event)
         {
            // console.debug("wssocket.onmessage - [" + event.data + "]");
            try
            {
               var inputStream = eval('[' + event.data + ']')[0];
               //inputStream = Ext.decode(event.data);

               var cmd = inputStream['code'];
               switch (cmd)
               {
                  case 'nfc' :
                  {
                     wssocket.onNfc(inputStream);
                     break;
                  }
                  case '' :
                  {
                     break;
                  }
                  default:
                     break;
               }
            }
            catch(e)
            {
               console.debug("Exception while parsing NFC Data ...\n" + e);
            }
         };
         wssocket.onerror = function(event)
         {
            console.debug("WebSocketServer::onerror");
         };
         wssocket.onclose = function(event)
         {
            console.debug("WebSocketServer::onclose");
         };
      }
   }
});

Ext.define('Genesis.profile.MobileServer',
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
      this.msg = Ext.create('Ext.MessageBox');

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

var launched = 0x000, pausedDisabled = true, backBtnCallbackListFn = [], offlineDialogShown = false, merchantMode = true;

window.debugMode = true;
window.serverHost;
window._application = null;
window.appName = 'MerKickBak';
window._hostPathPrefix = "/javascripts/build/MobileServer/";
window._hostPath = _hostPathPrefix + ((debugMode) ? "testing" : "production") + "/";
window.phoneGapAvailable = false;

_totalAssetCount++;

if (debugMode)
{
   //serverHost = 'http://192.168.0.52:3000';
   //serverHost = 'http://192.168.0.46:3000';
   //serverHost = 'http://76.10.173.153';
   serverHost = 'http://www.dev1getkickbak.com';
   //serverHost = 'http://www.devgetkickbak.com';
}
else
{
   serverHost = 'http://www.getkickbak.com';
}

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


(function()
{
   Genesis.db.getLocalDB();

   var flag = 0x100;
   var appLaunch = function()
   {
      if (launched == 0x111)
      {
         var viewport = _application.getController('server' + '.Viewport');
         viewport.appName = appName;

         Ext.create('Genesis.view.Viewport');
         console.debug("Launched App");

         // Destroy the #appLoadingIndicator element
         Ext.fly('appLoadingIndicator').destroy();
         _loadingPct = null;
         Ext.fly('loadingPct').destroy();
      }
   };
   var appLaunchCallbackFn = function(val)
   {
      _filesAssetCount++;
      if ((flag |= val) == 0x111)
      {
         Ext.application(
         {
            viewport :
            {
               autoMaximize : true
            },
            profiles : ['MobileServer'],
            name : 'Genesis',
            views : ['Document', 'server.Rewards', 'server.Redemptions', 'server.MerchantAccount', 'server.MainPage', //
            'widgets.server.RedeemItemDetail', 'server.SettingsPage', 'server.TagCreatePage', 'Viewport'],
            controllers : ['server.Viewport', 'server.MainPage', 'server.Challenges', 'server.Receipts', 'server.Rewards', //
            'server.Redemptions', 'server.Merchants', 'server.Settings', 'server.Prizes'],
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
                  callback : function(buttonId)
                  {
                     if (buttonId === 'yes')
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

      if (Ext.os.is('Tablet'))
      {
         if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
         {
            Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/ipad.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
         }
         else
         //if (Ext.os.is('Android'))
         {
            switch (resolution)
            {
               case 'lhdpi' :
               {
                  Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-tablet-lhdpi.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
                  break;
               }
               case 'mxhdpi' :
               {
                  Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-tablet-mxhdpi.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
                  break;
               }
            }
         }
      }
      else
      {
         if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
         {
            Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/iphone.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [(!Ext.os.is('iPhone5')) ? 0x011 : 0x001]));
            if (Ext.os.is('iPhone5'))
            {
               _totalAssetCount++;
               Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/iphone5.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x010]));
            }
         }
         else//
         //if (Ext.os.is('Android'))
         {
            switch (resolution)
            {
               case 'lhdpi' :
               {
                  Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-phone-lhdpi.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
                  break;
               }
               case 'mxhdpi' :
               {
                  Genesis.fn.checkloadjscssfile(_hostPath + "resources/css/android-phone-mxhdpi.css?v=" + Genesis.constants.clientVersion, "css", Ext.bind(appLaunchCallbackFn, null, [0x011]));
                  break;
               }
            }

         }
      }
   }, 0.1 * 1000);
})();

