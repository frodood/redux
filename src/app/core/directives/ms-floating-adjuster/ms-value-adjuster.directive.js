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

angular
.module('app.core')
.directive('msValueAdjuster', function(profileSettingsContextService){

    return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return; 
          }

          ngModelCtrl.$parsers.push(function(val) {
            if (angular.isUndefined(val)) {
                var val = '';
            }
            
            var clean = val.replace(/[^-0-9\.]/g, '');
            var negativeCheck = clean.split('-');
			var decimalCheck = clean.split('.');
            if(!angular.isUndefined(negativeCheck[1])) {
                negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                clean =negativeCheck[0] + '-' + negativeCheck[1];
                if(negativeCheck[0].length > 0) {
                	clean =negativeCheck[0];
                }
                
            }
            var valueplaces = profileSettingsContextService.getGlblDecimalPlaces();
            var valueDecimalPlaces = parseInt(valueplaces.valueDecimalPlaces);
              
            if(!angular.isUndefined(decimalCheck[1])) {
                decimalCheck[1] = decimalCheck[1].slice(0,valueDecimalPlaces);
                clean =decimalCheck[0] + '.' + decimalCheck[1];
            }

            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });

          element.bind('keypress', function(event) {
            if(event.keyCode === 32) {
              event.preventDefault();
            }
          });
        }
      };
});

// angular
// .module('app.core')
// .directive('msValueAdjuster', function(profileSettingsContextService){
    
// return {
//     restrict: 'A',
//     require: 'ngModel',
//     link: function(scope, element, attributes, ngModel){

//     function countDecimalPlaces(value){
//         var decimalPos = String(value).indexOf('.');
//         if(decimalPos === -1){
//             return 0;
//         }else{
//             return String(value).length - decimalPos -1;
//         }
//     }    
    
//     function maxPrecision(value){
//         // console.log(profileSettingsContextService.getGlblDecimalPlaces);

//         if(!isNaN(value)){
//         var valueplaces = profileSettingsContextService.getGlblDecimalPlaces();
//         var valueDecimalPlaces = parseInt(valueplaces.valueDecimalPlaces);
//         console.log(valueDecimalPlaces);
//         var validity = countDecimalPlaces(value) <= valueDecimalPlaces; 
//             ngModel.$setValidity('max-precision', validity);
//         }
        
//         return value;
//     }
    
//     ngModel.$parsers.push(maxPrecision);
//     // ngModel.$formatters.push(maxPrecision); 
//     }
    
// };
// });
  