
(function(){
  'use strict';

      angular
        .module('app.core')
        .directive('rasmNumonly',rasmNumonly);

        function rasmNumonly(){
          var directive = {
            require: 'ngModel',
            link : linkFunc
          }

          return directive;

          function linkFunc(scope, element, attr, ngModelCtrl){
              function fromUser(text) {
                var transformedInput = text.replace(/[^0-9.]/g, ''); 
                if(transformedInput !== text) {
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                }
                return transformedInput;  // or return Number(transformedInput)
              }
              ngModelCtrl.$parsers.push(fromUser);
          }
        }
})();  

