(function ()
{
    'use strict';

    angular
        .module('app.businessmanager')
        .controller('BusinessManagerController', BusinessManagerController);

    /** @ngInject */
    function BusinessManagerController($rootScope, $scope, $window, $http, $state, $location, $mdDialog, $helpers, subIntegrationService, recurlySubService)
    {
        var vm = this;

        $state.go('app.businessmanager.main');

        vm.hostedDomain = $window.location.host;
        vm.placeholderDomain = '.12thdoor.com';
        vm.locations;
        vm.currencies;
        vm.businessType;
        vm.businessProcessNav = businessProcessNav;
        vm.bmProcessResetHandler = bmProcessResetHandler;
        vm.bindCurrencyLocation = bindCurrencyLocation;
        vm.submitAddBusinessDetails = submitAddBusinessDetails;
        vm.submitJoinCompanyDetails = submitJoinCompanyDetails;
        vm.joinBusinessDetails = {};

        //primary module navigation
        function businessProcessNav(nav){
            if(nav === "add"){
                $state.go('app.businessmanager.addcompany');
            }else if(nav === "join"){
                $state.go('app.businessmanager.joincompany');
            }else{
                $state.go('app.businessmanager.main');
            }
        }

        //form reset and navigate to main menu
        function bmProcessResetHandler () {
            vm.createCompanyDetails = angular.copy(defaultCreateCompanyDetails);
            vm.joinBusinessDetails = {};
            businessProcessNav();
        };


        //----------------------------------------------------------//
        // Add Business Opertation - start
        //----------------------------------------------------------//

        var defaultCreateCompanyDetails = {
            "TenantID": "",
            "TenantType": "default",
            "Name": "",
            "Statistic": {
                "DataDown": "1GB",
                "DataUp": "1GB",
                "NumberOfUsers": "1"
            },
            "Private": true,
            "OtherData": {
                "CompanyType": "",
                "CompanyLocation": "",
                "LocationCode": "",
                "Currency": ""
            }
        };

        vm.createCompanyDetails = angular.copy(defaultCreateCompanyDetails);

        //Utilary function calls

        function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com"; //test host 
			}
			return host;
        };
        
        function loadCountries(){
            $http.get(getHost()+'/apis/utility/country/list').
                success(function (data, status, headers, config) {
                    vm.locations = data.data;
                }).
                error(function (data, status, headers, config) {
                    console.log('Error loading countries.');
                });
        };

        loadCountries();

        function loadCurrencies(){
            $http.get(getHost()+'/apis/utility/currency/list').
                success(function (data, status, headers, config) {
                    vm.currencies = data.data;
                }).
                error(function (data, status, headers, config) {
                    console.log('Error loading currencies !');
                });
        };

        loadCurrencies();

        function loadBusinessType() {
            $http.get('app/data/boarding/business.json').
                success(function (data, status, headers, config) {
                    vm.businessType = data;
                }).
                error(function (data, status, headers, config) {
                    console.log('cant load business types !');
                });
        };

        loadBusinessType();

        function bindCurrencyLocation() {
            console.log('this is triggered when the location is chosen !');

            var slctdLocaleName = vm.createCompanyDetails.OtherData.CompanyLocation,
                slctdLocaleCode;

            for(var m=0; m < vm.locations.length; m++){
                if(vm.locations[m].country_name === slctdLocaleName){
                    slctdLocaleCode = vm.locations[m].country_code;
                    vm.createCompanyDetails.OtherData.LocationCode = slctdLocaleCode;
                }
            }

            $http.get(getHost()+'/apis/utility/currency/'+slctdLocaleCode)
                .success(function (data, status, headers, config) {
                    console.log(data);
                    vm.createCompanyDetails.OtherData.Currency = data.data.currency_code;
                })
                .error(function (data, status, headers, config) {
                    console.log('Error loading appropriate currency !');
                });

        };

        var stripWildcard = function(rawDomain){
            rawDomain = rawDomain.substring(rawDomain.indexOf('.') + 1);
            return rawDomain;
        };

        vm.hostedDomain = stripWildcard($window.location.host);

        //submit add business details function
        function submitAddBusinessDetails(addBusinessDetails) {

            console.log(addBusinessDetails);

            displayBusinessProcessSubmissionProgress('Setting up your business. Please wait...');

            subIntegrationService.registerTenant(addBusinessDetails)
                .then(function(response){

                    if(response.data.Success == true){

                        var registeredTenantID = response.data.Data.TenantID;

                        var profileMappingData = {
                            Email : $rootScope.cc_sessionInfo.Email,
                            Company : addBusinessDetails.Name,
                            Country : addBusinessDetails.OtherData.CompanyLocation,
                            countryCode : addBusinessDetails.OtherData.LocationCode,
                            baseCurrrency : addBusinessDetails.OtherData.Currency
                        };

                        var newProfileMappingObjPayLoad = angular.toJson(profileMappingData);
                        
                        subIntegrationService.tenantMapProfileDetails(profileMappingData)
                            .then(function(response){
                                console.log(response);
                                if(response.data.IsSuccess == true){

                                    var recurlyAccPayload = {
                                        account_code : registeredTenantID,
                                        username : $rootScope.cc_sessionInfo.Email,
                                        email : $rootScope.cc_sessionInfo.Email,
                                        first_name : nameSeperator($rootScope.cc_sessionInfo.Name, 0),
                                        last_name: nameSeperator($rootScope.cc_sessionInfo.Name, 1),
                                        company_name:addBusinessDetails.Name
                                    };
            
                                    var newRecurlyAccountPayload = angular.toJson(recurlyAccPayload);
            
                                    recurlySubService.subCreateDefaultAccount(newRecurlyAccountPayload)
                                        .then(function(response){
                                            if(response.data.isSuccess == true){
                                                $mdDialog.hide();
                                                displayBusinessProcessSubmissionSucess('Business created','You have successfully created a business for, '+addBusinessDetails.Name+'.');
                                                bmProcessResetHandler();
                                                $rootScope.getCompanyCollection();
                                            }else{
                                                $mdDialog.hide();
                                                displayBusinessProcessSubmissionError('Subscription failed','We are having problems subscribing your business to a plan, please try again later.');
                                            }
                                        }).catch(function(error){
                                            $mdDialog.hide();
                                            displayBusinessProcessSubmissionError('Failed to create business','We are having problems creating  your business, '+addBusinessDetails.Name+', please try again later.');
                                        });

                                }else{
                                    $mdDialog.hide();
                                    displayBusinessProcessSubmissionError('Failed to submit profile details','We are having problems mapping your profile details, please try again later.');
                                }
                            }).catch(function(error){
                                $mdDialog.hide();
                                displayBusinessProcessSubmissionError('Failed to create business','We are having problems registering your business, '+recurlyAccPayload.company_name+', please try again later.');
                            });
                    }else{
                        $mdDialog.hide();
                        displayBusinessProcessSubmissionError('Failed to create business',''+response.data.Message+'');
                    }
                }).catch(function(error){
                    $mdDialog.hide();
                    displayBusinessProcessSubmissionError('Failed to create business','Failed to create a business for, '+addBusinessDetails.Name+', please try again later.');
                });
        };

        //helper functions

        //name seperator function

        var nameSeperator = function (nameString, nmeIndex){
            var sepratedName = nameString.split("+");
            return sepratedName[nmeIndex];
        };

        //----------------------------------------------------------//
        // Add Business Opertation - end
        //----------------------------------------------------------//


        //----------------------------------------------------------//
        // Join Business Opertation - start
        //----------------------------------------------------------//

        function submitJoinCompanyDetails(joinCompanyDetails) {
            console.log(joinCompanyDetails);
            console.log(vm.hostedDomain);
            // var payload = angular.toJson(joinCompanyDetails);
            displayBusinessProcessSubmissionProgress('Processing your request. Please wait...');
            $http({
                method: 'GET',
                url: '/apis/usertenant/tenant/subscribe/'+joinCompanyDetails.CompanyDomain+'.'+vm.hostedDomain
            }).success(function (data, status, headers, config) {
                $mdDialog.hide();
                console.log(data);
                if (data.Success === false) {
                    var substring = "User :";

                    if(data.Message.indexOf(substring) !== -1){
                        displayBusinessProcessSubmissionError('Already subscribed.',''+data.Message+'');
                    }else{
                        displayBusinessProcessSubmissionError('Invalid business account URL.','Please recheck details with business owner and try again.');
                    }
                } else {
                    displayBusinessProcessSubmissionSucess('Request successfully sent to business owner.',' Please wait for confirmation via email.');
                    bmProcessResetHandler();
                }
            }).error(function (data) {
                console.log(data);
                $mdDialog.hide();
                displayBusinessProcessSubmissionError('Invalid business account URL.','Please recheck details with business owner and try again.');
            });
        };

        //----------------------------------------------------------//
        // Join Business Opertation - end
        //----------------------------------------------------------//

        //----------------------------------------------------------//
        // Business Process Helper Functions - start
        //----------------------------------------------------------//

        //render business process error 
        var displayBusinessProcessSubmissionError = function (title, message) {
            $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).clickOutsideToClose(true).title('' + title + '').textContent('' + message + '').ariaLabel('Business process failed.').ok('Got it!'));
        };

        //render business process success
        var displayBusinessProcessSubmissionSucess = function (title,message) {
            $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).clickOutsideToClose(true).title('' + title + '').textContent('' + message + '').ariaLabel('Business process successful.').ok('Got it!'));
        };

        //render business process progress
        var displayBusinessProcessSubmissionProgress = function (submissionMessage) {
            $mdDialog.show({
                template: '<md-dialog style="width:360px !important;" ng-cloak>'+'<md-dialog-content style="padding:16px !important;">'+'<div style="height:auto" class="loadInidcatorContainer" layout="row" layout-align="start center">'+'         <md-progress-circular class="md-primary" md-mode="indeterminate" md-diameter="32"></md-progress-circular>'+'<span style="margin-left:24px;">'+submissionMessage+'</span>'+'</div>'+' </md-dialog-content>' + '</md-dialog>',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                escapeToClose: false
            });
        };

        //----------------------------------------------------------//
        // Business Process Helper Functions - end
        //----------------------------------------------------------//

    }
})();
