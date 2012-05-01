Ext.define('Genesis.controller.RewardsServer',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      rewardsServer_path : '/rewardsServer'
   },
   xtype : 'rewardsServerCntlr',
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
            selector : 'rewardsserverview',
            autoCreate : true,
            xtype : 'rewardsserverview'
         },
         rewardsContainer : 'rewardsserverview container[tag=rewards]',
         price : 'rewardsserverview textfield',
         qrcode : 'rewardsserverview component[tag=qrcode]',
         infoBtn : 'viewportview button[tag=info]'
      },
      control :
      {
         rewardsServer :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         rewardsContainer :
         {
            activeitemchange : 'onContainerActivate'
         },
         'rewardsserverview container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'rewardsserverview container[tag=rewardsMainCalculator] button[tag=showQrCode]' :
         {
            tap : 'onShowQrCodeTap'
         },
         'rewardsserverview container[tag=qrcodeContainer] button[tag=done]' :
         {
            tap : 'onDoneTap'
         }
      }
   },
   init : function()
   {
      console.log("Rewards Calculator Server Init");
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
               this.onToggleBtnTap(null, null, null);
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
   },
   onToggleBtnTap : function(b, e, eOpts)
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
            //me.getBackButton().show();
            animation.setReverse(true);
            break;
         }
         case 'qrcodeContainer' :
         {
            animation.setReverse(false);
            //me.getBackButton().hide();
            break;
         }
      }
   },
   onShowQrCodeTap : function(b, e, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      //var anim = container.getLayout().getAnimation();

      //
      // Show QRCode
      //
      var privkey = CryptoJS.enc.Hex.parse(me.getPrivKey());
      var iv = CryptoJS.enc.Hex.parse(Math.random().toFixed(20).toString().split('.')[1]);
      var expiryDate = new Date().addDays(1).format('Y-M-d');
      var price = me.getPrice().getValue();

      var encrypted = iv + '$' + CryptoJS.AES.encrypt(Ext.encode(
      {
         ":expirydate" : expiryDate,
         ":amount" : price
      }), privkey,
      {
         iv : iv
      });
      console.log("Encripted Code :\n" + encrypted);
      console.log("Encripted Code Length: " + encrypted.length);

      var qrcode = Genesis.constants.showQRCode(encrypted);
      me.getQrcode().setStyle(
      {
         'background-image' : 'url(' + qrcode + ')'
      });
      //anim.disable();
      container.setActiveItem(1);
      //anim.enable();

   },
   onCalcBtnTap : function(b, e, eOpts)
   {
      var value = b.getText();
      var priceField = this.getPrice();
      var price = Number(priceField.getValue() || 0);
      var getPrecision = function(num)
      {
         var precision = num.split('.');
         return ((precision.length > 1) ? precision[1].length : 0);
      }
      var precision = getPrecision(priceField.getValue());
      switch (value)
      {
         case '.' :
         {
            this.enablePrecision = true;
            if(precision == 0)
            {
               var num = price.toString().split('.');
               price = num[0] + '.';
            }
            break;
         }
         case 'AC' :
         {
            this.enablePrecision = false;
            price = null;
            break;
         }
         default :
            if(this.enablePrecision)
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
      priceField.setValue(price);
   },
   onDoneTap : function(b, e, eOpts)
   {
      var me = this;
      var priceField = me.getPrice();
      var container = me.getRewardsContainer();

      priceField.setValue(null);
      me.enablePrecision = false;
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
