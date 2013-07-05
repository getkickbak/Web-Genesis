Ext.define('Genesis.controller.server.mixin.RedeemBase',
{
   extend : 'Ext.mixin.Mixin',
   inheritableStatics :
   {
   },
   config :
   {
      closeBtn : null,
      sDoneBtn : null,
      sRedeemBtn : null
   },
   phoneIdMaxLength : 10,
   redeemPtsConfirmMsg : 'Please confirm to submit',
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Tag Tab
   // --------------------------------------------------------------------------
   onEnterPhoneNum : function()
   {
      var me = this, container = me.getRedeemItemCardContainer();
      container.setActiveItem(1);
   },
   onTagIdBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, value = b.getText();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      switch (value)
      {
         case 'AC' :
         {
            phoneIdField.reset();
            break;
         }
         default :
            if (phoneIdFieldLength < me.phoneIdMaxLength)
            {
               phoneId += value;
               phoneIdField.setValue(phoneId);
            }
            break;
      }
   },
   onTagItTap : function()
   {
      var me = this, viewport = me.getViewPortCntlr(), container = me.getRedeemItemCardContainer();
      var phoneIdField = me.getPhoneId(), phoneId = phoneIdField.getValue(), phoneIdFieldLength = phoneId.length;

      if (phoneIdFieldLength == me.phoneIdMaxLength)
      {
         me.self.playSoundFile(viewport.sound_files['nfcEnd']);
         me.onRedeemItemTap(null);

         me.onNfc(
         {
            id : null,
            result :
            {
               'phoneID' : phoneId
            }
         });
      }
      else
      {
         me.self.playSoundFile(viewport.sound_files['nfcError']);
         Ext.device.Notification.show(
         {
            title : me.getRedeemPopupTitle(),
            message : me.invalidPhoneIdFormatMsg(me.phoneIdMaxLength),
            buttons : ['Dismiss']
         });
      }
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.redeemItemFn(
      {
         data : me.self.encryptFromParams(
         {
            'uid' : (nfcResult) ? nfcResult.id : null,
            'tag_id' : (nfcResult) ? nfcResult.result['tagID'] : null,
            'phone_id' : (nfcResult) ? nfcResult.result['phoneID'] : null,
            'expiry_ts' : new Date().addHours(3).getTime()
         }, 'reward')
      }, true);
   },
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemItem();
      var item = view.getInnerItems()[0];

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img', photo.element.dom)[0]);
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.25),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.25)
      });
   },
   redeemItemCb : function(b)
   {
      var me = this, viewport = me.getViewPortCntlr();

      viewport.popUpInProgress = false;
      me._actions.hide();
      viewport.setActiveController(null);
      clearInterval(me.scanTask);
      me.scanTask = null;
      //
      // Stop receiving ProximityID
      //
      window.plugins.proximityID.stop();

      if (b && (b.toLowerCase() == 'manual'))
      {
         Ext.Viewport.setMasked(null);
         me.onEnterPhoneNum();
      }
      else if (!me.dismissDialog)
      {
         Ext.Viewport.setMasked(null);
         me.onDoneTap();
      }
   },
   onRedeemItem : function(btn, venue, view)
   {
      var me = this, identifiers = null;
      var viewport = me.getViewPortCntlr(), item = view.query("container[tag=redeemItemContainer]")[0].getInnerItems()[0];
      var venueId = (venue) ? venue.getId() : 0;
      var storeName = me.getRedeemStore(), store = Ext.StoreMgr.get(storeName);
      var params =
      {
         version : Genesis.constants.serverVersion,
         venue_id : venueId
      }
      var message = me.lookingForMobileDeviceMsg();
      var proxy = store.getProxy();

      me.dismissDialog = false;
      me.redeemItemFn = function(p, closeDialog)
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
         // Update Server
         //
         console.debug("Updating Server with Redeem information ... dismissDialog(" + me.dismissDialog + ")");

         CustomerReward[me.getRedeemPointsFn()](item.getData().getId());

         store.load(
         {
            addRecords : true, //Append data
            scope : me,
            jsonData :
            {
            },
            doNotRetryAttempt : true,
            params : Ext.apply(params, p),
            callback : function(records, operation)
            {
               Ext.Viewport.setMasked(null);
               if (operation.wasSuccessful())
               {
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
      };

      if (!btn)
      {
         return;
      }

      if (!me._actions)
      {
         me._actions = Ext.create('Genesis.view.widgets.PopupItemDetail',
         {
            iconType : 'prizewon',
            icon : 'rss',
            //cls : 'viewport',
            title : message,
            buttons : [
            {
               margin : '0 0 0.5 0',
               text : me.mobilePhoneInputMsg,
               ui : 'action',
               height : '3em',
               handler : Ext.bind(me.redeemItemCb, me, ['manual'])
            },
            {
               margin : '0.5 0 0 0',
               text : 'Cancel',
               ui : 'cancel',
               height : '3em',
               handler : Ext.bind(me.redeemItemCb, me, ['cancel'])
            }]
         });
         Ext.Viewport.add(me._actions);
      }
      viewport.popUpInProgress = true;
      me._actions.show();

      if (Genesis.fn.isNative())
      {
         me.getLocalID(function(idx)
         {
            identifiers = idx;
            me.redeemItemFn(
            {
               data : me.self.encryptFromParams(
               {
                  'frequency' : identifiers['localID'],
                  'expiry_ts' : new Date().addHours(3).getTime()
               }, 'reward')
            }, true);
         }, function()
         {
            me._actions.hide();
            me.onDoneTap();
         }, Ext.bind(me.onRedeemItem, me, arguments));
         viewport.setActiveController(me);
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
            me.fireEvent('redeemitem', btn, venue, view);
            break;
         }
      }
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this, container = me.getRedeemItemCardContainer();
      container.setActiveItem(0);

      console.debug("Server ReedeemBase: onActivate");
   },
   onRedeemItemCardContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getRedeemItemCardContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'redeemItemContainer' :
         {
            animation.setReverse(true);
            break;
         }
         case 'phoneId' :
         {
            me.getPhoneId().reset();
            animation.setReverse(true);
            break;
         }
      }
      console.debug("Prizes Redeem ContainerActivate Called.");
   },
   onRedeemItemShowView : function(activeItem)
   {
      var me = this;
      console.debug("onRedeemItemShowView - RedeemMode[" + me.getRedeemMode() + "]");
   },
   onRedeemItemActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      //
      // In Redeem Mode
      //
      me.getRedeemItemButtonsContainer()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      //
      // In Challendge
      //
      me.getAuthText()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();

      console.debug("RewardItem View - Updated RewardItem View.");
   }
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
