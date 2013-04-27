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
   inheritableStatics :
   {
      setGetChallengesURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges');
      },
      setCompleteChallengeURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/' + id + '/complete');
      },
      setCompleteMerchantChallengeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/merchant_complete');
      },
      setCompleteReferralChallengeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/complete_referral');
      },
      setSendReferralsUrl : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(serverHost + '/api/v1/challenges/' + id + '/start');
      }
   }
});
