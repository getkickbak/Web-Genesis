Ext.define('Genesis.model.frontend.Signin',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Signin',
   id : 'Sigin',
   config :
   {
      fields : ['username', 'password'],
      validations : [
      {
         type : 'email',
         field : 'username'
      },
      {
         type : 'length',
         field : 'password',
         min : 6
      }]
   }
});
