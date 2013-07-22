/**

 * Listens and launches the window, using a reference
 * to determine if a window already exists. If it does
 * that window is focused, otherwise a new window
 * is created and the reference stored for next time.
 *
 * @see http://developer.chrome.com/trunk/apps/app.runtime.html
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */

chrome.app.runtime.onLaunched.addListener(function()
{
   var debug = false;
   var w = 320;
   var h = 568;
   var left = (screen.width) - (w);
   var top = (screen.height) - (h);

   var win = chrome.app.window.create('launch.html',
   {
      //id : "MerKickBak",
      singleton : true,
      frame : 'none',
      minHeight : h,
      maxWidth : w,
      minWidth : w,
      bounds :
      {
         top : top,
         left : left,
         width : w,
         height : h
      },
      resizable : false
   });
   var webview = win.contentWindow.getElementById('merkickbak');
   webview.src = (!debug) ? "http://www.getkickbak.com/merchant/index.html" : "http://www.dev1getkickbak.com/javascripts/build/MobileServer/testing/index.html";
});
