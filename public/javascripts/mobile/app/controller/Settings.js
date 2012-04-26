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
         settingsPage :
         {
            selector : 'settingspageview',
            autoCreate : true,
            xtype : 'settingspageview'
         }
      },
      control :
      {
         'settingspageview listfield[name=terms]' :
         {
            clearicontap : 'onTermsTap'
         },
         'settingspageview listfield[name=privacy]' :
         {
            clearicontap : 'onPrivacyTap'
         },
         'settingspageview listfield[name=aboutus]' :
         {
            clearicontap : 'onAboutUsTap'
         },
         'settingspageview listfield[name=facebook]' :
         {
            clearicontap : 'onFacebookTap'
         }
      }
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Settings Init");
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
   isOpenAllowed : function()
   {
      return true;
   }
});
