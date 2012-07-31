Ext.define('Genesis.controller.client.RedeemBase',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
   },
   xtype : 'clientRedemptionsBaseCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
   },
   //orderTitle : 'Rewards List',
   //checkoutTitle : 'Check Out',
   needPointsMsg : function(pointsDiff)
   {
      return ('You need ' + pointsDiff + ' more points ' + Genesis.constants.addCRLF() + 'to be eligible for this item.');
   },
   retrievingQRCodeMsg : 'Retrieving QRCode ...',
   showQrCodeMsg : 'Show this Authorization Code to your server to redeem!',
   redeemItemConfirmMsg : 'Please confim to redeem this item',
   init : function()
   {
      var me = this;
      Ext.regStore(me.getRenderStore(),
      {
         model : 'Genesis.model.Customer',
         autoLoad : false
      });
      Ext.regStore(me.getRedemptionsStore(),
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
               me.getViewPortCntlr().updateMetaDataTask.delay(0.1 * 1000, me.updateMetaData, me, [metaData]);
            }
         }
      });

      this.callParent(arguments);
      console.log("Client Redemptions Init");
      //
      // Prelod Page
      //
      //
      // Preloading Pages to memory
      //
      Ext.defer(function()
      {
         me.getRedeemItem();
         me.getRedemptions();
      }, 1, me);
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var page = me.getRedemptions();

      var viewport = me.getViewPortCntlr();
      var customer = viewport.getCustomer();
      var rstore = Ext.StoreMgr.get(me.getRenderStore());
      //
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      me.exploreMode = !cvenue || (cvenue && (cvenue.getId() != venue.getId()));

      // Update Customer info
      if (customer != rstore.getRange()[0])
      {
         rstore.setData(customer);
      }
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
         case 'redeemBrowse' :
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
                  me.fireEvent('showredeemitem', record);
                  /*
                   Ext.create('Genesis.model.EarnPrize',
                   {
                   //'id' : 1,
                   'expiry_date' : null,
                   'reward' : record,
                   'merchant' : viewport.getCheckinInfo().venue.getMerchant()
                   }));
                   */
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
         case 'redeemBrowseSC' :
         {
            var controller = me.getApplication().getController('client.Prizes');
            controller.fireEvent('redeemitem', record);
            /*
             Ext.create('Genesis.model.EarnPrize',
             {
             //'id' : 1,
             'expiry_date' : null,
             'reward' : record,
             'merchant' : viewport.getVenue().getMerchant()
             }));
             */
            break;
         }
      }
      return true;
   },
   updateMetaData : function(metaData)
   {
      var me = this;
      var data = metaData['data'] || null;

      metaData['data'] = null;
      me.callParent(arguments);
      metaData['data'] = data;

      //
      // Claim Reward Item by showing QRCode to server!
      //
      if (metaData['data'])
      {
         me.fireEvent('showQRCode', 0, metaData['data']);
      }
   },
   // --------------------------------------------------------------------------
   // Handler Functions
   // --------------------------------------------------------------------------
   onRedeemItemTap : function(b, e, eOpts, eInfo)
   {
      var me = this, venue = null;
      var view = me.getMainPage();
      var bypass = false;
      var title = view.query('titlebar')[0].getTitle();

      switch (me.getMode())
      {
         /*
          case 'redeemPrize' :
          {
          me.merchantId = view.getInnerItems()[0].getStore().first().getMerchant().getId();
          break;
          }
          */
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            bypass = me.getMode() == 'redeemBrowseSC';
         }
         default :
            var viewport = me.getViewPortCntlr();
            venue = viewport.getVenue();
            var cvenue = viewport.getCheckinInfo().venue;

            if (!bypass && (!cvenue || !venue || (venue.getId() != cvenue.getId())))
            {
               Ext.device.Notification.show(
               {
                  title : title,
                  message : me.checkinFirstMsg
               });
               return;
            }
            break;
      }
      Ext.device.Notification.show(
      {
         title : title,
         message : me.redeemItemConfirmMsg,
         buttons : ['Confirm', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'confirm')
            {
               me.fireEvent('redeemitem', b, venue, view);
            }
         }
      });
   },
   onRedeemItem : function(btn, venue, view)
   {
      var me = this;
      var venueId = (venue) ? venue.getId() : 0;
      var item = view.getInnerItems()[0];
      var store = me.getredemptionsStore();

      CustomerReward[me.getRedeemPointsFn()](item.getStore().first().getId());

      btn.hide();
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.retrievingQRCodeMsg
      });
      Ext.StoreMgr.get(store).load(
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId
         },
         callback : function(records, operation)
         {
            if (!operation.wasSuccessful())
            {
               Ext.Viewport.setMasked(false);
               btn.show();
            }
         }
      });
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();

      var tbbar = activeItem.query('titlebar')[0];
      var photo = me.redeemItem.get('photo');
      me.getSCloseBB().show();
      //me.getSBB().hide();
      tbbar.setTitle(me.getTitle());
      tbbar.removeCls('kbTitle');
      me.getRefreshBtn()['hide']();
      me.getVerifyBtn()['hide']();
      me.getSRedeemBtn().show();

      view.redeemItem = me.redeemItem;
      console.log("RewardItem View - Updated RewardItem View.");
      Ext.defer(function()
      {
         //activeItem.createView();
         delete me.redeemItem;
      }, 1, activeItem);
      //view.createView();
      //delete me.redeemItem;
   },
   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;
      var view = me.getMainPage();
      
      if (view.isPainted() && !view.isHidden())
      {
         me.getSDoneBtn().hide();
         me.getSRedeemBtn().hide();
         me.popView();
      }
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   onShowItemQRCode : function(timeout, qrcode)
   {
      var me = this;
      var title = 'Redeem ' + me.getTitle();

      console.log("\n" + //
      "Encrypted Code :\n" + qrcode + "\n" + //
      "Encrypted Code Length: " + qrcode.length);

      qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      if (qrcode[0])
      {
         var dom = Ext.DomQuery.select('div.itemPoints',me.getRedeemItem().element.dom)[0];
         me.getSRedeemBtn().hide();
         me.getSDoneBtn().show();
         me.getSCloseBB().hide();
         if (dom)
         {
            Ext.fly(dom).addCls('x-item-hidden');
         }

         me.fireEvent('refreshQRCode', qrcode);

         Ext.Viewport.setMasked(false);
         Ext.device.Notification.show(
         {
            title : title,
            message : me.showQrCodeMsg
         });
         Ext.device.Notification.vibrate();
      }
   },
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getMainPage();
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getInnerItems()[0];
      var photo = item.query('component[tag=itemPhoto]')[0];
      photo.element.setStyle(
      {
         'background-image' : 'url(' + qrcodeMeta[0] + ')',
         'background-size' : Genesis.fn.addUnit(qrcodeMeta[1]) + ' ' + Genesis.fn.addUnit(qrcodeMeta[2])
      });
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemBrowsePage : function()
   {
      this.openPage('redeemBrowse');
      this.getCloseBtn().show();
      this.getBackBtn().hide();
   },
   redeemBrowseSCPage : function()
   {
      this.openPage('redeemBrowseSC');
      this.getCloseBtn().hide();
      this.getBackBtn().show();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      var me = this;
      var page;
      switch (me.getMode())
      {
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
            page = me.getRedeemItem();
            break;
         }
         case 'redeemBrowse' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['cover']);
            page = me.getRedemptions();
            break;
         }
         case 'redeemBrowseSC' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
            page = me.getRedemptions();
            break;
         }
      }

      return page;
   },
   openPage : function(subFeature)
   {
      var me = this;

      me.setMode(subFeature);
      me.pushView(me.getMainPage());
   },
   isOpenAllowed : function()
   {
      // VenueId can be found after the User checks into a venue
      return ((this.getViewPortCntlr().getVenue()) ? true : "You need to Explore or Check-in to a Venue first");
   }
});