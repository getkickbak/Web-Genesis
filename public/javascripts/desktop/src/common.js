Genesis =
{
   fbAppId : '197968780267830',
   emailId : 'erchan_2000@yahoo.ca',
   fb_login_tag : '<fb:login-button perms="email,user_birthday,publish_stream" on-login="facebook_onLogin(false);" size="large" background="dark" length="long" autologoutlink="true"></fb:login-button>',
   sign_in_path : '/sign_in',
   sign_out_path : '/sign_out',
   userId : '725565520',
   initDone : false,
   loginBitSet : 0x0
};

var _init = function()
{
   if(Genesis.initDone == true)
   {
      oldSessionLogin();
      //oAuth2SessionLogin();
      var popupDialog = $("#popupDialog");
      var popupModal = $("#popupModal");
      popupDialog.find(".close").click(function()
      {
         popupDialog.css("display", "none");
         popupModal.css("display", "none");
      });
   }
   Genesis.initDone = true;
}
var oldSessionLogin = function()
{
   var response = FB.getSession();
   if(response == null)
   {
      $("#fb_login").css("display", "");
      _logout();
      _fb_disconnect();
      if($("#fb_account")[0])
      {
         // Not logged into facebook, but web session avail
         facebook_onLogout();
      }
   }
   else
   {
      if(response.uid == Genesis.userId)
      {
         // Logged into facebook, but no web session avail
         if(!$("#fb_account")[0])
         {
            _login();
            _fb_connect();
            facebook_onLogin(false);
         }
         else
         {
            $("#fb_login_img").html('<img src="http://graph.facebook.com/' + Genesis.userId + '/picture?type=square"/>');
            $("#fb_login_img").css("display", "");
            facebook_loginCallback();
         }
      }
      else
      {
         // Logged into facebook, but mismatch web session avail
         _logout();
         _fb_disconnect();
         facebook_onLogout();
      }
   }
   FB.Event.subscribe('auth.sessionChange', function(response)
   {
      // Session Removed
      if(response.status != 'connected')
      {
         _logout();
         //facebook_onLogout();

      }
      // New session detected
      else
      {
         // Clear current session
         //FB.Auth.setSession(null);
         _login();
         facebook_onLogin(false);
      }
   });
}
var oAuth2SessionLogin = function()
{
   FB.getLoginStatus(function(response)
   {
      if(response.status != 'connected')
      {
         $("#fb_login").css("display", "");
         // Not logged into facebook, but web session avail
         if($("#fb_account")[0])
         {
            _login();
            _fb_connect();
         }
         else
         {
            _logout();
            _fb_disconnect();
         }
      }
      else
      {
         if(response.authResponse && (response.authResponse.userId == Genesis.userId))
         {
            // Logged into facebook, but no web session avail
            if(!$("#fb_account")[0])
            {
               _login();
               _fb_connect();
               facebook_onLogin(false);
            }
            else
            {
               $("#fb_login_img").html('<img id="fb_login_img" src="http://graph.facebook.com/' + Genesis.userId + '/picture?type=square"/>');
               $("#fb_login_img").css("display", "");
            }
         }
         else
         {
            // Logged into facebook, but mismatch web session avail
            _logout();
            _fb_disconnect();
            facebook_onLogout();
         }
      }
   });
   FB.Event.subscribe('auth.authResponseChange', function(response)
   {
      // do something with response
      //alert("logout success");
      if(response.status != 'connected')
      {
         _logout();
         facebook_onLogout();

      }
      else
      {
         _login();
         facebook_onLogin(false);
      }
   });
}
var loginPopup = function()
{
   var popupModal = $("#popupModal");
   var popupDialog = $("#popupDialog");
   try
   {
      FB.Auth.setSession(null);
   }
   catch(e)
   {
   }
   var popupDialogTitle = popupDialog.find(".modal-header h3").html("Facebook Login Required");
   var popupDialogContent = popupDialog.find(".modal-body").html(Genesis.fb_login_tag);
   popupDialog.find(".modal").css("top", (document.body.scrollTop + 100) + "px");
   popupDialog.css("display", "");
   popupModal.css("display", "");
   FB.XFBML.parse();
}

window.fbAsyncInit = function()
{
   FB.init(
   {
      // Use user's Facebook AppID if we are logging into their site directly
      appId : Genesis.fbAppId,
      authResponse : true,
      status : true,
      cookie : true,
      xfbml : false
      //,oauth : true
   });
   _init();
};

