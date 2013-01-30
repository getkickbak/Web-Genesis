Ext.define('Genesis.controller.client.mixin.RedeemBase',
{
   extend : 'Ext.mixin.Mixin',
   inheritableStatics :
   {
   },
   config :
   {
   },
   redeemFbMsg : 'Use your KICKBAK card or mobile app to earn rewards in your local area',
   needPointsMsg : function(pointsDiff)
   {
      return ('You need ' + pointsDiff + ' more points ' + Genesis.constants.addCRLF() + 'to be eligible for this item.');
   },
   retrievingQRCodeMsg : 'Retrieving QRCode ...',
   showQrCodeMsg : 'Show this Authorization Code to your merchant to redeem!',
   redeemItemConfirmMsg : 'Please confirm to redeem this item',
   updateOnFbMsg : 'Would you like to tell your friends on Facebook about it?',
   redeemItemEmailMsg : function(redemptionName, venueName)
   {
      return ('I just got "' + redemptionName + '" from ' + venueName + '!');
   },
   updatingRedemptionOnFacebook : function(earnprize)
   {
      var me = this, FB = window.plugins.facebookConnect;
      try
      {
         var viewport = me.getViewPortCntlr(), venue = viewport.getVenue(), site = Genesis.constants.site;
         var wsite = venue.get('website') ? venue.get('website').split(/http[s]*:\/\//) : [null];
         var name = venue.get('name'), link = wsite[wsite.length - 1] || site, desc = me.redeemFbMsg;//venue.get('description').trunc(256);
         var message = me.redeemItemEmailMsg(earnprize.get('title'), venue.get('name'));
         var params =
         {
         }
         console.log('Posting Redemption to Facebook ...' + '\n' + //
         'Name: ' + name + '\n' + //
         'Caption: ' + link + '\n' + //
         'Description: ' + desc + '\n' + //
         'Message : ' + message + '\n' //
         );
         /*,params1 = Ext.urlEncode({
          og_url : encodeURIComponent(link),
          og_type : getkickbak:rewards,
          og_title : 'KICKBAK Rewards',
          og_image : encodeURIComponent(venue.getMerchant().get('photo')['thumbnail_large_url']),
          og_description : desc,
          body : message
          });
          switch (me.getTitle().toLowerCase())
          {
          case 'rewards' :
          {
          params['rewards'] = Genesis.constants.host + "/opengraph?" + params1;
          break;
          }
          case 'prizes' :
          {
          params['prizes'] = Genesis.constants.host + "/opengraph?" + params1;
          break;
          }
          }
          */
         FB.requestWithGraphPath(//
         '/me/feed',
         //'/me/getkickbak:got',
         Ext.apply(params,
         {
            name : name,
            //link : href,
            link : link,
            caption : link,
            description : desc,
            picture : venue.getMerchant().get('photo')['thumbnail_large_url'],
            message : message
         }), 'POST', function(response)
         {
            if (!response || response.error || Ext.isString(response))
            {
               console.log('Post was not published to Facebook.');
            }
            else
            {
               console.log('Posted to your Facebook Newsfeed.');
            }
         });
      }
      catch (e)
      {
         console.log('Exception [' + e + ']' + '\n' + //
         'Post was not published to Facebook.');
      }
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   updateMetaDataInfo : function(metaData)
   {
      var me = this, customer = me.callParent(arguments);

      //
      // Claim Reward Item by showing QRCode to Merchant Device!
      //
      if (metaData['data'])
      {
         me.fireEvent('showQRCode', 0, metaData['data']);
      }

      return customer;
   },
   // --------------------------------------------------------------------------
   // Handler Functions
   // --------------------------------------------------------------------------
   onRedeemItem : function(btn, venue, view)
   {
      var me = this, FB = window.plugins.facebookConnect, identifiers = null, proxy = CustomerReward.getProxy();
      var venueId = (venue) ? venue.getId() : 0, item = view.getInnerItems()[0], db = Genesis.db.getLocalDB();
      var storeName = me.getRedeemStore(), store = Ext.StoreMgr.get(storeName);
      var params =
      {
         venue_id : venueId
      };
      me.redeemItemFn = function(params)
      {
         //
         // Updating Server ...
         //
         console.debug("Updating Server ...");
         if (me.getSRedeemBtn())
         {
            me.getSRedeemBtn()['hide']();
         }
         CustomerReward[me.getRedeemPointsFn()](item.getData().getId());
         store.load(
         {
            addRecords : true, //Append data
            scope : me,
            //timeout : 30*1000,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : params,
            callback : function(records, operation)
            {
               //
               // Stop broadcasting now ...
               //
               if (identifiers)
               {
                  identifiers['cancelFn']();
               }
               Ext.Viewport.setMasked(null);

               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.beep();

                  //Update on Facebook
                  if ((db['currFbId'] > 0) && ( typeof (FB) != "undefined"))
                  {
                     Genesis.fb.facebook_onLogin(function(params)
                     {
                        var redeemItem = store.getById(item.getData().getId());
                        Ext.Viewport.setMasked(null);
                        me.updatingRedemptionOnFacebook(redeemItem);
                     }, false, me.updateOnFbMsg);
                  }

                  Ext.device.Notification.show(
                  {
                     title : me.getRedeemPopupTitle(),
                     message : me.redeemSuccessfulMsg,
                     buttons : ['OK'],
                     callback : function()
                     {
                        me.onDoneTap();
                     }
                  });
               }
               else
               {
                  if (me.getSRedeemBtn())
                  {
                     me.getSRedeemBtn()['show']();
                  }
                  proxy.supressErrorsPopup = true;
                  Ext.device.Notification.show(
                  {
                     title : me.getRedeemPopupTitle(),
                     message : me.redeemFailedMsg,
                     buttons : ['Dismiss'],
                     callback : function()
                     {
                        proxy.supressErrorsPopup = false;
                        me.onDoneTap();
                     }
                  });
               }
            }
         });
      };

      if (Genesis.fn.isNative())
      {
         me.broadcastLocalID(function(ids)
         {
            identifiers = ids;
            Ext.Viewport.setMasked(
            {
               xtype : 'mask',
               cls : 'transmit-mask',
               html : me.lookingForMerchantDeviceMsg(),
               listeners :
               {
                  'tap' : function(b, e, eOpts)
                  {
                     //
                     // Stop broadcasting now ...
                     //
                     if (!Ext.get(Ext.DomQuery.select('.x-innerhtml',b.element.dom)[0]).getPageBox(true).isOutOfBound(
                     {
                        x : e.pageX,
                        y : e.pageY
                     }))
                     {
                        Ext.Ajax.abort();
                        if (me.identifiers)
                        {
                           me.identifiers['cancelFn']();
                        }
                        Ext.Viewport.setMasked(null);
                        me.onDoneTap();
                        Ext.device.Notification.show(
                        {
                           title : me.getRedeemPopupTitle(),
                           message : me.transactionCancelledMsg,
                           buttons : ['Dismiss']
                        });
                     }
                  }
               }
            });
            console.log("Broadcast underway ...");
            me.redeemItemFn(Ext.apply(params,
            {
               'frequency' : Ext.encode(identifiers['localID'])
            }));
         }, function()
         {
            Ext.Viewport.setMasked(null);
         });
      }
      else
      {
         me.redeemItemFn(params);
      }
   },
   onRedeemItemTap : function(b, e, eOpts, eInfo)
   {
      var me = this, btn = b, viewport = me.getViewPortCntlr(), venue = viewport.getVenue();
      var view = me.getRedeemMainPage(), title = view.query('titlebar')[0].getTitle();

      //console.debug("onRedeemItemTap - Mode[" + me.getRedeemMode() + "]");
      switch (me.getRedeemMode())
      {
         case 'redeemPrize' :
         case 'redeemReward' :
         {
            var send = function()
            {
               Ext.device.Notification.show(
               {
                  title : title,
                  message : me.redeemItemConfirmMsg,
                  buttons : ['Confirm', 'Cancel'],
                  callback : function(b)
                  {
                     if (b.toLowerCase() == 'confirm')
                     {
                        me.fireEvent('redeemitem', btn, venue, view);
                     }
                  }
               });
            };

            if (Genesis.fn.isNative())
            {
               Ext.Viewport.setMasked(
               {
                  xtype : 'loadmask',
                  message : me.prepareToSendMerchantDeviceMsg
               });
               window.plugins.proximityID.preLoadSend(function()
               {
                  Ext.Viewport.setMasked(null);
                  Ext.defer(send, 0.25 * 1000, me);
               });
            }
            else
            {
               send();
            }
            break;
         }
      }
   },
   onRedeemItemShowView : Ext.emptyFn,
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   onShowItemQRCode : function(timeout, qrcode)
   {
      var me = this;
      var _qrcode;
      var title = 'Redeem ' + me.getTitle();

      /*
       console.log("\n" + //
       "Encrypted Code :\n" + qrcode + "\n" + //
       "Encrypted Code Length: " + qrcode.length);
       */
      _qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      if (_qrcode[0])
      {
         var dom = Ext.DomQuery.select('div.itemPoints',me.getRedeemItem().element.dom)[0];
         if (me.getSRedeemBtn())
         {
            me.getSRedeemBtn().hide();
         }
         if (me.getSDoneBtn())
         {
            me.getSDoneBtn()['show']();
         }
         me.getSCloseBB().hide();
         if (dom)
         {
            Ext.fly(dom).addCls('x-item-hidden');
         }

         me.fireEvent('refreshQRCode', _qrcode);

         Ext.Viewport.setMasked(null);
         Ext.device.Notification.show(
         {
            title : title,
            message : me.showQrCodeMsg,
            buttons : ['OK']
         });
         Ext.device.Notification.vibrate();
      }
      else
      {
         console.debug("onShowItemQRCode - QR Code encoding Error");
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redeemBrowseSCPage : function()
   {
      this.openPage('redeemBrowseSC');
      if (this.getCloseBtn())
      {
         this.getCloseBtn().hide();
         this.getBackBtn().show();
      }
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
