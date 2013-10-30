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
         var name = venue.get('name'), link = wsite[wsite.length - 1] || site, desc = me.redeemFbMsg;
         //venue.get('description').trunc(256);
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
          params['rewards'] = serverHost + "/opengraph?" + params1;
          break;
          }
          case 'prizes' :
          {
          params['prizes'] = serverHost + "/opengraph?" + params1;
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
               Ext.defer(function(earnprize)
               {
                  var me = this;
                  Genesis.fb.facebook_onLogout(null, false);
                  Genesis.fb.facebook_onLogin(function()
                  {
                     me.updatingRedemptionOnFacebook(earnprize);
                  }, false);
               }, 1, me, [earnprize]);
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
   redeemItemFn : function(params, view)
   {
      var me = this, proxy = CustomerReward.getProxy(), item = view.getInnerItems()[0], storeName = me.getRedeemStore(), store = Ext.StoreMgr.get(storeName);
      //
      // Updating Server ...
      //
      console.debug("Transmitting Redeem Points Request ...");
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
            if (me.identifiers)
            {
               me.identifiers['cancelFn']();
            }
            Ext.Viewport.setMasked(null);

            if (operation.wasSuccessful())
            {
               Ext.device.Notification.beep();

               //Update on Facebook
               /*
                if ((db['currFbId'] > 0) && ( typeof (FB) != "undefined"))
                {
                Genesis.fb.facebook_onLogin(function(params)
                {
                if (params)
                {
                var redeemItem = store.getById(item.getData().getId());
                Ext.Viewport.setMasked(null);
                me.updatingRedemptionOnFacebook(redeemItem);
                }
                //}, false, me.updateOnFbMsg);
                }, false);
                }
                */

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
               //proxy._errorCallback = Ext.bind(me.onDoneTap, me);
               proxy.supressErrorsPopup = true;
               Ext.device.Notification.show(
               {
                  title : me.getRedeemPopupTitle(),
                  message : me.redeemFailedMsg,
                  buttons : ['Dismiss'],
                  callback : function()
                  {
                     proxy.supressErrorsCallbackFn();
                     me.onDoneTap();
                  }
               });
            }
         }
      });
   },

   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
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
      var me = this, FB = window.plugins.facebookConnect, venueId = (venue) ? venue.getId() : 0, db = Genesis.db.getLocalDB(), params =
      {
         venue_id : venueId
      };
      var privKey = Genesis.fn.privKey =
      {
         'venueId' : venueId,
         'venue' : venue.get('name')
      };
      privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];

      me.identifiers = null;
      me.broadcastLocalID(function(ids)
      {
         me.identifiers = ids;
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
                  /*
                   if (!Ext.get(Ext.DomQuery.select('.x-innerhtml',b.element.dom)[0]).getPageBox(true).isOutOfBound(
                   {
                   x : e.pageX,
                   y : e.pageY
                   }))
                   */
                  {
                     me.self.playSoundFile(viewport.sound_files['clickSound']);
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
         console.debug("Broadcast underway ...");
         me.redeemItemFn(Ext.apply(params,
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : me.identifiers['localID']
            }, 'reward')
         }), view);
      }, function()
      {
         Ext.Viewport.setMasked(null);
      });
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
            var proximityID = window.plugins.proximityID;
            proximityID.preLoadSend(me, false, Ext.bind(function(_btn, _venue, _view)
            {
               me.fireEvent('redeemitem', _btn, _venue, _view);
            }, me, [btn, venue, view]));
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
       console.debug("\n" + //
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
