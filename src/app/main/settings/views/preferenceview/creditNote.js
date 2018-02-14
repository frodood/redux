(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('creditNotePreferenceCtrl', creditNotePreferenceCtrl);

    /** @ngInject */
    function creditNotePreferenceCtrl($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.spinnerService = msSpinnerService;

        vm.settingCreditNotePrefSpinnerLoaded = settingCreditNotePrefSpinnerLoaded;

        function settingCreditNotePrefSpinnerLoaded(creditNotePrefSpinner){
            creditNotePrefSpinner.show('setting-loadCreditNotePref-spinner');
        }

        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                loadingCurrentCreditNoteSequence();
                
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadCreditNotePref-spinner');
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
        vm.editCreditNoteSequence = editCreditNoteSequence;
        vm.addcusfieldsCreditNote = addcusfieldsCreditNote;
        vm.editCreditNotecusFieldsrow = editCreditNotecusFieldsrow;
        vm.deleteCreditNotecusfieldsrow = deleteCreditNotecusfieldsrow;


        function save() {

            vm.spinnerService.show('setting-creditNotePref-spinner');

            vm.Settings12thdoor.preference.creditNotePref.creditNoteSequence = vm.Settings12thdoor.preference.creditNotePref.creditNoteSequence;
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
                var toast = $mdToast.simple().content('Credit note preference successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                // vm.Settings12thdoor.preference.invoicePref.defaultNote = backUp;
                // vm.Settings12thdoor.preference.invoicePref.offlinePayments = backUp1;
                // vm.Settings12thdoor.preference.inventoryPref.defaultNote = backUp2;
                // vm.Settings12thdoor.preference.estimatePref.defaultNote = backUp3;
                vm.spinnerService.hide('setting-creditNotePref-spinner');
            });
            client.ifError(function(data) { //false
                vm.spinnerService.hide('setting-creditNotePref-spinner');
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.tab('preference');
            client.postReq(vm.Settings12thdoor.preference);
        };

        function loadingCurrentCreditNoteSequence() {
            vm.prefix = vm.Settings12thdoor.preference.creditNotePref.creditNotePrefix;
            vm.sequence = vm.Settings12thdoor.preference.creditNotePref.creditNoteSequence;
            console.log(vm.prefix);
            console.log(vm.sequence);

            var client = $serviceCall.setClient("getNextNo", "creditNote");
            client.ifSuccess(function(data) {
                console.log(data);
                if (data.length != 0) {

                    var client = $serviceCall.setClient("getNextNo", "creditNote");
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

                        var createdCreditNoteCount = num.toString();
                        vm.creditNoteSequence = createdCreditNoteCount;

                    });
                    client.ifError(function(data) {
                        console.log("error loading credit note sequence")
                    })
                    client.pattern(vm.prefix + vm.sequence);
                    client.getReq();

                }

                vm.spinnerService.hide('setting-loadCreditNotePref-spinner');

            });
            client.ifError(function(data) {
                console.log("error loading credit note sequence")
            })
            client.pattern(vm.prefix + vm.sequence);
            client.getReq();


        }

        function editCreditNoteSequence(data, sequence, ev) {
            console.log(data);
            $mdDialog.show({
                    controller: 'DialogPrefCreditNoteSequenceChangeController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/creditNoteDialog/editCreditNoteSequenceChange.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: data,
                        sequence: sequence
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    debugger;
                    vm.creditNoteSequence = answer.sequence;
                    vm.Settings12thdoor.preference.creditNotePref.creditNotePrefix = answer.prefix;
                    vm.Settings12thdoor.preference.creditNotePref.creditNoteSequence = vm.creditNoteSequence;
                    var client = $serviceCall.setClient("validateNewSequence", "setting"); // method name and service
                    client.ifSuccess(function(data) {
                        console.log(data);
                        if (data.isSuccess == true) {

                            var toast = $mdToast.simple().content(data.message).action('OK').highlightAction(false).position("top right");
                            $mdToast.show(toast).then(function() {});

                            var client1 = $serviceCall.setClient("saveCreditNotePrefixSequence", "setting"); // method name and service
                            client1.ifSuccess(function(data) { //sucess  ] 
                                var toast = $mdToast.simple().content('Successfully credit note sequence saved').action('OK').highlightAction(false).position("top right");
                                $mdToast.show(toast).then(function() {});
                            });
                            client1.ifError(function(data) { //false
                                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                                $mdToast.show(toast).then(function() {});
                            })
                            client1.prefix(vm.Settings12thdoor.preference.creditNotePref.creditNotePrefix);
                            client1.sequence(vm.creditNoteSequence);
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

                    client.prefix(vm.Settings12thdoor.preference.creditNotePref.creditNotePrefix);
                    client.sequence(vm.creditNoteSequence);
                    client.preference('creditNotePref');
                    client.getReq();

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        }

         function addcusfieldsCreditNote(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefCusfieldCreditNoteController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/creditNoteDialog/addCusfieldsCreditNote.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.preference.creditNotePref.cusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.creditNotePref.cusFiel.push(answer);

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editCreditNotecusFieldsrow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefICusfieldCreditNoteController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/creditNoteDialog/editCusfieldsCreditNote.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit,
                        data: vm.Settings12thdoor.preference.creditNotePref.cusFiel
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.creditNotePref.cusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.creditNotePref.cusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.preference.creditNotePref.cusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.preference.creditNotePref.cusFiel);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        };

        function deleteCreditNotecusfieldsrow(creditNoteCusField, index) {
            vm.Settings12thdoor.preference.creditNotePref.cusFiel.splice(index, 1);
        };



    }

})();