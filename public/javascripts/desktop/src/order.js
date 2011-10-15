_login = function()
{
}

_logout = function()
{
}

$(document).ready($(function() {
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
			id_value = evt.target.attributes.getNamedItem("id_value").value
			if(i == id_value) {
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
			id_value = evt.target.attributes.getNamedItem("id_value").value
			if(i == id_value) {
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
		$("#order_grand_total").html("C$" + parseFloat($("#order_discount_price" + id_value).attr("value")).toFixed(2));
	});
	var x = 1;
	while($("#order_quantity" + x).length) {
		$("#order_quantity" + x).live('keyup', {
			index : x
		}, function(evt) {
			var total = parseFloat(evt.target.value * $("#order_discount_price" + evt.data.index).attr("value")).toFixed(2)
			$("#order_total" + evt.data.index).html("C$" + total);
			$("input[name='order[quantity]']").val(evt.target.value);
			$("#order_grand_total").html("C$" + total);
		});
		x++
	}
	
	$("#enable_gift").click(function(event)
	{
		$("#gift").show();
		$("input[name='order[give_gift]']").val(true);
	})
	$("#disable_gift").click(function(event)
	{
		$("#gift").hide();
		$("input[name='order[give_gift]']").val(false);
	})
}));
