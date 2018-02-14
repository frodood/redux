(function()
{
	'use strict';

	angular
		.module('app.threesixtyview')
		.controller('ThreeSixtyViewController', ThreeSixtyViewController);

	/** @ngInject */
	function ThreeSixtyViewController($rootScope, $http, $state, $serviceCall, $mdDialog, $mdToast, overviewContextService)
	{

		var vm = this;

		/*app var*/
		vm.refreshOverViewStatus = false;
		vm.componentsLoad = false;
		vm.metricsLoadingStatus = true;
		vm.periodcontext = 1;
		vm.primerCompanyDataMaster;
		vm.primerCompanyData;
		vm.isPreviousYear = false;
		vm.primerProfileData;
		vm.customerSuggestions;
		vm.customerContextProfileData;
		vm.selectedItem = [];
		vm.customerContextBiteInfoData = [
			{'totalSales':""},
			{'totalReceipts':""},
			{'averageSales':""},
            {'totalExpenses':""},
			{'totalOutstanding':""}
		];
		vm.topSellingProducts;
        vm.addressContext = true;
		vm.documentContext = "invoice";
		vm.customerContextLatestDocuments;
		vm.chartData = {
			labels:[],
			series:[],
			data:[
				[],
				[]
			]
		}

		vm.productShifterIndex = {'underVal':1, 'upperVal':4, 'itemTotal':8};

        vm.threeSixtyChartColors = ['#2D94DF', '#85CD2D'];

		/*app exposed func*/
        vm.refreshOverView = refreshOverView;
        vm.searchContextSpecific = searchContextSpecific;
        vm.periodContextChange = periodContextChange;
        vm.shiftProductList = shiftProductList;
        vm.changeLatestDocumentContext = populateContextLatestDocuments;
        vm.preloadedContextSelector = preloadedContextSelector;
		vm.threeSixtyNavigateToDocument = threeSixtyNavigateToDocument;
		
		vm.backState = 'app.threesixtyview';
		
		
	

        function logChanges(item){
            console.log(item);
        }

        //Dummy Chart data
        // vm.chartData = {
        //     labels: ['Aug 2016', 'Sep 2016', 'Oct 2016', 'Nov 2016', 'Dec 2016', 'Jan 2017', 'Feb 2017'],
        //     series: ['Unpaid Invoices', 'Paid Invoices'],
        //     data  : [
        //         [4300, 6800, 7600, 4300, 5900, 6100, 5400],
        //         [4600, 3600, 6300, 5800, 5400, 7200, 8400]
        //     ]
        // };

        function loadPrimerData(){
            overviewContextService.setBusinessYear()
                .then(function(response){
                    vm.primerCompanyDataMaster = response;
                });
        }

        loadPrimerData();
		

        function loadPrimerProfiles(){
        	overviewContextService.setAllProfileDetails(20)
        		.then(function(response){
        			vm.primerProfileData = response;
        			console.log(vm.primerProfileData);
        		});
        }

        loadPrimerProfiles();

		function transformThreeSixtyPeriodContext(){
            var yearStart, yearEnd;
			var frmtdPeriodContext = parseInt(vm.periodcontext);

			vm.primerCompanyData = angular.copy(vm.primerCompanyDataMaster);
            
            //check if period context is for currentyear / previousyear
            if(frmtdPeriodContext === 1){

                console.log('current year selected !');
  
                //set check past year status
                vm.isPreviousYear = false;

            }else{
                console.log('past year selected !');
                //convert date string to date object for later computation

                yearStart = new Date(vm.primerCompanyData.businessYearStart);
                yearEnd = new Date(vm.primerCompanyData.lastTransactionDate);

                // //calculate past year start and end date
                yearStart = yearStart.setFullYear(yearStart.getFullYear() - 1);
                yearEnd = yearEnd.setFullYear(yearEnd.getFullYear() - 1);

				console.log(yearStart, yearEnd);

                // //asign convered milisecond date to temp variables
                var yearStartDobj = new Date(yearStart);
                var yearEndDobj =  new Date(yearEnd);

                // //reset business context with formated ISO date
                vm.primerCompanyData.businessYearStart = yearStartDobj.toISOString();
                vm.primerCompanyData.lastTransactionDate = yearEndDobj.toISOString();

                //set check past year status
                vm.isPreviousYear = true;

            };

			console.log(vm.periodcontext, vm.primerCompanyData, vm.isPreviousYear);
		}
		
		

        function preloadedContextSelector(slctdItem){

            slctdItem = slctdItem.profileName;

            overviewContextService.setCustomerContext(slctdItem)
                .then(function(response){
                    console.log(response)

                    if(response.data.queryCount <= 0){
                        console.log('no customer !');
                    }else{
                        vm.customerContextProfileData = response.data.result[0];
                        console.log(vm.customerContextProfileData);

                        //invokeContextChainer(vm.customerContextProfileData.profileID, vm.primerCompanyData, vm.periodcontext, vm.documentContext);
                        refreshOverView();
                    }
                });
		} 
			
			function checkParams() {
            if ($state.params.Data) {
                if ($state.params.appName == "profile") {
                    vm.backState = 'app.contacts.customer'
                    console.log($state.params.Data)

                    var client = $serviceCall.setClient("getProfileByKey", "profile");
                    client.ifSuccess(function(data) {

                        var client = {
                            profileName: data.profileName,
                            value: data
						}

						vm.selectedItem = data.profileName;
						preloadedContextSelector(client);
						
                    });
                    client.ifError(function(data) {

                    });
                    client.uniqueID($state.params.Data.profileId);
                    client.postReq();
                }
            }
		}
		
		checkParams();

        function searchContextSpecific(keyEvent, searchQuery){
        	if(keyEvent.which === 13){
        		//call loading event
        		overviewContextService.setCustomerContext(searchQuery)
        			.then(function(response){
        				//remove loading event
        				console.log(response);
        				if(response.data.queryCount <= 0){

        					//show no customer message
        					console.log('no customer !');
        				}else{
        					vm.customerContextProfileData = response.data.result[0];
        					console.log(vm.customerContextProfileData);

        					//execute matrices chaining function;

        					invokeContextChainer(vm.customerContextProfileData.profileID, vm.primerCompanyData, vm.periodcontext, vm.documentContext);

                        }
        			});
        	}
        }

        function periodContextChange(){

			transformThreeSixtyPeriodContext();

        	invokeContextChainer(vm.customerContextProfileData.profileID, vm.primerCompanyData, vm.periodcontext, vm.documentContext);
        
        }

        function invokeContextChainer(contextProfileID, primerCompanyData, samplerDuration, latestDocumentType){

        	// default duration specifier
        	var durationSpecific;

			if(samplerDuration === undefined){
				durationSpecific = 0;
			}else{
				durationSpecific = samplerDuration;
			}

        	// show components

        	vm.componentsLoad = true;

        	// show context definer accessors

        	vm.metricsLoadingStatus = false;

        	// remove existing data on the documents array

        	vm.customerContextLatestDocuments = [];

        	//get bite info data

        	overviewContextService.getTotalSalesContextBiteInfo(contextProfileID, primerCompanyData, durationSpecific, vm.isPreviousYear)
        		.then(function(response){
        			vm.customerContextBiteInfoData.totalSales = response.TotalSales;
        		});

    		overviewContextService.getTotalReceiptsContextBiteInfo(contextProfileID, primerCompanyData, durationSpecific, vm.isPreviousYear)
        		.then(function(response){
        			vm.customerContextBiteInfoData.totalReceipts = response.TotalPayments;
        		});

    		overviewContextService.getAverageSalesContextBiteInfo(contextProfileID, primerCompanyData, durationSpecific, vm.isPreviousYear)
        		.then(function(response){
        			vm.customerContextBiteInfoData.averageSales = response.AverageSales;
        		});

            overviewContextService.getTotalExpensesBiteInfo(contextProfileID, primerCompanyData, durationSpecific, vm.isPreviousYear)
                .then(function(response){
                    console.log(response);
                    vm.customerContextBiteInfoData.totalExpenses = response.TotalExpense;
                });

    		overviewContextService.getTotalOutstandingContextBiteInfo(contextProfileID, primerCompanyData, durationSpecific, vm.isPreviousYear)
        		.then(function(response){
        			vm.customerContextBiteInfoData.totalOutstanding = response.Totaloutstanding;
        		});

    		overviewContextService.getTopSellingProducts(contextProfileID, primerCompanyData, durationSpecific,0,4,vm.isPreviousYear)
    			.then(function(response){
    				vm.topSellingProducts = response.data.result;
    				// console.log(vm.topSellingProducts);
    			});

			overviewContextService.getContextLatestDocuments(contextProfileID, primerCompanyData, durationSpecific,0,12,latestDocumentType)
    			.then(function(response){
    				vm.customerContextLatestDocuments = response.result;
    			});

			overviewContextService.getContextGraphData(contextProfileID, primerCompanyData, durationSpecific, vm.isPreviousYear)
				.then(function(response){
                    console.log(response);
					remapChartData(response);
				});
        }

		function shiftProductList(direction){

			function increaseIndex(){
				vm.productShifterIndex.underVal = vm.productShifterIndex.underVal + 4;
				vm.productShifterIndex.upperVal = vm.productShifterIndex.upperVal + 4;
			}

			function decreaseIndex(){
				vm.productShifterIndex.underVal = vm.productShifterIndex.underVal - 4;
				vm.productShifterIndex.upperVal = vm.productShifterIndex.upperVal - 4;
			}
			
			if(direction === "right"){

				if(vm.productShifterIndex.upperVal !== 8){
					overviewContextService.getTopSellingProducts(vm.customerContextProfileData.profileID, vm.primerCompanyData, vm.periodcontext, 4,4)
		    			.then(function(response){
		    				increaseIndex();
		    				vm.topSellingProducts = response.data.result;
		    			});
				}
			}else{

				if(vm.productShifterIndex.underVal !== 1){
					overviewContextService.getTopSellingProducts(vm.customerContextProfileData.profileID, vm.primerCompanyData, vm.periodcontext, 0,4)
		    			.then(function(response){
		    				decreaseIndex();
		    				vm.topSellingProducts = response.data.result;
		    			});
				}
			}
		}

		function populateContextLatestDocuments(){

			vm.customerContextLatestDocuments = [];

			overviewContextService.getContextLatestDocuments(vm.customerContextProfileData.profileID, vm.primerCompanyData, vm.periodcontext, 0,24, vm.documentContext)
    			.then(function(response){
    				vm.customerContextLatestDocuments = response.result;
    				console.log(vm.customerContextLatestDocuments);
    			});
		}

        function threeSixtyNavigateToDocument(contextDocumentType, contextDocumentID){
            console.log(contextDocumentType, contextDocumentID);

            var routeSpecifics = {Data: {profileId:''},appName:''};

            switch(contextDocumentType){
                case "invoice":

                    $state.go('app.invoices.inv.detail', {itemId:contextDocumentID});

                    break;
                case "estimate":
                    
                    $state.go('app.estimates.est.detail', {itemId:contextDocumentID});

                    break;
                case "payment": 
                    
                    $state.go('app.payments.pay.detail', {itemID:contextDocumentID});

                    break;
                case "creditnote": 
                    
                    $state.go('app.creditnotes.cre.detail', {itemId:contextDocumentID});

                    break;
                default:
                    console.log('Please feed in the right context.');
            }
        }

		function remapChartData(chartData){

			vm.chartData = {
				labels:[],
				series:[],
				data:[]
			}

			chartData = chartData.data;

			var labels = chartData.x;
			var series = chartData.Series;

			for(var j = 0; j < labels.length; j++){
				vm.chartData.labels.push(labels[j]);
			}

			for(var i = 0; i < series.length; i++){
				vm.chartData.series.push(series[i].name);
				vm.chartData.data.push(series[i].data);
			}

			console.log(vm.chartData);
		}

        function refreshOverView(){

            displayRequestProgress('Refreshing 360 overview data');

            overviewContextService.refreshOverviewDataContext()
                .then(function(response){
                	response = response.data;
                    if(response.isSuccess === true){
                        vm.refreshOverViewStatus = true;
						transformThreeSixtyPeriodContext();
                        invokeContextChainer(vm.customerContextProfileData.profileID, vm.primerCompanyData, vm.periodcontext, vm.documentContext);
                        $mdDialog.hide();
                    }
                });

            console.log(vm.refreshOverViewStatus);
        }

        function displayRequestProgress(progressMsg) {
            $mdDialog.show({
                template: '<md-dialog ng-cloak>' +
                '   <md-dialog-content style="padding:0px; !important">' +
                '       <div style="height:auto; width:auto; padding:16px;" class="loadInidcatorContainer" layout="row" layout-align="start center">' +
                '           <md-progress-circular class="md-primary" md-mode="indeterminate" md-diameter="40"></md-progress-circular>' +
                '           <span style="padding-left:16px;">'+progressMsg+', please wait...</span>' +
                '       </div>' +
                '   </md-dialog-content>' +
                '</md-dialog>',
                parent: angular.element(document.body),
                clickOutsideToClose: false
            });
        }
	}
	
})();