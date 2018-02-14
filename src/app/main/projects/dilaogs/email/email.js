(function() {
    'use strict';
    angular
        .module('app.projects')
        .controller('projectMail', projectMail);
    /** @ngInject */
    function projectMail($scope, item, profData, cusemail, $apis, $sce,$setUrl, $cbsCall, $serviceCall, $mdToast, $mdDialog,$getPdf) {
        var vm = this;

        var mailID = 'T_EMAIL_PAY_NEWMAIL';

        vm.test = item;
        vm.cancel = cancel; 
        vm.sendMail = sendMail; 
      
        vm.PaymentGUID = "";
        vm.TemlpateData = "";

        vm.pdfCheck = false;

        console.log(cusemail)
 
        //Start Getting Template Data
        var apis = $apis.getApis();
        apis.ifSuccess(function(data) {  
            vm.TemlpateData = data;
            vm.emailBody = data.Body;
            vm.subject = data.Title;
            setBody(vm.TemlpateData);
        });
        apis.ifError(function(data) { 
        });
        apis.getTemplate('getTemplate',mailID);


        //End Getting Template Data
        function setBody(response) {
            vm.Sender = cusemail;
            vm.tempID = response.TemplateID;
            vm.subject = response.Title;
            vm.subject = vm.subject.replace("@@projectNo@@", vm.test.projectID);
            vm.subject = vm.subject.replace("@@companyName@@", profData.companyName);
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
            vm.emailBody = vm.emailBody.replace("@@projectNo@@", vm.test.projectID);
            vm.emailBody = vm.emailBody.replace("@@customerName@@", vm.test.profileName);
            vm.emailBody = vm.emailBody.replace("@@companyName@@", profData.companyName);
            vm.emailBody = $sce.trustAsHtml(vm.emailBody);
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
            client.setUrl(vm.test.projectID + '.pdf').uniqueID(vm.test.projectID).class('project');
            client.getPath(function(data) {
                emailWithPdf(data)
            })
        }

        function emailWithPdf(data) {
            jsondata.attachments = [{
                "filename": vm.test.projec + '.pdf',
                "path": data
            }]
            sendEmailBody()
        }

        function sendEmailBody() { 
            var client = $cbsCall.setClient('notification');
            client.ifSuccess(function(result) {
                var data = result.data;
                $mdDialog.hide();
                var toast = $mdToast.simple()
                    .content(data.message)
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.ifError(function(result) {})
            client.singleMail(jsondata)
        } 

        function sendMail() { 
            jsondata = {
                "type": "email",
                "to": vm.Sender,
                "subject": vm.subject,
                "bcc": vm.bcc,
                "from": "payment <noreply-12thdoor@12thdoor.com>",
                "Namespace": $setUrl.getTenantID,
                "TemplateID": mailID,
                "DefaultParams": {
                    "@@projectNo@@": vm.test.projectID.toString(),
                    "@@customerName@@": vm.test.profileName,
                    "@@companyName@@": profData.companyName
                },
                "CustomParams": {
                    "@@projectNo@@": vm.test.projectID.toString(),
                    "@@customerName@@": vm.test.profileName,
                    "@@companyName@@": profData.companyName
                }
            } 
            if (vm.pdfCheck) getUrl(); else sendEmailBody();
            
        } 
    }
})();