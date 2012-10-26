Ext.define('Genesis.controller.client.Merchants',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      googleMapStaticUrl : 'http://maps.googleapis.com/maps/api/staticmap'
   },
   xtype : 'clientmerchantsCntlr',
   config :
   {
      routes :
      {
         'venue/:id/:id' : 'mainPage',
         'venue/:id/:id/:id' : 'backToMainPage',
         'venueDetails' : 'venueDetails'
      },
      refs :
      {
         main :
         {
            selector : 'clientmerchantaccountview',
            autoCreate : true,
            xtype : 'clientmerchantaccountview'
         },
         merchantMain : 'clientmerchantaccountview container[tag=merchantMain]',
         tbPanel : 'clientmerchantaccountview dataview[tag=tbPanel]',
         feedContainer : 'clientmerchantaccountview container[tag=feedContainer]',
         descContainer : 'clientmerchantaccountview container[tag=descContainer]',
         descPanel : 'clientmerchantaccountview container[tag=descPanel]',
         //address : 'clientmerchantaccountview component[tag=address]',
         //stats : 'clientmerchantaccountview formpanel[tag=stats]',
         merchantDetails :
         {
            selector : 'clientmerchantdetailsview',
            autoCreate : true,
            xtype : 'clientmerchantdetailsview'
         },
         mapBtn : 'viewportview button[tag=mapBtn]',
         shareBtn : 'viewportview button[tag=shareBtn]',
         checkinBtn : 'viewportview button[tag=checkin]',
         mainBtn : 'clientmerchantaccountview tabbar[tag=navigationBarBottom] button[tag=main]',
         prizesBtn : 'clientmerchantaccountview tabbar[tag=navigationBarBottom] button[tag=prizes]',
         redeemBtn : 'clientmerchantaccountview tabbar[tag=navigationBarBottom] button[tag=redemption]',
         merchantTabBar : 'clientmerchantaccountview tabbar'
      },
      control :
      {
         main :
         {
            activate : 'onMainActivate',
            deactivate : 'onMainDeactivate',
            jackpotWinnersTap : 'onJackpotWinnersTap',
            badgeTap : 'onBadgeTap'
         },
         mapBtn :
         {
            tap : 'onMapBtnTap'
         },
         'clientmerchantaccountview button[ui=orange]' :
         {
            tap : 'onMerchantAccountRewardsTap'
         },
         'clientmerchantaccountview list' :
         {
            select : 'onMainSelect'
            //disclose : 'onMainDisclose'
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
         'clientmerchantdetailsview map' :
         {
            maprender : 'onMapRender'
         },
         'clientmerchantdetailsview component[tag=map]' :
         {
            // Goto CheckinMerchant.js for "painted" support
            //painted : 'onMapPainted'
         },
      },
      listeners :
      {
         'backToMain' : 'onBackToCheckIn'
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
      // Store storing the Customer's Eligible Rewards at a Venue
      // Used during Checkin
      //
      Ext.regStore('NewsStore',
      {
         model : 'Genesis.model.News',
         autoLoad : false
      });

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

      //
      // Preloading Pages to memory
      //
      me.getMainPage();
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
      var venue = this.getViewPortCntlr().getVenue();

      // Show Share Icon
      this.getShareBtn().show();
      //this.getMainBtn().hide();

      // Update TitleBar
      activeItem.query('titlebar')[0].setTitle(venue.get('name'));

      //var map = page.query('component[tag=map]')[0];
      //var map = page.query('map')[0];

      //this.onActivateCommon(map, map.getMap());
      //this.onActivateCommon(map, null);

      //activeItem.createView();
   },
   onDetailsDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
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
      var controller = app.getController('client.Checkins');
      controller.setPosition(position);
      controller.fireEvent('checkin');
   },
   // --------------------------------------------------------------------------
   // Merchant Account Page
   // --------------------------------------------------------------------------
   checkInAccount : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var venue = viewport.getVenue();

      //
      // Force Page to refresh
      //
      if (me.getMainPage() == vport.getActiveItem())
      {
         var controller = vport.getEventDispatcher().controller;
         var anim = new Ext.fx.layout.Card(me.self.superclass.self.animationMode['fade']);
         anim.on('animationend', function()
         {
            console.debug("Animation Complete");
            anim.destroy();
         }, me);
         //if (!controller.isPausing)
         {
            console.log("Reloading current Merchant Home Account Page ...");

            var page = me.getMainPage();

            // Delete current page and refresh
            page.removeAll(true);
            vport.animateActiveItem(page, anim);
            anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
            vport.doSetActiveItem(page, null);
         }
      }
      else
      {
         var info = viewport.getCheckinInfo();

         console.log("Going back to Checked-In Merchant Home Account Page ...");
         me.resetView();
         me.setAnimationMode(me.self.superclass.self.animationMode['pop']);
         me.pushView(me.getMainPage());
      }
   },
   onMainActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      console.debug("Merchant Account Activate");
      var me = this;
      var viewport = me.getViewPortCntlr();
      var vrecord = viewport.getVenue();
      var crecord = viewport.getCustomer();
      var customerId = viewport.getCustomer().getId();
      var venueId = vrecord.getId();
      var merchantId = vrecord.getMerchant().getId();

      var cvenue = viewport.getCheckinInfo().venue;
      var checkedIn = (cvenue != null);
      var checkedInMatch = (checkedIn && (cvenue.getId() == venueId));

      //me.getDescPanel().setData(vrecord);
      //me.getDescContainer().show();

      var rstore = Ext.StoreMgr.get('MerchantRenderStore');
      //if (rstore.getRange()[0] != vrecord)
      {
         rstore.setData(vrecord);
         //
         // Update Customer Statistics
         // in case venue object was never updated ...
         //
         me.onCustomerRecordUpdate(crecord);
      }
      //
      // Main Menu button
      //
      activeItem.showMainBtn = (checkedIn && !checkedInMatch);
      //
      // CheckIn button
      //
      activeItem.showCheckinBtn = (!checkedIn || !checkedInMatch);
      //
      // Either we are checked-in or
      // customer exploring a venue they checked-in in the past ...
      //
      if (checkedInMatch)
      {
         activeItem.renderFeed = true;
         //me.getAddress().hide();
         //me.getStats().show();
         console.debug("Merchant Checkin Mode");
      }
      //
      // Explore Mode
      //
      else
      {
         activeItem.renderFeed = me.showFeed;
         //me.getAddress().setData(vrecord.getData(true));
         //me.getAddress().show();
         //me.getStats().hide();
         console.debug("Merchant Explore Mode");
      }
      //page.createView();

      var scroll = activeItem.getScrollable();
      scroll.getScroller().scrollTo(0, 0);

      var feedContainer = me.getFeedContainer();
      if (feedContainer)
      {
         feedContainer[activeItem.renderFeed ? 'show' : 'hide'];
      }

      me.getCheckinBtn()[(activeItem.showCheckinBtn) ? 'show':'hide']();
      me.getMainBtn()[(activeItem.showMainBtn) ? 'show':'hide']();
      var prizeBtn = me.getPrizesBtn();
      //if (!Customer.isValid(crecord.getId()))
      {
         prizeBtn.setIcon('');
         prizeBtn.setIconCls('prizes');
      }
      /*
      else
      {
      var type = Ext.StoreMgr.get('BadgeStore').getById(crecord.get('badge_id')).get('type');

      prizeBtn.setIconCls('prizeicon');
      prizeBtn.setIcon(Genesis.view.client.Badges.getPhoto(type, 'thumbnail_small_url'));
      }
      */
      // Update TitleBar
      var bar = activeItem.query('titlebar')[0];
      bar.setTitle(' ');
      Ext.defer(function()
      {
         // Update TitleBar
         bar.setTitle(vrecord.get('name'));
      }, 1, me);
   },
   onMainDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      for (var i = 0; i < activeItem.getInnerItems().length; i++)
      {
         //activeItem.getInnerItems()[i].setVisibility(false);
      }
      //this.getCheckinBtn().hide();
   },
   onMainDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();

      //Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
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
            //
            // To-do : Depending on what to redeem
            //
            var controller = app.getController('client.Prizes');
            //var controller = app.getController('client.Redemptions');
            var rstore = Ext.StoreMgr.get('RedeemStore');
            record = rstore.getById(record.get('reward_id'));
            controller.fireEvent('showredeemitem', record);
            /*
             Ext.create('Genesis.model.CustomerReward',
             {
             //'id' : 1,
             'expiry_date' : null,
             'reward' : record,
             'merchant' : viewport.getCheckinInfo().venue.getMerchant()
             }));
             */
            break;
      }
   },
   onMainSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onMainDisclose(d, model);
      return false;
   },
   onCustomerRecordUpdate : function(customer)
   {
      var me = this;
      var rstore = Ext.StoreMgr.get('MerchantRenderStore');
      if (rstore && (rstore.getCount() > 0))
      {
         //
         // Udpate MerchantRenderStore when CustomerStore is updated
         //
         if (rstore && rstore.getRange()[0].getMerchant().getId() == customer.getMerchant().getId())
         {
            if (me.getPrizesBtn())
            {
               me.getPrizesBtn().setBadgeText(customer.get('eligible_for_prize') ? '✔' : null);
            }
            if (me.getRedeemBtn())
            {
               me.getRedeemBtn().setBadgeText(customer.get('eligible_for_reward') ? '✔' : null);
            }
            //rstore.fireEvent('refresh', rstore, rstore.data);
         }
      }
   },
   onCheckinTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      me.getGeoLocation();
   },
   onBackToCheckIn : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var cinfo = viewport.getCheckinInfo();
      var app = me.getApplication();
      var ccntlr = app.getController('client.Checkins');

      var ccustomer = cinfo.customer;
      var cvenue = cinfo.venue;
      var cmetaData = cinfo.metaData;

      if (venue.getId() != cvenue.getId())
      {
         console.log("Update current Venue to be Checked-In Merchant Account ...");

         // Restore Merchant Info
         ccntlr.fireEvent('setupCheckinInfo', 'checkin', cvenue, ccustomer, cmetaData);
         me.fireEvent('updatemetadata', cmetaData);
      }

      me.checkInAccount();
   },
   onMapBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      me.redirectTo('venueDetails');
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
               try
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
               }
               catch(e)
               {
               }
            }, 2 * 1000);
            break;
         }
      }

      return true;
   },
   onJackpotWinnersTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var merchantId = me.getViewPortCntlr().getVenue().getMerchant().getId();
      me.redirectTo('jackpotWinners/' + merchantId);
   },
   onBadgeTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('badges');
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
      //var cvenue = viewport.getCheckinInfo().venue;
      //var showFeed = (customerId > 0) || (cvenue && (cvenue.getId() == venueId));
      var showFeed = true;
      this.openMainPage(showFeed, backToMain > 0);
   },
   venueDetails : function()
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

      me.setAnimationMode(me.self.superclass.self.animationMode['cover']);
      me.pushView(me.getMerchantDetails());
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
      var vport = me.getViewport();

      // Check if this is the first time logging into the venue
      me.showFeed = showFeed;
      if (!backToMain)
      {
         // Refresh Merchant Panel Info
         var viewport = me.getViewPortCntlr();
         var venue = viewport.getVenue();
         if (me.getMainPage() == vport.getActiveItem())
         {
            me.checkInAccount();
         }
         else
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['pop']);
            me.pushView(me.getMainPage());
         }
      }
      else
      {
         me.fireEvent('backToMain');
      }
      console.log("Merchant Account Opened");
   }
});
