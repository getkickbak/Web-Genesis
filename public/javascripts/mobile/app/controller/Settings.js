Ext.define('Genesis.controller.Settings',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
   },
   xtype : 'settingsCntlr',
   config :
   {
      routes :
      {
         'clientSettings' : 'clientSettingsPage',
         'serverSettings' : 'serverSettingsPage'
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
         }
      },
      control :
      {
      }
   },
   fbLoggedInIdentityMsg : function(email)
   {
      return 'You\'re logged into Facebook as ' + Genesis.constants.addCRLF() + email;
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
   /*
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
    */
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
      var me = this;
      Genesis.fb.facebook_onLogin(function(params)
      {
         Ext.Viewport.setMasked(false);
         Customer['setUpdateFbLoginUrl']();
         Customer.load(1,
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
                  Ext.device.Notification.show(
                  {
                     title : 'Facebook Connect',
                     message : me.fbLoggedInIdentityMsg(params['email'])
                  });
               }
            }
         });
      }, true);
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
   // Page Navigation
   // --------------------------------------------------------------------------
   clientSettingsPage : function()
   {
      this.openPage('client');
   },
   serverSettingsPage : function()
   {
      this.openPage('server');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;
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
      me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
      me.pushView(page);
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
