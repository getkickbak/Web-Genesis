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
   verifyQRCode : function(encrypted)
   {
      console.debug("Encrypted Code Length: " + encrypted.length);

      var keys = Genesis.constants.getPrivKey();
      var db = Genesis.constants.getRedeemDB(db);
      for(var key in keys)
      {
         var message = encrypted.split('$');
         console.debug("Decrypted iv[" + message[0] + "], content [" + message[1] + "]");
         try
         {
            var privkey = CryptoJS.enc.Hex.parse(keys[key]);

            console.debug("Decrypted message key[" + keys[key] + "]");
            var data = CryptoJS.AES.decrypt(message[1], privkey,
            {
               mode : CryptoJS.mode.CBC,
               //padding : CryptoJS.pad.NoPadding,
               formatter : Base64Formatter,
               iv : CryptoJS.enc.Hex.parse(message[0])
            }).toString(CryptoJS.enc.Utf8);
            console.debug("Decrypted Data[" + data + "]");
            var decrypted = Ext.decode(data);
            console.debug("Decoded Data!");
            var date = Date.parse(decrypted["expiry_ts"]);

            if(db[message[0]])
            {
               console.log("Decrypted data is a previous used QRCode");
               break;
            }
            else
            if((date >= Date.now()) && (date <= Date.now().addHours(3 * 2)))
            {
               console.log("Found QRCode type[" + decrypted['type'] + "]");
               switch (decrypted['type'])
               {
                  case 'redeem_prize' :
                     break;
                  case 'redeem_reward' :
                     break;
               }

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
                        type : decrypted['reward'].type,
                        title : decrypted['reward'].title
                     }),
                     'merchant' : null
                  })],
                  controller : controller,
                  scope : controller
               });

               //
               // Add to Persistent Store to make sure it cannot be rescanned again
               //
               db[message[0]] = message[1];
               Genesis.constants.setRedeemDB(db);
               return;
            }
            else
            {
               console.log("Decrypted data used an expired key from Vendor[" + key + "]");
            }
         }
         catch(e)
         {
            console.log("Error decrypted data [" + e + "]");
         }
      }
      Ext.device.Notification.show(
      {
         title : 'Error!',
         message : 'Authorization Code is Invalid'
      });
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
               if(!encrypted)
               {
                  if(Ext.isDefined(encrypted))
                  {
                     encrypted = Genesis.controller.ControllerBase.genQRCodeFromParams(
                     {
                        "type" : 'redeem_reward',
                        "reward" :
                        {
                           type :
                           {
                              value : 'reward'
                           },
                           title : 'Test QR Code'
                        }
                     });
                  }
                  else
                  {
                     return invalidCode();
                  }
               }
               me.verifyQRCode(encrypted);
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

//
// Cleanup Redeem Database every 6 hours
//
var _dbCleanup = function()
{
   Ext.defer(function()
   {
      console.log("===========================");
      console.log("Redeem Database is resetted");
      console.log("===========================");
      Genesis.constants.setRedeemDB(
      {
      });
      _dbCleanup();
   }, 1000 * 60 * 60 * 6);
};

_dbCleanup();
