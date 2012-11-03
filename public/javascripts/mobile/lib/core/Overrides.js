//---------------------------------------------------------------------------------
// Math
//---------------------------------------------------------------------------------
Math.radians = function(degrees)
{
   return (degrees * Math.PI / 180);
}
// **************************************************************************
// System Functions
// **************************************************************************
Ext.ns('Genesis.constants');

Genesis.constants =
{
   //host : 'http://192.168.0.52:3000',
   host : 'http://www.getkickbak.com',
   clientVersion : '1.0.2',
   serverVersion : '1.0.2',
   themeName : 'v1',
   _thumbnailAttribPrefix : '',
   _iconPath : '',
   _iconSize : 0,
   defaultFontSize : (function()
   {
      return Math[(Ext.os.is('Android')) ? 'ceil' : 'floor'](((16 * 1.14 * Math.min(1.0, window.devicePixelRatio)) || (16 * 1.14)));
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
   device : null,
   redeemDBSize : 10000,
   //minDistance : 0.1 * 1000,
   minDistance : 100000 * 1000,
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
         this._iconSize = 48;
         if ((window.devicePixelRatio) == 1 || (window.devicePixelRatio >= 2))
         {
            this._iconPath = '/android/mxhdpi';
            this._thumbnailAttribPrefix = 'thumbnail_android_mxhdpi_';
         }
         else
         {
            this._iconPath = '/android/lhdpi';
            this._thumbnailAttribPrefix = 'thumbnail_android_lhdpi_';
         }

         if (window.devicePixelRatio < 1)
         {
            this._iconSize = 36;
         }
      }
      else
      {
         this._iconPath = '/ios';
         this._thumbnailAttribPrefix = 'thumbnail_ios_';
         this._iconSize = 57;
      }
      this._iconPath = this.themeName + this._iconPath;
   },
   isNative : function()
   {
      //return Ext.isDefined(cordova);
      return phoneGapAvailable;
   },
   addCRLF : function()
   {
      return ((!this.isNative()) ? '<br/>' : '\n');
   },
   getIconPath : function(type, name, remote)
   {
      return ((!remote) ? //
      'resources/themes/images/' + this._iconPath : //
      this.photoSite + '/' + this._iconPath + '/' + 'icons') + '/' + type + '/' + name + '.png';
   },
   getPrivKey : function(id)
   {
      var me = this;
      if (!me.privKey)
      {
         Genesis.fn.readFile('resources/keys.txt', function(content)
         {
            if (Genesis.constants.isNative())
            {
               me.privKey = Ext.decode(content);
            }
            else
            {
               // Hardcoded for now ...
               me.privKey =
               {
                  'v1' : me.debugVPrivKey,
                  'r1' : me.debugRPrivKey,
                  'venue' : me.debugVenuePrivKey
               };
            }
            for (var i in me.privKey)
            {
               console.debug("Encryption Key[" + i + "] = [" + me.privKey[i] + "]");
            }
         });
      }
      return (id) ? [me.privKey['v' + id], me.privKey['r' + id], me.privKey[id]] : me.privKey;
   }
}

