_login = function()
{
   //$('#fb_login').css("display", "none");
   //$('#fb_login_img').css("display", "");
   if($(Site.referralBrowser)[0]) {
      Site.getFriendsList();
   }
};
_logout = function()
{
   //$('#fb_login').css("display", "");
   //$('#fb_login_img').css("display", "none");
};
Site = {
   referralsMinHeight : 0,
   referralsMaxHeight : 0,
   resubmitFriendsEmail : false,

   dealNameSelector : '#mainDeal h2:first-child',

   referralBrowser : '#referralsBrowserDialog',
   referralBrowserHeader : '#referralsBrowserDialog .referralsBrowserHeader',
   referralBrowserScroller : '#referralsBrowserWrapper .scroller',
   referralBrowserBody : '#referralsBrowserDialog .referralsBrowserBody',
   referralBrowserList : '#referralsBrowserDialog .listView .scroller ul',
   referralsCtn : '.hero-unit.hero-referrals',
   referralsHeader : '.referralsHeader',
   referralsScroller : '#referralsWrapper .scroller',
   referralsFooter : '.referralsFooter',
   referralsList : '#referralsList',
   referralsListScroller : '#referralsList .scroller ul',
   referralsScroll : null,

   referralWarning : '#referralWarning',
   referralWarningFbTag : '#referralWarning .fbtag',

   recommendation : '#recommendation',
   recommendationLoadingMask : '#recommendation .loadingMask',
   recommendationMask : '#recommendation .loadMask',

   friendReferralLoadingMask : '#friendReferralLoadingMask',
   mainMsg : '#mainMsg',
   mainMsgFbTag : '#mainMsg .fbtag',
   mainMsgReferral : '#mainMsg .hero-referral',
   mainMsgReferralsBtn : '#mainMsg .pagination li:last-child a',

   secretCodeDialog : '#secretCodeDialog',

   mainDeal : '#mainDeal',

   alertMsgClose : '.alert-message.error .close',
   //friendsMinHeight : 353 + 52 + 28 + 2 * 18,
   //friendsMaxHeight : 353 + 52 + 28 + 2 * 18,
   friendsMinHeight : 70 + 45 + 2 * 20 + 10,
   friendsMaxHeight : 140 + 45 + 2 * 20 + 10,
   friendsList : null,
   checkUidReferralUrl : '/referrers',
   _initFormComponents : function()
   {
      /*
       $.widget("ui.form",
       {
       _init : function()
       {
       var object = this;
       var form = this.element;
       var inputs = form.find("input , select ,textarea");

       form.find("fieldset").addClass("ui-widget-content");
       form.find("legend").addClass("ui-widget-header ui-corner-all");
       form.addClass("ui-widget");

       form.find("fieldset").addClass("ui-widget-content");
       form.find("legend").addClass("ui-widget-header ui-corner-all");
       form.addClass("ui-widget");
       $.each(inputs, function()
       {
       $(this).addClass('ui-state-default ui-corner-all');
       $(this).wrap("<label />");

       if($(this).is(":reset ,:submit"))
       object.buttons(this);
       else
       if($(this).is(":checkbox"))
       object.checkboxes(this);
       else
       if($(this).is("input[type='text']") || $(this).is("textarea") || $(this).is("input[type='password']"))
       object.textelements(this);
       else
       if($(this).is(":radio"))
       object.radio(this);
       else
       if($(this).is("select"))
       object.selector(this);

       if($(this).hasClass("date"))
       $(this).datepicker();
       });
       var div = jQuery("<div />",
       {
       css :
       {
       width : 20,
       height : 20,
       margin : 10,
       textAlign : "center"
       }
       }).addClass("ui-state-default drag");
       var no = Math.ceil(Math.random() * 4);
       var holder = jQuery("<div/>",
       {
       id : 'droppable',
       text : "Drop the box with " + no + " here",
       css :
       {
       width : 100,
       height : 100,
       'float' : 'right',
       fontWeight : 'bold'
       }
       }).addClass('ui-state-default');
       $(form).find("fieldset").append(holder);
       for(var i = 1; i < 5; i++)
       {
       $(form).find("fieldset").append(div.clone().html(i).attr("id", i));
       }

       $(".drag").draggable(
       {
       containment : 'parent'
       });
       $("#droppable").droppable(
       {
       accept : '#' + no,
       drop : function(event, ui)
       {
       $(this).addClass('ui-state-highlight').html("Right One");
       form.find(":submit").removeClass('ui-state-disabled').unbind('click');
       }
       });
       $(".hover").hover(function()
       {
       $(this).addClass("ui-state-hover");
       }, function()
       {
       $(this).removeClass("ui-state-hover");
       });
       },
       textelements : function(element)
       {
       $(element).bind(
       {
       focusin : function()
       {
       $(this).toggleClass('ui-state-focus');
       },
       focusout : function()
       {
       $(this).toggleClass('ui-state-focus');
       }
       });

       },
       buttons : function(element)
       {
       if($(element).is(":submit"))
       {
       $(element).addClass("ui-priority-primary ui-corner-all ui-state-disabled hover");
       $(element).bind("click", function(event)
       {
       event.preventDefault();
       });
       }
       else
       if($(element).is(":reset"))
       $(element).addClass("ui-priority-secondary ui-corner-all hover");
       $(element).bind('mousedown mouseup', function()
       {
       $(this).toggleClass('ui-state-active');
       });
       },
       checkboxes : function(element)
       {
       $(element).parent("label").after("&lt;span />");
       var parent = $(element).parent("label").next();
       $(element).addClass("ui-helper-hidden");
       parent.css(
       {
       width : 16,
       height : 16,
       display : "block"
       });
       parent.wrap("&lt;span class='ui-state-default ui-corner-all'
       style='display:inline-block;width:16px;height:16px;margin-right:5px;'/>");
       parent.parent().addClass('hover');
       parent.parent("span").click(function(event)
       {
       $(this).toggleClass("ui-state-active");
       parent.toggleClass("ui-icon ui-icon-check");
       $(element).click();

       });
       },
       radio : function(element)
       {
       $(element).parent("label").after("<span />");
       var parent = $(element).parent("label").next();
       $(element).addClass("ui-helper-hidden");
       parent.addClass("ui-icon ui-icon-radio-off");
       parent.wrap("&lt;span class='ui-state-default ui-corner-all'
       style='display:inline-block;width:16px;height:16px;margin-right:5px;'/>");
       parent.parent().addClass('hover');
       parent.parent("span").click(function(event)
       {
       $(this).toggleClass("ui-state-active");
       parent.toggleClass("ui-icon-radio-off ui-icon-bullet");
       $(element).click();
       });
       },
       selector : function(element)
       {
       var parent = $(element).parent();
       parent.css(
       {
       "display" : "block",
       width : 140,
       height : 21
       }).addClass("ui-state-default ui-corner-all");
       $(element).addClass("ui-helper-hidden");
       parent.append("&lt;span id='labeltext' style='float:left;'>&lt;/span>&lt;span style='float:right;display:inline-block'
       class='ui-icon ui-icon-triangle-1-s' >&lt;/span>");
       parent.after("&lt;ul class=' ui-helper-reset ui-widget-content ui-helper-hidden'
       style='position:absolute;z-index:50;width:140px;' >&lt;/ul>");
       $.each($(element).find("option"), function()
       {
       $(parent).next("ul").append("&lt;li class='hover'>" + $(this).html() + "&lt;/li>");
       });
       $(parent).next("ul").find("li").click(function()
       {
       $("#labeltext").html($(this).html());
       $(element).val($(this).html());
       });
       $(parent).click(function(event)
       {
       $(this).next().slideToggle('fast');
       event.preventDefault();
       });
       }
       });
       $("form").form();
       */
   },
   initForm : function()
   {
      var textareas = $(this.mainMsgReferral).find("textarea");
      var defaultAnswer = ["My office co-worker John recommended me to Runner's Shop. He's an avid runner who regularly competes in marathon races.", "The first time I visited the place, I signed up for one of their running clinics during the winter months. They fitted me with proper running shoes and I haven't had an injury yet!", "I like the fact that the club foster's a friendly environment and their training programs are top notch!"];
      var $verifySecretCode = $("#verifySecretCode");
      var $reward = $("#reward");
      var $discussBtn = $("#discussBtn");
      var $comments = $("#comments");
      var $recommendMsg = $(this.recommendation).find(".hero-start p");
      var i = 0;

      $.each(textareas, function()
      {
         $(this).text(defaultAnswer[i++]);
      });
      $verifySecretCode.click(function(event)
      {
         var secretCode = $("#secretCodeInput")[0].value;
         Genesis.ajax(true, Genesis.verify_secret_code_path, 'GET', "secret_code=" + secretCode, 'json', function(response)
         {
            if(response.data.correct) {
               location.href = location.origin + location.pathname + "?secret_code=" + secretCode;
            }
            else {
               Genesis.showErrMsg(response.data.msg);
            }
         }, $verifySecretCode, true);
      });
      $reward.click($.proxy(function(event)
      {
         var rewardMsg = "";
         textareas.each(function()
         {
            rewardMsg += $(this).text() + ' ';
         });
         if(!this.resubmitFriendsEmail) {
            Genesis.ajax(true, Genesis.create_referrals, 'POST', "comment=" + rewardMsg, 'json', function(res)
            {
               var baseURL = location.protocol + '//' + location.host;
               var referralURL = baseURL + location.pathname + "?referral_id=" + res.data.referral_id;
               // Send to Facebook Newsfeed
               FB.api('/me/feed', 'post', {
                  name : $('meta[property~="og:title"]').prop('content'),
                  link : referralURL,
                  caption : baseURL,
                  picture : $('meta[property~="og:image"]').prop('content'),
                  message : rewardMsg,
                  description : $('meta[property~="og:description"]').prop('content')
               }, function(response)
               {
                  if(!response || response.error) {
                     Genesis.showErrMsg("Error Updating Facebook Newsfeed. Try again.");
                     $reward.attr('disabled', false);
                     $reward.removeClass('disabled');
                  }
                  else {
                     console.log('Referral ID: ' + response.id);
                     // Update Server about successful Newsfeed update
                     Genesis.ajax(false, Genesis.get_confirm_referrals(res.data.referral_id), 'POST', "", 'json', $.proxy(function(response)
                     {
                        // Ask to send message directly to friends
                        this._url = referralURL;
                        this._msg = $('meta[property~="og:description"]').prop('content');
                        this._rewardBtn = $reward;
                        Genesis._popupCommon(response.msg[0], "<p>" + response.msg[1] + "</p>" + "<p>" + response.msg[2] + "</p>", "#", "Yes", this.referralCompletePopup, "No", function()
                        {
                           location.href = Site._url;
                        }, null, this);
                     }, Site), $reward, false);
                  }
               });
            }, $reward, false);
         }
         else {
            this.referralCompletePopup();
         }
      }, Site));
      $discussBtn.click(function(event)
      {
         $comments.show("highlight", {
         }, 3000);
      });
      this._initFormComponents();
   },
   initMainMsg : function()
   {
      var $mainMsg = $(this.mainMsg);
      $mainMsg.slides({
         //preload : true,
         // This option causes weird hanging in IE.
         // Images woudl only load after refreshing, all versions of IE
         //preloadImage : 'http://d2fetk9hhxwrks.cloudfront.net/buttons/loader.gif',
         //preloadImage : '',

         effect : 'slide',
         crossfade : true,
         slideSpeed : 350,
         fadeSpeed : 500,
         autoHeight : true,
         autoHeightSpeed : 100,
         generateNextPrev : true,
         generatePagination : true,
         start : $(this.recommendation).length > 0 ? 2 : 1
      });
      $(this.mainMsgFbTag).click(function()
      {
         $(".next").trigger("click");
      });
   },
   initSlides : function()
   {
      var $slides = $("#slides");
      $slides.slides({
         preload : true,
         preloadImage : '',
         play : 5000,
         pause : 2500,
         effect : 'slide',
         crossfade : true,
         slideSpeed : 350,
         fadeSpeed : 500,
         autoHeight : true,
         autoHeightSpeed : 100,
         hoverPause : true,
         generateNextPrev : true,
         generatePagination : false
      });
   },
   initReferrals : function(name, facebook_id, comment, timestamp)
   {
      return '<li class="referralsBlock">' + ('<div class="clearfix">' + '<img class="left commentImage" src="http://graph.facebook.com/' + facebook_id + '/picture?type=square&"/>' + '<div class="commentBlock">' + '<div style="padding:5px;margin-bottom:10px;line-height:20px;background:#E1E4F2;border-bottom:1px solid #CCCCCC;">' + '<a class="commentName">' + convertString(name, null, 48) + '</a>' + '<div class="right">' + Genesis.convertDate(Date.parse(timestamp)) + '</div>' + '</div>' + '<div class="postContent">' + comment + '</div>' + '</div>') + '</li>';
   },
   getReferrals : function(referral_id)
   {
      var start = 0, end = 10000;
      var referralsList = $(this.referralsList);
      var referrals = $(this.referralsListScroller);

      $(this.recommendationLoadingMask).removeClass("hide");
      $(this.recommendationMask).removeClass("hide");

      // Check limiters
      this.referralsMinHeight = removeUnit($(this.mainMsg).css('height'));
      this.referralsMaxHeight = this.referralsMinHeight + removeUnit($(this.mainDeal).css('height'));

      Genesis.ajax(true, Genesis.get_referrals, 'GET', "referral_id=" + referral_id + "&start=" + start + '&max=' + end, 'json', $.proxy(function(response)
      {
         var data = $.parseJSON(response.data);
         var enableScroll = false;
         var mainMsgReferralsBtn = $(this.mainMsgReferralsBtn);

         for(var i = 0; i < data.length; i++) {
            referrals.append(Site.initReferrals(data[i].creator.name, data[i].creator.facebook_id, data[i].comment, data[i].created_ts));
         }

         // Make sure the HTML is updated by the browser
         setTimeout($.proxy(function()
         {
            var headerHeight = $(this.referralsHeader).prop('offsetHeight');
            var bodyHeight = $(this.referralsScroller).prop('offsetHeight');
            var footerHeight = $(this.referralsFooter).prop('offsetHeight');
            var netHeight = headerHeight + footerHeight;
            // Limit Height to viewport or minHeight or maxHeight
            var clientHeight = document.documentElement.clientHeight;
            var minHeight = this.referralsMinHeight - netHeight;
            var maxHeight = (function()
            {
               if(clientHeight > this.referralsMaxHeight) {
                  return this.referralsMaxHeight - netHeight;
               }
               else
               if(clientHeight >= this.referralsMinHeight) {
                  return clientHeight - netHeight;
               }
               else {
                  return this.referralsMinHeight - netHeight;
               }
            }).call(this);
            var height = Math.max(bodyHeight, minHeight);
            if(height > minHeight) {
               height = Math.min(bodyHeight, maxHeight);
               if(height == maxHeight) {
                  //$(this.mainDeal).addClass("invisible");
                  enableScroll = true;
               }
            }
            $(this.referralsCtn).css("height", addUnit(height + netHeight - 20))
            $(this.mainMsg).addClass("invisible");
            referralsList.removeClass("height0", 1000, $.proxy(function()
            {
               // Trigger to go to next slide or only one exists, hide mainMsg
               mainMsgReferralsBtn.trigger("click");
               if(enableScroll) {
                  this.referralsScroll = new iScroll('referralsWrapper', {
                     hScrollbar : false,
                     vScrollbar : true
                     //,scrollbarClass : 'myScrollbar'
                  });
               }
            }, this));

            $(this.recommendationLoadingMask).addClass("hide");
            $(this.recommendationMask).addClass("hide");
         }, this), 0);
      }, this), null, null, $.proxy(function()
      {
         $(this.recommendationLoadingMask).addClass("hide");
         $(this.recommendationMask).addClass("hide");
      }, this));
   },
   backtoMain : function()
   {
      var referralsList = $(this.referralsList);
      var referrals = $(this.referralsListScroller);
      if(this.referralsScroll) {
         this.referralsScroll.destroy();
         $(this.referralsScroller).prop('style').cssText = '';
         $(this.mainDeal).removeClass("invisible");
         delete Site.referralsScroll;
      }
      $(this.mainMsg).removeClass("invisible");
      referralsList.addClass("height0", 1000, $.proxy(function()
      {
         referrals.html('');
      }, this));
   },
   referralRequestPopup : function()
   {
      Genesis._popupCommon("Friend Referral Required before Purchase", "<p>Before being eligible to purchase this deal, a friend referral is required.</p>", this.mainMsg);
   },
   referralCompletePopup : function()
   {
      //Clear up any Error Tooltips
      $(Genesis.alertErrorClose).parent().switchClass('in', 'hide');
      //Hide PopupDialog
      Genesis.popupDialog.modal('hide');

      FB.ui({
         method : 'send',
         name : $('meta[property~="og:title"]').prop('content'),
         link : this._url,
         picture : $('meta[property~="og:image"]').prop('content'),
         description : this._msg
      }, $.proxy(function(response)
      {
         if(!response || response.error) {
            this.resubmitFriendsEmail = true;
            Genesis.showErrMsg("Error sending your recommendation message to your friends' mail accounts.<br/>Resubmit to Try Again!", function()
            {
               //location.href = this._url;
            });
            this._rewardBtn.attr('disabled', false);
            this._rewardBtn.removeClass('disabled');
         }
         else {
            Genesis._popupCommon("Thanks!", "<p>Your recommendation has been sent to your friends' mail accounts.</p>", this._url);
            delete this._url;
            delete this._msg;
            delete this._rewardBtn;
         }
      }, this));
   },
   // **************************************************************************
   // Retrieve Friends List for user to select
   // **************************************************************************
   getFriendsURL : function()
   {
      return 'https://graph.facebook.com/me/friends?fields=name,username,id&access_token=' + Genesis.access_token;
   },
   getFriendListsURL : function()
   {
      return 'https://graph.facebook.com/me/friendlists?access_token=' + Genesis.access_token;
   },
   buildFriendsList : function(result, callback)
   {
      var cols = 3;
      var html = "";
      var dealPath = location.protocol + '//' + location.host + location.pathname + "?referral_id=";
      for(var x = 0; x < Math.ceil(result.length / cols); x++) {
         html += '<li>';
         for(var y = x * cols; (y < (x + 1) * cols) && (y < result.length); y++) {
            html += '<div class="listItem"><a class="listItemCtn" href="' + dealPath + result[y].refId + '"><img class="left" src="http://graph.facebook.com/' + this.friendsList[y].value + '/picture?type=square&"/>' + '<div class="listContent">' + this.friendsList[y].label + '</div></a>' + '</div>';
         }
         html += '</li>';
      }
      $(this.referralBrowserList).html(html);
      setTimeout($.proxy(function()
      {
         var headerHeight = $(this.referralBrowserHeader).prop('offsetHeight');
         var bodyHeight = $(this.referralBrowserScroller).prop("offsetHeight");
         var footerHeight = 10;
         var netHeight = headerHeight + footerHeight + 10;
         var height = Math.max(bodyHeight, this.friendsMinHeight - netHeight);
         var cleanScroller = true;
         if(height > (this.friendsMaxHeight - netHeight)) {
            height = Math.min(bodyHeight, this.friendsMaxHeight - netHeight);
            if(height == (this.friendsMaxHeight - netHeight)) {
               if(this.friendsScroll) {
                  this.friendsScroll.refresh();
               }
               // Scrolling required for iOS < 5 and other browsers
               else
               if((client.OS != 'iPhone') || (client.version < 5.0)) {

                  this.friendsScroll = new iScroll('referralsBrowserWrapper', {
                     hScrollbar : false,
                     vScrollbar : true
                  });
               }
               cleanScroller = false;
            }
            $(this.referralBrowserBody).css("height", height + netHeight);
         }
         else {
            $(this.referralBrowserBody).css("height", Math.max(this.friendsMinHeight, bodyHeight + netHeight));
         }
         if(this.friendsScroll && cleanScroller) {
            this.friendsScroll.destroy();
            delete this.friendsScroll;
         }
         if(callback) {
            callback(response);
         }
      }, Site), 0);
   },
   checkFriendReferral : function(friendsList, callback)
   {
      Genesis.ajax(true, this.checkUidReferralUrl, 'POST', 'friend_facebook_ids=' + friendsList, 'json', $.proxy(function(res)
      {
         var data = $.parseJSON(res.data);
         $(this.friendReferralLoadingMask).switchClass("in", "hide", 0, $.proxy(function()
         {
            // Empty Result tell user to use the secret key
            if(res.total == 0) {
               $(this.secretCodeDialog).switchClass("hide", "in", 100);
            }
            else {
               var friendsList = [];
               for(var i = 0; i < res.total; i++) {
                  var index = this.friendsList.binarySearch(data[i].creator_facebook_id, function(a, b)
                  {
                     return (a.value - b);
                  });
                  if(index >= 0) {
                     friendsList[i] = this.friendsList[index];
                     friendsList[i].refId = data[i].referral_id;
                  }
               }
               this.friendsList = friendsList;
               $(this.referralBrowser).switchClass("hide", "in", 100, $.proxy(function()
               {
                  this.buildFriendsList(friendsList);
               }, this));
            }
         }, this));
      }, this));
   },
   getFriendsList : function(callback)
   {
      var uidField = "id";
      var nameField = "name";
      /*
       var friends = FB.Data.query("select uid, name, username, current_location from user where uid in " + "(select uid2 from friend where uid1 = me())");
       FB.Data.waitOn([friends], $.proxy(function()
       {
       // build a map of eid, uid to name
       var friendsList = '';
       this.friendsList = [];
       if(friends.value.length > 0) {
       FB.Array.forEach(friends.value, $.proxy(function(row)
       {
       if(row[uidField] != Genesis.currFbId) {
       this.friendsList.push({
       label : row[nameField],
       value : row[uidField]
       });
       friendsList += ((friendsList.length > 0) ? ',' : '') + row[uidField];
       }
       }, this));
       this.friendsList.sort(function(a, b)
       {
       return a[uidField] - b[uidField];
       });
       this.checkFriendReferral(friendslist, callback);
       }
       else {
       $(this.secretCodeDialog).switchClass("hide", "in", 100);
       }
       }, this));
       */
      FB.api('/me/friends', $.proxy(function(response)
      {
         var friendsList = '';
         this.friendsList = [];
         if(response && response.data && (response.data.length > 0)) {
            var data = response.data;
            for(var i = 0; i < data.length; i++) {
               if(data[i][uidField] != Genesis.currFbId) {
                  this.friendsList.push({
                     label : data[i][nameField],
                     value : data[i][uidField]
                  });
                  friendsList += ((friendsList.length > 0) ? ',' : '') + data[i][uidField];
               }
            }
            this.friendsList.sort(function(a, b)
            {
               return a[uidField] - b[uidField];
            });
            this.checkFriendReferral(friendsList, callback);
         }
         else {
            $(this.friendReferralLoadingMask).switchClass("in", "hide", 100, $.proxy(function()
            {
               if(response.length == 1) {
                  $(this.secretCodeDialog).switchClass("hide", "in", 100);
               }
               else {
                  Genesis.showErrMsg("Error Retrieving Friends List from Facebook. Reload Page to Try Again.");
               }
            }, this));
         }
      },this));
      /*
       FB.api({
       method : 'fql.query',
       //query : 'SELECT uid, name, username, current_location FROM user WHERE uid=me() OR uid IN (SELECT uid FROM
       // friendlist_member WHERE flid=' + listId + ')'
       query : 'SELECT uid, name, username, current_location FROM user WHERE uid=me() OR uid IN (SELECT uid2 FROM friend WHERE uid1 =
       me())'
       }, $.proxy(function(response)
       {
       if(response.length > 1) {
       this.checkFriendReferral(response, 'uid', 'name', callback);
       }
       else {
       $(this.friendReferralLoadingMask).switchClass("in", "hide", 100, $.proxy(function()
       {
       if(response.length == 1) {
       $(this.secretCodeDialog).switchClass("hide", "in", 100);
       }
       else {
       Genesis.showErrMsg("Error Retrieving Friends List from Facebook. Reload Page to Try Again.");
       }
       }, this));
       }
       }, Site));
       */
   }
}
$(document).ready($(function()
{
   var site = Site;

   if($(site.referralBrowser)[0]) {
      $(site.friendReferralLoadingMask).switchClass("hide", "in");
   }
   site.initForm();
   site.initMainMsg();
   site.initSlides();

   // --------------------------------------------------------------------------------
   // Google Map
   // --------------------------------------------------------------------------------
   var $gmap = $("#gmap");
   var merchant_name = $("#merchant_name").text().trim();
   var address = $("#merchant_address1").text().trim() + ' ' + $("#merchant_address2").text().trim() + ' ' + $("#merchant_city_state_zipcode").text().trim();
   var htmlAddress = $("#merchant_address1").text().trim() + ' ' + $("#merchant_address2").text().trim() + '<br/>' + $("#merchant_city_state_zipcode").html().trim() + $("#merchant_phone").html().trim() + '<br/><br/>';
   $gmap.gMap({
      markers : [{
         address : address,
         html : merchant_name
      }],
      zoom : 15,
      address : address
   });
   htmlAddress += '<a target="_blank" href="' + "http://maps.google.com/maps?f=d&daddr=" + address + '">Get Directions</a>';
   $("#merchant_address").html(htmlAddress);

   // --------------------------------------------------------------------------------
   // Scrolling Referrals
   // --------------------------------------------------------------------------------
   $(window).bind(Genesis.mouseWheelEvt, $.proxy(function(event, b)
   {
      // Are we only the scrolling region?
      if((event.target != document.body) && $(this.referralsList)[0] && jQuery.contains($(this.referralsList)[0], event.target)) {
         event.preventDefault();
      }
   }, site));
   // --------------------------------------------------------------------------------
   // SlideShow
   // --------------------------------------------------------------------------------
   /*
   var $highlightsCtn = $("#highlightsCtn");
   var $highlights = $("#highlights");
   var $highlightsBtn = $("#highlightsBtn");
   var $detailsBtn = $("#detailsBtn");
   var $highlights1Tab = $("#highlights li:nth-child(1) a");
   var $highlights2Tab = $("#highlights li:nth-child(2) a");
   var $highlights1 = $("#highlights-1");
   var $highlights2 = $("#highlights-2");
   var $highlightTabs = $highlights.tabs();

   $highlightsBtn.click(function()
   {
   // switch to 1st tab
   $("#offerDetails").css('height', $("#highlights-1").css('height'));
   $highlightsCtn.switchClass("span22", "span11", 1000, function()
   {
   Genesis.switchTab($highlights1Tab, $highlights1);
   });
   });
   $detailsBtn.click(function()
   {
   // switch to 2nd tab
   $("#offerDetails").css('height', $("#highlights-2").css('height'));
   Genesis.switchTab($highlights2Tab, $highlights2);
   $highlightsCtn.switchClass("span11", "span22", 1000, function()
   {
   });
   });
   */
   // --------------------------------------------------------------------------------
   // Reward Button
   // --------------------------------------------------------------------------------
   var referralFbTag = false;
   $(site.referralWarning).bind('hidden', $.proxy(function()
   {
      var referralTabVisible = $(this.mainMsgReferral).parent().css('display') != 'none';
      if(!referralTabVisible) {
         if(referralFbTag) {
            $(window).scrollTop($(this.mainMsg).position().top);
            setTimeout(function()
            {
               $(".next").trigger("click");
               referralFbTag = false;
            }, 500);
         }
      }
      else {
         $(window).scrollTop($(this.mainMsg).position().top);
      }
   }, site));
   $(site.referralWarningFbTag).bind('click', $.proxy(function()
   {
      referralFbTag = true;
      $(this.referralWarning).modal('hide');
   }, site));
   // --------------------------------------------------------------------------------
   // Facebook Message
   // --------------------------------------------------------------------------------
   FB.Event.subscribe('message.send', function(href, response)
   {
      if(response.success) {
         //location.href = Site.newReferralURL;
      }
      // Try again to send to users
      else {

      }
   });
   // --------------------------------------------------------------------------------
   // Facebook Friends' referrals
   // --------------------------------------------------------------------------------
   /*
    $("#friendSearchInput").autocomplete(
    {
    appendTo : 'nowhere',
    source : [],
    minLength : 0,
    search : $.proxy(function(event, ui)
    {
    console.log("search triggered");
    var result = (this.isEmpty(event.target.value)) ? this.friendsList : $.ui.autocomplete.filter(this.friendsList,
    event.target.value);

    this.buildFriendsList(result);
    }, Genesis)
    });
    */
}));
