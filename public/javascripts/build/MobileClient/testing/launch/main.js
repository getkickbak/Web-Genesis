var mainAppInit = false, href = location.href;

var proximityInit = function()
{
   //
   // Sender/Receiver Volume Settings
   // ===============================
   // - For Mobile Phones
   //
   // Client Device always transmits
   //
   var s_vol_ratio, r_vol_ratio, c = Genesis.constants, desktop = !($.os && ($.os.phone || $.os.tablet));

   if (desktop || $.os.ios)
   //if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
   {
      //(tx)
      s_vol_ratio = 100;
      //Default Volume laying flat on a surface (tx)
      c.s_vol = 50;

      r_vol_ratio = 0.5;
      //(rx)
      c.conseqMissThreshold = 1;
      c.magThreshold = 20000;
      // More samples for better accuracy
      c.numSamples = 4 * 1024;
      //Default Overlap of FFT signal analysis over previous samples
      c.sigOverlapRatio = 0.25;
   }
   else if ($.os.android || $.os.webos || $.os.blackberry || $.os.bb10 || $.os.rimtabletos)
   //else if (Ext.os.is('Android') || Ext.os.is('BlackBerry'))
   {
      //(tx)
      s_vol_ratio = 0.25;
      //Default Volume laying flat on a surface (tx)
      c.s_vol = 25;

      //(rx)
      r_vol_ratio = 0.4;
      c.conseqMissThreshold = 1;
      c.magThreshold = 20000;
      c.numSamples = 4 * 1024;
      //Default Overlap of FFT signal analysis over previous samples
      c.sigOverlapRatio = 0.25;
   }

   c.proximityTxTimeout = 20 * 1000;
   c.proximityRxTimeout = 40 * 1000;
   Genesis.fn.printProximityConfig();
   window.plugins.proximityID.init(s_vol_ratio, r_vol_ratio);
};
var soundInit = function()
{
   var me = gblController;
   //
   // Initialize Sound Files, make it non-blocking
   //
   me.sound_files =
   {
   };
   var soundList = [//
   ['rouletteSpinSound', 'roulette_spin_sound', 'Media'], //
   ['winPrizeSound', 'win_prize_sound', 'Media'], //
   ['losePrizeSound', 'lose_prize_sound', 'Media'], //
   ['birthdaySound', 'birthday_surprise', 'Media'], //
   ['promoteSound', 'promote_sound', 'FX'], //
   ['clickSound', 'click_sound', 'FX'], //
   //['refreshListSound', 'refresh_list_sound', 'FX'], //
   ['beepSound', 'beep.wav', 'FX']];

   for (var i = 0; i < soundList.length; i++)
   {
      //console.debug("Preloading " + soundList[i][0] + " ...");
      me.loadSoundFile.apply(me, soundList[i]);
   }
};
var setChildBrowserVisibility = function(visible, hash, pushNotif)
{
   var db = Genesis.db.getLocalDB(true), version = '?v=' + Genesis.constants.clientVersion;

   hash = hash || '';
   if (visible)
   {
      //
      // Initiliazation
      //
      if (!mainAppInit)
      {
         if (Genesis.fn.isNative())
         {
            var profile;
            if (!($.os && ($.os.phone || $.os.tablet)))
            {
               profile = 'Desktop';
            }
            else if ($.os.ios)
            {
               profile = 'Iphone';
            }
            else
            //else if ($.os.android)
            {
               profile = 'Android';
            }

            var i = 0x000, callback = function(success, flag)
            {
               if (success && ((i |= flag) == 0x111))
               {
                  i = 0;

                  $('#loadingMask')['addClass']('x-item-hidden');

                  mainAppInit = true;
                  $("#checkexplorepageview").addClass('x-item-hidden');
                  //
                  // Startup Application
                  //

                  Ext.Loader.setConfig(
                  {
                     enabled : false,
                     paths :
                     {
                        Ext : _extPath,
                        Genesis : _appPath,
                        "Ext.ux" : _appPath
                     }
                  });

                  Ext.application(
                  {
                     requires : ['Ext.MessageBox', 'Ext.device.Notification', 'Ext.device.Camera', 'Ext.device.Orientation'],
                     profiles : [profile],
                     views : ['Document', 'client.UploadPhotosPage', 'client.ChallengePage', 'client.Rewards', 'client.Redemptions',
                     // //
                     'client.AccountsTransfer', 'client.SettingsPage', //
                     'LoginPage', 'SignInPage', 'client.MainPage', 'widgets.client.RedeemItemDetail', 'client.Badges', 'client.JackpotWinners', 'client.MerchantAccount',
                     // //
                     'client.MerchantDetails', 'client.Accounts', 'client.Prizes', 'Viewport'],
                     controllers : ['client.Challenges', 'client.Rewards', 'client.Redemptions', //
                     'client.Viewport', 'client.Login', 'client.MainPage', 'client.Badges', 'client.Merchants', 'client.Accounts', 'client.Settings', 'client.Checkins', 'client.JackpotWinners', 'client.Prizes'],
                     launch : function()
                     {
                        _application = this;
                        var viewport = _application.getController('client' + '.Viewport');

                        console.debug("Ext App Launch");

                        viewport.appName = appName;
                        QRCodeReader.prototype.scanType = "Default";
                        console.debug("QRCode Scanner Mode[" + QRCodeReader.prototype.scanType + "]");
                        if (pushNotif)
                        {
                           viewport.setApsPayload(pushNotif);
                        }
                        viewport.redirectTo('');

                        console.debug("Launched App");
                     },
                     appFolder : _appPath,
                     name : 'Genesis'
                  });
               }
            };

            setLoadMask(true);
            Genesis.fn.checkloadjscssfile('../lib/sencha-touch-all.js' + version, "js", function(success)
            {
               if (success)
               {
                  Genesis.fn.checkloadjscssfile('../core.js' + version, "js", Ext.bind(callback, null, [0x001], true));
                  Genesis.fn.checkloadjscssfile('../app/profile/' + profile + '.js' + version, "js", Ext.bind(callback, null, [0x010], true));
                  Genesis.fn.checkloadjscssfile('../client-all.js' + version, "js", Ext.bind(callback, null, [0x100], true));
               }
               else
               {
                  setNotificationVisibility(true, 'KICKBAK', "Error Loading Application Resource Files.", "Dismiss", Ext.emptyFn);
               }
            });
         }
         else
         {
            mainAppInit = true;
            if (pushNotif)
            {
            }
            else
            {
            }
            $(".iframe")[0].src = '../index.html' + version + '#' + hash;
            $(".iframe").removeClass('x-item-hidden');
         }
      }
      //
      // Back to Main Page
      //
      else if (db['auth_code'])
      {
         var viewport;
         if (Genesis.fn.isNative())
         {
            viewport = _application.getController('client' + '.Viewport');
            $("#checkexplorepageview").addClass('x-item-hidden');
            if (pushNotif)
            {
               viewport.setApsPayload(pushNotif);
               viewport.redirectTo('');
            }
            else if (!redirectToMerchantPage(db, viewport))
            {
               viewport.redirectTo('main');
            }
            $("#ext-viewport").removeClass('x-item-hidden');
         }
         else if ($(".iframe")[0].contentWindow._application)
         {
            viewport = $(".iframe")[0].contentWindow._application.getController('client' + '.Viewport');
            if (pushNotif)
            {
            }
            else
            {
               viewport.redirectTo('main');
            }
            $(".iframe").removeClass('x-item-hidden');
         }
      }
      //
      // Goto Login Page
      //
      else
      {
         if (Genesis.fn.isNative())
         {
            $("#checkexplorepageview").addClass('x-item-hidden');
            _application.getController('client' + '.Viewport').redirectTo('login');
            $("#ext-viewport").removeClass('x-item-hidden');
         }
         else if ($(".iframe")[0].contentWindow._application)
         {
            $(".iframe")[0].contentWindow._application.getController('client' + '.Viewport').redirectTo('login');
            $(".iframe").removeClass('x-item-hidden');
         }
      }
   }
   else
   {
      //
      // Refresh is not logged in
      //
      if (!db['auth_code'])
      {
         $('.body ul').html('');
         if (!($.os && $.os.ios && (parseFloat($.os.version) >= 7.0)))
         {
            $('#checkexplorepageview .body').infiniteScroll('reset');
         }
      }

      $("#earnPtsLoad span.x-button-label").text((db['auth_code']) ? 'Earn Points' : 'Sign In / Register');
      window.location.hash = '#' + hash;
      if (Genesis.fn.isNative())
      {
         $("#checkexplorepageview").removeClass('x-item-hidden');
         $("#ext-viewport").addClass('x-item-hidden');
      }
      else
      {
         $(".iframe").addClass('x-item-hidden');
      }
   }
};
var redirectToMerchantPage = function(db, viewport)
{
   var rc = false, ma_struct = db['ma_struct'];
   if (Ext.isDefined(ma_struct) && (ma_struct['id'] > 0))
   {
      // Mini App forwarding
      Genesis.db.removeLocalDBAttrib('ma_struct');
      _application.getController('client' + '.Checkins').onExploreDisclose(null, ma_struct);
      rc = true;
   }

   return rc;
};
var setLoadMask = function(visible)
{
   $('#loadingMask')[visible ? 'removeClass' : 'addClass']('x-item-hidden');
};
var detectAccessToken = function(url)
{
   var db = Genesis.db.getLocalDB();
   if (db['fbLoginInProgress'] && (url.indexOf("access_token=") !== -1))
   {
      setChildBrowserVisibility(true, url.split("#")[1]);
   }
   else
   {
      setChildBrowserVisibility(false);
   }
};

