$(document).ready($(function() {
	
	function set_fields() {
		var price = parseFloat($("#customer_reward_price").val());
		var price_per_point = parseFloat($("#price_per_point").html())
		if (!isNan(price)) {
			$("#customer_reward_points").val(parseInt(price/price_per_point));
		}
	}
	$("#customer_reward_price").focusout(set_fields);
}))