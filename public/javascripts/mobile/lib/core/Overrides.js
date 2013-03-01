// **************************************************************************
// System Functions
// **************************************************************************
Genesis =
{
};

window.plugins = window.plugins ||
{
};

Genesis.constants =
{
   //host : 'http://www.dev1getkickbak.com',
   //host : 'http://www.devgetkickbak.com',
   host : 'http://www.getkickbak.com',
   isNfcEnabled : false,
   userName : 'Eric Chan',
   appMimeType : 'application/kickbak',
   clientVersion : '2.1.0',
   serverVersion : '2.1.0',
   themeName : 'v1',
   _thumbnailAttribPrefix : '',
   _iconPath : '',
   _iconSize : 0,
   defaultFontSize : (function()
   {
      var ratio = 1.14;

      if (Ext.os.is('Tablet'))
      {
         ratio = 2 * ratio;
      }
      return Math.floor(((16 * ratio * Math.min(1.0, window.devicePixelRatio)) || (16 * ratio)));
   })(),
   defaultIconSize : function()
   {
      return this._iconSize;
   },
   site : 'www.getkickbak.com',
   photoSite : 'http://files.getkickbak.com',
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
   //
   device : null,
   minDistance : 0.3 * 1000,
   //minDistance : 100000 * 1000,
   createAccountMsg : 'Create user account using Facebook Profile information',
   init : function()
   {
      if (Ext.os.is('iOS'))
      {
         this._iconPath = '/ios';
         this._thumbnailAttribPrefix = 'thumbnail_ios_';
         this._iconSize = 57;
      }
      else
      if (Ext.os.is('Android'))
      {
         if ((window.devicePixelRatio == 1) || (window.devicePixelRatio >= 2))
         {
            this._iconSize = 48 * ((Ext.os.is('Tablet')) ? 3.0 : 1.2);
            this._iconPath = '/android/mxhdpi';
            this._thumbnailAttribPrefix = 'thumbnail_android_mxhdpi_';
         }
         else
         {
            this._iconSize = 36 * ((Ext.os.is('Tablet')) ? 3.0 : 1.5);
            this._iconPath = '/android/lhdpi';
            this._thumbnailAttribPrefix = 'thumbnail_android_lhdpi_';
         }
      }
      else
      {
         this._iconPath = '/ios';
         this._thumbnailAttribPrefix = 'thumbnail_ios_';
         this._iconSize = 57;
      }
      this._iconPath = this.themeName + this._iconPath;

      console.debug("IconSize = " + this._iconSize + "px");
   },
   addCRLF : function()
   {
      //return ((!Genesis.fn.isNative()) ? '<br/>' : '\n');
      return ('<br/>');
   },
   getIconPath : function(type, name, remote)
   {
      return ((!remote) ? //
      'resources/themes/images/' + this._iconPath : //
      this.photoSite + '/' + this._iconPath + '/' + 'icons') + '/' + type + '/' + name + '.png';
   }
}

