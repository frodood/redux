(function() {
    'use strict';

    angular
        .module('app.estimates')
        .controller('estChangeCurrencyCtrl', estChangeCurrencyCtrl);

    /** @ngInject */
    function estChangeCurrencyCtrl($rootScope, $scope, currencyObject, total, $http, EstimateService, $mdToast, $document, $mdDialog, $mdMedia, $state) {
        var vm = this;
        vm.cancel = cancel;
        vm.currencyArr = [];
        vm.baseCurrency = currencyObject.baseCurrency;
        vm.exchangeRate = "";
        vm.ChangeCurrency = ChangeCurrency;
        var currencyStatus = false;
        vm.TotalInBaseCurrency = total;
        vm.TotalInSelectedCurrency = total;

        vm.selectedCurrency;

        if (currencyObject.currencyChanged == true) {
            vm.currency = currencyObject.changedCurrency;
            vm.exchangeRate = currencyObject.exchangeRate;
        }
        //var productArr = {};
        var productCopyArr = angular.copy(EstimateService.getArry());
        console.log(productCopyArr)
        var prodArray = [];
        prodArray = EstimateService.getArry();

        // selected currency operation

        var selectedCurrency = $rootScope.$on('selectedCurrency',function(event, args){
                
            vm.selectedCurrency = args.slctdCurrrency;

            console.log(vm.selectedCurrency);

            vm.currency = vm.selectedCurrency
            //do something with currency.

            //ChangeCurrency(vm.currency.currency)
        });

        $scope.$on('$destroy', function() {
            selectedCurrency();

        });

        // selected currency operation

        function cancel() {
            $mdDialog.cancel(currencyStatus);
        }

        // $http({
        //     url: 'http://openexchangerates.org/api/latest.json?app_id=32c5a0d1a1204a57be97937c10121785&base=USD',
        //     method: 'GET'
        // }).then(function(response) {
        //     //console.log(response.data)
        //     for (var key in response.data.rates) {
        //         vm.currencyArr.push(key)
        //         if (vm.currency == key) {
        //             // vm.exchangeRate = response.data.rates[key];
        //         }
        //     }
        //     vm.changeCurrency = function() {
        //         for (var key in response.data.rates) {
        //             vm.currencyArr.push(key)
        //             if (vm.currency == key) {
        //                 // vm.exchangeRate = response.data.rates[key];
        //             }
        //         }
        //     }
        // }, function(response) {
        //     console.log(response)
        // });

        function ChangeCurrency() {
            console.log(vm.currency);
         

            currencyStatus = true;
            var currencyObj = {
                currencyStatus: true,
                exchangeRate: vm.exchangeRate,
                activeCurrency: vm.currency.currency_code
            }

            if (vm.exchangeRate == 0 || vm.exchangeRate == "") {
                currencyObj.currencyStatus = false;
                $mdDialog.hide(false);
                return;
            }


            for (var i = prodArray.val.length - 1; i >= 0; i--) {
                EstimateService.ReverseTax(prodArray.val[i], 1);
                EstimateService.removeArray(prodArray.val[i], 1);
            }

            for (var i = productCopyArr.val.length - 1; i >= 0; i--) {
                EstimateService.setFullArr({
                    productName: productCopyArr.val[i].productName,
                    price: parseFloat((productCopyArr.val[i].price * currencyObject.exchangeRate) / vm.exchangeRate),
                    quantity: productCopyArr.val[i].quantity,
                    productUnit: productCopyArr.val[i].productUnit,
                    discount: productCopyArr.val[i].discount,
                    tax: productCopyArr.val[i].tax,
                    olp: productCopyArr.val[i].olp,
                    amount: parseFloat((productCopyArr.val[i].amount * currencyObject.exchangeRate) / vm.exchangeRate),
                    status: productCopyArr.val[i].status
                })
            }

            $mdDialog.hide(currencyObj);
        }

    }
})();