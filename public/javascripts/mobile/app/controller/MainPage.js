Ext.define('Genesis.controller.MainPage',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      mainPage_path : '/mainPage',
      loginPage_path : '/loginPage'
   },
   xtype : 'mainPageCntlr',
   models : ['frontend.MainPage', 'EligibleReward', 'Customer', 'User'],
   config :
   {
      refs :
      {
         // Login Page
         login :
         {
            selector : 'loginPageview',
            autoCreate : true,
            xtype : 'loginpageview'
         },
         // Main Page
         main :
         {
            selector : 'mainpageview',
            autoCreate : true,
            xtype : 'mainpageview'
         }
      },
      control :
      {
         'loginPageview' :
         {
            select : 'onLoginItemSelect'
         },
         'mainpageview dataview' :
         {
            //itemtap : 'onItemTap',
            select : 'onItemSelect',
            itemtouchstart : 'onItemTouchStart',
            itemtouchend : 'onItemTouchEnd'
         },
         'mainpageview' :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      }
   },
   init : function(app)
   {
      this.callParent(arguments);

      //
      // Loads Front Page Metadata
      //
      Ext.regStore('MainPageStore',
      {
         model : 'Genesis.model.frontend.MainPage',
         autoLoad : true
      });
      //
      // Load all the info into Stores
      // Normally we do this in the Login screen
      //
      Ext.regStore('UserStore',
      {
         model : 'Genesis.model.User',
         autoLoad : false
      });
      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : true
      });
      //
      // Store storing the Venue currently viewing
      //
      Ext.regStore('VenueStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });
      //
      // Store storing the Customer's Eligible Rewards at a Venue
      // Used during Checkin
      //
      Ext.regStore('EligibleRewardsStore',
      {
         model : 'Genesis.model.EligibleReward',
         autoLoad : false,
         listeners :
         {
            'metachange' : Ext.bind(function(store, meta)
            {
               var cntlr = this.getApplication().getController('Checkins');
               var record = Ext.StoreMgr.get('CheckinExploreStore').getById(meta.venueId);
               
               store.getProxy().getReader().rawData.metaData = record;
               cntlr.setupVenueInfoCommon(record);
            }, this)
         }
      });
      console.log("MainPage Init");
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onItemSelect : function(d, model, eOpts)
   {
      d.deselect([model], false);
      console.log("Controller=[" + model.data.pageCntlr + "]");

      var cntlr = this.getApplication().getController(model.get('pageCntlr'));
      var msg = cntlr.isOpenAllowed();
      if(msg === true)
      {
         if(model.get('subFeature'))
         {
            cntlr.openPage(model.get('subFeature'));
         }
         else
         {
            cntlr.openMainPage();
         }
      }
      else
      {
         Ext.Msg.alert("", msg);
      }
      return false;
   },
   onItemTouchStart : function(d, index, target, e, eOpts)
   {
      //Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).mask();

   },
   onItemTouchEnd : function(d, index, target, e, eOpts)
   {
      //Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).unmask();
   },
   onActivate : function(c, eOpts)
   {
      var show = this.getViewport().getCheckinInfo().venueId > 0;
      this.getMain().query('tabbar[cls=navigationBarBottom]')[0][show ? 'show' : 'hide']();

      if(!this.initialized)
      {
         this.initialized = true;

         var carousel = this.getMain().query('carousel')[0];
         var items = Ext.StoreMgr.get('MainPageStore').getRange();
         for(var i = 0; i < Math.ceil(items.length / 6); i++)
         {
            carousel.add(
            {
               xtype : 'dataview',
               cls : 'mainMenuSelections',
               scrollable : false,
               deferInitialRefresh : false,
               store :
               {
                  model : 'Genesis.model.frontend.MainPage',
                  data : Ext.StoreMgr.get('MainPageStore').getRange(i * 6, (i * 6) + 5)
               },
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="mainPageItemWrapper">', '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>', '<div class="photoName">{name}</div>', '</div>',
               // @formatter:on
               {
                  getPhoto : function(photoURL)
                  {
                     return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
                  }
               }),
               autoScroll : true
            });
         }
      }

   },
   onDeactivate : function(c, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Login Page
   // --------------------------------------------------------------------------
   onLoginItemSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      return false;
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getMain();
   },
   openMainPage : function()
   {
      var cntlr = this.getViewPortCntlr();
      this.pushView(this.getMainPage());
      //
      // Hide the initial Back Button on first page
      //
      if(!cntlr.loggedIn)
      {
         this.getViewport().getNavigationBar().getBackButton().hide();
      }
      console.log("MainPage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
