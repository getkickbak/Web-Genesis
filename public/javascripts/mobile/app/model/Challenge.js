Ext.define('Genesis.model.Challenge',
{
   extend : 'Ext.data.Model',
   id : 'Challenge',
   alternateClassName : 'Challenge',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      fields : ['id', 'type', 'name', 'description',
      // Image associated with the Challenge
      'require_verif', 'data', 'points', 'created_ts', 'update_ts', 'photo', 'merchant_id', 'venue_id'],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   getMerchant : function()
   {

   },
   statics :
   {
      setGetChallengesURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/challenges' : Ext.Loader.getPath("Genesis") + "/store/" + 'challenges.json');
      },
      setCompleteChallengeURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/challenges/' + id + '/complete');
      },
      setCompleteReferralChallengeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/challenges/complete_referral');
      },
      setSendReferralsUrl : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/challenges/' + id + '/start');
      }
   }
});
