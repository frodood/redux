(function(){
    angular
        .module('app.contacts')
        .controller('emailControllerContact', emailControllerContact);

    function emailControllerContact(profileMail, dateFrom, dateTo, $mdDialog,$serviceCall,$apis,$setUrl,$mdToast,$cbsCall,$sce,$state,$getPdf,$rootScope, msSpinnerService){
        var vm = this,
            companyName,
            jsonData,
            uniqueCode,
            contactNo,
            accountUrl;

        vm.TemlpateData = "";
        vm.sendDisabled = true;
        vm.senderempty=false;
        vm.isLoading = true;

        vm.spinnerService = msSpinnerService;

        vm.conEmailSpinnerLoaded = conEmailSpinnerLoaded;

        function conEmailSpinnerLoaded(emailSpinner){

            emailSpinner.show('con-email-spinner');
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

        vm.dateFrom= formatDate(dateFrom);
        vm.dateTo = formatDate(dateTo);

        vm.emailWithPdf = emailWithPdf;
        vm.PDFpath = "";
        vm.PDFattached = false;
        // vm.sendDisabled = false;

        //vm.profileIDEmail = profileID;

        contactNo=$state.params.itemID.toString();


        vm.profileMailData = profileMail;
        console.log(profileMail);
        

        //vm.sender=vm.profileMailData.email;

        vm.sender= [];
        vm.sender.push(vm.profileMailData.email);

         vm.cancel = cancel;

        vm.sendMail = sendMail;

        vm.attachPdfCk = true;
        vm.emailrec = []; 
        vm.bcc=[];


        function cancel(){
            $mdDialog.hide();
        }

               
        // var apis = $apis.getApis();
        // apis.ifSuccess(function(data){
        //      //init();             
        //     console.log(data) 
        //     vm.TemlpateData=data;
        //     vm.emailBody = data.Body;
        //     vm.subject=data.Title;

        //     loadSettingData();
        //     setBody(vm.TemlpateData);
           
        // });
        // apis.ifError(function(data){
        //     //init();
        // loadSettingData();
        // });
        // apis.getTemplate('getTemplate','T_EMAIL_CNT_NEWMAIL');

        var settingsgetTemplate = $serviceCall.setClient("getTemplateByIDWithoutLabel", "setting");
        settingsgetTemplate.ifSuccess(function(data) {
            console.log(data) 
            vm.TemlpateData=data;
            vm.emailBody = data.Body;
            vm.subject=data.Title;

            loadSettingData();
            setBody(vm.TemlpateData);
        });
        settingsgetTemplate.ifError(function(data) {
            loadSettingData();
        });
        settingsgetTemplate.uniqueID('T_EMAIL_CNT_NEWMAIL');
        settingsgetTemplate.getReq();

        vm.emailBody = "<html>Dear Customer, <br><br><span style='color: #e11b0c;'> Please add a template </span></html>";
        vm.emailBody = $sce.trustAsHtml( vm.emailBody)

        function loadSettingData(){
            // var client =  $serviceCall.setClient("getAllByQuery","profile"); // method name and service
            // client.ifSuccess(function(data){
            //     vm.customerData = data.result;
               
            // })
            // client.ifError(function(data){
                
                
            // })          
            // client.postReq({
            //   'where' : "profileID = '"+$state.params.itemID+"' "
            // });


            var settingClient =  $serviceCall.setClient("getAllByQuery","setting"); // method name and service
            settingClient.ifSuccess(function(data){
                 vm.profileData = data[0].profile;
                 vm.companyName = vm.profileData.companyName;
                 vm.accountUrl = vm.profileData.accountUrl;
                 vm.bcc.push(vm.profileData.adminEmail);
                 //updateBody()
                 setBody(vm.TemlpateData);
            })
            settingClient.ifError(function(data){

            })          
            settingClient.postReq({
                "setting" : "profile"
            });

            vm.pdfName= "Account Statement No."+ $state.params.itemID.toString();
          }
        

         function updateBody(){
           
            vm.emailBody = vm.emailBody.toString().replace('@@companyName@@',vm.companyName);
            vm.subject = vm.subject.replace('@@customerName@@',vm.profileMailData.profileName);
        } 


        function sendMail(){ 

            if(vm.sender.length){
                vm.spinnerService.show('con-emailSend-spinner');
                vm.sendDisabled = true;
                jsonData =  {
                 "type": "email",
                 "to" : vm.sender,
                 "subject": vm.subject,
                 "bcc": vm.bcc,
                 "from": vm.companyName + " <no-reply@12thdoor.com>",
                 "Namespace": window.location.hostname,
                 // $setUrl.getTenantID                 
                 "TemplateID": "T_EMAIL_CNT_NEWMAIL",
                 "DefaultParams": {
                  "@@companyName@@": vm.companyName
                },
                 "CustomParams": {
                  "@@companyName@@": vm.companyName
                }
            }

            if (!vm.PDFattached) {
                sendEmailBody()
            }else{             
                emailWithPdf();                
            }

            }
            else{
                // vm.spinnerService.hide('con-emailSend-spinner');
                vm.senderempty=true;
                vm.sendDisabled = false;
            }

           

        }


     vm.pdfChipArr = [];
     if($rootScope.pdfEnable == true){
       vm.pdfChipArr.push(contactNo + ".pdf") 
     }



    function emailWithPdf() { 
        if(vm.PDFattached){
            // vm.sendDisabled = true;
            MakePdf(function(url) {
                vm.PDFpath = url;
                // vm.sendDisabled = false;
                sendEmailBody();
            })
             
        }
     }

    function MakePdf(callback)
     {
        var client = $getPdf.setPdfClient('filePathByRange', 'process');
        client.setUrl(contactNo + '.pdf').uniqueID(contactNo).class('accountstatement').skip(0).take("").start(vm.dateFrom).end(vm.dateTo);
        client.getPath(function(data){
            callback(data);
        })
     }

    function addPDFdataToJSON()
     { 
        if(vm.PDFattached)
        {
                jsonData.attachments = [{
                 "filename": contactNo + '.pdf',
                 "path": vm.PDFpath
                }]
        }
     }

        function sendEmailBody(){
            addPDFdataToJSON();
            jsonData.to = vm.sender;
            // var client = $cbsCall.setClient('notification');
            // client.ifSuccess(function(result){
            //     var data = result.data;
            //     $mdDialog.hide();
            //     var toast = $mdToast.simple()
            //       .content('Email successfully sent to customer') 
            //       .highlightAction(false)
            //       .position("top right"); 
            //     $mdToast.show(toast).then(function () {

            //     });           
            //      vm.spinnerService.hide('con-emailSend-spinner');
            // })
            // client.ifError(function(result){
            //     vm.sendDisabled = false;
            //      vm.spinnerService.hide('con-emailSend-spinner');
        
            // })
            // client.singleMail(jsonData)
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
                    vm.spinnerService.hide('con-emailSend-spinner');

                });
                client.ifError(function(data) {
                    
                })

                client.postReq(jsonData);
                
        }

        function setBody(response){
            // vm.Sender = vm.test.email;
            // vm.tempID = response.TemplateID;
            // vm.subject = response.Title;
            

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
               
                vm.subject = vm.subject.replace("@@customerName@@",vm.profileMailData.profileName);
                vm.subject = vm.subject.replace("@@companyName@@",vm.companyName);
                vm.emailBody = vm.emailBody.replace("@@contactNo@@", contactNo)
                //vm.emailBody = vm.emailBody.replace("@@accountUrl@@", "<br><a style='color:#335E8B;' href="+fullUrl+">"+vm.getUrl+"</a>")
                vm.emailBody = vm.emailBody.replace("@@companyName@@", vm.companyName);
                vm.emailBody = $sce.trustAsHtml(vm.emailBody);

                vm.isLoading = false;
                vm.PDFattached=true;
                vm.sendDisabled = false;
                vm.spinnerService.hide('con-email-spinner');
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
 
    }
})();