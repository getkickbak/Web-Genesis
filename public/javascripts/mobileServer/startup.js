(function()
{
   var _notifications = [], _frame, timeout = 30 * 1000;
   var debug = true;

   document.addEventListener("DOMContentLoaded", function(event)
   {
      _frame = document.getElementById('merkickbak');
      _frame.src = ((!debug) ? "http://www.getkickbak.com/merchant" : "http://www.dev1getkickbak.com/javascripts/build/MobileServer/testing") + "/index.html";

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
         var _dataMeta = e.data;

         if (!( typeof (_dataMeta) == 'object'))
         {
            return;
         }

         switch (_dataMeta['cmd'])
         {
            case 'notification_post' :
            {
               for (var i = 0; i < _dataMeta['receipts'].length; i++)
               {
                  var _receipt = _dataMeta['receipts'][i], message = "No items were found";

                  if (_receipt['items'].length == 1)
                  {
                     message = _receipt['items'][0];
                  }
                  else if (_receipt['items'].length > 1)
                  {
                     message = _receipt['items'][0] + '\n' + _receipt['items'][1]
                  }

                  var _notif = window.webkitNotifications.createNotification("resources/icons/icon@72.png", _receipt['price'], message);
                  _notifications.push(_notif);

                  (function(notif, receipt)
                  {
                     notif.onClick(function()
                     {
                        clearTimeout(notif.task);
                        _frame.contentWindow.postMessage(
                        {
                           cmd : 'notification_ack',
                           data : receipt['id']
                        }, "*");
                     });
                     notif.onClose(function()
                     {
                        clearTimeout(notif.task);
                        delete notif.task;
                        _notifications.splice(_notifications.indexOf(notif), 1);
                     });
                     notif.task = setTimeout(notif.close, timeout);
                     notif.show();
                     /*
                      chrome.notifications.create("",
                      {
                      type : 'basic',
                      iconUrl : 'resources/icons/icon@72.png',
                      title : receipt['price'],
                      expandedMessage : 'Testing',
                      message : receipt['item'],
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
                  })(_notif, _receipt);
               }
               break;
            }
            case 'licenseKey' :
            {
               chrome.fileSystem.chooseEntry(
               {
                  type : 'openFile',
                  accepts : [
                  {
                     //mimeTypes: ['text/*'],
                     extensions : ['txt']
                  }]
               }, function(readOnlyEntry)
               {
                  if (!readOnlyEntry)
                  {
                     _frame.contentWindow.postMessage(
                     {
                        cmd : 'licenseKey_ack',
                        key : null
                     }, "*");
                     return;
                  }
                  readOnlyEntry.file(function(file)
                  {
                     readAsText(readOnlyEntry, function(result)
                     {
                        _frame.contentWindow.postMessage(
                        {
                           cmd : 'licenseKey_ack',
                           key : result
                        }, "*");
                     });
                  });
               });
               break;
            }
         }
      }, false);
   });
})();
