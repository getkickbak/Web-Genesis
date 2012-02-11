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
         }
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
         'rewardsview button[text=Edit]' :
         {
            tap : this.onRewardsCartEditTap
         },
         'rewardsview button[text=Done]' :
         {
            tap : this.onRewardsCartDoneTap
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
   getRewardsCart : function()
   {
      return this.getRewards().query('dataview[tag=rewardsCart]')[0]
   },
   getEarnPtsBtn : function()
   {
      return this.getRewards().query('button[tag=cart]')[0]
   },
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
      this.getRewards().query('tabbar[cls=navigationBarBottom]')[0][show ? 'show':'hide' ]();
   },
   onRewardsDeactivate : function(c, newActiveItem, oldActiveItem, eOpts)
   {
      // Revert Back to old standard view
      var container = this.getRewards().query('container[tag=rewards]')[0];
      if(container)
      {
         var activeItem = container.getActiveItem();
         switch (activeItem.config.tag)
         {
            case 'rewardTallyList' :
            {
               this.onRewardsShopCartTap(null, null, null);
               break;
            }
         }
      }
   },
   onRewardsShopCartTap : function(b, e, eOpts)
   {
      var earnPtsBtn = this.getEarnPtsBtn();
      earnPtsBtn.updateActive(false);
      var container = this.getRewards().query('container[tag=rewards]')[0];
      var activeItem = container.getActiveItem();
      var animation = container.getLayout().getAnimation();
      switch (activeItem.config.tag)
      {
         case 'rewardMainList' :
         {
            earnPtsBtn.setTitle('Order Menu');
            animation.setReverse(false);
            container.setActiveItem(1);
            break;
         }
         case 'rewardTallyList' :
         {
            earnPtsBtn.setTitle('Check Out');
            animation.setReverse(true);
            container.setActiveItem(0);
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
               // Send to Server for Approval
            }
            else
            {
               console.log("response - NONE");
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
         Ext.Msg.alert("", "You need to Check-In first before you are elibigle for rewards");
      }
      // Deselect item
      list.deselect([record]);
      return false;
   },
   onRewardsCartEditTap : function(b, e, eOpts)
   {
      b.hide();
      Ext.ComponentQuery.query('button[text=Done]')[0].show();
      var buttons = Ext.ComponentQuery.query('rewardscartitem button[iconCls=delete_black2]');
      var pts = Ext.ComponentQuery.query('rewardscartitem component[cls=points]');
      Ext.each(buttons, function(item)
      {
         item.show();
      })
      Ext.each(pts, function(item)
      {
         item.hide();
      })
   },
   onRewardsCartDoneTap : function(b, e, eOpts)
   {
      b.hide();
      Ext.ComponentQuery.query(' button[text=Edit]')[0].show();
      var buttons = Ext.ComponentQuery.query('rewardscartitem button[iconCls=delete_black2]');
      var pts = Ext.ComponentQuery.query('rewardscartitem component[cls=points]');
      Ext.each(buttons, function(item)
      {
         item.hide();
      })
      Ext.each(pts, function(item)
      {
         item.show();
      })
   },
   onRewardsCartItemDeleteTap : function(b, e, eOpts)
   {
      var item = b.up('rewardscartitem');
      var cart = this.getRewardsCart();
      var index = cart.getViewItems().indexOf(item);
      var record = cart.getStore().getAt(index);
      var store = cart.getStore();

      store.remove(record);
      this.updateRewardsCartTotal(store.getRange());
   },
   updateRewardsCartTotal : function(cartItems)
   {
      var total = this.getRewards().query('component[tag=total]')[0], totalPts = 0;
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
   onCheckInTap : function(b, e, eOpts)
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
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   getLists : function()
   {
      var dataview = this.getRedemptions().query('dataview[tag=redemptionsDataview]')[0];
      var list = this.getRedemptions().query('list[tag=redemptionsList]')[0];

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
      var page = this.getRedemptions();
      page.query('component[tag=points]')[0].setData(
      {
         points : model.get('points')
      });
      page.query('component[tag=desc]')[0].setData(
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
                  // Send to Server for approval
               }
               else
               {
                  console.log("Failed to get QR Code from Scanner");
                  Ext.Msg.alert("", "Failed to get QR Code from Scanner");
               }
            }, this)
         });
      }
      else
      {
         Ext.Msg.alert("", "You need to Check-In first before you are elibigle for redemptions");
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
         Ext.Msg.alert("", "Show QR Code Scanner");
      }
      else
      {
         Ext.Msg.alert("", "You need to Check-In first before you are elibigle for redemptions");
      }
      return false;
   },
   onRedemptionsViewToggle : function(c, button, pressed)
   {
      if(pressed)
      {
         var view = this.getRedemptions().query('container[tag=redemptionsView]')[0];
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
               container = this.getRedemptions().query('container[tag=redemptionsDataviewWrapper]')[0];
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
               height = Ext.fly(container.element.query('.x-list')[0]).getHeight();
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
               var scrollable = page.query('dataview[tag=redemptionsDataview]')[0].getScrollable();
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
