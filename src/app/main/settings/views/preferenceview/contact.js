(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('contactPreferenceCtrl', contactPreferenceCtrl);

    /** @ngInject */
    function contactPreferenceCtrl($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.spinnerService = msSpinnerService;

        vm.settingConatctPrefSpinnerLoaded = settingConatctPrefSpinnerLoaded;

        function settingConatctPrefSpinnerLoaded(contactPrefSpinner){
            contactPrefSpinner.show('setting-loadConatctPref-spinner');
        }

        vm.addcustomercusfieldsContact = addcustomercusfieldsContact;
        vm.editcustomercusfieldsContact = editcustomercusfieldsContact;
        vm.deletcustomercusfieldscontact = deletcustomercusfieldscontact;
        vm.addsuppliercusfieldsContact = addsuppliercusfieldsContact;
        vm.editsuppliercusfieldsContact = editsuppliercusfieldsContact;
        vm.deletsuppliercusfieldscontact = deletsuppliercusfieldscontact;


        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                vm.spinnerService.hide('setting-loadConatctPref-spinner');
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadConatctPref-spinner');
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

            vm.spinnerService.show('setting-contactPref-spinner');

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
                var toast = $mdToast.simple().content('Contact preference successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                // vm.Settings12thdoor.preference.invoicePref.defaultNote = backUp;
                // vm.Settings12thdoor.preference.invoicePref.offlinePayments = backUp1;
                // vm.Settings12thdoor.preference.inventoryPref.defaultNote = backUp2;
                // vm.Settings12thdoor.preference.estimatePref.defaultNote = backUp3;

                vm.spinnerService.hide('setting-contactPref-spinner');
            });
            client.ifError(function(data) { //false
                vm.spinnerService.hide('setting-contactPref-spinner');
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.tab('preference');
            client.postReq(vm.Settings12thdoor.preference);
        }

        function addcustomercusfieldsContact(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefICustomerCusfieldContactController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/contactDialog/addCustomdetailsforCustomerContact.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        CusfieldContact: vm.Settings12thdoor.preference.contactPref.customerCusFiel
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.contactPref.customerCusFiel.push(answer);

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editcustomercusfieldsContact(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefICustomerCusfieldContactController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/contactDialog/editCustomdetailsforCustomerContact.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        CusfieldContact: vm.Settings12thdoor.preference.contactPref.customerCusFiel
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.contactPref.customerCusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.contactPref.customerCusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.preference.contactPref.customerCusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.preference.contactPref.customerCusFiel);
                            break;
                        }
                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function deletcustomercusfieldscontact(customercusFieldscontact, index) {
            vm.Settings12thdoor.preference.contactPref.customerCusFiel.splice(index, 1);
        }

        function addsuppliercusfieldsContact(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefISupplierCusfieldContactController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/contactDialog/addsuppliercusfieldsContact.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        CusfieldSupplier: vm.Settings12thdoor.preference.contactPref.supplierCusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.contactPref.supplierCusFiel.push(answer);

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editsuppliercusfieldsContact(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefISupplierCusfieldContactController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/contactDialog/editsuppliercusfieldsContact.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        CusfieldSupplier: vm.Settings12thdoor.preference.contactPref.supplierCusFiel
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.contactPref.supplierCusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.contactPref.supplierCusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.preference.contactPref.supplierCusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.preference.contactPref.supplierCusFiel);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function deletsuppliercusfieldscontact(supplierField, index) {
            vm.Settings12thdoor.preference.contactPref.supplierCusFiel.splice(index, 1);

        }




    }

})();