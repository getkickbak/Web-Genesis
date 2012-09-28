Ext.define('Genesis.controller.client.Checkins',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
      checkin_path : '/checkin'
   },
   xtype : 'clientcheckinsCntlr',
   config :
   {
      routes :
      {
         'exploreS' : 'explorePageUp',
         'explore' : 'explorePage',
         'checkin' : 'checkinPage'
      },
      refs :
      {
         backBtn : 'clientcheckinexploreview button[tag=back]',
         closeBtn : 'clientcheckinexploreview button[tag=close]',
         exploreList : 'clientcheckinexploreview list',
         explore :
         {
            selector : 'clientcheckinexploreview',
            autoCreate : true,
            xtype : 'clientcheckinexploreview'
         },
         checkInNowBar : 'clientcheckinexploreview container[tag=checkInNow]',
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
         exploreList :
         {
            select : 'onExploreSelect',
            disclose : 'onExploreDisclose'
         }
      },
      listeners :
      {
         'exploreLoad' : 'onExploreLoad',
         'checkin' : 'onCheckinTap',
         'explore' : 'onNonCheckinTap',
         'checkinScan' : 'onCheckinScanTap',
         'checkinMerchant' : 'onCheckinHandler',
         'setupCheckinInfo' : 'onSetupCheckinInfo'
      },
      position : null,
   },
   metaDataMissingMsg : 'Missing Checkin MetaData information.',
   noCheckinCodeMsg : 'No Checkin Code found!',
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
               if (store.isLoading())
               {
                  me.fireEvent('updatemetadata', proxy.getReader().metaData);
               }
            }
         }
      });
      this.callParent(arguments);
      console.log("Checkins Init");
      //
      // Prelod Page
      //
      this.getExplore();
   },
   checkinCommon : function(qrcode)
   {
      var me = this;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var mode = me.callback['mode'];
      var url = me.callback['url'];
      var position = me.callback['position'];
      var callback = me.callback['callback'];
      var viewport = me.getViewPortCntlr();
      var venueId = null;

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
            else
            if (!operation.wasSuccessful() && !metaData)
            {
               console.log(me.metaDataMissingMsg);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Common Functions
   // --------------------------------------------------------------------------
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      if (qrcode)
      {
         console.log(me.checkinMsg);
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.checkinMsg
         });

         // Retrieve GPS Coordinates
         me.checkinCommon(qrcode);
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
         default :
            break;
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
      // Already in Merchant Account Page, Scan QR Code to confirm Checkin
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
      var mcntlr = app.getController('client.Merchants');
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var sync = false, checkinMode = false;

      var customerId, customer, venue, points;
      customerId = record.getId();
      points = record.get('points');
      callback = callback || Ext.emptyFn;

      // Find venueId from metaData or from DataStore
      var new_venueId = metaData['venue_id'] || ((cestore.first()) ? cestore.first().getId() : 0);
      // Find venue from DataStore or current venue info
      venue = cestore.getById(new_venueId) || viewport.getVenue();

      // Find Matching Venue or pick the first one returned if no venueId is set
      console.debug("CheckIn - new_venueId:'" + new_venueId + //
      "' venue_id:'" + venueId + //
      "' points:'" + points + "'");
      if ((new_venueId == venueId) || (venueId == null))
      {
         checkinMode = (mode == 'checkin');
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
         console.log("CheckIn - venueIDs do not match!");
      }

      //
      // Cleans up Back Buttons on Check-in
      //
      me.resetView();
      Ext.Viewport.setMasked(false);

      switch(mode)
      {
         case 'checkin' :
         case 'explore' :
         {
            me.redirectTo('venue/' + venue.getId() + '/' + customerId);
            break;
         }
         default:
            break;
      }

      callback();

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
               message : me.recvReferralb4VisitMsg(customer.getMerchant().get('name'))
            });
         }, null]);
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
   onLocationUpdate : function(position)
   {
      var me = this;
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var proxy = cestore.getProxy();

      if (!position)
      {
         me.popView();
      }
      else
      {
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
               if (operation.wasSuccessful())
               {
                  var checkinContainer = me.getCheckInNowBar();
                  me.setPosition(position);
                  checkinContainer.setDisabled(false);
               }
               else
               {
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : 'Warning',
                     message : me.missingVenueInfoMsg,
                     callback : function()
                     {
                        proxy.supressErrorsPopup = false;
                     }
                  });
               }
            },
            scope : me
         });
      }
   },
   onExploreLoad : function(forceReload)
   {
      var me = this;
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      //
      // Do not reload page unless this is the first time!
      // Saves bandwidth
      //
      if ((cestore.getCount() == 0) || forceReload)
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
         case 'cover' :
            me.getBackBtn().show();
            me.getCloseBtn().hide();
            break;
         case 'coverUp' :
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
      //activeItem.createView();
      if (me.getExploreList())
      {
         //me.getExploreList().setVisibility(false);
      }
      me.onExploreLoad();
   },
   onExploreDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
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
   // Page Navigation
   // --------------------------------------------------------------------------
   explorePageUp : function()
   {
      this.openPage('explore', 'coverUp');
   },
   explorePage : function()
   {
      this.openPage('explore');
   },
   checkinPage : function()
   {
      this.openPage('checkin');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, animMode)
   {
      var me = this;
      var page = me.getMainPage();
      me.mode = page.mode = subFeature;
      me.animMode = animMode || 'cover';
      me.setAnimationMode(me.self.superclass.self.animationMode[me.animMode]);
      me.pushView(page);
   },
   getMainPage : function()
   {
      var page = this.getExplore();
      return page;
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
