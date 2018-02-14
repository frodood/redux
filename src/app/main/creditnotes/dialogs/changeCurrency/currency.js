(function ()
{
    'use strict';

    angular
        .module('app.creditnotes')
        .controller('creChangeCurrencyCtrl', creChangeCurrencyCtrl);

    /** @ngInject */
    function creChangeCurrencyCtrl($scope, item, $http, InvoiceService, MultipleDudtesService, $mdToast, $document, $mdDialog, $mdMedia, $state)
    {
    	var vm = this;
        vm.cancel = cancel;
        vm.currencyArr = [];
        vm.baseCurrency = item.baseCurrency;
        vm.exchangeRate = "";
        vm.ChangeCurrency = ChangeCurrency;
        var currencyStatus = false;

        if(item.currencyChanged == true){
            vm.currency = item.changedCurrency;
            vm.exchangeRate = item.exchangeRate;
        }
        //var productArr = {};
        var productCopyArr = angular.copy(InvoiceService.getArry());
        console.log(productCopyArr)
        var prodArray = [];
        prodArray = InvoiceService.getArry();

        function cancel(){
            $mdDialog.cancel(currencyStatus);
        }

        $http({
        url: 'https://openexchangerates.org/api/latest.json?app_id=32c5a0d1a1204a57be97937c10121785&base=USD',
        method: 'GET'
        }).then(function(response) {
            //console.log(response.data)
            for (var key in response.data.rates) {
                vm.currencyArr.push(key)
                if (vm.currency == key) {
                   // vm.exchangeRate = response.data.rates[key];
                }
            }
            vm.changeCurrency = function() {
                for (var key in response.data.rates) {
                    vm.currencyArr.push(key)
                    if (vm.currency == key) {
                       // vm.exchangeRate = response.data.rates[key];
                    }
                }
            }
        }, function(response) {
            console.log(response)
        });

        function ChangeCurrency(cur) {
        
            currencyStatus = true;
            var currencyObj={
                currencyStatus :  true,
                exchangeRate : vm.exchangeRate,
                currencyType: cur
            }

            
            for (var i = prodArray.val.length - 1; i >= 0; i--) {
                InvoiceService.ReverseTax(prodArray.val[i], 1);
                InvoiceService.removeArray(prodArray.val[i], 1);
            }

            for (var i = productCopyArr.val.length - 1; i >= 0; i--) {
                InvoiceService.setFullArr({
                    productName: productCopyArr.val[i].productName,
                    price: parseFloat((productCopyArr.val[i].price / item.exchangeRate)*vm.exchangeRate),
                    quantity: productCopyArr.val[i].quantity,
                    ProductUnit: productCopyArr.val[i].ProductUnit,
                    discount: productCopyArr.val[i].discount,
                    tax: productCopyArr.val[i].tax,
                    olp: productCopyArr.val[i].olp,
                    amount: parseFloat((productCopyArr.val[i].amount / item.exchangeRate)*vm.exchangeRate),
                    status: productCopyArr.val[i].status
                })
            }
            ChangeMultiDueDates();
            $mdDialog.hide(currencyObj);
        }

        function ChangeMultiDueDates(){
            var updateDate = [];
            var newfamount = 0;

             updateDate = angular.copy(MultipleDudtesService.getArry());
             var dateArray = MultipleDudtesService.getArry();
            if(dateArray.val.length > 0){
                for (var i = dateArray.val.length - 1; i >= 0; i--) {
                    MultipleDudtesService.removeDateArray(dateArray.val[i], 1)
                } 
                for (var i = updateDate.val.length - 1; i >= 0; i--) {
                    if(item.currencyChanged == true){
                        newfamount = parseFloat((updateDate.val[i].dueDatePrice/item.exchangeRate )* vm.exchangeRate);
                    }else{
                       newfamount = parseFloat(updateDate.val[i].dueDatePrice * vm.exchangeRate); 
                    }
                    MultipleDudtesService.calDateArray({
                        invoiceNo : "",
                        dueDate: updateDate.val[i].dueDate,
                        percentage: updateDate.val[i].percentage,
                        dueDatePrice: newfamount,
                        paymentStatus: updateDate.val[i].paymentStatus,
                        balance: newfamount,
                        peymentTerm : "",
                        createDate   : new Date(),
                        modifyDate   : new Date(),
                        createUser   : "",
                        modifyUser   : "",
                        count: updateDate.val[i].count
                    });
                } 
            }
            
        }
    }
})();