//---------------------------------------------------------------------------------------------------------------------------------
// System Functions
//---------------------------------------------------------------------------------------------------------------------------------
Ext.ns('Genesis.constants');

Genesis.contants =
{
   site : 'www.justformyfriends.com',
   // **************************************************************************
   // Facebook API
   /*
   * Clean up any Facebook cookies, otherwise, we have page loading problems
   * One set for production domain, another for developement domain
   */
   // **************************************************************************
   facebook_onLogout : function()
   {
      try
      {
         _fb_disconnect();
         _logout();
         FB.logout(function(response)
         {
            Genesis.ajax(false, Genesis.sign_out_path, 'GET', null, 'json', function()
            {
               setTimeout(function()
               {
                  window.location.reload(true);
               }, 0);
            });
         });
      }
      catch(e)
      {
         Genesis.ajax(false, Genesis.sign_out_path, 'GET', null, 'json', function()
         {
            setTimeout(function()
            {
               window.location.reload(true);
            }, 0);
         });
      }
   },
   facebook_loginCallback : function(forceReload)
   {
      FB.api('/me', function(response)
      {
         if(response.id == null)
         {
            //if($("#fb_account")[0])
            {
               // Show Login Button to log into Facebook
               facebook_onLogout();
            }
            return;
         }
         var facebook_id = response.id;
         var showLogin = function()
         {
            $("#fb_login").css("display", "none");
            $('#topbar .secondary-nav > li:not([id="fb_login"])').css('display', '');
            $("#fb_login_img").html('<img src="http://graph.facebook.com/' + facebook_id + '/picture?type=square"/>');
            $("#fb_login_img").css("display", "");

            _fb_connect();
            _login();
            var msg = $("#notice").text();
            if(msg)
            {
               Genesis.showWarningMsg(msg, null, true);
            }
         }
         if(Genesis.popupDialog.data().modal.isShown)
            Genesis.popupDialog.modal('hide');
         if(!$("#fb_account")[0] || (Genesis.currFbId != facebook_id) || forceReload)
         {
            var name = response.name;
            var email = response.email;
            var facebook_uid = response.username;
            var gender = response.gender == "male" ? "m" : "f";
            var birthday = response.birthday.split('/');
            birthday = birthday[2] + "-" + birthday[0] + "-" + birthday[1];
            var params = "name=" + name + "&email=" + email + "&facebook_id=" + facebook_id + "&facebook_uid=" + facebook_uid + "&gender=" + gender + "&birthday=" + birthday;
            Genesis.ajax(false, Genesis.sign_in_path, 'POST', params, 'json', function(response)
            {
               if(!$("#fb_account")[0] || forceReload)
               {
                  setTimeout(function()
                  {
                     window.location.reload(true);
                  }, 0);
               }
               else
               {
                  Genesis.currFbId = facebook_id;
                  if($("#fb_account")[0])
                  {
                     showLogin();
                  }
               }
            });
         }
         else
         {
            showLogin();
         }
      });
   },
   facebook_onLogin : function(forceReload)
   {
      $("#fb_login").css("display", "none");
      if($("#fb_account")[0])
      {
         facebook_loginCallback(forceReload);
      }
      else
      {
         var _fbLogin = function()
         {
            FB.login(function(response)
            {
               if((response.status == 'connected') && response.authResponse)
               {
                  Genesis.access_token = response.authResponse.accessToken;
                  facebook_loginCallback(forceReload);
               }
            },
            {
               scope : Genesis.perms
               //perms : Genesis.perms
            });
         };
         //Browser Quirks
         if($.client.browser == 'Safari')
         {
            FB.getLoginStatus(function(response)
            {
               if((response.status == 'connected') && response.authResponse)
               {
                  Genesis.access_token = response.authResponse.accessToken;
                  facebook_loginCallback(forceReload);
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
      }
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
   }
};
Genesis.contants._fb_disconnect = Genesis.constants._fb_connect;

Genesis.fn =
{
   addUnit : function(unit)
   {
      return unit + 'px';
   },
   _removeUnitRegex : /(\d+)px/,
   removeUnit : function(unit)
   {
      return unit.match(this._removeUnitRegex)[1];
   }
}

Ext.define('Genesis.dom.Element',
{
   override : 'Ext.dom.Element',
   setMargin : function(margin, unit)
   {
      if(margin || margin === 0)
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
      if(padding || padding === 0)
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
Ext.define('Genesis.Component',
{
   override : 'Ext.Component',
   updatePadding : function(padding)
   {
      this.innerElement.setPadding(padding, this.getInitialConfig().defaultUnit);
   },
   updateMargin : function(margin)
   {
      this.element.setMargin(margin, this.getInitialConfig().defaultUnit);
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.AjaxProxy
//---------------------------------------------------------------------------------------------------------------------------------

Ext.define('Genesis.data.proxy.OfflineServer',
{
   override : 'Ext.data.proxy.Server',
   processResponse : function(success, operation, request, response, callback, scope)
   {
      var me = this, action = operation.getAction(), reader, resultSet;

      // Assume Success if running under PhotoGap even if StatusCode == 0
      if((success === true) || (phoneGapAvailable === true))
      {
         reader = me.getReader();

         try
         {
            resultSet = reader.process(response);
            //console.log('Ajax call is successful status=[' + response.status + '] url=[' + request.getUrl() + ']');
         }
         catch(e)
         {
            console.log('Ajax call is failed message=[' + e.getMessage() + '] url=[' + request.getUrl() + ']');
            operation.setException(operation,
            {
               status : null,
               statusText : e.getMessage()
            });

            me.fireEvent('exception', this, response, operation);
            return;
         }

         if(operation.process(action, resultSet, request, response) === false)
         {
            this.fireEvent('exception', this, response, operation);
         }
      }
      else
      {
         console.log('Ajax call is failed status=[' + response.status + '] url=[' + request.getUrl() + ']');
         me.setException(operation, response);
         /**
          * @event exception
          * Fires when the server returns an exception
          * @param {Ext.data.proxy.Proxy} this
          * @param {Object} response The response from the AJAX request
          * @param {Ext.data.Operation} operation The operation that triggered request
          */
         me.fireEvent('exception', this, response, operation);
      }

      //this callback is the one that was passed to the 'read' or 'write' function above
      if( typeof callback == 'function')
      {
         callback.call(scope || me, operation);
      }

      me.afterRequest(request, success);
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.data.AjaxProxy
//---------------------------------------------------------------------------------------------------------------------------------

Ext.define('Genesis.data.Connection',
{
   override : 'Ext.data.Connection',

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

      if(phoneGapAvailable && (status === 0))
      {
         success = true;
      }
      if(!success)
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
// Ext.data.association.BelongsTo
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.data.association.BelongsTo',
{
   override : 'Ext.data.association.BelongsTo',
   read : function(record, reader, associationData)
   {
      record[this.getInstanceName()] = reader.read(associationData).getRecords()[0];
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
      if(!this.listPanel)
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

Ext.define('Genesis.navigation.Bar',
{
   override : 'Ext.navigation.Bar',
   /**
    * This creates a proxy of the whole navigation bar and positions it out of the view.
    * This is used so we know where the back button and title needs to be at any time, either if we are
    * animating, not animating, or resizing.
    * @private
    */
   createNavigationBarProxy : function()
   {
      var proxy = this.proxy;

      if(proxy)
      {
         return;
      }

      //create a titlebar for the proxy
      this.proxy = proxy = Ext.create('Ext.TitleBar',
      {
         items : [
         {
            xtype : 'button',
            ui : 'back',
            text : ''
         },
         {
            xtype : 'button',
            iconCls : 'share',
            align : 'right'
         }],
         title : this.backButtonStack[0]
      });

      proxy.backButton = proxy.down('button[ui=back]');

      //add the proxy to the body
      Ext.getBody().appendChild(proxy.renderElement);

      proxy.renderElement.setStyle('position', 'absolute');
      proxy.element.setStyle('visibility', 'hidden');
      proxy.renderElement.setX(0);
      proxy.renderElement.setY(-1000);
   }
});
//
// Temporary Fix until Sencha Touch Team fixes Ext.Loader problem when running in PhoneGap
//

/**
 * Load a script file, supports both asynchronous and synchronous approaches
 *
 * @param {String} url
 * @param {Function} onLoad
 * @param {Scope} scope
 * @param {Boolean} synchronous
 * @private
 */
/*
 Ext.Loader.loadScriptFile = function(url, onLoad, onError, scope, synchronous)
 {
 var isPhantomJS = ( typeof phantom != 'undefined' && phantom.fs);
 var me = this, isFileLoaded = this.isFileLoaded, scriptElements = this.scriptElements, noCacheUrl = url +
 (this.getConfig('disableCaching') ? ('?' + this.getConfig('disableCachingParam') + '=' + Ext.Date.now()) : ''),
 isCrossOriginRestricted = false, xhr, status, onScriptError;

 if(isFileLoaded[url])
 {
 return this;
 }
 scope = scope || this;

 this.isLoading = true;

 if(!synchronous)
 {
 onScriptError = function()
 {
 //<debug error>
 onError.call(scope, "Failed loading '" + url + "', please verify that the file exists", synchronous);
 //</debug>
 };
 if(!Ext.isReady && Ext.onDocumentReady)
 {
 Ext.onDocumentReady(function()
 {
 if(!isFileLoaded[url])
 {
 scriptElements[url] = me.injectScriptElement(noCacheUrl, onLoad, onScriptError, scope);
 }
 });
 }
 else
 {
 scriptElements[url] = this.injectScriptElement(noCacheUrl, onLoad, onScriptError, scope);
 }
 }
 else
 {
 if( typeof XMLHttpRequest != 'undefined')
 {
 xhr = new XMLHttpRequest();
 }
 else
 {
 xhr = new ActiveXObject('Microsoft.XMLHTTP');
 }

 try
 {
 xhr.open('GET', noCacheUrl, false);
 xhr.send(null);
 }
 catch (e)
 {
 isCrossOriginRestricted = true;
 }
 status = (xhr.status === 1223) ? 204 : xhr.status;

 if(!isCrossOriginRestricted)
 {
 isCrossOriginRestricted = (status === 0);
 }

 if(isCrossOriginRestricted
 //<if isNonBrowser>
 && !isPhantomJS
 //</if>
 )
 {
 //<debug error>
 //onError.call(this, "Failed loading synchronously via XHR: '" + url + "'; It's likely that the file is either " + "being
 // loaded from a different domain or from the local file system whereby cross origin " + "requests are not allowed due to
 // security reasons. Use asynchronous loading with " + "Ext.require instead.", synchronous);
 //</debug>
 }
 else
 if(status >= 200 && status < 300
 //<if isNonBrowser>
 || isPhantomJS
 //</if>
 )
 {
 // Debugger friendly, file names are still shown even though they're eval'ed code
 // Breakpoints work on both Firebug and Chrome's Web Inspector
 Ext.globalEval(xhr.responseText + "\n//@ sourceURL=" + url);

 onLoad.call(scope);
 }
 else
 {
 //<debug>
 onError.call(this, "Failed loading synchronously via XHR: '" + url + "'; please " + "verify that the file exists. " + "XHR status
 code: " + status, synchronous);
 //</debug>
 }

 // Prevent potential IE memory leak
 xhr = null;
 }
 }
 */