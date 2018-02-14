(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msTenantSwitcher', msTenantSwitcher);

    /** @ngInject */
    function msTenantSwitcher()
    {
        var tenantDirective = {
            restrict: 'E',
            template: [
                '<div style="position:relative" class="tennantItemContainer" layout="row" layout-align="start start">',
                '<div class="tennantItemContainerIcon" layout="column" layout-align="center center">',
                '<div class="tenantCygil">{{vm.tennantdata.Name[0] | uppercase}}</div>',
                '</div>',
                '<div class="tennantItemContainerText" layout="column" layout-align="center center" ng-click="vm.switchBusiness()">',
                '<span>{{vm.tennantdata.Name}}</span>',
                '<span>{{vm.tennantdata.TenantID}}</span>',
                '</div>',
                '<div class="tenantDefaultIndicatorContainer">',
                '<md-button ng-click="vm.setDeffaultBusiness()" class="md-icon-button">',
                '<md-icon ng-if="!vm.tennantdata.default" md-font-icon="icon-star-outline"></md-icon>',
                '<md-icon ng-if="vm.tennantdata.default" class="amber-fg" md-font-icon="icon-star"></md-icon>',
                '</md-button>',
                '</div>',
                '</div>'
            ].join(''),
            bindToController: {
                tennantdata: '='
            },
            controller: TenantDirectiveController,
            controllerAs: 'vm'
        };

        return tenantDirective;
    }

    /** @ngInject */
    function TenantDirectiveController($rootScope, $window, $scope, $mdDialog, $mdToast, $v6urls, tenantContextService){

        var vm = this;

        vm.switchBusiness = switchBusiness;
        vm.setDeffaultBusiness = setDeffaultBusiness;

        var switchBusinessConfirm = $mdDialog.confirm()
            .title('Switch Business')
            .content('Are you sure you want to switch business to ' + vm.tennantdata.Name + ' ?')
            .ariaLabel('Switch Tennant')
            .ok('Yes go ahead !')
            .cancel('Dont do it');
        
        function switchBusiness(){
            $mdDialog.show(switchBusinessConfirm).then(function () {
                $window.open(window.location.protocol+'//' + vm.tennantdata.TenantID, '_blank');
            }, function () {

            });
        }

        function containsTxt(specimen,sampler){
          if(specimen.indexOf(sampler) != -1){
              return true;
          }else{
              return false;
          }
        }

        function setDeffaultBusiness(){
            tenantContextService.setDefaultTenant($v6urls.auth, $rootScope.cc_sessionInfo.UserID, vm.tennantdata.TenantID).then(function(data){
                if(containsTxt(data.data,"true") === true){

                    if($rootScope.defaultCompany !== vm.tennantdata.TenantID){

                        var key;

                        for(key in $rootScope.companyColection){
                            if($rootScope.companyColection.hasOwnProperty(key)){
                                if($rootScope.companyColection[key].TenantID !== vm.tennantdata.TenantID){
                                    $rootScope.companyColection[key].default = false;
                                }else{
                                    $rootScope.companyColection[key].default = true;
                                }
                            }
                        }

                        $rootScope.defaultCompany = vm.tennantdata.TenantID;

                    }else{
                    }

                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Default business updated !')
                        .position('bottom right')
                        .hideDelay(2500)
                    );
                }else{
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Failed to update default business !')
                        .position('bottom right')
                        .hideDelay(2500)
                    );
                }
            }, function(){

            });
        }

        /*Local env setup*/

        // function setDeffaultBusiness(){

        //     if($rootScope.defaultCompany !== vm.tennantdata.TenantID){

        //         var key;

        //         for(key in $rootScope.companyColection){
        //             if($rootScope.companyColection.hasOwnProperty(key)){
        //                 if($rootScope.companyColection[key].TenantID !== vm.tennantdata.TenantID){
        //                     $rootScope.companyColection[key].default = false;
        //                 }else{
        //                     $rootScope.companyColection[key].default = true;
        //                 }
        //             }
        //         }

        //         $rootScope.defaultCompany = vm.tennantdata.TenantID;

        //     }else{
        //         console.log('u are reselecting !');
        //     }

        //     $mdToast.show(
        //         $mdToast.simple()
        //         .textContent('Default business updated !')
        //         .position('bottom right')
        //         .hideDelay(2500)
        //     );
        // }
    }

})();
