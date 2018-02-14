(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('expensePreferenceCtrl', expensePreferenceCtrl);

    /** @ngInject */
    function expensePreferenceCtrl($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.spinnerService = msSpinnerService;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.settingExpensePrefSpinnerLoaded = settingExpensePrefSpinnerLoaded;
        function settingExpensePrefSpinnerLoaded(expenseSpinner){
            expenseSpinner.show('setting-loadExpensePref-spinner');
        }

        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                vm.spinnerService.hide('setting-loadExpensePref-spinner');
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadExpensePref-spinner');
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
        vm.addexpensecategory = addexpensecategory;
        vm.editexpensecategoryrow = editexpensecategoryrow;
        vm.deleteexpensecategory = deleteexpensecategory;
        vm.inaactivateexpenseee = inaactivateexpenseee;
        vm.inactivateexpenseCat = "Inactivate";

        vm.addcusfieldsExpense = addcusfieldsExpense;
        vm.editcusFieldsexpenserow = editcusFieldsexpenserow;
        vm.deletcusfieldsexpense = deletcusfieldsexpense;

        function save() {

            vm.spinnerService.show('setting-expensePref-spinner');
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
                var toast = $mdToast.simple().content('Expense preference successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});

                // vm.Settings12thdoor.preference.invoicePref.defaultNote = backUp;
                // vm.Settings12thdoor.preference.invoicePref.offlinePayments = backUp1;
                // vm.Settings12thdoor.preference.inventoryPref.defaultNote = backUp2;
                // vm.Settings12thdoor.preference.estimatePref.defaultNote = backUp3;
                vm.spinnerService.hide('setting-expensePref-spinner');
            });
            client.ifError(function(data) { //false
                vm.spinnerService.hide('setting-expensePref-spinner');
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.tab('preference');
            client.postReq(vm.Settings12thdoor.preference);
        };

        function addexpensecategory(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefAddExpenseCategoryController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/expenseDialog/addExpenseCat.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.expensePref.expenseCategories
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.expensePref.expenseCategories.push(answer);

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        };

        function editexpensecategoryrow(edit, ev) {

            $mdDialog.show({
                    controller: 'DialogEditPrefExpenseCategoryController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/expenseDialog/editExpenseCat.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.expensePref.expenseCategories
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.expensePref.expenseCategories.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.expensePref.expenseCategories[i].id == answer.id) {
                            vm.Settings12thdoor.preference.expensePref.expenseCategories[i] = answer;
                            console.log(vm.Settings12thdoor.preference.expensePref.expenseCategories);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function deleteexpensecategory(expenseCat, index) {
            vm.Settings12thdoor.preference.expensePref.expenseCategories.splice(index, 1);
        };

        function inaactivateexpenseee(data) {

            for (var i = vm.Settings12thdoor.preference.expensePref.expenseCategories.length - 1; i >= 0; i--) {
                if (vm.Settings12thdoor.preference.expensePref.expenseCategories[i].id == data.id) {
                    if (data.activate) {
                        data.activate = false;
                        vm.inactivateexpenseCat = "Activate";
                        vm.Settings12thdoor.preference.expensePref.expenseCategories[i].activate = false;
                    } else {
                        data.activate = true;
                        vm.inactivateexpenseCat = "Inactivate";
                        vm.Settings12thdoor.preference.expensePref.expenseCategories[i].activate = true;
                    }
                }
            }

        };

        function addcusfieldsExpense(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefCusfieldExpenseController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/expenseDialog/addCusfieldsExpense.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.expensePref.cusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.expensePref.cusFiel.push(answer);

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        };

        function editcusFieldsexpenserow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefCusfieldExpenseController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/expenseDialog/editCusfieldsExpense.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.expensePref.cusFiel
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.expensePref.cusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.expensePref.cusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.preference.expensePref.cusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.preference.expensePref.cusFiel);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function deletcusfieldsexpense(item, index) {
            vm.Settings12thdoor.preference.expensePref.cusFiel.splice(index, 1);
        };




    }

})();