Ext.define('Genesis.controller.MainPage',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
   },
   xtype : 'mainPageCntlr',
   config :
   {
      routes :
      {
         '' : 'openPage', //Default do nothing
         'main' : 'mainPage',
         'login' : 'loginPage',
         'merchant' : 'merchantPage',
         'signin' : 'signInPage',
         'createAccount' : 'createAccountPage',
      },
      models : ['frontend.MainPage', 'frontend.Signin', 'frontend.Account', 'News', 'Customer', 'User', 'Merchant', 'CustomerReward'],
      refs :
      {
         // Login Page
         login :
         {
            selector : 'loginpageview',
            autoCreate : true,
            xtype : 'loginpageview'
         },
         signin :
         {
            selector : 'signinpageview',
            autoCreate : true,
            xtype : 'signinpageview'
         },
         createAccount :
         {
            selector : 'createaccountpageview',
            autoCreate : true,
            xtype : 'createaccountpageview'
         },
         // Main Page
         main :
         {
            selector : 'mainpageview',
            autoCreate : true,
            xtype : 'mainpageview'
         },
         mainCarousel : 'mainpageview',
         shortcutTabBar : 'mainpageview tabbar',
         infoBtn : 'button[tag=info]',
         redeemBtn : 'mainpageview tabbar[cls=navigationBarBottom] button[tag=redemptionSC]'
      },
      control :
      {
         login :
         {
            activate : 'onLoginActivate',
            deactivate : 'onLoginDeactivate'
         },
         'actionsheet button[tag=facebook]' :
         {
            tap : 'onFacebookTap'
         },
         'actionsheet button[tag=createAccount]' :
         {
            tap : 'onCreateAccountTap'
         },
         'actionsheet button[tag=signIn]' :
         {
            tap : 'onSignInTap'
         },
         'signinpageview button[tag=login]' :
         {
            tap : 'onSignInSubmit'
         },
         'actionsheet button[tag=logout]' :
         {
            tap : 'onLogoutTap'
         },
         main :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'mainpageview dataview' :
         {
            //itemtap : 'onItemTap',
            select : 'onItemSelect',
            itemtouchstart : 'onItemTouchStart',
            itemtouchend : 'onItemTouchEnd'
         },
         shortcutTabBar :
         {
            tabchange : 'onTabBarTabChange'
         },
         createAccount :
         {
            activate : 'onCreateActivate',
            deactivate : 'onCreateDeactivate'
         },
         'createaccountpageview button[tag=createAccount]' :
         {
            tap : 'onCreateAccountSubmit'
         }
      }
   },
   signInFailMsg : function(msg)
   {
      return msg + Genesis.constants.addCRLF() + 'Please Try Again';
   },
   loginWithFbMsg : function(msg)
   {
      return 'Logging in ...';
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Loads Front Page Metadata
      //
      Ext.regStore('MainPageStore',
      {
         model : 'Genesis.model.frontend.MainPage',
         autoLoad : true,
         listeners :
         {
            scope : me,
            "load" : function(store, records, successful, operation, eOpts)
            {
               if (merchantMode)
               {
                  me.goToMain();
               }
               else
               {
                  var db = Genesis.db.getLocalDB();
                  if (db['auth_code'])
                  {
                     me.persistLoadStores(function()
                     {
                        me.redirectTo('main');
                     });
                  }
                  else
                  {
                     me.redirectTo('login');
                  }
               }
            }
         }
      });

      if (!merchantMode)
      {
         //
         // Load all the info into Stores
         // Normally we do this in the Login screen
         //
         Ext.regStore('UserStore',
         {
            model : 'Genesis.model.User',
            autoLoad : false
         });

         //
         // Customer Accounts for an user
         //
         me.initCustomerStore();

         //
         // Venue Store for Redeem Shorcuts
         //
         me.initVenueStore();
      }

      console.log("MainPage Init");
      //
      // Preloading Pages to memory
      //
      me.getMain();
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
            "load" : function(store, records, successful, operation, eOpts)
            {
               // Load Prizes into DataStore
               var metaData = store.getProxy().getReader().metaData;

               if (successful && metaData && store.metaChanged)
               {
                  me.fireEvent('updatemetadata', metaData);
               }
               store.metaChanged = false;
            },
            'metachange' : function(store, proxy, eOpts)
            {
               var metaData = proxy.getReader().metaData;
               store.metaChanged = true;               
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
	              var controller = app.getController('client.Accounts');
	              controller.fireEvent('authcoderecv', metaData);
	           }
	           //
	           // Update PrizeStore
               //
               /*
	           var prizes = metaData['prizes'];
	           if (prizes)
	           {
	              console.debug("Total Prizes - " + prizes.length);
	              Ext.StoreMgr.get('rizeStore').setData(prizes);
	              me.persistSyncStores('PrizeStore');
	           }
	           */
            }
         },
         grouper :
         {
            groupFn : function(record)
            {
               return record.getMerchant().get('name');
            }
         },
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
               me.fireEvent('updatemetadata', proxy.getReader().metaData);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // EVent Handlers
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onItemSelect : function(d, model, eOpts)
   {
      //Genesis.controller.ControllerBase.playSoundFile(this.getViewPortCntlr().sound_files['clickSound']);

      d.deselect([model], false);
      console.log("Controller=[" + model.data.pageCntlr + "]");

      var cntlr = this.getApplication().getController(model.get('pageCntlr'));
      var msg = cntlr.isOpenAllowed();
      if (msg === true)
      {
         if (model.get('route'))
         {
            this.redirectTo(model.get('route'));
         }
         else
         if (model.get('subFeature'))
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
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : msg
         });
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
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //activeItem.createView();
      this.getInfoBtn()[(merchantMode) ? 'hide' : 'show']();
      if (!merchantMode)
      {
         var showIcon = false;
         var customers = Ext.StoreMgr.get('CustomerStore').getRange();
         
         for (var i = 0; i < customers.length; i++)
         {
            var customer = customers[i];
            if (customer.get('eligible_for_reward'))
            {
               showIcon = true;
               break;
            }
         }
         this.getRedeemBtn().setBadgeText(showIcon ? '✔' : null);
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
   // Login Page
   // --------------------------------------------------------------------------
   facebookLogin : function(params)
   {
      var me = this;
      Customer['setFbLoginUrl']();
      console.log("setFbLoginUrl - Logging in ...");
      Ext.StoreMgr.get('CustomerStore').load(
      {
         jsonData :
         {
         },
         params : Ext.apply(params,
         {
            device : Ext.encode(Genesis.constants.device)
         }),
         callback : function(records, operation)
         {
            //
            // Login Error, redo login
            //
            if (!operation.wasSuccessful())
            {
               me.redirectTo('login');
            }
            else
            {
               me.persistSyncStores('CustomerStore');
            }
            Ext.Viewport.setMasked(false);
         }
      });
   },
   onLoginActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var viewport = this.getViewPortCntlr();

      Genesis.db.resetStorage();
      viewport.setLoggedIn(false);

      //this.getInfoBtn().hide();
      //activeItem.createView();
   },
   onLoginDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //oldActiveItem.removeAll(true);
   },
   onLogoutTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var vport = me.getViewport();
      var viewport = me.getViewPortCntlr();
      var flag = 0;
      //
      // Logout of Facebook
      //
      var _onLogout = function()
      {
         console.log("Resetting Session information ...")
         if (Genesis.db.getLocalDB()['currFbId'] > 0)
         {
            Genesis.fb.facebook_onLogout(null, true);
         }
         me.redirectTo('login');
      }
      var _logout = function()
      {
         var authCode = Genesis.db.getLocalDB()['auth_code'];
         if (authCode)
         {
            console.log("Logging out ...")
            Customer['setLogoutUrl'](authCode);
            Ext.StoreMgr.get('CustomerStore').load(
            {
               jsonData :
               {
               },
               callback : function(records, operation)
               {
                  Ext.Viewport.setMasked(false);
                  if (operation.wasSuccessful())
                  {
                     me.persistSyncStores(null, true);
                     console.log("Logout Successful!")
                  }
                  else
                  {
                     console.log("Logout Failed!")
                  }
               }
            });
         }
         _onLogout();
      }

      b.parent.onAfter(
      {
         hiddenchange : function()
         {
            if ((flag |= 0x01) == 0x11)
            {
               _logout();
            }
         },
         single : true
      });
      b.parent.hide();
      if (Genesis.db.getLocalDB()['currFbId'] > 0)
      {
         console.log("Logging out of Facebook ...")
         Genesis.fb.facebook_onLogout(function()
         {
            //
            // Login as someone else?
            //
            if ((flag |= 0x10) == 0x11)
            {
               _logout();
            }
         });
      }
      else
      {
         console.log("No Login info found from Facebook ...")
         if ((flag |= 0x10) == 0x11)
         {
            _logout();
         }
      }
   },
   onFacebookTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      //
      // Forced to Login to Facebook
      //
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.loginWithFbMsg()
      });
      Genesis.db.removeLocalDBAttrib('currFbId');
      Genesis.fb.facebook_onLogin(function(params)
      {
         console.log(me.loginWithFbMsg());
         me.facebookLogin(params);
      }, true);
   },
   onCreateAccountTap : function(b, e, eOpts, eInfo)
   {
      this.setAnimationMode(this.self.superclass.self.animationMode['cover']);
      this.pushView(this.getCreateAccount());
   },
   onSignInTap : function(b, e, eOpts, eInfo)
   {
      this.setAnimationMode(this.self.superclass.self.animationMode['cover']);
      this.pushView(this.getSignin());
   },
   // --------------------------------------------------------------------------
   // SignIn and CreateAccount Page
   // --------------------------------------------------------------------------
   onCreateAccountSubmit : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var account = me.getCreateAccount();
      var values = account.getValues();
      var user = Ext.create('Genesis.model.frontend.Account', values);
      var validateErrors = user.validate();
      var response = Genesis.db.getLocalDB()['fbResponse'] || null;

      if (!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         var message = label + ' ' + field.getMessage() + Genesis.constants.addCRLF() + 'Please Try Again';
         console.log(message);
         Ext.device.Notification.show(
         {
            title : 'Oops',
            message : message
         });
      }
      else
      {
         console.debug("Creating Account ...");
         var params =
         {
            name : values.name,
            email : values.username,
            password : values.password,
            device : Ext.encode(Genesis.constants.device)
         };

         if (response)
         {
            params = Ext.apply(params, response);
         }

         Customer['setCreateAccountUrl']();
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            params :
            {
               user : Ext.encode(params)
            },
            callback : function(records, operation)
            {
               //
               // Login Error, redo login
               //
               Ext.Viewport.setMasked(false);
               if (!operation.wasSuccessful())
               {
               }
               else
               {
                  me.persistSyncStores();
               }
            }
         });
      }
   },
   onSignIn : function(username, password)
   {
      //Cleanup any outstanding registrations
      Genesis.fb.facebook_onLogout(null, Genesis.db.getLocalDB()['currFbId'] > 0);

      var me = this;
      var params =
      {
         device : Ext.encode(Genesis.constants.device)
      };

      if (username)
      {
         params = Ext.apply(params,
         {
            email : username,
            password : password
         });
      }
      Customer['setLoginUrl']();
      console.log("setLoginUrl - Logging in ...");
      Ext.StoreMgr.get('CustomerStore').load(
      {
         params : params,
         jsonData :
         {
         },
         callback : function(records, operation)
         {
            //
            // Login Error, redo login
            //
            if (!operation.wasSuccessful())
            {
               me.redirectTo('login');
            }
            else
            {
               me.persistSyncStores('CustomerStore');
            }
            Ext.Viewport.setMasked(false);
         }
      });
   },
   onSignInSubmit : function(b, e, eOpts, eInfo)
   {
      var signin = this.getSignin();
      var values = signin.getValues();
      var user = Ext.create('Genesis.model.frontend.Signin', values);
      var validateErrors = user.validate();

      if (!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         Ext.device.Notification.show(
         {
            title : 'Oops',
            message : signInFailMsg(label + ' ' + field.getMessage())
         });
      }
      else
      {
         this.onSignIn(values.username, values.password);
      }
   },
   onCreateActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var response = Genesis.db.getLocalDB()['fbResponse'] || null;
      if (response)
      {
         var form = this.getCreateAccount();
         form.setValues(
         {
            name : response.name,
            username : response.email
         });
      }
      //activeItem.createView();
   },
   onCreateDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //oldActiveItem.removeAll(true);
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function()
   {
      this.openPage('main');
   },
   loginPage : function()
   {
      this.openPage('login');
   },
   merchantPage : function()
   {
      this.openPage('merchant');
   },
   signInPage : function()
   {
      var db = Genesis.db.getLocalDB();
      if (db['currFbId'] > 0)
      {
         this.facebookLogin(db['fbResponse']);
      }
      else
      {
         this.onSignInTap();
      }
   },
   createAccountPage : function()
   {
      this.onCreateAccountTap();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this;

      me.resetView();
      switch (subFeature)
      {
         case 'main' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['pop']);
            me.pushView(me.getMainPage());
            break;
         }
         case 'merchant' :
         {
            var info = me.getViewPortCntlr().getCheckinInfo();
            me.redirectTo('venue/' + info.venue.getId() + '/' + info.customer.getId() + '/1');
            break;
         }
         case 'login' :
         {
            // Remove all previous view from viewStack
            me.resetView();
            me.getApplication().getController('client.Checkins').fireEvent('setupCheckinInfo', 'checkin', null, null, null);
            //me.getApplication().getController('client.Prizes').fireEvent('updatePrizeViews', null);
            me.setAnimationMode(me.self.superclass.self.animationMode['fade']);
            me.pushView(me.getLogin());
            break;
         }
      }
   },
   getMainPage : function()
   {
      var page = this.getMain();
      return page;
   },
   openMainPage : function()
   {
      var cntlr = this.getViewPortCntlr();
      this.setAnimationMode(this.self.superclass.self.animationMode['pop']);
      this.pushView(this.getMainPage());
      console.log("MainPage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
