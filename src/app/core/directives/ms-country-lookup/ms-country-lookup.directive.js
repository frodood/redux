(function()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsCountryLookupController', MsCountryLookupController)
		.directive('msCountryLookup', msCountryLookup);

	/** @ngInject */
	function msCountryLookup()
	{
		var countrylookupDirective = {
			restrict   : 'EA',
			scope: {
				placeholder : '=',
				required : '=',
				currmodel : '='
			},
			transclude : true,
			templateUrl: 'app/core/directives/ms-country-lookup/ms-country-lookup.html',
			controller : MsCountryLookupController,
			controllerAs : 'vm',
			bindToController : true
		};

		return countrylookupDirective;
	}

	/** @ngInject */
	function MsCountryLookupController($rootScope, $scope, $element, $attrs, $http){
		var vm = this;

		vm.countryList = $rootScope.glblCountryList;

		vm.selectedCountryChange = selectedCountryChange;

		function selectedCountryChange(country){
			$scope.$emit('selectedCountry', {slctdCountry : country});
		}

	};
 
})();