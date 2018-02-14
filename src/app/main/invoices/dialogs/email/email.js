(function ()
{
    'use strict';

    angular
        .module('app.invoices')
        .controller('InvoemailCtrl', InvoemailCtrl);

    /** @ngInject */
    function InvoemailCtrl($scope, item,profData,template,settings,type,amount,$portalConfig,$http, $rootScope,$apis, $helpers, $sce, $cbsCall, InvoiceService,$auth, $serviceCall, invoiceMultipleDueDatesService, $mdToast, $document, $mdDialog, $mdMedia, $state, $getPdf,msSpinnerService)
    {debugger;
        var vm = this,
        companyName,
            jsonData,
            uniqueCode,
            contactNo,
            accountUrl;

            vm.spinnerService = msSpinnerService;

             vm.invEmailSpinnerLoaded = invEmailSpinnerLoaded;

            function invEmailSpinnerLoaded(emailSpinner){

                emailSpinner.show('inv-email-spinner');
            }

            vm.isLoading = true;
            //vm.spinnerService.show('email-compose-spinner');

            vm.Sender = [];
            vm.bcc = [];
        if(type == 'invoice')
            {
                vm.DoalogHeader = "SEND INVOICE";
            }
            else if(type == 'recinvoice')
            {
                vm.DoalogHeader = "SEND RECURRING PROFILE";
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

        vm.TemlpateData = "";
        vm.test = item;
        //vm.netAmount = vm.test.netAmount;
        vm.netAmount =parseFloat(vm.test.netAmount) / vm.test.exchangeRate;
        profData.decimalPlaces = parseInt(profData.decimalPlaces);
        
        var netAmount = parseFloat(vm.netAmount).toFixed(profData.decimalPlaces);
        vm.netAmount = addCommas(netAmount);
        console.log(vm.netAmount);
        vm.cancel = cancel;
        vm.emailWithPdf = emailWithPdf;
        vm.emailWithAccountStatement = emailWithAccountStatement;
        vm.PDFpath = "";
        vm.AccountPDFpath = "";
        vm.sendDisabled = false;
        vm.pdfName = "";
        vm.accountPDFName = "";

        vm.PDFattached = false;
        vm.includeAccountStatementWithInvoice = false;

        var invoicePDF_Attaching = false;
        var accountPDF_Attaching = false;
        //-----------------------------------------------------------------------
            if(settings[0].preference.invoicePref.copyAdminAllInvoices == true)
            {
                vm.bcc.push(profData.adminEmail);
            }
            if(settings[0].preference.invoicePref.pdfInvoiceAttachment == true)
            {
                vm.PDFattached = true;
                emailWithPdf();
            }
            if(settings[0].preference.invoicePref.includeAccountStatementWithInvoice == true)
            {
                vm.includeAccountStatementWithInvoice = true;
                emailWithAccountStatement();
            }
        //------------------------------------------------------------------------

         var securityToken=$helpers.getCookie("securityToken");

        //var scopeJson = {data : {Invoice:{allow:"r"}}};
        var scopeJson = {data : [{Invoice:{allow:"r"}},{Payment:{allow:"w"}}]};
        vm.invoiceGUID = item.invoiceGUID;
        
        // var apis = $apis.getApis();
        // apis.ifSuccess(function(data){
        //     console.log(data) 
        //     vm.TemlpateData = data;
        //     vm.emailBody = data.Body;
        //     vm.subject=data.Title;
        //     if(type == 'invoice')
        //     {
        //         if(vm.invoiceGUID != undefined)
        //         {
        //             getJWT();
        //         }
        //         else
        //         {
        //             var Invoice = { "permissionType" : "add", "appName":"Invoices"};
        //             var jsonString = JSON.stringify(Invoice);
        //             var client =  $serviceCall.setClient("getInvoiceByKey","process");
        //             client.ifSuccess(function(data){
        //                 vm.invoiceGUID = data.invoiceGUID;
        //                 getJWT();
        //             });
        //             client.ifError(function(data){
        //               console.log("error loading invoice data")
        //             })
        //             client.uniqueID(item.invoiceNo); // send projectID as url parameters
        //             client.postReq(jsonString);
        //         }
        //     }
        //     else if(type == 'recinvoice')
        //     {
        //         setBody(vm.TemlpateData);
        //     }

        // });
        // apis.ifError(function(data){
        //     getJWT();
        // });
        // apis.getTemplate('getTemplate',template);

        var settingsgetTemplate = $serviceCall.setClient("getTemplateByIDWithoutLabel", "setting");
        settingsgetTemplate.ifSuccess(function(data) {
            console.log(data) 
            vm.TemlpateData = data;
            vm.emailBody = data.Body;
            vm.subject=data.Title;
            if(type == 'invoice')
            {
                if(vm.invoiceGUID != undefined)
                {
                    getJWT();
                }
                else
                {
                    var Invoice = { "permissionType" : "add", "appName":"Invoices"};
                    var jsonString = JSON.stringify(Invoice);
                    var client =  $serviceCall.setClient("getInvoiceByKey","process");
                    client.ifSuccess(function(data){
                        vm.invoiceGUID = data.invoiceGUID;
                        getJWT();
                    });
                    client.ifError(function(data){
                      console.log("error loading invoice data")
                    })
                    client.uniqueID(item.invoiceNo); // send projectID as url parameters
                    client.postReq(jsonString);
                }
            }
            else if(type == 'recinvoice')
            {
                setBody(vm.TemlpateData);
            }

        });
        settingsgetTemplate.ifError(function(data) {
            getJWT();
        });
        settingsgetTemplate.uniqueID(template);
        settingsgetTemplate.getReq();

        vm.emailBody = "<html>Dear Customer, <br><br><span style='color: #e11b0c;'> Please add a template </span></html>";
        vm.emailBody = $sce.trustAsHtml( vm.emailBody)

          function getJWT(){
            // added by dyshmantha should delete
            /*vm.temp = {"UserID":"8f7a9d8b5412fe0afac8dc83c6b3bca6","Username":"kokmefaztfod@dropmail.me","Name":"kokmefaztfod","Email":"kokmefaztfod@dropmail.me","SecurityToken":"e93cce13dd82a247c0c8ca99d9c4220a","Domain":"kokmefaztfodtestcompany.dev12thdoor.duoworld.com","DataCaps":"","ClientIP":"124.43.97.26","Otherdata":{"JWT":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJlOTNjY2UxM2RkODJhMjQ3YzBjOGNhOTlkOWM0MjIwYSIsImlzcyI6Imtva21lZmF6dGZvZHRlc3Rjb21wYW55LmRldjEydGhkb29yLmR1b3dvcmxkLmNvbSIsInNjb3BlIjp7ImRhdGEiOnsiSW52b2ljZSI6eyJhbGxvdyI6InIifX19LCJzdWIiOiJkd2F1dGh8OGY3YTlkOGI1NDEyZmUwYWZhYzhkYzgzYzZiM2JjYTYifQ==.OBhpRzmjhSR1Md52CDE63PJSzoQ5YKVOOQuxlhc/G4g=","OneTimeToken":"yes","Scope":"{`data`:{`Invoice`:{`allow`:`r`}}}","UserAgent":"Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36","expairyTime":"","unused":"abc"}};
            vm.CustomerToken = vm.temp.Otherdata.JWT;
            getTinyUrl();
            return;*/
            // ////////////////////////////////
            var host = window.location.protocol + '//' + window.location.hostname;
            if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1)
            {
                vm.CustomerToken  = "fakeJWT";
                vm.getUrl = "www.fakeBecauseLocalhost.info";
                vm.TemlpateData = {TemplateID:template,Title:"fake mail", Body:"test body addad <br> test body test body test body test body test body test body <br> test body test body test body  <br> test body test body test body test body <br> test body test body test body test body  "}
                setBody(vm.TemlpateData);
            }
            else
            {
              var promise = $portalConfig.getJWT("/auth/GetSessionStatic/").setHeaders({"scope": JSON.stringify(scopeJson)}).req();
              promise.then(function(response){ 
                  vm.CustomerToken = response.data.Otherdata.JWT; 
                  getTinyUrl();
              });
          }
        }
//vm.emailBody= "<html>Dear Customer, <br><br>Attached Invoice No.@@no@@. <br>To pay online or download click on the below link<br>@@accounturl@@<br><br>Thank You for your business! <br><br>@@companyName@@<\/html>"
        function getTinyUrl(){
            // added by dyshmantha should delete
            /*var tinyObj = {"TinyURL":"kokmefaztfodtestcompany.dev12thdoor.duoworld.com\/tinyurl\/af9796045aa6cb1fa66303c8dd6cb888"}
            vm.getUrl = tinyObj.TinyURL;
            callApis()*/

            //////////////////////
            var body = {
              "URL":  $apis.getHost() + "/12thDoorPaymentPortal/#/exploredocument?guInv="+ vm.invoiceGUID+"&securityToken="+securityToken +"&jwt="+vm.CustomerToken
            }

            var tinyClient = $portalConfig.getTinyUrl("/tinyurl/create").getTemplate('/apis/template/getTemplate/',template);
            tinyClient.reqPost(body,function(response){ 

                vm.getUrl = response.TinyURL;

                setBody(vm.TemlpateData);
            });
        }

        

        function setBody(response){
            vm.Sender.push(vm.test.email);
            vm.tempID = response.TemplateID;
            vm.subject = response.Title;
            

            var str=response.Body.toString();
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

            if(type == 'invoice')
            {
                var fullUrl = vm.getUrl;
                vm.subject = vm.subject.replace("@@invoiceNo@@",vm.test.invoiceNo );
                vm.subject = vm.subject.replace("@@customerName@@",vm.test.profileName);
                vm.subject = vm.subject.replace("@@companyName@@",profData.companyName);
                vm.emailBody = vm.emailBody.replace("@@invoiceNo@@", vm.test.invoiceNo);
                if(vm.test.isCurrencyChanged == true)
                {
                    vm.emailBody = vm.emailBody.replace("@@currency@@", vm.test.changedCurrency);
                }
                else
                {
                    vm.emailBody = vm.emailBody.replace("@@currency@@", vm.test.baseCurrency);
                }
                vm.emailBody = vm.emailBody.replace("@@amount@@", vm.netAmount);
                vm.emailBody = vm.emailBody.replace("@@customerName@@",vm.test.profileName);
                vm.emailBody = vm.emailBody.replace("@@accountUrl@@", "<a style='color:#335E8B;' href="+fullUrl+">"+vm.getUrl+"</a>");
                vm.emailBody = vm.emailBody.replace("@@companyName@@", profData.companyName);
                vm.emailBody = $sce.trustAsHtml(vm.emailBody);
            }
            else if(type == 'recinvoice')
            {
                var recurringInvoiceNo = "";
                if(vm.test.recurringInvoiceID == 0)
                {recurringInvoiceNo = vm.test.invoiceNo;}
                else
                {recurringInvoiceNo = vm.test.recurringInvoiceID;}

                var fullUrl = window.location.protocol + '//' +vm.getUrl;
                vm.subject = vm.subject.replace("@@recurringInvoiceNo@@", recurringInvoiceNo);
                vm.subject = vm.subject.replace("@@companyName@@",profData.companyName);
                vm.subject = vm.subject.replace("@@customerName@@",vm.test.profileName);
                vm.emailBody = vm.emailBody.replace("@@customerName@@", vm.test.profileName);
                vm.emailBody = vm.emailBody.replace("@@amount@@", amount);
                vm.emailBody = vm.emailBody.replace("@@customerName@@",vm.test.profileName);
                vm.emailBody = vm.emailBody.replace("@@recurringInvoiceNo@@",vm.test.recurringInvoiceID );
                vm.emailBody = vm.emailBody.replace("@@companyName@@", profData.companyName);
                vm.emailBody = $sce.trustAsHtml(vm.emailBody);
            }

            vm.isLoading = false;
            vm.spinnerService.hide('inv-email-spinner');

        }


        function cancel(){
            $mdDialog.hide();
        }

    vm.Emailerror = false;
    vm.emailrec = []; 
    // vm.Sender = vm.test.email;

     vm.pdfChipArr = [];
     if($rootScope.pdfEnable == true){
       vm.pdfChipArr.push(vm.test.invoiceNo + ".pdf") 
     }
     
     vm.pdfInvoNo = []
     vm.pdfInvoNo.push(vm.test.invoiceNo);


 
     var jsondata = {};

     function emailWithPdf() { debugger;
        if(vm.PDFattached){
            invoicePDF_Attaching = true;
            vm.sendDisabled = true;
            MakePdf(function(url) {
                vm.PDFpath = url;

                if(accountPDF_Attaching == false)
                {
                    vm.sendDisabled = false;
                    
                }
                invoicePDF_Attaching = false;
            })
             
         }
     }

     function emailWithAccountStatement()
     {debugger;
        if(vm.includeAccountStatementWithInvoice == true){
            accountPDF_Attaching = true;
            vm.sendDisabled = true;
            MakeAccountPdf(function(url) {
                vm.AccountPDFpath = url;

                if(invoicePDF_Attaching == false)
                {
                    vm.sendDisabled = false;
                    
                }
                accountPDF_Attaching = false;
            })
             
         }
     }

     function MakePdf(callback)
     {
          if(type == 'invoice')
        {
            var client = $getPdf.setPdfClient('filePath', 'process');
            client.setUrl(vm.test.invoiceNo + '.pdf').uniqueID(vm.test.invoiceNo).class('invoice');
            client.getPath(function(data){
                vm.pdfName = vm.test.invoiceNo;
                callback(data);
            })
        }
        if(type == 'invoice')
        {
            $scope.$watch("vm.getUrl",function(){
            if(vm.getUrl != undefined){
              var client = $getPdf.setPdfClient('filePath', 'process');
              client.setUrl(vm.test.invoiceNo + '.pdf').uniqueID(vm.test.invoiceNo).class('invoice').tinyURL(vm.getUrl);
              client.getPath(function(data){
                  debugger;
                  vm.pdfName = vm.test.invoiceNo;
                  callback(data);
              })
            }
          });
        }
        else if(type == 'recinvoice')
        {
            vm.pdfName = vm.test.recurringInvoiceID;
            var client = $getPdf.setPdfClient('filePath', 'process');
            client.setUrl(vm.test.recurringInvoiceID + '.pdf').uniqueID(vm.test.recurringInvoiceID).class('recurring');
            client.getPath(function(data){
                 vm.pdfName = vm.test.recurringInvoiceID;
                callback(data);
            });
        }
     }

     function formatDate(date) {
            var d = new Date(date),
             month = '' + (d.getMonth() + 1),
             day = '' + d.getDate(),
             year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }


     vm.dateTo = new Date();
     vm.dateTo = formatDate(vm.dateTo);
     console.log(vm.dateTo);
   

     var today=new Date()
      var month,day,year
      year=today.getFullYear()
      month=today.getMonth()
      var date=today.getDate()
      if((month-3)<=0)
      year=today.getFullYear()-1
      var backdate = new Date(year,month-3,date);
      console.log(backdate);
      vm.dateFrom = backdate;
      vm.dateFrom = formatDate(vm.dateFrom);

     function MakeAccountPdf(callback)
     {
            var client = $getPdf.setPdfClient('filePathByRange', 'process');
            client.setUrl(vm.test.profileID + '.pdf').uniqueID(vm.test.profileID).class('accountstatement').skip(0).take("").start(vm.dateFrom).end(vm.dateTo);
            client.getPath(function(data){
               vm.accountPDFName =  vm.test.profileName + "'s Statement";
                callback(data);
            });
        
     }

     function addPDFdataToJSON()
     {
        jsondata.attachments = [];
        if(vm.PDFattached)
        {
            var invoiPDF_Data = {
                 "filename": vm.pdfName + '.pdf',
                 "path": vm.PDFpath
                };
                jsondata.attachments.push(invoiPDF_Data);
        }
        if(vm.includeAccountStatementWithInvoice == true)
        {
            var accountPDF_Data = {
                 "filename": vm.test.profileName + "'s Statement" + '.pdf',
                 "path": vm.AccountPDFpath
                };
            jsondata.attachments.push(accountPDF_Data);
        }

     }

     function sendEmailBody() {
        addPDFdataToJSON();
        debugger;
        /*var client = $cbsCall.setClient('notification');
        client.ifSuccess(function(result){
          vm.spinnerService.hide('email-compose-spinner');
            var data = result.data;
            if(data.success == true)
            {
            $mdDialog.hide();
                var toast = $mdToast.simple()
                .content('Email successfully sent to customer') 
                .highlightAction(false)
                .position("top right"); 
                $mdToast.show(toast).then(function () {
            }); 
            sendMailReporting();   
            }
            else
            {
                $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Error')
                      .content(result.data.message)
                      .ok('OK')
                      .targetEvent()
                    );
            }   
        })
        client.ifError(function(result){
          vm.spinnerService.hide('email-compose-spinner');
            if(result.data.message == undefined || result.data.message.includes("Unexpected token"))
                {

                    $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Error')
                      .content('Error Saving Invoice')
                      .ok('OK')
                      .targetEvent()
                    );

                }else
                {
                    $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Error')
                      .content(result.data.message)
                      .ok('OK')
                      .targetEvent()
                    );
                }
        })
        client.singleMail(jsondata);*/

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
                    vm.spinnerService.hide('email-compose-spinner');
                    var client1 = $serviceCall.setClient("updateSendMail", "process");
                    client1.ifSuccess(function(data) {
                        console.log(data);
                    });
                    client1.ifError(function(data) {
                        console.log("error update sent mail");
                        vm.sendDisabled = false;
                        vm.spinnerService.hide('email-compose-spinner');
                    });
                    if(type == 'invoice')
                    {
                        client1.appName("invoice");
                        client1.uniqueID(vm.test.invoiceNo); // send projectID as url parameters
                    }
                    else if(type == 'recinvoice')
                    {
                        return; //to be implemented
                    }
                    
                    client1.getReq();

                });
                client.ifError(function(data) {
                    vm.spinnerService.hide('email-compose-spinner');
					var toast = $mdToast.simple()
						.content("Error occurred while sending email")
						.highlightAction(false)
						.position("top right");
					$mdToast.show(toast).then(function() {});
                })

                client.postReq(jsondata);
        //--------------------------------------------new method
     }

     function sendMailReporting()
     {
        var client =  $serviceCall.setClient("updateSendMail","process");
        client.ifSuccess(function(data){ 
                    

        });
        client.ifError(function(data){
                
        });
        client.appName("invoice");
        client.uniqueID(vm.test.invoiceNo);
        client.getReq();
     }

     function toDataUrl(url, callback) {
         var xhr = new XMLHttpRequest();
         xhr.responseType = 'blob';
         xhr.onload = function() {
             var reader = new FileReader();
             reader.onloadend = function() {
                 callback(reader.result);
             }
             reader.readAsDataURL(xhr.response);
         };
         xhr.open('GET', url);
         xhr.send();
     }

     function hasNull(target) {
         for (var member in target) {
             if (target[member] == null)
                 target[member] = "";
         }
         return target;
     }

     vm.sendmail = sendmail;

          function sendmail () {
            vm.spinnerService.show('email-compose-spinner');
            console.log("dfsdf")
            
            var currency2 = "";
            if(type == 'invoice')
            {
                if(vm.test.isCurrencyChanged == true)
                {
                    currency2 = vm.test.changedCurrency;
                }
                else
                {
                    currency2 = vm.test.baseCurrency;
                }
                 jsondata = {
                     "type": "email",
                     "to":vm.Sender.join(),
                     "subject": vm.subject,
                     "bcc": vm.bcc,
                     "from": profData.companyName + " <no-reply@12thdoor.com>",
                     "Namespace": window.location.hostname,
                     "TemplateID": template,
                     "DefaultParams": {
                         "@@invoiceNo@@": vm.test.invoiceNo.toString(),
                         "@@customerName@@": vm.test.profileName.toString(),
                         "@@currency@@": currency2.toString(),
                         "@@amount@@": vm.netAmount.toString(),
                         "@@accountUrl@@": " " + vm.getUrl,
                         "@@companyName@@": profData.companyName
                     },
                     "CustomParams": {
                         "@@invoiceNo@@": vm.test.invoiceNo.toString(),
                         "@@customerName@@": vm.test.profileName.toString(),
                         "@@currency@@": currency2.toString(),
                         "@@amount@@": vm.netAmount.toString(),
                         "@@accountUrl@@": " " + vm.getUrl,
                         "@@companyName@@": profData.companyName
                     }
                 }
             } 
             else if(type == 'recinvoice')
             {
                jsondata = {
                     "type": "email",
                     "to":vm.Sender.join(),
                     "subject": vm.subject,
                     "bcc": vm.bcc,
                     "from": profData.companyName + " <no-reply@12thdoor.com>",
                     "Namespace": window.location.hostname,
                     "TemplateID": template,
                     "DefaultParams": {
                         "@@recurringInvoiceNo@@": vm.test.recurringInvoiceID,
                         "@@accountUrl@@": " " + vm.getUrl,
                         "@@customerName@@": vm.test.profileName,
                         "@@companyName@@": profData.companyName
                     },
                     "CustomParams": {
                         "@@recurringInvoiceNo@@": vm.test.recurringInvoiceID,
                         "@@accountUrl@@": " " + vm.getUrl,
                         "@@companyName@@": profData.companyName,
                         "@@customerName@@": vm.test.profileName,
                         "@@amount@@": amount
                     }
                 }
             }

            sendEmailBody();
     }

     function dataURItoBlob(dataURI, callback) {
         // convert base64 to raw binary data held in a string
         // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
         var byteString = atob(dataURI.split(',')[1]);

         // separate out the mime component
         var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

         // write the bytes of the string to an ArrayBuffer
         var ab = new ArrayBuffer(byteString.length);
         var ia = new Uint8Array(ab);
         for (var i = 0; i < byteString.length; i++) {
             ia[i] = byteString.charCodeAt(i);
         }

         // write the ArrayBuffer to a blob, and you're done
         var bb = new Blob([ab]);
         return bb;
     }
        
    }
})();
