(function ()
{
    'use strict';

    angular
        .module('app.creditnotes')
        .controller('emailCtrlCre', emailCtrlCre);

    /** @ngInject */
    function emailCtrlCre($scope, item, profData, $setUrl,$http,$apis, $portalConfig,$helpers, $sce, $cbsCall,$auth, $getPdf, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $state, msSpinnerService)
    {
        var vm = this; 

        vm.test = item;

        vm.Sender = [];

        vm.bcc = [];

        vm.sendmail = sendMail;

        vm.cancel = cancel;

        vm.isLoading=true; 

        vm.disableBtn = true;

        vm.pdfCheck = true;

        vm.spinnerService = msSpinnerService;

        vm.creEmailSpinnerLoaded = creEmailSpinnerLoaded;

        function creEmailSpinnerLoaded(emailSpinner){

            emailSpinner.show('cre-email-spinner');
        }


        
        //add commas to number
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
        vm.netAmount = vm.test.netAmount;
        vm.netAmount = parseFloat(vm.netAmount).toFixed(profData.decimalPlaces);
        vm.netAmount = addCommas(vm.netAmount);
        console.log(vm.netAmount);

        var securityToken=$helpers.getCookie("securityToken");

        var scopeJson = {data : {CreditNote:{allow:"w"}}}; 

        function getJWT(){
            var promise = $portalConfig.getJWT("/auth/GetSessionStatic/").setHeaders({"scope": JSON.stringify(scopeJson)}).req();
            promise.then(function(response){
                console.log(response)
                console.log(response.data.Otherdata.JWT)
                vm.CustomerToken = response.data.Otherdata.JWT; 
                getTinyUrl();
            }) 
        } 

        // var apis = $apis.getApis();
        // apis.ifSuccess(function(data){ 
        //     vm.TemlpateData = data;
        //     vm.emailBody = data.Body;
        //     vm.subject=data.Title;
        //     getJWT();

        // });
        // apis.ifError(function(data){
            
        // });
        // apis.getTemplate('getTemplate','T_EMAIL_CRN_NEWMAIL');

        var settingsgetTemplate = $serviceCall.setClient("getTemplateByIDWithoutLabel", "setting");
        settingsgetTemplate.ifSuccess(function(data) {
            vm.TemlpateData = data;
            vm.emailBody = data.Body;
            vm.subject=data.Title;
            getJWT();
        });
        settingsgetTemplate.ifError(function(data) {

        });
        settingsgetTemplate.uniqueID('T_EMAIL_CRN_NEWMAIL');
        settingsgetTemplate.getReq();

        vm.emailBody= "<html>Dear Customer, <br><br>Attached Credit Note No.@@no@@. <br>To pay online or download click on the below link<br>@@accounturl@@<br><br>Thank You for your business! <br><br>@@companyName@@<\/html>"
        vm.emailBody = $sce.trustAsHtml( vm.emailBody);


        function getTinyUrl(){
            var body = {"URL": $apis.getHost()+"/12thDoorCreditNotePortal/#/exploredocument?guCreditN="+ vm.test.creditNoteGUID+"&securityToken="+securityToken +"&jwt="+vm.CustomerToken};

            var tinyClient = $portalConfig.getTinyUrl("/tinyurl/create").getTemplate('/services/duosoftware.setting.service/setting/getTemplateByIDWithoutLabel?uniqueID=','T_EMAIL_CRN_NEWMAIL');
            tinyClient.reqPost(body,function(response){

                    console.log(response)
                    vm.getUrl  = response.TinyURL
                    vm.tempID  = response.data.TemplateIDCustomerToken
                    vm.subject = response.data.Title;
                    vm.subject = vm.subject.replace("@@creditNoteNo@@",vm.test.creditNoteNo );
                    vm.subject = vm.subject.replace("@@companyName@@",profData.companyName);
                    vm.subject = vm.subject.replace("@@customerName@@",vm.test.profileName);

                    var str=response.data.Body.toString();
                    var arr = {
                        "<html>": "",
                        "</html>": "",
                        "<br>": "\n"
                    }

                    var re = new RegExp(Object.keys(arr).join("|"),"gi");
                    str = str.replace(re, function(matched){
                        return arr[matched];
                    });

                    vm.emailBody = str;
                    vm.emailBody = vm.emailBody.replace("@@creditNoteNo@@", vm.test.creditNoteNo);
                    vm.emailBody = vm.emailBody.replace("@@currency@@", vm.test.baseCurrency );
                    vm.emailBody = vm.emailBody.replace("@@amount@@", vm.netAmount);
        
                    vm.emailBody = vm.emailBody.replace("@@accountUrl@@", "<br><a style='color:#335E8B;' href="+vm.getUrl+">"+vm.getUrl+"</a>")
                    vm.emailBody = vm.emailBody.replace("@@companyName@@", profData.companyName);
                    vm.emailBody = $sce.trustAsHtml(vm.emailBody); 
                    vm.isLoading=false;
                    vm.disableBtn = false;
                    vm.spinnerService.hide('cre-email-spinner');

            })
        }

        // function getTinyUrl(){
        //     $http({
        //         method : "POST",
        //         url :   $apis.getHost() +"/tinyurl/create",
        //         headers : {"securityToken":securityToken},
        //          data : {"URL": $apis.getHost()+"/12thDoorCreditNotePortal/#/exploredocument?guCreditN="+ vm.test.creditNoteGUID+"&securityToken="+securityToken +"&jwt="+vm.CustomerToken}
        //     }).then(function(response){
        //         // this should change. request within another request is so primary level implementation.Please refer 'how to chain promise '. 
        //         vm.getUrl = response.data.TinyURL

        //         $http({
        //             method : "GET",
        //             url : "/apis/template/getTemplate/T_EMAIL_CRN_NEWMAIL",
        //             securityToken : {"securityToken" : securityToken}
        //         }).then(function(response){
        //             console.log(response)
        //             vm.tempID  = response.data.TemplateIDCustomerToken
        //             vm.subject = response.data.Title;
        //             vm.subject = vm.subject.replace("@@creditNoteNo@@",vm.test.creditNoteNo );
        //             vm.subject = vm.subject.replace("@@companyName@@",profData.companyName);

        //             var str=response.data.Body.toString();
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"),"gi");
        //             str = str.replace(re, function(matched){
        //                 return arr[matched];
        //             });

        //             vm.emailBody = str;
        //             vm.emailBody = vm.emailBody.replace("@@creditNoteNo@@", vm.test.creditNoteNo)
        //             vm.getUrl = window.location.protocol + '//' + vm.getUrl;
        //             vm.emailBody = vm.emailBody.replace("@@accountUrl@@", "<br><a style='color:#335E8B;' href="+vm.getUrl+">"+vm.getUrl+"</a>")
        //             vm.emailBody = vm.emailBody.replace("@@companyName@@", profData.companyName);
        //             vm.emailBody = $sce.trustAsHtml(vm.emailBody); 
        //         },function(response){

        //         })

        //     console.log(vm.getUrl)
        //     }, function(response){

        //     })
        // } 

        function cancel(){
            $mdDialog.hide();
        }

        vm.Emailerror = false;
        vm.emailrec = []; 
        vm.Sender.push(vm.test.email);
        
        var jsondata = {};

        function getUrl() {
            var client = $getPdf.setPdfClient('filePath', 'process');
            client.setUrl(vm.test.creditNoteNo + '.pdf').uniqueID(vm.test.creditNoteNo).class('creditNote');
            client.getPath(function(data) {
                emailWithPdf(data)
            })
        }

        function emailWithPdf(data) {
            jsondata.attachments = [{
                "filename": vm.test.creditNoteNo + '.pdf',
                "path": data
            }]
            sendEmailBody()
        }

        function sendEmailBody() { 
            // var client = $cbsCall.setClient('notification');
            // client.ifSuccess(function(result) {

            //     vm.disableBtn = false;
            //     updateEmail();
            //     var data = result.data;
            //     $mdDialog.hide();
            //     var toast = $mdToast.simple()
            //         .content('Email successfully sent to customer')
            //         .highlightAction(false)
            //         .position("top right");
            //     $mdToast.show(toast).then(function() {});
            //     vm.spinnerService.hide('cre-emailSend-spinner');
            // })
            // client.ifError(function(result) {

            //   vm.spinnerService.hide('cre-emailSend-spinner');
            //     vm.disableBtn = false;
            //     var data = result.data; 
            //     var toast = $mdToast.simple()
            //       .content("Error occurred while sending an email")
            //       .highlightAction(false)
            //       .position("top right"); 
            //     $mdToast.show(toast).then(function () {

            //     });  
            // })
            // client.singleMail(jsondata,vm.Sender)

            var client = $serviceCall.setClient("callNotificationAndSendMailFromApp", "process");
            client.ifSuccess(function(result) 
            {
                vm.disableBtn = false;
                updateEmail();
                var data = result.data;
                $mdDialog.hide();
                var toast = $mdToast.simple()
                    .content('Email successfully sent to customer')
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
                vm.spinnerService.hide('cre-emailSend-spinner');

            });
            client.ifError(function(result) {
                 vm.spinnerService.hide('cre-emailSend-spinner');
                vm.disableBtn = false;
                var data = result.data; 
                var toast = $mdToast.simple()
                  .content("Error occurred while sending an email")
                  .highlightAction(false)
                  .position("top right"); 
                $mdToast.show(toast).then(function () {

                });  
            })

            client.postReq(jsondata, vm.Sender);
        } 

        function updateEmail(){
            var client = $serviceCall.setClient("updateSendMail", "process");
            client.ifSuccess(function(data) {

            });
            client.ifError(function(data) {

            });
            client.appName("creditnote");
            client.uniqueID(vm.test.creditNoteNo);
            client.getReq();
        }

        function sendMail() {  


            vm.spinnerService.show('cre-emailSend-spinner');
            vm.disableBtn = true;
            jsondata = {
                "type": "email",
                "to": vm.Sender,
                "subject": vm.subject,
                "bcc": vm.bcc,
                "from": profData.companyName + " <no-reply@12thdoor.com>",
                "Namespace": $setUrl.getTenantID,
                "TemplateID": "T_EMAIL_CRN_NEWMAIL",
                "DefaultParams": {
                    "@@creditNoteNo@@": vm.test.creditNoteNo.toString(),
                    "@@currency@@": vm.test.baseCurrency.toString(),
                    "@@amount@@": vm.netAmount.toString(),
                    "@@accountUrl@@": vm.getUrl,
                    "@@companyName@@": profData.companyName
                },
                "CustomParams": {
                    "@@creditNoteNo@@": vm.test.creditNoteNo.toString(),
                    "@@currency@@": vm.test.baseCurrency.toString(),
                    "@@amount@@": vm.netAmount.toString(),
                    "@@accountUrl@@": vm.getUrl,
                    "@@companyName@@": profData.companyName
                }
            }
            if (vm.pdfCheck) getUrl(); else sendEmailBody();
            
        } 
        
    }
})();