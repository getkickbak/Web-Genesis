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
            this.pushBackButtonAnimated(this.getBackButtonText());
         }
         else
         {
            this.getBackButton().hide();
         }
         this.pushTitleAnimated(this.getTitleText());
      }
      else
      {
         if(this.backButtonStack.length > 1)
         {
            this.pushBackButton(this.getBackButtonText());
         }
         else
         {
            this.getBackButton().hide();
         }
         this.pushTitle(this.getTitleText());
      }
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