// **************************************************************************
// Facebook API
// **************************************************************************
Genesis.fb =
{
   fbScope : 'email,user_birthday,publish_stream,read_friendlists,publish_actions,offline_access',
   fbConnectErrorMsg : 'Cannot retrive Facebook account information!',
   fbConnectReqestMsg : 'Would you like to update your Facebook Timeline?',
   fbConnectReconnectMsg : 'Please confirm to Reconnect to Facebook',
   connectingToFBMsg : 'Connecting to Facebook ...',
   friendsRetrieveErrorMsg : 'You cannot retrieve your Friends List from Facebook. Login and Try Again.',
   /*
   * Clean up any Facebook cookies, otherwise, we have page loading problems
   * One set for production domain, another for developement domain
   */
   // **************************************************************************
   initFb : function()
   {
      var me = this;

      //
      // Reset FB Connection. The system reset it automatically on every system reboot
      //
      Genesis.db.removeLocalDBAttrib('fbExpiresIn');

      var db = Genesis.db.getLocalDB();

      if ( typeof (FB) != 'undefined')
      {
         //Detect when Facebook tells us that the user's session has been returned
         FB.Event.monitor('auth.authResponseChange', function(session)
         {
            if (session && (session.status != 'not_authorized') && (session.status != 'notConnected'))
            {
               console.log('Got FB user\'s session: ' + session.status);

               var authToken = session.authResponse['accessToken'];
               if (authToken)
               {
                  db['fbExpiresIn'] = Date.now() + (1000 * session.authResponse['expiresIn']);
                  db['fbAuthCode'] = authToken;
                  Genesis.db.setLocalDB(db);
                  if (me.cb)
                  {
                     me.facebook_loginCallback(me.cb);
                     delete me.cb;
                  }
               }
               else
               {
                  me.facebook_onLogout(null, false);
               }
            }
            else
            if ((session === undefined) || (session && session.status == 'not_authorized'))
            {
               //console.debug('FB Account Session[' + session + '] was terminated or not authorized');
               if (session)
               {
                  me.facebook_onLogout(null, (session) ? true : false);
               }
            }
         });
      }
   },
   getFriendsList : function(callback)
   {
      var uidField = "id";
      var nameField = "name";
      var me = this;
      var message = function(num)
      {
         return 'We found ' + num + ' Friends from your social network!';
      }

      FB.api('/me/friends&fields=' + nameField + ',' + uidField, function(response)
      {
         var friendsList = '';
         me.friendsList = [];
         if (response && response.data && (response.data.length > 0))
         {
            var data = response.data;
            for (var i = 0; i < data.length; i++)
            {
               if (data[i][uidField] != Genesis.db.getLocalDB()['currFbId'])
               {
                  me.friendsList.push(
                  {
                     label : data[i][nameField],
                     value : data[i][uidField]
                  });
                  friendsList += ((friendsList.length > 0) ? ',' : '') + data[i][uidField];
               }
            }
            me.friendsList.sort(function(a, b)
            {
               return a[uidField] - b[uidField];
            });
            console.log(message(me.friendsList.length));
            //this.checkFriendReferral(friendsList, callback);
         }
         else
         {
            Ext.device.Notification.show(
            {
               title : 'Facebook Connect',
               message : me.friendsRetrieveErrorMsg,
               buttons : ['Relogin', 'Cancel'],
               callback : function(button)
               {
                  if (button == "Relogin")
                  {
                     me.facebook_onLogout(function()
                     {
                        me.fbLogin(cb, false);
                     }, true);
                  }
               }
            });
         }
      });
   },
   createFbResponse : function(response)
   {
      var birthday = response.birthday.split('/');
      birthday = birthday[2] + "-" + birthday[0] + "-" + birthday[1];
      var params =
      {
         name : response.name,
         email : response.email,
         facebook_email : response.email,
         facebook_id : response.id,
         facebook_uid : response.username,
         gender : (response.gender == "male") ? "m" : "f",
         birthday : birthday,
         photoURL : 'http://graph.facebook.com/' + response.id + '/picture?type=square'
      }

      return params;
   },
   //
   // Log into Facebook
   //
   fbLogin : function(cb, supress)
   {
      var me = this;

      me.cb = cb || Ext.emptyFn;
      FB.login(function(response)
      {
         if (response && (response.status == 'connected') && response.authResponse)
         {
            console.debug("Logged into Facebook!");
            Genesis.db.setLocalDBAttrib('fbExpiresIn', Date.now() + (1000 * response.authResponse['expiresIn']));
            if (me.cb)
            {
               Ext.defer(me.facebook_loginCallback, 3 * 1000, me, [me.cb]);
               delete me.cb;
            }
         }
         else
         {
            console.debug("Login Failed! ...");
            Genesis.db.removeLocalDBAttrib('fbExpiresIn');
            if (!supress)
            {
               Ext.Viewport.setMasked(false);
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : me.fbConnectErrorMsg,
                  buttons : ['Try Again', 'Continue'],
                  callback : function(btn)
                  {
                     if (btn.toLowerCase() == 'try again')
                     {
                        Ext.defer(me.fbLogin, 3 * 1000, me, [cb, supress]);
                     }
                     else
                     {
                        Ext.Viewport.setMasked(false);
                        delete me.cb;
                     }
                  }
               });
            }
         }
      },
      {
         scope : me.fbScope
      });
   },
   facebook_onLogin : function(cb, supress, message)
   {
      var me = this;
      cb = cb || Ext.emptyFn
      var _fbLogin = function()
      {
         if (!supress)
         {
            if (Genesis.db.getLocalDB()['enableFB'])
            {
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : message || me.fbConnectReconnectMsg,
                  buttons : ['Confirm', 'Cancel'],
                  callback : function(btn)
                  {
                     if (btn.toLowerCase() == 'confirm')
                     {
                        Ext.Viewport.setMasked(
                        {
                           xtype : 'loadmask',
                           message : me.connectingToFBMsg
                        });
                        me.fbLogin(cb, supress);
                     }
                  }
               });
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : message || me.fbConnectReqestMsg,
                  buttons : ['OK', 'Cancel'],
                  callback : function(btn)
                  {
                     if (btn.toLowerCase() == 'ok')
                     {
                        Ext.Viewport.setMasked(
                        {
                           xtype : 'loadmask',
                           message : me.connectingToFBMsg
                        });
                        me.fbLogin(cb, supress);
                     }
                  }
               });
            }
         }
         else
         {
            me.fbLogin(cb, supress);
         }
      }
      // Login if connection missing
      var db = Genesis.db.getLocalDB();
      //var refreshConn = (db['currFbId'] > 0);
      var refreshConn = true;
      // Logged into FB currently or before!
      console.debug("facebook_onLogin - FbId = [" + db['currFbId'] + "], refreshConn = " + refreshConn);
      if (refreshConn)
      {
         FB.getLoginStatus(function(response)
         {
            if ((response.status == 'connected') && response.authResponse)
            {
               var expireTime = (!db['fbExpiresIn']) ? 0 : new Date(db['fbExpiresIn']).getTime();
               db['fbAuthCode'] = response.authResponse['authToken'];

               //
               // To-do : Implement Facebook Expiry TimeStamp check
               //
               console.debug('FB ExpiryDate TimeStamp = ' + Date(expireTime) + '\n' + //
               "Already Logged into Facebook, bypass permission request.");

               db['fbExpiresIn'] = Date.now() + (1000 * response.authResponse['expiresIn']);
               Genesis.db.setLocalDB(db);

               // Use Previous Login information!
               if (db['fbResponse'])
               {
                  cb(db['fbResponse'], null);
               }
               else
               {
                  me.facebook_loginCallback(cb);
               }
            }
            else
            {
               _fbLogin();
            }
         });
      }
      else
      {
         _fbLogin();
      }
   },
   facebook_loginCallback : function(cb, count)
   {
      var me = this;

      console.debug("Retrieving Facebook profile information ...");
      count = count || 0;
      cb = cb || Ext.emptyFn;

      FB.api('/me', function(response)
      {
         if (!response.error)
         {
            var db = Genesis.db.getLocalDB();
            var facebook_id = response.id;

            //Ext.Viewport.setMasked(false);
            if (db['currFbId'] == facebook_id)
            {
               console.debug("Session information same as previous session[" + facebook_id + "]");
            }
            else
            {
               console.debug("Session ID[" + facebook_id + "]");
               db['currFbId'] = facebook_id;
               db['fbAccountId'] = response.email;
               db['fbResponse'] = me.createFbResponse(response);
               Genesis.db.setLocalDB(db);
            }

            console.debug('You\`ve logged into Facebook! ' + '\n' + //
            'Email(' + db['fbAccountId'] + ')' + '\n' + //
            'auth_code(' + db['auth_code'] + ')' + '\n' + //
            'ID(' + facebook_id + ')' + '\n');
            me._fb_connect();
            //me.getFriendsList();

            if (db['auth_code'])
            {
               console.debug("Updating Facebook Login Info ...");
               Account['setUpdateFbLoginUrl']();
               Account.load(0,
               {
                  jsonData :
                  {
                  },
                  params :
                  {
                     user : Ext.encode(db['fbResponse'])
                  },
                  callback : function(record, operation)
                  {
                     if (operation.wasSuccessful())
                     {
                        Genesis.db.setLocalDBAttrib('enableFB', true);
                     }
                     if (cb)
                     {
                        cb(db['fbResponse'], operation);
                     }
                  }
               });
            }
            else
            {
               Genesis.db.setLocalDBAttrib('enableFB', true);
               if (cb)
               {
                  cb(db['fbResponse'], null);
               }
            }
         }
         else
         {
            me.facebook_onLogout(null, false);
         }
      });
   },
   _fb_connect : function()
   {
      /*
       $.cookie(Genesis.fbAppId + "_expires", null);
       $.cookie(Genesis.fbAppId + "_session_key", null);
       $.cookie(Genesis.fbAppId + "_ss", null);
       $.cookie(Genesis.fbAppId + "_user", null);
       $.cookie(Genesis.fbAppId, null);
       $.cookie("base_domain_", null);
       $.cookie("fbsr_" + Genesis.fbAppId, null);
       */
   },
   _fb_disconnect : function()
   {
      this._fb_connect();
   },
   facebook_onLogout : function(cb, contactFB)
   {
      var me = this;
      var db = Genesis.db.getLocalDB();

      cb = cb || Ext.emptyFn;
      me._fb_disconnect();
      db['currFbId'] = 0;
      delete db['fbAccountId'];
      delete db['fbResponse'];
      delete db['fbAuthCode'];
      delete db['fbExpiresIn'];
      Genesis.db.setLocalDB(db);

      console.debug("facebook_onLogout");
      Ext.Viewport.setMasked(false);
      try
      {
         if (contactFB)
         {
            FB.logout(function(response)
            {
               //FB.Auth.setAuthResponse(null, 'unknown');
               cb();
            });
         }
         else
         {
            cb();
         }
      }
      catch(e)
      {
         cb();
      }
   },
   //
   // Graph API
   //
   getFbProfilePhoto : function(fbId)
   {
      return 'http://graph.facebook.com/' + fbId + '/picture?type=square';
   }
};

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
            //v = (Genesis.constants.isNative()) ? v : v.split('.')[0];
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
      return Math[(Ext.os.is('Android')) ? 'ceil' : 'floor'](((em / fontsize) * Genesis.constants.defaultFontSize));
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
      var me = this;
      if (Genesis.constants.isNative())
      {
         var rfile;
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
            }, me.failFileHandler);
         }
         window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
         {
            if (Ext.os.is('iOS'))
            {
               rfile = (fileSystem.root.fullPath + '/../' + appName + '.app' + '/www/') + path;
            }
            else
            if (Ext.os.is('Android'))
            {
               wfile = (fileSystem.root.fullPath + appName) + path;
            }
            console.debug("Reading from File - [" + rfile + "]");
            fileSystem.root.getFile(rfile, null, handler, me.failFileHandler);
         }, me.failFileHandler);
      }
      else
      {
         callback();
      }
   },
   writeFile : function(path, content, callback)
   {
      var me = this;
      if (Genesis.constants.isNative())
      {
         var handler = function(fileEntry)
         {
            fileEntry.createWriter(function(writer)
            {
               writer.onwriteend = function(evt)
               {
                  callback();
               };
               writer.write(content);
            }, me.failFileHandler);

         }
         window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
         {
            var wfile;
            if (Ext.os.is('iOS'))
            {
               wfile = (fileSystem.root.fullPath + '/../' + appName + '.app' + '/www/') + path;
            }
            else
            if (Ext.os.is('Android'))
            {
               wfile = ('file:///mnt/sdcard/' + appName) + path;
            }
            fileSystem.root.getFile(wfile,
            {
               create : true,
               exclusive : false
            }, handler, me.failFileHandler);
            console.debug("Writing to File - [" + wfile + "]");
         }, me.failFileHandler);
      }
      else
      {
         callback();
      }
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
   addRedeemSortedDB : function(key)
   {
      var dbS = this.getRedeemSortedDB();

      if (dbS.length >= this.redeemDBSize)
      {
         // Remove the oldest Entry
         console.debug("Database Entry is full, discarded oldest Entry with timestamp (" + Date(dbS[0][1]) + ")");
         dbS = dbS.splice(0, 1);
      }
      else
      {
         dbS['currCount'] = (Ext.isDefined(dbS['currCount'])) ? (dbS['currCount'] + 1) : 0;
      }
      dbS.push(key);
      dbS = Ext.Array.sort(dbS, function(a, b)
      {
         // Compare TimeStamps
         return (a[1] - b[1]);
      });
      this.setRedeemSortedDB(dbS);
   },
   setRedeemSortedDB : function(db)
   {
      //console.debug("Setting KickBak Redeem DB[" + Ext.encode(db) + "]");
      //this.getLocalStorage().setItem('kickbakRedeemSorted', Ext.encode(db));
   },
   redeemDBSync : function()
   {
      var local = this.getLocalStorage();
      local.setItem('kickbakRedeemSorted', Ext.encode(this.kickbakRedeemSorted));
      local.setItem('kickbakRedeemIndex', Ext.encode(this.kickbakRedeemIndex));
   },
   redeemDBCleanup : function()
   {
      console.log("================================");
      console.log("Redeem Database has been Started");
      console.log("================================");

      var now = Date.now();
      var dbI = this.getRedeemIndexDB();
      var dbS = this.getRedeemSortedDB();
      var total = 0;
      var currCount = dbS['currCount'] || -1;
      console.debug('currCount = ' + currCount);

      while ((currCount >= 0) && (dbS.length > 0))
      {
         if (dbS[0][1] > now)
         {
            total++;
            currCount--;

            // Sorted array size is reduced by 1
            delete dbI[dbS[0]];
            dbS = dbS.splice(0, 1);

            dbS['currCount'] = currCount;
         }
         else
         {
            // Cleanup done!
            break;
         }
      }
      Genesis.db.redeemDBSync();

      console.debug('currCount = ' + dbS['currCount'] + ', total = ' + total)
      console.log("=================================");
      console.log("Redeem Database has been resetted");
      console.log("=================================");
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
      Genesis.fb.facebook_onLogout(null, false);
      var db = this.getLocalStorage();
      for (var i in db)
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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.reader.Json
//---------------------------------------------------------------------------------------------------------------------------------
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
//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.proxy.Server
//---------------------------------------------------------------------------------------------------------------------------------

Ext.define('Genesis.data.proxy.OfflineServer',
{
   override : 'Ext.data.proxy.Server',
   processResponse : function(success, operation, request, response, callback, scope)
   {
      var me = this, action = operation.getAction(), reader = me.getReader(), resultSet;
      var app = _application;
      var viewport = app.getController('Viewport');

      if (response.timedout)
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
         var messages = ((resultSet && Ext.isDefined(resultSet.getMessage)) ? (Ext.isArray(resultSet.getMessage()) ? resultSet.getMessage().join(Genesis.constants.addCRLF()) : resultSet.getMessage()) : 'Error Connecting to Server');
         var metaData = reader.metaData ||
         {
         };
         Ext.Viewport.setMasked(false);

         //this callback is the one that was passed to the 'read' or 'write' function above
         if ( typeof callback == 'function')
         {
            callback.call(scope || me, operation);
         }

         //
         // Supress Error Messages on Manual Override
         //
         if (!me.supressErrorsPopup)
         {
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
                     callback : function(btn)
                     {
                        if (metaData['session_timeout'])
                        {
                           viewport.resetView();
                           viewport.redirectTo('main');
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
                  if (messages)
                  {
                     Ext.device.Notification.show(
                     {
                        title : 'Error',
                        message : messages
                     });
                  }
                  break;
            }
         }
         else
         {
            switch (metaData['rescode'])
            {
               //
               // Error from server, display this to user
               //
               case 'server_error' :
               {
                  if (metaData['session_timeout'])
                  {
                     viewport.resetView();
                     viewport.redirectTo('main');
                     return;
                  }
                  else
                  {
                     //
                     // No need to take any action. Let to user try again.
                     //
                  }
                  break;
               }
            }
         }
         console.debug("Ajax ErrorHandler called. Operation(" + operation.wasSuccessful() + ")" + //
         ((messages) ? '\n' + messages : ''));
         me.fireEvent('exception', me, response, operation);
      }
      try
      {
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
      if ((success === true) || (!request.aborted && (Genesis.constants.isNative() === true)))
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
      }
      else
      {
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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.Connection
//---------------------------------------------------------------------------------------------------------------------------------

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
   parseStatus : function(status)
   {
      // see: https://prototype.lighthouseapp.com/projects/8886/tickets/129-ie-mangles-http-response-status-code-204-to-1223
      status = status == 1223 ? 204 : status;

      var success = (status >= 200 && status < 300) || status == 304, isException = false;

      if (Genesis.constants.isNative() && (status === 0))
      {
         success = true;
      }
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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.field.Select
//---------------------------------------------------------------------------------------------------------------------------------
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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.dataview.element.List
//---------------------------------------------------------------------------------------------------------------------------------
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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.tab.Bar
//---------------------------------------------------------------------------------------------------------------------------------
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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.connection.PhoneGap
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.connection.PhoneGap',
{
   override : 'Ext.device.connection.PhoneGap',
   syncOnline : function()
   {
      var type = navigator.network.connection.type;
      this._type = type;
      this._online = (type != Connection.NONE) && (type != Connection.UNKNOWN);
   }
});

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

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.plugin.PullRefresh
//---------------------------------------------------------------------------------------------------------------------------------
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
      var s = '';
      for (var i = 0; i < n; i++)
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
