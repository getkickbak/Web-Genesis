Ext.define('Genesis.controller.Settings',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
      settings_path : '/settings',
   },
   xtype : 'settingsCntlr',
   config :
   {
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
         }
      },
      control :
      {
      }
   },
   init : function()
   {
      this.callParent(arguments);
      this.initClientControl();
      this.initServerControl();
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
         'clientsettingspageview listfield[name=facebook]' :
         {
            clearicontap : 'onFacebookTap'
         }
      });
   },
   initServerControl : function()
   {
      this.control(
      {
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
         }
      });
   },
   getMainPage : function()
   {
      return this.getSettingsPage();
   },
   openMainPage : function()
   {
      var page = this.getMainPage();
      this.pushView(page);
      console.log("SettingsPage Opened");
   },
   onTermsTap : function(b, e)
   {
      Ext.device.Notification.show(
      {
         title : 'Button Tapped',
         message : 'Disclose List Item'
      });
   },
   onFacebookTap : function(b, e)
   {
      Genesis.constants.facebook_onLogin(function(params)
      {
         Customer['setUpdateFbLoginUrl']();
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            params :
            {
               user : Ext.encode(params)
            }
         });
      }, false);
   },
   onTermsTap : function(b, e)
   {
      Ext.device.Notification.show(
      {
         title : 'Terms Tapped',
         message : 'Disclose List Item'
      });
   },
   onPrivacyTap : function(b, e)
   {
      Ext.device.Notification.show(
      {
         title : 'Privacy Tapped',
         message : 'Disclose List Item'
      });
   },
   onAboutUsTap : function(b, e)
   {
      Ext.device.Notification.show(
      {
         title : 'About Us Tapped',
         message : 'Disclose List Item'
      });
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var page;
      switch(subFeature)
      {
         case 'client' :
         {
            page = this.getClientSettingsPage();
            break;
         }
         case 'server' :
         {
            page = this.getServerSettingsPage();
            break;
         }
      }
      this.pushView(page);
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
