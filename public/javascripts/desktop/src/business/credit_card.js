$(document).ready($(function() {
	$('a[id^="credit-card-"]').each(function( index ) {
		$(this).click(function() {
			var card_id = $(this).attr('card_id');
			var display = $('#edit_credit_card_'+card_id).css('display');
			if (display == 'none') {
				$('#edit_credit_card_'+card_id).show();
			} else {
				$('#edit_credit_card_'+card_id).hide();
			}
		})
	})
}))