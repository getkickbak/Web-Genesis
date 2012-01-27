Ext.define('Genesis.model.frontend.CustomerVenue',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Customer', 'Genesis.model.Venue'],
   alternateClassName : 'CustomerVenue',
   id : 'CustomerVenue',
   config :
   {
      fields:[],
      hasOne : [
      {
         model : 'Genesis.model.Customer',
         associationKey : 'customer',
         // User to make sure no underscore
         getterName : 'getCustomer',
         setterName : 'setCustomer'
      },
      {
         model : 'Genesis.model.Venue',
         associationKey : 'venue',
         // User to make sure no underscore
         getterName : 'getVenue',
         setterName : 'setVenue'
      }],
      proxy :
      {
         type : 'memory'
      }
   }
});
