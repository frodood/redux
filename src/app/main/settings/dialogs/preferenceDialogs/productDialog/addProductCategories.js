(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogPrefProductCatController', DialogPrefProductCatController);

    /** @ngInject */
    function DialogPrefProductCatController($scope, $mdDialog, $mdSidenav, data) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !
        vm.sameLabelName = false;
        function submit() {
            var number = Math.random();
            var obj = {};

             for (var i = data.length - 1; i >= 0; i--) {
                var oldLabel = data[i].productCategory;
                var newLabel = vm.productCategory;
                if (oldLabel.toLowerCase() == newLabel.toLowerCase()) {
                    vm.sameLabelName = true;
                    vm.erromessage = "Product category already exist";
                    break;
                } else {
                    vm.sameLabelName = false;
                    vm.erromessage = "";
                }
            }

            if(!vm.sameLabelName){
                obj.id = number;
                obj.productCategory = vm.productCategory;
                obj.activate = true;
                $mdDialog.hide(obj);
            }
           
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();