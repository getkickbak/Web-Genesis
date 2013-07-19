_build = "MobileWebServer";
var phoneGapAvailable = false, serverHost, merchantMode = true, _application, _filesAssetCount = 0, debugMode = true;
document.addEventListener("DOMContentLoaded", function(event)
{
   var _frame = document.getElementById('merkickbak');
   _frame.addEventListener('permissionrequest', function(e)
   {
      var allowed = false;
      if (e.permission === 'pointerLock' || e.permission === 'media' || e.permission === 'geolocation')
      {
         allowed = true;
         e.request.allow();
      }
      else
      {
         e.request.deny();
      }
      console.debug("[" + e.target.id + "] permissionrequest: permission=" + e.permission + " " + ( allowed ? "allowed" : "DENIED"));
   }, false);

   window.plugins.proximityID.init(0.5, 0.5);
});
