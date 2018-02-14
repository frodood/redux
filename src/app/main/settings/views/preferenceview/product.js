(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('productPreferenceCtrl', productPreferenceCtrl);

    /** @ngInject */
    function productPreferenceCtrl($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.spinnerService = msSpinnerService;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.settingProductPrefSpinnerLoaded = settingProductPrefSpinnerLoaded;
        function settingProductPrefSpinnerLoaded(productSpinner){
            productSpinner.show('setting-loadProductPref-spinner');
        }

        vm.addUnits = addUnits;
        vm.editunitsrow = editunitsrow;
        vm.deleteUnits = deleteUnits;
        vm.inactivateUnitsOfMeasure = inactivateUnitsOfMeasure;
        vm.inactivateUnitsOfMeasurelabel = "Inactivate";

        vm.inactivateproductbrand = inactivateproductbrand;
        vm.addProductbrand = addProductbrand;
        vm.deleteproductBrand = deleteproductBrand;
        vm.editproductBrandrow = editproductBrandrow;
        vm.inactivateproductbrandlabel = "Inactivate";

        vm.editProductcaterow = editProductcaterow;
        vm.deleteProductcaterow = deleteProductcaterow;
        vm.inactivateproductcate = inactivateproductcate;
        vm.addProductcategory = addProductcategory;
        vm.inactivateproductcatelabel = "Inactivate";

        vm.addcusfieldsProduct = addcusfieldsProduct;
        vm.editcusfieldsProduct = editcusfieldsProduct;
        vm.deletcusfieldsproduct = deletcusfieldsproduct;

        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                vm.spinnerService.hide('setting-loadProductPref-spinner');
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadProductPref-spinner');
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

            vm.spinnerService.show('setting-productPref-spinner');
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
                var toast = $mdToast.simple().content('Product preference successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                // vm.Settings12thdoor.preference.invoicePref.defaultNote = backUp;
                // vm.Settings12thdoor.preference.invoicePref.offlinePayments = backUp1;
                // vm.Settings12thdoor.preference.inventoryPref.defaultNote = backUp2;
                // vm.Settings12thdoor.preference.estimatePref.defaultNote = backUp3;
                vm.spinnerService.hide('setting-productPref-spinner');
            });
            client.ifError(function(data) { //false
                vm.spinnerService.hide('setting-productPref-spinner');
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.tab('preference');
            client.postReq(vm.Settings12thdoor.preference);
        }

        function addUnits(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefaddUnitsController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/productDialog/addUnitsOfMeasure.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.productPref.units
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.productPref.units.push(answer);
                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editunitsrow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefaddUnitController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/productDialog/editUnitsOfMeasure.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.productPref.units
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.productPref.units.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.productPref.units[i].id == answer.id) {
                            vm.Settings12thdoor.preference.productPref.units[i] = answer;
                            console.log(vm.Settings12thdoor.preference.productPref.units);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        }

        function deleteUnits(units, index) {
            vm.Settings12thdoor.preference.productPref.units.splice(index, 1);
        }

        function inactivateUnitsOfMeasure(data, index) {
            for (var i = vm.Settings12thdoor.preference.productPref.units.length - 1; i >= 0; i--) {
                if (vm.Settings12thdoor.preference.productPref.units[i].id == data.id) {

                    if (data.activate) {
                        data.activate = false;
                        vm.inactivateUnitsOfMeasurelabel = "Activate";
                        vm.Settings12thdoor.preference.productPref.units[i].activate = false;
                    } else {
                        data.activate = true;
                        vm.inactivateUnitsOfMeasurelabel = "Inactivate";
                        vm.Settings12thdoor.preference.productPref.units[i].activate = true;
                    }
                }
            }
            console.log(vm.Settings12thdoor.preference.productPref.units);

        }

        function addProductbrand(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefproductBrandController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/productDialog/addProductBrand.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.productPref.productBrands
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.productPref.productBrands.push(answer);
                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editproductBrandrow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefproductBrandController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/productDialog/editProductBrand.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.productPref.productBrands
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.productPref.productBrands.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.productPref.productBrands[i].id == answer.id) {
                            vm.Settings12thdoor.preference.productPref.productBrands[i] = answer;
                            console.log(vm.Settings12thdoor.preference.productPref.productBrands);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        }

        function deleteproductBrand(units, index) {
            vm.Settings12thdoor.preference.productPref.productBrands.splice(index, 1);
        }

        function inactivateproductbrand(data, index) {
            for (var i = vm.Settings12thdoor.preference.productPref.productBrands.length - 1; i >= 0; i--) {
                if (vm.Settings12thdoor.preference.productPref.productBrands[i].id == data.id) {

                    if (data.activate) {
                        data.activate = false;
                        vm.inactivateproductbrandlabel = "Activate";
                        vm.Settings12thdoor.preference.productPref.productBrands[i].activate = false;
                    } else {
                        data.activate = true;
                        vm.inactivateproductbrandlabel = "Inactivate";
                        vm.Settings12thdoor.preference.productPref.productBrands[i].activate = true;
                    }
                }
            }
            console.log(vm.Settings12thdoor.preference.productPref.productBrands);

        }

        function addProductcategory(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefProductCatController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/productDialog/addProductCategories.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        data: vm.Settings12thdoor.preference.productPref.productCategories
                    },
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.productPref.productCategories.push(answer);
                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editProductcaterow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefProductCatController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/productDialog/editProductCategories.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.productPref.productCategories
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.productPref.productCategories.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.productPref.productCategories[i].id == answer.id) {
                            vm.Settings12thdoor.preference.productPref.productCategories[i] = answer;
                            console.log(vm.Settings12thdoor.preference.productPref.productCategories);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        }

        function deleteProductcaterow(units, index) {
            vm.Settings12thdoor.preference.productPref.productCategories.splice(index, 1);
        }

        function inactivateproductcate(data, index) {
            for (var i = vm.Settings12thdoor.preference.productPref.productCategories.length - 1; i >= 0; i--) {
                if (vm.Settings12thdoor.preference.productPref.productCategories[i].id == data.id) {

                    if (data.activate) {
                        data.activate = false;
                        vm.inactivateproductcatelabel = "Activate";
                        vm.Settings12thdoor.preference.productPref.productCategories[i].activate = false;
                    } else {
                        data.activate = true;
                        vm.inactivateproductcatelabel = "Inactivate";
                        vm.Settings12thdoor.preference.productPref.productCategories[i].activate = true;
                    }
                }
            }
            console.log(vm.Settings12thdoor.preference.productPref.productCategories);

        }

        function addcusfieldsProduct(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefCusfieldProductController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/productDialog/addCusfieldProduct.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.productPref.cusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.productPref.cusFiel.push(answer);
                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editcusfieldsProduct(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefCusfieldProductController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/productDialog/editCusfieldProduct.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.productPref.cusFiel
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.productPref.cusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.productPref.cusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.preference.productPref.cusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.preference.productPref.cusFiel);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        }

        function deletcusfieldsproduct(units, index) {
            vm.Settings12thdoor.preference.productPref.cusFiel.splice(index, 1);
        }




    }

})();