Ext.define('Genesis.controller.Main', {
   extend : 'Ext.app.Controller',

   config : {
      profile : Ext.os.deviceType.toLowerCase(),
      site : 'www.justformyfriends.com',
      sign_in_path : '/sign_in',
      sign_out_path : '/sign_out',
      resend_vouchers_path : '/resend_vouchers',
      resend_reward_path : '/resend_reward',
      create_referrals : '/referrals/create',
      referrals : '/referrals',
      verify_secret_code_path : '/verify_secret_code'
   },
   get_confirm_referrals : function(refId)
   {
      return this.getSite() + '/' + this.getReferrals() + '/' + refId + '/confirm';
   },
   //Browse - Feature Browse
   //Mode - Modes supported by the Feature
   //Page - Home Page for Feature
   views : ['LoginPage', 'MainPage',
   // Newsfeeds from merchants Page
   'NewsfeedPage',
   // Check in Pages
   'CheckinBrowse',
   // Main Page when the user has never checked-in before
   'CheckinMerchantMainPage',
   // Main Page when the user has checked-in before
   'CheckinMerchantPage',
   // Redemption&Reward Pages
   'RewardsRedeemPage', 'Reward', 'Redeem',
   //Merchant Account Pages
   'MerchantAccountBrowse', 'MerchanAcountPage', 'MerchantAccount',
   // QRCode Processing Pages
   'QRCodeDisplayMode', 'QRCodeScanMode',
   // Profile Page
   'ProfilePage',
   // Challenges Pages
   'ChallengePage', 'MenuChallenge',
   // Viewport for all Pages
   'Viewport'],

   stores : ['MerchantStore', 'UserStore', 'NewsfeedStore'],

   refs : [
   // Login Page
   {
      ref : 'loginpage',
      selector : 'loginPageview',
      autoCreate : true,
      xtype : 'loginpageview'
   },
   // Main Page
   {
      ref : 'mainpage',
      selector : 'mainPageview',
      autoCreate : true,
      xtype : 'mainpageview'
   },
   // Top Toolbar
   {
      ref : 'toptoolbar',
      selector : '#navigationBarTop'
   }, {
      ref : 'loadingIconLeft',
      selector : '#loadingIconLeft'
   }, {
      ref : 'homeButtonTop',
      selector : '#homeButtonTop'
   }, {
      ref : 'logoutButton',
      selector : '#logoutButton'
   }, {
      ref : 'loadingIconRight',
      selector : '#loadingIconRight'
   },
   // Bottom Toolbar
   {
      ref : 'bottomtoolbar',
      selector : '#navigatorBarBottom'
   }, {
      ref : 'backButtonLong',
      selector : '#backButtonLong'
   }, {
      ref : 'backButtonShort',
      selector : '#backButtonShort'
   }, {
      ref : 'checkin',
      selector : '#checkinTbButton'
   }, {
      ref : 'homeButtonBottom',
      selector : '#homeButtonBottom'
   }, {
      ref : 'displayText',
      selector : '#displayText'
   }, {
      ref : 'viewport',
      selector : 'viewport'
   }],

   init : function()
   {
      this.control({
         '#backButtonLong, #backButtonShort' : {
            tap : this.onBack
         },

         'button[ui=home]' : {
            tap : this.onHomeButtomTap
         }
         /*,
          /
          '#loadingIconLeft, #loadingIconRight' : {
          tap : this.onHomeButtomTap
          }
          */
      });
   },
   onBack : function()
   {
      this.viewport.pop();
      ;
   },
   onHomeButtonTap : function(list, index)
   {
      this.push(this.getMainpage());
   },
   onSourceButtonTap : function()
   {
      var overlay = this.getSourceOverlay(), filename = this.getMain().getActiveItem().ref;

      overlay.show();
      overlay.setMask({
         message : 'Loading...'
      });

      Ext.Ajax.request({
         url : this.getSite() + '/' + this.sign_in_path,
         scope : this,
         callback : this.onSourceLoad
      });
   },
   onSourceLoad : function(request, success, response)
   {
   },
   updateProfile : function(profile)
   {
      // initialize opening screen ...
      // If Logged in, goto MainPage, otherwise, goto LoginPage
      var successFn = function(response)
      {
         this.getMainPage();
      };

      Ext.Ajax.request({
         url : this.getSite() + '/' + this.sign_in_path,
         params : {
         },
         success : successFn.createDelegate(this),
         failure : function(response, opts)
         {
            if(phoneGapAvailable && response.status == 0 && response.responseText != '') {
               successFn.call(this, response);
            }
            else {
               console.error('failed to complete request');
               console.error('phoneGapAvailable:' + phoneGapAvailable);
               console.error('response.status:' + response.status);
               console.error('response.responseText:' + response.responseText);
            }
         }.createDelegate(this)
      });
      /*
       var navigation = this.getViewport(), toolbar;
       switch (profile)
       {
       case 'desktop':
       case 'tablet':
       navigation.setDetailContainer(this.getMain());
       break;

       case 'phone':
       toolbar = navigation.navigationBar()[0];
       toolbar.add({
       xtype : 'button',
       id : 'viewSourceButton',
       hidden : true,
       align : 'right',
       ui : 'action',
       action : 'viewSource',
       text : 'Source'
       });
       break;
       }
       */
   }
});

