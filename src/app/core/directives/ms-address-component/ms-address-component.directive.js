(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msAddressComponent', msAddressComponent);

    /** @ngInject */
    function msAddressComponent()
    {
        var addressComponentDirective = {
            restrict: 'E',
            scope   : {
                addressData: '=',
                entType : '=',
                showentityTitle : '=',
                specialMail : '='
            },
            template:[
                '<div class="addressCompHolder">',
                '<div class="title" ng-if="showentityTitle">{{addressData.name}}</div>',
                '<div class="address" ng-if="addressData.street">{{addressData.street}}</div>',
                '<div class="locale">',
                '<span ng-if="addressData.city">{{addressData.city}}</span>',
                '<span ng-if="addressData.state"> {{addressData.state}}</span>',
                '</div>',
                '<div class="locale2">',
                '<span ng-if="addressData.zip">{{addressData.zip}}</span>',
                '<span ng-if="addressData.country"> {{addressData.country}}</span>',
                '</div>',
                '<div class="phone">',
                '<span ng-if="addressData.phoneNo">t. {{addressData.phoneNo}}</span>',
                '<span ng-show="cusInfo" ng-if="addressData.mobile">, {{addressData.mobile}}</span>',
                '<span ng-show="bizInfo" ng-if="addressData.fax"> f. {{addressData.fax}}</span>',
                '</div>',
                '<div ng-if="addressData.email" class="email">{{addressData.email}}</div>',
                '<div ng-if="addressData.website" ng-show="bizInfo" class="website">{{addressData.website}}</div>',
                '</div>'
            ].join(''),
            link: function(scope, attrs, elem){

                scope.cusInfo = false;
                scope.bizInfo = false;

                scope.$watch('addressData', function(newVal){
                    if(newVal){
                        scope.addressData = newVal;
                        console.log(scope.addressData);
                    };
                }, true);

                if(scope.entType === 'company'){
                    scope.bizInfo = true;
                }else{
                   // scope.cuzInfo = true;
                   scope.cusInfo = true;
                }

                if(!scope.hasOwnProperty('showentityTitle')){
                    scope.showentityTitle = false;
                }

            }
        };

        return addressComponentDirective;
    }
})();
