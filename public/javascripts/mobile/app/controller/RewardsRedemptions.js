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
   models : ['frontend.RewardsMainTemplate', 'PurchaseReward', 'CustomerReward'],
   config :
   {
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
         redemptionsPtsEarnPanel : 'redemptionsview dataview[tag=ptsEarnPanel]',
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
         }]
      });
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   onRewardsActivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
      var viewport = this.getViewPortCntlr();
      var venue = viewport.getVenue();
      var customer = viewport.getCustomer();
      var merchantId = venue.getMerchant().getId();
      var cvenue = viewport.getCheckinInfo().venue;
      var rcstore = Ext.StoreMgr.get('RewardsCartStore');

      // Revert Back to old standard view
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

      var showBar = (cvenue && (cvenue.getId() == venue.getId())) && (rcstore.getCount() > 0);
      this.getNavigationBarBottom()[(showBar) ? 'show':'hide' ]();
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
            break;
         }
         case 'rewardMainList' :
         {
            me.getDoneBtn().hide();
            me.getEditBtn().hide();
            me.getBackButton().show();
            earnPtsBtn.setTitle('Check Out');
            animation.setReverse(true);
            break;
         }
         case 'prizeCheck' :
         {
            me.getDoneBtn().hide();
            me.getEditBtn().hide();
            me.getBackButton().hide();
            me.clearRewardsCart();
            me.getNavigationBarBottom().hide();
         }
      }
   },
   earnPtsFn : function()
   {
      var pstore = Ext.StoreMgr.get('MerchantPrizeStore')
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      var wonPrize = true;

      me.getGeoLocation(function(position)
      {
         PurchaseReward['setEarnRewardURL']();
         rcstore.load(
         {
            jsonData :
            {
            },
            params :
            {
               venue_id : venueId,
               merchant_id : merchantId,
               reward_ids : Ext.Array.pluck(rcstore.getRange(), PurchaseReward.getIdProperty()),
               latitude : position.coords.latitude,
               longitude : position.coords.longitude
            },
            callback : function(records, operation)
            {
               //
               // To-do : Update CustomerStore (Points) with returned value
               //
               if(operation.wasSuccessful())
               {
                  Ext.defer(function()
                  {
                     if(!wonPrize)
                     {
                        // Send to Server for Approval
                        Ext.device.Notification.show(
                        {
                           title : 'Oops, Play Again!',
                           message : 'You still Earned XX Points towards more rewards!',
                           callback : function()
                           {
                              me.popView();
                           }
                        });
                     }
                     else
                     {
                        //
                        // To-do : Update Prize Store with the EarnPrize object you just won,
                        // add it to the front of the list
                        //
                        Ext.device.Notification.show(
                        {
                           title : 'Surprise!',
                           message : 'You haved won a PRIZE!',
                           callback : function()
                           {
                              var app = me.getApplication();
                              var viewport = me.getViewPortCntlr();
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
                  }, 2000);
               }
            }
         });
      });
   },
   onRewardsEarnPtsTap : function(b, e, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      var activeItem = container.getActiveItem();
      var anim = container.getLayout().getAnimation();
      var rcstore = Ext.StoreMgr.get('RewardsCartStore');

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
               me.earnPtsFn();
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
      var record = cart.getStore().getAt(index);
      var store = cart.getStore();

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
   onRewardsCartItemSelectChange : function(f, newValue, oldValue, eOpts)
   {
      var item = f.up('rewardscartitem');
      var cart = this.getRewardsCart();
      var index = cart.getViewItems().indexOf(item);
      var record = cart.getStore().getAt(index);

      record.set('qty', newValue.get(f.getValueField()));
      item.updateRecord(record);
      this.updateRewardsCartTotal(cart.getStore().getRange());

      return true;
   },
   clearRewardsCart : function()
   {
      //
      // Clears the RewardsCart
      //
      var rcstore = Ext.StoreMgr.get('RewardsCartStore');
      if(rstore)
      {
         rcstore.removeAll();
      }
      // Automatically update totals
      this.updateRewardsCartTotal([]);
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
         //
         // To-do : Talk to Server and deduct points
         //
         app.dispatch(
         {
            action : 'onRedeemRewards',
            args : [Ext.create('Genesis.model.EarnPrize',
            {
               'id' : 1,
               'expiry_date' : null,
               'reward' : record.raw,
               'merchant' : viewport.getCheckinInfo().venue.getMerchant().raw
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
                     me.getRedemptionsPtsEarnPanel().getStore().setData(viewport.getCustomer().raw);
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
               // Show Redemptions for this merchant only
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
