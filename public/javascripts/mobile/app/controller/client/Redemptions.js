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
      mode : 'redeem',
      routes :
      {
         'redemptions' : 'redemptionsPage',
         'redeemChooseSC' : 'redeemChooseSCPage',
         'redemptionsSC' : 'redemptionsSCPage'
      },
      refs :
      {
         backBtn : 'clientredemptionsview button[tag=back]',
         closeBtn : 'clientredemptionsview button[tag=close]',
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
      var me = this;
      Ext.regStore('RedemptionRenderCStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false
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
            scope : me,
            'metachange' : function(store, proxy, eOpts)
            {
               this.onRedeemMetaChange(store, proxy.getReader().metaData);
            }
         }
      });

      this.callParent(arguments);
      console.log("Client Redemptions Init");
      //
      // Prelod Page
      //
      this.getRedemptions();
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var page = me.getRedemptions();

      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      me.exploreMode = !cvenue || (cvenue && (cvenue.getId() != venue.getId()));

      //activeItem.createView();
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
         //activeItem.getInnerItems()[i].setVisibility(false);
      }
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
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
      switch (this.getMode())
      {
         case 'redeem' :
         {
            if (!me.exploreMode)
            {
               var totalPts = viewport.getCustomer().get('points');
               var points = record.get('points');
               if (points > totalPts)
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Oops!',
                     message : me.needPointsMsg(points - totalPts)
                  });
               }
               else
               {
                  var controller = me.getApplication().getController('Prizes');
                  controller.fireEvent('redeemrewards', Ext.create('Genesis.model.EarnPrize',
                  {
                     //'id' : 1,
                     'expiry_date' : null,
                     'reward' : record,
                     'merchant' : viewport.getCheckinInfo().venue.getMerchant()
                  }));
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
            break;
         }
         case 'redeemSC' :
         {
            var controller = me.getApplication().getController('Prizes');
            controller.fireEvent('redeemrewards', Ext.create('Genesis.model.EarnPrize',
            {
               //'id' : 1,
               'expiry_date' : null,
               'reward' : record,
               'merchant' : viewport.getVenue().getMerchant()
            }));
            break;
         }
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
      if (metaData['account_points'])
      {
         cstore.getById(customerId).set('points', metaData['account_points']);
      }
      if (metaData['account_visits'])
      {
         cstore.getById(customerId).set('visits', metaData['account_visits']);
      }
   },
   onRedeemMetaChange : function(store, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.onRedeemCheckMetaData(metaData);

      if (metaData['data'])
      {
         var app = me.getApplication();
         var controller = app.getController('Prizes');
         controller.fireEvent('showQRCode', 0, metaData['data']);
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redemptionsPage : function()
   {
      this.openPage('redemptions');
      this.getCloseBtn().show();
      this.getBackBtn().hide();
   },
   redeemChooseSCPage : function()
   {
      var controller = this.getApplication().getController('client.Accounts');
      controller.redemptionsSCPage();
   },
   redemptionsSCPage : function()
   {
      this.openPage('redemptionsSC');
      this.getCloseBtn().hide();
      this.getBackBtn().show();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      var page = this.getRedemptions();
      return page;
   },
   openPage : function(subFeature)
   {
      var me = this;

      switch (subFeature)
      {
         case 'redemptionsSC':
         {
            me.setMode('redeemSC');
            var page = me.getRedemptions();
            me.setAnimationMode(me.self.superclass.self.animationMode['cover']);
            me.pushView(page);
            break;
         }
         case 'redemptions':
         {
            me.setMode('redeem');
            var page = me.getRedemptions();
            me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
            me.pushView(page);
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
