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
         'checkinexploreview' :
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
   init : function()
   {
      var me = this;
      //
      // Store storing the Venue checked-in / Explore
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
               // Load Prizes into DataStore
               var metaData = proxy.getReader().metaData;

               // Let Other event handlers udpate the metaData first ...
               Ext.defer(me.updateRewards, 1, me, [metaData]);
            }
         }

      });
      //
      // Store used for storing the current Customer Info, temporary basis
      //
      Ext.regStore('CheckinStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false,
         listeners :
         {
            'metachange' : function(store, proxy, eOpts)
            {
            }
         }
      });

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
      var cstore = Ext.StoreMgr.get('CheckinStore');
      var venueId = (viewport.getVenue() ? viewport.getVenue().getId() : null);

      console.debug("CheckIn - auth_code:'" + qrcode + "' venue_id:'" + venueId + "'");

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

      cstore.load(
      {
         jsonData :
         {
         },
         params : params,
         scope : me,
         callback : function(records, operation)
         {
            var metaData = cstore.getProxy().getReader().metaData;
            if(operation.wasSuccessful() && metaData)
            {
               me.onCheckinHandler(mode, metaData, cstore, venueId, records, operation, callback);
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
   onCheckinHandler : function(mode, metaData, cstore, venueId, records, operation, callback)
   {
      var app = this.getApplication();
      var custore = Ext.StoreMgr.get('CustomerStore');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var mcntlr = app.getController('Merchants');
      var viewport = this.getViewPortCntlr();
      var vport = this.getViewport();
      var showFeed = false;

      var record, customerId, customer, venue, points;
      for(var i = 0; i < records.length; i++)
      {
         record = records[i];
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
            //
            // Update our Database with the latest value from Server
            //
            if(Customer.isValidCustomer(customerId))
            {
               var customer = custore.getById(customerId);
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

            this.setupCheckinInfo(mode, venue, customer || record, metaData);
            break;
         }
      }
      // Cannot find match?
      if(i > records.length)
      {
         console.debug("CheckIn - No Merchants Found!");
         return;
      }

      console.debug("CheckIn - Opening Merchant Account Page ...");

      //
      // Cleans up Back Buttons on Check-in
      //
      this.popView();
      vport.reset();
      vport.setCubeAnimation();
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
         me.getGeoLocation();
      }
   },
   onExploreActivate : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var checkinContainer = me.getCheckInNowBar();

      me.onExploreLoad();
      switch (me.mode)
      {
         case 'checkin':
            checkinContainer.setDisabled(true);
            checkinContainer.show();
            break;
         case 'explore' :
            checkinContainer.hide();
            break;
      }
   },
   onExploreDeactivate : function()
   {
   },
   onExploreSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onExploreDisclose(d, model);
      return false;
   },
   onExploreDisclose : function(list, record, target, index, e, eOpts, eInfo)
   {
      this.getViewPortCntlr().setVenue(record);

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
   openPage : function(subFeature)
   {
      var page = this.getMainPage();
      // Hack to fix bug in Sencha Touch API
      var plugin = page.query('list')[0].getPlugins()[0];
      plugin.refreshFn = plugin.getRefreshFn();

      this.mode = page.mode = subFeature;
      this.pushView(page);
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
