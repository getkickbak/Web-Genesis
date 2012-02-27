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
   models : ['frontend.RewardsMainTemplate', 'frontend.CustomerVenue', 'PurchaseReward', 'CustomerReward'],
   config :
   {
      refs :
      {
         backButton : 'viewportview button[text=Close]',
         doneBtn : 'viewportview button[tag=done]',
         editBtn : 'viewportview button[tag=edit]',
         rewards :
         {
            selector : 'rewardsview',
            autoCreate : true,
            xtype : 'rewardsview'
         },
         redemptions :
         {
            selector : 'redemptionsview',
            autoCreate : true,
            xtype : 'redemptionsview'
         },
         rewardsCart : 'rewardsview dataview[tag=rewardsCart]',
         rewardsCartTotal : 'rewardsview component[tag=total]',
         earnPtsBtn : 'rewardsview button[tag=cart]',
         rewardsContainer : 'rewardsview container[tag=rewards]',
         navigationBarBottom : 'rewardsview tabbar[cls=navigationBarBottom]',
         redemptionsList : 'redemptionsview list[tag=redemptionsList]',
         redemptionsPts : 'redemptionsview component[tag=points]',
         redemptionsDesc : 'redemptionsview component[tag=desc]',
         redemptionsContainer : 'redemptionsview container[tag=redemptionsView]',
         redemptionsDataview : 'redemptionsview dataview[tag=redemptionsDataview]',
         redemptionsDataviewWrapper : 'redemptionsview container[tag=redemptionsDataviewWrapper]'
      },
      control :
      {
      }
   },
   init : function()
   {
      Ext.regStore('RewardsRedemptionsStore',
      {
         model : 'Genesis.model.frontend.CustomerVenue',
         autoLoad : false
      });
      this.initRewards();
      this.initRedemptions();
      console.log("Rewards & Redemptions Init");
   },
   initRewards : function()
   {
      this.control(
      {
         'viewportview button[tag=edit]' :
         {
            tap : this.onRewardsCartEditTap
         },
         'viewportview button[tag=done]' :
         {
            tap : this.onRewardsCartDoneTap
         },
         'rewardsview' :
         {
            activate : this.onRewardsActivate,
            deactivate : this.onRewardsDeactivate
         },
         'rewardsview list' :
         {
            select : this.onRewardsItemSelect
         },
         'rewardsview button[tag=cart]' :
         {
            tap : this.onRewardsShopCartTap
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
      Ext.regStore('RewardsStore',
      {
         model : 'Genesis.model.PurchaseReward',
         config :
         {
            autoLoad : false
         },
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
      Ext.regStore('RewardsCartStore',
      {
         model : 'Genesis.model.PurchaseReward',
         config :
         {
            autoLoad : false
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
         'redemptionsview' :
         {
            activate : this.onRedemptionsActivate,
            deactivate : this.onRedemptionsDeactivate
         },
         'redemptionsview dataview[tag=redemptionsDataview]' :
         {
            select : this.onRedemptionsItemSelect,
         },
         'redemptionsview list[tag=redemptionsList]' :
         {
            select : this.onRedemptionsItemListSelect
         },
         'redemptionsview segmentedbutton[tag=redemptions]' :
         {
            toggle : this.onRedemptionsViewToggle
         },
         'redemptionsview button[tag=redeem]' :
         {
            tap : this.onRedemptionsItemTap
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
   // RewardsRedemptions Page
   // --------------------------------------------------------------------------
   onMainActivate : function()
   {
      var venueId = this.getViewport().getVenueId();
      var customerId = this.getViewport().getCustomerId();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      //
      // Load RewardsRedemptionsStore
      //
      var vmodel = Ext.StoreMgr.get('VenueStore').getById(venueId);
      var merchantId = vmodel.getMerchant().getId();
      this.setCustomerStoreFilter(customerId, merchantId);
      var cmodel = cstore.getById(merchantId);
      Ext.StoreMgr.get('RewardsRedemptionsStore').setData([
      {
         "customer" : cmodel.raw,
         "venue" : vmodel.raw
      }])
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   onRewardsActivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
      var viewport = this.getViewport();
      var venueId = viewport.getVenueId();
      var customerId = viewport.getCustomerId();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var vstore = Ext.StoreMgr.get('VenueStore');
      var rstore = Ext.StoreMgr.get('RewardsStore');
      var vmodel = vstore.getById(venueId);
      var merchantId = vmodel.getMerchant().getId();

      this.setCustomerStoreFilter(customerId, merchantId);
      var cmodel = cstore.getById(merchantId);
      rstore.clearFilter();
      rstore.load(
      {
         parms :
         {
            venue_id : venueId,
         },
         scope : this,
         callback : function(records, operation, success)
         {
            if(success)
            {
               for(var i = 0; i < records.length; i++)
               {
                  records[i].data['merchant_id'] = merchantId;
               }
               rstore.filter([
               {
                  filterFn : Ext.bind(function(item)
                  {
                     return item.get("merchant_id") == merchantId;
                  }, this)
               }]);
               this.exploreMode = viewport.getCheckinInfo().venueId != venueId;
            }
            else
            {
            }
         }
      });
      var show = viewport.getCheckinInfo().venueId == venueId;
      this.getNavigationBarBottom()[show ? 'show':'hide' ]();
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
            {
               this.onRewardsShopCartTap(null, null, null);
               break;
            }
         }
         animation.enable();
      }
   },
   onRewardsDeactivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
   },
   onRewardsShopCartTap : function(b, e, eOpts)
   {
      var earnPtsBtn = this.getEarnPtsBtn();
      var container = this.getRewardsContainer();
      var activeItem = container.getActiveItem();
      var animation = container.getLayout().getAnimation();

      earnPtsBtn.updateActive(false);
      switch (activeItem.config.tag)
      {
         case 'rewardMainList' :
         {
            this.getDoneBtn().hide();
            this.getEditBtn().show();
            earnPtsBtn.setTitle('Order Menu');
            animation.setReverse(false);
            container.setActiveItem(1);
            this.getBackButton().hide();
            break;
         }
         case 'rewardTallyList' :
         {
            this.getDoneBtn().hide();
            this.getEditBtn().hide();
            earnPtsBtn.setTitle('Check Out');
            animation.setReverse(true);
            container.setActiveItem(0);
            this.getBackButton().show();
            break;
         }
      }
      return true;
   },
   onRewardsEarnPtsTap : function(b, e, eOpts)
   {
      this.scanQRCode(
      {
         callback : Ext.bind(function(response)
         {
            if(response)
            {
               console.log("response - " + response);

               this.clearRewardsCart();
               //
               // To-do : Update CustomerStore with returned value
               //
               this.popView();
               // Send to Server for Approval
               Ext.device.Notification.show(
               {
                  title : 'Success',
                  message : 'You haved Earned Your Points!'
               });
               Ext.device.Notification.vibrate();
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
         }, this)
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
      })
      Ext.each(pts, function(item)
      {
         item[toggle[1]]();
      })
   },
   onRewardsCartEditTap : function(b, e, eOpts)
   {
      this.onRewardsCartEditTapCommon(b, ['show', 'hide']);
   },
   onRewardsCartDoneTap : function(b, e, eOpts)
   {
      this.onRewardsCartEditTapCommon(b, ['hide', 'show']);
   },
   onRewardsCartItemDeleteTap : function(b, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewport();
      var item = b.up('rewardscartitem');
      var cart = me.getRewardsCart();
      var index = cart.getViewItems().indexOf(item);
      var record = cart.getStore().getAt(index);
      var store = cart.getStore();
      var properties = item.getAnimateProperties();
      item.animate(item, item.renderElement, properties.element.from, properties.element.to, 1000, function()
      {
         store.remove(record);
         me.updateRewardsCartTotal(store.getRange());
      });
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
      var rstore = Ext.StoreMgr.get('RewardsCartStore');
      if(rstore)
      {
         rstore.removeAll();
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
   getLists : function()
   {
      var dataview = this.getRedemptionsDataview();
      var list = this.getRedemptionsList();

      return (
         {
            dataview : dataview,
            list : list
         });
   },
   onRedemptionsActivate : function()
   {
      var viewport = this.getViewport();
      var venueId = viewport.getVenueId();
      var customerId = viewport.getCustomerId();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var vmodel = Ext.StoreMgr.get('VenueStore').getById(venueId);
      var merchantId = vmodel.getMerchant().getId();
      var rstore = Ext.StoreMgr.get('RedemptionsStore');

      this.setCustomerStoreFilter(customerId, merchantId);
      var cmodel = cstore.getById(merchantId);
      rstore.clearFilter();
      rstore.load(
      {
         parms :
         {
            venue_id : venueId
         },
         scope : this,
         callback : function(records, operation, success)
         {
            if(success)
            {
               for(var i = 0; i < records.length; i++)
               {
                  records[i].data['venue_id'] = venueId;
               }
               rstore.filter([
               {
                  filterFn : Ext.bind(function(item)
                  {
                     return item.get("venue_id") == venueId;
                  }, this)
               }]);

               this.exploreMode = viewport.getCheckinInfo().venueId != venueId;
               // Update Page Dimensions
               var segBtns = this.getRedemptions().query('segmentedbutton')[0];
               var btn = segBtns.query('button[tag=detailed]')[0];
               segBtns.setPressedButtons([btn]);
               this.onRedemptionsViewToggle(null, btn, true);
               //
               // Scroll to the Top of the Screen
               //
               this.getRedemptions().getScrollable().getScroller().scrollTo(0, 0);
            }
            else
            {
            }
         }
      });
   },
   onRedemptionsDeactivate : function()
   {
   },
   onRedemptionsItemSelect : function(d, model, eOpts)
   {
      this.getRedemptionsPts().setData(
      {
         points : model.get('points')
      });
      this.getRedemptionsDesc().setData(
      {
         title : model.get('title')
      });

      return true;
   },
   onRedemptionsItemTap : function(b, e, eOpts)
   {
      var lists = this.getLists();

      if(!this.exploreMode)
      {
         //
         // Get Show Scanner
         //
         this.scanQRCode(
         {
            callback : Ext.bind(function(response)
            {
               if(response)
               {
                  console.log("response - " + response);
                  //
                  // To-do :  Update CustomerStore with returned value
                  //
                  this.popView();
                  // Send to Server for approval
                  Ext.device.Notification.show(
                  {
                     title : 'Success',
                     message : 'Points Redeemed!'
                  });
                  Ext.device.Notification.vibrate();
               }
               else
               {
                  console.log("Failed to get QR Code from Scanner");
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : 'Failed to get QR Code from Scanner'
                  });
               }
            }, this)
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
   },
   onRedemptionsItemListSelect : function(list, model, eOpts)
   {
      var lists = this.getLists();

      list.deselect([model]);
      lists.dataview.select([model]);

      if(!this.exploreMode)
      {
         //
         // Get Show Scanner
         //
         this.scanQRCode(
         {
            callback : Ext.bind(function(response)
            {
               if(response)
               {
                  console.log("response - " + response);
                  //
                  // To-do :  Update CustomerStore with returned value
                  //
                  //this.popView();
                  // Send to Server for approval
                  Ext.device.Notification.show(
                  {
                     title : 'Success',
                     message : 'Points Redeemed!'
                  });
                  Ext.device.Notification.vibrate();
               }
               else
               {
                  console.log("Failed to get QR Code from Scanner");
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : 'Failed to get QR Code from Scanner'
                  });
               }
            }, this)
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
      return false;
   },
   onRedemptionsViewToggle : function(c, button, pressed)
   {
      if(pressed)
      {
         var view = this.getRedemptionsContainer();
         var lists = this.getLists();
         var dataview = lists.dataview;
         var list = lists.list;
         var scroller, item, container;
         var height = 0;
         var model = dataview.getSelection()[0];

         switch(button.config.tag)
         {
            case 'detailed' :
            {
               container = this.getRedemptionsDataviewWrapper();
               var items = container.getItems();

               view.setActiveItem(0);

               // Set Container Height
               for(var i = 0; i < items.length; i++)
               {
                  height += items.get(i).element.getHeight() + items.get(i).element.getMargin('tb');
               }
               break;
            }
            case 'summary' :
            {
               container = list;

               view.setActiveItem(1);

               // Set Container Height
               height = Ext.fly(container.element.query('.x-list-container')[0]).getHeight();
               break;
            }
         }
         container.setHeight(height);
         view.setHeight(height);

         switch(button.config.tag)
         {
            case 'detailed' :
            {
               if(dataview.getSelection().length > 0)
               {
                  // Scroll to Item in Dataview List
                  if(dataview.getScrollable())
                  {
                     scroller = dataview.getScrollable().getScroller();
                     item = dataview.getViewItems()[dataview.getStore().indexOf(model)];

                     //stop the scroller from scrolling
                     scroller.stopAnimation();

                     //make sure the new offsetTop is not out of bounds for the scroller
                     var containerSize = scroller.getContainerSize().x, size = scroller.getSize().x, maxOffset = size - containerSize, offset = (item.offsetLeft > maxOffset) ? maxOffset : item.offsetLeft;

                     scroller.scrollTo(offset, 0);
                  }
               }
               break;
            }
            case 'summary' :
            {
               // Scroll to Item in List
               if(dataview.getSelection().length > 0)
               {
                  scroller = this.getRedemptions().getScrollable().getScroller();
                  item = list.getViewItems()[dataview.getStore().indexOf(model)];

                  //stop the scroller from scrolling
                  scroller.stopAnimation();

                  //make sure the new offsetTop is not out of bounds for the scroller
                  var containerSize = scroller.getContainerSize().y, size = scroller.getSize().y, maxOffset = size - containerSize, offset = (item.offsetTop > maxOffset) ? maxOffset : item.offsetTop;

                  scroller.scrollTo(0, offset);
               }
               break;
            }
         }
      }
      return true;
   },
   onRedemptionsItemScrollStart : function()
   {
      var scroller = this.getRedemptions().getScrollable().getScroller();
      //stop the scroller from scrolling
      scroller.setDisabled(true);
   },
   onRedemptionsItemScrollEnd : function()
   {
      var scroller = this.getRedemptions().getScrollable().getScroller();
      //stop the scroller from scrolling
      scroller.setDisabled(false);
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
      this.onMainActivate();
      var page;
      switch (subFeature)
      {
         case 'rewards':
         {
            page = this.getRewards();
            break;
         }
         case 'redemptions':
         {
            page = this.getRedemptions();
            if(!this.initReedeem)
            {
               var scrollable = this.getRedemptionsDataview().getScrollable();
               scrollable.getScroller().on(
               {
                  scope : this,
                  scrollstart : 'onRedemptionsItemScrollStart',
                  scrollend : 'onRedemptionsItemScrollEnd'
               });
               this.initReedeem = true;
            }
            break;
         }
      }
      this.pushView(page);
   },
   isOpenAllowed : function()
   {
      // VenueId can be found fater the User checks into a venue
      return ((this.getViewport().getVenueId() > 0) ? true : "You need to Explore or Check-in to a Venue first");
   }
});
