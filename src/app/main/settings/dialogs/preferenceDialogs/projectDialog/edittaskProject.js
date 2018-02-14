(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogEditPrefaddtaskProjectController', DialogEditPrefaddtaskProjectController);

    /** @ngInject */
    function DialogEditPrefaddtaskProjectController($scope, $mdDialog, edit, $mdSidenav) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.edit = edit;
        vm.task = vm.edit.task;
        vm.hourlyRate = vm.edit.rate;

        function submit() {
            var number = Math.random();
            var objEdit = {};
            objEdit.id = vm.edit.id;
            objEdit.task = vm.task;
            objEdit.rate = vm.hourlyRate;
            objEdit.activate = vm.edit.activate;
            $mdDialog.hide(objEdit);
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();