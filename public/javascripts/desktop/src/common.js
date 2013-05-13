//---------------------------------------------------------------------------------
// Array
//---------------------------------------------------------------------------------
Array.prototype.binarySearch = function(find, comparator)
{
   var low = 0, high = this.length - 1, i, comparison;
   while (low <= high)
   {
      i = Math.floor((low + high) / 2);
      comparison = comparator(this[i], find);
      if (comparison < 0)
      {
         low = i + 1;
         continue;
      };
      if (comparison > 0)
      {
         high = i - 1;
         continue;
      };
      return i;
   }
   return null;
};
//---------------------------------------------------------------------------------
// String
//---------------------------------------------------------------------------------
String.prototype.getFuncBody = function()
{
   var str = this.toString();
   str = str.replace(/[^{]+\{/, "");
   str = str.substring(0, str.length - 1);
   str = str.replace(/\n/gi, "");
   if (!str.match(/\(.*\)/gi))
      str += ")";
   return str;
}
String.prototype.strip = function()
{
   return this.replace(/^\s+/, '').replace(/\s+$/, '');
}
String.prototype.stripScripts = function()
{
   //    return this.replace(new
   // RegExp('\\bon[^=]*=[^>]*(?=>)|<\\s*(script|link|iframe|embed|object|applet|form|button|input)[^>]*[\\S\\s]*?<\\/\\1>|<[^>]*include[^>]*>',
   // 'ig'),"");
   return this.replace(new RegExp('<noscript[^>]*?>([\\S\\s]*?)<\/noscript>', 'img'), '').replace(new RegExp('<script[^>]*?>([\\S\\s]*?)<\/script>', 'img'), '').replace(new RegExp('<link[^>]*?>([\\S\\s]*?)<\/link>', 'img'), '').replace(new RegExp('<link[^>]*?>', 'img'), '').replace(new RegExp('<iframe[^>]*?>([\\S\\s]*?)<\/iframe>', 'img'), '').replace(new RegExp('<iframe[^>]*?>', 'img'), '').replace(new RegExp('<embed[^>]*?>([\\S\\s]*?)<\/embed>', 'img'), '').replace(new RegExp('<embed[^>]*?>', 'img'), '').replace(new RegExp('<object[^>]*?>([\\S\\s]*?)<\/object>', 'img'), '').replace(new RegExp('<object[^>]*?>', 'img'), '').replace(new RegExp('<applet[^>]*?>([\\S\\s]*?)<\/applet>', 'img'), '').replace(new RegExp('<applet[^>]*?>', 'img'), '').replace(new RegExp('<button[^>]*?>([\\S\\s]*?)<\/button>', 'img'), '').replace(new RegExp('<button[^>]*?>', 'img'), '').replace(new RegExp('<input[^>]*?>([\\S\\s]*?)<\/input>', 'img'), '').replace(new RegExp('<input[^>]*?>', 'img'), '').replace(new RegExp('<style[^>]*?>([\\S\\s]*?)<\/style>', 'img'), '').replace(new RegExp('<style[^>]*?>', 'img'), '')
}
String.prototype.stripTags = function()
{
   return this.replace(/<\/?[^>]+>/gi, '');
}
String.prototype.stripComments = function()
{
   return this.replace(/<!(?:--[\s\S]*?--\s*)?>\s*/g, '');
}
String.prototype.times = function(n)
{
   var s = '';
   for (var i = 0; i < n; i++)
   {
      s += this;
   }
   return s;
}
String.prototype.zp = function(n)
{
   return ('0'.times(n - this.length) + this);
}
String.prototype.capitalize = function()
{
   return this.replace(/\w+/g, function(a)
   {
      return a.charAt(0).toUpperCase() + a.substr(1);
   });
}
String.prototype.uncapitalize = function()
{
   return this.replace(/\w+/g, function(a)
   {
      return a.charAt(0).toLowerCase() + a.substr(1);
   });
}
String.prototype.trim = function(x)
{
   if (x == 'left')
      return this.replace(/^\s*/, '');
   if (x == 'right')
      return this.replace(/\s*$/, '');
   if (x == 'normalize')
      return this.replace(/\s{2,}/g, ' ').trim();

   return this.trim('left').trim('right');
}
/**
 * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
 * @param {String} value The string to encode
 * @return {String} The encoded text
 */
String.prototype.htmlEncode = (function()
{
   var entities =
   {
      '&' : '&amp;',
      '>' : '&gt;',
      '<' : '&lt;',
      '"' : '&quot;'
   }, keys = [], p, regex;

   for (p in entities)
   {
      keys.push(p);
   }
   regex = new RegExp('(' + keys.join('|') + ')', 'g');

   return function(value)
   {
      return (!value) ? value : String(value).replace(regex, function(match, capture)
      {
         return entities[capture];
      });
   };
})();

/**
 * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
 * @param {String} value The string to decode
 * @return {String} The decoded text
 */
String.prototype.htmlDecode = (function()
{
   var entities =
   {
      '&amp;' : '&',
      '&gt;' : '>',
      '&lt;' : '<',
      '&quot;' : '"'
   }, keys = [], p, regex;

   for (p in entities)
   {
      keys.push(p);
   }
   regex = new RegExp('(' + keys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');

   return function(value)
   {
      return (!value) ? value : String(value).replace(regex, function(match, capture)
      {
         if ( capture in entities)
         {
            return entities[capture];
         }
         else
         {
            return String.fromCharCode(parseInt(capture.substr(2), 10));
         }
      });
   };
})();

//---------------------------------------------------------------------------------
// Browser Detect
//---------------------------------------------------------------------------------
$.client =
{
   init : function()
   {
      this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
      this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
      this.OS = this.searchString(this.dataOS) || "an unknown OS";
   },
   searchString : function(data)
   {
      for (var i = 0; i < data.length; i++)
      {
         var dataString = data[i].string;
         var dataProp = data[i].prop;
         this.versionSearchString = data[i].versionSearch || data[i].identity;
         if (dataString)
         {
            if (dataString.indexOf(data[i].subString) != -1)
               return data[i].identity;
         }
         else if (dataProp)
            return data[i].identity;
      }
   },
   searchVersion : function(dataString)
   {
      var index = dataString.indexOf(this.versionSearchString);
      if (index == -1)
         return;
      return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
   },
   dataBrowser : [
   {
      string : navigator.userAgent,
      subString : "Chrome",
      identity : "Chrome"
   },
   {
      string : navigator.userAgent,
      subString : "OmniWeb",
      versionSearch : "OmniWeb/",
      identity : "OmniWeb"
   },
   {
      string : navigator.vendor,
      subString : "Apple",
      identity : "Safari",
      versionSearch : "Version"
   },
   {
      prop : window.opera,
      identity : "Opera",
      versionSearch : "Version"
   },
   {
      string : navigator.vendor,
      subString : "iCab",
      identity : "iCab"
   },
   {
      string : navigator.vendor,
      subString : "KDE",
      identity : "Konqueror"
   },
   {
      string : navigator.userAgent,
      subString : "Firefox",
      identity : "Firefox"
   },
   {
      string : navigator.vendor,
      subString : "Camino",
      identity : "Camino"
   },
   {
      // for newer Netscapes (6+)
      string : navigator.userAgent,
      subString : "Netscape",
      identity : "Netscape"
   },
   {
      string : navigator.userAgent,
      subString : "MSIE",
      identity : "Explorer",
      versionSearch : "MSIE"
   },
   {
      string : navigator.userAgent,
      subString : "Gecko",
      identity : "Mozilla",
      versionSearch : "rv"
   },
   {
      // for older Netscapes (4-)
      string : navigator.userAgent,
      subString : "Mozilla",
      identity : "Netscape",
      versionSearch : "Mozilla"
   }],
   dataOS : [
   {
      string : navigator.platform,
      subString : "Win",
      identity : "Windows"
   },
   {
      string : navigator.platform,
      subString : "Mac",
      identity : "Mac"
   },
   {
      string : navigator.userAgent,
      subString : "iPhone",
      identity : "iPhone/iPod"
   },
   {
      string : navigator.platform,
      subString : "Linux",
      identity : "Linux"
   }]

};
$.client.init();

//---------------------------------------------------------------------------------
// Standard Library Functions
//---------------------------------------------------------------------------------
function removeUnit(measurement, defaultValue)
{
   switch (typeof(measurement))
   {
      case 'number' :
         return measurement;
         break;
      case 'string' :
         return parseInt(measurement.slice(0, measurement.length - 2), (defaultValue) ? defaultValue : 0);
         break;
      default :
         return defaultValue;
         break;
   }
}

function addUnit(measurement, defaultValue)
{
   switch (typeof(measurement))
   {
      case 'string' :
         return ((Genesis.isEmpty(measurement)) ? (((defaultValue) ? defaultValue + 'px' : '')) : measurement + 'px');
         break;
      case 'number' :
         return measurement + 'px';
         break;
      default :
         return ((defaultValue) ? defaultValue + 'px' : '');
         break;
   }
}

function convertString(v, rec, limit)
{
   if (!v)
      return "";

   if (v.length > limit)
      return v.substring(0, limit) + ' ...';
   return v;
}

//---------------------------------------------------------------------------------
// JustForMyFriends Library
//---------------------------------------------------------------------------------
Genesis =
{
   mouseWheelEvt : 'DOMMouseScroll mousewheel',
   currFbId : "0",
   perms : 'email,user_birthday,publish_stream,read_friendlists,publish_actions',
   fbAppId : '197968780267830',

   alertWarningClose : '.alert.alert-warning .close',
   alertErrorClose : '.alert.alert-error .close',

   initDone : false,
   errMsg : null,
   warningMsg : null,
   popupDialog : null,
   _init : function()
   {
      if (!this.initDone)
      {
         this.popupDialog = $("#popupDialog");
         this.popupDialog.modal(
         {
            keyboard : true,
            backdrop : 'static'
         });
      }
      this.initDone = true;
   },
   isEmpty : function(v)
   {
      return (!v || (v == undefined));
   },
   // **************************************************************************
   // Misc Functions
   // **************************************************************************
   _showMsg : function(obj, msg, closeBtn, cb, rawHtml)
   {
      closeBtn.bind("click", function()
      {
         closeBtn.parent().switchClass('in', 'hide');
         if (cb)
            cb();
      });
      var htmlMsg = (rawHtml) ? msg : '<h5>' + msg + '</h5>';
      var msgNode = Genesis[obj].find("*:nth-child(2)");
      msgNode[0] ? msgNode.html(htmlMsg) : Genesis[obj].append(htmlMsg);
      Genesis[obj].switchClass('hide', 'in');
      location.href = "#top";
   },
   showErrMsg : function(msg, cb, rawHtml)
   {
      this._showMsg('errMsg', msg, $(this.alertErrorClose), cb, rawHtml);
   },
   showWarningMsg : function(msg, cb, rawHtml)
   {
      this._showMsg('warningMsg', msg, $(this.alertWarningClose), cb, rawHtml);
   },
   // **************************************************************************
   // Dynamic Popup
   // **************************************************************************
   _popupCommon : function(title, body, href, yesMsg, yesFn, noMsg, noFn, cb, cxt)
   {
      if (!this.popupDialog.data().modal.isShown)
      {
         var primBtn = this.popupDialog.find(".modal-footer .primary");
         var secBtn = this.popupDialog.find(".modal-footer .secondary");
         var popupDialogTitle = this.popupDialog.find(".modal-header h3").html(title);
         var popupDialogContent = this.popupDialog.find(".modal-body").html(body);
         primBtn.attr("href", href);
         if (yesMsg)
         {
            primBtn.text(yesMsg);
            primBtn.unbind("click");
            primBtn.bind("click", function()
            {
               !yesFn || yesFn.call(cxt || this);
            });
         }
         else
         {
            primBtn.text('OK');
            primBtn.unbind("click");
            primBtn.bind("click", yesFn ||
            function()
            {
               Genesis.popupDialog.modal('hide');
            });

         }
         if (noMsg)
         {
            secBtn.text(noMsg);
            secBtn.css('display', '');
            secBtn.unbind("click");
            secBtn.bind("click", noFn ||
            function()
            {
               !noFn || noFn.call(cxt || this);
               Genesis.popupDialog.modal('hide');
            });

         }
         else
         {
            secBtn.text('Cancel');
            secBtn.css('display', 'none');
         }
         this.popupDialog.modal('show');
         if (cb)
         {
            cb.call(cxt || this);
         }
      }
      // Put this in the animation queue
      else
      {
         this.popupDialog.queue($.proxy(function()
         {
            this._popupCommon(title, body, href, yesMsg, yesFn, noMsg, noFn, cb, cxt);
         }, this));
      }
   },
   ajax : function(relPath, url, type, data, dataType, successCallBack, button, reenableButton, failCallBack)
   {
      var path = (relPath) ? location.protocol + '//' + location.host + location.pathname : '';
      if (button)
      {
         button.attr("disabled", true);
         button.addClass('disabled');
      }
      $.ajax(
      {
         url : path + url,
         type : type,
         data : Genesis.isEmpty(data) ? undefined : data,
         dataType : dataType,
         //processData: false,
         //contentType: "application/json",
         success : function(response)
         {
            if (response && !Genesis.isEmpty(response.session_expired))
            {
               setTimeout(function()
               {
                  Genesis._popupCommon(response.msg[0], '<p>' + response.msg[1] + '</p>', 'javascript:window.location.reload();');
               }, 0);
               return;
            }
            if (!Genesis.isEmpty(successCallBack) && response && response.success)
            {
               successCallBack(response);
            }
            if (!Genesis.isEmpty(failCallBack) && (!response || !response.success))
            {
               failCallBack(response);
            }
            if (button && (reenableButton || !response || !response.success))
            {
               button.attr("disabled", false);
               button.removeClass('disabled');
            }
            if (response)
            {
               var msg = response.msg;
               if (msg)
               {
                  Genesis._popupCommon(msg[0], '<p>' + msg[1] + '</p>', "#");
               }
            }
         }
      });
   }
};

// **************************************************************************
// Login Scripts
// **************************************************************************

// **************************************************************************
// On Page Ready
// **************************************************************************
$(document).ready($(function()
{
   var genesis = Genesis;

   // --------------------------------------------------------------------------------
   // Init System Time Clock
   // --------------------------------------------------------------------------------
   systemTime = ($('#systemTime').text() != '') ? $('#systemTime').text() : clientTime.getTime();
   localOffset = -clientTime.getTimezoneOffset() * (60 * 1000);
   clientTime = clientTime.getTime();

   genesis._init();
   genesis.warningMsg = $(".alert.alert-warning");
   genesis.errMsg = $(".alert.alert-error");

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
      for ( i = offsets.length; i--; )
      {
         if ((targets[i].match(/^#/) || (targets[i].match(location.pathname))) && (activeTarget != targets[i]) && (scrollTop >= offsets[i]) && (!offsets[i + 1] || (scrollTop <= offsets[i + 1])))
         {
            if ((targets[i] != '#'))
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
   // Page Initialization Code
   // --------------------------------------------------------------------------------
   //
   // Get Rid of autofill yellow highlight
   //
   if (navigator.userAgent.toLowerCase().indexOf("webkit") >= 0)
   {
      var _interval = window.setInterval(function()
      {
         var autofills = $('input:-webkit-autofill');
         if (autofills.length > 0)
         {
            window.clearInterval(_interval);
            // stop polling
            autofills.each(function()
            {
               var clone = $(this).clone(true, true);
               $(this).after(clone).remove();
            });
         }
      }, 20);
   }

   /*
    $('#page-background').height($('body').height());
    $('div.main').resize(function()
    {
    $('#page-background').height($('body').height());
    });
    $('body').resize(function()
    {
    $('#page-background').height($('body').height());
    });
    */
   if (!$('navbar navbar-fixed-bottom')[0])
   {
      //$('#page-background').height('auto');
      //$('#page-background')[0].style['bottom'] = 0;
      if ($('div main')[0])
      {
         $('div.main')[0].style['border-bottom'] = 'none';
      }
      /*
       $(window).resize(function()
       {
       $('#page-background').height('auto');
       });
       */
   }
   // --------------------------------------------------------------------------------
   // Popup Initialization Code
   // --------------------------------------------------------------------------------
   var popUp = $('#modalPopup');
   var element;
   popUp.modal(
   {
      backdrop : true,
      keyboard : true,
      show : false
   });

   $("#modalPopup a.close").click(function(e)
   {
      popUp.toggle(false);
   });

   $("#modalPopup a.modal-cancel").click(function(e)
   {
      popUp.toggle(false);
   });

   $("#modalPopup a.modal-ok").click(function(e)
   {
      popUp.toggle(false);

      // actually handle the element. This has to happen here since it isn't an *actual* modal dialog.
      // It uses the element to continue proper execution.
      $.rails.handleLink(element);

      return false;
   });

   if ($.rails)
   {
      $.rails.confirm = function(message, elem)
      {
         $("#modalPopup .modal-body p").html(message);
         popUp.modal('show');
         element = elem;
      }
      $.rails.allowAction = function(element)
      {
         var message = element.data('confirm'), answer = false, callback;
         if (!message)
         {
            return true;
         }

         if ($.rails.fire(element, 'confirm'))
         {
            // le extension.
            answer = $.rails.confirm(message, element);
            callback = $.rails.fire(element, 'confirm:complete', [answer]);
         }
         return answer && callback;
      };
      $.rails.handleLink = function(link)
      {
         if (link.data('remote') !== undefined)
         {
            $.rails.handleRemote(link);
         }
         else if (link.data('method'))
         {
            $.rails.handleMethod(link);
         }
         return false;
      };
   }
   if ($.client.browser == "Explorer")
   {
      $('input, textarea').placeholder();
   }
}));
