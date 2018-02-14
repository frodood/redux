(function()
{
	'use strict';

	angular
		.module('app.core')
		.directive('msHeightFixComponent', msHeightFixComponent);

	/** @ngInject */
	function msHeightFixComponent($window)
	{
		var heightFixComponentDirective = {
            restrict   : 'A',
            link : function(scope, element, attrs){

                var w = angular.element($window);
                
                console.log(window.innerHeight);

                // scope.$watch(function(){
                //     return{
                //         'h': window.innerHeight,
                //         'w': window.innerWidth
                //     };
                // }, function(newValue, oldValue){
                //     scope.windowHeight = newValue.h;
                //     scope.windowWidth = newValue.w;

                //     scope.resizeWithOffset = function(offSetHeight){
                //         return {
                //             'height': (newValue.h - offSetHeight) + 'px'
                //         };
                //     };
                // }, true);

                // w.bind('resize', function(){
                //     scope.$apply();
                // });
               
            }
		};

		return heightFixComponentDirective;
    };
 
})();