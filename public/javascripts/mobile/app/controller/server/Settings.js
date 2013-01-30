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
   writeTagEnabled : true,
   proceedToUpdateLicenseMsg : 'Please confirm to proceed with License Update',
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
            message : me.licenseKeySuccessMsg(),
            buttons : ['Exit App'],
            callback : function()
            {
               //
               // Exit App, because we can't continue without Console Setup data
               //
               navigator.app.exitApp();
            }
         });
      }, true);
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onRefreshLicenseTap : function(b, e, eOpts)
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Licence Key Refresh',
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
             console.log("Listening for NDEF tags");
             }, function()
             {
             console.log("Failed to Listen for NDEF tags");
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
          console.log("Stopped Listening for NDEF tags");
          }, function()
          {
          console.log("Failed to stop Listen for NDEF tags");
          });
          */
      };

      var payload = Ext.encode(
      {
         'tagID' : tagId
      }), //record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));
      record = ndef.textRecord(payload);

      console.log("Writing [" + payload + "] to TAG ...");
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
      var me = this;
      me.getMerchantDevice().setLabel(Genesis.fn.getPrivKey('venue'));
      me.getUtilitiesContainer()[me.writeTagEnabled ? 'show' : 'hide']();
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
