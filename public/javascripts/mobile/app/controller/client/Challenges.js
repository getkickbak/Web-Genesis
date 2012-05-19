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
   samplePhotoURL : 'http://photos.getkickbak.com/paella9finish1.jpg',
   noPhotoUploadedMsg : 'Failed to upload photo to server.',
   fbUploadFailedMsg : 'Failed to upload the photo onto your Facebook account',
   checkinFirstMsg : 'Please Check-In before performing challenges',
   photoUploadFbReqMsg : 'Connectivity to Facebook is required to upload photos to your account',
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
   },
   init : function(app)
   {
      this.callParent(arguments);
      console.log("Challenge Init");
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      //
      // Either we are in PhotoUpload mode, or we are in Challenge Authorization Mode
      //
      if(me.imageURI)
      {
         if(Genesis.constants.isNative())
         {
            var db = Genesis.constants.getLocalDB();
            var options = new FileUploadOptions();
            options.fileKey = "image";
            // Token filename NOT be used
            options.fileName = "DummyPhoto.jpg";
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
      else
      {
         me.metaData =
         {
            'position' : position
         };
         me.scanQRCode();
      }
   },
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var venueId = viewport.getVenue().getId();
      var customerId = viewport.getCustomer().getId();

      if(qrcode)
      {
         me.onCompleteChallenge(qrcode, venueId, customerId, me.metaData['position']);
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
   onCompleteChallenge : function(qrcode, venueId, customerId, position)
   {
      var me = this;
      console.log("Completing Challenge ID(" + me.selectedItem.getId() + ")");
      Challenge['setCompleteChallengeURL'](me.selectedItem.getId());
      Challenge.load(me.selectedItem.getId(),
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
            console.log('Challenge Completed(' + operation.wasSuccessful() + ')');
            if(operation.wasSuccessful() && metaData)
            {
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
            case 'menu' :
            case 'birthday' :
            case 'referral' :
            case 'checkin' :
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
                  Ext.device.Notification.show(
                  {
                     title : 'VIP Challenge',
                     message : 'Test Data'
                  });
               }
               break;
            }
         }
      }
   },
   onCameraSuccessFn : function(imageURI)
   {
      var me = this;

      console.debug("image URI =[" + imageURI + "]");

      me.imageURI = imageURI;
      me.getGeoLocation();
   },
   onCameraErrorFn : function(message)
   {
      var me = this;
      console.debug("onCameraErrorFn - message[" + message + "]");

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
      }, true, false, me.photoUploadFbReqMsg);

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
   completeUploadPhotosChallenge : function()
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
            'upload_token' : metaData['upload_token'],
            'data' : ''
         },
         callback : function(records, operation)
         {
            metaData2 = Challenge.getProxy().getReader().metaData;
            if(operation.wasSuccessful() && metaData2)
            {
               //
               // Update points from the purchase or redemption
               //
               cstore.getById(customerId).set('points', metaData2['account_points']);
               console.debug("Points Earned = " + points + ' Pts');
               Ext.device.Notification.show(
               {
                  title : 'Upload Complete',
                  message : ((metaData2['points'] > 0) ? me.photoUploadSuccessMsg(metaData2['points']) : me.getConsolationMsg(metaData2['message'])),
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
                  title : 'Upload Failed!',
                  message : me.photoUploadIncompletesMsg,
                  buttons : ['Try Again', 'Cancel'],
                  callback : function(btn)
                  {
                     if(btn.toLowerCase() == 'try again')
                     {
                        Ext.defer(me.completeUploadPhotosChallenge, 100, me);
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
   },
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
            me.completeUploadPhotosChallenge();
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
