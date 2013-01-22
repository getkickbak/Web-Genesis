$(function(){
    $("#email_notif").click(function() {
        $.ajax({
        	type: 'POST',
            url: "/account/subscriptions/update_email_notif",
            dataType: 'json',
            data: "value="+this.checked, 
            success: function() { alert('Bye') }
        });
    });
});