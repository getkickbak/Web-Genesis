Ext.define('Genesis.controller.client.Settings',
{
   extend : 'Genesis.controller.SettingsBase',
   settingsTitle : 'Account Settings',
   enableFBMsg : 'By connecting to Facebook, you will be received additional Reward Pts everytime we update your KICKBAK activity to your Facebook account!',
   disableFBMsg : '',
   enableTwitterMsg : 'By enabling Twitter connectivity, you will be received additional reward points everytime we update your KICKBAK activity to their site!',
   disableTwitterMsg : '',
   twitterUnconfiguredMsg : 'Please configure your Twitter App',
   inheritableStatics :
   {
      accountValidateFailedMsg : function(msg)
      {
         return msg + Genesis.constants.addCRLF() + 'Please with correct syntax.';
      },
      accountValidate : function(page, values)
      {
         var me = this, account = Ext.create('Genesis.model.frontend.Account', values), validateErrors = account.validate(), field, fieldCmp, valid, label, message;

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
                  title : me.settingsTitle,
                  message : message,
                  buttons : ['Dismiss']
               });
               return null;
            }
         }
         return account;
      }
   },
   xtype : 'clientSettingsCntlr',
   config :
   {
      refs :
      {
         settingsPage :
         {
            selector : 'clientsettingspageview',
            autoCreate : true,
            xtype : 'clientsettingspageview'
         }
      },
      control :
      {
         'clientsettingspageview togglefield[name=facebook]' :
         {
            change : 'onFacebookChange'
         },
         'clientsettingspageview togglefield[name=twitter]' :
         {
            change : 'onTwitterChange'
         },
         'clientsettingspageview listfield[name=changepassword]' :
         {
            clearicontap : 'onPasswordChangeTap'
         },
         'clientsettingspageview button[tag=accountUpdate]' :
         {
            tap : 'onAccountUpdateTap'
         },
         //
         // Terms & Conditions
         //
         'clientsettingspageview listfield[name=terms]' :
         {
            clearicontap : 'onTermsTap'
         },
         'clientsettingspageview listfield[name=privacy]' :
         {
            clearicontap : 'onPrivacyTap'
         },
         'clientsettingspageview listfield[name=aboutus]' :
         {
            clearicontap : 'onAboutUsTap'
         }
      },
      listeners :
      {
         'toggleFB' :
         {
            fn : 'onToggleFB',
            buffer : 5000
         },
         'toggleTwitter' :
         {
            fn : 'onToggleTwitter',
            buffer : 300
         }
      }
   },
   initializing : true,
   accountUpdateSuccessMsg : 'Update Successful',
   accountUpdateFailedMsg : 'Update Failed',
   fbLoggedInIdentityMsg : function(email)
   {
      return 'You\'re logged into Facebook as ' + Genesis.constants.addCRLF() + email;
   },
   updatingFbLoginMsg : 'Updating Facebok Login Credentials',
   // --------------------------------------------------------------------------
   // Misc Utilities
   // --------------------------------------------------------------------------
   getAccountFields : function()
   {
      var me = this, db = Genesis.db.getLocalDB(), form = me.getSettingsPage();
      return (
         {
            'birthday' :
            {
               preLoadFn : function(field)
               {
                  field.setReadOnly(false);
               },
               field : form.query('datepickerfield[name=birthday]')[0],
               fn : function(field)
               {
                  var birthday = new Date.parse(db['account']['birthday']);
                  return (!birthday || !( birthday instanceof Date)) ? ' ' : birthday;
               },
               fbFn : function(field)
               {
                  var birthday = new Date.parse(db['fbResponse']['birthday']);
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
               fn : function(field)
               {
                  var phone = db['account']['phone'].match(Account.phoneRegex);
                  return (phone[1] + '-' + phone[2] + '-' + phone[3]);
               },
               fbFn : Ext.emptyFn
            }
         });
   },
   updateAccountInfo : function()
   {
      var i, f, me = this, db = Genesis.db.getLocalDB(), fields = me.getAccountFields(), form = me.getSettingsPage();

      for (i in fields)
      {
         f = fields[i];
         f.preLoadFn(f.field);
         if (db['account'][i])
         {
            f[i] = f.fn(f.field);
         }
         else if (db['fbResponse'])
         {
            f[i] = f.fbFn(f.field);
         }
         //
         // Default Value
         //
         else
         {
            f[i] = null;
         }
      }

      console.log("enableFB - " + db['enableFB'] + ", enableTwitter - " + db['enableTwitter']);
      me.initializing = true;
      form.setValues(
      {
         birthday : fields['birthday'].birthday,
         phone : fields['phone'].phone,
         //tagid : db['account'].virtual_tag_id || 'None',
         facebook : (db['enableFB']) ? 1 : 0,
         twitter : (db['enableTwitter']) ? 1 : 0
      });
      form.query('textfield[name=user]')[0].setLabel(db['account'].name + '<br/>' + '<label>' + db['account'].email + "</label>");
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
      var me = this, form = me.getSettingsPage(), values = form.getValues(true), proxy = Account.getProxy();
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
                     title : me.settingsTitle,
                     message : me.accountUpdateSuccessMsg,
                     buttons : ['OK']
                  });
               }
               else
               {
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : me.settingsTitle,
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
      var me = this, db = Genesis.db.getLocalDB();
      var updateFBSettings = function(params)
      {
         Ext.defer(function()
         {
            Ext.device.Notification.show(
            {
               title : 'Facebook Connect',
               message : me.fbLoggedInIdentityMsg(params['email']),
               buttons : ['OK']
            });
         }, 1, me);
      }
      if (newValue == 1)
      {
         Genesis.fb.facebook_onLogin(function(params, operation)
         {
            Ext.Viewport.setMasked(null);
            if (!params || ((operation && !operation.wasSuccessful())))
            {
               if (!me.getSettingsPage().isHidden())
               {
                  toggle.toggle();
               }
            }
            else
            {
               toggle.originalValue = newValue;
               /*
                if (!db['enableTwitter'])
                {
                Ext.device.Notification.show(
                {
                title : me.settingsTitle,
                message : me.enableFBMsg,
                buttons : ['Dismiss'],
                callback : function()
                {
                updateFBSettings(params);
                }
                });
                }
                else
                */
               {
                  updateFBSettings(params);
               }
               me.updateAccountInfo();
            }
         }, db['enableTwitter']);
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
                  db = Genesis.db.getLocalDB();
                  db['enableFB'] = false;
                  db['currFbId'] = 0;
                  delete db['fbAccountId'];
                  delete db['fbResponse'];
                  Genesis.db.setLocalDB(db);

                  if (Genesis.fn.isNative())
                  {
                     Genesis.fb.facebook_onLogout(null, true);
                  }
               }
               else if (!me.getSettingsPage().isHidden())
               {
                  toggle.toggle();
               }
            }
         });
      }
   },
   onToggleTwitter : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this, db = Genesis.db.getLocalDB();
      var updateTwitterSettings = function()
      {
         Ext.device.Notification.show(
         {
            title : me.settingsTitle,
            message : me.enableTwitterMsg,
            buttons : ['Dismiss']
         });
         db['enableTwitter'] = true;
         Genesis.db.setLocalDB(db);
      };

      if (newValue == 1)
      {
         console.debug("Enabling Twitter Login ...");
         if (Genesis.fn.isNative())
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
                     updateTwitterSettings();
                  }
               }
               else
               {
                  Ext.device.Notification.show(
                  {
                     title : me.settingsTitle,
                     message : me.twitterUnconfiguredMsg,
                     buttons : ['Dismiss']
                  });
                  if (!me.getSettingsPage().isHidden())
                  {
                     toggle.toggle();
                  }
               }
            });
         }
         else
         {
            updateTwitterSettings();
         }
      }
      else if (db['enableTwitter'])
      {
         console.debug("Cancelling Twitter Login ...");
         //
         // Update Server to disable Twitter updates
         //
         db['enableTwitter'] = false;
         Genesis.db.setLocalDB(db);
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : function()
   {
      var me = this;
      me.updateAccountInfo();
      me.openPage('settings');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
