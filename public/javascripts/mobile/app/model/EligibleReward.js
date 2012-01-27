Ext.define('Genesis.model.EligibleReward',
{
   extend : 'Ext.data.Model',
   id : 'EligibleReward',
   alternateClassName : 'EligibleReward',
   config :
   {
      idProperty : 'reward_id',
      fields : ['reward_id', 'reward_title', 'points_difference', 'type', 'photo_url', 'venue_id'],
      proxy :
      {
         type : (!phoneGapAvailable) ? 'ajax' : 'offlineajax',
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
      setVenueCheckinUrl : function()
      {
         this.getProxy().url = Ext.Loader.getPath("Genesis") + "/store/" + 'eligibleRewards.json';
      },
      setDefault : function()
      {
         this.getProxy().url = Ext.Loader.getPath("Genesis") + "/store/" + 'eligibleRewards.json';
      }
   }
});
