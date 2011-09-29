Genesis =
{
   fbAppId : '197968780267830',
   fb_login_tag : '<fb:login-button perms="email,user_birthday,publish_stream" on-login="facebook_onLogin();" size="large" background="dark" length="long"></fb:login-button>',
   sign_in_path : '/sign_in',
   sign_out_path : '/sign_out',
   resend_vouchers_path : '/resend_vouchers',
   resend_reward_path : '/resend_reward',
   create_referrals : '/referrals/create',
   get_referrals : '/referrals',
   initDone : false,
   errMsg : null,
   warningMsg : null,
   popupDialog : null,
   weekday : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
   _init : function()
   {
      if(this.initDone == true)
      {
         oldSessionLogin();
         document.addEventListener('touchmove', function(e)
         {
            e.preventDefault();
         }, false);
         this.popupDialog = $("#popupDialog");
      }
      this.initDone = true;
   },
   isEmpty : function(v)
   {
      return (!v || (v == undefined));
   },
   // **************************************************************************
   // Date Time
   // **************************************************************************
   convertDateCommon : function(v, dateFormat, noConvert)
   {
      var date;
      var format = dateFormat || this.dateFormat;

      if(!( v instanceof Date))
      {
         if( typeof (JSON) != 'undefined')
         {
            v = (jQuery.browser.msie) ? v.split(/Z$/)[0] : v.split('.')[0];
         }

         if(Genesis.isEmpty(v))
         {
            date = new Date();
         }
         else
         {
            if(format)
            {
               date = Date.parseDate(v, format);
               if(Genesis.isEmpty(date))
               {
                  date = new Date(v).format(format);
               }
               return [date, date];
            }
            date = new Date(v);
            if(date.toString() == 'Invalid Date')
            {
               date = Date.parseDate(v, format);
            }
         }
      }
      else
      {
         date = v;
      }
      if(!noConvert)
      {
         var currentDate = new Date().getTime();
         // Adjust for time drift between Client computer and Application Server
         var offsetTime = this.currentDateTime(currentDate);

         var timeExpiredSec = (offsetTime - date.getTime()) / 1000;

         if(timeExpiredSec > -10)
         {
            if((timeExpiredSec) < 2)
               return [timeExpiredSec, 'a second ago'];
            if((timeExpiredSec) < 60)
               return [timeExpiredSec, parseInt(timeExpiredSec) + ' secs ago'];
            timeExpiredSec = timeExpiredSec / 60;
            if((timeExpiredSec) < 2)
               return [timeExpiredSec, 'a minute ago'];
            if((timeExpiredSec) < 60)
               return [timeExpiredSec, parseInt(timeExpiredSec) + ' minutes ago'];
            timeExpiredSec = timeExpiredSec / 60;
            if((timeExpiredSec) < 2)
               return [date, 'an hour ago'];
            if((timeExpiredSec) < 24)
               return [date, parseInt(timeExpiredSec) + ' hours ago'];
            timeExpiredSec = timeExpiredSec / 24;
            if(((timeExpiredSec) < 2) && ((new Date().getDay() - date.getDay()) == 1))
               return [date, 'Yesterday at ' + date.format('g:i A')];
            if((timeExpiredSec) < 7)
               return [date, Genesis.weekday[date.getDay()] + ' at ' + date.format('g:i A')];
            timeExpiredSec = timeExpiredSec / 7;
            if(((timeExpiredSec) < 2) && (timeExpiredSec % 7 == 0))
               return [date, 'a week ago'];
            if(((timeExpiredSec) < 5) && (timeExpiredSec % 7 == 0))
               return [date, parseInt(timeExpiredSec) + ' weeks ago'];

            if(timeExpiredSec < 5)
               return [date, parseInt(timeExpiredSec * 7) + ' days ago']
            return [date, null];
         }
         // Back to the Future! Client might have changed it's local clock
         else
         {
         }
      }

      return [date, -1];
   },
   convertDateFullTime : function(v)
   {
      return v.format('D, M d, Y \\a\\t g:i A');
   },
   convertDateReminder : function(v)
   {
      var today = new Date();
      var todayDate = today.getDate();
      var todayMonth = today.getMonth();
      var todayYear = today.getFullYear();
      var date = v.getDate();
      var month = v.getMonth();
      var year = v.getFullYear();
      if(todayDate == date && todayMonth == month && todayYear == year)
      {
         return 'Today ' + v.format('g:i A');
      }
      return v.format('D g:i A');
   },
   convertDate : function(v, dateFormat)
   {
      var rc = this.convertDateCommon.call(this, v, dateFormat);
      if(rc[1] != -1)
      {
         return (rc[1] == null) ? rc[0].format('M d, Y') : rc[1];
      }
      else
      {
         return rc[0].format('D, M d, Y \\a\\t g:i A');
      }
   },
   convertDateNoTime : function(v)
   {
      var rc = this.convertDateCommon.call(this, v, null, true);
      if(rc[1] != -1)
      {
         return (rc[1] == null) ? rc[0].format('D, M d, Y') : rc[1];
      }
      else
      {
         return rc[0].format('D, M d, Y')
      }
   },
   convertDateNoTimeNoWeek : function(v)
   {
      var rc = this.convertDateCommon.call(this, v, null, true);
      if(rc[1] != -1)
      {
         return (rc[1] == null) ? rc[0].format('M d, Y') : rc[1];
      }
      else
      {
         return rc[0].format('M d, Y');
      }
   },
   convertDateInMins : function(v)
   {
      var rc = this.convertDateCommon.call(this, v, null, true);
      if(rc[1] != -1)
      {
         return (rc[1] == null) ? rc[0].format('h:ia T') : rc[1];
      }
      else
      {
         return rc[0].format('h:ia T');
      }
   },
   currentDateTime : function(currentDate)
   {
      return systemTime + (currentDate - clientTime);
   },
   // **************************************************************************
   // Switch Tabs Manually
   // **************************************************************************
   switchTab : function(tab, tabPanel)
   {
      tab.parent().find('.active').removeClass('active');
      tab.addClass('active');
      tabPanel.parent().find('.active').removeClass('active');
      tabPanel.addClass('active');
   },
   // **************************************************************************
   // Misc Functions
   // **************************************************************************
   _showMsg : function(obj, msg)
   {
      Genesis[obj].find("*:nth-child(2)").html(msg);
      Genesis[obj].switchClass('hide', 'in');
      location.href = "#top";
   },
   showErrMsg : function(msg)
   {
      this._showMsg('errMsg', msg)
   },
   showWarningMsg : function(msg)
   {
      this._showMsg('warningMsg', msg)
   },
   // **************************************************************************
   // Dynamic Popup
   // **************************************************************************
   loginPopup : function()
   {
      try
      {
         FB.Auth.setSession(null);
      }
      catch(e)
      {
      }
      var primBtn = this.popupDialog.find(".modal-footer .primary");
      var popupDialogTitle = this.popupDialog.find(".modal-header h3").html("Facebook Login Required");
      var popupDialogContent = this.popupDialog.find(".modal-body").html(Genesis.fb_login_tag);
      primBtn.attr("href", "#");
      primBtn.attr("onclick", "$('#popupDialog').modal('hide');");
      this.popupDialog.modal();
      FB.XFBML.parse();
   },
   referralRequestPopup : function()
   {
      var primBtn = this.popupDialog.find(".modal-footer .primary");
      var popupDialogTitle = this.popupDialog.find(".modal-header h3").html("Friend Referral Required before Purchase");
      var popupDialogContent = this.popupDialog.find(".modal-body").html("<p>Before being eligible to purchase this deal, a friend referral is required.</p>");
      primBtn.attr("href", "#mainMsg");
      primBtn.attr("onclick", "$('#popupDialog').modal('hide');");
      this.popupDialog.modal();
   },
   resendVouchersPopup : function()
   {
      this.ajax(false, this.resend_vouchers_path, 'GET', null, 'json');
   },
   resendRewardPopup : function()
   {
      this.ajax(false, this.resend_reward_path, 'GET', null, 'json');
   },
   ajax : function(absPath, url, type, data, dataType, successCallBack)
   {
      var popupDialog = this.popupDialog;
      var primBtn = popupDialog.find(".modal-footer .primary");
      var path = (absPath) ? location.protocol + '//' + location.host + location.pathname : '';

      $.ajax(
      {
         url : path + url,
         type : type,
         data : data ? data : undefined,
         dataType : dataType,
         //processData: false,
         //contentType: "application/json",
         success : function(response)
         {
            if(successCallBack && response.success)
            {
               successCallBack(response);
            }
            var msg = response.msg;
            if(msg)
            {
               var popupDialogTitle = popupDialog.find(".modal-header h3").html(msg[0]);
               var popupDialogContent = popupDialog.find(".modal-body").html('<p>' + msg[1] + '</p>');
               primBtn.attr("href", "#");
               primBtn.attr("onclick", "$('#popupDialog').modal('hide');");
               popupDialog.modal();
            }
         }
      });
   }
};

