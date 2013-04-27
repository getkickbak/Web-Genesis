Ext.define('KickBak.view.Viewport',
{
   extend : 'Ext.Container',
   requires : ['Ext.fx.layout.Card', 'KickBak.view.ViewBase', 'Ext.plugin.ListPaging', 'Ext.plugin.PullRefresh'],
   xtype : 'viewportview',
   config :
   {
      autoDestroy : false,
      cls : 'viewport',
      layout :
      {
         type : 'card',
         animation :
         {
            type : 'cover',
            reverse : false,
            direction : 'left'
         }
      },
      fullscreen : true
   },
   // @private
   initialize : function()
   {
      var me = this;
      me.callParent(arguments);
      /*
       this.on(
       {
       delegate : 'button',
       scope : this,
       tap : function(b, e, eOpts)
       {
       //
       // While Animating, disable ALL button responds in the NavigatorView
       //
       if(Ext.Animator.hasRunningAnimations(this.getNavigationBar().renderElement) ||
       Ext.Animator.hasRunningAnimations(this.getActiveItem().renderElement))
       {
       return false;
       }
       return true;
       }
       });
       */
      Ext.defer(function()
      {
         _application.getController('client' + '.Viewport').redirectTo('signup');
      }, 1);
   },
   /**
    * Animates to the supplied activeItem with a specified animation. Currently this only works
    * with a Card layout.  This passed animation will override any default animations on the
    * container, for a single card switch. The animation will be destroyed when complete.
    * @param {Object/Number} activeItem The item or item index to make active
    * @param {Object/Ext.fx.layout.Card} animation Card animation configuration or instance
    */
   animateActiveItem : function(activeItem, animation)
   {
      var layout = this.getLayout(), defaultAnimation = (layout.getAnimation) ? layout.getAnimation() : null;
      var oldActiveItem = this.getActiveItem();
      var disableAnimation = (activeItem.disableAnimation || ((oldActiveItem) ? oldActiveItem.disableAnimation : false));
      var titlebar, viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');

      if (this.activeItemAnimation)
      {
         this.activeItemAnimation.destroy();
         //console.debug("Destroying AnimateActiveItem ...");
      }
      this.activeItemAnimation = animation = new Ext.fx.layout.Card(animation);

      console.debug('Activate View [' + activeItem._itemId + ']');
      if (animation && layout.isCard && !disableAnimation)
      {
         animation.setLayout(layout);
         if (defaultAnimation)
         {
            var controller = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport').getEventDispatcher().controller;

            defaultAnimation.disable();
            controller.pause();
            activeItem.createView();
            animation.on('animationend', function()
            {
               console.debug("Animation Complete");

               defaultAnimation.enable();
               animation.destroy();
               delete this.activeItemAnimation;

               if (oldActiveItem)
               {
                  oldActiveItem.cleanView(activeItem);

                  titlebar = oldActiveItem.query('titlebar')[0];
                  if (titlebar)
                  {
                     titlebar.setMasked(KickBak.view.ViewBase.invisibleMask);
                  }
               }
               activeItem.showView();

               titlebar = activeItem.query('titlebar')[0];
               if (titlebar)
               {
                  titlebar.setMasked(null);
               }

               //
               // Delete oldActiveItem to save DOM memory
               //
               //if (oldActiveItem)
               {
                  controller.resume();
                  //console.debug('Destroyed View [' + oldActiveItem._itemId + ']');
               }
               viewport.popViewInProgress = false;
            }, this);
         }
         else
         {
            //Ext.Viewport.setMasked(null);
         }
      }

      if (defaultAnimation && disableAnimation)
      {
         defaultAnimation.disable();
      }

      var rc = this.setActiveItem(activeItem);
      if (!layout.isCard || disableAnimation)
      {
         //
         // Defer timeout is required to ensure that
         // if createView called is delayed, we will be scheduled behind it
         //
         if (defaultAnimation)
         {
            defaultAnimation.enable();
         }
         animation.destroy();
         if (oldActiveItem)
         {
            oldActiveItem.cleanView(activeItem);
            var titlebar = oldActiveItem.query('titlebar')[0];
            if (titlebar)
            {
               titlebar.setMasked(KickBak.view.ViewBase.invisibleMask);
            }
         }
         activeItem.createView();
         Ext.defer(function()
         {
            activeItem.showView();
            titlebar = activeItem.query('titlebar')[0];
            if (titlebar)
            {
               titlebar.setMasked(null);
            }
            viewport.popViewInProgress = false;
         }, 0.1 * 1000, this);
      }
      return rc;
   }
});
