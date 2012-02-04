$(document).ready($(function() {

	$("#challenge_type_id").change(function() {
		var pathname = location.pathname;	
		if (pathname == '/challenges' || pathname == '/challenges/new') {
			if (!pathname.match('new')) {
				pathname += '/new';
			}
		}
		else
		{
			if (!pathname.match('edit')) {
				pathname += '/edit';
			}
		}		
		location.href = location.origin + pathname + "?type_id=" +$(this).val();
	});
}))