/*
if (Ext.os.is('Android') && Genesis.fn.isNative())
{
navigator.app.exitApp();
}
else if (!Genesis.fn.isNative())
{
window.location.reload();
}
*/
// =============================================================
// System Utilities
// =============================================================
(function()
{
   var width, height, iscroll, disableHash = false;
   var setImageSize = function()
   {
      var image = $('#earnPtsImage img')[0];

      // specific OS
      if (!($.os && ($.os.phone || $.os.tablet)) || $.os.ios)
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
      if ($.os && $.os.phone)
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
      $('body')[(window.orientation == 0) ? 'addClass' : 'removeClass']('x-portrait');
      $('body')[(window.orientation == 0) ? 'removeClass' : 'addClass']('x-landscape');
   };
   var hideEarnPtsPage = function(e)
   {
      $("#earnptspageview").animate(
      {
         top : (-1 * Math.max(window.screen.height, window.screen.width)) + 'px'
      },
      {
         duration : 0.75 * 1000,
         easing : 'ease-in',
         complete : function()
         {
         }
      });
   };
   var refreshCheckExploreVenues = function()
   {
      var desktop = !($.os && ($.os.phone || $.os.tablet)), pfEvent = (desktop) ? 'click' : 'tap';
      var exploreVenue = function(e)
      {
         var me = gblController, target = e.currentTarget, ma_struct = Ext.decode(decodeURIComponent(target.attributes.getNamedItem('data')['value']));

         me.playSoundFile(me.sound_files['clickSound']);
         console.debug("Target ID : ", ma_struct['name'] + "(" + ma_struct['id'] + ")");
         Genesis.db.setLocalDBAttrib('ma_struct', ma_struct);
         setChildBrowserVisibility(true);
         return false;
      };
      $('.media').off().on(pfEvent, exploreVenue).swipeLeft(exploreVenue).swipeRight(exploreVenue);
   };
   var appLaunchCallbackFn = function()
   {
   };
   var getNearestVenues = function(start, refresh)
   {
      var me = gblController, viewport = me.getViewPortCntlr();
      var getAddress = function(values)
      {
         return (values['address'] + ",<br/>" + values['city'] + ", " + values['state'] + ", " + values['country'] + ",<br/>" + values['zipcode']);
      };
      var getDistance = function(values)
      {
         return ((values['distance'] > 0) ? values['distance'].toFixed(1) + 'km' : '');
      };

      setLoadMask(true);
      $(document).one('locationupdate', function(e, position)
      {
         var params =
         {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude,
            start : start,
            limit : start + 20
         };
         ajax = $.ajax(
         {
            type : 'GET',
            url : serverHost + '/api/v1/venues/find_nearest',
            // data to be added to query string:
            data : params,
            // type of data we are expecting in return:
            dataType : 'json',
            timeout : 30 * 1000,
            context : document,
            success : function(data)
            {
               setLoadMask(false);
               if (!data)
               {
                  setNotificationVisibility(true, 'Warning', me.missingVenueInfoMsg(), "Dismiss", Ext.emptyFn);
                  return;
               }
               else if (data.data.length == 0)
               {
                  setNotificationVisibility(true, 'Explore', me.noVenueInfoMsg(), "Dismiss", Ext.emptyFn);
                  return;
               }

               var venues = "";
               console.debug("AJAX Response", data);

               if (refresh)
               {
                  $('.body ul').html(venues);
                  if (!($.os && $.os.ios && (parseFloat($.os.version) >= 7.0)))
                  {
                     $('#checkexplorepageview .body').infiniteScroll('reset');
                  }
               }

               for (var i = 0; i < data.data.length; i++)
               {
                  var venue = data.data[i];
                  // @formatter:off
                  venues +=  //
                  '<li class="media" data="'+ encodeURIComponent(Ext.encode(venue)) +'">'+
                     '<a class="pull-left" href="#"> <img src="' + venue['merchant']['photo']['url'] + '" class="media-object" data-src="holder.js/64x64" alt=""> </a>'+
                     '<div class="media-body">' +
                        '<div class="media-heading">' + venue['name'] + '</div>' +
                           '<div class="itemDistance">' + getDistance(venue) + '</div>' +
                           '<div class="itemDesc">' + getAddress(venue) + '</div>' +
                     '</div>' +
                  '</li>';
                  // @formatter:on
               }
               $('.body ul').append(venues);
               refreshCheckExploreVenues();

               if (!($.os && $.os.ios && (parseFloat($.os.version) >= 7.0)))
               {
                  iscroll.refresh();
                  if (refresh)
                  {
                     $('#checkexplorepageview .body').infiniteScroll('reset');
                  }
               }
            },
            error : function(xhr, type)
            {
               setLoadMask(false);
               setNotificationVisibility(true, 'Warning', me.missingVenueInfoMsg(), "Dismiss", Ext.emptyFn);
            }
         });
      });
      viewport.getGeoLocation();
   };
   var refreshCSRFToken = function()
   {
      var me = gblController, db = Genesis.db.getLocalDB(), device = Genesis.constants.device;

      if (!device)
      {
         console.log("Error Registering with PushNotification");
         device = null;
      }

      if (db['auth_code'])
      {
         var params =
         {
            version : Genesis.constants.clientVersion,
            device_pixel_ratio : window.devicePixelRatio,
            device : Ext.encode(device)
         };

         setLoadMask(true);
         ajax = $.ajax(
         {
            type : 'GET',
            url : serverHost + '/api/v1/tokens/get_csrf_token',
            // data to be added to query string:
            data : params,
            // type of data we are expecting in return:
            dataType : 'json',
            timeout : 30 * 1000,
            context : document,
            success : function(data)
            {
               Genesis.db.setLocalDBAttrib('csrf_code', data['metaData']['csrf_token']);
               // Return to previous Venue
               if (db['last_check_in'])
               {
                  me.getGeoLocation();
               }
               setLoadMask(false);
            },
            error : function(xhr, type)
            {
               setLoadMask(false);
               //me.resetView();
               //me.redirectTo('login');
            }
         });
      }
   };

   window.addEventListener('hashchange', function()
   {
      //
      // Only check for Hash change on MiniClient focus
      //
      if ($('iframe').hasClass('x-item-hidden') && !disableHash)
      {
         switch (window.location.hash.split('#')[1])
         {
            case 'explore' :
            {
               disableHash = true;
               window.location.hash = "";
               break;
            }
            default:
               if ($("#earnptspageview")[0].style.top.split('px')[0] == 0)
               {
                  hideEarnPtsPage();
               }
               break;
         }
      }
      else
      {
         disableHash = false;
      }
   });
   window.addEventListener("orientationchange", orientationChange);
   $(window).resize(orientationChange);

   if (!($.os && $.os.ios && (parseFloat($.os.version) >= 7.0)))
   {
      $(window).on('scroll', function(e)
      {
         setTimeout(function()
         {
            try
            {
               var totalHeight = parseInt(document.body.style.height.split('px')[0]) + getHeightOfIOSToolbars();

               //if (window.outerHeight > window.innerHeight)
               if (Math.abs(totalHeight - ((window.orientation === 0) ? window.screen.height : window.screen.width)) > 20)
               {
                  window.scrollTo(0, 0);
               }
            }
            catch(e)
            {
            }
         }, 0.1 * 1000);
      });

      $(document.body).on('touchmove', function(e)
      {
         e.preventDefault();
      });
   }
   $(document).ready(function()
   {
      var me = gblController, viewport = gblController.getViewPortCntlr(), //
      desktop = !($.os && ($.os.phone || $.os.tablet)), pfEvent = (desktop) ? 'click' : 'tap', //
      version = '?v=' + Genesis.constants.clientVersion;

      // =============================================================
      // Custom Events
      // =============================================================
      $.Event('ajaxBeforeSend');
      $.Event('locationupdate');

      if (!Genesis.fn.isNative())
      {
         // =============================================================
         // WebAudio Support
         // =============================================================

         //var canPlayAudio = (new Audio()).canPlayType('audio/wav; codecs=1');
         //if (!canPlayAudio)
         if ( typeof (webkitAudioContext) == 'undefined')
         {
            //
            // If Worker is not supported, preload it
            //
            if ( typeof (Worker) == 'undefined')
            {
               console.debug("HTML5 Workers not supported");

               var mp3Flags = 0x00;
               var callback = function(success, flag)
               {
                  if (!success)
                  {
                     setNotificationVisibility(true, 'KICKBAK', "Error Loading Application Resource Files.", "Reload", function()
                     {
                        window.location.reload();
                     });
                  }
                  else
                  {
                     if ((mp3Flags |= flag) == 0x11)
                     {
                        appLaunchCallbackFn(true, 0x100);
                        console.debug("Enable MP3 Encoder");
                     }
                  }
               };

               Genesis.fn.checkloadjscssfile('../lib/libmp3lame.min.js' + version, "js", Ext.bind(callback, null, [0x01], true));
               Genesis.fn.checkloadjscssfile('../worker/encoder.min.js' + version, "js", function(success)
               {
                  if (success)
                  {
                     _codec = new Worker('../worker/encoder.min.js' + version);
                  }
                  callback(success, 0x10);
               });
            }
            else
            {
               _codec = new Worker('../worker/encoder.min.js' + version);
               appLaunchCallbackFn(true, 0x100);
               console.debug("Enable MP3 Encoder");
            }
         }
         else
         {
            appLaunchCallbackFn(true, 0x100);
            console.debug("Enable WAV/WebAudio Encoder");
         }

         // =============================================================
         // SystemInit
         // =============================================================
         proximityInit();
         soundInit();
      }

      // =============================================================
      // Ajax Calls Customizations
      // =============================================================
      $.ajaxSettings.accepts.json = "*/*";
      var _param = $.param;
      $.param = function(obj, traditional)
      {
         var db = Genesis.db.getLocalDB();

         if (db['auth_code'])
         {
            obj['auth_token'] = db['auth_code'];
         }
         return _param(obj, traditional);
      }
      $(document).on('ajaxBeforeSend', function(e, xhr, options)
      {
         var db = Genesis.db.getLocalDB();

         // This gets fired for every Ajax request performed on the page.
         // The xhr object and $.ajax() options are available for editing.
         // Return false to cancel this request.
         options.headers = options.headers ||
         {
         };
         if (options.type == 'POST')
         {
            if (db['auth_code'])
            {
               options.headers = Ext.apply(options.headers,
               {
                  'X-CSRF-Token' : db['csrf_code'],
               });
               xhr.setRequestHeader('X-CSRF-Token', db['csrf_code']);
            }
            options.headers = Ext.apply(options.headers,
            {
               'Content-Type' : 'application/json'
            });
            xhr.setRequestHeader('Content-Type', 'application/json');
         }
      });

      // =============================================================
      // Refresh CSRF Token
      // =============================================================
      if (Genesis.constants.device || !Genesis.fn.isNative())
      {
         refreshCSRFToken();
      }
      else
      {
         $(document).on('kickbak:updateDeviceToken', refreshCSRFToken);
      }

      // =============================================================
      // System Initializations
      // =============================================================
      orientationChange();

      if (!($.os && ($.os.phone || $.os.tablet)) || $.os.ios)
      {
         $('body').addClass('x-ios');
         $('body').addClass('x-ios-' + parseInt((($.os) ? $.os.version : '6')));
      }
      else if ($.os.blackberry || $.os.bb10 || $.os.rimtabletos)
      {
         $('body').addClass('x-blackberry');
         $('body').addClass('x-blackberry-' + parseInt(($.os.version)));
      }
      else
      //else if ($.os.android)
      {
         $('body').addClass('x-android');
         $('body').addClass('x-android-' + parseInt(($.os.version)));
      }
      if (!($.os && ($.os.phone || $.os.tablet)))
      {
         $('body').addClass('x-desktop');
      }
      else
      {
         $('body').addClass(($.os.phone) ? 'x-phone' : 'x-tablet');
      }

      var _hide_ = function(e)
      {
         me.playSoundFile(me.sound_files['clickSound']);
         hideEarnPtsPage(e);
         return false;
      };
      $('#earnPtsCancel').on(pfEvent, _hide_);
      $('#earnPtsDismiss').on(pfEvent, _hide_);
      $('#earnptspageview')[0].style.top = (-1 * Math.max(window.screen.height, window.screen.width)) + 'px';

      // =============================================================
      // Venue Browse/Scroll
      // =============================================================
      var ajax, i = -1, iscrollInfinite = $('#checkexplorepageview .body');
      if (!($.os.ios && (parseFloat($.os.version) >= 7.0)))
      {
         $('#checkexplorepageview .body > div:first-child').addClass('scroller');
         iscroll = new IScroll('#checkexplorepageview .body',
         {
            scrollbars : true,
            mouseWheel : true,
            interactiveScrollbars : false
         });
         var origEventHandler = iscroll.handleEvent;
         iscrollInfinite.infiniteScroll(
         {
            threshold : window.screen.height,
            iScroll : iscroll,
            onEnd : function()
            {
               console.debug('No More Results');
            },
            onBottom : function(callback)
            {
               if ($('.media').length > 0)
               {
                  console.debug('At the end of the page. Loading more!');
                  getNearestVenues($('.media').length);
               }
               callback(true);
            }
         });

         iscroll.handleEvent = function(e)
         {
            origEventHandler.call(iscroll, e);
            switch ( e.type )
            {
               case 'touchmove':
               case 'MSPointerMove':
               case 'mousemove':
                  iscrollInfinite.data().infiniteScroll.iScroll.options.onScrollMove();
                  break;
            }
         };
      }
      else
      {
         $('#checkexplorepageview').addClass('noIScroll');
      }
      var pageX = 0, pageY = 0;
      var _getVenues_ = function(e)
      {
         x1 = parseInt(window.screen.width * (0.5 - (0.65 / 2))), x2 = parseInt(window.screen.width * 0.65);
         y1 = parseInt(window.screen.height * (0.5 - (0.65 / 2))), y2 = parseInt(window.screen.height * 0.65);

         //cursor:pointer
         //console.log("x=" + pageX + ", x1=" + x1 + ", x2=" + x2 + ", y=" + pageY + ", y1=" + y1 + ", y2=" + y2);
         if ((pageX >= x1 && pageX <= x2) && (pageY >= y1 && pageY <= y2))
         {
            var db = Genesis.db.getLocalDB();
            if (db['auth_code'])
            {
               //
               // Trigger when the list is empty
               //
               if ($('.media').length == 0)
               {
                  me.playSoundFile(me.sound_files['clickSound']);
                  getNearestVenues(0);
               }
            }
            else
            {
               me.playSoundFile(me.sound_files['clickSound']);
               setChildBrowserVisibility(true);
            }
         }
         return false;
      };
      $('#checkexplorepageview .body').on(pfEvent, _getVenues_);
      $('#checkexplorepageview .body').on('touchstart', function(e)
      {
         pageX = e.touches[0].clientX;
         pageY = e.touches[0].clientY;
      });
      // =============================================================
      // WelcomePage Actions
      // =============================================================
      var _ptsLoad_ = function()
      {
         me.playSoundFile(me.sound_files['clickSound']);
         var db = Genesis.db.getLocalDB();
         if (db['auth_code'])
         {
            $('#earnPtsProceed').trigger(pfEvent);
         }
         else
         {
            setChildBrowserVisibility(true);
         }
         return false;
      };
      $("#earnPtsLoad").on(pfEvent, _ptsLoad_);

      // =============================================================
      // ExplorePage Actions
      // =============================================================
      var _home_ = function(e)
      {
         var db = Genesis.db.getLocalDB();
         me.playSoundFile(me.sound_files['clickSound']);
         //refresh
         if (db['auth_code'] && ($(e.currentTarget).has('.x-button .x-button-icon.refresh').length > 0))
         {
            getNearestVenues(0, true);
         }
         else
         //home
         //else if ($(e.currentTarget).has('.x-button .x-button-icon.home'))
         {
            setChildBrowserVisibility(true);
         }
         return false;
      };
      $('#checkexplorepageview .header .x-layout-box-item').on(pfEvent, _home_);
      var _preLoad_ = function(e)
      {
         var task, privKey;

         if (me.pendingBroadcast)
         {
            return;
         }

         me.playSoundFile(me.sound_files['clickSound']);
         //
         // Check for Mobile Number Validation
         //
         var message = $('#earnptspageview .x-docked-top .x-innerhtml'), image = $('#earnPtsImage');
         var db = Genesis.db.getLocalDB(), venue = viewport.getVenue(), venueId, position = viewport.getLastPosition();

         me.identifiers = null;

         //
         // Get GeoLocation and frequency markers
         //
         //if (!notUseGeolocation)
         {
            venueId = -1;
            privKey = Genesis.fn.privKey =
            {
               'venueId' : venueId,
               'venue' : Genesis.constants.debugVenuePrivKey
            };
            privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];
         }

         window.plugins.proximityID.preLoadSend(gblController, true, Ext.bind(function(notUseGeolocation)
         {
            me.broadcastLocalID(function(idx)
            {
               me.identifiers = idx;
               $("#earnptspageview").trigger('kickbak:broadcast');

               console.debug("Broadcast underway ...");
               position = viewport.getLastPosition();
               if (notUseGeolocation || position)
               {
                  var ajax, localID = me.identifiers['localID'], venue = viewport.getVenue(), venueId = null;
                  var params =
                  {
                  };
                  //
                  // With or without Geolocation support
                  //
                  if (!venueId)
                  {
                     //
                     // We cannot use short cut method unless we have either GeoLocation or VenueId
                     //
                     if (!position)
                     {
                        //
                        // Stop broadcasting now ...
                        //
                        if (me.identifiers)
                        {
                           me.identifiers['cancelFn']();
                        }
                        hideEarnPtsPage();

                        setNotificationVisibility(true, 'KICKBAK', me.cannotDetermineLocationMsg, "Dismiss", Ext.emptyFn);
                        return;
                     }

                     params = Ext.apply(params,
                     {
                        data : me.self.encryptFromParams(
                        {
                           'frequency' : localID
                        }, 'reward'),
                        'latitude' : position.coords.latitude,
                        'longitude' : position.coords.longitude
                     });
                  }
                  else
                  {
                     params = Ext.apply(params,
                     {
                        data : me.self.encryptFromParams(
                        {
                           'frequency' : localID
                        }, 'reward'),
                        venue_id : venueId
                     });
                  }

                  //
                  // Triggers PrizeCheck and MetaDataChange
                  // - subject CustomerReward also needs to be reset to ensure property processing of objects
                  //
                  console.debug("Transmitting Reward Points Request ...");

                  var _dismiss_ = function(msg)
                  {
                     //$('#earnPtsDismiss').off(pfEvent, _dismiss_);

                     me.playSoundFile(me.sound_files['clickSound']);
                     if (ajax)
                     {
                        ajax.abort();
                     }
                     if (me.identifiers)
                     {
                        me.identifiers['cancelFn']();
                     }
                     setLoadMask(false);

                     setNotificationVisibility(true, 'Rewards', ( typeof (msg) != 'string') ? me.transactionCancelledMsg : msg, "Dismiss", function()
                     {
                     });
                     return false;
                  };
                  $('#earnPtsDismiss').one(pfEvent, _dismiss_);

                  ajax = $.ajax(
                  {
                     type : 'POST',
                     url : serverHost + '/api/v1/purchase_rewards/earn',
                     // data to be added to query string:
                     data : params,
                     // type of data we are expecting in return:
                     dataType : 'json',
                     timeout : 30 * 1000,
                     context : document,
                     success : function(data)
                     {
                        if (!data)
                        {
                           if (me.identifiers)
                           {
                              console.debug("AJAX Error Response", me.identifiers);
                           }
                           $('#earnPtsDismiss').trigger(pfEvent, [me.networkErrorMsg]);
                           return;
                        }

                        //
                        // Stop broadcasting now ...
                        //
                        if (me.identifiers)
                        {
                           me.identifiers['cancelFn']();
                        }
                        setLoadMask(false);

                        console.debug("AJAX Response", data);
                        setNotificationVisibility(true, 'Rewards', "", "OK", function()
                        {
                        });
                     },
                     error : function(xhr, type)
                     {
                        if (me.identifiers)
                        {
                           console.debug("AJAX Error Response", me.identifiers);
                        }
                        $('#earnPtsDismiss').trigger(pfEvent, [me.networkErrorMsg]);
                     }
                  });
               }
            }, function()
            {
               hideEarnPtsPage();
               //setLoadMask(false);
            });
         }, me, [false]));
         return false;
      };
      $('#earnPtsProceed').on(pfEvent, _preLoad_);

      // =============================================================
      // Facebook Access Token Detect
      // =============================================================
      detectAccessToken(href);
   });
})();
