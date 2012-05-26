Ext.define('Genesis.controller.client.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.Anim'],
   statics :
   {
      challenges_path : '/clientChallenges'
   },
   xtype : 'clientChallengesCntlr',
   config :
   {
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
         challengeDescContainer : 'clientchallengepageview container[tag=challengePageItemDescWrapper]',
         //
         // Photo Challenge
         //
         uploadPhotosPage :
         {
            selector : 'uploadphotospageview',
            autoCreate : true,
            xtype : 'uploadphotospageview'
         },
         uploadPhotosBackground : 'uploadphotospageview component[tag=background]',
         postBtn : 'viewportview button[tag=post]',
         //
         // Referral Challenge
         //
         referralsPage :
         {
            selector : 'clientreferralsview',
            autoCreate : true,
            xtype : 'clientreferralsview'
         },
         qrcode : 'clientreferralsview component[tag=qrcode]',
         title : 'clientreferralsview component[tag=title]',
         referralsContainer : 'clientreferralsview container[tag=referralsMain]'
      },
      control :
      {
         challengePage :
         {
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
         },
         'actionsheet button[tag=library]' :
         {
            tap : 'onLibraryBtnTap'
         },
         'actionsheet button[tag=album]' :
         {
            tap : 'onAlbumBtnTap'
         },
         'actionsheet button[tag=camera]' :
         {
            tap : 'onCameraBtnTap'
         },
         uploadPhotosPage :
         {
            activate : 'onUploadPhotosActivate',
            deactivate : 'onUploadPhotosDeactivate'
         },
         postBtn :
         {
            tap : 'onUploadPhotosTap'
         },
         //
         // Referrals
         //
         referralsPage :
         {
            activate : 'onReferralsActivate'
         },
         'clientreferralsview container[tag=referralsMain] list' :
         {
            select : 'onReferralsSelect'
         },
         'clientreferralsview container button[tag=done]' :
         {
            tap : 'onCompleteReferralsChallenge'
         }
      },
      listeners :
      {
         'scannedqrcode' : 'onScannedQRcode',
         'locationupdate' : 'onLocationUpdate',
         'fbphotouploadcomplete' : 'onFbPhotoUploadComplete',
         'openpage' : 'onOpenPage'
      }
   },
   metaData : null,
   reservedReferralId : 0,
   referralCbFn : null,
   samplePhotoURL : 'http://photos.getkickbak.com/paella9finish1.jpg',
   noPhotoUploadedMsg : 'Failed to upload photo to server.',
   fbUploadFailedMsg : 'Failed to upload the photo onto your Facebook account',
   checkinFirstMsg : 'Please Check-In before performing challenges',
   photoUploadFbReqMsg : 'Connectivity to Facebook is required to upload photos to your account',
   defaultChallengeMsg : 'Please Select a challenge to perform',
   photoUploadSuccessMsg : function(points)
   {
      return 'You have earned ' + points + ' Pts for uploading it to Facebook!';
   },
   photoTakenFailMsg : function(msg)
   {
      return msg + Genesis.constants.addCRLF() + 'No Photos were taken.'
   },
   photoUploadIncompletesMsg : 'Trouble updating to server.',
   photoUploadFailValidationMsg : 'Please enter a comment with at least 16 characters in length',
   getPointsMsg : function(points)
   {
      return 'You have earned ' + points + ' Pts from this challenge!';
   },
   getConsolationMsg : function(message)
   {
      return message + Genesis.constants.addCRLF() + 'Try our other challenges as well!';
      //return message;
   },
   confirmRecvReferralsMsg : 'Please have your Referral Code ready to be scanned',
   referralFailedMsg : 'Email failed to send',
   referralSavedMsg : 'Email saved.',
   sendReferralSuccessMsg : function()
   {
      return 'Email was sent successfully!' + Genesis.constants.addCRLF() + 'Every successful referral will get your extra points!!1';
   },
   recvReferralSuccessMsg : function()
   {
      return 'You have been successfully referred.' + Genesis.constants.addCRLF() + 'Claim your Reward Points by visiting the Merchant now!';
   },
   init : function(app)
   {
      this.callParent(arguments);
      console.log("Challenge Init");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   photoEventHandler : function(position)
   {
      var me = this;
      if(me.imageURI)
      {
         if(Genesis.constants.isNative())
         {
            var options = new FileUploadOptions();
            options.fileKey = "image";
            // Token filename NOT be used
            options.fileName = "DummyPhoto.jpg";
            options.mimeType = "image/jpg";
            options.params =
            {
               "auth_token" : Genesis.db.getLocalDB()['auth_code']
            };
            options.chunkedMode = true;

            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.uploadServerMsg
            });

            var ft = new FileTransfer();
            var res, metaData;
            ft.upload(me.imageURI, Genesis.constants.host + '/api/v1/venues/share_photo', function(r)
            {
               try
               {
                  res = decodeURIComponent(r.response) || '';
                  console.debug('\n' + //
                  "Response = [" + res + ']\n' + //
                  "Code = " + r.responseCode + '\n' + "Sent = " + r.bytesSent);
                  res = Ext.decode(res);
                  if(res)
                  {
                     //
                     // Set MetaData from PhotoUpload here
                     //
                     metaData = me.metaData = res.metaData || null;
                     metaData['position'] = position;
                  }
                  else
                  {
                     console.log('No Data returned by the server.');
                  }
               }
               catch (ex)
               {
                  console.log('Unable to parse the JSON returned by the server: ' + ex.toString());
               }

               Ext.Viewport.setMasked(false);
               if(metaData && metaData['photo_url'] && metaData['upload_token'])
               {
                  console.log("Uploading to Facebook using upload_token[" + metaData['upload_token'] + "]...");

                  //
                  // Goto PhotoUpload Page
                  //
                  me.pushView(me.getUploadPhotosPage());
               }
               delete me.imageURI;
            }, function(error)
            {
               Ext.Viewport.setMasked(false);
               console.log(me.noPhotoUploadedMsg);
               console.log("An error has occurred: Code = " + error.code);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.noPhotoUploadedMsg(error.message + Genesis.constants.addCRLF())
               });
               delete me.imageURI;
            }, options);
         }
         else
         {
            Ext.device.Notification.show(
            {
               title : 'Error',
               message : "Cannot upload photo in Non-Native Mode"
            });
         }
      }
   },
   referralEventHandler : function(referralsSelected)
   {
      var me = this, type;
      var merchant = me.getViewPortCntlr().getVenue().getMerchant();
      var container = me.getReferralsContainer();
      var tag = referralsSelected.get('tag');

      //
      // Retrieve QRCode from Server
      //
      switch (tag)
      {
         case 'sender' :
         {
            type = 'direct';
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.genQRCodeMsg
            });
            break;
         }
         case 'emailsender' :
         {
            type = 'email';
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.retrieveAuthModeMsg
            });
            break;
         }
      }

      // Send QRCode to server for processing
      //
      Challenge['setSendReferralsUrl'](merchant.getId());
      Challenge.load(me.selectedItem.getId(),
      {
         jsonData :
         {
         },
         params :
         {
            'merchant_id' : merchant.getId(),
            'type' : type
         },
         callback : function(records, operation)
         {
            /*
             var metaData = Merchant.getProxy().getReader().metaData;
             if(operation.wasSuccessful() && (!metaData['data']))
             {
             Ext.Viewport.setMasked(false);
             Ext.device.Notification.show(
             {
             title : 'Error',
             message : me.noPtsXferMsg()
             });
             }
             */
            if(operation.wasSuccessful())
            {
               var qrcode;
               switch (tag)
               {
                  case 'sender' :
                  {
                     qrcode = Genesis.controller.ControllerBase.genQRCode(metaData['data']);

                     console.debug('\n' + //
                     'QRCode - ' + qrcode[0] + '\n' //
                     //+ 'Body - ' + emailTpl + '\n' + //
                     );
                     //
                     // Query server to get generate qrcode
                     //
                     if(qrcode[0])
                     {
                        me.getQrcode().setStyle(
                        {
                           'background-image' : 'url(' + qrcode[0] + ')',
                           'background-size' : Genesis.fn.addUnit(qrcode[1]) + ' ' + Genesis.fn.addUnit(qrcode[2])
                        });
                        me.getTitle().setData(
                        {
                           points : points + ' Pts'
                        });
                        container.setActiveItem(1);
                     }
                     Ext.Viewport.setMasked(false);
                     break;
                  }
                  case 'emailsender' :
                  {
                     qrcode = metaData['data']['qrcode'];
                     var emailTpl = metaData['data']['body'];
                     var subject = metaData['data']['subject'];

                     console.debug('\n' + //
                     'QRCode - ' + qrcode + '\n' + //
                     //'Body - ' + emailTpl + '\n' + //
                     'Subject - ' + subject + '\n' //
                     );

                     //emailTpl = emailTpl.replace(me.qrcodeRegExp, Genesis.controller.ControllerBase.genQRCodeInlineImg(qrcode));
                     //console.debug('\n' + //
                     //'Encoded Body - ' + emailTpl);
                     qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode)[0].replace('data:image/gif;base64,', "");

                     window.plugins.emailComposer.showEmailComposerWithCB(function(res)
                     {
                        // Delay is needed to not block email sending ...
                        Ext.defer(function()
                        {
                           Ext.Viewport.setMasked(false);
                           switch (res)
                           {
                              case EmailComposer.ComposeResultType.Failed:
                              case EmailComposer.ComposeResultType.NotSent:
                              case EmailComposer.ComposeResultType.Cancelled:
                              {
                                 Ext.device.Notification.show(
                                 {
                                    title : 'Email Error',
                                    message : me.referralFailedMsg,
                                    callback : function()
                                    {
                                       me.onCompleteReferralsChallenge();
                                    }
                                 });
                                 break;
                              }
                              case EmailComposer.ComposeResultType.Saved:
                              {
                                 Ext.device.Notification.show(
                                 {
                                    title : 'Email Saved',
                                    message : me.referralSavedMsg,
                                    callback : function()
                                    {
                                       me.onCompleteReferralsChallenge();
                                    }
                                 });
                                 break;
                              }
                              case EmailComposer.ComposeResultType.Sent:
                              {
                                 Ext.device.Notification.show(
                                 {
                                    title : 'Email Sent!',
                                    message : me.sendReferralSuccessMsg(),
                                    callback : function()
                                    {
                                       me.onCompleteReferralsChallenge();
                                    }
                                 });
                                 break;
                              }
                           }
                        }, 1, me);
                     }, subject, emailTpl, null, null, null, true, [qrcode]);
                     break;
                  }
               }
            }
            else
            {
               Ext.Viewport.setMasked(false);
            }
         }
      });
   },
   vipEventHandler : function(position)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var venueId = viewport.getVenue().getId();
      var customerId = viewport.getCustomer().getId();

      me.onCompleteChallenge(null, venueId, customerId, position);
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      //
      // Either we are in PhotoUpload mode, or we are in Challenge Authorization Mode
      //
      switch (me.selectedItem.get('type').value)
      {
         case 'photo' :
         {
            me.photoEventHandler(position);
            break;
         }
         case 'vip' :
         {
            me.vipEventHandler(position);
            break;
         }
         case 'referral' :
         {
            // Don't need GeoLocation information
            break;
         }
         case 'menu' :
         case 'birthday' :
         case 'custom' :
         default:
            me.metaData =
            {
               'position' : position
            };
            me.scanQRCode();
            break;
      }
   },
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      var type = (me.metaData) ? me.selectedItem.get('type').value : 'referral';

      if(qrcode)
      {
         switch (type)
         {
            case 'referral' :
            {
               me.onCompleteChallenge(qrcode, null, null, null);
               break;
            }
            default:
               var viewport = me.getViewPortCntlr();
               var venueId = viewport.getVenue().getId();
               var customerId = viewport.getCustomer().getId();
               me.onCompleteChallenge(qrcode, venueId, customerId, me.metaData['position']);
               break;
         }
      }
      else
      {
         console.debug(me.noCodeScannedMsg);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.noCodeScannedMsg
         });
      }
      me.metaData = null;
   },
   onFbPhotoUploadComplete : function()
   {
      var me = this;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var metaData = me.metaData;
      var customerId = viewport.getCustomer().getId();
      var points = me.selectedItem.get('points');
      var id = me.selectedItem.getId();

      Challenge['setCompleteChallengeURL'](id);
      Challenge.load(id,
      {
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId,
            latitude : metaData['position'].coords.getLatitude(),
            longitude : metaData['position'].coords.getLongitude(),
            'upload_token' : metaData['upload_token']
         },
         callback : function(records, operation)
         {
            var metaData2 = Challenge.getProxy().getReader().metaData;
            if(operation.wasSuccessful() && metaData2)
            {
               //
               // Update points from the purchase or redemption
               //
               cstore.getById(customerId).set('points', metaData2['account_points']);
               console.debug("Points Earned = " + metaData2['points'] + ' Pts');
               Ext.device.Notification.show(
               {
                  title : 'Upload Complete',
                  message : ((metaData2['points'] > 0) ? me.photoUploadSuccessMsg(metaData2['points']) : me.getConsolationMsg(metaData2['message'])),
                  callback : function()
                  {
                     me.metaData = null;
                     me.popView();
                  }
               });
               viewport.updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [metaData2]);
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Upload Failed!',
                  message : me.photoUploadIncompletesMsg,
                  buttons : ['Try Again', 'Cancel'],
                  callback : function(btn)
                  {
                     if(btn.toLowerCase() == 'try again')
                     {
                        Ext.defer(me.completeUploadPhotosChallenge, 1 * 1000, me);
                     }
                     else
                     {
                        //
                        // Go back to Checked-in Merchant Account
                        //
                        me.metaData = null;
                        me.fireEvent('openpage', 'MainPage', 'main');
                     }
                  }
               });
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Challenge Page
   // --------------------------------------------------------------------------
   onCompleteChallenge : function(qrcode, venueId, customerId, position)
   {
      var me = this;
      var id, type, params;
      if(!venueId)
      {
         type = 'referral';
         id = me.reservedReferralId;
         // Used for Receiving Referrals
         params =
         {
         }
      }
      else
      {
         id = me.selectedItem.getId();
         type = me.selectedItem.get('type').value;
         params =
         {
            venue_id : venueId,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude(),
         }
      }

      console.log("Completing Challenge ID(" + id + ")");
      Challenge['setCompleteChallengeURL'](id);
      Challenge.load(id,
      {
         jsonData :
         {
         },
         params : Ext.apply(params,
         {
            'data' : qrcode
         }),
         callback : function(record, operation)
         {
            var metaData = Challenge.getProxy().getReader().metaData;
            var cstore = Ext.StoreMgr.get('CustomerStore');
            console.log('Challenge Completed(' + operation.wasSuccessful() + ')');
            if(operation.wasSuccessful() && metaData)
            {
               switch (type)
               {
                  case 'referral' :
                  {
                     Ext.device.Notification.show(
                     {
                        title : 'Receive Referral',
                        message : me.recvReferralSuccessMsg,
                        callback : function()
                        {
                           //Do it to improve responsiveness
                           Ext.defer(function()
                           {
                              var id = metaData['id'];
                              var customer = cstore.getById(id);
                              if(!customer)
                              {
                                 customer = cstore.add(metaData)[0];
                              }
                              me.setMode('profile');

                              //
                              // Add to Referral DB
                              //
                              Genesis.db.addReferralDBAttrib("m" + customer.getMerchant().getId());

                              if(me.referralCbFn)
                              {
                                 me.referralCbFn();
                                 me.referralCbFn = null;
                              }
                              else
                              {
                                 var app = me.getApplication();
                                 var controller = app.getController('Accounts');
                                 app.dispatch(
                                 {
                                    action : 'onDisclose',
                                    args : [cstore, customer],
                                    controller : controller,
                                    scope : controller
                                 });
                              }
                           }, 1, me);
                        }
                     });
                     break;
                  }
                  case 'vip' :
                  {
                     Ext.device.Notification.show(
                     {
                        title : 'VIP Challenge',
                        message : me.getConsolationMsg(metaData['message'])
                     });
                     me.getViewPortCntlr().updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [metaData]);
                     break;
                  }
                  default:
                     console.log('Total Points - ' + metaData['account_points']);
                     if(metaData['account_points'])
                     {
                        var cstore = Ext.StoreMgr.get('CustomerStore');
                        cstore.getById(customerId).set('points', metaData['account_points']);
                     }
                     //
                     // Update points from the purchase or redemption
                     // Bugfix - Copy string from server to prevent PhoneGap crash

                     console.log('Points Earned - ' + metaData['points']);

                     Ext.device.Notification.show(
                     {
                        title : 'Earn Points',
                        message : ((metaData['points'] > 0) ? me.getPointsMsg(metaData['points']) : me.getConsolationMsg(metaData['message']))
                     });
                     me.getViewPortCntlr().updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [metaData]);
                     break;
               }
            }
         }
      });
   },
   onItemSelect : function(d, model, eOpts)
   {
      //d.deselect([model], false);
      var desc = this.getChallengeDescContainer();
      Ext.Anim.run(desc.element, 'fade',
      {
         direction : 'right',
         duration : 600,
         out : false,
         autoClear : true,
         scope : this,
         before : function()
         {
            for(var i = 0; i < desc.getItems().length; i++)
            {
               desc.getItems().getAt(i).updateData(model.getData());
            }
            this.selectedItem = model;
         }
      });
      return true;
   },
   onChallengeBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var selectedItem = me.selectedItem;

      // VenueId can be found after the User checks into a venue
      if(!(cvenue && venue && (cvenue.getId() == venue.getId())))
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.checkinFirstMsg
         });
         return;
      }

      if(selectedItem)
      {
         switch (selectedItem.get('type').value)
         {
            case 'photo' :
            {
               me.getChallengePage().takePhoto();
               break;
            }
            case 'referral' :
            {
               //
               // Show Referrals Page
               //
               me.pushView(me.getReferralsPage());
               break;
            }
            case 'menu' :
            case 'birthday' :
            case 'vip' :
            case 'custom' :
            {
               if(selectedItem.get('require_verif'))
               {
                  Ext.device.Notification.show(
                  {
                     title : me.selectedItem.get('name') + ' Challenge',
                     message : me.showToServerMsg,
                     callback : function()
                     {
                        me.getGeoLocation();
                     }
                  });
               }
               else
               {
                  me.getGeoLocation();
               }
               break;
            }
         }
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var record = this.getViewPortCntlr().getVenue();
      var venueId = record.getId();
      var carousel = this.getChallengePage().query('carousel')[0];
      var items = record.challenges().getRange();
      if((carousel.getInnerItems().length > 0) && //
      (carousel.getInnerItems()[0].getStore().getRange()[0].getId() == items[0].getId()))
      {
         // No need to update the Challenge Menu. Nothing changed.
      }
      else
      {
         carousel.removeAll(true);
         // Defer to update Remove Changes before re-adding them back in
         Ext.defer(function()
         {
            for(var i = 0; i < Math.ceil(items.length / 6); i++)
            {
               carousel.add(
               {
                  xtype : 'dataview',
                  cls : 'challengeMenuSelections',
                  useComponents : true,
                  defaultType : 'challengemenuitem',
                  scrollable : undefined,
                  store :
                  {
                     model : 'Genesis.model.Challenge',
                     data : Ext.Array.pluck(items.slice(i * 6, ((i + 1) * 6)), 'data')
                  }
               });
            }
            if(carousel.getInnerItems().length > 0)
            {
               carousel.setActiveItem(0);
            }
         }, 1, me);
      }

      var desc = me.getChallengeDescContainer();
      for(var i = 0; i < desc.getItems().length; i++)
      {
         desc.getItems().getAt(i).updateData(
         {
            description : me.defaultChallengeMsg,
            name : ''
         });
      }
      delete me.selectedItem;
   },
   onDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Referrals Challenge Page
   // --------------------------------------------------------------------------
   onReferralsActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var container = me.getReferralsContainer();
      container.setActiveItem(0);
   },
   onCompleteReferralsChallenge : function(b, e, eOpts)
   {
      // Nothing to do but go back to Main Challenge Page
      this.popView();
   },
   onReferralsSelect : function(list, model, eOpts)
   {
      var me = this;

      list.deselect([model]);
      switch (model.get('tag'))
      {
         case 'emailsender' :
         case 'sender' :
         {
            me.referralEventHandler(model);
            break;
         }
      }
      return false;
   },
   // --------------------------------------------------------------------------
   // Photos Upload Page
   // --------------------------------------------------------------------------
   onCameraSuccessFn : function(imageURI)
   {
      var me = this;

      console.debug("image URI =[" + imageURI + "]");

      Ext.Viewport.setMasked(false);
      me.imageURI = imageURI;
      me.getGeoLocation();
   },
   onCameraErrorFn : function(message)
   {
      var me = this;
      console.debug("onCameraErrorFn - message[" + message + "]");

      Ext.Viewport.setMasked(false);
      Ext.device.Notification.show(
      {
         title : 'Error',
         message : me.photoTakenFailMsg(message)
      });
   },
   onPhotoBtnCommon : function(sourceType)
   {

      var me = this;
      var photoAction = me.getChallengePage().photoAction;
      photoAction.hide();

      console.log("Checking for Facebook Plugin ...");
      Genesis.constants.facebook_onLogin(function(params)
      {
         console.log("Accessing Camera Plugin ...");
         if(Genesis.constants.isNative())
         {
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.cameraAccessMsg
            });

            var cameraOptions =
            {
               quality : 75,
               destinationType : Camera.DestinationType.FILE_URI,
               sourceType : sourceType,
               allowEdit : true,
               encodingType : Camera.EncodingType.JPEG,
               targetWidth : 960
               //targetHeight : 480
            };
            navigator.camera.getPicture(Ext.bind(me.onCameraSuccessFn, me), Ext.bind(me.onCameraErrorFn, me), cameraOptions);
         }
         else
         {
            me.onCameraSuccessFn(me.samplePhotoURL);
         }
      }, true, me.photoUploadFbReqMsg);

   },
   onLibraryBtnTap : function(b, e, eOpts, eInfo)
   {
      this.onPhotoBtnCommon(Genesis.constants.isNative() ? Camera.PictureSourceType.PHOTOLIBRARY : null);
   },
   onAlbumBtnTap : function(b, e, eOpts, eInfo)
   {
      this.onPhotoBtnCommon(Genesis.constants.isNative() ? Camera.PictureSourceType.SAVEDPHOTOALBUM : null);
   },
   onCameraBtnTap : function(b, e, eOpts, eInfo)
   {
      this.onPhotoBtnCommon(Genesis.constants.isNative() ? Camera.PictureSourceType.CAMERA : null);
   },
   onUploadPhotosActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var bg = me.getUploadPhotosBackground();

      me.getPostBtn().show();
      bg.setStyle(
      {
         'background-image' : 'url(' + me.metaData['photo_url'] + ')'
      });
   },
   onUploadPhotosDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      this.getPostBtn().hide();
   },
   onUploadPhotosTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var page = me.getUploadPhotosPage();
      var textareafield = page.query('textareafield')[0];
      var desc = textareafield.getValue();

      if((desc.length > textareafield.getMaxLength()) || (desc.length < 16))
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.photoUploadFailValidationMsg,
            callback : function()
            {
               textareafield.focus();
            }
         });
         return;
      }

      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();

      FB.api('/me/photos', 'post',
      {
         'message' : desc,
         'url' : me.metaData['photo_url'],
         'access_token' : FB.getAccessToken()
         /*
          ,"place" :
          {
          "name" : venue.get('name'),
          "location" :
          {
          "street" : venue.get('address'),
          "city" : venue.get('city'),
          "state" : venue.get('state'),
          "country" : venue.get('country'),
          "latitude" : venue.get('latitude'),
          "longitude" : venue.get('longitude')
          }
          }
          */
      }, function(response)
      {
         if(!response || response.error)
         {
            var message = (response && response.error) ? response.error.message : me.fbUploadFailedMsg;
            Ext.Viewport.setMasked(false);
            Ext.device.Notification.show(
            {
               title : 'Upload Failed!',
               message : message,
               buttons : ['Try Again', 'Cancel'],
               callback : function(btn)
               {
                  if(btn.toLowerCase() == 'try again')
                  {
                     Ext.defer(me.onUploadPhotosTap, 100, me);
                  }
                  else
                  {
                     //
                     // Go back to Checked-in Merchant Account
                     //
                     me.metaData = null;
                     me.popView();
                  }
               }
            });
         }
         else
         {
            console.debug('Facebook Post ID - ' + response.id);
            me.fireEvent('fbphotouploadcomplete');
         }
      });
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, cb)
   {
      var me = this;
      if(cb)
      {
         me.referralCbFn = cb;
      }
      switch (subFeature)
      {
         case 'referrals' :
         {
            Ext.device.Notification.show(
            {
               title : 'Receive Referrals',
               message : me.confirmRecvReferralsMsg,
               buttons : ['Proceed', 'Cancel'],
               callback : function(btn)
               {
                  if(btn.toLowerCase() == 'proceed')
                  {
                     delete me.selectedItem;
                     me.metaData = null;
                     me.scanQRCode();
                  }
               }
            });
            break;
         }
         default:
            break;
      }
   },
   getMainPage : function()
   {
      return this.getChallengePage();
   },
   openMainPage : function()
   {
      this.pushView(this.getMainPage());
      console.log("Client ChallengePage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
