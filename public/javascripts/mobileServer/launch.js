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
   chrome.app.window.create('launch.html',
   {
      id : "MerKickBak",
      singleton : true,
      bounds :
      {
         width : 320,
         height : 568
      },
      resizable : false
   });
});
