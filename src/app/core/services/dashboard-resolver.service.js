(function()
{
	'use strict';

	angular
		.module('dashboardContext',[])
		.factory('dashboardContextService',dashboardContextService);

	/** @ngInject */
	function dashboardContextService($rootScope, $window, $http, $q, $log){

		var isPrimed = false;
		var dashboardPeriodContext;

		var dashboardContextService = {
			getDashboardChartData : getDashboardChartData,
			getDashboardTotalSales : getDashboardTotalSales,
			getDashboardTotalPayments : getDashboardTotalPayments,
			getDashboardTotalExpenses : getDashboardTotalExpenses,
			getDashboardTotalOutstanding : getDashboardTotalOutstanding,
			getDashboardTotalCurrentOverdueOutstanding : getDashboardTotalCurrentOverdueOutstanding,
			getDashboardTotalOverdueBreakdown : getDashboardTotalOverdueBreakdown 
		};

		return dashboardContextService;

		//Utility Function - Get Host & Get Business Duration

		function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com";
			}
			return host;
		}
		
		// function constructReqUrl(periodcontext, periodBusinessCount) {

		// }
		
		// utility method
		function getBusinessDuration() {

			return 	$http({
						url: getHost()+'/services/duosoftware.setting.service/setting/getAllByQuery',
						method: "POST",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						},
						data:{"setting":"profile"}
					}).then(setBusinessYearComplete).catch(setBusinessYearFailed);


			function setBusinessYearComplete(response){
				var glblTranStartDate = response.data[0].profile.transactionStart;
				var glblTranEndDate = response.data[0].profile.transactionEnd;

				return {'businessYearStart':glblTranStartDate,'lastTransactionDate':glblTranEndDate};
			}

			function setBusinessYearFailed(error){
				$log.error('XHR failed to set business year.'+error);
			}
		}
		
		function getDashboardChartData(periodBusinessCount, periodMonthCount){
			return $http({
				url: getHost()+'/services/duosoftware.reporting.service/reporting/getDashboardSREChart?monthCount=&yearStart='+periodBusinessCount.yearStart+'&yearEnd='+periodBusinessCount.yearEnd+'&givenPeriod=true',
				method: 'GET',
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				}
			}).then(getDashboardChartDataComplete).catch(getDashboardChartDataFailed);

			function getDashboardChartDataComplete(response){
				return response.data.data;
			}

			function getDashboardChartDataFailed(error){
				$log.error('XHR failed to get dashboard chart data.'+error);
			}
		}

		function getDashboardTotalSales(periodBusinessCount, periodMonthCount){
			return $http({
				url: getHost()+'/services/duosoftware.reporting.service/reporting/getDashboardTotalSales?monthCount=&yearStart='+periodBusinessCount.yearStart+'&yearEnd='+periodBusinessCount.yearEnd+'&givenPeriod=true',
				method: 'GET',
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				}
			}).then(getDashboardTotalSalesComplete).catch(getDashboardTotalSalesFailed);

			function getDashboardTotalSalesComplete(response){
				return response;
				console.log(response);
			}

			function getDashboardTotalSalesFailed(error){
				$log.error('XHR failed to get dashboard total sales data.'+error);
			}
		}

		function getDashboardTotalPayments(periodBusinessCount, periodMonthCount){

			return $http({
				url: getHost()+'/services/duosoftware.reporting.service/reporting/getDashboardTotalPayments?monthCount=&yearStart='+periodBusinessCount.yearStart+'&yearEnd='+periodBusinessCount.yearEnd+'&givenPeriod=true',
				method: 'GET',
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				}
			}).then(getDashboardTotalPaymentsComplete).catch(getDashboardTotalPaymentsFailed);

			function getDashboardTotalPaymentsComplete(response){
				return response;
				console.log(response);
			}

			function getDashboardTotalPaymentsFailed(error){
				$log.error('XHR failed to get dashboard total payments data.'+error);
			}
		}

		function getDashboardTotalExpenses(periodBusinessCount, periodMonthCount){

			return $http({
				url: getHost()+'/services/duosoftware.reporting.service/reporting/getDashboardTotalExpenses?monthCount=&yearStart='+periodBusinessCount.yearStart+'&yearEnd='+periodBusinessCount.yearEnd+'&givenPeriod=true',
				method: 'GET',
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				}
			}).then(getDashboardTotalExpensesComplete).catch(getDashboardTotalExpensesFailed);

			function getDashboardTotalExpensesComplete(response){
				return response;
				console.log(response);
			}

			function getDashboardTotalExpensesFailed(error){
				$log.error('XHR failed to get dashboard total expenses data.'+error);
			}
		}

		function getDashboardTotalOutstanding(periodBusinessCount, periodMonthCount){

			return $http({
				url: getHost()+'/services/duosoftware.reporting.service/reporting/getDashboardTotaloutstanding?monthCount=&yearStart='+periodBusinessCount.yearStart+'&yearEnd='+periodBusinessCount.yearEnd+'&givenPeriod=true',
				method: 'GET',
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				}
			}).then(getDashboardTotalOutstandingComplete).catch(getDashboardTotalOutstandingFailed);

			function getDashboardTotalOutstandingComplete(response){
				return response;
				console.log(response);
			}

			function getDashboardTotalOutstandingFailed(error){
				$log.error('XHR failed to get dashboard total outstanding data.'+error);
			}
		}

		function getDashboardTotalCurrentOverdueOutstanding(periodBusinessCount, periodMonthCount){

			return $http({
				url: getHost()+'/services/duosoftware.reporting.service/reporting/getDashboardCurrentOverdueOutstanding?monthCount=&yearStart='+periodBusinessCount.yearStart+'&yearEnd='+periodBusinessCount.yearEnd+'&givenPeriod=true',
				method: 'GET',
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				}
			}).then(getDashboardTotalCurrentOverdueOutstandingComplete).catch(getDashboardTotalCurrentOverdueOutstandingFailed);

			function getDashboardTotalCurrentOverdueOutstandingComplete(response){
				return response;
				console.log(response);
			}

			function getDashboardTotalCurrentOverdueOutstandingFailed(error){
				$log.error('XHR failed to get dashboard total overdue outstanding data.'+error);
			}
		}

		function getDashboardTotalOverdueBreakdown(periodBusinessCount, periodMonthCount){
			return $http({
				url: getHost()+'/services/duosoftware.reporting.service/reporting/getDashboardCurrentOverdueOutstandingBreakdown?monthCount=&yearStart='+periodBusinessCount.yearStart+'&yearEnd='+periodBusinessCount.yearEnd+'&givenPeriod=true',
				method: 'GET',
				headers: {
					securityToken:$rootScope.cc_sessionInfo.SecurityToken
				}
			}).then(getDashboardTotalOverdueBreakdownComplete).catch(getDashboardTotalOverdueBreakdownFailed);

			function getDashboardTotalOverdueBreakdownComplete(response){
				return response;
				console.log(response);
			}

			function getDashboardTotalOverdueBreakdownFailed(error){
				$log.error('XHR failed to get dashboard total overdue outstanding data.'+error);
			}
		}

	};

})();