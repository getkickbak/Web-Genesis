// **************************************************************************
// System Functions
// **************************************************************************
if ( typeof (Genesis) == 'undefined')
{
   Genesis =
   {
   };
}

window.plugins = window.plugins ||
{
};

// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  �yvind Sean Kinsey http://kinsey.no/blog (2010)
//
// Information and discussions
// http://jspoker.pokersource.info/skin/test-printstacktrace.html
// http://eriwen.com/javascript/js-stack-trace/
// http://eriwen.com/javascript/stacktrace-update/
// http://pastie.org/253058
// http://browsershots.org/http://jspoker.pokersource.info/skin/test-printstacktrace.html
//

//
// guessFunctionNameFromLines comes from firebug
//
// Software License Agreement (BSD License)
//
// Copyright (c) 2007, Parakey Inc.
// All rights reserved.
//
// Redistribution and use of this software in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above
//   copyright notice, this list of conditions and the
//   following disclaimer.
//
// * Redistributions in binary form must reproduce the above
//   copyright notice, this list of conditions and the
//   following disclaimer in the documentation and/or other
//   materials provided with the distribution.
//
// * Neither the name of Parakey Inc. nor the names of its
//   contributors may be used to endorse or promote products
//   derived from this software without specific prior
//   written permission of Parakey Inc.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
// IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
// OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/**
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 */
function printStackTrace(options)
{
   var ex = (options && options.e) ? options.e : null;
   var guess = options ? !!options.guess : true;

   var p = new printStackTrace.implementation();
   var result = p.run(ex);
   return (guess) ? p.guessFunctions(result) : result;
};
printStackTrace.implementation = function()
{
};
printStackTrace.implementation.prototype =
{
   run : function(ex)
   {
      // Use either the stored mode, or resolve it
      var mode = this._mode || this.mode();
      if (mode === 'other')
      {
         return this.other(arguments.callee).join('\n');
      }
      else
      {
         ex = ex || (function()
         {
            try
            {
               (0)();
            }
            catch (e)
            {
               return e;
            }
         })();
         var stack = (this[mode](ex));
         return ( typeof (stack) == 'object') ? stack.join('\n') : stack;
      }
   },
   mode : function()
   {
      try
      {
         (0)();
      }
      catch (e)
      {
         if (e.arguments)
         {
            return (this._mode = 'chrome');
         }
         else if (e.stack)
         {
            return (this._mode = 'firefox');
         }
         else if (window.opera && !('stacktrace' in e))
         {
            //Opera 9-
            return (this._mode = 'opera');
         }
      }
      return (this._mode = 'other');
   },
   chrome : function(e)
   {
      if (e.stack)
      {
         return e.stack.replace(/^.*?\n/, '').replace(/^.*?\n/, '').replace(/^.*?\n/, '').replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').split('\n');
      }
      else
      {
         return '';
      }
   },
   firefox : function(e)
   {
      if (e.stack)
      {
         return e.stack.replace(/^.*?\n/, '').replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
      }
      else
      {
         return '';
      }
   },
   // Opera 7.x and 8.x only!
   opera : function(e)
   {
      if (e.message)
      {
         var lines = e.message.split('\n'), ANON = '{anonymous}', lineRE = /Line\s+(\d+).*?script\s+(http\S+)(?:.*?in\s+function\s+(\S+))?/i, i, j, len;

         for ( i = 4, j = 0, len = lines.length; i < len; i += 2)
         {
            if (lineRE.test(lines[i]))
            {
               lines[j++] = (RegExp.$3 ? RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 : ANON + '()@' + RegExp.$2 + ':' + RegExp.$1) + ' -- ' + lines[i + 1].replace(/^\s+/, '');
            }
         }

         lines.splice(j, lines.length - j);
         return lines;
      }
      else
      {
         return '';
      }
   },
   // Safari, Opera 9+, IE, and others
   other : function(curr)
   {
      var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], j = 0, fn, args;

      var maxStackSize = 10;
      while (curr && stack.length < maxStackSize)
      {
         fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
         args = Array.prototype.slice.call(curr['arguments']);
         stack[j++] = fn + '(' + printStackTrace.implementation.prototype.stringifyArguments(args) + ')';

         //Opera bug: if curr.caller does not exist, Opera returns curr (WTF)
         if (curr === curr.caller && window.opera)
         {
            //TODO: check for same arguments if possible
            break;
         }
         curr = curr.caller;
      }
      return stack;
   },
   /**
    * @return given arguments array as a String, subsituting type names for non-string types.
    */
   stringifyArguments : function(args)
   {
      for (var i = 0; i < args.length; ++i)
      {
         var arg = args[i];
         if (arg === undefined)
         {
            args[i] = 'undefined';
         }
         else if (arg === null)
         {
            args[i] = 'null';
         }
         else if (arg.constructor)
         {
            if (arg.constructor === Array)
            {
               if (arg.length < 3)
               {
                  args[i] = '[' + this.stringifyArguments(arg) + ']';
               }
               else
               {
                  args[i] = '[' + this.stringifyArguments(Array.prototype.slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(Array.prototype.slice.call(arg, -1)) + ']';
               }
            }
            else if (arg.constructor === Object)
            {
               args[i] = '#object';
            }
            else if (arg.constructor === Function)
            {
               args[i] = '#function';
            }
            else if (arg.constructor === String)
            {
               args[i] = '"' + arg + '"';
            }
         }
      }
      return (( typeof (args) == 'object') ? args.join(',') : args);
   },
   sourceCache :
   {
   },
   /**
    * @return the text from a given URL.
    */
   ajax : function(url)
   {
      var req = this.createXMLHTTPObject();
      if (!req)
      {
         return;
      }
      req.open('GET', url, false);
      req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
      req.send('');
      return req.responseText;
   },
   createXMLHTTPObject : function()
   {
      // Try XHR methods in order and store XHR factory
      var xmlhttp, XMLHttpFactories = [
      function()
      {
         return new XMLHttpRequest();
      },
      function()
      {
         return new ActiveXObject('Msxml2.XMLHTTP');
      },
      function()
      {
         return new ActiveXObject('Msxml3.XMLHTTP');
      },
      function()
      {
         return new ActiveXObject('Microsoft.XMLHTTP');
      }];
      for (var i = 0; i < XMLHttpFactories.length; i++)
      {
         try
         {
            xmlhttp = XMLHttpFactories[i]();
            // Use memoization to cache the factory
            this.createXMLHTTPObject = XMLHttpFactories[i];
            return xmlhttp;
         }
         catch (e)
         {
         }
      }
   },
   getSource : function(url)
   {
      if (!( url in this.sourceCache))
      {
         this.sourceCache[url] = this.ajax(url).split('\n');
      }
      return this.sourceCache[url];
   },
   guessFunctions : function(stack)
   {
      if (stack.length)
      {
         for (var i = 0; i < stack.length; ++i)
         {
            var reStack = /{anonymous}\(.*\)@(\w+:\/\/([-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;
            var frame = stack[i], m = reStack.exec(frame);
            if (m)
            {
               var file = m[1], lineno = m[4];
               //m[7] is character position in Chrome
               if (file && lineno)
               {
                  var functionName = this.guessFunctionName(file, lineno);
                  stack[i] = frame.replace('{anonymous}', functionName);
               }
            }
         }
         return ( typeof (stack) == 'object') ? stack.join('\n') : stack;
      }
      return stack;
   },
   guessFunctionName : function(url, lineNo)
   {
      try
      {
         return this.guessFunctionNameFromLines(lineNo, this.getSource(url));
      }
      catch (e)
      {
         return 'getSource failed with url: ' + url + ', exception: ' + e.toString();
      }
   },
   guessFunctionNameFromLines : function(lineNo, source)
   {
      var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/;
      var reGuessFunction = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;
      // Walk backwards from the first line in the function until we find the line which
      // matches the pattern above, which is the function definition
      var line = "", maxLines = 10;
      for (var i = 0; i < maxLines; ++i)
      {
         line = source[lineNo - i] + line;
         if (line !== undefined)
         {
            var m = reGuessFunction.exec(line);
            if (m && m[1])
            {
               return m[1];
            }
            else
            {
               m = reFunctionArgNames.exec(line);
               if (m && m[1])
               {
                  return m[1];
               }
            }
         }
      }
      return '(?)';
   }
};

/**
 *
 *  URL encode / decode
 *  http://www.webtoolkit.info/
 *
 **/
var Url =
{
   // public method for url encoding
   encode : function(string)
   {
      return escape(this._utf8_encode(string));
   },
   // public method for url decoding
   decode : function(string)
   {
      return this._utf8_decode(unescape(string));
   },
   // private method for UTF-8 encoding
   _utf8_encode : function(string)
   {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++)
      {

         var c = string.charCodeAt(n);

         if (c < 128)
         {
            utftext += String.fromCharCode(c);
         }
         else if ((c > 127) && (c < 2048))
         {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
         }
         else
         {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
         }

      }

      return utftext;
   },
   // private method for UTF-8 decoding
   _utf8_decode : function(utftext)
   {
      var string = "";
      var i = 0;
      var c = 0, c1 = 0, c2 = 0, c3 = 0;

      while (i < utftext.length)
      {

         c = utftext.charCodeAt(i);

         if (c < 128)
         {
            string += String.fromCharCode(c);
            i++;
         }
         else if ((c > 191) && (c < 224))
         {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
         }
         else
         {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
         }

      }

      return string;
   }
};

(function()
{
   __initLibExtensions__ = function()
   {
      //---------------------------------------------------------------------------------
      // Array
      //---------------------------------------------------------------------------------
      Ext.merge(Array.prototype,
      {
         binarySearch : function(find, comparator)
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
         }
      });

      //---------------------------------------------------------------------------------
      // String
      //---------------------------------------------------------------------------------
      Ext.merge(String.prototype,
      {
         hashCode : function()
         {
            for (var ret = 0, i = 0, len = this.length; i < len; i++)
            {
               ret = (31 * ret + this.charCodeAt(i)) << 0;
            }
            return ret;
         },
         getFuncBody : function()
         {
            var str = this.toString();
            str = str.replace(/[^{]+\{/, "");
            str = str.substring(0, str.length - 1);
            str = str.replace(/\n/gi, "");
            if (!str.match(/\(.*\)/gi))
               str += ")";
            return str;
         },
         strip : function()
         {
            return this.replace(/^\s+/, '').replace(/\s+$/, '');
         },
         stripScripts : function()
         {
            //    return this.replace(new
            // RegExp('\\bon[^=]*=[^>]*(?=>)|<\\s*(script|link|iframe|embed|object|applet|form|button|input)[^>]*[\\S\\s]*?<\\/\\1>|<[^>]*include[^>]*>',
            // 'ig'),"");
            return this.replace(new RegExp('<noscript[^>]*?>([\\S\\s]*?)<\/noscript>', 'img'), '').replace(new RegExp('<script[^>]*?>([\\S\\s]*?)<\/script>', 'img'), '').replace(new RegExp('<link[^>]*?>([\\S\\s]*?)<\/link>', 'img'), '').replace(new RegExp('<link[^>]*?>', 'img'), '').replace(new RegExp('<iframe[^>]*?>([\\S\\s]*?)<\/iframe>', 'img'), '').replace(new RegExp('<iframe[^>]*?>', 'img'), '').replace(new RegExp('<embed[^>]*?>([\\S\\s]*?)<\/embed>', 'img'), '').replace(new RegExp('<embed[^>]*?>', 'img'), '').replace(new RegExp('<object[^>]*?>([\\S\\s]*?)<\/object>', 'img'), '').replace(new RegExp('<object[^>]*?>', 'img'), '').replace(new RegExp('<applet[^>]*?>([\\S\\s]*?)<\/applet>', 'img'), '').replace(new RegExp('<applet[^>]*?>', 'img'), '').replace(new RegExp('<button[^>]*?>([\\S\\s]*?)<\/button>', 'img'), '').replace(new RegExp('<button[^>]*?>', 'img'), '').replace(new RegExp('<input[^>]*?>([\\S\\s]*?)<\/input>', 'img'), '').replace(new RegExp('<input[^>]*?>', 'img'), '').replace(new RegExp('<style[^>]*?>([\\S\\s]*?)<\/style>', 'img'), '').replace(new RegExp('<style[^>]*?>', 'img'), '')
         },
         stripTags : function()
         {
            return this.replace(/<\/?[^>]+>/gi, '');
         },
         stripComments : function()
         {
            return this.replace(/<!(?:--[\s\S]*?--\s*)?>\s*/g, '');
         },
         times : function(n)
         {
            var s = '', i;
            for ( i = 0; i < n; i++)
            {
               s += this;
            }
            return s;
         },
         zp : function(n)
         {
            return ('0'.times(n - this.length) + this);
         },
         capitalize : function()
         {
            return this.replace(/\w+/g, function(a)
            {
               return a.charAt(0).toUpperCase() + a.substr(1);
            });
         },
         uncapitalize : function()
         {
            return this.replace(/\w+/g, function(a)
            {
               return a.charAt(0).toLowerCase() + a.substr(1);
            });
         },
         trim : function(x)
         {
            if (x == 'left')
               return this.replace(/^\s*/, '');
            if (x == 'right')
               return this.replace(/\s*$/, '');
            if (x == 'normalize')
               return this.replace(/\s{2,}/g, ' ').trim();

            return this.trim('left').trim('right');
         },
         trunc : function(length)
         {
            return (this.length > (length - 4)) ? this.substring(0, length - 4) + ' ...' : this;
         },
         /**
          * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
          * @param {String} value The string to encode
          * @return {String} The encoded text
          */
         htmlEncode : (function()
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
         })(),
         /**
          * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
          * @param {String} value The string to decode
          * @return {String} The decoded text
          */
         htmlDecode : (function()
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
            }
         })()
      });

      // **************************************************************************
      // Math
      // **************************************************************************
      Ext.merge(Math,
      {
         radians : function(degrees)
         {
            return (degrees * Math.PI / 180);
         }
      });
   }
})();

