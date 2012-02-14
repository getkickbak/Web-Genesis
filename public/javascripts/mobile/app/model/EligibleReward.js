Ext.define('Genesis.model.EligibleReward',
{
   extend : 'Ext.data.Model',
   id : 'EligibleReward',
   alternateClassName : 'EligibleReward',
   config :
   {
      idProperty : 'reward_id',
      fields : ['reward_id', 'reward_title', 'points_difference', 'type', 'photo_url',
      // Frontend field
      'venue_id'],
      proxy :
      {
         type : 'ajax',
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'eligibleRewards.json',
         reader :
         {
            type : 'json',
            rootProperty : 'eligibleRewards'
         }
      }
   },
   statics :
   {
      setVenueScanCheckinUrl : function()
      {
         this.getProxy().url = Ext.Loader.getPath("Genesis") + "/store/" + 'eligibleRewards.json';
      },
      setVenueCheckinUrl : function()
      {
         this.getProxy().url = Ext.Loader.getPath("Genesis") + "/store/" + 'eligibleRewards.json';
      },
      setVenueExploreUrl : function()
      {
         this.getProxy().url = Ext.Loader.getPath("Genesis") + "/store/" + 'eligibleRewards.json';
      }
   }
});
