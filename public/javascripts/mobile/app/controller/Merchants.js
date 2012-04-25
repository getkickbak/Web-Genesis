Ext.define('Genesis.controller.Merchants',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      merchantMain_path : '/merchantMain',
      merchant_path : '/merchant',
      merchantDetails_path : '/merchantDetails',
      googleMapStaticUrl : 'http://maps.googleapis.com/maps/api/staticmap'
   },
   xtype : 'merchantsCntlr',
   config :
   {
      refs :
      {
         main :
         {
            selector : 'merchantaccountview',
            autoCreate : true,
            xtype : 'merchantaccountview'
         },
         merchantDetails :
         {
            selector : 'merchantdetailsview',
            autoCreate : true,
            xtype : 'merchantdetailsview'
         },
         pagePanel : 'merchantaccountview dataview[tag=menchantPagePanel]',
         merchantFeedContainer : 'merchantaccountview container[tag=merchantFeedContainer]',
         merchantDescContainer : 'merchantaccountview container[tag=merchantDescContainer]',
         merchantDescPanel : 'merchantaccountview container[tag=merchantDescPanel]',
         //merchantAddress : 'merchantaccountview component[tag=merchantAddress]',
         //merchantStats : 'merchantaccountview formpanel[tag=merchantStats]',
         mapBtn : 'viewportview button[tag=mapBtn]',
         shareBtn : 'viewportview button[tag=shareBtn]',
         checkinBtn : 'viewportview button[tag=checkin]',
         mainBtn : 'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=main]',
         prizesBtn : 'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=prizes]'
      },
      control :
      {
         main :
         {
            activate : 'onMainActivate',
            deactivate : 'onMainDeactivate'
         },
         mainBtn :
         {
            tap : 'onMainButtonTap'
         },
         mapBtn :
         {
            tap : 'onMapBtnTap'
         },
         'merchantaccountview button[ui=yellow]' :
         {
            tap : 'onMerchantAccountRewardsTap'
         },
         'merchantaccountview list' :
         {
            select : 'onMainSelect',
            disclose : 'onMainDisclose'
         },
         checkinBtn :
         {
            tap : 'onCheckinTap'
         },
         'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=browse]' :
         {
            tap : 'onBrowseTap'
         },
         //
         //  Merchant Details Page
         //
         merchantDetails :
         {
            activate : 'onDetailsActivate',
            deactivate : 'onDetailsDeactivate'
         },
         'merchantdetailsview map' :
         {
            maprender : 'onMapRender'
         },
         'merchantdetailsview component[tag=map]' :
         {
            // Goto CheckinMerchant.js for "painted" support
            //painted : 'onMapPainted'
         }

      }
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
         console.debug("Google Maps API cannot be instantiated");
      }
      me.callParent(arguments);
      console.log("Merchants Init");
   },
   // --------------------------------------------------------------------------
   // Merchant Details Page
   // --------------------------------------------------------------------------
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
         //console.debug("Cannot load Google Maps");
      }
   },
   onDetailsActivate : function()
   {
      var page = this.getMerchantDetails();
      var venue = this.getViewPortCntlr().getVenue();
      var map = page.query('component[tag=map]')[0];
      page.query('dataview')[0].getStore().setData(venue);
      //var map = page.query('map')[0];

      //this.onActivateCommon(map, map.getMap());
      // Show Share Icon
      this.getShareBtn().show();
      //this.getMainBtn().hide();

      this.onActivateCommon(map, null);
      //
      // Scroll to the Top of the Screen
      //
      //page.getScrollable().getScroller().scrollTo(0, 0);
   },
   onDetailsDeactivate : function()
   {
      var viewport = this.getViewPortCntlr();
      var page = this.getMerchantDetails();
      var venue = viewport.getVenue();
      this.getShareBtn().hide();
   },
   onMapRender : function(map, gmap, eOpts)
   {
      this.onActivateCommon(map, gmap);
   },
   // --------------------------------------------------------------------------
   // Merchant Account Page
   // --------------------------------------------------------------------------
   onMainActivate : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var page = me.getMain();
      var vrecord = viewport.getVenue();
      var crecord = viewport.getCustomer();
      var customerId = viewport.getCustomer().getId();
      var venueId = vrecord.getId();
      var merchantId = vrecord.getMerchant().getId();

      var cvenue = viewport.getCheckinInfo().venue;
      var checkedIn = (cvenue != null);
      var checkedInMatch = (checkedIn && (cvenue.getId() == venueId));

      // Refresh Merchant Panel Info
      me.getPagePanel().getStore().setData(vrecord);

      //
      // If the CustomerId is not reserved for Exploring ...
      //
      if(customerId > 0)
      {
         me.getMerchantDescContainer().hide();
         me.getMerchantFeedContainer().show();
         //me.getMerchantAddress().hide();
         //me.getMerchantStats().show();
      }
      //
      // Explore Mode
      //
      else
      {
         me.getMerchantFeedContainer().hide();
         me.getMerchantDescPanel().setData(vrecord.getMerchant());
         me.getMerchantDescContainer().show();
         //me.getMerchantAddress().setData(vrecord.getData(true));
         //me.getMerchantAddress().show();
         //me.getMerchantStats().hide();
      }

      //
      // Show Map Buttons
      //
      me.getMapBtn().show();

      //
      // CheckIn button
      //
      me.getCheckinBtn()[(!checkedIn || !checkedInMatch) ? 'show' : 'hide']();
      //
      // Main Menu button
      //
      me.getMainBtn()[(checkedIn && !checkedInMatch) ? 'show' : 'hide']();

      //
      // Update Badges
      //
      var prizesCount = 0, prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      for(var i = 0; i < prizes.length; i++)
      {
         if(prizes[i].getMerchant().getId() == merchantId)
         {
            prizesCount++;
         }
      }
      me.getPrizesBtn().setBadgeText((prizesCount > 0) ? prizesCount : null);

      //
      // Scroll to the Top of the Screen
      //
      me.getMain().getScrollable().getScroller().scrollTo(0, 0);
   },
   onMainDeactivate : function()
   {
      this.getMapBtn().hide();
      this.getCheckinBtn().hide();
   },
   onMainDisclose : function(list, record, target, index, e, eOpts)
   {
   },
   onMainSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onMainDisclose(d, model);
      return false;
   },
   onCheckinTap : function(b, e, eOpts)
   {
      var me = this;
      var app = me.getApplication();
      var vport = me.getViewport();
      var viewport = me.getViewPortCntlr();
      var controller = app.getController('Checkins');
      me.getGeoLocation(function(position)
      {
         controller.setPosition(position);
         app.dispatch(
         {
            action : 'onCheckinTap',
            args : arguments,
            controller : controller,
            scope : controller
         });
      });
   },
   onBrowseTap : function(b, e, eOpts)
   {
      var app = this.getApplication();
      var controller = app.getController('Checkins');
      app.dispatch(
      {
         action : 'openPage',
         args : ['explore'],
         controller : controller,
         scope : controller
      });
   },
   onPageActivate : function()
   {

   },
   onPageDeactivate : function()
   {
   },
   onMainButtonTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var app = me.getApplication();
      var ccustomer = viewport.getCheckinInfo().customer;
      var cvenue = viewport.getCheckinInfo().venue;
      var cmetaData = viewport.getCheckinInfo().metaData;

      var ccntlr = app.getController('Checkins');
      var estore = Ext.StoreMgr.get('EligibleRewardsStore');
      var samePage = (me.getMainPage() == vport.getActiveItem());

      if(viewport.getVenue().getId() != cvenue.getId())
      {
         // Restore Merchant Info
         ccntlr.setupCheckinInfo('checkin', cvenue, ccustomer, cmetaData);
      }

      console.log("Going to Merchant Home Account Page ...");

      estore.setData(cmetaData['eligible_rewards']);
      vport.reset();
      //Ext.Viewport.setMasked(false);

      //
      // Trigger the activeItem changes when refreshing page
      //
      if(samePage)
      {
         vport.setFadeAnimation();
         vport.doSetActiveItem(me.getMainPage(), null);
      }

      me.pushView(me.getMainPage());
   },
   onMapBtnTap : function(b, e, eOpts)
   {
      var gm = (window.google && window.google.maps && window.google.maps.LatLng) ? window.google.maps : null;
      var record = this.getViewPortCntlr().getVenue();
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
         console.debug("Cannot Retrieve Google Map Information.");
      }

      this.pushView(this.getMerchantDetails());
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      // Check if this is the first time logging into the venue
      //var view = (this.getViewport().getCustomerId() > 0);
      //return this[view ? 'getMain' : 'getPage']();
      return this.getMain();
   },
   openMainPage : function()
   {
      var me = this;
      var vport = me.getViewport();
      var samePage = (me.getMainPage() == vport.getActiveItem());

      // Check if this is the first time logging into the venue
      if(!samePage)
      {
         me.pushView(me.getMainPage());
      }
      else
      {
         me.onMainButtonTap();
      }
      console.log("Merchant Account Opened");
   }
});
