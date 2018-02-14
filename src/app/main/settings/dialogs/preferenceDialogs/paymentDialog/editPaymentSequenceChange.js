(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogPrefPaymentSequenceChangeController', DialogPrefPaymentSequenceChangeController);

    /** @ngInject */
    function DialogPrefPaymentSequenceChangeController($scope, $mdDialog, data, sequence,$mdSidenav) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.submit = submit;

        vm.fields = [];

        vm.inputType = "";

        vm.enterTag = false;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code 
        vm.changeSequence = sequence;
        vm.changePrefix=data;

        function submit() {
            var obj ={};
            obj.sequence = vm.changeSequence;
            obj.prefix = vm.changePrefix;
            $mdDialog.hide(obj);
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();