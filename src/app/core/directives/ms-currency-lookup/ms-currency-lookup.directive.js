(function()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsCurrencyLookupController', MsCurrencyLookupController)
		.directive('msCurrencyLookup', msCurrencyLookup);

	/** @ngInject */
	function msCurrencyLookup()
	{
		var currencylookupDirective = {
			restrict   : 'EA',
			scope: {
				placeholder : '=',
				required : '=',
				currmodel : '='
			},
			transclude : true,
			templateUrl: 'app/core/directives/ms-currency-lookup/ms-currency-lookup.html',
			controller : MsCurrencyLookupController,
			controllerAs : 'vm',
			bindToController : true
		};

		return currencylookupDirective;
	}

	/** @ngInject */
	function MsCurrencyLookupController($rootScope, $scope, $element, $attrs, $http){
		var vm = this;

		vm.currencyList = $rootScope.glblCurrencyList;

		vm.selectedCurrencyChange = selectedCurrencyChange;

		// vm.currencyList = vm.currmodel;

		function selectedCurrencyChange(currency){
			$scope.$emit('selectedCurrency', {slctdCurrrency : currency});
		}
		
		var externalSlctdCurrencyInput = $rootScope.$on('extSlctdCurrency',function(event, args){
			console.log(args);
            vm.selectedCurrency = {};
			vm.selectedCurrency = args.slctdCurrencyValue;
        });

        $rootScope.$on('$destroy', function() {
            externalSlctdCurrencyInput();
        });

	};
 
})();