(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('projectPreferenceCtrl', projectPreferenceCtrl);

    /** @ngInject */
    function projectPreferenceCtrl($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.spinnerService = msSpinnerService;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.settingProjectPrefSpinnerLoaded = settingProjectPrefSpinnerLoaded;
        function settingProjectPrefSpinnerLoaded(projectSpinner){
            projectSpinner.show('setting-loadProjectPref-spinner');
        }

        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                vm.spinnerService.hide('setting-loadProjectPref-spinner');
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadProjectPref-spinner');
                var toast = $mdToast.simple().content('There was an error, when data loading').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })

            client.skip(0);
            client.take(1);
            client.orderby();
            client.getReq();
        }
        loadSetting();

        vm.inactivateTaskProjectrow = "Inactivate";
        vm.save = save;
        vm.addtaskProject = addtaskProject;
        vm.edittaskProjectrow = edittaskProjectrow;
        vm.deletetaskProject = deletetaskProject;
        vm.inactivateTaskProject = inactivateTaskProject;

        function save() {

            vm.spinnerService.show('setting-projectPref-spinner');
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
                var toast = $mdToast.simple().content('Project preference successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                // vm.Settings12thdoor.preference.invoicePref.defaultNote = backUp;
                // vm.Settings12thdoor.preference.invoicePref.offlinePayments = backUp1;
                // vm.Settings12thdoor.preference.inventoryPref.defaultNote = backUp2;
                // vm.Settings12thdoor.preference.estimatePref.defaultNote = backUp3;
                vm.spinnerService.hide('setting-projectPref-spinner');
            });
            client.ifError(function(data) { //false
                vm.spinnerService.hide('setting-projectPref-spinner');
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.tab('preference');
            client.postReq(vm.Settings12thdoor.preference);
        }

        function addtaskProject(ev) {
            $mdDialog.show({
                    controller: 'DialogPrefaddtaskProjectController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/projectDialog/addtaskProject.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    vm.Settings12thdoor.preference.project.task.push(answer);
                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function edittaskProjectrow(edit, ev) {
            $mdDialog.show({
                    controller: 'DialogEditPrefaddtaskProjectController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/preferenceDialogs/projectDialog/edittaskProject.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edit: edit
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {
                    for (var i = vm.Settings12thdoor.preference.project.task.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.preference.project.task[i].id == answer.id) {
                            vm.Settings12thdoor.preference.project.task[i] = answer;
                            console.log(vm.Settings12thdoor.preference.project.task);
                            break;
                        }

                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function deletetaskProject(units, index) {
            vm.Settings12thdoor.preference.project.task.splice(index, 1);
        };

        function inactivateTaskProject(data, index) {
            for (var i = vm.Settings12thdoor.preference.project.task.length - 1; i >= 0; i--) {
                if (vm.Settings12thdoor.preference.project.task[i].id == data.id) {
                    if (data.activate) {
                        data.activate = false;
                        vm.inactivateTaskProjectrow = "Activate";
                        vm.Settings12thdoor.preference.project.task[i].activate = false;
                    } else {
                        data.activate = true;
                        vm.inactivateTaskProjectrow = "Inactivate";
                        vm.Settings12thdoor.preference.project.task[i].activate = true;
                    }
                }
            }

        };

    }

})();