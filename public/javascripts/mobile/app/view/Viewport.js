Ext.define('Genesis.view.Viewport',
{
   extend : 'Ext.Container',
   requires : ['Ext.fx.layout.Card'],
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
            type : 'slide',
            reverse : false,
            direction : 'left'
         }
      },
      fullscreen : true
   },
   loadingMsg : 'Loading ...',
   // @private
   initialize : function()
   {
      this.callParent(arguments);
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
      /*
       Ext.Viewport.setMasked(
       {
       xtype : 'loadmask',
       message : this.loadingMsg
       });
       */

      var layout = this.getLayout(), defaultAnimation;
      var oldActiveItem = this.getActiveItem();

      if (this.activeItemAnimation)
      {
         this.activeItemAnimation.destroy();
         //console.debug("Destroying AnimateActiveItem ...");
      }
      this.activeItemAnimation = animation = new Ext.fx.layout.Card(animation);
      if (animation && layout.isCard)
      {
         animation.setLayout(layout);
         defaultAnimation = layout.getAnimation();
         if (defaultAnimation)
         {
            var controller = _application.getController('Viewport').getEventDispatcher().controller;

            defaultAnimation.disable();
            controller.pause();
            animation.on('animationend', function()
            {
               defaultAnimation.enable();
               animation.destroy();
               delete this.activeItemAnimation;

               //console.debug("Animation Complete");
               activeItem.createView();
               activeItem.showView();

               //Ext.Viewport.setMasked(false);
               //
               // Delete oldActiveItem to save DOM memory
               //
               if (oldActiveItem)
               {
                  Ext.defer(function()
                  {
                     //oldActiveItem.destroy();
                     controller.resume();
                     //console.debug('Destroyed View [' + oldActiveItem._itemId + ']');
                  }, 0.1 * 1000, this);
               }
            }, this);
         }
         else
         {
            //Ext.Viewport.setMasked(false);
         }
      }
      
      //console.debug("animateActiveItem");
      
      var rc = this.setActiveItem(activeItem);
      if (!layout.isCard)
      {
         //
         // Defer timeout is required to ensure that
         // if createView called is delayed, we will be scheduled behind it
         //
         activeItem.createView();
         Ext.defer(activeItem.showView, 1, activeItem);
         //Ext.Viewport.setMasked(false);
      }
      return rc;
   },
});
