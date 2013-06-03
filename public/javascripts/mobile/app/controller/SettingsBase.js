Ext.define('Genesis.controller.SettingsBase',
{
   extend : 'Genesis.controller.ControllerBase',
   inheritableStatics :
   {
   },
   xtype : 'settingsBaseCntlr',
   config :
   {
      termsOfServiceTitle : 'Term of Service',
      privacyTitle : 'Privacy',
      aboutUsTitle : 'About Us',
      routes :
      {
         'aboutus' : 'documentPage',
         'privacy' : 'documentPage',
         'termsOfUse' : 'multipartDocumentPage',
         'settings' : 'openSettingsPage'
      },
      refs :
      {
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
         }
      }
   },
   termsLoaded : false,
   privacyLoaded : false,
   aboutUsLoaded : false,
   init : function()
   {
      this.callParent(arguments);
      this.getMultipartDocumentPage();
      this.getDocumentPage();

      console.log("Settings Base Init");
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onTermsTap : function(b, e)
   {
      var me = this, flag = 0, viewport = me.getViewPortCntlr(), responses = [], page = me.getMultipartDocumentPage();

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
               if (success || (response.status == 0))
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
               if (success || (response.status == 0))
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
               if (success || (response.status == 0))
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
               if (success || (response.status == 0))
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
   onDeviceReset : function(b, e)
   {
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   openSettingsPage : Ext.emptyFn,
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
         case 'settings' :
         {
            page = me.getSettingsPage();
            me.setAnimationMode(me.self.animationMode['cover']);
            break;
         }
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
      }
      me.pushView(page);
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
