var customers_chart;
var visits_line_chart;
var purchases_line_chart;
var challenges_line_chart;
var challenges_pie_chart;

$(document).ready($(function() {
	Genesis.ajax(false, location.pathname+'/show_charts', 'GET', "type=customers&periodType=day&period=30", 'json', function(response) {
		drawCustomersCharts('day', 30, response.data);
	});
	
	for (var i=1; i <= 4; i++) {
		$("#customers-data-"+i).click(function() {
			periodType = $(this).attr('periodType');
			period = $(this).attr('period');
			Genesis.ajax(false, location.pathname+'/show_charts', 'GET', "type=customers&periodType="+periodType+"&period="+period, 'json', function(response) {
				drawCustomersCharts(periodType, period, response.data);
			});
		});
		$("#visits-data-"+i).click(function() {
			periodType = $(this).attr('periodType');
			period = $(this).attr('period');
			Genesis.ajax(false, location.pathname+'/show_charts', 'GET', "type=visits&periodType="+periodType+"&period="+period, 'json', function(response) {
				drawVisitsCharts(periodType, period, response.data);
			});
		});
		$("#purchases-data-"+i).click(function() {
			periodType = $(this).attr('periodType');
			period = $(this).attr('period');
			Genesis.ajax(false, location.pathname+'/show_charts', 'GET', "type=purchases&periodType="+periodType+"&period="+period, 'json', function(response) {
				drawPurchasesCharts(periodType, period, response.data);
			});
		});
		$("#challenges-data-"+i).click(function() {
			periodType = $(this).attr('periodType');
			period = $(this).attr('period');
			Genesis.ajax(false, location.pathname+'/show_charts', 'GET', "type=challenges&periodType="+periodType+"&period="+period, 'json', function(response) {
				drawChallengesCharts(periodType, period, response.data);
			});
		});
	}
	
	function show_chart(type) {
		if (type == 'customers') {
			$('#customers').show();
			$('#visits').hide();
			$('#purchases').hide();
			$('#challenges').hide();
		} else if (type == "visits") {
			$('#customers').hide();
			$('#visits').show();
			$('#purchases').hide();
			$('#challenges').hide();
		} else if (type == "purchases") {
			$('#customers').hide();
			$('#visits').hide();
			$('#purchases').show();
			$('#challenges').hide();
		} else if (type == "challenges") {
			$('#customers').hide();
			$('#visits').hide();
			$('#purchases').hide();
			$('#challenges').show();
		}
		
	}
	
	function drawCustomersCharts(periodType, period, response_data) {
		show_chart("customers")
		title = 'Customers - Last ' + period + (periodType == 'day' ? ' days' : ' months');
		if (customers_chart != null) {
			customers_chart.setTitle({text: title});
			customers_chart.series[0].setData(response_data.total_customers, false);
			customers_chart.redraw();
			return;
		}
		
		customers_chart = new Highcharts.Chart({
        	chart: {
            	renderTo: 'total_customers',
            	type: 'line',
            	zoomType: 'x',
            	marginRight: 50,
				marginBottom: 35
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: title
         	},
         	xAxis: {
            	type: 'datetime',
				dateTimeLabelFormats: { // don't display the dummy year
					month: '%b \'%y',
					year: '%y'
				},
				maxZoom : 14 * 24 * 3600000
         	},
        	yAxis: {
            	title: {
               		text: 'Customers'
            	},
            	min: 0,
            	allowDecimals: false
         	},
         	tooltip: {
				formatter: function() {
					return '<b>'+ new Date(this.x).toDateString() +'</b><br/>'+
					this.series.name + ': ' + this.y;
				}
			},
         	legend: {
				enabled: false
			},
         	series: [{
         		name: 'Customer',
            	data: response_data.total_customers
         	}]
      	});
      	
      	
	}
	
	function drawVisitsCharts(periodType, period, response_data) {
		show_chart("visits")
		title = 'Visits and Points - Last ' + period + (periodType == 'day' ? ' days' : ' months');
		if (visits_line_chart != null) {
			//visits_line_chart.setTitle({text: title});
			visits_line_chart.destroy();
			//for (i=0; i < response_data.visits.length; i++) {
			//	visits_line_chart.series[i].setData(response_data.visits[i], false);
			//}
			//visits_line_chart.redraw();
			//return;
		}
		
		visits_line_chart = new Highcharts.Chart({
        	chart: {
            	renderTo: 'purchases_line_chart',
            	type: 'line',
            	zoomType: 'x',
            	marginRight: 80
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: title
         	},
         	xAxis: {
            	type: 'datetime',
				dateTimeLabelFormats: { // don't display the dummy year
					month: '%b \'%y',
					year: '%y'
				},
				maxZoom : 14 * 24 * 3600000
         	},
        	yAxis: [{
        		title: {
               		text: 'Visits'
            	},
            	min: 0,
            	allowDecimals: false
         	}, {
         		title: {
               		text: 'Points'
            	},
            	min: 0,
            	allowDecimals: false,
            	opposite: true
         	}],
         	tooltip: {
				formatter: function() {
					return '<b>'+ new Date(this.x).toDateString() +'</b><br/>'+
					this.series.name + ': ' + this.y;
				}
			},
         	series: response_data.visits
      	});
	}
	
	function drawPurchasesCharts(periodType, period, response_data) {
		show_chart("purchases")
		title = 'Purchases - Last ' + period + (periodType == 'day' ? ' days' : ' months');
		if (purchases_line_chart != null) {
			purchases_line_chart.setTitle({text: title});
			purchases_line_chart.series[0].setData(response_data.purchases, false);
			purchases_line_chart.redraw()
			return;
		}
		
		purchases_line_chart = new Highcharts.Chart({
        	chart: {
            	renderTo: 'purchases_line_chart_amount',
            	type: 'line',
            	zoomType: 'x',
            	marginRight: 50,
				marginBottom: 35
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: title
         	},
         	xAxis: {
            	type: 'datetime',
				dateTimeLabelFormats: { // don't display the dummy year
					month: '%b \'%y',
					year: '%y'
				},
				maxZoom : 14 * 24 * 3600000
         	},
        	yAxis: {
            	title: {
               		text: 'Amount ($)'
            	},
            	min: 0,
            	allowDecimals: false
         	},
         	tooltip: {
				formatter: function() {
					return '<b>'+ new Date(this.x).toDateString() +'</b><br/>'+
					this.series.name + ': $' + this.y;
				}
			},
         	legend: {
				enabled: false
			},
         	series: [{
         		name: 'Amount',
            	data: response_data.purchases
         	}]
      	});
	}
	
	function drawChallengesCharts(periodType, period, response_data) {
		show_chart("challenges")
		title = 'Challenges - Last ' + period + (periodType == 'day' ? ' days' : ' months');
		if (challenges_line_chart != null && challenges_pie_chart != null) {
			challenges_line_chart.destroy();
			challenges_pie_chart.destroy();
			//challenges_line_chart.setTitle({text: title});
			//for (i=0; i < response_data.challenges.line_data.length; i++) {
			//	challenges_line_chart.series[i].setData(response_data.challenges.line_data[i], false);
			//}
			//challenges_pie_chart.setTitle({text: title});
			//challenges_pie_chart.series[0].setData(response_data.challenges.pie_data, false);
			//challenges_line_chart.redraw();
			//challenges_pie_chart.redraw();
			//return;
		}
		
		challenges_line_chart = new Highcharts.Chart({
        	chart: {
            	renderTo: 'challenges_line_chart',
            	type: 'line',
            	zoomType: 'x',
            	marginRight: 50
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: title
         	},
         	xAxis: {
            	type: 'datetime',
				dateTimeLabelFormats: { // don't display the dummy year
					month: '%b \'%y',
					year: '%y'
				},
				maxZoom : 14 * 24 * 3600000
         	},
        	yAxis: {
            	title: {
               		text: 'Challenges'
            	},
            	min: 0,
            	allowDecimals: false
         	},
         	tooltip: {
				formatter: function() {
					return '<b>'+ new Date(this.x).toDateString() +'</b><br/>'+
					this.series.name + ': ' + this.y;
				}
			},
         	series: response_data.challenges.line_data
      	});
      	
      	challenges_pie_chart = new Highcharts.Chart({
			chart: {
				renderTo: 'challenges_pie_chart',
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			credits: {
         		enabled : false
         	},
			title: {
				text: title
			},
			tooltip: {
				formatter: function() {
					return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';
				}
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: false
					},
					showInLegend: true
				}
			},
			series: [{
				type: 'pie',
				name: 'Browser share',
				data: response_data.challenges.pie_data
			}]
		});
	}
}))