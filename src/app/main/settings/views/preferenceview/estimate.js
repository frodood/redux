(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('estimatePreferenceCtrl', estimatePreferenceCtrl);

    /** @ngInject */
    function estimatePreferenceCtrl($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.spinnerService = msSpinnerService;

        vm.settingEstimatePrefSpinnerLoaded = settingEstimatePrefSpinnerLoaded; 
        
        function settingEstimatePrefSpinnerLoaded(estimatespinner){
            estimatespinner.show('setting-loadEstimatePref-spinner');
        }

        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                
                if (vm.Settings12thdoor.preference.estimatePref.copyFromInvoiceDefaultNote == true) {
                    vm.Settings12thdoor.preference.estimatePref.defaultNote = vm.Settings12thdoor.preference.invoicePref.defaultNote;
                }
                if (vm.Settings12thdoor.preference.estimatePref.copyFromInvoiceDefaultComment == true) {
                    vm.Settings12thdoor.preference.estimatePref.defaultComment = vm.Settings12thdoor.preference.invoicePref.defaultComment;
                }
                loadingCurrentEstimateSequence();
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadEstimatePref-spinner');
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
        vm.addcusfieldsEstimate = addcusfieldsEstimate;
        vm.editestimatecusFieldsrow = editestimatecusFieldsrow;
        vm.deleteestimatecusfieldsrow = deleteestimatecusfieldsrow;
        vm.copyFromInvoiceDefaultComment = copyFromInvoiceDefaultComment;
        vm.copyFromInvoiceDefaultNote = copyFromInvoiceDefaultNote;
        vm.editEstimateSequence = editEstimateSequence;

        function save() {
                vm.spinnerService.show('setting-estimatePref-spinner');
                vm.Settings12thdoor.preference.estimatePref.estimateSequence = vm.Settings12thdoor.preference.estimatePref.estimateSequence;
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
                    var toast = $mdToast.simple().content('Estimate preference successfully saved').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                    // vm.Settings12thdoor.preference.invoicePref.defaultNote = backUp;
                    // vm.Settings12thdoor.preference.invoicePref.offlinePayments = backUp1;
                    // vm.Settings12thdoor.preference.inventoryPref.defaultNote = backUp2;
                    // vm.Settings12thdoor.preference.estimatePref.defaultNote = backUp3;
                    vm.spinnerService.hide('setting-estimatePref-spinner');
                });
                client.ifError(function(data) { //false 
                    vm.spinnerService.hide('setting-estimatePref-spinner');
                    var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                });
                client.tab('preference');
                client.postReq(vm.Settings12thdoor.preference);

        };


        function addcusfieldsEstimate(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefCusfieldEstimateController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/estimateDialog/addCusfieldsEstimate.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.estimatePref.cusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.estimatePref.cusFiel.push(answer);

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editestimatecusFieldsrow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefICusfieldEstimateController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/estimateDialog/editCusfieldsEstimate.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.estimatePref.cusFiel
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.estimatePref.cusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.estimatePref.cusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.preference.estimatePref.cusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.preference.estimatePref.cusFiel);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        };

        function deleteestimatecusfieldsrow(estimateCusField, index) {
            vm.Settings12thdoor.preference.estimatePref.cusFiel.splice(index, 1);
        };



        function loadingCurrentEstimateSequence() {
            console.log(vm.Settings12thdoor.preference);
            console.log(vm.Settings12thdoor.preference.estimatePref.estimatePrefix);
            vm.prefix = vm.Settings12thdoor.preference.estimatePref.estimatePrefix;
            vm.sequence = vm.Settings12thdoor.preference.estimatePref.estimateSequence;
            console.log(vm.prefix);
            console.log(vm.sequence);

            var client = $serviceCall.setClient("getNextNo", "estimate");
            client.ifSuccess(function(data) {
                console.log(data);
                if (data.length != 0) {

                    var client = $serviceCall.setClient("getNextNo", "estimate");
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

                        var createdEstimatesCount = num.toString();
                        vm.estimateSequence = createdEstimatesCount;
                        vm.spinnerService.hide('setting-loadEstimatePref-spinner');

                    });
                    client.ifError(function(data) {
                        vm.spinnerService.hide('setting-loadEstimatePref-spinner');
                        console.log("error loading estimate sequence");
                    })
                    client.pattern(vm.prefix + vm.sequence);
                    client.getReq();

                }

            });
            client.ifError(function(data) {
                console.log("error loading estimate sequence")
            })
            client.pattern(vm.prefix + vm.sequence);
            client.getReq();


        };

        function copyFromInvoiceDefaultComment(data) {
            if (data) {
                vm.Settings12thdoor.preference.estimatePref.defaultComment = vm.Settings12thdoor.preference.invoicePref.defaultComment;
            }

        }

        function copyFromInvoiceDefaultNote(data) {
            if (data) {
                vm.Settings12thdoor.preference.estimatePref.defaultNote = vm.Settings12thdoor.preference.invoicePref.defaultNote;
            }
        }

        function editEstimateSequence(data, sequence, ev) {
            console.log(data);
            $mdDialog.show({
                    controller: 'DialogPrefEstimateSequenceChangeController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/estimateDialog/editEstimateSequenceChange.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: data,
                        sequence:sequence
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    debugger;
                    vm.estimateSequence = answer.sequence;
                    vm.Settings12thdoor.preference.estimatePref.estimatePrefix= answer.prefix;
                    vm.Settings12thdoor.preference.estimatePref.estimateSequence = vm.estimateSequence;
                    var client = $serviceCall.setClient("validateNewSequence", "setting"); // method name and service
                    client.ifSuccess(function(data) {
                    console.log(data);
                    if (data.isSuccess == true) {
                        var toast = $mdToast.simple().content(data.message).action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});

                        var client1 = $serviceCall.setClient("saveEstimatePrefixSequence", "setting"); // method name and service
                        client1.ifSuccess(function(data) { //sucess  
                            var toast = $mdToast.simple().content('Successfully estimate sequence saved').action('OK').highlightAction(false).position("top right");
                            $mdToast.show(toast).then(function() {});
                        });
                        client1.ifError(function(data) { //false
                            var toast = $mdToast.simple().content('There was an error saving the invoice sequence').action('OK').highlightAction(false).position("top right");
                            $mdToast.show(toast).then(function() {});
                        })
                        
                        client1.prefix(vm.Settings12thdoor.preference.estimatePref.estimatePrefix);
                        client1.sequence(vm.estimateSequence);
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

                client.prefix(vm.Settings12thdoor.preference.estimatePref.estimatePrefix);
                client.sequence(vm.estimateSequence);
                client.preference('estimatePref');
                client.getReq();

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        }


    }

})();
