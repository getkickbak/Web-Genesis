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
   scanAuthCodeMsg : 'Proceed to scan your customer\'s Authorization Code',
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
   onVerifyChallenges : function()
   {
      var me = this;
      var invalidCode = function()
      {
         Ext.device.Notification.show(
         {
            title : 'Error!',
            message : me.invalidAuthCodeMsg
         });
      }
      me.scanQRCode(
      {
         callback : function(encrypted)
         {
            var privkey = CryptoJS.enc.Hex.parse(me.getPrivKey());
            if(!encrypted)
            {
               if(Ext.isDefined(encrypted))
               {
                  var iv = CryptoJS.enc.Hex.parse(Math.random().toFixed(20).toString().split('.')[1]);

                  encrypted = iv + '$' + CryptoJS.AES.encrypt(Ext.encode(
                  {
                     ":expirydate" : new Date().addDays(1).format('Y-M-d')
                  }), privkey,
                  {
                     iv : iv
                  });
               }
               else
               {
                  return;
               }
            }

            try
            {
               console.log("Encrypted Code Length: " + encrypted.length);

               var message = encrypted.split('$');
               var decrypted = Ext.decode(CryptoJS.enc.Utf8.stringify((CryptoJS.AES.decrypt(message[1], privkey,
                  {
                     iv : iv
                  }))));

               var expiryDate = decrypted[":expirydate"];

               if((Date.parse(expiryDate) - Date.parse(new Date().format('Y-M-d'))) > 0)
               {
                  var app = me.getApplication();
                  var controller = app.getController('Prizes');
                  app.dispatch(
                  {
                     action : 'onAuthReward',
                     args : [Ext.create('Genesis.model.EarnPrize',
                     {
                        'id' : 1,
                        'expiry_date' : null,
                        'reward' : record,
                        'merchant' : null
                     })],
                     controller : controller,
                     scope : controller
                  });
               }
               else
               {
                  invalidCode();
               }
            }
            catch(e)
            {
               console.log("Exception reading QR Code - [" + e.message + "]");
               invalidCode();
            }
         }
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
         title : 'Verify Challenges',
         message : me.scanAuthCodeMsg,
         buttons : ['OK', 'Cancel'],
         callback : function(btn)
         {
            if(btn.toLowerCase() == 'ok')
            {
               console.log("Verifying Authorization Code ...");
               me.onVerifyChallenges();
            }
         }
      });
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
