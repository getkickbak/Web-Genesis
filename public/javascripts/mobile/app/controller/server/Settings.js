Ext.define('Genesis.controller.server.Settings',
{
   extend : 'Genesis.controller.SettingsBase',
   inheritableStatics :
   {
   },
   xtype : 'serverSettingsCntlr',
   config :
   {
      licenseTitle : 'Refresh License Key',
      routes :
      {
      },
      refs :
      {
         //
         // Settings Page
         //
         settingsPage :
         {
            selector : 'serversettingspageview',
            autoCreate : true,
            xtype : 'serversettingspageview'
         },
         utilitiesContainer : 'serversettingspageview fieldset[tag=utilities]',
         merchantDevice : 'serversettingspageview fieldset textfield[tag=merchantDevice]',
         deviceID : 'serversettingspageview fieldset textfield[tag=uuid]',
         //
         // Create Tag Page
         //
         createTagId : 'servertagcreatepageview calculator[tag=createTagId] textfield[name=amount]',
         createTagBtn : 'servertagcreatepageview container[tag=bottomButtons] button[tag=createTagId]',
         createTagPage :
         {
            selector : 'servertagcreatepageview',
            autoCreate : true,
            xtype : 'servertagcreatepageview'
         }
      },
      control :
      {
         //
         // Settings Page
         //
         'serversettingspageview listfield[name=resetdevice]' :
         {
            clearicontap : 'onDeviceResetTap'
         },
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
         settingsPage :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'serversettingspageview listfield[tag=createTag]' :
         {
            clearicontap : 'onCreateTagPageTap'
         },
         //
         // Create Tag Page
         //
         'servertagcreatepageview calculator[tag=createTagId] container[tag=dialpad] button' :
         {
            tap : 'onTagIdBtnTap'
         },
         createTagBtn :
         {
            tap : 'onCreateTagTap'
         },
         createTagPage :
         {
            activate : 'onCreateTagActivate',
            deactivate : 'onCreateTagDeactivate'
         }
      },
      listeners :
      {
      }
   },
   tagIdLength : 8,
   proceedToUpdateLicenseMsg : 'Please confirm to proceed with License Update',
   proceedToResetDeviceeMsg : 'Please confirm to Reset Device',
   noLicenseKeyScannedMsg : 'No License Key was found!',
   createTagMsg : function()
   {
      return 'To program the TAG ID,' + Genesis.constants.addCRLF() + 'Please swipe tag.';
   },
   invalidTagMsg : function()
   {
      var me = this;
      return "TagID must be of a valid length[" + me.tagIdLength + "]";
   },
   licenseKeySuccessMsg : function()
   {
      return 'License Key Updated for ' + Genesis.constants.addCRLF() + '[' + Genesis.fn.getPrivKey('venue') + ']';
   },
   updateLicenseKey : function()
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.refreshLicenseKey(function()
      {
         Ext.device.Notification.show(
         {
            title : 'License Key Updated!',
            message : me.licenseKeySuccessMsg(),
            buttons : ['Restart'],
            callback : function()
            {
               //
               // Restart because we can't continue without Console Setup data
               //
               if (Genesis.fn.isNative())
               {
                  navigator.app.exitApp();
               }
               else
               {
                  window.location.reload();
               }
            }
         });
      }, true);
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onDeviceResetTap : function(b, e)
   {
      var me = this, viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);
      Ext.device.Notification.show(
      {
         title : 'Device Reset Confirmation',
         message : me.proceedToResetDeviceeMsg,
         buttons : ['Confirm', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'confirm')
            {
               _application.getController('server' + '.Receipts').fireEvent('resetEarnedReceipts');
            }
         }
      });
   },
   onRefreshLicenseTap : function(b, e, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      Ext.device.Notification.show(
      {
         title : 'License Key Refresh',
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
   onCreateTagPageTap : function(b, e, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();
      me.self.playSoundFile(viewport.sound_files['clickSound']);
      me.openPage('createTag');
   },
   // --------------------------------------------------------------------------
   // TAG ID Page
   // --------------------------------------------------------------------------
   onTagIdBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, value = b.getText();
      var tagIdField = me.getCreateTagId(), tagId = tagIdField.getValue(), tagIdFieldLength = tagId.length;

      if (tagIdFieldLength < me.tagIdLength)
      {
         switch (value)
         {
            case 'AC' :
            {
               tagIdField.reset();
               break;
            }
            default :
               tagId += value;
               tagIdField.setValue(tagId);
               break;
         }
      }
   },
   onCreateTagTap : function(b, e, eOpts)
   {
      var me = this, tagId = me.getCreateTagId().getValue();
      if (Genesis.fn.isNative())
      {
         if (tagId.length != me.tagIdLength)
         {
            Ext.device.Notification.show(
            {
               title : "Create Tag",
               message : me.invalidTagMsg(),
               buttons : ['Dismiss']
            });
         }
         else
         {
            me.getViewPortCntlr().setActiveController(me);
            /*
             nfc.addTagDiscoveredListener(me.writeTag, function()
             {
             console.debug("Listening for NDEF tags");
             }, function()
             {
             console.debug("Failed to Listen for NDEF tags");
             });
             */

            Ext.device.Notification.show(
            {
               title : "Create Tag",
               message : me.createTagMsg(),
               buttons : ['Cancel'],
               callback : function()
               {
                  me.getViewPortCntlr().setActiveController(null);
               }
            });
         }
      }
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onBeforeNfc : function(nfcEvent)
   {
      this.writeTag(null);

      return null;
   },
   writeTag : function(nfcEvent)
   {
      // ignore what's on the tag for now, just overwrite

      var me = this, mimeType = Genesis.constants.appMimeType, tagId = me.getCreateTagId().getValue();

      var callback = function()
      {
         me.getViewPortCntlr().setActiveController(null);
         /*
          nfc.removeTagDiscoveredListener(me.writeTag, function()
          {
          console.debug("Stopped Listening for NDEF tags");
          }, function()
          {
          console.debug("Failed to stop Listen for NDEF tags");
          });
          */
      };

      var payload = Ext.encode(
      {
         'tagID' : tagId
      }), //record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));
      record = ndef.textRecord(payload);

      console.debug("Writing [" + payload + "] to TAG ...");
      nfc.write([record], function()
      {
         Ext.device.Notification.show(
         {
            title : "Create Tag",
            message : "Wrote data to TAG.",
            buttons : ['OK']
         });
         me.getCreateTagId().reset();
         callback();
      }, function(reason)
      {
         Ext.device.Notification.show(
         {
            title : "Create Tag",
            message : "Error Writing data to TAG[" + reason + "]",
            buttons : ['Dismiss']
         });
         callback();
      });
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, form = me.getSettingsPage(), db = Genesis.db.getLocalDB(), isNative = Genesis.fn.isNative();

      me.getMerchantDevice().setLabel(Genesis.fn.getPrivKey('venue'));
      me.getDeviceID().setLabel('DeviceID' + '<div style="font-size:0.6em;line-height:1;">' + ( isNative ? device.uuid : db['uuid']) + '</div>');
      me.getUtilitiesContainer()[debugMode ? 'show' : 'hide']();
      form.setValues(
      {
         posMode : ((db['isPosEnabled'] === undefined) || (db['isPosEnabled'])) ? 1 : 0,
         displayMode : db["displayMode"] || (!isNative ? 'Fixed' : 'Mobile'),
         sensitivity : db["sensitivity"]
      });
      var field = form.query('togglefield[tag=posMode]')[0];
      field.setReadOnly(db['enablePosIntegration'] ? false : true);
      field[(db['enablePosIntegration']) ? 'enable' : 'disable']();

      //
      // Disable DisplayMode in Non-Native mode
      //
      field = form.query('selectfield[tag=displayMode]')[0];
      field[!isNative ? 'hide' : 'show']();
      field = form.query('spinnerfield[tag=sensitivity]')[0];
      field[!isNative ? 'show' : 'hide']();
      field.setLabel('Sensitivity (' + db["sensitivity"] + ')');
      field.getComponent().element.setMinWidth(0);
      //field.setReadOnly(true);
      //field.disable();
   },
   onDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
   },
   onCreateTagActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.getCreateTagId().reset();
   },
   onCreateTagDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : function()
   {
      this.openPage('settings');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;
      switch(subFeature)
      {
         case 'createTag' :
         {
            page = me.getCreateTagPage();
            me.setAnimationMode(me.self.animationMode['cover']);
            me.pushView(page);
            return;
            break;
         }
      }

      me.callParent(arguments);
   }
});
