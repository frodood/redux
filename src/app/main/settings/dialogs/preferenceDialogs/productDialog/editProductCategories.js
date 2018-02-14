(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogEditPrefProductCatController', DialogEditPrefProductCatController);

    /** @ngInject */
    function DialogEditPrefProductCatController($scope, $mdDialog, edit, $mdSidenav, data) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.edit = edit;
        vm.productCategory = vm.edit.productCategory;

        function submit() {
            var obj = {};

            for (var i = data.length - 1; i >= 0; i--) {
                var oldLabel = data[i].productCategory;
                var newLabel = vm.productCategory;
                if(vm.edit.productCategory.toLowerCase() !== newLabel.toLowerCase()){
                    if (oldLabel.toLowerCase() == newLabel.toLowerCase()) {
                    vm.sameLabelName = true;
                    vm.erromessage = "Product category already exist";
                        break;
                    } else {
                        vm.sameLabelName = false;
                        vm.erromessage = "";
                    }
                }
                else{
                    vm.sameLabelName = false;
                    vm.erromessage = "";
                }
                
            }

            if(!vm.sameLabelName){
                obj.id = vm.edit.id;
                obj.productCategory = vm.productCategory;
                obj.activate = vm.edit.activate;
                $mdDialog.hide(obj);
            }
           
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();