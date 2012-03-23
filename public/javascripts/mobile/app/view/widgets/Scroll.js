/**
 * @private
 */
Ext.define('Genesis.fx.animation.Scroll',
{

   extend : 'Ext.fx.animation.Abstract',

   alternateClassName : 'Ext.fx.animation.ScrollIn',

   alias : ['animation.scroll', 'animation.scrollIn'],

   config :
   {
      /**
       * @cfg {String} direction The direction of which the slide animates
       * @accessor
       */
      direction : 'left',

      /**
       * @cfg {Boolean} out True if you want to make this animation slide out, instead of slide in.
       * @accessor
       */
      out : false,

      /**
       * @cfg {Number} offset The offset that the animation should go offscreen before entering (or when exiting)
       * @accessor
       */
      offset : 0,

      /**
       * @cfg
       * @inheritdoc
       */
      easing : 'auto',

      containerBox : 'auto',

      elementBox : 'auto',

      isElementBoxFit : true
   },

   reverseDirectionMap :
   {
      up : 'down',
      down : 'up',
      left : 'right',
      right : 'left'
   },

   applyEasing : function(easing)
   {
      if(easing === 'auto')
      {
         return 'ease-' + ((this.getOut()) ? 'in' : 'out');
      }

      return easing;
   },
   getData : function()
   {
      var element = this.getElement();
      var from = this.getFrom(), to = this.getTo(), out = this.getOut(), offset = this.getOffset(), direction = this.getDirection(), reverse = this.getReverse(), translateX = 0, translateY = 0, fromX, fromY, toX, toY;

      if(reverse)
      {
         direction = this.reverseDirectionMap[direction];
      }

      switch (direction)
      {
         case this.DIRECTION_UP:
         case this.DIRECTION_DOWN:
            translateY = element.getHeight();
            break;

         case this.DIRECTION_RIGHT:
         case this.DIRECTION_LEFT:
            translateX = element.getWidth();
            break;
      }
      //
      //
      //
      fromX = (out) ? 0 : translateX;
      fromY = (out) ? 0 : translateY;
      from.set('overflow', 'hidden');
      switch (direction)
      {
         case this.DIRECTION_UP:
         case this.DIRECTION_DOWN:
            from.set('height', fromY + 'px');
            break;

         case this.DIRECTION_RIGHT:
         case this.DIRECTION_LEFT:
            from.set('width', fromX + 'px');
            break;
      }
      toX = (out) ? translateX : 0;
      toY = (out) ? translateY : 0;
      to.set('overflow', 'hidden');
      switch (direction)
      {
         case this.DIRECTION_UP:
         case this.DIRECTION_DOWN:
            to.set('height', toY + 'px');
            break;

         case this.DIRECTION_RIGHT:
         case this.DIRECTION_LEFT:
            to.set('width', toX + 'px');
            break;
      }

      return this.callParent(arguments);
   }
});
