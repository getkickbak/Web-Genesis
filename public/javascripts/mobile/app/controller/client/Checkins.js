Ext.define('Genesis.controller.client.Checkins',
{
   extend : 'Genesis.controller.ControllerBase',
   inheritableStatics :
   {
   },
   xtype : 'clientcheckinsCntlr',
   config :
   {
      models : ['Venue'],
      routes :
      {
         'checkin' : 'checkinPage'
      },
      refs :
      {
      },
      control :
      {
      },
      listeners :
      {
         'checkin' : 'onCheckinTap',
         'checkinScan' : 'onCheckinScanTap',
         'checkinMerchant' : 'onCheckinHandler',
         'setupCheckinInfo' : 'onSetupCheckinInfo'
      },
      position : null
   },
   metaDataMissingMsg : 'Missing Checkin MetaData information.',
   init : function()
   {
      var me = this;
      me.callParent(arguments);
      console.log("Checkins Init");
   },
   checkinCommon : function(qrcode)
   {
      var me = this, viewport = me.getViewPortCntlr(), venueId = null;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var mode = me.callback['mode'], url = me.callback['url'];
      var position = me.callback['position'], callback = me.callback['callback'];

      switch (me.callback['url'])
      {
         case 'setVenueScanCheckinUrl' :
         {
            break;
         }
         default:
            venueId = (viewport.getVenue() ? viewport.getVenue().getId() : null);
            break;
      }

      // Load Info into database
      Customer[url](venueId);
      var params =
      {
         latitude : (position) ? position.coords.getLatitude() : 0,
         longitude : (position) ? position.coords.getLongitude() : 0,
         auth_code : qrcode || 0
      }
      if (venueId)
      {
         params = Ext.apply(params,
         {
            venue_id : venueId
         });
      }

      console.debug("CheckIn - auth_code:'" + qrcode + "' venue_id:'" + venueId + "'");

      cstore.load(
      {
         addRecords : true,
         jsonData :
         {
         },
         params : params,
         scope : me,
         callback : function(records, operation)
         {
            var metaData = Customer.getProxy().getReader().metaData;
            if (operation.wasSuccessful() && metaData)
            {
               me.fireEvent('checkinMerchant', mode, metaData, venueId, records[0], operation, callback);
            }
            else if (!operation.wasSuccessful() && !metaData)
            {
               console.debug(me.metaDataMissingMsg);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Common Functions
   // --------------------------------------------------------------------------
   onCheckInScanNow : function(b, e, eOpts, eInfo, mode, url, type, callback)
   {
      var me = this;

      switch(type)
      {
         case 'scan' :
         {
            me.callback =
            {
               mode : mode,
               position : me.getPosition(),
               url : url,
               type : type,
               callback : callback
            };
            me.scanQRCode();
            break;
         }
         default:
            me.callback =
            {
               mode : mode,
               position : me.getPosition(),
               url : url,
               type : '',
               callback : callback
            };
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.getMerchantInfoMsg
            });
            me.checkinCommon(null);
            break;
      }
      me.setPosition(null);
   },
   onSetupCheckinInfo : function(mode, venue, customer, metaData)
   {
      var viewport = this.getViewPortCntlr();

      viewport.setVenue(venue);
      viewport.setCustomer(customer);
      viewport.setMetaData(metaData);

      switch (mode)
      {
         case 'checkin' :
         {
            viewport.setCheckinInfo(
            {
               venue : viewport.getVenue(),
               customer : viewport.getCustomer(),
               metaData : viewport.getMetaData()
            });
            /*
             if (venue)
             {
             Genesis.db.setLocalDBAttrib('last_check_in',
             {
             venue : viewport.getVenue().raw,
             customerId : viewport.getCustomer().getId(),
             metaData : viewport.getMetaData()
             });
             }
             else
             {
             Genesis.db.removeLocalDBAttrib('last_check_in');
             }
             */
            break;
         }
      }
   },
   onCheckinScanTap : function(b, e, eOpts, einfo)
   {
      // Scan QR Code to confirm Checkin
      this.onCheckInScanNow(b, e, eOpts, einfo, 'checkin', 'setVenueScanCheckinUrl', 'scan', Ext.emptyFn);
   },
   onCheckinTap : function(promotion)
   {
      var me = this;

      if (promotion)
      {
         var controller = me.getApplication().getController('client' + '.Merchants');
         var page = controller.getMain();
         page.promotion = true;
      }

      // Checkin directly to Venue
      me.onCheckInScanNow(null, null, null, null, 'checkin', 'setVenueCheckinUrl', 'noscan', Ext.emptyFn);
   },
   onCheckinHandler : function(mode, metaData, venueId, record, operation, callback)
   {
      var me = this;
      var app = me.getApplication();
      var custore = Ext.StoreMgr.get('CustomerStore');
      var mcntlr = app.getController('client.Merchants');
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var sync = false, checkinMode = false, redeemmode = false;

      var customerId, customer, venue, points;
      customerId = record.getId();
      points = record.get('points');
      callback = callback || Ext.emptyFn;

      // Find venueId from metaData or from DataStore
      var new_venueId = metaData['venue_id'] || 0;
      // Find venue from DataStore or current venue info
      venue = viewport.getVenue();

      // Find Matching Venue or pick the first one returned if no venueId is set
      console.debug("CheckIn - new_venueId:'" + new_venueId + //
      "' venue_id:'" + venueId + //
      "' points:'" + points + "'");
      if ((new_venueId == venueId) || (venueId == null))
      {
         checkinMode = (mode == 'checkin');
         redeemMode = (mode == 'redemption');
         //
         // Update our Database with the latest value from Server
         //
         if (Customer.isValid(customerId))
         {
            customer = custore.getById(customerId);
            console.debug("Checking In Venue ...");
         }
         else
         {
            console.debug("Exploring Venue ...");
         }

         me.fireEvent('setupCheckinInfo', mode, venue, customer || record, metaData);
         me.fireEvent('updatemetadata', metaData);
      }
      else
      {
         console.debug("CheckIn - venueIDs do not match!");
      }

      //
      // Cleans up Back Buttons on Check-in
      //
      switch(mode)
      {
         case 'checkin' :
         {
            me.resetView();
            Ext.Viewport.setMasked(null);
            me.redirectTo('venue/' + venue.getId() + '/' + customerId);
            break;
         }
      }

      callback();

      if (checkinMode || redeemMode)
      {
         /*
          if (checkinMode)
          {
          // Let the screen complete the rendering process
          Ext.defer(me.checkReferralPrompt, 0.1 * 1000, me, [
          function()
          {
          //
          // We are in Merchant Account screen,
          // there's nothing to do after Successful Referral Challenge
          //
          //me.popView();
          Ext.device.Notification.show(
          {
          title : 'Successful Referral!',
          message : me.recvReferralb4VisitMsg(customer.getMerchant().get('name')),
          buttons : ['Dismiss']
          });
          }, null]);
          }
          */
         console.debug("CheckIn - Complete");
      }
      else
      {
         console.debug("CheckInExplore - Complete");
      }
   },
   // --------------------------------------------------------------------------
   // CheckinExplore Page
   // --------------------------------------------------------------------------
   onExploreDisclose : function(list, record, target, index, e, eOpts, eInfo)
   {
      var me = this, viewport = me.getViewPortCntlr(), record = new Ext.create('Genesis.model.Venue', record);

      me.self.playSoundFile(viewport.sound_files['clickSound']);
      viewport.setVenue(record);
      me.onCheckinTap(null, e, eOpts, eInfo);
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   checkinPage : function()
   {
      window.parent.setChildBrowserVisibility(false, 'explore');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   isOpenAllowed : function()
   {
      return true;
   }
});
