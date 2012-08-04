$(document).ready($(function() {
	Genesis.ajax(false, location.pathname+'/show_charts', 'GET', null, 'json', function(response) {
		drawCharts(response.data);
	});
	
	function drawCharts(response_data) {
		var earn_points_chart = new Highcharts.Chart({
        	chart: {
            	renderTo: 'earn_reward_points',
            	type: 'line',
            	marginRight: 50,
				marginBottom: 35
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: 'Reward Points Earned - Last 2 Months'
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
               		text: 'Reward Points'
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
         		name: 'Reward Points',
            	data: response_data.earn_rewards
         	}]
      	});
      	
      	var redeem_points_chart = new Highcharts.Chart({
        	chart: {
            	renderTo: 'redeem_reward_points',
            	type: 'line',
            	marginRight: 50,
				marginBottom: 35
         	},
         	credits: {
         		enabled : false
         	},
         	title: {
            	text: 'Reward Points Redeemed - Last 2 Months'
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
               		text: 'Reward Points'
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
         		name: 'Reward Points',
            	data: response_data.earn_rewards
         	}]
      	});
	}
}))