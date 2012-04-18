Ext.define('Genesis.controller.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
      challenges_path : '/challenges'
   },
   xtype : 'challengesCntlr',
   config :
   {
      refs :
      {
         challengeBtn : 'challengepageview tabbar button[tag=doit]',
         challengePage :
         {
            selector : 'challengepageview',
            autoCreate : true,
            xtype : 'challengepageview'
         }
      },
      control :
      {
         challengePage :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'challengepageview > carousel dataview' :
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
         }
      }
   },
   noChallengeCodeScannedMsg : 'No QR Code Scanned!',
   noPhotoUploadedMsg : 'Failed to upload photo to server.',
   fbUploadFailedMsg : 'Failed to upload the photo onto your Facebook account',
   photoUploadSuccessMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Pts for uploading it to Facebook!';
   },
   photoTakenFailMsg : function(msg)
   {
      return msg + 'No Photos were taken.'
   },
   challengeId : null,
   model : ['Challenge'],
   init : function(app)
   {
      this.callParent(arguments);
      console.log("Challenge Init");
   },
   // --------------------------------------------------------------------------
   // Challenge Page
   // --------------------------------------------------------------------------
   getPointsMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Points from this challenge!';
   },
   onItemSelect : function(d, model, eOpts)
   {
      d.deselect([model], false);
      var desc = this.getChallengePage().query("container[docked=bottom][xtype=container]")[0];
      for(var i = 0; i < desc.getItems().length; i++)
      {
         desc.getItems().getAt(i).updateData(model.getData());
      }
      this.selectedItem = model;
      return true;
   },
   onItemTouchStart : function(d, index, target, e, eOpts)
   {
      Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).mask();

   },
   onItemTouchEnd : function(d, index, target, e, eOpts)
   {
      Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).unmask();
   },
   onChallengeBtnTap : function(b, e, eOpts)
   {
      var me = this;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var customerId = viewport.getCustomer().getId();
      var merchantId = venue.getMerchant().getId();
      var selectedItem = me.selectedItem;
      var id = me.challengeId = selectedItem.getId();

      if(selectedItem)
      {
         switch (selectedItem.get('type').value)
         {
            case 'menu' :
               break;
            case 'checkin' :
               break;
            case 'photo' :
            {
               me.getChallengePage().takePhoto();
               return;
            }
            case 'birthday' :
            {
               break;
            }
            case 'referral' :
               break;
            case 'custom' :
               break;
         }
      }
      me.challengeId = null;
      if(selectedItem.get('require_verif'))
      {
         Ext.device.Notification.show(
         {
            title : me.selectedItem.get('name') + ' Challenge',
            message : me.showToServerMsg,
            callback : function()
            {
               me.getGeoLocation(function(position)
               {
                  me.scanQRCode(
                  {
                     callback : function(qrcode)
                     {
                        if(qrcode)
                        {
                           Challenge['setCompleteChallengeURL'](id);
                           Challenge.load(id,
                           {
                              jsonData :
                              {
                              },
                              params :
                              {
                                 venue_id : venueId,
                                 merchant_id : merchantId,
                                 latitude : position.coords.latitude,
                                 longitude : position.coords.longitude,
                                 auth_code : qrcode
                              },
                              callback : function(record, operation)
                              {
                                 var metaData = Challenge.getProxy().getReader().metaData;
                                 if(operation.wasSuccessful() && metaData)
                                 {
                                    //
                                    // Update points from the purchase or redemption
                                    //
                                    Ext.device.Notification.show(
                                    {
                                       title : 'Earn Points',
                                       message : me.getPointsMsg(metaData['points'])
                                    });
                                    cstore.getById(customerId).set('points', metaData['account_points']);
                                 }
                              }
                           });
                        }
                        else
                        {
                           console.debug(me.noChallengeCodeScannedMsg);
                           Ext.device.Notification.show(
                           {
                              title : 'Error',
                              message : me.noChallengeCodeScannedMsg
                           });
                        }
                     }
                  });
               });
            }
         });
      }
   },
   onCameraSuccessFn : function(imageURI)
   {
      var me = this;
      var photoAction = me.getChallengePage().photoAction;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();
      var customerId = viewport.getCustomer().getId();
      var points = me.selectedItem.get('points');

      console.debug("image URI =[" + imageURI + "]");

      me.getGeoLocation(function(position)
      {
         if(Genesis.constants.isNative())
         {
            var options = new FileUploadOptions();
            options.fileKey = "image";
            options.fileName = "PhotoChallenge.jpg";
            options.mimeType = "image/jpg";
            options.params =
            {
               "auth_token" : Genesis.constants.authToken
               //value2 : "param"
            };
            options.chunkedMode = true;

            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.uploadFbMsg
            });

            var ft = new FileTransfer();
            var res, metaData;
            ft.upload(imageURI, Genesis.constants.host + '/api/v1/venues/share_photo', function(r)
            {
               res = decodeURIComponent(r.response) || '';
               console.debug("Response = " + res);
               try
               {
                  console.debug("Code = " + r.responseCode + '\n' + "Sent = " + r.bytesSent);
                  res = Ext.decode(res);
                  if(res)
                  {
                     metaData = res.metaData || '';
                  }
                  else
                  {
                     Ext.Logger.warn('No Data returned by the server.');
                  }
               }
               catch (ex)
               {
                  Ext.Logger.warn('Unable to parse the JSON returned by the server: ' + ex.toString());
               }

               if(metaData && metaData['photo_url'] && metaData['upload_token'])
               {
                  console.log("Uploading to Facebook using upload_token[" + metaData['upload_token'] + "]...");
                  //
                  // Upload Photo to Facebook
                  //
                  var params =
                  {
                     'message' : 'Photo Description',
                     'url' : metaData['photo_url'],
                     'access_token' : FB.getAccessToken()
                  }

                  FB.api('/me/photos', 'post', params, function(response)
                  {
                     if(!response || response.error)
                     {
                        var message = (response && response.error) ? response.error.message : me.fbUploadFailedMsg;
                        Ext.Viewport.setMasked(false);
                        Ext.device.Notification.show(
                        {
                           title : 'Upload Failed!',
                           message : message
                        });
                     }
                     else
                     {
                        console.debug('Facebook Post ID - ' + response.id);

                        Challenge['setCompleteChallengeURL'](me.challengeId);
                        Challenge.load(me.challengeId,
                        {
                           jsonData :
                           {
                           },
                           params :
                           {
                              venue_id : venueId,
                              merchant_id : merchantId,
                              latitude : position.coords.latitude,
                              longitude : position.coords.longitude,
                              'upload_token' : metaData['upload_token']
                           },
                           callback : function(records, operation)
                           {
                              metaData = Challenge.getProxy().getReader().metaData;
                              if(operation.wasSuccessful() && metaData)
                              {
                                 //
                                 // Update points from the purchase or redemption
                                 //
                                 cstore.getById(customerId).set('points', metaData['account_points']);
                                 console.debug("Points Earned = " + points + ' Pts');
                                 Ext.device.Notification.show(
                                 {
                                    title : 'Upload Complete',
                                    message : me.photoUploadSuccessMsg(metaData['points']),
                                    callback : function()
                                    {
                                       me.popView();
                                    }
                                 });
                              }
                           }
                        });
                     }
                  });
               }
               else
               {
                  Ext.Viewport.setMasked(false);
               }
            }, function(error)
            {
               console.log(me.noPhotoUploadedMsg);
               console.log("An error has occurred: Code = " + error.code);
               Ext.Viewport.setMasked(false);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.noPhotoUploadedMsg(message + Genesis.constants.addCRLF())
               });
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
      });
      /*
       Venue['setSharePhotoURL']();
       Venue.load(1,
       {
       jsonData :
       {
       },
       params :
       {
       image : 'data:image/jpeg;base64,' + imageBase64
       },
       callback : function(records, operation)
       {
       var metaData = Venue.getProxy().getReader().metaData;
       if(operation.wasSuccessful() && metaData)
       {
       }
       else
       if(operation.wasSuccessful() && !metaData)
       {
       }
       }
       });
       */
   },
   onCameraErrorFn : function(message)
   {
      console.debug("onCameraErrorFn - message[" + message + "]");

      Ext.device.Notification.show(
      {
         title : 'Error',
         message : me.photoTakenFailMsg(msg)
      });
   },
   onPhotoBtnCommon : function(sourceType)
   {
      var me = this;
      var photoAction = me.getChallengePage().photoAction;
      photoAction.hide();
      if(Genesis.constants.isNative())
      {
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
         me.onCameraSuccessFn('http://photos.getkickbak.com/paella9finish1.jpg');
      }
   },
   onLibraryBtnTap : function(b, e, eOpts)
   {
      this.onPhotoBtnCommon(Camera.PictureSourceType.PHOTOLIBRARY);
   },
   onAlbumBtnTap : function(b, e, eOpts)
   {
      this.onPhotoBtnCommon(Camera.PictureSourceType.SAVEDPHOTOALBUM);
   },
   onCameraBtnTap : function(b, e, eOpts)
   {
      this.onPhotoBtnCommon(Camera.PictureSourceType.CAMERA);
   },
   onActivate : function()
   {
      var record = this.getViewPortCntlr().getVenue();
      var venueId = record.getId();
      var carousel = this.getChallengePage().query('carousel')[0];
      var items = record.challenges().getRange();

      carousel.removeAll(true);
      for(var i = 0; i < Math.ceil(items.length / 6); i++)
      {
         carousel.add(
         {
            xtype : 'dataview',
            cls : 'challengeMenuSelections',
            useComponents : true,
            defaultType : 'challengemenuitem',
            scrollable : false,
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
   },
   onDeactivate : function()
   {
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getChallengePage();
   },
   openMainPage : function()
   {
      this.pushView(this.getMainPage());
      console.log("ChallengePage Opened");
   },
   isOpenAllowed : function()
   {
      // Check whether Page cannot opened
      return ((this.getViewportCntlr().getVenue()) ? true : "Cannot open Challenges until You have Checked-in into a Venue");
   }
});
