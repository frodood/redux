(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogPrefAddExpenseCategoryController', DialogPrefAddExpenseCategoryController);

    /** @ngInject */
    function DialogPrefAddExpenseCategoryController($scope, $mdDialog, $mdSidenav, data) {
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
            for (var i = data.length - 1; i >= 0; i--) {
                var oldLabel = data[i].expenseCategory;
                var newLabel = vm.expenseCategory;
                if (oldLabel.toLowerCase() == newLabel.toLowerCase()) {
                    vm.sameLabelName = true;
                    vm.erromessage = "Expense category already exist";
                    break;
                } else {
                    vm.sameLabelName = false;
                    vm.erromessage = "";
                }
            }

            if (!vm.sameLabelName) {
                var number = Math.random();
                var obj = {};
                obj.id = number;
                obj.expenseCategory = vm.expenseCategory,
                obj.expenseType = vm.expenseType,
                    obj.activate = true
                $mdDialog.hide(obj);
            }

        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();