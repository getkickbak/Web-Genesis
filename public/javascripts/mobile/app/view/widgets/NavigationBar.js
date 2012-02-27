Ext.define('Genesis.navigation.Bar',
{
   extend : 'Ext.navigation.Bar',
   config :
   {
      defaultBackButtonText : 'Back',
      altBackButtonText : 'Close',
      mode : 'slide'
   },
   /**
    * @private
    */
   onViewAdd : function(view, item, index)
   {
      var me = this;
      var animation = view.getLayout().getAnimation();
      var titleComponent = me.titleComponent;

      me.endAnimation();

      me.backButtonStack.push(item.config.title || me.getDefaultBackButtonText());
      me.refreshNavigationBarProxy();

      var proxy = me.getNavigationBarProxyProperties();
      if(proxy.title.left)
      {
         //titleComponent.setLeft(proxy.title.left);
      }
      if(proxy.title.width)
      {
         titleComponent.setWidth(proxy.title.width);
      }

      var backButton = me.getBackButton();
      //update the back button, and make sure it is visible
      if(view.stack.length > 0)
      {
         backButton.setText(me.getBackButtonText());
         backButton.show();
      }
      else
      {
         backButton.hide();
      }

      me.titleComponent.setTitle(me.getTitleText());
      if(animation && animation.isAnimation && view.isPainted() && me.elementGhost)
      {
         //if(this.backButtonStack.length > 1)
         if(view.getInnerItems().length > 1)
         {
            me.pushTbAnimated(me.getBackButtonText(), this.controller);
         }
         else
         {
            if(me.elementGhost)
            {
               me.elementGhost.destroy();
               delete me.elementGhost;
            }
            //this.popBackButtonAnimated(this.getBackButtonText());
         }
      }
      else
      {
         //this.pushTitle(this.getTitleText());

         //if(this.backButtonStack.length > 1)
         if(view.getInnerItems().length > 1)
         {
            me.pushTb(me.getBackButtonText());
         }
         else
         {
            //this.popBackButton(this.getBackButtonText());
         }
      }
   },
   /**
    * @private
    */
   onViewRemove : function(view, item, index)
   {
      var me = this;
      var animation = view.getLayout().getAnimation();
      var titleComponent = me.titleComponent;

      me.endAnimation();

      me.backButtonStack.pop();

      me.refreshNavigationBarProxy();
      var proxy = me.getNavigationBarProxyProperties();
      if(proxy.title.left)
      {
         //titleComponent.setLeft(proxy.title.left);
      }
      if(proxy.title.width)
      {
         titleComponent.setWidth(proxy.title.width);
      }
      if(animation && animation.isAnimation && view.isPainted() && me.elementGhost)
      {
         me.popTbAnimated(me.getBackButtonText(), this.controller);
      }
      else
      {
         me.popTb(me.getBackButtonText());
      }
      me.titleComponent.setTitle(me.getTitleText());
   },
   /**
    * Calculates and returns the position values needed for the back button when you are pushing a title.
    * @private
    */
   getTbAnimationProperties : function()
   {
      var me = this, element = me.renderElement;
      switch (this.getMode())
      {
         case 'slide' :
         {
            if(!this.slideAnimation)
            {
               this.slideAnimation = new Ext.fx.layout.card.Slide(
               {
                  direction : 'left'
               });
            }
            this.slideAnimation.setReverse(false);
            return this.slideAnimation;
         }
         case 'fade' :
         {
            if(!this.fadeAnimation)
            {
               this.fadeAnimation = new Ext.fx.layout.card.Fade();
            }
            this.fadeAnimation.setReverse(false);
            return this.fadeAnimation;
         }
      }

   },
   /**
    * Calculates and returns the position values needed for the back button when you are popping a title.
    * @private
    */
   getTbAnimationReverseProperties : function()
   {
      var rc = this.getTbAnimationProperties();
      rc.setReverse(true);
      return rc;
   },
   /**
    * Pushes a back button into the bar with no animations
    * @private
    */
   pushTb : function(title)
   {
      var me = this;
      var proxy = me.getNavigationBarProxyProperties();
      var backButton = me.getBackButton();
      var buttonTo = proxy.backButton;
      if(buttonTo.left)
      {
         backButton.setLeft(buttonTo.left);
      }
      if(buttonTo.width)
      {
         backButton.setWidth(buttonTo.width);
      }

   },
   /**
    * Pushes a new back button into the bar with animations
    * @private
    */
   pushTbAnimated : function(title, controller)
   {
      var me = this;
      var done = 0;

      var backButton = me.getBackButton(), previousTitle = backButton.getText();
      var properties = me.getTbAnimationProperties();
      var proxy = me.getNavigationBarProxyProperties();

      //animate the backButton, which always has the new title
      var buttonTo = proxy.backButton;
      if(buttonTo.left)
      {
         backButton.setLeft(buttonTo.left);
      }
      if(buttonTo.width)
      {
         backButton.setWidth(buttonTo.width);
      }

      me.onActiveItemChange.call(properties, null, me.renderElement, me.elementGhost, null, controller, function()
      {
         me.elementGhost.destroy();
         delete me.elementGhost;
      });
   },
   /**
    * Pops the back button with no animations
    * @private
    */
   popTb : function(title)
   {
      var me = this, backButton = me.getBackButton();
      var proxy = this.getNavigationBarProxyProperties();

      if(title && me.backButtonStack.length)
      {
         backButton.setText(this.getBackButtonText());
         backButton.show();
      }
      else
      {
         backButton.hide();
      }

      var buttonTo = proxy.backButton;
      if(buttonTo.left)
      {
         backButton.setLeft(buttonTo.left);
      }
      if(buttonTo.width)
      {
         backButton.setWidth(buttonTo.width);
      }
   },
   /**
    * Pops the current back button with animations.
    * It will automatically know whether or not it should show the previous backButton or not. And proceed accordingly
    * @private
    */
   popTbAnimated : function(title, controller)
   {
      var me = this;

      var element = me.element, renderElement = me.renderElement, backButton = me.getBackButton();
      var previousTitle = backButton.getText();
      var properties = me.getTbAnimationReverseProperties();
      var proxy = this.getNavigationBarProxyProperties();

      //update the back button, and make sure it is visible
      if(title && me.backButtonStack.length)
      {
         backButton.setText(this.getBackButtonText());
         backButton.show();
      }
      else
      {
         backButton.hide();
      }

      var buttonTo = proxy.backButton;
      if(buttonTo.width)
      {
         backButton.setWidth(buttonTo.width);
      }

      me.onActiveItemChange.call(properties, null, me.renderElement, me.elementGhost, null, controller, function()
      {
         me.elementGhost.destroy();
         delete me.elementGhost;
         if(!title)
         {
            backButton.setText(null);
         }
      });
   },
   /**
    * This creates a proxy of the whole navigation bar and positions it out of the view.
    * This is used so we know where the back button and title needs to be at any time, either if we are
    * animating, not animating, or resizing.
    * @private
    */
   createNavigationBarProxy : function()
   {
      var proxy = this.proxy;

      if(proxy)
      {
         return;
      }

      //create a titlebar for the proxy
      this.proxy = proxy = Ext.create('Ext.TitleBar',
      {
         title : this.backButtonStack[0]
      });
      proxy.add(Ext.applyIf(
      {
         hidden : false,
         text : ''
      }, this.config.backButton));
      proxy.add(this.config.rightButton);

      proxy.backButton = proxy.down('button[ui=back]');

      //add the proxy to the body
      Ext.getBody().appendChild(proxy.renderElement);

      proxy.renderElement.setStyle('position', 'absolute');
      proxy.element.setStyle('visibility', 'hidden');
      proxy.renderElement.setX(0);
      proxy.renderElement.setY(-1000);
   },
   /**
    * Refreshes the navigation bar proxy with the latest data available in the backButtonStack.
    * @private
    */
   refreshNavigationBarProxy : function()
   {
      var proxy = this.proxy, renderElement = this.renderElement, backButtonStack = this.backButtonStack, title = backButtonStack[backButtonStack.length - 1], oldTitle = this.getBackButtonText();

      if(!proxy)
      {
         this.createNavigationBarProxy();
         proxy = this.proxy;
      }

      proxy.renderElement.setWidth(renderElement.getWidth());
      proxy.renderElement.setHeight(renderElement.getHeight());

      proxy.setTitle(title);

      if(oldTitle)
      {
         proxy.backButton.setText(oldTitle);
         proxy.backButton.show();
      }
      else
      {
         //proxy.backButton.hide();
      }

      proxy.refreshTitlePosition();
   },
   /**
    * A Simple helper method which returns the current positions and sizes of the title and back button
    * in the navigation bar proxy.
    * @private
    */
   getNavigationBarProxyProperties : function()
   {
      return (
         {
            title :
            {
               left : this.proxy.titleComponent.renderElement.getLeft(),
               width : this.proxy.titleComponent.renderElement.getWidth()
            },
            leftBox :
            {
               left : this.proxy.leftBox.renderElement.getLeft(),
               width : this.proxy.leftBox.renderElement.getWidth()
            },
            rightBox :
            {
               left : this.proxy.rightBox.renderElement.getLeft(),
               width : this.proxy.rightBox.renderElement.getWidth()
            },
            backButton :
            {
               left : this.proxy.backButton.renderElement.getLeft(),
               width : this.proxy.backButton.renderElement.getWidth()
            }
         });
   },
   /**
    * Creates a proxy element of the passed element, and positions it in the same position, using absolute positioning.
    * The createNavigationBarProxy method uses this to create proxies of the backButton and the title elements.
    * @private
    */
   createProxy : function(component, useParent)
   {
      var element = (useParent) ? component.element.getParent() : component.element, ghost = Ext.get(element.id + '-proxy');

      if(!ghost)
      {
         ghost = element.dom.cloneNode(true);
         ghost.id = element.id + '-proxy';
         ghost.children[0].id = element.dom.children[0].id + '-proxy';

         //insert it into the toolbar
         element.getParent().dom.appendChild(ghost);

         //set the x/y
         ghost = Ext.get(ghost);
         ghost.setStyle('position', 'absolute');
         ghost.setY(element.getY());
         ghost.setX(element.getX());
         ghost.setWidth(element.getWidth());
         ghost.dom.style.setProperty('z-index', 1, 'important');
      }

      return ghost;
   },
   reset : function()
   {
      this.backButtonStack = [];
      this.lastAnimationProperties =
      {
      };
      this.animating = false;
   },
   //
   // Set "this" as Ext.fx.layout.card.* object
   //
   onActiveItemChange : function(cardLayout, inElement, outElement, options, controller, onEnd)
   {
      var inAnimation = this.getInAnimation(), outAnimation = this.getOutAnimation(), inElement, outElement;

      if(inElement && outElement)
      {
         inAnimation.setElement(inElement);
         outAnimation.setElement(outElement);

         outAnimation.setOnBeforeEnd(function(element, interrupted)
         {
            if(interrupted || Ext.Animator.hasRunningAnimations(element))
            {
               controller.firingArguments[1] = null;
               controller.firingArguments[2] = null;
            }
         });
         outAnimation.setOnEnd(function()
         {
            controller.resume();
            onEnd();
         });

         inElement.dom.style.setProperty('visibility', 'hidden', '!important');
         //newItem.show();

         Ext.Animator.run([outAnimation, inAnimation]);
         controller.pause();
      }
   }
});
