(function(){

	'use strict';

	angular
		.module('app.core')
        .controller('MsPermElemController', MsPermElemController)
        .directive('msPermElem', msPermElem);

    /** @ngInject */
    function msPermElem()
    {

        var msPermElemDirective = {
            restrict : 'A',
            scope: {},
            bindToController : {
                permContext : '=',
                permAction : '='
            },
            controller : MsPermElemController,
            controllerAs : 'vm'
        };

        return msPermElemDirective;
    };

    /** @ngInject */
    function MsPermElemController($rootScope, $scope, $element, $attrs){

        var vm = this;

        var lclConPermMatrix,
                glblPermMatrix = $rootScope.permissionMatrix;

        for(var i = 0; i < glblPermMatrix.length; i++){
            if(glblPermMatrix[i].appName === dircaptxt(vm.permContext)){
                lclConPermMatrix = glblPermMatrix[i];

                if(lclConPermMatrix.hasOwnProperty(vm.permAction) && !lclConPermMatrix[vm.permAction]){
                    $element.remove();
                };
            };
        };

        function dircaptxt(s){
            return s && s[0].toUpperCase() + s.slice(1);
        };       

    };

})();