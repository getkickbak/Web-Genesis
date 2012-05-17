Ext.define('Genesis.controller.server.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      serverRewards_path : '/serverRewards'
   },
   xtype : 'serverRewardsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      refs :
      {
         backButton : 'viewportview button[text=Close]',
         //
         // Rewards
         //
         rewards :
         {
            selector : 'serverrewardsview',
            autoCreate : true,
            xtype : 'serverrewardsview'
         },
         rewardsContainer : 'serverrewardsview container[tag=rewards]',
         price : 'serverrewardsview textfield',
         qrcode : 'serverrewardsview component[tag=qrcode]',
         title : 'serverrewardsview component[tag=title]',
         infoBtn : 'viewportview button[tag=info]'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         rewardsContainer :
         {
            activeitemchange : 'onContainerActivate'
         },
         'serverrewardsview container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'serverrewardsview container[tag=rewardsMainCalculator] button[tag=showQrCode]' :
         {
            tap : 'onShowQrCodeTap'
         },
         'serverrewardsview container[tag=qrcodeContainer] button[tag=done]' :
         {
            tap : 'onDoneTap'
         }
      }
   },
   maxValue : 1000.00,
   invalidPriceMsg : 'Please enter a valid price (eg. 5.00), upto $1000',
   init : function()
   {
      console.log("Server Rewards Init");
   },
   getPricePrecision : function(num)
   {
      var precision = num.split('.');
      return ((precision.length > 1) ? precision[1].length : 0);
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   onActivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
      var container = this.getRewardsContainer();
      if(container)
      {
         var activeItem = container.getActiveItem();
         var animation = container.getLayout().getAnimation();
         animation.disable();
         switch (activeItem.config.tag)
         {
            case 'qrcodeContainer' :
            {
               this.onToggleBtnTap(null, null, null, null);
               break;
            }
            default :
               break;
         }
         animation.enable();
      }
   },
   onDeactivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
      var me = this;
      var priceField = me.getPrice();
      priceField.setValue(null);
      me.enablePrecision = false;
   },
   onToggleBtnTap : function(b, e, eOpts, eInfo)
   {
      var container = this.getRewardsContainer();
      var activeItem = container.getActiveItem();

      switch (activeItem.config.tag)
      {
         case 'rewardsMainCalculator' :
         {
            container.setActiveItem(1);
            break;
         }
         case 'qrcodeContainer' :
         {
            container.setActiveItem(0);
            break;
         }
      }
      return true;
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'rewardsMainCalculator' :
         {
            var priceField = me.getPrice();
            priceField.setValue(null);
            me.enablePrecision = false;
            animation.setReverse(true);
            break;
         }
         case 'qrcodeContainer' :
         {
            animation.setReverse(false);
            break;
         }
      }
   },
   onShowQrCodeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var container = me.getRewardsContainer();
      //var anim = container.getLayout().getAnimation();

      var price = me.getPrice().getValue();
      var precision = this.getPricePrecision(price);
      if(precision < 2)
      {
         Ext.device.Notification.show(
         {
            title : 'Validation Error',
            message : me.invalidPriceMsg
         });
         return;
      }
      console.debug("Encrypting QRCode with Price:$" + price);
      me.getQrcode().setStyle(
      {
         'background-image' : 'url(' + Genesis.controller.ControllerBase.genQRCodeFromParams(
         {
            "amount" : price,
            "type" : 'earn_points'
         }) + ')'
      });
      me.getTitle().setData(
      {
         price : '$' + price
      });
      //anim.disable();
      container.setActiveItem(1);
      //anim.enable();

   },
   onCalcBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      var value = b.getText();
      var priceField = me.getPrice();
      var price = Number(priceField.getValue() || 0);
      var precision = me.getPricePrecision(priceField.getValue());
      switch (value)
      {
         case '.' :
         {
            me.enablePrecision = true;
            if(precision == 0)
            {
               var num = price.toString().split('.');
               price = num[0] + '.';
            }
            break;
         }
         case 'AC' :
         {
            me.enablePrecision = false;
            price = null;
            break;
         }
         default :
            if(me.enablePrecision)
            {
               if(precision < 2)
               {
                  price += (Number(value) / Math.pow(10, precision + 1));
                  price = price.toFixed(precision + 1);
               }
            }
            else
            {
               price = (10 * price) + Number(value);
            }
            break;
      }
      // Max value
      if(price <= me.maxValue)
      {
         priceField.setValue(price);
      }
   },
   onDoneTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var container = me.getRewardsContainer();
      container.setActiveItem(0);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getRewards();
   },
   openPage : function(subFeature)
   {
      var page;
      var me = this;
      var viewport = me.getViewPortCntlr();
      var successCallback = function()
      {
         me.pushView(page);
      }
      switch (subFeature)
      {
         case 'rewards':
         {
            page = me.getRewards();
            successCallback();
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
