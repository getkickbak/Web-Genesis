Ext.define('Genesis.controller.client.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.Anim'],
   statics :
   {
   },
   xtype : 'clientChallengesCntlr',
   config :
   {
      routes :
      {
         'referrals' : 'referralsPage',
         'challenges' : 'challengesPage',
         'photoUpload' : 'photoUploadPage'
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
         uploadPhotosBackground : 'clientuploadphotospageview container[tag=background]',
         postBtn : 'viewportview button[tag=post]',
         photoTextarea : 'clientuploadphotospageview textareafield',
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
            showView : 'onReferralsShowView',
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
         'challengecomplete' : 'onChallengeComplete',
         'doChallenge' : 'onChallengeBtnTap',
         'itemTap' : 'onItemTap',
         'referralsItemTap' : 'onReferralsTap'
      }
   },
   metaData : null,
   reservedReferralId : 0,
   referralCbFn : null,
   defaultDescText : 'Please Select a challenge to perform',
   samplePhotoURL : 'http://photos.getkickbak.com/paella9finish1.jpg',
   //noPhotoUploadedMsg : 'Failed to upload photo to server.',
   fbUploadFailedMsg : 'Failed to upload the photo onto your Facebook account',
   checkinFirstMsg : 'Please Check-In before performing challenges',
   photoUploadFbReqMsg : 'Connectivity to Facebook is required to upload photos to your account',
   completingChallengeMsg : 'Completing Challenge ...',
   referralInstructionMsg : 'Get your friend to scan this code using their KickBak App on their mobile phone!',
   customerFirstMsg : 'Before you can make referrals, your must be one of our paying customers! ;-)',
   photoUploadSuccessMsg : function(points)
   {
      return 'We\'ve added earned ' + points + ' points' + Genesis.constants.addCRLF() + //
      'towards your account for uploading photos to Facebook!';
   },
   photoTakenFailMsg : function(msg)
   {
      return msg + Genesis.constants.addCRLF() + 'No Photos were taken.'
   },
   photoUploadIncompletesMsg : function(errors)
   {
      var errorMsg = '';
      if (Ext.isString(errors))
      {
         errorMsg = Genesis.constants.addCRLF() + errors;
      }
      else
      if (Ext.isObject(errors))
      {
         errorMsg = Genesis.constants.addCRLF() + errors.statusText;
      }
      return ('Trouble updating to server.' + errorMsg);
   },
   photoUploadFailValidationMsg : 'Please enter a comment with at least 16 characters in length',
   getPointsMsg : function(points, total)
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
      var me = this;
      this.callParent(arguments);
      console.log("Challenge Init");
      //
      // Preload Pages
      //
      me.getChallengePage();
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   photoEventHandler : function(position)
   {
      var me = this;
      if (me.imageURI)
      {
         if (Genesis.constants.isNative())
         {
            var db = Genesis.db.getLocalDB();
            var options = new FileUploadOptions();

            options.fileKey = "image";
            // Token filename NOT be used
            options.fileName = "DummyPhoto.jpg";
            options.mimeType = "image/jpg";
            options.params =
            {
               "auth_token" : db['auth_code']
            };
            options.headers =
            {
               'Accept' : '*/*',
               'X-CSRF-Token' : db['csrf_code']
            };
            options.chunkedMode = true;

            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.uploadServerMsg
            });

            var ft = new FileTransfer();
            var res, metaData;
            ft.upload(me.imageURI, encodeURI(Genesis.constants.host + '/api/v1/venues/share_photo'), function(r)
            {
               try
               {
                  res = decodeURIComponent(r.response) || '';
                  console.debug('\n' + //
                  "Response = [" + res + ']\n' + //
                  "Code = " + r.responseCode + '\n' + "Sent = " + r.bytesSent);
                  res = Ext.decode(res);
                  if (res)
                  {
                     //
                     // Set MetaData from PhotoUpload here
                     //
                     metaData = me.metaData = res.metaData || null;
                     metaData['position'] = position;
                  }
                  else
                  {
                     console.debug('No Data returned by the server.');
                  }
               }
               catch (ex)
               {
                  console.debug('Unable to parse the JSON returned by the server: ' + ex.toString());
               }

               Ext.Viewport.setMasked(null);
               if (metaData && metaData['photo_url'] && metaData['upload_token'])
               {
                  console.log("Uploading to Facebook using upload_token[" + metaData['upload_token'] + "]...");

                  me.redirectTo('photoUpload');
               }
               navigator.camera.cleanup(Ext.emptyFn, Ext.emptyFn);
               console.debug("Photo Cleanup Complete.")
               delete me.imageURI;
            }, function(error)
            {
               Ext.Viewport.setMasked(null);
               console.log(me.photoTakenFailMsg(error.message));
               //console.log("An error has occurred: Code = " + error.code);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.photoTakenFailMsg(error.message)
               });
               delete me.imageURI;
            }, options);
         }
         else
         {
            me.metaData =
            {
               'photo_url' : me.imageURI
            };
            me.redirectTo('photoUpload');
            /*
             Ext.device.Notification.show(
             {
             title : 'Error',
             message : "Cannot upload photo in Non-Native Mode"
             });
             */
         }
      }
   },
   sendEmailIOS : function(qrcode, emailTpl, subject)
   {
      window.plugins.emailComposer.showEmailComposerWithCB(function(res)
      {
         // Delay is needed to not block email sending ...
         Ext.defer(function()
         {
            Ext.Viewport.setMasked(null);
            me.onCompleteReferralsChallenge();
            switch (res)
            {
               case EmailComposer.ComposeResultType.Failed:
               case EmailComposer.ComposeResultType.NotSent:
               case EmailComposer.ComposeResultType.Cancelled:
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Email Error',
                     message : me.referralFailedMsg
                  });
                  break;
               }
               case EmailComposer.ComposeResultType.Saved:
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Email Saved',
                     message : me.referralSavedMsg
                  });
                  break;
               }
               case EmailComposer.ComposeResultType.Sent:
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Email Sent!',
                     message : me.sendReferralSuccessMsg()
                  });
                  break;
               }
            }
         }, 1, me);
      }, subject, emailTpl, null, null, null, true, [qrcode]);
   },
   sendEmailAndroid : function(stream, emailTpl, subject)
   {
      var me = this;
      var extras =
      {
      };
      extras[WebIntent.EXTRA_SUBJECT] = subject;
      extras[WebIntent.EXTRA_TEXT] = emailTpl;

      console.log("Saving QRCode to temporary file ...");
      window.plugins.base64ToPNG.saveImage(stream,
      {
         filename : 'qrcode.gif',
         overwrite : true
      }, function(result)
      {
         extras[WebIntent.EXTRA_STREAM] = 'file://' + result.filename;

         console.log("QRCode saved to " + extras[WebIntent.EXTRA_STREAM]);
         window.plugins.webintent.startActivity(
         {
            action : WebIntent.ACTION_SEND,
            type : 'text/html',
            extras : extras
         }, function()
         {
            Ext.Viewport.setMasked(null);
            me.onCompleteReferralsChallenge();
            Ext.device.Notification.show(
            {
               title : 'Email Sent!',
               message : me.sendReferralSuccessMsg()
            });
         }, function()
         {
            Ext.Viewport.setMasked(null);
            me.onCompleteReferralsChallenge();
            Ext.device.Notification.show(
            {
               title : 'Email Error',
               message : me.referralFailedMsg
            });
         });
      }, function(error)
      {
      });
      //var writer = new FileWriter('/android_asset/www/' + 'tmp_' + appName + '_' + 'qrcode.gif');
      //writer.write(window.atob(stream), false);
      //console.debug("Content Written to Disk");
      //Genesis.fn.writeFile('qrcode.gif', stream, function(evt)
      //{
      //}
      //);
   },
   sendReferralEmailHandler : function(qrcode, emailTpl, subject)
   {
      var me = this;

      if (Ext.os.is('iOS'))
      {
         me.sendEmailIOS(qrcode, emailTpl, subject);
      }
      else
      if (Ext.os.is('Android'))
      {
         me.sendEmailAndroid(qrcode, emailTpl, subject);
      }

   },
   referralEventHandler : function(tag)
   {
      var me = this, type;
      var venue = me.getViewPortCntlr().getVenue();
      var container = me.getReferralsContainer();

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
         case 'receiver' :
         {
            me.openPage('referrals');
            return;
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
             Ext.Viewport.setMasked(null);
             Ext.device.Notification.show(
             {
             title : 'Error',
             message : me.noPtsXferMsg()
             });
             }
             */
            if (operation.wasSuccessful())
            {
               var qrcode;
               switch (tag)
               {
                  case 'sender' :
                  {
                     qrcode = Genesis.controller.ControllerBase.genQRCode(metaData['data']);

                     /*
                     console.debug('\n' + //
                     'QRCode - ' + qrcode[0] + '\n' //
                     );
                     */
                     //
                     // Query server to get generate qrcode
                     //
                     if (qrcode[0])
                     {
                        me.getQrcode().setStyle(
                        {
                           'background-image' : 'url(' + qrcode[0] + ')',
                           'background-size' : Genesis.fn.addUnit(qrcode[1] * 1.25) + ' ' + Genesis.fn.addUnit(qrcode[2] * 1.25)
                        });
                        container.setActiveItem(1);
                     }
                     Ext.Viewport.setMasked(null);
                     Ext.device.Notification.show(
                     {
                        title : 'Refer A Friend',
                        message : me.referralInstructionMsg
                     });
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

                     me.sendReferralEmailHandler(qrcode, emailTpl, subject);
                     break;
                  }
               }
            }
            else
            {
               Ext.Viewport.setMasked(null);
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

      if (qrcode != null)
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
         me.referralCbFn = null;
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
            //
            // Persist the newly created Customer object
            //
            if (!customer)
            {
               customer = cstore.add(metaData)[0];
               me.persistSyncStores('CustomerStore');
            }
            //
            // Add to Referral DB
            //
            console.debug("Adding Referral Code to Referral DB ...");
            Genesis.db.addReferralDBAttrib("m" + customer.getMerchant().getId(), qrcode);

            if (me.referralCbFn)
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
                     var controller = app.getController('client.Accounts');
                     controller.setMode('profile');
                     controller.fireEvent('selectMerchant', null, customer);
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
               me.getConsolationMsg(metaData['message']))
            });

            me.fireEvent('updatemetadata', metaData);
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
      var proxy = Challenge.getProxy();

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
            Ext.Viewport.setMasked(null);

            var metaData2 = proxy.getReader().metaData;
            if (operation.wasSuccessful() && metaData2)
            {
               //
               // Update points from the purchase or redemption
               //
               var account_info = metaData2['account_info'];
               var reward_info = metaData2['reward_info'];
               var customer = cstore.getById(customerId);

               customer.set('points', account_info['points']);
               me.persistSyncStores('CustomerStore');

               console.debug("Points Earned = " + metaData2['points'] + ' Pts');

               me.fireEvent('updatemetadata', metaData2);
               me.metaData = null;
               me.popView();

               Ext.device.Notification.show(
               {
                  title : 'Upload Complete',
                  message : ((reward_info['points'] > 0) ? //
                  me.photoUploadSuccessMsg(reward_info['points']) : //
                  me.getConsolationMsg(metaData2['message']))
               });
            }
            else
            {
               proxy.supressErrorsPopup = true;
               Ext.device.Notification.show(
               {
                  title : 'Upload Failed!',
                  message : me.photoUploadIncompletesMsg(operation.getError()),
                  buttons : ['Try Again', 'Cancel'],
                  callback : function(btn)
                  {
                     proxy.supressErrorsPopup = false;
                     if (btn.toLowerCase() == 'try again')
                     {
                        Ext.defer(me.fireEvent, 1 * 1000, me, ['fbphotouploadcomplete']);
                     }
                     else
                     {
                        //
                        // Go back to Checked-in Merchant Account
                        //
                        me.metaData = null;
                        me.goToMerchantMain(true);
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
   onItemTap : function(model)
   {
      var viewport = this.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);

      var desc = this.getChallengeDescContainer();
      Ext.Anim.run(desc.element, 'fade',
      {
         //direction : 'right',
         duration : 600,
         out : false,
         autoClear : true,
         scope : this,
         before : function()
         {
            for (var i = 0; i < desc.getItems().length; i++)
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

      if (selectedItem)
      {
         switch (selectedItem.get('type').value)
         {
            case 'referral' :
            {
               //
               // You can refer a friend as long as you are a paying customer
               //
               if (viewport.getCustomer().get('visits') <= 0)
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Refer A Friend',
                     message : me.customerFirstMsg
                  });
                  return;
               }
               break;
            }
            default :
               // VenueId can be found after the User checks into a venue
               if (!(cvenue && venue && (cvenue.getId() == venue.getId())))
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : me.checkinFirstMsg
                  });
                  return;
               }
               break;
         }

         switch (selectedItem.get('type').value)
         {
            case 'photo' :
            {
               me.getChallengePage().takePhoto();
               break;
            }
            case 'referral' :
            {
               me.redirectTo('referrals');
               break;
            }
            case 'menu' :
            case 'birthday' :
            case 'vip' :
            case 'custom' :
            {
               if (selectedItem.get('require_verif'))
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
      var me = this;
      var id, type, params;
      if (!position)
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
            Ext.Viewport.setMasked(null);
            if (operation.wasSuccessful() && metaData)
            {
               me.fireEvent('challengecomplete', type, qrcode, venueId, customerId, position);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Referrals Challenge Page
   // --------------------------------------------------------------------------
   onReferralsShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         //console.debug("Refreshing Referrals Page ...");
      }
   },
   onReferralsActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var container = me.getReferralsContainer();
      if (container)
      {
         container.setActiveItem(0);
      }
      //activeItem.createView();
   },
   onReferralsDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
   },
   onCompleteReferralsChallenge : function(b, e, eOpts)
   {
      // Nothing to do but go back to Main Challenge Page
      this.popView();
   },
   onReferralsTap : function(tag)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      if (viewport.getCustomer().get('visits') > 0)
      {
         switch (tag)
         {
            case 'emailsender' :
            case 'sender' :
            {
               me.referralEventHandler(tag);
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

      Ext.Viewport.setMasked(null);
      me.imageURI = imageURI;
      me.getGeoLocation();
   },
   onCameraErrorFn : function(message)
   {
      var me = this;
      console.debug("onCameraErrorFn - message[" + message + "]");

      Ext.Viewport.setMasked(null);
      Ext.device.Notification.show(
      {
         title : 'Error',
         message : me.photoTakenFailMsg(message)
      });
      navigator.camera.cleanup(Ext.emptyFn, Ext.emptyFn);
      console.debug("Photo Cleanup Complete.")
   },
   onPhotoBtnCommon : function(sourceType)
   {

      var me = this;
      var photoAction = me.getChallengePage().photoAction;
      photoAction.hide();

      console.log("Checking for Facebook Plugin ...");
      if (Genesis.constants.isNative())
      {
         Genesis.fb.facebook_onLogin(function(params)
         {
            console.log("Accessing Camera Plugin ...");
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.cameraAccessMsg
            });

            Ext.device.Camera.capture(
            {
               success : me.onCameraSuccessFn,
               failure : me.onCameraErrorFn,
               scope : me,
               quality : 49,
               correctOrientation : true,
               //correctOrientation : false,
               //saveToPhotoAlbum : false,
               destination : 'file',
               source : sourceType,
               allowEdit : false,
               encoding : "jpeg",
               width : 960,
               height : 960
               //targetHeight : 480
            });
         }, true, me.photoUploadFbReqMsg);
      }
      else
      {
         me.onCameraSuccessFn(me.samplePhotoURL);
      }

   },
   onLibraryBtnTap : function(b, e, eOpts, eInfo)
   {
      //this.onPhotoBtnCommon(Genesis.constants.isNative() ? Camera.PictureSourceType.PHOTOLIBRARY : null);
      this.onPhotoBtnCommon(Genesis.constants.isNative() ? "library" : null);
   },
   onAlbumBtnTap : function(b, e, eOpts, eInfo)
   {
      //this.onPhotoBtnCommon(Genesis.constants.isNative() ? Camera.PictureSourceType.SAVEDPHOTOALBUM : null);
      this.onPhotoBtnCommon(Genesis.constants.isNative() ? "album" : null);
   },
   onCameraBtnTap : function(b, e, eOpts, eInfo)
   {
      //this.onPhotoBtnCommon(Genesis.constants.isNative() ? Camera.PictureSourceType.CAMERA : null);
      this.onPhotoBtnCommon(Genesis.constants.isNative() ? "camera" : null);
   },
   onUploadPhotosActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      //me.getPostBtn().show();
      activeItem.metaData = me.metaData;
      //activeItem.createView();
   },
   onUploadPhotosDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      this.getPhotoTextarea().setValue(null);
      //this.getPostBtn().hide();
   },
   onUploadPhotosTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var page = me.getUploadPhotosPage();
      var textareafield = me.getPhotoTextarea();
      var desc = textareafield.getValue();

      if ((desc.length > textareafield.getMaxLength()) || (desc.length < 16))
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

      if ( typeof (FB) != 'undefined')
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.completingChallengeMsg
         });
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
            if (!response || response.error)
            {
               var message = (response && response.error) ? response.error.message : me.fbUploadFailedMsg;
               Ext.Viewport.setMasked(null);
               Ext.device.Notification.show(
               {
                  title : 'Upload Failed!',
                  message : message,
                  buttons : ['Try Again', 'Cancel'],
                  callback : function(btn)
                  {
                     if (btn.toLowerCase() == 'try again')
                     {
                        Ext.defer(me.onUploadPhotosTap, 1 * 1000, me);
                     }
                     else
                     {
                        //
                        // Go back to Checked-in Merchant Account
                        //
                        me.metaData = null;
                        me.goToMerchantMain(true);
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
      }
      else
      {
         //
         // Go back to Checked-in Merchant Account
         //
         me.metaData = null;
         me.popView();
         //me.fireEvent('fbphotouploadcomplete');
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   referralsPage : function()
   {
      var me = this;
      //
      // Show Referrals Page
      //
      me.setAnimationMode(me.self.superclass.self.animationMode['cover']);
      me.pushView(me.getReferralsPage());
   },
   challengesPage : function()
   {
      this.setAnimationMode(this.self.superclass.self.animationMode['coverUp']);
      this.pushView(this.getMainPage());
   },
   photoUploadPage : function()
   {
      var me = this;
      //
      // Goto PhotoUpload Page
      //
      me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
      me.pushView(me.getUploadPhotosPage());
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, cb)
   {
      var me = this;
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
                  if (btn.toLowerCase() == 'proceed')
                  {
                     if (cb)
                     {
                        me.referralCbFn = cb;
                     }
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
      this.redirectTo('challenges');
      console.log("Client ChallengePage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
