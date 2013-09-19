/**Works on all versions prior and including Cordova 1.6.1
 * by mcaesar
 *  MIT license
 *
 */

/* This increases plugin compatibility */
(function(cordovaRef)
{

   /**
    * The Java to JavaScript Gateway 'magic' class
    */
   Base64ToPNG = function()
   {
   }
   /**
    * Save the base64 String as a PNG file to the user's Photo Library
    */
   Base64ToPNG.prototype.saveImage = function(b64String, params, win, fail)
   {
      cordovaRef.exec(win, fail, "Base64ToPNG", "saveImage", [b64String, params]);
   };

   cordovaRef.addConstructor(function()
   {
      if (!window.plugins)
      {
         window.plugins =
         {
         };
      }
      if (!window.plugins.base64ToPNG)
      {
         window.plugins.base64ToPNG = new Base64ToPNG();
      }
   });

})(window.cordova || window.Cordova || window.PhoneGap);