// **************************************************************************
// Utility Functions
// **************************************************************************
Genesis.fn =
{
   systemTime : (new Date()).getTime(),
   clientTime : (new Date()).getTime(),
   weekday : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
   // **************************************************************************
   // Date Time
   // **************************************************************************
   isNative : function()
   {
      //return Ext.isDefined(cordova);
      return phoneGapAvailable;
   },
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
               return [timeExpiredSec, 'a second ago'];
            if ((timeExpiredSec) < 60)
               return [timeExpiredSec, parseInt(timeExpiredSec) + ' secs ago'];
            timeExpiredSec = timeExpiredSec / 60;
            if ((timeExpiredSec) < 2)
               return [timeExpiredSec, 'a minute ago'];
            if ((timeExpiredSec) < 60)
               return [timeExpiredSec, parseInt(timeExpiredSec) + ' minutes ago'];
            timeExpiredSec = timeExpiredSec / 60;
            if ((timeExpiredSec) < 2)
               return [date, 'an hour ago'];
            if ((timeExpiredSec) < 24)
               return [date, parseInt(timeExpiredSec) + ' hours ago'];
            timeExpiredSec = timeExpiredSec / 24;
            if (((timeExpiredSec) < 2) && ((new Date().getDay() - date.getDay()) == 1))
               return [date, 'Yesterday at ' + date.format('g:i A')];
            if ((timeExpiredSec) < 7)
               return [date, this.weekday[date.getDay()] + ' at ' + date.format('g:i A')];
            timeExpiredSec = timeExpiredSec / 7;
            if (((timeExpiredSec) < 2) && (timeExpiredSec % 7 == 0))
               return [date, 'a week ago'];
            if (((timeExpiredSec) < 5) && (timeExpiredSec % 7 == 0))
               return [date, parseInt(timeExpiredSec) + ' weeks ago'];

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
   addUnit : function(unit)
   {
      return unit + 'px';
   },
   _removeUnitRegex : /(\d+)px/,
   removeUnit : function(unit)
   {
      return unit.match(this._removeUnitRegex)[1];
   },
   calcPx : function(em, fontsize)
   {
      return Math.floor(((em / fontsize) * Genesis.constants.defaultFontSize));
   },
   calcPxEm : function(px, em, fontsize)
   {
      return ((px / Genesis.constants.defaultFontSize / fontsize) + (em / fontsize));
   },
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
            else
            if (Ext.os.is('Android'))
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
            else
            if (Ext.os.is('Android'))
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
      if (Genesis.fn.isNative())
      {
         Genesis.fb.facebook_onLogout(null, false);
      }
      var db = this.getLocalStorage(), i;
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
   }
}

// **************************************************************************
// Ext.dom.Element
// **************************************************************************
Ext.define('Genesis.dom.Element',
{
   override : 'Ext.dom.Element',
   // Bug fix for adding units
   setMargin : function(margin, unit)
   {
      if (margin || margin === 0)
      {
         margin = this.self.unitizeBox((margin === true) ? 5 : margin, unit);
      }
      else
      {
         margin = null;
      }
      this.dom.style.margin = margin;
   },
   setPadding : function(padding, unit)
   {
      if (padding || padding === 0)
      {
         padding = this.self.unitizeBox((padding === true) ? 5 : padding, unit);
      }
      else
      {
         padding = null;
      }
      this.dom.style.padding = padding;
   },
   replaceCls : function(oldName, newName, prefix, suffix)
   {
      // If nothing has changed, why are we removing all classes and readding them causing a repaint?
      if (Ext.isArray(oldName) && Ext.isArray(newName) && oldName.join() === newName.join())
      {
         return;
      }
      return this.removeCls(oldName, prefix, suffix).addCls(newName, prefix, suffix);
   }
});

// **************************************************************************
// Ext.Component
// **************************************************************************
Ext.define('Genesis.Component',
{
   override : 'Ext.Component',
   // Bug fix for adding "units"
   updatePadding : function(padding)
   {
      this.innerElement.setPadding(padding, this.getInitialConfig().defaultUnit);
   },
   updateMargin : function(margin)
   {
      this.element.setMargin(margin, this.getInitialConfig().defaultUnit);
   }
});

// **************************************************************************
// Ext.util.Collection
// **************************************************************************
Ext.define('Genesis.util.Collection',
{
   override : 'Ext.util.Collection',
   // Bug fix
   clear : function()
   {
      this.callParent(arguments);
      this.indices =
      {
      };
   }
});

// **************************************************************************
// Ext.Mask
// **************************************************************************
Ext.define('Genesis.Mask',
{
   override : 'Ext.Mask',
   onEvent : function(e)
   {
      var controller = arguments[arguments.length - 1];

      if (controller.info.eventName === 'tap')
      {
         this.fireEvent('tap', this, e);
         return false;
      }

      // Propagate the event
      /*
       if (e && e.stopEvent)
       {
       e.stopEvent();
       }
       */

      return false;
   }
});

// **************************************************************************
// Ext.data.reader.Json
// **************************************************************************
Ext.define('Genesis.data.reader.Json',
{
   override : 'Ext.data.reader.Json',
   getResponseData : function(response)
   {
      var data;
      if (response && response.responseText)
      {
         //console.debug("ResponseText - \n" + response.responseText);
      }
      data = this.callParent(arguments);
      if (!data.metaData)
      {
         delete this.metaData;
      }
      return data;
   }
});

