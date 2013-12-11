/**

 * Listens and launches the window, using a reference
 * to determine if a window already exists. If it does
 * that window is focused, otherwise a new window
 * is created and the reference stored for next time.
 *
 * @see http://developer.chrome.com/trunk/apps/app.runtime.html
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */

var appWindow;

chrome.app.runtime.onLaunched.addListener(function()
{
   var w = 320;
   var h = 568;
   var left = (screen.width) - (w);
   var top = (screen.height) - (h);

   chrome.app.window.create('launch.html',
   {
      id : "MerKickBak",
      hidden : true,
      singleton : true,
      frame : 'none',
      minHeight : h,
      maxWidth : w,
      minWidth : w,
      bounds :
      {
         width : w,
         height : h
      },
      resizable : false
   }, function(_appWindow)
   {
      appWindow = _appWindow;
      appWindow.moveTo(Math.round(left / 2), Math.round(top / 2));
      appWindow.show();
   });
});
