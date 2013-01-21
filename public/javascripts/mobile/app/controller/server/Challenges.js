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
         challenges :
         {
            selector : 'serverchallengesview',
            autoCreate : true,
            xtype : 'serverchallengesview'
         },
         refreshBtn : 'serverredeemitemdetailview[tag=redeemPrize] button[tag=refresh]'
      },
      control :
      {
         challenges :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         refreshBtn :
         {
            tap : 'onRefreshTap'
         }
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   //genAuthCodeMsg : 'Proceed to generate Authorization Code',
   generatingAuthCodeMsg : 'Generating Code ...',
   refreshAuthCodeMsg : 'Refresing ...',
   challengeSuccessfulMsg : 'Challenge Completed!',
   challengeFailedMsg : 'Failed to Complete Challenge!',
   lookingForMobileDeviceMsg : function()//Send
   {
      return 'Have the customer\'s ' + Genesis.constants.addCRLF() + //
      'Mobile Device ' + Genesis.constants.addCRLF() + //
      'tap against the Terminal'
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Challenges Init");
   },
   generateQRCode : function()
   {
      return this.self.genQRCodeFromParams(
      {
         "type" : 'earn_points'
      }, 'challenge', false);
   },
   // --------------------------------------------------------------------------
   // Server Challenges Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      oldActiveItem.removeAll(true);
   },
   onRefreshTap : function(b, e, eOpts)
   {
      var me = this;
      /*
       Ext.Viewport.setMasked(
       {
       xtype : 'loadmask',
       message : me.refreshAuthCodeMsg
       });
       */
      var app = me.getApplication();
      var controller = app.getController('server.Prizes');
      Ext.defer(function()
      {
         var qrcode = me.generateQRCode();
         if (qrcode[0])
         {
            controller.fireEvent('refreshQRCode', qrcode);
         }
         //Ext.Viewport.setMasked(null);
      }, 100, me);
      me.onGenerateQRCode(true);
   },
   onGenerateQRCode : function(refresh)
   {
      var me = this, task = null, identifiers = null, viewport = me.getViewPortCntlr(), proxy = Challenge.getProxy(), dismissDialog = false;

      if (!refresh)
      {
         /*
          Ext.Viewport.setMasked(
          {
          xtype : 'loadmask',
          message : me.generatingAuthCodeMsg
          });
          */
         Ext.defer(function()
         {
            var qrcode = me.generateQRCode();
            if (qrcode[0])
            {
               console.debug("Rendering QRCode ...");
               var controller = me.getApplication().getController('server.Prizes');
               var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
               var photoUrl =
               {
               };
               photoUrl[prefix] =
               {
                  url : qrcode[0],
                  height : qrcode[1] * 1.25,
                  width : qrcode[2] * 1.25,
               }
               var reward = Ext.create('Genesis.model.CustomerReward',
               {
                  id : 0,
                  title : 'Completing Challenge',
                  type :
                  {
                     value : 'earn_points'
                  },
                  photo : photoUrl
               });
               controller.fireEvent('authreward', reward);
            }
            //Ext.Viewport.setMasked(null);
         }, 100, me);
      }

      me.challengeItemFn = function(params, closeDialog)
      {
         dismissDialog = closeDialog;
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.establishConnectionMsg
         });
         Ext.device.Notification.dismiss();

         params = Ext.merge(params,
         {
            'venue_id' : Genesis.fn.getPrivKey('venueId'),
            data :
            {
               "type" : 'earn_points',
               'expiry_ts' : new Date().addHours(3).getTime()
            }
         });
         params['data'] = me.self.encryptFromParams(params['data']);

         //
         // Updating Server ...
         //
         console.log("Updating Server with EarnPoints information ... dismissDialog(" + dismissDialog + ")");
         Challenge['setCompleteMerchantChallengeURL']();
         Challenge.load(1,
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : params,
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Challenge',
                     message : me.challengeSuccessfulMsg,
                     buttons : ['OK']
                  });
               }
               else
               {
                  /*
                   proxy.supressErrorsPopup = true;
                   Ext.device.Notification.show(
                   {
                   title : 'Challenge',
                   message : me.challengeFailedMsg,
                   buttons : ['Dismiss'],
                   callback : function()
                   {
                   proxy.supressErrorsPopup = false;
                   }
                   });
                   */
               }
            }
         });
      };

      Ext.device.Notification.show(
      {
         title : 'Challenges',
         ignoreOnHide : true,
         message : (Genesis.fn.isNative()) ? me.lookingForMobileDeviceMsg() : me.genQRCodeMsg,
         buttons : ['Cancel'],
         callback : function()
         {
            viewport.setActiveController(null);
            if (task)
            {
               clearInterval(task);
            }
            //
            // Stop receiving ProximityID
            //
            if (Genesis.fn.isNative())
            {
               window.plugins.proximityID.stop();
            }
            else
            if (!dismissDialog)
            {
               Ext.Viewport.setMasked(null);
               me.popView();
            }
         }
      });
      if (Genesis.fn.isNative())
      {
         task = me.getLocalID(function(ids)
         {
            identifiers = ids;
            task = null;
            me.challengeItemFn(
            {
               data :
               {
               },
               'frequency' : Ext.encode(identifiers['localID'])
            }, true);
         }, function()
         {
            viewport.setActiveController(null);
            Ext.Viewport.setMasked(null);
         }, Ext.bind(me.onGenerateQRCode, me, arguments));
         viewport.setActiveController(me);
      }
      else
      {
         me.challengeItemFn(
         {
         }, false);
      }
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      var me = this;
      me.onGenerateQRCode();
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
