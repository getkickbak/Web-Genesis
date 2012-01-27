$(document).ready($(function() {
	var total = parseInt($("#total").html());
	var count = parseInt($("#count").html());
	$("#progressbar").progressbar({ value: count/total*100 });
}))