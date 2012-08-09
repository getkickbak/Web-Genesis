$(document).ready($(function() {
	
	function set_fields() {
		var signup_amount = parseFloat($("#reward_model_signup_amount").val());
		var rebate_rate = parseFloat($("#reward_model_rebate_rate").html());
		var price_per_point = parseFloat($("#reward_model_price_per_point").html());
		if (!isNaN(signup_amount)) {
			$("#reward_model_points").val(parseInt(signup_amount / price_per_point / rebate_rate * 100));
		}
	}

	$("#reward_model_signup_amount").focusout(set_fields);
	$("#reward_model_rebate_rate").focusout(set_fields);
}))