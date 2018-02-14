(function ()
{
    'use strict';

    angular
      .module('app.playground')
      .controller('PlaygroundListCloneController', PlaygroundListCloneController)

    /** @ngInject */
    function PlaygroundListCloneController($rootScope, $scope, $mdDialog, $timeout)
    {
        var vm = this;

        // alert('you are now viewing a list view clone on the playground !');

        vm.currentThread = false; // to check if on current thread

        vm.primaryToolbarContext = true; // to check if primary toolbar context is set
        
        vm.ListSummary = [];
    }  
})();
