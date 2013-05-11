$(function(){
    $("#checkins").click(function() {
    	Genesis.ajax(true, "/update_facebook_checkins", 'POST', "value="+this.checked, 'json', null, null, null, function(response)
        {
        	checked = $("#checkins").is(':checked');
        	$("#checkins").prop('checked', !checked);
        	alert(response.message);
        });
    });
    $("#badge_promotions").click(function() {
    	Genesis.ajax(true, "/update_facebook_badge_promotions", 'POST', "value="+this.checked, 'json', null, null, null, function(response)
        {
        	checked = $("#badge_promotions").is(':checked');
        	$("#badge_promotions").prop('checked', !checked);
        	alert(response.message);
        });
    });
    $("#rewards").click(function() {
    	Genesis.ajax(true, "/update_facebook_rewards", 'POST', "value="+this.checked, 'json', null, null, null, function(response)
        {
        	checked = $("#rewards").is(':checked');
        	$("#rewards").prop('checked', !this.checked);
        	alert(response.message);
        });
    });
});