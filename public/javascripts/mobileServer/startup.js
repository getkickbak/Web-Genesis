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
});
