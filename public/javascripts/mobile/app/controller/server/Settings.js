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
         settingsPage :
         {
            selector : 'serversettingspageview',
            autoCreate : true,
            xtype : 'serversettingspageview'
         },
         merchantDevice : 'serversettingspageview fieldset textfield[tag=merchantDevice]'
      },
      control :
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
         settingsPage :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      },
      listeners :
      {
      }
   },
   writeTagEnabled : true,
   proceedToUpdateLicenseMsg : 'Please confirm to proceed with License Update',
   noLicenseKeyScannedMsg : 'No License Key was found!',
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
            buttons : ['OK']
         });
      }, true);
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
            message : "Wrote data to TAG.",
            buttons : ['OK']
         });
      }, function(reason)
      {
         Ext.device.Notification.show(
         {
            title : "NFC Tag",
            message : "Error Writing data to TAG[" + reason + "]",
            buttons : ['Dismiss']
         });
      });
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.getMerchantDevice().setLabel(Genesis.fn.getPrivKey('venue'));
      if (Genesis.fn.isNative() && me.writeTagEnabled)
      {
         nfc.addTagDiscoveredListener(me.writeTag, function()
         {
            console.log("Listening for NDEF tags");
         }, function()
         {
            console.log("Failed to Listen for NDEF tags");
         });
      }
   },
   onDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      if (Genesis.fn.isNative() && me.writeTagEnabled)
      {
         nfc.removeTagDiscoveredListener(me.writeTag, function()
         {
            console.log("Stopped Listening for NDEF tags");
         }, function()
         {
            console.log("Failed to stop Listen for NDEF tags");
         });
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : function()
   {
      this.openPage('settings');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
