$(document).ready($(function() {
	
	function set_fields() {
		var price = parseFloat($("#purchase_reward_price").val());
		var rebate_rate = parseInt($("#purchase_reward_rebate_rate").val());
		var price_per_point = parseFloat($("#price_per_point").html())
		if (!isNaN(price) && !isNaN(rebate_rate)) {
			$("#purchase_reward_points").val(parseInt(price*rebate_rate/100/price_per_point));
		}
	}
	$("#purchase_reward_price").focusout(set_fields);
	$("#purchase_reward_rebate_rate").focusout(set_fields);
}))