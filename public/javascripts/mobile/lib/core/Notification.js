(function(cordova)
{
   /*
    window.plugins = window.plugins ||
    {
    };
    */
   navigator.notification =
   //window.plugins.notification =
   {
      /**
       * Open a native alert dialog, with a customizable title and button text.
       *
       * @param {String} message              Message to print in the body of the alert
       * @param {Function} completeCallback   The callback that is called when user clicks on a button.
       * @param {String} title                Title of the alert dialog (default: Alert)
       * @param {String} buttonLabel          Label of the close button (default: OK)
       */
      alert : function(message, completeCallback, title, buttonLabel)
      {
         var _title = (title || "Alert");
         var _buttonLabel = (buttonLabel || "OK");
         cordova.exec(completeCallback, null, "NotificationPlugin", "alert", [message, _title, _buttonLabel]);
      },

      /**
       * Open a native confirm dialog, with a customizable title and button text.
       * The result that the user selects is returned to the result callback.
       *
       * @param {String} message              Message to print in the body of the alert
       * @param {Function} resultCallback     The callback that is called when user clicks on a button.
       * @param {String} title                Title of the alert dialog (default: Confirm)
       * @param {String} buttonLabels         Comma separated list of the labels of the buttons (default: 'OK,Cancel')
       */
      confirm : function(message, resultCallback, title, buttonLabels)
      {
         var me = this;
         var _title = (title || "Confirm");
         //var _buttonLabels = (buttonLabels || "OK,Cancel");
         var _buttonLabels = (buttonLabels);
         var args = (_buttonLabels) ? [message, _title, _buttonLabels] : [message, _title];

         cordova.exec(function(response)
         {
            if (response > 10000)
            {
               me.alertViewId = response;
               console.debug("Notification confirm callbackId[" + me.alertViewId + "]");
            }
            else
            {
               delete me.alertViewId;
               resultCallback(response);
            }
         }, null, "NotificationPlugin", "confirm", args);
      },

      /**
       * Causes the device to vibrate.
       *
       * @param {Integer} mills       The number of milliseconds to vibrate for.
       */
      vibrate : function(mills)
      {
         cordova.exec(null, null, "NotificationPlugin", "vibrate", [mills]);
      },

      /**
       * Causes the device to beep.
       * On Android, the default notification ringtone is played "count" times.
       *
       * @param {Integer} count       The number of beeps.
       */
      beep : function(count)
      {
         cordova.exec(null, null, "NotificationPlugin", "beep", [count]);
      },

      dismiss : function()
      {
         var me = this;
         if (me.alertViewId)
         {
            cordova.exec(null, null, "NotificationPlugin", "dismiss", [me.alertViewId]);
            //console.debug("alertId[" + me.alertViewId + "]");
         }
      }
   };

   cordova.addConstructor(function()
   {
   });
})(window.cordova || window.Cordova || window.PhoneGap);
