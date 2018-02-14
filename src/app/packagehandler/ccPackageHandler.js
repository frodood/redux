//////////////////////////////////////////////////////////////////////
// Cloud Charge Payment Module
/////////////////////////////////////////////////////////////////////
(function(){

	'use strict';

	angular
		.module('ccPackage',[])
		.factory('ccPackageService',ccPackageService);

	/** @ngInject */
	function ccPackageService($rootScope,$window,$http,$q,$log){
		var isPrimed = false;

		var ccPackageService = { 
			setSubscriptionPlan : setSubscriptionPlan,
			upgradeSubscriptionPlan : upgradeSubscriptionPlan,
			switchTemplateValidity : switchTemplateValidity,
			customizeSubscriptionPlan : customizeSubscriptionPlan,
			getSubscriptionPlan : getSubscriptionPlan,
			getPlanUserCount : getPlanUserCount, 
			getPaymentRecords : getPaymentRecords,
			setCreditCard : setCreditCard,
			getCreditCards : getCreditCards,
			setDefaultCreditCard : setDefaultCreditCard,
			removeCreditCard : removeCreditCard
		};

		return ccPackageService;

		function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com"; //test host 
			}
			return host;
		}

		function setSubscriptionPlan(planDetails){
			return $http.post(getHost()+'/apis/plan/subscribe/',planDetails)
				.then(subscribeSuccess)
				.catch(function(message){
					$log.error('Subscription was unsuccessfull !');
				});
			var subscribeSuccess = function(data, status, headers, config){
				return(data);
			};
		}

		function upgradeSubscriptionPlan(planDetails){
			return $http.post(getHost()+'/apis/plan/upgrade',planDetails)
				.then(upgradeSuccess)
				.catch(function(message){
					$log.error('Upgrade was unsuccessfull !');
				});
			var upgradeSuccess = function(data, status, headers, config){
				return(data);
			};
		}

		function switchTemplateValidity(planDetails){
			return $http.get(getHost()+'/apis/template/packageChange')
				.then(switchTemplateValiditySuccess)
				.catch(function(message){
					$log.error('Changing template was unsuccessfull !');
				});
			var switchTemplateValiditySuccess = function(data, status, headers, config){
				console.log(data);
				return(data);
			};
		}

		function customizeSubscriptionPlan(planDetails){
			return $http.post(getHost()+'/apis/plan/customize',planDetails)
				.then(customizeSuccess)
				.catch(function(message){
					$log.error('Customizing package was unsuccessfull !');
				});
			var customizeSuccess = function(data, status, headers, config){
				return(data);
			}
		}

		function getSubscriptionPlan(){
			return $http.get(getHost()+'/apis/plan/current');
		}

		function getPlanUserCount(tennantID){
			return $http.post(getHost()+'/apis/ratingservice/process/usage/'+tennantID)
				.then(getPlanUserCountSuccess)
				.catch(function(message){
					$log.error('Getting plan user count, was unsuccessfull !');
				});
			var getPlanUserCountSuccess = function(data, status, headers, config){
				return(data);
			};
		}

		function getPaymentRecords(){

			return 	$http({
						url: getHost()+'/services/duosoftware.paymentgateway.service/payinfo/getAllPaymentByTenant?skip=0&take=20&type=12thdoor',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getPaymentRecordsComplete).catch(getPaymentRecordsFailed);

			function getPaymentRecordsComplete(response){
				return response;
			}

			function getPaymentRecordsFailed(error){
				$log.error('XHR failed to get payment records.'+error);
			}
		}

		function setCreditCard(stripeCardDetails){

			return $http({
				url: getHost()+'/services/duosoftware.paymentgateway.service/stripe/cardAdd',
				method: "POST",
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				},
				data:stripeCardDetails
			}).then(addingNewCardSuccess).catch(function(message){
				$log.error('Adding new card was not successful !');
			});

			var addingNewCardSuccess = function(data){
				return(data);
			}
		}

		function getCreditCards() {

			console.log($rootScope.cc_sessionInfo.SecurityToken);

			return	$http({
						url: getHost()+'/services/duosoftware.paymentgateway.service/stripe/cardInfo',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getCreditCardsComplete).catch(getCreditCardsFailed);

			function getCreditCardsComplete(response){
				return response.data;
			}

			function getCreditCardsFailed(error){
				$log.error('XHR failed to get credit card details.'+error);
			}
		}

		function setDefaultCreditCard (cardDetails){

			return $http({
				url: getHost()+'/services/duosoftware.paymentgateway.service/stripe/makeDefault',
				method: "POST",
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				},
				data:cardDetails
			}).then(makeDefaultSuccess).catch(function(message){
				$log.error('Making the card default was not successful !');
			});

			var makeDefaultSuccess = function(data){
				return(data);
			}
		}

		function removeCreditCard(cardDetails){

			return $http({
				url: getHost()+'/services/duosoftware.paymentgateway.service/stripe/cardDelete',
				method: "POST",
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				},
				data:cardDetails
			}).then(deleteCardSuccess).catch(function(message){
				$log.error('Deleting card was not successful !');
			});

			var deleteCardSuccess = function(data){
				return(data);
			}
		}

	};

})();