$(function(){
    $("#merchant_features_config_enable_pos").click(function() {
    	var display = $('#pos_settings_group').css('display');
		if (display == 'none') {
			$('#pos_settings_group').show();
		} else {
			$('#pos_settings_group').hide();
		}
    });
    $("#venue_features_config_use_custom").click(function() {
    	var display = $('#pos_group').css('display');
		if (display == 'none') {
			$('#pos_group').show();
		} else {
			$('#pos_group').hide();
		}
    });
    $("#venue_features_config_enable_pos").click(function() {
    	var display = $('#pos_settings_group').css('display');
		if (display == 'none') {
			$('#pos_settings_group').show();
		} else {
			$('#pos_settings_group').hide();
		}
    });
});