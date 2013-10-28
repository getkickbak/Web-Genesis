Ext.define('Genesis.controller.client.Login',
{
   extend : 'Genesis.controller.ControllerBase',
   xtype : 'clientLoginCntlr',
   config :
   {
      models : ['Genesis.model.frontend.Signin', 'Genesis.model.frontend.Account', 'Genesis.model.frontend.ChangePassword', 'Venue', 'Customer', 'User', 'Merchant', 'CustomerReward'],
      routes :
      {
         'login' : 'loginPage',
         'signin' : 'signInPage',
         'password_reset' : 'signInResetPage',
         'password_change' : 'signInChangePage',
         'createAccount' : 'createAccountPage'
      },
      refs :
      {
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
         }
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
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      console.log("Client Login Init");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this, viewport = me.getViewPortCntlr(), db = Genesis.db.getLocalDB(), venue = Ext.create('Genesis.model.Venue', db['last_check_in'].venue);
      var latitude_1 = position.coords.getLatitude(), longitude_1 = position.coords.getLongitude(), latitude_2 = venue.get('latitude'), longitude_2 = venue.get('longitude');
      var distance = 6371000 * Math.acos(Math.cos(Math.radians(latitude_1)) * Math.cos(Math.radians(latitude_2)) * Math.cos(Math.radians(longitude_2) - Math.radians(longitude_1)) + Math.sin(Math.radians(latitude_1)) * Math.sin(Math.radians(latitude_2)));

      //
      // In proximity of the last_check_in location
      //
      if (distance <= Genesis.constants.minDistance)
      {
         var app = me.getApplication(), controller = app.getController('client' + '.Checkins');
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
   // --------------------------------------------------------------------------
   // Login Page
   // --------------------------------------------------------------------------
   onLoginActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      Genesis.db.resetStorage();
      me.persistResetStores();

      Ext.StoreMgr.get('CustomerStore').removeAll();
      Ext.StoreMgr.get('VenueStore').removeAll();
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
                  Genesis.db.removeLocalDBAttrib('auth_code');
                  /*
                   if (!Genesis.fn.isNative())
                   {
                   window.parent.setChildBrowserVisibility(false, 'explore');
                   }
                   else
                   {
                   setChildBrowserVisibility(false, 'explore');
                   }
                   */
                  console.log("Logout Successful!")
               }
               else
               {
                  console.log("Logout Failed!")
               }
               me.redirectTo('login');
            }
         });
      }
      else
      {
         me._loggingOut = false;
      }
      console.debug("Resetting Session information ...")
      if (Genesis.db.getLocalDB()['currFbId'] > 0)
      {
         console.debug("Logging out of Facebook ...")
         Genesis.fb.facebook_onLogout(null, true);
      }
      me.resetView();
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
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            params : Ext.apply(
            {
               version : Genesis.constants.clientVersion,
               device_pixel_ratio : window.devicePixelRatio,
               device : Ext.encode(Genesis.constants.device || null)
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
               device : Ext.encode(Genesis.constants.device || null)
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
      Genesis.fb.facebook_onLogout(null, Genesis.db.getLocalDB()['currFbId'] > 0);
      var me = this;
      var params =
      {
         version : Genesis.constants.clientVersion,
         device_pixel_ratio : window.devicePixelRatio,
         device : Ext.encode(Genesis.constants.device || null)
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
         device : Ext.encode(Genesis.constants.device || null)
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
         device : Ext.encode(Genesis.constants.device || null)
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

         Genesis.fb.facebook_onLogout(null, true);
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   loginPage : function()
   {
      this.openPage('login');
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
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this;

      switch (subFeature)
      {
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
   }
});
