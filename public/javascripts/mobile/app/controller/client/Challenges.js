Ext.define('Genesis.controller.client.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.Anim'],
   inheritableStatics :
   {
   },
   xtype : 'clientChallengesCntlr',
   config :
   {
      routes :
      {
         'challenges' : 'challengesPage'
      },
      refs :
      {
         //
         // Challenges
         //
         challengeBtn : 'clientchallengepageview button[tag=doit]',
         challengePage :
         {
            selector : 'clientchallengepageview',
            autoCreate : true,
            xtype : 'clientchallengepageview'
         },
         challengeContainer : 'clientchallengepageview container[tag=challengeContainer]',
         challengeDescContainer : 'clientchallengepageview container[tag=challengePageItemDescWrapper]'
      },
      control :
      {
         challengePage :
         {
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'clientchallengepageview > carousel dataview' :
         {
            select : 'onItemSelect'
         },
         challengeBtn :
         {
            tap : 'onChallengeBtnTap'
         }
      },
      listeners :
      {
         'challengecomplete' : 'onChallengeComplete',
         'doChallenge' : 'onChallengeBtnTap',
         'itemTap' : 'onItemTap'
      }
   },
   metaData : null,
   defaultDescText : 'Please Select a challenge to perform',
   samplePhotoURL : 'http://photos.getkickbak.com/paella9finish1.jpg',
   checkinFirstMsg : 'Please Check-In before performing challenges',
   completingChallengeMsg : 'Completing Challenge ...',
   updateAccountInfoMsg : 'Your Birthday information is missing. Update your Account Settings to continue.',
   getPointsMsg : function(points, total)
   {
      return 'You have earned ' + points + ' Pts from this challenge!';
   },
   getConsolationMsg : function(message)
   {
      return message + Genesis.constants.addCRLF() + 'Try our other challenges as well!';
      //return message;
   },
   visitFirstMsg : 'You must visit this establishment first before you are eligible to do this Challenge',
   init : function(app)
   {
      var me = this;
      this.callParent(arguments);
      console.log("Challenge Init");
      //
      // Preload Pages
      //
      me.getChallengePage();
   },
   challengeItemFn : function(params, id, type, venueId, qrcode, position)
   {
      var me = this, viewport = me.getViewPortCntlr(), params, customerId = viewport.getCustomer().getId();
      //
      // With or without Geolocation support
      //
      if (!venueId)
      {
         //
         // We cannot use short cut method unless we have either GeoLocation or VenueId
         //
         /*
          if (!position)
          {
          //
          // Stop broadcasting now ...
          //
          if (me.identifiers)
          {
          me.identifiers['cancelFn']();
          }
          Ext.Viewport.setMasked(null);
          Ext.device.Notification.show(
          {
          title : 'Rewards',
          message : me.cannotDetermineLocationMsg,
          buttons : ['Dismiss']
          });
          return;
          }
          */
      }
      else
      {
         params = Ext.apply(params,
         {
            venue_id : venueId
         });
      }

      if (qrcode)
      {
         params = Ext.apply(params,
         {
            data : qrcode
         });
      }
      else
      {
         params = Ext.apply(params,
         {
            data : me.self.encryptFromParams(
            {
               'frequency' : me.identifiers['localID']
            })
         });
      }

      console.debug("Transmitting Completing Challenge ID(" + id + ")");
      Challenge.load(id,
      {
         jsonData :
         {
         },
         params : params,
         callback : function(record, operation)
         {
            var metaData = Challenge.getProxy().getReader().metaData;
            console.log('Challenge Completed(' + operation.wasSuccessful() + ')');
            //
            // Stop broadcasting now ...
            //
            if (me.identifiers)
            {
               me.identifiers['cancelFn']();
            }
            Ext.Viewport.setMasked(null);

            if (operation.wasSuccessful() && metaData)
            {
               Ext.device.Notification.beep();
               me.fireEvent('challengecomplete', type, qrcode, venueId, customerId, position);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   vipEventHandler : function(position)
   {
      this.completeChallenge(null, position);
   },
   onLocationUpdate : function(position)
   {
      var me = this;

      me.metaData =
      {
         'position' : position
      };

      //
      // Either we are in PhotoUpload mode, or we are in Challenge Authorization Mode
      //
      switch (me.selectedItem.get('type').value)
      {
         case 'vip' :
         {
            me.vipEventHandler(position);
            break;
         }
         case 'menu' :
         case 'birthday' :
         case 'custom' :
            me.completeChallenge(null, position);
            //me.scanQRCode();
            break;
         default:
            break;
      }
   },
   onChallengeComplete : function(type, qrcode, venueId, customerId, position, eOpts, eInfo)
   {
      var me = this;
      var metaData = Challenge.getProxy().getReader().metaData;

      switch (type)
      {
         case 'vip' :
         {
            Ext.device.Notification.show(
            {
               title : 'VIP Challenge',
               message : me.getConsolationMsg(metaData['message']),
               buttons : ['OK']
            });
            me.fireEvent('updatemetadata', metaData);
            break;
         }
         default:
            var account_info = metaData['account_info'];
            var reward_info = metaData['reward_info'];
            Ext.device.Notification.show(
            {
               title : 'Completed Challenge!',
               message : ((reward_info['points'] > 0) ? //
               me.getPointsMsg(reward_info['points'], account_info['points']) : //
               me.getConsolationMsg(metaData['message'])),
               buttons : ['OK']
            });

            me.fireEvent('updatemetadata', metaData);
            break;
      }
   },
   // --------------------------------------------------------------------------
   // Challenge Page
   // --------------------------------------------------------------------------
   onItemTap : function(model)
   {
      var me = this, viewport = me.getViewPortCntlr(), db = Genesis.db.getLocalDB();

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      var desc = me.getChallengeDescContainer();
      Ext.Anim.run(desc.element, 'fade',
      {
         //direction : 'right',
         duration : 600,
         out : false,
         autoClear : true,
         scope : me,
         before : function()
         {
            for (var i = 0; i < desc.getItems().length; i++)
            {
               desc.getItems().getAt(i).updateData(model.getData());
            }
            me.selectedItem = model;
         }
      });
      switch (model.get('type').value)
      {
         case 'facebook' :
         {
            var hideFB = (db['enableFB'] && (db['currFbId'] > 0)) || !Genesis.fn.isNative();
            me.getChallengeContainer()[hideFB ? 'hide' : 'show']();
            break;
         }
         case 'birthday' :
         {
            me.getChallengeContainer()['hide']();
            if (!db['account'].birthday)
            {
               Ext.device.Notification.show(
               {
                  title : me.selectedItem.get('name').capitalize() + ' Challenge',
                  message : me.updateAccountInfoMsg,
                  buttons : ['OK', 'Cancel'],
                  callback : function(btn)
                  {
                     if (btn.toLowerCase() == 'ok')
                     {
                        me.redirectTo('settings');
                     }
                  }
               });
            }
            break;
         }
         default :
            me.getChallengeContainer()['show']();
            break;
      }
      return true;
   },
   onChallengeBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this, db = Genesis.db.getLocalDB();
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var selectedItem = me.selectedItem;

      if (selectedItem)
      {
         switch (selectedItem.get('type').value)
         {
            default :
               // VenueId can be found after the User checks into a venue
               if (!(cvenue && venue && (cvenue.getId() == venue.getId())))
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : me.checkinFirstMsg,
                     buttons : ['Dismiss']
                  });
                  return true;
               }
               break;
         }

         switch (selectedItem.get('type').value)
         {
            case 'birthday' :
            {
               break;
            }
            case 'facebook' :
            {
               var controller = me.getApplication().getController('client' + '.Settings');
               controller.updateFBSettingsPopup(selectedItem.get('name') + ' Challenge', null);
               break;
            }
            case 'menu' :
            case 'vip' :
            case 'custom' :
            {
               if (selectedItem.get('require_verif'))
               {
                  var send = function()
                  {
                     if (!me._actions)
                     {
                        me._actions = Ext.create('Genesis.view.widgets.PopupItemDetail',
                        {
                           iconType : 'prizewon',
                           icon : 'phoneInHand',
                           title : me.showToServerMsg(),
                           buttons : [
                           {
                              margin : '0 0 0.5 0',
                              text : 'Proceed',
                              ui : 'action',
                              height : '3em',
                              handler : function()
                              {
                                 viewport.popUpInProgress = false;
                                 me._actions.hide();
                                 if (selectedItem.get('type').value == 'photo')
                                 {
                                    me.getGeoLocation();
                                 }
                                 else
                                 {
                                    me.onLocationUpdate(null);
                                 }
                              }
                           },
                           {
                              margin : '0.5 0 0 0',
                              text : 'Cancel',
                              ui : 'cancel',
                              height : '3em',
                              handler : function()
                              {
                                 viewport.popUpInProgress = false;
                                 me._actions.hide();
                              }
                           }]
                        });
                        Ext.Viewport.add(me._actions);
                     }
                     viewport.popUpInProgress = true;
                     me._actions.show();
                     /*
                      Ext.device.Notification.show(
                      {
                      title : selectedItem.get('name') + ' Challenge',
                      message : me.showToServerMsg(),
                      buttons : ['Proceed', 'Cancel'],
                      callback : function(btn)
                      {
                      if (btn.toLowerCase() == 'proceed')
                      {
                      if (selectedItem.get('type').value == 'photo')
                      {
                      me.getGeoLocation();
                      }
                      else
                      {
                      me.onLocationUpdate(null);
                      }
                      }
                      }
                      });
                      */
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
                        send();
                     });
                  }
                  else
                  {
                     send();
                  }
               }
               else
               {
                  me.onLocationUpdate(null);
               }
               break;
            }
         }
      }
   },
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         //var carousel = activeItem.query('carousel')[0];
         //var items = carousel.getInnerItems();

         console.debug("Refreshing Challenge Main Page ...");
         /*
          for (var i = 0; i < items.length; i++)
          {
          items[i].refresh();
          }
          */
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      Ext.defer(function()
      {
         //activeItem.createView();
         var desc = me.getChallengeDescContainer();
         for (var i = 0; i < desc.getItems().length; i++)
         {
            desc.getItems().getAt(i).updateData(
            {
               description : me.defaultDescText
            });
            me.getChallengeContainer().hide();
         }
      }, 1, activeItem);
      //activeItem.createView();

      delete me.selectedItem;
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   completeChallenge : function(qrcode, position, eOpts, eInfo)
   {
      var me = this, viewport = me.getViewPortCntlr(), params, db = Genesis.db.getLocalDB(), venue = viewport.getVenue(), venueId = venue.getId();

      me.identifiers = null;
      if (me.selectedItem)
      {
         params =
         {
            venue_id : venueId
         }
         if (position)
         {
            params = Ext.apply(params,
            {
               latitude : position.coords.getLatitude(),
               longitude : position.coords.getLongitude()
            });
         }
         Challenge['setCompleteChallengeURL'](me.selectedItem.getId());

         var privKey = Genesis.fn.privKey =
         {
            'venueId' : venueId,
            'venue' : venue.get('name')
         };
         privKey['r' + venueId] = privKey['p' + venueId] = db['csrf_code'];

         me.broadcastLocalID(function(idx)
         {
            me.identifiers = idx;
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
                           title : me.selectedItem.get('name').capitalize() + ' Challenge',
                           message : me.transactionCancelledMsg,
                           buttons : ['Dismiss']
                        });
                     }
                  }
               }
            });
            console.log("Broadcast underway ...");
            me.challengeItemFn(params, me.selectedItem.getId(), me.selectedItem.get('type').value, venueId, qrcode, position);
         }, function()
         {
            Ext.Viewport.setMasked(null);
         });
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   challengesPage : function()
   {
      this.setAnimationMode(this.self.animationMode['coverUp']);
      this.pushView(this.getMainPage());
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, cb)
   {
      var me = this;
      switch (subFeature)
      {
         default:
            break;
      }
   },
   getMainPage : function()
   {
      var page = this.getChallengePage();
      return page;
   },
   openMainPage : function()
   {
      this.redirectTo('challenges');
      console.log("Client ChallengePage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
