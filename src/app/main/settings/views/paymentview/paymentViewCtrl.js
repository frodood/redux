(function() {
    'use strict';
    angular
        .module('app.settings')
        .controller('paymentsViewController', paymentsViewController);

    /** @ngInject */
    function paymentsViewController($scope, $rootScope, $document, $mdDialog, $mdToast, $mdMedia, $serviceCall, $mdSidenav, $state, msApi, $auth, $apis,$http,$setUrl,$helpers,$paymentgateway, msSpinnerService) 
    {
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !
         var gatewayss = [];

         vm.spinnerService = msSpinnerService;

         vm.settingLoadPaymentsSpinnerLoaded = settingLoadPaymentsSpinnerLoaded;

         function settingLoadPaymentsSpinnerLoaded(paymentTabSpinner){
            paymentTabSpinner.show('setting-loadPayments-spinner');
         }

        //call paymentgateway whether register or not..........................................................
         function paymentgatewayRegisterStatus(callback) {
            debugger;
            var client = $serviceCall.setClient("connectedGateways", "setting");
            client.ifSuccess(function(data) {
                console.log(data);

                vm.gatewayss = data.data;
                console.log(vm.gatewayss);
                for (var i =  vm.gatewayss.length - 1; i >= 0; i--) {
                    console.log(vm.gatewayss);
                    if(vm.gatewayss[i].gateway == "stripe"){
                        vm.stripeRegisterbtnDisabled = true;
                        vm.stripeRejectbtnDisabled = false;
                    }
                    else if(vm.gatewayss[i].gateway == "2checkout"){
                        vm.checkoutRegisterbtnDisabled = true;
                        vm.checkoutRejectbtnDisabled = false;
                    }
                    else if(vm.gatewayss[i].gateway == "webxpay"){
                        vm.webxpayRegisterbtnDisabled = true;
                        vm.webxpayRejectbtnDisabled = false;
                    }
                    else if(vm.gatewayss[i].gateway == "paypal")
                    {
                        vm.paypalRegisterbtnDisabled = true;
                        vm.paypalRejectbtnDisabled = false;
                    }

                };

                callback();

                
            

            });
            client.ifError(function(data) {
                console.log("There was an error, when connected Gateways", "error");
            })
            client.getReq();
        };
        paymentgatewayRegisterStatus();

        // vm.activepayment = activepayment;
        vm.registerOlinePayment = registerOlinePayment;
        vm.rejectOnlinePayment = rejectOnlinePayment;
        vm.editOnlinePayment = editOnlinePayment;

      
        vm.paypalRejectbtnDisabled = true;
        vm.stripeRejectbtnDisabled = true;
        vm.checkoutRejectbtnDisabled = true;
        vm.webxpayRejectbtnDisabled = true;
        
        vm.paypalRegisterbtnDisabled = false;
        vm.stripeRegisterbtnDisabled = false;
        vm.checkoutRegisterbtnDisabled = false;
        vm.webxpayRegisterbtnDisabled = false;


        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting");
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                vm.spinnerService.hide('setting-loadPayments-spinner');
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadPayments-spinner');
                console.log("There was an error, when data loading", "error");
            })

            client.skip(0);
            client.take(1);
            client.orderby();
            client.getReq();
        }
        loadSetting();

        function savePayments(data) {
            console.log(data);
            vm.onlinePay = data;

            // if (vm.onlinePay.activate == true) {
               
            //     vm.label = 'activated';
            //     var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
            //     client.ifSuccess(function(data) { //sucess  
            //         var toast = $mdToast.simple().content('Successfully ' + vm.onlinePay.name + ' ' + vm.label).action('OK').highlightAction(false).position("top right");
            //         $mdToast.show(toast).then(function() {});
            //     });
            //     client.ifError(function(data) { //false
            //         var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
            //         $mdToast.show(toast).then(function() {});
            //     })
            //     client.tab('payments');
            //     client.postReq(vm.Settings12thdoor.payments);
            // }
                
                vm.label = 'Inactivated';
                
                var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
                client.ifSuccess(function(data) { //sucess  
                    // var toast = $mdToast.simple().content('Successfully ' + vm.onlinePay.name + ' ' + vm.label).action('OK').highlightAction(false).position("top right");
                    // $mdToast.show(toast).then(function() {});
                    console.log(data);
                   
                });
                client.ifError(function(data) { //false
                    var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                })
                client.tab('payments');
                client.postReq(vm.Settings12thdoor.payments);
            
        }

        function activepayment(data) {
         
            console.log(data.name);
            vm.paymentDetails= data;
            vm.paymentGatewayName = data.name;
            var registeredPaypal = false;
            var registeredStripe = false;
            var registered2checkout = false;
            var registeredWebxpay = false;

            for (var i = vm.Settings12thdoor.payments.length - 1; i >= 0; i--) {
                if (vm.Settings12thdoor.payments[i].name == data.name) {
                    debugger;
                        // for (var j =  vm.gatewayss.length - 1; j >= 0; j--) {
                        //     debugger;
                        //     console.log(vm.gatewayss);
                        //     if(vm.gatewayss[j].gateway == "paypal"){
                        //         registeredPaypal = true;
                        //     }
                        //     else if(vm.gatewayss[j].gateway == "stripe"){
                        //         registeredStripe = true;
                        //     }
                        //     else if(vm.gatewayss[j].gateway == "2checkout"){
                        //         registered2checkout = true;
                        //     }
                        //     else if(vm.gatewayss[j].gateway == "webxpay"){
                        //         registeredWebxpay = true;
                        //     }

                        // }
                        
                            console.log(vm.gatewayss);

                            if(vm.paymentGatewayName == "paypal"){
                               
                            
                                data.activate = true;
                                data.label = "Inactivate";
                                vm.Settings12thdoor.payments[i].label = "Inactivate";
                                vm.Settings12thdoor.payments[i].activate = true;
                                
                                savePayments(vm.paymentDetails);
                            
                            // else{
                            //     $mdDialog.show(
                            //     $mdDialog.alert()
                            //     .parent(angular.element(document.querySelector('#popupContainer')))
                            //     .clickOutsideToClose(true)
                            //     .title('Alert')
                            //     .textContent('You should register with ' + data.name)
                            //     .ariaLabel('Alert Dialog Demo')
                            //     .ok('Ok!')
                            //     .targetEvent()
                            //     );

                            //     break;

                            // }
                            }

                            if(vm.paymentGatewayName == "stripe"){
                          
                            
                                    data.activate = true;
                                    data.label = "Inactivate";
                                    vm.Settings12thdoor.payments[i].label = "Inactivate";
                                    vm.Settings12thdoor.payments[i].activate = true;
                                    debugger;
                                    if(vm.stripeRegisterbtnDisabled){
                                        debugger;
                                         savePayments(vm.paymentDetails);
                                    }
                                   
                                
                               

                            }
                            
                            if(vm.paymentGatewayName == "2checkout"){
                                debugger;
                         
                                data.activate = true;
                                data.label = "Inactivate";
                                vm.Settings12thdoor.payments[i].label = "Inactivate";
                                vm.Settings12thdoor.payments[i].activate = true;
                                debugger;
                                if(vm.checkoutRegisterbtnDisabled){

                                    savePayments(vm.paymentDetails);
                                }
                                
                        
                            // else{
                            //     $mdDialog.show(
                            //     $mdDialog.alert()
                            //     .parent(angular.element(document.querySelector('#popupContainer')))
                            //     .clickOutsideToClose(true)
                            //     .title('Alert')
                            //     .textContent('You should register with ' + data.name)
                            //     .ariaLabel('Alert Dialog Demo')
                            //     .ok('Ok!')
                            //     .targetEvent()
                            //     );
                           
                                
                            //     break;
                                
                            // }
                            }

                            if(vm.paymentGatewayName == "webxpay"){
                             
                                // if(registeredWebxpay){
                         
                                data.activate = true;
                                data.label = "Inactivate";
                                vm.Settings12thdoor.payments[i].label = "Inactivate";
                                vm.Settings12thdoor.payments[i].activate = true;
                                debugger;
                                if(vm.webxpayRegisterbtnDisabled){
                                    savePayments(vm.paymentDetails);
                                }
                                
                            // }
                            // else{
                            //     $mdDialog.show(
                            //     $mdDialog.alert()
                            //     .parent(angular.element(document.querySelector('#popupContainer')))
                            //     .clickOutsideToClose(true)
                            //     .title('Alert')
                            //     .textContent('You should register with ' + data.name)
                            //     .ariaLabel('Alert Dialog Demo')
                            //     .ok('Ok!')
                            //     .targetEvent()
                            //     );
                           
                                
                            //     break;
                                
                            // }
                            }

                };

            };
        }

        function inactivepayment(data) {
         
            console.log(data.name);
            vm.paymentDetails= data;
            vm.paymentGatewayName = data.name;
            var registeredPaypal = false;
            var registeredStripe = false;
            var registered2checkout = false;
            var registeredWebxpay = false;

            for (var i = vm.Settings12thdoor.payments.length - 1; i >= 0; i--) {
                if (vm.Settings12thdoor.payments[i].name == data.name) {

                        for (var j =  vm.gatewayss.length - 1; j >= 0; j--) {
                            console.log(vm.gatewayss);
                            if(vm.gatewayss[j].gateway == "paypal"){
                                registeredPaypal = true;
                            }
                            else if(vm.gatewayss[j].gateway == "stripe"){
                                registeredStripe = true;
                            }
                            else if(vm.gatewayss[j].gateway == "2checkout"){
                                registered2checkout = true;
                            }
                            else if(vm.gatewayss[j].gateway == "webxpay"){
                                registeredWebxpay = true;
                            }

                        }
                        
                            console.log(vm.gatewayss);

                            if(vm.paymentGatewayName == "paypal"){
                               
                                if(registeredPaypal){
                           
                                data.activate = false;
                                data.label = "Activate";
                                vm.Settings12thdoor.payments[i].label = "Activate";
                                vm.Settings12thdoor.payments[i].activate = false;
                                
                                // savePayments(vm.paymentDetails);
                                vm.label = 'activated';
                                var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
                                client.ifSuccess(function(data) { //sucess  
                                    console.log(data);
                                });
                                client.ifError(function(data) { //false
                                    var toast = $mdToast.simple().content('There was an error, when inactivate paypal').action('OK').highlightAction(false).position("top right");
                                    $mdToast.show(toast).then(function() {});
                                })
                                client.tab('payments');
                                client.postReq(vm.Settings12thdoor.payments);

                                }
                         
                            }

                            if(vm.paymentGatewayName == "stripe"){
                                if(registeredStripe){
                                    console.log(data);
                                    data.activate = false;
                                    data.label = "Activate";
                                    vm.Settings12thdoor.payments[i].label = "Activate";
                                    vm.Settings12thdoor.payments[i].activate = false;
                                   
                                    // savePayments(vm.paymentDetails);
                                    var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
                                    client.ifSuccess(function(data) { //sucess  
                                        console.log(data);
                                    });
                                    client.ifError(function(data) { //false
                                        var toast = $mdToast.simple().content('There was an error, when inactivate stripe').action('OK').highlightAction(false).position("top right");
                                        $mdToast.show(toast).then(function() {});
                                    })
                                    client.tab('payments');
                                    client.postReq(vm.Settings12thdoor.payments);
                                }
                                
                            }
                            
                            if(vm.paymentGatewayName == "2checkout"){
                             
                                if(registered2checkout){
                         
                                data.activate = false;
                                data.label = "Activate";
                                vm.Settings12thdoor.payments[i].label = "Activate";
                                vm.Settings12thdoor.payments[i].activate = false;
                                
                                // savePayments(vm.paymentDetails);
                                var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
                                client.ifSuccess(function(data) { //sucess  
                                    console.log(data);
                                });
                                client.ifError(function(data) { //false
                                    var toast = $mdToast.simple().content('There was an error, when inactivate 2checkout').action('OK').highlightAction(false).position("top right");
                                    $mdToast.show(toast).then(function() {});
                                })
                                client.tab('payments');
                                client.postReq(vm.Settings12thdoor.payments);

                            }
                            
                            }

                            if(vm.paymentGatewayName == "webxpay"){
                             
                                if(registeredWebxpay){
                         
                                data.activate = false;
                                data.label = "Activate";
                                vm.Settings12thdoor.payments[i].label = "Activate";
                                vm.Settings12thdoor.payments[i].activate = false;
                                
                                // savePayments(vm.paymentDetails);
                                var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
                                client.ifSuccess(function(data) { //sucess  
                                    console.log(data);
                                });
                                client.ifError(function(data) { //false
                                    var toast = $mdToast.simple().content('There was an error, when inactivate webxpay').action('OK').highlightAction(false).position("top right");
                                    $mdToast.show(toast).then(function() {});
                                })
                                client.tab('payments');
                                client.postReq(vm.Settings12thdoor.payments);

                                }
                            
                            }

                };

            };
        }

        

        
        function registerOlinePayment(data)
        {
            
            console.log(data);
            vm.registerPaymentdetails = data;
            if(data.name == 'stripe' )
            {
                debugger;
                
                window.location.replace($apis.getHost() + '/services/duosoftware.setting.service/payment-partial.php');
                activepayment(vm.registerPaymentdetails);

            }

            if(data.name == '2checkout' )
            {
                debugger;
                $mdDialog.show({
                templateUrl: 'app/main/settings/dialogs/2checkoutDialog/guided-payment-2checkout.html',
                controller: 'GuidedPayment2CheckoutController',
                controllerAs: 'vm',
                    locals:{}
                }).then(function(data){
                    
                paymentgatewayRegisterStatus(function() {
                //your code which should exicute af
                    activepayment(vm.registerPaymentdetails);
                });
                    
                }, function(data){

                })
            }

            if(data.name == 'webxpay' )
            {
                $mdDialog.show({
                templateUrl: 'app/main/settings/dialogs/webxpayDialog/guided-payment-webxpay.html',
                controller: 'GuidedPaymentWebxpayController',
                controllerAs: 'vm',
                    locals:{}
                }).then(function(data){
                    
                paymentgatewayRegisterStatus(function() {
                //your code which should exicute af
                    activepayment(vm.registerPaymentdetails);
                });
                
                }, function(data){

                })
            }

            if(data.name == 'paypal' )
            {
                $mdDialog.show({
                templateUrl: 'app/main/settings/dialogs/paypalDialog/guided-payment-paypal.html',
                controller: 'GuidedPaymentpaypalController',
                controllerAs: 'vm',
                    locals:{}
                }).then(function(data){
                    
                paymentgatewayRegisterStatus(function() {
                //your code which should exicute af
                    activepayment(vm.registerPaymentdetails);
                });
                
                }, function(data){

                })
            }

        }

        function editOnlinePayment(data, gatewayss){ debugger;
            console.log(data);
            console.log(gatewayss);
            for (var i = gatewayss.length - 1; i >= 0; i--) {
                if(data.name == gatewayss[i].gateway){
                    console.log(gatewayss[i].accessKey);
                    vm.accesskey = gatewayss[i].accessKey;
                }
            };
            

            if(data.name == 'stripe' )
            {
                paymentgatewayRegisterStatus();
                window.location.replace($apis.getHost() + '/services/duosoftware.setting.service/payment-partial.php');

            }

            if(data.name == '2checkout' )
            {
                
                $mdDialog.show({
                templateUrl: 'app/main/settings/dialogs/2checkoutDialog/guided-payment-2checkout.html',
                controller: 'EditGuidedPayment2CheckoutController',
                controllerAs: 'vm',
                locals: {
                        twocheckoutDetails:vm.accesskey
                        },
                }).then(function(data){
                    paymentgatewayRegisterStatus();
                }, function(data){

                })
            }

            if(data.name == 'webxpay' )
            {
              
                
                $mdDialog.show({
                templateUrl: 'app/main/settings/dialogs/webxpayDialog/guided-payment-webxpay.html',
                controller: 'EditGuidedPaymentWebxpayController',
                controllerAs: 'vm',
                    locals: {
                            accesskey:vm.accesskey
                            }
                }).then(function(data){
                    paymentgatewayRegisterStatus();
                }, function(data){

                })
            }

            if(data.name == 'paypal' )
            {
                /*$mdDialog.show({
                templateUrl: 'app/main/settings/dialogs/paypalDialog/guided-payment-paypal.html',
                controller: 'EditGuidedPaymentPaypalController',
                controllerAs: 'vm',
                    locals:{}
                }).then(function(data){
                    
                paymentgatewayRegisterStatus(function() {
                    activepayment(vm.registerPaymentdetails);
                });
                
                }, function(data){

                })*/

                $mdDialog.show({
                templateUrl: 'app/main/settings/dialogs/paypalDialog/guided-payment-paypal.html',
                controller: 'EditGuidedPaymentpaypalController',
                controllerAs: 'vm',
                    locals:{accesskey:vm.accesskey}
                }).then(function(data){
                    
                paymentgatewayRegisterStatus(function() {
                //your code which should exicute af
                    activepayment(vm.registerPaymentdetails);
                });
                
                }, function(data){

                })
            }

        }

        function rejectOnlinePayment(data, index) {
            console.log(data);
            vm.paymentdetails = data;
            if(data.name == 'stripe' )
            {
                vm.paymentgatewayName = data.name;
                var client = $serviceCall.setClient("deactiveAcc", "setting");
                client.ifSuccess(function(data) {
                    console.log(data);
                    if (data.status == true) {
                        vm.stripeRegisterbtnDisabled = false;
                        vm.stripeRejectbtnDisabled = true;
                        paymentgatewayRegisterStatus();
                        if(vm.paymentdetails.activate)
                        {
                          inactivepayment(vm.paymentdetails);  
                        }         
                        
                        var toast = $mdToast.simple().content('Stripe payment gateway successfully deleted').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});

                    }

                });
                client.ifError(function(data) {
                    console.log("There was an error, when deleting payment gateway", "error");
                })
                client.getReq();
            }
            else if(data.name == '2checkout')
            {
                
                var clientS = $paymentgateway.setClient('2checkout','deleteClient');
                  clientS.ifSuccess(function(data) {   
                    if(data.status){
                        paymentgatewayRegisterStatus();
                        if(vm.paymentdetails.activate)
                        {
                          inactivepayment(vm.paymentdetails);  
                        } 
                        
                        var toast = $mdToast.simple().content('2Checkout payment gateway successfully deleted').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.checkoutRegisterbtnDisabled = false;
                        vm.checkoutRejectbtnDisabled = true;

                      }else{
                        var toast = $mdToast.simple().content('2Checkout deleting failed').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                      }
                  });
                  clientS.ifError(function(data) {
                    var toast = $mdToast.simple().content('There was an error, when deleting payment gateway', 'error').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                  }) 
                  clientS.deleteReq();
            }

            else if(data.name == 'webxpay')
            {
                
                var clientW = $paymentgateway.setClient('webxpay','deleteClient');
                  clientW.ifSuccess(function(data) {   
                    if(data.status){
                        paymentgatewayRegisterStatus();
                        if(vm.paymentdetails.activate)
                        {
                          inactivepayment(vm.paymentdetails);  
                        } 
                        var toast = $mdToast.simple().content('Webxpay payment gateway successfully deleted').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.webxpayRegisterbtnDisabled = false;
                        vm.webxpayRejectbtnDisabled = true;

                      }else{
                        var toast = $mdToast.simple().content('Webxpay deleting failed').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                      }
                  });
                  clientW.ifError(function(data) {
                    var toast = $mdToast.simple().content('There was an error, when deleting payment gateway', 'error').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                  }) 
                  clientW.deleteReq();
            }

            else if(data.name == 'paypal')
            {
                var clientP = $paymentgateway.setClient('paypal','deleteClient');
                  clientP.ifSuccess(function(data) {   
                    if(data.status){
                        paymentgatewayRegisterStatus();
                        if(vm.paymentdetails.activate)
                        {
                          inactivepayment(vm.paymentdetails);  
                        } 
                        var toast = $mdToast.simple().content('Paypal payment gateway successfully deleted').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.paypalRegisterbtnDisabled = false;
                        vm.paypalRejectbtnDisabled = true;

                      }else{
                        var toast = $mdToast.simple().content('Paypal deleting failed').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                      }
                  });
                  clientP.ifError(function(data) {
                    var toast = $mdToast.simple().content('There was an error, when deleting payment gateway', 'error').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                  }) 
                  clientP.deleteReq();
            }
        };
        
    }
})();