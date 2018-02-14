(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogPrefICustomerCusfieldContactController', DialogPrefICustomerCusfieldContactController);

    /** @ngInject */
    function DialogPrefICustomerCusfieldContactController($scope, $mdDialog, $mdSidenav, CusfieldContact) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        vm.fields = [];

        vm.inputType = "";

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        console.log(CusfieldContact);

        vm.sameLabelName = false;
        vm.enterTag = false;

        function submit() {

            for (var i = CusfieldContact.length - 1; i >= 0; i--) {
                var oldLabel = CusfieldContact[i].labelShown;
                var newLabel = vm.labelShown;
                if (oldLabel.toLowerCase() == newLabel.toLowerCase()) {
                    vm.sameLabelName = true;
                    vm.erromessage = "Label already exist";
                    break;
                } else {
                    vm.sameLabelName = false;
                    vm.erromessage = "";
                }
            }

            if (!vm.sameLabelName) {
                if (vm.type == "textBox") {
                    var number = Math.random();
                    var obj = {};
                    obj.id = number;
                    obj.labelShown = vm.labelShown;
                    obj.inputType = vm.inputType;
                    obj.fields = vm.fields;
                    obj.type = vm.type;
                    obj.showOnPdf = vm.showOnPdf;
                    $mdDialog.hide(obj);
                }
                if (vm.type == "selectBox") {
                    var number = Math.random();
                    var obj = {};
                    obj.id = number;
                    obj.labelShown = vm.labelShown;
                    obj.inputType = vm.inputType;
                    obj.fields = vm.fields;
                    obj.type = vm.type;
                    obj.showOnPdf = vm.showOnPdf;
                    if (vm.fields.length != 0) {
                        $mdDialog.hide(obj);
                    } else {
                        vm.enterTag = true;
                    }
                }

            }

        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();