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
