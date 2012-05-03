$(document).ready($(function() {
	
	function set_fields() {
		var price = parseFloat($("#customer_reward_price").val());
		var rebate_rate = parseFloat($("#rebate_rate").html())
		var price_per_point = parseFloat($("#price_per_point").html())
		if (!isNaN(price)) {
			$("#customer_reward_points").val(parseInt(price / price_per_point / rebate_rate * 100));
		}
	}
	$("#customer_reward_price").focusout(set_fields);
}))