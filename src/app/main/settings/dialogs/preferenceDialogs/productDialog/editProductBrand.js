(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogEditPrefproductBrandController', DialogEditPrefproductBrandController);

    /** @ngInject */
    function DialogEditPrefproductBrandController($scope, $mdDialog, edit, $mdSidenav, data) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.edit = edit;
        vm.productBrand = vm.edit.productBrand;

        function submit() {
            var number = Math.random();
            var obj = {};

            for (var i = data.length - 1; i >= 0; i--) {
                var oldLabel = data[i].productBrand;
                var newLabel = vm.productBrand;
                if(vm.edit.productBrand.toLowerCase() !== newLabel.toLowerCase()){
                    if (oldLabel.toLowerCase() == newLabel.toLowerCase()) {
                    vm.sameLabelName = true;
                    vm.erromessage = "Product brand already exist";
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
                obj.productBrand = vm.productBrand;
                obj.activate = vm.edit.activate;
                $mdDialog.hide(obj);
            }
          
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();