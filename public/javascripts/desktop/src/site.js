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
var _initFormComponents = function()
{
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
         parent.wrap("&lt;span class='ui-state-default ui-corner-all' style='display:inline-block;width:16px;height:16px;margin-right:5px;'/>");
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
         parent.wrap("&lt;span class='ui-state-default ui-corner-all' style='display:inline-block;width:16px;height:16px;margin-right:5px;'/>");
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
         parent.append("&lt;span id='labeltext' style='float:left;'>&lt;/span>&lt;span style='float:right;display:inline-block' class='ui-icon ui-icon-triangle-1-s' >&lt;/span>");
         parent.after("&lt;ul class=' ui-helper-reset ui-widget-content ui-helper-hidden' style='position:absolute;z-index:50;width:140px;' >&lt;/ul>");
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
}
var initForm = function()
{
   var textareas = $("#mainMsg .hero-referral").find("textarea");
   var defaultAnswer = ["My office co-worker John recommended me to Runner's Shop. He's an avid runner who regularly competes in marathon races.", "The first time I visited the place, I signed up for one of their running clinics during the winter months. They fitted me with proper running shoes and I haven't had an injury yet!", "I like the fact that the club foster's a friendly environment and their training programs are top notch!"];
   var $reward = $("#reward");
   var $discuss = $("#discuss");
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
      $recommendMsg.text(rewardMsg);
      $comments.show("blind",
      {
      }, 'slow', function()
      {
      });
      $(".next").trigger("click");
   });
   $discuss.click(function(event)
   {
      $comments.show("highlight",
      {
      }, 3000);
   });
   _initFormComponents();
}
var initMainMsg = function()
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
      generatePagination : false,
      start : 1
   });
   $(".fbtag").click(function()
   {
      $(".next").trigger("click");
   });
}
var initSlides = function()
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
};

$(document).ready($(function()
{
   var $highlights = $("#highlights");
   var $highlightsBtn = $("#highlightsBtn");
   var $detailsBtn = $("#detailsBtn");
   var $highlights1 = $("#highlights-1 *:first-child");
   var $highlights2 = $("#highlights-2 *:first-child");
   var $gmap = $("#gmap");
   var $highlightTabs = $highlights.tabs();

   initForm();
   initMainMsg();
   initSlides();

   var highlights1 = function()
   {
      // switch to 1st tab
      $highlights.switchClass("span24", "span12", 1000, function()
      {
         $highlightTabs.tabs('select', 0);
      });
   };
   var highlights2 = function()
   {
      if(!$gmap[0].innerHTML)
      {
      	 merchant_name = $("#merchant_name")[0].innerHTML;
      	 address = $("#merchant_address1")[0].innerHTML + ' '+ $("#merchant_address2")[0].innerHTML + ' ' + $("#merchant_city_state_zipcode")[0].innerHTML;
         $gmap.gMap(
         {
            markers : [
            {
               address: address,
               html: merchant_name
            }],
            zoom : 15,
            address : address
         });
      }
      // switch to 2nd tab
      $highlightTabs.tabs('select', 1);
      $highlights.switchClass("span12", "span24", 1000, function()
      {
      });
   };
   $highlightsBtn.click(function()
   {
      highlights1();
   });
   $detailsBtn.click(function()
   {
      highlights2();
   });
}));