Ext.define('Genesis.data.writer.Writer',
{
   override : 'Ext.data.writer.Writer',
   writeDate : function(field, date)
   {
      if (date)
      {
         return this.callParent(arguments);
      }

      return null;
   }
});

// **************************************************************************
// Ext.data.proxy.Server
// **************************************************************************
Ext.define('Genesis.data.proxy.Server',
{
   override : 'Ext.data.proxy.Server',
   errorResponseHandlerFn : function(metaData, messages, success, operation, request, response, callback, scope)
   {
      var me = this, action = operation.getAction(), app = _application;
      var viewport = app.getController(((!merchantMode) ? 'client' : 'server') + '.Viewport');

      switch (metaData['rescode'])
      {
         //
         // Error from server, display this to user
         //
         case 'server_error' :
         {
            Ext.device.Notification.show(
            {
               title : 'Server Error(s)',
               message : messages,
               buttons : ['Dismiss'],
               callback : function(btn)
               {
                  if (metaData['session_timeout'])
                  {
                     viewport.resetView();
                     viewport.redirectTo('login');
                     return;
                  }
                  else
                  {
                     //
                     // No need to take any action. Let to user try again.
                     //
                  }
               }
            });
            break;
         }
         //
         // Sign in failed due to invalid Facebook info, Create Account.
         //
         case 'login_invalid_facebook_info' :
         {
            Ext.device.Notification.show(
            {
               title : 'Create Account',
               message : Genesis.constants.createAccountMsg,
               buttons : ['OK'],
               callback : function(btn)
               {
                  viewport.setLoggedIn(false);
                  viewport.redirectTo('createAccount');
               }
            });
            return;
         }
         case 'update_account_invalid_info' :
         case 'signup_invalid_info' :
         case 'update_account_invalid_facebook_info' :
         case 'login_invalid_info' :
         {
            Ext.device.Notification.show(
            {
               title : 'Login Error',
               message : messages,
               buttons : ['Dismiss'],
               callback : function(btn)
               {
                  viewport.resetView();
                  viewport.redirectTo('login');
               }
            });
            return;
         }
         default:
            //console.log("Error - " + metaData['rescode']);
            if (messages && (messages != 'Error Connecting to Server'))
            {
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : messages,
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     if (me._errorCallback)
                     {
                        me._errorCallback();
                        delete me._errorCallback;
                     }
                  }
               });
            }
            else
            if (operation.initialConfig.doNotRetryAttempt)
            {
               Ext.device.Notification.show(
               {
                  title : 'Network Error',
                  message : "Error Contacting Server",
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     if (me._errorCallback)
                     {
                        me._errorCallback();
                        delete me._errorCallback;
                     }
                  }
               });
            }
            break;
      }
      console.debug("Ajax ErrorHandler called. Operation(" + operation.wasSuccessful() + ")" + //
      ((messages) ? '\n' + messages : ''));
      me.fireEvent('exception', me, response, operation);
   },
   processResponse : function(success, operation, request, response, callback, scope)
   {
      var me = this, action = operation.getAction(), reader = me.getReader(), resultSet, messages, metaData;

      //console.debug("request = [" + Ext.encode(operation.initialConfig) + "]");
      if (response.timedout || ((response.status == 0) && (!request.aborted) && (!operation.initialConfig.doNotRetryAttempt)))
      {
         Ext.device.Notification.show(
         {
            title : 'Server Timeout',
            message : "Error Contacting Server",
            buttons : ['Try Again', 'Cancel'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'try again')
               {
                  me.afterRequest(request, success);
                  //
                  // Resend request
                  //
                  Ext.Ajax.request(response.request.options);
               }
               else
               {
                  response.timedout = false;
                  request.aborted = true;
                  success = false;
                  operation.success = false;
                  me.processResponse(success, operation, request, response, callback, scope);
               }
            }
         });

         return;
      }

      var errorHandler = function()
      {
         messages = ((resultSet && Ext.isDefined(resultSet.getMessage)) ? (Ext.isArray(resultSet.getMessage()) ? resultSet.getMessage().join(Genesis.constants.addCRLF()) : resultSet.getMessage()) : 'Error Connecting to Server');
         metaData = reader.metaData ||
         {
         };
         Ext.Viewport.setMasked(null);

         //this callback is the one that was passed to the 'read' or 'write' function above
         if ( typeof callback == 'function')
         {
            callback.call(scope || me, operation);
         }

         if (me.supressErrorsPopup)
         {
            me.supressErrorsCallbackFn = function()
            {
               me.supressErrorsPopup = false;
               me.errorResponseHandlerFn(metaData, messages, success, operation, request, response, callback, scope);
               delete me.supressErrorsCallbackFn;
            }
         }
         else
         {
            me.errorResponseHandlerFn(metaData, messages, success, operation, request, response, callback, scope);
         }
      };

      if (!response.aborted)
      {
         try
         {
            //console.debug("Response [" + response.responseText + "]");
            resultSet = reader.process(response);
         }
         catch(e)
         {
            console.debug('Ajax call failed with message=[' + e.message + '] url=[' + request.getUrl() + ']');
            operation.setException(operation,
            {
               status : null,
               statusText : e.message
            });

            errorHandler();
            return;
         }
         //if ((success === true) || (Genesis.fn.isNative() === true))
         if (success === true)
         {
            if (operation.process(action, resultSet, request, response) === false)
            {
               errorHandler();
            }
            else
            {
               //this callback is the one that was passed to the 'read' or 'write' function above
               if ( typeof callback == 'function')
               {
                  callback.call(scope || me, operation);
               }
            }
            me.afterRequest(request, success);
            return;
         }
      }
      console.debug('Ajax call failed with status=[' + response.status + '] url=[' + request.getUrl() + ']');
      /**
       * @event exception
       * Fires when the server returns an exception
       * @param {Ext.data.proxy.Proxy} this
       * @param {Object} response The response from the AJAX request
       * @param {Ext.data.Operation} operation The operation that triggered request
       */
      //
      // Override Default Error Messages
      //
      if (messages)
      {
         operation.setException(operation,
         {
            status : null,
            statusText : messages
         });
      }
      else
      {
         me.setException(operation, response);
      }

      if (!response.aborted)
      {
         errorHandler();
      }
      me.afterRequest(request, success);
   },
   /**
    * Creates and returns an Ext.data.Request object based on the options passed by the {@link Ext.data.Store Store}
    * that this Proxy is attached to.
    * @param {Ext.data.Operation} operation The {@link Ext.data.Operation Operation} object to execute
    * @return {Ext.data.Request} The request object
    */
   buildRequest : function(operation)
   {
      var db = Genesis.db.getLocalDB();
      if (db['auth_code'])
      {
         this.setExtraParam("auth_token", db['auth_code']);
      }
      else
      {
         delete this.getExtraParams()["auth_token"];
      }

      var request = this.callParent(arguments);

      if (operation.initialConfig.jsonData)
      {
         request.setJsonData(operation.initialConfig.jsonData);
      }

      return request;
   }
});

