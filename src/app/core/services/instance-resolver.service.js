(function(){

	'use strict';

	angular
		.module('instanceContext',[])
		.factory('instanceContextService',instanceContextService);

	/** @ngInject */

	function instanceContextService($rootScope, $window,$http,$q,$log){

		var baseHost = $window.location.host;
		var isPrimed = false;

		var instanceContextService = { 
			getProfileDetails : getProfileDetails,
			setProfileDetails : setProfileDetails,
			getCurrencyList : getCurrencyList,
			getCountryList : getCountryList,
			setNewPassword : setNewPassword
		};

		return instanceContextService;

		function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com"; //test host 
			}
			return host;
		}

		function getProfileDetails(iom){
			return 	$http({
						url: getHost()+'/apis/profile/userprofile/'+iom,
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getProfileDetailsComplete).catch(getProfileDetailsFailed);


			function getProfileDetailsComplete(response){
				return response;
			}

			function getProfileDetailsFailed(error){
				$log.error('XHR failed for getProfileDetails.'+error);
			}
		}

		function setProfileDetails(pdo){
			
			return $http({
						url: getHost()+'/apis/profile/userprofile',
						method: "POST",
						data: pdo,
						headers: {
							'Content-Type': 'application/json',
							'securityToken': $rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(setProfileDetailsComplete).catch(setProfileDetailsFailed);

			function setProfileDetailsComplete(response){
				return response;
			}

			function setProfileDetailsFailed(error){
				$log.error('XHR failed for setProfileDetails.'+error);
			}
		}

		function getCurrencyList(){
			return $http.get('app/data/global/currencyListSpec.json')
				.then(function(result){
					return result;
					console.log(result);
				}).catch(function(error){
					console.log(error);
					$log.error('Error getting currency list !');
				});
		}

		function getCountryList(){
			return $http.get('app/data/global/countryList.json')
				.then(function(result){
					return result;
					console.log(result);
				}).catch(function(error){
					console.log(error);
					$log.error('Error getting country list !');
				});
		}

		function setNewPassword(oldPassword, newPassword){
			return 	$http({
						url: getHost()+'/auth/ChangePassword/'+oldPassword+'/'+newPassword+'',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(setNewPasswordComplete).catch(setNewPasswordFailed);


			function setNewPasswordComplete(response){
                console.log(response);
				// return response.data;

                function containsSubTxt(specimen,sampler){
                    if(specimen.indexOf(sampler) != -1){
                        return true;
                    }else{
                        return false;
                    }
                }

                if(response.data.hasOwnProperty('Error')){
                    return {'isSuccess':false, 'message':response.data.Message};
                }else{
                    if(containsSubTxt(response.data, "true") === true){
                        return {'isSuccess':true, 'message':'password has been changed'};
                    }
                }

			}

			function setNewPasswordFailed(error){
                console.log(error);
				return error;
				$log.error('XHR failed for getProfileDetails.'+error);
			}
		}
	};

})();