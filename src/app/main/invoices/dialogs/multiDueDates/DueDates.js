(function ()
{
    'use strict';
    angular
        .module('app.invoices')
        .controller('InvomultiDueDatesCtrl', InvomultiDueDatesCtrl);

    /** @ngInject */
    function InvomultiDueDatesCtrl($scope, $rootScope, $focus, item,currency,invoice, invoiceMultipleDueDatesService, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state)
    {
    	var vm = this; 
    	vm.cancel = cancel;
    	vm.famount = 0;
        vm.showcal = 0;
    	vm.famount = item;
    	var newfamount = angular.copy(item)

    	vm.testarr = [];
    	vm.addItem = addItem;
    	vm.AddDueDates = AddDueDates;
    	vm.askDate = false;
        vm.editDueDates = false;
        vm.wrongDate = false;
    	vm.dateArray = {};
    	vm.dateArray = invoiceMultipleDueDatesService.getArry();
    	vm.editMultipleDuedates = [];
    	vm.editMultipleDuedates = angular.copy(invoiceMultipleDueDatesService.getArry());
        vm.changeDate = changeDate;

        if(vm.editMultipleDuedates.length > 1){
           vm.editMultipleDuedates.val = vm.editMultipleDuedates.val.sort(function(a, b) {
                return new Date(a.dueDate) - new Date(b.dueDate)
            })  
        }

        vm.invoice = invoice;

        if (!vm.invoice.isCurrencyChanged) {
            vm.baseCurrency = currency;
        } else {
            vm.baseCurrency = vm.invoice.changedCurrency;
        }
      


        vm.removeeditArray  = removeeditArray;
    	console.log(vm.dateArray)
    	vm.testarr = [{
                dueDate: '',
                percentage: '',
                dueDatePrice: '',
                changePrice : '',
                paymentStatus: 'Unpaid',
                balance: vm.famount * vm.invoice.exchangeRate,
                count: 1,
                uniqueKey: 'checkfocus1'
            }]; 

            
        debugger;
        var mulduedates = invoiceMultipleDueDatesService.getArry();
        if(mulduedates.val.length > 0){  
            vm.testarr = mulduedates.val;

            for(var i=0; i<= vm.testarr.length-1; i++){ 
                vm.testarr[i].changePrice = vm.testarr[i].dueDatePrice / vm.invoice.exchangeRate; 
            }


            // for(var i=0; i<= vm.testarr.length-1; i++){
            //     var latestDueprice = parseFloat((vm.famount * vm.testarr[i].percentage) / 100 ).toFixed(2);
            //     vm.testarr[i].changePrice = latestDueprice / vm.invoice.exchangeRate;
            //     vm.testarr[i].dueDatePrice = latestDueprice;
            // }
            console.log('testarr');
            console.log(vm.testarr);
            console.log('testarr');

        }

    	//=======Close Dialog====================
    	function cancel(){ 
    		$mdDialog.cancel();
    	}

    	//=======================================
    	function addItem(){ 
            if(vm.askDate == false && vm.wrongDate == false){
        		var arrr = [];
                var perCount = 0;
                var focus = 0;
                 for (var i = 0; i <= vm.testarr.length - 1; i++) {
                    perCount += parseInt(vm.testarr[i].percentage);
                    var numbers = parseInt(vm.testarr[i].count) + 1;
                    focus = 'checkfocus' + (parseInt(vm.testarr[i].count) + 1).toString();
                };
                if (perCount >= 100) {} else if (perCount < 100) {
                    vm.testarr.push({
                    dueDate: '',
                    percentage: '',
                    dueDatePrice: '',
                    changePrice : '',
                    paymentStatus: 'Unpaid',
                    balance: parseFloat(vm.famount - newfamount).toFixed(2),
                    count: numbers,
                    uniqueKey: focus
                    });
                }
            }

    	}
    	//====================================================
    	function AddDueDates (){ 
    		if(vm.askDate == false && vm.wrongDate == false){
	    		var calc = 0;
	    		var checkArr = [];
	            $rootScope.checkArr = angular.copy(vm.testarr);
	            for (var i = vm.testarr.length - 1; i >= 0; i--) {
	                calc += parseFloat(vm.testarr[i].percentage);
	                invoiceMultipleDueDatesService.calDateArray({
	                    invoiceNo : "",
	                    dueDate: vm.testarr[i].dueDate,
	                    percentage: vm.testarr[i].percentage,
                        changePrice : parseFloat(vm.testarr[i].changePrice).toFixed(2),
	                    dueDatePrice: parseFloat(vm.testarr[i].dueDatePrice).toFixed(2),
	                    paymentStatus: "Unpaid",
	                    balance: parseFloat(vm.testarr[i].dueDatePrice).toFixed(2),
	                    peymentTerm : "",
	                    createDate   : new Date(),
	                    modifyDate   : new Date(),
	                    createUser   : "",
	                    modifyUser   : "",
	                    ccount: vm.testarr[i].count,
	                    uniqueKey: vm.testarr[i].uniqueKey
	                });
	            };
	            if (calc == 100) {
	                $mdDialog.cancel();
	            } 
    		}
           
    	}
    	//==================================================
        vm.showTotal = 0;
    	vm.DueAmount  = function(cn, index){ debugger
    		$scope.showPercentage = false;
            var TempLineTotal = 0;
	        var calc = 0;
            vm.showTotal = 0;
	        var tot = 0;

	        if(cn.dueDate == ""){
	            vm.askDate = true;
	        }

            var famount = vm.famount / vm.invoice.exchangeRate;

	        for (var i = vm.testarr.length - 1; i >= 0; i--) {
	            vm.showPercentage = false;
                if(vm.testarr[i].percentage == null){vm.testarr[i].percentage = 0;}
                TempLineTotal += (parseFloat(famount * vm.testarr[i].percentage) / 100);

	            calc += parseFloat(vm.testarr[i].percentage);
	            tot = parseFloat(calc);
                vm.showcal = parseFloat(100  - tot);
	            if (tot > 100) {
	                vm.showPercentage = true;
	            }
	        }
            vm.showTotal = parseFloat(famount - TempLineTotal);
	        newfamount = (parseFloat(famount * cn.percentage) / 100);
	        vm.testarr[index] = {
	            dueDate: cn.dueDate,
	            percentage: cn.percentage,
	            changePrice: newfamount.toFixed(2),
                dueDatePrice: parseFloat(newfamount * vm.invoice.exchangeRate).toFixed(2),
	            balance: parseFloat(newfamount * vm.invoice.exchangeRate).toFixed(2),
	            count: cn.count,
	            uniqueKey: cn.uniqueKey
	        }
	        $focus(cn.uniqueKey);
    	}
    	//==================================================
    	vm.removeItem = removeItem;
    	function removeItem(val, index){
            $scope.showPercentage = false;
            vm.testarr.splice(vm.testarr.indexOf(val), 1);
            //Start added by dushmantha
            var TempLineTotal = 0;
            var calc = 0;
            vm.showTotal = 0;
            var tot = 0;
            if(val.dueDate == ""){
                vm.askDate = true;
            }
            if(vm.testarr.length == 0){vm.showcal = "0";}

            var famount = vm.famount / vm.invoice.exchangeRate;

            for (var i = vm.testarr.length - 1; i >= 0; i--) {
                vm.showPercentage = false;
                TempLineTotal += (parseFloat(famount * vm.testarr[i].percentage) / 100);

                calc += parseFloat(vm.testarr[i].percentage);
                tot = parseFloat(calc);
                vm.showcal = parseFloat(100  - tot);
                if (tot > 100) {
                    vm.showPercentage = true;
                }
            }
            vm.showTotal = parseFloat(famount - TempLineTotal);
            newfamount = (parseFloat(famount * val.percentage) / 100);
            
            //End added by dushmantha

    		
    	}

    	//===================================================

        function removeeditArray(cc, index){
            var tt = index + 1;
            var deletedP = 0;
            var editArr = vm.editMultipleDuedates.val;
            if (editArr.length > 1) {
                vm.editMultipleDuedates.val.splice(vm.editMultipleDuedates.val.indexOf(cc), 1);

                if (editArr.length >= tt) {
                    deletedP = parseInt(editArr[index].percentage) + parseInt(cc.percentage);
                    editArr[index] = {
                        dueDate: editArr[index].dueDate,
                        percentage: deletedP,
                        changePrice : parseInt(editArr[index].changePrice + cc.changePrice),
                        dueDatePrice: parseInt(editArr[index].dueDatePrice + cc.dueDatePrice),
                        balance: parseInt(editArr[index].balance) + parseInt(cc.balance),
                        count: editArr[index].count,
                        paymentStatus: editArr[index].paymentStatus,
                        uniqueKey: editArr[index].uniqueKey
                    }
                } else if (editArr.length < tt) {
                    deletedP = parseInt(editArr[index - 1].percentage) + parseInt(cc.percentage);
                    editArr[index - 1] = {
                        dueDate: editArr[index - 1].dueDate,
                        percentage: deletedP,
                        changePrice: parseInt(editArr[index - 1].changePrice) + parseInt(cc.changePrice),
                        dueDatePrice: parseInt(editArr[index - 1].dueDatePrice) + parseInt(cc.dueDatePrice),
                        balance: parseInt(editArr[index - 1].balance) + parseInt(cc.balance),
                        count: editArr[index - 1].count,
                        paymentStatus: editArr[index - 1].paymentStatus,
                        uniqueKey: editArr[index - 1].uniqueKey
                    }
                }
            }
            vm.editDueDates = true;
        }

        //===================================================
        vm.EditDueAmount = EditDueAmount;
        function EditDueAmount(cn, index){
            vm.percentageError = false;
            vm.showPercentage = false;
            var tota = 0;
            var tot = 0;
            if(cn.DueDate == ""){
                vm.askDate = true;
            }
            for (var i = vm.editMultipleDuedates.val.length - 1; i >= 0; i--) {
                vm.showPercentage = false;
                tota += parseFloat(vm.editMultipleDuedates.val[i].percentage)
                tot = parseFloat(tota).toFixed(2);
            }

            if(tot>100){
                 vm.showPercentage = true;
            }

            vm.cal = 0;
            vm.editDueDates = true;
            newfamount = (parseFloat(vm.famount * cn.percentage) / 100);
            vm.editMultipleDuedates.val[index] = {
                dueDate: cn.dueDate,
                percentage: cn.percentage,
                dueDatePrice: parseFloat(newfamount).toFixed(2),
                changePrice: parseFloat(newfamount * vm.invoice.exchangeRate).toFixed(2),
                balance: parseFloat(newfamount).toFixed(2),
                count: cn.count,
                paymentStatus: 'Unpaid',
                uniqueKey: cn.uniqueKey
            }
            $focus(cn.uniqueKey);
        }
        //==================================================
        vm.addEditDueDates = addEditDueDates;
        function addEditDueDates(){
            if(vm.askDate == false && vm.wrongDate == false){
                var perCount = 0;
                vm.focus = 0;
                for (var i = 0; i <= vm.editMultipleDuedates.val.length - 1; i++) {
                    perCount += parseInt(vm.editMultipleDuedates.val[i].percentage);
                    var numbers = parseInt(vm.editMultipleDuedates.val[i].count) + 1;
                    vm.focus = 'checkfocus' + (parseInt(vm.editMultipleDuedates.val[i].count) + 1).toString();
                };
                if (perCount >= 100) {

                } else if (perCount < 100) {
                    vm.editMultipleDuedates.val.push({
                        dueDate: '',
                        percentage: '',
                        dueDatePrice: '',
                        changedCurrency: '',
                        paymentStatus: 'Unpaid',
                        balance: parseFloat(vm.famount - newfamount).toFixed(2),
                        count: numbers,
                        uniqueKey: $scope.focus
                    });
                } 
            }
        }
        //============================================
        function changeDate(cn)
        {debugger;
            if(cn.dueDate != ""){
                vm.askDate = false;
            }

            var dueDate_copy = angular.copy(cn.dueDate);
            var startDate_copy = angular.copy(invoice.startDate);
            dueDate_copy.setHours(0,0,0,0);
            startDate_copy.setHours(0,0,0,0);
            if(startDate_copy > dueDate_copy )
            {
                vm.wrongDate = true;
            }else
            {
                vm.wrongDate = false;
            }
        }
        //============================================
        vm.UpdateDueDates = UpdateDueDates;

        function UpdateDueDates(){
            if(vm.askDate == false && vm.wrongDate == false){
                vm.calc = 0;
                var amountT = 0;
                $rootScope.checkArr = [];
                $rootScope.checkArr = angular.copy(vm.testarr);
                vm.editMultipleDuedates.val = angular.copy(vm.testarr);
                //$rootScope.checkArr = angular.copy(vm.editMultipleDuedates);
                $scope.oldPercentage = 0;
                for (var i = 0; i < vm.editMultipleDuedates.val.length; i++) {
                    amountT += parseFloat(vm.editMultipleDuedates.val[i].percentage);
                }

                if (amountT == 100) {
                    invoiceMultipleDueDatesService.removeAllTheDates(0);
                    console.log(invoiceMultipleDueDatesService.getArry());
                    for (var i = vm.editMultipleDuedates.val.length - 1; i >= 0; i--) {
                        invoiceMultipleDueDatesService.setDateArray(vm.editMultipleDuedates.val[i])
                    }
                    // for (var i = $rootScope.dateArray.val.length - 1; i >= 0; i--) {
                    //     $rootScope.dateArray.val.splice($rootScope.dateArray.val.indexOf($rootScope.dateArray.val[i]), 1)
                    // }
                    //$rootScope.dateArray.val = $scope.editMultipleDuedates;
                    $mdDialog.hide();
                } else {
                   vm.percentageError = true;

                }
            }
        }
    }
})();