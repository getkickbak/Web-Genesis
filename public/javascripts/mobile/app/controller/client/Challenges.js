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
         challengeContainer : 'clientchallengepageview container[tag=challengeContainer]',
         challengeDescContainer : 'clientchallengepageview container[tag=challengePageItemDescWrapper]',
         //
         // Photo Challenge
         //
         uploadPhotosPage :
         {
            selector : 'clientuploadphotospageview',
            autoCreate : true,
            xtype : 'clientuploadphotospageview'
         },
         uploadPhotosBackground : 'clientuploadphotospageview component[tag=background]',
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
            activate : 'onReferralsActivate',
            deactivate : 'onReferralsDeactivate'
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
         'fbphotouploadcomplete' : 'onFbPhotoUploadComplete',
         'challengecomplete' : 'onChallengeComplete'
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
   photoUploadSuccessMsg : function(points)
   {
      return 'We\'ve added earned ' + points + ' points' + Genesis.constants.addCRLF() + //
      'towards your account for uploading photos to Facebook!';
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
      return 'Email was sent successfully!' + Genesis.constants.addCRLF() + 'Every successful referral will get you extra points!';
   },
   visitFirstMsg : 'You must visit this establishment first before you are eligible to do this Challenge',
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
                  me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
                  me.pushView(me.getUploadPhotosPage());
               }
               delete me.imageURI;
            }, function(error)
            {
               Ext.Viewport.setMasked(false);
               console.log(me.noPhotoUploadedMsg(error.message + Genesis.constants.addCRLF()));
               //console.log("An error has occurred: Code = " + error.code);
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
      var venue = me.getViewPortCntlr().getVenue();
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

      // Request QRCode from server for processing
      //
      Challenge['setSendReferralsUrl'](me.selectedItem.getId());
      Challenge.load(me.selectedItem.getId(),
      {
         jsonData :
         {
         },
         params :
         {
            'venue_id' : venue.getId(),
            'type' : type
         },
         callback : function(records, operation)
         {
            var metaData = Challenge.getProxy().getReader().metaData;
            /*
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
      this.completeChallenge(null, position);
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

      if(qrcode != null)
      {
         me.completeChallenge(qrcode, (me.metaData) ? me.metaData['position'] : null);
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
   onChallengeComplete : function(type, qrcode, venueId, customerId, position, eOpts, eInfo)
   {
      var me = this;
      var metaData = Challenge.getProxy().getReader().metaData;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      switch (type)
      {
         case 'referral' :
         {
            var id = metaData['id'];
            var customer = cstore.getById(id);
            if(!customer)
            {
               customer = cstore.add(metaData)[0];
            }
            //
            // Add to Referral DB
            //
            console.debug("Adding Referral Code to Referral DB ...");
            Genesis.db.addReferralDBAttrib("m" + customer.getMerchant().getId(), qrcode);

            if(me.referralCbFn)
            {
               console.debug("Calling Referral CallbackFn ...");
               me.referralCbFn();
               me.referralCbFn = null;
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Successful Referral!',
                  message : me.recvReferralb4VisitMsg(customer.getMerchant().get('name')),
                  callback : function()
                  {
                     console.debug("Opening Merchant Account ...");
                     var app = me.getApplication();
                     var controller = app.getController('Accounts');
                     controller.setMode('profile');
                     app.dispatch(
                     {
                        action : 'onDisclose',
                        args : [cstore, customer],
                        controller : controller,
                        scope : controller
                     });
                  }
               });
            }
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
                        me.fireEvent('openpage', 'MainPage', 'main', null);
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
   onItemSelect : function(d, model, eOpts)
   {
      Genesis.controller.ControllerBase.playSoundFile(this.getViewPortCntlr().sound_files['clickSound']);

      var carousel = this.getChallengePage().query('carousel')[0];
      // No need to update the Challenge Menu. Nothing changed.
      for(var i = 0; i < carousel.getInnerItems().length; i++)
      {
         var list = carousel.getInnerItems()[i];
         if(list != d)
         {
            list.deselectAll();
         }
      }

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
      this.getChallengeContainer().show();
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
               me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
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
      //Ext.defer(activeItem.createView, 1, activeItem);
      activeItem.createView();
      delete me.selectedItem;
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   completeChallenge : function(qrcode, position, eOpts, eInfo)
   {
      var me = this;
      var id, type, params;
      if(!position)
      {
         type = 'referral';
         id = me.reservedReferralId;
         // Used for Receiving Referrals
         params =
         {
         }
         Challenge['setCompleteReferralChallengeURL']();
      }
      else
      {
         var viewport = me.getViewPortCntlr();
         var venueId = viewport.getVenue().getId();
         var customerId = viewport.getCustomer().getId();
         id = me.selectedItem.getId();
         type = me.selectedItem.get('type').value;
         params =
         {
            venue_id : venueId,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude(),
         }
         Challenge['setCompleteChallengeURL'](id);
      }

      console.log("Completing Challenge ID(" + id + ")");
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
            console.log('Challenge Completed(' + operation.wasSuccessful() + ')');
            if(operation.wasSuccessful() && metaData)
            {
               me.fireEvent('challengecomplete', type, qrcode, venueId, customerId, position);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Referrals Challenge Page
   // --------------------------------------------------------------------------
   onReferralsActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var container = me.getReferralsContainer();
      container.setActiveItem(0);
      activeItem.createView();
      //Ext.defer(activeItem.createView, 1, activeItem);
   },
   onReferralsDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
   },
   onCompleteReferralsChallenge : function(b, e, eOpts)
   {
      // Nothing to do but go back to Main Challenge Page
      this.popView();
   },
   onReferralsSelect : function(list, model, eOpts)
   {
      var me = this;

      if(me.getViewPortCntlr().getCustomer().get('visits') > 0)
      {
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
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Referral Challenge',
            message : me.visitFirstMsg
         });
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
      Genesis.fb.facebook_onLogin(function(params)
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

      //me.getPostBtn().show();
      activetItem.metaData = me.metaData;
      //Ext.defer(activeItem.createView, 1, activeItem);
      activeItem.createView();
   },
   onUploadPhotosDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //this.getPostBtn().hide();
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
               title : 'Referral Challenge',
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
      var page = this.getChallengePage();
      return page;
   },
   openMainPage : function()
   {
      this.setAnimationMode(this.self.superclass.self.animationMode['slideUp']);
      this.pushView(this.getMainPage());
      console.log("Client ChallengePage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
