Ext.define('Genesis.controller.client.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
      challenges_path : '/clientChallenges'
   },
   xtype : 'clientChallengesCntlr',
   config :
   {
      refs :
      {
         challengeBtn : 'clientchallengepageview tabbar button[tag=doit]',
         challengePage :
         {
            selector : 'clientchallengepageview',
            autoCreate : true,
            xtype : 'clientchallengepageview'
         },
         uploadPhotosPage :
         {
            selector : 'uploadphotospageview',
            autoCreate : true,
            xtype : 'uploadphotospageview'
         },
         uploadPhotosBackground : 'uploadphotospageview component[tag=background]',
         postBtn : 'viewportview button[tag=post]'

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
         }

      }
   },
   metaData : null,
   noPhotoUploadedMsg : 'Failed to upload photo to server.',
   fbUploadFailedMsg : 'Failed to upload the photo onto your Facebook account',
   checkinFirstMsg : 'Please Check-In before performing challenges',
   photoUploadSuccessMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Pts for uploading it to Facebook!';
   },
   photoTakenFailMsg : function(msg)
   {
      return msg + 'No Photos were taken.'
   },
   photoUploadIncompletesMsg : 'Trouble updating to server.',
   photoUploadFailValidationMsg : 'Please enter a comment with at least 16 characters in length',
   getPointsMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Points from this challenge!';
   },
   challengeId : null,
   model : ['Challenge'],
   init : function(app)
   {
      this.callParent(arguments);
      console.log("Challenge Init");
   },
   onVerifyChallenge : function(venueId, customerId, id, position)
   {
      var me = this;
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
                     latitude : position.coords.getLatitude(),
                     longitude : position.coords.getLongitude(),
                     'data' : qrcode
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
               console.debug(me.noCodeScannedMsg);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.noCodeScannedMsg
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
   onChallengeBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var selectedItem = me.selectedItem;
      me.challengeId = selectedItem.getId();

      // VenueId can be found after the User checks into a venue
      //return ((this.getViewPortCntlr().getVenue()) ? true : this.checkinFirstMsg);
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
                  var viewport = me.getViewPortCntlr();
                  var venueId = viewport.getVenue().getId();
                  var customerId = viewport.getCustomer().getId();
                  me.onVerifyChallenge(venueId, customerId, me.challengeId, position);
                  delete me.challengeId;
               });
            }
         });
      }
      else
      {
         delete me.challengeId;
      }
   },
   onCameraSuccessFn : function(imageURI)
   {
      var me = this;
      var db = Genesis.constants.getLocalDB();

      console.debug("image URI =[" + imageURI + "]");

      me.imageURI = imageURI;
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
               "auth_token" : db['auth_code']
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
               res = decodeURIComponent(r.response) || '';
               console.debug("Response = " + res);
               try
               {
                  console.debug("Code = " + r.responseCode + '\n' + "Sent = " + r.bytesSent);
                  res = Ext.decode(res);
                  if(res)
                  {
                     metaData = me.metaData = res.metaData || null;
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

               Ext.Viewport.setMasked(false);
               if(metaData && metaData['photo_url'] && metaData['upload_token'])
               {
                  console.log("Uploading to Facebook using upload_token[" + metaData['upload_token'] + "]...");
                  metaData['position'] = position;

                  me.pushView(me.getUploadPhotosPage());
               }
            }, function(error)
            {
               console.log(me.noPhotoUploadedMsg);
               console.log("An error has occurred: Code = " + error.code);
               Ext.Viewport.setMasked(false);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.noPhotoUploadedMsg(error.message + Genesis.constants.addCRLF())
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
   },
   onCameraErrorFn : function(message)
   {
      var me = this;
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
      //me.pushView(me.getUploadPhotosPage());
      //return;
      console.log("Checking for Facebook Plugin ...");
      Genesis.constants.facebook_onLogin(function(params)
      {
         console.log("Accessing Camera Plugin ...");

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
      }, true);

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
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var record = this.getViewPortCntlr().getVenue();
      var venueId = record.getId();
      var carousel = this.getChallengePage().query('carousel')[0];
      var items = record.challenges().getRange();

      carousel.removeAll(true);
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
      }, 1, this);
   },
   onDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Photos Upload Page
   // --------------------------------------------------------------------------
   onUploadPhotosActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var bg = me.getUploadPhotosBackground();

      me.getPostBtn().show();
      bg.setStyle(
      {
         'background-color' : 'black',
         'background-image' : 'url(' + me.metaData['photo_url'] + ')',
         'background-position' : 'center center',
         'background-repeat' : 'no-repeat',
         'background-size' : 'contain'
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
               textareafield.select();
            }
         });
         return;
      }

      var photoAction = me.getChallengePage().photoAction;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();
      var customerId = viewport.getCustomer().getId();
      var points = me.selectedItem.get('points');
      var metaData = me.metaData;
      var position = metaData['position'];
      var params =
      {
         'message' : desc,
         'url' : metaData['photo_url'],
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
      }

      completeUploadPhotosChallenge = function()
      {
         Challenge['setCompleteChallengeURL'](me.challengeId);
         Challenge.load(me.challengeId,
         {
            jsonData :
            {
            },
            params :
            {
               venue_id : venueId,
               //merchant_id : merchantId,
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
                        //
                        // Go back to Checked-in Merchant Account
                        //
                        me.metaData = null;
                        viewport.onFeatureTap('MainPage', 'main');
                     }
                  });
               }
               else
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Upload InComplete!',
                     message : me.photoUploadIncompletesMsg,
                     buttons : ['Try Again', 'Cancel'],
                     callback : function(btn)
                     {
                        if(btn.toLowerCase() == 'try again')
                        {
                           Ext.defer(completeUploadPhotosChallenge, 100);
                        }
                        else
                        {
                           //
                           // Go back to Checked-in Merchant Account
                           //
                           me.metaData = null;
                           viewport.onFeatureTap('MainPage', 'main');
                        }
                     }
                  });
               }
            }
         });
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
                     viewport.onFeatureTap('MainPage', 'main');
                  }
               }
            });
         }
         else
         {
            console.debug('Facebook Post ID - ' + response.id);
            completeUploadPhotosChallenge();
         }
      });
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
      console.log("Client ChallengePage Opened");
   },
   isOpenAllowed : function()
   {
      // Check whether Page cannot opened
      return ((this.getViewportCntlr().getVenue()) ? true : "Cannot open Challenges until You have Checked-in into a Venue");
   }
});
