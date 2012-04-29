google.load("visualization", "1.0", {
	packages : ["corechart"]
});

$(document).ready($(function() {

	
	Genesis.ajax(false, location.pathname+'/show_charts', 'GET', null, 'json', function(response) {
		google.setOnLoadCallback(drawCharts(response.data));
	});
	function drawCharts(response_data) {
		var new_customers_line_data = new google.visualization.DataTable();
		new_customers_line_data.addColumn('string', 'Date');
		new_customers_line_data.addColumn('number', 'New Customers');
		new_customers_line_data.addRows(response_data.new_customers);

		var new_customers_line_options = {
			width : 500,
			height : 340,
			title : 'New Customers - Last 2 Weeks',
			animation : { duration : 1 },
			chartArea : { left : 80, top : 50 },
			legend : { position : 'none', textStyle : { fontSize: 12 } },
			hAxis : { textStyle : { fontSize: 12 } },
			vAxis : { textStyle : { fontSize: 12 }, minValue : 0, maxValue : 8, viewWindowMode : 'explicit', viewWindow : { min : 0 } },
			tooltip : { textStyle : { fontSize: 12 } }
		};

		var new_customers_chart = new google.visualization.LineChart(document.getElementById('new_customers'));
		new_customers_chart.draw(new_customers_line_data, new_customers_line_options);

		var purchases_line_data = new google.visualization.DataTable();
		purchases_line_data.addColumn('string', 'Date');
		purchases_line_data.addColumn('number', 'Purchases');
		purchases_line_data.addRows(response_data.purchases);

		var purchases_line_options = {
			width : 500,
			height : 340,
			title : 'Purchases Per Day - Last 2 Months',
			chartArea : { left : 80, top : 50 },
			legend : { position : 'none', textStyle : { fontSize: 12 } },
			hAxis : { textStyle : { fontSize: 12 } },
			vAxis : { textStyle : { fontSize: 12 }, minValue : 0, maxValue : 8, viewWindowMode : 'explicit', viewWindow : { min : 0 } },
			tooltip : { textStyle : { fontSize: 12 } }
		};
		var purchases_line_chart = new google.visualization.LineChart(document.getElementById('purchases_line_chart'));
		purchases_line_chart.draw(purchases_line_data, purchases_line_options);
        
        var i;
        
		var challenges_line_data = new google.visualization.DataTable();
		challenges_line_data.addColumn('string', 'Date');
		
		names = response_data.challenges.line_data.names;
		for (i = 0; i < names.length; i++) {
			challenges_line_data.addColumn('number', names[i]);
		}
		challenges_line_data.addRows(response_data.challenges.line_data.data);

		var challenges_line_options = {
			width : 500,
			height : 340,
			title : 'Challenges Per Day - Last 2 Months',
			chartArea : { left : 80, top : 50 },
			legend : { position : 'bottom', textStyle : { fontSize: 12 } },
			hAxis : { textStyle : { fontSize: 12 } },
			vAxis : { textStyle : { fontSize: 12 }, minValue : 0, maxValue : 8, viewWindowMode : 'explicit', viewWindow : { min : 0 } },
			tooltip : { textStyle : { fontSize: 12 } }
		};
		var challenges_line_chart = new google.visualization.LineChart(document.getElementById('challenges_line_chart'));
		challenges_line_chart.draw(challenges_line_data, challenges_line_options);
		
		var challenges_pie_data = new google.visualization.DataTable();
        challenges_pie_data.addColumn('string', 'Category');
        challenges_pie_data.addColumn('number', 'Challenges');
        
        challenges_pie_data.addRows(response_data.challenges.pie_data);

        var challenges_pie_options = {
        	width : 340,
			height : 340,
          	title: 'Challenges - Last 2 Months',
          	titleTextStyle : { fontSize: 12 },
          	chartArea : { top : 50 },
          	legend : { position : 'bottom', textStyle : { fontSize: 12 } },
          	pieSliceTextStyle : { fontSize: 12 },
          	tooltip : { textStyle : { fontSize: 12 } }
        };

        var challenges_pie_chart = new google.visualization.PieChart(document.getElementById('challenges_pie_chart'));
        challenges_pie_chart.draw(challenges_pie_data, challenges_pie_options);
	}

}))