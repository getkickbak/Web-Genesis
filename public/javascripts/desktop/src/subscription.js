$(function(){
    $("#email_notif").click(function() {
    	Genesis.ajax(true, "/update_email_notif", 'POST', "value="+this.checked, 'json', function(response)
        {
         	if(!response.success) {
               Genesis.showErrMsg(response.message);
            }
        });
    });
});