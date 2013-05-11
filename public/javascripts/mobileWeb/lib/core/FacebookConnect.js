__initFb__ = function()
{
   Ext.define('KickBak.fb',
   {
      mixins : ['Ext.mixin.Observable'],
      singleton : true,
      appId : null,
      fbTimeout : 10 * 1000,
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
      initialize : function()
      {
         var me = this;

         me.appId = (debugMode) ? 477780595628080 : 197968780267830;

         window.fbAsyncInit = Ext.bind(me.onFacebookInit, me);

         // Load the SDK asynchronously
         ( function(d, s, id)
            {
               var js, fjs = d.getElementsByTagName(s)[0];
               if (d.getElementById(id))
               {
                  return;
               }
               js = d.createElement(s);
               js.id = id;
               js.src = "//connect.facebook.net/en_US/all.js";
               fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
      },
      /**
       * This fucntion is run when the Facebook JS SDK has been successfully laoded onto the page.
       */
      onFacebookInit : function()
      {
         var me = this;

         me.hasCheckedStatus = false;
         // init the FB JS SDK
         if (debugMode)
         {
            console.debug("Facebook init Debug");
            FB.init(
            {
               cookie : true,
               frictionlessRequests : true,
               appId : me.appId + "", // App ID from the app dashboard
               status : true, // Check Facebook Login status
               xfbml : true // Look for social plugins on the page
            });
         }
         else
         {
            console.debug("Facebook init Production");
            FB.init(
            {
               cookie : true,
               frictionlessRequests : true,
               appId : me.appId + "", // App ID from the app dashboard
               channelUrl : '//' + serverHost + '/channel.html', // Channel file for x-domain comms
               status : true, // Check Facebook Login status
               xfbml : true // Look for social plugins on the page
            });
         }
         FB.Event.subscribe('auth.logout', function()
         {
            // This event can be fired as soon as the page loads which may cause undesired behaviour, so we wait
            // until after we've specifically checked the login status.
            if (me.hasCheckedStatus)
            {
               //
               // Logout
               //
               me.fireEvent('logout');
            }
         });

         // We set a timeout in case there is no response from the Facebook `init` method. This often happens if the
         // Facebook application is incorrectly configured (for example if the browser URL does not match the one
         // configured on the Facebook app.)
         me.fbLoginTimeout = setTimeout(function()
         {
            me.fireEvent('loginStatus');
            me.fireEvent('exception',
            {
               type : 'timeout',
               msg : 'The request to Facebook timed out.'
            }, null);
         }, me.fbTimeout);

         // Get the user login status from Facebook.
         FB.getLoginStatus(function(response)
         {
            me.fireEvent('loginStatus');

            clearTimeout(me.fbLoginTimeout);
            delete me.fbLoginTimeout;
            me.hasCheckedStatus = true;

            var db = KickBak.db.getLocalDB();

            //
            // Make action only if we got a reply from Login Attempt
            //
            if (db['fbLoginInProgress'])
            {
               KickBak.db.removeLocalDBAttrib('fbLoginInProgress');
               me.facebook_loginCallback(response);
            }
         });
      },
      /**
       * Returns the app location. If we're inside an iFrame, return the top level path
       */
      currentLocation : function()
      {
         if (window.top.location.host)
         {
            return window.top.location.protocol + "//" + window.top.location.host + window.top.location.pathname
         }
         else
         {
            return window.location.protocol + "//" + window.location.host + window.location.pathname
         }
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
            photoURL : 'http://graph.facebook.com/' + response.id + '/picture?type=square',
            accessToken : FB.getAuthResponse()['accessToken']
         }
         console.log("FbResponse - [" + Ext.encode(params) + "]");

         return params;
      },
      facebook_onLogin : function(supress, message)
      {
         var me = this, refreshConn = true;

         me.cb =
         {
            supress : supress,
            messsage : message,
            iter : 0
         };

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

         // We set a timeout in case there is no response from the Facebook `init` method. This often happens if the
         // Facebook application is incorrectly configured (for example if the browser URL does not match the one
         // configured on the Facebook app.)
         me.fbLoginTimeout = setTimeout(function()
         {
            me.fireEvent('loginStatus');
            me.fireEvent('exception',
            {
               type : 'timeout',
               msg : 'The request to Facebook timed out.'
            }, null);
         }, me.fbTimeout);

         // Get the user login status from Facebook.
         FB.getLoginStatus(function(response)
         {
            me.fireEvent('loginStatus');

            clearTimeout(me.fbLoginTimeout);
            delete me.fbLoginTimeout;
            if (response.status == 'connected')
            {
               KickBak.db.removeLocalDBAttrib('fbLoginInProgress');
               me.facebook_loginCallback(response);
            }
            else
            {
               KickBak.db.setLocalDBAttrib('fbLoginInProgress', true);
               window.top.location = me.redirectUrl();
            }
         });
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
            else if (!res || res.cancelled || me.cb['iter'] >= 3)
            {
               Ext.Viewport.setMasked(null);
               me.facebook_loginCallback(null);
               delete me.cb;
            }
            else if (me.cb['iter'] < 3)
            {
               me.cb['iter']++;
               Ext.defer(function()
               {
                  me.facebook_onLogin(false, me.cb['message']);

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

                     me.fireEvent('connected', rc, null);
                     delete me.cb;
                  }
                  else
                  {
                     Ext.Viewport.setMasked(null);
                     me.fireEvent('unauthorized', null, null);
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
   });
   KickBak.fb.initialize();

}
