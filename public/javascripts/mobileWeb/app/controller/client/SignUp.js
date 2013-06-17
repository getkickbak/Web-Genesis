Ext.define('KickBak.controller.client.SignUp',
{
   extend : 'KickBak.controller.SignUpBase',
   signupTitle : 'Account SignUp',
   creatingAccountMsg : 'Creating Your Account ...',
   enableFBMsg : 'By connecting to Facebook, you will receive additional Reward Pts everytime we update your KICKBAK activity to your Facebook account!',
   disableFBMsg : '',
   enableTwitterMsg : 'By enabling Twitter connectivity, you will receive additional reward points everytime we update your KICKBAK activity to their site!',
   disableTwitterMsg : '',
   twitterUnconfiguredMsg : 'Please configure your Twitter App',
   inheritableStatics :
   {
      accountValidateFailedMsg : function(msg)
      {
         return msg + KickBak.constants.addCRLF() + 'Please with correct syntax.';
      },
      accountValidate : function(page, values)
      {
         var me = this, account = Ext.create('KickBak.model.frontend.Account', values), validateErrors = account.validate(), field, fieldCmp, valid, label, message;

         if (!validateErrors.isValid())
         {
            do
            {
               valid = false;
               field = validateErrors.first();
               if (field)
               {
                  fieldCmp = page.query('field[name='+field.getField()+']')[0];
                  if (!fieldCmp || !fieldCmp.getRequired() || (field.getField() == 'password'))
                  {
                     if (!fieldCmp || !fieldCmp.getValue() || (fieldCmp.getValue() == '') || (fieldCmp.getValue() == ' '))
                     {
                        validateErrors.remove(field);
                        valid = true;
                     }
                  }
               }
               else
               {
                  fieldCmp = null;
               }
            } while(valid);

            if (fieldCmp)
            {
               label = fieldCmp.getLabel();
               message = me.accountValidateFailedMsg(label + ' ' + field.getMessage());
               console.log(message);
               Ext.device.Notification.show(
               {
                  title : me.signupTitle,
                  message : message,
                  buttons : ['Dismiss']
               });
               return null;
            }
         }
         return account;
      }
   },
   xtype : 'clientSignUpCntlr',
   config :
   {
      refs :
      {
         SignUpPage :
         {
            selector : 'clientsignuppageview',
            autoCreate : true,
            xtype : 'clientsignuppageview'
         }
      },
      control :
      {
         'clientsignuppageview togglefield[name=facebook]' :
         {
            change : 'onFacebookChange'
         },
         'clientsignuppageview togglefield[name=twitter]' :
         {
            change : 'onTwitterChange'
         },
         'clientsignuppageview button[tag=signUp]' :
         {
            tap : 'onSignUpTap'
         },
         //
         // Terms & Conditions
         //
         'clientsignuppageview listfield[name=terms]' :
         {
            clearicontap : 'onTermsTap'
         },
         'clientsignuppageview listfield[name=privacy]' :
         {
            clearicontap : 'onPrivacyTap'
         },
         'clientsignuppageview listfield[name=aboutus]' :
         {
            clearicontap : 'onAboutUsTap'
         }
      },
      listeners :
      {
         'toggleFB' :
         {
            fn : 'onToggleFB',
            buffer : 2 * 1000
         },
         'toggleTwitter' :
         {
            fn : 'onToggleTwitter',
            buffer : 0.3 * 1000
         }
      }
   },
   initializing : true,
   fbLoggedInIdentityMsg : function(email)
   {
      return 'You\'re logged into Facebook as ' + KickBak.constants.addCRLF() + email;
   },
   updatingFbLoginMsg : 'Updating Facebok Login Credentials',
   // --------------------------------------------------------------------------
   // Misc Utilities
   // --------------------------------------------------------------------------
   getAccountFields : function()
   {
      var me = this, form = me.getSignUpPage();
      return (
         {
            'name' :
            {
               preLoadFn : function(field, response)
               {
                  field.setReadOnly(false);
               },
               field : form.query('textfield[name=name]')[0],
               fbFn : function(field, response)
               {
                  field.setReadOnly(true);
                  return response['name'];
               }
            },
            'email' :
            {
               preLoadFn : function(field, response)
               {
                  field.setReadOnly(false);
               },
               field : form.query('textfield[name=username]')[0],
               fbFn : function(field, response)
               {
                  field.setReadOnly(true);
                  return response['email'];
               }
            },
            'password' :
            {
               preLoadFn : function(field, response)
               {
                  field.setReadOnly(false);
               },
               field : form.query('textfield[name=password]')[0],
               fbFn : function(field, response)
               {
                  return response['password'];
               }
            },
            'birthday' :
            {
               preLoadFn : function(field, response)
               {
                  field.setReadOnly(false);
               },
               field : form.query('datepickerfield[name=birthday]')[0],
               fbFn : function(field, response)
               {
                  var birthday = new Date.parse(response['birthday']);
                  if (!birthday || !( birthday instanceof Date))
                  {
                     birthday = ' ';
                  }
                  if ( birthday instanceof Date)
                  {
                     field.setReadOnly(true);
                  }
                  return birthday;
               }
            },
            'phone' :
            {
               preLoadFn : Ext.emptyFn,
               field : form.query('textfield[name=phone]')[0],
               fbFn : Ext.emptyFn
            }
         });
   },
   updateFBSignUp : function(params)
   {
      var me = this;

      Ext.defer(function()
      {
         Ext.device.Notification.show(
         {
            title : 'Facebook Connect',
            message : me.fbLoggedInIdentityMsg(params['email']),
            buttons : ['OK']
         });
      }, 1, me);

      me.response = params;
   },
   updateFBSignUpPopupCallback : function(params, operation)
   {
      var me = this, page = me.getSignUpPage();
      var toggle = page.query('togglefield[name=facebook]')[0];

      Ext.Viewport.setMasked(null);
      if (!params || ((operation && !operation.wasSuccessful())) || (params['type'] == 'timeout'))
      {
         if (!page.isHidden() && toggle)
         {
            Ext.device.Notification.show(
            {
               title : 'Facebook Connect',
               message : KickBak.fb.fbConnectFailMsg,
               buttons : ['Dismiss']
            });
            toggle.toggle();
         }
      }
      else
      {
         me.updateFBSignUp(params);
         if (toggle)
         {
            toggle.setValue(1);
            toggle.originalValue = 1;
            me.updateAccountInfo(params);
            var profile = page.query('fieldset[tag=profile]')[0];
            page.getScrollable().getScroller().scrollTo(0, profile._title.element.getY() - 66, true);
         }
      }
   },
   updateFBSignUpPopup : function(title, toggle)
   {
      var me = this, page = me.getSignUpPage();

      KickBak.fb.facebook_onLogin(false);
   },
   updateAccountInfo : function(response)
   {
      var i, f, me = this, form = me.getSignUpPage(), fields = me.getAccountFields();

      for (i in fields)
      {
         f = fields[i];
         f.preLoadFn(f.field);
         if (response)
         {
            f[i] = f.fbFn(f.field, response);
         }
         //
         // Default Value
         //
         else
         {
            f[i] = null;
         }
      }

      console.log("enableFB - " + ((response) ? 1 : 0));
      // + ", enableTwitter - " + db['enableTwitter']);
      me.initializing = true;
      if (response)
      {
         form.setValues(
         {
            name : fields['name'].name,
            username : fields['email'].email,
            password : fields['password'].password,
            birthday : fields['birthday'].birthday,
            phone : fields['phone'].phone,
            //tagid : db['account'].virtual_tag_id || 'None',
            facebook : 1
            //twitter : (db['enableTwitter']) ? 1 : 0
         });
      }

      me.initializing = false;
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onFacebookChange : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      if (me.initializing)
      {
         return;
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      me.fireEvent('toggleFB', toggle, slider, thumb, newValue, oldValue, eOpts);
   },
   onTwitterChange : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      if (me.initializing)
      {
         return;
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      me.fireEvent('toggleTwitter', toggle, slider, thumb, newValue, oldValue, eOpts);
   },
   onSignUpTap : function(b, e, eOpts)
   {
      var me = this, form = me.getSignUpPage(), values = form.getValues(true), proxy = Account.getProxy();
      var account = me.self.accountValidate(form, values);
      var response = me.response;

      if (account)
      {
         //
         // Create Account
         //
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         console.debug("Creating Account ...");
         var params =
         {
            version : KickBak.constants.clientVersion,
            name : values.name,
            email : values.username,
            password : values.password,
            phone : values.phone.replace(/-/g, ''),
            birthday : values.birthday
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

         Account['setCreateAccountUrl']();
         Account.load(0,
         {
            jsonData :
            {
            },
            params :
            {
               version : KickBak.constants.clientVersion,
               device_pixel_ratio : window.devicePixelRatio,
               user : Ext.encode(params),
               device : Ext.encode(null),
               web_signup : true
            },
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               //
               // Login Error, redo login
               //
               if (!operation.wasSuccessful())
               {
               }
               else
               {
                  form.signUpSuccessPopup();
               }
            }
         });
      }
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onToggleFB : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this;

      if (newValue == 1)
      {
         KickBak.fb.on('connected', me.updateFBSignUpPopupCallback, me);
         KickBak.fb.on('unauthorized', me.updateFBSignUpPopupCallback, me);
         KickBak.fb.on('exception', me.updateFBSignUpPopupCallback, me);

         me.updateFBSignUpPopup(me.signupTitle, toggle);
      }
      else
      {
         KickBak.fb.un('connected', me.updateFBSignUpPopupCallback);
         KickBak.fb.un('unauthorized', me.updateFBSignUpPopupCallback);
         KickBak.fb.un('exception', me.updateFBSignUpPopupCallback);         
      }
   },
   onToggleTwitter : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, db = KickBak.db.getLocalDB();
      var updateTwitterSignUp = function()
      {
         Ext.device.Notification.show(
         {
            title : me.signupTitle,
            message : me.enableTwitterMsg,
            buttons : ['Dismiss']
         });
         db['enableTwitter'] = true;
         KickBak.db.setLocalDB(db);
      };

      if (newValue == 1)
      {
         console.debug("Enabling Twitter Login ...");
         if (KickBak.fn.isNative())
         {
            window.plugins.twitter.isTwitterSetup(function(r)
            {
               if (r == 1)
               {
                  if (!db['enableFB'])
                  {
                     //
                     // Update Server to enable Twitter updates
                     //
                     updateTwitterSignUp();
                  }
               }
               else
               {
                  Ext.device.Notification.show(
                  {
                     title : me.signupTitle,
                     message : me.twitterUnconfiguredMsg,
                     buttons : ['Dismiss']
                  });
                  if (!me.getSignUpPage().isHidden())
                  {
                     toggle.toggle();
                  }
               }
            });
         }
         else
         {
            updateTwitterSignUp();
         }
      }
      else if (db['enableTwitter'])
      {
         console.debug("Cancelling Twitter Login ...");
         //
         // Update Server to disable Twitter updates
         //
         db['enableTwitter'] = false;
         KickBak.db.setLocalDB(db);
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSignUpPage : function()
   {
      var me = this, db = KickBak.db.getLocalDB();
      me.updateAccountInfo();
      me.getSignUpPage().query('togglefield[name=facebook]')[0].label.setStyle(
      {
         'line-height' : '2.2em'
      });
      me.openPage('signup');

      if (db['fbLoginInProgress'])
      {
         KickBak.fb.on('connected', me.updateFBSignUpPopupCallback, me);
         KickBak.fb.on('unauthorized', me.updateFBSignUpPopupCallback, me);
         KickBak.fb.on('exception', me.updateFBSignUpPopupCallback, me);
      }

   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
