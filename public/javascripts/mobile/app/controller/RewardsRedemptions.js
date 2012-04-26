Ext.define('Genesis.controller.RewardsRedemptions',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      rewards_path : '/rewards',
      redemption_path : '/redemption'
   },
   xtype : 'rewardsRedemptionsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      prizeCheckMsg : 'Find out if you won a PRIZE!',
      refs :
      {
         backButton : 'viewportview button[text=Close]',
         //
         // Rewards
         //
         rewards :
         {
            selector : 'rewardsview',
            autoCreate : true,
            xtype : 'rewardsview'
         },
         rewardsCart : 'rewardsview list[tag=rewardsCart]',
         rewardsCartTotal : 'rewardsview component[tag=total]',
         rewardsTallyList : 'rewardsview container[tag=rewardTallyList]',
         rewardsContainer : 'rewardsview container[tag=rewards]',
         rewardsList : 'rewardsview container[tag=rewardMainList] list',
         checkoutBtn : 'rewardsview button[tag=cart]',
         rewardsMainBtn : 'rewardsview button[tag=rewardsMain]',
         navigationBarBottom : 'rewardsview tabbar[cls=navigationBarBottom]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'redemptionsview',
            autoCreate : true,
            xtype : 'redemptionsview'
         },
         redemptionsList : 'redemptionsview list[tag=redemptionsList]',
         redemptionsPts : 'redemptionsview component[tag=points]',
         redemptionsPtsEarnPanel : 'redemptionsview dataview[tag=ptsEarnPanel]'
      },
      control :
      {
      }
   },
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstRewardsMsg : 'You need to Check-In first before you are elibigle to Earn Rewards',
   checkinFirstRedemptionsMsg : 'You need to Check-In first before you are elibigle for Redemptions',
   needPointsMsg : function(pointsDiff)
   {
      return 'You need ' + pointsDiff + ' more points ' + Genesis.constants.addCRLF() + 'to be eligible for this item.';
   },
   //orderTitle : 'Rewards List',
   //checkoutTitle : 'Check Out',
   init : function()
   {
      this.initRewards();
      this.initRedemptions();
      console.log("Rewards & Redemptions Init");
   },
   initRewards : function()
   {
      this.control(
      {
         rewards :
         {
            activate : this.onRewardsActivate,
            deactivate : this.onRewardsDeactivate
         },
         rewardsList :
         {
            select : this.onRewardsItemSelect
         },
         checkoutBtn :
         {
            tap : this.onRewardsToggleBtnTap
         },
         rewardsMainBtn :
         {
            tap : this.onRewardsToggleBtnTap
         },
         rewardsContainer :
         {
            activeitemchange : this.onRewardsContainerActivate
         },
         'rewardsview container[tag=rewardTallyList] button[tag=earnPts]' :
         {
            tap : this.onRewardsEarnPtsTap
         },
         'rewardscartitem spinnerfield' :
         {
            spin : this.onRewardCartChangeQty
         },
         'checkinmerchantview button[tag=checkinBtn]' :
         {
            tap : this.onCheckinTap
         }
      });
      //
      // Stores all the rewards from everybody
      //
      Ext.regStore('RewardsStore',
      {
         model : 'Genesis.model.PurchaseReward',
         config :
         {
            autoLoad : false
         }
      });
      //
      // Store the shopping cart for the user session
      //
      Ext.regStore('RewardsCartStore',
      {
         model : 'Genesis.model.PurchaseReward',
         config :
         {
            autoLoad : false,
         },
         proxy :
         {
            type : 'memory'
         }
      });
   },
   initRedemptions : function()
   {
      this.control(
      {
         redemptions :
         {
            activate : this.onRedemptionsActivate,
            deactivate : this.onRedemptionsDeactivate
         },
         redemptionsList :
         {
            select : this.onRedemptionsItemListSelect,
            disclose : this.onRedemptionsItemListDisclose

         }
      });
      Ext.regStore('RedemptionsStore',
      {
         model : 'Genesis.model.CustomerReward',
         autoLoad : false,
         grouper :
         {
            groupFn : function(record)
            {
               return record.get('points') + ' Points';
            }
         },
         sorters : [
         {
            property : 'points',
            direction : 'ASC'
         }],
         listeners :
         {
            scope : this,
            'metachange' : function(store, proxy, eOpts)
            {
               this.onRedeemMetaChange(store, proxy.getReader().metaData);
            }
         }
      });
   },
   getPointsMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Points from this purchase!';
   },
   getVipMsg : function(points)
   {
      return 'You\'ve earned an additional ' + points + ' Points!' + Genesis.constants.addCRLF() + this.getPrizeCheckMsg();
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   showNavBar : function()
   {
      var rcstore = Ext.StoreMgr.get('RewardsCartStore');
      var viewport = this.getViewPortCntlr();
      var venue = viewport.getVenue();
      var cvenue = viewport.getCheckinInfo().venue;

      var showBar = (cvenue && (cvenue.getId() == venue.getId())) && (rcstore.getCount() > 0);
      this.getNavigationBarBottom()[(showBar) ? 'show':'hide' ]();
   },
   hideNavBar : function()
   {
      this.getNavigationBarBottom()['hide' ]();
   },
   updateRewardsCartTotal : function(cartItems)
   {
      var total = this.getRewardsCartTotal(), totalPts = 0;
      for(var i = 0; i < cartItems.length; i++)
      {
         totalPts += cartItems[i].get('qty') * cartItems[i].get('points');
      }
      if(total)
      {
         total.setData(
         {
            points : totalPts
         });
      }

      //
      // Update Cart Badge
      //
      var checkoutBtn = this.getCheckoutBtn();
      //
      // Don't update the badge if it's not rendered yet.
      //
      if(checkoutBtn)
      {
         Ext.Anim.run(checkoutBtn.badgeElement, 'pop',
         {
            out : false,
            autoClear : false
         });
         this.getCheckoutBtn().setBadgeText((cartItems.length > 0) ? totalPts + 'Pts' : null);
      }
      return totalPts;
   },
   clearRewardsCart : function()
   {
      //
      // Clears the RewardsCart
      //
      console.log("RewardCart Cleared.");
      var rcstore = Ext.StoreMgr.get('RewardsCartStore');
      var items = rcstore.getRange();
      if(rcstore)
      {
         rcstore.removeAll();
      }
      for(var i = 0; i < items.length; i++)
      {
         items[i].set('qty', 0);
      }
      // Automatically update totals
      this.updateRewardsCartTotal([]);
   },
   prizeCheck : function(pstore)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Prizes');
      var vport = me.getViewport();

      app.dispatch(
      {
         action : 'onPrizeCheck',
         args : pstore.loadCallback.concat([
         function(success)
         {
            if(success)
            {
               //
               // Clear the Shopping Cart
               //
               me.clearRewardsCart();
            }
            else
            {
               //
               // Go back to Main Reward Screen
               //
               var container = me.getRewardsContainer();
               container.setActiveItem(0);
            }
         }]),
         controller : controller,
         scope : controller
      });
   },
   earnPts : function()
   {
      var me = this;
      var pstore = Ext.StoreMgr.get('MerchantPrizeStore')
      var rcstore = Ext.StoreMgr.get('RewardsCartStore')
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();
      var reader = CustomerReward.getProxy().getReader();

      me.getGeoLocation(function(position)
      {
         var rewardIds = [];
         Ext.Array.forEach(rcstore.getRange(), function(item, index, all)
         {
            var rewardId = item.get(PurchaseReward.getIdProperty());
            //
            // Pass as many times as the customer ordered the item
            //
            rewardIds.push(
            {
               quantity : item.get('qty'),
               id : rewardId
            });
         }, me);
         //
         // Triggers PrizeCheck and MetaDataChange
         // - subject CustomerReward also needs to be reset to ensure property processing of objects
         //
         EarnPrize['setEarnPrizeURL']();
         reader.setRootProperty('');
         reader.buildExtractors();
         pstore.loadPage(1,
         {
            jsonData :
            {
            },
            params :
            {
               venue_id : venueId,
               merchant_id : merchantId,
               reward_ids : JSON.stringify(rewardIds),
               latitude : position.coords.latitude,
               longitude : position.coords.longitude
            },
            callback : function(records, operation)
            {
               reader.setRootProperty('data');
               reader.buildExtractors();
               if(!operation.wasSuccessful())
               {
                  //
                  // Go back to Main Reward Screen
                  //
                  var container = me.getRewardsContainer();
                  container.setActiveItem(0);

                  me.clearRewardsCart();
               }
            }
         });
      });
   },
   onRewardsActivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
      var container = this.getRewardsContainer();
      if(container)
      {
         var activeItem = container.getActiveItem();
         var animation = container.getLayout().getAnimation();
         animation.disable();
         switch (activeItem.config.tag)
         {
            case 'rewardTallyList' :
            case 'prizeCheck' :
            {
               this.onRewardsToggleBtnTap(null, null, null);
               break;
            }
            default :
               break;
         }
         animation.enable();
      }

      this.showNavBar();
   },
   onRewardsDeactivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
   },
   onRewardsToggleBtnTap : function(b, e, eOpts)
   {
      var checkoutBtn = this.getCheckoutBtn();
      var container = this.getRewardsContainer();
      var activeItem = container.getActiveItem();

      checkoutBtn.updateActive(false);
      switch (activeItem.config.tag)
      {
         case 'rewardMainList' :
         {
            container.setActiveItem(1);
            break;
         }
         case 'prizeCheck' :
         case 'rewardTallyList' :
         {
            container.setActiveItem(0);
            break;
         }
      }
      return true;
   },
   onRewardsContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var checkoutBtn = me.getCheckoutBtn();
      var rewardsMainBtn = me.getRewardsMainBtn();
      var container = me.getRewardsContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'rewardTallyList' :
         {
            me.getBackButton().hide();
            checkoutBtn.hide();
            rewardsMainBtn.show();
            animation.setReverse(false);
            me.showNavBar();
            break;
         }
         case 'rewardMainList' :
         {
            me.getBackButton().show();
            checkoutBtn.show();
            rewardsMainBtn.hide();
            animation.setReverse(true);
            me.showNavBar();
            break;
         }
         case 'prizeCheck' :
         {
            me.getBackButton().hide();
            me.hideNavBar();
            break;
         }
      }
   },
   onRewardCartChangeQty : function(spinner, qty, direction, eOpts)
   {
      var item = spinner.up('rewardscartitem');
      var list = this.getRewardsList();
      var cart = this.getRewardsCart();
      var record = list.getStore().getById(item.getRecord().getId());

      if(qty == 0)
      {
         cart.getStore().remove(record);
         //
         // Bug fix for store when we call "indexOf" utilizing indices
         //
         cart.getStore().data.updateIndices();
      }

      // set property triggers events, do them before we associate the record to a store
      record.set('qty', qty);
      if((qty == spinner.getIncrement()) && (direction == 'up'))
      {
         cart.getStore().add(record);
      }

      // Automatically update totals
      this.updateRewardsCartTotal(cart.getStore().getRange());
      //
      // Show the Bottom Toolbar
      //
      this.showNavBar();

      return true;
   },
   onRewardMetaChange : function(pstore, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = viewport.getCustomer().getId();
      var message;

      var vipPopup = function()
      {
         message = me.getVipMsg(metaData['vip_challenge'].points);
         Ext.device.Notification.show(
         {
            title : 'VIP Challenge Alert!',
            message : message,
            callback : function()
            {
               Ext.defer(function()
               {
                  me.prizeCheck(pstore);
               }, 2000);
            }
         });
      }
      //
      // Update points from the purchase or redemption
      //
      cstore.getById(customerId).set('points', metaData['account_points']);

      if(metaData['points'])
      {
         message = me.getPointsMsg(metaData['points']);
         if(!metaData['vip_challenge'])
         {
            message += Genesis.constants.addCRLF() + me.getPrizeCheckMsg();
         }
         Ext.device.Notification.show(
         {
            title : 'Earn Points',
            message : message,
            callback : function()
            {
               if((metaData['vip_challenge']))
               {
                  vipPopup();
               }
               else
               {
                  Ext.defer(function()
                  {
                     me.prizeCheck(pstore);
                  }, 2000);
               }
            }
         });
      }
      else
      if(metaData['vip_challenge'])
      {
         vipPopup();
      }
   },
   onRewardsEarnPtsTap : function(b, e, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      var anim = container.getLayout().getAnimation();

      me.scanQRCode(
      {
         callback : function(qrcode)
         {
            if(qrcode)
            {
               anim.disable();
               container.setActiveItem(2);
               anim.enable();

               me.earnPts();
            }
            else
            {
               console.debug(me.missingEarnPtsCodeMsg);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingEarnPtsCodeMsg
               });
            }
         }
      });
   },
   onRewardsItemSelect : function(list, record, eOpts)
   {
      if(!this.exploreMode)
      {
         /*
          var cartList = this.getRewardsCart();
          //Add to Shopping Cart
          var store = cartList.getStore();
          //RewardsCartStore
          var index = store.indexOf(record);
          var items;
          if(index < 0)
          {
          record.set('qty', 1);
          store.add(record);
          }
          else
          {
          record.set('qty', record.get('qty') + 1);
          //cartList.getViewItems()[index].updateRecord(record);
          }
          */
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Warning',
            message : me.checkinFirstRewardsMsg
         });
      }
      // Deselect item
      list.deselect([record]);
      return false;
   },
   onCheckinTap : function(b, e, eOpts)
   {
      this.clearRewardsCart();
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onRedemptionsActivate : function()
   {
   },
   onRedemptionsDeactivate : function()
   {
   },
   onRedemptionsItemListSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onRedemptionsItemListDisclose(d, model);
      return false;
   },
   onRedemptionsItemListDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      if(!me.exploreMode)
      {
         var totalPts = viewport.getCustomer().get('points');
         var points = record.get('points');
         if(points > totalPts)
         {
            Ext.device.Notification.show(
            {
               title : 'Oops!',
               message : me.needPointsMsg(points - totalPts)
            });
         }
         else
         {
            var app = me.getApplication();
            var controller = app.getController('Prizes');
            app.dispatch(
            {
               action : 'onRedeemRewards',
               args : [Ext.create('Genesis.model.EarnPrize',
               {
                  'id' : 1,
                  'expiry_date' : null,
                  'reward' : record,
                  'merchant' : viewport.getCheckinInfo().venue.getMerchant()
               })],
               controller : controller,
               scope : controller
            });
         }
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Warning',
            message : me.checkinFirstRedemptionsMsg
         });
      }

      return true;
   },
   onRedeemMetaChange : function(store, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = viewport.getCustomer().getId();
      //
      // Update points from the purchase or redemption
      //
      cstore.getById(customerId).set('points', metaData['account_points']);
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
      var page, store, rstore, list, scroll;

      var me = this;
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();
      var successCallback = function(records, operation)
      {
         //
         // Scroll to the Top of the Screen
         //
         scroll.getScroller().scrollTo(0, 0);

         me.exploreMode = cvenue && (cvenue.getId() != venue.getId());
         switch (subFeature)
         {
            case 'redemptions':
            {
               //
               // Update Customer info
               //
               me.getRedemptionsPtsEarnPanel().getStore().setData(viewport.getCustomer());
               break
            }
            default :
               for(var i = 0; i < records.length; i++)
               {
                  records[i].data['venue_id'] = venueId;
               }
               break;
         }

         //
         // Show Redemptions for this venue only
         //
         store.filter([
         {
            filterFn : function(item)
            {
               return item.get("venue_id") == venueId;
            }
         }]);

         rstore.setData(store.getRange());

         me.pushView(page);
      }
      switch (subFeature)
      {
         case 'rewards':
         {
            page = me.getRewards();
            list = me.getRewardsList();
            store = Ext.StoreMgr.get('RewardsStore');
            rstore = list.getStore();
            scroll = list.getScrollable();
            PurchaseReward['setGetRewardsURL']();
            store.clearFilter();
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.loadingMsg
            });
            store.load(
            {
               jsonData :
               {
               },
               params :
               {
                  venue_id : venueId,
                  merchant_id : merchantId
               },
               scope : me,
               callback : function(records, operation)
               {
                  Ext.Viewport.setMasked(false);
                  if(operation.wasSuccessful())
                  {
                     successCallback(records, operation);
                  }
               }
            });
            break;
         }
         case 'redemptions':
         {
            page = me.getRedemptions();
            list = me.getRedemptionsList();
            store = Ext.StoreMgr.get('RedemptionsStore');
            rstore = list.getStore();
            scroll = page.getScrollable();
            //CustomerReward['setGetRedemptionsURL']();
            store.clearFilter();
            successCallback();
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      // VenueId can be found after the User checks into a venue
      return ((this.getViewPortCntlr().getVenue()) ? true : "You need to Explore or Check-in to a Venue first");
   }
});