Genesis.constants =
{
   isNfcEnabled : false,
   userName : 'Eric Chan',
   appMimeType : 'application/kickbak',
   clientVersion : '2.2.0',
   serverVersion : '2.2.0',
   themeName : 'v1',
   _thumbnailAttribPrefix : '',
   _iconPath : '',
   _iconSize : 0,
   fontSize : 0,
   defaultIconSize : function()
   {
      return this._iconSize;
   },
   site : (location.origin.match(/^file/) ? "www" : location.host.split(".")[0]) + '.getkickbak.com',
   photoSite : 'https://s3.amazonaws.com/files.getkickbak.com',
   resourceSite : "resources/" + ((_build == "MobileWeb") ? "" : "themes/"),
   debugVPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
   debugRPrivKey : 'oSG8JclEHvRy5ngkb6ehWbb6TTRFXd8t',
   debugVenuePrivKey : 'Debug Venue',
   privKey : null,
   //
   // Constants for Proximity Identifier
   //
   lastLocalID : null,
   numSamples : -1,
   conseqMissThreshold : -1,
   sigOverlapRatio : -1,
   //Default Volume laying flat on a surface (tx)
   s_vol : -1,
   r_vol : -1,
   //
   device : null,
   minDistance : 0.3 * 1000,
   //minDistance : 100000 * 1000,
   createAccountMsg : 'Create user account using Facebook Profile information',
   spinnerDom : '<div class="x-loading-spinner-outer"><div class="x-loading-spinner"><span class="x-loading-top"></span><span class="x-loading-right"></span><span class="x-loading-bottom"></span><span class="x-loading-left"></span></div></div>',
   debugMode : function()
   {
      return debugMode;
   },
   serverHost : function()
   {
      return serverHost;
   },
   init : function()
   {
      var me = this, ratio = 1.14;

      __initLibExtensions__();

      if (merchantMode)
      {
         ratio = (Ext.os.is('Tablet') ? 1.5 * ratio : 1.0 * ratio);
      }
      me.fontSize = Math.floor(((16 * ratio * Math.min(1.0, window.devicePixelRatio)) || (16 * ratio)));

      if (Ext.os.is('iOS'))
      {
         me._iconPath = '/ios';
         me._thumbnailAttribPrefix = 'thumbnail_ios_';
         me._iconSize = 57 * ( merchantMode ? 1.5 : 1.0);

         //
         // Push Notification
         //
         if (debugMode)
         {
            me.pushNotifAppName = 'KickBak Dev Latest';
            me.pushNotifAppId = '93D8A-5BE72';
         }
         else
         {
            me.pushNotifAppName = 'KickBak Production';
            me.pushNotifAppId = '4fef6fb0691c12.54726991';
         }
         me.pushNotifType = 1;

         console.log("Running a iOS System");
      }
      else if (Ext.os.is('Android') || Ext.os.is('Desktop'))
      {
         if ((window.devicePixelRatio == 1) || (window.devicePixelRatio >= 2))
         {
            me._iconSize = 48 * ((merchantMode && (Ext.os.is('Tablet'))) ? 3.0 : 1.2);
            me._iconPath = '/android/mxhdpi';
            me._thumbnailAttribPrefix = 'thumbnail_android_mxhdpi_';
         }
         else
         {
            me._iconSize = 36 * ((merchantMode && (Ext.os.is('Tablet'))) ? 3.0 : 1.5);
            me._iconPath = '/android/lhdpi';
            me._thumbnailAttribPrefix = 'thumbnail_android_lhdpi_';
         }

         //
         // Push Notification
         //
         if (debugMode)
         {
            me.pushNotifAppName = 'KickBak Dev Latest';
            me.pushNotifAppId = '93D8A-5BE72';
            me.pushNotifProjectId = '658015469194';
         }
         else
         {
            me.pushNotifAppName = 'KickBak Production';
            me.pushNotifAppId = '4fef6fb0691c12.54726991';
            me.pushNotifProjectId = '733275653511';
         }
         me.pushNotifType = 3;

         console.log("Running a Android or Desktop System");
      }
      else
      {
         me._iconPath = '/ios';
         me._thumbnailAttribPrefix = 'thumbnail_ios_';
         me._iconSize = 57;

         console.log("Running a Unknown System");
      }
      me._iconPath = me.themeName + me._iconPath;
      me._iconPathCommon = me.themeName + '/ios';

      console.debug("IconSize = " + me._iconSize + "px");
   },
   addCRLF : function()
   {
      //return ((!Genesis.fn.isNative()) ? '<br/>' : '\n');
      return ('<br/>');
   },
   getIconPath : function(type, name, remote)
   {
      return ((!remote) ? //
      'resources/themes/images/' + this._iconPathCommon + '/' + type + '/' + name + '.svgz' : //
      this.photoSite + '/' + this._iconPath + '/' + 'icons' + '/' + type + '/' + name + '.png');
   }
}

