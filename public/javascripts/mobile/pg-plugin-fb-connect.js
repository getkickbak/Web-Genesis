(function()
{
   var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;
   CDV = ( typeof CDV == 'undefined' ?
   {
   } : CDV );
   CDV.FB =
   {
      init : function(apiKey, fail)
      {
         // create the fb-root element if it doesn't exist
         if(!document.getElementById('fb-root'))
         {
            var elem = document.createElement('div');
            elem.id = 'fb-root';
            document.body.appendChild(elem);
         }
         cordovaRef.exec(function()
         {
            var authResponse = JSON.parse(localStorage.getItem('pg_fb_session') || '{"expiresIn":0}');
            if(authResponse && authResponse.expirationTime)
            {
               var nowTime = (new Date()).getTime();
               if(authResponse.expirationTime > nowTime)
               {
                  FB.Auth.setAuthResponse(authResponse, 'connected');
               }
            }
            console.log('Cordova Facebook Connect plugin initialized successfully.');
         }, ( fail ? fail : null), 'FacebookConnect', 'init', [apiKey]);
      },
      login : function(params, cb, fail)
      {
         params = params ||
         {
            scope : ''
         };
         cordovaRef.exec(function(e)
         {
            // login
            if(e.authResponse && e.authResponse.expiresIn)
            {
               var expirationTime = e.authResponse.expiresIn === 0 ? 0 : (new Date()).getTime() + e.authResponse.expiresIn * 1000;
               e.authResponse.expirationTime = expirationTime;
            }
            localStorage.setItem('pg_fb_session', JSON.stringify(e.authResponse));
            FB.Auth.setAuthResponse(e.authResponse, 'connected');
            if(cb)
               cb(e);
         }, ( fail ? fail : null), 'FacebookConnect', 'login', params.scope.split(','));
      },
      logout : function(cb, fail)
      {
         cordovaRef.exec(function(e)
         {
            localStorage.removeItem('pg_fb_session');
            FB.Auth.setAuthResponse(null, 'notConnected');
            if(cb)
               cb(e);
         }, ( fail ? fail : null), 'FacebookConnect', 'logout', []);
      },
      getLoginStatus : function(cb, fail)
      {
         cordovaRef.exec(function(e)
         {
            if(cb)
               cb(e);
         }, ( fail ? fail : null), 'FacebookConnect', 'getLoginStatus', []);
      },
      dialog : function(params, cb, fail)
      {
         cordovaRef.exec(function(e)
         {
            // login
            if(cb)
               cb(e);
         }, ( fail ? fail : null), 'FacebookConnect', 'showDialog', [params]);
      }
   };
})();
