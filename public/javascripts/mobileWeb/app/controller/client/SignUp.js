Ext.define('KickBak.controller.client.SignUp',
{
   extend : 'KickBak.controller.SignUpBase',
   signupTitle : 'Account SignUp',
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
         'clientsignuppageview listfield[name=changepassword]' :
         {
            clearicontap : 'onPasswordChangeTap'
         },
         'clientsignuppageview button[tag=accountUpdate]' :
         {
            tap : 'onAccountUpdateTap'
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
            buffer : 3 * 1000
         },
         'toggleTwitter' :
         {
            fn : 'onToggleTwitter',
            buffer : 0.3 * 1000
         }
      }
   },
   initializing : true,
   accountUpdateSuccessMsg : 'Update Successful',
   accountUpdateFailedMsg : 'Update Failed',
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
            'user' :
            {
               preLoadFn : function(field, response)
               {
                  field.setReadOnly(false);
               },
               field : form.query('textfield[name=user]')[0],
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
               field : form.query('textfield[name=email]')[0],
               fbFn : function(field, response)
               {
                  field.setReadOnly(true);
                  return response['email'];
               }
            },
            'birthday' :
            {
               preLoadFn : function(field, response)
               {
                  field.setReadOnly(false);
               },
               field : form.query('datepickerfield[name=birthday]')[0],
               fn : function(field, response)
               {
                  var birthday = new Date.parse(db['account']['birthday']);
                  return (!birthday || !( birthday instanceof Date)) ? ' ' : birthday;
               },
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
               fn : function(field, response)
               {
                  var phone = db['account']['phone'].match(Account.phoneRegex);
                  return (phone[1] + '-' + phone[2] + '-' + phone[3]);
               },
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
   },
   updateFBSignUpPopup : function(title, toggle)
   {
      var me = this, page = me.getSignUpPage();

      var _fbLogin = function()
      {
         KickBak.fb.facebook_onLogin(function(params, operation)
         {
            Ext.Viewport.setMasked(null);
            if (!params || ((operation && !operation.wasSuccessful())))
            {
               if (!page.isHidden() && toggle)
               {
                  toggle.toggle();
               }
            }
            else
            {
               me.updateFBSignUp(params);
               if (toggle)
               {
                  toggle.originalValue = 1;
                  me.updateAccountInfo(params);
                  var profile = page.query('fieldset[tag=profile]')[0];
                  page.getScrollable().getScroller().scrollTo(0, profile._title.element.getY() - 46, true);
               }
            }
         }, false);
      };

      _fbLogin();
      /*
       Ext.device.Notification.show(
       {
       title : title,
       message : me.enableFBMsg,
       buttons : ['Proceed', 'Cancel'],
       callback : function(btn)
       {
       if (btn.toLowerCase() == 'proceed')
       {
       _fbLogin();
       }
       else if (toggle)
       {
       toggle.toggle();
       }
       }
       });
       */
   },
   updateAccountInfo : function(response)
   {
      var i, f, me = this, form = me.getSignUpPage(), fields = me.getAccountFields();

      for (i in fields)
      {
         f = fields[i];
         f.preLoadFn(f.field);
         /*
         if (db['account'] && db['account'][i])
         {
         f[i] = f.fn(f.field);
         }
         */
         //else if (db['fbResponse'])
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
            user : fields['user'].user,
            email : fields['email'].email,
            birthday : fields['birthday'].birthday,
            phone : fields['phone'].phone,
            //tagid : db['account'].virtual_tag_id || 'None',
            facebook : 1
            //twitter : (db['enableTwitter']) ? 1 : 0
         });
      }
      else
      {
         form.setValues(
         {
            birthday : fields['birthday'].birthday,
            phone : fields['phone'].phone,
            //tagid : db['account'].virtual_tag_id || 'None',
            facebook : (response) ? 1 : 0
            //twitter : (db['enableTwitter']) ? 1 : 0
         });
      }
      //form.query('textfield[name=user]')[0].setLabel(db['account'].name + '<br/>' + '<label>' + db['account'].email + "</label>");
      me.initializing = false;
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onPasswordChangeTap : function(b, e)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);
      me.redirectTo('password_change');
   },
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
   onAccountUpdateTap : function(b, e, eOpts)
   {
      var me = this, form = me.getSignUpPage(), values = form.getValues(true), proxy = Account.getProxy();
      var account = me.self.accountValidate(form, values);

      if (account)
      {
         //
         // Upate Account
         //
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         Account['setUpdateAccountUrl']();
         account.save(
         {
            action : 'read',
            jsonData :
            {
            },
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : me.signupTitle,
                     message : me.accountUpdateSuccessMsg,
                     buttons : ['OK']
                  });
               }
               else
               {
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : me.signupTitle,
                     message : me.accountUpdateFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsCallbackFn();
                     }
                  });
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
      var me = this, db = KickBak.db.getLocalDB();

      if (newValue == 1)
      {
         me.updateFBSignUpPopup(me.signupTitle, toggle);
      }
      else if (db['enableFB'])
      {
         console.debug("Cancelling Facebook Login ...");
         var params =
         {
            facebook_id : 0
         };

         Account['setUpdateFbLoginUrl']();
         Account.load(0,
         {
            jsonData :
            {
            },
            params :
            {
               user : Ext.encode(params)
            },
            callback : function(record, operation)
            {
               if (operation.wasSuccessful())
               {
                  db = KickBak.db.getLocalDB();
                  db['enableFB'] = false;
                  db['currFbId'] = 0;
                  delete db['fbAccountId'];
                  delete db['fbResponse'];
                  KickBak.db.setLocalDB(db);

                  if (KickBak.fn.isNative())
                  {
                     KickBak.fb.facebook_onLogout(null, true);
                  }
               }
               else if (!me.getSignUpPage().isHidden())
               {
                  toggle.toggle();
               }
            }
         });
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
      var me = this;
      me.updateAccountInfo();
      me.getSignUpPage().query('togglefield[name=facebook]')[0].label.setStyle(
      {
         'line-height' : '2.2em'
      });
      me.openPage('signup');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
