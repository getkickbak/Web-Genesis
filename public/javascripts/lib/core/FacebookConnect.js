__initFb__ = function(_app, _appName)
{
   var app = _app;
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
         var me = this, db = app.db.getLocalDB();

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
                           _application.getController('client' + '.MainPage').redirectTo('createAccount');
                           break;
                        }
                        case "signinpageview" :
                        {
                           _application.getController('client' + '.MainPage').redirectTo('signin');
                           break;
                        }
                        case 'clientsettingspageview' :
                        {
                           _application.getController('client' + '.Settings').redirectTo('settings');
                           break;
                        }
                        case "loginpageview" :
                        {
                           delete me.cb;
                           _application.getController('client' + '.MainPage').onFacebookLoginCallback(p, op);
                           break;
                        }
                        default :
                           _application.getController('client' + '.Viewport').redirectTo('signup');
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
         }
         else
         {
            //
            // Let code update LocalStorage before leaving site
            //
            Ext.defer(function()
            {
               location.href = me.redirectUrl();
            }, 1 * 1000);
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
         var buttons = [
         {
            margin : '0 0.5 0.5 0',
            text : 'Decline',
            //ui : 'decline',
            handler : function()
            {
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
               me.actions.hide();
               var mainPage = _application.getController('client' + '.MainPage');
               mainPage.fireEvent('facebookTap', null, null, null, null, function()
               {
                  Ext.device.Notification.show(
                  {
                     title : me.titleMsg,
                     message : me.fbPermissionFailMsg,
                     buttons : ['Dismiss'],
                     callback : function(button)
                     {
                        mainPage._loggingIn = false;

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
               me.actions.hide();
               _application.getController('client' + '.Viewport').redirectTo('checkin');

               callback(onOrientationChange);
            }
         }];
         var createButtons = function(orientation)
         {
            orientation = orientation || Ext.Viewport.getOrientation(), mobile = Ext.os.is('Phone') || Ext.os.is('Tablet'), landscape = (mobile && (orientation == 'landscape'));

            var height = (!landscape && (buttons.length > 2)) ? 2 : 3;
            
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
               width : landscape ? '10em' : 'auto',
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
                  height : height + 'em',
                  flex : (landscape) ? null : 1
               },
               padding : '0 1.0 0.5 1.0',
               items : buttons
            });
         };
         var onOrientationChange = function(v, newOrientation, width, height, eOpts)
         {
            me.actions.remove(me.actions.query('container[tag=buttons]')[0], true);
            me.actions.add(createButtons(newOrientation));
         };
         var callback = function(onOrientationChange)
         {
            me.actions.destroy();
            delete me.actions;
            viewport.popUpInProgress = false;
            Ext.Viewport.un('orientationchange', onOrientationChange);
         };

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
                     'src="resources/themes/images/v1/facebook_icon.png"/>'
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

