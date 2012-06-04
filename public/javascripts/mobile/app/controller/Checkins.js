Ext.define('Genesis.controller.Checkins',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
      checkin_path : '/checkin'
   },
   xtype : 'checkinsCntlr',
   config :
   {
      refs :
      {
         backBtn : 'checkinexploreview button[tag=back]',
         closeBtn : 'checkinexploreview button[tag=close]',
         explore :
         {
            selector : 'checkinexploreview',
            autoCreate : true,
            xtype : 'checkinexploreview'
         },
         checkInNowBar : 'checkinexploreview container[tag=checkInNow]',
         shareBtn : 'viewportview button[tag=shareBtn]'
      },
      control :
      {
         //
         // Checkin Explore
         //
         explore :
         {
            activate : 'onExploreActivate',
            deactivate : 'onExploreDeactivate'
         },
         'checkinexploreview list' :
         {
            select : 'onExploreSelect',
            disclose : 'onExploreDisclose'
         }
      },
      models : ['Venue', 'Merchant', 'EarnPrize'],
      position : null,
   },
   metaDataMissingMsg : 'Missing Checkin MetaData information.',
   noCheckinCodeMsg : 'No Checkin Code found!',
   getMerchantInfoMsg : 'Retrieving Merchant Info ...',
   loadingPlaces : 'Loading ...',
   init : function()
   {
      var me = this;
      //
      // Store storing the Venue object for Checked-In / Explore views
      //
      Ext.regStore('CheckinExploreStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false,
         sorters : [
         {
            property : 'distance',
            direction : 'ASC'
         }],
         listeners :
         {
            'metachange' : function(store, proxy, eOpts)
            {
               // Let Other event handlers udpate the metaData first ...
               me.getViewPortCntlr().updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [proxy.getReader().metaData]);
            }
         }

      });
      this.callParent(arguments);
      console.log("Checkins Init");
   },
   // --------------------------------------------------------------------------
   // Common Functions
   // --------------------------------------------------------------------------
   onCheckinCommonTap : function(qrcode)
   {
      var me = this;
      var mode = me.callback['mode'];
      var url = me.callback['url'];
      var position = me.callback['position'];
      var callback = me.callback['callback'];
      var viewport = me.getViewPortCntlr();
      var venueId = (viewport.getVenue() ? viewport.getVenue().getId() : null);

      // Load Info into database
      Customer[url](venueId);
      var params =
      {
         latitude : (position) ? position.coords.getLatitude() : 0,
         longitude : (position) ? position.coords.getLongitude() : 0,
         auth_code : qrcode || 0
      }
      if(venueId)
      {
         params = Ext.apply(params,
         {
            venue_id : venueId
         });
      }

      console.debug("CheckIn - auth_code:'" + qrcode + "' venue_id:'" + venueId + "'");

      Customer.load(venueId,
      {
         jsonData :
         {
         },
         params : params,
         scope : me,
         callback : function(record, operation)
         {
            var metaData = Customer.getProxy().getReader().metaData;
            if(operation.wasSuccessful() && metaData)
            {
               me.onCheckinHandler(mode, metaData, venueId, record, operation, callback);
            }
            else
            if(!operation.wasSuccessful() && !metaData)
            {
               console.log(me.metaDataMissingMsg);
            }
         }
      });
   },
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      if(qrcode)
      {
         console.log(me.checkinMsg);
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.checkinMsg
         });

         // Retrieve GPS Coordinates
         me.onCheckinCommonTap(qrcode);
      }
      else
      {
         console.debug(me.noCheckinCodeMsg);
         Ext.Viewport.setMasked(false);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.noCheckinCodeMsg
         });
      }
   },
   onCheckInScanNow : function(b, e, eOpts, eInfo, mode, url, type, callback)
   {
      var me = this;

      switch(type)
      {
         case 'scan' :
            me.callback =
            {
               mode : mode,
               url : url,
               type : type,
               callback : callback
            };
            me.scanQRCode();
            break;
         default:
            me.callback =
            {
               mode : mode,
               url : url,
               type : '',
               callback : callback
            };
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.getMerchantInfoMsg
            });
            me.onCheckinCommonTap(null);
            break;
      }
   },
   setupCheckinInfo : function(mode, venue, customer, metaData)
   {
      var viewport = this.getViewPortCntlr();
      viewport.setVenue(venue)
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
            break;
         }
         default :
            break;
      }
   },
   onCheckinScanTap : function(b, e, eOpts, einfo)
   {
      //
      // Clear Venue info, let server determine from QR Code
      //
      this.getViewPortCntlr().setVenue(null);

      // Scan QR Code to confirm Checkin
      this.onCheckInScanNow(b, e, eOpts, einfo, 'checkin', 'setVenueScanCheckinUrl', 'scan', function()
      {
         Ext.device.Notification.vibrate();
      });
   },
   onCheckinTap : function(b, e, eOpts, einfo)
   {
      // Scan QR Code to confirm Checkin
      this.onCheckInScanNow(b, e, eOpts, einfo, 'checkin', 'setVenueCheckinUrl', 'scan', function()
      {
         Ext.device.Notification.vibrate();
      });
   },
   onNonCheckinTap : function(b, e, eOpts, einfo, callback)
   {
      // No scanning required
      this.onCheckInScanNow(b, e, eOpts, einfo, 'explore', 'setVenueExploreUrl', 'noscan', callback);
   },
   onCheckinHandler : function(mode, metaData, venueId, record, operation, callback)
   {
      var me = this;
      var app = me.getApplication();
      var custore = Ext.StoreMgr.get('CustomerStore');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var mcntlr = app.getController('Merchants');
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var showFeed = false, checkinMode = false;

      var customerId, customer, venue, points;
      customerId = record.getId();
      points = record.get('points');

      // Find venueId from metaData or from DataStore
      var new_venueId = metaData['venue_id'] || cestore.first().getId();
      // Find venue from DataStore or current venue info
      venue = cestore.getById(new_venueId) || viewport.getVenue();

      // Find Matching Venue or pick the first one returned if no venueId is set
      console.debug("CheckIn - new_venueId:'" + new_venueId + "' venue_id:'" + venueId + "'");
      if((new_venueId == venueId) || (venueId == null))
      {
         checkinMode = (mode == 'checkin');
         //
         // Update our Database with the latest value from Server
         //
         if(Customer.isValidCustomer(customerId))
         {
            customer = custore.getById(customerId);
            if(customer != null)
            {
               Customer.updateCustomer(customer, record);
               //customer = custore.add(record)[0];
               console.debug("Customer ID=[" + customer.getId() + "] is in CustAcct Database");
               showFeed = true;
            }
            //
            // First time Customer ... add it to CustomerStore
            //
            else
            {
               customer = custore.add(record)[0];
               console.debug("Customer ID=[" + customer.getId() + "] is ADDED to CustAcct Database");
            }
         }
         else
         {
            console.debug("Exploring Venue ...");
         }
         console.debug("CheckIn - points:'" + points + "'");

         me.setupCheckinInfo(mode, venue, customer || record, metaData);
      }

      console.debug("CheckIn - Opening Merchant Account Page ...");

      //
      // Cleans up Back Buttons on Check-in
      //
      me.resetView();
      Ext.Viewport.setMasked(false);

      app.dispatch(
      {
         action : 'openMainPage',
         args : [showFeed],
         controller : mcntlr,
         scope : mcntlr
      });

      if(callback)
      {
         callback();
      }

      if(checkinMode)
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
               message : me.recvReferralb4VisitMsg(customer.getMerchant().get('name'))
            });
         }, null]);
      }
      console.debug("CheckIn - Done");
   },
   // --------------------------------------------------------------------------
   // CheckinExplore Page
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this;
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var checkinContainer = me.getCheckInNowBar();

      Venue['setFindNearestURL']();
      cestore.load(
      {
         params :
         {
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(records, operation)
         {
            //Ext.Viewport.setMasked(false);
            if(operation.wasSuccessful())
            {
               me.setPosition(position);
               checkinContainer.setDisabled(false);
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Warning',
                  message : me.missingVenueInfoMsg
               });
            }
         },
         scope : me
      });
   },
   onExploreLoad : function(forceReload)
   {
      var me = this;
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      //
      // Do not reload page unless this is the first time!
      // Saves bandwidth
      //
      if((cestore.getCount() == 0) || forceReload)
      {
         /*
          Ext.Viewport.setMasked(
          {
          xtype : 'loadmask',
          message : me.loadingPlaces
          });
          */
         me.getGeoLocation();
      }
   },
   onExploreActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      var viewport = me.getViewPortCntlr();
      var checkinContainer = me.getCheckInNowBar();
      var tbbar = activeItem.query('titlebar')[0];

      switch (me.animMode)
      {
         case 'slide' :
            me.getBackBtn().show();
            me.getCloseBtn().hide();
            break;
         case 'slideUp' :
            me.getBackBtn().hide();
            me.getCloseBtn().show();
            break;
      }
      switch (me.mode)
      {
         case 'checkin':
            tbbar.setTitle('Nearby Places');
            checkinContainer.setDisabled(true);
            checkinContainer.show();
            break;
         case 'explore' :
            tbbar.setTitle('Explore Places');
            checkinContainer.hide();
            break;
      }
      me.onExploreLoad();
   },
   onExploreDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   onExploreSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onExploreDisclose(d, model);
      return false;
   },
   onExploreDisclose : function(list, record, target, index, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      viewport.setVenue(record);
      switch (this.mode)
      {
         case 'checkin':
         {
            this.onCheckinTap(null, e, eOpts, eInfo);
            break;
         }
         case 'explore' :
         {
            this.onNonCheckinTap(null, e, eOpts, eInfo);
            break;
         }
      }
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, mode)
   {
      var me = this;
      var page = me.getMainPage();
      me.mode = page.mode = subFeature;
      me.animMode = mode || 'slide';
      me.setAnimationMode(me.self.superclass.self.animationMode[me.animMode]);
      me.pushView(page);
   },
   getMainPage : function()
   {
      return this.getExplore();
   },
   openMainPage : function()

   {
      var page = this.getMainPage();
      // Hack to fix bug in Sencha Touch API
      var plugin = page.query('list')[0].getPlugins()[0];
      plugin.refreshFn = plugin.getRefreshFn();

      this.pushView(page);
      console.log("Checkin Explore Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
