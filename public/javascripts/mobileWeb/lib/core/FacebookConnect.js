__initFb__ = function()
{
   KickBak.fb =
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
         return ('Connecting to Facebook ...' + KickBak.constants.addCRLF() + '(Tap to Close)');
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
         var me = this;

         me.appId = (debugMode) ? 477780595628080 : 197968780267830;
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
      facebook_onLogin : function(callback, supress, message)
      {
         var me = this, refreshConn = true;
         var fbConnect = function()
         {
            Ext.defer(function()
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
                        callback();
                     }
                  }
               });
               FB.login(Ext.bind(me.facebook_loginCallback, me),
               {
                  scope : me.fbScope.toString()
               });
               /*
                FB.login(
                {
                permissions : me.fbScope,
                appId : "" + me.appId
                }, Ext.bind(me.facebook_loginCallback, me));
                */
            }, 1);
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

         FB.getLoginStatus(function(response)
         {
            if (response.status === 'connected')
            {
               // connected
               FB.login(Ext.bind(me.facebook_loginCallback, me),
               {
                  scope : me.fbScope.toString()
               });

            }
            else
            {
               var buttons = ['Confirm', 'Cancel'];
               message = message || me.fbConnectReconnectMsg;

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
            /*
             else if (response.status === 'not_authorized')
             {
             // not_authorized
             }
             else
             {
             // not_logged_in
             }
             */
         });
      },
      facebook_loginCallback : function(res)
      {
         var me = this, rc = null;

         // Check for cancellation/error
         if (!res || res.cancelled || res.error || (res.status != 'connected'))
         {
            console.debug("FacebookConnect.login:failedWithError:" + ((res) ? res.message : 'None'));
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
                           FB.login(Ext.bind(me.facebook_loginCallback, me),
                           {
                              scope : me.fbScope.toString()
                           });
                           /*
                            FB.login(
                            {
                            permissions : me.fbScope,
                            appId : "" + me.appId
                            }, Ext.bind(me.facebook_loginCallback, me));
                            */
                        }, 1, me);
                     }
                     else
                     {
                        Ext.Viewport.setMasked(null);
                        me.cb['callback'](null, null);
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
                  FB.login(Ext.bind(me.facebook_loginCallback, me),
                  {
                     scope : me.fbScope.toString()
                  });
                  /*
                   FB.login(
                   {
                   permissions : me.fbScope,
                   appId : "" + me.appId
                   }, Ext.bind(me.facebook_loginCallback, me));
                   */
               }, 2 * me.cb['iter'] * 1000, me);
            }
         }
         else
         {
            console.debug("Retrieving Facebook profile information ...");
            Ext.defer(function()
            {
               FB.api('/me', function(response)
               {
                  if (!response.error || (response.id && (response.id > 0)))
                  {
                     var facebook_id = response.id;

                     //console.debug("facebookConnect.login/me:[" + Ext.encode(response) + "]");
                     console.debug("Session ID[" + facebook_id + "]");
                     var rc = me.createFbResponse(response);

                     console.debug('You\`ve logged into Facebook! ' + '\n' + //
                     'Email(' + rc['email'] + ')' + '\n' + //
                     'ID(' + facebook_id + ')' + '\n');
                     //me.getFriendsList();

                     me.cb['callback'](rc, null);
                     delete me.cb;
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
         }
      },
      facebook_onLogout : function(cb, contactFB)
      {
         var me = this;

         cb = cb || Ext.emptyFn;

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
      }
   }
}
