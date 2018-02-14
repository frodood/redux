(function ()
{
    'use strict';

    angular
        .module('app.creditnotes')
        .controller('creditPayment', creditPayment)
        .filter('positive',positive);

    /** @ngInject */
    function positive(){
        return function(input){
            input = input ? input : 0
            return input >= 0 ? true : false
        }
    }

    /** @ngInject */
    function creditPayment($scope, item, $http, $serviceCall, $mdToast, $mdDialog, $mdMedia, $state, msSpinnerService)
    { 
        var vm = this;

        console.log(item)
        vm.cancel = cancel;

        vm.checkItem = checkItem;

        vm.getPaidAmount = getPaidAmount;

        vm.submit = submit;

        vm.aAmount = 0;

        item.paidInvoice = [];
        
        vm.disableSubmit = false;

        vm.changeAmount = changeAmount;

        vm.msSpinnerService = msSpinnerService;

        vm.creAppliedSpinnerLoaded = creAppliedSpinnerLoaded;

        function creAppliedSpinnerLoaded(appliedSpinner){
            appliedSpinner.show('cre-applied-spinner');
        }

        loadInvoiceByCus(); 

        function changeAmount(){

        }
        function loadInvoiceByCus() {
            if (item.profileID == undefined) {
                vm.InvoicesDataStatus = "No outstanding invoices for selected customer.";
                vm.fullArr = [];
                return;
            }
            //lastTranDate old order by column
            vm.InvoicesDataStatus = "No outstanding invoices for selected customer.";
            var JSONinputobj = {
                where: "deleteStatus = false and profileID = '" + item.profileID + "' and (invoiceStatus = 'Unpaid' or invoiceStatus = 'Partially Paid' or invoiceStatus = 'Overdue')"
            };

            var client = $serviceCall.setClient("getAllByQuery", "invoice"); 
            client.orderby("invoiceNo");
            client.isAscending("true");

            client.ifSuccess(function(data) {
                console.log(data)
                var data = data.result;

                vm.fullArr = []; 
                vm.nAmount = item.balance 

                for (var i = 0; i <= data.length - 1; i++) {
                    if (data[i].peymentTerm !== 'multipleDueDates' ) {
                        for (var j = 0; j <= data[i].multiDueDates.length - 1; j++) {
                            if (data[i].multiDueDates[j].paymentStatus == "Unpaid" || data[i].multiDueDates[j].paymentStatus == "Partially Paid" || data[i].multiDueDates[j].paymentStatus == "Overdue") {
                                vm.fullArr.push({
                                    invono: data[i].invoiceNo,
                                    sdate: data[i].startDate,
                                    duedate: data[i].multiDueDates[j].dueDate,
                                    famount: data[i].multiDueDates[j].dueDatePrice,
                                    instalment: data[i].multiDueDates[j].balance,
                                    termtype: data[i].peymentTerm,
                                    customerid: data[i].profileID,
                                    checked: false,
                                    checkDisable: false,
                                    inputDisable: true
                                });
                            }
                        }                        
                    }
                } 

            });
            client.ifError(function(data) {

            })
            client.pattern(item.pattern);
            client.postReq(JSONinputobj);
        } 
        function cancel(){ $mdDialog.hide();}

        function checkItem(index, invo) { //outstanding invoice check box 
            // - vm.fullArr[index].instalment)
            if (vm.nAmount <= 0 && invo.checked == true) {
                invo.checked = false;
                return;
            } 

            if (invo.checked) { //if checkbox is checked
                 
                //add by dushmantha
                if (vm.nAmount <= vm.fullArr[index].instalment) {
                    vm.fullArr[index].amount = parseFloat(vm.nAmount); //(parseFloat(vm.fullArr[index].instalment) - parseFloat(vm.nAmount) ).toFixed(2);
                    getPaidAmount(vm.fullArr[index], vm.fullArr[index].amount);

                } else {
                    vm.fullArr[index].amount = parseFloat(vm.fullArr[index].instalment); 
                    getPaidAmount(vm.fullArr[index], vm.fullArr[index].amount);
                }  
                //invo.amount = 0;
                invo.inputDisable = false; 
 
                vm.nAmount = parseFloat(vm.nAmount) - parseFloat(invo.amount); // added by dushmantha
 
                item.paidInvoice.push({ //array for insert paid invoices             
                    amount: invo.instalment,
                    invono: invo.invono,
                    sdate: invo.sdate,
                    duedate: invo.duedate,
                    balance: (parseFloat(invo.instalment) - parseFloat(vm.fullArr[index].amount)),
                    termtype: invo.termtype,
                    detailID: "",
                    paidAmount: invo.amount,
                    recAmount: invo.instalment,
                    famount: invo.famount,
                    //paidAmountFromCurrentCN : (invo.paidAmountFromCurrentCN) ?  parseFloat(invo.paidAmountFromCurrentCN) +  parseFloat(vm.fullArr[index].amount) : parseFloat(vm.fullArr[index].amount);
                });
                vm.aAmount = (parseFloat(vm.aAmount) + parseFloat(invo.amount));

            } else if (!invo.checked) { 

                invo.inputDisable = true;
                reverseCheckItem();

                function reverseCheckItem() {

                    for (var i = 0; i < item.paidInvoice.length; i++) { //removing invoice details from paid invoice array
                        if (item.paidInvoice[i]['invono'] == invo.invono && item.paidInvoice[i]['duedate'] == invo.duedate) { //cheking index for praticular invoice details
                            item.paidInvoice.splice(i, 1);
                        }
                    } 
                    vm.aAmount = parseFloat(vm.aAmount) - parseFloat(invo.amount)
                    vm.nAmount = parseFloat(vm.nAmount) + parseFloat(invo.amount); 

                    getPaidAmount(invo, invo.amount);

                    invo.amount = "";
                }
            }
        }

        function getPaidAmount(obj, oldValue) { 
            debugger
            if (obj.amount == "") {
                //obj.amount = 0;
                if (oldValue != "") {
                    vm.nAmount = parseFloat(vm.nAmount) + parseFloat(oldValue);
                    vm.aAmount = (parseFloat(vm.aAmount) - parseFloat(oldValue));
                }
                oldValue = 0;
                return;
            } else if (oldValue == "") oldValue = 0;

            if (parseFloat(obj.amount) > parseFloat(obj.instalment))
                obj.amount = oldValue
            else {

                vm.aAmount = (parseFloat(vm.aAmount) - parseFloat(oldValue)) + parseFloat(obj.amount);
                
                var difference = (parseFloat(oldValue) - parseFloat(obj.amount));

                if (vm.nAmount >= 0) vm.nAmount = (parseFloat(vm.nAmount) + parseFloat(difference));
                else vm.nAmount = ((parseFloat(vm.nAmount) + parseFloat(oldValue)) - parseFloat(obj.amount))


                vm.nAmount = parseFloat(vm.nAmount);
                for (var i = 0; i < item.paidInvoice.length; i++) {
                    if ((item.paidInvoice[i]['invono'] == obj.invono) && (item.paidInvoice[i]['duedate'] == obj.duedate)) {
                        item.paidInvoice[i].balance = parseFloat(item.paidInvoice[i].amount) - parseFloat(obj.amount);
                        item.paidInvoice[i].paidAmount = parseFloat(obj.amount);
                        item.paidInvoice[i].paidAmountFromCurrentCN = parseFloat(obj.amount);
                        // vm.payment.paidInvoice[i].recAmount = (parseFloat(obj.instalment) === parseFloat(obj.famount)) ? parseFloat(obj.famount) : vm.payment.paidInvoice[i].balance;
                    }
                }
            }  
        } 

        function submit(){

            item.invoiceRefNo = [];

            for (var i = 0; i < item.paidInvoice.length; i++) {
                item.invoiceRefNo.push(item.paidInvoice[i].invono);
            }
           console.log(item.invoiceRefNo);

            item.balance = parseFloat(vm.nAmount);
            item.aAmount = parseFloat(vm.aAmount);

            vm.disableSubmit = true;

            if (item.balance > 0.00) {
                item.status = "Partially Applied";
            }else if (item.balance === 0.00) {
                item.status = "Fully Applied";
            }

            item.creditNoteLog = {
               creditNoteNo :"",
                logID :"-888",
                type :"Activity",
                description :"Credit Note added to invoices ",
                status :"",
                userName:item.profileName,
                lastTranDate:"",
                createDate: new Date(),
                modifyDate:"",
                createUser:"",
                modifyUser:""
            }
            var CNB = {"creditNote" :  item, "image" :[], "permissionType" : "edit", "appName":"CreditNotes" };
            var CNobj = JSON.stringify(CNB);
            console.log(CNobj);

            var client = $serviceCall.setClient("applyCnToInvoice", "process"); 

            client.ifSuccess(function(data) {
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('Applied a credit successfully.')
                    .position('top right' )
                    .hideDelay(3000)
                );
                vm.disableSubmit = false;
                $mdDialog.hide(); 
            });
            client.ifError(function(data) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content(data)
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                );
                vm.disableSubmit = false;
            }) 
            client.postReq(CNobj);
        }
    }
})();