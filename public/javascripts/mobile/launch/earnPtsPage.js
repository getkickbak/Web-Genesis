// =============================================================
// EarnPtsPage
// =============================================================
(function()
{
   var imagePath = function(image)
   {
      return '../resources/themes/images/v1/ios/' + image + '.svg';
   };

   $(document).ready(function()
   {
      var message = $('#earnptspageview .x-docked-top .x-innerhtml'), image = $('#earnPtsImage');

      $.Event('kickbak:loyalty');
      $.Event('kickbak:preLoad');
      $.Event('kickbak:broadcast');

      $('#earnptspageview').on('kickbak:loyalty', function(e)
      {
         //
         // Show Loyalty Card instead
         //
         image[0].style.opacity = 0;
         $('#earnPtsImage img')[0].src = imagePath('prizewon/loyaltycard');

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
         //var transition = (mobile.style.display == '');
         var transition = false;

         $('#earnPtsChoiceButtons').removeClass('x-item-hidden');
         $('#earnPtsDismissButtons').addClass('x-item-hidden');

         $('#earnPtsImage img')[0].src = imagePath('prizewon/phoneInHand');
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
               top : 0 + 'px'
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
         $('#earnPtsImage img')[0].src = imagePath('prizewon/transmit');

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
