(function()
{
   var width, height;
   var setImageSize = function()
   {
      var image = $('#earnPtsImage')[0];
      // specific OS
      if ($.os.ios)
      {
         width = height = 171;
      }
      else if ($.os.android || $.os.webos || $.os.blackberry || $.os.bb10 || $.os.rimtabletos)
      {
         if (window.devicePixelRatio > 1)
         {
            width = height = 4 * 48;
         }
         else
         {
            width = height = 4 * 36;
         }
      }
      if ($.os.tablet)
      {
         height = width *= 2;
      }
      else
      {
         var ratio = (window.orientation === 0) ? 1 : window.screen.width / window.screen.height;
         image.style.height = (height * ratio) + 'px';
         image.style.width = (height * ratio) + 'px';
      }
   }
   var orientartionChange = function()
   {
      hideAddressBar();
      setImageSize();
   }
   window.addEventListener("orientationchange", orientartionChange);

   $(document).ready(function()
   {
      setImageSize();

      var image = $('#earnPtsImage')[0], message = $('#earnPtsMessage')[0];

      image.src = 'resources/themes/images/v1/ios/prizewon/transmit.svg';
      message.innerHTML = 'Confirm before tapping against the KICKBAK Card Reader';
   });
})();

