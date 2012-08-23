$(document).ready($(function() {
	$("input.date_picker").datepicker({
		dateFormat : "yy-mm-dd"
	});
	$("#merchant_will_terminate").click(function() {
		if (this.checked) {
			$("#merchant_termination_date_wrap").show();
		} else {
			$("#merchant_termination_date_wrap").hide();
		}
	});
}))