// **************************************************************************
// Login Scripts
// **************************************************************************
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
      // Logged into facebook, but no web session avail
      if(!$("#fb_account")[0])
      {
         _login();
         _fb_connect();
         facebook_onLogin(false);
      }
      else
      {
         $("#fb_login_img").html('<img src="http://graph.facebook.com/' + response.uid + '/picture?type=square"/>');
         $("#fb_login_img").css("display", "");
         facebook_loginCallback();
      }
   }
   FB.Event.subscribe('auth.sessionChange', function(response)
   {
      if(response.status != 'connected')
      {
         // Session Removed
         _logout();

      }
      else
      {
         // New session detected
         _login();
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
         if(response.authResponse)
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
               $("#fb_login_img").html('<img id="fb_login_img" src="http://graph.facebook.com/' + response.authResponse.userId + '/picture?type=square"/>');
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
   Genesis._init();
};
// **************************************************************************
// On Page Ready
// **************************************************************************
$(document).ready($(function()
{
   systemTime = ($('#systemTime').text() != '') ? $('#systemTime').text() : clientTime.getTime();
   localOffset = -clientTime.getTimezoneOffset() * (60 * 1000);
   clientTime = clientTime.getTime();

   Genesis._init();
   Genesis.warningMsg = $(".alert-message.warning");
   Genesis.errMsg = $(".alert-message.error");

   // scroll spy logic
   // ================
   var activeTarget = location.hash, position =
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
         if((targets[i].match(/^#/) || (targets[i].match(location.pathname))) && (activeTarget != targets[i]) && (scrollTop >= offsets[i]) && (!offsets[i + 1] || (scrollTop <= offsets[i + 1])))
         {
            if((targets[i] != '#'))
            {
               activeTarget = targets[i];
               setButton(activeTarget);
            }
         }
      }
   }


   nav.click(function()
   {
      processScroll();
   });
   processScroll();

   $window.scroll(processScroll);
   $('#topbar').dropdown();
   $("#faq dd").css('display', 'none');
   $("#faq dt").bind('click', function()
   {
      var dt = $(this);
      if(dt.next().css('display') == 'none')
      {
         $("#faq dd").hide('slow', function()
         {
            if($(this).prev()[0] == dt[0])
            {
               dt.next().toggle('fast', 'linear', function()
               {
                  dt.next().show("highlight",
                  {
                  }, 4000);
               });
            }
         });
      }
   });
   // PopupDialog Initializer
   $("#popupDialog").modal(
   {
      keyboard : true,
      backdrop : 'static'
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
   Genesis.ajax(false, Genesis.sign_out_path, 'GET', null, 'json', function()
   {
      window.location.reload(true);
   });
}

function facebook_loginCallback()
{
   FB.api('/me', function(response)
   {
      if(response.id == null)
      {
         //if($("#fb_account")[0])
         {
            // Show Login Button to log into Facebook
            facebook_onLogout();
         }
         return;
      }
      if(!$("#fb_account")[0])
      {
         var name = response.name;
         var email = response.email;
         var facebook_id = response.id;
         var facebook_uid = response.username;
         var gender = response.gender == "male" ? "m" : "f";
         var birthday = response.birthday.split('/');
         birthday = birthday[2] + "-" + birthday[0] + "-" + birthday[1];
         var params = "name=" + name + "&email=" + email + "&facebook_id=" + facebook_id + "&facebook_uid=" + facebook_uid + "&gender=" + gender + "&birthday=" + birthday;
         Genesis.ajax(false, Genesis.sign_in_path, 'POST', params, 'json', function(response)
         {
            window.location.reload(true);
         });
      }
   });
}

function facebook_onLogin()
{
   $("#fb_login").css("display", "none");
   try
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
   catch(e)
   {
      facebook_loginCallback();
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
