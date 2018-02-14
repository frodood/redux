(function ()
{
    'use strict';

    angular
      .module('app.playground')
      .controller('PlaygroundController', PlaygroundController)
      .controller('sampleTrigerCtrl', sampleTrigerCtrl)

    /** @ngInject */
    function PlaygroundController($rootScope, $scope, $mdDialog, $timeout, dashboardContextService, msSpinnerService, profileSettingsContextService)
    {
        var vm = this;

        //compose after change currency
        // vm.currentCurrencyModel = {'activeCurrrency':'USD', 'baseCurrency':'USD', 'currencySwitched':true, 'AER':12};

        /*Recurly integration */

        vm.sampleDecimalVal = 223.2546884;

        vm.currentCurrencyModel = {'currencyStatus': false, 'exchangeRate':'1', 'currencyType':'USD', 'baseCurrency':'USD'};

        vm.sampleValueAbsolute = 25.65584586;

        vm.sampleQunatityAbsolute = 5.366785264;

        vm.sampleUPAbsolute = 125.78996526;

        vm.holiwar = holiwar;

        vm.businessContextBiteInfo = {};

        vm.spinnerService = msSpinnerService;

        vm.myDataPromise;

        vm.login = login;

        vm.results;

        vm.loading = true;

        vm.formStatus = false;

        vm.formStatusHide = true;

        // msSpinnerService._register('playgroundSpinner1');

        function updateProfileSettingsData(){
            profileSettingsContextService.setProfileSettingsData()
                .then(function(response){
                    console.log(response);
                });
        };

        // updateProfileSettingsData();

        function getGlobalSettingsData(){
            var nikkang = profileSettingsContextService.getGlblProfileSettingsData();
            console.log(nikkang);
        };

        getGlobalSettingsData();

        function sampleGetDashboardSales(){

            // msSpinnerService.show('playgroundSpinner1');

            var chartBusinessDuration = {
                yearEnd:"2018-01-01 23:59:59",
                yearStart:"2016-12-30 04:00:00"
            };

            var chartBusinessPeriod = "12";

            vm.myDataPromise = dashboardContextService.getDashboardTotalSales(chartBusinessDuration, chartBusinessPeriod)
                .then(function(response){
                    vm.businessContextBiteInfo.totalSales = response.data.data.TotalSales;
                    vm.spinnerService.hide('testSpinner');
                });
        };

        sampleGetDashboardSales();

        function login(){
            vm.spinnerService.show('testSpinner');
            $timeout(function () {
                vm.spinnerService.hide('testSpinner');
                vm.results = true;
            }, 10000);
        };

        vm.appLoaded = function(data){
            console.log(data);
        };

        // vm.spinnerComponent = msSpinnerService;

        // var selectedCurrency = $rootScope.$on('selectedCurrency',function(event, args){
                
        //     vm.selectedCurrency = args.slctdCurrrency;

        //     console.log(vm.selectedCurrency);

        //     //do something with currency.
        // });

        // $scope.$on('$destroy', function() {
        //     selectedCurrency();
        // });


        var switchCurrency = $rootScope.$on('switchCurrActivity',function(event, args){
            vm.currentCurrencyModel = args;
            
            console.log(vm.currentCurrencyModel);
        });

        $scope.$on('$destroy', function() {
            switchCurrency();
        });


        function holiwar(){
           $mdDialog.show({
                templateUrl: 'app/main/reports/dialogplayground/test1.html',
                controller: 'sampleTrigerCtrl',
                controllerAs: 'vm'
            }).then(function(data){}, function(data){}) 
        }

        /* Angular busy loader implementation ! */



    }  

    /** @ngInject */
    function sampleTrigerCtrl($rootScope, $scope){

        var extSlctProfile = {
            "display" : "MAS Capital (Pvt) Ltd",
            "value" : {
               "billingAddress": {
                  "city": "Colombo",
                  "country": "Sri Lanka",
                  "state": "",
                  "street": "No.86, Vauxal Street, Colombo - 2",
                  "zip": "00200"
               },
               "createDate": "2017-02-15 10:31:00",
               "createUser": "Eshwaran Veerabahu",
               "customFields": [],
               "deleteStatus": false,
               "email": "tamaraSmith@gmail.com",
               "favouriteStar": false,
               "favouriteStarNo": 1,
               "fax": "+94112892033",
               "firstName": "Tamara",
               "image": [],
               "lastName": "Chithrangani",
               "lastTranDate": "2017-02-15 10:31:00",
               "mobile": "",
               "modifyDate": "2017-02-15 10:31:00",
               "modifyUser": "Eshwaran Veerabahu",
               "notes": "",
               "phone": "+94112855492",
               "profileCategory": "",
               "profileClass": "Customer",
               "profileCode": "Tamara",
               "profileID": "4",
               "profileName": "MAS Capital (Pvt) Ltd",
               "profileType": "Customer",
               "shippingAddress": {
                  "s_city": "Colombo",
                  "s_country": "Sri Lanka",
                  "s_state": "",
                  "s_street": "No.86, Vauxal Street, Colombo - 2",
                  "s_zip": "00200"
               },
               "status": "Active",
               "website": "www.mascapital.lk"
            }
        }

        function triggerThatShit(){
            $rootScope.$broadcast('extupslctusr',extSlctProfile);
        };

        console.log('coming from the sample modal !');
    }
})();
