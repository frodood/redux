(function ()
{
    'use strict';

    angular
        .module('app.invoices')
        .controller('InvoChangeCurrencyCtrl', InvoChangeCurrencyCtrl);

    /** @ngInject */
    function InvoChangeCurrencyCtrl($rootScope, $scope, item,total, $http, InvoiceService, invoiceMultipleDueDatesService, $mdToast, $document, $mdDialog, $mdMedia, $state)
    {
    	var vm = this;
        vm.cancel = cancel;
        vm.currencyArr = [];
        vm.baseCurrency = item.baseCurrency;
        vm.TotalInBaseCurrency = total;
        vm.TotalInSelectedCurrency = total;
        vm.exchangeRate = "";
        vm.ChangeCurrency = ChangeCurrency;
        vm.resetToBaseCurrency = resetToBaseCurrency;
       
        var currencyStatus = false;

        if(item.currencyChanged === true){

            console.log('currency changed !');

            console.log(item);

            var SelectedCurrencyObj = {currency_code:item.CountryOfchangedCurrency,currency_name:item.changedCurrency};
            console.log(SelectedCurrencyObj);
            $rootScope.$broadcast('extSlctdCurrency',SelectedCurrencyObj);

            vm.currency = item.changedCurrency;
            vm.exchangeRate = item.exchangeRate;
        }
        //var productArr = {};
        var productCopyArr = angular.copy(InvoiceService.getArry());
        console.log(productCopyArr)
        var prodArray = [];
        prodArray = InvoiceService.getArry();

         vm.isInfinityOrNaN = isInfinityOrNaN;
        function isInfinityOrNaN(value)
        { console.log(value);
            if(value == Infinity || isNaN(value))
            {
                return false;
            }
            else
            {
                return true;
            }
            
        }

         // selected currency operation
         var selectedCurrency = $rootScope.$on('selectedCurrency',function(event, args){
                debugger;
            vm.selectedCurrency = args.slctdCurrrency;

            vm.currency = vm.selectedCurrency
            //do something with currency.
        });

        $scope.$on('$destroy', function() {
            selectedCurrency();

        });
         // selected currency operation

        function cancel(){
            $mdDialog.cancel(currencyStatus);
        }

        // $http({
        // url: 'http://openexchangerates.org/api/latest.json?app_id=32c5a0d1a1204a57be97937c10121785&base=USD',
        // method: 'GET'
        // }).then(function(response) {
        //     //console.log(response.data)
        //     for (var key in response.data.rates) {
        //         vm.currencyArr.push(key)
        //         if (vm.currency == key) {
        //            // vm.exchangeRate = response.data.rates[key];
        //         }
        //     }
        //     vm.changeCurrency = function() {
        //         for (var key in response.data.rates) {
        //             vm.currencyArr.push(key)
        //             if (vm.currency == key) {
        //                // vm.exchangeRate = response.data.rates[key];
        //             }
        //         }
        //     }
        // }, function(response) {
        //     console.log(response)
        // });

        function ChangeCurrency() { 
        
        console.log(vm.currency.currency);
        
         currencyStatus = true;
         var currencyObj={
            currencyStatus : true,
            exchangeRate : vm.exchangeRate,
            currencyType: vm.currency.currency_code,
            CountryOfchangedCurrency: vm.currency.country
         }

        if(vm.exchangeRate == 0 || vm.exchangeRate == "")
        {
            currencyObj.currencyStatus = false;
            $mdDialog.hide(false);
            return;
        }

        
            for (var i = prodArray.val.length - 1; i >= 0; i--) {
            InvoiceService.ReverseTax(prodArray.val[i], 1);
            InvoiceService.removeArray(prodArray.val[i], 1);
        }

        for (var i = productCopyArr.val.length - 1; i >= 0; i--) {
            InvoiceService.setFullArr({
                invoiceNo: productCopyArr.val[i].invoiceNo,
                productID: productCopyArr.val[i].productID,
                productName: productCopyArr.val[i].productName,
                price: parseFloat((productCopyArr.val[i].price * item.exchangeRate)/vm.exchangeRate),
                quantity: productCopyArr.val[i].quantity,
                ProductUnit: productCopyArr.val[i].ProductUnit,
                discount: productCopyArr.val[i].discount,
                tax: productCopyArr.val[i].tax,
                olp: productCopyArr.val[i].olp,
                amount: parseFloat((productCopyArr.val[i].amount * item.exchangeRate)/vm.exchangeRate),
                status: productCopyArr.val[i].status
            })
        }
         
        ChangeMultiDueDates();
        $mdDialog.hide(currencyObj);
    }

    function resetToBaseCurrency()
    {
        if(vm.baseCurrency != vm.currency)
        {
            var currencyObj={
            isCurrencyReset : true,
            currencyStatus : false,
            exchangeRate : 1,
            currencyType: vm.baseCurrency,
            CountryOfchangedCurrency: "",
            oldExchangeRete : item.exchangeRate
         }

        for (var i = prodArray.val.length - 1; i >= 0; i--) {
            InvoiceService.ReverseTax(prodArray.val[i], 1);
            InvoiceService.removeArray(prodArray.val[i], 1);
        }

        for (var i = productCopyArr.val.length - 1; i >= 0; i--) {
            InvoiceService.setFullArr({
                invoiceNo: productCopyArr.val[i].invoiceNo,
                productID: productCopyArr.val[i].productID,
                productName: productCopyArr.val[i].productName,
                price: parseFloat((productCopyArr.val[i].price * item.exchangeRate)),
                quantity: productCopyArr.val[i].quantity,
                ProductUnit: productCopyArr.val[i].ProductUnit,
                discount: productCopyArr.val[i].discount,
                tax: productCopyArr.val[i].tax,
                olp: productCopyArr.val[i].olp,
                amount: parseFloat((productCopyArr.val[i].amount * item.exchangeRate)),
                status: productCopyArr.val[i].status
            })
        }
         
        ChangeMultiDueDates();
        $mdDialog.hide(currencyObj);

        }
    }

    function ChangeMultiDueDates(){
        var updateDate = [];
        var newfamount = 0;

         updateDate = angular.copy(invoiceMultipleDueDatesService.getArry());
         var dateArray = invoiceMultipleDueDatesService.getArry();
         if(dateArray.val.length > 0){
           for (var i = dateArray.val.length - 1; i >= 0; i--) {
            invoiceMultipleDueDatesService.removeDateArray(dateArray.val[i], 1)
        }



        for (var i = updateDate.val.length - 1; i >= 0; i--) {
            if(item.currencyChanged == true){
            newfamount = parseFloat((updateDate.val[i].dueDatePrice*item.exchangeRate )/ vm.exchangeRate);
        }else{
           newfamount = parseFloat(updateDate.val[i].dueDatePrice / vm.exchangeRate); 
        }
            invoiceMultipleDueDatesService.calDateArray({
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