$(document).ready($(function()
{
   _init();

   // scroll spy logic
   // ================

   var activeTarget, position =
   {
   }, $window = $(window), nav = $('body > .topbar li a'), targets = nav.map(function()
   {
      return $(this).attr('href');
   });
   var offsets = $.map(targets, function(id)
   {
      try
      {
         return $(id).offset().top;
      }
      catch(e)
      {
         return 0;
      }
   });
   function setButton(id)
   {
      nav.parent("li").removeClass('active');
      $(nav[$.inArray(id, targets)]).parent("li").addClass('active');
   }

   function processScroll(e)
   {
      var scrollTop = $window.scrollTop() + 10, i;
      for( i = offsets.length; i--; )
      {
         if(activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]))
         {
            activeTarget = targets[i];
            setButton(activeTarget);
         }
      }
   }


   nav.click(function()
   {
      processScroll();
   });
   processScroll();

   $window.scroll(processScroll);
   // Dropdown example for topbar nav
   // ===============================

   $("body").bind("click", function(e)
   {
      $('.dropdown-toggle, .menu').parent("li").removeClass("open");
   });
   $(".dropdown-toggle, .menu").click(function(e)
   {
      var $li = $(this).parent("li").toggleClass('open');
      return false;
   });
}));
// **************************************************************************
// Facebook API
/*
* Clean up any Facebook cookies, otherwise, we have page loading problems
* One set for production domain, another for developement domain
*/
// **************************************************************************
function facebook_onLogout()
{
   if(FB.getSession())
   {
      FB.logout(function(response)
      {
      });
   }
   FB.Auth.setSession(null);
   $.ajax(
   {
      url : Genesis.sign_out_path,
      type : "GET",
      dataType : "json",
      //processData: false,
      //contentType: "application/json",
      success : function(response)
      {
         window.location.reload(true);
      }
   });
}

function facebook_loginCallback()
{
   FB.api('/me', function(response)
   {
      if(response.id == null)
      {
         // Show Login Button to log into Facebook
         facebook_onLogout();
         return;
      }
      Genesis.loginBitSet |= 0x10;
      if((Genesis.loginBitSet == 0x11) && ($("#fb_login_img").text()))
      {
         window.location.reload(true);
      }
      //$(".sign_in").live('click', function(evt)
      //);
      //Ext.util.Cookies.set('fbAppId', (Genesis.fbAppId != 0) ? Genesis.fbAppId : Genesis.toontiFbAppId);

      /*
       var accountCreationInfo = Seam.Remoting.createType("com.toonti.soc.user.UserAccountCreation");
       accountCreationInfo.setFbId(response.id);
       accountCreationInfo.setFirstName(response.first_name);
       accountCreationInfo.setLastName(response.last_name);
       accountCreationInfo.setEmail(response.email);
       accountCreationInfo.setPassword('');
       var genderTypes =
       {
       'male' : 'M',
       'female' : 'F'
       };
       var gender = genderTypes[response.gender];
       if(Ext.isEmpty(gender))
       {
       gender = 'U';
       }
       accountCreationInfo.setGender(gender);
       var tbirthday = response.birthday;
       var birthday;
       if(!Ext.isEmpty(tbirthday))
       {
       tbirthday = tbirthday.split('/');
       var year = Ext.num(tbirthday[2]);
       var month =  Ext.num(tbirthday[0]) - 1;
       var day = Ext.num(tbirthday[1]);
       birthday = new Date(year, month, day);
       }
       else
       {
       birthday = new Date();
       }
       accountCreationInfo.setBirthday(birthday);
       var subdomainName = getHostSubdomain();
       var domainName = null;
       if(subdomainName != null)
       {
       if(subdomainName == 'www')
       {
       subdomainName = null;
       }
       }
       else
       {
       domainName = document.location.host;
       }
       var username = response.username || response.id;
       //var thumbnails = accountCreationInfo.profileThumbnails = [];
       if(username)
       {
       //for (var i=1; i<=6; i++)
       //{
       //thumbnails[i-1] = Genesis.getFbProfilePhotoURL(username,i);
       //}
       Ext.util.Cookies.set('fbUserName', username);
       }
       else
       {
       //for (var i=1; i<=6; i++)
       //{
       //thumbnails[i-1] = "";
       //}
       $.cookie('fbUserName');
       }
       var authenticator = Seam.Component.getInstance("authenticator");
       authenticator.facebookLogin(accountCreationInfo, subdomainName, domainName, Ext.isEmpty(response.verified) ? false : true,
       function(results)
       {
       if(results.success)
       {
       if(signup)
       {
       var subdomainName = getHostSubdomain();
       if((!Ext.isEmpty(subdomainName) && subdomainName != 'www') || Ext.isEmpty(subdomainName))
       {
       location.href = Genesis.communityProfileURL;
       }
       else
       {
       location.href = Genesis.createCommunityURL;
       }
       }
       else
       {
       window.location.reload();
       }
       }
       else
       {
       Ext.MessageBox.show(
       {
       title : 'Error',
       msg : results.items[0],
       buttons : Ext.MessageBox.OK,
       icon : Ext.MessageBox.ERROR
       });
       return false;
       }
       });
       */
   });
}

function facebook_onLogin(signup)
{
   $("#fb_login").css("display", "none");
   if(!$("#fb_account")[0])
   {
      //evt.preventDefault();

      //var $self = $(this);
      $.ajax(
      {
         url : Genesis.sign_in_path,
         type : "POST",
         data : "email=" + Genesis.emailId,
         dataType : "json",
         //processData: false,
         //contentType: "application/json",
         success : function(response)
         {
            Genesis.loginBitSet |= 0x01;
            if(Genesis.loginBitSet == 0x11)
            {
               window.location.reload(true);
            }
         }
      });
   }
   Genesis.loginBitSet |= 0x01;
   if(FB.getSession() == null)
   {
      FB.login(function(res)
      {
         if(res.status == 'connected')
         {
            facebook_loginCallback();
         }
      },
      {
         //scope : 'email,user_birthday,publish_stream'
         perms : 'email,user_birthday,publish_stream'
      });
   }
   else
   {
      facebook_loginCallback();
   }
};

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
