(function(){
  angular
        .module('app.products')
        .controller('emailControllerPro', emailControllerPro);

    function emailControllerPro(proCode,$mdDialog,$serviceCall,$apis,$setUrl,$mdToast,$cbsCall,$sce,$filter, msSpinnerService){
     var vm = this,
            companyName,
            jsonData,
            uniqueCode;

      vm.productCode = proCode;

      vm.cancel = cancel;

      vm.sendMail = sendMail;

      vm.attachPdfCk = true;

      vm.detailProgress = true;

      vm.disableBtn = true;

      vm.isLoading = true;

      vm.to = []

      vm.bcc = []

       vm.spinnerService = msSpinnerService;

        vm.proEmailSpinnerLoaded = proEmailSpinnerLoaded;

        function proEmailSpinnerLoaded(emailSpinner){

            emailSpinner.show('pro-email-spinner');
        }

      function cancel(){
        $mdDialog.hide();
      }

        function init(){
            var client =  $serviceCall.setClient("getAllByQuery","product"); // method name and service
            client.ifSuccess(function(data){
                vm.productData = data.result;
                vm.brochureExist = false;
                if (Array.isArray( vm.productData) && vm.productData[0].uploadBrochure.length > 0) {
                    vm.pdfName = vm.productData[0].uploadBrochure[0].name
                    uniqueCode = vm.productData[0].uploadBrochure[0].uniqueCode
                    vm.fileExtension = vm.pdfName.split('.').pop();
                    vm.fileName = vm.pdfName.split('.')[0];
                    vm.brochureExist = true;
                }

                vm.url = "";
                if (vm.productData[0].uploadImages.length > 0) {
                  vm.url = window.location.protocol + '//' +  $setUrl.getTenantID + '/apis/media/tenant/75/product/' + vm.productData[0].uploadImages[0].uniqueCode; 
                  vm.emailBody = vm.emailBody.replace("@@productIcon@@", '<img src="'+ vm.url +'">');
                  vm.emailBody = vm.emailBody.replace("@@productName@@",'<span>' + vm.productData[0].productName +'</span>');
                  vm.emailBody = vm.emailBody.replace("@@productCode@@",'<span>' + vm.productData[0].productCode +'</span>' );
                }else{
                  vm.emailBody = vm.emailBody.replace("@@productIcon@@",'');
                  vm.emailBody = vm.emailBody.replace("@@productName@@",'<span>'+vm.productData[0].productName + '</span>');
                  vm.emailBody = vm.emailBody.replace("@@productCode@@",'<span>'+vm.productData[0].productCode + '</span>');
                }

            })
            client.ifError(function(data){ 
                vm.brochureExist = false; 
                vm.detailProgress = false;
            })          
            client.postReq({
              'where' : "productCode = '"+vm.productCode+"' "
            });


            var settingClient =  $serviceCall.setClient("getAllByQuery","setting"); // method name and service
            settingClient.ifSuccess(function(data){
                vm.profileData = data[0].profile;
                companyName = vm.profileData.companyName;
                vm.emailBody = vm.emailBody.replace("@@productPrice@@", vm.productData[0].productPrice.toFixed(2));
                vm.emailBody = vm.emailBody.replace("@@companyName@@", companyName);
                vm.emailBody = $sce.trustAsHtml( vm.emailBody) 

                vm.detailProgress = false;
                vm.disableBtn = false;
                vm.spinnerService.hide('pro-email-spinner');
                vm.isLoading = false;
                 
            })
            settingClient.ifError(function(data){ 
                vm.detailProgress = false;
            })          
            settingClient.postReq({
                "setting" : "profile"
            });
        }
        
        // var apis = $apis.getApis();
        // apis.ifSuccess(function(data){
        //     console.log(data) 
        //     vm.emailBody = data.Body;
        //     vm.subject = data.Title;

        //     init();
        // });
        // apis.ifError(function(data){
        //     init();
        // });
        // apis.getTemplate('getTemplate','T_EMAIL_PRO_NEWMAIL');

        var settingsgetTemplate = $serviceCall.setClient("getTemplateByIDWithoutLabel", "setting");
        settingsgetTemplate.ifSuccess(function(data) {
            vm.emailBody = data.Body;
            vm.subject = data.Title;
            init();
            
        });
        settingsgetTemplate.ifError(function(data) {
             init();
        });
        settingsgetTemplate.uniqueID('T_EMAIL_PRO_NEWMAIL');
        settingsgetTemplate.getReq();

        vm.emailBody = "<html>Dear Customer, <br><br><span style='color: #e11b0c;'> Please add a product template </span></html>";
        vm.emailBody = $sce.trustAsHtml( vm.emailBody)

        vm.validateEmail = validateEmail;
        vm.notValid = false;

        // validate list of emails //
        function validateEmail(emails, elem){
            var re = /\S+@\S+\.\S+/;
          

            if(re.test(emails) == true){
              vm.notValid = false;
              vm.sendDisabled = false;
              vm.senderempty = false;
              // $(this).css("color", "black");
                
              // document.getElementById("chip").style.md-chips="gray";

            }else{
              vm.notValid = true;
              vm.senderempty = false;
              // document.getElementById("chip").style.md-chips="red";
              // document.getElementById("chip").className = document.getElementById("chip").className + "md-chips.md-default-theme md-chip, md-chips md-chip";  // this adds the error class

               
            }
        };

        // vm.validateEmailbcc = validateEmailbcc;

        // function validateEmailbcc(emails){
        //      var re = /\S+@\S+\.\S+/;
        //     if(re.test(emails) == true){
        //       vm.notValidbcc = false;
        //       vm.sendDisabled = false;
        //       // vm.senderempty = false;
        //     }else{
        //       vm.notValidbcc = true;
        //       // vm.sendDisabled = true;

        //       // vm.senderempty = false;
        //     }

        // };

        vm.deleteEmail = deleteEmail;
        function deleteEmail(email){

            vm.sendDisabled = false;
            vm.notValidAllEmail = false;

        }


        vm.sendDisabled = false;
        vm.senderempty=false;
        vm.notValidAllEmail = false;

        function sendMail(){ 
            vm.notValid = false;

             if(vm.to.length){
                var re = /\S+@\S+\.\S+/;

                for (var index = 0; index < vm.to.length; index++) {

                    if(re.test(vm.to[index]) == true){
                      vm.notValidAllEmail = false;
                     

                    }else{
                      vm.notValidAllEmail = true;
                       break;
                      
                    }

                
                }
                
                if(vm.notValidAllEmail === false){
                
                    vm.disableBtn = true;
                    vm.sendDisabled = true;
                    vm.spinnerService.show('pro-emailSend-spinner');
                    jsonData =  {
                        "type": "email", 
                        "subject": vm.subject,
                        "bcc": vm.bcc,
                        "from": companyName + " <no-reply@12thdoor.com>",
                        "Namespace": $setUrl.getTenantID,
                        "TemplateID": "T_EMAIL_PRO_NEWMAIL",
                        "DefaultParams": {
                        "@@productIcon@@": vm.url,
                        "@@productName@@": vm.productData[0].productName,
                        "@@productCode@@": vm.productData[0].productCode,
                        "@@productPrice@@": vm.productData[0].productPrice.toString(), 
                        "@@companyName@@": companyName
                        },
                        "CustomParams": {
                        "@@productIcon@@": vm.url,
                        "@@productName@@": vm.productData[0].productName,
                        "@@productCode@@": vm.productData[0].productCode,
                        "@@productPrice@@": vm.productData[0].productPrice.toString(), 
                        "@@companyName@@": companyName
                        }
                    }

                    jsonData.attachments = [];
                    

                    if (!vm.attachPdfCk) {
                        sendEmailBody()
                    }else{             
                        emailWithPdf()

                    }

                }
                
            } 
            else{
                vm.senderempty=true;
                vm.sendDisabled=false;
                vm.spinnerService.hide('pro-emailSend-spinner');
            }
        }  
        function emailWithPdf(){
            if (vm.productData[0].uploadBrochure.length > 0) {                
              jsonData.attachments = [{
                "filename": vm.pdfName,
                "path": vm.pdfPath = window.location.protocol + '//' +  $setUrl.getTenantID + '/apis/media/tenant/pdf/product/' + vm.productData[0].uploadBrochure[0].uniqueCode 
              }]
            }
            sendEmailBody()
        }

        function sendEmailBody(){
            jsonData.to = vm.to.join();
            // var client = $cbsCall.setClient('notification');
            // client.ifSuccess(function(result){
            //     vm.disableBtn = false;
            //     var data = result.data;
            //     $mdDialog.hide();
            //     var toast = $mdToast.simple()
            //       .content('Email successfully sent to customer.') 
            //       .highlightAction(false)
            //       .position("top right"); 
            //     $mdToast.show(toast).then(function () {

            //     });    
            //     vm.spinnerService.hide('pro-emailSend-spinner');       
            // })
            // client.ifError(function(result){
            //     vm.spinnerService.hide('pro-emailSend-spinner');
            //     vm.disableBtn = false;
            //     var data = result.data; 
            //     var toast = $mdToast.simple()
            //       .content("Error occurred while sending an email")
            //       .highlightAction(false)
            //       .position("top right"); 
            //     $mdToast.show(toast).then(function () {

            //     });   
            // })
            // client.singleMail(jsonData)

            var client = $serviceCall.setClient("callNotificationAndSendMailFromApp", "process");
            client.ifSuccess(function(result) 
            {
                 vm.disableBtn = false;
                var data = result.data;
                $mdDialog.hide();
                var toast = $mdToast.simple()
                  .content('Email successfully sent to customer.') 
                  .highlightAction(false)
                  .position("top right"); 
                $mdToast.show(toast).then(function () {

                });    
                vm.spinnerService.hide('pro-emailSend-spinner'); 

            });
            client.ifError(function(result) {
                vm.spinnerService.hide('pro-emailSend-spinner');
                vm.disableBtn = false;
                var data = result.data; 
                var toast = $mdToast.simple()
                  .content("Error occurred while sending an email")
                  .highlightAction(false)
                  .position("top right"); 
                $mdToast.show(toast).then(function () {

                });
                
            })

            client.postReq(jsonData);


        }
    }
})();
