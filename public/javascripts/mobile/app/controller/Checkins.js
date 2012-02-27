Ext.define('Genesis.controller.Checkins',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
      checkin_path : '/checkin',
      googleMapStaticUrl : 'http://maps.googleapis.com/maps/api/staticmap'
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
         checkinMerchant :
         {
            selector : 'checkinmerchantview',
            autoCreate : true,
            xtype : 'checkinmerchantview'
         },
         checkinBtn : 'checkinmerchantview button[tag=checkinBtn]',
         exploreBtn : 'checkinmerchantview button[tag=exploreBtn]',
         checkInNowBar : 'checkinexploreview container[tag=checkInNow]',
         shareBtn : 'viewportview button[tag=shareBtn]',
         mainBtn : 'viewportview button[tag=main]'
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
         'checkinexploreview button[tag=checkInNow]' :
         {
            tap : 'onCheckinScanTap'
         },
         'checkinexploreview list' :
         {
            select : 'onExploreSelect',
            disclose : 'onExploreDisclose'
         },
         //
         // Checkin Merchant Page
         //
         'checkinmerchantview' :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'checkinmerchantview button[tag=checkinBtn]' :
         {
            tap : 'onCheckinTap'
         },
         'checkinmerchantview button[tag=exploreBtn]' :
         {
            tap : 'onNonCheckinTap'
         },
         'checkinmerchantview map' :
         {
            maprender : 'onMapRender'
         },
         'checkinmerchantview component[tag=map]' :
         {
            widthchange : 'onMapWidthChange'
         }
      }
   },
   models : ['Venue', 'Merchant'],
   init : function()
   {
      //
      // Clears all Markers on Google Map
      //
      this.markersArray = [];
      if(window.google && window.google.maps && window.google.maps.Map)
      {
         google.maps.Map.prototype.clearOverlays = Ext.bind(function()
         {
            if(this.markersArray)
            {
               for(var i = 0; i < this.markersArray.length; i++)
               {
                  this.markersArray[i].setMap(null);
               }
            }
         }, this);
      }
      else
      {
         console.log("Google Maps API cannot be instantiated");
      }
      //
      // Store storing the Venue checked-in / Explore
      //
      Ext.regStore('CheckinExploreStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });

      Ext.StoreMgr.get('EligibleRewardsStore').on('metachange', function(store, proxy, eOpts)
      {
         var venueId;
         //
         // To-do : Used our own VenueId for now, remote VenueId after full integration
         //
         venueId = (!Ext.isDefined(this.getCheckinMerchant().venueId)) ? proxy.getReader().metaData['venue_id'] : this.getCheckinMerchant().venueId;
         var record = Ext.StoreMgr.get('CheckinExploreStore').getById(venueId);

         //store.getProxy().getReader().rawData.metaData = record;
         // Update Metadata
         proxy.getReader().metaData = record;
         this.setupVenueInfoCommon(record);
      }, this);

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
      var viewport = this.getViewport();

      switch(type)
      {
         case 'scan' :
            this.scanQRCode(
            {
               callback : Ext.bind(function(response)
               {
                  if(response)
                  {
                     Ext.Viewport.setMasked(
                     {
                        xtype : 'loadmask',
                        message : 'Checking in ...'
                     });

                     var qrcode = response.responseCode;
                     console.log("response - " + response);
                     // Retrieve GPS Coordinates
                     this.getGeoLocation(Ext.bind(function(position)
                     {
                        this.onCheckinCommonTap(b, e, eOpts, mode, url, qrcode, position, callback);
                     }, this));
                  }
                  else
                  {
                     console.log("No QR Code Scanned!");
                     Ext.device.Notification.show(
                     {
                        title : 'Warning',
                        message : 'No QR Code Scanned!'
                     });
                  }
               }, this)
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
   // --------------------------------------------------------------------------
   // CheckinExplore Page
   // --------------------------------------------------------------------------
   setupVenueInfoCommon : function(record)
   {
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var vstore = Ext.StoreMgr.get('VenueStore');

      cstore.clearFilter();
      vstore.setData([record],
      {
         addRecords : false
      });
   },
   setupVenueInfo : function(record)
   {
      this.setupVenueInfoCommon(record);

      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = cstore.getById(record.getMerchant().getId()).get('user_id');
      this.setVenueInfo(record.getId(), customerId);
   },
   onExploreActivate : function()
   {
      var viewport = this.getViewport();

      Ext.StoreMgr.get('CheckinExploreStore').load(
      {
         callback : function(records, operation, success)
         {
            if(success)
            {
               this.getCheckInNowBar().setDisabled(true);
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Warning',
                  message : 'Error loading Nearby Venues'
               });
            }
         },
         scope : this
      });
      switch (this.mode)
      {
         case 'checkin':
            this.getCheckInNowBar().show();
            this.getCheckInNowBar().setDisabled(true);
            break;
         case 'explore' :
            this.getCheckInNowBar().hide();
            break;
      }
      var cvenueId = viewport.getCheckinInfo().venueId;
      this.getMainBtn()[(cvenueId > 0) ? 'show' : 'hide']();
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
   onExploreDisclose : function(list, record, target, index, e, eOpts)
   {
      var gm = (window.google && window.google.maps && window.google.maps.LatLng) ? window.google.maps : null;
      //
      // Loads currently checked-in / explore Venue into the store
      //
      /*
       if(gm)
       {
       this.latLng = new gm.LatLng(record.get('latitude'), record.get('longtitude'));
       this.markerOptions =
       {
       position : this.latLng,
       title : record.get('name')
       }
       }
       else
       */
      {
         this.latLng = record.get('latitude') + ',' + record.get('longtitude');
         this.markerOptions =
         {
            center : this.latLng,
            title : record.get('name')
         }
         console.log("Cannot Retrieve Google Map Information.");
      }

      this.setupVenueInfo(record);
      this.pushView(this.getCheckinMerchant());

      return true;
   },
   // --------------------------------------------------------------------------
   // Merchant Checkin  Page
   // --------------------------------------------------------------------------
   setVenueInfo : function(venueId, customerId)
   {
      var page = this.getCheckinMerchant();
      page.venueId = venueId;
      page.customerId = customerId;
   },
   clearVenueInfo : function()
   {
      var page = this.getCheckinMerchant();
      delete page.venueId;
      delete page.customerId;
   },
   onActivateCommon : function(map, gmap)
   {
      var gm = (window.google && window.google.maps && window.google.maps.Marker) ? window.google.maps : null;
      if(gmap && gm)
      {
         map.getMap().clearOverlays();
         this.marker = new gm.Marker(Ext.apply(this.markerOptions,
         {
            map : gmap
         }));
         map.setMapCenter(this.latLng);
      }
      else
      if(!gm)
      {
         console.log("Cannot load Google Maps");
      }
   },
   onActivate : function()
   {
      var page = this.getCheckinMerchant();
      var map = page.query('component[tag=map]')[0];
      //var map = page.query('map')[0];

      //this.onActivateCommon(map, map.getMap());
      switch (this.mode)
      {
         case 'checkin':
            this.getCheckinBtn().show();
            this.getExploreBtn().hide();
            break;
         case 'explore' :
            this.getExploreBtn().show();
            this.getCheckinBtn().hide();
            break;
      }
      // Show Share Icon
      this.getShareBtn().show();
      this.getMainBtn().hide();

      this.onActivateCommon(map, null);
      //
      // Scroll to the Top of the Screen
      //
      page.getScrollable().getScroller().scrollTo(0, 0);
   },
   onDeactivate : function()
   {
      var viewport = this.getViewport();
      var page = this.getCheckinMerchant();
      var venueId = viewport.getVenueId();
      // If we didn't check into this Venue, "reload" checked-in Venue info back
      if((venueId != page.venueId) && (venueId > 0))
      {
         var vstore = Ext.StoreMgr.get('VenueStore');
         var cbstore = Ext.StoreMgr.get('CheckinExploreStore');
         vstore.setData([cbstore.getById(venueId)],
         {
            addRecords : false
         });
      }
      this.clearVenueInfo();
      this.getShareBtn().hide();
   },
   onCheckinCommonTap : function(b, e, eOpts, mode, url, qrcode, position, callback)
   {
      var currentLat, currentLng;
      if(position)
      {
         currentLat = position.coords.latitude
         currentLng = position.coords.longitude;
      }

      var viewport = this.getViewport();
      var mcntlr = this.getApplication().getController('Merchants');
      var store = Ext.StoreMgr.get('EligibleRewardsStore');
      var cview = viewport.getActiveItem();

      // This is necessary for now to fix bug in Ext.List in getItemElementConfig()
      // Cls are aggreated without spacing in between causing problems later in updating item
      // when refreshed
      store.removeAll();
      store.clearFilter();

      {
         // Load Info into database
         EligibleReward[url]();
         store.load(
         {
            parms :
            {
               latitude : currentLat || 0,
               longtitude : currentLng || 0,
               qrcode : qrcode || ""
            },
            scope : this,
            callback : function(records, operation, success)
            {
               var metaData = store.getProxy().getReader().metaData;
               if(success && metaData)
               {
                  var cstore = Ext.StoreMgr.get('CustomerStore');
                  var venueId = metaData.get('venue_id');
                  var customerId = cstore.getById(metaData.getMerchant().getId()).get('user_id');

                  viewport.setVenueId(venueId);
                  viewport.setCustomerId(customerId);

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
                  switch (mode)
                  {
                     case 'checkin' :
                     {
                        viewport.setCheckinInfo(
                        {
                           venueId : venueId,
                           customerId : customerId
                        })
                        break;
                     }
                     default :
                        break;
                  }

                  // Cleans up Back Buttons on Check-in
                  viewport.reset(this);

                  Ext.Viewport.setMasked(false);
                  mcntlr.openMainPage();

                  if(callback)
                  {
                     callback();
                  }
               }
               else
               {
                  Ext.Viewport.setMasked(false);
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : 'Error loading Nearby Venues from Server'
                  });
               }
            }
         });
      }
   },
   onCheckinScanTap : function(b, e, eOpts, einfo)
   {
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
   onMapRender : function(map, gmap, eOpts)
   {
      this.onActivateCommon(map, gmap);
   },
   onMapWidthChange : function(map, value, oldValue, eOpts)
   {
      var size = map.element.getSize();
      var string = Ext.String.urlAppend(this.self.googleMapStaticUrl, Ext.Object.toQueryString(Ext.apply(
      {
         zoom : 15,
         sensor : false,
         size : size.width + 'x' + size.height,
         //center : this.latLng,
         markers : 'color:blue|label:S|' + this.latLng
      }, this.markerOptions)));
      map.setData(
      {
         width : size.width,
         height : size.height,
         photo : string
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
