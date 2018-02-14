(function(){
    
    'use strict';

    angular
        .module('recurly',[])
        .factory('recurlySubService',recurlySubService);

    /** @ngInject */
    function recurlySubService($window, $rootScope, $http, $q, $log){
        var baseHost = $window.location.host;
        var isPrimed = false;

        $rootScope.isAccPaid = true;
        $rootScope.activeSubscriptionDetail = {};

        var glblAccDetails;

        var sub_RecurlyConst = {
            baseUrl:"https://12thdoor.recurly.com/subscribe/",
            monthely:"12d-business-monthly-plan",
            yearly:"12d-business-yearly-plan",
            monthelyAddon:"monthly-user-add-on",
            yearlyAddon:"yearly-user-add-on"
        };

        var recurlySubscriptionService = {
            subGetAccountDetail : subGetAccountDetail,
            subUrlConstructor : subUrlConstructor,
            subCreateDefaultAccount : subCreateDefaultAccount,
            subGetPlanList : subGetPlanList,
            subGetPlanDetail : subGetPlanDetail,
            subGetAccountTransactionDetail : subGetAccountTransactionDetail,
            chckAddonLvl : chckAddonLvl,
            subLogAddonUsage : subLogAddonUsage,
            downgradePlan : downgradePlan ,
            subCompareUsage : subCompareUsage
        };

        return recurlySubscriptionService;

        /*----------------------- Utility get host function - start --------------------------*/

        function getHost() {
            var host = window.location.protocol + '//' + window.location.hostname;
            if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com"; //test host 
            }
            return host;
        }

        function getAccountCode(){
            var activeAccount = window.location.hostname;
            if(activeAccount.indexOf("localhost") !== -1 || activeAccount.indexOf("127.0.0.1") !== -1){
                activeAccount = "geomsolutions.developer.12thdoor.com";
            }
            return activeAccount;
        }

        /*----------------------- Utility get host function - end --------------------------*/

        /*------------------ Subscription get account details Function - start ---------------------*/
        
        function subGetAccountDetail(){

            var currentRecAccount = getAccountCode();
            
            return 	$http({
                url: getHost()+'/services/duosoftware.subscription.service/subscription/searchAccountByCode?accountCode='+currentRecAccount,
                method: "GET",
                headers: {
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                }
            }).then(getAccountDetailSuccess).catch(getAccountDetailFail);


            function getAccountDetailSuccess(response){
                glblAccDetails = response.data;
                var currentSubscriptions = glblAccDetails.subscriptions;
                for(var i = 0; i < currentSubscriptions.length; i++){
                    if(currentSubscriptions[i].state === "active"){
                        if(currentSubscriptions[i].plan_code === "12d-free-plan"){
                            $rootScope.isAccPaid = false;
                        }else{
                            $rootScope.isAccPaid = true;
                        }
                        $rootScope.activeSubscriptionDetail = currentSubscriptions[i];
                        return currentSubscriptions[i];
                    }
                }
            }

            function getAccountDetailFail(error){
                $log.error('XHR failed to get account detail of provided account code.'+error);
                return error;
            }
        }
            
        /*------------------ Subscription get account details Function - end ---------------------*/

        /*----------------------- Subscription URL generator Function - start --------------------------*/

        function subUrlConstructor(planType, userObj) {

            var constructedURL;
            var accountCode = getAccountCode();
            var stagingInstance = "https://12thdoorstaging.recurly.com/subscribe/";
            var productionInstance = "https://12thdoor.recurly.com/subscribe/";
            var baseHostedUrl;
            var currentHostName = window.location.hostname;

            console.log(currentHostName.indexOf('staging'));

            if(currentHostName.indexOf('staging') !== -1){
                baseHostedUrl = stagingInstance;
            }else{
                baseHostedUrl = productionInstance;
            }

            if(planType === "monthely"){
                constructedURL = baseHostedUrl+sub_RecurlyConst.monthely+"/"+accountCode+"?first_name="+userObj.firstName+"&last_name="+userObj.lastName+"&email="+userObj.email;
                console.log(constructedURL);
            }else{
                constructedURL = baseHostedUrl+sub_RecurlyConst.yearly+"/"+accountCode+"?first_name="+userObj.firstName+"&last_name="+userObj.lastName+"&email="+userObj.email;
                console.log(constructedURL);
            }

            return constructedURL;
        }

        /*----------------------- Subscription URL generator Function - end --------------------------*/

        /*----------------------- Subscription create default Function - start --------------------------*/
        
        function subCreateDefaultAccount(accountContract){

            return 	$http({
                url: getHost()+'/services/duosoftware.subscription.service/subscription/createAccountWithFreePlan',
                method: "POST",
                headers: {
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                },
                data:accountContract
            }).then(createDefaultAccountSuccess).catch(createDefaultAccountFail);


            function createDefaultAccountSuccess(response){
                console.log(response);
                return response;
                // if(response.data.isSuccess === true){
                //     return true;
                // }else{
                //     return false;
                // }
            }

            function createDefaultAccountFail(error){
                console.log(error);
                $log.error('XHR failed to create account in recurly.'+error);
                return error;
            }
        }

        /*----------------------- Subscription create default Function - end --------------------------*/

        /*----------------- Subscription get all plans list Function - start --------------------------*/
        
        function subGetPlanList(){
            
            return 	$http({
                url: getHost()+'/services/duosoftware.subscription.service/subscription/getPlanList',
                method: "GET",
                headers: {
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                }
            }).then(getPlanListSuccess).catch(getPlanListFail);


            function getPlanListSuccess(response){
                return response;
            }

            function getPlanListFail(error){
                $log.error('XHR failed to get list of all the plans.'+error);
                return false;
            }
        }
            
        /*----------------- Subscription get all plans list Function - end --------------------------*/

        
        /*------------------ Subscription get details for plan Function - start ---------------------*/
        
        function subGetPlanDetail(slctdPlanCode){
            
            return 	$http({
                url: getHost()+'/services/duosoftware.subscription.service/subscription/searchPlanByPlanCode?planCode='+slctdPlanCode,
                method: "GET",
                headers: {
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                }
            }).then(getPlanDetailSuccess).catch(getPlanDetailFail);


            function getPlanDetailSuccess(response){
                return response;
            }

            function getPlanDetailFail(error){
                $log.error('XHR failed to get detail of provided plan.'+error);
                return false;
            }
        }
            
        /*------------------ Subscription get details for plan Function - end ---------------------*/


        /*------------ Subscription get transaction details for account Function - start ---------------*/
        
        function subGetAccountTransactionDetail(slctdAccountCode){
            
            return 	$http({
                url: getHost()+'/services/duosoftware.subscription.service/subscription/searchTransactionsByAccountCode?accountCode='+slctdAccountCode,
                method: "GET",
                headers: {
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                }
            }).then(getAccountTransactionDetailSuccess).catch(getAccountTransactionDetailFail);


            function getAccountTransactionDetailSuccess(response){
                return response;
            }

            function getAccountTransactionDetailFail(error){
                $log.error('XHR failed to get account transaction detail of provided account code.'+error);
                return false;
            }
        }
            
        /*------------ Subscription get transaction details for account Function - end ---------------*/

        function chckAddonLvl(addon_acc_code){
            return 	$http({
                url: getHost()+'/services/duosoftware.subscription.service/subscription/getAllowedAmountFromRuleInRE?accountCode='+addon_acc_code+'&addOnCode=user',
                method: "GET",
                headers: {
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                }
            }).then(chckAddonLvlSuccess).catch(chckAddonLvlFail);


            function chckAddonLvlSuccess(response){
                return response;
            }

            function chckAddonLvlFail(error){
                $log.error('XHR failed to check addon usage for given subscription code.'+error);
                return false;
            }
        }

        /*------------ Subscription log add-on usage for account Function - start ---------------*/
        
        function subLogAddonUsage(addOnContract){

            console.log(addOnContract);
            
            return 	$http({
                url: getHost()+'/services/duosoftware.subscription.service/subscription/logUsage?accountCode='+addOnContract.accCode+'&subscriptionCode='+addOnContract.subCode+'&planCode='+addOnContract.planCode+'&addOnCode='+addOnContract.alaCode+'&amount='+addOnContract.slots+'&unitAmount='+addOnContract.unitAmount,
                method: "GET",
                headers: {
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                }
            }).then(logAddonUsageSuccess).catch(logAddonUsageFail);


            function logAddonUsageSuccess(response){
                return response;
            }

            function logAddonUsageFail(error){
                $log.error('XHR failed to log addon usage for given subscription code.'+error);
                return false;
            }
        }
            
        /*------------ Subscription log add-on usage for account Function - end ---------------*/

        /*------------ Subscription log add-on usage for account Function - start ---------------*/

        function downgradePlan(accountCode){
            return 	$http({
                url: getHost()+'/services/duosoftware.subscription.service/subscription/downgradeToFreePlan?accountCode='+accountCode,
                method: "GET",
                headers: {
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                }
            }).then(downgradePlanSuccess).catch(downgradePlanFail);


            function downgradePlanSuccess(response){
                return response;
            }

            function downgradePlanFail(error){
                $log.error('XHR failed to downgrade plan.'+error);
                return false;
            }
        }

        /*------------ Subscription log add-on usage for account Function - end ---------------*/

        function subCompareUsage(slctdPlanCode){

            return 	$http({
                url: getHost()+'/services/duosoftware.subscription.service/subscription/compareUsagesWithPlanAmount?planCode='+slctdPlanCode,
                method: "GET",
                headers: {
                    'securityToken' : $rootScope.cc_sessionInfo.SecurityToken
                }
            }).then(getCompareUsageSuccess).catch(getCompareUsageFail);


            function getCompareUsageSuccess(response){
                return response;
            }

            function getCompareUsageFail(error){
                $log.error('XHR failed to get comparison for plans !'+error);
                return false;
            }
        }
    };

})();
    
    

