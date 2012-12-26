Ext.define('Genesis.controller.server.Redemptions',
{
   extend : 'Genesis.controller.RedemptionsBase',
   inheritableStatics :
   {
   },
   xtype : 'serverRedemptionsCntlr',
   controllerType : 'redemption',
   config :
   {
      closeBtn : null,
      redeeemSuccessfulMsg : 'Reward selected has been successfully redeemed!',
      redeemPointsFn : 'setMerchantRedeemPointsURL',
      routes :
      {
      },
      refs :
      {
         backBtn : 'serverredemptionsview button[tag=back]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverredemptionsview',
            autoCreate : true,
            xtype : 'serverredemptionsview'
         },
         redemptionsList : 'serverredemptionsview list[tag=redemptionsList]'
      },
      control :
      {
         verifyBtn :
         {
            tap : 'onVerifyTap'
         }
      },
      listeners :
      {
      }
   },
   verifyQRCode : function(encrypted)
   {
      console.debug("Encrypted Code Length: " + encrypted.length);
      console.debug("Decrypted content [" + encrypted + "]");

      var me = this;
      var keys = Genesis.fn.getPrivKey();
      GibberishAES.size(256);
      var dbI = Genesis.db.getRedeemIndexDB();

      var hdr = encrypted.split('$')[0];
      encrypted = encrypted.split('$')[1];
      var keyUsed = null;
      switch (hdr)
      {
         //
         // Use Rewards Key for Prizes
         //
         case 'p' :
         {
            keyUsed = 'r';
            break;
         }
         //
         // Use Venue Key for Redemptions
         //
         case 'r' :
         {
            keyUsed = 'v';
            break;
         }
      }
      if (keyUsed)
      {
         for (var key in keys)
         {
            if (key.split(keyUsed)[1] > 0)
            {
               try
               {
                  console.debug("Decrypting message using key[" + keys[key] + "]");

                  var data = GibberishAES.dec(encrypted, keys[key]);
                  console.debug("Decrypted Data[" + data + "]");

                  var decrypted = Ext.decode(data);
                  console.debug("Decoded Data!");

                  var date = new Date(decrypted["expiry_ts"]);

                  if (dbI[encrypted])
                  {
                     console.log(me.authCodeNotValidMsg());
                     Ext.device.Notification.show(
                     {
                        title : 'Error!',
                        message : me.authCodeNotValidMsg()
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
                        {
                           if (hdr != 'p')
                           {
                              throw "DataType mismatch (Not a Prize)";
                           }
                           break;
                        }
                        case 'redeem_reward' :
                        {
                           if (hdr != 'r')
                           {
                              throw "DataType mismatch (Not a Reward)";
                           }
                           break;
                        }
                        default :
                           throw "DataType mismatch (No type found!)";
                           break;
                     }

                     //
                     // Add to Persistent Store to make sure it cannot be rescanned again
                     //
                     Genesis.db.addRedeemSortedDB([encrypted, dbI[encrypted]]);
                     Genesis.db.addRedeemIndexDB(encrypted, decrypted["expiry_ts"]);

                     var controller = me.getApplication().getController('server.Prizes');
                     var reward = Ext.create('Genesis.model.CustomerReward',
                     {
                        type : decrypted['reward'].type,
                        title : decrypted['reward'].title
                     });
                     controller.fireEvent('authreward', reward);
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
         }
      }
      Ext.device.Notification.show(
      {
         title : 'Error!',
         message : me.invalidAuthCodeMsg
      });
   },
   decodeQRCode : function()
   {
      var me = this;

      if (Ext.os.is('Android'))
      {
         //
         // NFC
         //
      }
      else
      if (Ext.os.is('iOS'))
      {
         //
         // NFC
         //
         me.getViewPortCntlr().setActiveController(me);
      }

      var task = me.getLocalID(function(identifiers)
      {
         me.onNfc(null,
         {
            'localID' : identifiers['localID']
         });
         //
         // Talk to server to find a matching LocalID
         //
      }, function()
      {
         me.getViewPortCntlr().setActiveController(null);
         Ext.Viewport.setMasked(null);
      });
      console.log("ProximityID : Searching for Local Identity ...");

      return task;
   },
   onRedeemVerification : function()
   {
      var me = this, task;

      //
      // Test code to use NFC
      //
      if (Genesis.fn.isNative())
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.detectMobileDeviceMsg,
            listeners :
            {
               tap : function()
               {
                  clearInterval(task);
                  window.plugins.proximityID.stop();
                  me.getViewPortCntlr().setActiveController(null);
                  Ext.Viewport.setMasked(null);
               }
            }
         });

         task = me.decodeQRCode();
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Redemption Verification',
            message : me.proceedToScanMsg,
            buttons : ['Cancel', 'Proceed'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'proceed')
               {
                  console.log("Verifying Authorization Code ...");
                  me.scanQRCode();
               }
            }
         });
      }
   },
   onVerifyTap : function(b, e, eOpts)
   {
      this.popView();
   },
   onNfc : function(nfcResult)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      //
      // Stop receiving data from NFC
      //
      viewport.setActiveController(null);

      me.redeemItem(
      {
         data : me.self.encryptFromParams(
         {
            'tag_id' : (nfcResult) ? nfcResult['tagID'] : null,
            'expiry_ts' : new Date().addHours(3).getTime()
         }, 'reward')
      });
   },
   onRedeemItem : function(btn, venue, view)
   {
      var me = this, identifiers = null, task = null;
      var viewport = me.getViewPortCntlr();
      var venueId = (venue) ? venue.getId() : 0;
      var item = view.getInnerItems()[0];
      var storeName = me.getRedeemStore();
      var store = Ext.StoreMgr.get(store);
      var params =
      {
         venue_id : venueId
      }

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : (Genesis.fn.isNative()) ? me.lookingForMerchantDeviceMsg : me.retrievingQRCodeMsg,
         listeners :
         {
            tap : function()
            {
               viewport.setActiveController(null);
               if (task)
               {
                  clearInterval(task);
               }
               window.plugins.proximityID.stop();
               Ext.Viewport.setMasked(null);
               me.onDoneTap();
            }
         }
      });

      me.redeemItem = function(params)
      {
         //
         // Stop receiving ProximityID
         //
         window.plugins.proximityID.stop();

         //
         // Update Server
         //
         btn.hide();
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });

         CustomerReward[me.getRedeemPointsFn()](item.getData().getId());
         store.load(
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            params : params,
            callback : function(records, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Redemptions',
                     message : me.redeemSuccessfulMsg,
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
               else
               {
                  btn.show();
                  Ext.device.Notification.show(
                  {
                     title : 'Redemptions',
                     message : me.redeemFailedMsg,
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
            }
         });
      };

      if (Genesis.fn.isNative())
      {
         task = me.getLocalID(function(idx)
         {
            identifiers = idx;
            me.redeemItem(
            {
               'frequency' : Ext.encode(identifiers['localID'])
            });
         }, function()
         {
            viewport.setActiveController(null);
            Ext.Viewport.setMasked(null);
         });
      }
      else
      {
         me.redeemItem(
         {
         });
      }
   }
});

/*
Ext.define('Genesis.controller.server.Redemptions',
{
extend : 'Genesis.controller.RedemptionsBase',
inheritableStatics :
{
},
xtype : 'serverRedemptionsCntlr',
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
verifyBtn : 'showredeemitemdetailview[tag=redeemItem] button[tag=verify]'
},
control :
{
verifyBtn :
{
tap : 'onVerifyTap'
}
}
},
invalidAuthCodeMsg : 'Authorization Code is Invalid',
proceedToScanMsg : 'Proceed to scan your customer\'s Authorization Code',
authCodeNotValidMsg : function()
{
return 'Authorization Code' + Genesis.constants.addCRLF() + 'is no longer valid'
},
init : function()
{
this.callParent(arguments);
console.log("Server Redemptions Init");
},
// --------------------------------------------------------------------------
// Redemptions Page
// --------------------------------------------------------------------------
onCreateView : function(activeItem)
{
},
onActivate : function(activeItem, c, oldActiveItem, eOpts)
{
//activeItem.createView();
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
Ext.device.Notification.show(
{
title : 'Error!',
message : me.invalidAuthCodeMsg
});
}
else
{
me.verifyQRCode(encrypted);
}
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
*/

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
