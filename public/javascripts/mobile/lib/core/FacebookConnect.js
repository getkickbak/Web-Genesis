__initFb__ = function()
{
   // **************************************************************************
   // Facebook API
   // **************************************************************************
   Ext.define('Genesis.fb',
   {
      mixins : ['Ext.mixin.Observable'],
      singleton : true,
      appId : null,
      fbTimeout : 2 * 60 * 1000, // 2minute timeout period to login
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
      initialize : function()
      {
         var me = this;

         me.appId = (debugMode) ? 477780595628080 : 197968780267830;
         me._appSecretId = (debugMode) ? 'f47bc95247d475ca734b3a72e0bb544c' : '080cb42570fde6ced464aa083e7b1c5a';
         console.log("FacebookConnect::initialize");
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
         return (((debugMode) ? serverHost : 'http://m.getkickbak.com') + "/");
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
            accessToken : Genesis.db.getLocalDB()['access_token']
         }
         console.log("FbResponse - [" + Ext.encode(params) + "]");

         return params;
      },
      facebook_onLogin : function(supress, message, activeConnRequired)
      {
         var me = this, refreshConn = true, db = Genesis.db.getLocalDB();
         var connected = (db['currFbId'] > 0) && (parseInt(db['fbExpiresIn']) > 0);

         console.log(//
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
               console.log("Facebook already connected. Bypass relogin process");
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
            iter : 0
         }

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
                  me.facebook_loginCallback(null);
               }
            }
         });

         Genesis.db.setLocalDBAttrib('fbLoginInProgress', true);
         //window.top.location = me.redirectUrl();
         //
         // Open InAppBrowser
         //
         me.inAppBrowserCallback();
      },
      inAppBrowserCallback : function()
      {
         var me = this, ref = window.open(me.redirectUrl(), '_blank', 'location=no,toolbar=no,closebuttoncaption=Cancel');
         me.fbLoginTimeout = setTimeout(function()
         {
            me.fireEvent('loginStatus');
            me.fireEvent('exception',
            {
               type : 'timeout',
               msg : 'The request to Facebook timed out.'
            }, null);

            Genesis.db.removeLocalDBAttrib('fbLoginInProgress');
            ref.close();
            me.facebook_loginCallback(null);
         }, me.fbTimeout);

         ref.addEventListener('loadstart', function(event)
         {
            //console.log("FacebookConnect::loadstart - url(" + event.url + ")");
            if (event.url.match(me.currentLocation()))
            {
               if (event.url.indexOf("code=") >= 1)
               {
                  me.code = event.url.split("=")[1];
               }
               Ext.defer(function()
               {
                  ref.close();
               }, 500);
            }
         });
         ref.addEventListener('loadstop', function(event)
         {
            //console.log("FacebookConnect::loadstop - url(" + event.url + ")");
         });
         ref.addEventListener('exit', function(event)
         {
            clearTimeout(me.fbLoginTimeout);
            delete me.fbLoginTimeout;
            Genesis.db.removeLocalDBAttrib('fbLoginInProgress');

            if (me.code)
            {
               Ext.defer(function()
               {
                  Ext.Ajax.request(
                  {
                     async : true,
                     method : 'POST',
                     params :
                     {
                        client_id : me.appId,
                        client_secret : me._appSecretId,
                        redirect_uri : me.currentLocation(),
                        code : me.code,
                     },
                     disableCaching : false,
                     url : 'https://graph.facebook.com/oauth/access_token',
                     cache : false,
                     callback : function(option, success, response)
                     {
                        var res = null;
                        try
                        {
                           //console.log("FacebookConnect::authCode=" + response.responseText);
                           res = Ext.Object.fromQueryString(response.responseText);

                           if (success || (response.status == 200))
                           {
                              var db = Genesis.db.getLocalDB();
                              db['access_token'] = res['access_token'];
                              db['fbExpiresIn'] = (new Date(Date.now() + Number(res['expires']))).getTime();
                              //console.log("FacebookConnect::access_token=" + db['access_token']);
                              //console.log("FacebookConnect::fbExpiresIn=" + db['fbExpiresIn']);
                              Genesis.db.setLocalDB(db);

                              Ext.Ajax.request(
                              {
                                 async : true,
                                 disableCaching : false,
                                 url : 'https://graph.facebook.com/me?access_token=' + res['access_token'],
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
                                       console.log("Error Logging into Facebook\n" + //
                                       'Return ' + Ext.encode(response));
                                       me.facebook_loginCallback(null);
                                    }
                                 }
                              });
                           }
                           else
                           {
                              console.log("Error Logging into Facebook\n" + //
                              'Return ' + Ext.encode(response));
                              me.facebook_loginCallback(res);
                           }
                        }
                        catch(e)
                        {
                        }
                     }
                  });
                  delete me.code;
               }, 100);
            }
            else
            {
               me.facebook_loginCallback(null);
            }
         });
      },
      facebook_loginCallback : function(res)
      {
         var me = this, rc = null;

         // Check for cancellation/error
         if (!res || res.cancelled || res.error || (res.status != 'connected'))
         {
            console.log("FacebookConnect.login:failedWithError:" + ((res) ? res.message : 'None'));
            if (!me.cb || !me.cb['supress'])
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
                     var db = Genesis.db.getLocalDB(), facebook_id = response.id;

                     //console.log("facebookConnect.login/me:[" + Ext.encode(response) + "]");
                     console.log("Session ID[" + facebook_id + "]");
                     db['currFbId'] = facebook_id;
                     db['fbAccountId'] = response.email;
                     rc = db['fbResponse'] = me.createFbResponse(response);

                     Genesis.db.setLocalDB(db);
                     db = Genesis.db.getLocalDB();

                     console.log('You\`ve logged into Facebook! ' + '\n' + //
                     'Email(' + rc['email'] + ')' + '\n' + //
                     'auth_code(' + db['auth_code'] + ')' + '\n' + //
                     'ID(' + facebook_id + ')' + '\n');
                     //me.getFriendsList();

                     delete me.cb;

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
                              if (operation.wasSuccessful())
                              {
                                 Ext.Viewport.setMasked(null);
                                 Genesis.db.setLocalDBAttrib('enableFB', true);
                              }
                              me.fireEvent('connected', rc, operation);
                           }
                        });
                     }
                     else
                     {
                        Genesis.db.setLocalDBAttrib('enableFB', true);
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

         console.log("facebook_onLogout");
         try
         {
            var db = Genesis.db.getLocalDB();
            db['currFbId'] = 0;
            delete db['fbAccountId'];
            delete db['fbResponse'];
            delete db['fbAuthCode'];
            delete db['fbExpiresIn'];
            Genesis.db.setLocalDB(db);
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
      postCommon : function(url, params, success, fail)
      {
         var me = this;

         params = Ext.apply(params,
         {
            access_token : Genesis.db.getLocalDB()['fbResponse']['accessToken']
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
                     console.log("Error Logging into Facebook\n" + //
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
   Genesis.fb.initialize();
}

