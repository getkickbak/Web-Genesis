$(document).ready($(function() {
	
	$("#reward_model_type_id").change(function() {
		location.href = location.origin + "/reward_model?type_id=" +$(this).val();
	});
	
	function set_fields() {
		var signup_amount = parseFloat($("#reward_model_signup_amount").val());
		var rebate_rate = parseFloat($("#reward_model_rebate_rate").val());
		var price_per_point = parseFloat($("#reward_model_price_per_point").val());
		if (!isNaN(signup_amount)) {
			$("#reward_model_signup_points").val(parseInt(signup_amount / price_per_point / rebate_rate * 100));
		}
	}

	$("#reward_model_signup_amount").focusout(set_fields);
	$("#reward_model_rebate_rate").focusout(set_fields);
}))