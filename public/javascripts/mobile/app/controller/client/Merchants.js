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
         'venue/:id/:id/:id' : 'backToMainPage'
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
         prizesWonPanel : 'clientmerchantaccountview component[tag=prizesWonPanel]',
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
         mainBtn : 'clientmerchantaccountview tabbar[cls=navigationBarBottom] button[tag=main]',
         prizesBtn : 'clientmerchantaccountview tabbar[cls=navigationBarBottom] button[tag=prizes]',
         rewardsBtn : 'clientmerchantaccountview tabbar[cls=navigationBarBottom] button[tag=rewards]',
         merchantTabBar : 'clientmerchantaccountview tabbar'
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
         'clientmerchantaccountview button[ui=orange]' :
         {
            tap : 'onMerchantAccountRewardsTap'
         },
         'clientmerchantaccountview list' :
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
         'clientmerchantdetailsview map' :
         {
            maprender : 'onMapRender'
         },
         'clientmerchantdetailsview component[tag=map]' :
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
      me.getPrizesBtn().setBadgeText(crecord.get('eligible_for_prize') ? '&#10004;' : null);
      me.getRewardsBtn().setBadgeText(crecord.get('eligible_for_reward') ? '&#10004;' : null);

      // Update TitleBar
      activeItem.query('titlebar')[0].setTitle(' ');
      Ext.defer(function()
      {
         // Update TitleBar
         activeItem.query('titlebar')[0].setTitle(vrecord.get('name'));

         // Refresh Merchant Panel Info
         var rstore = Ext.StoreMgr.get('MerchantRenderStore');
         //if (rstore.getRange()[0] != vrecord)
         {
            rstore.setData(vrecord);
         }
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
            var rstore = Ext.StoreMgr.get('RedemptionsStore');
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
      var ccntlr = app.getController('client.Checkins');
      var cinfo = viewport.getCheckinInfo();

      var ccustomer = cinfo.customer;
      var cvenue = cinfo.venue;
      var cmetaData = cinfo.metaData;
      var venue = viewport.getVenue();

      if (venue.getId() != cvenue.getId())
      {
         console.log("Update current Venue to be Checked-In Merchant Account ...");

         // Restore Merchant Info
         ccntlr.fireEvent('setupCheckinInfo', 'checkin', cvenue, ccustomer, cmetaData);
         viewport.updateMetaDataTask.delay(0.1 * 1000, me.updateMetaData, me, [cmetaData]);
      }
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
            me.getViewport().animateActiveItem(page, anim);
            anim.onActiveItemChange(vport.getLayout(), page, page, null, controller);
            vport.doSetActiveItem(page, null);
         }
      }
      else
      {
         console.log("Going back to Checked-In Merchant Home Account Page ...");
         me.resetView();
         me.setAnimationMode(me.self.superclass.self.animationMode['pop']);
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

      me.setAnimationMode(me.self.superclass.self.animationMode['cover']);
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
         me.setAnimationMode(me.self.superclass.self.animationMode['pop']);
         me.pushView(me.getMainPage());
      }
      else
      {
         me.fireEvent('backToMain');
      }
      console.log("Merchant Account Opened");
   }
});
