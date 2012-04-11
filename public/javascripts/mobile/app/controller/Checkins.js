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
   init : function()
   {
      //
      // Store storing the Venue checked-in / Explore
      //
      Ext.regStore('CheckinExploreStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false,
         listeners :
         {
            'metachange' : function(store, proxy, eOpts)
            {
               // Load Prizes into DataStore
               var metaData = proxy.getReader().metaData;

               //
               // Update Eligible Rewards
               //
               var rewards = metaData['eligible_rewards'];
               if(rewards)
               {
                  console.debug("Total Eligible Rewards - " + rewards.length);
                  var estore = Ext.StoreMgr.get('EligibleRewardsStore');
                  estore.setData(rewards);
               }
            }
         }

      });
      //
      // Store used for storing Customer Info
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
   onCheckInScanNow : function(b, e, eOpts, eInfo, mode, url, type, callback)
   {
      mode = mode || 'checkin';
      url = url || 'setVenueCheckinUrl';
      type = type || 'scan'
      var qrcode;
      var me = this;

      switch(type)
      {
         case 'scan' :
            me.scanQRCode(
            {
               callback : function(response)
               {
                  if(response)
                  {
                     Ext.Viewport.setMasked(
                     {
                        xtype : 'loadmask',
                        message : 'Checking in ...'
                     });

                     var qrcode = response.responseCode || '';
                     console.debug("qrcode - " + qrcode);
                     // Retrieve GPS Coordinates
                     me.onCheckinCommonTap(b, e, eOpts, mode, url, qrcode, me.getPosition(), callback);
                  }
                  else
                  {
                     console.debug("No QR Code Scanned!");
                     Ext.device.Notification.show(
                     {
                        title : 'Warning',
                        message : 'No QR Code Scanned!'
                     });
                  }
               }
            });
            break;
         default:
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : 'Retrieving Merchant Info'
            });
            this.onCheckinCommonTap(b, e, eOpts, mode, url, "", null, callback);
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
      this.getExplore().setMerchant(null);
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

      var record, customerId, customer, venue, points;
      if(operation.wasSuccessful() && metaData)
      {
         for(var i = 0; i < records.length; i++)
         {
            record = records[i];
            customerId = record.getId();
            points = record.get('points');
            var new_venueId = metaData['venue_id'] || cestore.first().getId();
            venue = cestore.getById(new_venueId);
            customer = cstore.getById(customerId);

            // Find Matching Venue or pick the first one returned if no venueId is set
            console.debug("CheckIn - new_venueId:'" + new_venueId + "' venue_id:'" + venueId + "'");
            if((new_venueId == venueId) || (venueId == null))
            {
               //
               // Update our Database with the latest value from Server
               //
               var crecord = custore.getById(customerId);
               if(crecord != null)
               {
                  crecord.set('points', points);
                  crecord.setLastCheckin(record.getLastCheckin());
               }
               //
               // First time Customer ... add it to CustomerStore
               //
               else
               {
                  crecord = custore.add(record)[0];
                  console.debug("CheckIn - Not in current Customer DB! CustomerId=[" + crecord.getId() + "]");
               }
               console.debug("CheckIn - points:'" + points + "'");

               this.setupCheckinInfo(mode, venue, crecord, metaData);
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
         this.getViewport().reset();
         Ext.Viewport.setMasked(false);

         app.dispatch(
         {
            action : 'openMainPage',
            args : [],
            controller : mcntlr,
            scope : mcntlr
         });

         if(callback)
         {
            callback();
         }
         console.debug("CheckIn - Done");
      }
   },
   // --------------------------------------------------------------------------
   // CheckinExplore Page
   // --------------------------------------------------------------------------
   onExploreLoad : function()
   {
      var me = this;
      me.getGeoLocation(function(position)
      {
         me.setPosition(position);
         Venue['setFindNearestURL']();
         Ext.StoreMgr.get('CheckinExploreStore').load(
         {
            params :
            {
               latitude : position.coords.latitude,
               longitude : position.coords.longitude
            },
            callback : function(records, operation)
            {
               if(operation.wasSuccessful())
               {
                  me.getCheckInNowBar().setDisabled(false);
               }
            },
            scope : me
         });
      });
   },
   onExploreActivate : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      me.getExplore().setMerchant(null);

      me.onExploreLoad();
      switch (me.mode)
      {
         case 'checkin':
            me.getCheckInNowBar().show();
            me.getCheckInNowBar().setDisabled(true);
            break;
         case 'explore' :
            me.getCheckInNowBar().hide();
            break;
      }
      //var cvenue = viewport.getCheckinInfo().venue;
      //var venue = viewport.getVenue();
      //me.getMainBtn()[(cvenue && (venue.getId() != cvenue.getId())) ? 'show' : 'hide']();
      //
      // Scroll to the Top of the Screen
      //
      //this.getExplore().getScrollable().getScroller().scrollTo(0, 0);
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
      this.getExplore().setMerchant( record ? record.getMerchant() : null);
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
   onCheckinCommonTap : function(b, e, eOpts, mode, url, qrcode, position, callback)
   {
      var currentLat, currentLng;
      if(position)
      {
         currentLat = position.coords.latitude
         currentLng = position.coords.longitude;
      }

      var viewport = this.getViewPortCntlr();
      var cstore = Ext.StoreMgr.get('CheckinStore');
      var cview = this.getViewport().getActiveItem();
      var venueId = (viewport.getVenue() ? viewport.getVenue().getId() : null);

      console.debug("CheckIn - auth_code:'" + qrcode + "' venue_id:'" + venueId + "'");

      // Load Info into database
      Customer[url](venueId);
      var params =
      {
         latitude : currentLat || 0,
         longitude : currentLng || 0,
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
         scope : this,
         callback : function(records, operation)
         {
            this.onCheckinHandler(mode, cstore.getProxy().getReader().metaData, cstore, venueId, records, operation, callback);
         }
      });
   },
   onCheckinScanTap : function(b, e, eOpts, einfo)
   {
      //
      // Clear Venue info, let server determine from QR Code
      //
      this.getExplore().setMerchant(null);
      this.getViewPortCntlr().setVenue(null);
      // Scan QR Code to confirm Checkin
      this.onCheckInScanNow(b, e, eOpts, einfo, 'checkin', 'setVenueScanCheckinUrl', 'scan', function()
      {
         Ext.device.Notification.vibrate();
      });
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
