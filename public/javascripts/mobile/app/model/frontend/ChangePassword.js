Ext.define('Genesis.model.frontend.ChangePassword',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'ChangePassword',
   id : 'ChangePassword',
   config :
   {
      fields : ['username', 'password', 'confirmpassword'],
      validations : [
      {
         type : 'email',
         field : 'username'
      },
      {
         type : 'length',
         field : 'password',
         min : 6
      },
      {
         type : 'length',
         field : 'confirmpassword',
         min : 6
      }]
   }
});
