(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('templatesViewController', templatesViewController);

    /** @ngInject */
    function templatesViewController($scope, $rootScope, $document, $mdDialog, $mdToast, $mdMedia, $serviceCall, $mdSidenav, $state, msApi, $auth, $apis, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.spinnerService = msSpinnerService;

        vm.settingLoadTemplateDetailsSpinnerLoaded = settingLoadTemplateDetailsSpinnerLoaded;

        function settingLoadTemplateDetailsSpinnerLoaded(templateSpinner){
            templateSpinner.show('setting-loadTemplateDetails-spinner');
        };

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.activatetemplate = activatetemplate;

        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting");
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                vm.spinnerService.hide('setting-loadTemplateDetails-spinner');
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadTemplateDetails-spinner');
                console.log("There was an error, when data loading", "error");
            })

            client.skip(0);
            client.take(1);
            client.orderby();
            client.getReq();
        }
        loadSetting();

        function saveTemplate() {
            var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
            client.ifSuccess(function(data) { //sucess  
                var toast = $mdToast.simple().content('Templates successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });
            client.ifError(function(data) { //false
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.tab('templates');
            client.postReq(vm.Settings12thdoor.templates);
        }


        //still only check invoice template for now.........
        function activatetemplate(data) {
            var confirm = $mdDialog.confirm()
                .title('Do you wish to change current invoice template?')
                .content('')
                .ariaLabel('')
                .targetEvent()
                .ok('Ok')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function() {

                for (var i = vm.Settings12thdoor.templates.length - 1; i >= 0; i--) {

                    if (vm.Settings12thdoor.templates[i].templateID == data.templateID) {
                        if (data.status == "Activate") {

                            for (var j = vm.Settings12thdoor.templates.length - 1; j >= 0; j--) {
                                if (vm.Settings12thdoor.templates[j].activated == true && vm.Settings12thdoor.templates[j].type == "Invoice") {
                                    console.log(vm.Settings12thdoor.templates[j]);
                                    vm.Settings12thdoor.templates[j].status = "Activate";
                                    vm.Settings12thdoor.templates[j].activated = false;
                                }
                            }

                            var element = document.getElementById(data.templateID);
                            element.setAttribute("class", "tintImage");
                            data.status = "Inactivate";
                            vm.Settings12thdoor.templates[i].status = "Inactivate";
                            vm.Settings12thdoor.templates[i].activated = true;
                        }
                        //                        else{
                        //                          var element = document.getElementById(data.templateID);
                        //                          element.setAttribute("class", "");
                        //                          data.status="Activate";
                        //                          vm.Settings12thdoor.templates[i].status="Activate";
                        //                          vm.Settings12thdoor.templates[i].activated=false;
                        //                        }

                    }
                }
                saveTemplate();
            });


        }

    }
})();