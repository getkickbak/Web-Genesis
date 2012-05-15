Ext.define('Genesis.view.Viewport',
{
   extend : 'Ext.navigation.View',
   requires : ['Ext.MessageBox', 'Ext.ActionSheet', 'Ext.fx.layout.Card', 'Ext.SegmentedButton', 'Genesis.navigation.Bar'],
   xtype : 'viewportview',
   config :
   {
      animMode : 'default',
      enableAnim : true,
      autoDestroy : false,
      cls : 'viewport',
      fullscreen : true,
      useTitleForBackButtonText : false,
      defaultBackButtonText :
      //'&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;',
      'Back',
      altBackButtonText : 'Close',
      //--------------------------------------------------------------------
      // Navigation Toolbar
      //--------------------------------------------------------------------
      navigationBar :
      {
         defaults :
         {
            iconMask : true
         },
         docked : 'top',
         cls : 'navigationBarTop',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         items : [
         {
            align : 'left',
            iconCls : 'maps',
            tag : 'mapBtn',
            hidden : true
         },
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
                        xtype : 'button'
                        //,iconCls : 'dummy',
                        //iconAlign : 'left',
                        //iconMask : true
                     },
                     items : [
                     {
                        text : 'Email',
                        ui : 'action',
                        //iconCls : 'mail',
                        tag : 'mail',
                        handler : Ext.emptyFn
                     },
                     {
                        text : 'SMS Message',
                        tag : 'sms',
                        ui : 'action',
                        //iconCls : 'compose',
                        handler : Ext.emptyFn
                     },
                     {
                        text : 'Facebook',
                        tag : 'fbShareBtn',
                        ui : 'blue',
                        //iconCls : 'facebook',
                        handler : Ext.emptyFn
                     },
                     {
                        margin : '0.5 0 0 0',
                        text : 'Cancel',
                        iconMaskCls : 'dummymask',
                        ui : 'cancel',
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
            tag : 'info',
            iconCls : 'info',
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
                        xtype : 'button',
                        defaultUnit : 'em'
                     },
                     items : [
                     {
                        margin : '0 0 0.5 0',
                        text : 'Logout',
                        tag : 'logout'
                     },
                     {
                        margin : '0.5 0 0 0',
                        text : 'Cancel',
                        ui : 'cancel',
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
            tag : 'checkin',
            iconCls : 'checkin',
            hidden : true
         },
         {
            align : 'right',
            tag : 'done',
            text : 'Done',
            hidden : true
         },
         {
            align : 'right',
            tag : 'redeem',
            text : 'Redeem',
            hidden : true
         },
         {
            align : 'right',
            tag : 'post',
            text : 'Post',
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
      this.fadeAnimation =
      {
         type : 'fade',
         listeners :
         {
            scope : this,
            animationend : 'resetAnimation'
         }
      };
      this.cubeAnimation =
      {
         type : 'cube',
         listeners :
         {
            scope : this,
            animationend : 'resetAnimation'
         }
      };

      this.callParent(arguments);

      var layout = this.getLayout(), defaultAnimation = layout.getAnimation();
      defaultAnimation.on('animationend', 'resetAnimation', this);
      this.getNavigationBar()['hide']();
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
   resetAnimation : function()
   {
      var xtypes = this.getActiveItem().getXTypes();
      if(this.defaultInAnimationDir)
      {
         var defaultAnimation = this.getLayout().getAnimation(0);
         defaultAnimation.getInAnimation().setDirection(this.defaultInAnimationDir);
         defaultAnimation.getOutAnimation().setDirection(this.defaultOutAnimationDir);

         /*
         var barAnimation = this.getNavigationBar().getAnimation();
         barAnimation.getInAnimation().setDirection(this.defaultInAnimationDir);
         barAnimation.getOutAnimation().setDirection(this.defaultOutAnimationDir);
         */
      }
      var layout = this.getLayout();
      var animation = layout.getAnimation();
      if(this.defaultAnimation && (animation != this.defaultAnimation))
      {
         layout.setAnimation(this.defaultAnimation);
         this.setAnimMode('default');
      }
   },
   setAnimationDir : function(dir)
   {
      var layout = this.getLayout(), defaultAnimation;
      if(layout.isCard)
      {
         defaultAnimation = layout.getAnimation();
         if(defaultAnimation)
         {
            this.defaultInAnimationDir = defaultAnimation.getInAnimation().getDirection();
            this.defaultOutAnimationDir = defaultAnimation.getOutAnimation().getDirection();
            defaultAnimation.getInAnimation().setDirection(dir);
            defaultAnimation.getOutAnimation().setDirection(dir);
            /*
            var barAnimation = this.getNavigationBar().getAnimation();
            barAnimation.getInAnimation().setDirection(dir);
            barAnimation.getOutAnimation().setDirection(dir);
            */

            //this.setAnimMode(this.getAnimMode(), dir == 'up');
         }
         if(!this.defaultAnimation)
         {
            this.defaultAnimation = defaultAnimation;
         }
      }
   },
   setFadeAnimation : function()
   {
      var layout = this.getLayout();
      if(!this.defaultAnimation)
      {
         this.defaultAnimation = layout.getAnimation();
      }
      layout.setAnimation(this.fadeAnimation);
      this.setAnimMode('fade');
   },
   setCubeAnimation : function()
   {
      var layout = this.getLayout();
      if(!this.defaultAnimation)
      {
         this.defaultAnimation = layout.getAnimation();
      }
      layout.setAnimation(this.cubeAnimation);
      this.setAnimMode('cube');
   },

   /**
    * @private
    */
   doPop : function(config)
   {
      var me = this;
      var animation = me.getLayout().getAnimation();

      me.stack.pop();
      var view = me.stack[me.stack.length - 1];
      var xtypes = me.getActiveItem().getXTypes();

      if(animation && animation.isAnimation && me.getEnableAnim())
      {
         animation.setReverse(true);

         var bar = me.getNavigationBar();
         bar.elementGhost = bar.createProxy(me, bar, view);
      }

      me.setActiveItem(view);
      me.getNavigationBar().onViewRemove(me, view, null);
      /*
       if(animation && animation.isAnimation)
       {
       animation.setReverse(false);
       }
       */
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
   push : function(view)
   {
      var me = this;
      var animation = me.getLayout().getAnimation();
      var bar = me.getNavigationBar();

      if(view == me.stack[me.stack.length - 1])
      {
         console.log("Cannot push the current view into stack ...");
         return;
      }

      // Default Title
      if((me.stack.length == 0) && (!bar.titleComponent.getTitle()))
      {
         bar.titleComponent.setTitle(view.config.title || bar.getDefaultBackButtonText());
      }

      if(animation && animation.isAnimation && me.getEnableAnim())
      {
         animation.setReverse(false);
         bar.elementGhost = bar.createProxy(me, bar, view);
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
         var vrecord = _application.getController('Viewport').getVenue();
         if(vrecord)
         {
            activeItem.getInitialConfig().title = vrecord.get('name');
         }
      }
      if(oldActiveItem)
      {
         oldActiveItem.beforeDeactivate(activeItem, oldActiveItem);
      }
      activeItem.beforeActivate(activeItem, oldActiveItem);

      me.callParent(arguments);

      if(oldActiveItem)
      {
         oldActiveItem.afterDeactivate(activeItem, oldActiveItem);
      }
      activeItem.afterActivate(activeItem, oldActiveItem);
   },
   /**
    * @private
    * Calculates whether it needs to remove any items from the stack when you are popping more than 1
    * item. If it does, it removes those views from the stack and returns `true`.
    * @return {Boolean} True if it has removed views
    */
   beforePop : function(count)
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
            me.getNavigationBar().beforePop(count);
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
   pop : function(count)
   {
      var me = this;
      var bar = me.getNavigationBar();
      me.callParent(arguments);
   },
   /**
    * Resets the view by removing all items
    */
   reset : function()
   {
      var me = this;
      //var count = me.getInnerItems().length;
      var count = me.stack.length;

      this.pop(count);
   },
   silentPop : function(count)
   {
      var i;
      var bar = this.getNavigationBar();
      for( i = 0; i < count; i++)
      {
         this.stack.pop();
         bar.backButtonStack.pop();
      }
   }
});
