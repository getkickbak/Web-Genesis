_build = "MobileWebServer";
var phoneGapAvailable = false, serverHost, merchantMode = true, _application, _filesAssetCount = 0, debugMode = true;
function onReady()
{
   var _frame = document.getElementById('merkickbak');
   _frame.addEventListener('loadstop', function(e)
   {
      e.target.contentWindow.postMessage(
      {
         cmd : 'init'
      }, 'http://www.dev1getkickbak.com');
   });
   window.plugins.proximityID.init(0.5, 0.5);
}
