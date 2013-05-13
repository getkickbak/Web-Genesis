//---------------------------------------------------------------------------------
// Browser Detect
//---------------------------------------------------------------------------------
$.client =
{
   init : function()
   {
      this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
      this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
      this.OS = this.searchString(this.dataOS) || "an unknown OS";
   },
   searchString : function(data)
   {
      for (var i = 0; i < data.length; i++)
      {
         var dataString = data[i].string;
         var dataProp = data[i].prop;
         this.versionSearchString = data[i].versionSearch || data[i].identity;
         if (dataString)
         {
            if (dataString.indexOf(data[i].subString) != -1)
               return data[i].identity;
         }
         else if (dataProp)
            return data[i].identity;
      }
   },
   searchVersion : function(dataString)
   {
      var index = dataString.indexOf(this.versionSearchString);
      if (index == -1)
         return;
      return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
   },
   dataBrowser : [
   {
      string : navigator.userAgent,
      subString : "Chrome",
      identity : "Chrome"
   },
   {
      string : navigator.userAgent,
      subString : "OmniWeb",
      versionSearch : "OmniWeb/",
      identity : "OmniWeb"
   },
   {
      string : navigator.vendor,
      subString : "Apple",
      identity : "Safari",
      versionSearch : "Version"
   },
   {
      prop : window.opera,
      identity : "Opera",
      versionSearch : "Version"
   },
   {
      string : navigator.vendor,
      subString : "iCab",
      identity : "iCab"
   },
   {
      string : navigator.vendor,
      subString : "KDE",
      identity : "Konqueror"
   },
   {
      string : navigator.userAgent,
      subString : "Firefox",
      identity : "Firefox"
   },
   {
      string : navigator.vendor,
      subString : "Camino",
      identity : "Camino"
   },
   {
      // for newer Netscapes (6+)
      string : navigator.userAgent,
      subString : "Netscape",
      identity : "Netscape"
   },
   {
      string : navigator.userAgent,
      subString : "MSIE",
      identity : "Explorer",
      versionSearch : "MSIE"
   },
   {
      string : navigator.userAgent,
      subString : "Gecko",
      identity : "Mozilla",
      versionSearch : "rv"
   },
   {
      // for older Netscapes (4-)
      string : navigator.userAgent,
      subString : "Mozilla",
      identity : "Netscape",
      versionSearch : "Mozilla"
   }],
   dataOS : [
   {
      string : navigator.platform,
      subString : "Win",
      identity : "Windows"
   },
   {
      string : navigator.platform,
      subString : "Mac",
      identity : "Mac"
   },
   {
      string : navigator.userAgent,
      subString : "iPhone",
      identity : "iPhone/iPod"
   },
   {
      string : navigator.platform,
      subString : "Linux",
      identity : "Linux"
   }]

};
$.client.init();

$(document).ready($(function() {
	$("#registration_step1_phone_number").keyup(function(e) {//the "phoneNumber" can be any other input field ID
		if (e.keyCode == 8) {//trap the backspace key so that when deleting value, "checkPhoneNumber" will not be called.
			//do nothing
		} else {
			checkPhoneNumber("registration_step1_phone_number");
			//call checkPhoneNumber function and put "phoneNumber" field ID as parameter
		}
	});

	if ($.client.browser == "Explorer") {
		$('input, textarea').placeholder();
	}

	function checkPhoneNumber(id) {
		var phoneValue = $("#" + id).val();
		//get current field value
		var phoneLength = $("#" + id).val().length;
		//get current field value length

		if (phoneLength == 3) {//if current length is 3, then insert a hyphen
			phoneValue += "-";
		} else if (phoneLength == 7) {//if current length is 7, then insert a hyphen
			phoneValue += "-";
		}

		//check is_digit for new character; if not, then use substr to get rid of it
		var tempValue = phoneValue.replace(/-/g, "");
		//assign tempValue with phoneValue, which performs global string replacement (replace "-" with nothing)
		if (is_digit(tempValue) == false) {//check if all input characters are digits
			phoneValue = (phoneValue.substr(0, phoneLength - 1));
			//if not, then use substr to get rid of the last entered character
		}

		//limit the phone value to 12 character
		if (phoneLength > 12) {
			phoneValue = (phoneValue.substr(0, 12));
			//if field value length is greater than 12, then use substr to get rid of last character
		}

		$("#" + id).val(phoneValue);
	}

	//simple function to check if input is in digit; return boolean type result
	function is_digit(input) {
		if (isNaN(input)) {
			return false;
		} else {
			return true;
		}
	}

})); 