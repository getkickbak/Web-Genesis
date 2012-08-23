Ext.define('Genesis.model.frontend.Account',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Account',
   id : 'Account',
   config :
   {
      fields : ['name', 'username', 'password'],
      validations : [
      {
         type : 'format',
         field : 'name',
         matcher : /^([a-zA-Z'-]+\s+){1,4}[a-zA-z'-]+$/
      },
      {
         type : 'email',
         field : 'username'
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
            type : 'json'
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
               var viewport = _application.getController('Viewport');
               // Let Other event handlers udpate the metaData first ...
               viewport.fireEvent('updatemetadata', metaData);
            }
         }
      }
   },
   statics :
   {
      setPasswdResetUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/account/reset_password');
      },
      setPasswdChangeUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/account/change_password');
      }
   }
});
