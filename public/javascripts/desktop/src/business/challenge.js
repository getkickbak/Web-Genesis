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
	
	function set_points() {
		var amount = parseFloat($("#challenge_reward_amount").val());
		var rebate_rate = parseFloat($("#rebate_rate").html());
		var price_per_point = parseFloat($("#price_per_point").html());
		if (!isNaN(amount)) {
			$("#challenge_points").val(parseInt(amount / price_per_point / rebate_rate * 100));
		}
	}
	function set_referral_points() {
		var amount = parseFloat($("#challenge_referral_data_referral_reward_amount").val());
		var rebate_rate = parseFloat($("#rebate_rate").html());
		var price_per_point = parseFloat($("#price_per_point").html());
		if (!isNaN(amount)) {
			$("#challenge_referral_data_referral_points").val(parseInt(amount / price_per_point / rebate_rate * 100));
		}
	}

	$("#challenge_reward_amount").focusout(set_points);
	$("#challenge_referral_data_referral_reward_amount").focusout(set_referral_points);
}))