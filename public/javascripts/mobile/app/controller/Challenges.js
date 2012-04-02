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
      var id = selectedItem.getId();

      if(selectedItem)
      {
         switch (selectedItem.get('challenge_type'))
         {
            case 'menu' :
               break;
            case 'checkin' :
               break;
            case 'photo' :
               {
                  me.getChallengePage().takePhoto();
                  break;
               }s
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
            message : 'Show this to your server before proceeding.',
            callback : function()
            {
               me.getGeoLocation(function(position)
               {
                  me.scanQRCode(
                  {
                     callback : function(response)
                     {
                        if(response && response.responseCode)
                        {
                           var qrcode = response.responseCode;
                           console.log("qrcode - " + qrcode);

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
                              callback : function()
                              {
                                 var metaData = Challenge.getProxy().getReader().metaData;
                                 //
                                 // Update points from the purchase or redemption
                                 //
                                 Ext.device.Notification.show(
                                 {
                                    title : 'Earn Points',
                                    message : me.getPointsMsg(metaData['account_points'])
                                 });
                                 cstore.getById(customerId).set('points', metaData['account_points']);
                              }
                           })

                        }
                        else
                        {
                           console.log("No QR Code Scanned!");
                           Ext.device.Notification.show(
                           {
                              title : 'Error',
                              message : 'No QR Code Scanned!'
                           });
                        }
                     }
                  });
               });
            }
         });
      }
   },
   onCameraSuccessFn : function(imageBase64)
   {
      var me = this;
      var photoAction = me.getChallengePage().photoAction;
      var points = me.selectedItem.get('points');
      console.log("image size =[" + imageBase64.length + " bytes]");

      //
      // To-do : Add the points to customer
      //

      console.log("Points Earned = " + points + ' Pts');

      if(Genesis.constants.isNative())
      {
      }
      else
      {
      }
      //
      // Upload Photo to Facebook
      //
      var params =
      {
         'message' : 'Photo Description',
         'url' : 'data:image/jpeg;base64,' + imageBase64,
         'access_token' : FB.getAccessToken()
      }

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : 'Uploading to Facebook ...'
      });

      FB.api('/me/photos', 'post', params, function(response)
      {
         Ext.Viewport.setMasked(false);
         if(!response || response.error)
         {
            var message = (response && response.error) ? response.error.message : 'Failed to upload the photo onto your Facebook account';
            Ext.device.Notification.show(
            {
               title : 'Upload Failed!',
               message : message
            });
         }
         else
         {
            console.log('Post ID - ' + response.id);

            Ext.device.Notification.show(
            {
               title : 'Upload Complete',
               message : 'Your Photo has been uploaded to your Facebook account',
               callback : function()
               {
                  me.popView();
               }
            });
         }
      });
   },
   onCameraErrorFn : function(message)
   {
      console.log("onCameraErrorFn - message[" + message + "]");

      Ext.device.Notification.show(
      {
         title : 'Error',
         message : message + ((!Genesis.constants.isNative()) ? '<br/>' : '\n') + 'No Photos were taken.'
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
            destinationType : Camera.DestinationType.DATA_URL,
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
