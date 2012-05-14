Ext.define('Genesis.controller.server.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      serverRedemption_path : '/serverChallenges'
   },
   xtype : 'serverChallengesCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      refs :
      {
         backButton : 'viewportview button[text=Close]',
         //
         // Challenges
         //
         challenges :
         {
            selector : 'serverchallengesview',
            autoCreate : true,
            xtype : 'serverchallengesview'
         }
      },
      control :
      {
         challenges :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   genAuthCodeMsg : 'Proceed to generate Authorization Code',
   init : function()
   {
      console.log("Server Challenges Init");
   },
   // --------------------------------------------------------------------------
   // Server Challenges Page
   // --------------------------------------------------------------------------
   onActivate : function()
   {
   },
   onDeactivate : function()
   {
   },
   generateQRCode : function()
   {
      var me = this;
      var qrcode;

      // Pick the first key from encrypting
      var qrcode = ControlerBase.genQRCodeFromParams(
      {
         "type" : 'earn_points'
      });
      var app = me.getApplication();
      var controller = app.getController('Prizes');
      app.dispatch(
      {
         action : 'onAuthReward',
         args : [Ext.create('Genesis.model.EarnPrize',
         {
            'id' : 1,
            'expiry_date' : null,
            'reward' : Ext.create('Genesis.model.CustomerReward',
            {
               id : 0,
               title : 'Authorization Code',
               type :
               {
                  value : 'earn_points'
               },
               photo :
               {
                  'thumbnail_ios_medium' :
                  {
                     url : qrcode
                  }
               }
            }),
            'merchant' : null
         })],
         controller : controller,
         scope : controller
      });
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Authorize Challenges',
         message : me.genAuthCodeMsg,
         buttons : ['OK', 'Cancel'],
         callback : function(btn)
         {
            if(btn.toLowerCase() == 'ok')
            {
               console.log(me.genAuthCodeMsg);
               me.generateQRCode();
            }
         }
      });
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
