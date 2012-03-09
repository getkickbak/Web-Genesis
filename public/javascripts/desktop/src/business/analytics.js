google.load("visualization", "1.0", {
	packages : ["corechart"]
});

$(document).ready($(function() {

	
	Genesis.ajax(false, location.pathname+'/show_charts', 'GET', null, 'json', function(response) {
		var data = $.parseJSON(response.data);
		google.setOnLoadCallback(drawCharts(data));
	});
	function drawCharts(response_data) {
		var data1 = new google.visualization.DataTable();
		data1.addColumn('string', 'Date');
		data1.addColumn('number', 'New Customers');
		data1.addRows(response_data.new_customers);

		var options1 = {
			width : 520,
			height : 340,
			title : 'New Customers - Last 2 Weeks',
			animation : { duration : 1 },
			chartArea : { left : 80, top : 50 },
			legend : { position : 'none' },
			vAxis : { minValue : 0, maxValue : 8, viewWindowMode : 'explicit', viewWindow : { min : 0 } }
		};

		var new_customers_chart = new google.visualization.LineChart(document.getElementById('new_customers'));
		new_customers_chart.draw(data1, options1);

		var data2 = new google.visualization.DataTable();
		data2.addColumn('string', 'Date');
		
		var i;
		var names = response_data.purchases.names
		for (i = 0; i < names.length; i++) {
			data2.addColumn('number', names[i]);
		}
		data2.addRows(response_data.purchases.data);

		var options2 = {
			width : 520,
			height : 340,
			title : 'Purchases Per Day - Last 2 Months',
			chartArea : { left : 80, top : 50 },
			vAxis : { minValue : 0, maxValue : 8, viewWindowMode : 'explicit', viewWindow : { min : 0 } }
		};
		var purchases_chart = new google.visualization.LineChart(document.getElementById('purchases'));
		purchases_chart.draw(data2, options2);

		var data3 = new google.visualization.DataTable();
		data3.addColumn('string', 'Date');
		names = response_data.challenges.names;
		for (i = 0; i < names.length; i++) {
			data3.addColumn('number', names[i]);
		}
		data3.addRows(response_data.challenges.data);

		var options3 = {
			width : 520,
			height : 340,
			title : 'Challenges Completed - Last 2 Months',
			chartArea : { left : 80, top : 50 },
			vAxis : { minValue : 0, maxValue : 8, viewWindowMode : 'explicit', viewWindow : { min : 0 } }
		};
		var challenges_chart = new google.visualization.LineChart(document.getElementById('challenges'));
		challenges_chart.draw(data3, options3);
	}

}))