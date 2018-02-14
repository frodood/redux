(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogEditPrefExpenseCategoryController', DialogEditPrefExpenseCategoryController);

    /** @ngInject */
    function DialogEditPrefExpenseCategoryController($scope, $mdDialog, edit, data, $mdSidenav) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code 
        vm.edit = edit;

        vm.expenseCategory = vm.edit.expenseCategory;
        vm.expenseType = vm.edit.expenseType;

        function submit() {
            var objEdit = {};
            for (var i = data.length - 1; i >= 0; i--) {
                var oldLabel = data[i].expenseCategory;
                var newLabel = vm.expenseCategory;
                if(vm.edit.expenseCategory.toLowerCase() !== newLabel.toLowerCase()){
                    if (oldLabel.toLowerCase() == newLabel.toLowerCase()) {
                    vm.sameLabelName = true;
                    vm.erromessage = "Expense category already exist";
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
                objEdit.expenseCategory = vm.expenseCategory;
                objEdit.expenseType = vm.expenseType;
                objEdit.activate = vm.edit.activate;
                $mdDialog.hide(objEdit);
            }
            
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();