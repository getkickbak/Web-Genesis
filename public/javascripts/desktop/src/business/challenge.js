$(document).ready($(function() {

	$("#challenge_type").change(function() {
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
		location.href = location.origin + pathname + "?type=" +$(this).val();
	});
}))