// **************************************************************************
// Ext.data.Connection
// **************************************************************************
Ext.define('Genesis.data.Connection',
{
   override : 'Ext.data.Connection',

   /**
    * Setup all the headers for the request
    * @private
    * @param {Object} xhr The xhr object
    * @param {Object} options The options for the request
    * @param {Object} data The data for the request
    * @param {Object} params The params for the request
    */
   setupHeaders : function(xhr, options, data, params)
   {
      var me = this;
      options = options ||
      {
      };
      var db = Genesis.db.getLocalDB();
      var method = (options.method || me.getMethod() || ((params || data) ? 'POST' : 'GET')).toUpperCase();
      options.headers = Ext.apply(options.headers,
      {
         'Accept' : '*/*'
      });
      if (db['csrf_code'] && (method == 'POST'))
      {
         options.headers = Ext.apply(options.headers,
         {
            'X-CSRF-Token' : db['csrf_code']
         });
      }
      var headers = me.callParent(arguments);

      //console.debug("Remote Ajax Call Header -\n" + Ext.encode(headers));
      return headers;
   },
   /**
    * Checks if the response status was successful
    * @param {Number} status The status code
    * @return {Object} An object containing success/status state
    */
   parseStatus : function(status, xhr)
   {
      // see: https://prototype.lighthouseapp.com/projects/8886/tickets/129-ie-mangles-http-response-status-code-204-to-1223
      status = status == 1223 ? 204 : status;

      var success = (status >= 200 && status < 300) || status == 304, isException = false;

      //console.debug("xhr[" + Ext.encode(xhr));
      if (!xhr.onreadystatechange)
      {
         success = false;
      }
      /*
       else
       if (Genesis.fn.isNative() && (status === 0))
       {
       success = true;
       }
       */

      if (!success)
      {
         switch (status)
         {
            case 12002:
            case 12029:
            case 12030:
            case 12031:
            case 12152:
            case 13030:
               isException = true;
               break;
         }
      }
      return (
         {
            success : success,
            isException : isException
         });
   }
});

