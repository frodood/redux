(function(){

	'use strict';

	angular
		.module('tenantContext',[])
		.factory('tenantContextService',tenantContextService);

	/** @ngInject */
	function tenantContextService($window,$http,$q,$log){
		var baseHost = $window.location.host;
		var isPrimed = false;

		var tenantContextService = { 
			getDefaultTenant : getDefaultTenant,
			setDefaultTenant : setDefaultTenant,
			getAllTenants : getAllTenants
		};

		return tenantContextService;

		//Utility Function
		//

		function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com"; //test host 
			}
			return host;
		}

		function getAllTenants(baseUrl, secToken){
			return $http.get(getHost()+'/auth/tenant/GetTenants/'+secToken)
				.then(getAllTenantsSuccess)
				.catch(function(message){
					$log.error('getting all business was unsuccessfull !');
					console.log(message);
				});
			var getAllTenantsSuccess = function(){
				return(data);
			};
		}

		function getDefaultTenant(baseUrl, userID){
			return $http.get(getHost()+'/auth/tenant/GetDefaultTenant/'+userID);
		}

		function setDefaultTenant(baseUrl, userID, targetTenant){
			return $http.get(getHost()+'/auth/tenant/SetDefaultTenant/'+userID+'/'+targetTenant)
				.then(setDefaultTenantSuccess)
				.catch(function(message){
					// console.log(message);
					$log.error('Setting a default tenant was unsuccessfull !');
				});
			var setDefaultTenantSuccess = function(){
				return(data);
			};
		}

	};

})();

