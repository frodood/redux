(function()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsEmptystateIndicatorController', MsEmptystateIndicatorController)
		.directive('msEmptystateIndicator', msEmptystateIndicator);

	/** @ngInject */
	function msEmptystateIndicator()
	{
		var emptystateindicatorDirective = {
			restrict   : 'EA',
			scope: {
				emptystatehdr : '=',
                emptystatemsg : '=',
                emptystatevis : '=',
                emptystateaction : '='
			},
			transclude : true,
			template: [
                '<md-button class="md-primary" style="border:2px solid">',
                '<md-icon md-font-icon="icon-currency-usd"></md-icon>',
                'Change Currency',
                '</md-button>'
            ].join(''),
			controller : MsEmptystateIndicatorController,
			controllerAs : 'vm',
			bindToController : true
		};

		return emptystateindicatorDirective;
	};

    /** @ngInject */
    function MsEmptystateIndicatorController($rootScope, $scope, $element, $attrs, $http, $mdDialog, $mdToast)
    {

        var vm = this;

        $element.bind('click', function(event){
            $mdDialog.show({
                templateUrl: 'app/core/directives/ms-currency-switcher/ms-currency-switcher-modal.html',
                targetEvent: event,
                controller: function(){
                    return vm;
                },
                controllerAs: 'ctrl',
                clickOutsideToClose: false
            });
        });

        vm.currencyList = $rootScope.glblCurrencyList;

        $scope.$watch('vm.currencydefaults', function(newVal){
            if(newVal){
                vm.currencydefaults = newVal;
                bindUI();
            };
        }, true);

        vm.selectedCurrencyChange = selectedCurrencyChange;
                
		vm.cnfrmSwitchActiveCurr = cnfrmSwitchActiveCurr;

        vm.cnfrmRstActiveCurr = cnfrmRstActiveCurr;

        vm.exitChngCurrModal = exitChngCurrModal;

		// vm.currencyList = vm.currmodel;

        /* Modal spacific functionalities - start*/

        function selectedCurrencyChange(switchedCurrency){
            vm.currencydefaults.currencyType = switchedCurrency.currency_code;
        }

		function cnfrmSwitchActiveCurr(){

            if(vm.currencydefaults.currencyType !== vm.currencydefaults.baseCurrency){
                vm.currencydefaults.currencyStatus = true;
                vm.currencydefaults.exchangeRate = vm.exchangeRate;
                vm.currencydefaults.currencyType =  vm.selectedCurrency.currency_code;

                $scope.$emit('switchCurrActivity', vm.currencydefaults);

                exitChngCurrModal();
            }else{
                console.log('selected currency cant be base currency !');
                exitChngCurrModal();
            }
		}

        function cnfrmRstActiveCurr(){

            vm.currencydefaults.currencyStatus = false;
            vm.currencydefaults.exchangeRate = '1';
            vm.currencydefaults.currencyType =  vm.currencydefaults.baseCurrency;

            bindUI();

            exitChngCurrModal();
        }

        function bindUI(){
            vm.selectedCurrency = {'currency_code':vm.currencydefaults.currencyType};
            vm.exchangeRate = vm.currencydefaults.exchangeRate;
        } 

        function exitChngCurrModal(){
            $mdDialog.cancel();
        }
		
    };
 
})();