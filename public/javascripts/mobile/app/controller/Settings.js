Ext.define('Genesis.controller.Settings',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
   },
   xtype : 'settingsCntlr',
   config :
   {
      termsOfServiceTitle : 'Term of Service',
      privacyTitle : 'Term of Service',
      aboutUsTitle : 'About Us',
      routes :
      {
         'clientSettings' : 'clientSettingsPage',
         'serverSettings' : 'serverSettingsPage',
         'aboutus' : 'documentPage',
         'privacy' : 'documentPage',
         'termsOfService' : 'documentPage'
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
      this.getDocumentPage();
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
      var me = this;
      var page = me.getDocumentPage();
      page.query('title')[0].setTitle(me.getTermsOfServiceTitle());

      Ext.Ajax.request(
      {
         url : ((Genesis.constants.isNative()) ? '/' : '') + 'term_of_service.htm',
         success : function(response)
         {
            page.setHtml(response.responseText);
            me.redirectTo('termsOfService');
         },
         failure : function()
         {
            console.debug("Error Loading Term of Service Document.");
         }
      });
   },
   onPrivacyTap : function(b, e)
   {
      var me = this;
      var page = me.getDocumentPage();
      page.query('title')[0].setTitle(me.getPrivacyTitle());

      Ext.Ajax.request(
      {
         url : ((Genesis.constants.isNative()) ? '/' : '') + 'privacy.htm',
         success : function(response)
         {
            page.setHtml(response.responseText);
            me.redirectTo('privacy');
         },
         failure : function()
         {
            console.debug("Error Loading Privacy Document.");
         }
      });
   },
   onAboutUsTap : function(b, e)
   {
      var me = this;
      var page = me.getDocumentPage();
      page.query('title')[0].setTitle(me.getAboutUsTitle());

      Ext.Ajax.request(
      {
         url : ((Genesis.constants.isNative()) ? '/' : '') + 'aboutUs.htm',
         success : function(response)
         {
            page.setHtml(response.responseText);
            me.redirectTo('privacy');
         },
         failure : function()
         {
            console.debug("Error Loading AboutUs Document.");
         }
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
         case 'document' :
         {
            page = me.getDocumentPage();
            me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
            break;
         }
         case 'client' :
         {
            page = me.getClientSettingsPage();
            me.setAnimationMode(me.self.superclass.self.animationMode['cover']);
            break;
         }
         case 'server' :
         {
            page = me.getServerSettingsPage();
            me.setAnimationMode(me.self.superclass.self.animationMode['cover']);
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
