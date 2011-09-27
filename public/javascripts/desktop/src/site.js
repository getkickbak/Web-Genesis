var _login = function()
{
   //$('#fb_login').css("display", "none");
   //$('#fb_login_img').css("display", "");
};
var _logout = function()
{
   //$('#fb_login').css("display", "");
   //$('#fb_login_img').css("display", "none");
};
Site =
{
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
         $.ajax(
         {
            url : location.href + "/referrals/create",
            type : "POST",
            data : "comment=" + rewardMsg,
            dataType : "json",
            //processData: false,
            //contentType: "application/json",
            success : function(response)
            {
               location.href = location.href + "?referral_id=" + response.data.referral_id
            }
         });
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
   initReferrals : function(facebook_id, comment)
   {
      return '<li><table class="hero-referrals hero-referralSeparator">' + '<tr>' + '<td width="100">' + '<img width="100" src="http://graph.facebook.com/' + facebook_id + '/picture?type=normal&"/>' + '</td>' + '<td>' + '<div class="hero-start">' + '<p>' + comment + '</p>' + '</div>' + '<div class="hero-end">&#160;</div>' + '</td>' + '</tr>' + '</table></li>';
   },
   getReferrals : function(referrals)
   {
      var start = 0, end = 10;
      var referralsList = $("#referralsList");

      $.ajax(
      {
         url : "/deals/runnersshop/referrals",
         type : "GET",
         data : "start=" + start + '&max=' + end,
         dataType : "json",
         //processData: false,
         contentType : "application/json",
         success : function(response)
         {
            if(response.success)
            {
               var data = $.parseJSON(response.data);
               var enableScroll = false;
               for(var i = 0; i < response.total; i++)
               {
                  referrals.append(Site.initReferrals(data[i].creator.facebook_id, data[i].comment));
                  referrals.append(Site.initReferrals(data[i].creator.facebook_id, data[i].comment));
                  referrals.append(Site.initReferrals(data[i].creator.facebook_id, data[i].comment));
                  referrals.append(Site.initReferrals(data[i].creator.facebook_id, data[i].comment));
               }
               var height = Math.max($("#referralsWrapper .scroller").prop("offsetHeight"), 398 - (47 + 77));
               if(height > (398 - (47 + 77)))
               {
                  height = Math.min($("#referralsWrapper .scroller").prop("offsetHeight"), 855 - (47 + 77));
                  if(height == (855 - (47 + 77)))
                  {
                     $("#mainDeal").addClass("invisible");
                     enableScroll = true;
                  }
               }
               $(".hero-unit.hero-referrals").css("height", (height + (47 + 77) - 20) + "px")
               referralsList.removeClass("height0", 1000, function()
               {
                  $("#mainMsg .pagination li:last-child a").trigger("click");
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
            }
            else
            {
            }
         }
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
   var $gmap = $("#gmap");
   var $highlightTabs = $highlights.tabs();

   Site.initForm();
   Site.initMainMsg();
   Site.initSlides();

   $(window).bind('mousewheel', function(event, b)
   {
      // Are we only the scrolling region?
      if((event.target != document.body) && jQuery.contains($("#referralsList")[0], event.target))
      {
         event.preventDefault();
      }
   });
   $highlightsBtn.click(function()
   {
      // switch to 1st tab
      $highlightsCtn.switchClass("span24", "span12", 1000, function()
      {
         switchTab($highlights1Tab, $highlights1);
      });
   });
   $detailsBtn.click(function()
   {
      if(!$gmap[0].innerHTML)
      {
         merchant_name = $("#merchant_name")[0].innerHTML.trim();
         address = $("#merchant_address1")[0].innerHTML.trim() + ' ' + $("#merchant_address2")[0].innerHTML.trim() + ' ' + $("#merchant_city_state_zipcode")[0].innerHTML.trim();
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
      }
      // switch to 2nd tab
      switchTab($highlights2Tab, $highlights2);
      $highlightsCtn.switchClass("span12", "span24", 1000, function()
      {
      });
   });
   var referralFbTag = false;
   $('#referralWarning').bind('hidden', function()
   {
      if(referralFbTag)
      {
         setTimeout(function()
         {
            $(".next").trigger("click");
            referralFbTag = false;
         }, 500);
      }
   });
   $('#referralWarning .fbtag').bind('click', function()
   {
      referralFbTag = true;
   });
   $("#referralsBtn").bind('click', function()
   {
      Site.getReferrals($("#referralsList .scroller ul"));
   });
}));
