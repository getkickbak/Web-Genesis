Ext.define('Genesis.controller.server.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   inheritableStatics :
   {
   },
   xtype : 'serverChallengesCntlr',
   config :
   {
      models : ['PurchaseReward', 'CustomerReward'],
      refs :
      {
         //
         // Challenges
         //
         challenges : 'serverredeemitemdetailview[tag=redeemPrize]',
         authText : 'serverredeemitemdetailview[tag=redeemPrize] component[tag=authText]'
      },
      control :
      {
         /*,
          refreshBtn :
          {
          tap : 'onRefreshTap'
          }
          */
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   //genAuthCodeMsg : 'Proceed to generate Authorization Code',
   generatingAuthCodeMsg : 'Generating Code ...',
   refreshAuthCodeMsg : 'Refresing ...',
   challengeSuccessfulMsg : 'Challenge Completed!',
   challengeFailedMsg : 'Failed to Complete Challenge!',
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Challenges Init");
   },
   // --------------------------------------------------------------------------
   // Server Challenges Page
   // --------------------------------------------------------------------------
   redeemItemCb : function()
   {
      var me = this, viewport = me.getViewPortCntlr();

      //oldActiveItem.removeAll(true);
      viewport.setActiveController(null);
      clearInterval(me.scanTask);
      me.scanTask = null;
      //
      // Stop receiving ProximityID
      //
      window.plugins.proximityID.stop();
   },
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      this.redeemItemCb();
   },
   onRedeemChallenges : function(refresh)
   {
      var me = this, viewport = me.getViewPortCntlr(), proxy = Challenge.getProxy();
      var params =
      {
         version : Genesis.constants.serverVersion,
         'venue_id' : Genesis.fn.getPrivKey('venueId')
      }
      me.dismissDialog = false;
      if (!refresh)
      {
         Ext.defer(function()
         {
            var controller = me.getApplication().getController('server' + '.Prizes');
            var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
            var photoUrl =
            {
            };
            photoUrl[prefix] =
            {
               url : me.self.getPhoto(
               {
                  value : 'transmit'
               })
            }
            var reward = Ext.create('Genesis.model.CustomerReward',
            {
               id : 0,
               title : 'Authorization',
               type :
               {
                  value : 'earn_points'
               },
               photo : photoUrl
            });
            controller.fireEvent('authreward', reward);
         }, 100, me);
      }

      me.challengeItemFn = function(p, closeDialog)
      {
         me.dismissDialog = closeDialog;
         me.redeemItemCb();
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         //Ext.device.Notification.dismiss();

         //
         // Updating Server ...
         //
         console.debug("Updating Server with Challenge information ... dismissDialog(" + me.dismissDialog + ")");

         Challenge['setCompleteMerchantChallengeURL']();
         Challenge.load(1,
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : Ext.apply(params, p),
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Challenge',
                     message : me.challengeSuccessfulMsg,
                     buttons : ['OK'],
                     callback : function()
                     {
                        me.popView();
                     }
                  });
               }
               else
               {
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : 'Challenge',
                     message : me.challengeFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsCallbackFn();
                        me.popView();
                     }
                  });
               }
            }
         });
      };

      me.identifiers = null;
      me.getLocalID(function(ids)
      {
         me.identifiers = ids;
         me.challengeItemFn(
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : me.identifiers['localID'],
               'expiry_ts' : new Date().addHours(3).getTime()
            }, 'reward')
         }, true);
      }, function()
      {
         viewport.setActiveController(null);
         Ext.Viewport.setMasked(null);
         me.popView();
      }, Ext.bind(me.onRedeemChallenges, me, arguments));
      viewport.setActiveController(me);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      var me = this;
      me.onRedeemChallenges();
   },
   isOpenAllowed : function()
   {
      return true;
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'transmit' :
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               break;
         }
         return photo_url;
      }
   }
});
