$(document).ready($(function() {
	
	function set_fields() {
		var price = parseFloat($("#purchase_reward_price").val());
		var reward_ratio = parseInt($("#purchase_reward_reward_ratio").val());
		var price_per_point = parseFloat($("#price_per_point").html())
		$("#purchase_reward_points").val(parseInt((price/reward_ratio)/price_per_point));
	}
	$("#purchase_reward_price").focusout(set_fields);
	$("#purchase_reward_reward_ratio").focusout(set_fields);
}))