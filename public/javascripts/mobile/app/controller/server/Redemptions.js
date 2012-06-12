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
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverredemptionsview',
            autoCreate : true,
            xtype : 'serverredemptionsview'
         },
         verifyBtn : 'showprizeview[tag=showPrize] button[tag=verify]',
      },
      control :
      {
         redemptions :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         verifyBtn :
         {
            tap : 'onVerifyTap'
         }
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   authCodeNoLongValidMsg : function()
   {
      return 'Authorization Code' + Genesis.constants.addCRLF() + 'is no longer valid'
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Redemptions Init");
   },
   verifyQRCode : function(encrypted)
   {
      console.debug("Encrypted Code Length: " + encrypted.length);
      console.debug("Decrypted content [" + encrypted + "]");

      var me = this;
      var keys = Genesis.constants.getPrivKey();
      GibberishAES.size(256);
      var dbI = Genesis.db.getRedeemIndexDB();
      for (var key in keys)
      {
         try
         {
            console.debug("Decrypting message using key[" + keys[key] + "]");
            data = GibberishAES.dec(encrypted, keys[key]);
            console.debug("Decrypted Data[" + data + "]");
            var decrypted = Ext.decode(data);
            console.debug("Decoded Data!");
            var date = new Date(decrypted["expiry_ts"]);

            if (dbI[encrypted])
            {
               console.log(me.authCodeNoLongValidMsg());
               Ext.device.Notification.show(
               {
                  title : 'Error!',
                  message : me.authCodeNoLongValidMsg()
               });
               return;
            }
            else
            if ((date >= Date.now()) && (date <= new Date().addHours(3 * 2)))
            {
               console.log("Found QRCode type[" + decrypted['type'] + "]");
               switch (decrypted['type'])
               {
                  case 'redeem_prize' :
                     break;
                  case 'redeem_reward' :
                     break;
               }

               //
               // Add to Persistent Store to make sure it cannot be rescanned again
               //
               Genesis.db.addRedeemSortedDB([encrypted, dbI[encrypted]]);
               Genesis.db.addRedeemIndexDB(encrypted, decrypted["expiry_ts"]);

               var controller = me.getApplication().getController('Prizes');
               controller.fireEvent('authreward', Ext.create('Genesis.model.EarnPrize',
               {
                  //'id' : 1,
                  'expiry_date' : null,
                  'reward' : Ext.create('Genesis.model.CustomerReward',
                  {
                     type : decrypted['reward'].type,
                     title : decrypted['reward'].title
                  }),
                  'merchant' : null
               }));
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
         message : me.invalidAuthCodeMsg
      });
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   onScannedQRcode : function(encrypted)
   {
      var me = this;
      if (!encrypted)
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
   },
   onRedeemVerification : function()
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Redemption Verification',
         message : 'Proceed to scan your customer\'s Authorization Code',
         buttons : ['OK', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'ok')
            {
               console.log("Verifying Authorization Code ...");
               me.scanQRCode();
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
      var page = this.getRedemptions();
      return page;
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
      Genesis.db.redeemDBCleanup();
      _dbCleanup();
   }, 1000 * 60 * 60 * 3);
};

_dbCleanup();
