//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function($)
{
   var touch =
   {
   }, touchTimeout, tapTimeout, swipeTimeout, longTapDelay = 750, longTapTimeout

   function parentIfText(node)
   {
      return 'tagName' in node ? node : node.parentNode
   }

   function swipeDirection(x1, x2, y1, y2)
   {
      var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
      return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
   }

   function longTap()
   {
      longTapTimeout = null
      if (touch.last)
      {
         touch.el.trigger('longTap')
         touch =
         {
         }
      }
   }

   function cancelLongTap()
   {
      if (longTapTimeout)
         clearTimeout(longTapTimeout)
      longTapTimeout = null
   }

   function cancelAll()
   {
      if (touchTimeout)
         clearTimeout(touchTimeout)
      if (tapTimeout)
         clearTimeout(tapTimeout)
      if (swipeTimeout)
         clearTimeout(swipeTimeout)
      if (longTapTimeout)
         clearTimeout(longTapTimeout)
      touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
      touch =
      {
      }
   }


   $(document).ready(function()
   {
      var now, delta

      $(document.body).bind('touchstart', function(e)
      {
         now = Date.now()
         delta = now - (touch.last || now)
         touch.el = $(parentIfText(e.touches[0].target))
         touchTimeout && clearTimeout(touchTimeout)
         touch.x1 = e.touches[0].pageX
         touch.y1 = e.touches[0].pageY
         if (delta > 0 && delta <= 250)
            touch.isDoubleTap = true
         touch.last = now
         longTapTimeout = setTimeout(longTap, longTapDelay)
      }).bind('touchmove', function(e)
      {
         cancelLongTap()
         touch.x2 = e.touches[0].pageX
         touch.y2 = e.touches[0].pageY
         if (Math.abs(touch.x1 - touch.x2) > 10)
            e.preventDefault()
      }).bind('touchend', function(e)
      {
         cancelLongTap()

         // swipe
         if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

            swipeTimeout = setTimeout(function()
            {
               touch.el.trigger('swipe')
               touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
               touch =
               {
               }
            }, 0)

         // normal tap
         else if ('last' in touch)

            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function()
            {

               // trigger universal 'tap' with the option to cancelTouch()
               // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
               var event = $.Event('tap')
               event.cancelTouch = cancelAll
               touch.el.trigger(event)

               // trigger double tap immediately
               if (touch.isDoubleTap)
               {
                  touch.el.trigger('doubleTap')
                  touch =
                  {
                  }
               }

               // trigger single tap after 250ms of inactivity
               else
               {
                  touchTimeout = setTimeout(function()
                  {
                     touchTimeout = null
                     touch.el.trigger('singleTap')
                     touch =
                     {
                     }
                  }, 250)
               }

            }, 0)

      }).bind('touchcancel', cancelAll)

      $(window).bind('scroll', cancelAll)
   });
   ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m)
   {
      $.fn[m] = function(callback)
      {
         return this.bind(m, callback)
      }
   })
})(Zepto);

