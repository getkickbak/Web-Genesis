Ext.define('Genesis.controller.client.MainPage',
{
   extend : 'Genesis.controller.MainPageBase',
   xtype : 'clientMainPageCntlr',
   config :
   {
      models : ['Genesis.model.frontend.MainPage', 'Venue', 'Customer', 'User', 'Merchant', 'CustomerReward'],
      routes :
      {
         'merchant' : 'merchantPage'
      },
      refs :
      {
         // Main Page
         main :
         {
            selector : 'clientmainpageview',
            autoCreate : true,
            xtype : 'clientmainpageview'
         },
         // Login Page
         login :
         {
            selector : 'loginpageview',
            autoCreate : true,
            xtype : 'loginpageview'
         },
         mainCarousel : 'clientmainpageview',
         infoBtn : 'button[tag=info]',
         shortcutTabBar : 'clientmainpageview tabbar[tag=navigationBarBottom]',
         prizesBtn : 'clientmainpageview tabbar[tag=navigationBarBottom] button[tag=prizesSC]'
      },
      control :
      {
         shortcutTabBar :
         {
            tabchange : 'onTabBarTabChange'
         }
      },
      listeners :
      {
      }
   },
   initCallback : function()
   {
      var me = this;
      var db = Genesis.db.getLocalDB();
      if (!db['auth_code'])
      {
         me.resetView();
         me.redirectTo('login');
      }
      else
      {
         me.persistLoadStores(function()
         {
            var viewport = me.getViewPortCntlr(), ma_struct = db['ma_struct'];

            if (viewport.getApsPayload())
            {
               viewport.getGeoLocation();
            }
            else if (ma_struct)
            {
               Genesis.db.removeLocalDBAttrib('ma_struct');
               me.getApplication().getController('client' + '.Checkins').onExploreDisclose(null, ma_struct);
            }
            else
            {
               me.redirectTo('main');
            }
         });
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Customer Accounts for an user
      //
      me.initCustomerStore();

      //
      // Venue Store for Redeem Shorcuts
      //
      me.initVenueStore();

      console.log("Client MainPage Init");
   },
   initCustomerStore : function()
   {
      var me = this;
      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false,
         pageSize : 1000,
         listeners :
         {
            scope : me,
            'load' : function(store, records, successful, operation, eOpts)
            {
            },
            'metachange' : function(store, proxy, eOpts)
            {
               var metaData = proxy.getReader().metaData;
               //
               // QR Code from Transfer Points
               //
               var qrcode = metaData['data'];
               if (qrcode)
               {
                  /*
                   console.debug("QRCode received for Points Transfer" + '\n' + //
                   qrcode);
                   */
                  var app = me.getApplication();
                  var controller = app.getController('client' + '.Accounts');
                  controller.callBackStack['arguments'] = [metaData];
                  controller.fireEvent('triggerCallbacksChain');
               }
            }
         },
         grouper :
         {
            groupFn : function(record)
            {
               return record.getMerchant().get('name');
            }
         },
         filters : [
         {
            filterFn : function(record)
            {
               return Customer.isValid(record.getId());
            }
         }],
         sorters : [
         {
            sorterFn : function(o1, o2)
            {
               var name1 = o1.getMerchant().get('name'), name2 = o2.getMerchant().get('name');
               if (name1 < name2)//sort string ascending
                  return -1
               if (name1 > name2)
                  return 1
               return 0 //default return value (no sorting)
            }
         }]
      });
   },
   initVenueStore : function()
   {
      var me = this;
      Ext.regStore('VenueStore',
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
               //
               // No MetaData returned for now ...
               //
               if (store.isLoading())
               {
                  me.fireEvent('updatemetadata', proxy.getReader().metaData);
               }
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //activeItem.createView();
      this.getInfoBtn()[(merchantMode) ? 'hide' : 'show']();
      //Ext.Viewport.setMasked(null);
      if (!merchantMode && Genesis.db.getLocalDB()['auth_code'] && (Ext.StoreMgr.get('CustomerStore').getCount() == 0))
      {
         console.log("Refresh Account List");
         this.getApplication().getController('client' + '.Accounts').fireEvent('refresh');
      }
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      //this.getInfoBtn().hide();
   },
   onTabBarTabChange : function(bar, newTab, oldTab, eOpts)
   {
      switch(newTab.config.tag)
      {
         default :
         case 'rewards' :
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
   merchantPage : function()
   {
      this.openPage('merchant');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
