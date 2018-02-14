(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogOnlinePaymentConfigSetController', DialogOnlinePaymentConfigSetController);

    /** @ngInject */
    function DialogOnlinePaymentConfigSetController($scope, $mdDialog, onlinepay, $mdSidenav) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.submit = submit;
        vm.onlinePaymentGateway = onlinepay;



        function submit(obj) {
            $mdDialog.hide(obj);
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();