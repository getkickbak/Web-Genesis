Ext.define('KickBak.model.frontend.Account',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Account',
   id : 'Account',
   config :
   {
      fields : ['name', 'email', 'gender',
      {
         type : 'date',
         name : 'birthday',
         dateFormat : 'time'
      }, 'phone', 'password', 'username'],
      validations : [
      /*
       {
       type : 'format',
       field : 'name',
       matcher : /^([a-zA-Z'-]+\s+){1,4}[a-zA-z'-]+$/
       //matcher : /[\w]+([\s]+[\w]+){1}+/
       },
       {
       type : 'email',
       field : 'email'
       },
       */
      {
         type : 'format',
         field : 'phone',
         matcher : /^(\d{3})\D*(\d{3})\D*(\d{4})\D*(\d*)$/
      },
      {
         type : 'length',
         field : 'password',
         min : 6
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'user'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         listeners :
         {
            'metachange' : function(proxy, metaData, eOpts)
            {
               var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
               // Let Other event handlers udpate the metaData first ...
               viewport.fireEvent('updatemetadata', metaData);
            }
         }
      }
   },
   inheritableStatics :
   {
   	phoneRegex : /^(\d{3})\D*(\d{3})\D*(\d{4})\D*(\d*)$/,
      setUpdateFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/update_facebook_info');
      },
      setPasswdResetUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/reset_password');
      },
      setPasswdChangeUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/change_password');
      },
      setRefreshCsrfTokenUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/tokens/get_csrf_token');
      },
      setUpdateRegUserDeviceUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/register_user_device');
      },
      setUpdateAccountUrl : function()

      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/account/update');
      }
   }
});
