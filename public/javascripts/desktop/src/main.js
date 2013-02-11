$(document).ready($(function() {
	$("#registration_step1_phone_number").keyup(function(e){ //the "phoneNumber" can be any other input field ID
        if (e.keyCode == 8){ //trap the backspace key so that when deleting value, "checkPhoneNumber" will not be called.
			//do nothing
		} else {
			checkPhoneNumber("registration_step1_phone_number"); //call checkPhoneNumber function and put "phoneNumber" field ID as parameter
		}
	});
 
	function checkPhoneNumber(id){
		var phoneValue = $("#"+id).val(); //get current field value
		var phoneLength = $("#"+id).val().length; //get current field value length
 
		if (phoneLength == 3){ //if current length is 3, then insert a hyphen
			phoneValue += "-";
		} else if (phoneLength == 7){ //if current length is 7, then insert a hyphen
			phoneValue += "-";
		}
 
		//check is_digit for new character; if not, then use substr to get rid of it
		var tempValue = phoneValue.replace(/-/g, ""); //assign tempValue with phoneValue, which performs global string replacement (replace "-" with nothing)
		if (is_digit(tempValue) == false){ //check if all input characters are digits
			phoneValue = (phoneValue.substr(0, phoneLength-1)); //if not, then use substr to get rid of the last entered character 
		}
 
		//limit the phone value to 12 character
		if (phoneLength > 12){
			phoneValue = (phoneValue.substr(0, 12)); //if field value length is greater than 12, then use substr to get rid of last character
		}
 
		$("#"+id).val(phoneValue);
	}
 
	//simple function to check if input is in digit; return boolean type result
	function is_digit(input){
		if (isNaN(input)) {
    		return false;
		} else {
    		return true;
		}
	}
}));