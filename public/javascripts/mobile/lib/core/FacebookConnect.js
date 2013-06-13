//
//  FacebookConnect.js
//
// Created by Olivier Louvignes on 2012-06-25.
//
// Copyright 2012 Olivier Louvignes. All rights reserved.
// MIT Licensed

(function(cordova)
{

   function FacebookConnect()
   {
   }

   var service = 'FacebookConnect';

   FacebookConnect.prototype.initWithAppId = function(appId, callback)
   {
      if (!appId)
         return false;

      var _callback = function(result)
      {
         //console.log('FacebookConnect.initWithAppId: %o', arguments);
         if ( typeof callback == 'function')
            callback.apply(null, arguments);
      };

      return cordova.exec(_callback, _callback, service, 'initWithAppId', [
      {
         appId : appId
      }]);

   };

   FacebookConnect.prototype.login = function(options, callback)
   {
      if (!options)
         options =
         {
         };

      var config =
      {
         permissions : options.permissions || ['email'],
         appId : options.appId || ''
      };

      var _callback = function(result)
      {
         //console.log('FacebookConnect.login: %o', arguments);
         if ( typeof callback == 'function')
            callback.apply(null, arguments);
      };

      return cordova.exec(_callback, _callback, service, 'login', [config]);

   };

   /**
    * Make an asynchrous Facebook Graph API request.
    *
    * @param {String} path Is the path to the Graph API endpoint.
    * @param {Object} [options] Are optional key-value string pairs representing the API call parameters.
    * @param {String} [httpMethod] Is an optional HTTP method that defaults to GET.
    * @param {Function} [callback] Is an optional callback method that receives the results of the API call.
    */
   FacebookConnect.prototype.requestWithGraphPath = function(path, options, httpMethod, callback)
   {
      var method;

      if (!path)
         path = "me";
      if ( typeof options === 'function')
      {
         callback = options;
         options =
         {
         };
         httpMethod = undefined;
      }
      if ( typeof httpMethod === 'function')
      {
         callback = httpMethod;
         httpMethod = undefined;
      }
      httpMethod = httpMethod || 'GET';

      var _callback = function(result)
      {
         //console.log('FacebookConnect.requestWithGraphPath: %o', arguments);
         if ( typeof callback == 'function')
            callback.apply(null, arguments);
      };

      return cordova.exec(_callback, _callback, service, 'requestWithGraphPath', [
      {
         path : path,
         options : options,
         httpMethod : httpMethod
      }]);

   };

   FacebookConnect.prototype.logout = function(callback)
   {

      var _callback = function(logout)
      {
         //console.log('FacebookConnect.logout: %o', arguments);
         if ( typeof callback == 'function')
            callback.apply(null, arguments);
      };

      return cordova.exec(_callback, _callback, service, 'logout', []);

   };

   FacebookConnect.prototype.dialog = function(method, options, callback)
   {

      var _callback = function(result)
      {
         //console.log('FacebookConnect.dialog: %o', arguments);
         if ( typeof callback == 'function')
            callback.apply(null, arguments);
      };

      return cordova.exec(_callback, _callback, service, 'dialog', [
      {
         method : method,
         params : options
      }]);

   };

   cordova.addConstructor(function()
   {
      if (!window.plugins)
         window.plugins =
         {
         };
      window.plugins.facebookConnect = new FacebookConnect();
   });

})(window.cordova || window.Cordova);

