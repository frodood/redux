(function()
{
    'use strict';

    angular
    .module('app.dashboard')
    .controller('DashboardController', DashboardController);

    /** @ngInject */
    function DashboardController($rootScope, $window, $http, $serviceCall, $mdDialog, $mdToast, dashboardContextService, overviewContextService)
    {

        var vm = this;

        /*dashboard deffault values*/
        vm.componentsLoad = false;
        vm.metricsLoadingStatus = true;
        vm.businessContextBiteInfo = {
            totalSales:'', 
            totalReceipts:'', 
            totalExpenses:'', 
            totalOutstanding:''
        };
        vm.dashBoardPeriodContext = 1;
        vm.totalOutstandingBreakdown = {
            current:'',
            overdue:''
        }

        vm.totalOverdueBreakDownData;

        /*dashboard exposed function*/

        vm.dashboardPeriodContextChange = dashboardPeriodContextChange;

        vm.openSocialContact = openSocialContact;

        //chart configuration

        vm.dashBoardChartColors = ['#2d94df', '#85cd2d', '#FF7E82'];

        //initialization variables

        var businessContext = {};

        var businessContextMaster = {};

        var monthCountQuery = 12;

        var checkPastYear = false;

        //get initial busines start date and end date (one time operation)
        function setBusinessPeriodContext(){
            overviewContextService.setBusinessYear()
                .then(function(response){
                    businessContextMaster.yearStart = response.businessYearStart;
                    businessContextMaster.yearEnd = response.lastTransactionDate;

                    businessContext.yearStart = angular.copy(businessContextMaster.yearStart);
                    businessContext.yearEnd = angular.copy(businessContextMaster.yearEnd);

                    console.log(businessContextMaster.yearStart, businessContextMaster.yearEnd);
                    console.log(businessContext.yearStart, businessContext.yearEnd);

                    //initail routine call
                    transformBusinessPeriodContext();
                    dashboardContextChainer();
                });
                
        };

        //onetime operation
        setBusinessPeriodContext();

        function transformBusinessPeriodContext(){
            var yearStart, yearEnd;
            
            var dboardperiodContext = parseInt(vm.dashBoardPeriodContext);

            //check if period context is for currentyear / previousyear
            if(dboardperiodContext === 1){

                console.log('current year selected !');
  
                //copy existing context period

                businessContext.yearStart = angular.copy(businessContextMaster.yearStart);
                businessContext.yearEnd = angular.copy(businessContextMaster.yearEnd);

                //set check past year status
                checkPastYear = false;

                console.log(businessContext); 
            }else{
                console.log('past year selected !');

                businessContext.yearStart = angular.copy(businessContextMaster.yearStart);
                businessContext.yearEnd = angular.copy(businessContextMaster.yearEnd);

                //convert date string to date object for later computation
                yearStart = new Date(businessContext.yearStart);
                yearEnd = new Date(businessContext.yearEnd);

                // //calculate past year start and end date
                yearStart = yearStart.setFullYear(yearStart.getFullYear() - 1);
                yearEnd = yearEnd.setFullYear(yearEnd.getFullYear() - 1);

                // //asign convered milisecond date to temp variables
                var yearStartDobj = new Date(yearStart);
                var yearEndDobj =  new Date(yearEnd);

                // //reset business context with formated ISO date
                businessContext.yearStart = yearStartDobj.toISOString();
                businessContext.yearEnd = yearEndDobj.toISOString();

                //set check past year status
                checkPastYear = true;

                console.log(businessContext); 
            };
        };


        function dashboardPeriodContextChange(){
            transformBusinessPeriodContext();
            dashboardContextChainer();
        };

        //context chainer function that calls all the methods from the dashboard context service.
        function dashboardContextChainer(){
            retreiveDashboardChartData(businessContext, monthCountQuery, checkPastYear);
            retreiveDashboardTotalSalesData(businessContext, monthCountQuery, checkPastYear);
            retreiveDashboardTotalPaymentData(businessContext, monthCountQuery, checkPastYear);
            retreiveDashboardTotalExpensesData(businessContext, monthCountQuery, checkPastYear);
            retreiveDashboardTotalOutstandingData(businessContext, monthCountQuery, checkPastYear);
            retreiveDashboardTotalCurrentOverdueOutstandingData(businessContext, monthCountQuery, checkPastYear);
            retreiveDashboardTotalOverdueBreakdown(businessContext, monthCountQuery, checkPastYear);
        };  

        function retreiveDashboardChartData(chartBusinessDuration, chartBusinessPeriod){

            vm.barChart = {
                labels: [],
                series: [],
                data  : []
            };

            dashboardContextService.getDashboardChartData(chartBusinessDuration, chartBusinessPeriod)
                .then(function(response){

                    // console.log(response);

                    var chartlabels = response.x;
                    var chartseries = response.Series;

                    // console.log(chartseries);

                    for(var l = 0; l < chartlabels.length; l++){
                        vm.barChart.labels.push(chartlabels[l]);
                    }

                    for(var m = 0; m < chartseries.length; m++){
                        vm.barChart.series.push(chartseries[m].name);
                        var tempSeriesData = chartseries[m].data;
                        vm.barChart.data.push(tempSeriesData);
                    }

                });
        };

        function retreiveDashboardTotalSalesData(chartBusinessDuration, chartBusinessPeriod){
            dashboardContextService.getDashboardTotalSales(chartBusinessDuration, chartBusinessPeriod)
                .then(function(response){
                    vm.businessContextBiteInfo.totalSales = response.data.data.TotalSales;
                });
        };

        function retreiveDashboardTotalPaymentData(chartBusinessDuration, chartBusinessPeriod){
            dashboardContextService.getDashboardTotalPayments(chartBusinessDuration, chartBusinessPeriod)
                .then(function(response){
                    vm.businessContextBiteInfo.totalReceipts = response.data.data.TotalPayments;
                });
        };

        function retreiveDashboardTotalExpensesData(chartBusinessDuration, chartBusinessPeriod){
            dashboardContextService.getDashboardTotalExpenses(chartBusinessDuration, chartBusinessPeriod)
                .then(function(response){
                    vm.businessContextBiteInfo.totalExpenses = response.data.data.TotalExpense;
                });
        };

        function retreiveDashboardTotalOutstandingData(chartBusinessDuration, chartBusinessPeriod){
            dashboardContextService.getDashboardTotalOutstanding(chartBusinessDuration, chartBusinessPeriod)
                .then(function(response){
                    vm.businessContextBiteInfo.totalOutstanding = response.data.data.Totaloutstanding;
                });
        };

        function retreiveDashboardTotalCurrentOverdueOutstandingData(chartBusinessDuration, chartBusinessPeriod){
            dashboardContextService.getDashboardTotalCurrentOverdueOutstanding(chartBusinessDuration, chartBusinessPeriod)
                .then(function(response){
                    vm.totalOutstandingBreakdown.current = response.data.data.TotalOutStandingCurrent;
                    vm.totalOutstandingBreakdown.overdue = response.data.data.TotalOutStandingOverdue;
                });
        };

        function retreiveDashboardTotalOverdueBreakdown(chartBusinessDuration, chartBusinessPeriod){
            dashboardContextService.getDashboardTotalOverdueBreakdown(chartBusinessDuration, chartBusinessPeriod)
                .then(function(response){
                    console.log(response);
                    vm.totalOverdueBreakDownData = response.data.data;
                    // vm.totalOutstandingBreakdown.current = response.data.data.TotalOutStandingCurrent;
                    // vm.totalOutstandingBreakdown.overdue = response.data.data.TotalOutStandingOverdue;
                });
        };

        //social media contact functions
        function openSocialContact(sociallink){

            switch(sociallink){
                case "facebook":

                    $window.open('https://www.facebook.com/12thdoor/', '_blank');

                    break;
                case "instagram":

                    $window.open('https://www.instagram.com/12thdoorinc/', '_blank');

                    break;
                case "youtube":

                    $window.open('https://www.youtube.com/channel/UCXJKJsiLA5bEYGAMgvyLbbA', '_blank');

                    break;
                default:
                    console.log('Wrong social media selection');
            }
        };
    }
  
})();