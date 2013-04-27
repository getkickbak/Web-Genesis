$(document).ready($(function()
{
   drawCharts(visits);
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