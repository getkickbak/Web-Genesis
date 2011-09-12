$(function() {

	function stopRKey(evt) { 
  		var evt = (evt) ? evt : ((event) ? event : null); 
  		var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null); 
  		if ((evt.keyCode == 13) && (node.type=="text"))  {return false;} 
	} 

	document.onkeypress = stopRKey;

	// code to execute when the DOM is ready
	$("input[name='order[subdeal_id]']").live('change', function(evt) {
		i = 1;
		while($("#quantity" + i).length) {
			if(i == evt.target.value) {
				$("#quantity" + i).attr("disabled", false);
				$("#quantity" + i).val(1);
			} else {
				$("#quantity" + i).val("");
				$("#quantity" + i).attr("disabled", true);
			}
			i++
		}
	});

	$("input[name='order[subdeal_id]']").live('change', function(evt) {
		i = 1;
		while($("#order_quantity" + i).length) {
			if(i == evt.target.value) {
				$("#order_quantity" + i).attr("disabled", false);
				$("#order_quantity" + i).val(1);
				$("#order_total" + i).html("C$" + parseFloat($("#order_discount_price" + i).attr("value")).toFixed(2));
				$("input[name='order[quantity]']").val(1);
			} else {
				$("#order_quantity" + i).val("");
				$("#order_quantity" + i).attr("disabled", true);
				$("#order_total" + i).html("C$0.00");
			}
			i++
		}
	});
	var x = 1;
	while($("#order_quantity" + x).length) {
		$("#order_quantity" + x).live('keyup', {
			index : x
		}, function(evt) {
			$("#order_total" + evt.data.index).html("C$" + parseFloat(evt.target.value * $("#order_discount_price" + evt.data.index).attr("value")).toFixed(2));
			$("input[name='order[quantity]']").val(evt.target.value);
		});
		x++
	}
});
