Ext.define('Genesis.controller.Settings',
{
   extend : 'Genesis.controller.ControllerBase',
   inheritableStatics :
   {
   },
   xtype : 'settingsCntlr',
   config :
   {
      termsOfServiceTitle : 'Term of Service',
      privacyTitle : 'Privacy',
      aboutUsTitle : 'About Us',
      licenseTitle : 'Refresh License Key',
      routes :
      {
         'clientSettings' : 'clientSettingsPage',
         'serverSettings' : 'serverSettingsPage',
         'aboutus' : 'documentPage',
         'privacy' : 'documentPage',
         'termsOfUse' : 'multipartDocumentPage'
      },
      refs :
      {
         clientSettingsPage :
         {
            selector : 'clientsettingspageview',
            autoCreate : true,
            xtype : 'clientsettingspageview'
         },
         serverSettingsPage :
         {
            selector : 'serversettingspageview',
            autoCreate : true,
            xtype : 'serversettingspageview'
         },
         documentPage :
         {
            selector : 'documentview',
            autoCreate : true,
            xtype : 'documentview'
         },
         multipartDocumentPage :
         {
            selector : 'multipartdocumentview',
            autoCreate : true,
            xtype : 'multipartdocumentview'
         },
         merchantDevice : 'serversettingspageview fieldset textfield[tag=merchantDevice]'
      },
      control :
      {
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
   termsLoaded : false,
   privacyLoaded : false,
   aboutUsLoaded : false,
   fbLoggedInIdentityMsg : function(email)
   {
      return 'You\'re logged into Facebook as ' + Genesis.constants.addCRLF() + email;
   },
   proceedToUpdateLicenseMsg : 'Please confirm to proceed with License Update',
   updatingFbLoginMsg : 'Updating Facebok Login Credentials',
   noLicenseKeyScannedMsg : 'No License Key was found!',
   licenseKeySuccessMsg : function()
   {
      return 'License Key Updated for ' + Genesis.constants.addCRLF() + '[' + Genesis.fn.getPrivKey('venue') + ']';
   },
   init : function()
   {
      this.callParent(arguments);
      if (!merchantMode)
      {
         this.initClientControl();
      }
      else
      {
         this.initServerControl();
      }
      console.log("Settings Init");
   },
   initClientControl : function()
   {
      this.control(
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
         }
      });
      this.getMultipartDocumentPage();
      this.getDocumentPage();
   },
   initServerControl : function()
   {
      this.control(
      {
         'serversettingspageview listfield[name=license]' :
         {
            clearicontap : 'onRefreshLicenseTap'
         },
         'serversettingspageview listfield[name=terms]' :
         {
            clearicontap : 'onTermsTap'
         },
         'serversettingspageview listfield[name=privacy]' :
         {
            clearicontap : 'onPrivacyTap'
         },
         'serversettingspageview listfield[name=aboutus]' :
         {
            clearicontap : 'onAboutUsTap'
         },
         serverSettingsPage :
         {
            activate : 'onServerActivate',
            deactivate : 'onServerDeactivate'
         }
      });
   },
   updateLicenseKey : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.loadingMsg
      });
      viewport.refreshLicenseKey(function()
      {
         Ext.Viewport.setMasked(null);
         Ext.device.Notification.show(
         {
            title : 'License Key Updated!',
            message : me.licenseKeySuccessMsg()
         });
      }, true);
   },
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
            //Ext.Viewport.setMasked(null);
            if (!operation || operation.wasSuccessful())
            {
               toggle.originalValue = newValue;
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : me.fbLoggedInIdentityMsg(params['email'])
               });
            }
            else
            if (me.getClientSettingsPage().isVisible())
            {
               toggle.toggle();
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

                  Genesis.fb.facebook_onLogout(null, true);
               }
               else
               if (me.getClientSettingsPage().isVisible())
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
   onRefreshLicenseTap : function(b, e)
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Confirmation Required',
         message : me.proceedToUpdateLicenseMsg,
         buttons : ['Proceed', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'proceed')
            {
               me.updateLicenseKey();
            }
         }
      });
   },
   onTermsTap : function(b, e)
   {
      var me = this, flag = 0;
      var viewport = me.getViewPortCntlr();
      var responses = [];
      var page = me.getMultipartDocumentPage();

      page.query('title')[0].setTitle(me.getTermsOfServiceTitle());
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (!me.termsLoaded)
      {
         var _exit = function()
         {
            for (var i = 0; i < responses.length; i++)
            {
               page.setHtml(i, responses[i].cardConfig);
            }
            me.redirectTo('termsOfUse');
            me.termsLoaded = true;
         }

         Ext.Ajax.request(
         {
            async : true,
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'term_of_service.htm',
            callback : function(option, success, response)
            {
               if (success)
               {
                  responses[0] = response;
                  response.cardConfig =
                  {
                     title : 'Terms of Use',
                     html : response.responseText
                  }
                  if ((flag |= 0x01) == 0x11)
                  {
                     _exit();
                  }
               }
               else
               {
                  console.debug("Error Loading Term of Service Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
         Ext.Ajax.request(
         {
            async : true,
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'program_rules.htm',
            callback : function(option, success, response)
            {
               if (success)
               {
                  responses[1] = response;
                  response.cardConfig =
                  {
                     title : 'Program Rules',
                     html : response.responseText
                  }
                  if ((flag |= 0x10) == 0x11)
                  {
                     _exit();
                  }
               }
               else
               {
                  console.debug("Error Loading Program Rules Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
      }
      else
      {
         me.redirectTo('termsOfUse');
      }
   },
   onPrivacyTap : function(b, e)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var page = me.getDocumentPage();

      page.query('title')[0].setTitle(me.getPrivacyTitle());
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (!me.privacyLoaded)
      {
         Ext.Ajax.request(
         {
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'privacy.htm',
            callback : function(option, success, response)
            {
               if (success)
               {
                  page.setHtml(response.responseText);
                  me.redirectTo('privacy');
                  me.privacyLoaded = true;
               }
               else
               {
                  console.debug("Error Loading Privacy Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
      }
      else
      {
         me.redirectTo('privacy');
      }
   },
   onAboutUsTap : function(b, e)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var page = me.getDocumentPage();

      page.query('title')[0].setTitle(me.getAboutUsTitle());
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      if (me.aboutUsLoaded)
      {
         Ext.Ajax.request(
         {
            disableCaching : false,
            url : Ext.Loader.getPath("Genesis") + '/../' + 'about_us.htm',
            callback : function(option, success, response)
            {
               if (success)
               {
                  page.setHtml(response.responseText);
                  me.redirectTo('aboutUs');
                  me.aboutUsLoaded = true;
               }
               else
               {
                  console.debug("Error Loading About US Document.");
                  console.debug('Status code ' + response.status);
               }
            }
         });
      }
      else
      {
         me.redirectTo('aboutUs');
      }
   },
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
   writeTag : function(nfcEvent)
   {
      // ignore what's on the tag for now, just overwrite

      var mimeType = Genesis.constants.appMimeType;
      var payload = Ext.encode(
      {
         'tagID' : 'ABCDEDF12345'
      });
      var record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));
      console.log("Writing [" + payload + "] to TAG ...");
      nfc.write([record], function()
      {
         Ext.device.Notification.show(
         {
            title : "NFC Tag",
            message : "Wrote data to TAG."
         });
      }, function(reason)
      {
         Ext.device.Notification.show(
         {
            title : "NFC Tag",
            message : "Error Writing data to TAG[" + reason + "]"
         });
      });
   },
   onServerActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.getMerchantDevice().setValue(Genesis.fn.getPrivKey('venue'));
      /*
       if (Genesis.fn.isNative())
       {
       nfc.addTagDiscoveredListener(me.writeTag, function()
       {
       console.log("Listening for NDEF tags");
       }, function()
       {
       console.log("Failed to Listen for NDEF tags");
       });
       }
       */
   },
   onServerDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      /*
       if (Genesis.fn.isNative())
       {
       nfc.removeTagDiscoveredListener(me.writeTag, function()
       {
       console.log("Stopped Listening for NDEF tags");
       }, function()
       {
       console.log("Failed to stop Listen for NDEF tags");
       });
       }
       */
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   clientSettingsPage : function()
   {
      var me = this;
      var enableFB = Genesis.db.getLocalDB()['enableFB'];
      var form = me.getClientSettingsPage();

      console.log("enableFB - " + enableFB);

      var toggle = form.query('togglefield[name=facebook]')[0];
      me._initializing = true;
      form.setValues(
      {
         facebook : (enableFB) ? 1 : 0
      });
      me._initializing = false;
      me.openPage('client');
   },
   serverSettingsPage : function()
   {
      this.openPage('server');
   },
   multipartDocumentPage : function()
   {
      this.openPage('multipartDocument');
   },
   documentPage : function()
   {
      this.openPage('document');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;
      switch(subFeature)
      {
         case 'multipartDocument' :
         {
            page = me.getMultipartDocumentPage();
            me.setAnimationMode(me.self.animationMode['slide']);
            break;
         }
         case 'document' :
         {
            page = me.getDocumentPage();
            me.setAnimationMode(me.self.animationMode['slide']);
            break;
         }
         case 'client' :
         {
            page = me.getClientSettingsPage();
            me.setAnimationMode(me.self.animationMode['cover']);
            break;
         }
         case 'server' :
         {
            page = me.getServerSettingsPage();
            me.setAnimationMode(me.self.animationMode['cover']);
            break;
         }
      }
      me.pushView(page);
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
