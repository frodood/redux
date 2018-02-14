
function handle2checkoutPayment(data)
{debugger; 

	var jsonstringpara = JSON.stringify(data.custompara);
	jsonstringpara = jsonstringpara.replace(/"/g, '<&#39;>');
	var data = {
		url:data.domain+"/services/duosoftware.process.service/process/singlePayment",
        sid: "901348563",
        mode: "2CO",
        currency_code: data.currency_code,
        lang: 'en',
        demo: "Y",
        return_url:data.return_url,
        returncustom_url:data.return_url,
        li_0_name:data.orderId,
        custompara:jsonstringpara,
        li_0_token:data.sectrityToken,
		li_0_price:""+data.li_0_price,
		li_0_quantity:'1',
		li_0_tangible:'N',
		domain:data.domain.replace("http://", ""),
		merchant:"12thdor.com",
		quTranId:"12345",
		paypal_direct:"N",
		x_receipt_link_url:"http://developer.12thdoor.com/services/duosoftware.ipn.service/2checkout_ipn.php",
		orderId:data.orderId

		




    };

    /*
		card_holder_name: "testing name",
		city:"gampaha",
		country:"USA",
		email:"noreply@2co.com",
		phone:"213321321",
		phoneExt:"",
		state:"western provence",
		street_address:"123",
		street_address2:"",
		zip:"43123",

		ccNo:'4222222222222220',
		cvv:"123",
		expMonth:"10",
		expYear:"2018"
    */
   
    var form = $('<form/></form>');
    form.attr("action", "https://sandbox.2checkout.com/checkout/purchase");
    form.attr("method", "POST");
    form.attr("target", "tco_lightbox_iframe");
    form.attr("style", "display:none;");
    
    $.each(data, function (name, value) {
            if (value != null) {
                var input = $("<input></input>").attr("type", "hidden").attr("name", name).val(value);
                form.append(input);
            }
        });

    $("body").append(form);
    $('.tco_lightbox').remove();

    $.getScript( "https://www.2checkout.com/static/checkout/javascript/direct.min.js", function( data, textStatus, jqxhr ) {
        setTimeout(function() {
            //this.clearCart = clearCart == null || clearCart;
            form.submit();
            form.remove();
        }, 1000);
    });
    /*form.submit();
    form.remove();*/
}