Ext.define('Genesis.field.Text',
{
   override : 'Ext.field.Text',
   updateReadOnly : function(newReadOnly)
   {
      this[(newReadOnly)?'addCls' : 'removeCls']('readOnly');
      this.callParent(arguments);
   }
});

// **************************************************************************
// Ext.field.Select
// **************************************************************************
Ext.define('Genesis.field.Select',
{
   override : 'Ext.field.Select',
   // @private
   getListPanel : function()
   {
      if (!this.listPanel)
      {
         this.listPanel = Ext.create('Ext.Panel',
         {
            top : 0,
            left : 0,
            height : '9em',
            modal : true,
            cls : Ext.baseCSSPrefix + 'select-overlay',
            layout : 'fit',
            hideOnMaskTap : true,
            items :
            {
               xtype : 'list',
               store : this.getStore(),
               itemTpl : '<span class="x-list-label">{' + this.getDisplayField() + '}</span>',
               listeners :
               {
                  select : this.onListSelect,
                  itemtap : this.onListTap,
                  scope : this
               }
            }
         });
      }

      return this.listPanel;
   }
});

// **************************************************************************
// Ext.dataview.element.List
// **************************************************************************
/**
 * @private
 */
Ext.define('Genesis.dataview.element.List',
{
   override : 'Ext.dataview.element.List',

   updateListItem : function(record, item)
   {
      var me = this, dataview = me.dataview, extItem = Ext.fly(item), innerItem = extItem.down(me.labelClsCache, true), data = dataview.prepareData(record.getData(true), dataview.getStore().indexOf(record), record), disclosureProperty = dataview.getDisclosureProperty(), hasDisclosureProperty, iconSrc = data && data.hasOwnProperty('iconSrc'), disclosureEl, iconEl;

      innerItem.innerHTML = dataview.getItemTpl().apply(data);

      hasDisclosureProperty = data && data.hasOwnProperty(disclosureProperty);
      if (hasDisclosureProperty)
      {
         disclosureEl = extItem.down(me.disclosureClsCache);
         disclosureEl[data[disclosureProperty] === false ? 'addCls' : 'removeCls'](me.hiddenDisplayCache);
      }

      if (dataview.getIcon())
      {
         iconEl = extItem.down(me.iconClsCache, true);
         iconEl.style.backgroundImage = iconSrc ? 'url("' + iconSrc + '")' : '';
      }
   }
});

// **************************************************************************
// Ext.tab.Bar
// **************************************************************************
/**
 * @private
 */
Ext.define('Genesis.tab.Bar',
{
   override : 'Ext.tab.Bar',

   /**
    * @private
    * Fires off the tabchange action
    */
   doSetActiveTab : function(newTab, oldTab)
   {
      this.callParent(arguments);
      this.fireAction('tabchange', [this, newTab, oldTab]);
   }
});

// **************************************************************************
// Ext.device.connection.PhoneGap
// **************************************************************************
Ext.define('Genesis.device.connection.PhoneGap',
{
   override : 'Ext.device.connection.PhoneGap',
   syncOnline : function()
   {
      var type = navigator.connection.type;
      this._type = type;
      this._online = (type != Connection.NONE) && (type != Connection.UNKNOWN);
   }
});

