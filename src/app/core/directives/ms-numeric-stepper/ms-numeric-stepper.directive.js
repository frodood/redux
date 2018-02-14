(function()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msNumericStepper', msNumericStepper);

    /** @ngInject */
    function msNumericStepper()
    {
        return {
            restrict: 'AE',
            require: 'ngModel',
            scope: {
                min: '=',
                max: '=',
                ngModel: '=',
                ngDisabled: '='
            },
            template: [
                '<div class="msNumericStepperContainer" layout="row">',
                '<button type="button" ng-disabled="isOverMin() || ngDisabled" ng-click="decrement()"><md-icon md-font-icon="icon-minus"></md-icon></button>',
                '<input type="text" ng-model="ngModel" ng-disabled=true>',
                '<button type="button" ng-disabled="isOverMax() || ngDisabled" ng-click="increment()"><md-icon md-font-icon="icon-plus"></md-icon></button>',
                '</div>'
            ].join(''),
            link: function(scope, iElement, iAttrs, ngModelController) {

                scope.label = '';

                if (angular.isDefined(iAttrs.label)) {
                    iAttrs.$observe('label', function(value) {
                        scope.label = ' ' + value;
                        ngModelController.$render();
                    });
                }

                ngModelController.$render = function() {
                    checkValidity();
                };

                ngModelController.$formatters.push(function(value) {
                    return parseInt(value, 10);
                });

                ngModelController.$parsers.push(function(value) {
                    return parseInt(value, 10);
                });

                function checkValidity() {
                    var valid = !(scope.isOverMin(true) || scope.isOverMax(true));
                    ngModelController.$setValidity('outOfBounds', valid);
                }

                function updateModel(offset) {
                    ngModelController.$setViewValue(ngModelController.$viewValue + offset);
                    ngModelController.$render();
                }

                scope.isOverMin = function(strict) {
                    var offset = strict?0:1;
                    return (angular.isDefined(scope.min) && (ngModelController.$viewValue - offset) < parseInt(scope.min, 10));
                };
                scope.isOverMax = function(strict) {
                    var offset = strict?0:1;
                    return (angular.isDefined(scope.max) && (ngModelController.$viewValue + offset) > parseInt(scope.max, 10));
                };

                scope.increment = function() {
                    updateModel(+1);
                };
                scope.decrement = function() {
                    updateModel(-1);
                };

                checkValidity();

                scope.$watch('min+max', function() {
                    checkValidity();
                });
            }
        };
    }
})();