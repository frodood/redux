(function()
{
	'use strict';

	angular
		.module('app.core')
		.directive('msScrollHeightFixComponent', msScrollHeightFixComponent);

	/** @ngInject */
	function msScrollHeightFixComponent($window)
	{
		var msScrollHeightFixComponentDirective = {
			restrict   : 'A',
			scope: {
                scrolloffsetHeight : '='
            },
            transclude:false,
            link : function(scope, element, attrs){

                var w = angular.element($window);
                
                console.log(attrs.scrolloffsetHeight);
                console.log(scope.scrolloffsetHeight);

                if(attrs.scrolloffsetHeight && scope.scrolloffsetHeight > 0){
                    scope.$watch(function(){
                        return{
                            'h': window.innerHeight,
                            'w': window.innerWidth
                        };
                    }, function(newValue, oldValue){
                        scope.windowHeight = newValue.h;
                        scope.windowWidth = newValue.w;

                        scope.setScrollContH = (newValue.h - scope.scrolloffsetHeight) + 'px';
                        element.css('height',scope.setScrollContH);
                    }, true);

                    w.bind('resize', function(){
                        scope.$apply();
                    });
                }else{
                    scope.setScrollContH = "100%";
                }
            }
		};

		return msScrollHeightFixComponentDirective;
    };
 
})();