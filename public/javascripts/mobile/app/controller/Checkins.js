Ext.define('Genesis.controller.Checkins',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : [
   // Main Pages
   'Genesis.view.CheckinBrowse',
   // Main Page when the user has never checked-in before
   //   'Genesis.view.CheckinMerchantMainPage',
   // Main Page when the user has checked-in before
   //   'Genesis.view.CheckinMerchantPage',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics :
   {
      checkin_path : '/checkin'
   },
   xtype : 'checkinsCntlr',
   config :
   {
      refs :
      {
         checkinBrowse :
         {
            selector : 'checkinbrowseview',
            autoCreate : true,
            xtype : 'checkinbrowseview'
         },
         checkinMerchant :
         {
            selector : 'checkinmerchantview',
            autoCreate : true,
            xtype : 'checkinmerchantview'
         }
         /*,
          checkinMerchantMain :
          {
          selector : 'checkinmerchantmainview',
          autoCreate : true,
          xtype : 'checkinmerchantmainview'
          },
          checkinMerchant :
          {
          selector : 'checkinmerchantview',
          autoCreate : true,
          xtype : 'checkinmerchantview'
          }
          */
      },
      control :
      {
         'checkinbrowseview' :
         {
            activate : 'onBrowseActivate'
         },
         'checkinbrowseview list' :
         {
            disclose : 'onCheckinBrowseDisclose'
         },

         'checkinmerchantmainview' :
         {
            activate : 'onMerchantMainActivate'
         },

         'checkinmerchantview' :
         {
            activate : 'onMerchantActivate',
            deactivate : 'onMerchantDeactivate'
         },
         'checkinmerchantview button[tag=checkinBtn]' :
         {
            tap : 'onMerchantCheckinTap'
         },
         'checkinmerchantview button[tag=browseBtn]' :
         {
            tap : 'onMerchantBrowseTap'
         },
         'checkinmerchantview map' :
         {
            maprender : 'onMapRender'
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
      //
      // Store storing the Venue checked-in / Browse
      //
      Ext.regStore('CheckinBrowseStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      })
   },
   // --------------------------------------------------------------------------
   // CheckinBrowse Page
   // --------------------------------------------------------------------------
   onBrowseActivate : function()
   {
      var store = Ext.StoreMgr.get('CheckinBrowseStore');
      // Refresh Stores
      //store.removeAll();
      store.load();
   },
   onCheckinBrowseDisclose : function(list, record, target, index, e, eOpts)
   {
      var page = this.getCheckinMerchant();
      var cstore = Ext.StoreMgr.get('CustomerStore');
      //
      // Loads currently checked-in / browse Venue into the store
      //
      cstore.clearFilter();
      Ext.StoreMgr.get('VenueStore').setData([record],
      {
         addRecords : false
      });
      var gm = (window.google ||
      {
      }).maps;
      this.latLng = new gm.LatLng(record.getData().latitude, record.getData().longtitude);
      this.markerOptions =
      {
         position : this.latLng,
         title : record.getData().name
      }
      page.getInitialConfig().title = record.getData().name;
      this.venueId = record.getId();
      this.customerId = cstore.getById(record.getMerchant().getId()).get('user_id');

      this.pushView(page);
      return true;
   },
   // --------------------------------------------------------------------------
   // Merchant Checkin Mage Page
   // --------------------------------------------------------------------------
   onMerchantMainActivate : function()
   {
      // Loads Venues nearby
      //Ext.StoreMgr.get('VenueStore').load();
   },
   onMerchantActivateCommon : function(map, gmap)
   {
      var gm = (window.google ||
      {
      }).maps;

      if(gmap)
      {
         map.getMap().clearOverlays();
         this.marker = new gm.Marker(Ext.apply(this.markerOptions,
         {
            map : gmap
         }));
         map.setMapCenter(this.latLng);
      }
   },
   // --------------------------------------------------------------------------
   // Merchant Checkin Page
   // --------------------------------------------------------------------------
   onMerchantActivate : function()
   {
      var map = this.getCheckinMerchant().query('map')[0];
      this.onMerchantActivateCommon(map, map.getMap());

      this.getViewport().query('#shareBtn')[0].show();
   },
   onMerchantDeactivate : function()
   {
      this.getViewport().query('#shareBtn')[0].hide();
   },
   onMerchantCheckinTap : function(b, e, eOpts)
   {
      this.getViewport().setVenueId(this.venueId);
      this.getViewport().setCustomerId(this.customerId);

      var cntlr = this.getApplication().getController('Merchants');
      var store = Ext.StoreMgr.get('EligibleRewardsStore');
      var currentLat = 0, currentLng = 0;

      // This is necessary for now to fix bug in Ext.List in getItemElementConfig()
      // Cls are aggreated without spacing in between causing problems later in updating item
      // when refreshed
      store.removeAll();
      store.clearFilter();
      // Retrieve GPS Coordinates
      {
         EligibleReward.setVenueCheckinUrl();
         store.load(
         {
            parms :
            {
               latitude : currentLat,
               longtitude : currentLng,
               customerId : this.customerId
            },
            scope : this,
            callback : function(records, operation, success)
            {
               if(success)
               {
                  for(var i = 0; i < records.length; i++)
                  {
                     records[i].data['venue_id'] = this.getViewport().getVenueId();
                  }
                  store.filter([
                  {
                     filterFn : Ext.bind(function(item)
                     {
                        return item.get("venue_id") == this.venueId;
                     }, this)
                  }]);
                  cntlr.openMainPage();
               }
               else
               {
                  Ext.Msg.alert("Cannot log into Venue");

               }
            }
         });
      }
   },
   onMerchantBrowseTap : function(b, e, eOpts)
   {
      this.getViewport().setVenueId(this.venueId);
      this.getViewport().setCustomerId(this.customerId);
      this.getApplication().getController('Merchants').openMainPage();
   },
   onMapRender : function(map, gmap, eOpts)
   {
      this.onMerchantActivateCommon(map, gmap);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      var page = this.getCheckinBrowse();
      // Hack to fix bug in Sencha Touch API
      var plugin = page.query('list')[0].getPlugins()[0];
      plugin.refreshFn = plugin.getRefreshFn();

      this.pushView(page);
      console.log("Checkin Browse Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
