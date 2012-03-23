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
      }]
   }
});
