(function() {
    'use strict';
    angular
        .module('app.payments')
        .controller('paymentse', paymentse);
    /** @ngInject */
    function paymentse($scope, item, profData, cusemail, $apis, $sce,$setUrl, $cbsCall, $serviceCall, $mdToast, $mdDialog,$getPdf, msSpinnerService) {
        var vm = this;

        vm.test = item;
        vm.cancel = cancel; 
        vm.sendMail = sendMail; 
      
        vm.PaymentGUID = "";
        vm.TemlpateData = "";

        vm.pdfCheck = true;
        vm.disableBtn = true;
        vm.isLoading = true;

        console.log(cusemail);
        
        vm.to = [];

        vm.to.push(cusemail);

        vm.bcc = [];

        vm.spinnerService = msSpinnerService;

        vm.payEmailSpinnerLoaded = payEmailSpinnerLoaded;

        function payEmailSpinnerLoaded(emailSpinner){

            emailSpinner.show('pay-email-spinner');
        }

        //add commas to number.. 
        function addCommas(nStr)
        {
          nStr += '';
          var x = nStr.split('.');
          var x1 = x[0];
          var x2 = x.length > 1 ? '.' + x[1] : '';
          var rgx = /(\d+)(\d{3})/;
          while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
          }
          return x1 + x2;
        } 
        vm.recievedAmount= vm.test.recievedAmount;
         vm.recievedAmount = parseFloat(vm.recievedAmount).toFixed(profData.decimalPlaces);
         vm.recievedAmount = addCommas( vm.recievedAmount);
        console.log(vm.recievedAmount);
 
        //Start Getting Template Data
        // var apis = $apis.getApis();
        // apis.ifSuccess(function(data) {  
        //     vm.TemlpateData = data;
        //     vm.emailBody = data.Body;
        //     vm.subject = data.Title;
        //     setBody(vm.TemlpateData);
        // });
        // apis.ifError(function(data) { 
        // });
        // apis.getTemplate('getTemplate', 'T_EMAIL_PAY_NEWMAIL');

        var settingsgetTemplate = $serviceCall.setClient("getTemplateByIDWithoutLabel", "setting");
        settingsgetTemplate.ifSuccess(function(data) {
           vm.TemlpateData = data;
            vm.emailBody = data.Body;
            vm.subject = data.Title;
            setBody(vm.TemlpateData);
        });
        settingsgetTemplate.ifError(function(data) {

        });
        settingsgetTemplate.uniqueID('T_EMAIL_PAY_NEWMAIL');
        settingsgetTemplate.getReq();


        //End Getting Template Data
        function setBody(response) {
            // vm.Sender = cusemail;
            vm.tempID = response.TemplateID;
            vm.subject = response.Title;
            vm.subject = vm.subject.replace("@@paymentNo@@", vm.test.receiptID);
            vm.subject = vm.subject.replace("@@companyName@@", profData.companyName);
            vm.subject = vm.subject.replace("@@customerName@@", vm.test.profileName);
            var str = response.Body.toString();
            var arr = {
                "<html>": "",
                "</html>": "",
                "<br>": "\n"
            }
            var re = new RegExp(Object.keys(arr).join("|"), "gi");
            str = str.replace(re, function(matched) {
                return arr[matched];
            });
            var fullUrl = "https://" + vm.getUrl;
            vm.emailBody = str;
            vm.emailBody = vm.emailBody.replace("@@paymentNo@@", vm.test.receiptID);
            vm.emailBody = vm.emailBody.replace("@@customerName@@", vm.test.profileName);
            vm.emailBody = vm.emailBody.replace("@@companyName@@", profData.companyName); 
            vm.emailBody = vm.emailBody.replace("@@currency@@", vm.test.baseCurrency);
            vm.emailBody = vm.emailBody.replace("@@amount@@", vm.recievedAmount);
            vm.emailBody = $sce.trustAsHtml(vm.emailBody);

            vm.disableBtn = false;
            vm.isLoading = false;
            vm.spinnerService.hide('pay-email-spinner');

        }



        function cancel() {
            $mdDialog.hide();
        }

        vm.Emailerror = false;
        vm.emailrec = [];
        // vm.Sender = vm.test.email; 
         
        var jsondata = {};

        function getUrl() {
            var client = $getPdf.setPdfClient('filePath', 'process');
            client.setUrl(vm.test.receiptID + '.pdf').uniqueID(vm.test.receiptID).class('payment');
            client.getPath(function(data) {
                emailWithPdf(data)
            })
        }

        function emailWithPdf(data) {
            jsondata.attachments = [{
                "filename": vm.test.receiptID + '.pdf',
                "path": data
            }]
            sendEmailBody()
        }

        function sendEmailBody() { 
            /*var client = $cbsCall.setClient('notification');
            client.ifSuccess(function(result) { 
                vm.disableBtn = false;

                var data = result.data;
                $mdDialog.hide();
                var toast = $mdToast.simple()
                    .content('Email successfully sent to customer')
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
                vm.spinnerService.hide('pay-emailSend-spinner');
            })
            client.ifError(function(result) {
                vm.disableBtn = false;
                vm.spinnerService.hide('pay-emailSend-spinner');
                var data = result.data; 
                var toast = $mdToast.simple()
                    .content("Error occurred while sending an email")
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});

            })
            client.singleMail(jsondata)*/
			
				//--------------------------------------------new method
				var client = $serviceCall.setClient("callNotificationAndSendMailFromApp", "process");
                client.ifSuccess(function(data) {
                    // var data = result.data;
                    console.log(data);
                    $mdDialog.hide();
                    var toast = $mdToast.simple()
                        .content('Email successfully sent to customer.')
                        .highlightAction(false)
                        .position("top right");
                    $mdToast.show(toast).then(function() {});
                    vm.spinnerService.hide('pay-emailSend-spinner');
                    

                });
                client.ifError(function(data) {
                    vm.disableBtn = false;
					vm.spinnerService.hide('pay-emailSend-spinner');
					var toast = $mdToast.simple()
						.content("Error occurred while sending email")
						.highlightAction(false)
						.position("top right");
					$mdToast.show(toast).then(function() {});
                })

                client.postReq(jsondata);
				//--------------------------------------------new method
        } 

        function sendMail() { 

            vm.disableBtn = true;
            vm.spinnerService.show('pay-emailSend-spinner');
            jsondata = {
                "type": "email",
                "to": vm.to.join(),
                "subject": vm.subject,
                "bcc": vm.bcc,
                "from": profData.companyName.toString() + " <no-reply@12thdoor.com>",
                "Namespace": $setUrl.getTenantID,
                "TemplateID": "T_EMAIL_PAY_NEWMAIL",
                "DefaultParams": {
                    "@@paymentNo@@": vm.test.receiptID.toString(),
                    "@@currency@@": vm.test.baseCurrency,
                    "@@amount@@": vm.recievedAmount.toString(),
                    "@@customerName@@": vm.test.profileName,
                    "@@companyName@@": profData.companyName
                },
                "CustomParams": {
                    "@@paymentNo@@": vm.test.receiptID.toString(),
                    "@@currency@@": vm.test.baseCurrency,
                    "@@amount@@": vm.recievedAmount.toString(),
                    "@@customerName@@": vm.test.profileName,
                    "@@companyName@@": profData.companyName
                }
            } 
            if (vm.pdfCheck) getUrl(); else sendEmailBody();
            
        } 
    }
})();