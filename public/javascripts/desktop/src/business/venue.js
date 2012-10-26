$(document).ready($(function()
{
   var $gmap = $("#gmap");
   var venueName = $("#venue_name");
   var address = $("#venue_address");
   var city = $("#venue_city");
   var state = $("#venue_state");
   var country = $("#venue_country");
   var realAddress = address.html() + "," + city.html() + "," + state.html() + "," + country.html()
   $gmap.gMap(
   {
      markers : [
      {
         address : realAddress,
         html : venueName.html()
      }],
      address : realAddress,
      zoom : 15,
      scale : window.devicePixelRatio,
      //maptype : 'roadmap',
      sensor : false
   });
}));
