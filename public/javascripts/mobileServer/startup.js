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
   //
   // Post Notification
   //
   _frame.addEventListener('message', function(e)
   {
      var data = e.data;

      if (( typeof (data) == 'object') && (data['cmd'] == 'notification'))
      {
         var message = "No items were found";

         if (data['items'].length == 1)
         {
            message = data['items'][0];
         }
         else if (data['items'].length > 1)
         {
            message = data['items'][0] + '\n' + data['items'][1]
         }

         var notif = window.webkitNotifications.createNotification("resources/icons/icon@72.png", data['price'], message);
         notif.onDisplay(function()
         {
            notif.task = setInterval(function()
            {
               clearInterval(notif.task);
               notif.close();
               notif = null;
            }, 30 * 1000);
         });
         notif.onClick(function()
         {
            _frame.contentWindow.postMessage(
            {
               cmd : 'earn_points',
               data : data['id']
            }, "*");
         });
         notif.onClose(function()
         {
            if (notif.task)
            {
               clearInterval(notif.task);
               notif = null;
            }
         });
         notif.show();
         /*
          chrome.notifications.create("",
          {
          type : 'basic',
          iconUrl : 'resources/icons/icon@72.png',
          title : data['price'],
          expandedMessage : 'Testing',
          message : data['item'],
          buttons : [
          {
          title : 'Earn Points!'
          },
          {
          title : 'Ignore'
          }]
          }, function()
          {
          });
          */
      }
   }, false);
});