// **************************************************************************
// Utility Functions
// **************************************************************************
Genesis.fn =
{
   isNative : function()
   {
      //return Ext.isDefined(cordova);
      return window.phoneGapAvailable;
   },
   // **************************************************************************
   // Dynamic CSS/JS loading
   // **************************************************************************
   filesadded :
   {
   }, //list of files already added
   checkloadjscssfile : function(filename, filetype, cb)
   {
      var decodeFilename = Url.decode(filename);
      var index = this.filesadded[decodeFilename];
      if (Ext.isEmpty(index))
      {
         index = this.filesadded[decodeFilename] = [];
         if (Ext.isFunction(cb))
         {
            index[0] = false;
            index[1] = [cb];
            this.loadjscssfile(filename, filetype, false);
         }
         else
         {
            index[0] = true;
            this.loadjscssfile(filename, filetype, true);
         }
      }
      else if (index[0] == true)
      {
         if (Ext.isFunction(cb))
            cb(true);
      }
      else if (Ext.isFunction(cb))
      {
         if (index[1].indexOf(cb) < 0)
         {
            index[1].push(cb);
         }
      }
      else
      {
         console.debug("Do nothing for file[" + filename + "]");
      }
   },
   createjscssfile : function(filename, filetype)
   {
      var fileref;
      filename = Url.decode(filename);
      if (filetype == "js")
      {
         //if filename is a external JavaScript file
         fileref = document.createElement('script')
         fileref.setAttribute("type", "text/javascript")
         fileref.setAttribute("src", filename)
      }
      else if (filetype == "css")
      {
         //if filename is an external CSS file
         fileref = document.createElement("link")
         fileref.setAttribute("rel", "stylesheet")
         fileref.setAttribute("type", "text/css")
         fileref.setAttribute("href", filename)
      }

      return fileref;
   },
   loadjscsstext : function(filename, filetype, text, cb)
   {
      var fileref;
      filename = Url.decode(filename);
      if (filetype == "js")
      {
         //if filename is a external JavaScript file
         fileref = document.createElement('script')
         fileref.setAttribute("type", "text/javascript")
         fileref.setAttribute("id", filename)
         //      fileref.innerHTML = "<!-- " + text + " -->";
         fileref.innerHTML = text;
      }
      else if (filetype == "css")
      {
         log("Loading cssfile (" + filename + ")");
         //if filename is an external CSS file
         fileref = document.createElement("style")
         fileref.setAttribute("id", filename)
         fileref.setAttribute("rel", "stylesheet")
         fileref.setAttribute("type", "text/css")
         // FF, Safari
         if ( typeof (fileref.textContent) != 'undefined')
         {
            fileref.textContent = text;
         }
         else
         {
            fileref.styleSheet.cssText = text;
            // FF, IE
         }
      }
      fileref.onerror = fileref.onload = fileref.onreadystatechange = function()
      {
         var rs = this.readyState;
         if (rs && (rs != 'complete' && rs != 'loaded'))
            return;
         if (cb)
            cb();
      }
      if (( typeof fileref) != undefined)
         document.getElementsByTagName("head")[0].appendChild(fileref)

      return fileref;
   },
   loadjscssfileCallBackFunc : function(b, t, href)
   {
      href = Url.decode(href);
      if (t < 100)
      {
         /* apply only if the css is completely loded in DOM */
         try
         {
            var url = (document.styleSheets[b].href) ? document.styleSheets[b].href.replace(location.origin, '') : '';
            console.debug("url = " + url);
            //if (url.search(href) < 0)
            if (url != href)
            {
               for (var i = 0; i < document.styleSheets.length; i++)
               {
                  url = (document.styleSheets[i].href) ? document.styleSheets[i].href.replace(location.origin, '') : '';
                  console.debug("url = " + url);
                  //if (url.search(href) >= 0)
                  if (url == href)
                  {
                     b = i;
                     break;
                  }
               }
            }
            // FF if css not loaded an exception is fired
            if (document.styleSheets[b].cssRules)
            {
               this.cssOnReadyStateChange(href, false);
            }
            // IE no exception is fired!!!
            else
            {
               if (document.styleSheets[b].rules && document.styleSheets[b].rules.length)
               {
                  this.cssOnReadyStateChange(href, false);
                  return;
               }
               t++;
               Ext.defer(this.loadjscssfileCallBackFunc, 250, this, [b, t, href]);
               if ((t / 25 > 0) && (t % 25 == 0))
               {
                  console.debug("IE Exception : Loading [" + href + "] index[" + b + "] try(" + t + ")");
               }
            }
         }
         catch(e)
         {
            t++;
            if ((t / 25 > 0) && (t % 25 == 0))
            {
               console.debug(printStackTrace(
               {
                  e : e
               }));
               console.debug("FF Exception : Loading [" + href + "] index[" + b + "] try(" + t + ")");
            }
            Ext.defer(this.loadjscssfileCallBackFunc, 250, this, [b, t, href]);
         }
      }
      else
      {
         //this.removejscssfile(href,"css");
         console.debug("Cannot load [" + href + "], index=[" + b + "]");
         //Cannot load CSS, but we still need to continue processing
         this.cssOnReadyStateChange(href, true);
      }
   },
   scriptOnError : function(loadState)
   {
      this.scriptOnReadyStateChange.call(this, loadState, true);
   },
   scriptOnReadyStateChange : function(loadState, error)
   {
      var src = this.src;
      //Url.decode(this.src);
      src = src.replace(location.origin, '');
      if (!error)
      {
         var rs = this.readyState;
         if (rs && (rs != 'complete' && rs != 'loaded'))
         {
            //console.debug("file ["+this.src+"] not loaded yet");
            return;
         }
         else if (!rs)
         {
            //console.debug("file ["+this.src+"] is loading");
            //return;
         }
      }
      else
      {
         console.debug("Error Loading JS file[" + src + "]");
      }

      var i = 0, cbList = Genesis.fn.filesadded[src];
      if (cbList)
      {
         cbList[0] = true;
         /*
          try
          {
          */
         for (; i < cbList[1].length; i++)
         {
            cbList[1][i](!error);
         }
         /*
          }
          catch (e)
          {
          debug(printStackTrace(
          {
          e: e
          }));
          debug("Error Calling callback on JS file["+src+"] index["+i+"]\nStack: ===========\n"+e.stack);
          }
          */
         delete cbList[1];
      }
      else
      {
         console.debug("Cannot find callback on JS file[" + src + "] index[" + i + "]");
      }
   },
   cssOnReadyStateChange : function(href, error)
   {
      //href = Url.decode(href);
      var cbList = Genesis.fn.filesadded[href];
      if (cbList)
      {
         cbList[0] = true;
         var i = 0;
         /*
          try
          {
          */
         for (; i < cbList[1].length; i++)
         {
            cbList[1][i](!error);
         }
         /*
          }
          catch (e)
          {
          console.debug(printStackTrace(
          {
          e : e
          }));
          console.debug("Error Calling callback on CSS file[" + href + "] index[" + i + "]\nStack: ===========\n" + e.stack);
          }
          */
         delete cbList[1];
      }
      else
      {
         console.debug("Cannot find callback on CSSS file[" + href + "] index[" + i + "]");
      }
   },
   loadjscssfile : function(filename, filetype, noCallback)
   {
      var fileref;
      filename = Url.decode(filename);
      if (filetype == "js")
      {
         //if filename is a external Javascript file
         fileref = document.createElement('script')
         fileref.setAttribute("type", "text/javascript")
         if (!noCallback)
         {
            fileref.onerror = this.scriptOnError;
            fileref.onload = fileref.onreadystatechange = this.scriptOnReadyStateChange;
         }
         fileref.setAttribute("src", filename)
         document.getElementsByTagName("head")[0].appendChild(fileref)
      }
      else if (filetype == "css")
      {
         var len = document.styleSheets.length;

         // if filename is an external CSS file
         fileref = document.createElement('link')
         fileref.setAttribute("rel", "stylesheet")
         fileref.setAttribute("type", "text/css")
         fileref.setAttribute("media", "screen")
         fileref.setAttribute("href", filename)

         document.getElementsByTagName("head")[0].appendChild(fileref);
         if (!noCallback)
         {
            // +1 for inline style in webpage
            Ext.defer(this.loadjscssfileCallBackFunc, 50, this, [len, 0, filename]);
         }
      }
   },
   removejscssfile : function(filename, filetype)
   {
      filename = Url.decode(filename);
      var efilename = escape(filename);
      var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none"//determine element type to create
      // nodelist from
      var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none"//determine corresponding attribute to test
      // for
      var allsuspects = document.getElementsByTagName(targetelement)
      for (var i = allsuspects.length; i >= 0; i--)
      {
         //search backwards within nodelist for matching elements to remove
         if (allsuspects[i])
         {
            var attr = escape(allsuspects[i].getAttribute(targetattr));
            if (attr != null && ((attr == efilename) || (attr.search(efilename) != -1)))
            {
               allsuspects[i].disabled = true;
               allsuspects[i].parentNode.removeChild(allsuspects[i])//remove element by calling parentNode.removeChild()
               delete Genesis.fn.filesadded[filename];
            }
         }
      }
   },
   findjscssfile : function(filename, filetype)
   {
      filename = Url.decode(filename);
      var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "style" : "none"//determine element type to create
      // nodelist from
      var targetattr = (filetype == "js") ? "id" : (filetype == "css") ? "id" : "none"//determine corresponding attribute to test for
      var allsuspects = document.getElementsByTagName(targetelement)
      for (var i = allsuspects.length; i >= 0; i--)
      {
         //search backwards within nodelist for matching elements to remove
         if (allsuspects[i])
         {
            var attr = allsuspects[i].getAttribute(targetattr);
            if (attr != null && attr.search(filename) != -1)
            {
               return allsuspects[i];
            }
         }
      }
      return null;
   },
   removejscsstext : function(filename, filetype)
   {
      filename = Url.decode(filename);
      var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "style" : "none"//determine element type to create
      // nodelist from
      var targetattr = (filetype == "js") ? "id" : (filetype == "css") ? "id" : "none"//determine corresponding attribute to test for
      var allsuspects = document.getElementsByTagName(targetelement)
      for (var i = allsuspects.length; i >= 0; i--)
      {
         //search backwards within nodelist for matching elements to remove
         if (allsuspects[i])
         {
            var attr = allsuspects[i].getAttribute(targetattr);
            if (attr != null && ((attr == filename) || (attr.search(filename) != -1)))
            {
               allsuspects[i].parentNode.removeChild(allsuspects[i])//remove element by calling parentNode.removeChild()
               delete Genesis.fn.filesadded[filename];
            }
         }
      }
   },
   replacejscssfile : function(oldfilename, newfilename, filetype)
   {
      newfilename = Url.decode(newfilename);
      oldfilename = Url.decode(oldfilename);
      var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none"//determine element type to create
      // nodelist using
      var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none"//determine corresponding attribute to test
      // for
      var allsuspects = document.getElementsByTagName(targetelement)
      for (var i = allsuspects.length; i >= 0; i--)
      {
         //search backwards within nodelist for matching elements to remove
         if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename) != -1)
         {
            var newelement = this.createjscssfile(newfilename, filetype)
            allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i])
            delete this.filesadded[oldfilename];
            this.filesadded[newfilename] = [true];
         }
      }
   },
   // **************************************************************************
   // Date Time
   // **************************************************************************
   systemTime : (new Date()).getTime(),
   clientTime : (new Date()).getTime(),
   weekday : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
   convertDateCommon : function(v, dateFormat, noConvert)
   {
      var date;
      var format = dateFormat || this.dateFormat;

      if (!( v instanceof Date))
      {
         if ( typeof (JSON) != 'undefined')
         {
            //v = (jQuery.browser.msie) ? v.split(/Z$/)[0] : v.split('.')[0];
            //v = (Ext.os.deviceType.toLowerCase() != 'desktop') ? v : v.split('.')[0];
            //v = (Genesis.fn.isNative()) ? v : v.split('.')[0];
         }

         if (Ext.isEmpty(v))
         {
            date = new Date();
         }
         else
         {
            if (format)
            {
               date = Date.parse(v, format);
               if (Ext.isEmpty(date))
               {
                  date = new Date(v).format(format);
               }
               return [date, date];
            }
            date = new Date(v);
            if (date.toString() == 'Invalid Date')
            {
               date = Date.parse(v, format);
            }
         }
      }
      else
      {
         date = v;
      }
      if (!noConvert)
      {
         var currentDate = new Date().getTime();
         // Adjust for time drift between Client computer and Application Server
         var offsetTime = this.currentDateTime(currentDate);

         var timeExpiredSec = (offsetTime - date.getTime()) / 1000;

         if (timeExpiredSec > -10)
         {
            if ((timeExpiredSec) < 2)
               return [timeExpiredSec, 'a sec ago'];
            if ((timeExpiredSec) < 60)
               return [timeExpiredSec, parseInt(timeExpiredSec) + ' secs ago'];
            timeExpiredSec = timeExpiredSec / 60;
            if ((timeExpiredSec) < 2)
               return [timeExpiredSec, 'a min ago'];
            if ((timeExpiredSec) < 60)
               return [timeExpiredSec, parseInt(timeExpiredSec) + ' mins ago'];
            timeExpiredSec = timeExpiredSec / 60;
            if ((timeExpiredSec) < 2)
               return [date, '1 hr ago'];
            if ((timeExpiredSec) < 24)
               return [date, parseInt(timeExpiredSec) + ' hrs ago'];
            timeExpiredSec = timeExpiredSec / 24;
            if (((timeExpiredSec) < 2) && ((new Date().getDay() - date.getDay()) == 1))
               return [date, 'Yesterday at ' + date.format('g:i A')];
            if ((timeExpiredSec) < 7)
               return [date, this.weekday[date.getDay()] + ' at ' + date.format('g:i A')];
            timeExpiredSec = timeExpiredSec / 7;
            if (((timeExpiredSec) < 2) && (timeExpiredSec % 7 == 0))
               return [date, '1 wk ago'];
            if (((timeExpiredSec) < 5) && (timeExpiredSec % 7 == 0))
               return [date, parseInt(timeExpiredSec) + ' wks ago'];

            if (timeExpiredSec < 5)
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
      if (todayDate == date && todayMonth == month && todayYear == year)
      {
         return 'Today ' + v.format('g:i A');
      }
      return v.format('D g:i A');
   },
   convertDate : function(v, dateFormat)
   {
      var rc = this.convertDateCommon(v, dateFormat);
      if (rc[1] != -1)
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
      var rc = this.convertDateCommon(v, null, true);
      if (rc[1] != -1)
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
      var rc = this.convertDateCommon(v, null, true);
      if (rc[1] != -1)
      {
         rc = (rc[1] == null) ? rc[0].format('M d, Y') : rc[1];
      }
      else
      {
         rc = rc[0].format('M d, Y');
      }
      return rc;
   },
   convertDateInMins : function(v)
   {
      var rc = this.convertDateCommon(v, null, true);
      if (rc[1] != -1)
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
      return (this.systemTime - this.clientTime) + currentDate;
   },
   // **************************************************************************
   // PX and EM Calculations
   // **************************************************************************
   addUnit : function(unit, metric)
   {
      return unit + ((!metric) ? 'px' : metric);
   },
   _removeUnitRegex : /(\d+)px/,
   removeUnit : function(unit)
   {
      return unit.match(this._removeUnitRegex)[1];
   },
   //
   // Convert to equivalent px given the fontsize
   //
   calcPx : function(em, fontsize)
   {
      return Math.floor((em * fontsize * Genesis.constants.fontSize));
   },
   //
   // Convert to equivalent em given the fontsize
   //
   calcEm : function(px, fontsize)
   {
      return Math.floor(px / Genesis.constants.fontSize / fontsize);
   },
   // **************************************************************************
   // File IO
   // **************************************************************************
   failFileHandler : function(error)
   {
      var errorCode =
      {
      };
      errorCode[FileError.NOT_FOUND_ERR] = 'File not found';
      errorCode[FileError.SECURITY_ERR] = 'Security error';
      errorCode[FileError.ABORT_ERR] = 'Abort error';
      errorCode[FileError.NOT_READABLE_ERR] = 'Not readable';
      errorCode[FileError.ENCODING_ERR] = 'Encoding error';
      errorCode[FileError.NO_MODIFICATION_ALLOWED_ERR] = 'No mobification allowed';
      errorCode[FileError.INVALID_STATE_ERR] = 'Invalid state';
      errorCode[FileError.SYFNTAX_ERR] = 'Syntax error';
      errorCode[FileError.INVALID_MODIFICATION_ERR] = 'Invalid modification';
      errorCode[FileError.QUOTA_EXCEEDED_ERR] = 'Quota exceeded';
      errorCode[FileError.TYPE_MISMATCH_ERR] = 'Type mismatch';
      errorCode[FileError.PATH_EXISTS_ERR] = 'Path does not exist';
      var ftErrorCode =
      {
      };
      ftErrorCode[FileTransferError.FILE_NOT_FOUND_ERR] = 'File not found';
      ftErrorCode[FileTransferError.INVALID_URL_ERR] = 'Invalid URL Error';
      ftErrorCode[FileTransferError.CONNECTION_ERR] = 'Connection Error';

      console.log("File Error - [" + errorCode[error.code] + "]");
   },
   readFile : function(path, callback)
   {
      var me = this, rfile;
      var failFileHandler = function(error)
      {
         me.failFileHandler(error);
         callback(null);
      };

      if (Genesis.fn.isNative())
      {
         var handler = function(fileEntry)
         {
            fileEntry.file(function(file)
            {
               var reader = new FileReader();
               reader.onloadend = function(evt)
               {
                  callback(evt.target.result);
               };
               reader.readAsText(rfile);
            }, failFileHandler);
         };

         window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
         {
            if (Ext.os.is('iOS'))
            {
               rfile = (fileSystem.root.fullPath + '/../' + appName + '.app' + '/www/') + path;
            }
            else if (Ext.os.is('Android'))
            {
               //rfile = ('file:///mnt/sdcard/' + appName + '/') + path;
               rfile = (appName + '/') + path;
            }
            console.debug("Reading from File - [" + rfile + "]");
            fileSystem.root.getFile(rfile, null, handler, failFileHandler);
         }, failFileHandler);
      }
      else
      {
         callback(true);
      }
   },
   writeFile : function(path, content, callback)
   {
      var me = this, wfile;
      var failFileHandler = function(error)
      {
         me.failFileHandler(error);
         callback(false);
      };

      if (Genesis.fn.isNative())
      {
         var handler = function(fileEntry)
         {
            console.debug("Created File - [" + wfile + "]");
            fileEntry.createWriter(function(writer)
            {
               console.debug("Writing to File - [" + wfile + "], Content - [" + content + "]");
               writer.onwrite = function(evt)
               {
                  console.debug("Write End Callback - [" + Ext.encode(evt) + "]");
                  callback(true);
               };
               writer.write(content);
            }, failFileHandler);
         };

         window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
         {
            if (Ext.os.is('iOS'))
            {
               wfile = (fileSystem.root.fullPath + '/../' + appName + '.app' + '/www/') + path;
            }
            else if (Ext.os.is('Android'))
            {
               //wfile = ('file:///mnt/sdcard/' + appName + '/') + path;
               wfile = (appName + '/') + path;
            }
            fileSystem.root.getDirectory(wfile.substring(0, wfile.lastIndexOf('/')),
            {
               create : true
            });
            fileSystem.root.getFile(wfile,
            {
               create : true,
               exclusive : false
            }, handler, failFileHandler);
         }, failFileHandler);
      }
      else
      {
         callback();
      }
   },
   getPrivKey : function(id, callback)
   {
      var me = this;
      callback = callback || Ext.emptyFn;
      if (!me.privKey)
      {
         if (!Genesis.fn.isNative())
         {
            // Hardcoded for now ...
            me.privKey =
            {
               'v1' : me.debugVPrivKey,
               'r1' : me.debugRPrivKey,
               'venue' : me.debugVenuePrivKey,
               'venueId' : 1
            }
         }
         else
         {
            me.privKey =
            {
            };
         }
      }

      return ((id) ? me.privKey[id] : me.privKey);
   },
   // **************************************************************************
   // Proximity ID API Utilities
   // **************************************************************************
   printProximityConfig : function()
   {
      var c = Genesis.constants;
      console.debug("ProximityID Configuration");
      console.debug("=========================");
      console.debug("\n" + //
      "Signal Samples[" + c.numSamples + "]\n" + //
      "Missed Threshold[" + c.conseqMissThreshold + "]\n" + //
      "Signal Overlap Ratio[" + c.sigOverlapRatio + "]\n" + //
      "Default Volume[" + c.s_vol + "%]\n" //
      );
   },
   processSendLocalID : function(result, cancelFn)
   {
      var localID, identifiers = null;

      if (result.freqs)
      {
         Genesis.constants.lastLocalID = result.freqs;
      }

      localID = Genesis.constants.lastLocalID;
      if (localID)
      {
         identifiers = 'LocalID=[' + localID[0] + ', ' + localID[1] + ', ' + localID[2] + ']';
         //console.log('Sending out ' + identifiers);
      }
      return (
         {
            'message' : identifiers,
            'localID' : localID,
            'cancelFn' : cancelFn
         });
   },
   processRecvLocalID : function(result)
   {
      var identifiers = null;
      var localID = result.freqs;
      if (localID)
      {
         identifiers = 'LocalID=[' + localID[0] + ', ' + localID[1] + ', ' + localID[2] + ']';
         //console.log('Recv\'d ' + identifiers);
      }
      else
      {
         console.log('Already listening for LocalID ...');
      }

      return (
         {
            message : identifiers,
            localID : localID
         });
   }
}

