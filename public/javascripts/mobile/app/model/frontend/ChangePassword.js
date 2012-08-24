Ext.define('Genesis.model.frontend.ChangePassword',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'ChangePassword',
   id : 'ChangePassword',
   config :
   {
      fields : ['oldpassword', 'newpassword'],
      validations : [
      {
         type : 'length',
         field : 'oldpassword',
         min : 6
      },
      {
         type : 'length',
         field : 'newpassword',
         min : 6
      }]
   }
});
