(function()
{
   var _notifications =
   {
   }, _frame, timeout = 30 * 1000, _foreground = null;
   var debugMode = false;
   var setForeground = function()
   {
      var appWindow = chrome.app.window.current();

      if (!_foreground)
      {
         _foreground = setTimeout(function()
         {
            _foreground = null;
         }, 5 * 1000);
         appWindow.restore();
         appWindow.focus();
      }
   };
   var closeNotification = function(id, byUser)
   {
      try
      {
         clearTimeout(_notifications[id].task);
         delete _notifications[id];
      }
      catch(e)
      {
      }
   };

   document.addEventListener("DOMContentLoaded", function(event)
   {
      var url, path;
      if (!debugMode)
      {
         serverHost = "http://www.getkickbak.com";
         path = "/merchantApp/";
      }
      else
      {
         serverHost = "http://192.168.0.52:3000";
         //serverHost = 'http://192.168.0.46:3000';
         //serverHost = 'http://76.10.173.153';
         //serverHost = 'http://www.dev1getkickbak.com';
         //serverHost = 'http://www.devgetkickbak.com';
         path = "/javascripts/build/MobileServer/testing/";
      }
      _frame = document.getElementById('merkickbak');
      _frame.src = serverHost + path + "index.html";

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
      // LicenseKey & Post Notification Messaging
      //
      _frame.addEventListener('loadstop', function(e)
      {
         e.target.contentWindow.postMessage(
         {
            cmd : 'init'
         }, "*");
      });

      chrome.notifications.onClicked.addListener(function(id, byUser)
      {
         closeNotification(id, byUser);
         try
         {
            chrome.notifications.clear(id, function(wasCleared)
            {
            });
            setForeground();
            _frame.contentWindow.postMessage(
            {
               cmd : 'notification_ack',
               data : id
            }, "*");
         }
         catch(e)
         {
         }
      });
      chrome.notifications.onClosed.addListener(closeNotification);
      window.addEventListener('message', function(e)
      {
         var _dataMeta = e.data, cmd = _dataMeta['cmd'], receipts = _dataMeta['receipts'];

         if (!( typeof (_dataMeta) == 'object'))
         {
            return;
         }

         var cmd = _dataMeta['cmd'], receipts = _dataMeta['receipts'];
         var appWindow = chrome.app.window.current();
         switch (cmd)
         {
            case 'bounds' :
            {
               var params = _dataMeta['params'];
               var left = (screen.width) - (params['maxWidth']);
               var top = (screen.height) - (params['minHeight']);

               appWindow.setBounds(params['bounds']);
               app.setMinHeight(params['maxHeight']);
               appWindow.setMaxWidth(params['maxWidth']);
               appWindow.setMinWidth(params['maxWidth']);
               appWindow.moveTo(Math.round(left / 2), Math.round(top / 2));
               break;
            }
            case 'foreground' :
            {
               setForeground();
               break;
            }
            case 'notification_post' :
            {
               for (var i = 0; i < receipts.length; i++)
               {
                  var _receipt = receipts[i];

                  //var _notif = window.webkitNotifications.createNotification("resources/icons/icon@72.png", _receipt['price'],
                  // message);
                  (function(receipt)
                  {
                     var items = [], notif =
                     {
                        task : setTimeout(function()
                        {
                           closeNotification('' + receipt['id']);
                           chrome.notifications.clear('' + receipt['id'], function(wasCleared)
                           {
                           });
                        }, timeout)
                     };

                     _notifications['' + receipt['id']] = notif;
                     for (var x = 0; x < Math.min(receipt['items'].length, 5); x++)
                     {
                        items.push(
                        {
                           title : receipt['items'][x].name,
                           message : ''
                        });
                     }
                     if (receipt['items'].length <= 0)
                     {
                        items.push(
                        {
                           title : 'No items were found',
                           message : ''
                        });
                     }
                     chrome.notifications.create('' + receipt['id'],
                     {
                        iconUrl : "resources/icons/icon@72.png",
                        type : 'list',
                        message : 'Receipt Details',
                        title : "$" + receipt['price'],
                        priority : 2,
                        eventTime : receipt['id'] * 1000,
                        items : items
                     }, function(id)
                     {
                     });
                  })(_receipt);
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
                     var reader = new FileReader();

                     reader.onerror = function(e)
                     {
                        _frame.contentWindow.postMessage(
                        {
                           cmd : 'licenseKey_ack',
                           key : null
                        }, "*");
                     };
                     reader.onload = function(e)
                     {
                        _frame.contentWindow.postMessage(
                        {
                           cmd : 'licenseKey_ack',
                           key : e.target.result
                        }, "*");
                     };

                     reader.readAsText(file);
                  });
               });
               break;
            }
         }
      }, false);
   });
})();
