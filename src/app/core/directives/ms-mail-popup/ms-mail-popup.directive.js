(function()
{
    'use strict';

    angular
        .module('app.core')
        .controller('MsMailPopupControllerController',MsMailPopupControllerController)
        .directive('msMailPopup',msMailPopupDirective);

    /** @ngInject */
    function msMailPopupDirective()
    {
        var msMailPopupDirective = {
            restrict        : 'E',
            templateUrl     : 'app/core/directives/ms-mail-popup/ms-mail-popup.html',
            scope: {
                bindconfiguration: '='
            },
            controller      : MsMailPopupControllerController,
            controllerAs    : 'vm',
            bindToController: true 
        };

        return msMailPopupDirective;
    }

    /** @ngInject */
    function MsMailPopupControllerController($rootScope, $scope, $http, $state, $stateParams, $mdSidenav, activityContextService)
    {
        var vm = this;

        // Data
        vm.form = {
            from: 'johndoe@creapond.com' //passed for the bound configuration
        };

        vm.hiddenCC = true; //passed for the bound configuration
        vm.hiddenBCC = true; //passed for the bound configuration
 
        // If replying
        if ( angular.isDefined(selectedMail) )
        {
            vm.form.to = selectedMail.from.email;
            vm.form.subject = 'RE: ' + selectedMail.subject; //passed for the bound configuration
            vm.form.message = '<blockquote>' + selectedMail.message + '</blockquote>'; //passed for the bound configuration
        }

        // Methods
        vm.closeDialog = closeDialog;

        //////////

        function closeDialog()
        {
            $mdDialog.hide();
        }
    }

})();