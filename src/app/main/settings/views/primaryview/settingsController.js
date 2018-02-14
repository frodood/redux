(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('settingsController', settingsController);

    /** @ngInject */
    function settingsController($scope, $rootScope, $document, $mdDialog, $mdMedia, $serviceCall, $mdSidenav, $state, $stateParams, msApi, $auth, $mdPanel) {
      
        // $state.go('app.settings.main.profile'); 

        var vm = this;
        // vm.selectedIndex= null;
        console.log($state.current.name);

        vm.primaryToolbarContext = true;
        vm.settingsNavList = [{
                "navIcon": "",
                "navTitle": "Business",
                "navState": "app.settings.main.profile",
                "imagePath": "account",
                "index":0
            },
            {
                "navIcon": "",
                "navTitle": "Preferences",
                "navState": "app.settings.main.preferences",
                "imagePath": "open-in-app",
                "index":1
            },
            {
                "navIcon": "",
                "navTitle": "Users",
                "navState": "app.settings.main.users",
                "imagePath": "account-multiple",
                "index":2
            },
            {
                "navIcon": "",
                "navTitle": "Taxes",
                "navState": "app.settings.main.taxes",
                "imagePath": "book",
                "index":3
            },
            {
                "navIcon": "",
                "navTitle": "Templates",
                "navState": "app.settings.main.templates",
                "imagePath": "bulletin-board",
                "index":4
            },
            {
                "navIcon": "",
                "navTitle": "Email Templates",
                "navState": "app.settings.main.emailTemplates",
                "imagePath": "email",
                "index":5
            },
            {
                "navIcon": "",
                "navTitle": "Payments",
                "navState": "app.settings.main.payments",
                "imagePath": "cash-usd",
                "index":6
            },

            {
                "navIcon": "",
                "navTitle": "Accounts",
                "navState": "app.settings.main.accounts",
                "imagePath": "account-key",
                "index":7
            }
        ]

        vm.preference = [];
        vm.preference = [{
                'appImage': 'Invoices',
                'appName': 'Invoice',
                'appUrl': 'app.settings.main.invoice',
                'appIndex':0
            },
            {
                'appImage': 'Estimates',
                'appName': 'Estimate',
                'appUrl': 'app.settings.main.estimate',
                'appIndex':1
            },
            {
                'appImage': 'Credit Notes',
                'appName': 'Credit Note',
                'appUrl': 'app.settings.main.creditNote',
                'appIndex':2
            },
            {
                'appImage': 'Payments',
                'appName': 'Payment',
                'appUrl': 'app.settings.main.payment',
                'appIndex':3
            },
            {
                'appImage': 'Expenses',
                'appName': 'Expense',
                'appUrl': 'app.settings.main.expense',
                'appIndex':4
            },
            {
                'appImage': 'Products',
                'appName': 'Product',
                'appUrl': 'app.settings.main.product',
                'appIndex':5
            },
            {
                'appImage': 'Inventory',
                'appName': 'Inventory',
                'appUrl': 'app.settings.main.inventory',
                'appIndex':6
            },
            {
                'appImage': 'Contacts',
                'appName': 'Contact',
                'appUrl': 'app.settings.main.contact',
                'appIndex':7
            },
            {
                'appImage': 'Projects',
                'appName': 'Project',
                'appUrl': 'app.settings.main.project',
                'appIndex':8
            }
        ];

        vm.pref = false;

         for (var i = vm.settingsNavList.length - 1; i >= 0; i--) {
            if($state.current.name == vm.settingsNavList[i].navState){
                vm.index = vm.settingsNavList[i].index;
                console.log(vm.index);
                vm.selectedIndex = vm.index;
            }
        };

        function appPreferenc(){

            for (var j = vm.preference.length - 1; j >= 0; j--) {
        
            if($state.current.name ==  vm.preference[j].appUrl){
                vm.appindex = vm.preference[j].appIndex;
                console.log(vm.appindex);
                vm.selectedPrefIndex = vm.appindex;
                vm.pref = true;
            }

            };

        }
        appPreferenc();
        //selected listview active.................
        


        //selected listview active.................

        vm.preferenceChange = preferenceChange;

        // vm.selectedPrefIndex = null

        function preferenceChange(pref,index) {
            $state.go(pref);

            if (vm.selectedPrefIndex === null) {
              vm.selectedPrefIndex = index;
            }
            else if (vm.selectedPrefIndex === index) {
              vm.selectedPrefIndex = null;
              vm.selectedIndex = null;
            }
            else {
              vm.selectedPrefIndex = index;
            }

        }

        
        vm.showDropDownIcon = false;

        vm.navigateSettingsStates = navigateSettingsStates;

        function setPrimaryToolBar() {
            vm.primaryToolbarContext = !vm.primaryToolbarContext;
        }

        function navigateSettingsStates(stateDeff, index) {


            console.log(index);
            if (stateDeff != 'app.settings.main.preferences') {
                $state.go(stateDeff);
            }

            if (index == 1) {
                vm.pref = !vm.pref;
                vm.showDropDownIcon = !vm.showDropDownIcon;
            }
            if (index != 1) {
                vm.pref = false;
                vm.showDropDownIcon = false;
            }

            if (vm.selectedIndex === null) {
                debugger
              vm.selectedIndex = index;
              if(vm.selectedIndex != 1){ 
                
                vm.selectedPrefIndex = null;
            }
               // vm.selectedPrefIndex = null;
            }
            else if (vm.selectedIndex === index) {
                debugger
              vm.selectedIndex = null;
            if(vm.selectedIndex != 1){ 
                
                vm.selectedPrefIndex = null;
            }
              // vm.selectedPrefIndex = null
            }
            else {
                debugger
            vm.selectedIndex = index;    
            if(vm.selectedIndex != 1){ 

                vm.selectedPrefIndex = null;
            }
              
               
            }

        }


        function loadSettingJson() {

        }
        loadSettingJson();
    }

})();