// **************************************************************************
// Facebook API
// **************************************************************************
Genesis.fb =
{
   appId : null,
   titleMsg : 'Facebook Connect',
   fbScope : ['email', 'user_birthday', 'publish_stream', 'read_friendlists', 'publish_actions'],
   fbConnectErrorMsg : 'Cannot retrive Facebook account information!',
   fbConnectRequestMsg : 'By connecting to Facebook, you will receive additional Reward Pts everytime we update your KICKBAK activity to your Facebook account!',
   //   fbConnectRequestMsg : 'Would you like to update your Facebook Timeline?',
   fbConnectReconnectMsg : 'By connecting to Facebook, you will receive additional Reward Pts everytime we update your KICKBAK activity to your Facebook account!',
   //fbConnectReconnectMsg : 'Please confirm to Reconnect to Facebook',
   connectingToFBMsg : function()
   {
      return ('Connecting to Facebook ...' + Genesis.constants.addCRLF() + '(Tap to Close)');
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
   initFb : function()
   {
      var me = this, FB = window.plugins.facebookConnect;

      me.appId = (debugMode) ? 477780595628080 : 197968780267830;
   },
   getFriendsList : function(callback)
   {
      var uidField = "id";
      var nameField = "name";
      var me = this, FB = window.plugins.facebookConnect;
      var message = function(num)
      {
         return 'We found ' + num + ' Friends from your social network!';
      };

      FB.api('/me/friends&fields=' + nameField + ',' + uidField, function(response)
      {
         var friendsList = '';
         me.friendsList = [];
         if (response && response.data && (response.data.length > 0))
         {
            var data = response.data;
            for (var i = 0; i < data.length; i++)
            {
               if (data[i][uidField] != Genesis.db.getLocalDB()['currFbId'])
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
            console.log(message(me.friendsList.length));
            //this.checkFriendReferral(friendsList, callback);
         }
         else
         {
            Ext.device.Notification.show(
            {
               title : me.titleMsg,
               message : me.friendsRetrieveErrorMsg,
               buttons : ['Cancel', 'Relogin'],
               callback : function(button)
               {
                  if (button == "Relogin")
                  {
                     me.facebook_onLogout(function()
                     {
                        me.fbLogin(cb, false);
                     }, true);
                  }
               }
            });
         }
      });
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
         photoURL : 'http://graph.facebook.com/' + response.id + '/picture?type=square',
         accessToken : response.accessToken
      }

      return params;
   },
   //
   // Log into Facebook
   //
   facebook_onLogin : function(callback, supress, message)
   {
      var me = this, FB = window.plugins.facebookConnect, db = Genesis.db.getLocalDB();
      var refreshConn = (!(db['currFbId'] > 0) || !parseInt(db['fbExpiresIn']) || //
      ((db['currFbId'] > 0) && (db['fbExpiresIn'] > 0) && (parseInt(db['fbExpiresIn']) <= (new Date()).getTime())));
      var fbConnect = function()
      {
         Ext.Viewport.setMasked(null);
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.connectingToFBMsg(),
            listeners :
            {
               'tap' : function()
               {
                  Ext.Viewport.setMasked(null);
                  _application.getController('client' + ".MainPage")._loggingIn = false;
               }
            }
         });
         FB.login(
         {
            permissions : me.fbScope,
            appId : "" + me.appId
         }, Ext.bind(me.facebook_loginCallback, me));
      };

      me.cb =
      {
         callback : (callback) ? Ext.bind(function(params, operation, cb)
         {
            //
            // Even if the UpdateFbLogin failed (!operation.wasSuccessful()),
            // we should still allow them to do Facebook related activities ...
            //
            if ((operation && !operation.wasSuccessful()))
            {
               //
               // Reconnect with Facebook
               //
               me.facebook_onLogout(null, false);
               Ext.defer(function()
               {
                  me.facebook_onLogin(cb, false, message);
               }, 1, me);
               /*
                if (!me.cb['supress'])
                {
                Ext.device.Notification.show(
                {
                title : me.titleMsg,
                message : me.fbConnectFailMsg,
                buttons : ['Dismiss']
                });
                }
                */
            }
            else
            {
               cb(params, operation);
            }
         }, null, [callback], true) : Ext.emptyFn,
         supress : supress,
         iter : 0
      }

      if (refreshConn)
      {
         if (!me.cb['supress'])
         {
            var buttons = (db['enableFB']) ? ['Confirm', 'Cancel'] : ['OK', 'Cancel'];
            message = message || ((db['enableFB']) ? me.fbConnectReconnectMsg : me.fbConnectRequestMsg);
            Ext.device.Notification.show(
            {
               title : me.titleMsg,
               message : message,
               buttons : buttons,
               callback : function(btn)
               {
                  if (btn.toLowerCase() == buttons[0].toLowerCase())
                  {
                     fbConnect();
                  }
                  else
                  {
                     me.cb['callback'](null, null);
                  }
               }
            });
         }
         else
         {
            fbConnect();
         }
      }
      else
      {
         console.debug('FB ExpiryDate TimeStamp = ' + new Date(parseInt(db['fbExpiresIn'])));
         me.cb['callback'](db['fbResponse'], null);
         delete me.cb;
      }
   },
   facebook_loginCallback : function(res)
   {
      var me = this, FB = window.plugins.facebookConnect;

      //console.debug("facebookConnect.login:" + JSON.stringify(response));

      // Check for cancellation/error
      if (!res || res.cancelled || res.error)
      {
         console.debug("FacebookConnect.login:failedWithError:" + ((res) ? res.message : 'None'));
         Genesis.db.removeLocalDBAttrib('fbExpiresIn');
         if (!me.cb['supress'])
         {
            Ext.device.Notification.show(
            {
               title : me.titleMsg,
               message : me.fbConnectErrorMsg,
               buttons : ['Try Again', 'Continue'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() == 'try again')
                  {
                     Ext.defer(function()
                     {
                        FB.login(
                        {
                           permissions : me.fbScope,
                           appId : "" + me.appId
                        }, Ext.bind(me.facebook_loginCallback, me));
                     }, 1, me);
                  }
                  else
                  {
                     Ext.Viewport.setMasked(null);
                     delete me.cb;
                  }
               }
            });
         }
         else if (!res || res.cancelled || me.cb['iter'] >= 3)
         {
            Ext.Viewport.setMasked(null);
            me.cb['callback'](null, null);
            delete me.cb;
         }
         else if (me.cb['iter'] < 3)
         {
            me.cb['iter']++;
            Ext.defer(function()
            {
               FB.login(
               {
                  permissions : me.fbScope,
                  appId : "" + me.appId
               }, Ext.bind(me.facebook_loginCallback, me));
            }, 2 * me.cb['iter'] * 1000, me);
         }
         return;
      }

      try
      {
         date = Date.parse(res['expirationDate']);
         if (!date)
         {
            date = new Date(parseInt(res['expirationDate']));
         }
      }
      catch(e)
      {
         console.debug("Cannot decipher ExpirationDate ... Reset to default value");
         date = new Date();
      }
      console.debug("Logged into Facebook with Expiry Date [" + date + "], Time[" + date.getTime() + "]");
      Genesis.db.setLocalDBAttrib('fbExpiresIn', date.getTime());

      console.debug("Retrieving Facebook profile information ...");
      Ext.defer(function()
      {
         FB.requestWithGraphPath('/me', function(response)
         {
            if (!response.error || (response.id && (response.id > 0)))
            {
               var db = Genesis.db.getLocalDB(), facebook_id = response.id;

               //console.debug("facebookConnect.login/me:[" + Ext.encode(response) + "]");
               console.debug("Session ID[" + facebook_id + "]");
               db['currFbId'] = facebook_id;
               db['fbAccountId'] = response.email;
               db['fbResponse'] = me.createFbResponse(response);

               console.debug('You\`ve logged into Facebook! ' + '\n' + //
               'Email(' + db['fbAccountId'] + ')' + '\n' + //
               'auth_code(' + db['auth_code'] + ')' + '\n' + //
               'ID(' + facebook_id + ')' + '\n');
               me._fb_connect();
               //me.getFriendsList();

               if (db['auth_code'])
               {
                  console.debug("Updating Facebook Login Info ...");
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
                        if (operation.wasSuccessful())
                        {
                           Ext.Viewport.setMasked(null);
                           Genesis.db.setLocalDBAttrib('enableFB', true);
                           Genesis.db.setLocalDB(db);
                        }
                        me.cb['callback'](db['fbResponse'], operation);
                     }
                  });
               }
               else
               {
                  Genesis.db.setLocalDBAttrib('enableFB', true);
                  Genesis.db.setLocalDB(db);
                  me.cb['callback'](db['fbResponse'], null);
                  delete me.cb;
               }
            }
            else
            {
               Ext.Viewport.setMasked(null);
               me.cb['callback'](null, null);
               me.facebook_onLogout(null, false);
               delete me.cb;
            }
         });
      }, 0.5 * 1000, me);
   },
   _fb_connect : function()
   {
      /*
       $.cookie(this.appId + "_expires", null);
       $.cookie(this.appId + "_session_key", null);
       $.cookie(this.appId + "_ss", null);
       $.cookie(this.appId + "_user", null);
       $.cookie(this.appId, null);
       $.cookie("base_domain_", null);
       $.cookie("fbsr_" + this.appId, null);
       */
   },
   _fb_disconnect : function()
   {
      this._fb_connect();
   },
   facebook_onLogout : function(cb, contactFB)
   {
      var me = this, FB = window.plugins.facebookConnect;
      var db = Genesis.db.getLocalDB();

      cb = cb || Ext.emptyFn;
      me._fb_disconnect();
      db['currFbId'] = 0;
      delete db['fbAccountId'];
      delete db['fbResponse'];
      delete db['fbAuthCode'];
      delete db['fbExpiresIn'];
      Genesis.db.setLocalDB(db);

      console.debug("facebook_onLogout");
      try
      {
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
         {
            cb();
         }
      }
      catch(e)
      {
         cb();
      }
   },
   createFBReminderMsg : function()
   {
      var me = this;

      if (!me.actions)
      {
         me.actions = (Ext.create('Ext.Sheet',
            {
               bottom : 0,
               left : 0,
               top : 0,
               right : 0,
               padding : '1.0',
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
               },
               items : [
               {
                  width : '100%',
                  flex : 1,
                  style : 'text-align:center;display:inline-table;color:white;font-size:1.1em;',
                  html : me.fbConnectRequestMsg + '<img width="160" style="margin:0.7em 0;" src="resources/themes/images/v1/facebook_icon.png"/>'
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
                     text : 'Sign In',
                     ui : 'action',
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

                                 var viewport = _application.getController('client' + '.Viewport');
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
                                    //console.log("XType:" + activeItem.getXTypes())
                                 }
                              }
                           });
                        });

                        me.actions.destroy();
                        delete me.actions;
                     }
                  },
                  {
                     margin : '0.5 0 0.5 0',
                     text : 'Skip',
                     ui : 'cancel',
                     handler : function()
                     {
                        me.actions.hide();
                        _application.getController('client' + '.Viewport').redirectTo('checkin');

                        me.actions.destroy();
                        delete me.actions;
                     }
                  },
                  {
                     margin : '0.5 0 0 0',
                     text : 'Don\'t Remind Me Again',
                     //ui : 'decline',
                     handler : function()
                     {
                        me.actions.hide();
                        Genesis.db.setLocalDBAttrib('disableFBReminderMsg', true);

                        _application.getController('client' + '.Viewport').redirectTo('checkin');

                        me.actions.destroy();
                        delete me.actions;
                     }
                  }]
               }]
            }));
         Ext.Viewport.add(me.actions);
         me.actions.show();
      }
      else
      {
         //
         // Prevent Recursion ... Do nothing
         //
      }
   },
   //
   // Graph API
   //
   getFbProfilePhoto : function(fbId)
   {
      return 'http://graph.facebook.com/' + fbId + '/picture?type=square';
   }
};
