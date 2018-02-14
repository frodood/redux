(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('paymentPreferenceCtrl', paymentPreferenceCtrl);

    /** @ngInject */
    function paymentPreferenceCtrl($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.spinnerService = msSpinnerService;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !
        vm.settingPaymentPrefSpinnerLoaded = settingPaymentPrefSpinnerLoaded;

        function settingPaymentPrefSpinnerLoaded(paymentSpinner){
            paymentSpinner.show('setting-loadPaymentPref-spinner');
        }


        vm.addcusfieldsPayment = addcusfieldsPayment;
        vm.editcusfieldsPayment = editcusfieldsPayment;
        vm.deletepaymentcusfieldsrow = deletepaymentcusfieldsrow;


        vm.inactivatepaymentsmethod = "Inactivate";
        vm.addPaymentmethod = addPaymentmethod;
        vm.editpaymentmethodrow = editpaymentmethodrow;
        vm.deletepaymentmethodrow = deletepaymentmethodrow;
        vm.inactivatepaymentmethod = inactivatepaymentmethod;

        vm.editPaymentSequence = editPaymentSequence;

        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                loadingCurrentPaymentSequence();
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadPaymentPref-spinner');
                var toast = $mdToast.simple().content('There was an error, when data loading').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })

            client.skip(0);
            client.take(1);
            client.orderby();
            client.getReq();
        }
        loadSetting();

        vm.save = save;

        function save() {

            vm.spinnerService.show('setting-paymentPref-spinner');

            vm.Settings12thdoor.preference.paymentPref.paymentSequence = vm.Settings12thdoor.preference.paymentPref.paymentSequence;

             //Start replace \n to \\n.............................................................
            // if(vm.Settings12thdoor.preference.invoicePref.defaultNote){
            //     var backUp = angular.copy(vm.Settings12thdoor.preference.invoicePref.defaultNote);
            //     var str = vm.Settings12thdoor.preference.invoicePref.defaultNote.toString();
            //     var res = str.replace(new RegExp('\n', 'g'), '\\n');
            //     vm.Settings12thdoor.preference.invoicePref.defaultNote = res;
            // }
            // else{
            //     vm.Settings12thdoor.preference.invoicePref.defaultNote="";
            // }

            
            // if(vm.Settings12thdoor.preference.invoicePref.offlinePayments){
            //     var backUp1 = angular.copy(vm.Settings12thdoor.preference.invoicePref.offlinePayments);
            //     var str1 = vm.Settings12thdoor.preference.invoicePref.offlinePayments.toString();
            //     var res1 = str1.replace(new RegExp('\n', 'g'), '\\n');
            //     vm.Settings12thdoor.preference.invoicePref.offlinePayments = res1;
            // }
            // else{
            //     vm.Settings12thdoor.preference.invoicePref.offlinePayments="";
            // }
            
            // if(vm.Settings12thdoor.preference.inventoryPref.defaultNote){
            //     var backUp2 = angular.copy(vm.Settings12thdoor.preference.inventoryPref.defaultNote);
            //     var str2 = vm.Settings12thdoor.preference.inventoryPref.defaultNote.toString();
            //     var res2 = str2.replace(new RegExp('\n', 'g'), '\\n');
            //     vm.Settings12thdoor.preference.inventoryPref.defaultNote = res2;
            // }
            // else{
            //     vm.Settings12thdoor.preference.inventoryPref.defaultNote="";
            // }
           
            // if(vm.Settings12thdoor.preference.estimatePref.defaultNote){
            //     var backUp3 = angular.copy(vm.Settings12thdoor.preference.estimatePref.defaultNote);
            //     var str3 = vm.Settings12thdoor.preference.estimatePref.defaultNote.toString();
            //     var res3 = str3.replace(new RegExp('\n', 'g'), '\\n');
            //     vm.Settings12thdoor.preference.estimatePref.defaultNote = res3;
            // }
            // else{
            //     vm.Settings12thdoor.preference.estimatePref.defaultNote=""
            // }
            //End replace \n to \\n.............................................................

            var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
            client.ifSuccess(function(data) { //sucess  
                var toast = $mdToast.simple().content('Payment preference successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                // vm.Settings12thdoor.preference.invoicePref.defaultNote = backUp;
                // vm.Settings12thdoor.preference.invoicePref.offlinePayments = backUp1;
                // vm.Settings12thdoor.preference.inventoryPref.defaultNote = backUp2;
                // vm.Settings12thdoor.preference.estimatePref.defaultNote = backUp3;
                vm.spinnerService.hide('setting-paymentPref-spinner');
            });
            client.ifError(function(data) { //false
                vm.spinnerService.show('setting-paymentPref-spinner');
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })

            client.tab('preference');
            client.postReq(vm.Settings12thdoor.preference);


        }


        function addcusfieldsPayment(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefCusfieldPaymentController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/paymentDialog/addCusfieldsPayment.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.paymentPref.cusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.paymentPref.cusFiel.push(answer);

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editcusfieldsPayment(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefCusfieldPaymentController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/paymentDialog/editCusfieldsPayment.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.paymentPref.cusFiel
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.paymentPref.cusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.paymentPref.cusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.preference.paymentPref.cusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.preference.paymentPref.cusFiel);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function deletepaymentcusfieldsrow(cusFieldPayemnt, index) {
            vm.Settings12thdoor.preference.paymentPref.cusFiel.splice(index, 1);
        }



        function addPaymentmethod(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefPaymentMethodController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/paymentDialog/addPaymentMethod.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data:  vm.Settings12thdoor.preference.paymentPref.paymentMethods
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.paymentPref.paymentMethods.push(answer);
                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editpaymentmethodrow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefPaymentMethodController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/paymentDialog/editPaymentMethod.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data:  vm.Settings12thdoor.preference.paymentPref.paymentMethods
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.paymentPref.paymentMethods.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.paymentPref.paymentMethods[i].id == answer.id) {
                            vm.Settings12thdoor.preference.paymentPref.paymentMethods[i] = answer;
                            console.log(vm.Settings12thdoor.preference.paymentPref.paymentMethods);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        }

        function deletepaymentmethodrow(payemntMethod, index) {
            vm.Settings12thdoor.preference.paymentPref.paymentMethods.splice(index, 1);
        }

        function inactivatepaymentmethod(data, index) {
            for (var i = vm.Settings12thdoor.preference.paymentPref.paymentMethods.length - 1; i >= 0; i--) {
                if (vm.Settings12thdoor.preference.paymentPref.paymentMethods[i].id == data.id) {
                    if (data.activate) {
                        data.activate = false;
                        vm.inactivatepaymentsmethod = "Activate";
                        vm.Settings12thdoor.preference.paymentPref.paymentMethods[i].activate = false;
                    } else {
                        data.activate = true;
                        vm.inactivatepaymentsmethod = "Inactivate";
                        vm.Settings12thdoor.preference.paymentPref.paymentMethods[i].activate = true;
                    }
                }
            }



        }

        function loadingCurrentPaymentSequence() {
            vm.prefix = vm.Settings12thdoor.preference.paymentPref.paymentPrefix;
            vm.sequence = vm.Settings12thdoor.preference.paymentPref.paymentSequence;
            console.log(vm.prefix);
            console.log(vm.sequence);

            var client = $serviceCall.setClient("getNextReceiptNo", "payment");
            client.ifSuccess(function(data) {
                console.log(data);
                if (data.length != 0) {

                    var client = $serviceCall.setClient("getNextReceiptNo", "payment");
                    client.ifSuccess(function(data) {

                        var res = data.substring(3);

                        var str = res.toString();

                        var num = 0;
                        var seq = "";

                        if (str.startsWith("0")) {
                            for (var i = 0; str.length > i; i++) {
                                if (str.charAt(i) != '0') break;
                                else seq += "0";
                            }
                            var temp = parseInt(str) - 1;
                            num = seq + temp;
                        } else num = parseInt(str) - 1;

                        var createdPaymentsCount = num.toString();
                        vm.paymentSequence = createdPaymentsCount;

                    });
                    client.ifError(function(data) {
                        console.log("error loading payment sequence")
                    })
                    client.pattern(vm.prefix + vm.sequence);
                    client.getReq();
                    vm.spinnerService.hide('setting-loadPaymentPref-spinner');
                }

            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadPaymentPref-spinner');
                console.log("error loading payment sequence")
            })
            client.pattern(vm.prefix + vm.sequence);
            client.getReq();
        }

        function editPaymentSequence(data, sequence, ev) {
            console.log(data);
            $mdDialog.show({
                    controller: 'DialogPrefPaymentSequenceChangeController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/paymentDialog/editPaymentSequenceChange.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: data,
                        sequence: sequence
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {

                    vm.paymentSequence = answer.sequence;
                    vm.Settings12thdoor.preference.paymentPref.paymentPrefix = answer.prefix;
                    vm.Settings12thdoor.preference.paymentPref.paymentSequence = vm.paymentSequence;
                    var client = $serviceCall.setClient("validateNewSequence", "setting"); // method name and service
                    client.ifSuccess(function(data) {
                        console.log(data);
                        if (data.isSuccess == true) {
                            var toast = $mdToast.simple().content(data.message).action('OK').highlightAction(false).position("top right");
                            $mdToast.show(toast).then(function() {});
                            
                            var client1 = $serviceCall.setClient("savePaymentPrefixSequence", "setting"); // method name and service
                            client1.ifSuccess(function(data) { //sucess  
                                var toast = $mdToast.simple().content('Successfully payment sequence saved').action('OK').highlightAction(false).position("top right");
                                $mdToast.show(toast).then(function() {});
                            });
                            client1.ifError(function(data) { //false
                                var toast = $mdToast.simple().content('There was an error saving the payment sequence').action('OK').highlightAction(false).position("top right");
                                $mdToast.show(toast).then(function() {});
                            })
                            client1.prefix(vm.Settings12thdoor.preference.paymentPref.paymentPrefix);
                            client1.sequence(vm.paymentSequence);
                            client1.getReq();

                        } else {
                            $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Sorry')
                            .content(data.message)
                            .ariaLabel('Alert Dialog Demo')
                            .ok('OK')
                            .targetEvent()
                            )
                        }

                    });
                    client.ifError(function(data) {
                        var toast = $mdToast.simple().content('There was an error, when validate sequence').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    })

                    client.prefix(vm.Settings12thdoor.preference.paymentPref.paymentPrefix);
                    client.sequence(vm.paymentSequence);
                    client.preference('paymentPref');
                    client.getReq();

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        }




    }

})();