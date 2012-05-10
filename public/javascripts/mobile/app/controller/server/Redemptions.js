Ext.define('Genesis.controller.server.Redemptions',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      serverRedemption_path : '/serverRedemptions'
   },
   xtype : 'serverRedemptionsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      refs :
      {
         backButton : 'viewportview button[text=Close]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverredemptionsview',
            autoCreate : true,
            xtype : 'serverredemptionsview'
         }
      },
      control :
      {
         redemptions :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      }
   },
   //orderTitle : 'Rewards List',
   //checkoutTitle : 'Check Out',
   init : function()
   {
      console.log("Server Redemptions Init");
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onActivate : function()
   {
   },
   onDeactivate : function()
   {
   },
   onRedeemVerification : function()
   {
      var me = this;
      var invalidCode = function()
      {
         Ext.device.Notification.show(
         {
            title : 'Error!',
            message : 'Authorization Code is Invalid'
         });
      }
      var verify = function()
      {
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
      }
      Ext.device.Notification.show(
      {
         title : 'Redemption Verification',
         message : 'Proceed to scan your customer\'s Authorization Code',
         buttons : ['OK', 'Cancel'],
         callback : function(btn)
         {
            if(btn.toLowerCase() == 'ok')
            {
               console.log("Verifying Authorization Code ...");
               verify();
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getRedemptios();
   },
   openPage : function(subFeature)
   {
      switch(subFeature)
      {
         case 'redemptions' :
         {
            this.onRedeemVerification();
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
