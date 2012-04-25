//---------------------------------------------------------------------------------------------------------------------------------
// System Functions
//---------------------------------------------------------------------------------------------------------------------------------
Ext.ns('Genesis.constants');

Genesis.constants =
{
   //host : 'http://192.168.0.52:3000',
   host : 'http://www.getkickbak.com',
   authToken : null,
   currFbId : 0,
   fbAccountId : null,
   fbResponse : null,
   sign_in_path : '/sign_in',
   sign_out_path : '/sign_out',
   site : 'www.getkickbak.com',
   weekday : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
   isNative : function()
   {
      //return Ext.isDefined(cordova);
      return phoneGapAvailable;
   },
   addCRLF : function()
   {
      return ((!this.isNative()) ? '<br/>' : '\n');
   },
   // **************************************************************************
   // Date Time
   // **************************************************************************
   convertDateCommon : function(v, dateFormat, noConvert)
   {
      var date;
      var format = dateFormat || this.dateFormat;

      if(!( v instanceof Date))
      {
         if( typeof (JSON) != 'undefined')
         {
            //v = (jQuery.browser.msie) ? v.split(/Z$/)[0] : v.split('.')[0];
            //v = (Ext.os.deviceType.toLowerCase() != 'desktop') ? v : v.split('.')[0];
            //v = (Genesis.constants.isNative()) ? v : v.split('.')[0];
         }

         if(Ext.isEmpty(v))
         {
            date = new Date();
         }
         else
         {
            if(format)
            {
               date = Date.parse(v, format);
               if(Ext.isEmpty(date))
               {
                  date = new Date(v).format(format);
               }
               return [date, date];
            }
            date = new Date(v);
            if(date.toString() == 'Invalid Date')
            {
               date = Date.parse(v, format);
            }
         }
      }
      else
      {
         date = v;
      }
      if(!noConvert)
      {
         var currentDate = new Date().getTime();
         // Adjust for time drift between Client computer and Application Server
         var offsetTime = Genesis.constants.currentDateTime(currentDate);

         var timeExpiredSec = (offsetTime - date.getTime()) / 1000;

         if(timeExpiredSec > -10)
         {
            if((timeExpiredSec) < 2)
               return [timeExpiredSec, 'a second ago'];
            if((timeExpiredSec) < 60)
               return [timeExpiredSec, parseInt(timeExpiredSec) + ' secs ago'];
            timeExpiredSec = timeExpiredSec / 60;
            if((timeExpiredSec) < 2)
               return [timeExpiredSec, 'a minute ago'];
            if((timeExpiredSec) < 60)
               return [timeExpiredSec, parseInt(timeExpiredSec) + ' minutes ago'];
            timeExpiredSec = timeExpiredSec / 60;
            if((timeExpiredSec) < 2)
               return [date, 'an hour ago'];
            if((timeExpiredSec) < 24)
               return [date, parseInt(timeExpiredSec) + ' hours ago'];
            timeExpiredSec = timeExpiredSec / 24;
            if(((timeExpiredSec) < 2) && ((new Date().getDay() - date.getDay()) == 1))
               return [date, 'Yesterday at ' + date.format('g:i A')];
            if((timeExpiredSec) < 7)
               return [date, Genesis.constants.weekday[date.getDay()] + ' at ' + date.format('g:i A')];
            timeExpiredSec = timeExpiredSec / 7;
            if(((timeExpiredSec) < 2) && (timeExpiredSec % 7 == 0))
               return [date, 'a week ago'];
            if(((timeExpiredSec) < 5) && (timeExpiredSec % 7 == 0))
               return [date, parseInt(timeExpiredSec) + ' weeks ago'];

            if(timeExpiredSec < 5)
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
      if(todayDate == date && todayMonth == month && todayYear == year)
      {
         return 'Today ' + v.format('g:i A');
      }
      return v.format('D g:i A');
   },
   convertDate : function(v, dateFormat)
   {
      var rc = Genesis.constants.convertDateCommon.call(this, v, dateFormat);
      if(rc[1] != -1)
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
      var rc = Genesis.constants.convertDateCommon.call(this, v, null, true);
      if(rc[1] != -1)
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
      var rc = Genesis.constants.convertDateCommon.call(this, v, null, true);
      if(rc[1] != -1)
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
      var rc = Genesis.constants.convertDateCommon.call(this, v, null, true);
      if(rc[1] != -1)
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
      return systemTime + (currentDate - clientTime);
   },
   // **************************************************************************
   // Facebook API
   /*
   * Clean up any Facebook cookies, otherwise, we have page loading problems
   * One set for production domain, another for developement domain
   */
   // **************************************************************************
   //
   initFb : function()
   {
      var fb = Genesis.constants;
      //Detect when Facebook tells us that the user's session has been returned
      FB.Event.monitor('auth.authResponseChange', function(session)
      {
         console.log('Got the user\'s session: ', session);

         if(session && session.status != 'not_authorized' && session.status != 'notConnected')
         {
            var authToken = session.authResponse['accessToken'];
            if(authToken)
            {
               //Fetch user's id, name, and picture
               FB.api('/me', function(response)
               {
                  if(!response.error)
                  {
                     fb.authToken = authToken;
                     fb.fbResponse = response;
                     fb.currFbId = response.id;
                     fb.fbAccountId = response.email;
                     console.log('Updating Session to use\n' + 'AuthToken[' + fb.authToken + ']\n' + 'FbID[' + fb.currFbId + ']\n' + 'AccountID[' + fb.fbAccountId + ']');
                  }
               });
            }
         }
         else
         if((session === undefined) || (session && session.status == 'not_authorized'))
         {
            console.log('User\'s session terminated');

            fb._fb_disconnect();
            if(session)
            {
               FB.logout(function(response)
               {
                  fb.currFbId = null;
                  fb.fbAccountId = null;
                  fb.fbResponse = null;
               });
            }
            else
            {
               fb.currFbId = null;
               fb.fbAccountId = null;
               fb.fbResponse = null;
            }
         }
      });
   },
   getFriendsList : function(callback)
   {
      var uidField = "id";
      var nameField = "name";
      var me = this;
      var fb = Genesis.constants;
      FB.api('/me/friends&fields=' + nameField + ',' + uidField, function(response)
      {
         var friendsList = '';
         me.friendsList = [];
         if(response && response.data && (response.data.length > 0))
         {
            var data = response.data;
            for(var i = 0; i < data.length; i++)
            {
               if(data[i][uidField] != fb.currFbId)
               {
                  me.friendsList.push(
                  {
                     label : data[i][nameField],
                     value : data[i][uidField]
                  });
                  friendsList += ((friendsList.length > 0) ? ',' : '') + data[i][uidField];
               }
            }
            me.friendsList.sort(function(a, b)
            {
               return a[uidField] - b[uidField];
            });
            Ext.device.Notification.show(
            {
               title : 'Facebook Connect',
               message : 'We found ' + me.friendsList.length + ' Friends from your social network!'
            });
            //this.checkFriendReferral(friendsList, callback);
         }
         else
         {
            Ext.device.Notification.show(
            {
               title : 'Facebook Connect',
               message : 'You cannot retrieve your Friends List from Facebook. Login and Try Again.',
               buttons : ['Relogin', 'Cancel'],
               callback : function(button)
               {
                  Genesis.constants.facebook_onLogout(function()
                  {
                     if(button == "Relogin")
                     {
                        fb.fbLogin(cb);
                     }
                     else
                     {
                        //fb.access_token = response.authResponse.accessToken;
                        //fb.facebook_loginCallback(cb);
                     }
                  });
               }
            });
         }
      });
   },
   facebook_onLogout : function(cb)
   {
      var fb = Genesis.constants;
      try
      {
         fb._fb_disconnect();
         FB.logout(function(response)
         {
            fb.currFbId = null;
            fb.fbAccountId = null;
            fb.fbResponse = null;
            //FB.Auth.setAuthResponse(null, 'unknown');
            if(cb)
            {
               cb()
            };
         });
      }
      catch(e)
      {
      }
   },
   //
   // Log into Facebook
   //
   fbLogin : function(cb)
   {
      var fb = Genesis.constants;
      console.debug("Logging into Facebook ...");
      FB.login(function(response)
      {
         if((response.status == 'connected') && response.authResponse)
         {
            console.debug("Logged into Facebook!");
            fb.access_token = response.authResponse['accessToken'];
            fb.facebook_loginCallback(cb);
         }
         else
         {
            console.debug("Login Failed! ...");
            Ext.device.Notification.show(
            {
               title : 'Facebook Connect',
               message : 'Failed to login to Facebook!'
            });
         }
      },
      {
         scope : 'email,user_birthday,publish_stream,read_friendlists,publish_actions'
      });
   },
   facebook_onLogin : function(cb, supress)
   {
      var fb = Genesis.constants;
      cb = cb || Ext.emptyFn
      //Browser Quirks
      //if($.client.browser == 'Safari')
      {
         FB.getLoginStatus(function(response)
         {
            //
            // Login as someone else?
            //
            if((response.status == 'connected') && response.authResponse)
            {
               if(!supress)
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Facebook Connect',
                     message : 'Account ID: ' + fb.fbAccountId + Genesis.constants.addCRLF() + 'will be used for your current Facebook session.',
                     buttons : ['OK', 'Cancel'],
                     callback : function(button)
                     {
                        if(button == "OK")
                        {
                           cb();
                        }
                     }
                  });
               }
               else
               {
                  cb();
               }
            }
            else
            if(response.status === 'not_authorized')
            {
               // the user is logged in to Facebook,
               // but has not authenticated your app
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : 'Your current Facebook Session hasn\'t been fully authorized for this application.' + Genesis.constants.addCRLF() + 'Press OK to continue.',
                  buttons : ['OK', 'Cancel'],
                  callback : function(button)
                  {
                     Genesis.constants.facebook_onLogout(function()
                     {
                        if(button == "OK")
                        {
                           fb.fbLogin(cb);
                        }
                     });
                  }
               });
            }
            else
            {
               fb.fbLogin(cb);
            }
         });
      }
      /*
       else
       {
       fb.fbLogin(cb);
       }
       */
   },
   facebook_loginCallback : function(cb)
   {
      var fb = Genesis.constants;
      console.debug("Retrieving Facebook profile information ...");

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : 'Logging into Facebook ...'
      });
      FB.api('/me', function(response)
      {
         Ext.Viewport.setMasked(false);

         var facebook_id = response.id;
         if(facebook_id == null)
         {
            console.debug("Missing Facebook Session information, Retrying ...");
            // Session Expired? Login again
            Ext.defer(function()
            {
               Genesis.constants.facebook_onLogout(function()
               {
                  fb.fbLogin(cb);
               });
            }, 100);
            return;
         }

         if(fb.currFbId == facebook_id)
         {
            console.debug("Session information same as previous session.");
         }
         fb.fbResponse = response;
         fb.currFbId = facebook_id;
         fb.fbAccountId = response.email
         console.debug('You have logged into Facebook! Email(' + fb.fbAccountId + ')');

         fb._fb_connect();
         fb.getFriendsList();

         if(cb)
         {
            var birthday = response.birthday.split('/');
            birthday = birthday[2] + "-" + birthday[0] + "-" + birthday[1];

            var params =
            {
               name : response.name,
               email : response.email,
               facebook_email : response.email,
               facebook_id : facebook_id,
               facebook_uid : response.username,
               gender : (response.gender == "male") ? "m" : "f",
               birthday : birthday,
               photoURL : 'http://graph.facebook.com/' + facebook_id + '/picture?type=square'
            }

            cb(params);
         }
      });
   },
   _fb_connect : function()
   {
      /*
       $.cookie(Genesis.fbAppId + "_expires", null);
       $.cookie(Genesis.fbAppId + "_session_key", null);
       $.cookie(Genesis.fbAppId + "_ss", null);
       $.cookie(Genesis.fbAppId + "_user", null);
       $.cookie(Genesis.fbAppId, null);
       $.cookie("base_domain_", null);
       $.cookie("fbsr_" + Genesis.fbAppId, null);
       */
   }
};
Genesis.constants._fb_disconnect = Genesis.constants._fb_connect;

