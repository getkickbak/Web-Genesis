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
   onRedeemItemDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this, viewport = me.getViewPortCntlr();

      //oldActiveItem.removeAll(true);
      viewport.setActiveController(null);
      if (me.scanTask)
      {
         clearInterval(me.scanTask);
         me.scanTask = null;
      }
   },
   /*
    onRefreshTap : function(b, e, eOpts)
    {
    var me = this;
    //Ext.Viewport.setMasked(
    //{
    //xtype : 'loadmask',
    //message : me.refreshAuthCodeMsg
    //});
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
    */
   onGenerateQRCode : function(refresh)
   {
      var me = this, identifiers = null, viewport = me.getViewPortCntlr(), proxy = Challenge.getProxy();
      
      me.dismissDialog = false;
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
            /*
             var qrcode = me.generateQRCode();
             if (qrcode[0])
             {
             console.debug("Rendering QRCode ...");
             */
            {
               var controller = me.getApplication().getController('server.Prizes');
               var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
               var photoUrl =
               {
               };
               /*
                photoUrl[prefix] =
                {
                url : qrcode[0],
                height : qrcode[1] * 1.25,
                width : qrcode[2] * 1.25,
                }
                */
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
                  //photo : photoUrl
                  photo : photoUrl
               });
               controller.fireEvent('authreward', reward);
            }
            //Ext.Viewport.setMasked(null);
         }, 100, me);
      }

      me.challengeItemFn = function(params, closeDialog)
      {
         me.dismissDialog = closeDialog;
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
         console.log("Updating Server with EarnPoints information ... dismissDialog(" + me.dismissDialog + ")");
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
                     buttons : ['OK'],
                     callback : function()
                     {
                        me.popView();
                     }
                  });
               }
               else
               {
                  //proxy._errorCallback = Ext.bind(me.popView, me);
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : 'Challenge',
                     message : me.challengeFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsCallbackFn();
                     }
                  });
               }
            }
         });
      };

      if (Genesis.fn.isNative())
      {
         me.getLocalID(function(ids)
         {
            identifiers = ids;
            me.challengeItemFn(
            {
               data :
               {
                  'frequency' : identifiers['localID']
               }
            }, true);
         }, function()
         {
            viewport.setActiveController(null);
            Ext.Viewport.setMasked(null);
            me.popView();
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
