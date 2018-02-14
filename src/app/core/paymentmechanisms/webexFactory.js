/*
	- 2Checkout Payemnt Tool -
		Version 6.1.0.6
*/
(function (mod)
{
    'use strict';
        
        mod.factory('webexService', webexService);

    /** @ngInject */
    function webexService($rootScope,$apis,$mdDialog,$http,$paymentgateway,$serviceCall)
    {
    	//.module('app.invoices')
    	//url:data.domain+"/services/duosoftware.process.service/process/singlePayment",
    	return { 
	        doWebexPayment: function(data) {
	        	debugger;
				//custompara:jsonstringpara,
				//customtokens:jsonstringcus_tokens,
				//returncustom_url:data.return_url

				var payingAmount = 0;
                var payingAmount = parseFloat(data.amount).toFixed(2);


				var clientS = $paymentgateway.setClient('webxpay','payValueEncode');
                  clientS.ifSuccess(function(response) {   
                    if(response.status == true)
                    {debugger;


                    	
                    	var datajson = {
						secret_key : data.secret_key,
						payment : response.value,
						first_name : "",
						last_name : "",
						email : "",
						contact_number : "",
						address_line_one : "",
						address_line_two : "",
						city : "",
						state : "",
						postal_code : "",
						country : "",
						process_currency : data.process_currency,
						cms : "PHP",
						custom_fields : data.custom_fields
						};

						LoadProfileData(datajson,data.profileID,$serviceCall,$mdDialog);
                    }
                  });
                  clientS.ifError(function(data) {
                  	$mdDialog.show(
                          $mdDialog.alert()
                          .parent(angular.element(document.body))
                          .content("Error occurred while processing payment")
                          .ariaLabel('Alert Dialog Demo')
                          .ok('OK')
                          .targetEvent()
                      );
                  }) 
                  clientS.unique_order_id(data.orderId);
                  clientS.total_amount(payingAmount);
                  clientS.getReq();
                  //data.amount

				
	        },
	        SaveTempData: function(callback,_json) {

		        var client = $serviceCall.setClient("saveTempJsonData", "process");
	            client.ifSuccess(function(data) {
	                callback(data);
	            });
	            client.ifError(function(data) {
	                callback(data);
	            })
	            client.postReq(_json);

	        }
	        

    	}

    	

    }

    function LoadProfileData(datajson,profileID,$serviceCall,$mdDialog)
    {
    	debugger;
		        	var client = $serviceCall.setClient("getProfileByKey", "profile");
		            client.ifSuccess(function(data) {
		               debugger;
		               	datajson.first_name = data.firstName;
						datajson.last_name = data.lastName;
						datajson.email = data.email;
						datajson.contact_number = data.mobile;
						datajson.address_line_one = data.billingAddress.street;
						datajson.address_line_two = "";
						datajson.city = data.billingAddress.city;
						datajson.state = data.billingAddress.state;
						datajson.postal_code = data.billingAddress.zip;
						datajson.country = data.billingAddress.country;

						submitForme(datajson,$mdDialog);
		            });
		            client.ifError(function(data) {
		            	$mdDialog.show(
                          $mdDialog.alert()
                          .parent(angular.element(document.body))
                          .content("Error occurred while processing payment")
                          .ariaLabel('Alert Dialog Demo')
                          .ok('OK')
                          .targetEvent()
                      );

		            });
		            client.uniqueID(profileID); // send projectID as url parameters
		            client.postReq();
    }

    function submitForme(datajson,$mdDialog)
    {
debugger;

		var form = $('<form/></form>');
		form.attr("action", "https://webxpay.com/index.php?route=checkout/billing");
		form.attr("method", "POST");
		form.attr("target", "_self"); //tco_lightbox_iframe
		form.attr("style", "display:none;");
		
		var hasError = false;
		var message = "";
		$.each(datajson, function (name, value) {
			//validating
			if(name == "contact_number" && value == ""){message += " contact number"; hasError = true;  }
			if(name == "email" && value == ""){message += " email"; hasError = true;  }
			
			if(name == "first_name" && value == ""){message += " first name"; hasError = true;  }
			if(name == "last_name" && value == ""){message += " last name"; hasError = true;  }
			if(name == "process_currency" && value == ""){message += " currency"; hasError = true;  }
			
			//validating
			if (value != null) {
				var input = $("<input></input>").attr("type", "hidden").attr("name", name).val(value);
				form.append(input);
			}
		});

		if(hasError == true) {showError(message+" field/s required",$mdDialog);   return;}

		$("body").append(form);
		$('.tco_lightbox').remove();


		form.submit();
		form.remove();
		 /*$.getScript( "https://www.2checkout.com/static/checkout/javascript/direct.min.js", function( data, textStatus, jqxhr ) {
				        setTimeout(function() {
				            form.submit();
				            form.remove();
				        }, 1000);
				    });*/

		return
		}

		function showError(message,$mdDialog)
		{
			$mdDialog.show(
                          $mdDialog.alert()
                          .parent(angular.element(document.body))
                          .content(message)
                          .ariaLabel('Alert Dialog Demo')
                          .ok('OK')
                          .targetEvent()
                      );

		}
    

})(angular.module('webexService', []));