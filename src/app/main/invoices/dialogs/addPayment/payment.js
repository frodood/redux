(function() {
    'use strict';

    angular
        .module('app.invoices')
        .controller('InvoicePaymentCtrl', InvoicePaymentCtrl);

    /** @ngInject */
    function InvoicePaymentCtrl($scope, item, settings, balanceDue, UnappliedAdvances, changeCurrency, $http, $rootScope, InvoiceService, the2checkoutService,webexService, $auth, $serviceCall, invoiceMultipleDueDatesService, $mdToast, $document, $mdDialog, $mdMedia, $state, $apis) {
      
        var vm = this;
        vm.cancel = cancel;
        var invDetails = item; 
        vm.exchangeRate = item.exchangeRate;
        vm.changeCurrency = changeCurrency;
        vm.dueAmount = balanceDue;
        vm.UnappliedAdvances = UnappliedAdvances
        vm.loadSettings = loadSettings;
        vm.assignSettigsData = assignSettigsData;
        vm.AmountChanged = AmountChanged;
        vm.payment = {}
        vm.payment.createDate = new Date();
        vm.showZeroAmountValidation = false;

        vm.paymentTypes = [];

        vm.disablePayment = true;
        vm.showpartialMsg = false;
        //var LoginName = $auth.getSession().Name;
        vm.payment = {
            "lastTranDate": new Date(),
            "uAmount": "",
            "aAmount": "",
            "invoiceNo": invDetails.invoiceNo,
            "paymentComment": "",
            "paymentRef": "",
            "paymentMethod": "",
            "recievedAmount": "",
            "bankCharges": "",
            "favoriteStar": false,
            "favouriteStarNo": 1,
            "fullAmount": "",
            "receiptID": "",
            "paymentStatus": "active",
            "profileID": invDetails.profileID,
            "profileAddress": invDetails.billingAddress,
            "profileEmail": invDetails.email,
            "profileName": invDetails.profileName,
            "uploadImage": [],
            "customField": [],
            "pattern": "",
            "baseCurrency": "",
            "createDate": new Date(),
            "token": "",
            "currentUamount": 0,
            "isCurrencyChanged" : invDetails.isCurrencyChanged,
            "changedCurrency":invDetails.changedCurrency,
            "exchangeRate" : invDetails.exchangeRate
        }

        vm.checkpayments = [];


        /*vm.paymentTypes.push({
                paymentmethod: '-',
                paymentType: 'offline',
                activate: "Active"
        })*/


        if (item.paymentMethod == "") {

        } else {
            vm.payment.paymentMethod = item.paymentMethod;
        }

        loadSettings();

        function loadSettings() {
            assignSettigsData(settings);
            /*var settings = $serviceCall.setClient("getAllByQuery","setting");
            settings.ifSuccess(function(data){
               assignSettigsData(data);
            });
            settings.ifError(function(data){

            });
            settings.postReq({"setting":"profile,payments","preference":"paymentPref,invoicePref"})*/
        }

        function assignSettigsData(val) {
            vm.payment.baseCurrency = val[0].profile.baseCurrency.toLowerCase();
            vm.payment.pattern = val[0].preference.paymentPref.paymentPrefix + val[0].preference.paymentPref.paymentSequence;
            vm.allowPatialPay = val[0].preference.invoicePref.allowPartialPayments;
            if (val[0].preference.paymentPref.paymentMethods.length >= 1) {
                for (var x = val[0].preference.paymentPref.paymentMethods.length - 1; x >= 0; x--) {
                    if (val[0].preference.paymentPref.paymentMethods[x].activate == true) {
                        filterPaymentMethords(val, x, val[0].preference.paymentPref.paymentMethods[x].paymentType, true);
                    }
                };
            }
            for (var y = val[0].payments.length - 1; y >= 0; y--) {
                if (val[0].payments[y].activate == true) {
                    vm.checkpayments = val[0].payments;
                    filterPaymentMethords(val, y, val[0].payments[y].paymentType, false);
                }
            };

        }

        function filterPaymentMethords(val, index, paymentType, isFromPaymentPref) { debugger;
            if (item.paymentMethod == "" || item.paymentMethod == "Allow online and offline") {
                if (isFromPaymentPref == true) {
                    vm.paymentTypes.push({
                        paymentmethod: val[0].preference.paymentPref.paymentMethods[index].paymentMethod,
                        paymentType: val[0].preference.paymentPref.paymentMethods[index].paymentType,
                        activate: val[0].preference.paymentPref.paymentMethods[index].activate
                    });
                } else { return; //returned for removing online payment methords for apps
                    vm.paymentTypes.push({
                        paymentmethod: val[0].payments[index].name,
                        paymentType: val[0].payments[index].paymentType,
                        activate: val[0].payments[index].activate
                    });
                }
            } else if (item.paymentMethod == "Offline Payments Only" && paymentType == "Offline") {
                if (isFromPaymentPref == true) {
                    vm.paymentTypes.push({
                        paymentmethod: val[0].preference.paymentPref.paymentMethods[index].paymentMethod,
                        paymentType: val[0].preference.paymentPref.paymentMethods[index].paymentType,
                        activate: val[0].preference.paymentPref.paymentMethods[index].activate
                    });
                } else { return; //returned for removing online payment methords for apps
                    vm.paymentTypes.push({
                        paymentmethod: val[0].payments[index].name,
                        paymentType: val[0].payments[index].paymentType,
                        activate: val[0].payments[index].activate
                    });
                }
            } else if (item.paymentMethod == "All Online Payment Options" && paymentType == "online") {
                if (isFromPaymentPref == true) {
                    vm.paymentTypes.push({
                        paymentmethod: val[0].preference.paymentPref.paymentMethods[index].paymentMethod,
                        paymentType: val[0].preference.paymentPref.paymentMethods[index].paymentType,
                        activate: val[0].preference.paymentPref.paymentMethods[index].activate
                    });
                } else { return; //returned for removing online payment methords for apps
                    vm.paymentTypes.push({
                        paymentmethod: val[0].payments[index].name,
                        paymentType: val[0].payments[index].paymentType,
                        activate: val[0].payments[index].activate
                    });
                }
            } else {
                if (isFromPaymentPref == true) {
                    vm.paymentTypes.push({
                        paymentmethod: val[0].preference.paymentPref.paymentMethods[index].paymentMethod,
                        paymentType: val[0].preference.paymentPref.paymentMethods[index].paymentType,
                        activate: val[0].preference.paymentPref.paymentMethods[index].activate
                    });
                } else { return; //returned for removing online payment methords for apps
                    vm.paymentTypes.push({
                        paymentmethod: val[0].payments[index].name,
                        paymentType: val[0].payments[index].paymentType,
                        activate: val[0].payments[index].activate
                    });
                }
            }
        }

        function cancel() {
            $mdDialog.cancel();
        }

        vm.maxDate = new Date();

        vm.payment.paymentLog = {
            userName: "",
            lastTranDate: new Date(),
            createDate: new Date(),
            modifyDate: "",
            createUser: "",
            modifyUser: "",
            UIHeight: "30px;",
            type: "activity",
            description: "payment added by" + "",
            status: "Active",
            logID: ""
        }


        vm.getPayment = getPayment;
        vm.confirmOk = confirmOk;

        function getPayment(obj) {
            vm.currencyValMsg = '';
            vm.currencyValidate = false;

            if (obj === 'stripe' || obj === '2checkout') {

                var client = $serviceCall.setClient("validateCurrency", "process");
                client.ifSuccess(function(response) {  
                    if (!response.data.availability) {
                        vm.payment.paymentMethod = ""; 
                        vm.currencyValMsg = response.message;
                        vm.currencyValidate = true; 
                        return false;
                    }
                });
                client.ifError(function(response) {
                    vm.payment.paymentMethod = ""
                    vm.currencyValMsg = 'Seems like there is a problem in the payment gateway service.please try again later';
                    vm.currencyValidate = true; 
                    return false
                })
                client.currency(vm.changeCurrency);
                client.paymentMethod(obj);
                client.getReq();
            }

            if (obj == "stripe") {
                var payment = $serviceCall.setClient("getPaymentKeys", "setting");
                payment.ifSuccess(function(data) {
                    var data = data;
                    if (data)
                        vm.publishKey = data.publishable_key.replace('\\u000', '');
                    console.log(vm.publishKey)
                    vm.config = {
                        publishKey: vm.publishKey,
                        title: '12thdoor',
                        description: "for connected business",
                        logo: 'img/small-logo.png',
                        label: 'New Card',
                    }
                });
                payment.ifError(function(data) {

                });
                payment.appName(obj);
                payment.getReq();
            }
            //start validating payment button and enable it
            AmountChanged();
            //end validating payment button and enable it
        }

        function confirmOk(ev, val) {

            //check amoun or unapplied payment is there
            if (vm.payment.recievedAmount == "") {
                vm.payment.recievedAmount = 0;
            }
            if (parseFloat(vm.payment.recievedAmount) <= 0) {
                vm.showZeroAmountValidation = true;
                return false;
            }

            if (vm.allowPatialPay == true) { debugger;
                if (val.paymentMethod == "" || val.paymentMethod == undefined || val.paymentMethod == "Allow online and offline") {

                } else if (val.paymentMethod == "stripe") {

                    if (vm.config == undefined) {
                        vm.getPayment("stripe");
                    }

                    $rootScope.$broadcast("call_stripe", ev, vm.config, function() {

                    })
                    $scope.$on('stripe-token-received', function(event, response) {
                        console.log(response);
                        vm.payment.token = response.id
                        console.log(response.id)


                        dopayment();
                    });

                } else if (val.paymentMethod == "2checkout") {
                    vm.disablePayment = true;

                    var apis = $apis.getApis();

                    var client = $serviceCall.setClient("connectedGateways", "setting");
                    client.ifSuccess(function(data) {
                        debugger;
                        //data = {"status":true,"data":[{"status":"1","accessKey":"901348563","gateway":"2checkout"}]};
                        console.log(data);
                        if (data.data.length != 0) {
                            for (var i = 0; data.data.length > i; i++) {
                                console.log(data.data[i].gateway);
                                if (data.data[i].gateway == "2checkout") { //$helpers.getCookie("securityToken")
                                    var ObjcustomPara = {
                                        "payment": vm.payment,
                                        "permissionType": "add",
                                        "appName": "Payments"
                                    };
                                    var data = {
                                        "sid": data.data[i].accessKey,
                                        "customtokens":{},
                                        "url": "/services/duosoftware.process.service/process/singlePayment",
                                        sectrityToken: apis.getToken(),
                                        currency_code: vm.changeCurrency,
                                        return_url: $apis.getHost() + "/shell/#/invoices/inv/" + invDetails.invoiceNo,
                                        li_0_price: vm.payment.recievedAmount,
                                        domain: $apis.getHost(),
                                        orderId: invDetails.invoiceNo,
                                        custompara: ObjcustomPara
                                    };

                                    the2checkoutService.do2checkoutPayment(data);
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

                }else if(val.paymentMethod == "webxpay")
                {debugger;
                    var ObjcustomPara = {
                                        "payment": vm.payment,
                                        "permissionType": "add",
                                        "appName": "Payments"
                                    };
                    
                        debugger;
                        vm.disablePayment = true;

                        var apis = $apis.getApis();

                        var webxpayFactoryData = {
                                        "secret_key": "",
                                        "process_currency" : vm.changeCurrency,
                                        "profileID" : invDetails.profileID,
                                        amount: vm.payment.recievedAmount,
                                        domain: $apis.getHost(),
                                        orderId: invDetails.invoiceNo,
                                        custom_fields: ""
                                    };

                        var client = $serviceCall.setClient("connectedGateways", "setting");
                        client.ifSuccess(function(data) {
                            debugger;
                            if (data.data.length != 0) {
                                for (var i = 0; data.data.length > i; i++) {
                                    if (data.data[i].gateway == "webxpay") { //$helpers.getCookie("securityToken")
                                        
                                        webxpayFactoryData.secret_key = data.data[i].accessKey;

                                        var PaymentData = {
                                                "payment": vm.payment,
                                                "permissionType": "add",
                                                "appName": "Payments"
                                            };

                                        var ObjcustomPara = {
                                            "PaymentData": PaymentData,
                                            "customtokens": {},
                                            "return_url": $apis.getHost() + "/shell/#/invoices/inv/" + invDetails.invoiceNo,
                                            "savePayment_url" : "/services/duosoftware.process.service/process/singlePayment"
                                        };

                                            var result = webexService.SaveTempData(function(SaveTempDataResponse) {
                                                
                                                if(SaveTempDataResponse.ID != undefined || SaveTempDataResponse.ID != "")
                                                {
                                                    webxpayFactoryData.custom_fields = SaveTempDataResponse.ID + "|"+ apis.getToken(); //apis.getToken() // "6d903d1a163ff0c90aa48558037121bb"shuld change
                                                    webexService.doWebexPayment(webxpayFactoryData);
                                                }
                                                else
                                                {
                                                    $mdDialog.show(
                                                    $mdDialog.alert()
                                                    .parent(angular.element(document.body))
                                                    .content('')
                                                    .ariaLabel('There was an error, when saving data')
                                                    .ok('OK')
                                                    .targetEvent()
                                                    );
                                                }
                                                
                                            },ObjcustomPara);
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
                    
                    return;
                    
                }else {
                    dopayment();
                }

            } else {
                if (invDetails.netAmount == vm.payment.recievedAmount) {
                    if (val.paymentMethod == "" || val.paymentMethod == undefined) {

                    } else if (val.paymentMethod == "stripe") {


                        $rootScope.$broadcast("call_stripe", ev, vm.config, function() {

                        })
                        //it was vm befor i replase by $scope "vm.$on"
                        $scope.$on('stripe-token-received', function(event, response) {
                            console.log(response);
                            vm.payment.token = response.id
                            console.log(response.id)


                            dopayment();
                        });

                    } else if (val.paymentMethod == "2checkout") {
                        vm.disablePayment = true;

                        var apis = $apis.getApis();

                        var client = $serviceCall.setClient("connectedGateways", "setting");
                        client.ifSuccess(function(data) {
                            debugger;
                            //data = {"status":true,"data":[{"status":"1","accessKey":"901348563","gateway":"2checkout"}]};
                            console.log(data);
                            if (data.data.length != 0) {
                                for (var i = 0; data.data.length > i; i++) {
                                    console.log(data.data[i].gateway);
                                    if (data.data[i].gateway == "2checkout") { //$helpers.getCookie("securityToken")
                                        var ObjcustomPara = {
                                            "payment": vm.payment,
                                            "permissionType": "add",
                                            "appName": "Payments"
                                        };
                                        var data = {
                                            "sid": data.data[i].accessKey,
                                            "customtokens":{},
                                            "url": "/services/duosoftware.process.service/process/singlePayment",
                                            sectrityToken: apis.getToken(),
                                            currency_code: vm.changeCurrency,
                                            return_url: $apis.getHost() + "/shell/#/invoices/inv/" + invDetails.invoiceNo,
                                            li_0_price: vm.payment.recievedAmount,
                                            domain: $apis.getHost(),
                                            orderId: invDetails.invoiceNo,
                                            custompara: ObjcustomPara
                                        };


                                        the2checkoutService.do2checkoutPayment(data);
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

                    } else {
                        dopayment();
                    }
                } else {
                    vm.showpartialMsg = true;
                }
            }
        }
        //========================================================================
        function AmountChanged() {
            
            if (vm.allowPatialPay == false) {
                if (parseFloat(vm.payment.recievedAmount) == parseFloat(vm.dueAmount)) {
                    if(vm.payment.paymentMethod != "" && vm.payment.paymentMethod != undefined && vm.payment.paymentMethod != "Allow online and offline" && vm.payment.paymentMethod != "All Online Payment Options" && vm.payment.paymentMethod != "Offline Payments Only"){
                    vm.disablePayment = false;
                    }
                } else {
                    vm.disablePayment = true;
                }
            } else {

                if (parseFloat(vm.payment.recievedAmount) <= parseFloat(vm.dueAmount)) {
                    if(vm.payment.paymentMethod != "" && vm.payment.paymentMethod != undefined && vm.payment.paymentMethod != "Allow online and offline" && vm.payment.paymentMethod != "All Online Payment Options" && vm.payment.paymentMethod != "Offline Payments Only"){
                    vm.disablePayment = false;
                    }
                } else {
                    vm.disablePayment = true;
                }
            }
        }
        //========================================================================
        function refreshActivity() {
            $rootScope.$broadcast('rfrshAcH', {
                data: 'doupdate'
            });
        }
        //========================================================================
        function dopayment() {

            vm.disablePayment = true;
            vm.pay = {
                "payment": vm.payment,
                "permissionType": "add",
                "appName": "Payments"
            };
            var jsonString = JSON.stringify(vm.pay);

            var payment = $serviceCall.setClient("singlePayment", "process");
            payment.ifSuccess(function(data) {
                if (data.isSuccess == true) {
                    refreshActivity();
                    var data = data;
                    var toast = $mdToast.simple()
                        .content('Payment successfully Done.')
                        .action('OK')
                        .highlightAction(false)
                        .position("bottom right");
                    $mdToast.show(toast).then(function() {});
                    $mdDialog.hide();
                } else {
                     if(data.response){
                        $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Payment Failed').content(data.response).ariaLabel('').ok('OK').targetEvent());
                    }
                    else{
                        $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Payment Failed').content('Stripe payment failed').ariaLabel('').ok('OK').targetEvent());
                    }
                    // $mdToast.show(
                    //     $mdToast.simple()
                    //     .textContent(data.response)
                    //     .position('top right')
                    //     .hideDelay(3000)
                    // );
                    vm.disablePayment = false;
                }
            });

            payment.ifError(function(data) {
                if (data.data.message == undefined || data.data.message.includes("Unexpected token")) {

                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .content('Error Doing Payment')
                        .ariaLabel('Error')
                        .ok('OK')
                        .targetEvent()
                    );

                } else {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .content(data.data.message)
                        .ariaLabel('Error')
                        .ok('OK')
                        .targetEvent()
                    );
                }
            });
            payment.postReq(jsonString);

        }
    }
})();