Ext.define('Genesis.view.widgets.Animation',
{
   extend : 'Ext.mixin.Mixin',
   config :
   {
      animationMode : 'fold'
   },
   lastAnimationProperties :
   {
   },
   constructor : function(config)
   {
      this.initConfig(config);
   },
   /**
    * Calculates and returns the position values needed for the back button when you are pushing a title.
    * @private
    */
   getAnimateProperties : function()
   {
      var me = this, element = me.renderElement;
      switch (this.getAnimationMode())
      {
         case 'fold' :
         {
            return (
               {
                  element :
                  {
                     from :
                     {
                        opacity : 0
                     },
                     to :
                     {
                        //height : 0,
                        opacity : 1
                     }
                  }
               });
         }
         case 'slide' :
         {
            return (
               {
                  element :
                  {
                     from :
                     {
                        left : element.getX() + element.getWidth(),
                        top : element.getY() + element.getHeight(),
                        width : element.getWidth(),
                        opacity : 0
                     },
                     to :
                     {
                        left : element.getX(),
                        top : element.getY(),
                        width : element.getWidth(),
                        opacity : 1
                     }
                  },
                  ghost :
                  {
                     from : 0,
                     to :
                     {
                        left : element.getX() - element.getWidth(),
                        top : element.getY() - element.getHeight(),
                        opacity : 0
                     }
                  }
               });
         }
         case 'fade' :
         {
            return (
               {
                  element :
                  {
                     from :
                     {
                        opacity : 0
                     },
                     to :
                     {
                        opacity : 1
                     }
                  },
                  ghost :
                  {
                     from : 0,
                     to :
                     {
                        opacity : 0
                     }
                  }
               });
         }
      }
   },
   /**
    * Helper method used to animate elements.
    * You pass it an element, objects for the from and to positions an option onEnd callback called when the animation is over.
    * Normally this method is passed configurations returned from the methods such as {@link #getTitleAnimationReverseProperties}
    * etc.
    * It is called from the {@link #pushBackButtonAnimated}, {@link #pushTitleAnimated}, {@link #popBackButtonAnimated} and {@link
    * #popTitleAnimated}
    * methods.
    *
    * If the current device is Android, it will use top/left to animate.
    * If it is anything else, it will use transform.
    * @private
    */
   animate : function(component, element, type, from, to, duration, onEnd)
   {
      var me = this, config =
      {
         element : element,
         easing : 'ease-out',
         duration : duration,
         //replacePrevious : true,
         //preserveEndState : true
      }, configFn, configFn2, animation;

      this.lastAnimationProperties[element.id] =
      {
         to : to,
         onEnd : onEnd
      };

      //reset the left of the element
      element.setLeft(0);

      if(Ext.os.is.Android)
      {
         configFn = function(prop, name)
         {
            config[name] =
            {
               opacity : prop.opacity,
               overflow : 'hidden'
            };
            if(Ext.isDefined(prop.left))
            {
               config[name].left = prop.left;
            }
            if(Ext.isDefined(prop.top))
            {
               config[name].top = prop.top;
            }
            if(Ext.isDefined(prop.width))
            {
               config[name].width = prop.width;
            }
            if(Ext.isDefined(prop.height))
            {
               config[name].height = prop.height;
            }
         }
         if(from)
         {
            configFn(from, "from");
         }
         if(to)
         {
            configFn(to, "to");
         }
      }
      else
      {
         configFn2 = function(prop, name)
         {
            config[name] =
            {
               opacity : prop.opacity,
               overflow : 'hidden'
            };
            if(Ext.isDefined(prop.left) || Ext.isDefined(prop.top))
            {
               config[name].transform =
               {
               };
               if(Ext.isDefined(prop.left))
               {
                  config[name].transform.translateX = prop.left;
               }
               if(Ext.isDefined(prop.top))
               {
                  config[name].transform.translateY = prop.top;
               }
            }
            if(Ext.isDefined(prop.width))
            {
               config[name].width = prop.width;
            }
            if(Ext.isDefined(prop.height))
            {
               config[name].height = prop.height;
            }
         }
         if(from)
         {
            configFn2(from, "from");
         }
         if(to)
         {
            configFn2(to, "to");
         }
      }
      fn = function()
      {
         if(onEnd)
         {
            onEnd.call(me);
         }
         if(component && Ext.isNumber(to.width))
         {
            component.setWidth(to.width);
         }
         me.lastAnimationProperties =
         {
         };
      };
      animation = new Ext.fx.Animation(config);
      animation.on('animationend', fn, this);

      Ext.Animator.run(animation);
   },
   endAnimation : function()
   {
      var lastAnimationProperties = this.lastAnimationProperties, animation, el, key;

      if(lastAnimationProperties)
      {
         for(animation in lastAnimationProperties)
         {
            el = Ext.get(animation);

            for(key in lastAnimationProperties[animation].to)
            {
               el.setStyle(key, lastAnimationProperties[animation][key]);
            }

            if(lastAnimationProperties[animation].onEnd)
            {
               lastAnimationProperties[animation].onEnd.call(this);
            }
         }
      }
   }
});