// **************************************************************************
// Facebook API
/*
* Clean up any Facebook cookies, otherwise, we have page loading problems
* One set for production domain, another for developement domain
*/
// **************************************************************************
function facebook_onLogout()
{
   try {
      _fb_disconnect();
      _logout();
      FB.logout(function(response)
      {
         Genesis.ajax(false, Genesis.sign_out_path, 'GET', null, 'json', function()
         {
            setTimeout(function()
            {
               window.location.reload(true);
            }, 0);
         });
      });
   }
   catch(e) {
      Genesis.ajax(false, Genesis.sign_out_path, 'GET', null, 'json', function()
      {
         setTimeout(function()
         {
            window.location.reload(true);
         }, 0);
      });
   }
}

function facebook_loginCallback(forceReload)
{
   FB.api('/me', function(response)
   {
      if(response.id == null) {
         //if($("#fb_account")[0])
         {
            // Show Login Button to log into Facebook
            facebook_onLogout();
         }
         return;
      }
      var facebook_id = response.id;
      var showLogin = function()
      {
         $("#fb_login").css("display", "none");
         $('#topbar .secondary-nav > li:not([id="fb_login"])').css('display', '');
         $("#fb_login_img").html('<img src="http://graph.facebook.com/' + facebook_id + '/picture?type=square"/>');
         $("#fb_login_img").css("display", "");

         _fb_connect();
         _login();
         var msg = $("#notice").text();
         if(msg) {
            Genesis.showWarningMsg(msg, null, true);
         }
      }
      if(Genesis.popupDialog.data().modal.isShown)
         Genesis.popupDialog.modal('hide');
      if(!$("#fb_account")[0] || (Genesis.currFbId != facebook_id) || forceReload) {
         var name = response.name;
         var email = response.email;
         var facebook_uid = response.username;
         var gender = response.gender == "male" ? "m" : "f";
         var birthday = response.birthday.split('/');
         birthday = birthday[2] + "-" + birthday[0] + "-" + birthday[1];
         var params = "name=" + name + "&email=" + email + "&facebook_id=" + facebook_id + "&facebook_uid=" + facebook_uid + "&gender=" + gender + "&birthday=" + birthday;
         Genesis.ajax(false, Genesis.sign_in_path, 'POST', params, 'json', function(response)
         {
            if(!$("#fb_account")[0] || forceReload) {
               setTimeout(function()
               {
                  window.location.reload(true);
               }, 0);
            }
            else {
               Genesis.currFbId = facebook_id;
               if($("#fb_account")[0]) {
                  showLogin();
               }
            }
         });
      }
      else {
         showLogin();
      }
   });
}

function facebook_onLogin(forceReload)
{
   $("#fb_login").css("display", "none");
   if($("#fb_account")[0]) {
      facebook_loginCallback(forceReload);
   }
   else {
      var _fbLogin = function()
      {
         FB.login(function(response)
         {
            if((response.status == 'connected') && response.authResponse) {
               Genesis.access_token = response.authResponse.accessToken;
               facebook_loginCallback(forceReload);
            }
         }, {
            scope : Genesis.perms
            //perms : Genesis.perms
         });
      };
      //Browser Quirks
      if($.client.browser == 'Safari') {
         FB.getLoginStatus(function(response)
         {
            if((response.status == 'connected') && response.authResponse) {
               Genesis.access_token = response.authResponse.accessToken;
               facebook_loginCallback(forceReload);
            }
            else {
               _fbLogin();
            }
         });
      }
      else {
         _fbLogin();
      }
   }
}

_fb_connect = _fb_disconnect = function()
{
   /*
    $.cookie(Genesis.fbAppId + "_expires", null);
    $.cookie(Genesis.fbAppId + "_session_key", null);
    $.cookie(Genesis.fbAppId + "_ss", null);
    $.cookie(Genesis.fbAppId + "_user", null);
    $.cookie(Genesis.fbAppId, null);
    $.cookie("base_domain_", null);
    $.cookie("fbsr_" + Genesis.fbAppId, null);
    */
};
