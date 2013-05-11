$(document).ready($(function()
{
   var $gmap = $("#gmap");
   var venueName = $("#venue_name");
   var address = $("#venue_address");
   var city = $("#venue_city");
   var state = $("#venue_state");
   var zipcode = $("#venue_zipcode");
   var country = $("#venue_country");
   var realAddress = address.val() + "," + city.val() + "," + state.val() + "," + zipcode.val() + "," + country.val()
   $gmap.gMap(
   {
      markers : [
      {
         address : realAddress,
         html : venueName.val()
      }],
      address : realAddress,
      zoom : 15,
      scale : window.devicePixelRatio,
      //maptype : 'roadmap',
      sensor : false
   });
   var geocoder = new google.maps.Geocoder();
   function set_coordinates()
   {
      if (address.val().length == 0)
         return
      if (city.val().length == 0)
         return
      if (state.val().length == 0)
         return
      if (zipcode.val().length == 0)
         return
      if (country.val().length == 0)
         return realAddress = address.val() + "," + city.val() + "," + state.val() + "," + zipcode.val() + "," + country.val();
      geocoder.geocode(
      {
         'address' : realAddress
      }, function(results, status)
      {
         if (status == google.maps.GeocoderStatus.OK)
         {
            location_coordinates = results[0].geometry.location;
            $("#venue_latitude").val(parseFloat(location_coordinates.lat()).toFixed(15))
            $("#venue_longitude").val(parseFloat(location_coordinates.lng()).toFixed(15))
         }
         else
         {
            alert("Geocode was not successful for the following reason: " + status);
         }
      });
      $gmap.gMap(
      {
         markers : [
         {
            address : realAddress,
            html : venueName.val()
         }],
         address : realAddress,
         zoom : 15,
         scale : window.devicePixelRatio,
         //maptype : 'roadmap',
         sensor : false
      });
   }

   address.focusout(set_coordinates);
   city.focusout(set_coordinates);
   state.focusout(set_coordinates);
   zipcode.focusout(set_coordinates);
   country.focusout(set_coordinates);
}));
