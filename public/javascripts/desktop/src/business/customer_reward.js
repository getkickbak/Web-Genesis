$(document).ready($(function() {

	function set_fields() {
		var price = parseFloat($("#customer_reward_price").val());
		var rebate_rate = parseFloat($("#rebate_rate").html());
		var price_per_point = parseFloat($("#price_per_point").html());
		var prize_rebate_rate = parseFloat($("#prize_rebate_rate").html());
		var price_per_prize_point = parseFloat($("#price_per_prize_point").html());
		if (!isNaN(price)) {
			var mode = $("#customer_reward_mode").val();
			if (mode == "reward") {
				$("#customer_reward_points").val(parseInt(price / price_per_point / rebate_rate * 100));
			} else {
				$("#customer_reward_points").val(parseInt(price / price_per_prize_point / prize_rebate_rate * 100));
			}

		}
	}


	$("input.date_picker").datepicker({
		dateFormat : "yy-mm-dd"
	});
	$("#customer_reward_price").focusout(set_fields);
	$("#customer_reward_quantity_limited").click(function() {
		if (this.checked) {
			$("#customer_reward_quantity_wrap").show();
		} else {
			$("#customer_reward_quantity_wrap").hide();
		}
	});
	$("#customer_reward_time_limited").click(function() {
		if (this.checked) {
			$("#customer_reward_expiry_date_wrap").show();
		} else {
			$("#customer_reward_expiry_date_wrap").hide();
		}
	});
}))