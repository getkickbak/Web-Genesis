$(document).ready($(function() {
	Genesis.ajax(false, location.pathname+'/show_charts', 'GET', null, 'json', function(response) {
		drawCharts(response.data);
	});
	
	function drawCharts(response_data) {
		var new_customers_chart = new Highcharts.Chart({
        	chart: {
            	renderTo: 'new_customers',
            	type: 'line',
            	marginRight: 50,
				marginBottom: 35
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: 'New Customers - Last 2 Weeks'
         	},
         	xAxis: {
            	type: 'datetime',
				dateTimeLabelFormats: { // don't display the dummy year
					month: '%e. %b',
					year: '%b'
				}
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
            	data: response_data.new_customers
         	}]
      	});
      	
      	var purchases_line_chart = new Highcharts.Chart({
        	chart: {
            	renderTo: 'purchases_line_chart',
            	type: 'line',
            	marginRight: 50,
				marginBottom: 35
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: 'Purchases Per Day - Last 2 Months'
         	},
         	xAxis: {
            	type: 'datetime',
				dateTimeLabelFormats: { // don't display the dummy year
					month: '%e. %b',
					year: '%b'
				}
         	},
        	yAxis: {
            	title: {
               		text: 'Purchases'
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
         		name: 'Purchase',
            	data: response_data.purchases.line_data
         	}]
      	});
      	
      	var purchases_line_chart_amount = new Highcharts.Chart({
        	chart: {
            	renderTo: 'purchases_line_chart_amount',
            	type: 'line',
            	marginRight: 50,
				marginBottom: 35
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: 'Purchases Per Day - Last 2 Months'
         	},
         	xAxis: {
            	type: 'datetime',
				dateTimeLabelFormats: { // don't display the dummy year
					month: '%e. %b',
					year: '%b'
				}
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
            	data: response_data.purchases.line_data_amount
         	}]
      	});
      	
      	var challenges_line_chart = new Highcharts.Chart({
        	chart: {
            	renderTo: 'challenges_line_chart',
            	type: 'line',
            	marginRight: 50
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: 'Challenges - Last 2 Months'
         	},
         	xAxis: {
            	type: 'datetime',
				dateTimeLabelFormats: { // don't display the dummy year
					month: '%e. %b',
					year: '%b'
				}
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
      	
      	var challenges_pie_chart = new Highcharts.Chart({
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
				text: 'Challenges - Last 2 Months'
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