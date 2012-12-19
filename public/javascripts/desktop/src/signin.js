$(function () {
	
	jQuery.support.placeholder = false;
	test = document.createElement('input');
	if('placeholder' in test) jQuery.support.placeholder = true;
	
	if (!$.support.placeholder) {
		
		$('.field').find ('label').show ();
		
	}
   $('#page-background-bottom').height($(window).height()-445);
   $('body').resize(function()
   {
      $('#page-background-bottom').height($(window).height()-445);
   });
	
});