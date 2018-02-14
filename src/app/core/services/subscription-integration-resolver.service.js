(function(){
    'use strict';

    angular
        .module('subscription-integration',[])
        .factory('subIntegrationService',subIntegrationService);

    /** ng-inject */

    function subIntegrationService($window, $http, $q, $log, $rootScope, recurlySubService, tenantContextService){

        var baseHost = $window.location.host;
        var isPrimed = false;

        var subscriptionIntegrationService = {
            // checkIfPaidSubscription : checkIfPaidSubscription,
            // susbscribeToPaidPlan : subscribeToPaidPlan,
            registerTenant : registerTenant,
            tenantMapProfileDetails : tenantMapProfileDetails
            // getAccountTransactionDetails : getAccountTransactionDetails,
            // getSubscriptionEndDate : getSubscriptionEndDate,
            // getTotalUserAddonSlots : getTotalUserAddonSlots,
            // logUserAddon : logUserAddon  
        };

        return subscriptionIntegrationService;

        /*----------------------- Utility get host function - start --------------------------*/

        function getHost() {
            var host = window.location.protocol + '//' + window.location.hostname;
            if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com"; //test host 
            }
            return host;
        }

        /*----------------------- Utility get host function - end --------------------------*/

        /*----------- Create tenant subscribe to free acount Function - start ----------------*/

        function registerTenant(newTenantDetails){

            //convert new business details to json format
            var newTenantDataPayload = angular.toJson(newTenantDetails);

            return $http({
                method: 'POST',
                url: getHost()+'/apis/usertenant/tenant/',
                headers: {
                    'Content-Type' : 'application/json',
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                },
                data: newTenantDataPayload
            }).then(createTenantSuccess).catch(createTenantFail);

            function createTenantSuccess(response){
                return response;
            }

            function createTenantFail(error){
                return error;
            }
        }

        /*----------- Create tenant subscribe to free acount Function - end ------------------*/

        /*------------------- Tenant map profile details Function - start -----------------------*/

        function tenantMapProfileDetails(profileMapContract){
            
            return  $http({
                url: getHost()+'/apis/profile/userprofile',
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                },
                data:profileMapContract
            }).then(mapProfileDetailsSuccess).catch(mapProfileDetailsFail);


            function mapProfileDetailsSuccess(response){
                console.log(response);
                return response;
            }

            function mapProfileDetailsFail(error){
                console.log(error);
                $log.error('XHR failed to map profile details to company.'+error);
                return error;
            }

        }

        /*------------------- Tenant map profile details Function - end ------------------------*/

    };
    
})();