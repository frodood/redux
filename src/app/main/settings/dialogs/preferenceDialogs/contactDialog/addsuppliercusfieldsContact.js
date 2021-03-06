(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogPrefISupplierCusfieldContactController', DialogPrefISupplierCusfieldContactController);

    /** @ngInject */
    function DialogPrefISupplierCusfieldContactController($scope, $mdDialog, $mdSidenav, CusfieldSupplier) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        vm.fields = [];

        vm.inputType = "";

        vm.sameLabelName = false;
        vm.enterTag = false;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        function submit() {

            for (var i = CusfieldSupplier.length - 1; i >= 0; i--) {
                var oldLabel = CusfieldSupplier[i].labelShown;
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