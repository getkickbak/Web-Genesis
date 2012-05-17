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
         },
         verifyButton : 'rewarditem button[tag=verify]'
      },
      control :
      {
         redemptions :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         verifyButton :
         {
            tap : 'onVerifyTap'
         }
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   init : function()
   {
      console.log("Server Redemptions Init");
   },
   verifyQRCode : function(encrypted)
   {
      console.debug("Encrypted Code Length: " + encrypted.length);
      console.debug("Decrypted content [" + encrypted + "]");

      var me = this;
      var keys = Genesis.constants.getPrivKey();
      var db = Genesis.constants.getRedeemDB();
      GibberishAES.size(256);
      for(var key in keys)
      {
         try
         {
            console.debug("Decrypting message using key[" + keys[key] + "]");
            data = GibberishAES.dec(encrypted, keys[key]);
            console.debug("Decrypted Data[" + data + "]");
            var decrypted = Ext.decode(data);
            console.debug("Decoded Data!");
            var date = new Date(decrypted["expiry_ts"]);

            if(db[encrypted])
            {
               console.log("Decrypted data is a previous used QRCode");
               break;
            }
            else
            if((date >= Date.now()) && (date <= new Date().addHours(3 * 2)))
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
               db[encrypted] = true;
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
      var verify = function()
      {
         me.scanQRCode(
         {
            callback : function(encrypted)
            {
               if(!encrypted)
               {
                  /*
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
                   */
                  {
                     Ext.device.Notification.show(
                     {
                        title : 'Error!',
                        message : me.invalidAuthCodeMsg
                     });
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
   onVerifyTap : function(b, e, eOpts)
   {
      this.popView();
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
