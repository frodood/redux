(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogEditPrefaddUnitController', DialogEditPrefaddUnitController);

    /** @ngInject */
    function DialogEditPrefaddUnitController($scope, $mdDialog, edit, data, $mdSidenav) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.edit = edit;
        vm.unitsOfMeasurement = vm.edit.unitsOfMeasurement;

        function submit() {

            var objEdit = {};
            for (var i = data.length - 1; i >= 0; i--) {
                var oldLabel = data[i].unitsOfMeasurement;
                var newLabel = vm.unitsOfMeasurement;
                if(vm.edit.unitsOfMeasurement.toLowerCase() !== newLabel.toLowerCase()){
                    if (oldLabel.toLowerCase() == newLabel.toLowerCase()) {
                        vm.sameLabelName = true;
                        vm.erromessage = "Unit of measure already exist";
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
                objEdit.unitsOfMeasurement = vm.unitsOfMeasurement;
                objEdit.activate = vm.edit.activate;
                $mdDialog.hide(objEdit);
            }

            
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();