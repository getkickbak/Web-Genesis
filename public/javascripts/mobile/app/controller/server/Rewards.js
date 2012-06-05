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
      this.callParent(arguments);
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
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      /*
       var container = this.getRewardsContainer();s
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
       */
      activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //var priceField = me.getPrice();
      //priceField.setValue(null);
      me.enablePrecision = false;
   },
   /*
    onToggleBtnTap : function(b, e, eOpts, eInfo)
    {
    var container = this.getRewardsContainer();
    var activeItem = container.getActiveItem();

    switch (activeItem.config.tag)
    {
    case 'rewardsMainCalculator' :
    {
    //container.setActiveItem(1);
    break;
    }
    case 'qrcodeContainer' :
    {
    //container.setActiveItem(0);
    break;
    }
    }
    return num;
    },
    */
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
      console.debug("Rewards ContainerActivate Called.");
      Ext.Viewport.setMasked(false);
   },
   onShowQrCodeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var container = me.getRewardsContainer();

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
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.genQRCodeMsg
      });
      // Needed delay to show the LoadingMask
      Ext.defer(function()
      {
         //var anim = container.getLayout().getAnimation();
         console.debug("Encrypting QRCode with Price:$" + price);
         var qrcodeMetaData = Genesis.controller.ControllerBase.genQRCodeFromParams(
         {
            "amount" : price,
            "type" : 'earn_points'
         });
         me.getQrcode().setStyle(
         {
            'background-image' : 'url(' + qrcodeMetaData[0] + ')',
            'background-size' : Genesis.fn.addUnit(qrcodeMetaData[1]) + ' ' + Genesis.fn.addUnit(qrcodeMetaData[2])
         });
         me.getTitle().setData(
         {
            price : '$' + price
         });
         //anim.disable();
         container.setActiveItem(1);
         //anim.enable();
      }, 1, me);
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
      var page = this.getRewards();
      return page;
   },
   openPage : function(subFeature)
   {
      var page;
      var me = this;
      var viewport = me.getViewPortCntlr();
      switch (subFeature)
      {
         case 'rewards':
         {
            page = me.getRewards();
            me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
            me.pushView(page);
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
