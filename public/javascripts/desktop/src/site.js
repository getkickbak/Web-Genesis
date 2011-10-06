_login = function()
{
   //$('#fb_login').css("display", "none");
   //$('#fb_login_img').css("display", "");
   if($("#profileBrowserDialog")[0])
   {
      Site.getFriendsList();
   }
};
_logout = function()
{
   //$('#fb_login').css("display", "");
   //$('#fb_login_img').css("display", "none");
};
Site =
{
   referralsMinHeight : 398, // 534
   referralsMaxHeight : 855, //1005
   resubmitFriendsEmail : false,
   dealNameSelector : '#mainDeal h2:first-child',
   //friendsMinHeight : 353 + 52 + 28 + 2 * 18,
   //friendsMaxHeight : 353 + 52 + 28 + 2 * 18,
   friendsMinHeight : 70 + 10,
   friendsMaxHeight : 140 + 10,
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
      var textareas = $("#mainMsg .hero-referral").find("textarea");
      var defaultAnswer = ["My office co-worker John recommended me to Runner's Shop. He's an avid runner who regularly competes in marathon races.", "The first time I visited the place, I signed up for one of their running clinics during the winter months. They fitted me with proper running shoes and I haven't had an injury yet!", "I like the fact that the club foster's a friendly environment and their training programs are top notch!"];
      var $reward = $("#reward");
      var $discussBtn = $("#discussBtn");
      var $comments = $("#comments");
      var $recommendMsg = $('#recommendation').find(".hero-start p");
      var i = 0;

      $.each(textareas, function()
      {
         $(this).text(defaultAnswer[i++]);
      });
      $reward.click(function(event)
      {
         var rewardMsg = "";
         textareas.each(function()
         {
            rewardMsg += $(this).text();
         });
         if(!Site.resubmitFriendsEmail)
         {
            Genesis.ajax(true, Genesis.create_referrals, 'POST', "comment=" + rewardMsg, 'json', function(res)
            {
               var referralURL = location.protocol + '//' + location.host + location.pathname + "?referral_id=" + res.data.referral_id;
               // Send to Facebook Newsfeed
               FB.api('/me/feed', 'post',
               {
                  name : $(Site.dealNameSelector).text(),
                  link : referralURL,
                  picture : $("meta[property='og:image']").prop("content"),
                  description : '',
                  message : rewardMsg
               }, function(response)
               {
                  if(!response || response.error)
                  {
                     Genesis.showErrMsg("Error Updating Facebook Newsfeed. Try again.");
                     $reward.removeClass('disabled');
                  }
                  else
                  {
                     console.log('Referral ID: ' + response.id);
                     // Update Server about successful Newsfeed update
                     Genesis.ajax(false, Genesis.get_confirm_referrals(res.data.referral_id), 'POST', "", 'json', function(response)
                     {
                        // Ask to send message directly to friends
                        Site.referralDecisionPopup(referralURL, rewardMsg, $reward);
                     });
                  }
               });
            }, $reward, false);
         }
         else
         {
            Site.referralCompletePopup();
         }
      });
      $discussBtn.click(function(event)
      {
         $comments.show("highlight",
         {
         }, 3000);
      });
      this._initFormComponents();
   },
   initMainMsg : function()
   {
      var $mainMsg = $("#mainMsg");
      $mainMsg.slides(
      {
         preload : true,
         // This option causes weird hanging in IE.
         // Images woudl only load after refreshing, all versions of IE
         //preloadImage : 'http://d2fetk9hhxwrks.cloudfront.net/buttons/loader.gif',
         preloadImage : '',

         effect : 'slide',
         crossfade : true,
         slideSpeed : 350,
         fadeSpeed : 500,
         autoHeight : true,
         autoHeightSpeed : 100,
         generateNextPrev : true,
         generatePagination : true,
         start : $("#recommendation").length > 0 ? 2 : 1
      });
      $("#mainMsg .fbtag").click(function()
      {
         $(".next").trigger("click");
      });
   },
   initSlides : function()
   {
      var $slides = $("#slides");
      $slides.slides(
      {
         preload : true,
         // This option causes weird hanging in IE.
         // Images woudl only load after refreshing, all versions of IE
         //preloadImage : 'http://d2fetk9hhxwrks.cloudfront.net/buttons/loader.gif',
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
      return '<li class="referralsBlock">' + ('<div class="clearfix">' + '<img class="left commentImage" src="http://graph.facebook.com/' + facebook_id + '/picture?type=square&"/>' + '<div class="commentBlock">' + '<div style="padding:5px;margin-bottom:10px;line-height:20px;background:#E1E4F2;border-bottom:1px solid #CCCCCC;">' + '<a class="commentName">' + name + '</a>' + '<div class="right">' + Genesis.convertDate(Date.parse(timestamp)) + '</div>' + '</div>' + '<div class="postContent">' + comment + '</div>' + '</div>') + '</li>';
   },
   getReferrals : function()
   {
      var start = 0, end = 10000;
      var referralsList = $("#referralsList");
      var referrals = $('#referralsList .scroller ul');
      Genesis.ajax(true, Genesis.get_referrals, 'GET', "start=" + start + '&max=' + end, 'json', function(response)
      {
         var data = $.parseJSON(response.data);
         var enableScroll = false;
         var referralsHeight = $(".hero-unit.hero-referrals");
         var mainMsgReferralsBtn = $("#mainMsg .pagination li:last-child a");

         for(var i = 0; i < data.length; i++)
         {
            referrals.append(Site.initReferrals(data[i].creator.name, data[i].creator.facebook_id, data[i].comment, data[i].created_ts));
            referrals.append(Site.initReferrals(data[i].creator.name, data[i].creator.facebook_id, data[i].comment, data[i].created_ts));
            referrals.append(Site.initReferrals(data[i].creator.name, data[i].creator.facebook_id, data[i].comment, data[i].created_ts));
            referrals.append(Site.initReferrals(data[i].creator.name, data[i].creator.facebook_id, data[i].comment, data[i].created_ts));
         }

         // Make sure the HTML is updated by the browser
         setTimeout(function()
         {
            var headerHeight = $(".referralsHeader").prop('offsetHeight');
            var bodyHeight = $("#referralsWrapper .scroller").prop("offsetHeight");
            var footerHeight = $(".referralsFooter").prop('offsetHeight');
            var netHeight = headerHeight + footerHeight;
            var height = Math.max(bodyHeight, Site.referralsMinHeight - netHeight);
            if(height > (Site.referralsMinHeight - netHeight))
            {
               height = Math.min(bodyHeight, Site.referralsMaxHeight - netHeight);
               if(height == (Site.referralsMaxHeight - netHeight))
               {
                  $("#mainDeal").addClass("invisible");
                  enableScroll = true;
               }
            }
            referralsHeight.css("height", (height + netHeight - 20) + "px")
            referralsList.removeClass("height0", 1000, function()
            {
               mainMsgReferralsBtn.trigger("click");
               if(enableScroll)
               {
                  Site.referralsScroll = new iScroll('referralsWrapper',
                  {
                     hScrollbar : false,
                     vScrollbar : true
                     //,scrollbarClass : 'myScrollbar'
                  });
               }
            });
         }, 0);
      });
   },
   backtoMain : function()
   {
      var referralsList = $("#referralsList");
      var referrals = $("#referralsList .scroller ul");
      if(Site.referralsScroll)
      {
         Site.referralsScroll.destroy();
         $("#mainDeal").removeClass("invisible");
         delete Site.referralsScroll;
      }
      referralsList.addClass("height0", 1000, function()
      {
         referrals.html('');
      });
   },
   referralRequestPopup : function()
   {
      Genesis._popupCommon("Friend Referral Required before Purchase", "<p>Before being eligible to purchase this deal, a friend referral is required.</p>", "#mainMsg");
   },
   resendVouchersPopup : function()
   {
      Genesis.ajax(false, Genesis.resend_vouchers_path, 'GET', null, 'json');
   },
   resendRewardPopup : function()
   {
      Genesis.ajax(false, Genesis.resend_reward_path, 'GET', null, 'json');
   },
   referralDecisionPopup : function(url, msg, rewardBtn)
   {
      this._url = url;
      this._msg = msg;
      this._rewardBtn = rewardBtn;
      Genesis._popupCommon("Facebook Posts", "<p>Your recommendation has been posted on your facebook newsfeed,</p><p>Would you like to send this recommendation to specific friends?</p>", "#", "Yes", Site.referralCompletePopup, "No", function()
      {
         location.href = Site._url;
      });
   },
   referralCompletePopup : function()
   {
      $(".alert-message.error .close").parent().switchClass('in', 'hide');
      $('#popupDialog').modal('hide');
      FB.ui(
      {
         method : 'send',
         name : 'Message to your friends',
         link : this._url,
         description : this._msg
      }, function(response)
      {
         if(!response || response.error)
         {
            Site.resubmitFriendsEmail = true;
            Genesis.showErrMsg("Error sending your recommendation message to your friend's mail accounts.<br/>Resubmit to Try Again!", function()
            {
               //location.href = this._url;
            });
            Site._rewardBtn.removeClass('disabled');
         }
         else
         {
            Genesis._popupCommon("Congratulations!", "<p>Your recommendation has been sent to your friend's mail accounts.</p>", this._url);
            delete Site._url;
            delete Site._msg;
            delete Site_rewardBtn;
         }
      });
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
      for(var x = 0; x < Math.ceil(result.length / cols); x++)
      {
         html += '<li>';
         for(var y = x * cols; (y < (x + 1) * cols) && (y < result.length); y++)
         {
            html += '<div class="listItem"><div class="listItemCtn"><a href="' + dealPath + result[y].refId + '">' + '<img class="left" width="50" style="margin-right:5px;display:block;" src="http://graph.facebook.com/' + this.friendsList[y].value + '/picture?type=square&"/>' + '<div class="listContent">' + this.friendsList[y].label + '</div></div>' + '</a></div>';
         }
         html += '</li>';
      }
      $("#profileBrowserDialog .listView .scroller ul").html(html);
      setTimeout($.proxy(function()
      {
         var headerHeight = $("#profileBrowserDialog .filterBox").prop('offsetHeight');
         var bodyHeight = $("#profileBrowserWrapper .scroller").prop("offsetHeight");
         var footerHeight = 0;
         var netHeight = headerHeight + footerHeight;
         var height = Math.max(bodyHeight, this.friendsMinHeight - netHeight);
         var cleanScroller = true;
         if(height > (this.friendsMinHeight - netHeight))
         {
            height = Math.min(bodyHeight, this.friendsMaxHeight - netHeight);
            if(height == (this.friendsMaxHeight - netHeight))
            {
               if(this.friendsScroll)
               {
                  this.friendsScroll.refresh();
               }
               else
               {

                  this.friendsScroll = new iScroll('profileBrowserWrapper',
                  {
                     hScrollbar : false,
                     vScrollbar : true
                  });
               }
               cleanScroller = false;
            }
            $("#profileBrowserDialog .profileBrowserBody").css("height", height);
         }
         else
         {
            $("#profileBrowserDialog .profileBrowserBody").css("height", Math.max(this.friendsMinHeight, bodyHeight + netHeight));
         }
         if(this.friendsScroll && cleanScroller)
         {
            this.friendsScroll.destroy();
            delete this.friendsScroll;
         }
         if(callback)
         {
            callback(response);
         }
      }, Site), 0);
   },
   checkFriendReferral : function(result, uidField, nameField)
   {
      var friendsList = '';
      this.friendsList = [];
      for(var x = 0; x < result.length; x++)
      {
         if(result[x][uidField] != Genesis.currFbId)
         {
            this.friendsList.push(
            {
               label : result[x][nameField],
               value : result[x][uidField]
            });
            friendsList += ((friendsList.length > 0) ? ',' : '') + result[x][uidField];
         }
      }
      this.friendsList.sort(function(a, b)
      {
         return a[uidField] - b[uidField];
      });
      Genesis.ajax(true, this.checkUidReferralUrl, 'GET', 'friend_facebook_ids=' + friendsList, 'json', $.proxy(function(res)
      {
         var data = $.parseJSON(res.data);
         // Empty Result tell user to use the secret key
         if(res.total == 0)
         {
            Genesis.showErrMsg("You have no referrals.");
         }
         else
         {
            var friendsList = [];
            for(var i = 0; i < res.total; i++)
            {
               var index = this.friendsList.binarySearch(data[i].creator_facebook_id, function(a, b)
               {
                  return (a.value - b);
               });
               if(index >= 0)
               {
                  friendsList[i] = this.friendsList[index];
                  friendsList[i].refId = data[i].referral_id;
               }
            }
            this.friendsList = friendsList;
            $("#profileBrowserDialog").switchClass("hide", "in", 500, function()
            {
               Site.buildFriendsList(friendsList);
            });
         }
      }, Site));
   },
   getFriendsList : function(callback)
   {
      FB.api(
      {
         method : 'fql.query',
         //query : 'SELECT uid, name, username, current_location FROM user WHERE uid=me() OR uid IN (SELECT uid FROM
         // friendlist_member WHERE flid=' + listId + ')'
         query : 'SELECT uid, name, username, current_location FROM user WHERE uid=me() OR uid IN (SELECT uid2 FROM friend WHERE uid1 = me())'
      }, $.proxy(function(response)
      {
         if(response.length > 1)
         {
            this.checkFriendReferral(response, 'uid', 'name', callback);
         }
         else
         {
            if(response.length == 1)
            {
               this.showErrMsg("No Friends were found from your Friends List on Facebook. Reload Page to Try Again.");
            }
            else
            {
               this.showErrMsg("Error Retrieving Friends List from Facebook. Reload Page to Try Again.");
            }
         }
      }, Site));
   }
}
$(document).ready($(function()
{
   var $highlightsCtn = $("#highlightsCtn");
   var $highlights = $("#highlights");
   var $highlightsBtn = $("#highlightsBtn");
   var $detailsBtn = $("#detailsBtn");
   var $highlights1Tab = $("#highlights li:nth-child(1) a");
   var $highlights2Tab = $("#highlights li:nth-child(2) a");
   var $highlights1 = $("#highlights-1");
   var $highlights2 = $("#highlights-2");
   var $highlightTabs = $highlights.tabs();

   Site.initForm();
   Site.initMainMsg();
   Site.initSlides();

   // --------------------------------------------------------------------------------
   // Google Map
   // --------------------------------------------------------------------------------
   var $gmap = $("#gmap");
   var merchant_name = $("#merchant_name").text().trim();
   address = $("#merchant_address1").text().trim() + ' ' + $("#merchant_address2").text().trim() + ' ' + $("#merchant_city_state_zipcode").text().trim();
   $gmap.gMap(
   {
      markers : [
      {
         address : address,
         html : merchant_name
      }],
      zoom : 15,
      address : address
   });
   address = $("#merchant_address1").text().trim() + ' ' + $("#merchant_address2").text().trim() + '<br/>' + $("#merchant_city_state_zipcode").html().trim() + '<a target="_blank" href="' + "http://maps.google.com/maps?f=d&daddr=" + address + '">Get Directions</a>';
   $("#merchant_address").html(address);

   // --------------------------------------------------------------------------------
   // Scrolling Referrals
   // --------------------------------------------------------------------------------
   var mouseWheelEvt;
   if(jQuery.browser.webkit)
   {
      mouseWheelEvt = 'mousewheel';
   }
   else
   if(jQuery.browser.mozilla)
   {
      mouseWheelEvt = 'DOMMouseScroll';
   }
   $(window).bind(mouseWheelEvt, function(event, b)
   {
      // Are we only the scrolling region?
      if((event.target != document.body) && $("#referralsList")[0] && jQuery.contains($("#referralsList")[0], event.target))
      {
         event.preventDefault();
      }
   });
   // --------------------------------------------------------------------------------
   // SlideShow
   // --------------------------------------------------------------------------------
   $highlightsBtn.click(function()
   {
      // switch to 1st tab
      $("#offerDetails").css('height', $("#highlights-1").css('height'));
      $highlightsCtn.switchClass("span24", "span12", 1000, function()
      {
         Genesis.switchTab($highlights1Tab, $highlights1);
      });
   });
   $detailsBtn.click(function()
   {
      // switch to 2nd tab
      $("#offerDetails").css('height', $("#highlights-2").css('height'));
      Genesis.switchTab($highlights2Tab, $highlights2);
      $highlightsCtn.switchClass("span12", "span24", 1000, function()
      {
      });
   });
   // --------------------------------------------------------------------------------
   // Reward Button
   // --------------------------------------------------------------------------------
   var referralFbTag = false;
   $('#referralWarning').bind('hidden', function()
   {
      var referralTabVisible = $("#mainMsg .hero-referral").parent().css('display') != 'none';
      if(!referralTabVisible)
      {
         if(referralFbTag)
         {
            setTimeout(function()
            {
               $(".next").trigger("click");
               referralFbTag = false;
            }, 500);
         }
      }
      else
      {
         location.hash = "#top";
      }
   });
   $('#referralWarning .fbtag').bind('click', function()
   {
      referralFbTag = true;
      $('#referralWarning').modal('hide');
   });
   // --------------------------------------------------------------------------------
   // Facebook Message
   // --------------------------------------------------------------------------------
   FB.Event.subscribe('message.send', function(href, response)
   {
      if(response.success)
      {
         //location.href = Site.newReferralURL;
      }
      // Try again to send to users
      else
      {

      }
   });
}));
