Ext.define('Genesis.controller.RewardsRedemptions',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store',
   // Base Class
   'Genesis.controller.ControllerBase'],
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
         rewardsRedemptionsPage :
         {
            selector : 'rewardsredemptionspageview',
            autoCreate : true,
            xtype : 'rewardsredemptionspageview'
         },
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
         'rewardsredemptionspageview' :
         {
            activate : 'onActivate'
         },
         'rewardsredemptionspageview list' :
         {
            disclose : 'onRewardsRedemptionsListDisclose'
         }
      }
   },
   init : function()
   {
      Ext.regStore('RewardsRedemptionsStore',
      {
         model : 'Genesis.model.frontend.CustomerVenue',
         autoLoad : false
      });
      Ext.regStore('RewardsRedemptionsTemplateStore',
      {
         model : 'Genesis.model.frontend.RewardsMainTemplate',
         data : [
         {
            id : "rewards",
            photo_url : 'resources/img/sprites/rewards.jpg',
            text : 'Reward Points'
         },
         {
            id : "redemptions",
            photo_url : 'resources/img/sprites/birthday.jpg',
            text : 'Redeem Points'
         }]
      });
      this.initRewards();
      this.initRedemptions();
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
         'viewport button[iconCls=earnPts]' :
         {
            tap : this.onRewardsEarnPtsTap
         },
         'rewardsview button[text=Edit]' :
         {
            tap : this.onRewardsCartEditTap
         },
         'rewardsview button[text=Done]' :
         {
            tap : this.onRewardsCartDoneTap
         },
         'rewardsview rewardscart rewardscartitem button[iconCls=delete_black2]' :
         {
            tap : this.onRewardsCartItemDeleteTap
         },
         'rewardsview rewardscart rewardscartitem selectfield' :
         {
            change : this.onRewardsCartItemSelectChange
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
            activate : this.onRedemptionsActivate
         },
         'redemptionview list' :
         {
            itemtap : this.onRedemptionsItemTap
         }
      });
      Ext.regStore('RedemptionsStore',
      {
         model : 'Genesis.model.CustomerReward',
         autoLoad : false,
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
   onActivate : function()
   {
      var venueId = this.getViewport().getVenueId();
      var customerId = this.getViewport().getCustomerId();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      cstore.clearFilter();
      var vmodel = Ext.StoreMgr.get('VenueStore').getById(venueId);
      var cmodel = cstore.getById(customerId);

      //
      // Load RewardsRedemptionsStore
      //
      Ext.StoreMgr.get('RewardsRedemptionsStore').setData([
      {
         "customer" : cmodel.raw,
         "venue" : vmodel.raw
      }])
      this.setCustomerStoreFilter(customerId, vmodel.getMerchant().getId());
   },
   onRewardsRedemptionsListDisclose : function(list, record, target, index, e, eOpts)
   {
      var page;
      switch (record.getId())
      {
         case 'rewards':
         {
            var page = this.getRewards();
            break;
         }
         case 'redemptions':
         {
            page = this.getRedemptions();
            break;
         }
      }
      var vrecord = Ext.StoreMgr.get('CheckinBrowseStore').getById(this.getViewport().getVenueId());
      page.getInitialConfig().title = vrecord.get('name');
      this.pushView(page);
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   onRewardsActivate : function()
   {
      var venueId = this.getViewport().getVenueId();
      var customerId = this.getViewport().getCustomerId();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var vmodel = Ext.StoreMgr.get('VenueStore').getById(venueId);
      var cmodel = cstore.getById(customerId);
      var store = Ext.StoreMgr.get('RewardsStore');

      this.setCustomerStoreFilter(customerId, vmodel.getMerchant().getId());
      store.clearFilter();
      store.load(
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
                  records[i].data['venue_id'] = venueId;
               }
               store.filter([
               {
                  filterFn : Ext.bind(function(item)
                  {
                     return item.get("venue_id") == venueId;
                  }, this)
               }]);
            }
            else
            {
            }
         }
      });
      var earnPtsBtn = Ext.ComponentQuery.query('button[iconCls=earnPts]')[0];
      earnPtsBtn.show();
   },
   onRewardsDeactivate : function()
   {
      Ext.ComponentQuery.query("button[iconCls=earnPts]")[0].hide();
   },
   onRewardsEarnPtsTap : function(b, e, eOpts)
   {
      var earnPtsBtn = Ext.ComponentQuery.query('button[iconCls=earnPts]')[0];
      earnPtsBtn.updateActive(false);
      var container = Ext.ComponentQuery.query('rewardsview container[tag=rewards]')[0];
      var activeItem = container.getActiveItem();
      switch (activeItem.config.tag)
      {
         case 'rewardMainList' :
         {
            earnPtsBtn.getInitialConfig().title = 'Earn Points';
            container.getLayout().getAnimation().setReverse(false);
            container.setActiveItem(1);
            break;
         }
         case 'rewardTallyList' :
         {
            earnPtsBtn.getInitialConfig().title = 'Orders';
            container.getLayout().getAnimation().setReverse(true);
            container.setActiveItem(0);
            break;
         }
      }
   },
   onRewardsItemSelect : function(list, record, eOpts)
   {
      var cartList = Ext.ComponentQuery.query('rewardsview rewardscart')[0];
      //Add to Shopping Cart
      var store = cartList.getStore();
      var index = store.indexOf(record);
      var items;
      if(index < 0)
      {
         store.add(record);
         items = cartList.query('rewardscartitem');
      }
      else
      {
         items = cartList.query('rewardscartitem');
         var item = items[index];
         var selectfield = item.query('selectfield')[0];
         var valuefield = selectfield.getValueField();
         var qty = selectfield.getValue().get(valuefield) + 1;

         item.query('component[cls=points]')[0].setData(
         {
            points : qty * record.get('points')
         });
         selectfield.setValue(selectfield.getStore().findRecord(valuefield, qty));
      }
      // Automatically update totals
      this.updateRewardsCartTotal(items);

      // Deselect item
      list.deselect(record);
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
      var cart = Ext.ComponentQuery.query('rewardsview rewardscart')[0];
      var index = cart.getViewItems().indexOf(item);
      var record = cart.getStore().getAt(index);

      cart.getStore().remove(record);
      this.updateRewardsCartTotal(cart.getViewItems());
   },
   updateRewardsCartTotal : function(cartItems)
   {
      var total = Ext.ComponentQuery.query('rewardsview component[tag=total]')[0], totalPts = 0;
      for(var i = 0; i < cartItems.length; i++)
      {
         totalPts += cartItems[i].query('component[cls=points]')[0].getData().points;
      }
      total.setData(
      {
         points : totalPts
      });

   },
   onRewardsCartItemSelectChange : function(f, newValue, oldValue, eOpts)
   {
      var item = f.up('rewardscartitem');
      var cart = Ext.ComponentQuery.query('rewardsview rewardscart')[0];
      var index = cart.getViewItems().indexOf(item);
      var record = cart.getStore().getAt(index);
      var valuefield = f.getValueField();

      item.query('component[cls=points]')[0].setData(
      {
         points : newValue.get(valuefield) * record.get('points')
      });
      this.updateRewardsCartTotal(cart.getViewItems());
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onRedemptionsActivate : function()
   {
      var venueId = this.getViewport().getVenueId();
      var customerId = this.getViewport().getCustomerId();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var vmodel = Ext.StoreMgr.get('VenueStore').getById(venueId);
      cstore.clearFilter();
      var cmodel = cstore.getById(customerId);
      var rstore = Ext.StoreMgr.get('RedemptionsStore');

      this.setCustomerStoreFilter(customerId, vmodel.getMerchant().getId());
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
            }
            else
            {
            }
         }
      });
   },
   onRedemptionsItemTap : function(list, index, target, e, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      this.pushView(this.getRewardsRedemptionsPage());
      console.log("RewardsRedemptionsPage Opened");
   },
   isOpenAllowed : function()
   {
      // VenueId can be found fater the User checks into a venue
      return ((this.getViewport().getVenueId() > 0) ? true : "Cannot open Page until You have Checked-in into a Venue");
   }
});
