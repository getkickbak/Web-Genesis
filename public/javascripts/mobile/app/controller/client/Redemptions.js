Ext.define('Genesis.controller.client.Redemptions',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      clientRedemption_path : '/clientRedemptions'
   },
   xtype : 'clientRedemptionsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      refs :
      {
         backButton : 'viewportview button[text=Close]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'clientredemptionsview',
            autoCreate : true,
            xtype : 'clientredemptionsview'
         },
         redemptionsList : 'clientredemptionsview list[tag=redemptionsList]',
         redemptionsPts : 'clientredemptionsview component[tag=points]',
         redemptionsPtsEarnPanel : 'clientredemptionsview dataview[tag=ptsEarnPanel]'
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
   checkinFirstMsg : 'Please Check-In before redeeming rewards',
   needPointsMsg : function(pointsDiff)
   {
      return 'You need ' + pointsDiff + ' more points ' + Genesis.constants.addCRLF() + 'to be eligible for this item.';
   },
   //orderTitle : 'Rewards List',
   //checkoutTitle : 'Check Out',
   init : function()
   {
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
      console.log("Client Redemptions Init");
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onActivate : function()
   {
   },
   onDeactivate : function()
   {
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

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
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
            message : me.checkinFirstMsg
         });
      }

      return true;
   },
   onRedeemCheckMetaData : function(metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      //
      // Update points from the purchase or redemption
      //
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = viewport.getCustomer().getId();
      if(metaData['account_points'])
      {
         cstore.getById(customerId).set('points', metaData['account_points']);
      }
      if(metaData['account_visits'])
      {
         cstore.getById(customerId).set('visits', metaData['account_visits']);
      }
   },
   onRedeemMetaChange : function(store, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.onRedeemCheckMetaData(metaData);

      if(metaData['data'])
      {
         var app = me.getApplication();
         var controller = app.getController('Prizes');
         app.dispatch(
         {
            action : 'showPrizeQRCode',
            args : [0, metaData['data']],
            controller : controller,
            scope : controller
         });
      }
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

         me.exploreMode = !cvenue || (cvenue && (cvenue.getId() != venue.getId()));
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
