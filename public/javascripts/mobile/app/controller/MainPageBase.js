Ext.define('Genesis.controller.MainPageBase',
{
   extend : 'Genesis.controller.ControllerBase',
   xtype : 'mainPageBaseCntlr',
   config :
   {
      csrfTokenRecv : false,
      models : ['Customer', 'User', 'Merchant', 'CustomerReward', 'Genesis.model.frontend.MainPage', 'Genesis.model.frontend.Signin', 'Genesis.model.frontend.Account'],
      after :
      {
         'mainPage' : ''
      },
      routes :
      {
         //'' : 'openPage', //Default do nothing
         'main' : 'mainPage'
      },
      refs :
      {
      },
      control :
      {
         main :
         {
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      },
      listeners :
      {
         'itemTap' : 'onItemTap'
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      Genesis.db.removeLocalDBAttrib('csrf_code');
      Ext.regStore('MainPageStore',
      {
         model : 'Genesis.model.frontend.MainPage',
         //autoLoad : true,
         autoLoad : false,
         listeners :
         {
            scope : me,
            "refresh" : me.initCallback
         }
      });

      Ext.Viewport.on('orientationchange', function(v, newOrientation, width, height, eOpts)
      {
         //
         // Redraw Screen
         //
         var page = me.getMain(), vport = me.getViewport();
         if (page == vport.getActiveItem())
         {
            me.refreshPage(page);
         }
      });
      console.log("MainPageBase Init");
      //
      // Preloading Pages to memory
      //
      me.getMain();

      backBtnCallbackListFn.push(function(activeItem)
      {
         var match = ((activeItem == me.getMain()) || ((merchantMode) ? false : (activeItem == me.getLogin())));
         if (match)
         {
            var viewport = me.getViewPortCntlr();
            me.self.playSoundFile(viewport.sound_files['clickSound']);
            if (Ext.os.is('Android'))
            {
               navigator.app.exitApp();
            }
            return true;
         }
         return false;
      });
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onItemTap : function(model)
   {
      var viewport = this.getViewPortCntlr();

      this.self.playSoundFile(viewport.sound_files['clickSound']);

      console.debug("Controller=[" + model.get('pageCntlr') + "]");
      var cntlr = this.getApplication().getController(model.get('pageCntlr'));
      var msg = cntlr.isOpenAllowed();
      if (msg === true)
      {
         if (model.get('route'))
         {
            this.redirectTo(model.get('route'));
         }
         else if (model.get('subFeature'))
         {
            cntlr.openPage(model.get('subFeature'));
         }
         else
         {
            cntlr.openMainPage();
         }
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : msg,
            buttons : ['Dismiss']
         });
      }
      return false;
   },
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         /*
          var carousel = activeItem.query('carousel')[0];
          var items = carousel.getInnerItems();

          console.debug("Refreshing MainPage ...");
          for (var i = 0; i < items.length; i++)
          {
          items[i].refresh();
          }
          */
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function()
   {
      this.openPage('main');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this;

      switch (subFeature)
      {
         case 'main' :
         {
            me.setAnimationMode(me.self.animationMode['pop']);
            me.pushView(me.getMainPage());
            break;
         }
         case 'merchant' :
         {
            me.goToMerchantMain(true);
            break;
         }
         case 'login' :
         {
            // Remove all previous view from viewStack
            var controller = me.getApplication().getController('client' + '.Checkins');
            controller.fireEvent('setupCheckinInfo', 'checkin', null, null, null);
            //me.getApplication().getController('client' + '.Prizes').fireEvent('updatePrizeViews', null);
            me.setAnimationMode(me.self.animationMode['fade']);
            me.pushView(me.getLogin());
            break;
         }
      }
   },
   getMainPage : function()
   {
      var page = this.getMain();
      return page;
   },
   openMainPage : function()
   {
      var cntlr = this.getViewPortCntlr();
      this.setAnimationMode(this.self.animationMode['pop']);
      this.pushView(this.getMainPage());
      console.log("MainPage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
