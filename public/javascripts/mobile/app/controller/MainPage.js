Ext.define('Genesis.controller.MainPage',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store', 'Genesis.model.EarnPrize'],
   statics :
   {
      mainPage_path : '/mainPage',
      loginPage_path : '/loginPage',
      sign_in_path : '/sign_in',
      sign_out_path : '/sign_out',
   },
   xtype : 'mainPageCntlr',
   config :
   {
      models : ['frontend.MainPage', 'frontend.Signin', 'frontend.Account', 'EligibleReward', 'Customer', 'User', 'Merchant', 'EarnPrize', 'CustomerReward'],
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
         mainBtn : 'viewportview button[tag=main]',
         infoBtn : 'viewportview button[tag=info]'
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
         'createaccountpageview button[tag=createAccount]' :
         {
            tap : 'onCreateAccountSubmit'
         },
         'actionsheet button[tag=logout]' :
         {
            tap : 'onLogoutTap'
         },

         'mainpageview dataview' :
         {
            //itemtap : 'onItemTap',
            select : 'onItemSelect',
            itemtouchstart : 'onItemTouchStart',
            itemtouchend : 'onItemTouchEnd'
         },
         main :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      }
   },
   init : function(app)
   {
      this.callParent(arguments);

      var me = this;
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
      //
      // Prizes that a User Earned
      //
      Ext.regStore('MerchantPrizeStore',
      {
         model : 'Genesis.model.EarnPrize',
         autoLoad : false,
         clearOnPageLoad : false,
         sorters : [
         {
            // Clump by merchant
            sorterFn : function(o1, o2)
            {
               return o1.getMerchant().getId() - o2.getMerchant().getId();
            }
         },
         {
            sorterFn : function(o1, o2)
            {
               // Return based on expiry date
               return o1.get('expiry_date') - o2.get('expiry_date');
            }
         },
         {
            sorterFn : function(o1, o2)
            {
               // Return based on issue date
               return o1.getId() - o2.getId();
            }
         }],
         listeners :
         {
            scope : this,
            'load' : function(store, records, successful, operation, eOpts)
            {
               store.loadCallback = [records, operation];
            },
            'metachange' : function(store, proxy, eOpts)
            {
               var app = me.getApplication();
               var controller = app.getController('RewardsRedemptions');
               app.dispatch(
               {
                  action : 'onRewardMetaChange',
                  args : [store, proxy.getReader().metaData],
                  controller : controller,
                  scope : controller
               });
            }
         }
      });
      //
      // Store storing the Customer's Eligible Rewards at a Venue
      // Used during Checkin
      //
      Ext.regStore('EligibleRewardsStore',
      {
         model : 'Genesis.model.EligibleReward',
         autoLoad : false
      });
      console.log("MainPage Controller Init");
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
   onActivate : function(c, eOpts)
   {
      this.getInfoBtn().show();
      this.getMainBtn().hide();
   },
   onDeactivate : function(c, eOpts)
   {
      this.getInfoBtn().hide();
   },
   // --------------------------------------------------------------------------
   // Login Page
   // --------------------------------------------------------------------------
   onLoginActivate : function(c, eOpts)
   {
      this.getInfoBtn().hide();
      this.getMainBtn().hide();
   },
   onLoginDeactivate : function(c, eOpts)
   {
   },
   onLogoutTap : function(b, e, eOpts)
   {
      var viewport = this.getViewport();
      var vport = this.getViewPortCntlr();
      var fb = Genesis.constants;
      var flag = 0;
      //
      // Logout of Facebook
      //
      var _fbLogout = function()
      {
         viewport.setFadeAnimation();
         vport.onFeatureTap('MainPage', 'login');
      }
      var _logout = function()
      {
         console.log("Logging out ...")
         Customer['setLogoutUrl']();
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            callback : function(records, operation)
            {
               if(operation.wasSuccessful())
               {
                  console.log("Logout Successful!")
                  vport.setLoggedIn(false);
                  fb.authToken = null;
                  if(fb.currFbId)
                  {
                     Genesis.constants.facebook_onLogout(function()
                     {
                        _fbLogout();
                     });
                  }
                  else
                  {
                     _fbLogout();
                  }
               }
            }
         });
      }

      b.parent.onAfter(
      {
         hiddenchange : function()
         {
            if((flag |= 0x01) == 0x11)
            {
               _logout();
            }
         },
         single : true
      });
      b.parent.hide();
      if(fb.currFbId)
      {
         console.log("Logging out of Facebook ...")
         Genesis.constants.facebook_onLogout(function()
         {
            //
            // Login as someone else?
            //
            if((flag |= 0x10) == 0x11)
            {
               _logout();
            }
         });
      }
      else
      {
         console.log("No Login info found from Facebook ...")
         if((flag |= 0x10) == 0x11)
         {
            _logout();
         }
      }
   },
   onFacebookTap : function(b, e, eOpts)
   {
      if(!Ext.StoreMgr.get('CustomerStore'))
      {
         this.loginCommon();
      }
      //
      // Login to Facebook
      //
      Genesis.constants.fbLogin(function(params)
      {
         console.log("Logging into Kickbak using Facebook account ...");
         Customer['setFbLoginUrl']();
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            params : params
         });
      });
   },
   onCreateAccountTap : function(b, e, eOpts)
   {
      this.pushView(this.getCreateAccount());
   },
   onSignInTap : function(b, e, eOpts)
   {
      this.pushView(this.getSignin());
   },
   // --------------------------------------------------------------------------
   // SignIn and CreateAccount Page
   // --------------------------------------------------------------------------
   loginCommon : function()
   {
      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false,
         pageSize : 1000,
         listeners :
         {
            scope : this,
            "load" : function(store, records, successful, operation, eOpts)
            {
               if(successful)
               {
                  var vport = this.getViewPortCntlr();
                  vport.setLoggedIn(true);
                  this.getViewport().reset(this);
                  vport.onFeatureTap('MainPage');
               }
            },
            'metachange' : function(store, proxy, eOpts)
            {
               // Load Prizes into DataStore
               var metaData = proxy.getReader().metaData;

               //
               // Update MerchantPrizeStore
               //
               var prizes = metaData['prizes'];
               if(prizes)
               {
                  console.debug("Total Prizes - " + prizes.length);
                  for(var i = 0; i < prizes.length; i++)
                  {
                     //
                     // CustomerReward's Model rootProperty is "data"
                     //
                     prizes[i].reward =
                     {
                        data : prizes[i].reward
                     }
                  }
                  Ext.StoreMgr.get('MerchantPrizeStore').setData(prizes);
               }

               //
               // Update Authentication Token
               //
               var authToken = metaData['auth_token'];
               console.debug("AuthToken - " + authToken)
               if(authToken)
               {
                  Genesis.constants.authToken = authToken;
               }

               //
               // Update Eligible Rewards
               //
               var rewards = metaData['eligible_rewards'];
               if(rewards)
               {
                  console.debug("Total Eligible Rewards - " + rewards.length);
                  var estore = Ext.StoreMgr.get('EligibleRewardsStore');
                  estore.setData(rewards);
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
         sorters : [
         {
            sorterFn : function(o1, o2)
            {
               return o2.getMerchant().get('name') - o1.getMerchant().get('name');
            }
         }]
      });
   },
   onCreateAccountSubmit : function(b, e, eOpts)
   {
      var account = this.getCreateAccount();
      var values = account.getValues();
      var user = Ext.create('Genesis.model.frontend.Account', values);
      var validateErrors = user.validate();

      if(!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         Ext.device.Notification.show(
         {
            title : 'Oops',
            message : label + ' ' + field.getMessage() + ((Genesis.constants.isNative()) ? '.<br/>' : '\n') + 'Please Try Again'
         });
      }
      else
      {
         Customer['setCreateAccountUrl']();
         if(!Ext.StoreMgr.get('CustomerStore'))
         {
            this.loginCommon();
         }
         Ext.StoreMgr.get('CustomerStore').load(
         {
            params :
            {
               name : values.name,
               email : values.username,
               password : values.password
            },
            jsonData :
            {
            }
         });
      }
   },
   onSignInSubmit : function(b, e, eOpts)
   {
      var signin = this.getSignin();
      var values = signin.getValues();
      var user = Ext.create('Genesis.model.frontend.Signin', values);
      var validateErrors = user.validate();

      if(!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         Ext.device.Notification.show(
         {
            title : 'Oops',
            message : label + ' ' + field.getMessage() + ((Genesis.constants.isNative()) ? '.<br/>' : '\n') + 'Please Try Again'
         });
      }
      else
      {
         Customer['setLoginUrl']();
         if(!Ext.StoreMgr.get('CustomerStore'))
         {
            this.loginCommon();
         }
         Ext.StoreMgr.get('CustomerStore').load(
         {
            params :
            {
               email : values.username,
               password : values.password
            },
            jsonData :
            {
            }
         });
      }
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      switch (subFeature)
      {
         case 'main' :
         {
            this.getViewPortCntlr().onMainButtonTap();
            break;
         }
         case 'login' :
         {
            this.pushView(this.getLogin());
            break;
         }
      }
   },
   getMainPage : function()
   {
      return this.getMain();
   },
   openMainPage : function()
   {
      var cntlr = this.getViewPortCntlr();
      this.pushView(this.getMainPage());
      console.log("MainPage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
