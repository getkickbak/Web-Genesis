Ext.define('Genesis.controller.Redemptions',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   xtype : 'redemptionsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      refs :
      {
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
         redemptions :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         redemptionsList :
         {
            select : 'onItemListSelect',
            disclose : 'onItemListDisclose'
         }
      }
   },
   checkinFirstRedemptionsMsg : 'You need to Check-In first before you are elibigle for Redemptions',
   needPointsMsg : function(pointsDiff)
   {
      return 'You need ' + pointsDiff + ' more points ' + Genesis.constants.addCRLF() + 'to be eligible for this item.';
   },
   //orderTitle : 'Rewards List',
   //checkoutTitle : 'Check Out',
   init : function()
   {
      Ext.regStore('RedeemStore',
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
      console.log("Redemptions Init");
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   onItemListSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onItemListDisclose(d, model);
      return false;
   },
   onItemListDisclose : function(list, record, target, index, e, eOpts)
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
                  //'id' : 1,
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
         case 'redemptions':
         {
            me.setAnimationMode(me.self.animationMode['coverUp']);
            page = me.getRedemptions();
            list = me.getRedemptionsList();
            store = Ext.StoreMgr.get('RedeemStore');
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
