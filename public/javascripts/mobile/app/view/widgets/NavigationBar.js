Ext.define('Genesis.navigation.Bar',
{
   extend : 'Ext.navigation.Bar',
   /**
    * @private
    */
   onViewAdd : function(view, item, index)
   {
      var animation = view.getLayout().getAnimation();

      this.endAnimation();

      this.backButtonStack.push(item.config.title || this.getDefaultBackButtonText());

      this.refreshNavigationBarProxy();

      if(animation && animation.isAnimation)
      {
         if(this.backButtonStack.length > 1)
         {
            this.pushTbAnimated(this.getBackButtonText());
         }
         else
         {
            //this.popBackButtonAnimated(this.getBackButtonText());
         }
         this.pushTitleAnimated(this.getTitleText());
      }
      else
      {
         if(this.backButtonStack.length > 1)
         {
            this.pushTb(this.getBackButtonText());
         }
         else
         {
            //this.popBackButton(this.getBackButtonText());
         }
         this.pushTitle(this.getTitleText());
      }
   },
   /**
    * @private
    */
   onViewRemove : function(view, item, index)
   {
      var animation = view.getLayout().getAnimation();

      this.endAnimation();

      this.backButtonStack.pop();

      this.refreshNavigationBarProxy();

      if(animation && animation.isAnimation)
      {
         this.popTbAnimated(this.getBackButtonText());
         this.popTitleAnimated(this.getTitleText());
      }
      else
      {
         this.popTb(this.getBackButtonText());
         this.popTitle(this.getTitleText());
      }
   },
   /**
    * Calculates and returns the position values needed for the back button when you are pushing a title.
    * @private
    */
   getTbAnimationProperties : function()
   {
      var me = this, element = me.renderElement, leftBoxElement = me.leftBox.renderElement, rightBoxElement = me.rightBox.renderElement, backButtonElement = me.getBackButton().renderElement;
      var titleElement = me.titleComponent.renderElement, minButtonOffset = Math.min(element.getWidth() / 3, 200);

      var proxyProperties = this.getNavigationBarProxyProperties(), buttonOffset, leftOffset, leftGhostOffset, rightOffset, rightGhostOffset;
      buttonOffset = leftOffset = titleElement.getX() - element.getX();
      leftGhostOffset = element.getX() - leftBoxElement.getX() - leftBoxElement.getWidth();
      leftOffset = Math.min(leftOffset, minButtonOffset);
      rightOffset = titleElement.getX() + element.getX();
      rightGhostOffset = element.getX() - rightBoxElement.getX() - rightBoxElement.getWidth() - titleElement.getX() - titleElement.getWidth();

      return (
         {
            backButton :
            {
               from :
               {
                  left : buttonOffset,
                  width : proxyProperties.backButton.width,
                  opacity : 0
               },
               to :
               {
                  left : 0,
                  width : proxyProperties.backButton.width,
                  opacity : 1
               }
            },
            leftBox :
            {
               from :
               {
                  left : leftOffset,
                  width : proxyProperties.leftBox.width,
                  opacity : 0
               },
               to :
               {
                  left : 0,
                  width : proxyProperties.leftBox.width,
                  opacity : 1
               }
            },
            rightBox :
            {
               from :
               {
                  left : rightOffset,
                  width : proxyProperties.rightBox.width,
                  opacity : 0
               },
               to :
               {
                  left : 0,
                  width : proxyProperties.rightBox.width,
                  opacity : 1
               }
            },
            leftGhost :
            {
               from : null,
               to :
               {
                  left : leftGhostOffset,
                  opacity : 0
               }
            },
            rightGhost :
            {
               from : null,
               to :
               {
                  left : rightGhostOffset,
                  opacity : 0
               }
            }
         });
   },
   /**
    * Calculates and returns the position values needed for the back button when you are popping a title.
    * @private
    */
   getTbAnimationReverseProperties : function()
   {
      var me = this, element = me.renderElement;
      var leftBoxElement = me.leftBox.renderElement, rightBoxElement = me.rightBox.renderElement;
      var titleElement = me.titleComponent.renderElement;
      var minButtonGhostOffset = Math.min(element.getWidth() / 3, 200);

      var proxyProperties = this.getNavigationBarProxyProperties(), buttonOffset, leftOffset, leftGhostOffset, rightOffset, rightGhostOffset;
      buttonOffset = leftOffset = element.getX() - leftBoxElement.getX() - leftBoxElement.getWidth();
      rightOffset = element.getX() - rightBoxElement.getX() - rightBoxElement.getWidth();
      leftGhostOffset = titleElement.getX() - leftBoxElement.getWidth();
      leftGhostOffset = Math.min(leftGhostOffset, minButtonGhostOffset);
      rightGhostOffset = titleElement.getX() + rightBoxElement.getWidth();

      return (
         {
            backButton :
            {
               from :
               {
                  left : buttonOffset,
                  width : proxyProperties.backButton.width,
                  opacity : 0
               },
               to :
               {
                  left : 0,
                  width : proxyProperties.backButton.width,
                  opacity : 1
               }
            },
            leftBox :
            {
               from :
               {
                  left : leftOffset,
                  width : proxyProperties.leftBox.width,
                  opacity : 0
               },
               to :
               {
                  left : 0,
                  width : proxyProperties.leftBox.width,
                  opacity : 1
               }
            },
            rightBox :
            {
               from :
               {
                  left : rightOffset,
                  width : proxyProperties.rightBox.width,
                  opacity : 0
               },
               to :
               {
                  left : 0,
                  width : proxyProperties.rightBox.width,
                  opacity : 1
               }
            },

            leftGhost :
            {
               from : null,
               to :
               {
                  left : leftGhostOffset,
                  opacity : 0
               }
            },
            rightGhost :
            {
               from : null,
               to :
               {
                  left : leftGhostOffset,
                  opacity : 0
               }
            }
         });
   },
   /**
    * Calculates and returns the position values needed for the title when you are pushing a title.
    * @private
    */
   getTitleAnimationProperties : function()
   {
      var me = this, element = me.renderElement, titleElement = me.titleComponent.renderElement, proxyProperties = this.getNavigationBarProxyProperties(), titleOffset, titleGhostOffset;
      titleOffset = element.getWidth() - titleElement.getX();
      titleGhostOffset = element.getX() - titleElement.getX() + proxyProperties.leftBox.width;

      if((proxyProperties.leftBox.left + titleElement.getWidth()) > titleElement.getX())
      {
         titleGhostOffset = element.getX() - titleElement.getX() - titleElement.getWidth();
      }

      return (
         {
            element :
            {
               from :
               {
                  left : titleOffset,
                  width : proxyProperties.title.width,
                  opacity : 0
               },
               to :
               {
                  left : proxyProperties.title.left,
                  width : proxyProperties.title.width,
                  opacity : 1
               }
            },
            ghost :
            {
               from : titleElement.getLeft(),
               to :
               {
                  left : titleGhostOffset,
                  opacity : 0
               }
            }
         });
   },
   /**
    * Calculates and returns the position values needed for the title when you are popping a title.
    * @private
    */
   getTitleAnimationReverseProperties : function()
   {
      var me = this, element = me.renderElement, titleElement = me.titleComponent.renderElement, proxyProperties = this.getNavigationBarProxyProperties(), ghostLeft = 0, titleOffset, titleGhostOffset;
      ghostLeft = titleElement.getLeft();
      titleElement.setLeft(0);
      titleOffset = element.getX() - titleElement.getX() + proxyProperties.backButton.width;
      titleGhostOffset = element.getX() + element.getWidth();

      if((proxyProperties.leftBox.left + titleElement.getWidth()) > titleElement.getX())
      {
         titleOffset = element.getX() - titleElement.getX() - titleElement.getWidth();
      }

      return (
         {
            element :
            {
               from :
               {
                  left : titleOffset,
                  width : proxyProperties.title.width,
                  opacity : 0
               },
               to :
               {
                  left : proxyProperties.title.left,
                  width : proxyProperties.title.width,
                  opacity : 1
               }
            },
            ghost :
            {
               from : ghostLeft,
               to :
               {
                  left : titleGhostOffset,
                  opacity : 0
               }
            }
         });
   },
   /**
    * Pushes a back button into the bar with no animations
    * @private
    */
   pushTb : function(title)
   {
      var backButton = this.getBackButton();
      backButton.setText(title);
      backButton.show();

      var properties = this.getTbAnimationProperties();
      var leftBox = this.leftBox, rightBox = this.rightBox;
      var leftTo = properties.leftbox.to, rightTo = properties.rightbox.to, buttonTo = properties.backButton.to;

      if(buttonTo.left)
      {
         leftBox.setLeft(buttonTo.left);
      }
      if(buttonTo.width)
      {
         backButton.setWidth(buttonTo.width);
      }
      if(leftTo.left)
      {
         leftBox.setLeft(leftTo.left);
      }
      if(leftTo.width)
      {
         leftBox.setWidth(leftTo.width);
      }
      if(rightTo.left)
      {
         rightBox.setLeft(rightTo.left);
      }
      if(rightTo.width)
      {
         rightBox.setWidth(rightTo.width);
      }
   },
   /**
    * Pushes a new back button into the bar with animations
    * @private
    */
   pushTbAnimated : function(title)
   {
      var me = this;
      var done = 0;

      var backButton = me.getBackButton(), previousTitle = backButton.getText();
      var leftBox = me.leftBox, rightBox = me.rightBox;
      var leftBoxElement = leftBox.renderElement, rightBoxElement = rightBox.renderElement, backButtonElement = backButton.renderElement;
      var properties = me.getTbAnimationProperties(), leftGhost, rightGhost;

      //update the back button, and make sure it is visible
      backButton.setText(this.getBackButtonText());
      backButton.show();

      //animate the backButton, which always has the new title
      var buttonTo = properties.backButton.to;
      if(buttonTo.left)
      {
         leftBox.setLeft(buttonTo.left);
      }
      if(buttonTo.width)
      {
         backButton.setWidth(buttonTo.width);
      }
      //if there is a previoustitle, there should be a buttonGhost. so create it.
      leftGhost = me.createProxy(leftBox);
      rightGhost = me.createProxy(rightBox);

      me.animate(leftBoxElement, properties.leftBox.from, properties.leftBox.to, function()
      {
         if((done |= 0x01) == 0x11)
            me.animating = false;
      });
      me.animate(rightBoxElement, properties.rightBox.from, properties.rightBox.to, function()
      {
         if((done |= 0x10) == 0x11)
            me.animating = false;
      });
      //if there is a buttonGhost, we must animate it too.
      me.animate(leftGhost, properties.leftGhost.from, properties.leftGhost.to, function()
      {
         leftGhost.destroy();
      });
      me.animate(rightGhost, properties.rightGhost.from, properties.rightGhost.to, function()
      {
         rightGhost.destroy();
      });
   },
   /**
    * Pops the back button with no animations
    * @private
    */
   popTbButton : function(title)
   {
      var backButton = this.getBackButton();
      var leftbox = this.leftBox;
      var rightBox = this.rightBox;

      backButton.setText(null);

      if(title)
      {
         backButton.setText(this.getBackButtonText());
      }
      else
      {
         backButton.hide();
      }

      var properties = this.getTbAnimationReverseProperties(), leftTo = properties.leftBox.to, rightTo = properties.rightBox.to, buttonTo = properties.backButton.to;

      if(buttonTo.left)
      {
         backButton.setLeft(buttonTo.left);
      }
      if(buttonTo.width)
      {
         backButton.setWidth(buttonTo.width);
      }

      if(leftTo.left)
      {
         leftBox.setLeft(leftTo.left);
      }
      if(leftTo.width)
      {
         backButton.setWidth(leftTo.width);
      }

      if(rightTo.left)
      {
         rightBox.setLeft(rightTo.left);
      }
      if(rightTo.width)
      {
         rightTo.setWidth(rightTo.width);
      }
   },
   /**
    * Pops the current back button with animations.
    * It will automatically know whether or not it should show the previous backButton or not. And proceed accordingly
    * @private
    */
   popTbAnimated : function(title)
   {
      var me = this;

      var leftBox = me.leftBox, rightBox = me.rightBox, backButton = me.getBackButton();
      var previousTitle = backButton.getText(), leftBoxElement = leftBox.renderElement, rightBoxElement = rightBox.renderElement;
      var properties = me.getTbAnimationReverseProperties(), leftGhost, rightGhost;

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
      var buttonTo = properties.backButton.to;
      if(buttonTo.left)
      {
         leftBox.setLeft(buttonTo.left);
      }
      if(buttonTo.width)
      {
         backButton.setWidth(buttonTo.width);
      }
      //if there is a previoustitle, there should be a buttonGhost. so create it.
      leftGhost = me.createProxy(me.leftBox);
      rightGhost = me.createProxy(me.rightBox);

      me.animate(leftBoxElement, properties.leftBox.from, properties.leftBox.to);
      me.animate(rightBoxElement, properties.rightBox.from, properties.rightBox.to);

      //if there is a buttonGhost, we must animate it too.
      me.animate(leftGhost, properties.leftGhost.from, properties.leftGhost.to, function()
      {
         leftGhost.destroy();

         if(!title)
         {
            backButton.setText(null);
         }
      });
      //if there is a buttonGhost, we must animate it too.
      me.animate(rightGhost, properties.rightGhost.from, properties.rightGhost.to, function()
      {
         rightGhost.destroy();
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
   reset : function()
   {
      this.backButtonStack = [];
      this.lastAnimationProperties =
      {
      };
      this.animating = false;
   }
});
