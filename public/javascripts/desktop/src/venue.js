$(document).ready($(function()
{
   drawCharts(visits);

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

function drawCharts(response_data)
{

   visits_chart = new Highcharts.Chart(
   {
      chart :
      {
         renderTo : 'visits_chart',
         width : 100,
         spacingTop : 0,
         spacingRight : 0,
         spacingLeft : 0,
         spacingBottom : 0,
         marginTop : 0,
         marginRight : 0,
         marginLeft : 0,
         marginBottom : 0,
         type : 'pie'
      },
      title :
      {
         text : ''
      },
      yAxis :
      {
         title :
         {
            text : ''
         }
      },
      plotOptions :
      {
         pie :
         {
            shadow : false
         }
      },
      tooltip :
      {
         enabled : false
      },
      colors : ["#AAA", "#F90"],
      series : [
      {
         name : 'Visits',
         data : [["Before the next Promotion", response_data['total'] - response_data['next_badge']], ["Before the next Promotion", response_data['next_badge']]],
         size : '100%',
         innerSize : '80%',
         showInLegend : false,
         dataLabels :
         {
            enabled : false
         }
      }],
      exporting :
      {
         enabled : false
      },
      credits :
      {
         enabled : false
      }
   });
};