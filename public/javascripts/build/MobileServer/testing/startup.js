_build = "MobileWebServer";
var phoneGapAvailable = false, serverHost, merchantMode = true, _application, _filesAssetCount = 0, debugMode = true, _frame;
function onReady()
{
   _frame = document.getElementById('merkickbak');
   window.plugins.proximityID.init(0.5, 0.5);
}
