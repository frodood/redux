(function()
{
	'use strict';

	angular
		.module('overviewContext',[])
		.factory('overviewContextService',overviewContextService);

	/** @ngInject */
	function overviewContextService($rootScope, $window, $http, $q, $log){

		var isPrimed = false;
		var glblPeriodContext;

		var overviewContextService = {
			setBusinessYear : setBusinessYear,
			setAllProfileDetails : setAllProfileDetails,
			setCustomerContext : setCustomerContext,
			refreshOverviewDataContext : refreshOverviewDataContext,
			getTotalSalesContextBiteInfo : getTotalSalesContextBiteInfo,
			getTotalReceiptsContextBiteInfo : getTotalReceiptsContextBiteInfo,
			getAverageSalesContextBiteInfo : getAverageSalesContextBiteInfo,
			getTotalExpensesBiteInfo : getTotalExpensesBiteInfo,
			getTotalOutstandingContextBiteInfo : getTotalOutstandingContextBiteInfo,
			getTopSellingProducts : getTopSellingProducts,
			getContextLatestDocuments : getContextLatestDocuments,
			getContextGraphData : getContextGraphData 
		};

		return overviewContextService;

		//Utility Function - Get Host

		function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com";
			}
			return host;
		}

		// Set Business Functioning Years which should be passed to all the services requiring it.

		function setBusinessYear(){

			var setBusinessYearPayLoad = {"setting":"profile"};

			return 	$http({
						url: getHost()+'/services/duosoftware.setting.service/setting/getAllByQuery',
						method: "POST",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						},
						data:setBusinessYearPayLoad
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

		// Refresh reporting service to update with latest data.

		function refreshOverviewDataContext(){

			return 	$http({
						url: getHost()+'/services/duosoftware.reporting.service/reporting/synchronize',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(refreshOverviewDataContextComplete).catch(refreshOverviewDataContextFailed);


			function refreshOverviewDataContextComplete(response){

				return response;

				console.log(response);
			}

			function refreshOverviewDataContextFailed(error){
				$log.error('XHR failed to refresh overview data context.'+error);
			}
		}

		// Get default profiles to display selections.

		function setAllProfileDetails(takeLvl){

			var profileTakeLevel = takeLvl;

			if(profileTakeLevel === null){
				profileTakeLevel = 8;
			}else{
				console.log(profileTakeLevel);
			}

			var setAllProfileDetailsPayLoad = {"where":"deleteStatus = 'false' "};

			return 	$http({
						url: getHost()+'/services/duosoftware.profile.service/profile/getAllByQuery?skip=0&take='+profileTakeLevel+'&class=Customer&orderby=profileID&isAscending=true',
						method: "POST",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						},
						data : setAllProfileDetailsPayLoad
					}).then(setAllProfileDetailsComplete).catch(setAllProfileDetailsFailed);

			function setAllProfileDetailsComplete(response){

				var profilesData = response.data.result;

				if(profilesData.length !== 0){

					var preloadedProfileSelections = [];

					for(var i = 0; i <= profilesData.length - 1; i++){
						preloadedProfileSelections.push({
							profileName : profilesData[i].profileName,
							value : profilesData[i].profileName.toLowerCase()
						})
					}
				}else{}

				return preloadedProfileSelections;
			}


			function setAllProfileDetailsFailed(error){
				$log.error('XHR failed to set all profile details.'+error);
			}
		}

		// Set customer context

		function setCustomerContext(querry){

			var contextSpecificBody = {"where":"deleteStatus = 'false' and profileName = '"+querry+"' "};

			return  $http({
						url: getHost()+'/services/duosoftware.profile.service/profile/getAllByQuery?skip=0&take=8&class=Customer&orderby=profileID&isAscending=true',
						method: "POST",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						},
						data : contextSpecificBody
					}).then(setCustomerContextComplete).catch(setCustomerContextFailed);

			function setCustomerContextComplete(response){
				return response;
			}

			function setCustomerContextFailed(error){
				$log.error('XHR failed to get context specific profile detail.'+error);
			}
		}

		// Get context bite info

		function getTotalSalesContextBiteInfo(contextProfileID, businessDuration, samplerDuration){

			return  $http({
						url: getHost()+'/services/duosoftware.reporting.service/reporting/getTotalSales?profileID='+contextProfileID+'&monthCount=&yearStart='+businessDuration.businessYearStart+'&yearEnd='+businessDuration.lastTransactionDate+'&givenPeriod=true',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getTotalSalesContextBiteInfoComplete).catch(getTotalSalesContextBiteInfoFailed);

			function getTotalSalesContextBiteInfoComplete(response){
				return response.data.data;
			}

			function getTotalSalesContextBiteInfoFailed(error){
				$log.error('XHR failed to get context based total sales.'+error);
			}
		}

		function getTotalReceiptsContextBiteInfo(contextProfileID, businessDuration, samplerDuration){

			return  $http({
						url: getHost()+'/services/duosoftware.reporting.service/reporting/getTotalPayments?profileID='+contextProfileID+'&monthCount=&yearStart='+businessDuration.businessYearStart+'&yearEnd='+businessDuration.lastTransactionDate+'&givenPeriod=true',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getTotalReceiptsContextBiteInfoComplete).catch(getTotalReceiptsContextBiteInfoFailed);

			function getTotalReceiptsContextBiteInfoComplete(response){
				return response.data.data;
			}

			function getTotalReceiptsContextBiteInfoFailed(error){
				$log.error('XHR failed to get context based total receipts.'+error);
			}
		}

		function getAverageSalesContextBiteInfo(contextProfileID, businessDuration, samplerDuration){

			return  $http({
						url: getHost()+'/services/duosoftware.reporting.service/reporting/getAveragesale?profileID='+contextProfileID+'&monthCount=&yearStart='+businessDuration.businessYearStart+'&yearEnd='+businessDuration.lastTransactionDate+'&givenPeriod=true',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getAverageSalesContextBiteInfoComplete).catch(getAverageSalesContextBiteInfoFailed);

			function getAverageSalesContextBiteInfoComplete(response){
				return response.data.data;
			}

			function getAverageSalesContextBiteInfoFailed(error){
				$log.error('XHR failed to get context based average sales.'+error);
			}
		}

		function getTotalExpensesBiteInfo(contextProfileID, businessDuration, samplerDuration){

			return  $http({
						url: getHost()+'/services/duosoftware.reporting.service/reporting/getTotalExpenses?profileID='+contextProfileID+'&monthCount=&yearStart='+businessDuration.businessYearStart+'&yearEnd='+businessDuration.lastTransactionDate+'&givenPeriod=true',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getTotalExpensesContextBiteInfoComplete).catch(getTotalExpensesContextBiteInfoFailed);

			function getTotalExpensesContextBiteInfoComplete(response){
				console.log(response);
				return response.data.data;
			}

			function getTotalExpensesContextBiteInfoFailed(error){
				$log.error('XHR failed to get context based total expenses.'+error);
			}
		}

		function getTotalOutstandingContextBiteInfo(contextProfileID, businessDuration, samplerDuration){

			return  $http({
						url: getHost()+'/services/duosoftware.reporting.service/reporting/getTotaloutstanding?profileID='+contextProfileID+'&monthCount=&yearStart='+businessDuration.businessYearStart+'&yearEnd='+businessDuration.lastTransactionDate+'&givenPeriod=true',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getTotalOutstandingContextBiteInfoComplete).catch(getTotalOutstandingContextBiteInfoFailed);

			function getTotalOutstandingContextBiteInfoComplete(response){
				return response.data.data;
			}

			function getTotalOutstandingContextBiteInfoFailed(error){
				$log.error('XHR failed to get context based total outstanding.'+error);
			}
		}

		function getTopSellingProducts(contextProfileID, businessDuration, samplerDuration, skipLvl, takeLvl){

			if(skipLvl === undefined && takeLvl === undefined){
        		skipLvl = 0; takeLvl = 4;
        	}
			
			return  $http({
						url: getHost()+'/services/duosoftware.reporting.service/reporting/getTopsellingproducts?skip=0&take=8&isAscending=false&profileID='+contextProfileID+'&monthCount=&yearStart='+businessDuration.businessYearStart+'&yearEnd='+businessDuration.lastTransactionDate+'&givenPeriod=true',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getTopSellingProductsComplete).catch(getTopSellingProductsFailed);

			function getTopSellingProductsComplete(response){
				return response;
			}

			function getTopSellingProductsFailed(error){
				$log.error('XHR failed to get context based top selling products.'+error);
			}
		}

		function getContextLatestDocuments(contextProfileID, businessDuration, samplerDuration, skipLvl, takeLvl, documentType){

			var constructedURL;
			var requestBody;

			if(documentType === undefined){
				documentType = "invoice";
			}

			if(skipLvl === undefined && takeLvl === undefined){
        		skipLvl = 0; takeLvl = 25;
        	}

        	switch(documentType){
        		case "invoice":
        			constructedURL = '/services/duosoftware.invoice.service/invoice/getInvoiceSummaryByQuery?skip='+skipLvl+'&take='+takeLvl+'';

    				requestBody = {
    					url: getHost()+constructedURL,
						method: "POST",
						data: {"where":"deleteStatus = 'false' AND profileID = '"+contextProfileID+"' AND  createDate > '"+businessDuration.businessYearStart+"' AND createDate < '"+businessDuration.lastTransactionDate+"' order by createDate DESC"},
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
    				};

    				break;
				case "creditnote":
        			constructedURL = '/services/duosoftware.creditNote.service/creditNote/getCreditNoteSummaryByQuery?skip='+skipLvl+'&take='+takeLvl+'';
    				
    				requestBody = {
    					url: getHost()+constructedURL,
						method: "POST",
						data: {"where":"deleteStatus = 'false' AND profileID = '"+contextProfileID+"' AND  createDate > '"+businessDuration.businessYearStart+"' AND createDate < '"+businessDuration.lastTransactionDate+"' order by createDate DESC"},
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
    				};

    				break;
				case "estimate":
					constructedURL = '/services/duosoftware.estimate.service/estimate/getEstimateSummaryByQuery?skip='+skipLvl+'&take='+takeLvl+'';
					
					requestBody = {
    					url: getHost()+constructedURL,
						method: "POST",
						data: {"where":"deleteStatus = 'false' AND profileID = "+contextProfileID+" AND  createDate > '"+businessDuration.businessYearStart+"' AND createDate < '"+businessDuration.lastTransactionDate+"' order by createDate DESC"},
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
    				};
    				
					break;
				case "expense":
					constructedURL = '/services/duosoftware.expense.service/expense/getExpenseSummaryByQuery?skip='+skipLvl+'&take='+takeLvl+'';
					
					requestBody = {
    					url: getHost()+constructedURL,
						method: "POST",
						data: {"where":"deleteStatus = 'false' AND assignID = "+contextProfileID+" AND  createDate > '"+businessDuration.businessYearStart+"' AND createDate < '"+businessDuration.lastTransactionDate+"' order by createDate DESC"},
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
    				};

					break;
				case "payment":
					constructedURL = '/services/duosoftware.payment.service/payment/getPaymentSummaryByQuery?skip='+skipLvl+'&take='+takeLvl+'';
					
					requestBody = {
    					url: getHost()+constructedURL,
						method: "POST",
						data: {"where":"paymentStatus = 'active' AND profileID = "+contextProfileID+" AND  createDate > '"+businessDuration.businessYearStart+"' AND createDate < '"+businessDuration.lastTransactionDate+"' order by createDate DESC"},
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
    				};

					break;
				case "inventorygin":
					constructedURL = '/services/duosoftware.inventory.service/inventory/getGINSummaryByQuery?skip='+skipLvl+'&take='+takeLvl+'';
					
					requestBody = {
    					url: getHost()+constructedURL,
						method: "POST",
						data: {"where":"deleteStatus = 'false' AND profileID = "+contextProfileID+" AND  createDate > '"+businessDuration.businessYearStart+"' AND createDate < '"+businessDuration.lastTransactionDate+"' order by createDate DESC"},
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}

    				};

					break;
				case "ledger":
					constructedURL = '/services/duosoftware.leger.service/leger/getLegerTransForPeriod?skip='+skipLvl+'&take='+takeLvl+'&uniqueID='+contextProfileID+'&monthCount=12'+samplerDuration+'&orderby=createDate&IsAscending=true&yearStart='+businessDuration.businessYearStart+'&yearEnd='+businessDuration.lastTransactionDate+'';
        			
					requestBody = {
    					url: getHost()+constructedURL,
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
    				};

        			break;
    			default:
    				console.log('Please feed in the right context.');
        	}

			return  $http(requestBody).then(getLatestDocumentsComplete).catch(getLatestDocumentsFailed);

			function getLatestDocumentsComplete(response){
				return response.data;
				console(response);
			}

			function getLatestDocumentsFailed(error){
				$log.error('XHR failed to get context based latest documents.'+error);
			}
		}

		function getContextGraphData(contextProfileID, businessDuration, samplerDuration){

			return $http({
						url: getHost()+'/services/duosoftware.reporting.service/reporting/getSalesChart?profileID='+contextProfileID+'&monthCount=&yearStart='+businessDuration.businessYearStart+'&yearEnd='+businessDuration.lastTransactionDate+'&givenPeriod=true',
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
				}).then(getContextGraphDataComplete).catch(getContextGraphDataFailed);
			
			function getContextGraphDataComplete(response){
				return response.data;
				console.log(response.data);
			}

			function getContextGraphDataFailed(error){
				$log.error('XHR failed to get chart mapping data.'+error);
			}
		}
	};

})();