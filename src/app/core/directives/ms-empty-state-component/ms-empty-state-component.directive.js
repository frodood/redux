(function()
{
	'use strict';

	angular
		.module('app.core')
		.directive('msEmptyStateComponent', msEmptyStateComponent);

	/** @ngInject */
	function msEmptyStateComponent($window)
	{
		var emptystateComponentDirective = {
			restrict   : 'E',
			scope: {
                stateContext : '=',
                stateHeader : '=',
                stateMessage : '=',
                offsetHeight : '=',
                componentSize : "="
            },
            transclude:false,
            templateUrl : 'app/core/directives/ms-empty-state-component/ms-empty-state-component.html',
            link : function(scope, element, attrs){

                var w = angular.element($window);

                if(attrs.offsetHeight && scope.offsetHeight > 0){
                    scope.$watch(function(){
                        return{
                            'h': window.innerHeight,
                            'w': window.innerWidth
                        };
                    }, function(newValue, oldValue){
                        scope.windowHeight = newValue.h;
                        scope.windowWidth = newValue.w;

                        scope.setHeight = (newValue.h - scope.offsetHeight) + 'px';
                    }, true);

                    w.bind('resize', function(){
                        scope.$apply();
                    });
                }else{
                    scope.setHeight = "100%";
                }

                if(!attrs.componentSize){
                    scope.componentSize = "small";
                }

                scope.artworkUrl = "assets/emptystateartwork/common-empty-states-no-list-items.png";

                switch(scope.stateContext){
                    case "list":
                        scope.artworkUrl = "assets/emptystateartwork/common-empty-states-no-list-items.png";

                        break;
                    case "comment":     
                        scope.artworkUrl = "assets/emptystateartwork/common-empty-states-no-comments.png";

                        break;
                    case "card":
                        scope.artworkUrl = "assets/emptystateartwork/empty-states-no-cards.png";
                        
                        break;
                    case "transaction":
                        scope.artworkUrl = "assets/emptystateartwork/common-empty-states-no-cards.png";

                        break;
                    default:
                        scope.artworkUrl = "assets/emptystateartwork/common-empty-states-no-list-items.png";
                }
            }
		};

		return emptystateComponentDirective;
    };
 
})();