// **************************************************************************
// Persistent DB API
// **************************************************************************
Genesis.db =
{
   _localDB : null,
   getLocalStorage : function()
   {
      return window.localStorage;
   },
   //
   // Redeem Index DB
   //
   getRedeemIndexDB : function(index)
   {
      try
      {
         if (!this.kickbakRedeemIndex)
         {
            this.kickbakRedeemIndex = Ext.decode(this.getLocalStorage().getItem('kickbakRedeemIndex'));
         }
      }
      catch(e)
      {
      }

      if (!this.kickbakRedeemIndex)
      {
         this.kickbakRedeemIndex =
         {
         };
      }
      return ( index ? this.kickbakRedeemIndex[index] : this.kickbakRedeemIndex);
   },
   addRedeemIndexDB : function(index, value)
   {
      var db = this.getRedeemIndexDB();
      db[index] = value;
      console.debug("Add to KickBak Redeem DB[" + index + "]");
      //this.getLocalStorage().setItem('kickbakRedeemIndex', Ext.encode(db));
   },
   setRedeemIndexDB : function(db)
   {
      //console.debug("Setting KickBak Redeem DB[" + Ext.encode(db) + "]");
      //this.getLocalStorage().setItem('kickbakRedeemIndex', Ext.encode(db));
   },
   //
   // Redeem Sorted DB
   //
   getRedeemSortedDB : function(index)
   {
      try
      {
         if (!this.kickbakRedeemSorted)
         {
            this.kickbakRedeemSorted = Ext.decode(this.getLocalStorage().getItem('kickbakRedeemSorted'));
         }
      }
      catch(e)
      {

      }
      if (!this.kickbakRedeemSorted)
      {
         this.kickbakRedeemSorted = [];
      }
      return ( index ? this.kickbakRedeemSorted[index] : this.kickbakRedeemSorted);
   },
   //
   // LocalDB
   //
   getLocalDB : function()
   {
      return (!this._localDB) ? (this._localDB = Ext.decode(this.getLocalStorage().getItem('kickbak') || "{}")) : this._localDB;
   },
   setLocalDB : function(db)
   {
      this._localDB = db;
      //console.debug("Setting KickBak DB[" + Ext.encode(db) + "]");
      this.getLocalStorage().setItem('kickbak', Ext.encode(db));
   },
   setLocalDBAttrib : function(attrib, value)
   {
      //console.debug("Setting KickBak Attrib[" + attrib + "] to [" + value + "]");
      var db = this.getLocalDB();
      db[attrib] = value;
      this.setLocalDB(db);
   },
   removeLocalDBAttrib : function(attrib)
   {
      var db = this.getLocalDB();
      if ( typeof (db[attrib]) != 'undefined')
      {
         delete db[attrib];
         this.setLocalDB(db);
      }
   },
   openDatabase : function()
   {
      return openDatabase('KickBak', '1.0', 'KickBakDB', 2 * 1024 * 1024);
   },
   //
   // Referral DB
   //
   getReferralDBAttrib : function(index)
   {
      var db = this.getReferralDB();
      return db[index];
   },
   addReferralDBAttrib : function(index, value)
   {
      var db = this.getReferralDB();
      db[index] = value;
      this.setReferralDB(db);
   },
   removeReferralDBAttrib : function(index)
   {
      var db = this.getReferralDB();
      delete db[index];
      this.setReferralDB(db);
   },
   getReferralDB : function()
   {
      var db = this.getLocalStorage().getItem('kickbakreferral');
      return ((db) ? Ext.decode(db) :
      {
      });
   },
   setReferralDB : function(db)
   {
      console.debug("Setting Referral DB[" + Ext.encode(db) + "]");
      this.getLocalStorage().setItem('kickbakreferral', Ext.encode(db));
   },
   //
   // Reset Local DB
   //
   resetStorage : function()
   {
      var db = Genesis.db.getLocalDB(), i;
      if (db['fbLoginInProgress'])
      {
         return;
      }

      if (Genesis.fb)
      {
         Genesis.fb.facebook_onLogout(null, false);
      }
      db = this.getLocalStorage();
      for (i in db)
      {
         if ((i == 'kickbak') || (i == 'kickbakreferral'))
         {
            try
            {
               db.removeItem(i);
            }
            catch(e)
            {
            }
            console.debug("Removed [" + i + "]");
         }
      }
      this._localDB = null;
      //
      // Clean up ALL Object cache!
      //
      Ext.data.Model.cache =
      {
      };

      var dropStatement = "DROP TABLE Customer";
      var db = Genesis.db.openDatabase();

      db.transaction(function(tx)
      {
         //
         // Drop Table
         //
         tx.executeSql(dropStatement, [], function(tx, result)
         {
            console.debug("ResetStorage --- Successfully drop KickBak-Customers Table");
         }, function(tx, error)
         {
            console.debug("Failed to drop KickBak-Customers Table : " + error.message);
         });
      });
   }
};
