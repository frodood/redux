(function()
{
	'use strict';

	angular
		.module('settingsContext',[])
		.factory('profileSettingsContextService',profileSettingsContextService);

	/** @ngInject */
	function profileSettingsContextService($rootScope, $window, $http, $q, $log){

		var isPrimed = false;
		var glblProfileSettingsInfo;
		var glblDecimalPlacesInfo;

		var profileSettingsContextService = {
			setProfileSettingsData : setProfileSettingsData, 
			getGlblProfileSettingsData : getGlblProfileSettingsData,
			getGlblDecimalPlaces : getGlblDecimalPlaces
		};

		return profileSettingsContextService;

		//Utility Function - Get Host

		function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com";
			}
			return host;
        }
        
        function setProfileSettingsData(){
            var setProfileSettingsPayload = {"setting":"profile"};

			return 	$http({
						url: getHost()+'/services/duosoftware.setting.service/setting/getAllByQuery',
						method: "POST",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						},
						data:setProfileSettingsPayload
					}).then(setProfileSettingsDataSuccess).catch(setProfileSettingsDataFail);


			function setProfileSettingsDataSuccess(response){
				console.log(response);
				glblProfileSettingsInfo = response.data[0].profile;
				return true;
			}

			function setProfileSettingsDataFail(error){
				console.log(error);
				$log.error('XHR failed to get profile settings details.'+error);
				return false;
			}
		}
		
		function getGlblProfileSettingsData(){
			return glblProfileSettingsInfo;
		}

		function getGlblDecimalPlaces(){
			var decimalPlacesObject = {
				'valueDecimalPlaces':glblProfileSettingsInfo.decimalPlaces,
				'quantityDecimalPlaces':glblProfileSettingsInfo.decimalPlacesQuantity,
				'unitDecimalPlaces':glblProfileSettingsInfo.decimalPlacesUnit
			};

			return decimalPlacesObject;
		}
	};

})();