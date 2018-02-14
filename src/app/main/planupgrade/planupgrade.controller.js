(function ()
{
    'use strict';

    angular
        .module('app.planupgrade')
        .controller('PlanUpgradeController', PlanUpgradeController);

    /** @ngInject */

    function PlanUpgradeController($rootScope, $scope, $state, $mdDialog, $serviceCall, recurlySubService)
    {
        $state.go('app.planupgrade.main');

        var vm = this;

        var currDate = new Date();

        var slctdBillingCycle = "month";

        vm.selectPlanVariant = selectPlanVariant;

        vm.planDefaultScreen = true;

        vm.planChangeApproved = true;

        vm.initiateDowngradePlan = initiateDowngradePlan;

        vm.cancelChangePlanProcess = cancelChangePlanProcess;

        vm.comparePlanUsage = comparePlanUsage;

        vm.transfertoCancelAccount = transfertoCancelAccount;

        function selectPlanVariant(ev){
            $mdDialog.show({
                templateUrl: 'app/main/planupgrade/views/modals/planVariant.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                controller: variantController,
                clickOutsideToClose: true
            })
            .then(function (answer) {}, function () {});

            /** @ngInject */
            function variantController($scope, $rootScope, $window, $state, recurlySubService, $mdDialog){

                $scope.selectedVariantIndex = 0;

                $scope.nxtMonthBillDate = new Date(new Date(currDate).setMonth(currDate.getMonth()+1));

                $scope.nxtYearBillDate = new Date(new Date(currDate).setFullYear(currDate.getFullYear()+1));

                $scope.upgradePlanFinal = function(){

                    var nameSeperator = function (nameString, nmeIndex){
                        var sepratedName = nameString.split("+");
                        console.log(sepratedName[nmeIndex]);
                        return sepratedName[nmeIndex];
                    };

                    var userPlanDetailObj = {
                        email : $rootScope.cc_sessionInfo.Email,
                        firstName : nameSeperator($rootScope.cc_sessionInfo.Name, 0),
                        lastName : nameSeperator($rootScope.cc_sessionInfo.Name, 1)
                    };

                    var monthlyPlanUrl = recurlySubService.subUrlConstructor('monthely',userPlanDetailObj);
                    var yearlyPlanUrl = recurlySubService.subUrlConstructor('yearly',userPlanDetailObj);

                    if($scope.selectedVariantIndex === 0){
                        window.location.replace(monthlyPlanUrl);
                    }else{
                        window.location.replace(yearlyPlanUrl);
                    }
                }
            };
        };

        function initiateDowngradePlan(ev){
            
            // var changePlanConfirm = $mdDialog.confirm()
            //         .title('Warning! Please re-confirm you wish to proceed?')
            //         .textContent('A downgrade will impact features, users and your account will be queued for cancellation. Please export your data for future use if required.')
            //         .ariaLabel('Change plan warning.')
            //         .targetEvent(ev)
            //         .ok('Confim')
            //         .cancel('Cancel');

            // $mdDialog.show(changePlanConfirm).then(function(){
            //     confirmChangePlanProcess();
            // }, function(){});
            confirmChangePlanProcess();
        }

        var stripWildcard = function(rawDomain){
            rawDomain = rawDomain.substring(rawDomain.indexOf('.') + 1);
            return rawDomain;
        }

        // var currentDowngradedDomain = stripWildcard(window.location.host);
        var currentDowngradedDomain = window.location.protocol+'//'+window.location.host;

        function comparePlanUsage(slctdPlanCode){
            recurlySubService.subCompareUsage(slctdPlanCode)
                .then(function(data){
                    if(data.data.length === 0){
                        vm.planDefaultScreen = false;
                        vm.planChangeApproved = true;
                    }else{
                        vm.planDefaultScreen = false;
                        vm.planChangeApproved = false;
                    }
                }).catch(function(err){
                    console.log(err);
                }); 
        }

        function confirmChangePlanProcess(){
            recurlySubService.downgradePlan($rootScope.activeSubscriptionDetail.account_code)
                .then(function(data){
                    console.log(data);
                    location.replace('/logout.php');
                }).catch(function(err){
                    console.log(err);
                });
        }

        function cancelChangePlanProcess(){
            vm.planDefaultScreen = true;
            vm.planChangeApproved = true;
        }

        function transfertoCancelAccount(){
            $state.go('app.settings.main.accounts');
        }

    };
})();
