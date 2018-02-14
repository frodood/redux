(function() {
    'use strict';
    
    angular
        .module('app.estimates')
        .controller('estEmailCtrl', estEmailCtrl);

    /** @ngInject */
    function estEmailCtrl($scope, item, profData, $portalConfig, estimatePref, template, $http, $rootScope, $apis, $helpers, $sce, $cbsCall, EstimateService, $auth, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $state, $getPdf, $setUrl, $window, msSpinnerService) {
        
        var vm = this,
            companyName,
            jsonData,
            uniqueCode,
            contactNo,
            accountUrl;

        //------------------------------------------------------------------------
        vm.TemlpateData = "";
        vm.test = item;
        console.log(item);
        vm.cancel = cancel;
        vm.emailWithPdf = emailWithPdf;
        vm.PDFpath = "";
        vm.PDFattached = false;
        vm.sendDisabled = true;
        vm.Sender = [];
        vm.bcc = [];
        vm.brochers = [];
        loadProductBroachure();
        vm.isLoading=true;
        vm.senderempty=false;

        vm.spinnerService = msSpinnerService;

        vm.estEmailSpinnerLoaded = estEmailSpinnerLoaded;

        function estEmailSpinnerLoaded(emailSpinner){

            emailSpinner.show('est-email-spinner');
        }


        vm.Sender.push(vm.test.email);
        

        console.log(estimatePref);
        vm.PDFattached = estimatePref.sendPdfEstimateAsAttachment;
        
        vm.productProcherAttached = estimatePref.includeProductBrochuresCustomerEmail;
        vm.adminEmail = profData.adminEmail;
        console.log(vm.PDFattached);

        if (estimatePref.copyAdminForAllEstimate == true) {
            vm.bcc.push(vm.adminEmail);
            console.log(vm.bcc);
        }


        if (vm.PDFattached) {
            // vm.sendDisabled = true;


        } else {
            // vm.sendDisabled = false;
        }

        var securityToken = $helpers.getCookie("securityToken");
        var scopeJson = {
            data: {
                Estimate: {
                    allow: "w" 
                }
            }
        };
        vm.estimateGUID = item.estimateGUID;

        var settingsgetTemplate = $serviceCall.setClient("getTemplateByIDWithoutLabel", "setting");
            settingsgetTemplate.ifSuccess(function(data) {
                console.log(data);
            if(vm.estimateGUID != undefined)
            {
                vm.TemlpateData = data;
                vm.emailBody = data.Body;
                vm.subject = data.Title;
                getJWT();
                // vm.isLoading=false;
            }
            else{

                var client = $serviceCall.setClient("getEstimateByKey", "estimate");
                client.ifSuccess(function(estimateData) {
                    vm.estimateGUID = estimateData.estimateGUID;
                    console.log(data);
                    vm.TemlpateData = data;
                    vm.emailBody = data.Body;
                    vm.subject = data.Title;
                    getJWT();
                    // vm.isLoading=false;
                });
                client.ifError(function(data) {
                    console.log("error loading estimate data")
                })
                client.uniqueID(vm.test.estimateNo); // send projectID as url parameters
                client.getReq();
                
            }

            });
            settingsgetTemplate.ifError(function(data) {

            });
            settingsgetTemplate.uniqueID(template);
            settingsgetTemplate.getReq();
        

        vm.emailBody = "<html>Dear Customer, <br><br><span style='color: #e11b0c;'> Please add a template </span></html>";
        vm.emailBody = $sce.trustAsHtml(vm.emailBody)


        function getJWT() {
            // added by dyshmantha should delete
            /*vm.temp = {"UserID":"8f7a9d8b5412fe0afac8dc83c6b3bca6","Username":"kokmefaztfod@dropmail.me","Name":"kokmefaztfod","Email":"kokmefaztfod@dropmail.me","SecurityToken":"e93cce13dd82a247c0c8ca99d9c4220a","Domain":"kokmefaztfodtestcompany.dev12thdoor.duoworld.com","DataCaps":"","ClientIP":"124.43.97.26","Otherdata":{"JWT":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJlOTNjY2UxM2RkODJhMjQ3YzBjOGNhOTlkOWM0MjIwYSIsImlzcyI6Imtva21lZmF6dGZvZHRlc3Rjb21wYW55LmRldjEydGhkb29yLmR1b3dvcmxkLmNvbSIsInNjb3BlIjp7ImRhdGEiOnsiSW52b2ljZSI6eyJhbGxvdyI6InIifX19LCJzdWIiOiJkd2F1dGh8OGY3YTlkOGI1NDEyZmUwYWZhYzhkYzgzYzZiM2JjYTYifQ==.OBhpRzmjhSR1Md52CDE63PJSzoQ5YKVOOQuxlhc/G4g=","OneTimeToken":"yes","Scope":"{`data`:{`Invoice`:{`allow`:`r`}}}","UserAgent":"Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36","expairyTime":"","unused":"abc"}};
            vm.CustomerToken = vm.temp.Otherdata.JWT;
            getTinyUrl();
            return;*/
            // ////////////////////////////////
 

            var promise = $portalConfig.getJWT("/auth/GetSessionStatic/").setHeaders({"scope": JSON.stringify(scopeJson)}).req();
            promise.then(function(response){ 
                vm.CustomerToken = response.data.Otherdata.JWT; 
                getTinyUrl();
            }) 
        }
        //vm.emailBody= "<html>Dear Customer, <br><br>Attached Invoice No.@@no@@. <br>To pay online or download click on the below link<br>@@accounturl@@<br><br>Thank You for your business! <br><br>@@companyName@@<\/html>"
        function getTinyUrl() {
            // added by dyshmantha should delete
            /*var tinyObj = {"TinyURL":"kokmefaztfodtestcompany.dev12thdoor.duoworld.com\/tinyurl\/af9796045aa6cb1fa66303c8dd6cb888"}
            vm.getUrl = tinyObj.TinyURL;
            callApis()*/

            //////////////////////

            var body = {
                    "URL":  $apis.getHost() + "/12thDoorEstimatePortal/#/exploredocument?guEst=" + vm.estimateGUID + "&securityToken=" + securityToken + "&jwt=" + vm.CustomerToken
                }

            var tinyClient = $portalConfig.getTinyUrl("/tinyurl/create").getTemplate('/apis/template/getTemplate/',template);
            tinyClient.reqPost(body,function(response){ 

                vm.getUrl = response.TinyURL;

                setBody(vm.TemlpateData);
            }) 
        }

        //vm.test.email=[];
        

        function setBody(response) {
            
            //            vm.test.email=vm.Sender;
            //            console.log(vm.Sender);
            //            vm.tempID = response.TemplateID;
            //            vm.subject = response.Title;


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
            vm.emailBody = str;
            var fullUrl = vm.getUrl;
            vm.subject = vm.subject.replace("@@estimateNo@@", vm.test.estimateNo);
            vm.subject = vm.subject.replace("@@companyName@@", profData.companyName);
            vm.subject = vm.subject.replace("@@customerName@@", vm.test.profileName);
            vm.emailBody = vm.emailBody.replace("@@estimateNo@@", vm.test.estimateNo);
            vm.emailBody = vm.emailBody.replace("@@accountUrl@@", "<a style='color:#335E8B;' href=" + fullUrl + ">" + vm.getUrl + "</a>");
            vm.emailBody = vm.emailBody.replace("@@amount@@", vm.test.netAmount);
            vm.emailBody = vm.emailBody.replace("@@companyName@@", profData.companyName);
            vm.emailBody = $sce.trustAsHtml(vm.emailBody);
            vm.isLoading=false;
            vm.spinnerService.hide('est-email-spinner');
            vm.sendDisabled = false;
        }


        function cancel() {
            $mdDialog.hide();
        }

        vm.Emailerror = false;
        vm.emailrec = [];
        // vm.Sender = vm.test.email;


        vm.pdfChipArr = [];
        if ($rootScope.pdfEnable == true) {
            vm.pdfChipArr.push(vm.test.estimateNo + ".pdf")
        }

        vm.pdfEstNo = []
        vm.pdfEstNo.push(vm.test.estimateNo);
      
        var jsondata = {};
        function emailWithPdf(name, data) {
            jsondata.attachments.push({
                "filename": name,
                "path": data
            })
        }

        function sendEmailBody() {
            // var client = $cbsCall.setClient('notification');
            // client.ifSuccess(function(result) {
            //     var data = result.data;
            //     console.log(data);
            //     $mdDialog.hide();
            //     var toast = $mdToast.simple()
            //         .content('Email successfully sent to customer.')
            //         .highlightAction(false)
            //         .position("top right");
            //     $mdToast.show(toast).then(function() {});
            //     vm.spinnerService.hide('est-emailSend-spinner');
            //     var client1 = $serviceCall.setClient("updateSendMail", "process");
            //     client1.ifSuccess(function(data) {
            //         console.log(data);
                   
            //     });
            //     client1.ifError(function(data) {
            //         console.log("error update sent mail");
            //         vm.sendDisabled = false;
            //         vm.spinnerService.hide('est-emailSend-spinner');
            //     })
            //     client1.appName("estimate");
            //     client1.uniqueID(vm.test.estimateNo); // send projectID as url parameters
            //     client1.getReq();


            // })
            // client.ifError(function(result) {})
            // client.singleMail(jsondata)
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
                    vm.spinnerService.hide('est-emailSend-spinner');
                    var client1 = $serviceCall.setClient("updateSendMail", "process");
                    client1.ifSuccess(function(data) {
                        console.log(data);
                    });
                    client1.ifError(function(data) {
                        console.log("error update sent mail");
                        vm.sendDisabled = false;
                        vm.spinnerService.hide('est-emailSend-spinner');
                    })
                    client1.appName("estimate");
                    client1.uniqueID(vm.test.estimateNo); // send projectID as url parameters
                    client1.getReq();

                });
                client.ifError(function(data) {
                    
                })

                client.postReq(jsondata);
        }



        function getEstimateUrl() {

            var client = $getPdf.setPdfClient('filePath', 'process');
            client.setUrl(vm.test.estimateNo + '.pdf').uniqueID(vm.test.estimateNo).class('estimate');
            client.getPath(function(data) {
                console.log(data);
                
                emailWithPdf(vm.test.estimateNo + '.pdf', data)

                sendEmailBody();
            })
        }

        function checkBrochurs(callback) {
            if (vm.brochers.length === 0)
                callback();
            else {
                for (var i = 0; i <= vm.brochers.length - 1; i++) {
                    var url = $setUrl.brochurePath + 'product/' + vm.brochers[i].uniqueCode
                    if(vm.productProcherAttached){
                        // emailWithPdf(vm.brochers[i].name, url);
                        var brochAttachments = {};
                        brochAttachments = {
                            "filename": vm.brochers[i].name,
                            "path": url
                        }

                        jsondata.attachments.push(brochAttachments);
                        // sendEmailBody()
                    }
                }
                console.log(jsondata.attachments);
                // sendEmailBody();

                callback()
            }
        }

        vm.sendmail = sendmail;

        function sendmail() {
            if(vm.Sender.length){
                vm.spinnerService.show('est-emailSend-spinner');
                vm.sendDisabled=true;
                jsondata = {
                "type": "email",
                "to": vm.Sender,
                "subject": vm.subject,
                "bcc": vm.bcc,
                "from": profData.companyName.toString() + " <no-reply@12thdoor.com>",
                // "Namespace": window.location.hostname,
                "Namespace": window.location.hostname,
                "TemplateID": template,
                "DefaultParams": {
                    "@@estimateNo@@": vm.test.estimateNo.toString(),
                    "@@customerName@@": vm.test.profileName.toString(),
                    "@@accountUrl@@": " " + vm.getUrl,
                    "@@companyName@@": profData.companyName.toString(),
                    "@@amount@@": vm.test.changedCurrency.toString() + "" + vm.test.netAmount.toString()

                },
                "CustomParams": {
                    "@@estimateNo@@": vm.test.estimateNo.toString(),
                    "@@customerName@@": vm.test.profileName.toString(),
                    "@@accountUrl@@": " " + vm.getUrl,
                    "@@companyName@@": profData.companyName.toString(),
                    "@@amount@@": vm.test.changedCurrency.toString() + "" + vm.test.netAmount.toString()
                }
                }

                jsondata.attachments = [];

                checkBrochurs(function() {
                    if (vm.PDFattached) getEstimateUrl();
                    else sendEmailBody();
                    
                })
            }
            else
            {
                vm.senderempty=true;
                vm.sendDisabled=false;
                vm.spinnerService.hide('est-emailSend-spinner');
                senderEmptyCheck();
            }
            

        }

        console.log(vm.productProcherAttached);

      
            function loadProductBroachure(){
            var body = {
                "where": "deleteStatus = 'false' order by createDate DESC"
            };

            var client = $serviceCall.setClient("getAllByQuery", "product");
            client.ifSuccess(function(data) {

                
                var productBrochers = data.result;
                var count = 0;
                vm.brochers = [];
                console.log(productBrochers);

                for (var i = vm.test.estimateProducts.length - 1; i >= 0; i--) {

                    for (var q = productBrochers.length - 1; q >= 0; q--) {

                        if (vm.test.estimateProducts[i].productID == productBrochers[q].productID) {
                            if (productBrochers[q].uploadBrochure != 0) {

                                if (vm.brochers.length == 5) {
                                    break;
                                }

                                vm.brochers.push(productBrochers[q].uploadBrochure[0]);
                                console.log(vm.brochers);

                            }

                        }
                    }
                }
                console.log(vm.brochers);

                var splitObj ={};
                vm.splitBrochers = [];

                

                for (var n in vm.brochers){
                    // splitObj.fileExtension = vm.brochers[n].name.split('.').pop();
                    // splitObj.fileName = vm.brochers[n].name.split('.')[0];

                    vm.splitBrochers.push(
                       {
                        fileExtension: vm.brochers[n].name.split('.').pop(),
                        fileName:vm.brochers[n].name.split('.')[0]
                       });
                    
                }
                console.log(vm.splitBrochers);

                

                

            });
            client.ifError(function(data) {
                console.log("error loading product data")
            })
            client.skip(0);
            client.take("");
            client.orderby("");
            client.isAscending(false);
            client.postReq(body);

        }



    }
})();