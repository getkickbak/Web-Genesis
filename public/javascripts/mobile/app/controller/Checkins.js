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
         'checkinexploreview list' :
         {
            select : 'onExploreSelect',
            disclose : 'onExploreDisclose'
         },
         //
         // Checkin Merchant Page
         //
         checkinMerchant :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         checkinBtn :
         {
            tap : 'onCheckinTap'
         },
         exploreBtn :
         {
            tap : 'onNonCheckinTap'
         },
         'checkinmerchantview map' :
         {
            maprender : 'onMapRender'
         },
         'checkinmerchantview component[tag=map]' :
         {
            // Goto CheckinMerchant.js for "painted" support
            //painted : 'onMapPainted'
         }
      },
      models : ['Venue', 'Merchant', 'EarnPrize'],
      position : null,
   },
   init : function()
   {
      var me = this;
      //
      // Clears all Markers on Google Map
      //
      me.markersArray = [];
      if(window.google && window.google.maps && window.google.maps.Map)
      {
         google.maps.Map.prototype.clearOverlays = function()
         {
            if(me.markersArray)
            {
               for(var i = 0; i < me.markersArray.length; i++)
               {
                  me.markersArray[i].setMap(null);
               }
            }
         }
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

                     var qrcode = response.responseCode;
                     console.log("qrcode - " + qrcode);
                     // Retrieve GPS Coordinates
                     me.onCheckinCommonTap(b, e, eOpts, mode, url, qrcode, me.getPosition(), callback);
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
   setupCheckinInfo : function(venue, customer, metaData)
   {
      var viewport = this.getViewPortCntlr();
      viewport.setVenue(venue)
      viewport.setCustomer(customer);
      viewport.setMetaData(metaData);
   },
   // --------------------------------------------------------------------------
   // CheckinExplore Page
   // --------------------------------------------------------------------------
   onExploreActivate : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.getGeoLocation(function(position)
      {
         me.setPosition(position);
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
                  me.getCheckInNowBar().setDisabled(true);
               }
            },
            scope : this
         });
      });
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
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      me.getMainBtn()[(cvenue && (venue.getId() != cvenue.getId())) ? 'show' : 'hide']();
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
       this.latLng = new gm.LatLng(record.get('latitude'), record.get('longitude'));
       this.markerOptions =
       {
       position : this.latLng,
       title : record.get('name')
       }
       }
       else
       */
      {
         this.latLng = record.get('latitude') + ',' + record.get('longitude');
         var color = 'red', label = '';
         var address = record.get('address') + ', ' + record.get('city') + ', ' + record.get('state') + ', ' + record.get('country') + ', ' + record.get('zipcode');

         this.markerOptions =
         {
            markers : 'color:' + color + '|' + 'label:' + label + '|' + this.latLng,
            //center : address,
            center : this.latLng,
            title : record.get('name')
         }
         console.log("Cannot Retrieve Google Map Information.");
      }

      this.setVenueInfo(record, null);
      this.pushView(this.getCheckinMerchant());

      return true;
   },
   // --------------------------------------------------------------------------
   // Merchant Checkin Page
   // --------------------------------------------------------------------------
   setVenueInfo : function(venue, customer)
   {
      var page = this.getCheckinMerchant();
      page.venue = venue;
      page.customer = customer;
   },
   clearVenueInfo : function()
   {
      var page = this.getCheckinMerchant();
      delete page.venue;
      delete page.customer;
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
      //if(!gm)
      {
         //this.onMapWidthChange(map);
         //console.log("Cannot load Google Maps");
      }
   },
   onActivate : function()
   {
      var page = this.getCheckinMerchant();
      var map = page.query('component[tag=map]')[0];
      page.query('dataview')[0].getStore().setData(page.venue);
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
      var viewport = this.getViewPortCntlr();
      var page = this.getCheckinMerchant();
      var venue = viewport.getVenue();
      // If we didn't check into this Venue, "reload" checked-in Venue info back
      if(venue && page.venue && (venue.getId() != page.venue.getId()))
      {
         viewport.setVenue(viewport.getCheckinInfo().venue);
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

      var viewport = this.getViewPortCntlr();
      var mcntlr = this.getApplication().getController('Merchants');
      var cstore = Ext.StoreMgr.get('CheckinStore');
      var custore = Ext.StoreMgr.get('CustomerStore');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var vstore = Ext.StoreMgr.get('VenueAccountStore');
      var page = this.getCheckinMerchant();
      var cview = this.getViewport().getActiveItem();
      var pvenueId = page.venue ? page.venue.getId() : 0;

      var showErrorMsg = function(mode)
      {
         var msg;
         switch (mode)
         {
            case 'checkin' :
               msg = 'Checking info';
               break;
            default :
               msg = 'Exploring'
               break;
         }
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : 'Error ' + msg + ' Venue from Server'
         });
      }
      // Load Info into database
      Customer[url](pvenueId);
      cstore.load(
      {
         jsonData :
         {
         },
         params :
         {
            latitude : currentLat || 0,
            longitude : currentLng || 0,
            auth_code : qrcode || "",
            venue_id : (Genesis.constants.isNative()) ? pvenueId : qrcode
         },
         scope : this,
         callback : function(records, operation)
         {
            var metaData = cstore.getProxy().getReader().metaData;
            if(operation.wasSuccessful() && metaData)
            {
               for(var i = 0; i < records.length; i++)
               {
                  var customerId = records[i].getId();
                  var venueId = metaData['venue_id'];
                  var venue = cestore.getById(venueId) || vstore.getById(venueId);
                  var customer = cstore.getById(customerId);

                  // Find Matching Venue or pick the first one returned if no venueId is set
                  if((pvenueId == venueId) || (pvenueId == 0))
                  {
                     //
                     // Update our Database with the latest value from Server
                     //
                     var crecord = custore.getById(customerId);
                     if(crecord != null)
                     {
                        crecord.set('points', records[i].get('points'));
                        crecord.setLastCheckin(records[i].getLastCheckin());
                     }

                     this.setupCheckinInfo(venue, crecord, metaData);
                     break;
                  }
               }
               // Cannot find match?
               if(i > records.length)
               {
                  //showErrorMsg();
                  return;
               }

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

               // Cleans up Back Buttons on Check-in
               this.getViewport().reset(this);
               Ext.Viewport.setMasked(false);
               mcntlr.openMainPage();

               if(callback)
               {
                  callback();
               }
            }
            else
            {
               //Ext.Viewport.setMasked(false);
               //showErrorMsg();
            }
         }
      });
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
