(function ()
{
    'use strict';

    angular
        .module('app.inventory')
        .controller('inventoryEmailCtrl', inventoryEmailCtrl);

    /** @ngInject */
    function inventoryEmailCtrl($scope, item,profData,template,type,amount, $setUrl, $http, $rootScope,$apis, $helpers, $sce, $cbsCall, $auth, $serviceCall,  $mdToast, $document, $mdDialog, $mdMedia, $state, $getPdf, msSpinnerService)
    { 
        // debugger;
        var vm = this,
        companyName,
            jsonData,
            uniqueCode,
            contactNo,
            accountUrl;
//-----------------------------------------------------------------------
//------------------------------------------------------------------------
        // CheckPlanFreeOrNot();
        // vm.planFreeOrNot=false;
        vm.templateData = "";
        vm.test = item;
        console.log(vm.test);
        vm.Sender = [];
        vm.bcc = [];
        vm.senderempty=false;

        vm.spinnerService = msSpinnerService;

        if(type == 'inventoryGIN')
        {
            vm.inventoryNo = item.GINno; 
        }
        else
        {
            vm.inventoryNo = item.GRNno;
        }
        vm.cancel = cancel;
        vm.emailWithPdf = emailWithPdf;
        vm.PDFpath = "";
        vm.PDFattached = false;
        vm.sendDisabled = false;
        vm.emailBody = "<html>Dear Customer, <br><br><span style='color: #e11b0c;'> Please add a template </span></html>";
        vm.emailBody = $sce.trustAsHtml( vm.emailBody);
        vm.inventoryEmailSpinnerLoaded = inventoryEmailSpinnerLoaded;

        var securityToken=$helpers.getCookie("securityToken");

        var scopeJson = {data : {Inventory:{allow:"r"}}};
        // vm.invoiceGUID = item.invoiceGUID;
        
        // var apis = $apis.getApis();
        // debugger;
        // apis.ifSuccess(function(data){
        //     debugger;
        //     console.log(data) 
        //     vm.templateData = data;
        //     vm.emailBody = data.Body;
        //     vm.subject=data.Title;

        //     if(type == 'inventoryGIN'){
        //         setBody(vm.templateData);
        //     }else if(type == 'inventoryGRN'){
        //         setBody(vm.templateData);
        //     }else{
        //         setBody(vm.templateData);
        //     }

        // });
        // apis.ifError(function(data){
        //     msSpinnerService.hide('inventory-email-spinner1');
        // });
        
        vm.Sender.push(vm.test.email);

        // apis.getTemplate('getTemplate',template);

        var settingsgetTemplate = $serviceCall.setClient("getTemplateByIDWithoutLabel", "setting");
        settingsgetTemplate.ifSuccess(function(data) {
            console.log(data);
            vm.templateData = data;
            vm.emailBody = data.Body;
            vm.subject=data.Title;

            if(type == 'inventoryGIN'){
                setBody(vm.templateData);
            }else if(type == 'inventoryGRN'){
                setBody(vm.templateData);
            }else{
                setBody(vm.templateData);
            }

        });
        settingsgetTemplate.ifError(function(data) {
            msSpinnerService.hide('inventory-email-spinner1');
        });
        settingsgetTemplate.uniqueID(template);
        settingsgetTemplate.getReq();

          function getJWT(){
            $http({
               method: "GET",
               url :  $apis.getHost() + "/auth/GetSessionStatic/"+securityToken,
               headers : {
                "securityToken":securityToken, 
                "scope": JSON.stringify(scopeJson)
                }
              }).success(function(data){ 
                    console.log('success get template');
                // debugger;
               
                vm.CustomerToken  = data.Otherdata.JWT;
                setBody(vm.templateData);
                // getTinyUrl();
              },function(response){

                    console.log('fail get template');
              }); 
        }


        function setBody(response){
           
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
            debugger;
            if(type == 'inventoryGIN')
            {
                var fullUrl = "https://" +vm.getUrl;
                vm.subject = vm.subject.replace("@@GINNo@@",vm.test.GINno );    
                vm.subject = vm.subject.replace("@@customerName@@",vm.test.customerNames );                
                vm.emailBody = vm.emailBody.replace("@@GINNo@@", vm.test.GINno)
                // vm.emailBody = vm.emailBody.replace("@@accountUrl@@", "<br><a style='color:#335E8B;' href="+fullUrl+">"+vm.getUrl+"</a>")
                vm.emailBody = vm.emailBody.replace("@@customerName@@", vm.test.customerNames);
                
            }
            else if(type == 'inventoryGRN')
            {
                var fullUrl = "https://" +vm.getUrl;
                vm.subject = vm.subject.replace("@@GRNNo@@",vm.test.GRNno );      
                vm.subject = vm.subject.replace("@@SupplierName@@",vm.test.customerNames );             
                vm.emailBody = vm.emailBody.replace("@@GRNNo@@", vm.test.GRNno)
                // vm.emailBody = vm.emailBody.replace("@@accountUrl@@", "<br><a style='color:#335E8B;' href="+fullUrl+">"+vm.getUrl+"</a>")
                vm.emailBody = vm.emailBody.replace("@@SupplierName@@", vm.test.customerNames);
                
            }

            vm.subject = vm.subject.replace("@@companyName@@",profData.companyName);
            vm.emailBody = vm.emailBody.replace("@@companyName@@", profData.companyName);
            vm.emailBody = $sce.trustAsHtml(vm.emailBody);

            msSpinnerService.hide('inventory-email-spinner1');
        }


        function cancel(){
            $mdDialog.hide();
        }

    vm.Emailerror = false;
    vm.emailrec = []; 
    // vm.Sender = vm.test.email;

     vm.pdfChipArr = [];
     if($rootScope.pdfEnable == true){
        if(type == 'inventoryGIN')
        {
            vm.pdfChipArr.push(vm.test.GINno + ".pdf"); 
        }
        else
        {
            vm.pdfChipArr.push(vm.test.GRNno + ".pdf"); 
        }
       
     }
     
     vm.emailBCCrec = "sachitra.k@duosoftware.com";
     vm.pdfInvoNo = [];

     // vm.pdfInvoNo.push(vm.test.invoiceNo);


 
     var jsondata = {};

     function emailWithPdf() { 
        if(vm.PDFattached){
            vm.sendDisabled = true;
            MakePdf(function(url) {
                vm.PDFpath = url;
                vm.sendDisabled = false;
            })
             
         }
     }

    

     function MakePdf(callback)
     {

        var client = $getPdf.setPdfClient('filePath', 'process');
        if(type == 'inventoryGIN')
        {
            client.setUrl(vm.test.GINno + '.pdf').uniqueID(vm.test.GINno).class('gin');
        }
        else
        {
            client.setUrl(vm.test.GRNno + '.pdf').uniqueID(vm.test.GRNno).class('grn');
        }
        client.getPath(function(data){
            callback(data);
        })
     }

     function addPDFdataToJSON()
     {debugger;
        if(vm.PDFattached)
        {
            if(type == 'inventoryGIN')
            {
                jsondata.attachments = [{
                 "filename": vm.test.GINno + '.pdf',
                 "path": vm.PDFpath
                }]
            }
            else
            {
                jsondata.attachments = [{
                 "filename": vm.test.GRNno + '.pdf',
                 "path": vm.PDFpath
                }]
            }
        }
     }

     function sendEmailBody() {
        addPDFdataToJSON();
        // var client = $cbsCall.setClient('notification');
        // client.ifSuccess(function(result){
        //     var data = result.data;
        //     $mdDialog.hide();
        //         var toast = $mdToast.simple()
        //         .content('Email successfully sent to customer') 
        //         .highlightAction(false)
        //         .position("top right"); 
        //         $mdToast.show(toast).then(function () {
        //     });  
        //     vm.spinnerService.hide('inventory-emailSend-spinner');         
        // })
        // client.ifError(function(result){
        //     vm.spinnerService.hide('inventory-emailSend-spinner');
        // })
        // client.singleMail(jsondata)
        
        var client = $serviceCall.setClient("callNotificationAndSendMailFromApp", "process");
        client.ifSuccess(function(result) 
        {
            var data = result.data;
            $mdDialog.hide();
                var toast = $mdToast.simple()
                .content('Email successfully sent to customer') 
                .highlightAction(false)
                .position("top right"); 
                $mdToast.show(toast).then(function () {
            });  
            vm.spinnerService.hide('inventory-emailSend-spinner');  

        });
        client.ifError(function(result) {
            vm.spinnerService.hide('inventory-emailSend-spinner');
        })

        client.postReq(jsondata);
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
            
            
            if(vm.Sender.length){
                vm.spinnerService.show('inventory-emailSend-spinner');
                if(type == 'inventoryGIN')
            {
                 jsondata = {
                     "type": "email",
                     "to":vm.Sender,
                     "subject": vm.subject,
                     "bcc": vm.bcc,
                     "from": profData.companyName + " <no-reply@12thdoor.com>",
                     "Namespace": $setUrl.getTenantID,
                     "TemplateID": template,
                     "DefaultParams": {
                         "@@GINNo@@": vm.test.GINno.toString(),
                         "@@customerName@@": vm.test.customerNames,
                         "@@companyName@@": profData.companyName
                     },
                     "CustomParams": {
                         "@@GINNo@@": vm.test.GINno.toString(),
                         "@@customerName@@": vm.test.customerNames,
                         "@@companyName@@": profData.companyName
                     }
                 }
                jsondata.attachments = [];

             } else if(type == 'inventoryGRN')
             {
                jsondata = {
                     "type": "email",
                     "to":vm.Sender,
                     "subject": vm.subject,
                     "bcc": vm.bcc,
                     "from": profData.companyName + " <no-reply@12thdoor.com>",
                     "Namespace": $setUrl.getTenantID,
                     "TemplateID": template,
                     "DefaultParams": {
                         "@@GRNNo@@": vm.test.GRNno,
                         "@@SupplierName@@": vm.test.customerNames,
                         "@@companyName@@": profData.companyName
                     },
                     "CustomParams": {
                         "@@GRNNo@@": vm.test.GRNno.toString(),
                         "@@SupplierName@@": vm.test.customerNames,
                         "@@companyName@@": profData.companyName
                     }
                 }

                jsondata.attachments = []; 
             }

             sendEmailBody()
            }
            else{
                 vm.senderempty=true;
                 vm.spinnerService.hide('inventory-emailSend-spinner');
            }
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

     function inventoryEmailSpinnerLoaded(inventoryEmailSpinner){
        inventoryEmailSpinner.show();
     };
        
    }
})();