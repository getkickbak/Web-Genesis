Ext.define('Genesis.controller.client.Settings',
{
   extend : 'Genesis.controller.SettingsBase',
   inheritableStatics :
   {
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
         },
         'clientsettingspageview togglefield[name=facebook]' :
         {
            change : 'onFacebookChange'
         },
         'clientsettingspageview listfield[name=changepassword]' :
         {
            clearicontap : 'onPasswordChangeTap'
         },
         'clientsettingspageview button[tag=accountUpdate]' :
         {
            tap : 'onAccountUpdateTap'
         }
      },
      listeners :
      {
         'toggleFB' :
         {
            fn : 'onToggleFB',
            buffer : 5000
         }
      }
   },
   _initializing : true,
   accountUpdateSuccessMsg : 'Update Successful',
   accountUpdateFailedMsg : 'Update Failed',
   accountValidateFailedMsg : function(msg)
   {
      return msg + Genesis.constants.addCRLF() + 'Please with correct syntax.';
   },
   fbLoggedInIdentityMsg : function(email)
   {
      return 'You\'re logged into Facebook as ' + Genesis.constants.addCRLF() + email;
   },
   updatingFbLoginMsg : 'Updating Facebok Login Credentials',
   onToggleFB : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this;
      var db = Genesis.db.getLocalDB();
      //var enableFB = (db['enableFB']) ? 1 : 0;

      if (newValue == 1)
      {
         /*
          Ext.Viewport.setMasked(
          {
          xtype : 'loadmask',
          message : Genesis.fb.connectingToFBMsg
          });
          */
         Genesis.fb.facebook_onLogin(function(params, operation)
         {
            if (!params || ((operation && !operation.wasSuccessful())))
            {
               if (me.getSettingsPage().isVisible())
               {
                  toggle.toggle();
               }
            }
            //Ext.Viewport.setMasked(null);
            else
            {
               toggle.originalValue = newValue;
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : me.fbLoggedInIdentityMsg(params['email']),
                  buttons : ['OK']
               });
            }
         }, true);
      }
      else
      if (db['enableFB'])
      {
         console.debug("Cancelling Facebook Login ...");
         /*
          Ext.Viewport.setMasked(
          {
          xtype : 'loadmask',
          message : Genesis.fb.connectingToFBMsg
          });
          */
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
               else
               if (me.getSettingsPage().isVisible())
               {
                  toggle.toggle();
               }
            }
         });
      }

   },
   onFacebookChange : function(toggle, slider, thumb, newValue, oldValue, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      if (me._initializing)
      {
         return;
      }

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      me.fireEvent('toggleFB', toggle, slider, thumb, newValue, oldValue, eOpts);
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
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : function()
   {
      var me = this, db = Genesis.db.getLocalDB(), form = me.getSettingsPage(), toggle = form.query('togglefield[name=facebook]')[0];

      console.log("enableFB - " + db['enableFB']);
      me._initializing = true;

      var birthday = ' ', name;
      var fields = [
      {
         field : form.query('datepickerfield[name=birthday]')[0],
         attr : 'birthday',
         fn : function(field)
         {
            birthday = new Date.parse(db['account'][field.attr]);
         },
         fbFn : function(field)
         {
            birthday = new Date.parse(db['fbResponse'][field.attr]);
         }
      },
      {
         field : form.query('textfield[name=name]')[0],
         attr : 'name',
         fn : function(field)
         {
            name = db['account'][field.attr];
         },
         fbFn : function(field)
         {
            name = db['fbResponse'][field.attr];
         }
      }];

      for (var i = 0; i < fields.length; i++)
      {
         var f = fields[i];
         f.field.setReadOnly(false);
         if (db['account'][f.attr])
         {
            f.fn(f);
         }
         else
         if (db['fbResponse'])
         {
            f.fbFn(f);
            f.field.setReadOnly(true);
         }
      }

      form.setValues(
      {
         name : name,
         birthday : (!birthday || !( birthday instanceof Date)) ? ' ' : birthday,
         phone : db['account'].phone || null,
         tagid : db['vtagId'] || 'None',
         facebook : (db['enableFB']) ? 1 : 0
      });
      me._initializing = false;
      me.openPage('settings');
   },
   onAccountUpdateTap : function(b, e, eOpts)
   {
      var me = this, form = me.getSettingsPage();
      var values = form.getValues(true);
      var account = Ext.create('Genesis.model.frontend.Account', values);
      var validateErrors = account.validate();

      if (!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         var message = me.accountValidateFailedMsg(label + ' ' + field.getMessage());
         console.log(message);
         Ext.device.Notification.show(
         {
            title : 'Oops',
            message : message,
            buttons : ['Dismiss']
         });
      }
      else
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         Account['setUpdateAccountUrl']();
         account.save(
         {
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
                     title : 'Account Settings',
                     message : me.accountUpdateSuccessMsg,
                     buttons : ['Dismiss']
                  });
               }
               else
               {
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : 'Account Settings',
                     message : me.accountUpdateFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsPopup = false;
                     }
                  });
               }
            }
         });
      }
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
