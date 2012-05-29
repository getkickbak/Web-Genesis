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
      listeners :
      {
         'scannedqrcode' : 'onScannedQRcode',
         'locationupdate' : 'onLocationUpdate',
         'authcoderecv' : 'onAuthCodeRecv',
         'openpage' : 'onOpenPage'
      },
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
      return 'Logging in using' + Genesis.constants.addCRLF() + 'Facebook Connect ...';
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
         autoLoad : true,
         listeners :
         {
            scope : me,
            "load" : function(store, records, successful, operation, eOpts)
            {
               if(merchantMode)
               {
                  me.goToMain();
               }
            }
         }
      });

      if(!merchantMode)
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
         // Prizes that a User Earned
         //
         me.initMerchantPrizeStore();

         //
         // Store storing the Customer's Eligible Rewards at a Venue
         // Used during Checkin
         //
         Ext.regStore('EligibleRewardsStore',
         {
            model : 'Genesis.model.EligibleReward',
            autoLoad : false
         });

         //
         // Customer Accounts for an user
         //
         me.initCustomerStore();
      }

      console.log("MainPage Init");
   },
   initCustomerStore : function()
   {
      var me = this, db;
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

               if(successful && metaData && metaData['auth_token'])
               {
                  db = Genesis.db.getLocalDB();
                  console.debug(//
                  "auth_code [" + db['auth_code'] + "]" + "\n" + //
                  "currFbId [" + db['currFbId'] + "]");
                  me.goToMain();
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
               var authCode = metaData['auth_token'];
               if(authCode)
               {
                  console.debug("Login Auth Code - " + authCode)
                  db = Genesis.db.getLocalDB();
                  if(authCode != db['auth_code'])
                  {
                     Genesis.db.setLocalDBAttrib('auth_code', authCode);
                  }
               }

               me.getViewPortCntlr().updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [metaData]);
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
               if(name1 < name2)//sort string ascending
                  return -1
               if(name1 > name2)
                  return 1
               return 0 //default return value (no sorting)
            }
         }]
      });
   },
   initMerchantPrizeStore : function()
   {
      var me = this;
      var app = me.getApplication();
      Ext.regStore('MerchantPrizeStore',
      {
         model : 'Genesis.model.EarnPrize',
         autoLoad : false,
         clearOnPageLoad : false,
         sorters : [
         {
            // Clump by merchant (ascending order)
            sorterFn : function(o1, o2)
            {
               return o1.getMerchant().getId() - o2.getMerchant().getId();
            }
         },
         {
            // Return based on expiry date (descending order)
            sorterFn : function(o1, o2)
            {
               return Date.parse(o2.get('expiry_date')) - Date.parse(o1.get('expiry_date'));
            }
         },
         {
            // Return based on issue date (Bigger Id == issued later)
            sorterFn : function(o1, o2)
            {
               return o2.getId() - o1.getId();
            }
         }],
         listeners :
         {
            scope : this,
            'metachange' : function(store, proxy, eOpts)
            {
               var controller = app.getController('client.Rewards');
               app.dispatch(
               {
                  action : 'onPrizeStoreMetaChange',
                  args : [store, proxy.getReader().metaData],
                  controller : controller,
                  scope : controller
               });
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // EVent Handlers
   // --------------------------------------------------------------------------
   onAuthCodeRecv : function(metaData)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Accounts');
      app.dispatch(
      {
         action : 'onAuthCodeRecv',
         args : [metaData],
         controller : controller,
         scope : controller
      });
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onItemSelect : function(d, model, eOpts)
   {
      Genesis.controller.ControllerBase.playSoundFile(this.getViewPortCntlr().sound_files['clickSound']);
      
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
      this.getInfoBtn()[(merchantMode) ? 'hide' : 'show']();
   },
   onDeactivate : function(c, eOpts)
   {
      this.getInfoBtn().hide();
   },
   // --------------------------------------------------------------------------
   // Login Page
   // --------------------------------------------------------------------------
   facebookLogin : function(params)
   {
      Customer['setFbLoginUrl']();
      Ext.StoreMgr.get('CustomerStore').load(
      {
         jsonData :
         {
         },
         params : params,
         callback : function()
         {
            Ext.Viewport.setMasked(false);
         }
      });
   },
   onLoginActivate : function(c, eOpts)
   {
      this.getInfoBtn().hide();
   },
   onLoginDeactivate : function(c, eOpts)
   {
   },
   onLogoutTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewport();
      var vport = me.getViewPortCntlr();
      var flag = 0;
      //
      // Logout of Facebook
      //
      var _onLogout = function()
      {
         console.log("Resetting Session information ...")
         viewport.setFadeAnimation();
         vport.setLoggedIn(false);
         Genesis.db.removeLocalDBAttrib('auth_code');
         if(Genesis.db.getLocalDB()['currFbId'] > 0)
         {
            Genesis.fb.facebook_onLogout(null, true);
         }
         me.fireEvent('openpage', 'MainPage', 'login', null);
      }
      var _logout = function()
      {
         var authCode = Genesis.db.getLocalDB()['auth_code'];
         if(authCode)
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
                  if(operation.wasSuccessful())
                  {
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
            if((flag |= 0x01) == 0x11)
            {
               _logout();
            }
         },
         single : true
      });
      b.parent.hide();
      if(Genesis.db.getLocalDB()['currFbId'] > 0)
      {
         console.log("Logging out of Facebook ...")
         Genesis.fb.facebook_onLogout(function()
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
      this.pushView(this.getCreateAccount());
   },
   onSignInTap : function(b, e, eOpts, eInfo)
   {
      this.pushView(this.getSignin());
   },
   // --------------------------------------------------------------------------
   // SignIn and CreateAccount Page
   // --------------------------------------------------------------------------
   onCreateAccountSubmit : function(b, e, eOpts, eInfo)
   {
      var account = this.getCreateAccount();
      var values = account.getValues();
      var user = Ext.create('Genesis.model.frontend.Account', values);
      var validateErrors = user.validate();
      var response = Genesis.db.getLocalDB()['fbResponse'] || null;

      if(!validateErrors.isValid())
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
            password : values.password
         };

         if(response)
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
            callback : function()
            {
               Ext.Viewport.setMasked(false);
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
      };

      if(username)
      {
         params =
         {
            email : username,
            password : password
         };
      }
      Customer['setLoginUrl']();
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
            Ext.Viewport.setMasked(false);
            if(!operation.wasSuccessful())
            {
               Genesis.db.resetStorage();
               me.fireEvent('openpage', 'MainPage', 'login', null);
            }
         }
      });
   },
   onSignInSubmit : function(b, e, eOpts, eInfo)
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
            message : signInFailMsg(label + ' ' + field.getMessage())
         });
      }
      else
      {
         this.onSignIn(values.username, values.password);
      }
   },
   onCreateActivate : function(c, eOpts)
   {
      var response = Genesis.db.getLocalDB()['fbResponse'] || null;
      if(response)
      {
         var form = this.getCreateAccount();
         form.setValues(
         {
            name : response.name,
            username : response.email
         });
      }
   },
   onCreateDeactivate : function(c, eOpts)
   {
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
            this.pushView(this.getMainPage());
            break;
         }
         case 'merchant' :
         {
            var app = this.getApplication();
            var controller = app.getController('Merchants');
            app.dispatch(
            {
               action : 'onGotoCheckedInAccountTap',
               args : [],
               controller : controller,
               scope : controller
            });
            break;
         }
         case 'login' :
         {
            Ext.Viewport.setMasked(false);
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