(function()
{
   var width, height, iscroll;
   var setImageSize = function()
   {
      var image = $('#earnPtsImage img')[0];

      // specific OS
      if ($.os.ios)
      {
         width = height = 2 * 57 * 1.5;
      }
      else// if ($.os.android || $.os.webos || $.os.blackberry || $.os.bb10 || $.os.rimtabletos)
      {
         if (window.devicePixelRatio > 1)
         {
            width = height = 4 * 48;
         }
         else
         {
            width = height = 4 * 36;
         }
      }
      var ratio = 1;
      if ($.os.phone)
      {
         ratio = (window.orientation === 0) ? 1 : window.screen.width / window.screen.height;
      }
      else
      {
         height = width *= 2;
      }
      image.style.height = (height * ratio) + 'px';
      image.style.width = (height * ratio) + 'px';
   };
   var orientationChange = function()
   {
      setImageSize();
      hideAddressBar();
      $('#checkexplorepageview-wrapper')[0].style.height = //
      $('#loadingMask')[0].style.height = //
      $('#notification')[0].style.height = //
      $('#mask')[0].style.height = //
      $('#createaccountpageview-wrapper')[0].style.height = //
      $('#earnptspageview-wrapper')[0].style.height = document.body.style.height;
      $('#checkexplorepageview-wrapper')[0].style.width = document.body.clientWidth + 'px';
      //$('#createaccountpageview-wrapper')[0].style.bottom = (getHeightOfIOSToolbars() >= 20 ? -(60 - 8) : 8) + 'px';
      $('#createaccountpageview-wrapper')[0].style.top = (calcHeight() - ((window.orientation === 0) ? 60 : ((getHeightOfIOSToolbars() < 20) ? 60 : 68))) + 'px';
   };
   var hideCheckExplorePage = function(e)
   {
      $('#checkexplorepageview-wrapper').addClass('x-item-hidden');
   };
   var hideEarnPtsPage = function(e)
   {
      $("#earnptspageview-wrapper").animate(
      {
         top : (-1 * Math.max(window.screen.height, window.screen.width)) + 'px',
         height : 0 + 'px'
      },
      {
         duration : 0.5 * 1000,
         easing : 'ease-in',
         complete : function()
         {
         }
      });
   };
   var setLoadingMaskVisibility = function(visible)
   {
      $('#loadingMask')[0].style.display = (visible) ? "" : "none";
   };
   var getLocation = function()
   {
      if (navigator.geolocation)
      {
         navigator.geolocation.getCurrentPosition(function(position)
         {
            console.debug("Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
         }, function(error)
         {
            switch (error.code)
            {
               case 1 :
               //DENIED
               case 2 :
               //UNAVAIL
               {
                  setNotificationVisibility(true, "Location Services", "GeoLocation feature must be enabled to continue");
                  break;
               }
               case 3 :
               //TIMEOUT
               {
                  setNotificationVisibility(true, "Location Services", "Cannot retrieve your current location. Try Again.");
                  break;
               }
            }
         });
      }
      else
      {
         setNotificationVisibility(true, "Location Services", "GeoLocation is not supported by this browser");
      }
   };

   window.addEventListener('hashchange', function()
   {
      if ($("#checkexplorepageview-wrapper")[0].style.display != "none")
      {
         hideCheckExplorePage();
      }
      else if ($("#earnptspageview-wrapper")[0].style.left.split('px')[0] == 0)
      {
         hideEarnPtsPage();
      }
   });
   window.addEventListener("orientationchange", orientationChange);
   $(window).resize(orientationChange);
   $(window).on('scroll', function(e)
   {
      try
      {
         var totalHeight = parseInt(document.body.style.height.split('px')[0]) + getHeightOfIOSToolbars();

         //if (window.outerHeight > window.innerHeight)
         if (Math.abs(totalHeight - ((window.orientation === 0) ? window.screen.height : window.screen.width)) > 20)
         {
            setTimeout(function()
            {
               window.scrollTo(0, 1);
            }, 1);
         }
      }
      catch(e)
      {
      }
   });

   $(document.body).on('touchmove', function(e)
   {
      e.preventDefault();
   });
   $(document).ready(function()
   {
      setImageSize();
      /*
       * iScroll
       */
      iscroll = new IScroll('#checkexplorepageview-wrapper .body',
      {
         scrollbars : true,
         mouseWheel : true,
         interactiveScrollbars : false
      });

      /*
       * Welcom Page
       */
      $('#createaccountpageview-wrapper')[0].style.height = calcHeight() + 'px';
      $('#createaccountpageview-wrapper')[0].style.top = (calcHeight() - ((window.orientation === 0) ? 60 : ((getHeightOfIOSToolbars() >= 20) ? 68 : 68))) + 'px';

      /*
       * Welcome Page Buttons
       */
      $("#checkExploreLoad").tap(function()
      {
         $('#checkexplorepageview-wrapper').removeClass('x-item-hidden');
         iscroll.refresh();
      });
      $("#earnPtsLoad").tap(function()
      {
         var message = $('#earnptspageview-wrapper .x-docked-top .x-innerhtml'), image = $('#earnPtsImage')[0], mobile = $('#earnPtsMobileNumber')[0];
         var loyaltyCard = true;
         if (($('#inputMobile')[0].value != "") || (loyaltyCard))
         {
            image.style.display = '';
            image.style.opacity = 1;
            mobile.style.display = 'none';
            if (loyaltyCard)
            {
               $('#earnPtsChoiceButtons').addClass('x-item-hidden');
               $('#earnPtsDismissButtons').removeClass('x-item-hidden');
               $('#earnPtsImage img')[0].src = 'resources/themes/images/v1/ios/prizewon/loyaltycard.svg';
               message.html('Show your KICKBAK Card or use your Mobile Number');
            }
            else
            {
               $('#earnPtsChoiceButtons').removeClass('x-item-hidden');
               $('#earnPtsDismissButtons').addClass('x-item-hidden');
               $('#earnPtsImage img')[0].src = 'resources/themes/images/v1/ios/prizewon/transmit.svg';
               message.html('Confirm before tapping against the KICKBAK Card Reader');
            }
         }
         else
         {
            image.style.display = 'none';
            image.style.opacity = 0;
            mobile.style.display = '';
            message.html('Enter your Mobile Number');
         }

         $("#earnptspageview-wrapper").animate(
         {
            top : 0 + 'px',
            height : calcHeight() + 'px',
         },
         {
            duration : 0.5 * 1000,
            easing : 'ease-out',
            complete : function()
            {
               $('#inputMobile').focus();
            }
         });
      });
      $('#goToMain').tap(hideCheckExplorePage);
      var exploreVenue = function(e)
      {
         var target = e.currentTarget;
         console.debug("Target ID : " + target.attributes.getNamedItem('data')['value']);
      };
      $('.media').tap(exploreVenue).swipeLeft(exploreVenue).swipeRight(exploreVenue);

      /*
       * EarnPts Page Buttons
       */
      $('#inputMobile').on('blur', orientationChange);
      $('#earnPtsProceed').tap(function()
      {
         var message = $('#earnptspageview-wrapper .x-docked-top .x-innerhtml'), image = $('#earnPtsImage'), mobile = $('#earnPtsMobileNumber')[0];
         if (mobile.style.display == "")
         {
            mobile.style.display = 'none';
            image[0].style.display = '';
            image.animate(
            {
               opacity : 1
            },
            {
               duration : 1 * 1000,
               easing : 'linear',
               complete : function()
               {
               }
            });
            message.html('Confirm before tapping against the KICKBAK Card Reader');
         }
         else
         {
         }
      });
      $('#earnPtsCancel').tap(hideEarnPtsPage);
      $('#earnPtsDismiss').tap(hideEarnPtsPage);
   });
})();
