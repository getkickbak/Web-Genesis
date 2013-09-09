// =============================================================
// EarnPtsPage
// =============================================================
(function()
{
   var imagePath = function(image)
   {
      return 'resources/themes/images/v1/ios/prizewon/' + image + '.svg';
   };

   $(document).ready(function()
   {
      var message = $('#earnptspageview .x-docked-top .x-innerhtml'), image = $('#earnPtsImage'), mobile = $('#earnPtsMobileNumber')[0];

      $.Event('kickbak:mobile');
      $.Event('kickbak:loyalty');
      $.Event('kickbak:preLoad');
      $.Event('kickbak:broadcast');

      $('#earnptspageview').on('kickbak:mobile', function(e)
      {
         //
         // Ask for Mobile Number
         //
         image[0].style.display = 'none';
         image[0].style.opacity = 0;
         mobile.style.display = '';
         message.html('Enter your Mobile Number');
         $('#earnPtsChoiceButtons').removeClass('x-item-hidden');
         $('#earnPtsDismissButtons').addClass('x-item-hidden');
         $("#earnptspageview").animate(
         {
            top : 0 + 'px',
            height : calcHeight() + 'px',
         },
         {
            duration : 0.75 * 1000,
            easing : 'ease-out',
            complete : function()
            {
               $('#inputMobile').focus();
            }
         });
      }).on('kickbak:loyalty', function(e)
      {
         //
         // Show Loyalty Card instead
         //
         image[0].style.opacity = 0;
         $('#earnPtsImage img')[0].src = imagePath('loyaltycard');

         $('#earnPtsChoiceButtons').addClass('x-item-hidden');
         $('#earnPtsDismissButtons').addClass('x-item-hidden');

         message.html(gblController.showToServerMsg());

         image.animate(
         {
            opacity : 1
         },
         {
            duration : 1 * 1000,
            easing : 'linear',
            complete : function()
            {
            }
         });
      }).on('kickbak:preLoad', function(e)
      {
         //
         // PreLoad Mobile Phone for Tapless
         //
         var transition = (mobile.style.display == '');

         mobile.style.display = 'none';
         $('#earnPtsChoiceButtons').removeClass('x-item-hidden');
         $('#earnPtsDismissButtons').addClass('x-item-hidden');
         
         $('#earnPtsImage img')[0].src = imagePath('phoneInHand');
         image[0].style.opacity = (transition) ? 0 : 1;         
         image[0].style.display = '';

         message.html(gblController.prepareToSendMerchantDeviceMsg);

         if (transition)
         {
            image.animate(
            {
               opacity : 1
            },
            {
               duration : 0.75 * 1000,
               easing : 'linear',
               complete : function()
               {
               }
            });
         }
         else
         {
            $("#earnptspageview").animate(
            {
               top : 0 + 'px',
               height : calcHeight() + 'px',
            },
            {
               duration : 0.75 * 1000,
               easing : 'ease-out',
               complete : function()
               {
               }
            });
         }
      }).on('kickbak:broadcast', function(e)
      {
         image[0].style.opacity = 0;
         $('#earnPtsImage img')[0].src = imagePath('transmit');

         $('#earnPtsChoiceButtons').addClass('x-item-hidden');
         $('#earnPtsDismissButtons').removeClass('x-item-hidden');

         message.html(gblController.lookingForMerchantDeviceMsg());

         image.animate(
         {
            opacity : 1
         },
         {
            duration : 0.75 * 1000,
            easing : 'linear',
            complete : function()
            {
            }
         });
      });
   });
})();
