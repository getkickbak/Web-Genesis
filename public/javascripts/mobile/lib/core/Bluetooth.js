(function(Cordova)
{
   function Bluetooth()
   {
   };
   Bluetooth.prototype.startSession = function(name, availablePeerListChanged, connexionRequested)
   {
      Cordova.exec(availablePeerListChanged, connexionRequested, "Bluetooth", "startSession", [
      {
         name : name
      }]);
   };
   Bluetooth.prototype.setSessionAvailable = function(available)
   {
      Cordova.exec(0, 0, "Bluetooth", "setSessionAvailable", [
      {
         available : available
      }]);
   };
   Bluetooth.prototype.stopSession = function()
   {
      Cordova.exec(0, 0, "Bluetooth", "stopSession", []);
   };

   Bluetooth.prototype.connectTo = function(peerId)
   {
      Cordova.exec(0, 0, "Bluetooth", "connectTo", [
      {
         peerId : peerId
      }]);
   };
   Bluetooth.prototype.acceptConnexion = function(peerId)
   {
      Cordova.exec(0, 0, "Bluetooth", "acceptConnexion", [
      {
         peerId : peerId
      }]);
   };
   Bluetooth.prototype.setConnexionEvents = function(connectedPeersChanged, receiveHandler)
   {
      Cordova.exec(connectedPeersChanged, receiveHandler, "Bluetooth", "setConnexionEvents", []);
   };
   Bluetooth.prototype.disconnect = function()
   {
      Cordova.exec(0, 0, "Bluetooth", "disconnect", []);
   };

   Bluetooth.prototype.sendDataToAll = function(data)
   {
      Cordova.exec(0, 0, "Bluetooth", "sendDataToAll", [
      {
         data : data
      }]);
   };
   Bluetooth.prototype.sendData = function(peers, data)
   {
      Cordova.exec(0, 0, "Bluetooth", "sendData", [
      {
      	peers: peers,
         data : data
      }]);
   };
   //-------------------------------------------------------------------
   Cordova.addConstructor(function()
   {
      if (!window.plugins)
      {
         window.plugins =
         {
         };
      }
      window.plugins.bluetooth = new Bluetooth();
   });
})(window.cordova || window.Cordova || window.PhoneGap);