// **************************************************************************
// Ext.MessageBox
// **************************************************************************
Ext.define('Genesis.MessageBox',
{
   override : 'Ext.MessageBox',
   /**
    * Adds the new {@link Ext.Toolbar} instance into this container.
    * @private
    */
   updateButtons : function(newButtons)
   {
      var me = this;

      if (newButtons)
      {
         if (me.buttonsToolbar)
         {
            me.buttonsToolbar.removeAll();
            me.buttonsToolbar.setItems(newButtons);
         }
         else
         {
            me.buttonsToolbar = Ext.create('Ext.Toolbar',
            {
               docked : 'bottom',
               height : "2.6em",
               defaultType : 'button',
               layout :
               {
                  type : 'hbox',
                  pack : 'center'
               },
               ui : me.getUi(),
               cls : me.getBaseCls() + '-buttons',
               items : newButtons
            });

            me.add(me.buttonsToolbar);
         }
      }
   },
   // @private
   // pass `fn` config to show method instead
   onClick : function(button)
   {
      if (button && this._hideCallbackFn)
      {
         this.getModal().un('hide', this._hideCallbackFn, Ext.device.Notification);
         delete this._hideCallbackFn;
      }

      this.callParent(arguments);
   }
});
// **************************************************************************
// Ext.device.notification.Abstract
// **************************************************************************
Ext.define('Ext.device.notification.Abstract',
{
   /**
    * A simple way to show a notification.
    *
    *     Ext.device.Notification.show({
    *        title: 'Verification',
    *        message: 'Is your email address is: test@sencha.com',
    *        buttons: Ext.MessageBox.OKCANCEL,
    *        callback: function(button) {
    *            if (button == "ok") {
    *                console.log('Verified');
    *            } else {
    *                console.log('Nope.');
    *            }
    *        }
    *     });
    *
    * @param {Object} config An object which contains the following config options:
    *
    * @param {String} config.title The title of the notification
    *
    * @param {String} config.message The message to be displayed on the notification
    *
    * @param {String/String[]} [config.buttons="OK"]
    * The buttons to be displayed on the notification. It can be a string, which is the title of the button, or an array of multiple
    * strings.
    * Please not that you should not use more than 2 buttons, as they may not be displayed correct on all devices.
    *
    * @param {Function} config.callback
    * A callback function which is called when the notification is dismissed by clicking on the configured buttons.
    * @param {String} config.callback.buttonId The id of the button pressed, one of: 'ok', 'yes', 'no', 'cancel'.
    *
    * @param {Object} config.scope The scope of the callback function
    */
   show : function(config)
   {
      if (!config.message)
      {
         throw ('[Ext.device.Notification#show] You passed no message');
      }

      if (config.buttons)
      {
         if (!Ext.isArray(config.buttons))
         {
            config.buttons = [config.buttons];
         }
      }
      else
      {
         config.buttons = null;
      }

      if (!config.scope)
      {
         config.scope = this;
      }

      return config;
   },
   /**
    * Vibrates the device.
    */
   vibrate : Ext.emptyFn
});

// **************************************************************************
// Ext.device.notification.PhoneGap
// **************************************************************************
/*
 Ext.define('Ext.device.notification.PhoneGap',
 {
 extend : 'Ext.device.notification.Abstract',
 requires : ['Ext.device.Communicator'],
 show : function(config)
 {
 config = this.callParent(arguments)
 var buttons = (config.buttons) ? config.buttons.join(',') : null;

 var ln = (buttons) ? buttons.length : 0;
 var onShowCallback = function(index)
 {
 if (index > ln)
 {
 if (config.callback)
 {
 config.callback.apply(config.scope, [index]);
 }
 return;
 }

 if (!index || (index < 1))
 {
 index = (config.buttons) ? config.buttons.length : 1;
 }
 if (config.callback)
 {
 config.callback.apply(config.scope, (config.buttons) ? [config.buttons[index - 1].toLowerCase()] : []);
 }
 };

 // change Ext.MessageBox buttons into normal arrays
 if ((ln > 0) && typeof buttons[0] != "string")
 {
 var newButtons = [], i;

 for ( i = 0; i < ln; i++)
 {
 newButtons.push(buttons[i].text);
 }

 buttons = newButtons;
 }

 navigator.notification.confirm(config.message, // message
 onShowCallback, // callback
 config.title, // title
 buttons // array of button names
 );
 },
 */
