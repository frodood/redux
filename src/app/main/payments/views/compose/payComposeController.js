(function() {
    'use strict';

    angular
        .module('app.payments')
        .controller('payComposeController', payComposeController)
        .filter('datetime', datetime)
        .directive('mdnFocus',mdnFocus);

    /** @ngInject */
    function datetime($filter) {
        return function(input) {
             
            
            if (input == null) {
                return "";
            }

            var _date = $filter('date')(new Date(input), 'yyyy/MM/dd');
            return _date.toUpperCase();

        };
    } 



    function mdnFocus(){
         var directive = {
         restrict: 'A',
          link: function(scope, element, attributes,$timeout){
            setInterval(function(){
              angular.element(element[0].querySelector("input.md-input")).bind("focus", function(){
                setInterval(function() {
                   scope.$eval(attributes.mdnFocus);
                   scope.$apply();
                }, 100);
              });
            },0);
          }
        };

        return directive;
    }

    payComposeController.$inject = ['$scope', '$rootScope','$apis','the2checkoutService','webexService','$document', '$mdDialog', '$mdToast', '$mdMedia', '$mdSidenav', '$state', '$serviceCall', 'settingSummary', '$mdPanel', '$imageUploader', '$http', 'msSpinnerService']

    /** @ngInject */
    function payComposeController($scope, $rootScope,$apis,the2checkoutService,webexService,$document, $mdDialog, $mdToast,$mdMedia, $mdSidenav, $state, $serviceCall, settingSummary, $mdPanel, $imageUploader, $http, msSpinnerService) {

        var isoDate = new Date().toISOString(); 

        var vm = this;

        vm.toggleChildStates = toggleChildStates;

        vm.selectedItemChange = selectedItemChange;

        vm.checkItem = checkItem;

        vm.submit = submit;

        vm.onblur = onblur;

        vm.netAmount = netAmount;

        vm.paymentMethodChange = paymentMethodChange;

        vm.history = history;

        vm.getPaidAmount = getPaidAmount;

        vm.amountLostFocus = amountLostFocus;

        vm.OnRecivedAmountLostFocus = OnRecivedAmountLostFocus;

        vm.disableMethods = true;

        vm.disableRecAmnt = true; 
  
        vm.custArr = [];

        vm.setMedia = setMedia;

        vm.spinnerService = msSpinnerService;


        $rootScope.$on('selectedProfile',function(event, args){ 
            vm.selectedItem1 = args.slctdProfile; 
            selectedItemChange(vm.selectedItem1.firstName, vm.selectedItem1.profileID)
        }); 

        vm.brochureConfig = {
          restrict : "",
          size : "2MB",
          crop : false,
          type : "all",
          maxCount : 1
        }

        function setMedia(res){ 
          if(res.hasOwnProperty('all')){
            vm.imageArray = res.all;
          }
        }

        checkParams();

        function checkParams(){
            if($state.params.Data){
                if($state.params.hasOwnProperty('appName')){ 
                    //Start loading Profile
                        if($state.params.appName == "profile"){
                            vm.backState = 'app.contacts.customer'
                            
                            var client = $serviceCall.setClient("getProfileByKey","profile");
                            client.ifSuccess(function(data){ 
                                var extSlctProfile = {
                                    "display" : data.profileName,
                                    "value" : data
                                }

                                $rootScope.$broadcast('extupslctusr',extSlctProfile); 
                                
                                vm.selectedItem1 = data;
                                selectedItemChange(vm.selectedItem1.firstName, vm.selectedItem1.profileID)
                            });
                            client.ifError(function(data){

                            });
                            client.uniqueID($state.params.Data.profileId); // send projectID as url parameters
                            client.postReq();
                        } 
                }
            }
        }



        vm.payment = {
            "lastTranDate": new Date(),
            "uAmount": 0,
            "aAmount": 0,
            "paymentComment": "",
            "paidInvoice": [],
            "paymentRef": "",
            "paymentMethod": "",
            "recievedAmount": "",
            "bankCharges": "",
            "favoriteStar": "",
            "favouriteStarNo": "",
            "fullAmount": "",
            "receiptID": "",
            "paymentStatus": "Active",
            "profileID": "1",
            "profileAddress": {},
            "profileEmail": "",
            "profileName": "",
            "uploadImage": [],
            "customField": [],
            "paymentLog": {},
            "pattern": "",
            "image": [],
            "token": "",
            "type": "",
            "paymentGUID" : "",
            "paidTypes": "",
            "date": new Date()
        } //class name payment

        var userName = "Dushmantha";
        //$auth.getUserName() ? userName = $auth.getUserName() : userName = ""; 

        vm.nAmount = 0; //initially total amount is 0 (Total Available=nAmount) 
        vm.outstandingInvoices = []; //this is where all outstanding invoices r saved for praticular customer
        vm.receiveRequired = true;
        vm.selectedItem1 = null;
        vm.searchText = null;
        vm.UploadedImageCount = 0;
        vm.SelectedInvoiceCount = 0;
        vm.LastEnterdAmount = 0;
        vm.fullArr = [];
        vm.InvoicesDataStatus = "No outstanding invoices for selected customer.";
        var customerNames = [];
        vm.disableSave = false;
        vm.disableCancel = false;


        vm.payment.pattern = settingSummary[0].preference.paymentPref.paymentPrefix + settingSummary[0].preference.paymentPref.paymentSequence;
        paymentMethod(settingSummary, function() {
            paymentCustArr(settingSummary, function() {
                paymentCurrency(settingSummary, function() {
                    loadMaxPaymentNum();
                })
            });
        });

        vm.setPrf = settingSummary[0].profile;
        
        function paymentMethod(obj, callback) {
            vm.PayArr = [];
            var payMethod = obj[0].preference.paymentPref.paymentMethods;
            for (var i = 0; i <= payMethod.length - 1; i++) {
                if (payMethod[i].activate)
                    vm.PayArr.push(payMethod[i].paymentMethod);

            }
            var payMethodOnline = obj[0].payments;
            for (var i = 0; i <= payMethodOnline.length - 1; i++) {
                break; // added to remove online payment methords
                (payMethodOnline[i].activate) ? vm.PayArr.push(payMethodOnline[i].name): payMethodOnline;
            }
            callback();
        }

        function paymentCustArr(arr, callback) {
            vm.payment.customField = [];
            var fieldArr = arr[0].preference.paymentPref.cusFiel;
            for (var l = 0; l <= fieldArr.length - 1; l++) {
                vm.payment.customField.push(fieldArr[l]);
            }
            callback();
        }

        function paymentCurrency(arr, callback) {
            vm.payment.baseCurrency = arr[0].profile.baseCurrency.toUpperCase();
            callback();
        }

        function loadMaxPaymentNum() {

            var client = $serviceCall.setClient("getNextReceiptNo", "payment");

            client.ifSuccess(function(data) {
                vm.payment.paymentRef = data;
            });
            client.ifError(function(data) {
                console.log("error loading max number");
            })
            client.pattern(vm.payment.pattern);
            client.postReq();
        }  

    
 

        //------------------------------------------------------------------------------

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };

        /*function selectedItemChange(SelectedItem)
        {
           vm.payment.paymentMethod = settingSummary["0"].preference.paymentPref.paymentMethods;
        }*/

        function selectedItemChange(name, profileID) {
            if (profileID == undefined) {
                vm.InvoicesDataStatus = "No outstanding invoices for selected customer.";
                vm.fullArr = [];
                return;
            }
            //lastTranDate old order by column
            vm.InvoicesDataStatus = "Loading outstanding invoices for selected customer ...";
            var JSONinputobj = {
                where: "deleteStatus = false and profileID = '" + profileID + "'"
            };

            var client = $serviceCall.setClient("getAllByQuery", "invoice"); 
            client.orderby("invoiceNo");
            client.isAscending("true");

            client.ifSuccess(function(data) {
                console.log(data)
                var data = data.result;

                vm.outstandingInvoices = [];
                vm.payment.uAmount = 0;
                vm.nAmount = vm.payment.recievedAmount
                vm.payment.aAmount = 0;
                vm.disableRecAmnt = false; 

                for (var i = 0; i <= data.length - 1; i++) {
                    for (var j = 0; j <= data[i].multiDueDates.length - 1; j++) {
                        if ((data[i].multiDueDates[j].paymentStatus == "Unpaid" || data[i].multiDueDates[j].paymentStatus == "Partially Paid")) {
                            vm.outstandingInvoices.push({
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
                loadAdvancePaymentDetails(profileID, function() {
                    sortInvoiceArr();
                });

            });
            client.ifError(function(data) {

            })
            client.pattern(vm.payment.pattern);
            client.postReq(JSONinputobj);
        }

        function sortInvoiceArr() {
            var oneInvoiceNoArr = [];
            vm.fullArr = [];
            if (vm.outstandingInvoices.length > 0) {
                for (var i = 0; i <= vm.outstandingInvoices.length; i++) {
                    if (vm.outstandingInvoices[i + 1]) {
                        if (vm.outstandingInvoices[i].invono == vm.outstandingInvoices[i + 1].invono) {

                            oneInvoiceNoArr.push(vm.outstandingInvoices[i]);
                        } else if (vm.outstandingInvoices[i].invono != vm.outstandingInvoices[i + 1].invono) {

                            oneInvoiceNoArr.push(vm.outstandingInvoices[i]);
                            if (oneInvoiceNoArr.length > 1) {
                                oneInvoiceNoArr = oneInvoiceNoArr.sort(function(a, b) {
                                    return new Date(a.duedate) - new Date(b.duedate)
                                })
                                for (k = 0; k <= oneInvoiceNoArr.length - 1; k++) {
                                    if (k != 0) {
                                        oneInvoiceNoArr[k].checkDisable = true;
                                    }
                                }
                            }
                            vm.fullArr = vm.fullArr.concat(oneInvoiceNoArr)
                            oneInvoiceNoArr = [];
                        }
                    } else {
                        if (vm.outstandingInvoices.length != i) {
                            if (oneInvoiceNoArr.length >= 1) {
                                var sampleObj = oneInvoiceNoArr[oneInvoiceNoArr.length - 1];
                                if (sampleObj.invono == vm.outstandingInvoices[i].invono) {

                                    oneInvoiceNoArr.push(vm.outstandingInvoices[i])

                                    oneInvoiceNoArr = oneInvoiceNoArr.sort(function(a, b) {
                                        return new Date(a.duedate) - new Date(b.duedate)
                                    })

                                    for (var k = 0; k <= oneInvoiceNoArr.length - 1; k++) {
                                        if (k != 0)
                                            oneInvoiceNoArr[k].checkDisable = true;
                                    }
                                    vm.fullArr = vm.fullArr.concat(oneInvoiceNoArr)
                                    oneInvoiceNoArr = [];
                                }

                            } else {
                                vm.fullArr.push(vm.outstandingInvoices[i])
                            }
                        }
                    }
                }
            }
            if (vm.fullArr.length == 0) {
                vm.InvoicesDataStatus = "No outstanding invoices for selected customer.";
            }
        }

        function loadAdvancePaymentDetails(profileID, callback) {


            var client = $serviceCall.setClient("getUAmountByProfileID", "payment");
            client.skip("0");
            client.take("10");
            client.profileID(profileID);

            client.ifSuccess(function(data) {
                console.log(data)
                var data = data;


                if (data.length > 0) {
                    if (!data[0].uAmount) data[0].uAmount = 0;

                    vm.payment.uAmount = angular.copy(parseFloat(data[0].uAmount));
                    (vm.payment.recievedAmount) ? (vm.nAmount = parseFloat(vm.payment.recievedAmount) + vm.payment.uAmount) : (vm.nAmount = vm.payment.uAmount);


                    // if (data[0].uAmount == 0) $scope.receiveRequired = true
                    // else $scope.receiveRequired = false;
                }
                callback();
            });
            client.ifError(function(data) {

                console.log("error loading advance payment")
            })

            client.postReq();
        }

 

        function openBrochure() {
            var position = $mdPanel.newPanelPosition()
                .absolute()
                .center()
                .center();
            var animation = $mdPanel.newPanelAnimation();
            animation.withAnimation($mdPanel.animation.FADE);
            var config = {
                animation: animation,
                attachTo: angular.element(document.body),
                controller: DialogCtrl,
                controllerAs: 'vm',
                templateUrl: 'app/main/payments/dialogs/uploader/uploader.html',
                panelClass: 'dialog-uploader',
                position: position,
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: true,
                clickEscapeToClose: true,
                hasBackdrop: true
            };
            $mdPanel.open(config);
        };

        function DialogCtrl(mdPanelRef) {
            var vm = this;
            vm.closeDialog = closeDialog;
            vm.uploadItem = uploadItem;
            vm.files = [];

            function closeDialog() {
                mdPanelRef.close();
            };

            function uploadItem() {
                mdPanelRef.close().then(function(mdPanelRef) {
                    onClose(vm.files);
                });
            }

        };


        function onClose(data) {
            setUniqueCode(data);
        }

        function uniqueCode() {
            var date = new Date();
            var components = [
                date.getYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
                date.getMilliseconds()
            ];
            return components.join("");
        }

        function setUniqueCode(data) {
            if (data.length > 0) {
                vm.brochureFiles = []
                angular.forEach(data, function(obj) {
                    var extension = obj.lfFile.name.split('.').pop();
                    obj.lfFile.uniqueCode = uniqueCode() + "." + extension;
                    vm.brochureFiles.push(obj.lfFile);
                });
            }
        }



        function paymentMethodChange(name) {

            if (name === 'stripe' || name === '2checkout' ||  name === 'webxpay' ) {

                var client = $serviceCall.setClient("validateCurrency", "process");
                client.ifSuccess(function(response) {  
                    if (!response.data.availability) {
                        vm.payment.paymentMethod = "";
                        $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Error occurred in '+ name).content(response.message).ariaLabel('').ok('OK').targetEvent());
                        return false;
                    }
                });
                client.ifError(function(data) {
                    vm.payment.paymentMethod = ""
                    $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Error occurred in '+ name).content('Seems like there is a problem in the payment gateway service.please try again later').ariaLabel('').ok('OK').targetEvent());
                    return false
                })
                client.currency(vm.payment.baseCurrency)
                client.paymentMethod(name)
                client.getReq();
            }

            if (name === "stripe") {

                vm.config = {
                    publishKey: '',
                    title: '12thdoor',
                    description: "for connected business",
                    logo: 'img/add.png',
                    label: 'New Card',
                }

                var client = $serviceCall.setClient("getPaymentKeys", "setting");

                client.ifSuccess(function(data) {
                    var data = data;
                    if (data)
                        vm.publishKey = data.publishable_key.replace('\\u000', '');

                    vm.config = {
                        publishKey: vm.publishKey,
                        title: '12thdoor',
                        description: "for connected business",
                        logo: 'img/add.png',
                        label: 'New Card',
                    }

                });
                client.ifError(function(data) {})
                client.appName(name)
                client.getReq();
            }
        } 

        function cardOptions(ev, callback) {
            if (vm.payment.paymentMethod === "stripe") {
                debugger
                 
                $rootScope.$broadcast("call_stripe", ev, vm.config, function() {

                })
                $scope.$on('stripe-token-received', function(event, response) {
                    console.log(response);
                    vm.payment.token = response.id
                    console.log(response.id)
                     
                    callback();
                });

                $scope.$on('popUpClose',function(e){
                    vm.disableSave = false;
                    vm.disableCancel = false;
                    ev.stopPropagation();
                    $scope.$apply();

                })
            } else {
                callback();
            }
        }

        function amountLostFocus(index) {
             
            if (vm.fullArr[index].amount == "") {
                vm.fullArr[index].amount = 0;
            }
        }

        function checkItem(index, invo) { //outstanding invoice check box 
            // - vm.fullArr[index].instalment)
            if (vm.nAmount <= 0 && invo.checked == true) {
                invo.checked = false;
                return;
            }
            var type = 'add';

            ckClkInv();
            if (invo.checked) { //if checkbox is checked
                 
                //add by dushmantha
                if (vm.nAmount <= vm.fullArr[index].instalment) {
                    //vm.fullArr[index].instalment = parseFloat(vm.fullArr[index].instalment) - parseFloat(vm.nAmount);
                    //vm.fullArr[index].amount = vm.nAmount
                    //vm.fullArr[index].amount = (parseFloat(vm.fullArr[index].famount) - parseFloat(vm.fullArr[index].instalment)).toFixed(2);
                    vm.fullArr[index].amount = parseFloat(vm.nAmount); //(parseFloat(vm.fullArr[index].instalment) - parseFloat(vm.nAmount) ).toFixed(2);
                    getPaidAmount(vm.fullArr[index], vm.fullArr[index].amount, index,type);

                } else {
                    vm.fullArr[index].amount = parseFloat(vm.fullArr[index].instalment);
                    //vm.fullArr[index].instalment = parseFloat(vm.fullArr[index].instalment) - parseFloat(vm.fullArr[index].amount);;
                    getPaidAmount(vm.fullArr[index], vm.fullArr[index].amount, index,type);
                }
                //added by dushmantha

               
                if (vm.fullArr[index - 1]) {
                    if (vm.fullArr[index].invono == vm.fullArr[index - 1].invono) {
                        vm.fullArr[index - 1].inputDisable = true;
                    }
                }

                //invo.amount = 0;
                invo.inputDisable = false;
                //invo.amount = invo.instalment;

                //vm.nAmount = parseFloat(vm.nAmount) - parseFloat(invo.instalment); //updating total available (nAmount=totalavailable)
                vm.nAmount = parseFloat(vm.nAmount) - parseFloat(invo.amount); // added by dushmantha

                // var recAmount = (parseFloat(invo.instalment) === parseFloat(invo.amount)) ? parseFloat(invo.amount) : 0;
                vm.payment.paidInvoice.push({ //array for insert paid invoices             
                    amount: invo.instalment,
                    invono: invo.invono,
                    sdate: invo.sdate,
                    duedate: invo.duedate,
                    balance: (parseFloat(invo.instalment) - parseFloat(vm.fullArr[index].amount)),
                    termtype: invo.termtype,
                    detailID: "",
                    paidAmount: invo.amount,
                    recAmount: invo.instalment,
                    famount: invo.famount
                });
                vm.payment.aAmount = (parseFloat(vm.payment.aAmount) + parseFloat(invo.amount));

            } else if (!invo.checked) { //if checkbox is unchecked

                //added by dushmantha
                /*vm.fullArr[index].instalment = parseFloat(vm.fullArr[index].instalment) + parseFloat(vm.fullArr[index].amount);
                getPaidAmount(vm.fullArr[index], vm.fullArr[index].amount,index);*/
                //aded by dushmantha

                for (var o = index; o <= vm.fullArr.length - 1; o++) {
                    if (vm.fullArr[o - 1]) {
                        if (vm.fullArr[o].invono == vm.fullArr[o - 1].invono) {
                            vm.fullArr[o - 1].inputDisable = false;
                            vm.fullArr[o].inputDisable = true;
                            break;
                        } else {
                            vm.fullArr[o].inputDisable = true;
                            break;
                        }
                    } else {
                        vm.fullArr[o].inputDisable = true;
                        break;
                    }
                }
                for (var o = index; o <= vm.fullArr.length - 1; o++) {

                    if (vm.fullArr[o + 1]) {
                        if (vm.fullArr[o].invono == vm.fullArr[o + 1].invono) {
                            if (vm.fullArr[o + 1].checked) {
                                vm.fullArr[o + 1].checked = false;
                                vm.fullArr[o + 1].checkDisable = true;
                                vm.fullArr[o + 1].inputDisable = true;
                                reverseCheckItem(o);
                            } else {
                                reverseCheckItem(o);
                                vm.fullArr[o + 1].checkDisable = true;
                                break;
                            }

                        } else if (vm.fullArr[o].invono != vm.fullArr[o + 1].invono) {
                            reverseCheckItem(o);
                            break;
                        }
                    } else {
                        reverseCheckItem(o);
                        break;
                    }
                }
                console.log(vm.nAmount)

                function reverseCheckItem(o) {
                    var type = 'remove';

                    for (var i = 0; i < vm.payment.paidInvoice.length; i++) { //removing invoice details from paid invoice array
                        if (vm.payment.paidInvoice[i]['invono'] == vm.fullArr[o].invono && vm.payment.paidInvoice[i]['duedate'] == vm.fullArr[o].duedate) { //cheking index for praticular invoice details
                            vm.payment.paidInvoice.splice(i, 1);
                        }
                    }
                    if (vm.fullArr[o].termtype != "multipleDueDates") {
                        vm.payment.aAmount = parseFloat(vm.payment.aAmount) - parseFloat(vm.fullArr[o].amount)
                        vm.nAmount = parseFloat(vm.nAmount) + parseFloat(vm.fullArr[o].amount);

                        //aded by dushmantha
                        //vm.fullArr[o].instalment = parseFloat(vm.fullArr[o].instalment) + parseFloat(vm.fullArr[o].amount);
                        getPaidAmount(vm.fullArr[o], vm.fullArr[o].amount, o,type);
                        //aded by dushmantha

                    } else if (vm.fullArr[o].termtype == "multipleDueDates") {
                        vm.payment.aAmount = parseFloat(vm.payment.aAmount) - parseFloat(vm.fullArr[o].amount)
                        vm.nAmount = parseFloat(vm.nAmount) + parseFloat(vm.fullArr[o].amount);

                        //aded by dushmantha
                        //vm.fullArr[o].instalment = parseFloat(vm.fullArr[o].instalment) + parseFloat(vm.fullArr[o].amount);
                        getPaidAmount(vm.fullArr[o], vm.fullArr[o].amount, o,type);
                        //aded by dushmantha

                    }
                    vm.fullArr[o].amount = "";
                }
            }
        }

        function getPaidAmount(obj, oldValue, index,type) {
             
            if (obj.amount == "") {
                //obj.amount = 0;
                if (oldValue != "") {
                    vm.nAmount = parseFloat(vm.nAmount) + parseFloat(oldValue);
                    vm.payment.aAmount = (parseFloat(vm.payment.aAmount) - parseFloat(oldValue));
                }
                oldValue = 0;
                return;
            } else if (oldValue == "") oldValue = 0;

            if (parseFloat(obj.amount) > parseFloat(obj.instalment))
                obj.amount = oldValue
            else {

                vm.payment.aAmount = (parseFloat(vm.payment.aAmount) - parseFloat(oldValue)) + parseFloat(obj.amount);
                var difference = (parseFloat(oldValue) - parseFloat(obj.amount));

                if (vm.nAmount >= 0) vm.nAmount = (parseFloat(vm.nAmount) + parseFloat(difference));
                else vm.nAmount = ((parseFloat(vm.nAmount) + parseFloat(oldValue)) - parseFloat(obj.amount));

                vm.nAmount = parseFloat(vm.nAmount);
                for (var i = 0; i < vm.payment.paidInvoice.length; i++) {
                    if ((vm.payment.paidInvoice[i]['invono'] == obj.invono) && (vm.payment.paidInvoice[i]['duedate'] == obj.duedate)) {
                        vm.payment.paidInvoice[i].balance = parseFloat(vm.payment.paidInvoice[i].amount) - parseFloat(obj.amount);
                        vm.payment.paidInvoice[i].paidAmount = parseFloat(obj.amount);
                        // vm.payment.paidInvoice[i].recAmount = (parseFloat(obj.instalment) === parseFloat(obj.famount)) ? parseFloat(obj.famount) : vm.payment.paidInvoice[i].balance;
                    }
                }
            } 
            if (type === 'add') {
                if(parseFloat(obj.amount) == parseFloat(obj.instalment)){
                    if (vm.fullArr[index + 1]) {
                        vm.fullArr[index + 1].checkDisable = false;
                    }
                }else{
                    if (vm.fullArr[index + 1]) {                
                        if (vm.fullArr[index].invono == vm.fullArr[index + 1].invono) {
                            vm.fullArr[index + 1].checkDisable = true;
                        }
                    }
                } 
            }
        }


        function ckClkInv() {
            var i = vm.fullArr.length;
            while (i--) {
                if (vm.fullArr[i].checked) {
                    vm.receiveRequired = false;
                    break
                } else vm.receiveRequired = true;
            }
        }

        function OnRecivedAmountLostFocus() {
            //added by dushmantha
           
            if (parseFloat(vm.payment.recievedAmount) > 0.0) {
                vm.disableMethods = false;
            }else{
                 vm.disableMethods = true;
                 vm.payment.paymentMethod = "";
            }
            if ((vm.payment.recievedAmount) < (vm.payment.aAmount - vm.payment.uAmount)) { 
                // vm.payment.recievedAmount = (parseFloat(vm.payment.aAmount) - parseFloat(vm.payment.uAmount)).toFixed(2); //vm.LastEnterdAmount;
                netAmount();
                return;
            }
            vm.LastEnterdAmount = vm.payment.recievedAmount;
            //added by dushmantha
        }

        function netAmount() { 
            if (vm.payment.recievedAmount == "" || parseFloat(vm.payment.recievedAmount) < 0.0) {
                vm.nAmount =  parseFloat(vm.payment.uAmount) - parseFloat(vm.payment.aAmount);
                return false;
            }
            if (parseFloat(vm.payment.aAmount) != 0) {
                if (vm.payment.recievedAmount) {
                    vm.nAmount =  parseFloat(vm.payment.recievedAmount) - parseFloat(vm.payment.aAmount);
                } else {
                    vm.nAmount = parseFloat(vm.payment.aAmount);
                }
            } else {
                if (vm.payment.recievedAmount) {
                    vm.nAmount = parseFloat(vm.payment.recievedAmount);
                } else {
                    vm.nAmount = parseFloat(vm.payment.uAmount)
                }
            }
        }

        function submit(ev) { 
            vm.disableSave = true;
            vm.disableCancel = true;

            vm.paymentAmount = parseFloat(vm.nAmount).toFixed(vm.setPrf.decimalPlaces);

            if (vm.selectedItem1 == null) {
                vm.disableSave = false;
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Alert').content('Select a customer').ariaLabel('').ok('OK').targetEvent());
               
            }
            if (!vm.payment.paymentMethod) {
                if (!vm.payment.recievedAmount || parseFloat(vm.payment.recievedAmount) <= 0.0) { 
                    savePayment(ev);
                }else{
                    vm.disableSave = false; 
                    $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Alert').content('Select payment method').ariaLabel('').ok('OK').targetEvent());
                   
                }
            } else 
                savePayment(ev);
        }

        function savePayment(ev){ 
            vm.payment.favoriteStar = false;
            vm.payment.favouriteStarNo = 1;
            vm.payment.paymentStatus = "Active"; 
            vm.payment.profileID = vm.selectedItem1.profileID;
            vm.payment.profileAddress = vm.selectedItem1.cusAddress;
            vm.payment.profileEmail = vm.selectedItem1.email;
            vm.payment.profileName = vm.selectedItem1.profileName; 
            vm.payment.uploadImage = [];
 
            if (!vm.payment.recievedAmount || vm.payment.recievedAmount === "")
                vm.payment.paidTypes = "advance";
            else
                vm.payment.paidTypes = "normal";

            vm.payment.paymentLog = {
                userName: userName,
                lastTranDate: new Date(),
                createDate: new Date(),
                modifyDate: new Date(),
                createUser: "",
                modifyUser: "",
                UIHeight: '30px;',
                type: "activity",
                description: "payment added by " + userName,
                status: "Active",
                logID: ""
            };

            if (parseFloat(vm.nAmount) == 0) {
                vm.payment.currentUamount = 0;

                if (!vm.payment.recievedAmount || vm.payment.recievedAmount === "") {
                    vm.payment.uAmount =  vm.nAmount;
                }else{
                    vm.payment.uAmount = parseFloat(vm.payment.uAmount) +  vm.nAmount;
                }

                cardOptions(ev, function() {
                    uploadImage(function() {
                        sampleUniqueCode();
                    })
                })

            } else if (parseFloat(vm.nAmount) > 0) {
    
                var confirm = $mdDialog.confirm()
                    .title('Unapplied advances')
                    .content('Unapplied advances of ' + vm.payment.baseCurrency + ' ' + vm.paymentAmount + ' can be applied on future invoices.')
                    .ariaLabel('Lucky day')
                    .targetEvent()
                    .ok('OK')
                    .cancel('Cancel');
                $mdDialog.show(confirm).then(function() {
                    vm.payment.currentUamount = vm.nAmount; 

                    if (!vm.payment.recievedAmount || vm.payment.recievedAmount === "") {
                        vm.payment.uAmount =  vm.nAmount;
                        vm.payment.currentUamount = 0;
                    }else{
                        vm.payment.uAmount = parseFloat(vm.payment.uAmount) +  vm.nAmount;
                    }

                    cardOptions(ev, function() {
                        uploadImage(function() {
                            sampleUniqueCode();
                        })
                    })
                }, function() {
                    vm.disableSave = false;
                    $mdDialog.hide(); 
                });
            } else if (parseFloat(vm.nAmount) < 0) {
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Warning').content('Total payments applied exceeds the total available').ariaLabel('').ok('OK').targetEvent());
                vm.disableSave = false;
            }
        }

        function savePaymentToObjectstore() { 

            vm.spinnerService.show('pay-compose-spinner');

            var paymentObj = {
                "payment": vm.payment,
                "image": vm.payment.image,
                "appName": "Payments",
                "permissionType": "add"
            }

            //var jsonString = JSON.stringify(paymentObj);

            //Start POSTing payment data
            if(vm.payment.paymentMethod === "2checkout"){
                checkout(paymentObj);
                return false;
            }
            else if (vm.payment.paymentMethod === "webxpay") {
                webxPayment(paymentObj);
                return false;
            }

            var client = $serviceCall.setClient("makePayment", "process");

            client.ifSuccess(function(data) {
                vm.disableSave = true;
                vm.disableCancel = true;
                if (data.isSuccess) { 
                    $state.go('app.payments.pay.detail', {
                        'itemID': data.ID,
                        'email' : true
                    });
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Payment '+data.ID+' successfully applied')
                        .position('top right' )
                        .hideDelay(3000)
                    );
                    vm.spinnerService.hide('pay-compose-spinner');

                } else {
                    vm.spinnerService.hide('pay-compose-spinner');
                    if(data.response){
                        $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Payment Failed').content(data.response).ariaLabel('').ok('OK').targetEvent());
                    }
                    else{
                        $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Payment Failed').content('Stripe payment failed').ariaLabel('').ok('OK').targetEvent());
                    }
                    
                }

            });
            client.ifError(function(data) {
                vm.spinnerService.hide('pay-compose-spinner');
                vm.disableSave = false;
                vm.disableCancel = false;
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('error occurred ').content(data.customMessage).ariaLabel('').ok('OK').targetEvent());
            })
            client.postReq(paymentObj);
            //End POSTing payment data
        }

        function checkout(paymentObj){ 
            var apis = $apis.getApis();
            var client = $serviceCall.setClient("connectedGateways", "setting");
            client.ifSuccess(function(data) {  
                if (data.data.length != 0) {
                    for (var i = 0; data.data.length > i; i++) {
                        console.log(data.data[i].gateway);
                        if (data.data[i].gateway == "2checkout") {

                            var dataObj = {
                                "sid": data.data[i].accessKey,
                                "customtokens":{},
                                "url": "/services/duosoftware.process.service/process/makePayment",
                                sectrityToken: apis.getToken(),
                                currency_code: 'USD',
                                return_url: $apis.getHost() + "/shell/#/payments/pay/token/" + vm.payment.paymentGUID,
                                li_0_price: vm.payment.recievedAmount,
                                domain: $apis.getHost(),
                                orderId: vm.payment.paymentRef,
                                custompara: paymentObj
                            };
                            the2checkoutService.do2checkoutPayment(dataObj);
                        }
                    }
                } else { 
                    console.log("There was an error, No registered gateways", "error");
                }
            });
            client.ifError(function(data) { 
                console.log("There was an error, when connected Gateways", "error");
            });
            client.getReq(); 
        }

        function webxPayment(paymentObj){debugger;
            var apis = $apis.getApis();
            //changeCurrency
            var webxpayFactoryData = {
                "secret_key": "",
                "process_currency": vm.payment.baseCurrency,
                "profileID": vm.payment.profileID,
                "amount": vm.payment.recievedAmount,
                "domain": $apis.getHost(),
                "orderId": vm.payment.paymentRef,
                "custom_fields": ""
            };

            var client = $serviceCall.setClient("connectedGateways", "setting");
            client.ifSuccess(function(data) { 
                 if (data.data.length != 0) {
                     for (var i = 0; data.data.length > i; i++) {
                         if (data.data[i].gateway == "webxpay") { //$helpers.getCookie("securityToken")

                            webxpayFactoryData.secret_key = data.data[i].accessKey; 

                            var ObjcustomPara = {
                                "PaymentData": paymentObj,
                                "customtokens": {},
                                "return_url": $apis.getHost() + "/shell/#/payments/pay/token/" + vm.payment.paymentGUID,
                                "savePayment_url": "/services/duosoftware.process.service/process/makePayment"
                            };

                            var result = webexService.SaveTempData(function(SaveTempDataResponse) {

                                if (SaveTempDataResponse.ID != undefined || SaveTempDataResponse.ID != "") {
                                     webxpayFactoryData.custom_fields = SaveTempDataResponse.ID + "|" + apis.getToken(); //apis.getToken() shuld change
                                     webexService.doWebexPayment(webxpayFactoryData);
                                } else {
                                     $mdDialog.show(
                                         $mdDialog.alert()
                                         .parent(angular.element(document.body))
                                         .content('')
                                         .ariaLabel('There was an error, when saving data')
                                         .ok('OK')
                                         .targetEvent()
                                     );
                                }

                            }, ObjcustomPara);
                         }
                     }
                 } else {
                     vm.disablePayment = false;
                     console.log("There was an error, No registered gateways", "error");
                 }

            });

            client.ifError(function(data) {
                 vm.disablePayment = false;
                 console.log("There was an error, when connected Gateways", "error");
            })
            client.getReq();

        }
        function sampleUniqueCode(){
            var client =  $serviceCall.setClient("generateGUID","process");
            client.ifSuccess(function(data){ 
                vm.payment.paymentGUID = data;
                savePaymentToObjectstore()
            });
            client.ifError(function(data){
               console.log("error retreving the GUID")
            })
            client.getReq(); 
        }

        function onblur(ev) {
            $(ev.target).css("color", "black");
        }

        function uploadImage(callback) { 
            if(vm.imageArray != undefined){

                if (vm.imageArray.length > 0) { 
                    var client = $imageUploader.setImage(vm.imageArray[0].uniqueCode,'payment');
                    
                    client.ifSuccess(function(data){
                             
                            vm.payment.image.push({
                                ID: "",
                                name: vm.imageArray[0].name,
                                size: vm.imageArray[0].size,
                                uniqueCode: vm.imageArray[0].uniqueCode,
                                appGuid: "",
                                appName: "PAYMENT",
                                date: new Date(),
                                createUser: "",
                                type: "image"
                            }) 
                            callback();
                        });
                    client.ifError(function(data){                         
                        callback();
                    });
                    client.sendImage(vm.imageArray[0]);
                         
                }else
                    callback();
            }else
                callback();
        }

        vm.history = function(item) {
            $mdDialog.show({
                templateUrl: 'app/main/payments/dialogs/history/sampleDialogBox.html',
                controller: paymentHistory,
                controllerAs: 'vm',
                locals: {
                    obj: item
                }
            })
        }

        function paymentHistory($scope, obj, $mdDialog) {
            var vm = this;
            vm.moveToPayment = moveToPayment;
            vm.close = close;

            function moveToPayment(item) {
                $state.go('app.payments.pay', {
                    'paymentid': item.receiptID
                })
                $mdDialog.hide()
            }

            function close() {
                $mdDialog.hide();
            }
            vm.invoiceHistory = [];



            var JSONobj = {
                "where": "profileID = '" + obj.customerid + "' and paymentStatus <> 'Cancel'"
            };


            var client = $serviceCall.setClient("getAllByQuery", "payment");
            client.skip("0");
            client.take("100");
            client.orderby("");
            client.isAscending("true");

            client.ifSuccess(function(data) {
                 
                var data = data.result;
                if (data.length > 0) {
                    for (var i = 0; i <= data.length - 1; i++) {
                        vm.invoiceHistory.push({
                            lastTranDate: data[i].lastTranDate,
                            receiptID: data[i].receiptID,
                            paymentMethod: data[i].paymentMethod,
                            aAmount: data[i].aAmount,
                            paymentComment: data[i].paymentComment
                        });
                    }
                }

            });
            client.ifError(function(data) {

            })

            client.postReq(JSONobj);
        }




    }
})();