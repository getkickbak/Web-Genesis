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
         doneBtn : 'viewportview button[tag=done]',
         editBtn : 'viewportview button[tag=edit]',
         //
         // Rewards
         //
         rewards :
         {
            selector : 'rewardsview',
            autoCreate : true,
            xtype : 'rewardsview'
         },
         rewardsCart : 'rewardsview dataview[tag=rewardsCart]',
         rewardsCartTotal : 'rewardsview component[tag=total]',
         rewardsTallyList : 'rewardsview container[tag=rewardTallyList]',
         rewardsContainer : 'rewardsview container[tag=rewards]',
         rewardsList : 'rewardsview container[tag=rewardMainList] list',
         earnPtsBtn : 'rewardsview button[tag=cart]',
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
         editBtn :
         {
            tap : this.onRewardsCartEditTap
         },
         doneBtn :
         {
            tap : this.onRewardsCartDoneTap
         },
         rewards :
         {
            activate : this.onRewardsActivate,
            deactivate : this.onRewardsDeactivate
         },
         'rewardsview list' :
         {
            select : this.onRewardsItemSelect
         },
         earnPtsBtn :
         {
            tap : this.onRewardsShopCartTap
         },
         rewardsContainer :
         {
            activeitemchange : this.onRewardsContainerActivate
         },
         'rewardsview dataview[tag=rewardsCart] rewardscartitem button[iconCls=delete_black2]' :
         {
            tap : this.onRewardsCartItemDeleteTap
         },
         'rewardsview dataview[tag=rewardsCart] rewardscartitem selectfield' :
         {
            change : this.onRewardsCartItemSelectChange
         },
         'rewardsview container[tag=rewardTallyList] button[tag=earnPts]' :
         {
            tap : this.onRewardsEarnPtsTap
         },
         'checkinmerchantview button[tag=checkinBtn]' :
         {
            tap : this.onCheckInTap
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
      return 'You\'ve earned an additional' + points + ' Points!' + ((!Genesis.constants.isNative()) ? '<br/>' : '\n') + this.getPrizeCheckMsg();
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
      var earnPtsBtn = this.getEarnPtsBtn();
      //
      // Don't update the badge if it's not rendered yet.
      //
      if(earnPtsBtn)
      {
         Ext.Anim.run(earnPtsBtn.badgeElement, 'pop',
         {
            out : false,
            autoClear : false
         });
         this.getEarnPtsBtn().setBadgeText((cartItems.length > 0) ? totalPts + 'Pts' : null);
      }
      return totalPts;
   },
   clearRewardsCart : function()
   {
      //
      // Clears the RewardsCart
      //
      var rcstore = Ext.StoreMgr.get('RewardsCartStore');
      if(rcstore)
      {
         rcstore.removeAll();
         rcstore.data.updateIndices();
         //bug fix for Store when we call "indexOf" utilizing indices
      }
      // Automatically update totals
      this.updateRewardsCartTotal([]);
   },
   prizeCheck : function(store)
   {
      var me = this;
      var records = store.loadCallback[0];
      var operation = store.loadCallback[1];

      var viewport = me.getViewPortCntlr();
      //
      // To-do : Update CustomerStore (Points) with returned value
      //
      if(!operation.wasSuccessful())
      {
         var container = me.getRewardsContainer();
         container.setActiveItem(0);
      }
      else
      {
         //
         // Clear the Shopping Cart
         //
         me.clearRewardsCart();

         if(records.length == 0)
         {
            Ext.device.Notification.show(
            {
               title : 'Scan And Win!',
               message : 'Oops, Play Again!',
               callback : function()
               {
                  me.popView();
               }
            });
         }
         else
         {
            Ext.device.Notification.show(
            {
               title : 'Scan And Win!',
               message : 'You haved won ' + ((records.length > 1) ? 'some Prizes' : 'a PRIZE') + '!',
               callback : function()
               {
                  var app = me.getApplication();
                  var vport = me.getViewport();
                  vport.setEnableAnim(false);
                  vport.getNavigationBar().setCallbackFn(function()
                  {
                     vport.setEnableAnim(true);
                     vport.getNavigationBar().setCallbackFn(Ext.emptyFn);

                     app.dispatch(
                     {
                        action : 'onPrizesButtonTap',
                        args : arguments,
                        controller : viewport,
                        scope : viewport
                     });
                  });
                  me.popView();
               }
            });
         }
         Ext.device.Notification.vibrate();
      }
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
         //
         EarnPrize['setEarnPrizeURL']();
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
               this.onRewardsShopCartTap(null, null, null);
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
   onRewardsShopCartTap : function(b, e, eOpts)
   {
      var earnPtsBtn = this.getEarnPtsBtn();
      var container = this.getRewardsContainer();
      var activeItem = container.getActiveItem();
      var rcstore = Ext.StoreMgr.get('RewardsCartStore');

      earnPtsBtn.updateActive(false);
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
            //
            // Exit Edit Mode if we are getting out
            //
            if(!this.getDoneBtn().isHidden())
            {
               this.onRewardsCartDoneTap(this.getDoneBtn(), e, eOpts);
            }
            container.setActiveItem(0);
            break;
         }
      }
      return true;
   },
   onRewardsContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var earnPtsBtn = me.getEarnPtsBtn();
      var container = me.getRewardsContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'rewardTallyList' :
         {
            me.getDoneBtn().hide();
            me.getEditBtn().show();
            me.getBackButton().hide();
            earnPtsBtn.setTitle('Order Menu');
            animation.setReverse(false);
            me.showNavBar();
            break;
         }
         case 'rewardMainList' :
         {
            me.getDoneBtn().hide();
            me.getEditBtn().hide();
            me.getBackButton().show();
            earnPtsBtn.setTitle('Check Out');
            animation.setReverse(true);
            me.showNavBar();
            break;
         }
         case 'prizeCheck' :
         {
            me.getDoneBtn().hide();
            me.getEditBtn().hide();
            me.getBackButton().hide();
            me.getNavigationBarBottom().hide();
            break;
         }
      }
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
   onRewardMetaChange : function(store, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = viewport.getCustomer().getId();

      var vipPopup = function()
      {
         Ext.device.Notification.show(
         {
            title : 'VIP Challenge Alert!',
            message : me.getVipMsg(metaData['vip_challenge']),
            callback : function()
            {
               Ext.defer(function()
               {
                  me.prizeCheck(store);
               }, 2000);
            }
         });
      }
      if(metaData['points'])
      {
         Ext.device.Notification.show(
         {
            title : 'Earn Points',
            message : me.getPointsMsg(metaData['points']) + ((!metaData['vip_challenge']) ? ((!Genesis.constants.isNative()) ? '<br/>' : '\n') + me.getPrizeCheckMsg() : ''),
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
                     me.prizeCheck(store);
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
      //
      // Update points from the purchase or redemption
      //
      cstore.getById(customerId).set('points', metaData['account_points']);
   },
   onRewardsEarnPtsTap : function(b, e, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      var anim = container.getLayout().getAnimation();

      me.scanQRCode(
      {
         callback : function(response)
         {
            if(response)
            {
               anim.disable();
               container.setActiveItem(2);
               anim.enable();

               console.log("response - " + response);
               me.earnPts();
            }
            else
            {
               console.log("response - NONE");
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : 'Error Processing Your Earned Points'
               });
            }
         }
      });
   },
   onRewardsItemSelect : function(list, record, eOpts)
   {
      if(!this.exploreMode)
      {
         var cartList = this.getRewardsCart();
         //Add to Shopping Cart
         var store = cartList.getStore();
         //RewardsCartStore
         var index = store.indexOf(record);
         var items;
         if(index < 0)
         {
            record.getData().qty = 1;
            store.add(record);
         }
         else
         {
            record.set('qty', record.get('qty') + 1);
            cartList.getViewItems()[index].updateRecord(record);
         }
         // Automatically update totals
         this.updateRewardsCartTotal(store.getRange());
         //
         // Show the Bottom Toolbar
         //
         this.getNavigationBarBottom().show();
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Warning',
            message : 'You need to Check-In first before you are elibigle for Rewards'
         });
      }
      // Deselect item
      list.deselect([record]);
      return false;
   },
   onRewardsCartEditTapCommon : function(b, toggle)
   {
      this.getDoneBtn()[toggle[0]]();
      this.getEditBtn()[toggle[1]]();
      b.hide();
      var buttons = Ext.ComponentQuery.query('rewardscartitem button[tag=deleteItem]');
      var pts = Ext.ComponentQuery.query('rewardscartitem component[cls=points]');
      Ext.each(buttons, function(item)
      {
         item[toggle[0]]();
      });
      Ext.each(pts, function(item)
      {
         item[toggle[1]]();
      });
      var tallyList = this.getRewardsTallyList();
      Ext.each(tallyList.getItems().items, function(item)
      {
         //
         // Toggle everything except the tallyList
         //
         if(!item.getXTypes().match('dataview'))
         {
            item[toggle[1]]();
         }
      });
   },
   onRewardsCartEditTap : function(b, e, eOpts)
   {
      this.onRewardsCartEditTapCommon(b, ['show', 'hide']);
   },
   onRewardsCartDoneTap : function(b, e, eOpts)
   {
      var rewards = this.getRewards();
      if(rewards.isPainted() && !rewards.isHidden())
      {
         this.onRewardsCartEditTapCommon(b, ['hide', 'show']);
      }
   },
   onRewardsCartItemDeleteTap : function(b, e, eOpts)
   {
      var me = this;
      var item = b.up('rewardscartitem');
      var cart = me.getRewardsCart();
      var index = cart.getViewItems().indexOf(item);
      var store = cart.getStore();
      //RewardsCartStore
      var record = store.getAt(index);

      item.onAfter(
      {
         hiddenchange : function()
         {
            store.remove(record);
            var total = me.updateRewardsCartTotal(store.getRange());

            //
            // Exit Edit Mode and hide NavigationBar when there are no more items to delete
            //
            if(total == 0)
            {
               var bar = me.getNavigationBarBottom();
               bar.onAfter(
               {
                  hiddenchange : function()
                  {
                     me.onRewardsShopCartTap(b, e, eOpts);
                  },
                  single : true
               });
               bar.hide();
            }
         },
         single : true
      });
      item.hide();
   },
   onRewardsCartItemSelectChange : function(f, newValue, oldValue, eOpts)
   {
      var item = f.up('rewardscartitem');
      var cart = this.getRewardsCart();
      var index = cart.getViewItems().indexOf(item);
      var record = cart.getStore().getAt(index);

      record.set('qty', newValue.get(f.getValueField()));
      item.updateRecord(record);
      this.updateRewardsCartTotal(cart.getStore().getRange());
      //RewardsCartStore

      return true;
   },
   onCheckInTap : function(b, e, eOpts)
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

      list.deselect([record]);

      if(!me.exploreMode)
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
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Warning',
            message : 'You need to Check-In first before you are elibigle for Redemptions'
         });
      }

      return true;
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

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : 'Loading ...'
      });
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
            break;
         }
         case 'redemptions':
         {
            page = me.getRedemptions();
            list = me.getRedemptionsList();
            store = Ext.StoreMgr.get('RedemptionsStore');
            rstore = list.getStore();
            scroll = page.getScrollable();
            CustomerReward['setGetRedemptionsURL']();
            break;
         }
      }

      store.clearFilter();
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
                     break;
               }

               //
               // Scroll to the Top of the Screen
               //
               scroll.getScroller().scrollTo(0, 0);

               for(var i = 0; i < records.length; i++)
               {
                  records[i].data['venue_id'] = venueId;
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
         }
      });
   },
   isOpenAllowed : function()
   {
      // VenueId can be found after the User checks into a venue
      return ((this.getViewPortCntlr().getVenue()) ? true : "You need to Explore or Check-in to a Venue first");
   }
});
