Ext.define('Genesis.view.Viewport',
{
   extend : 'Ext.navigation.View',
   requires : ['Ext.MessageBox', 'Ext.ActionSheet', 'Ext.fx.layout.Card', 'Ext.SegmentedButton', 'Genesis.navigation.Bar'],
   xtype : 'viewportview',
   config :
   {
      autoDestroy : false,
      cls : 'viewport',
      fullscreen : true,
      useTitleForBackButtonText : false,
      defaultBackButtonText : 'Back',
      altBackButtonText : 'Close',
      venueId : 0,
      customerId : 0,
      checkinInfo :
      {
         venueId : 0,
         customerId : 0
      },
      //--------------------------------------------------------------------
      // Navigation Toolbar
      //--------------------------------------------------------------------
      navigationBar :
      {
         defaults :
         {
            iconMask : true
         },
         rightButton :
         {
            align : 'right',
            iconMask : true,
            iconCls : 'check_black1'
         },
         docked : 'top',
         cls : 'navigationBarTop',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         items : [
         /*{
            align : 'left',
            tag : 'close',
            hidden : true,
            text : 'Close'
         },
         */
         {
            align : 'right',
            iconCls : 'share',
            tag : 'shareBtn',
            hidden : true,
            handler : function()
            {
               if(!this.actions)
               {
                  this.actions = Ext.create('Ext.ActionSheet',
                  {
                     hideOnMaskTap : false,
                     defaults :
                     {
                        defaultUnit : 'em',
                        margin : '0 0 0.5 0',
                        xtype : 'button',
                        iconCls : 'dummy',
                        iconAlign : 'left',
                        iconMask : true
                     },
                     items : [
                     {
                        text : 'Email',
                        iconCls : 'mail',
                        tag : 'mail',
                        handler : Ext.emptyFn
                     },
                     {
                        text : 'SMS Message',
                        tag : 'sms',
                        iconCls : 'compose',
                        handler : Ext.emptyFn
                     },
                     {
                        text : 'Facebook',
                        tag : 'facebook',
                        ui : 'blue',
                        iconCls : 'facebook',
                        handler : Ext.emptyFn
                     },
                     {
                        margin : '0.5 0 0 0',
                        text : 'Cancel',
                        iconMaskCls : 'dummymask',
                        ui : 'confirm',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     }]
                  });
                  Ext.Viewport.add(this.actions);
                  this.actions.show();
               }
               this.actions.show();
            }
         },
         {
            align : 'right',
            tag : 'info',
            iconCls : 'info_plain',
            destroy : function()
            {
               this.actions.destroy();
               this.callParent(arguments);
            },
            handler : function()
            {
               if(!this.actions)
               {
                  this.actions = Ext.create('Ext.ActionSheet',
                  {
                     defaultUnit : 'em',
                     padding : '1em',
                     hideOnMaskTap : false,
                     defaults :
                     {
                        defaultUnit : 'em'
                     },
                     items : [
                     {
                        margin : '0 0 0.5 0',
                        text : 'Logout',
                        handler : Ext.emptyFn
                     },
                     {
                        margin : '0.5 0 0 0',
                        xtype : 'button',
                        text : 'Cancel',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     }]
                  });
                  Ext.Viewport.add(this.actions);
               }
               this.actions.show();
            }
         },
         {
            align : 'right',
            tag : 'main',
            iconCls : 'check_black1',
            hidden : true
         },
         {
            align : 'right',
            tag : 'edit',
            text : 'Edit',
            hidden : true
         },
         {
            align : 'right',
            tag : 'done',
            text : 'Done',
            hidden : true
         }]
      },
      //--------------------------------------------------------------------
      // Bottom Toolbar
      //--------------------------------------------------------------------
      items : [
      /*,{
       title : 'First',
       items : [
       {
       xtype : 'button',
       text : 'Push a new view!',
       handler : function()
       {
       //use the push() method to push another view. It works much like
       //add() or setActiveItem(). it accepts a view instance, or you can give it
       //a view config.
       view.push(
       {
       title : 'Second',
       html : 'Second view!'
       });
       }
       }]
       }*/]
   },
   // @private
   initialize : function()
   {
      this.stack = [];
      this.slideTop = new Ext.fx.layout.Card(
      {
         duration : 300,
         easing : 'ease-out',
         type : 'slide',
         direction : 'top'
      })
      this.slideTop.on('animationend', this.onAnimationEnd, this);
      this.callParent(arguments);

      var layout = this.getLayout(), defaultAnimation = layout.getAnimation();
      defaultAnimation.getOutAnimation().on('animationend', 'resetAnimationCfg', this);

   },
   // @private
   applyNavigationBar : function(config)
   {
      if(!config)
      {
         config =
         {
            hidden : true,
            docked : 'top'
         };
      }

      if(config.title)
      {
         delete config.title;
         //<debug>
         Ext.Logger.warn("Ext.navigation.View: The 'navigationBar' configuration does not accept a 'title' property. You " + "set the title of the navigationBar by giving this navigation view's children a 'title' property.");
         //</debug>
      }

      config.view = this;

      return Ext.factory(config, Genesis.navigation.Bar, this.getNavigationBar());
   },
   resetAnimationCfg : function()
   {
      if(!this.getActiveItem().getXTypes().match('viewbase'))
      {
         var layout = this.getLayout(), defaultAnimation;
         defaultAnimation = layout.getAnimation();
         defaultAnimation.getInAnimation().setDirection(this.defaultInAnimationDir);
         defaultAnimation.getOutAnimation().setDirection(this.defaultOutAnimationDir);
      }
   },
   changeAnimationCfg : function()
   {
      var layout = this.getLayout(), defaultAnimation;
      if(layout.isCard)
      {
         defaultAnimation = layout.getAnimation();
         if(defaultAnimation)
         {
            this.defaultInAnimationDir = defaultAnimation.getInAnimation().getDirection();
            this.defaultOutAnimationDir = defaultAnimation.getOutAnimation().getDirection();
            defaultAnimation.getInAnimation().setDirection('up');
            defaultAnimation.getOutAnimation().setDirection('up');
         }
      }
   },
   /**
    * @private
    */
   doPop : function(config)
   {
      var me = this;
      me.stack.pop();
      var animation = me.getLayout().getAnimation();
      var view = me.stack[me.stack.length - 1];

      if(animation && animation.isAnimation)
      {
         animation.setReverse(true);

         var slide = (me.getActiveItem() && !me.getActiveItem().getXTypes().match('viewbase'));
         var bar = me.getNavigationBar();
         bar.setMode((slide) ? 'slide' : 'fade');
         bar.elementGhost = bar.createProxy(bar);
      }

      me.getNavigationBar().onViewRemove(me, view, null);
      me.setActiveItem(view);
      if(animation && animation.isAnimation)
      {
         animation.setReverse(false);
      }
      return view;
   },
   /**
    * Returns the previous item, if one exists.
    * @return {Mixed} The previous view
    */
   getPreviousItem : function()
   {
      var me = this;
      return me.stack[me.stack.length - 1];
   },
   /**
    * Pushes a new view into this navigation view using the default animation that this view has.
    * @param {Object} view The view to push
    * @return {Ext.Component} The new item you just pushed
    */
   push : function(view, controller)
   {
      var me = this;
      var animation = me.getLayout().getAnimation();
      var bar = me.getNavigationBar();
      bar.controller = controller;

      // Default Title
      if((me.stack.length == 0) && (!bar.titleComponent.getTitle()))
      {
         bar.titleComponent.setTitle(view.config.title || bar.getDefaultBackButtonText());
      }

      if(animation && animation.isAnimation)
      {
         var slide = (!view.getXTypes().match('viewbase'));
         bar.setMode((slide) ? 'slide' : 'fade');
         bar.elementGhost = bar.createProxy(bar);
      }

      if(me.getInnerItems().indexOf(view) < 0)
      {
         view = me.add(view);
      }
      else
      {
         me.setActiveItem(view);
         me.getNavigationBar().onViewAdd(me, view, null);
      }
      me.stack.push(view);

      return view;
   },
   // @private
   doSetActiveItem : function(activeItem, oldActiveItem)
   {
      if(!activeItem)
      {
         return;
      }
      var me = this;
      if(activeItem.getInitialConfig().changeTitle === true)
      {
         //
         // Get current Page Title name
         // Either it's the current venue we are browsing, or the one we checked-in
         //
         var venueId = activeItem.venueId || this.getVenueId();
         var vrecord = Ext.StoreMgr.get('VenueStore').getById(venueId);

         activeItem.getInitialConfig().title = vrecord.get('name');
      }
      activeItem.beforeActivate(activeItem, oldActiveItem);
      if(oldActiveItem)
      {
         oldActiveItem.beforeDeactivate(activeItem, oldActiveItem);
      }
      me.callParent(arguments);
      activeItem.afterActivate(activeItem, oldActiveItem);
      if(oldActiveItem)
      {
         oldActiveItem.afterDeactivate(activeItem, oldActiveItem);
      }
   },
   /**
    * @private
    * Calculates whether it needs to remove any items from the stack when you are popping more than 1
    * item. If it does, it removes those views from the stack and returns `true`.
    * @return {Boolean} True if it has removed views
    */
   onBeforePop : function(count)
   {
      var me = this;
      //var innerItems = this.getInnerItems();
      //var ln = innerItems.length;
      var ln = me.stack.length;
      //var toRemove, last, i;

      //default to 1 pop
      if(!Ext.isNumber(count) || count < 1)
      {
         count = 1;
      }

      //check if we are trying to remove more items than we have
      //count = Math.min(count, ln - 1);
      count = Math.min(count, ln);

      if(count)
      {
         //get the items we need to remove from the view and remove theme
         if(count == ln)
         {
            var bar = me.getNavigationBar();
            //we need to reset the backButtonStack in the navigation bar
            bar.reset();
            /*
             toRemove = innerItems.splice(-count, count);
             for( i = 0; i < toRemove.length; i++)
             {
             // Don't delete right away, otherwise we cannot animate between views!
             if(toRemove[i] === me.getActiveItem())
             {
             me.on(
             {
             activeitemchange : 'doRemove',
             scope : me,
             single : true,
             order : 'after',
             args : [toRemove[i], me.indexOf(toRemove[i]), me.getAutoDestroy()]
             });
             }
             else
             {
             me.doRemove(toRemove[i], me.indexOf(toRemove[i]), me.getAutoDestroy());
             }
             }
             */
            me.stack = [];
            bar.getBackButton().hide();
            bar.getBackButton().setText(null);
         }
         else
         {
            //we need to reset the backButtonStack in the navigation bar
            me.getNavigationBar().onBeforePop(count);
            /*
             toRemove = innerItems.splice(-count, count - 1);
             for( i = 0; i < toRemove.length; i++)
             {
             me.remove(toRemove[i]);
             }
             */
            for( i = 0; i < count - 1; i++)
            {
               this.stack.pop();
            }
            return true;
         }
      }

      return false;
   },
   pop : function(controller)
   {
      var bar = this.getNavigationBar();
      bar.controller = controller || this.getEventDispatcher().controller;
      this.callParent(arguments);
   },
   /**
    * Resets the view by removing all items
    */
   reset : function(controller)
   {
      var me = this;
      //var count = me.getInnerItems().length;
      var count = me.stack.length;

      this.pop(count, controller);
   }
});
