_build = "MobileWebServer";
var phoneGapAvailable = false, serverHost, merchantMode = true, _application, _filesAssetCount = 0, debugMode = true;
function onReady()
{
   window.plugins.proximityID.init(0.5, 0.5);
}
