(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('inventoryPreferenceCtrl', inventoryPreferenceCtrl);

    /** @ngInject */
    function inventoryPreferenceCtrl($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.spinnerService = msSpinnerService;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.settingInventoryPrefSpinnerLoaded = settingInventoryPrefSpinnerLoaded;

        function settingInventoryPrefSpinnerLoaded(inventorySpinner){
            inventorySpinner.show('setting-loadInventoryPref-spinner');
        }

        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                if (vm.Settings12thdoor.preference.inventoryPref.copyFromInvoiceDefaultNoteInv == true) {
                    vm.Settings12thdoor.preference.inventoryPref.defaultNote = vm.Settings12thdoor.preference.invoicePref.defaultNote;
                }
                loadingCurrentInventoryGRNSequence();
                //loadingCurrentInventoryGINSequence();
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadInventoryPref-spinner');
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
        vm.addreciptcusfieldsInventory = addreciptcusfieldsInventory;
        vm.editreciptcusFieldsinventoryrow = editreciptcusFieldsinventoryrow;
        vm.deletreciptcusfieldsinventory = deletreciptcusfieldsinventory;

        vm.addissuescusfieldsInventory = addissuescusfieldsInventory;
        vm.editissuecusFieldsinventoryrow = editissuecusFieldsinventoryrow;
        vm.deletissuecusfieldsinventory = deletissuecusfieldsinventory;
        vm.copyFromInvoiceDefaultNoteInv = copyFromInvoiceDefaultNoteInv;

        vm.editInventoryGRNSequence = editInventoryGRNSequence;
        vm.changeInventorySequence = false;

        vm.editInventoryGINSequence = editInventoryGINSequence;
        vm.changeInventoryGINSequence = false;


        function save() {

            vm.spinnerService.show('setting-inventoryPref-spinner');

            vm.Settings12thdoor.preference.inventoryPref.grnSequence = vm.Settings12thdoor.preference.inventoryPref.grnSequence;
            vm.Settings12thdoor.preference.inventoryPref.ginSequence = vm.Settings12thdoor.preference.inventoryPref.ginSequence;

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
                var toast = $mdToast.simple().content('Inventory preference successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});

                // vm.Settings12thdoor.preference.invoicePref.defaultNote = backUp;
                // vm.Settings12thdoor.preference.invoicePref.offlinePayments = backUp1;
                // vm.Settings12thdoor.preference.inventoryPref.defaultNote = backUp2;
                // vm.Settings12thdoor.preference.estimatePref.defaultNote = backUp3;
                vm.spinnerService.hide('setting-inventoryPref-spinner');
            });
            client.ifError(function(data) { //false
                vm.spinnerService.hide('setting-inventoryPref-spinner');
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })

            client.tab('preference');
            client.postReq(vm.Settings12thdoor.preference);

        }

        function addreciptcusfieldsInventory(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefreciptcusfieldsInventoryController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/inventoryDialog/addReciptCusfieldsInventory.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.inventoryPref.reciptCusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.inventoryPref.reciptCusFiel.push(answer);
                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editreciptcusFieldsinventoryrow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefreciptcusfieldsInventoryController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/inventoryDialog/editReciptCusfieldsInventory.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.inventoryPref.reciptCusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.inventoryPref.reciptCusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.inventoryPref.reciptCusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.preference.inventoryPref.reciptCusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.preference.inventoryPref.reciptCusFiel);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        }

        function deletreciptcusfieldsinventory(recipCusFiel, index) {
            vm.Settings12thdoor.preference.inventoryPref.reciptCusFiel.splice(index, 1);
        }

        function addissuescusfieldsInventory(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefIssueCusFielController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/inventoryDialog/addIssueCusFiel.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.inventoryPref.issueCusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.inventoryPref.issueCusFiel.push(answer);
                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editissuecusFieldsinventoryrow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefIssueCusFielController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/inventoryDialog/editIssueCusFiel.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.inventoryPref.issueCusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.inventoryPref.issueCusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.inventoryPref.issueCusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.preference.inventoryPref.issueCusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.preference.inventoryPref.issueCusFiel);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        }

        function deletissuecusfieldsinventory(units, index) {
            vm.Settings12thdoor.preference.inventoryPref.issueCusFiel.splice(index, 1);
        }

        function loadingCurrentInventoryGRNSequence() {

            vm.prefixGRN = vm.Settings12thdoor.preference.inventoryPref.grnPrefix;
            vm.sequenceGRN = vm.Settings12thdoor.preference.inventoryPref.grnSequence;
            console.log(vm.prefixGRN);
            console.log(vm.sequenceGRN);

            var client = $serviceCall.setClient("getNextGRNnoRead", "inventory");
            client.ifSuccess(function(data) {
                console.log(data);
                if (data.length != 0) {

                    var client = $serviceCall.setClient("getNextGRNnoRead", "inventory");
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

                        var createdGRNCount = num.toString();
                        console.log(createdGRNCount);
                        vm.grnSequence = createdGRNCount;
                        loadingCurrentInventoryGINSequence();

                    });
                    client.ifError(function(data) {
                        vm.spinnerService.hide('setting-loadInventoryPref-spinner');
                        console.log("error loading GRN sequence")
                    })
                    client.pattern(vm.prefixGRN + vm.sequenceGRN);
                    client.getReq();

                }

            });
            client.ifError(function(data) {
                console.log("error loading GRN sequence")
            })
            client.pattern(vm.prefixGRN + vm.sequenceGRN);
            client.getReq();


        }

        function loadingCurrentInventoryGINSequence() {
            vm.prefix = vm.Settings12thdoor.preference.inventoryPref.ginPrefix;
            vm.sequence = vm.Settings12thdoor.preference.inventoryPref.ginSequence;
            console.log(vm.prefix);
            console.log(vm.sequence);

            var client = $serviceCall.setClient("getNextGINnoRead", "inventory");
            client.ifSuccess(function(data) {
                console.log(data);
                if (data.length != 0) {

                    var client = $serviceCall.setClient("getNextGINnoRead", "inventory");
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

                        var createdGINCount = num.toString();
                        console.log(createdGINCount);
                        vm.ginSequence = createdGINCount;
                        vm.spinnerService.hide('setting-loadInventoryPref-spinner');

                    });
                    client.ifError(function(data) {
                        vm.spinnerService.hide('setting-loadInventoryPref-spinner');
                        console.log("error loading GIN sequence")
                    })
                    client.pattern(vm.prefix + vm.sequence);
                    client.getReq();

                }

            });
            client.ifError(function(data) {
                console.log("error loading GIN sequence")
            })
            client.pattern(vm.prefix + vm.sequence);
            client.getReq();


        }

        function copyFromInvoiceDefaultNoteInv(data) {
            if (data) {
                vm.Settings12thdoor.preference.inventoryPref.defaultNote = vm.Settings12thdoor.preference.invoicePref.defaultNote;
            }
        }

        function editInventoryGRNSequence(data, sequence, ev) {
            console.log(data);
            $mdDialog.show({
                    controller: 'DialogPrefInventoryGRNSequenceChangeController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/inventoryDialog/editInventoryGRNSequenceChange.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: data,
                        sequence: sequence
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.grnSequence = answer.sequence;
                    vm.Settings12thdoor.preference.inventoryPref.grnPrefix = answer.prefix;
                    vm.Settings12thdoor.preference.inventoryPref.grnSequence = vm.grnSequence;
                    var client = $serviceCall.setClient("validateNewSequence", "setting"); // method name and service
                    client.ifSuccess(function(data) {
                        console.log(data);
                        if (data.isSuccess == true) {

                            var toast = $mdToast.simple().content(data.message).action('OK').highlightAction(false).position("top right");
                            $mdToast.show(toast).then(function() {});

                            var client = $serviceCall.setClient("saveGRNPrefixSequence", "setting"); // method name and service
                            client.ifSuccess(function(data) { //sucess  

                                var toast = $mdToast.simple().content('Successfully grn sequence saved').action('OK').highlightAction(false).position("top right");
                                $mdToast.show(toast).then(function() {});

                            });
                            client.ifError(function(data) { //false
                                var toast = $mdToast.simple().content('There was an error saving the grn sequence').action('OK').highlightAction(false).position("top right");
                                $mdToast.show(toast).then(function() {});
                            })

                            client.prefix(vm.Settings12thdoor.preference.inventoryPref.grnPrefix);
                            client.sequence(vm.grnSequence);
                            client.getReq();

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

                    client.prefix(vm.Settings12thdoor.preference.inventoryPref.grnPrefix);
                    client.sequence(vm.grnSequence);
                    client.preference('grnpref');
                    client.getReq();

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        }

        function editInventoryGINSequence(data, sequence, ev) {
            console.log(data);
            $mdDialog.show({
                    controller: 'DialogPrefInventoryGINSequenceChangeController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/inventoryDialog/editInventoryGINSequenceChange.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: data,
                        sequence: sequence
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.ginSequence = answer.sequence;
                    vm.Settings12thdoor.preference.inventoryPref.ginPrefix = answer.prefix;
                    vm.Settings12thdoor.preference.inventoryPref.ginSequence = vm.ginSequence;
                    var client = $serviceCall.setClient("validateNewSequence", "setting"); // method name and service
                    client.ifSuccess(function(data) {
                        console.log(data);
                        if (data.isSuccess == true) {

                            var toast = $mdToast.simple().content(data.message).action('OK').highlightAction(false).position("top right");
                            $mdToast.show(toast).then(function() {});

                            var client1 = $serviceCall.setClient("saveGINPrefixSequence", "setting"); // method name and service
                            client1.ifSuccess(function(data) { //sucess  
                                var toast = $mdToast.simple().content('Successfully gin sequence saved').action('OK').highlightAction(false).position("top right");
                                $mdToast.show(toast).then(function() {});
                            });
                            client1.ifError(function(data) { //false
                                var toast = $mdToast.simple().content('There was an error saving the gin sequence').action('OK').highlightAction(false).position("top right");
                                $mdToast.show(toast).then(function() {});
                            })

                            client1.prefix(vm.Settings12thdoor.preference.inventoryPref.ginPrefix);
                            client1.sequence(vm.ginSequence);
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

                    client.prefix(vm.Settings12thdoor.preference.inventoryPref.ginPrefix);
                    client.sequence(vm.ginSequence);
                    client.preference('ginpref');
                    client.getReq();


                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        }



    }

})();