Genesis =
{
   currFbId : "0",
   perms : 'email,user_birthday,publish_stream,read_friendlists',
   fbAppId : '197968780267830',
   fb_login_tag : function()
   {
      return '<fb:login-button scope="' + this.perms + '" on-login="facebook_onLogin(false);" size="large" background="dark" length="long"></fb:login-button>';
   },
   getFriendsURL : function()
   {
      return 'https://graph.facebook.com/me/friends?fields=name,username,id&access_token=' + Genesis.access_token;
   },
   getFriendListsURL : function()
   {
      return 'https://graph.facebook.com/me/friendlists?access_token=' + Genesis.access_token;
   },
   getFriendsInListURL : function(listId, callback)
   {
      var loginUser;
      FB.api(
      {
         method : 'fql.query',
         //query : 'SELECT uid, name, username, current_location FROM user WHERE uid=me() OR uid IN (SELECT uid FROM
         // friendlist_member WHERE flid=' + listId + ')'
         query : 'SELECT uid, name, username, current_location FROM user WHERE uid=me() OR uid IN (SELECT uid2 FROM friend WHERE uid1 = me())'
      }, function(response)
      {
         loginUser = response[0];

         for(var i = 1; i < response.length; i++)
         {
            if(response[i].username)
            {
               console.log(response[i].username);
            }
         }
         if(callback)
         {
            callback(response);
         }
      });
   },
   checkFbPerms : function(fbUseId)
   {
      FB.api(
      {
         method : 'fql.query',
         query : 'SELECT ' + Genesis.perms + ' FROM permissions WHERE uid=me()'
      }, function(response)
      {
         var perms = Genesis.perms.split(',');
         for(var i = 0; i < perms.length; i++)
         {
            if(!response[0][perms[i]] || !parseInt(response[0][perms[i]]))
            {
               break;
            }
         }
         if(i < perms.length)
         {
            location.href = 'http://www.facebook.com/dialog/oauth/?scope=' + Genesis.perms + '&client_id=' + Genesis.fbAppId + '&redirect_uri=' + location.href + '&response_type=token';
            /*
             FB.ui(
             {
             client_id : Genesis.fbAppId,
             method : 'oauth',
             scope : Genesis.perms,
             redirect_uri : location,
             response_type : 'token'
             });
             */
         }
         else
         {
            _login();
            _fb_connect();
            facebook_onLogin($("#fb_account")[0] != null);
         }
      });
   },
   sign_in_path : '/sign_in',
   sign_out_path : '/sign_out',
   resend_vouchers_path : '/resend_vouchers',
   resend_reward_path : '/resend_reward',
   create_referrals : '/referrals/create',
   get_referrals : '/referrals',
   get_confirm_referrals : function(refId)
   {
      return '/referrals/' + refId + '/confirm';
   },
   access_token : null,
   initDone : false,
   errMsg : null,
   warningMsg : null,
   popupDialog : null,
   weekday : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
   _init : function()
   {
      if(this.initDone == true)
      {
         Genesis.currFbId = $("#currFbId").text() || "0";
         oAuth2SessionLogin();
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
   _showMsg : function(obj, msg, closeBtn, cb)
   {
      closeBtn.prop("onclick", function()
      {
         closeBtn.parent().switchClass('in', 'hide');
         if(cb)
            cb();
      });
      Genesis[obj].find("*:nth-child(2)").html(msg);
      Genesis[obj].switchClass('hide', 'in');
      location.href = "#top";
   },
   showErrMsg : function(msg, cb)
   {
      this._showMsg('errMsg', msg, $(".alert-message.error .close"), cb);
   },
   showWarningMsg : function(msg)
   {
      this._showMsg('warningMsg', msg, $(".alert-message.warning .close"), cb);
   },
   // **************************************************************************
   // Dynamic Popup
   // **************************************************************************
   _popupCommon : function(title, body, href, yesMsg, yesFnStr, noMsg, noFnStr)
   {
      if(!this.popupDialog.data().modal.isShown)
      {
         var primBtn = this.popupDialog.find(".modal-footer .primary");
         var secBtn = this.popupDialog.find(".modal-footer .secondary");
         var popupDialogTitle = this.popupDialog.find(".modal-header h3").html(title);
         var popupDialogContent = this.popupDialog.find(".modal-body").html(body);
         primBtn.attr("href", href);
         if(yesMsg)
         {
            primBtn.attr("onclick", yesFnStr);
            primBtn.text(yesMsg);
         }
         else
         {
            primBtn.text('OK');
            primBtn.attr("onclick", yesFnStr || "$('#popupDialog').modal('hide');");
         }
         if(noMsg)
         {
            secBtn.text(noMsg);
            secBtn.css('display', '');
            secBtn.attr("onclick", noFnStr || "$('#popupDialog').modal('hide');");
         }
         else
         {
            secBtn.text('Cancel');
            secBtn.css('display', 'none');
         }
         this.popupDialog.modal();
      }
      // Put this in the animation queue
      else
      {
         this.popupDialog.queue(function()
         {
            Genesis._popupCommon(title, body, href, yesMSg, yesFnStr, noMsg, noFnStr);
         });
      }
   },
   loginPopup : function()
   {
      try
      {
         FB.Auth.setSession(null);
      }
      catch(e)
      {
      }
      this._popupCommon("Facebook Login Required", Genesis.fb_login_tag(), "#");
      FB.XFBML.parse();
   },
   ajax : function(absPath, url, type, data, dataType, successCallBack, button, reenableButton)
   {
      var path = (absPath) ? location.protocol + '//' + location.host + location.pathname : '';
      if(button)
      {
         button.addClass('disabled');
      }
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
            if(button && (reenableButton || !response.success))
            {
               button.removeClass('disabled');
            }
            var msg = response.msg;
            if(msg)
            {
               Genesis._popupCommon(msg[0], '<p>' + msg[1] + '</p>', "#");
            }
         }
      });
   }
};

