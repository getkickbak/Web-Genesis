Ext.define('Genesis.model.frontend.RewardsMainTemplate',
{
   extend : 'Ext.data.Model',
   id : 'RewardsMainTemplate',
   alternateClassName : 'RewardsMainTemplate',
   config :
   {
      fields : ['id', 'photo_url', 'text'],
      proxy :
      {
         type : 'memory'
      }
   }
});
