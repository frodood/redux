(function()
{
	'use strict';

	angular
		.module('app.core')
		.directive('msScreenResizeComponent', msScreenResizeComponent);

	/** @ngInject */
	function msScreenResizeComponent($window)
	{
		var screenResizeComponentDirective = {
            restrict   : 'A',
            link : function(scope, element, attrs){

                var w = angular.element($window);

                scope.$watch(function(){
                    return{
                        'h': window.innerHeight,
                        'w': window.innerWidth
                    };
                }, function(newValue, oldValue){
                    scope.windowHeight = newValue.h;
                    scope.windowWidth = newValue.w;

                    scope.resizeWithOffset = function(offSetHeight){
                        return {
                            'height': (newValue.h - offSetHeight) + 'px'
                        };
                    };
                }, true);

                w.bind('resize', function(){
                    scope.$apply();
                });
               
            }
		};

		return screenResizeComponentDirective;
    };
 
})();