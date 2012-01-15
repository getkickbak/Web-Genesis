function edit_credit_card(id) {
	var display = $("#edit_credit_card_"+id).css('display');
	if (display == 'none') {
		$("#edit_credit_card_"+id).show();
	}
	else {
		$("#edit_credit_card_"+id).hide();
	}
}
