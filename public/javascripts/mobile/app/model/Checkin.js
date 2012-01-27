Ext.define('Genesis.model.Checkin',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Checkin',
   id : 'Checkin',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.User',
         getterName : 'getUser',
         setterName : 'setUser'
      },
      {
         model : 'Genesis.model.Venue',
         getterName : 'getVenue',
         setterName : 'setVenue'
      }],
      fields : ['id', 'time', 'user_id', 'venue_id']
   },
   getUser : function()
   {

   },
   getVenue : function()
   {

   }
});
