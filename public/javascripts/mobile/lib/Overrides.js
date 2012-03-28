//---------------------------------------------------------------------------------------------------------------------------------
// System Functions
//---------------------------------------------------------------------------------------------------------------------------------
Ext.ns('Genesis.constants');

Genesis.constants =
{
   currFbId : 0,
   authToken : null,
   sign_in_path : '/sign_in',
   sign_out_path : '/sign_out',
   site : 'www.getkickbak.com',
   weekday : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
   isNative : function()
   {
      //return Ext.isDefined(Cordova);
      return phoneGapAvailable;
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
               date = Date.parseDate(v, format);
               if(Ext.isEmpty(date))
               {
                  date = new Date(v).format(format);
               }
               return [date, date];
            }
            date = new Date(v);
            if(date.toString() == 'Invalid Date')
            {
               date = Date.parseDate(v, format);
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
               if(data[i][uidField] != Genesis.currFbId)
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
                  fb._fb_disconnect();
                  FB.logout(function()
                  {
                     //FB.Auth.setAuthResponse(null, 'unknown');
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
            //FB.Auth.setAuthResponse(null, 'unknown');
            fb.fbLogin(cb);
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
      console.log("Logging into Facebook ...");
      FB.login(function(response)
      {
         if((response.status == 'connected') && response.authResponse)
         {
            console.log("Logged into Facebook!");
            fb.access_token = response.authResponse.accessToken;
            fb.facebook_loginCallback(cb);
         }
         else
         {
            console.log("Login Failed! ...");
         }
      },
      {
         scope : 'email,user_birthday,publish_stream,read_friendlists,publish_actions'
      });
   },
   facebook_onLogin : function(cb)
   {
      var fb = Genesis.constants;
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
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : 'Your account is linked to your current Facebook session'
               });
            }
            else
            if(response.status === 'not_authorized')
            {
               // the user is logged in to Facebook,
               // but has not authenticated your app
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : 'Your current Facebook Session hasn\'t been fully authorized for this application.' + ((!Genesis.constants.isNative()) ? '.<br/>' : '\n') + 'Press OK to continue.',
                  buttons : ['OK', 'Cancel'],
                  callback : function(button)
                  {
                     // Logout to relogin for later
                     fb._fb_disconnect();
                     FB.logout(function(response)
                     {
                        //FB.Auth.setAuthResponse(null, 'unknown');
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
      console.log("Retrieving Facebook profile information ...");

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
            // Session Expired? Login again
            facebook_onLogout(cb);
            return;
         }

         if(fb.currFbId != facebook_id)
         {
            var birthday = response.birthday.split('/');
            birthday = birthday[2] + "-" + birthday[0] + "-" + birthday[1];

            var params =
            {
               name : response.name,
               email : response.email,
               faebook_id : facebook_id,
               faecbook_uid : response.username,
               gender : (response.gender == "male") ? "m" : "f",
               birthday : birthday,
               photoURL : 'http://graph.facebook.com/' + facebook_id + '/picture?type=square'
            }

            if(cb)
            {
               cb(params);
            }
            Ext.device.Notification.show(
            {
               title : 'Facebook Connect',
               message : 'You have logged into Facebook! Email(' + params.email + ')'
            });

            fb.currFbId = facebook_id;
         }
         fb._fb_connect();
         fb.getFriendsList();
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
   updatePadding : function(padding)
   {
      this.innerElement.setPadding(padding, this.getInitialConfig().defaultUnit);
   },
   updateMargin : function(margin)
   {
      this.element.setMargin(margin, this.getInitialConfig().defaultUnit);
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.reader.Reader, Ext.data.reader.Json
//---------------------------------------------------------------------------------------------------------------------------------

Ext.define('Genesis.data.reader.Reader',
{
   override : 'Ext.data.reader.Reader',
   constructor : function(config)
   {
      this.self.addConfig(
      {
         messageProperty : 'message',
         rootProperty : 'data'
      }, true);
      this.callParent(arguments);
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
      var me = this, action = operation.getAction(), reader, resultSet;
      var errorHandler = function()
      {
         var messages = resultSet.getMessage();
         Ext.Viewport.setMasked(false);

         Ext.device.Notification.show(
         {
            title : 'Server Error(s)',
            message : (messages) ? messages.join(((!Genesis.constants.isNative()) ? '<br/>' : '\n')) : 'Error Connecting to Server',
            callback : function()
            {
               var vport = _application.getController('Viewport');
               vport.setLoggedIn(false);
               Genesis.constants.authToken = null;
               vport.onFeatureTap('MainPage', 'login');
            }
         });
      }
      if((success === true) || (Genesis.constants.isNative() === true))
      {
         reader = me.getReader();

         try
         {
            resultSet = reader.process(response);
         }
         catch(e)
         {
            console.log('Ajax call is failed message=[' + e.message + '] url=[' + request.getUrl() + ']');
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
         console.log('Ajax call is failed status=[' + response.status + '] url=[' + request.getUrl() + ']');
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
