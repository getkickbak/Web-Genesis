$(document).ready($(function() {
	$("#promotion_customer_segment_id").change(function() {
		var pathname = location.pathname;	
		if (pathname == '/promotions' || pathname == '/promotions/new') {
			if (!pathname.match('new')) {
				pathname += '/new';
			}
		}		
		location.href = location.origin + pathname + "?segment_id=" +$(this).val();
	});
	$("input.date_picker").datepicker({ dateFormat: "yy-mm-dd" });
}))