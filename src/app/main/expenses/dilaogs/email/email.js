(function(){
    angular
        .module('app.expenses')
        .controller('emailControllerExpense', emailControllerExpense);

    function emailControllerExpense(expenseMail,settingData,$mdDialog,$serviceCall,$apis,$setUrl,$mdToast,$cbsCall,$sce,$state,$getPdf,$rootScope,$window){
        var vm = this,
            companyName,
            jsonData,
            uniqueCode,
            expenseNo,
            accountUrl;

        vm.TemlpateData = "";

        console.log(expenseMail);

        vm.companyName=settingData.profile.companyName;
        
        vm.emailWithPdf = emailWithPdf;
        vm.PDFpath = "";
        vm.sender = [];
        vm.bcc = [];
        vm.PDFattached = false;
        vm.sendDisabled = false;
        vm.senderempty=false;

        //vm.profileIDEmail = profileID;

        //expenseNo=$state.params.itemId.toString();

        vm.expenseNo = expenseMail.expenseID;

        vm.expenseMailData = expenseMail;

        // vm.sender.push(vm.expenseMailData.email);

        // vm.to=vm.expenseMailData.email;

        vm.cancel = cancel;

        vm.sendMail = sendMail;

        vm.attachPdfCk = true;
        //vm.emailrec = []; 

        function cancel(){
            $mdDialog.hide();
        }

        var apis = $apis.getApis();
        apis.ifSuccess(function(data){
             //init();             
            console.log(data) 
            vm.TemlpateData=data;
            vm.emailBody = data.Body;
            vm.subject=data.Title;

            loadSettingData();
            setBody(vm.TemlpateData);
           
        });
        apis.ifError(function(data){
            //init();
        loadSettingData();
        });
        apis.getTemplate('getTemplate','T_EMAIL_EXP_NEWMAIL');

        vm.emailBody = "<html>Dear Customer, <br><br><span style='color: #e11b0c;'> Please add a template </span></html>";
        vm.emailBody = $sce.trustAsHtml( vm.emailBody)

        function loadSettingData(){

            var settingClient =  $serviceCall.setClient("getAllByQuery","setting"); // method name and service
            settingClient.ifSuccess(function(data){
                 vm.profileData = data[0].profile;
                 companyName = vm.profileData.companyName;
                 accountUrl = vm.profileData.accountUrl;
                 vm.bcc.push(vm.profileData.adminEmail);
                 //updateBody()
                 setBody(vm.TemlpateData);
            })
            settingClient.ifError(function(data){

            })          
            settingClient.postReq({
                "setting" : "profile"
            });

            vm.pdfName= "Expense No."+ $state.params.itemId.toString();
          }

        function updateBody(){
           
            vm.emailBody = vm.emailBody.toString().replace('@@companyName@@',vm.companyName);
            vm.subject = vm.subject.replace('@@expenseNo@@',vm.expenseNo);
             vm.subject = vm.subject.replace('@@companyName@@',vm.companyName);
        } 

        vm.namespace=window.location.hostname;

        function sendMail(){ 
           if(vm.sender.length){
             jsonData =  {
                 "type": "email",
                 "to" : vm.sender,
                 "subject": vm.subject,
                 "bcc": vm.bcc,
                 "from": "Expense <noreply-12thdoor@12thdoor.com>",
                 "Namespace": vm.namespace, 
                 // $setUrl.getTenantID                 
                 "TemplateID": "T_EMAIL_EXP_NEWMAIL",
                 "DefaultParams": {
                  "@@expenseNo@@": $state.params.itemId.toString(),
                  "@@accounturl@@": "",
                  "@@companyName@@": vm.companyName
                },
                 "CustomParams": {
                  "@@expenseNo@@": $state.params.itemId.toString(),
                  "@@accounturl@@": "",
                  "@@companyName@@": vm.companyName
                }
            }
            sendEmailBody();
           }
           else
           {
            vm.senderempty=true;
           }
        }


     vm.pdfChipArr = [];
     if($rootScope.pdfEnable == true){
       vm.pdfChipArr.push(expenseNo + ".pdf") 
     }



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
        client.setUrl(expenseNo + '.pdf').uniqueID("").class('accountstatement');
        client.getPath(function(data){
            callback(data);
        })
     }

    function addPDFdataToJSON()
     {
        if(vm.PDFattached)
        {
                jsonData.attachments = [{
                 "filename": expenseNo + '.pdf',
                 "path": vm.PDFpath
                }]
        }
     }

        function sendEmailBody(){
            addPDFdataToJSON();
            jsonData.to = vm.sender;
            var client = $cbsCall.setClient('notification');
            client.ifSuccess(function(result){
                var data = result.data;
                $mdDialog.hide();
                var toast = $mdToast.simple()
                  .content(data.message) 
                  .highlightAction(false)
                  .position("top right"); 
                $mdToast.show(toast).then(function () {

                });           
            })
            client.ifError(function(result){
        
            })
            client.singleMail(jsonData)
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
               
                vm.subject = vm.subject.replace("@@expenseNo@@",vm.expenseNo);
                vm.subject = vm.subject.replace("@@companyName@@",vm.companyName);
                vm.emailBody = vm.emailBody.replace("@@expenseNo@@", vm.expenseNo)
                //vm.emailBody = vm.emailBody.replace("@@accountUrl@@", "<br><a style='color:#335E8B;' href="+fullUrl+">"+vm.getUrl+"</a>")
                vm.emailBody = vm.emailBody.replace("@@companyName@@", vm.companyName);
                vm.emailBody = $sce.trustAsHtml(vm.emailBody);

                vm.PDFattached=true;
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