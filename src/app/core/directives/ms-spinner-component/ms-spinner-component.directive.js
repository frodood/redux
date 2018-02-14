(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msSpinnerComponent', msSpinnerComponentDirective);

    /** @ngInject */
    function msSpinnerComponentDirective()
    {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                name: '@?',
                group: '@?',
                show: '=?',
                opaque: "=?",
                size: '@?',
                spinnerText: '@?',
                isFlushed: '@?',
                relativePosition: '@?',
                register: '@?',
                onLoaded: '&?',
                onShow: '&?',
                onHide: '&?'
            },
            template: [
                '<div class="spinnerContainer" ng-show="show" layout="column" layout-align="center center">',
                '   <div class="spinnerInnerWell" layout="column" layout-align="center center">',
                '       <md-progress-circular class="md-hue-2" md-diameter="{{size}}px"></md-progress-circular>',
                '       <span ng-if="spinnerText">{{spinnerText}}</span>',
                '   </div>',
                '</div>'
            ].join(''),
            controller:msSpinnerComponentController,
            link: msSpinnerLink
        };
    }

    /** @ngInject */
    function msSpinnerLink(scope, element, attrs){
        //get parent heiight for overlay

        var parentHeight = element.parent().height();

        //set overlay height
        element.height('100%');

        if(!scope.hasOwnProperty('opaque')){}else{
            if(scope.opaque === true){
                element.addClass('opaqueBg');
            }
        }

        if(!scope.hasOwnProperty('relativePosition')){
            element.addClass('relative');
        }else{
            if(scope.relativePosition === "true"){
                element.addClass('relative');
            }else{
                element.addClass('absolute');
            }
        }

        if(!scope.hasOwnProperty('isFlushed')){
        }else{
            if(scope.isFlushed === "true"){
                element.addClass('flushed');
            }
        }
    }

    /** @ngInject */
    function msSpinnerComponentController($scope, msSpinnerService)
    {
        // register should be true by default if not specified.
        if (!$scope.hasOwnProperty('register')) {
            $scope.register = true;
        }

        if(!$scope.hasOwnProperty('spinnerText')){
            // $scope.spinnerText = 'Loading, please wait !';
        }

        var api = {
          name: $scope.name,
          group: $scope.group,
          show: function () {
              $scope.show = true;
          },
          hide: function () {
              $scope.show = false;
          },
          toggle: function () {
              $scope.show = !$scope.show;
          }
        };

        // Register this spinner with the spinner service.
        if ($scope.register) {
            msSpinnerService._register(api);
        }

        if ($scope.onShow || $scope.onHide) {
          $scope.$watch('show', function (show) {
            if (show && $scope.onShow) {
                $scope.onShow({ msSpinnerService: msSpinnerService, spinnerApi: api });
            } else if (!show && $scope.onHide) {
                $scope.onHide({ msSpinnerService: msSpinnerService, spinnerApi: api });
            }
          });
        }

        if ($scope.onLoaded) {
            $scope.onLoaded({ msSpinnerService: msSpinnerService, spinnerApi: api });
        }

    }
})();
