app.views.ItemsMap = Ext.extend(Ext.Panel,
{
   markersArray : null,
   items : [
   {
      xtype             : 'map',
      useCurrentLocation: true,
      mapOptions :
      {
         zoom :17,
         scrollwheel : false,
         zoomControl : false
      },
   }],
   updateWithRecord: function(record,coords)
   {
      if (this.markersArray != null)
      {
         for (var i = 0; i < this.markersArray.length; i++)
         {
            this.markersArray[i].setMap(null);
         }
      }
      this.markersArray = [];
      var myLatlng = new google.maps.LatLng(coords.latitude,coords.longitude);
      var map = this.items.items[0].map;

      var marker = new google.maps.Marker(
      {
         position: myLatlng,
         map: map,
         title:"Hello World!"
      });
      map.setCenter(myLatlng);
      google.maps.event.addListener(marker, 'mouseover', function()
      {
         var infoBox = new ItemsInfoBox(
         {
            marker: marker,
            map: map
         });
      });
      this.markersArray[this.markersArray.length] = marker;
   }
});