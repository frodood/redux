(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogEditPrefPaymentMethodController', DialogEditPrefPaymentMethodController);

    /** @ngInject */
    function DialogEditPrefPaymentMethodController($scope, $mdDialog, edit, data, $mdSidenav) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code 
        vm.edit = edit;

        vm.paymentMethod = vm.edit.paymentMethod;

        function submit() {
            var objEdit = {};

            for (var i = data.length - 1; i >= 0; i--) {
                var oldLabel = data[i].paymentMethod;
                var newLabel = vm.paymentMethod;
                if(vm.edit.paymentMethod.toLowerCase() !== newLabel.toLowerCase()){
                    if (oldLabel.toLowerCase() == newLabel.toLowerCase()) {
                        vm.sameLabelName = true;
                        vm.erromessage = "Offline payment method already exist";
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
                objEdit.id = vm.edit.id;
                objEdit.paymentMethod = vm.paymentMethod;
                objEdit.activate = vm.edit.activate;
                objEdit.paymentType = "Offline";
                $mdDialog.hide(objEdit);
            }
            
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();