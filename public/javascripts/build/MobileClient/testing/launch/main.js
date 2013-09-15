var mainAppInit = false;

var setChildBrowserVisibility = function(visible, hash)
{
   var db = Genesis.db.getLocalDB(true);
   if (visible)
   {
      //
      // Initiliazation
      //
      if (!mainAppInit)
      {
         if (window.cordova)
         {
            var i = 0x000, callback = function(success, flag)
            {
               if (success && ((i |= flag) == 0x111))
               {
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
                     profiles : ['Iphone'],
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
                        viewport.redirectTo('');
                        console.debug("Launched App");
                     },
                     appFolder : _appPath,
                     name : 'Genesis'
                  });
               }
            };
            Genesis.fn.checkloadjscssfile('../lib/sencha-touch-all.js', "js", function(success)
            {
               if (success)
               {
                  Genesis.fn.checkloadjscssfile('../core.js', "js", Ext.bind(callback, null, [0x001], true));
                  Genesis.fn.checkloadjscssfile('../app/profile/Iphone.js', "js", Ext.bind(callback, null, [0x010], true));
                  Genesis.fn.checkloadjscssfile('../client-all.js', "js", Ext.bind(callback, null, [0x100], true));
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
            $(".iframe")[0].src = '../index.html';
            $(".iframe").removeClass('x-item-hidden');
         }
      }
      //
      // Back to Main Page
      //
      else if (db['auth_code'])
      {
         if (window.cordova)
         {
            $("#checkexplorepageview").addClass('x-item-hidden');
            $("#ext-viewport").removeClass('x-item-hidden');
            _application.getController('client' + '.Viewport').redirectTo('main');
         }
         else
         {
            $(".iframe")[0].contentWindow._application.getController('client' + '.Viewport').redirectTo('main');
            $(".iframe").removeClass('x-item-hidden');
         }
      }
      //
      // Goto Login Page
      //
      else
      {
         if (window.cordova)
         {
            $("#checkexplorepageview").addClass('x-item-hidden');
            $("#ext-viewport").removeClass('x-item-hidden');
            _application.getController('client' + '.Viewport').redirectTo('login');
         }
         else
         {
            $(".iframe")[0].contentWindow._application.getController('client' + '.Viewport').redirectTo('login');
            $(".iframe").removeClass('x-item-hidden');
         }
      }
   }
   else
   {
      $("#earnPtsLoad span.x-button-label").text((db['auth_code']) ? 'Earn Points' : 'Sign In / Register');
      //$(".iframe").addClass('x-item-hidden');
      window.location.hash = '#' + hash;
      if (window.cordova)
      {
         $("#checkexplorepageview").removeClass('x-item-hidden');
         $("#ext-viewport").addClass('x-item-hidden');
      }
   }
};

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
      //$('iframe')[0].style.height = //
      $('#checkexplorepageview')[0].style.height = //
      $('#loadingMask')[0].style.height = //
      $('#notification')[0].style.height = //
      $('#mask')[0].style.height = //
      $('#earnptspageview')[0].style.height = document.body.style.height;
      //$('iframe')[0].style.width = document.body.clientWidth + 'px';
      $('body')[(window.orientation == 0) ? 'addClass' : 'removeClass']('x-portrait');
      $('body')[(window.orientation == 0) ? 'removeClass' : 'addClass']('x-landscape');
   };
   var hideEarnPtsPage = function(e)
   {
      $("#earnptspageview").animate(
      {
         top : (-1 * Math.max(window.screen.height, window.screen.width)) + 'px',
         height : 0 + 'px'
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
      var exploreVenue = function(e)
      {
         var target = e.currentTarget, ma_struct = parseInt(target.attributes.getNamedItem('data')['value']);
         console.debug("Target ID : ", ma_struct);
         Genesis.db.setLocalDBAttrib('ma_struct', ma_struct);
      };
      $('.media').off().tap(exploreVenue).swipeLeft(exploreVenue).swipeRight(exploreVenue);
   };
   var appLaunchCallbackFn = function()
   {
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
   $(document).ready(function()
   {
      // =============================================================
      // Custom Events
      // =============================================================
      $.Event('ajaxBeforeSend');
      $.Event('locationupdate');

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

            Genesis.fn.checkloadjscssfile('../lib/libmp3lame.min.js', "js", Ext.bind(callback, null, [0x01], true));
            Genesis.fn.checkloadjscssfile('../worker/encoder.min.js', "js", function(success)
            {
               if (success)
               {
                  _codec = new Worker('../worker/encoder.min.js');
               }
               callback(success, 0x10);
            });
         }
         else
         {
            _codec = new Worker('worker/encoder.min.js');
            appLaunchCallbackFn(true, 0x100);
            console.debug("Enable MP3 Encoder");
         }
      }
      else
      {
         appLaunchCallbackFn(true, 0x100);
         console.debug("Enable WAV/WebAudio Encoder");
      }

      //
      // Sender/Receiver Volume Settings
      // ===============================
      // - For Mobile Phones
      //
      // Client Device always transmits
      //
      var s_vol_ratio, r_vol_ratio, c = Genesis.constants;

      if ($.os.ios)
      //if (Ext.os.is('iOS') || Ext.os.is('Desktop'))
      {
         //(tx)
         s_vol_ratio = 1.0;
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
         s_vol_ratio = 0.5;
         //Default Volume laying flat on a surface (tx)
         c.s_vol = 50;

         //(rx)
         r_vol_ratio = 0.5;
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

      // =============================================================
      // Ajax Calls Customizations
      // =============================================================
      $(document).on('ajaxBeforeSend', function(e, xhr, options)
      {
         var db = Genesis.db.getLocalDB();

         // This gets fired for every Ajax request performed on the page.
         // The xhr object and $.ajax() options are available for editing.
         // Return false to cancel this request.
         options.headers = options.headers ||
         {
         };
         options.headers = Ext.apply(options.headers =
         {
            'Accept' : '*/*'
         });
         if (db['csrf_code'] && (options.type == 'POST'))
         {
            options.headers = Ext.apply(options.headers,
            {
               'X-CSRF-Token' : db['csrf_code']
            });
         }
      });

      // =============================================================
      // System Initializations
      // =============================================================
      orientationChange();

      if ($.os.ios)
      {
         $('body').addClass('x-ios');
      }
      else if ($.os.blackberry || $.os.bb10 || $.os.rimtabletos)
      {
         $('body').addClass('x-blackberry');
      }
      else
      //else if ($.os.android)
      {
         $('body').addClass('x-android');
      }
      $('body').addClass(($.os.phone) ? 'x-phone' : 'x-tablet');

      $('#earnPtsCancel').tap(hideEarnPtsPage);
      $('#earnPtsDismiss').tap(hideEarnPtsPage);
      $('#earnptspageview')[0].style.top = (-1 * Math.max(window.screen.height, window.screen.width)) + 'px';

      // =============================================================
      // Venue Browse/Scroll
      // =============================================================
      iscroll = new IScroll('#checkexplorepageview .body',
      {
         scrollbars : true,
         mouseWheel : true,
         interactiveScrollbars : false
      });
      var i = -1, origEventHandler = iscroll.handleEvent, iscrollInfinite = $('#checkexplorepageview .body');
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
            console.debug('At the end of the page. Loading more!');
            if ((++i < 19) && (i > 0))
            {
               $('.body ul').append(
               // @formatter:off
               '<li class="media" data="'+ Ext.encode({venueId : i, customerId : i}) +'">'+
                  '<a class="pull-left" href="#"> <img class="media-object" data-src="holder.js/64x64" alt="64x64"> </a>'+
                  '<div class="media-body">'+
                     '<h4 class="media-heading">Nested media heading</h4>'+
                     'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis.'+
                  '</div>'+
               '</li>'
               // @formatter:on
               );
               iscroll.refresh();
               refreshCheckExploreVenues();
               callback(true);

               return;
            }

            callback((i == 0) ? true : false);
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
      iscrollInfinite.tap(function(e)
      {
         //
         // Trigger when the list is empty
         //
         if ($('.media').length == 0)
         {
            $('.body ul').append(
            // @formatter:off
               '<li class="media" data="'+ (++i) +'">'+
                  '<a class="pull-left" href="#"> <img class="media-object" data-src="holder.js/64x64" alt="64x64"> </a>'+
                  '<div class="media-body">'+
                     '<h4 class="media-heading">Nested media heading</h4>'+
                     'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis.'+
                  '</div>'+
               '</li>'
               // @formatter:on
            );
            iscroll.refresh();
            refreshCheckExploreVenues();
         }
      });

      // =============================================================
      // WelcomePage Actions
      // =============================================================
      var db = Genesis.db.getLocalDB();
      $("#earnPtsLoad span.x-button-label").text((db['auth_code']) ? 'Earn Points' : 'Sign In / Register');
      $("#earnPtsLoad").tap(function()
      {
         db = Genesis.db.getLocalDB();
         if (db['auth_code'])
         {
            $('#earnPtsProceed').trigger('tap');
         }
         else
         {
            setChildBrowserVisibility(true);
         }
      });

      // =============================================================
      // ExplorePage Actions
      // =============================================================
      $('.x-button .x-button-icon.home').tap(function()
      {
         setChildBrowserVisibility(true);
      });
      $('.x-button .x-button-icon.refresh').tap(function()
      {
         iscroll.refresh();
         refreshCheckExploreVenues();
         $('#checkexplorepageview .body').infiniteScroll('reset');
      });
      $('#earnPtsProceed').tap(function(e)
      {
         var me = gblController, task, privKey, viewport = me.getViewPortCntlr();

         if (me.pendingBroadcast)
         {
            return;
         }

         //
         // Check for Mobile Number Validation
         //
         var message = $('#earnptspageview .x-docked-top .x-innerhtml'), image = $('#earnPtsImage');

         /*
          if (!validateMobileNumber())
          {
          return;
          }
          */

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

                  $('#earnPtsDismiss').one('tap', dismiss = function(msg)
                  {
                     if (ajax)
                     {
                        ajax.abort();
                     }
                     if (me.identifiers)
                     {
                        me.identifiers['cancelFn']();
                     }
                     Ext.Viewport.setMasked(null);

                     setNotificationVisibility(true, 'Rewards', ( typeof (msg) != 'string') ? me.transactionCancelledMsg : msg, "Dismiss", function()
                     {
                     });
                  });

                  ajax = $.ajax(
                  {
                     type : 'POST',
                     url : '/api/v1/purchase_rewards/earn',
                     // data to be added to query string:
                     data : params,
                     // type of data we are expecting in return:
                     dataType : 'json',
                     timeout : 30 * 1000,
                     context : document,
                     success : function(data)
                     {
                        //
                        // Stop broadcasting now ...
                        //
                        if (me.identifiers)
                        {
                           me.identifiers['cancelFn']();
                        }
                        Ext.Viewport.setMasked(null);

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
                        $('#earnPtsDismiss').trigger('tap', [me.networkErrorMsg]);
                     }
                  });
               }
            }, function()
            {
               hideEarnPtsPage();
               //Ext.Viewport.setMasked(null);
            });
         }, me, [false]));
      });
   });
})();
