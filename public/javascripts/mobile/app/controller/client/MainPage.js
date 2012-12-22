Ext.define('Genesis.controller.client.MainPage',
{
   extend : 'Genesis.controller.MainPageBase',
   xtype : 'clientMainPageCntlr',
   config :
   {
      csrfTokenRecv : false,
      models : ['frontend.MainPage', 'frontend.Signin', 'frontend.Account', 'Customer', 'User', 'Merchant', 'CustomerReward'],
      after :
      {
         'mainPage' : ''
      },
      routes :
      {
         //'' : 'openPage', //Default do nothing
         'login' : 'loginPage',
         'merchant' : 'merchantPage',
         'signin' : 'signInPage',
         'password_reset' : 'signInResetPage',
         'password_change' : 'signInChangePage',
         'createAccount' : 'createAccountPage',
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
         },
         mainCarousel : 'mainpageview',
         shortcutTabBar : 'mainpageview tabbar[tag=navigationBarBottom]',
         prizesBtn : 'mainpageview tabbar[tag=navigationBarBottom] button[tag=prizesSC]'
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
            tap : 'onFacebookTap'
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
         shortcutTabBar :
         {
            tabchange : 'onTabBarTabChange'
         },
         createAccount :
         {
            activate : 'onCreateActivate',
            deactivate : 'onCreateDeactivate'
         },
         'createaccountpageview button[tag=createAccount]' :
         {
            tap : 'onCreateAccountSubmit'
         }
      },
      listeners :
      {
         'refreshCSRF' : 'onRefreshCSRF'
      }
   },
   _loggingOut : false,
   _logoutflag : 0,
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
   loginWithFbMsg : function(msg)
   {
      return 'Logging in ...';
   },
   initCallback : function()
   {
      var me = this;
      var db = Genesis.db.getLocalDB();
      if (db['auth_code'])
      {
         me.fireEvent('refreshCSRF');
      }
      else
      {
         me.resetView();
         me.redirectTo('login');
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Load all the info into Stores
      // Normally we do this in the Login screen
      //
      Ext.regStore('UserStore',
      {
         model : 'Genesis.model.User',
         autoLoad : false
      });

      //
      // Customer Accounts for an user
      //
      me.initCustomerStore();

      //
      // Venue Store for Redeem Shorcuts
      //
      me.initVenueStore();

      console.log("Client MainPage Init");
   },
   initCustomerStore : function()
   {
      var me = this;
      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false,
         pageSize : 1000,
         listeners :
         {
            scope : me,
            'load' : function(store, records, successful, operation, eOpts)
            {
            },
            'metachange' : function(store, proxy, eOpts)
            {
               var metaData = proxy.getReader().metaData;
               //
               // QR Code from Transfer Points
               //
               var qrcode = metaData['data'];
               if (qrcode)
               {
                  /*
                   console.debug("QRCode received for Points Transfer" + '\n' + //
                   qrcode);
                   */
                  var app = me.getApplication();
                  var controller = app.getController('client.Accounts');
                  controller.callBackStack['arguments'] = [metaData];
                  controller.fireEvent('triggerCallbacksChain');
               }
               //
               // Update PrizeStore
               //
               /*
                var prizes = metaData['prizes'];
                if (prizes)
                {
                console.debug("Total Prizes - " + prizes.length);
                Ext.StoreMgr.get('rizeStore').setData(prizes);
                me.persistSyncStores('PrizeStore');
                }
                */
            }
         },
         grouper :
         {
            groupFn : function(record)
            {
               return record.getMerchant().get('name');
            }
         },
         filters : [
         {
            filterFn : function(record)
            {
               return Customer.isValid(record.getId());
            }
         }],
         sorters : [
         {
            sorterFn : function(o1, o2)
            {
               var name1 = o1.getMerchant().get('name'), name2 = o2.getMerchant().get('name');
               if (name1 < name2)//sort string ascending
                  return -1
               if (name1 > name2)
                  return 1
               return 0 //default return value (no sorting)
            }
         }]
      });
   },
   initVenueStore : function()
   {
      var me = this;
      Ext.regStore('VenueStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false,
         sorters : [
         {
            property : 'distance',
            direction : 'ASC'
         }],
         listeners :
         {
            'metachange' : function(store, proxy, eOpts)
            {
               // Let Other event handlers udpate the metaData first ...
               //
               // No MetaData returned for now ...
               //
               if (store.isLoading())
               {
                  me.fireEvent('updatemetadata', proxy.getReader().metaData);
               }
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var latitude_1 = position.coords.getLatitude();
      var longitude_1 = position.coords.getLongitude();
      var db = Genesis.db.getLocalDB();
      var venue = Ext.create('Genesis.model.Venue', db['last_check_in'].venue);
      var latitude_2 = venue.get('latitude');
      var longitude_2 = venue.get('longitude');

      var distance = 6371000 * Math.acos(Math.cos(Math.radians(latitude_1)) * Math.cos(Math.radians(latitude_2)) * Math.cos(Math.radians(longitude_2) - Math.radians(longitude_1)) + Math.sin(Math.radians(latitude_1)) * Math.sin(Math.radians(latitude_2)));

      //
      // In proximity of the last_check_in location
      //
      if (distance <= Genesis.constants.minDistance)
      {
         var app = me.getApplication();
         var controller = app.getController('client.Checkins');
         var customer = Ext.StoreMgr.get('CustomerStore').getById(db['last_check_in'].customerId);
         var metaData = db['last_check_in'].metaData;

         console.log("Restoring Previous Venue Location ...");
         controller.fireEvent('setupCheckinInfo', 'explore', venue, customer, metaData)
         controller.fireEvent('checkinMerchant', 'checkin', metaData, venue.getId(), customer, null, Ext.emptyFn);
      }
      //
      // We've at somewhere
      else
      {
         console.log("Reset Previous Location back to Home Page ...");
         Genesis.db.removeLocalDBAttrib('last_check_in');
         me.redirectTo('checkin');
      }
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //activeItem.createView();
      this.getInfoBtn()[(merchantMode) ? 'hide' : 'show']();
      /*
       if (!merchantMode)
       {
       var showIcon = false;
       var customers = Ext.StoreMgr.get('CustomerStore').getRange();

       for (var i = 0; i < customers.length; i++)
       {
       var customer = customers[i];
       if (customer.get('eligible_for_prize'))
       {
       showIcon = true;
       break;
       }
       }
       this.getPrizesBtn().setBadgeText( showIcon ? '✔' : null);
       }
       */
      Ext.Viewport.setMasked(null);
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      //this.getInfoBtn().hide();
   },
   onTabBarTabChange : function(bar, newTab, oldTab, eOpts)
   {
      switch(newTab.config.tag)
      {
         default :
         case 'rewards' :
         {
            Ext.defer(function()
            {
               try
               {
                  if (newTab)
                  {
                     newTab.setActive(false);
                  }

                  if (oldTab)
                  {
                     oldTab.setActive(false);
                  }
                  bar._activeTab = null;
               }
               catch(e)
               {
               }
            }, 2 * 1000);
            break;
         }
      }

      return true;
   },
   // --------------------------------------------------------------------------
   // Login Page
   // --------------------------------------------------------------------------
   facebookLogin : function(params)
   {
      var me = this;
      Customer['setFbLoginUrl']();
      console.log("setFbLoginUrl - Logging in ...");
      Ext.StoreMgr.get('CustomerStore').load(
      {
         jsonData :
         {
         },
         params : Ext.apply(params,
         {
            device_pixel_ratio : window.devicePixelRatio,
            device : Ext.encode(Genesis.constants.device)
         }),
         callback : function(records, operation)
         {
            //
            // Login Error, let the user login again
            //
            if (!operation.wasSuccessful())
            {
               //
               // If we are already in Login Page, reset all values
               //
               Genesis.db.resetStorage();
            }
            else
            {
               Genesis.db.setLocalDBAttrib('enableFB', true);
               me.persistSyncStores('CustomerStore');
               me.fireEvent('updatemetadata', Customer.getProxy().getReader().metaData);
            }
         }
      });
   },
   onLoginActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var viewport = this.getViewPortCntlr();

      Genesis.db.resetStorage();
      viewport.setLoggedIn(false);

      //this.getInfoBtn().hide();
      //activeItem.createView();
   },
   onLoginDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //oldActiveItem.removeAll(true);
   },
   onLogoutTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var vport = me.getViewport();
      var viewport = me.getViewPortCntlr();

      if (me._loggingOut)
      {
         return;
      }
      me._logoutflag = 0;
      me._loggingOut = true;
      //
      // Logout of Facebook
      //
      var _logout = function()
      {
         var authCode = Genesis.db.getLocalDB()['auth_code'];
         if (authCode)
         {
            console.log("Logging out ...")
            Customer['setLogoutUrl'](authCode);
            Ext.StoreMgr.get('CustomerStore').load(
            {
               jsonData :
               {
               },
               callback : function(records, operation)
               {
                  Ext.Viewport.setMasked(null);
                  me._loggingOut = false;
                  if (operation.wasSuccessful())
                  {
                     me.persistSyncStores(null, true);
                     console.log("Logout Successful!")
                  }
                  else
                  {
                     console.log("Logout Failed!")
                  }
               }
            });
         }
         else
         {
            me._loggingOut = false;
         }
         console.log("Resetting Session information ...")
         if (Genesis.db.getLocalDB()['currFbId'] > 0)
         {
            console.log("Logging out of Facebook ...")
            Genesis.fb.facebook_onLogout(null, true);
         }
         me.resetView();
         me.redirectTo('login');
      }
      b.parent.onAfter(
      {
         hiddenchange : function()
         {
            if ((me._logoutflag |= 0x01) == 0x11)
            {
               _logout();
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
         console.log("No Login info found from Facebook ...")
      }
      //
      // Login as someone else?
      //
      if ((me._logoutflag |= 0x10) == 0x11)
      {
         _logout();
      }
   },
   onFacebookTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      //
      // Forced to Login to Facebook
      //
      if (!Ext.Viewport.getMasked())
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.loginWithFbMsg()
         });
         Genesis.db.removeLocalDBAttrib('currFbId');
         Genesis.fb.facebook_onLogin(function(params)
         {
            console.log(me.loginWithFbMsg());
            me.facebookLogin(params);
         }, true);
      }
   },
   onCreateAccountTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('createAccount');
   },
   onSignInTap : function(b, e, eOpts, eInfo)
   {
      //this.resetView();
      this.redirectTo('signin');
   },
   // --------------------------------------------------------------------------
   // SignIn and CreateAccount Page
   // --------------------------------------------------------------------------
   onRefreshCSRF : function()
   {
      var me = this;
      var proxy = Account.getProxy();

      Account['setRefreshCsrfTokenUrl']();
      console.log("setRefreshCsrfTokenUrl - Refreshing CSRF Token ...");
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.establishConnectionMsg
      });
      Account.load(0,
      {
         jsonData :
         {
         },
         params :
         {
            device_pixel_ratio : window.devicePixelRatio,
            device : Ext.encode(Genesis.constants.device)
         },
         callback : function(record, operation)
         {
            if (operation.wasSuccessful())
            {
               //Ext.Viewport.setMasked(null);
               var db = Genesis.db.getLocalDB();
               var viewport = me.getViewPortCntlr();

               me.persistLoadStores(Ext.emptyFn);
               viewport.fireEvent('completeRefreshCSRF');

               // Return to previous Venue
               if (db['last_check_in'])
               {
                  me.getGeoLocation();
               }
            }
            //
            // Error refresh CSRF Token. go back to Login screen
            //
            else
            {
               me.resetView();
               me.redirectTo('login');
            }
         }
      });
   },
   onCreateAccountSubmit : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var account = me.getCreateAccount();
      var values = account.getValues();
      var user = Ext.create('Genesis.model.frontend.Account', values);
      var validateErrors = user.validate();
      var response = Genesis.db.getLocalDB()['fbResponse'] || null;

      if (!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         var message = label + ' ' + field.getMessage() + Genesis.constants.addCRLF() + 'Please Try Again';
         console.log(message);
         Ext.device.Notification.show(
         {
            title : 'Oops',
            message : message
         });
      }
      else
      {
         console.debug("Creating Account ...");
         var params =
         {
            name : values.name,
            email : values.username,
            password : values.password
         };

         if (response)
         {
            params = Ext.apply(params, response);
         }

         Customer['setCreateAccountUrl']();
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            params :
            {
               device_pixel_ratio : window.devicePixelRatio,
               user : Ext.encode(params),
               device : Ext.encode(Genesis.constants.device)
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
                  me.persistSyncStores();
                  me.fireEvent('updatemetadata', Customer.getProxy().getReader().metaData);
               }
            }
         });
      }
   },
   onSignIn : function(username, password)
   {
      //Cleanup any outstanding registrations
      Genesis.fb.facebook_onLogout(null, Genesis.db.getLocalDB()['currFbId'] > 0);

      var me = this;
      var params =
      {
         device_pixel_ratio : window.devicePixelRatio,
         device : Ext.encode(Genesis.constants.device)
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
      console.log("setLoginUrl - Logging in ...");
      Ext.StoreMgr.get('CustomerStore').load(
      {
         params : params,
         jsonData :
         {
         },
         callback : function(records, operation)
         {
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
               me.fireEvent('updatemetadata', Customer.getProxy().getReader().metaData);
            }
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
            title : 'Oops',
            message : this.signInFailMsg(label + ' ' + field.getMessage())
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
         device : Ext.encode(Genesis.constants.device)
      };

      if (username)
      {
         params = Ext.apply(params,
         {
            email : username
         });
      }
      Account['setPasswdResetUrl']();
      console.log("setPasswdResetUrl - Resetting Password ...");
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
                  message : me.passwdResetSuccessMsg()
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
                     title : 'Oops',
                     message : me.passwdResetFailMsg(label + ' ' + field.getMessage())
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
         device : Ext.encode(Genesis.constants.device)
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
      console.log("setPasswdChangeUrl - Changing Password ...");
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
                  message : me.passwdChangeSuccessMsg
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
         console.log(message);
         Ext.device.Notification.show(
         {
            title : 'Oops',
            message : message
         });
      }
      else
      {
         this.onPasswdChange(values['oldpassword'], values['newpassword']);
      }
   },
   onCreateActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var response = Genesis.db.getLocalDB()['fbResponse'] || null;
      if (response)
      {
         var form = this.getCreateAccount();
         form.setValues(
         {
            name : response.name,
            username : response.email
         });
      }
      //activeItem.createView();
   },
   onCreateDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //oldActiveItem.removeAll(true);
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   loginPage : function()
   {
      this.openPage('login');
   },
   merchantPage : function()
   {
      this.openPage('merchant');
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
});
