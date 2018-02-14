// (function(){

// 	'use strict';

// 	angular
// 		.module('app.core')
// 		.directive('msFloatingAdjuster', msFloatingAdjuster);

// 	/** @ngInject */

// 	function msFloatingAdjuster($filter){

// 		return {
//             restrict: 'A',
//             require: '?ngModel',
//             scope: {
//                 decimals: '@',
//                 decimalPoint: '@'
//             },
//             link: function (scope, element, attrs, ngModel){
//                 var decimalCount = parseInt(scope.decimals) || 2;
//                 var decimalPoint = scope.decimalPoint || ".";
                
                
//             }
//         };
// 	}
// })();