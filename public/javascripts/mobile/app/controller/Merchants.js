Ext.define('Genesis.controller.Merchants',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      googleMapStaticUrl : 'http://maps.googleapis.com/maps/api/staticmap'
   },
   xtype : 'merchantsCntlr',
   config :
   {
      routes :
      {
         'venue/:id/:id' : 'mainPage',
         'venue/:id/:id/:id' : 'backToMainPage'
      },
      refs :
      {
         main :
         {
            selector : 'merchantaccountview',
            autoCreate : true,
            xtype : 'merchantaccountview'
         },
         merchantMain : 'merchantaccountview container[tag=merchantMain]',
         tbPanel : 'merchantaccountview dataview[tag=tbPanel]',
         prizesWonPanel : 'merchantaccountview component[tag=prizesWonPanel]',
         feedContainer : 'merchantaccountview container[tag=feedContainer]',
         descContainer : 'merchantaccountview container[tag=descContainer]',
         descPanel : 'merchantaccountview container[tag=descPanel]',
         //address : 'merchantaccountview component[tag=address]',
         //stats : 'merchantaccountview formpanel[tag=stats]',
         merchantDetails :
         {
            selector : 'merchantdetailsview',
            autoCreate : true,
            xtype : 'merchantdetailsview'
         },
         mapBtn : 'viewportview button[tag=mapBtn]',
         shareBtn : 'viewportview button[tag=shareBtn]',
         checkinBtn : 'viewportview button[tag=checkin]',
         mainBtn : 'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=main]',
         prizesBtn : 'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=prizes]',
         merchantTabBar : 'merchantaccountview tabbar'
      },
      control :
      {
         main :
         {
            activate : 'onMainActivate',
            deactivate : 'onMainDeactivate'
         },
         mapBtn :
         {
            tap : 'onMapBtnTap'
         },
         'merchantaccountview button[ui=orange]' :
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
         merchantTabBar :
         {
            tabchange : 'onTabBarTabChange'
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
      },
      listeners :
      {
         'backToMain' : 'onCheckedInAccountTap'
      }
   },
   checkinFirstMsg : 'Please Check-in before redeeming rewards',
   init : function()
   {
      var me = this;
      //
      // Clears all Markers on Google Map
      //
      me.markersArray = [];
      if (window.google && window.google.maps && window.google.maps.Map)
      {
         google.maps.Map.prototype.clearOverlays = function()
         {
            if (me.markersArray)
            {
               for (var i = 0; i < me.markersArray.length; i++)
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

      //
      // Store used for rendering purposes
      //
      Ext.regStore('MerchantRenderStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });

      me.callParent(arguments);

      console.log("Merchants Init");
   },
   // --------------------------------------------------------------------------
   // Merchant Details Page
   // --------------------------------------------------------------------------
   onActivateCommon : function(map, gmap)
   {
      var gm = (window.google && window.google.maps && window.google.maps.Marker) ? window.google.maps : null;
      if (gmap && gm)
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
   onDetailsActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var page = this.getMerchantDetails();
      var venue = this.getViewPortCntlr().getVenue();

      // Refresh Merchant Details Info
      //Ext.StoreMgr.get('MerchantRenderStore').setData(vrecord);

      // Update TitleBar
      activeItem.query('titlebar')[0].setTitle(venue.get('name'));

      //var map = page.query('component[tag=map]')[0];
      //var map = page.query('map')[0];

      // Show Share Icon
      this.getShareBtn().show();
      //this.getMainBtn().hide();

      //this.onActivateCommon(map, map.getMap());
      //this.onActivateCommon(map, null);

      //Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
   },
   onDetailsDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      oldActiveItem.removeAll(true);
      //this.getShareBtn().hide();
   },
   onMapRender : function(map, gmap, eOpts)
   {
      //this.onActivateCommon(map, gmap);
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Checkins');
      controller.setPosition(position);
      controller.fireEvent('checkin');
   },
   // --------------------------------------------------------------------------
   // Merchant Account Page
   // --------------------------------------------------------------------------
   /*
    onUpdateWinnersCount : function(metaData)
    {
    var panel = this.getPrizesWonPanel();
    // Initial Main Page Object
    if(!panel)
    {
    this.getMain();
    panel = this.getPrizesWonPanel();
    }
    panel.setData(metaData);
    this.winnersCount = metaData;
    },
    */
   onMainActivate : function(activeItem, c, oldActiveItem, eOpts)
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

      //
      // Either we are checked-in or
      // customer exploring a venue they checked-in in the past ...
      //
      if (checkedInMatch)
      {
         page.renderFeed = true;
         //me.getAddress().hide();
         //me.getStats().show();
         console.debug("Merchant Checkin Mode");
      }
      //
      // Explore Mode
      //
      else
      {
         page.renderFeed = me.showFeed;
         //me.getAddress().setData(vrecord.getData(true));
         //me.getAddress().show();
         //me.getStats().hide();
         console.debug("Merchant Explore Mode");
      }
      //me.getDescPanel().setData(vrecord);
      //me.getDescContainer().show();

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
      page.showCheckinBtn = (checkedIn && !checkedInMatch);

      //
      // Update Badges
      //
      var prizesCount = 0, prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      for (var i = 0; i < prizes.length; i++)
      {
         if (prizes[i].getMerchant().getId() == merchantId)
         {
            prizesCount++;
         }
      }
      page.prizesCount = (prizesCount > 0) ? prizesCount : null;

      if (this.getMainBtn())
      {
         this.getMainBtn().hide();
      }

      if (oldActiveItem.isXType('mainpageview', true) || oldActiveItem.isXType('checkinexploreview', true))
      {
         //
         // Update Winners Count
         //
         if (me.winnersCount)
         {
            vrecord.set('winners_count', me.winnersCount['winners_count']);
            //me.onUpdateWinnerssCount(me.winnersCount);
         }

         // Refresh Merchant Panel Info
         Ext.StoreMgr.get('MerchantRenderStore').setData(vrecord);

         this.getMerchantTabBar().hide();
      }

      Ext.defer(function()
      {
         //page.createView();
         // Update TitleBar
         activeItem.query('titlebar')[0].setTitle(vrecord.get('name'));
      }, 1, page);
      //page.createView();

      var scroll = page.getScrollable();
      scroll.getScroller().scrollTo(0, 0);
   },
   onMainDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      //if (activeItem.isXType('mainpageview', true) || activeItem.isXType('checkinexploreview', true))
      {
         oldActiveItem.removeAll(true);
      }
      /*
      else
      {
      var list = me.getFeedContainer().query('list')[0];
      list.setStore(Ext.create('Ext.data.Store',
      {
      }));
      }
      */
      //this.getMapBtn().hide();
      //this.getCheckinBtn().hide();
   },
   onMainDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      if (!cvenue || !venue || (venue.getId() != cvenue.getId()))
      {
         Ext.device.Notification.show(
         {
            title : 'Rewards',
            message : me.checkinFirstMsg
         });
         return;
      }
      switch (record.get('reward_type'))
      {
         case 'vip' :
         {
            break;
         }
         default:
            var app = me.getApplication();
            var controller = app.getController('Prizes');
            var rstore = Ext.StoreMgr.get('RedemptionsStore');
            record = rstore.getById(record.get('reward_id'));
            controller.fireEvent('redeemrewards', Ext.create('Genesis.model.EarnPrize',
            {
               //'id' : 1,
               'expiry_date' : null,
               'reward' : record,
               'merchant' : viewport.getCheckinInfo().venue.getMerchant()
            }));
            break;
      }
   },
   onMainSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onMainDisclose(d, model);
      return false;
   },
   onCheckinTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      me.getGeoLocation();
   },
   onCheckedInAccountTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var app = me.getApplication();
      var ccntlr = app.getController('Checkins');
      var estore = Ext.StoreMgr.get('EligibleRewardsStore');
      var cinfo = viewport.getCheckinInfo();

      var ccustomer = cinfo.customer;
      var cvenue = cinfo.venue;
      var cmetaData = cinfo.metaData;
      var venue = viewport.getVenue();

      if (venue.getId() != cvenue.getId())
      {
         console.log("Update current Venue to be Checked-In Merchant Account ...");

         // Restore Merchant Info
         ccntlr.setupCheckinInfo('checkin', cvenue, ccustomer, cmetaData);
         viewport.updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [cmetaData]);
      }
      //
      // Force Page to refresh
      //
      if (me.getMainPage() == vport.getActiveItem())
      {
         var controller = vport.getEventDispatcher().controller;
         var anim = new Ext.fx.layout.Card(me.self.superclass.self.animationMode['fade']);
         if (!controller.isPausing)
         {
            console.log("Reloading current Merchant Home Account Page ...");

            // Delete current page and refresh
            me.getMainPage().destroy();

            me.getViewport().animateActiveItem(me.getMainPage(), anim);
            anim.onActiveItemChange(vport.getLayout(), me.getMainPage(), me.getMainPage(), null, controller);
            anim.on('animationend', function()
            {
               anim.destroy();
            }, this);
            vport.doSetActiveItem(me.getMainPage(), null);
         }
      }
      else
      {
         console.log("Going back to Checked-In Merchant Home Account Page ...");
         me.resetView();
         me.setAnimationMode(me.self.superclass.self.animationMode['flip']);
         me.pushView(me.getMainPage());
      }
   },
   onMapBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      /*
       var gm = (window.google && window.google.maps && window.google.maps.LatLng) ? window.google.maps : null;
       //
       // Loads currently checked-in / explore Venue into the store
       //
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
         var record = me.getViewPortCntlr().getVenue();
         me.latLng = record.get('latitude') + ',' + record.get('longitude');
         var color = 'red', label = '';
         var address = record.get('address') + ', ' + record.get('city') + ', ' +
         //
         record.get('state') + ', ' + record.get('country') + ', ' + record.get('zipcode');

         me.markerOptions =
         {
            markers : 'color:' + color + '|' + 'label:' + label + '|' + this.latLng,
            //center : address,
            center : me.latLng,
            title : record.get('name')
         }
         //console.debug("Cannot Retrieve Google Map Information.");
      }

      me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
      me.pushView(me.getMerchantDetails());
   },
   onTabBarTabChange : function(bar, newTab, oldTab, eOpts)
   {
      switch(newTab.config.tag)
      {
         default :
         case 'rewards' :
         case 'main' :
         {
            Ext.defer(function()
            {
               if (newTab)
               {
                  newTab.setActive(false);
               }

               if (oldTab)
               {
                  oldTab.setActive(false);
               }
               bar._activeTab = null;
            }, 2 * 1000);
            break;
         }
      }

      return true;
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function(venueId, customerId)
   {
      this.backToMainPage(venueId, customerId, 0);
   },
   backToMainPage : function(venueId, customerId, backToMain)
   {
      var viewport = this.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var showFeed = (customerId > 0) || (cvenue && (cvenue.getId() == venueId));
      this.openMainPage(showFeed, backToMain > 0);
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
   openMainPage : function(showFeed, backToMain)
   {
      var me = this;

      // Check if this is the first time logging into the venue
      me.showFeed = showFeed;
      if (!backToMain)
      {
         me.setAnimationMode(me.self.superclass.self.animationMode['flip']);
         me.pushView(me.getMainPage());
      }
      else
      {
         me.fireEvent('backToMain');
      }
      console.log("Merchant Account Opened");
   }
});