// **************************************************************************
// Login Scripts
// **************************************************************************
var oAuth2SessionLogin = function()
{
   if($("#fb_account")[0])
   {
      $('#topbar .secondary-nav > li:not([id="fb_login"])').css('display', 'none');
   }

   FB.Event.subscribe('auth.authResponseChange', function(response)
   {
      if((response.status != 'connected') || (!response.authResponse))
      {
         _logout();
         _fb_disconnect();
         facebook_onLogout();
      }
      else
      {
         Genesis.access_token = response.authResponse.accessToken;
         // Check proper facebook permissions
         // If not ready, we need the user to trigger login again, to popup permission Dialog box, otherwise, security violation
         Genesis.checkFbPerms(response.authResponse.userID);
      }
   });
   /*
    setTimeout(function()
    {
    FB.getLoginStatus(function(response)
    {
    if((response.status != 'connected') || (!response.authResponse))
    {
    _logout();
    _fb_disconnect();
    }
    else
    {
    Genesis.access_token = response.authResponse.accessToken;
    // Check proper facebook permissions
    // If not ready, we need the user to trigger login again, to popup permission Dialog box, otherwise, security violation
    Genesis.checkFbPerms(response.authResponse.userID);
    }
    }, true);
    }, 0);
    */
   $("#fb_login").css("display", "");
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
      xfbml : true,
      oauth : true
   });
   Genesis._init();
};
// **************************************************************************
// On Page Ready
// **************************************************************************
$(document).ready($(function()
{
   // --------------------------------------------------------------------------------
   // Init System Time Clock
   // --------------------------------------------------------------------------------
   systemTime = ($('#systemTime').text() != '') ? $('#systemTime').text() : clientTime.getTime();
   localOffset = -clientTime.getTimezoneOffset() * (60 * 1000);
   clientTime = clientTime.getTime();

   Genesis._init();
   Genesis.warningMsg = $(".alert-message.warning");
   Genesis.errMsg = $(".alert-message.error");

   // --------------------------------------------------------------------------------
   // #Hash Init
   // --------------------------------------------------------------------------------
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
   // --------------------------------------------------------------------------------
   // Init TopBar
   // --------------------------------------------------------------------------------
   $('#topbar').dropdown();
   // --------------------------------------------------------------------------------
   // Init FAQ
   // --------------------------------------------------------------------------------
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
   // --------------------------------------------------------------------------------
   // Init PopupDialog
   // --------------------------------------------------------------------------------
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
   try
   {
      FB.logout(function(response)
      {
         Genesis.ajax(false, Genesis.sign_out_path, 'GET', null, 'json', function()
         {
            window.location.reload(true);
         });
      });
   }
   catch(e)
   {
      Genesis.ajax(false, Genesis.sign_out_path, 'GET', null, 'json', function()
      {
         window.location.reload(true);
      });
   }
}

function facebook_loginCallback(noLogin)
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
      var facebook_id = response.id;
      var showLogin = function()
      {
         $("#fb_login").css("display", "none");
         $('#topbar .secondary-nav > li:not([id="fb_login"])').css('display', '');
         $("#fb_login_img").html('<img src="http://graph.facebook.com/' + facebook_id + '/picture?type=square"/>');
         $("#fb_login_img").css("display", "");
      }
      if(!$("#fb_account")[0] || noLogin)
      {
         var name = response.name;
         var email = response.email;
         var facebook_uid = response.username;
         var gender = response.gender == "male" ? "m" : "f";
         var birthday = response.birthday.split('/');
         birthday = birthday[2] + "-" + birthday[0] + "-" + birthday[1];
         var params = "name=" + name + "&email=" + email + "&facebook_id=" + facebook_id + "&facebook_uid=" + facebook_uid + "&gender=" + gender + "&birthday=" + birthday;
         Genesis.ajax(false, Genesis.sign_in_path, 'POST', params, 'json', function(response)
         {
            if(!noLogin)
            {
               window.location.reload(true);
            }
            Genesis.currFbId = facebook_id;
            if($("#fb_account")[0])
            {
               showLogin();
            }
         });
      }
      else
      {
         showLogin();
      }
   });
}

function facebook_onLogin(noLogin)
{
   $("#fb_login").css("display", "none");
   if(noLogin)
   {
      facebook_loginCallback(noLogin);
   }
   else
   {
      FB.login(function(res)
      {
         if((res.status == 'connected') && response.authResponse)
         {
            Genesis.access_token = response.authResponse.accessToken;
            facebook_loginCallback(noLogin);
         }
      },
      {
         scope : Genesis.perms
         //perms : Genesis.perms
      });
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