Ext.define('Ext.device.notification.PhoneGap',
{
   extend : 'Ext.device.notification.Abstract',
   requires : ['Ext.MessageBox'],

   // @private
   msg : null,

   show : function()
   {
      var config = this.callParent(arguments), buttons = [], ln = config.buttons.length, button, i, callback, msg;

      //buttons
      for ( i = 0; i < ln; i++)
      {
         button = config.buttons[i];
         if (Ext.isString(button))
         {
            button =
            {
               text : config.buttons[i],
               itemId : config.buttons[i].toLowerCase()
            };
         }

         buttons.push(button);
      }

      if (this.msg)
      {
         this.msg.destroy();
      }
      this.msg = Ext.create('Ext.MessageBox');

      msg = this.msg;
      msg.setHideOnMaskTap((!config.ignoreOnHide) ? true : false);
      callback = function(itemId)
      {
         if (config.callback)
         {
            config.callback.apply(config.scope, [itemId]);
         }
      };
      msg._hideCallbackFn = Ext.bind(callback, this, [buttons[buttons.length - 1].itemId]);
      msg.getModal().on('hide', msg._hideCallbackFn, this);

      msg.show(
      {
         title : config.title,
         message : config.message,
         scope : msg,
         buttons : buttons,
         fn : callback
      });
   },
   vibrate : function()
   {
      navigator.notification.vibrate(2000);
   },
   dismiss : function()
   {
      var msg = this.msg
      if (msg)
      {
         if (msg._hideCallbackFn)
         {
            msg._hideCallbackFn();
         }
         msg.hide();
      }
      //navigator.notification.dismiss();
   }
});

// **************************************************************************
// Ext.util.Geolocation
// **************************************************************************
Ext.define('Genesis.util.Geolocation',
{
   override : 'Ext.util.Geolocation',
   parseOptions : function()
   {
      var timeout = this.getTimeout(), ret =
      {
         maximumAge : this.getMaximumAge(),
         allowHighAccuracy : this.getAllowHighAccuracy(),
         enableHighAccuracy : this.getAllowHighAccuracy()
      };

      //Google doesn't like Infinity
      if (timeout !== Infinity)
      {
         ret.timeout = timeout;
      }
      console.debug("Geolocation - " + Ext.encode(ret));
      return ret;
   }
});

// **************************************************************************
// Ext.data.proxy.Memory
// **************************************************************************
Ext.define('Genesis.data.proxy.PagingMemory',
{
   extend : 'Ext.data.proxy.Memory',
   alias : 'proxy.pagingmemory',
   alternateClassName : 'Genesis.data.PagingMemoryProxy',
   /**
    * Reads data from the configured {@link #data} object. Uses the Proxy's {@link #reader}, if present.
    * @param {Ext.data.Operation} operation The read Operation
    * @param {Function} callback The callback to call when reading has completed
    * @param {Object} scope The scope to call the callback function in
    */
   read : function(operation, callback, scope)
   {
      var me = this, reader = me.getReader();
      var data =
      {
         data : reader.getRoot(me.getData()).slice(operation.getStart(), operation.getStart() + operation.getLimit()),
         total : reader.getTotal(me.getData())
      }

      if (operation.process('read', reader.process(data)) === false)
      {
         this.fireEvent('exception', this, null, operation);
      }

      Ext.callback(callback, scope || me, [operation]);
   },
});

// **************************************************************************
// Ext.plugin.ListPaging
// **************************************************************************
Ext.define('Genesis.plugin.ListPaging',
{
   extend : 'Ext.plugin.ListPaging',
   /**
    * @private
    */
   loadNextPage : function()
   {
      var me = this;
      if (!me.storeFullyLoaded())
      {
         me.callParent(arguments);
      }
   }
});

// **************************************************************************
// Ext.plugin.PullRefresh
// **************************************************************************
Ext.define('Genesis.plugin.PullRefresh',
{
   override : 'Ext.plugin.PullRefresh',
   resetRefreshState : function()
   {
      Ext.device.Notification.beep(1);
      this.callParent(arguments);
   }
});

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
