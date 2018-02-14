/*
	- 2Checkout Payemnt Tool -
		Version 6.1.0.5
*/
(function (mod)
{
    'use strict';
        
        mod.factory('the2checkoutService', the2checkoutService);

    /** @ngInject */
    function the2checkoutService($rootScope,$apis)
    {
    	//.module('app.invoices')
    	//url:data.domain+"/services/duosoftware.process.service/process/singlePayment",
    	return { 
	        do2checkoutPayment: function(data) { 
	            var jsonstringpara = JSON.stringify(data.custompara);
				jsonstringpara = jsonstringpara.replace(/"/g, '<&#39;>');

				var jsonstringcus_tokens = JSON.stringify(data.customtokens);
				jsonstringcus_tokens = jsonstringcus_tokens.replace(/"/g, '<&#39;>');

				//
				var payingAmount = 0;
                    	
				var payingAmount = parseFloat(data.li_0_price).toFixed(2);
						
				var data = {
					url:data.domain+data.url,
			        sid: data.sid,
			        mode: "2CO",
			        currency_code: data.currency_code,
			        lang: 'en',
			        demo: "Y",
			        customtokens:jsonstringcus_tokens,
			        returncustom_url:data.return_url,
			        li_0_name:data.orderId,
			        custompara:jsonstringpara,
			        li_0_token:data.sectrityToken,
					li_0_price:""+payingAmount,
					li_0_quantity:'1',
					li_0_tangible:'N',
					domain:data.domain.replace("http://", ""),
					merchant:"12thdoor.com",
					quTranId:"12345",
					paypal_direct:"N",
					x_receipt_link_url:$apis.getHost()+"/services/duosoftware.ipn.service/2checkout_ipn.php",
					orderId:data.orderId};

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
				            form.submit();
				            form.remove();
				        }, 1000);
				    });
	            return
	        }

    	}
    }

})(angular.module('the2checkoutService', []));