Genesis.fn =
{
   addUnit : function(unit)
   {
      return unit + 'px';
   },
   _removeUnitRegex : /(\d+)px/,
   removeUnit : function(unit)
   {
      return unit.match(this._removeUnitRegex)[1];
   }
}

Ext.define('Genesis.dom.Element',
{
   override : 'Ext.dom.Element',
   // Bug fix for adding units
   setMargin : function(margin, unit)
   {
      if(margin || margin === 0)
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
      if(padding || padding === 0)
      {
         padding = this.self.unitizeBox((padding === true) ? 5 : padding, unit);
      }
      else
      {
         padding = null;
      }
      this.dom.style.padding = padding;
   },
});
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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.reader.Json
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.data.reader.Json',
{
   override : 'Ext.data.reader.Json',
   getResponseData : function(response)
   {
      var data = this.callParent(arguments);
      if(!data.metaData)
      {
         delete this.metaData;
      }
      return data;
   }
});
//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.proxy.Server
//---------------------------------------------------------------------------------------------------------------------------------

Ext.define('Genesis.data.proxy.OfflineServer',
{
   override : 'Ext.data.proxy.Server',
   processResponse : function(success, operation, request, response, callback, scope)
   {
      var me = this, action = operation.getAction(), reader = me.getReader(), resultSet;
      var app = _application;
      var vport = app.getController('Viewport');
      var errorHandler = function()
      {
         var messages = ((resultSet && Ext.isDefined(resultSet.getMessage)) ? (Ext.isArray(resultSet.getMessage()) ? resultSet.getMessage().join(Genesis.constants.addCRLF()) : resultSet.getMessage()) : 'Error Connecting to Server');
         var metaData = reader.metaData ||
         {
         };
         Ext.Viewport.setMasked(false);

         switch (metaData['rescode'])
         {
            //
            // Error from server, display this to user
            //
            case 'server_error' :
            {
               Ext.device.Notification.show(
               {
                  title : 'Server Error(s)',
                  message : messages,
                  callback : function()
                  {
                     if(metaData['session_timeout'])
                     {
                        vport.setLoggedIn(false);
                        Genesis.constants.authToken = null;
                        vport.onFeatureTap('MainPage', 'login');
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
                  message : 'Create user account using Facebook Profile information',
                  callback : function(button)
                  {
                     vport.setLoggedIn(false);
                     Genesis.constants.authToken = null;
                     var controller = app.getController('MainPage');
                     app.dispatch(
                     {
                        action : 'onCreateAccountTap',
                        args : [null, null, null, null],
                        controller : controller,
                        scope : controller
                     });
                  }
               });
               break;
            }
            case 'update_account_invalid_info' :
            case 'signup_invalid_info' :
            case 'update_account_invalid_facebook_info' :
            {
               var errors = [];
               for(var i in messages)
               {
                  errors.push(messages[i]);
               }
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : errors
               });
               break;
            }
            default:
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : messages
               });
               break;
         }
      }
      if((success === true) || (Genesis.constants.isNative() === true))
      {

         try
         {
            resultSet = reader.process(response);
         }
         catch(e)
         {
            console.debug('Ajax call is failed message=[' + e.message + '] url=[' + request.getUrl() + ']');
            operation.setException(operation,
            {
               status : null,
               statusText : e.message
            });

            me.fireEvent('exception', this, response, operation);
            errorHandler();
            return;
         }

         if(operation.process(action, resultSet, request, response) === false)
         {
            this.fireEvent('exception', this, response, operation);
            errorHandler();
         }
      }
      else
      {
         console.debug('Ajax call is failed status=[' + response.status + '] url=[' + request.getUrl() + ']');
         me.setException(operation, response);
         /**
          * @event exception
          * Fires when the server returns an exception
          * @param {Ext.data.proxy.Proxy} this
          * @param {Object} response The response from the AJAX request
          * @param {Ext.data.Operation} operation The operation that triggered request
          */
         me.fireEvent('exception', this, response, operation);
         errorHandler();
      }

      //this callback is the one that was passed to the 'read' or 'write' function above
      if( typeof callback == 'function')
      {
         callback.call(scope || me, operation);
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
      if(Genesis.constants.authToken)
      {
         this.setExtraParam("auth_token", Genesis.constants.authToken);
      }

      var request = this.callParent(arguments);

      if(operation.initialConfig.jsonData)
      {
         request.setJsonData(operation.initialConfig.jsonData);
      }

      return request;
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.Connection
//---------------------------------------------------------------------------------------------------------------------------------

Ext.define('Genesis.data.Connection',
{
   override : 'Ext.data.Connection',

   /**
    * Checks if the response status was successful
    * @param {Number} status The status code
    * @return {Object} An object containing success/status state
    */
   parseStatus : function(status)
   {
      // see: https://prototype.lighthouseapp.com/projects/8886/tickets/129-ie-mangles-http-response-status-code-204-to-1223
      status = status == 1223 ? 204 : status;

      var success = (status >= 200 && status < 300) || status == 304, isException = false;

      if(Genesis.constants.isNative() && (status === 0))
      {
         success = true;
      }
      if(!success)
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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.association.BelongsTo
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.data.association.BelongsTo',
{
   override : 'Ext.data.association.BelongsTo',
   read : function(record, reader, associationData)
   {
      record[this.getInstanceName()] = reader.read(associationData).getRecords()[0];
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.field.Select
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.field.Select',
{
   override : 'Ext.field.Select',
   // @private
   getListPanel : function()
   {
      if(!this.listPanel)
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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.dataview.element.List
//---------------------------------------------------------------------------------------------------------------------------------
/**
 * @private
 */
Ext.define('Genesis.dataview.element.List',
{
   override : 'Ext.dataview.element.List',

   updateListItem : function(record, item)
   {
      var me = this, dataview = me.dataview, extItem = Ext.fly(item), innerItem = extItem.down(me.labelClsCache, true), data = record.getData(true), disclosure = data && data.hasOwnProperty('disclosure'), iconSrc = data && data.hasOwnProperty('iconSrc'), disclosureEl, iconEl;

      innerItem.innerHTML = dataview.getItemTpl().apply(data);

      if(disclosure && dataview.getOnItemDisclosure())
      {
         disclosureEl = extItem.down(me.disclosureClsCache);
         //
         // Fix bug in Sencha Touch where "x-clsClass" is missing spaces
         //
         if(!disclosureEl)
         {
            disclosureEl = extItem.down(me.disclosureClsCache + me.hiddenDisplayCache);
            disclosureEl[disclosure ? 'removeCls' : 'addCls'](me.disclosureClsCache + me.hiddenDisplayCache);
            disclosureEl['addCls'](me.disclosureClsCache);
         }
         else
         {
            disclosureEl[disclosure ? 'removeCls' : 'addCls'](me.hiddenDisplayCache);
         }
      }

      if(dataview.getIcon())
      {
         iconEl = extItem.down(me.iconClsCache, true);
         iconEl.style.backgroundImage = iconSrc ? 'url("' + iconSrc + '")' : '';
      }
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.tab.Bar
//---------------------------------------------------------------------------------------------------------------------------------
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

//
//  FixedButton.js
//  GT.FixedButton
//
//  Created by Roy Yang on 2012-04-21.
//  Extended from Sencha Ext.Button
//  For latest and greatest, go to https://github.com/roycyang/Sencha-Touch-Extensions

Ext.define('Genesis.Button',
{
   override : 'Ext.Button',
   //xtype : 'fixedbutton',

   // removed the tap event and rolling our own logic
   initialize : function()
   {
      this.callParent();

      this.element.on(
      {
         scope : this,
         touchstart : 'onPress',
         dragend : 'onRelease',
         drag : 'onMove',
         tap : 'onTap'
      });
   },
   // @private
   onPress : function(e)
   {
      var element = this.element, pressedCls = this.getPressedCls();

      if(!this.getDisabled())
      {
         this.isPressed = true;
         // console.log('e.target', e);
         // adding a pressed flag
         if(!e.target.children.length)
         {
            this.pressedTarget = e.target.parentElement.id;
         }
         else
         {
            this.pressedTarget = e.target.id;
         }

         // console.log('onPress ' + this.pressTarget);

         if(this.hasOwnProperty('releasedTimeout'))
         {
            clearTimeout(this.releasedTimeout);
            delete this.releasedTimeout;
         }

         element.addCls(pressedCls);

      }
   },
   // @private
   // when user moves, test to see if touch even is still the target
   onMove : function(e, element)
   {
      if(!this.isPressed)
      {
         return;
      }

      var currentPressedTarget;
      var elem = Ext.get(element);

      if(Ext.getCmp('debugconsole'))
      {
         Ext.getCmp('debugconsole').setHtml(Ext.getCmp('debugconsole').getHtml() + '<br/>touchmove target id: ' + element.id);
         Ext.getCmp('debugconsole').getScrollable().getScroller().scrollToEnd();
      }

      // clicked on the label or icon instead of the button
      if(elem.parent('.x-button'))
      {
         currentPressedTarget = elem.parent('.x-button').id;
      }
      else
      if(elem.hasCls('x-button'))
      {
         currentPressedTarget = elem.id;
      }
      if(elem.parent('.x-tab'))
      {
         currentPressedTarget = elem.parent('.x-tab').id;
      }
      //
      // TabBar Buttons
      //
      else
      if(elem.hasCls('x-tab'))
      {
         currentPressedTarget = elem.id;
      }

      if(currentPressedTarget != this.pressedTarget)
      {
         this.element.removeCls(this.getPressedCls());
      }
      else
      {
         this.element.addCls(this.getPressedCls());
      }
   },
   // @private
   onRelease : function(e, element)
   {
      this.fireAction('release', [this, e, element], 'doRelease');
   },
   // @private
   doRelease : function(me, e, element)
   {
      var currentPressedTarget;
      var elem = Ext.get(element);

      // clicked on the label or icon instead of the button
      if(elem.parent('.x-button'))
      {
         //console.log('inside!');
         currentPressedTarget = elem.parent('.x-button').id;
      }
      else
      if(elem.hasCls('x-button'))
      {
         currentPressedTarget = elem.id;
      }
      //
      // TabBar Buttons
      //
      if(elem.parent('.x-tab'))
      {
         currentPressedTarget = elem.parent('.x-tab').id;
      }
      else
      if(elem.hasCls('x-tab'))
      {
         currentPressedTarget = elem.id;
      }

      //console.log('doRelease' + currentPressedTarget);

      if(!me.isPressed)
      {
         return;
      }

      me.isPressed = false;

      if(me.hasOwnProperty('pressedTimeout'))
      {
         clearTimeout(me.pressedTimeout);
         delete me.pressedTimeout;
      }

      me.releasedTimeout = setTimeout(function()
      {
         if(me && me.element)
         {
            me.element.removeCls(me.getPressedCls());
            if(currentPressedTarget == me.pressedTarget)
            {
               me.fireAction('tap', [me, e], 'doTap');
            }

         }

         // remove the pressedTarget flag
         me.pressedTarget = null;
      }, 10);
   },
   // @private
   // disable the existing onTap function from Ext.Button
   onTap : function(e)
   {
      return false;
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.plugin.PullRefresh
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.plugin.PullRefresh',
{
   override : 'Ext.plugin.PullRefresh',
   resetRefreshState : function()
   {
      //Ext.get('refreshListSound').dom.play();
      Ext.device.Notification.beep(1);
      this.callParent(arguments);
   }
});

//---------------------------------------------------------------------------------
// Array
//---------------------------------------------------------------------------------
Ext.merge(Array.prototype,
{
   binarySearch : function(find, comparator)
   {
      var low = 0, high = this.length - 1, i, comparison;
      while(low <= high)
      {
         i = Math.floor((low + high) / 2);
         comparison = comparator(this[i], find);
         if(comparison < 0)
         {
            low = i + 1;
            continue;
         };
         if(comparison > 0)
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
   getFuncBody : function()
   {
      var str = this.toString();
      str = str.replace(/[^{]+\{/, "");
      str = str.substring(0, str.length - 1);
      str = str.replace(/\n/gi, "");
      if(!str.match(/\(.*\)/gi))
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
      var s = '';
      for(var i = 0; i < n; i++)
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
      if(x == 'left')
         return this.replace(/^\s*/, '');
      if(x == 'right')
         return this.replace(/\s*$/, '');
      if(x == 'normalize')
         return this.replace(/\s{2,}/g, ' ').trim();

      return this.trim('left').trim('right');
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

      for(p in entities)
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

      for(p in entities)
      {
         keys.push(p);
      }
      regex = new RegExp('(' + keys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');

      return function(value)
      {
         return (!value) ? value : String(value).replace(regex, function(match, capture)
         {
            if( capture in entities)
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
