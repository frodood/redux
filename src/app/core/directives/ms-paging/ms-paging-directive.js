(function(){
    'use strict';
    /*

        version 6.0.0.2



        @desc paging directive for 12thdoor apps 

            *** in html ***
              <ms-paging  page-obj='vm.pageObj' result="vm.productSummary" page-gap="vm.pageGap"></ms-paging>


            *** in controller ***
            
            vm.pageObj = {
                service : 'process',
                method : 'getProductSummaryByQuery',
                body : {
                    "where":"where clause"
                },
                orderby: 'productName',
                isAscending : true
            } // 
            vm.pageGap = 10; // no of records to page

            vm.productSummary // the list array 
            

            $scope.$broadcast("getPageObj", vm.pageObj) // call inside controller function

    */
    angular
        .module('app.core')
        .directive('msPaging', msPaging)
    
    function msPaging(){
        var directive= {
            restrict: 'E',
            template: '\
                <div layout="row" layout-align="start center">\
                    <span class="page-info" hide-sm>{{vm.startCount}} - {{vm.endCount}} of {{vm.queryCount}}</span>\
                    <md-button class="md-icon-button arrow" aria-label="Previous" ng-click="vm.previous()" ng-disabled="vm.hidePreBtn">\
                        <md-icon md-font-icon="icon-chevron-left"></md-icon>\
                        <md-tooltip><span>Previous</span></md-tooltip>\
                    </md-button>\
                    <md-button class="md-icon-button arrow" aria-label="Next" ng-click="vm.next()" ng-disabled="vm.hideNextBtn">\
                        <md-icon md-font-icon="icon-chevron-right"></md-icon>\
                        <md-tooltip><span>Next</span></md-tooltip>\
                    </md-button>\
                </div>',
            link : linkFunc,
            controller : pageController,
            controllerAs: 'vm',
            scope: {
                pageObj : '=', 
                result : '=',
                pageGap: '='
            },
            bindToController : true
        }

        return directive;
        function linkFunc(scope){}
    }
 
    

    pageController.$inject = ["$scope","$serviceCall"];
    function pageController($scope,$serviceCall){
        var vm = this;
        vm.pageGap = parseInt(vm.pageGap);

        vm.skip = 0;
        vm.take = vm.pageGap;

        vm.startCount = 1;
        vm.endCount = vm.pageGap 

        vm.hideNextBtn = false;
        vm.hidePreBtn = true;

        vm.next = next;
        vm.previous = previous;

        init();

        function init(){
            vm.result = null;

            var client =  $serviceCall.setClient(vm.pageObj.method, vm.pageObj.service); // method name and service
            client.ifSuccess(function(response){  //sucess   
                vm.result = [];                             
                var data = response.result
                if(!data)
                    data = [];
                vm.queryCount = response.queryCount
                vm.result = data;

                checkGapAndCount();
            }) // send this to callback function otherwise can't call prototype methods inside callback
            client.ifError(function(response){ //falce
                console.log("error loading setting data")
            })
            client.skip(vm.skip); // send projectID as url parameters
            client.take(vm.take); // send projectID as url parameters
            client.orderby(vm.pageObj.orderby);
            client.isAscending(vm.pageObj.isAscending);
            if (vm.pageObj.FromDate) {
                client.FromDate(vm.pageObj.FromDate);
            }
            if (vm.pageObj.ToDate) {
                client.ToDate(vm.pageObj.ToDate);
            }
            if (vm.pageObj.uniqueID) {
                client.uniqueID(vm.pageObj.uniqueID);
            }
            client.postReq(vm.pageObj.body); // get request if post then use 'postReq('jsonbody')'


        }

        function checkGapAndCount(){
            if (vm.queryCount < vm.pageGap) {
                vm.endCount = vm.queryCount; 
                vm.startCount = 1;
                vm.hideNextBtn = true;
            }else{
                vm.endCount = vm.skip + vm.pageGap;
                vm.hideNextBtn = false; 
                hideNxtBtn()
            }
        }

        function next(){
            vm.skip += vm.pageGap;
            vm.startCount += vm.pageGap;
            vm.endCount = vm.skip + vm.pageGap
            vm.hidePreBtn = false; 
            hideNxtBtn()
            init();

        }

        function hideNxtBtn(){            
            if (vm.endCount > vm.queryCount ) {
                vm.endCount = vm.queryCount;
                vm.hideNextBtn = true;
            }
        }

        function previous(){
            vm.skip -= vm.pageGap;
            vm.startCount -= vm.pageGap;
            vm.endCount = vm.skip + vm.pageGap
            vm.hideNextBtn = false;

            if (vm.skip === 0 ) { 
                vm.hidePreBtn = true;
            }            
            init();
        }

        $scope.$on("getPageObj", function (event, args) {
            vm.skip = 0;
            vm.take = vm.pageGap;
            vm.startCount = 1;
            vm.hidePreBtn = true;
            
            vm.pageObj = args;
            init();
        });

    }

})();

/*
    v 6.0.0.2 added date parameters     01/06/2017

*/