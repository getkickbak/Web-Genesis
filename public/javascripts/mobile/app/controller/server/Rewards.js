Ext.define('Genesis.controller.server.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   xtype : 'serverRewardsCntlr',
   config :
   {
      models : ['PurchaseReward', 'CustomerReward'],
      routes :
      {
         'earnPts' : 'earnPtsPage'
      },
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
         //qrcode : 'serverrewardsview component[tag=qrcode]',
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
         }/*,
          'serverrewardsview container[tag=qrcodeContainer] button[tag=done]' :
          {
          tap : 'onDoneTap'
          }
          */
      },
      listeners :
      {
         'rewarditem' : 'onRewardItem'
      }
   },
   maxValue : 1000.00,
   clientNames : null,
   rewardSuccessfulMsg : 'Transaction Complete',
   rewardFailedMsg : 'Transaction Failed',
   invalidPriceMsg : 'Please enter a valid price (eg. 5.00), upto $1000',
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Rewards Init");
      //
      // Preload Pages
      //
      this.getRewards();
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
      var me = this;
      var container = me.getRewardsContainer();
      if (container)
      {
         container.setActiveItem(0);
      }
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      var priceField = me.getPrice();
      if (priceField)
      {
         priceField.setValue(null);
      }
      if (Genesis.fn.isNative())
      {
         window.plugins.proximityID.stop();
      }
      me.getViewPortCntlr().setActiveController(null);
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
   },
   onRewardItem : function()
   {
      var me = this, task = null, identifiers = null, viewport = me.getViewPortCntlr();

      me.rewardItemFn = function(params)
      {
         params = Ext.merge(params,
         {
            'venue_id' : Genesis.fn.getPrivKey('venueId'),
            data :
            {
               "amount" : price,
               "type" : 'earn_points',
               'expiry_ts' : new Date().addHours(3).getTime()
            }
         });
         params['data'] = me.self.encryptFromParams(params['data']);

         //
         // Stop receiving data from NFC
         //
         viewport.setActiveController(null);
         if (task)
         {
            clearInterval(task);
         }
         //
         // Stop receiving ProximityID
         //
         if (Genesis.fn.isNative())
         {
            window.plugins.proximityID.stop();
         }
         //
         // Updating Server ...
         //
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         console.log("Updating Server with EarnPoints information ...");
         PurchaseReward['setMerchantEarnPointsURL']();
         PurchaseReward.load(1,
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            params : params,
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Rewards',
                     message : me.rewardSuccessfulMsg,
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
               else
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Rewards',
                     message : me.rewardFailedMsg,
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
            }
         });
      };

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : (Genesis.fn.isNative()) ? me.lookingForMobileDeviceMsg : me.genQRCodeMsg,
         listeners :
         {
            tap : function()
            {
               viewport.setActiveController(null);
               if (task)
               {
                  clearInterval(task);
               }
               //
               // Stop receiving ProximityID
               //
               if (Genesis.fn.isNative())
               {
                  window.plugins.proximityID.stop();
               }
               Ext.Viewport.setMasked(null);
               me.onDoneTap();
            }
         }
      });
      if (Genesis.fn.isNative())
      {
         task = me.getLocalID(function(ids)
         {
            identifiers = ids;
            task = null;
            me.rewardItemFn(
            {
               data :
               {
               },
               'frequency' : Ext.encode(identifiers['localID'])
            });
         }, function()
         {
            viewport.setActiveController(null);
            Ext.Viewport.setMasked(null);
            me.onDoneTap();
         });
         viewport.setActiveController(me);
      }
      else
      {
         me.rewardItemFn(
         {
         });
      }
   },
   onShowQrCodeTap : function(b, e, eOpts, eInfo)
   {
      var me = this, task = null, identifiers = null;
      var viewport = me.getViewPortCntlr();
      var price = me.getPrice().getValue();
      var precision = this.getPricePrecision(price);
      if (precision < 2)
      {
         Ext.device.Notification.show(
         {
            title : 'Validation Error',
            message : me.invalidPriceMsg
         });
         return;
      }

      var container = me.getRewardsContainer();
      /*
       Ext.defer(function()
       {
       var qrcodeMetaData = me.self.genQRCodeFromParams(
       {
       "amount" : price,
       "type" : 'earn_points'
       }, 'reward', false);
       me.getQrcode().setStyle(
       {
       'background-image' : 'url(' + qrcodeMetaData[0] + ')',
       'background-size' : Genesis.fn.addUnit(qrcodeMetaData[1] * 1.25) + ' ' + Genesis.fn.addUnit(qrcodeMetaData[2] * 1.25)
       });
       }, 1, me);
       console.debug("Encrypting QRCode with Price:$" + price);
       */
      me.getTitle().setData(
      {
         price : '$' + price
      });
      container.setActiveItem(1);

      me.fireEvent('rewarditem');
   },
   onCalcBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var value = b.getText();
      var priceField = me.getPrice();
      var priceFieldLength = priceField.getValue().length;
      var price = Number(priceField.getValue() || 0);
      switch (value)
      {
         case 'AC' :
         {
            price = null;
            break;
         }
         default :
            if (priceFieldLength < 2)
            {
               if ((price == 0) && (priceFieldLength > 0))
               {
                  price += value;
               }
               else
               {
                  price = (10 * price) + Number(value);
               }
            }
            else
            {
               if (priceFieldLength == 2)
               {
                  price = (price + value) / 100;
               }
               else
               {
                  price = (10 * price) + (Number(value) / 100);
               }
               price = price.toFixed(2);
            }
            break;
      }
      // Max value
      if (price <= me.maxValue)
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
   onNfc : function(nfcResult)
   {
      var me = this;
      me.rewardItemFn(
      {
         data :
         {
            'tag_id' : (nfcResult) ? nfcResult['tagID'] : null
         }
      });
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   earnPtsPage : function()
   {
      var me = this;
      var page = me.getRewards();
      me.setAnimationMode(me.self.animationMode['cover']);
      me.pushView(page);
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
      var me = this;
      switch (subFeature)
      {
         case 'rewards':
         {
            me.redirectTo('earnPts');
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

