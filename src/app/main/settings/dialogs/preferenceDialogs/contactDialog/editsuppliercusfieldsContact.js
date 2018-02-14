(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogEditPrefISupplierCusfieldContactController', DialogEditPrefISupplierCusfieldContactController);

    /** @ngInject */
    function DialogEditPrefISupplierCusfieldContactController($scope, $mdDialog, edit, CusfieldSupplier, $mdSidenav) {
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
        vm.edit = edit;
        vm.enterTag = false;

        vm.button = "Edit";
        vm.type = vm.edit.type;
        console.log(vm.type);
        vm.labelShown = vm.edit.labelShown;
        vm.inputType = vm.edit.inputType;
        vm.fields = vm.edit.fields;
        vm.showOnPdf = vm.edit.showOnPdf;

        function submit() {
            var objEdit = {};

            for (var i = CusfieldSupplier.length - 1; i >= 0; i--) {
                var oldLabel= CusfieldSupplier[i].labelShown;
                var newLabel = vm.labelShown;
                debugger;
                if(vm.edit.labelShown !== newLabel){
                    if(oldLabel.toLowerCase()==newLabel.toLowerCase()){
                        vm.sameLabelName=true;
                        vm.erromessage="Label already exist";
                        break;
                    }else{
                        vm.sameLabelName=false;
                        vm.erromessage="";
                    }
                }
                else{
                vm.sameLabelName=false;
                vm.erromessage="";
                }
            }

            if(!vm.sameLabelName){
                if (vm.type == 'textBox') {
                    objEdit.id = vm.edit.id;
                    objEdit.labelShown = vm.labelShown;
                    objEdit.inputType = vm.inputType;
                    objEdit.fields = [];
                    objEdit.type = vm.type;
                    objEdit.showOnPdf = vm.showOnPdf;
                    console.log(objEdit);
                    $mdDialog.hide(objEdit);
                } else {
                    objEdit.id = vm.edit.id;
                    objEdit.labelShown = vm.labelShown;
                    objEdit.inputType = "";
                    objEdit.fields = vm.fields;
                    objEdit.type = vm.type;
                    objEdit.showOnPdf = vm.showOnPdf;
                    console.log(objEdit);
                    $mdDialog.hide(objEdit);
                    if (vm.fields.length != 0) {
                        $mdDialog.hide(objEdit);
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