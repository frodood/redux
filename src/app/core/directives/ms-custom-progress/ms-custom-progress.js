(function(){
	'use strict';

	/*
	
    <div ng-repeat='item in vm.invoiceObj.fullArr ' style='height: 12px;    display: inline-block;' ng-style='{   \"width\" : item.fullWidth }'>\
    	<div style='display: flex;'>\ 
        	<div ng-if='$index != 0 ' ng-style='{ \"width\": item.whiteSpace }' >\
        	</div>\
        	<div ng-style='{ \"background-color\": item.color,\"width\": \"100%\" }' style='height: 12px; display: inline-block;'>\
        	</div>\
        </div>\
  	</div>\

	
		       
		        

	*/

	angular
        .module('app.core')
        .directive('msCustomProgress', msCustomProgress);

    function msCustomProgress(){
    	var directive = {
    		restrict: 'E',
	        template: "\
	        <div layout='column' ng-if='vm.invoiceObj.peymentTerm == \"multipleDueDates\"'  style='margin-left:-10px;height:12px; display:flex' md-swipe-right='vm.onSwipeRight(invoiceObj.startPage,invoiceObj.endPage)' md-swipe-left='vm.onSwipeLeft(vm.invoiceObj.startPage,vm.invoiceObj.endPage)'>\
		        <md-icon  ng-if='vm.leftArrow'  style='height: 13px;z-index: 10; background-color: white; margin-top: -3px;' md-svg-src='img/ic_keyboard_arrow_left_24px.svg' class='iconColor'  md-ink-ripple style='' ng-click='vm.onSwipeRight(vm.invoiceObj.startPage,vm.invoiceObj.endPage)'>\
		        </md-icon>\
		        <div layout='row' style='width:100%; height:10px;'>\
		        	<div ng-repeat='item in vm.invoiceObj.fullArr' ng-style='{\"width\" : item.fullWidth }'>\
		        		<md-tooltip><span ng-if='item.type ==  \"Paid\"'> {{item.price}} paid</span><span ng-if='item.type ==  \"Unpaid\"'> {{item.price  | currency : ''}} Unpaid</span><span ng-if='item.type ==  \"Partially Paid\"'> {{item.balance | currency : ''}} Remaining</span></md-tooltip>\
		      		</div>\
		      	</div>\
		        <div layout='row' style='width:100%; height:8px;'>\
		        	<div ng-repeat='item in vm.invoiceObj.fullArr ' style='height: 6px;display: inline-block;' ng-style='{   \"width\" : item.fullWidth }'>\
			        	<div style='display: flex;position:relative'>\
			        		<img style='position:absolute' ng-if='item.type ==  \"Partially Paid\"'  src='app/core/directives/ms-custom-progress/ruler.png' ng-style='{\"width\" : \"100%\",  \"height\" : \"10px\"}'>\
				        	<div ng-if='$index != 0 ' ng-style='{ \"width\": item.whiteSpace, \"margin-top\": \"-10px\", \"background-color\": \"rgb(250, 250, 250);\" }' >\
					        </div>\
					        <div style='z-index: 10;' ng-style='{ \"background-color\": item.color,\"width\":  item.divPres  }' style='height: 12px; display: inline-block; '>\
					        </div>\
					        <div ng-style='{ \"background-color\": \"rgb(250, 250, 250);\",\"width\": item.remainSpace  }' style='height: 12px; display: inline-block; '>\
					        </div>\
				        </div>\
				        <md-tooltip><span ng-if='item.type ==  \"Paid\"'> {{item.price}} paid</span><span ng-if='item.type ==  \"Unpaid\"'> {{item.price | currency : ''}} Unpaid</span><span ng-if='item.type ==  \"Partially Paid\"'> {{item.balance | currency : ''}} Remaining</span></md-tooltip>\
				  	</div>\
		        </div>\
	          	<md-icon ng-if='vm.rightArrow' md-svg-src='img/ic_keyboard_arrow_right_24px.svg' class='iconColor'  md-ink-ripple style='z-index: 10;height: 13px;background-color: white; margin-top: -3px' ng-click='vm.onSwipeLeft(vm.invoiceObj.startPage,vm.invoiceObj.endPage)'>\
	          	</md-icon>\
         	 </div>",
	        scope: {
	            invoiceObj: '='
	        },
	        link : linkFunc,
	        controller :progressCtrl,
	        controllerAs : 'vm',
            bindToController : true

    	};

    	return directive;

    	function linkFunc(){}
    };

    function progressCtrl($scope){

    	var vm = this;
		var fullArrayLength = 0;
        var fullArr = [];  
 

        vm.onSwipeLeft = onSwipeLeft;
        vm.onSwipeRight = onSwipeRight;
        vm.leftArrow = false;
        vm.rightArrow = false;

        // console.log(vm.invoiceObj);
        // debugger;


        if (vm.invoiceObj.multiDueDates.length > 0) {
            fullArrayLength = vm.invoiceObj.multiDueDates.length;
            var originalVal;
            if (fullArrayLength > 12) {
                originalVal = (100 / 12);
                vm.rightArrow = true;
            } else {
                originalVal = (100 / fullArrayLength);
            }
            var originVal = originalVal + '%';
            var withSpaceVal = (originalVal - 1) + '%';




            for (var l = 0; l <= vm.invoiceObj.multiDueDates.length - 1; l++) {
                switch (vm.invoiceObj.multiDueDates[l].paymentStatus) {
                    case "Unpaid": 
                        fullArr.push({
                            type: 'Unpaid',
                            color: 'rgb(245, 72, 59)',
                            maxWidth: withSpaceVal,
                            fullWidth: originVal,
                            divPres : '100%',
                            whiteSpace: '5%',
                            remainSpace: '0%',
                            dueDate: vm.invoiceObj.multiDueDates[l].dueDate,
                            price: vm.invoiceObj.multiDueDates[l].dueDatePrice,
                            balance: vm.invoiceObj.multiDueDates[l].balance
                        })
                        break;
                    case "Paid": 
                        fullArr.push({
                            type: 'Paid',
                            color: 'rgb(139, 195, 74)',
                            maxWidth: withSpaceVal,
                            fullWidth: originVal,
                            divPres : '100%',
                            whiteSpace: '5%',
                            remainSpace: '0%',
                            dueDate: vm.invoiceObj.multiDueDates[l].dueDate,
                            price: vm.invoiceObj.multiDueDates[l].dueDatePrice,
                            balance: vm.invoiceObj.multiDueDates[l].balance
                        })
                        break;
                    case "Partially Paid": 
        				// calculation for ruler 
                    	var paidAmount = parseInt(vm.invoiceObj.multiDueDates[l].paidAmount);
			        	var dueDatePrice = parseInt(vm.invoiceObj.multiDueDates[l].dueDatePrice);

			        	var rulerPres =(originalVal/dueDatePrice) * paidAmount;
			        	var divPres =  rulerPres * vm.invoiceObj.multiDueDates.length;

			        	var divWidth = divPres + '%';

			        	var remainSpace = 100 - divPres;

                        fullArr.push({
                            type: 'Partially Paid',
                            color: '#eeb754',
                            maxWidth: withSpaceVal,
                            fullWidth: originVal,
                            divPres : divWidth,
                            whiteSpace: '5%',
                            remainSpace: remainSpace + '%',
                            dueDate: vm.invoiceObj.multiDueDates[l].dueDate,
                            price: vm.invoiceObj.multiDueDates[l].dueDatePrice,
                            balance: vm.invoiceObj.multiDueDates[l].balance
                        })
                        break;
                    case "Cancelled": 
                        fullArr.push({
                            type: 'Cancelled',
                            color: 'black',
                            maxWidth: withSpaceVal,
                            fullWidth: originVal,
                            divPres : '100%',
                            whiteSpace: '5%',
                            remainSpace: '0%',
                            dueDate: vm.invoiceObj.multiDueDates[l].dueDate,
                            price: vm.invoiceObj.multiDueDates[l].dueDatePrice,
                            balance: vm.invoiceObj.multiDueDates[l].balance
                        })
                        break;
                    default:
                        console.log("incorrect payment status")
                }
            }

            vm.sortArr = fullArr.sort(function(a, b) {
                return new Date(a.dueDate) - new Date(b.dueDate)
            })

            vm.invoiceObj.fullArr = [];
            vm.invoiceObj.startPage = 0;
            vm.invoiceObj.endPage = 11;

            if (vm.sortArr.length > 12) {
                for (var k = 0; k <= 11; k++) {
                    vm.invoiceObj.fullArr.push(vm.sortArr[k])
                }
            } else {
                 vm.invoiceObj.fullArr = vm.sortArr;
            }
        };

        function onSwipeLeft(startPage, endPage) {
            var overload = false;
            vm.leftArrow = true;
            var newStartPage = parseInt(endPage) + 1;
            var newEndPage = parseInt(endPage) + 12;

            if (scope.sortArr.length > newStartPage) {

                vm.invoiceObj.startPage = newStartPage;
                vm.invoiceObj.endPage = newEndPage;
                vm.invoiceObj.fullArr = [];

                for (var i = newStartPage; i <= newEndPage; i++) {
                    if (vm.sortArr[i]) vm.invoiceObj.fullArr.push(vm.sortArr[i])
                    else overload = true;
                }
                if (overload) {
                    var newLength = 100 / vm.invoiceObj.fullArr.length
                    for (var p = 0; p <= vm.invoiceObj.fullArr.length - 1; p++) {
                        vm.invoiceObj.fullArr[p].fullWidth = newLength + '%';
                        vm.invoiceObj.fullArr[p].maxWidth = (newLength - 1) + '%';
                        vm.rightArrow = false;
                    }
                }
                if (vm.sortArr.length == parseInt(newEndPage + 1)) {
                    vm.rightArrow = false;
                }
            }
        };

        function onSwipeRight(startPage, endPage) {
            var newStartPage = parseInt(startPage) - 12;
            var newEndPage = parseInt(startPage) - 1;
            vm.rightArrow = true;
            if (newStartPage >= 0) {

                vm.invoiceObj.startPage = newStartPage;
                vm.invoiceObj.endPage = newEndPage;
                vm.invoiceObj.fullArr = []
                for (var i = newStartPage; i <= newEndPage; i++) {
                    vm.invoiceObj.fullArr.push(vm.sortArr[i])
                }
            }
            if (newStartPage == 0) {
                vm.leftArrow = false;
            }
        };
    }

})();